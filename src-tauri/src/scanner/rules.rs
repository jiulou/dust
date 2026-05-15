use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum TechStack {
    NodeJs,
    Rust,
    Go,
    Flutter,
    Python,
    Java,
    DotNet,
    Ruby,
    Php,
    Swift,
    Haskell,
    Elixir,
    Elm,
    Deno,
}

impl TechStack {
    pub fn label(&self) -> &'static str {
        match self {
            TechStack::NodeJs => "Node.js",
            TechStack::Rust => "Rust",
            TechStack::Go => "Go",
            TechStack::Flutter => "Flutter",
            TechStack::Python => "Python",
            TechStack::Java => "Java",
            TechStack::DotNet => ".NET",
            TechStack::Ruby => "Ruby",
            TechStack::Php => "PHP",
            TechStack::Swift => "Swift",
            TechStack::Haskell => "Haskell",
            TechStack::Elixir => "Elixir",
            TechStack::Elm => "Elm",
            TechStack::Deno => "Deno",
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScanRule {
    pub target_dir: String,
    pub anchor_files: Vec<String>,
    pub tech_stack: TechStack,
}

impl ScanRule {
    pub fn new(target_dir: &str, anchor_files: Vec<&str>, tech_stack: TechStack) -> Self {
        Self {
            target_dir: target_dir.to_string(),
            anchor_files: anchor_files.into_iter().map(String::from).collect(),
            tech_stack,
        }
    }
}

pub fn builtin_rules() -> Vec<ScanRule> {
    vec![
        ScanRule::new("node_modules", vec!["package.json"], TechStack::NodeJs),
        ScanRule::new("target", vec!["Cargo.toml", "Cargo.lock"], TechStack::Rust),
        ScanRule::new("vendor", vec!["go.mod"], TechStack::Go),
        ScanRule::new("pkg", vec!["go.mod"], TechStack::Go),
        ScanRule::new(".dart_tool", vec!["pubspec.yaml"], TechStack::Flutter),
        ScanRule::new("__pycache__", vec!["requirements.txt", "pyproject.toml", "setup.py"], TechStack::Python),
        ScanRule::new(".venv", vec!["requirements.txt", "pyproject.toml", "setup.py"], TechStack::Python),
        ScanRule::new("build", vec!["pom.xml", "build.gradle"], TechStack::Java),
        ScanRule::new(".gradle", vec!["pom.xml", "build.gradle"], TechStack::Java),
        ScanRule::new("bin", vec!["*.csproj", "*.sln"], TechStack::DotNet),
        ScanRule::new("obj", vec!["*.csproj", "*.sln"], TechStack::DotNet),
        ScanRule::new("vendor", vec!["Gemfile", "Gemfile.lock"], TechStack::Ruby),
        ScanRule::new("vendor", vec!["composer.json"], TechStack::Php),
        ScanRule::new(".build", vec!["Package.swift"], TechStack::Swift),
        ScanRule::new(".stack-work", vec!["stack.yaml"], TechStack::Haskell),
        ScanRule::new("deps", vec!["mix.exs"], TechStack::Elixir),
        ScanRule::new("elm-stuff", vec!["elm.json"], TechStack::Elm),
        ScanRule::new("node_modules", vec!["deno.json", "deno.jsonc", "import_map.json"], TechStack::Deno),
    ]
}

#[allow(dead_code)]
pub fn find_matching_rule<'a>(dir_name: &str, rules: &'a [ScanRule]) -> Option<&'a ScanRule> {
    rules.iter().find(|r| r.target_dir == dir_name)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_builtin_rules_count() {
        let rules = builtin_rules();
        assert!(rules.len() >= 14);
    }

    #[test]
    fn test_find_matching_rule_returns_some() {
        let rules = builtin_rules();
        assert!(find_matching_rule("node_modules", &rules).is_some());
    }

    #[test]
    fn test_find_matching_rule_returns_none() {
        let rules = builtin_rules();
        assert!(find_matching_rule("nonexistent", &rules).is_none());
    }

    #[test]
    fn test_tech_stack_label() {
        assert_eq!(TechStack::NodeJs.label(), "Node.js");
        assert_eq!(TechStack::Ruby.label(), "Ruby");
    }
}
