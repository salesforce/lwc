import { Level } from "../../shared/types";

// compiler/options.js
export const CompilerValidationErrors = {
    INVALID_ALLOWDEFINITION_PROPERTY: {
        code: 0,
        message: "Expected a boolean for stylesheetConfig.customProperties.allowDefinition, received \"{0}\".",
        type: "TypeError",
        level: Level.Error,
        url: ""
    },

    INVALID_COMPAT_PROPERTY: {
        code: 0,
        message: "Expected a boolean for outputConfig.compat, received \"{0}\".",
        type: "TypeError",
        level: Level.Error,
        url: ""
    },

    INVALID_ENV_ENTRY_VALUE: {
        code: 0,
        message: "Expected a string for outputConfig.env[\"{0}\"], received \"{1}\".",
        type: "TypeError",
        level: Level.Error,
        url: ""
    },

    INVALID_ENV_PROPERTY: {
        code: 0,
        message: "Expected an object for outputConfig.env, received \"{0}\".",
        type: "TypeError",
        level: Level.Error,
        url: ""
    },

    INVALID_FILES_PROPERTY: {
        code: 0,
        message: "Expected an object with files to be compiled.",
        type: "TypeError",
        level: Level.Error,
        url: ""
    },

    INVALID_MINIFY_PROPERTY: {
        code: 0,
        message: "Expected a boolean for outputConfig.minify, received \"{0}\".",
        type: "TypeError",
        level: Level.Error,
        url: ""
    },

    INVALID_NAME_PROPERTY: {
        code: 0,
        message: "Expected a string for name, received \"{0}\".",
        type: "TypeError",
        level: Level.Error,
        url: ""
    },

    INVALID_NAMESPACE_PROPERTY: {
        code: 0,
        message: "Expected a string for namespace, received \"{0}\".",
        type: "TypeError",
        level: Level.Error,
        url: ""
    },

    INVALID_RESOLUTION_PROPERTY: {
        code: 0,
        message: "Expected an object for stylesheetConfig.customProperties.resolution, received \"{0}\".",
        type: "TypeError",
        level: Level.Error,
        url: ""
    },

    INVALID_SOURCEMAP_PROPERTY: {
        code: 0,
        message: "Expected a boolean value for outputConfig.sourcemap, received \"{0}\".",
        type: "TypeError",
        level: Level.Error,
        url: ""
    },

    INVALID_TYPE_PROPERTY: {
        code: 0,
        message: "Expected either \"native\" or \"module\" for stylesheetConfig.customProperties.resolution.type, received \"{0}\".",
        type: "TypeError",
        level: Level.Error,
        url: ""
    },

    MISSING_OPTIONS_OBJECT: {
        code: 0,
        message: "Expected options object, received \"{0}\".",
        type: "TypeError",
        level: Level.Error,
        url: ""
    },

    UNEXPECTED_FILE_CONTENT: {
        code: 0,
        message: "Unexpected file content for \"{0}\". Expected a string, received \"{1}\".",
        type: "TypeError",
        level: Level.Error,
        url: ""
    },

    UNKNOWN_ENV_ENTRY_KEY: {
        code: 0,
        message: "Unknown entry \"{0}\" in outputConfig.env.",
        type: "TypeError",
        level: Level.Error,
        url: ""
    },
};

export const ModuleResolutionErrors = {
    IMPORTEE_RESOLUTION_FAILED: {
        code: 0,
        message: "Failed to resolve entry for module {0}",
        type: "compiler_error_1.CompilerError",
        level: Level.Error,
        url: ""
    },

    IMPORTEE_RESOLUTION_FROM_IMPORTER_FAILED: {
        code: 0,
        message: "{0} failed to be resolved from {1}",
        type: "compiler_error_1.CompilerError",
        level: Level.Error,
        url: ""
    },

    // rollup-plugins/module-resolver.js
    NONEXISTENT_FILE: {
        code: 0,
        message: "No such file {0}",
        type: "Error",
        level: Level.Error,
        url: ""
    },
};

export const TransformerErrors = {
// transformers/template.js
    FATAL_TRANSFORMER_ERROR: {
        code: 0,
        message: "{0}: {1}",
        type: "compiler_error_1.CompilerError",
        level: Level.Error,
        url: ""
    },
    INVALID_ID: {
        code: 0,
        message: "Expect a string for id. Received {0}",
        type: "Error",
        level: Level.Error,
        url: ""
    },

    // transformers/transformer.js
    INVALID_SOURCE: {
        code: 0,
        message: "Expect a string for source. Received {0}",
        type: "Error",
        level: Level.Error,
        url: ""
    },

    NO_AVAILABLE_TRANSFORMER: {
        code: 0,
        message: "No available transformer for \"{0}\"",
        type: "TypeError",
        level: Level.Error,
        url: ""
    }
};
