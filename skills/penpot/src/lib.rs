// Penpot — design collaboration (Kiyoshi-owned)
// Modeled from penpot/penpot

pub struct Penpot;

impl Penpot {
    pub fn design(file: &str) -> String {
        format!("penpot: collaborated on design '{}'", file)
    }
}
