import { execSync } from "child_process"
import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from "fs"
import { join } from "path"

const platform = process.argv[2]
const tag = process.argv[3]
const repo = process.argv[4]
const bundleType = process.argv[5]

const version = tag.replace(/^v/, "")
const baseUrl = `https://github.com/${repo}/releases/download/${tag}`

// Search paths
const targets = ["", "aarch64-apple-darwin/"]
const subdirs = bundleType ? ["macos", "dmg", "nsis", "appimage", "msi"] : [""]
const exts = [".tar.gz", ".AppImage", ".exe", ".msi", ".dmg"]

let artifactFile = null

for (const target of targets) {
  for (const sub of subdirs) {
    const dir = `src-tauri/target/${target}release/bundle/${sub}`
    try {
      for (const item of readdirSync(dir)) {
        const full = join(dir, item)
        if (statSync(full).isFile()) {
          for (const ext of exts) {
            if (item.endsWith(ext) && !item.endsWith(".sig")) {
              artifactFile = full
              console.log(`Found artifact: ${full}`)
              break
            }
          }
        }
        if (artifactFile) break
      }
    } catch {}
    if (artifactFile) break
  }
  if (artifactFile) break
}

if (!artifactFile) {
  console.error("No updater artifact found. Full bundle tree:")
  for (const target of targets) {
    const dir = `src-tauri/target/${target}release/bundle`
    try { execSync(`find ${dir} -type f`, { stdio: "inherit" }) } catch {}
  }
  process.exit(1)
}

const artifactName = artifactFile.split(/[/\\]/).pop()
const sigFile = artifactFile + ".sig"
let sigContent = ""

if (existsSync(sigFile)) {
  sigContent = readFileSync(sigFile, "utf8").trim()
  console.log("Using existing .sig")
} else {
  const privKey = process.env.TAURI_SIGNING_PRIVATE_KEY
  const privKeyPassword = process.env.TAURI_SIGNING_KEY_PASSWORD || ""
  if (!privKey) {
    console.error("TAURI_SIGNING_PRIVATE_KEY not set")
    process.exit(1)
  }
  console.log("Signing...")
  execSync(`npx tauri signer sign --private-key "${privKey}" --password "${privKeyPassword}" "${artifactFile}"`, { stdio: "inherit" })
  sigContent = readFileSync(sigFile, "utf8").trim()
}

writeFileSync("latest.json", JSON.stringify({
  version,
  notes: "",
  pub_date: new Date().toISOString(),
  platforms: { [platform]: { signature: sigContent, url: `${baseUrl}/${artifactName}` } },
}, null, 2) + "\n")

console.log("Done")
