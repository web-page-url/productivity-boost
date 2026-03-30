export interface Skill {
  id: string
  name: string
  description: string
  domain: string
  version: string
  tags: string[]
  keywords: string[]
  path: string
  tool: string
  toolPath: string
  hasTemplates: boolean
  templateCount: number
  enabled: boolean
}

export interface ToolSummary {
  tool: string
  path: string
  exists: boolean
  skillCount: number
  skills: Skill[]
}

export interface DiscoveredSkill {
  dirName: string
  name: string
  description: string
}

export interface DiscoverResult {
  ok: boolean
  skillsBasePath: string
  skills: DiscoveredSkill[]
  error?: string
}

// ── Prompt Store ──────────────────────────────────────────────────────────────
export interface Prompt {
  id: string
  title: string
  content: string
  tags: string[]
  collectionId: string | null
  createdAt: string
  updatedAt: string
}

export interface Collection {
  id: string
  name: string
  createdAt: string
}

export interface PromptsData {
  prompts: Prompt[]
  collections: Collection[]
}

declare global {
  interface Window {
    promptsAPI: {
      load: () => Promise<PromptsData>
      save: (data: PromptsData) => Promise<void>
    }
    skillsAPI: {
      scanAll: () => Promise<ToolSummary[]>
      getReadme: (skillPath: string) => Promise<string>
      listTemplates: (skillPath: string) => Promise<string[]>
      readTemplate: (skillPath: string, templateName: string) => Promise<string>
      toggle: (skillPath: string, enabled: boolean) => Promise<boolean>
      delete: (skillPath: string) => Promise<boolean>
      listAgentPaths: () => Promise<Record<string, string>>
      copyToAgent: (skillPath: string, targetAgent: string) => Promise<{ ok: boolean; error?: string }>
      discoverSkills: (repo: string) => Promise<DiscoverResult>
      installFromGitHub: (repo: string, targetAgent: string, skillDirNames: string[], skillsBasePath: string) => Promise<{ ok: boolean; installed: string[]; error?: string }>
      onInstallProgress: (cb: (msg: string) => void) => () => void
      openInExplorer: (skillPath: string) => Promise<void>
      openExternal: (url: string) => Promise<void>
      searchMarketplace: (query: string, page: number) => Promise<{ ok: boolean; data?: any; error?: string }>
      getGithubToken: () => Promise<string>
      setGithubToken: (token: string) => Promise<void>
    }
    profileAPI: {
      get: () => Promise<{ name: string; imageBase64: string | null }>
      set: (data: { name: string; imageBase64: string | null }) => Promise<void>
    }
  }
}
