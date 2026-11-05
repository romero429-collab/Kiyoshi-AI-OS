// Corrosion — gossip discovery (Kiyoshi-owned)
// Modeled from superfly/corrosion

pub struct Corrosion;

impl Corrosion {
    pub fn discover() -> String {
        "corrosion: propagated membership via gossip".to_string()
    }
}
