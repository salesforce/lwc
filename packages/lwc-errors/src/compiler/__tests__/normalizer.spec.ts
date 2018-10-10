import {
    throwError,
    generateCompilerError,
    normalizeErrorMessage,
    normalizeCompilerError
} from "../normalizer";

import { CompilerError } from "../utils";

describe('error handling', () => {
    describe('error messages', () => {
        it('formats an error string properly', () => {
            const errorInfo = {
                code: 4,
                message: "Error {0} Message {1}"
            };

            const args = ['arg1', 10];

            expect(normalizeErrorMessage(errorInfo, args))
                .toEqual("Error LWC4: Error arg1 Message 10");
        });
    });

    describe('generate compiler error', () => {
        it('generates a compiler error based on the provided error info', () => {
            const errorInfo = {
                code: 4,
                message: "Error {0} Message {1}"
            };
            const args = ['arg1', 10];
            const target = new CompilerError(4, "Error LWC4: Error arg1 Message 10");

            expect(generateCompilerError(errorInfo, args)).toEqual(target);
        });
    });
});
