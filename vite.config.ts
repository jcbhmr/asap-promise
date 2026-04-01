import { defineConfig, type UserConfig } from "vite-plus";

const config: UserConfig = defineConfig({
  staged: {
    "*": "vp check --fix",
  },
  test: {
    includeSource: ["src/**/*.?(c|m)[jt]s?(x)"],
    tags: [{ name: "bench" }],
    execArgv: ["--allow-natives-syntax", "--expose-gc"],
  },
  pack: {
    dts: {
      tsgo: true,
    },
    exports: {
      packageJson: false,
    },
    fixedExtension: false,
    define: {
      "import.meta.vitest": "undefined",
    },
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {},
});
export { config as default };
