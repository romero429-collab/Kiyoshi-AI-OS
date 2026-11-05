use omnilingual_asr::OmnilingualAsr;

fn main() {
    println!("{}", OmnilingualAsr::transcribe("speech.wav"));
}
