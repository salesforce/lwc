import { DiagnosticSeverity } from '@scary/diagnostics';
/**
 * TODO [W-5678919]: implement script to determine the next available error code
 * In the meantime, reference and the update the value at src/compiler/error-info/index.ts
 */
export declare const GENERIC_COMPILER_ERROR: {
    code: number;
    message: string;
    severity: DiagnosticSeverity;
};
export declare const CompilerValidationErrors: {
    INVALID_ALLOWDEFINITION_PROPERTY: (received: any) => import('@scary/diagnostics').Diagnostic;
    INVALID_COMPAT_PROPERTY: (received: any) => import('@scary/diagnostics').Diagnostic;
    INVALID_ENV_ENTRY_VALUE: (key: any, value: any) => import('@scary/diagnostics').Diagnostic;
    INVALID_ENV_PROPERTY: (received: any) => import('@scary/diagnostics').Diagnostic;
    INVALID_FILES_PROPERTY: () => import('@scary/diagnostics').Diagnostic;
    INVALID_MINIFY_PROPERTY: (received: any) => import('@scary/diagnostics').Diagnostic;
    INVALID_NAME_PROPERTY: (name: any) => import('@scary/diagnostics').Diagnostic;
    INVALID_NAMESPACE_PROPERTY: (namespace: any) => import('@scary/diagnostics').Diagnostic;
    INVALID_RESOLUTION_PROPERTY: (received: any) => import('@scary/diagnostics').Diagnostic;
    INVALID_SOURCEMAP_PROPERTY: (recevied: any) => import('@scary/diagnostics').Diagnostic;
    INVALID_TYPE_PROPERTY: (received: any) => import('@scary/diagnostics').Diagnostic;
    MISSING_OPTIONS_OBJECT: (received: any) => import('@scary/diagnostics').Diagnostic;
    UNEXPECTED_FILE_CONTENT: (
        key?: string,
        value?: string
    ) => import('@scary/diagnostics').Diagnostic;
    UNKNOWN_ENV_ENTRY_KEY: (received: any) => import('@scary/diagnostics').Diagnostic;
};
export declare const ModuleResolutionErrors: {
    MODULE_RESOLUTION_ERROR: (message: string) => import('@scary/diagnostics').Diagnostic;
    IMPORTEE_RESOLUTION_FAILED: (importee: string) => import('@scary/diagnostics').Diagnostic;
    IMPORTEE_RESOLUTION_FROM_IMPORTER_FAILED: (
        importName: string,
        fromName: string,
        path: string
    ) => import('@scary/diagnostics').Diagnostic;
    NONEXISTENT_FILE: (filename: string) => import('@scary/diagnostics').Diagnostic;
    FOLDER_NAME_STARTS_WITH_CAPITAL_LETTER: (
        badName: string,
        suggestion: string
    ) => import('@scary/diagnostics').Diagnostic;
    FOLDER_AND_FILE_NAME_CASE_MISMATCH: (
        importName: string,
        foldername: string
    ) => import('@scary/diagnostics').Diagnostic;
    IMPORT_AND_FILE_NAME_CASE_MISMATCH: (
        importName: string,
        fromName: string,
        suggestion: string
    ) => import('@scary/diagnostics').Diagnostic;
    RELATIVE_DYNAMIC_IMPORT: () => import('@scary/diagnostics').Diagnostic;
};
export declare const TransformerErrors: {
    CSS_TRANSFORMER_ERROR: () => import('@scary/diagnostics').Diagnostic;
    CSS_IN_HTML_ERROR: () => import('@scary/diagnostics').Diagnostic;
    HTML_TRANSFORMER_ERROR: () => import('@scary/diagnostics').Diagnostic;
    INVALID_ID: (received: any) => import('@scary/diagnostics').Diagnostic;
    INVALID_SOURCE: (received: any) => import('@scary/diagnostics').Diagnostic;
    JS_TRANSFORMER_ERROR: () => import('@scary/diagnostics').Diagnostic;
    NO_AVAILABLE_TRANSFORMER: (filename: string) => import('@scary/diagnostics').Diagnostic;
};
