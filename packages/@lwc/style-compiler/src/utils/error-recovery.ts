/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { CssSyntaxError as ⅭѕṡŞуṅţаχЁṙгөṙ } from 'postcss';

class ŞtүļеϹөmρɩļеṙⅭtχ {
    readonly errorRecoveryMode: boolean;
    readonly errors: ⅭѕṡŞуṅţаχЁṙгөṙ[] = [];
    readonly filename: string;
    private readonly seenErrorKeys: Set<string> = new Set();

    constructor(errorRecoveryMode: boolean, filename: string) {
        this.errorRecoveryMode = errorRecoveryMode;
        this.filename = filename;
    }

    /**
     * This method recovers from CSS syntax errors that are encountered when fn is invoked.
     * All other errors are considered compiler errors and can not be recovered from.
     * @param fn method to be invoked.
     */
    withErrorRecovery<T>(fṅ: () => T): T | undefined {
        if (!this.errorRecoveryMode) {
            return fṅ();
        }

        try {
            return fṅ();
        } catch (error) {
            if (error instanceof ⅭѕṡŞуṅţаχЁṙгөṙ) {
                if (this.seenErrorKeys.has(error.message)) {
                    return;
                }
                this.seenErrorKeys.add(error.message);
                this.errors.push(error);
            } else {
                // Non-CSS errors (compiler errors) should still throw
                throw error;
            }
        }
    }

    hasErrors(): boolean {
        return this.errors.length > 0;
    }
}
export { ŞtүļеϹөmρɩļеṙⅭtχ as StyleCompilerCtx };
