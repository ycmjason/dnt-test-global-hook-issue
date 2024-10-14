// Copyright 2018-2024 the Deno authors. All rights reserved. MIT license.
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _AssertionState_instances, _AssertionState_state, _AssertionState_resetAssertionState;
/**
 * Check the test suite internal state
 *
 * @example Usage
 * ```ts ignore
 * import { AssertionState } from "@std/internal";
 *
 * const assertionState = new AssertionState();
 * ```
 */
export class AssertionState {
    constructor() {
        _AssertionState_instances.add(this);
        _AssertionState_state.set(this, void 0);
        __classPrivateFieldSet(this, _AssertionState_state, {
            assertionCheck: false,
            assertionTriggered: false,
        }, "f");
    }
    /**
     * If `expect.hasAssertions` called, then through this method to update #state.assertionCheck value.
     *
     * @param val Set #state.assertionCheck's value
     *
     * @example Usage
     * ```ts ignore
     * import { AssertionState } from "@std/internal";
     *
     * const assertionState = new AssertionState();
     * assertionState.setAssertionCheck(true);
     * ```
     */
    setAssertionCheck(val) {
        __classPrivateFieldGet(this, _AssertionState_state, "f").assertionCheck = val;
    }
    /**
     * If any matchers was called, `#state.assertionTriggered` will be set through this method.
     *
     * @param val Set #state.assertionTriggered's value
     *
     * @example Usage
     * ```ts ignore
     * import { AssertionState } from "@std/internal";
     *
     * const assertionState = new AssertionState();
     * assertionState.setAssertionTriggered(true);
     * ```
     */
    setAssertionTriggered(val) {
        __classPrivateFieldGet(this, _AssertionState_state, "f").assertionTriggered = val;
    }
    /**
     * Check Assertion internal state, if `#state.assertionCheck` is set true, but
     * `#state.assertionTriggered` is still false, then should throw an Assertion Error.
     *
     * @returns a boolean value, that the test suite is satisfied with the check. If not,
     * it should throw an AssertionError.
     *
     * @example Usage
     * ```ts ignore
     * import { AssertionState } from "@std/internal";
     *
     * const assertionState = new AssertionState();
     * if (assertionState.checkAssertionErrorStateAndReset()) {
     *   // throw AssertionError("");
     * }
     * ```
     */
    checkAssertionErrorStateAndReset() {
        const result = __classPrivateFieldGet(this, _AssertionState_state, "f").assertionCheck &&
            !__classPrivateFieldGet(this, _AssertionState_state, "f").assertionTriggered;
        __classPrivateFieldGet(this, _AssertionState_instances, "m", _AssertionState_resetAssertionState).call(this);
        return result;
    }
}
_AssertionState_state = new WeakMap(), _AssertionState_instances = new WeakSet(), _AssertionState_resetAssertionState = function _AssertionState_resetAssertionState() {
    __classPrivateFieldSet(this, _AssertionState_state, {
        assertionCheck: false,
        assertionTriggered: false,
    }, "f");
};
const assertionState = new AssertionState();
/**
 * return an instance of AssertionState
 *
 * @returns AssertionState
 *
 * @example Usage
 * ```ts ignore
 * import { getAssertionState } from "@std/internal";
 *
 * const assertionState = getAssertionState();
 * assertionState.setAssertionTriggered(true);
 * ```
 */
export function getAssertionState() {
    return assertionState;
}
