/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { DiagnosticLevel } from '../../shared/types';

/*
 * For the next available error code, reference (and update!) the value in ./index.ts
 */

export const GENERIC_COMPILER_ERROR = {
    code: 1001,
    message: 'Unexpected compilation error: {0}',
    level: DiagnosticLevel.Error,
    url: '',
};

export const CompilerValidationErrors = {
    INVALID_COMPAT_PROPERTY: {
        code: 1013,
        message: 'Expected a boolean for outputConfig.compat, received "{0}".',
        level: DiagnosticLevel.Error,
        url: '',
    },

    INVALID_ENV_ENTRY_VALUE: {
        code: 1014,
        message: 'Expected a string for outputConfig.env["{0}"], received "{1}".',
        level: DiagnosticLevel.Error,
        url: '',
    },

    INVALID_ENV_PROPERTY: {
        code: 1015,
        message: 'Expected an object for outputConfig.env, received "{0}".',
        level: DiagnosticLevel.Error,
        url: '',
    },

    INVALID_FILES_PROPERTY: {
        code: 1016,
        message: 'Expected an object with files to be compiled.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    INVALID_NAME_PROPERTY: {
        code: 1018,
        message: 'Expected a string for name, received "{0}".',
        level: DiagnosticLevel.Error,
        url: '',
    },

    INVALID_NAMESPACE_PROPERTY: {
        code: 1019,
        message: 'Expected a string for namespace, received "{0}".',
        level: DiagnosticLevel.Error,
        url: '',
    },

    INVALID_SOURCEMAP_PROPERTY: {
        code: 1021,
        message: 'Expected a boolean value for outputConfig.sourcemap, received "{0}".',
        level: DiagnosticLevel.Error,
        url: '',
    },

    MISSING_OPTIONS_OBJECT: {
        code: 1023,
        message: 'Expected options object, received "{0}".',
        level: DiagnosticLevel.Error,
        url: '',
    },

    UNEXPECTED_FILE_CONTENT: {
        code: 1024,
        message: 'Unexpected file content for "{0}". Expected a string, received "{1}".',
        level: DiagnosticLevel.Error,
        url: '',
    },

    UNKNOWN_ENV_ENTRY_KEY: {
        code: 1025,
        message: 'Unknown entry "{0}" in outputConfig.env.',
        level: DiagnosticLevel.Error,
        url: '',
    },
};

export const ModuleResolutionErrors = {
    MODULE_RESOLUTION_ERROR: {
        code: 1002,
        message: 'Error in module resolution: {0}',
        level: DiagnosticLevel.Warning,
        url: '',
    },

    IMPORTEE_RESOLUTION_FAILED: {
        code: 1010,
        message: 'Failed to resolve entry for module "{0}".',
        level: DiagnosticLevel.Error,
        url: '',
    },

    IMPORTEE_RESOLUTION_FROM_IMPORTER_FAILED: {
        code: 1011,
        message:
            'Failed to resolve import "{0}" from "{1}". Please add "{2}" file to the component folder.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    NONEXISTENT_FILE: {
        code: 1004,
        message: 'No such file {0}',
        level: DiagnosticLevel.Error,
        url: '',
    },

    FOLDER_NAME_STARTS_WITH_CAPITAL_LETTER: {
        code: 1116,
        message:
            'Illegal folder name "{0}". The folder name must start with a lowercase character: "{1}".',
        level: DiagnosticLevel.Error,
        url: '',
    },

    FOLDER_AND_FILE_NAME_CASE_MISMATCH: {
        code: 1117,
        message:
            'Failed to resolve "{0}". The file name must case match the component folder name "{1}".',
        level: DiagnosticLevel.Error,
        url: '',
    },

    IMPORT_AND_FILE_NAME_CASE_MISMATCH: {
        code: 1118,
        message: 'Failed to resolve "{0}" from "{1}". Did you mean "{2}"?',
        level: DiagnosticLevel.Error,
        url: '',
    },

    RELATIVE_DYNAMIC_IMPORT: {
        code: 1120,
        message: 'Illegal usage of the dynamic import syntax with a relative path.',
        level: DiagnosticLevel.Error,
        url: '',
    },
};

export const TransformerErrors = {
    CSS_TRANSFORMER_ERROR: {
        code: 1009,
        message: '{0}',
        level: DiagnosticLevel.Error,
        url: '',
    },
    CSS_IN_HTML_ERROR: {
        code: 1026,
        message: 'An error occurred parsing inline CSS. {0}',
        level: DiagnosticLevel.Error,
        url: '',
    },

    HTML_TRANSFORMER_ERROR: {
        code: 1008,
        message: '{0}',
        level: DiagnosticLevel.Error,
        url: '',
    },

    INVALID_ID: {
        code: 1027,
        message: 'Expect a string for id. Received {0}',
        level: DiagnosticLevel.Error,
        url: '',
    },

    INVALID_SOURCE: {
        code: 1006,
        message: 'Expect a string for source. Received {0}',
        level: DiagnosticLevel.Error,
        url: '',
    },

    JS_TRANSFORMER_ERROR: {
        code: 1007,
        message: '{0}',
        level: DiagnosticLevel.Error,
        url: '',
    },

    NO_AVAILABLE_TRANSFORMER: {
        code: 1005,
        message: 'No available transformer for "{0}"',
        level: DiagnosticLevel.Error,
        url: '',
    },

    JS_TRANSFORMER_DECORATOR_ERROR: {
        code: 1198,
        message:
            'Decorators like @api, @track, and @wire are only supported in LightningElement classes. {0}',
        level: DiagnosticLevel.Error,
        url: '',
    },
};
