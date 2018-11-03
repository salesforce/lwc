import { DiagnosticLevel } from "../../shared/types";

export const GENERIC_COMPILER_ERROR = {
    code: 1001,
    message: "Unexpected compilation error: {0}",
    level: DiagnosticLevel.Error
};

export const CompilerValidationErrors = {
    INVALID_ALLOWDEFINITION_PROPERTY: {
        code: 1001,
        message: "Expected a boolean for stylesheetConfig.customProperties.allowDefinition, received \"{0}\".",
        type: "TypeError",
        level: DiagnosticLevel.Error,
        url: ""
    },

    INVALID_COMPAT_PROPERTY: {
        code: 1001,
        message: "Expected a boolean for outputConfig.compat, received \"{0}\".",
        type: "TypeError",
        level: DiagnosticLevel.Error,
        url: ""
    },

    INVALID_ENV_ENTRY_VALUE: {
        code: 1001,
        message: "Expected a string for outputConfig.env[\"{0}\"], received \"{1}\".",
        type: "TypeError",
        level: DiagnosticLevel.Error,
        url: ""
    },

    INVALID_ENV_PROPERTY: {
        code: 1001,
        message: "Expected an object for outputConfig.env, received \"{0}\".",
        type: "TypeError",
        level: DiagnosticLevel.Error,
        url: ""
    },

    INVALID_FILES_PROPERTY: {
        code: 1001,
        message: "Expected an object with files to be compiled.",
        type: "TypeError",
        level: DiagnosticLevel.Error,
        url: ""
    },

    INVALID_MINIFY_PROPERTY: {
        code: 1001,
        message: "Expected a boolean for outputConfig.minify, received \"{0}\".",
        type: "TypeError",
        level: DiagnosticLevel.Error,
        url: ""
    },

    INVALID_NAME_PROPERTY: {
        code: 1001,
        message: "Expected a string for name, received \"{0}\".",
        type: "TypeError",
        level: DiagnosticLevel.Error,
        url: ""
    },

    INVALID_NAMESPACE_PROPERTY: {
        code: 1001,
        message: "Expected a string for namespace, received \"{0}\".",
        type: "TypeError",
        level: DiagnosticLevel.Error,
        url: ""
    },

    INVALID_RESOLUTION_PROPERTY: {
        code: 1001,
        message: "Expected an object for stylesheetConfig.customProperties.resolution, received \"{0}\".",
        type: "TypeError",
        level: DiagnosticLevel.Error,
        url: ""
    },

    INVALID_SOURCEMAP_PROPERTY: {
        code: 1001,
        message: "Expected a boolean value for outputConfig.sourcemap, received \"{0}\".",
        type: "TypeError",
        level: DiagnosticLevel.Error,
        url: ""
    },

    INVALID_TYPE_PROPERTY: {
        code: 1001,
        message: "Expected either \"native\" or \"module\" for stylesheetConfig.customProperties.resolution.type, received \"{0}\".",
        type: "TypeError",
        level: DiagnosticLevel.Error,
        url: ""
    },

    MISSING_OPTIONS_OBJECT: {
        code: 1001,
        message: "Expected options object, received \"{0}\".",
        type: "TypeError",
        level: DiagnosticLevel.Error,
        url: ""
    },

    UNEXPECTED_FILE_CONTENT: {
        code: 1001,
        message: "Unexpected file content for \"{0}\". Expected a string, received \"{1}\".",
        type: "TypeError",
        level: DiagnosticLevel.Error,
        url: ""
    },

    UNKNOWN_ENV_ENTRY_KEY: {
        code: 1001,
        message: "Unknown entry \"{0}\" in outputConfig.env.",
        type: "TypeError",
        level: DiagnosticLevel.Error,
        url: ""
    },
};

export const ModuleResolutionErrors = {
    MODULE_RESOLUTION_ERROR: {
        code: 1001,
        message: "Error in module resolution: {0}",
        level: DiagnosticLevel.Warning,
        url: ""
    },

    IMPORTEE_RESOLUTION_FAILED: {
        code: 1001,
        message: "Failed to resolve entry for module {0}",
        level: DiagnosticLevel.Error,
        url: ""
    },

    IMPORTEE_RESOLUTION_FROM_IMPORTER_FAILED: {
        code: 1001,
        message: "{0} failed to be resolved from {1}",
        level: DiagnosticLevel.Error,
        url: ""
    },

    NONEXISTENT_FILE: {
        code: 1001,
        message: "No such file {0}",
        level: DiagnosticLevel.Error,
        url: ""
    },
};

export const TransformerErrors = {
    CSS_TRANSFORMER_ERROR: {
        code: 1001,
        message: "{0}",
        level: DiagnosticLevel.Error,
        url: ""
    },
    CSS_IN_HTML_ERROR: {
        code: 1001,
        message: "An error ocurred parsing inline CSS",
        level: DiagnosticLevel.Error,
        url: ""
    },

    HTML_TRANSFORMER_ERROR: {
        code: 1001,
        message: "{0}",
        level: DiagnosticLevel.Error,
        url: ""
    },

    INVALID_ID: {
        code: 1001,
        message: "Expect a string for id. Received {0}",
        level: DiagnosticLevel.Error,
        url: ""
    },

    INVALID_SOURCE: {
        code: 1001,
        message: "Expect a string for source. Received {0}",
        level: DiagnosticLevel.Error,
        url: ""
    },

    JS_TRANSFORMER_ERROR: {
        code: 1001,
        message: "{0}",
        level: DiagnosticLevel.Error,
        url: ""
    },

    NO_AVAILABLE_TRANSFORMER: {
        code: 1001,
        message: "No available transformer for \"{0}\"",
        type: "TypeError",
        level: DiagnosticLevel.Error,
        url: ""
    }
};
