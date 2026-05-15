# Dust — Project Harvester

[![Build](https://github.com/jiulou/dust/actions/workflows/build.yml/badge.svg)](https://github.com/jiulou/dust/actions/workflows/build.yml)

[中文文档](./README.zh.md)

You know those old projects sitting on your disk — the ones with the `node_modules` you're scared to delete, the `target/` directories from that Rust experiment last year, the `vendor/` folders from a Laravel app you barely remember writing.

**Dust** finds them all. You pick what to toss. Done. Built with Tauri 2.0, React 19, Chakra UI v3.

## Features

- **Multi-language support** — Detects dependency directories for 14 languages: Node.js, Rust, Go, Flutter, Python, Java, .NET, Ruby, PHP, Swift, Haskell, Elixir, Elm, Deno
- **Dual signature validation** — Matches target directory + anchor file (e.g. `node_modules` + `package.json`)
- **System protection** — Built-in blacklist prevents scanning system directories
- **Zombie detection** — Flags projects inactive beyond a configurable threshold
- **Safe deletion** — Moves items to the system recycle bin (not permanent)
- **Cross-platform** — macOS, Windows, Linux
- **Custom titlebar** — Native traffic lights on macOS, custom controls on Windows/Linux
- **Dark/Light mode** — Follows system preference or manual toggle
- **i18n** — English and Chinese (extensible)
- **Theme colors** — 8 theme colors available

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop framework | [Tauri v2](https://v2.tauri.app/) |
| Frontend | React 19 + TypeScript 5.8 |
| UI | Chakra UI v3 |
| Routing | TanStack Router |
| State | Zustand + TanStack Query |
| i18n | react-i18next |
| Charts | recharts |
| Animation | framer-motion |
| Scanner (Rust) | jwalk (parallel directory walker) |
| Recycle bin (Rust) | trash |

## Getting Started

```bash
# Install dependencies
yarn

# Development
yarn tauri dev

# Build
yarn tauri build

# Release (tag + push triggers GitHub Actions)
git tag v0.1.0
git push origin v0.1.0
```

## Usage

1. Open the app, click the drop zone or drag directories to add scan paths
2. Click **Start Scan** — results open in a separate page
3. Filter by tech stack, search, or toggle zombie items
4. Select items and click **Move to Trash**
5. Adjust zombie threshold, theme, and language in the Settings drawer (gear icon, top-right)

## Supported Languages

| Language | Target Directory | Anchor File |
|----------|----------------|-------------|
| Node.js | `node_modules` | `package.json` |
| Rust | `target` | `Cargo.toml` / `Cargo.lock` |
| Go | `vendor`, `pkg` | `go.mod` |
| Flutter | `.dart_tool` | `pubspec.yaml` |
| Python | `__pycache__`, `.venv` | `requirements.txt` / `pyproject.toml` / `setup.py` |
| Java | `build`, `.gradle` | `pom.xml` / `build.gradle` |
| .NET | `bin`, `obj` | `*.csproj` / `*.sln` |
| Ruby | `vendor` | `Gemfile` / `Gemfile.lock` |
| PHP | `vendor` | `composer.json` |
| Swift | `.build` | `Package.swift` |
| Haskell | `.stack-work` | `stack.yaml` |
| Elixir | `deps` | `mix.exs` |
| Elm | `elm-stuff` | `elm.json` |
| Deno | `node_modules` | `deno.json` / `deno.jsonc` / `import_map.json` |

## Project Structure

```
dust/
├── src/                    # React frontend
│   ├── routes/             # Pages (Dashboard, Results)
│   ├── components/         # UI components
│   ├── hooks/              # Custom hooks
│   ├── stores/             # Zustand stores
│   ├── types/              # TypeScript types
│   └── locales/            # i18n translations
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── scanner/        # Scan engine (rules, blacklist, jwalk wrapper)
│   │   ├── commands/       # Tauri command handlers
│   │   └── config/         # Settings persistence
│   ├── Cargo.toml
│   └── tauri.conf.json
└── package.json
```

## Release

To publish a new release with auto-update support:

1. Generate a signing key (run once):
   ```bash
   npx tauri signer generate -w .tauri-key
   ```
2. Save the private key as a GitHub Secret (Settings → Secrets and variables → Actions → New repository secret):
   - `TAURI_SIGNING_PRIVATE_KEY` — contents of `.tauri-key`
   - `TAURI_SIGNING_KEY_PASSWORD` — the password you chose
3. Update the `endpoints` URL in `src-tauri/tauri.conf.json` to point to your repo
4. Tag and push:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

The workflow will build for all platforms, sign the updates, and create a GitHub Release.

## License

Apache 2.0
