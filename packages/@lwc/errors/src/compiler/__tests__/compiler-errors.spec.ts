/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { describe, it, expect } from 'vitest';
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

const ERROR_INFO_WITH_URL = {
    code: 4,
    message: 'Test Error {0} with message {1}',
    level: DiagnosticLevel.Error,
    url: 'https://example.com/docs/lwc4',
};

const GENERIC_ERROR = {
    code: 100,
    message: 'Unexpected error: {0}',
    level: DiagnosticLevel.Error,
};

const GENERIC_ERROR_WITH_URL = {
    code: 100,
    message: 'Unexpected error: {0}',
    level: DiagnosticLevel.Error,
    url: 'https://example.com/docs/lwc100',
};

class CustomError extends Error {
    public lwcCode?: number;
    public filename?: string;
    public line?: number;
    public column?: number;
    public start?: number;
    public length?: number;
    public url?: string;

    constructor(
        message: string,
        filename?: string,
        line?: number,
        column?: number,
        start?: number,
        length?: number,
        url?: string
    ) {
        super(message);

        this.name = 'CustomError';

        this.filename = filename;
        this.line = line;
        this.column = column;
        this.start = start;
        this.length = length;
        this.url = url;
    }
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

        it('includes url in the compiler diagnostic when errorInfo has url', () => {
            const target = {
                code: 4,
                message: 'LWC4: Test Error arg1 with message 500',
                level: DiagnosticLevel.Error,
                url: 'https://example.com/docs/lwc4',
                filename: 'test.js',
                location: DEFAULT_LOCATION,
            };

            expect(
                generateCompilerDiagnostic(ERROR_INFO_WITH_URL, {
                    messageArgs: ['arg1', 500],
                    origin: {
                        filename: 'test.js',
                        location: DEFAULT_LOCATION,
                    },
                })
            ).toEqual(target);
        });

