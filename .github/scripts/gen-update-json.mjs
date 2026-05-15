import { execSync } from "child_process"
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "fs"
import { join } from "path"

const platform = process.argv[2]
const tag = process.argv[3]
const repo = process.argv[4]
const version = tag.replace(/^v/, "")
const baseUrl = `https://github.com/${repo}/releases/download/${tag}`

const artifactExts = {
  "darwin": ".tar.gz",
  "windows": ".exe",
  "linux": ".AppImage",
}

function findFile(dir, ext) {
  if (!existsSync(dir)) return null
  for (const item of readdirSync(dir)) {
    const full = join(dir, item)
    if (statSync(full).isDirectory()) {
      const f = findFile(full, ext)
      if (f) return f
    } else if (item.endsWith(ext) && !item.endsWith(".sig")) return full
  }
  return null
}

const roots = [
  "src-tauri/target/release",
  "src-tauri/target/aarch64-apple-darwin/release",
]

// Find the updater artifact
const ext = artifactExts[platform.split("-")[0]] || ".tar.gz"
let artifact = null
for (const root of roots) {
  artifact = findFile(join(root, "bundle"), ext)
  if (artifact) break
}

// macOS fallback: create .tar.gz from .app
if (!artifact && platform.startsWith("darwin")) {
  for (const root of roots) {
    const app = join(root, "bundle/macos/Dust.app")
    if (existsSync(app)) {
      artifact = join(root, "bundle/macos/Dust.app.tar.gz")
      execSync(`tar czf "${artifact}" -C "${join(root, 'bundle/macos')}" Dust.app`, { stdio: "inherit" })
      break
    }
  }
}

if (!artifact) {
  console.error("No artifact found")
  process.exit(1)
}

const name = artifact.split(/[/\\]/).pop()
const sig = artifact + ".sig"

if (!existsSync(sig)) {
  const key = process.env.TAURI_SIGNING_PRIVATE_KEY
  if (!key) { console.error("TAURI_SIGNING_PRIVATE_KEY not set"); process.exit(1) }
  execSync(`npx tauri signer sign --private-key "${key}" --password "${process.env.TAURI_SIGNING_KEY_PASSWORD || ''}" "${artifact}"`, { stdio: "inherit" })
}

writeFileSync("latest.json", JSON.stringify({
  version,
  pub_date: new Date().toISOString(),
  platforms: {
    [platform]: {
      signature: readFileSync(sig, "utf8").trim(),
      url: `${baseUrl}/${name}`,
    },
  },
}, null, 2) + "\n")

console.log(`latest.json: ${platform} → ${name}`)
