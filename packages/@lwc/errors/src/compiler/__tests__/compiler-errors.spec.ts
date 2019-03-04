/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    CompilerError,
    generateCompilerError,
    generateCompilerDiagnostic,
    generateErrorMessage,
    normalizeToCompilerError,
    normalizeToDiagnostic,
} from '../errors';

import { DiagnosticLevel } from '../../shared/types';

const DEFAULT_LOCATION = {
    line: 1,
    column: 22,
    start: 22,
    length: 8,
};

const ERROR_INFO = {
    code: 4,
    message: 'Test Error {0} with message {1}',
    level: DiagnosticLevel.Error,
};

const GENERIC_ERROR = {
    code: 100,
    message: 'Unexpected error: {0}',
    level: DiagnosticLevel.Error,
};

class CustomError extends Error {
    public lwcCode?: number;
    public filename?: string;
    public line?: number;
    public column?: number;
    public start?: number;
    public length?: number;

    constructor(
        message: string,
        filename?: string,
        line?: number,
        column?: number,
        start?: number,
        length?: number
    ) {
        super(message);

        this.name = 'CustomError';

        this.filename = filename;
        this.line = line;
        this.column = column;
        this.start = start;
        this.length = length;
    }
}

function checkErrorEquality(actual: CompilerError, expected: CompilerError) {
    expect(actual).toEqual(expected);
    expect(actual.code).toEqual(expected.code);
    expect(actual.level).toEqual(expected.level);
    expect(actual.filename).toEqual(expected.filename);
    expect(actual.location).toEqual(expected.location);
}

