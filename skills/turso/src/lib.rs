// Turso — embedded SQL (Kiyoshi-owned)
// Modeled from tursodatabase/turso

pub struct Turso;

impl Turso {
    pub fn query(sql: &str) -> String {
        format!("turso: executed SQLite-compatible query '{}'", sql)
    }
}
