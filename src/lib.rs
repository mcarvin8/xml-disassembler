//! Neon bindings for xml-disassembler crate - provides Node.js API for XML disassembly.

use neon::prelude::*;
use std::sync::OnceLock;
use xml_disassembler::{
    build_xml_string, parse_xml, transform_to_json, transform_to_json5, transform_to_yaml,
    path_segment_from_file_pattern, DisassembleXmlFileHandler, MultiLevelRule,
    ReassembleXmlFileHandler,
};

static RUNTIME: OnceLock<tokio::runtime::Runtime> = OnceLock::new();

fn runtime() -> &'static tokio::runtime::Runtime {
    RUNTIME.get_or_init(|| {
        tokio::runtime::Builder::new_multi_thread()
            .enable_all()
            .build()
            .expect("failed to create tokio runtime")
    })
}

fn opt_string<'a, C: Context<'a>>(cx: &mut C, obj: &Handle<JsObject>, key: &str) -> Option<String> {
    obj.get_opt::<JsString, C, &str>(cx, key)
        .ok()
        .flatten()
        .map(|h| h.value(cx))
}

fn opt_bool<'a, C: Context<'a>>(cx: &mut C, obj: &Handle<JsObject>, key: &str) -> bool {
    obj.get_opt::<JsBoolean, C, &str>(cx, key)
        .ok()
        .flatten()
        .map(|h| h.value(cx))
        .unwrap_or(false)
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    let _ = env_logger::try_init();

    cx.export_function("disassemble", disassemble)?;
    cx.export_function("reassemble", reassemble)?;
    cx.export_function("parseXml", parse_xml_js)?;
    cx.export_function("buildXmlString", build_xml_string_js)?;
    cx.export_function("transformToYaml", transform_to_yaml_js)?;
    cx.export_function("transformToJson", transform_to_json_js)?;
    cx.export_function("transformToJson5", transform_to_json5_js)?;

    Ok(())
}

fn disassemble(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let opts = cx.argument::<JsObject>(0)?;

    let file_path = match opt_string(&mut cx, &opts, "filePath") {
        Some(fp) => fp,
        None => return cx.throw_error("filePath is required"),
    };
    let unique_id_elements = opt_string(&mut cx, &opts, "uniqueIdElements");
    let strategy = opt_string(&mut cx, &opts, "strategy")
        .unwrap_or_else(|| "unique-id".to_string());
    let pre_purge = opt_bool(&mut cx, &opts, "prePurge");
    let post_purge = opt_bool(&mut cx, &opts, "postPurge");
    let ignore_path = opt_string(&mut cx, &opts, "ignorePath")
        .unwrap_or_else(|| ".xmldisassemblerignore".to_string());
    let format = opt_string(&mut cx, &opts, "format").unwrap_or_else(|| "xml".to_string());
    let multi_level_str = opt_string(&mut cx, &opts, "multiLevel");

    // Parse "file_pattern:root_to_strip:unique_id_elements" into MultiLevelRule (same as crate CLI).
    let multi_level_rule = multi_level_str.as_deref().and_then(|spec| {
        let parts: Vec<&str> = spec.splitn(3, ':').collect();
        if parts.len() != 3 {
            return None;
        }
        let (file_pattern, root_to_strip, unique_id_elements) = (parts[0], parts[1], parts[2]);
        if file_pattern.is_empty() || root_to_strip.is_empty() || unique_id_elements.is_empty() {
            return None;
        }
        let path_segment = path_segment_from_file_pattern(file_pattern);
        Some(MultiLevelRule {
            file_pattern: file_pattern.to_string(),
            root_to_strip: root_to_strip.to_string(),
            unique_id_elements: unique_id_elements.to_string(),
            path_segment: path_segment.clone(),
            wrap_root_element: root_to_strip.to_string(),
            wrap_xmlns: String::new(),
        })
    });

    let result = runtime().block_on(async {
        let mut handler = DisassembleXmlFileHandler::new();
        handler
            .disassemble(
                &file_path,
                unique_id_elements.as_deref(),
                Some(&strategy),
                pre_purge,
                post_purge,
                &ignore_path,
                &format,
                multi_level_rule.as_ref(),
            )
            .await
    });

    if let Err(e) = result {
        return cx.throw_error(format!("Disassemble error: {}", e));
    }

    Ok(cx.undefined())
}

