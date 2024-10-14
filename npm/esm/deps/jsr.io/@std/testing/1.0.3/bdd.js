// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
import { getAssertionState } from "../../internal/1.0.4/assertion_state.js";
import { AssertionError } from "../../assert/1.0.6/assertion_error.js";
import { TestSuiteInternal, } from "./_test_suite.js";
/** Generates an ItDefinition from ItArgs. */
function itDefinition(...args) {
    let [suiteOptionsOrNameOrFn, optionsOrNameOrFn, optionsOrFn, fn,] = args;
    let suite = undefined;
    let name;
    let options;
    if (typeof suiteOptionsOrNameOrFn === "object" &&
        typeof suiteOptionsOrNameOrFn.symbol === "symbol") {
        suite = suiteOptionsOrNameOrFn;
    }
    else {
        fn = optionsOrFn;
        optionsOrFn = optionsOrNameOrFn;
        optionsOrNameOrFn = suiteOptionsOrNameOrFn;
    }
    if (typeof optionsOrNameOrFn === "string") {
        name = optionsOrNameOrFn;
        if (typeof optionsOrFn === "function") {
            fn = optionsOrFn;
            options = {};
        }
        else {
            options = optionsOrFn;
            if (!fn)
                fn = options.fn;
        }
    }
    else if (typeof optionsOrNameOrFn === "function") {
        fn = optionsOrNameOrFn;
        name = fn.name;
        options = {};
    }
    else {
        options = optionsOrNameOrFn;
        if (typeof optionsOrFn === "function") {
            fn = optionsOrFn;
        }
        else {
            fn = options.fn;
        }
        name = options.name ?? fn.name;
    }
    return {
        ...(suite !== undefined ? { suite } : {}),
        ...options,
        name,
        fn,
    };
}
/**
 * Registers an individual test case.
 *
 * @example Usage
 * ```ts
 * import { describe, it } from "@std/testing/bdd";
 * import { assertEquals } from "@std/assert";
 *
 * describe("example", () => {
 *   it("should pass", () => {
 *     // test case
 *     assertEquals(2 + 2, 4);
 *   });
 * });
 * ```
 *
 * @typeParam T The self type of the function to implement the test case
 * @param args The test case
 */
export function it(...args) {
    if (TestSuiteInternal.runningCount > 0) {
        throw new Error("Cannot register new test cases after already registered test cases start running");
    }
    const assertionState = getAssertionState();
    const options = itDefinition(...args);
    const { suite } = options;
    const testSuite = suite
        ? TestSuiteInternal.suites.get(suite.symbol)
        : TestSuiteInternal.current;
    if (!TestSuiteInternal.started)
        TestSuiteInternal.started = true;
    if (testSuite) {
        TestSuiteInternal.addStep(testSuite, options);
    }
    else {
        const { name, fn, ignore, only, permissions, sanitizeExit, sanitizeOps, sanitizeResources, } = options;
        const opts = {
            name,
            async fn(t) {
                TestSuiteInternal.runningCount++;
                try {
                    await fn.call({}, t);
                }
                finally {
                    TestSuiteInternal.runningCount--;
                }
                if (assertionState.checkAssertionErrorStateAndReset()) {
                    throw new AssertionError("Expected at least one assertion to be called but received none");
                }
            },
        };
        if (ignore !== undefined) {
            opts.ignore = ignore;
        }
        if (only !== undefined) {
            opts.only = only;
        }
        if (permissions !== undefined) {
            opts.permissions = permissions;
        }
        if (sanitizeExit !== undefined) {
            opts.sanitizeExit = sanitizeExit;
        }
        if (sanitizeOps !== undefined) {
            opts.sanitizeOps = sanitizeOps;
        }
        if (sanitizeResources !== undefined) {
            opts.sanitizeResources = sanitizeResources;
        }
        TestSuiteInternal.registerTest(opts);
    }
}
/**
 * Only execute this test case.
 *
 * @example Usage
 * ```ts
 * import { describe, it } from "@std/testing/bdd";
 * import { assertEquals } from "@std/assert";
 *
 * describe("example", () => {
 *   it("should pass", () => {
 *     assertEquals(2 + 2, 4);
 *   });
 *
 *   it.only("should pass too", () => {
 *     assertEquals(3 + 4, 7);
 *   });
 * });
 * ```
 *
 * @param args The test case
 */
it.only = function itOnly(...args) {
    const options = itDefinition(...args);
    return it({
        ...options,
        only: true,
    });
};
/**
 * Ignore this test case.
 *
 * @example Usage
 * ```ts
 * import { describe, it } from "@std/testing/bdd";
 * import { assertEquals } from "@std/assert";
 *
 * describe("example", () => {
 *   it("should pass", () => {
 *     assertEquals(2 + 2, 4);
 *   });
 *
 *   it.ignore("should pass too", () => {
 *     assertEquals(3 + 4, 7);
 *   });
 * });
 * ```
 *
 * @param args The test case
 */
