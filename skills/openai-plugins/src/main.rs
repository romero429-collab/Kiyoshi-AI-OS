use openai_plugins::OpenAiPlugins;

fn main() {
    println!("{}", OpenAiPlugins::load("browser"));
}
