# global hooks with `@std/testing` show "Error: Cannot add global hooks after a global test is registered"

To see the issue:

```
deno run -A dnt.ts
```

And you should see the following:

```
Error: Cannot add global hooks after a global test is registered
    at addHook (dnt-issue/npm/script/deps/jsr.io/@std/testing/1.0.3/bdd.js:241:19)
    at beforeEach (dnt-issue/npm/script/deps/jsr.io/@std/testing/1.0.3/bdd.js:384:5)
    at Object.<anonymous> (dnt-issue/npm/script/b.test.js:4:25)
    at Module._compile (node:internal/modules/cjs/loader:1469:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1548:10)
    at Module.load (node:internal/modules/cjs/loader:1288:32)
    at Module._load (node:internal/modules/cjs/loader:1104:12)
    at Module.require (node:internal/modules/cjs/loader:1311:19)
    at require (node:internal/modules/helpers:179:18)
    at main (dnt-issue/npm/test_runner.js:26:13)
error: Uncaught (in promise) Error: npm run test failed with exit code 1
      throw new Error(
            ^
    at runCommand (https://jsr.io/@deno/dnt/0.41.3/lib/utils.ts:56:13)
    at eventLoopTick (ext:core/01_core.js:175:7)
    at async build (https://jsr.io/@deno/dnt/0.41.3/mod.ts:419:5)
    at async file://dnt-issue/dnt.ts:5:1
```

If you rename `b.test.ts` to `01b.test.ts`, it will fix the issue.

Related issue: https://github.com/denoland/dnt/issues/432
