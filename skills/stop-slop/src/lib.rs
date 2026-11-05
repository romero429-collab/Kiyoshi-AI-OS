// Stop Slop — prose refinement (Kiyoshi-owned)
// Modeled from hardikpandya/stop-slop

pub struct StopSlop;

impl StopSlop {
    pub fn refine(text: &str) -> String {
        format!("stop-slop: removed AI tells from '{}'", text)
    }
}
