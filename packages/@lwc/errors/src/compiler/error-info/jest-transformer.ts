import { DiagnosticLevel } from "../../shared/types";

export const JestTransformerErrors = {
    INVALID_IMPORT: {
        code: 1001,
        message: 'Invalid import from {0}. Only import the default using the following syntax: "import foo from \'@salesforce/label/c.foo\'"',
        level: DiagnosticLevel.Error,
        url: ''
    }
};
