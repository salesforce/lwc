/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { createDiagnosticsCategory, DiagnosticSeverity } from '@scary/diagnostics';

/**
 * TODO [W-5678919]: implement script to determine the next available error code
 * In the meantime, reference and the update the value at src/compiler/error-info/index.ts
 */

export const GENERIC_COMPILER_ERROR = {
    code: 1001,
    message: 'Unexpected compilation error: {0}',
    severity: DiagnosticSeverity.Error,
};

export const CompilerValidationErrors = createDiagnosticsCategory('compiler-validation', {
    INVALID_ALLOWDEFINITION_PROPERTY: (received: any) => ({
        code: 1012,
        message: `Expected a boolean for stylesheetConfig.customProperties.allowDefinition, received "${received}".`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    INVALID_COMPAT_PROPERTY: (received: any) => ({
        code: 1013,
        message: `Expected a boolean for outputConfig.compat, received "${received}".`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    INVALID_ENV_ENTRY_VALUE: (key: any, value: any) => ({
        code: 1014,
        message: `Expected a string for outputConfig.env["${key}"], received "${value}".`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    INVALID_ENV_PROPERTY: (received: any) => ({
        code: 1015,
        message: `Expected an object for outputConfig.env, received "${received}".`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    INVALID_FILES_PROPERTY: {
        code: 1016,
        message: 'Expected an object with files to be compiled.',
        severity: DiagnosticSeverity.Error,
        url: '',
    },

    INVALID_MINIFY_PROPERTY: (received: any) => ({
        code: 1017,
        message: `Expected a boolean for outputConfig.minify, received "${received}".`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    INVALID_NAME_PROPERTY: (name: any) => ({
        code: 1018,
        message: `Expected a string for name, received "${name}".`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    INVALID_NAMESPACE_PROPERTY: (namespace: any) => ({
        code: 1019,
        message: `Expected a string for namespace, received "${namespace}".`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    INVALID_RESOLUTION_PROPERTY: (received: any) => ({
        code: 1020,
        message: `Expected an object for stylesheetConfig.customProperties.resolution, received "${received}".`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    INVALID_SOURCEMAP_PROPERTY: (recevied: any) => ({
        code: 1021,
        message: `Expected a boolean value for outputConfig.sourcemap, received "${recevied}".`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    INVALID_TYPE_PROPERTY: (received: any) => ({
        code: 1022,
        message: `Expected either "native" or "module" for stylesheetConfig.customProperties.resolution.type, received "${received}".`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    MISSING_OPTIONS_OBJECT: (received: any) => ({
        code: 1023,
        message: `Expected options object, received "${received}".`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    UNEXPECTED_FILE_CONTENT: (key?: string, value?: string) => ({
        code: 1024,
        message: `Unexpected file content for "${key}". Expected a string, received "${value}".`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    UNKNOWN_ENV_ENTRY_KEY: (received: any) => ({
        code: 1025,
        message: `Unknown entry "${received}" in outputConfig.env.`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),
});

export const ModuleResolutionErrors = createDiagnosticsCategory('module-resolution', {
    MODULE_RESOLUTION_ERROR: (message: string) => ({
        code: 1002,
        message: `Error in module resolution: ${message}`,
        severity: DiagnosticSeverity.Warning,
        url: '',
    }),

    IMPORTEE_RESOLUTION_FAILED: (importee: string) => ({
        code: 1010,
        message: `Failed to resolve entry for module "${importee}".`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    IMPORTEE_RESOLUTION_FROM_IMPORTER_FAILED: (
        importName: string,
        fromName: string,
        path: string
    ) => ({
        code: 1011,
        message: `Failed to resolve import "${importName}" from "${fromName}". Please add "${path}" file to the component folder.`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    NONEXISTENT_FILE: (filename: string) => ({
        code: 1004,
        message: `No such file ${filename}'`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    FOLDER_NAME_STARTS_WITH_CAPITAL_LETTER: (badName: string, suggestion: string) => ({
        code: 1116,
        message: `Illegal folder name "${badName}". The folder name must start with a lowercase character: "${suggestion}".`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    FOLDER_AND_FILE_NAME_CASE_MISMATCH: (importName: string, foldername: string) => ({
        code: 1117,
        message: `Failed to resolve "${importName}". The file name must case match the component folder name "${foldername}".`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    IMPORT_AND_FILE_NAME_CASE_MISMATCH: (
        importName: string,
        fromName: string,
        suggestion: string
    ) => ({
        code: 1118,
        message: `Failed to resolve "${importName}" from "${fromName}". Did you mean "${suggestion}"?`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    RELATIVE_DYNAMIC_IMPORT: {
        code: 1120,
        message: 'Illegal usage of the dynamic import syntax with a relative path.',
        severity: DiagnosticSeverity.Error,
        url: '',
    },
});

export const TransformerErrors = createDiagnosticsCategory('transform-errors', {
    CSS_TRANSFORMER_ERROR: (err: any) => ({
        code: 1009,
        message: `${err}`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),
    CSS_IN_HTML_ERROR: (err: any) => ({
        code: 1026,
        message: `An error occurred parsing inline CSS. ${err}`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    HTML_TRANSFORMER_ERROR: (err: any) => ({
        code: 1008,
        message: `${err}`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    INVALID_ID: (received: any) => ({
        code: 1027,
        message: `Expect a string for id. Received ${received}`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    INVALID_SOURCE: (received: any) => ({
        code: 1006,
        message: `Expect a string for source. Received ${received}`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    JS_TRANSFORMER_ERROR: (err: any) => ({
        code: 1007,
        message: `${err}`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    NO_AVAILABLE_TRANSFORMER: (filename: string) => ({
        code: 1005,
        message: `No available transformer for "${filename}"`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),
});
