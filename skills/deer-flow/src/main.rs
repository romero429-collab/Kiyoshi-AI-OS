use deer_flow::DeerFlow;

fn main() {
    let agent = DeerFlow::new("example long-horizon task");
    println!("{}", agent.run());
}
