import { DiagnosticLevel } from "../../shared/types";

/**
 * TODO: W-5678919 - implement script to determine the next available error code
 * In the meantime, reference and the update the value at src/compiler/error-info/index.ts
 */

export const JestTransformerErrors = {
    INVALID_IMPORT: {
        code: 1114,
        message: 'Invalid import from {0}. Only import the default using the following syntax: "import foo from \'@salesforce/label/c.foo\'"',
        level: DiagnosticLevel.Error,
        url: ''
    }
};
