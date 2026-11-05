// MarkItDown — document to Markdown (Kiyoshi-owned)
// Modeled from microsoft/markitdown

pub struct MarkItDown;

impl MarkItDown {
    pub fn convert(input: &str) -> String {
        format!("markitdown: converted '{}' to Markdown", input)
    }
}