it.ignore = function itIgnore(...args) {
    const options = itDefinition(...args);
    return it({
        ...options,
        ignore: true,
    });
};
/** Skip this test case.
 *
 * @example Usage
 * ```ts
 * import { describe, it } from "@std/testing/bdd";
 * import { assertEquals } from "@std/assert";
 *
 * describe("example", () => {
 *   it("should pass", () => {
 *     assertEquals(2 + 2, 4);
 *   });
 *
 *   it.skip("should pass too", () => {
 *     assertEquals(3 + 4, 7);
 *   });
 * });
 * ```
 *
 * @param args The test case
 */
it.skip = function itSkip(...args) {
    it.ignore(...args);
};
/**
 * Alias of {@linkcode it}
 *
 * Registers an individual test case.
 *
 * @example Usage
 * ```ts
 * import { test } from "@std/testing/bdd";
 * import { assertEquals } from "@std/assert";
 *
 * test("a test case", () => {
 *   // test case
 *   assertEquals(2 + 2, 4);
 * });
 * ```
 *
 * @typeParam T The self type of the function to implement the test case
 * @param args The test case
 */
export function test(...args) {
    it(...args);
}
function addHook(name, fn) {
    if (!TestSuiteInternal.current) {
        if (TestSuiteInternal.started) {
            throw new Error("Cannot add global hooks after a global test is registered");
        }
        TestSuiteInternal.current = new TestSuiteInternal({
            name: "global",
            [name]: fn,
        });
    }
    else {
        TestSuiteInternal.setHook(TestSuiteInternal.current, name, fn);
    }
}
/**
 * Run some shared setup before all of the tests in the suite.
 *
 * @example Usage
 * ```ts
 * import { describe, it, beforeAll } from "@std/testing/bdd";
 * import { assertEquals } from "@std/assert";
 *
 * beforeAll(() => {
 *  console.log("beforeAll");
 * });
 *
 * describe("example", () => {
 *   it("should pass", () => {
 *     // test case
 *     assertEquals(2 + 2, 4);
 *   });
 * });
 * ```
 *
 * @typeParam T The self type of the function
 * @param fn The function to implement the setup behavior.
 */
export function beforeAll(fn) {
    addHook("beforeAll", fn);
}
/**
 * Alias of {@linkcode beforeAll}
 *
 * Run some shared setup before all of the tests in the suite.
 *
 * @example Usage
 * ```ts
 * import { describe, it, before } from "@std/testing/bdd";
 * import { assertEquals } from "@std/assert";
 *
 * before(() => {
 *  console.log("before");
 * });
 *
 * describe("example", () => {
 *   it("should pass", () => {
 *     // test case
 *     assertEquals(2 + 2, 4);
 *   });
 * });
 * ```
 *
 * @typeParam T The self type of the function
 * @param fn The function to implement the setup behavior.
 */
export function before(fn) {
    beforeAll(fn);
}
/**
 * Run some shared teardown after all of the tests in the suite.
 *
 * @example Usage
 * ```ts
 * import { describe, it, afterAll } from "@std/testing/bdd";
 * import { assertEquals } from "@std/assert";
 *
 * afterAll(() => {
 *  console.log("afterAll");
 * });
 *
 * describe("example", () => {
 *   it("should pass", () => {
 *     // test case
 *     assertEquals(2 + 2, 4);
 *   });
 * });
 * ```
 *
 * @typeParam T The self type of the function
 * @param fn The function to implement the teardown behavior.
 */
export function afterAll(fn) {
    addHook("afterAll", fn);
}
/**
 * Alias of {@linkcode afterAll}.
 *
 * Run some shared teardown after all of the tests in the suite.
 *
 * @example Usage
 * ```ts
 * import { describe, it, after } from "@std/testing/bdd";
 * import { assertEquals } from "@std/assert";
 *
 * after(() => {
 *  console.log("after");
 * });
 *
 * describe("example", () => {
 *   it("should pass", () => {
 *     // test case
 *     assertEquals(2 + 2, 4);
 *   });
 * });
 * ```
 *
 * @typeParam T The self type of the function
 * @param fn The function to implement the teardown behavior.
 */
export function after(fn) {
    afterAll(fn);
}
/**
 * Run some shared setup before each test in the suite.
 *
 * @example Usage
 * ```ts
 * import { describe, it, beforeEach } from "@std/testing/bdd";
 * import { assertEquals } from "@std/assert";
 *
 * beforeEach(() => {
 *  console.log("beforeEach");
 * });
 *
 * describe("example", () => {
 *   it("should pass", () => {
 *     // test case
 *     assertEquals(2 + 2, 4);
 *   });
 * });
 * ```
 *
 * @typeParam T The self type of the function
 * @param fn The function to implement the shared setup behavior
 */