        it('generates a compiler diagnostic with undefined url when errorInfo has no url', () => {
            const diagnostic = generateCompilerDiagnostic(ERROR_INFO, {
                messageArgs: ['arg1', 500],
            });
            expect(diagnostic.url).toBeUndefined();
        });
    });

    describe('generate compiler error', () => {
        it('generates a compiler error when config is null', () => {
            const target = new CompilerError(4, 'LWC4: Test Error {0} with message {1}');

            expect(generateCompilerError(ERROR_INFO)).toEqual(target);
        });
        it('generates a compiler error based on the provided error info', () => {
            const args = ['arg1', 10];
            const target = new CompilerError(4, 'LWC4: Test Error arg1 with message 10');

            expect(
                generateCompilerError(ERROR_INFO, {
                    messageArgs: args,
                })
            ).toEqual(target);
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

        it('includes url in the compiler error when errorInfo has url', () => {
            const args = ['arg1', 10];
            const error = generateCompilerError(ERROR_INFO_WITH_URL, {
                messageArgs: args,
            });

            expect(error.url).toEqual('https://example.com/docs/lwc4');
        });

        it('generates a compiler error with undefined url when errorInfo has no url', () => {
            const args = ['arg1', 10];
            const error = generateCompilerError(ERROR_INFO, {
                messageArgs: args,
            });

            expect(error.url).toBeUndefined();
        });
    });

    describe('normalizeToCompilerError', () => {
        it('preserves existing compiler error', () => {
            const error = new CompilerError(100, 'LWC100: test err');
            expect(normalizeToCompilerError(GENERIC_ERROR, error)).toEqual(error);
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

            expect(
                normalizeToCompilerError(GENERIC_ERROR, oldError, {
                    filename: 'test.js',
                    location: DEFAULT_LOCATION,
                })
            ).toEqual(target);
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
            expect(normalized).toEqual(target);
        });

        it('adds additional origin info into the normalized error if provided', () => {
            const error = new CustomError('test error');
            const target = new CompilerError(
                100,
                'CustomError: LWC100: Unexpected error: test error',
                'test.js',
                DEFAULT_LOCATION
            );

            expect(
                normalizeToCompilerError(GENERIC_ERROR, error, {
                    filename: 'test.js',
                    location: DEFAULT_LOCATION,
                })
            ).toEqual(target);
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

            expect(
                normalizeToCompilerError(GENERIC_ERROR, error, {
                    filename: 'test.js',
                    location: DEFAULT_LOCATION,
                })
            ).toEqual(target);
        });

        it('preserves url from existing compiler error', () => {
            const error = new CompilerError(
                100,
                'LWC100: test err',
                'test.js',
                DEFAULT_LOCATION,
                DiagnosticLevel.Error,
                'https://example.com/docs/lwc100'
            );
            const normalized = normalizeToCompilerError(GENERIC_ERROR, error);
            expect(normalized.url).toEqual('https://example.com/docs/lwc100');
        });

        it('includes url from error object when normalizing non-CompilerError', () => {
            const error = new CustomError(
                'test error',
                'test.js',
                3,
                5,
                16,
                10,
                'https://example.com/docs/custom'
            );
            const normalized = normalizeToCompilerError(GENERIC_ERROR, error);
            expect(normalized.url).toEqual('https://example.com/docs/custom');
        });

        it('uses fallback url from errorInfo when error has no url', () => {
            const error = new CustomError('test error', 'test.js', 3, 5, 16, 10);
            const normalized = normalizeToCompilerError(GENERIC_ERROR_WITH_URL, error);
            expect(normalized.url).toEqual('https://example.com/docs/lwc100');
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

        it('preserves url from compiler error when converting to diagnostic', () => {
            const error = new CompilerError(
                100,
                'LWC100: test error',
                'test.js',
                DEFAULT_LOCATION,
                DiagnosticLevel.Error,
                'https://example.com/docs/lwc100'
            );
            const diagnostic = normalizeToDiagnostic(GENERIC_ERROR, error);
            expect(diagnostic.url).toEqual('https://example.com/docs/lwc100');
        });

        it('includes url from error object when normalizing non-CompilerError', () => {
            const error = new CustomError(
                'test error',
                'test.js',
                2,
                5,
                10,
                5,
                'https://example.com/docs/custom'
            );
            const diagnostic = normalizeToDiagnostic(GENERIC_ERROR, error);
            expect(diagnostic.url).toEqual('https://example.com/docs/custom');
        });

        it('uses fallback url from errorInfo when error has no url', () => {
            const error = new CustomError('test error', 'test.js', 2, 5, 10, 5);
            const diagnostic = normalizeToDiagnostic(GENERIC_ERROR_WITH_URL, error);
            expect(diagnostic.url).toEqual('https://example.com/docs/lwc100');
        });

        it('returns undefined url when neither error nor errorInfo has url', () => {
            const error = new CustomError('test error', 'test.js', 2, 5, 10, 5);
            const diagnostic = normalizeToDiagnostic(GENERIC_ERROR, error);
            expect(diagnostic.url).toBeUndefined();
        });
    });

    describe('CompilerError', () => {
        describe('constructor', () => {
            it('creates a CompilerError with all properties including url', () => {
                const error = new CompilerError(
                    100,
                    'test message',
                    'test.js',
                    DEFAULT_LOCATION,
                    DiagnosticLevel.Error,
                    'https://example.com/docs/lwc100'
                );

                expect(error.code).toEqual(100);
                expect(error.message).toEqual('test message');
                expect(error.filename).toEqual('test.js');
                expect(error.location).toEqual(DEFAULT_LOCATION);
                expect(error.level).toEqual(DiagnosticLevel.Error);
                expect(error.url).toEqual('https://example.com/docs/lwc100');
            });

            it('creates a CompilerError with undefined url when not provided', () => {
                const error = new CompilerError(100, 'test message');
                expect(error.url).toBeUndefined();
            });
        });

        describe('static from', () => {
            it('creates a CompilerError from a diagnostic preserving url', () => {
                const diagnostic = {
                    code: 100,
                    message: 'test message',
                    level: DiagnosticLevel.Error,
                    filename: 'test.js',
                    location: DEFAULT_LOCATION,
                    url: 'https://example.com/docs/lwc100',
                };

                const error = CompilerError.from(diagnostic);

                expect(error.code).toEqual(100);
                expect(error.message).toEqual('test message');
                expect(error.filename).toEqual('test.js');
                expect(error.location).toEqual(DEFAULT_LOCATION);
                expect(error.url).toEqual('https://example.com/docs/lwc100');
            });

            it('creates a CompilerError from a diagnostic without url', () => {
                const diagnostic = {
                    code: 100,
                    message: 'test message',
                    level: DiagnosticLevel.Error,
                    filename: 'test.js',
                    location: DEFAULT_LOCATION,
                };

                const error = CompilerError.from(diagnostic);

                expect(error.url).toBeUndefined();
            });

            it('uses origin for filename and location when provided', () => {
                const diagnostic = {
                    code: 100,
                    message: 'test message',
                    level: DiagnosticLevel.Error,
                    filename: 'old.js',
                    location: { line: 1, column: 1, start: 1, length: 1 },
                    url: 'https://example.com/docs/lwc100',
                };

                const error = CompilerError.from(diagnostic, {
                    filename: 'new.js',
                    location: DEFAULT_LOCATION,
                });

                expect(error.filename).toEqual('new.js');
                expect(error.location).toEqual(DEFAULT_LOCATION);
                expect(error.url).toEqual('https://example.com/docs/lwc100');
            });
        });

        describe('toDiagnostic', () => {
            it('converts CompilerError to diagnostic preserving url', () => {
                const error = new CompilerError(
                    100,
                    'test message',
                    'test.js',
                    DEFAULT_LOCATION,
                    DiagnosticLevel.Error,
                    'https://example.com/docs/lwc100'
                );

                const diagnostic = error.toDiagnostic();

                expect(diagnostic).toEqual({
                    code: 100,
                    message: 'test message',
                    filename: 'test.js',
                    location: DEFAULT_LOCATION,
                    level: DiagnosticLevel.Error,
                    url: 'https://example.com/docs/lwc100',
                });
            });

            it('converts CompilerError to diagnostic with undefined url', () => {
                const error = new CompilerError(
                    100,
                    'test message',
                    'test.js',
                    DEFAULT_LOCATION,
                    DiagnosticLevel.Error
                );

                const diagnostic = error.toDiagnostic();

                expect(diagnostic.url).toBeUndefined();
            });
        });
    });
});
