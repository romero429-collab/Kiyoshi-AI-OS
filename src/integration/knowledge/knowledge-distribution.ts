/**
 * Knowledge Distribution System (KD-Ω)
 * Share and distribute knowledge across organization
 */

export class KnowledgeDistributionSystem {
  private knowledgeBase: Map<string, KnowledgeItem> = new Map()
  private sharedRepos: SharedRepository[] = []
  private notifications: Notification[] = []

  constructor() {
    console.log(`📚 Knowledge Distribution System initialized`)
  }

  async publishKnowledge(title: string, content: string, tags: string[]): Promise<KnowledgeItem> {
    console.log(`📌 Publishing knowledge: ${title}...`)

    const item = new KnowledgeItem(title, content, tags)
    this.knowledgeBase.set(item.id, item)

    // Notify subscribers
    this.notifySubscribers(`New knowledge published: ${title}`, tags)

    return item
  }

  async createSharedRepository(name: string, description: string): Promise<SharedRepository> {
    console.log(`📚 Creating shared repository: ${name}`)

    const repo = new SharedRepository(name, description)
    this.sharedRepos.push(repo)

    return repo
  }

  async searchKnowledge(query: string): Promise<KnowledgeItem[]> {
    console.log(`🔍 Searching knowledge for: ${query}`)

    const results: KnowledgeItem[] = []

    for (const item of this.knowledgeBase.values()) {
      if (item.title.includes(query) || item.tags.some(t => t.includes(query))) {
        results.push(item)
      }
    }

    return results
  }

  async getRecommendations(userId: string): Promise<KnowledgeItem[]> {
    console.log(`💭 Getting recommendations for user: ${userId}`)

    // Return top knowledge items
    const sorted = Array.from(this.knowledgeBase.values())
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, 5)

    return sorted
  }

  private notifySubscribers(message: string, tags: string[]): void {
    const notification = new Notification(message, tags, Date.now())
    this.notifications.push(notification)
  }

  getKnowledgeStats(): any {
    return {
      totalItems: this.knowledgeBase.size,
      repositories: this.sharedRepos.length,
      notifications: this.notifications.length
    }
  }
}

class KnowledgeItem {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: number
  accessCount: number = 0

  constructor(title: string, content: string, tags: string[]) {
    this.id = `kb-${Date.now()}`
    this.title = title
    this.content = content
    this.tags = tags
    this.createdAt = Date.now()
  }
}

class SharedRepository {
  id: string
  name: string
  description: string
  items: Map<string, any> = new Map()

  constructor(name: string, description: string) {
    this.id = `repo-${Date.now()}`
    this.name = name
    this.description = description
  }
}

class Notification {
  id: string
  message: string
  tags: string[]
  timestamp: number

  constructor(message: string, tags: string[], timestamp: number) {
    this.id = `notif-${Date.now()}`
    this.message = message
    this.tags = tags
    this.timestamp = timestamp
  }
}

export { KnowledgeDistributionSystem as KDS }
