# Dust — 工程收割机 / Project Harvester

那些积灰的老项目你还记得吗？`node_modules` 不敢删，去年写着玩的 Rust 留下了几百 MB 的 `target`，还有个 Laravel 项目的 `vendor` 早就不知道是干什么用的了。

**Dust** 把它们全找出来，你勾选，它清理。基于 Tauri 2.0、React 19、Chakra UI v3 构建。

## 功能特性

- **多语言支持** — 自动检测 14 种编程语言的依赖目录：Node.js、Rust、Go、Flutter、Python、Java、.NET、Ruby、PHP、Swift、Haskell、Elixir、Elm、Deno
- **双重特征校验** — 同时匹配目标目录 + 锚点文件（如 `node_modules` + `package.json`）
- **系统保护** — 内置黑名单，跳过系统关键目录
- **僵尸项目检测** — 标记超过可配置天数未活动的项目
- **安全删除** — 移至系统回收站，非永久删除
- **跨平台** — macOS、Windows、Linux
- **自定义标题栏** — macOS 原生红黄绿灯，Windows/Linux 自定义控件
- **深色/浅色模式** — 跟随系统或手动切换
- **国际化** — 中文和 English
- **主题色** — 8 种主题色可选

## 技术栈

| 层 | 技术 |
|-------|-----------|
| 桌面框架 | [Tauri v2](https://v2.tauri.app/) |
| 前端 | React 19 + TypeScript 5.8 |
| UI | Chakra UI v3 |
| 路由 | TanStack Router |
| 状态管理 | Zustand + TanStack Query |
| 国际化 | react-i18next |
| 图表 | recharts |
| 动画 | framer-motion |
| 扫描引擎 (Rust) | jwalk（并行目录遍历） |
| 回收站 (Rust) | trash |

## 快速开始

```bash
# 安装依赖
yarn

# 开发模式
yarn tauri dev

# 构建
yarn tauri build
```

## 使用说明

1. 打开应用，点击拖拽区或拖拽目录添加扫描路径
2. 点击 **开始扫描** — 结果在新页面展示
3. 按技术栈、搜索或僵尸状态筛选
4. 勾选项目，点击 **移到回收站**
5. 在设置抽屉（右上角齿轮图标）中调整僵尸阈值、主题和语言

## 支持的语言

| 语言 | 目标目录 | 锚点文件 |
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

## 项目结构

```
dust/
├── src/                         # React 前端
│   ├── routes/                  # 页面（首页、结果页）
│   ├── components/              # UI 组件
│   ├── hooks/                   # 自定义 Hooks
│   ├── stores/                  # Zustand 状态管理
│   ├── types/                   # TypeScript 类型
│   └── locales/                 # 国际化翻译
├── src-tauri/                   # Rust 后端
│   ├── src/
│   │   ├── scanner/             # 扫描引擎（规则、黑名单、jwalk 封装）
│   │   ├── commands/            # Tauri 命令处理
│   │   └── config/             # 配置持久化
│   ├── Cargo.toml
│   └── tauri.conf.json
└── package.json
```

## 发布流程

要发布带自动更新的新版本：

1. 生成签名密钥（仅需执行一次）：
   ```bash
   npx tauri signer generate -w .tauri-key
   ```
2. 将私钥添加为 GitHub Secret（Settings → Secrets and variables → Actions → New repository secret）：
   - `TAURI_SIGNING_PRIVATE_KEY` — `.tauri-key` 文件内容
   - `TAURI_SIGNING_KEY_PASSWORD` — 你设置的密码
3. 修改 `src-tauri/tauri.conf.json` 中的 `endpoints` URL 指向你的仓库
4. 打标签并推送：
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

GitHub Actions 会自动构建所有平台、签名更新包、创建 Release。

## 许可证

Apache 2.0
