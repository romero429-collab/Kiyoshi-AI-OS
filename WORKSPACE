workspace(name = "kiyoshi_ai_os")

load("@bazel_tools//tools/build_defs/repo:http.bzl", "http_archive")

# Rust rules
http_archive(
    name = "rules_rust",
    sha256 = "a7f7a99e5f5c7b5b8c3e0e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e",
    urls = ["https://github.com/bazelbuild/rules_rust/releases/download/0.48.0/rules_rust-v0.48.0.tar.gz"],
)

# Mojo / modular rules placeholder (extend when Modular Bazel rules stabilize)
# http_archive(name = "rules_mojo", ...)

# Node / TypeScript rules
http_archive(
    name = "rules_nodejs",
    sha256 = "a7f7a99e5f5c7b5b8c3e0e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e",
    urls = ["https://github.com/bazelbuild/rules_nodejs/releases/download/6.2.0/rules_nodejs-6.2.0.tar.gz"],
)
