// SAM 2 — segment anything (Kiyoshi-owned)
// Modeled from facebookresearch/sam2

pub struct Sam2;

impl Sam2 {
    pub fn segment(image: &str) -> String {
        format!("sam2: generated masks for '{}'", image)
    }
}
