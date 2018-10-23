import { DiagnosticLevel } from "../../shared/types";

export const JestTransformerErrors = {
    GENERIC_JEST_TRANSFORMER_ERROR: {
        code: 1001,
        message: 'Generic error in Jest transformer',
        level: DiagnosticLevel.Error,
        url: ''
    },

    INVALID_IMPORT: {
        code: 1001,
        message: 'Invalid import from {0}. Only import the default using the following syntax: "import foo from \'@salesforce/label/c.foo\'"',
        level: DiagnosticLevel.Error,
        url: ''
    }
};
