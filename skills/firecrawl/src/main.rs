use firecrawl::Firecrawl;

fn main() {
    let crawler = Firecrawl::new("https://example.com");
    println!("{}", crawler.crawl());
}
