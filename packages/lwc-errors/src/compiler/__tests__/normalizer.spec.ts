import {
    throwError,
    normalizeErrorMessage,
    normalizeCompilerError
} from "../normalizer";

describe('error handling', () => {
    it('Formats a proper error string', () => {
        const errorInfo = {
            code: 4,
            message: "Error {0} Message {1}"
        };

        const args = ['arg1', 10];

        expect(normalizeErrorMessage(errorInfo, args)).toEqual("Error LWC4: Error arg1 Message 10");
    });
});
