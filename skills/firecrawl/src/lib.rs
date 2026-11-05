// Firecrawl — web data extraction (Kiyoshi-owned)
// Modeled from firecrawl/firecrawl

pub struct Firecrawl {
    url: String,
}

impl Firecrawl {
    pub fn new(url: impl Into<String>) -> Self {
        Self { url: url.into() }
    }

    pub fn crawl(&self) -> String {
        format!("firecrawl: extracted data from {}", self.url)
    }
}
