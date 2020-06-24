/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { DiagnosticLevel } from '../../shared/types';
import { createDiagnosticsCategory } from '@scary/diagnostics';

/**
 * TODO [W-5678919]: implement script to determine the next available error code
 * In the meantime, reference and the update the value at src/compiler/error-info/index.ts
 */

export const GENERIC_COMPILER_ERROR = {
    code: 1001,
    message: 'Unexpected compilation error: {0}',
    level: DiagnosticLevel.Error
};

export const CompilerValidationErrors = createDiagnosticsCategory('compiler-validation', {
    INVALID_ALLOWDEFINITION_PROPERTY: (received: any) => ({
        code: 1012,
        message: `Expected a boolean for stylesheetConfig.customProperties.allowDefinition, received "${received}".`,
        level: DiagnosticLevel.Error,
        url: ''
    }),

    INVALID_COMPAT_PROPERTY: (received: any) => ({
        code: 1013,
        message: `Expected a boolean for outputConfig.compat, received "${received}".`,
        level: DiagnosticLevel.Error,
        url: ''
    }),

    INVALID_ENV_ENTRY_VALUE: (key: any, value: any) => ({
        code: 1014,
        message: `Expected a string for outputConfig.env["${key}"], received "${value}".`,
        level: DiagnosticLevel.Error,
        url: ''
    }),

    INVALID_ENV_PROPERTY: (received: any) => ({
        code: 1015,
        message: `Expected an object for outputConfig.env, received "${received}".`,
        level: DiagnosticLevel.Error,
        url: ''
    }),

    INVALID_FILES_PROPERTY: {
        code: 1016,
        message: 'Expected an object with files to be compiled.',
        level: DiagnosticLevel.Error,
        url: ''
    },

    INVALID_MINIFY_PROPERTY: (received: any) => ({
        code: 1017,
        message: `Expected a boolean for outputConfig.minify, received "${received}".`,
        level: DiagnosticLevel.Error,
        url: ''
    }),

    INVALID_NAME_PROPERTY: (name: any) => ({
        code: 1018,
        message: `Expected a string for name, received "${name}".`,
        level: DiagnosticLevel.Error,
        url: ''
    }),

    INVALID_NAMESPACE_PROPERTY: (namespace: any) => ({
        code: 1019,
        message: `Expected a string for namespace, received "${namespace}".`,
        level: DiagnosticLevel.Error,
        url: ''
    }),

    INVALID_RESOLUTION_PROPERTY: (received: any) => ({
        code: 1020,
        message: `Expected an object for stylesheetConfig.customProperties.resolution, received "${received}".`,
        level: DiagnosticLevel.Error,
        url: ''
    }),

    INVALID_SOURCEMAP_PROPERTY: (recevied: any) => ({
        code: 1021,
        message: `Expected a boolean value for outputConfig.sourcemap, received "${recevied}".`,
        level: DiagnosticLevel.Error,
        url: ''
    }),

    INVALID_TYPE_PROPERTY: (received: any) => ({
        code: 1022,
        message: `Expected either "native" or "module" for stylesheetConfig.customProperties.resolution.type, received "${received}".`,
        level: DiagnosticLevel.Error,
        url: ''
    }),

    MISSING_OPTIONS_OBJECT: (received: any) => ({
        code: 1023,
        message: `Expected options object, received "${received}".`,
        level: DiagnosticLevel.Error,
        url: ''
    }),

    UNEXPECTED_FILE_CONTENT: (key?: string, value?: string) => ({
        code: 1024,
        message: `Unexpected file content for "${key}". Expected a string, received "${value}".`,
        level: DiagnosticLevel.Error,
        url: ''
    }),

    UNKNOWN_ENV_ENTRY_KEY: (received: any) => ({
        code: 1025,
        message: `Unknown entry "${received}" in outputConfig.env.`,
        level: DiagnosticLevel.Error,
        url: ''
    })
});

export const ModuleResolutionErrors = createDiagnosticsCategory('module-resolution', {
    MODULE_RESOLUTION_ERROR: (message: string) => ({
        code: 1002,
        message: `Error in module resolution: ${message}`,
        level: DiagnosticLevel.Warning,
        url: ''
    }),

    IMPORTEE_RESOLUTION_FAILED: (importee: string) => ({
        code: 1010,
        message: `Failed to resolve entry for module "${importee}".`,
        level: DiagnosticLevel.Error,
        url: ''
    }),

    IMPORTEE_RESOLUTION_FROM_IMPORTER_FAILED: (
        importName: string,
        fromName: string,
        path: string
    ) => ({
        code: 1011,
        message: `Failed to resolve import "${importName}" from "${fromName}". Please add "${path}" file to the component folder.`,
        level: DiagnosticLevel.Error,
        url: ''
    }),

    NONEXISTENT_FILE: (filename: string) => ({
        code: 1004,
        message: `No such file ${filename}'`,
        level: DiagnosticLevel.Error,
        url: ''
    }),

    FOLDER_NAME_STARTS_WITH_CAPITAL_LETTER: (badName: string, suggestion: string) => ({
        code: 1116,
        message: `Illegal folder name "${badName}". The folder name must start with a lowercase character: "${suggestion}".`,
        level: DiagnosticLevel.Error,
        url: ''
    }),

    FOLDER_AND_FILE_NAME_CASE_MISMATCH: (importName: string, foldername: string) => ({
        code: 1117,
        message: `Failed to resolve "${importName}". The file name must case match the component folder name "${foldername}".`,
        level: DiagnosticLevel.Error,
        url: ''
    }),

    IMPORT_AND_FILE_NAME_CASE_MISMATCH: (
        importName: string,
        fromName: string,
        suggestion: string
    ) => ({
        code: 1118,
        message: `Failed to resolve "${importName}" from "${fromName}". Did you mean "${suggestion}"?`,
        level: DiagnosticLevel.Error,
        url: ''
    }),

    RELATIVE_DYNAMIC_IMPORT: {
        code: 1120,
        message: 'Illegal usage of the dynamic import syntax with a relative path.',
        level: DiagnosticLevel.Error,
        url: ''
    }
});

export const TransformerErrors = createDiagnosticsCategory('transform-errors', {
    CSS_TRANSFORMER_ERROR: {
        code: 1009,
        message: '{0}',
        level: DiagnosticLevel.Error,
        url: ''
    },
    CSS_IN_HTML_ERROR: {
        code: 1026,
        message: 'An error occurred parsing inline CSS. {0}',
        level: DiagnosticLevel.Error,
        url: ''
    },

    HTML_TRANSFORMER_ERROR: {
        code: 1008,
        message: '{0}',
        level: DiagnosticLevel.Error,
        url: ''
    },

    INVALID_ID: (received: any) => ({
        code: 1027,
        message: `Expect a string for id. Received ${received}`,
        level: DiagnosticLevel.Error,
        url: ''
    }),

    INVALID_SOURCE: (received: any) => ({
        code: 1006,
        message: `Expect a string for source. Received ${received}`,
        level: DiagnosticLevel.Error,
        url: ''
    }),

    JS_TRANSFORMER_ERROR: {
        code: 1007,
        message: '{0}',
        level: DiagnosticLevel.Error,
        url: ''
    },

    NO_AVAILABLE_TRANSFORMER: (filename: string) => ({
        code: 1005,
        message: `No available transformer for "${filename}"`,
        level: DiagnosticLevel.Error,
        url: ''
    })
});
