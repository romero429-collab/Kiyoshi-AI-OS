use turso::Turso;

fn main() {
    println!("{}", Turso::query("SELECT 1"));
}
