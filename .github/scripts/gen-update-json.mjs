import { readFileSync, readdirSync, statSync, writeFileSync } from "fs"
import { join } from "path"

const platform = process.argv[2]   // e.g. darwin-x86_64
const tag = process.argv[3]        // e.g. v1.0.7
const repo = process.argv[4]       // e.g. jiulou/dust

const version = tag.replace(/^v/, "")
const baseUrl = `https://github.com/${repo}/releases/download/${tag}`

// Search multiple possible bundle directories for .sig files
const searchDirs = [
  "src-tauri/target/release/bundle",
  "src-tauri/target/aarch64-apple-darwin/release/bundle",
  "src-tauri/target/x86_64-apple-darwin/release/bundle",
]

function findSigFile(dir) {
  try {
    const items = readdirSync(dir)
    for (const item of items) {
      const full = join(dir, item)
      const st = statSync(full)
      if (st.isDirectory()) {
        const found = findSigFile(full)
        if (found) return found
      } else if (item.endsWith(".sig")) {
        return full
      }
    }
  } catch { /* directory doesn't exist */ }
  return null
}

let sigFile = null
for (const dir of searchDirs) {
  sigFile = findSigFile(dir)
  if (sigFile) break
}

if (!sigFile) {
  console.error("No .sig file found in any bundle directory")
  process.exit(1)
}

const artifactPath = sigFile.replace(/\.sig$/, "")
const artifactName = artifactPath.split("/").pop()
const sigContent = readFileSync(sigFile, "utf8").trim()

const payload = {
  version,
  notes: "",
  pub_date: new Date().toISOString(),
  platforms: {
    [platform]: {
      signature: sigContent,
      url: `${baseUrl}/${artifactName}`,
    },
  },
}

writeFileSync("latest.json", JSON.stringify(payload, null, 2) + "\n")
console.log(`Generated latest.json for ${platform}: ${artifactName}`)
