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
export declare class AssertionState {
    #private;
    constructor();
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
    setAssertionCheck(val: boolean): void;
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
    setAssertionTriggered(val: boolean): void;
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
    checkAssertionErrorStateAndReset(): boolean;
}
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
export declare function getAssertionState(): AssertionState;
//# sourceMappingURL=assertion_state.d.ts.map