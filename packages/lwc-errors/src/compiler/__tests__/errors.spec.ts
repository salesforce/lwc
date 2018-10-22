import {
    CompilerError,
    generateCompilerError
} from "../errors";

import { Location, DiagnosticLevel } from "../../shared/types";

const ERROR_INFO = {
    code: 4,
    message: "Test Error {0} with message {1}",
    level: DiagnosticLevel.Error
};

class CustomError extends Error {
    public filename?: string;
    public location?: Location;
    public line?: number;
    public column?: number;

    constructor(message: string, filename?: string, location?: Location, line?: number, column?: number) {
        super(message);

        this.filename = filename;
        this.location = location;
        this.line = line;
        this.column = column;
    }
}

describe('error handling', () => {
    describe('generate compiler error', () => {
        it('generates a compiler error when config is null', () => {
            const target = new CompilerError(4, "LWC4: Test Error {0} with message {1}");

            expect(generateCompilerError(ERROR_INFO)).toEqual(target);
        });
        it('generates a compiler error based on the provided error info', () => {
            const args = ['arg1', 10];
            const target = new CompilerError(4, "LWC4: Test Error arg1 with message 10");

            expect(generateCompilerError(ERROR_INFO, {
                messageArgs: args
            })).toEqual(target);
        });

        it('formats an error string properly', () => {
            const args = ['arg1', 10];
            const error = generateCompilerError(ERROR_INFO, {
                messageArgs: args
            });

            expect(error.message).toEqual("LWC4: Test Error arg1 with message 10");
        });

        it('adds the filename to the compiler error if it exists as context', () => {
            const args = ['arg1', 10];
            const filename = "filename";

            const error = generateCompilerError(ERROR_INFO, {
                messageArgs: args,
                origin: { filename }
            });
            expect(error.filename).toEqual(filename);
        });

        it('adds the location to the compiler error if it exists as context', () => {
            const args = ['arg1', 10];
            const location = { line: 4, column: 27 };

            const error = generateCompilerError(ERROR_INFO, {
                messageArgs: args,
                origin: { location }
            });
            expect(error.location).toEqual(location);
        });
    });
});
