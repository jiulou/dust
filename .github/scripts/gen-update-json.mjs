import { readFileSync, readdirSync, statSync, writeFileSync } from "fs"
import { join } from "path"

const platform = process.argv[2]   // e.g. darwin-x86_64
const tag = process.argv[3]        // e.g. v1.0.7
const repo = process.argv[4]       // e.g. jiulou/dust
const bundleType = process.argv[5] // "macos", "nsis", "appimage"

const version = tag.replace(/^v/, "")
const baseUrl = `https://github.com/${repo}/releases/download/${tag}`

// Search for .sig files in the specific bundle type directory
const searchDirs = []
if (bundleType) {
  searchDirs.push(
    `src-tauri/target/release/bundle/${bundleType}`,
    `src-tauri/target/aarch64-apple-darwin/release/bundle/${bundleType}`,
  )
}
searchDirs.push(
  "src-tauri/target/release/bundle",
  "src-tauri/target/aarch64-apple-darwin/release/bundle",
)

function findSig(dir) {
  try {
    for (const item of readdirSync(dir)) {
      const full = join(dir, item)
      if (statSync(full).isDirectory()) {
        const found = findSig(full)
        if (found) return found
      } else if (item.endsWith(".sig")) {
        return full
      }
    }
  } catch {}
  return null
}

let sigFile = null
for (const d of searchDirs) {
  sigFile = findSig(d)
  if (sigFile) {
    console.log(`Found .sig: ${sigFile}`)
    break
  }
}

if (!sigFile) {
  console.error("No .sig file found. Searched:")
  searchDirs.forEach(d => console.error(`  ${d}`))
  process.exit(1)
}

const artifactPath = sigFile.replace(/\.sig$/, "")
const artifactName = artifactPath.split(/[/\\]/).pop()
const sigContent = readFileSync(sigFile, "utf8").trim()

writeFileSync("latest.json", JSON.stringify({
  version,
  notes: "",
  pub_date: new Date().toISOString(),
  platforms: { [platform]: { signature: sigContent, url: `${baseUrl}/${artifactName}` } },
}, null, 2) + "\n")

console.log(`Generated latest.json for ${platform}: artifact=${artifactName}`)
