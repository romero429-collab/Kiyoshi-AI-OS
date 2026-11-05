// IPTV — channel aggregation (Kiyoshi-owned)
// Modeled from iptv-org/iptv

pub struct Iptv;

impl Iptv {
    pub fn list_channels() -> String {
        "iptv: aggregated public channel list".to_string()
    }
}
