/**
 * Knowledge Graph System (KG-Ω)
 * Semantic knowledge representation and retrieval
 */

export class KnowledgeGraphSystem {
  private nodes: Map<string, KnowledgeNode> = new Map()
  private edges: Set<KnowledgeEdge> = new Set()
  private semanticIndex: Map<string, string[]> = new Map()

  constructor() {
    console.log(`📚 Knowledge Graph System initialized`)
  }

  addEntity(id: string, entity: any): void {
    const node = new KnowledgeNode(id, entity)
    this.nodes.set(id, node)
    this.indexEntity(id, entity)
  }

  private indexEntity(id: string, entity: any): void {
    const keywords = this.extractKeywords(entity)
    for (const keyword of keywords) {
      if (!this.semanticIndex.has(keyword)) {
        this.semanticIndex.set(keyword, [])
      }
      this.semanticIndex.get(keyword)!.push(id)
    }
  }

  private extractKeywords(entity: any): string[] {
    if (typeof entity === 'string') {
      return entity.toLowerCase().split(' ')
    }
    return ['entity']
  }

  addRelation(source: string, target: string, type: string): void {
    const edge = new KnowledgeEdge(source, target, type)
    this.edges.add(edge)
  }

  query(pattern: string): any[] {
    console.log(`🔍 Querying knowledge graph for: ${pattern}`)
    const ids = this.semanticIndex.get(pattern) || []
    return ids.map(id => this.nodes.get(id))
  }

  async reasoning(query: string): Promise<any> {
    console.log(`🧠 Performing reasoning on query: ${query}`)
    const results = this.query(query)
    return {
      query,
      results: results.length,
      inferences: this.inferNewFacts(results)
    }
  }

  private inferNewFacts(results: any[]): any[] {
    return results.flatMap(r => {
      const inferences: any[] = []
      // Simple inference: if A relates to B and B relates to C, then A might relate to C
      for (const edge of this.edges) {
        if (edge.source === r?.id) {
          inferences.push({
            type: 'transitive',
            from: r?.id,
            to: edge.target
          })
        }
      }
      return inferences
    })
  }

  getStatistics(): any {
    return {
      nodes: this.nodes.size,
      edges: this.edges.size,
      semanticTerms: this.semanticIndex.size
    }
  }
}

class KnowledgeNode {
  id: string
  data: any
  timestamp: number

  constructor(id: string, data: any) {
    this.id = id
    this.data = data
    this.timestamp = Date.now()
  }
}

class KnowledgeEdge {
  source: string
  target: string
  type: string

  constructor(source: string, target: string, type: string) {
    this.source = source
    this.target = target
    this.type = type
  }
}

export { KnowledgeGraphSystem as KGS }
