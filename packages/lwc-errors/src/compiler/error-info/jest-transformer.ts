import { Level } from "../../shared/utils";
/*
    Custom errors:
        path.buildCodeFrameError
            --
*/

export const JestTransformerErrors = {
    GENERIC_JEST_TRANSFORMER_ERROR: {
        code: 0,
        message: 'Generic error in Jest transformer',
        type: 'Error',
        level: Level.Error,
        url: ''
    },
    INVALID_IMPORT: {
        code: 0,
        message: 'Invalid import from {0}. Only import the default using the following syntax: "import foo from \'@salesforce/label/c.foo\'"',
        type: 'Custom',
        level: Level.Error,
        url: ''
    }
};
