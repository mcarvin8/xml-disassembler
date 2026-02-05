//! Neon bindings for xml-disassembler crate.
//! Exposes disassemble and reassemble to Node.js.

use xml_disassembler::{DisassembleXmlFileHandler, ReassembleXmlFileHandler};

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