describe('error handling', () => {
    describe('generate compiler diagnostic', () => {
        it('generates a compiler diagnostic when config is null', () => {
            const target = {
                code: 4,
                message: 'LWC4: Test Error {0} with message {1}',
                level: DiagnosticLevel.Error,
            };
            expect(generateCompilerDiagnostic(ERROR_INFO)).toEqual(target);
        });

        it('generates a compiler diagnostic when given a config', () => {
            const target = {
                code: 4,
                message: 'LWC4: Test Error arg1 with message 500',
                level: DiagnosticLevel.Error,
                filename: 'test.js',
                location: DEFAULT_LOCATION,
            };

            expect(
                generateCompilerDiagnostic(ERROR_INFO, {
                    messageArgs: ['arg1', 500],
                    origin: {
                        filename: 'test.js',
                        location: DEFAULT_LOCATION,
                    },
                })
            ).toEqual(target);
        });
    });

    describe('generate compiler error', () => {
        it('generates a compiler error when config is null', () => {
            const target = new CompilerError(4, 'LWC4: Test Error {0} with message {1}');

            checkErrorEquality(generateCompilerError(ERROR_INFO), target);
        });
        it('generates a compiler error based on the provided error info', () => {
            const args = ['arg1', 10];
            const target = new CompilerError(4, 'LWC4: Test Error arg1 with message 10');

            checkErrorEquality(
                generateCompilerError(ERROR_INFO, {
                    messageArgs: args,
                }),
                target
            );
        });

        it('formats an error string properly', () => {
            const args = ['arg1', 10];
            const error = generateCompilerError(ERROR_INFO, {
                messageArgs: args,
            });

            expect(error.message).toEqual('LWC4: Test Error arg1 with message 10');
        });

        it('adds the filename to the compiler error if it exists as context', () => {
            const args = ['arg1', 10];
            const filename = 'filename';

            const error = generateCompilerError(ERROR_INFO, {
                messageArgs: args,
                origin: { filename },
            });
            expect(error.filename).toEqual(filename);
        });

        it('adds the location to the compiler error if it exists as context', () => {
            const args = ['arg1', 10];

            const error = generateCompilerError(ERROR_INFO, {
                messageArgs: args,
                origin: { location: DEFAULT_LOCATION },
            });
            expect(error.location).toEqual(DEFAULT_LOCATION);
        });
    });

    describe('normalizeToCompilerError', () => {
        it('preserves existing compiler error', () => {
            const error = new CompilerError(100, 'LWC100: test err');
            checkErrorEquality(normalizeToCompilerError(GENERIC_ERROR, error), error);
        });

        it('adds origin info to an existing compiler error', () => {
            const oldError = new CompilerError(100, 'LWC100: test error', 'old.js', {
                line: 1,
                column: 7,
                start: 7,
                length: 3,
            });
            const target = new CompilerError(
                100,
                'LWC100: test error',
                'test.js',
                DEFAULT_LOCATION
            );

            checkErrorEquality(
                normalizeToCompilerError(GENERIC_ERROR, oldError, {
                    filename: 'test.js',
                    location: DEFAULT_LOCATION,
                }),
                target
            );
        });

        it('normalizes a given error into a compiler error', () => {
            const error = new CustomError('test error', 'test.js', 3, 5, 16, 10);
            const target = new CompilerError(
                100,
                'CustomError: LWC100: Unexpected error: test error',
                'test.js',
                { line: 3, column: 5, start: 16, length: 10 }
            );

            const normalized = normalizeToCompilerError(GENERIC_ERROR, error);
            checkErrorEquality(normalized, target);
        });

        it('adds additional origin info into the normalized error if provided', () => {
            const error = new CustomError('test error');
            const target = new CompilerError(
                100,
                'CustomError: LWC100: Unexpected error: test error',
                'test.js',
                DEFAULT_LOCATION
            );

            checkErrorEquality(
                normalizeToCompilerError(GENERIC_ERROR, error, {
                    filename: 'test.js',
                    location: DEFAULT_LOCATION,
                }),
                target
            );
        });

        it('ignores the fallback errorInfo when an error code already exists on the error', () => {
            const message = generateErrorMessage(ERROR_INFO, ['arg1', 10]);
            const error = new CustomError(message);
            error.lwcCode = ERROR_INFO.code;

            const target = generateCompilerError(ERROR_INFO, {
                messageArgs: ['arg1', 10],
                origin: {
                    filename: 'test.js',
                    location: DEFAULT_LOCATION,
                },
            });
            target.message = `CustomError: ${target.message}`;

            checkErrorEquality(
                normalizeToCompilerError(GENERIC_ERROR, error, {
                    filename: 'test.js',
                    location: DEFAULT_LOCATION,
                }),
                target
            );
        });
    });

    describe('normalizeToDiagnostic', () => {
        it('normalizes a given compiler error into a diagnostic', () => {
            const target = {
                code: 100,
                message: 'LWC100: test error',
                level: DiagnosticLevel.Error,
                filename: 'test.js',
                location: DEFAULT_LOCATION,
            };
            const error = new CompilerError(
                target.code,
                target.message,
                target.filename,
                target.location
            );

            expect(normalizeToDiagnostic(GENERIC_ERROR, error)).toEqual(target);
        });

        it('adds origin info to an existing compiler error when converting it to a diagnostic', () => {
            const target = {
                code: 100,
                message: 'LWC100: test error',
                level: DiagnosticLevel.Error,
                filename: 'test.js',
                location: DEFAULT_LOCATION,
            };
            const error = new CompilerError(
                target.code,
                target.message,
                'old.js',
                DEFAULT_LOCATION
            );

            expect(
                normalizeToDiagnostic(GENERIC_ERROR, error, {
                    filename: target.filename,
                    location: target.location,
                })
            ).toEqual(target);
        });

        it('normalizes a given error into a compiler diagnostic', () => {
            const error = new CustomError('test error', 'test.js', 2, 5, 10, 5);
            const target = {
                code: 100,
                message: 'LWC100: Unexpected error: test error',
                level: DiagnosticLevel.Error,
                filename: 'test.js',
                location: {
                    line: 2,
                    column: 5,
                    start: 10,
                    length: 5,
                },
            };

            expect(normalizeToDiagnostic(GENERIC_ERROR, error)).toEqual(target);
        });

        it('adds additional origin info into the normalized diagnostic if provided', () => {
            const error = new CustomError('test error');
            const target = {
                code: 100,
                message: 'LWC100: Unexpected error: test error',
                level: DiagnosticLevel.Error,
                filename: 'test.js',
                location: DEFAULT_LOCATION,
            };

            expect(
                normalizeToDiagnostic(GENERIC_ERROR, error, {
                    filename: 'test.js',
                    location: DEFAULT_LOCATION,
                })
            ).toEqual(target);
        });
    });
});
