//! Neon bindings for xml-disassembler crate.
//! Exposes disassemble, reassemble, parseXmlString, buildXmlString, and format transformers to Node.js.

use xml_disassembler::{
    builders::build_xml_string,
    parsers::parse_xml_from_str,
    transformers::{transform_to_ini, transform_to_json, transform_to_json5, transform_to_toml, transform_to_yaml},
    DisassembleXmlFileHandler, ReassembleXmlFileHandler,
};

#[neon::export]
fn disassemble(
    file_path: String,
    unique_id_elements: Option<String>,
    strategy: Option<String>,
    pre_purge: bool,
    post_purge: bool,
    ignore_path: Option<String>,
    format: Option<String>,
) -> Result<(), String> {
    let strategy = strategy.as_deref().unwrap_or("unique-id");
    let ignore_path = ignore_path.as_deref().unwrap_or(".xmldisassemblerignore");
    let format = format.as_deref().unwrap_or("xml");

    let rt = tokio::runtime::Runtime::new().map_err(|e| e.to_string())?;
    rt.block_on(async {
        let mut handler = DisassembleXmlFileHandler::new();
        handler
            .disassemble(
                &file_path,
                unique_id_elements.as_deref(),
                Some(strategy),
                pre_purge,
                post_purge,
                ignore_path,
                format,
            )
            .await
            .map_err(|e| e.to_string())
    })
}

#[neon::export]
fn reassemble(
    file_path: String,
    file_extension: Option<String>,
    post_purge: bool,
) -> Result<(), String> {
    let rt = tokio::runtime::Runtime::new().map_err(|e| e.to_string())?;
    rt.block_on(async {
        let handler = ReassembleXmlFileHandler::new();
        handler
            .reassemble(&file_path, file_extension.as_deref(), post_purge)
            .await
            .map_err(|e| e.to_string())
    })
}

#[neon::export]
fn hello(name: String) -> String {
    format!("hello {name}")
}

#[neon::export]
fn parse_xml_string(xml_str: String) -> Result<Option<String>, String> {
    let element = parse_xml_from_str(&xml_str, "<string>");
    element
        .map(|e| serde_json::to_string(&e).map_err(|err| err.to_string()))
        .transpose()
}

#[neon::export]
fn build_xml_string_export(element_json: String) -> Result<String, String> {
    let element: serde_json::Value =
        serde_json::from_str(&element_json).map_err(|e| e.to_string())?;
    Ok(build_xml_string(&element))
}

fn run_async_transform<F, Fut>(f: F) -> Result<String, String>
where
    F: FnOnce() -> Fut,
    Fut: std::future::Future<Output = String>,
{
    let rt = tokio::runtime::Runtime::new().map_err(|e| e.to_string())?;
    Ok(rt.block_on(f()))
}

#[neon::export]
fn transform_to_ini_export(element_json: String) -> Result<String, String> {
    let element: serde_json::Value =
        serde_json::from_str(&element_json).map_err(|e| e.to_string())?;
    run_async_transform(|| transform_to_ini(&element))
}

#[neon::export]
fn transform_to_json_export(element_json: String) -> Result<String, String> {
    let element: serde_json::Value =
        serde_json::from_str(&element_json).map_err(|e| e.to_string())?;
    run_async_transform(|| transform_to_json(&element))
}

#[neon::export]
fn transform_to_json5_export(element_json: String) -> Result<String, String> {
    let element: serde_json::Value =
        serde_json::from_str(&element_json).map_err(|e| e.to_string())?;
    run_async_transform(|| transform_to_json5(&element))
}

#[neon::export]
fn transform_to_toml_export(element_json: String) -> Result<String, String> {
    let element: serde_json::Value =
        serde_json::from_str(&element_json).map_err(|e| e.to_string())?;
    run_async_transform(|| transform_to_toml(&element))
}

#[neon::export]
fn transform_to_yaml_export(element_json: String) -> Result<String, String> {
    let element: serde_json::Value =
        serde_json::from_str(&element_json).map_err(|e| e.to_string())?;
    run_async_transform(|| transform_to_yaml(&element))
}
