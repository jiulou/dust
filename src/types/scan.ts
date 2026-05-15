export interface ScanResult {
  path: string
  tech_stack: string
  target_dir: string
  size: number
  formatted_size: string
  last_modified: number
  is_zombie: boolean
  is_symlink: boolean
}

export interface TechStackBreakdown {
  tech_stack: string
  total_size: number
  count: number
}

export interface ScanSummary {
  total_projects: number
  total_size: number
  tech_stacks: TechStackBreakdown[]
}

export interface ScanResponse {
  results: ScanResult[]
  summary: ScanSummary
}

export interface ScanRule {
  target_dir: string
  anchor_files: string[]
  tech_stack:
    | "node_js"
    | "rust"
    | "go"
    | "flutter"
    | "python"
    | "java"
    | "dot_net"
    | "ruby"
    | "php"
    | "swift"
    | "haskell"
    | "elixir"
    | "elm"
    | "deno"
}