export function beforeEach(fn) {
    addHook("beforeEach", fn);
}
/**
 * Run some shared teardown after each test in the suite.
 *
 * @example Usage
 * ```ts
 * import { describe, it, afterEach } from "@std/testing/bdd";
 * import { assertEquals } from "@std/assert";
 *
 * afterEach(() => {
 *  console.log("afterEach");
 * });
 *
 * describe("example", () => {
 *   it("should pass", () => {
 *     // test case
 *     assertEquals(2 + 2, 4);
 *   });
 * });
 * ```
 *
 * @typeParam T The self type of the function
 * @param fn The function to implement the shared teardown behavior
 */
export function afterEach(fn) {
    addHook("afterEach", fn);
}
/** Generates a DescribeDefinition from DescribeArgs. */
function describeDefinition(...args) {
    let [suiteOptionsOrNameOrFn, optionsOrNameOrFn, optionsOrFn, fn,] = args;
    let suite = undefined;
    let name;
    let options;
    if (typeof suiteOptionsOrNameOrFn === "object" &&
        typeof suiteOptionsOrNameOrFn.symbol === "symbol") {
        suite = suiteOptionsOrNameOrFn;
    }
    else {
        fn = optionsOrFn;
        optionsOrFn = optionsOrNameOrFn;
        optionsOrNameOrFn = suiteOptionsOrNameOrFn;
    }
    if (typeof optionsOrNameOrFn === "string") {
        name = optionsOrNameOrFn;
        if (typeof optionsOrFn === "function") {
            fn = optionsOrFn;
            options = {};
        }
        else {
            options = optionsOrFn ?? {};
            if (fn === undefined) {
                fn = options.fn;
            }
        }
    }
    else if (typeof optionsOrNameOrFn === "function") {
        fn = optionsOrNameOrFn;
        name = fn.name;
        options = {};
    }
    else {
        options = optionsOrNameOrFn ?? {};
        if (typeof optionsOrFn === "function") {
            fn = optionsOrFn;
        }
        else {
            fn = options.fn;
        }
        name = options.name ?? fn?.name ?? "";
    }
    if (suite === undefined) {
        suite = options.suite;
    }
    if (suite === undefined && TestSuiteInternal.current) {
        const { symbol } = TestSuiteInternal.current;
        suite = { symbol };
    }
    return {
        ...options,
        suite: suite,
        name,
        fn: fn,
    };
}
/**
 * Registers a test suite.
 *
 * @example Usage
 * ```ts
 * import { describe, it } from "@std/testing/bdd";
 * import { assertEquals } from "@std/assert";
 *
 * describe("example", () => {
 *   it("should pass", () => {
 *     // test case
 *     assertEquals(2 + 2, 4);
 *   });
 * });
 * ```
 *
 * @typeParam T The self type of the test suite body.
 * @param args The test suite body.
 * @returns The test suite
 */
export function describe(...args) {
    if (TestSuiteInternal.runningCount > 0) {
        throw new Error("Cannot register new test suites after already registered test cases start running");
    }
    const options = describeDefinition(...args);
    if (!TestSuiteInternal.started)
        TestSuiteInternal.started = true;
    const { symbol } = new TestSuiteInternal(options);
    return { symbol };
}
/**
 * Only execute this test suite.
 *
 * @example Usage
 * ```ts
 * import { describe, it, beforeAll } from "@std/testing/bdd";
 * import { assertEquals } from "@std/assert";
 *
 * describe("example", () => {
 *   it("should pass", () => {
 *     assertEquals(2 + 2, 4);
 *   });
 * });
 *
 * // Only this test suite will run
 * describe.only("example 2", () => {
 *   it("should pass too", () => {
 *     assertEquals(3 + 4, 7);
 *   });
 * });
 * ```
 *
 * @param args The test suite body
 */
describe.only = function describeOnly(...args) {
    const options = describeDefinition(...args);
    return describe({
        ...options,
        only: true,
    });
};
/**
 * Ignore the test suite.
 *
 * @example Usage
 * ```ts
 * import { describe, it, beforeAll } from "@std/testing/bdd";
 * import { assertEquals } from "@std/assert";
 *
 * describe("example", () => {
 *   it("should pass", () => {
 *     assertEquals(2 + 2, 4);
 *   });
 * });
 *
 * describe.ignore("example 2", () => {
 *   it("should pass too", () => {
 *     assertEquals(3 + 4, 7);
 *   });
 * });
 * ```
 *
 * @param args The test suite body
 */
describe.ignore = function describeIgnore(...args) {
    const options = describeDefinition(...args);
    return describe({
        ...options,
        ignore: true,
    });
};
/**
 * Skip the test suite.
 *
 * @example Usage
 * ```ts
 * import { describe, it, beforeAll } from "@std/testing/bdd";
 * import { assertEquals } from "@std/assert";
 *
 * describe("example", () => {
 *   it("should pass", () => {
 *     assertEquals(2 + 2, 4);
 *   });
 * });
 *
 * describe.skip("example 2", () => {
 *   it("should pass too", () => {
 *     assertEquals(3 + 4, 7);
 *   });
 * });
 * ```
 *
 * @param args The test suite body
 */
describe.skip = function describeSkip(...args) {
    return describe.ignore(...args);
};