fn reassemble(mut cx: FunctionContext) -> JsResult<JsUndefined> {
    let opts = cx.argument::<JsObject>(0)?;

    let file_path = match opt_string(&mut cx, &opts, "filePath") {
        Some(fp) => fp,
        None => return cx.throw_error("filePath is required"),
    };
    let file_extension = opt_string(&mut cx, &opts, "fileExtension");
    let post_purge = opt_bool(&mut cx, &opts, "postPurge");

    let result = runtime().block_on(async {
        let handler = ReassembleXmlFileHandler::new();
        handler
            .reassemble(&file_path, file_extension.as_deref(), post_purge)
            .await
    });

    if let Err(e) = result {
        return cx.throw_error(format!("Reassemble error: {}", e));
    }

    Ok(cx.undefined())
}

/// Parses XML file and returns JSON string representation, or undefined if parsing fails.
/// The JS wrapper should JSON.parse the result to get the XmlElement object.
fn parse_xml_js(mut cx: FunctionContext) -> JsResult<JsValue> {
    let file_path = cx.argument::<JsString>(0)?.value(&mut cx);

    let result = runtime().block_on(parse_xml(&file_path));

    match result {
        Some(parsed) => {
            let json_str = match serde_json::to_string(&parsed) {
                Ok(s) => s,
                Err(e) => return cx.throw_error(format!("Serialize error: {}", e)),
            };
            Ok(cx.string(json_str).upcast())
        }
        None => Ok(cx.undefined().upcast()),
    }
}

/// Builds XML string from a JSON-serialized XmlElement.
/// The JS wrapper should pass JSON.stringify(element) as the argument.
fn build_xml_string_js(mut cx: FunctionContext) -> JsResult<JsString> {
    let json_str = cx.argument::<JsString>(0)?.value(&mut cx);

    let parsed: serde_json::Value = match serde_json::from_str(&json_str) {
        Ok(v) => v,
        Err(e) => return cx.throw_error(format!("Invalid JSON: {}", e)),
    };

    let xml = build_xml_string(&parsed);
    Ok(cx.string(xml))
}

fn transform_to_yaml_js(mut cx: FunctionContext) -> JsResult<JsString> {
    let json_str = cx.argument::<JsString>(0)?.value(&mut cx);
    let parsed: serde_json::Value = match serde_json::from_str(&json_str) {
        Ok(v) => v,
        Err(e) => return cx.throw_error(format!("Invalid JSON: {}", e)),
    };
    let result = runtime().block_on(transform_to_yaml(&parsed));
    Ok(cx.string(result))
}

fn transform_to_json_js(mut cx: FunctionContext) -> JsResult<JsString> {
    let json_str = cx.argument::<JsString>(0)?.value(&mut cx);
    let parsed: serde_json::Value = match serde_json::from_str(&json_str) {
        Ok(v) => v,
        Err(e) => return cx.throw_error(format!("Invalid JSON: {}", e)),
    };
    let result = runtime().block_on(transform_to_json(&parsed));
    Ok(cx.string(result))
}

fn transform_to_json5_js(mut cx: FunctionContext) -> JsResult<JsString> {
    let json_str = cx.argument::<JsString>(0)?.value(&mut cx);
    let parsed: serde_json::Value = match serde_json::from_str(&json_str) {
        Ok(v) => v,
        Err(e) => return cx.throw_error(format!("Invalid JSON: {}", e)),
    };
    let result = runtime().block_on(transform_to_json5(&parsed));
    Ok(cx.string(result))
}
