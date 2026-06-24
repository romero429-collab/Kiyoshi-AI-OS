/**
 * Advanced Reasoning System
 * Logic, inference, and complex reasoning capabilities
 */

export class AdvancedReasoningSystem {
  private rules: Rule[] = []
  private facts: Set<Fact> = new Set()
  private inferences: Inference[] = []

  constructor() {
    console.log(`🧠 Advanced Reasoning System initialized`)
  }

  addRule(antecedents: string[], consequent: string): void {
    const rule = new Rule(antecedents, consequent)
    this.rules.push(rule)
  }

  addFact(fact: string, value: any): void {
    this.facts.add(new Fact(fact, value))
  }

  async reason(): Promise<any> {
    console.log(`🔄 Running reasoning cycle...`)
    
    const newFacts: Fact[] = []
    
    for (const rule of this.rules) {
      if (rule.antecedentsSatisfied(this.facts)) {
        const newFact = new Fact(rule.consequent, true)
        if (!Array.from(this.facts).some(f => f.fact === newFact.fact)) {
          newFacts.push(newFact)
          this.facts.add(newFact)
          this.inferences.push(new Inference(rule, newFact))
        }
      }
    }

    return {
      newFacts: newFacts.length,
      totalFacts: this.facts.size,
      inferences: this.inferences.length
    }
  }

  query(fact: string): boolean {
    return Array.from(this.facts).some(f => f.fact === fact)
  }

  getInferenceChain(fact: string): any[] {
    return this.inferences.filter(i => i.conclusion.fact === fact)
  }
}

class Rule {
  antecedents: string[]
  consequent: string

  constructor(antecedents: string[], consequent: string) {
    this.antecedents = antecedents
    this.consequent = consequent
  }

  antecedentsSatisfied(facts: Set<Fact>): boolean {
    return this.antecedents.every(ant =>
      Array.from(facts).some(f => f.fact === ant)
    )
  }
}

class Fact {
  fact: string
  value: any

  constructor(fact: string, value: any) {
    this.fact = fact
    this.value = value
  }
}

class Inference {
  rule: Rule
  conclusion: Fact

  constructor(rule: Rule, conclusion: Fact) {
    this.rule = rule
    this.conclusion = conclusion
  }
}

export { AdvancedReasoningSystem as ARS }
