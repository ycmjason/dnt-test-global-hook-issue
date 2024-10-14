import { build, emptyDir } from "jsr:@deno/dnt";

await emptyDir("./npm");

await build({
  entryPoints: ["./mod.ts"],
  typeCheck: false,
  outDir: "./npm",
  shims: { deno: true },
  package: {
    name: "your-package",
    version: "0.0.1",
  },
});
