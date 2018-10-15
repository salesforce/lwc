import {
    CompilerError,
    generateCompilerError,
} from "../errors";

import { Location } from "../../shared/types";

const ERROR_INFO = {
    code: 4,
    message: "Test Error {0} with message {1}"
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
            const target = new CompilerError(4, "Error LWC4: Test Error {0} with message {1}");

            expect(generateCompilerError(ERROR_INFO)).toEqual(target);
        });
        it('generates a compiler error based on the provided error info', () => {
            const args = ['arg1', 10];
            const target = new CompilerError(4, "Error LWC4: Test Error arg1 with message 10");

            expect(generateCompilerError(ERROR_INFO, {
                messageArgs: args
            })).toEqual(target);
        });

        it('formats an error string properly', () => {
            const args = ['arg1', 10];
            const error = generateCompilerError(ERROR_INFO, {
                messageArgs: args
            });

            expect(error.message).toEqual("Error LWC4: Test Error arg1 with message 10");
        });

        it('adds the filename to the compiler error if it exists as context', () => {
            const args = ['arg1', 10];
            const filename = "filename";

            const error = generateCompilerError(ERROR_INFO, {
                messageArgs: args,
                context: { filename }
            });
            expect(error.filename).toEqual(filename);
        });

        it('adds the location to the compiler error if it exists as context', () => {
            const args = ['arg1', 10];
            const location = { line: 4, column: 27 };

            const error = generateCompilerError(ERROR_INFO, {
                messageArgs: args,
                context: { location }
            });
            expect(error.location).toEqual(location);
        });
    });

    describe('custom error constructor', () => {
        it('generates a compiler error based on the result of a custom error constructor', () => {
            const args = ['errorName', 10];
            const generateCustomError = (message) => {
                return new CustomError(
                    `Error message prefix from custom error: [${message}] with suffix`,
                );
            };

            const error = generateCompilerError(ERROR_INFO, {
                messageArgs: args,
                errorConstructor: generateCustomError
            });
            expect(error.message).toEqual("Error message prefix from custom error: [Error LWC4: Test Error errorName with message 10] with suffix");
        });

        it('adds the filename to the compiler error if it exists on the custom error', () => {
            const args = ['errorName', 10];
            const filename = "filename";
            const generateCustomError = (message) => {
                return new CustomError(`test prefix ${message} suffix`, filename);
            };

            const error = generateCompilerError(ERROR_INFO, {
                messageArgs: args,
                errorConstructor: generateCustomError
            });
            expect(error.filename).toEqual(filename);
        });

        it('adds the location to the compiler error if it exists on the custom error', () => {
            const args = ['errorName', 10];
            const location = { line: 7, column: 42 };
            const generateCustomError = (message) => {
                return new CustomError(`test prefix ${message} suffix`, "", location);
            };

            const error = generateCompilerError(ERROR_INFO, {
                messageArgs: args,
                errorConstructor: generateCustomError
            });
            expect(error.location).toEqual(location);
        });

        it('adds the line and column info to the compiler error if it exists on the custom error', () => {
            const args = ['errorName', 10];
            const location = { line: 7, column: 42 };
            const generateCustomError = (message) => {
                return new CustomError(`test prefix ${message} suffix`, undefined, undefined, location.line, location.column);
            };

            const error = generateCompilerError(ERROR_INFO, {
                messageArgs: args,
                errorConstructor: generateCustomError
            });
            expect(error.location).toEqual(location);
        });
    });
});
