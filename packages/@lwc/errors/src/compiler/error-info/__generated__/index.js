import { DiagnosticSeverity, Diagnostic } from '@scary/diagnostics';

/**
 * TODO [W-5678919]: implement script to determine the next available error code
 * In the meantime, reference and the update the value at src/compiler/error-info/index.ts
 */

var GENERIC_COMPILER_ERROR = {
    code: 1001,
    message: 'Unexpected compilation error: {0}',
    severity: DiagnosticSeverity.Error,
};
var CompilerValidationErrors = {
    INVALID_ALLOWDEFINITION_PROPERTY: function (received) {
        return new Diagnostic(
            arguments,
            'compiler-validation',
            'INVALID_ALLOWDEFINITION_PROPERTY',
            {
                code: 1012,
                message:
                    'Expected a boolean for stylesheetConfig.customProperties.allowDefinition, received "' +
                    received +
                    '".',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1012,
                documentationURL: null,
            }
        );
    },
    INVALID_COMPAT_PROPERTY: function (received) {
        return new Diagnostic(
            arguments,
            'compiler-validation',
            'INVALID_COMPAT_PROPERTY',
            {
                code: 1013,
                message: 'Expected a boolean for outputConfig.compat, received "' + received + '".',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1013,
                documentationURL: null,
            }
        );
    },
    INVALID_ENV_ENTRY_VALUE: function (key, value) {
        return new Diagnostic(
            arguments,
            'compiler-validation',
            'INVALID_ENV_ENTRY_VALUE',
            {
                code: 1014,
                message:
                    'Expected a string for outputConfig.env["' +
                    key +
                    '"], received "' +
                    value +
                    '".',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1014,
                documentationURL: null,
            }
        );
    },
    INVALID_ENV_PROPERTY: function (received) {
        return new Diagnostic(
            arguments,
            'compiler-validation',
            'INVALID_ENV_PROPERTY',
            {
                code: 1015,
                message: 'Expected an object for outputConfig.env, received "' + received + '".',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1015,
                documentationURL: null,
            }
        );
    },
    INVALID_FILES_PROPERTY: function () {
        return new Diagnostic(
            arguments,
            'compiler-validation',
            'INVALID_FILES_PROPERTY',
            {
                code: 1016,
                message: 'Expected an object with files to be compiled.',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1016,
                documentationURL: null,
            }
        );
    },
    INVALID_MINIFY_PROPERTY: function (received) {
        return new Diagnostic(
            arguments,
            'compiler-validation',
            'INVALID_MINIFY_PROPERTY',
            {
                code: 1017,
                message: 'Expected a boolean for outputConfig.minify, received "' + received + '".',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1017,
                documentationURL: null,
            }
        );
    },
    INVALID_NAME_PROPERTY: function (name) {
        return new Diagnostic(
            arguments,
            'compiler-validation',
            'INVALID_NAME_PROPERTY',
            {
                code: 1018,
                message: 'Expected a string for name, received "' + name + '".',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1018,
                documentationURL: null,
            }
        );
    },
    INVALID_NAMESPACE_PROPERTY: function (namespace) {
        return new Diagnostic(
            arguments,
            'compiler-validation',
            'INVALID_NAMESPACE_PROPERTY',
            {
                code: 1019,
                message: 'Expected a string for namespace, received "' + namespace + '".',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1019,
                documentationURL: null,
            }
        );
    },
    INVALID_RESOLUTION_PROPERTY: function (received) {
        return new Diagnostic(
            arguments,
            'compiler-validation',
            'INVALID_RESOLUTION_PROPERTY',
            {
                code: 1020,
                message:
                    'Expected an object for stylesheetConfig.customProperties.resolution, received "' +
                    received +
                    '".',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1020,
                documentationURL: null,
            }
        );
    },
    INVALID_SOURCEMAP_PROPERTY: function (recevied) {
        return new Diagnostic(
            arguments,
            'compiler-validation',
            'INVALID_SOURCEMAP_PROPERTY',
            {
                code: 1021,
                message:
                    'Expected a boolean value for outputConfig.sourcemap, received "' +
                    recevied +
                    '".',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1021,
                documentationURL: null,
            }
        );
    },
    INVALID_TYPE_PROPERTY: function (received) {
        return new Diagnostic(
            arguments,
            'compiler-validation',
            'INVALID_TYPE_PROPERTY',
            {
                code: 1022,
                message:
                    'Expected either "native" or "module" for stylesheetConfig.customProperties.resolution.type, received "' +
                    received +
                    '".',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1022,
                documentationURL: null,
            }
        );
    },
    MISSING_OPTIONS_OBJECT: function (received) {
        return new Diagnostic(
            arguments,
            'compiler-validation',
            'MISSING_OPTIONS_OBJECT',
            {
                code: 1023,
                message: 'Expected options object, received "' + received + '".',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1023,
                documentationURL: null,
            }
        );
    },
    UNEXPECTED_FILE_CONTENT: function (key, value) {
        return new Diagnostic(
            arguments,
            'compiler-validation',
            'UNEXPECTED_FILE_CONTENT',
            {
                code: 1024,
                message:
                    'Unexpected file content for "' +
                    key +
                    '". Expected a string, received "' +
                    value +
                    '".',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1024,
                documentationURL: null,
            }
        );
    },
    UNKNOWN_ENV_ENTRY_KEY: function (received) {
        return new Diagnostic(
            arguments,
            'compiler-validation',
            'UNKNOWN_ENV_ENTRY_KEY',
            {
                code: 1025,
                message: 'Unknown entry "' + received + '" in outputConfig.env.',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1025,
                documentationURL: null,
            }
        );
    },
};
var ModuleResolutionErrors = {
    MODULE_RESOLUTION_ERROR: function (message) {
        return new Diagnostic(
            arguments,
            'module-resolution',
            'MODULE_RESOLUTION_ERROR',
            {
                code: 1002,
                message: 'Error in module resolution: ' + message,
                severity: DiagnosticSeverity.Warning,
                url: '',
            },
            {
                code: 1002,
                documentationURL: null,
            }
        );
    },
    IMPORTEE_RESOLUTION_FAILED: function (importee) {
        return new Diagnostic(
            arguments,
            'module-resolution',
            'IMPORTEE_RESOLUTION_FAILED',
            {
                code: 1010,
                message: 'Failed to resolve entry for module "' + importee + '".',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1010,
                documentationURL: null,
            }
        );
    },
    IMPORTEE_RESOLUTION_FROM_IMPORTER_FAILED: function (importName, fromName, path) {
        return new Diagnostic(
            arguments,
            'module-resolution',
            'IMPORTEE_RESOLUTION_FROM_IMPORTER_FAILED',
            {
                code: 1011,
                message:
                    'Failed to resolve import "' +
                    importName +
                    '" from "' +
                    fromName +
                    '". Please add "' +
                    path +
                    '" file to the component folder.',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1011,
                documentationURL: null,
            }
        );
    },
    NONEXISTENT_FILE: function (filename) {
        return new Diagnostic(
            arguments,
            'module-resolution',
            'NONEXISTENT_FILE',
            {
                code: 1004,
                message: 'No such file ' + filename + "'",
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1004,
                documentationURL: null,
            }
        );
    },
    FOLDER_NAME_STARTS_WITH_CAPITAL_LETTER: function (badName, suggestion) {
        return new Diagnostic(
            arguments,
            'module-resolution',
            'FOLDER_NAME_STARTS_WITH_CAPITAL_LETTER',
            {
                code: 1116,
                message:
                    'Illegal folder name "' +
                    badName +
                    '". The folder name must start with a lowercase character: "' +
                    suggestion +
                    '".',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1116,
                documentationURL: null,
            }
        );
    },
    FOLDER_AND_FILE_NAME_CASE_MISMATCH: function (importName, foldername) {
        return new Diagnostic(
            arguments,
            'module-resolution',
            'FOLDER_AND_FILE_NAME_CASE_MISMATCH',
            {
                code: 1117,
                message:
                    'Failed to resolve "' +
                    importName +
                    '". The file name must case match the component folder name "' +
                    foldername +
                    '".',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1117,
                documentationURL: null,
            }
        );
    },
    IMPORT_AND_FILE_NAME_CASE_MISMATCH: function (importName, fromName, suggestion) {
        return new Diagnostic(
            arguments,
            'module-resolution',
            'IMPORT_AND_FILE_NAME_CASE_MISMATCH',
            {
                code: 1118,
                message:
                    'Failed to resolve "' +
                    importName +
                    '" from "' +
                    fromName +
                    '". Did you mean "' +
                    suggestion +
                    '"?',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1118,
                documentationURL: null,
            }
        );
    },
    RELATIVE_DYNAMIC_IMPORT: function () {
        return new Diagnostic(
            arguments,
            'module-resolution',
            'RELATIVE_DYNAMIC_IMPORT',
            {
                code: 1120,
                message: 'Illegal usage of the dynamic import syntax with a relative path.',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1120,
                documentationURL: null,
            }
        );
    },
};
var TransformerErrors = {
    CSS_TRANSFORMER_ERROR: function () {
        return new Diagnostic(
            arguments,
            'transform-errors',
            'CSS_TRANSFORMER_ERROR',
            {
                code: 1009,
                message: '{0}',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1009,
                documentationURL: null,
            }
        );
    },
    CSS_IN_HTML_ERROR: function () {
        return new Diagnostic(
            arguments,
            'transform-errors',
            'CSS_IN_HTML_ERROR',
            {
                code: 1026,
                message: 'An error occurred parsing inline CSS. {0}',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1026,
                documentationURL: null,
            }
        );
    },
    HTML_TRANSFORMER_ERROR: function () {
        return new Diagnostic(
            arguments,
            'transform-errors',
            'HTML_TRANSFORMER_ERROR',
            {
                code: 1008,
                message: '{0}',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1008,
                documentationURL: null,
            }
        );
    },
    INVALID_ID: function (received) {
        return new Diagnostic(
            arguments,
            'transform-errors',
            'INVALID_ID',
            {
                code: 1027,
                message: 'Expect a string for id. Received ' + received,
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1027,
                documentationURL: null,
            }
        );
    },
    INVALID_SOURCE: function (received) {
        return new Diagnostic(
            arguments,
            'transform-errors',
            'INVALID_SOURCE',
            {
                code: 1006,
                message: 'Expect a string for source. Received ' + received,
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1006,
                documentationURL: null,
            }
        );
    },
    JS_TRANSFORMER_ERROR: function () {
        return new Diagnostic(
            arguments,
            'transform-errors',
            'JS_TRANSFORMER_ERROR',
            {
                code: 1007,
                message: '{0}',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1007,
                documentationURL: null,
            }
        );
    },
    NO_AVAILABLE_TRANSFORMER: function (filename) {
        return new Diagnostic(
            arguments,
            'transform-errors',
            'NO_AVAILABLE_TRANSFORMER',
            {
                code: 1005,
                message: 'No available transformer for "' + filename + '"',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1005,
                documentationURL: null,
            }
        );
    },
};

/**
 * TODO [W-5678919]: implement script to determine the next available error code
 * In the meantime, reference and the update the value at src/compiler/error-info/index.ts
 */

var LWCClassErrors = {
    INVALID_DYNAMIC_IMPORT_SOURCE_STRICT: function (path) {
        return new Diagnostic(
            arguments,
            'lwc-class',
            'INVALID_DYNAMIC_IMPORT_SOURCE_STRICT',
            {
                code: 1121,
                message:
                    'Invalid import. The argument "' +
                    path +
                    '" must be a stringLiteral for dynamic imports when strict mode is enabled.',
                url: '',
            },
            {
                code: 1121,
                documentationURL: null,
            }
        );
    },
    INVALID_IMPORT_MISSING_DEFAULT_EXPORT: function (importName) {
        return new Diagnostic(
            arguments,
            'lwc-class',
            'INVALID_IMPORT_MISSING_DEFAULT_EXPORT',
            {
                code: 1089,
                message: 'Invalid import. "' + importName + '" doesn\'t have default export.',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1089,
                documentationURL: null,
            }
        );
    },
    INVALID_IMPORT_NAMESPACE_IMPORTS_NOT_ALLOWED: function (base, importName, importFrom) {
        return new Diagnostic(
            arguments,
            'lwc-class',
            'INVALID_IMPORT_NAMESPACE_IMPORTS_NOT_ALLOWED',
            {
                code: 1090,
                message:
                    'Invalid import. Namespace imports are not allowed on "' +
                    base +
                    '", instead use named imports "import { ' +
                    importName +
                    " } from '" +
                    importFrom +
                    '\'".',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1090,
                documentationURL: null,
            }
        );
    },
    INVALID_IMPORT_PROHIBITED_API: function (name) {
        return new Diagnostic(
            arguments,
            'lwc-class',
            'INVALID_IMPORT_PROHIBITED_API',
            {
                code: 1091,
                message: 'Invalid import. "' + name + '" is not part of the lwc api.',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1091,
                documentationURL: null,
            }
        );
    },
};
var DecoratorErrors = {
    ADAPTER_SHOULD_BE_FIRST_PARAMETER: function () {
        return new Diagnostic(
            arguments,
            'decorators',
            'ADAPTER_SHOULD_BE_FIRST_PARAMETER',
            {
                code: 1092,
                message:
                    '@wire expects an adapter as first parameter. @wire(adapter: WireAdapter, config?: any).',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1092,
                documentationURL: null,
            }
        );
    },
    API_AND_TRACK_DECORATOR_CONFLICT: function () {
        return new Diagnostic(
            arguments,
            'decorators',
            'API_AND_TRACK_DECORATOR_CONFLICT',
            {
                code: 1093,
                message: '@api method or property cannot be used with @track',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1093,
                documentationURL: null,
            }
        );
    },
    CONFIG_OBJECT_SHOULD_BE_SECOND_PARAMETER: function () {
        return new Diagnostic(
            arguments,
            'decorators',
            'CONFIG_OBJECT_SHOULD_BE_SECOND_PARAMETER',
            {
                code: 1094,
                message: '@wire expects a configuration object expression as second parameter.',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1094,
                documentationURL: null,
            }
        );
    },
    CONFLICT_WITH_ANOTHER_DECORATOR: function (name) {
        return new Diagnostic(
            arguments,
            'decorators',
            'CONFLICT_WITH_ANOTHER_DECORATOR',
            {
                code: 1095,
                message: '@wire method or property cannot be used with @' + name,
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1095,
                documentationURL: null,
            }
        );
    },
    DUPLICATE_API_PROPERTY: function (propertyName) {
        return new Diagnostic(
            arguments,
            'decorators',
            'DUPLICATE_API_PROPERTY',
            {
                code: 1096,
                message: 'Duplicate @api property "' + propertyName + '".',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1096,
                documentationURL: null,
            }
        );
    },
    FUNCTION_IDENTIFIER_SHOULD_BE_FIRST_PARAMETER: function () {
        return new Diagnostic(
            arguments,
            'decorators',
            'FUNCTION_IDENTIFIER_SHOULD_BE_FIRST_PARAMETER',
            {
                code: 1097,
                message: '@wire expects a function identifier as first parameter.',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1097,
                documentationURL: null,
            }
        );
    },
    IMPORTED_FUNCTION_IDENTIFIER_SHOULD_BE_FIRST_PARAMETER: function () {
        return new Diagnostic(
            arguments,
            'decorators',
            'IMPORTED_FUNCTION_IDENTIFIER_SHOULD_BE_FIRST_PARAMETER',
            {
                code: 1098,
                message: '@wire expects a function identifier to be imported as first parameter.',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1098,
                documentationURL: null,
            }
        );
    },
    INVALID_BOOLEAN_PUBLIC_PROPERTY: function () {
        return new Diagnostic(
            arguments,
            'decorators',
            'INVALID_BOOLEAN_PUBLIC_PROPERTY',
            {
                code: 1099,
                message: 'Boolean public property must default to false.',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1099,
                documentationURL: null,
            }
        );
    },
    INVALID_DECORATOR: function (decorator, fromName) {
        return new Diagnostic(
            arguments,
            'decorators',
            'INVALID_DECORATOR',
            {
                code: 1100,
                message:
                    'Invalid decorator usage. Supported decorators (' +
                    decorator +
                    ') should be imported from "' +
                    fromName +
                    '"',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1100,
                documentationURL: null,
            }
        );
    },
    INVALID_DECORATOR_TYPE: function () {
        return new Diagnostic(
            arguments,
            'decorators',
            'INVALID_DECORATOR_TYPE',
            {
                code: 1101,
                message: 'Invalid property of field type',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1101,
                documentationURL: null,
            }
        );
    },
    INVALID_DECORATOR_WITH_NAME: function (badDecorator, supported, fromName) {
        return new Diagnostic(
            arguments,
            'decorators',
            'INVALID_DECORATOR_WITH_NAME',
            {
                code: 1102,
                message:
                    'Invalid "' +
                    badDecorator +
                    '" decorator usage. Supported decorators (' +
                    supported +
                    ') should be imported from "' +
                    fromName +
                    '"',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1102,
                documentationURL: null,
            }
        );
    },
    IS_NOT_CLASS_PROPERTY_OR_CLASS_METHOD: function (name) {
        return new Diagnostic(
            arguments,
            'decorators',
            'IS_NOT_CLASS_PROPERTY_OR_CLASS_METHOD',
            {
                code: 1103,
                message: '"@' + name + '" can only be applied on class properties',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1103,
                documentationURL: null,
            }
        );
    },
    IS_NOT_DECORATOR: function (name) {
        return new Diagnostic(
            arguments,
            'decorators',
            'IS_NOT_DECORATOR',
            {
                code: 1104,
                message: '"' + name + '" can only be used as a class decorator',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1104,
                documentationURL: null,
            }
        );
    },
    ONE_WIRE_DECORATOR_ALLOWED: function () {
        return new Diagnostic(
            arguments,
            'decorators',
            'ONE_WIRE_DECORATOR_ALLOWED',
            {
                code: 1105,
                message: 'Method or property can only have 1 @wire decorator',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1105,
                documentationURL: null,
            }
        );
    },
    PROPERTY_CANNOT_BE_COMPUTED: function () {
        return new Diagnostic(
            arguments,
            'decorators',
            'PROPERTY_CANNOT_BE_COMPUTED',
            {
                code: 1106,
                message: '@api cannot be applied to a computed property, getter, setter or method.',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1106,
                documentationURL: null,
            }
        );
    },
    PROPERTY_NAME_CANNOT_START_WITH_DATA: function (name) {
        return new Diagnostic(
            arguments,
            'decorators',
            'PROPERTY_NAME_CANNOT_START_WITH_DATA',
            {
                code: 1107,
                message:
                    'Invalid property name "' +
                    name +
                    '". Properties starting with "data" are reserved attributes.',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1107,
                documentationURL: null,
            }
        );
    },
    PROPERTY_NAME_CANNOT_START_WITH_ON: function (name) {
        return new Diagnostic(
            arguments,
            'decorators',
            'PROPERTY_NAME_CANNOT_START_WITH_ON',
            {
                code: 1108,
                message:
                    'Invalid property name "' +
                    name +
                    '". Properties starting with "on" are reserved for event handlers.',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1108,
                documentationURL: null,
            }
        );
    },
    PROPERTY_NAME_IS_AMBIGUOUS: function (name, camelCaseName) {
        return new Diagnostic(
            arguments,
            'decorators',
            'PROPERTY_NAME_IS_AMBIGUOUS',
            {
                code: 1109,
                message:
                    'Ambiguous attribute name "' +
                    name +
                    '". "' +
                    name +
                    '" will never be called from template because its corresponding property is camel cased. Consider renaming to "' +
                    camelCaseName +
                    '".',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1109,
                documentationURL: null,
            }
        );
    },
    PROPERTY_NAME_IS_RESERVED: function (name) {
        return new Diagnostic(
            arguments,
            'decorators',
            'PROPERTY_NAME_IS_RESERVED',
            {
                code: 1110,
                message:
                    'Invalid property name "' + name + '". "' + name + '" is a reserved attribute.',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1110,
                documentationURL: null,
            }
        );
    },
    PROPERTY_NAME_PART_IS_RESERVED: function (name) {
        return new Diagnostic(
            arguments,
            'decorators',
            'PROPERTY_NAME_PART_IS_RESERVED',
            {
                code: 1111,
                message:
                    'Invalid property name "' +
                    name +
                    '". "part" is a future reserved attribute for web components.',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1111,
                documentationURL: null,
            }
        );
    },
    SINGLE_DECORATOR_ON_SETTER_GETTER_PAIR: function (name) {
        return new Diagnostic(
            arguments,
            'decorators',
            'SINGLE_DECORATOR_ON_SETTER_GETTER_PAIR',
            {
                code: 1112,
                message:
                    '@api get ' +
                    name +
                    ' and @api set ' +
                    name +
                    ' detected in class declaration. Only one of the two needs to be decorated with @api.',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1112,
                documentationURL: null,
            }
        );
    },
    TRACK_ONLY_ALLOWED_ON_CLASS_PROPERTIES: function () {
        return new Diagnostic(
            arguments,
            'decorators',
            'TRACK_ONLY_ALLOWED_ON_CLASS_PROPERTIES',
            {
                code: 1113,
                message: '@track decorator can only be applied to class properties.',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1113,
                documentationURL: null,
            }
        );
    },
    WIRE_ADAPTER_SHOULD_BE_IMPORTED: function (name) {
        return new Diagnostic(
            arguments,
            'decorators',
            'WIRE_ADAPTER_SHOULD_BE_IMPORTED',
            {
                code: 1119,
                message: 'Failed to resolve @wire adapter "' + name + '". Ensure it is imported.',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1119,
                documentationURL: null,
            }
        );
    },
    FUNCTION_IDENTIFIER_CANNOT_HAVE_COMPUTED_PROPS: function () {
        return new Diagnostic(
            arguments,
            'decorators',
            'FUNCTION_IDENTIFIER_CANNOT_HAVE_COMPUTED_PROPS',
            {
                code: 1131,
                message: '@wire identifier cannot contain computed properties',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1131,
                documentationURL: null,
            }
        );
    },
    FUNCTION_IDENTIFIER_CANNOT_HAVE_NESTED_MEMBER_EXRESSIONS: function () {
        return new Diagnostic(
            arguments,
            'decorators',
            'FUNCTION_IDENTIFIER_CANNOT_HAVE_NESTED_MEMBER_EXRESSIONS',
            {
                code: 1132,
                message: '@wire identifier cannot contain nested member expressions',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1132,
                documentationURL: null,
            }
        );
    },
};

/**
 * TODO [W-5678919]: implement script to determine the next available error code
 * In the meantime, reference and the update the value at src/compiler/error-info/index.ts
 */

var TemplateErrors = {
    INVALID_TEMPLATE: function () {
        return new Diagnostic(
            arguments,
            'template-errors',
            'INVALID_TEMPLATE',
            {
                code: 1003,
                message: 'Invalid template',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1003,
                documentationURL: null,
            }
        );
    },
    OPTIONS_MUST_BE_OBJECT: function () {
        return new Diagnostic(
            arguments,
            'template-errors',
            'OPTIONS_MUST_BE_OBJECT',
            {
                code: 1028,
                message: 'Compiler options must be an object',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1028,
                documentationURL: null,
            }
        );
    },
    UNKNOWN_IF_MODIFIER: function (modifier) {
        return new Diagnostic(
            arguments,
            'template-errors',
            'UNKNOWN_IF_MODIFIER',
            {
                code: 1029,
                message: 'Unknown if modifier ' + modifier,
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1029,
                documentationURL: null,
            }
        );
    },
    UNKNOWN_OPTION_PROPERTY: function (property) {
        return new Diagnostic(
            arguments,
            'template-errors',
            'UNKNOWN_OPTION_PROPERTY',
            {
                code: 1030,
                message: 'Unknown option property ' + property,
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1030,
                documentationURL: null,
            }
        );
    },
};
var ParserDiagnostics = {
    AMBIGUOUS_ATTRIBUTE_VALUE: function (raw, unquoted, escaped) {
        return new Diagnostic(
            arguments,
            'parser',
            'AMBIGUOUS_ATTRIBUTE_VALUE',
            {
                code: 1034,
                message:
                    'Ambiguous attribute value ' +
                    raw +
                    '. ' +
                    ('If you want to make it a valid identifier you should remove the surrounding quotes ' +
                        unquoted +
                        '. ') +
                    ('If you want to make it a string you should escape it ' + escaped + '.'),
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1034,
                documentationURL: null,
            }
        );
    },
    AMBIGUOUS_ATTRIBUTE_VALUE_STRING: function (raw, escaped) {
        return new Diagnostic(
            arguments,
            'parser',
            'AMBIGUOUS_ATTRIBUTE_VALUE_STRING',
            {
                code: 1035,
                message:
                    'Ambiguous attribute value ' +
                    raw +
                    '. If you want to make it a string you should escape it ' +
                    escaped,
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1035,
                documentationURL: null,
            }
        );
    },
    BOOLEAN_ATTRIBUTE_FALSE: function (tag, name, value) {
        return new Diagnostic(
            arguments,
            'parser',
            'BOOLEAN_ATTRIBUTE_FALSE',
            {
                code: 1036,
                message:
                    'To not set a boolean attribute, try <' +
                    tag +
                    '> instead of <' +
                    tag +
                    ' ' +
                    name +
                    '="' +
                    value +
                    '">. ' +
                    'To represent a false value, the attribute has to be omitted altogether.',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1036,
                documentationURL: null,
            }
        );
    },
    BOOLEAN_ATTRIBUTE_TRUE: function (tag, name, value) {
        return new Diagnostic(
            arguments,
            'parser',
            'BOOLEAN_ATTRIBUTE_TRUE',
            {
                code: 1037,
                message:
                    'To set a boolean attributes, try <' +
                    tag +
                    ' ' +
                    name +
                    '> instead of <' +
                    tag +
                    ' ' +
                    name +
                    '="' +
                    value +
                    '">. ' +
                    'If the attribute is present, its value must either be the empty string ' +
                    "or a value that is an ASCII case -insensitive match for the attribute's canonical name " +
                    'with no leading or trailing whitespace.',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1037,
                documentationURL: null,
            }
        );
    },
    COMPUTED_PROPERTY_ACCESS_NOT_ALLOWED: function () {
        return new Diagnostic(
            arguments,
            'parser',
            'COMPUTED_PROPERTY_ACCESS_NOT_ALLOWED',
            {
                code: 1038,
                message: "Template expression doesn't allow computed property access",
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1038,
                documentationURL: null,
            }
        );
    },
    DIRECTIVE_SHOULD_BE_EXPRESSION: function (name) {
        return new Diagnostic(
            arguments,
            'parser',
            'DIRECTIVE_SHOULD_BE_EXPRESSION',
            {
                code: 1039,
                message: name + ' directive is expected to be an expression',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1039,
                documentationURL: null,
            }
        );
    },
    INVALID_ID_ATTRIBUTE: function (value) {
        return new Diagnostic(
            arguments,
            'parser',
            'INVALID_ID_ATTRIBUTE',
            {
                code: 1040,
                message:
                    'Invalid id value "' + value + '". Id values must not contain any whitespace.',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1040,
                documentationURL: null,
            }
        );
    },
    INVALID_STATIC_ID_IN_ITERATION: function (value) {
        return new Diagnostic(
            arguments,
            'parser',
            'INVALID_STATIC_ID_IN_ITERATION',
            {
                code: 1041,
                message:
                    'Invalid id value "' +
                    value +
                    '". Static id values are not allowed in iterators. Id values must be unique within a template and must therefore be computed with an expression.',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1041,
                documentationURL: null,
            }
        );
    },
    DUPLICATE_ID_FOUND: function (id) {
        return new Diagnostic(
            arguments,
            'parser',
            'DUPLICATE_ID_FOUND',
            {
                code: 1042,
                message:
                    'Duplicate id value "' +
                    id +
                    '" detected. Id values must be unique within a template.',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1042,
                documentationURL: null,
            }
        );
    },
    EVENT_HANDLER_SHOULD_BE_EXPRESSION: function () {
        return new Diagnostic(
            arguments,
            'parser',
            'EVENT_HANDLER_SHOULD_BE_EXPRESSION',
            {
                code: 1043,
                message: 'Event handler should be an expression',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1043,
                documentationURL: null,
            }
        );
    },
    FOR_EACH_AND_FOR_ITEM_DIRECTIVES_SHOULD_BE_TOGETHER: function () {
        return new Diagnostic(
            arguments,
            'parser',
            'FOR_EACH_AND_FOR_ITEM_DIRECTIVES_SHOULD_BE_TOGETHER',
            {
                code: 1044,
                message: 'for:each and for:item directives should be associated together.',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1044,
                documentationURL: null,
            }
        );
    },
    FOR_EACH_DIRECTIVE_SHOULD_BE_EXPRESSION: function () {
        return new Diagnostic(
            arguments,
            'parser',
            'FOR_EACH_DIRECTIVE_SHOULD_BE_EXPRESSION',
            {
                code: 1045,
                message: 'for:each directive is expected to be a expression.',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1045,
                documentationURL: null,
            }
        );
    },
    FOR_INDEX_DIRECTIVE_SHOULD_BE_STRING: function () {
        return new Diagnostic(
            arguments,
            'parser',
            'FOR_INDEX_DIRECTIVE_SHOULD_BE_STRING',
            {
                code: 1046,
                message: 'for:index directive is expected to be a string.',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1046,
                documentationURL: null,
            }
        );
    },
    FOR_ITEM_DIRECTIVE_SHOULD_BE_STRING: function () {
        return new Diagnostic(
            arguments,
            'parser',
            'FOR_ITEM_DIRECTIVE_SHOULD_BE_STRING',
            {
                code: 1047,
                message: 'for:item directive is expected to be a string.',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1047,
                documentationURL: null,
            }
        );
    },
    FORBIDDEN_IFRAME_SRCDOC_ATTRIBUTE: function () {
        return new Diagnostic(
            arguments,
            'parser',
            'FORBIDDEN_IFRAME_SRCDOC_ATTRIBUTE',
            {
                code: 1048,
                message: 'srcdoc attribute is disallowed on <iframe> for security reasons',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1048,
                documentationURL: null,
            }
        );
    },
    FORBIDDEN_SVG_NAMESPACE_IN_TEMPLATE: function (tag) {
        return new Diagnostic(
            arguments,
            'parser',
            'FORBIDDEN_SVG_NAMESPACE_IN_TEMPLATE',
            {
                code: 1049,
                message:
                    "Forbidden svg namespace tag found in template: '<" +
                    tag +
                    ">' tag is not allowed within <svg>",
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1049,
                documentationURL: null,
            }
        );
    },
    FORBIDDEN_MATHML_NAMESPACE_IN_TEMPLATE: function (tag) {
        return new Diagnostic(
            arguments,
            'parser',
            'FORBIDDEN_MATHML_NAMESPACE_IN_TEMPLATE',
            {
                code: 1050,
                message:
                    "Forbidden MathML namespace tag found in template: '<" +
                    tag +
                    ">' tag is not allowed within <math>",
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1050,
                documentationURL: null,
            }
        );
    },
    FORBIDDEN_TAG_ON_TEMPLATE: function (tag) {
        return new Diagnostic(
            arguments,
            'parser',
            'FORBIDDEN_TAG_ON_TEMPLATE',
            {
                code: 1051,
                message: "Forbidden tag found in template: '<" + tag + ">' tag is not allowed.",
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1051,
                documentationURL: null,
            }
        );
    },
    GENERIC_PARSING_ERROR: function (err) {
        return new Diagnostic(
            arguments,
            'parser',
            'GENERIC_PARSING_ERROR',
            {
                code: 1052,
                message: 'Error parsing attribute: ' + err,
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1052,
                documentationURL: null,
            }
        );
    },
    IDENTIFIER_PARSING_ERROR: function () {
        return new Diagnostic(
            arguments,
            'parser',
            'IDENTIFIER_PARSING_ERROR',
            {
                code: 1053,
                message: 'Error parsing identifier',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1053,
                documentationURL: null,
            }
        );
    },
    IF_DIRECTIVE_SHOULD_BE_EXPRESSION: function () {
        return new Diagnostic(
            arguments,
            'parser',
            'IF_DIRECTIVE_SHOULD_BE_EXPRESSION',
            {
                code: 1054,
                message: 'If directive should be an expression',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1054,
                documentationURL: null,
            }
        );
    },
    INVALID_ATTRIBUTE_CASE: function (attribute, tag) {
        return new Diagnostic(
            arguments,
            'parser',
            'INVALID_ATTRIBUTE_CASE',
            {
                code: 1055,
                message:
                    attribute +
                    ' is not valid attribute for ' +
                    tag +
                    '. All attributes name should be all lowercase.',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1055,
                documentationURL: null,
            }
        );
    },
    INVALID_EVENT_NAME: function (name) {
        return new Diagnostic(
            arguments,
            'parser',
            'INVALID_EVENT_NAME',
            {
                code: 1056,
                message:
                    'Invalid event type "' +
                    name +
                    '". Event type must begin with a lower-case alphabetic character and contain only lower-case alphabetic characters, underscores, and numeric characters',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1056,
                documentationURL: null,
            }
        );
    },
    INVALID_HTML_ATTRIBUTE: function (name, tag) {
        return new Diagnostic(
            arguments,
            'parser',
            'INVALID_HTML_ATTRIBUTE',
            {
                code: 1057,
                message:
                    name +
                    ' is not valid attribute for ' +
                    tag +
                    '. For more information refer to https://developer.mozilla.org/en-US/docs/Web/HTML/Element/' +
                    tag,
                severity: DiagnosticSeverity.Warning,
                url: '',
            },
            {
                code: 1057,
                documentationURL: null,
            }
        );
    },
    INVALID_HTML_SYNTAX: function (code) {
        return new Diagnostic(
            arguments,
            'parser',
            'INVALID_HTML_SYNTAX',
            {
                code: 1058,
                message:
                    'Invalid HTML syntax: ' +
                    code +
                    '. For more information, ' +
                    ('please visit https://html.spec.whatwg.org/multipage/parsing.html#parse-error-' +
                        code),
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1058,
                documentationURL: null,
            }
        );
    },
    INVALID_IDENTIFIER: function (identifer) {
        return new Diagnostic(
            arguments,
            'parser',
            'INVALID_IDENTIFIER',
            {
                code: 1059,
                message: identifer + ' is not a valid identifier',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1059,
                documentationURL: null,
            }
        );
    },
    INVALID_NODE: function (type) {
        return new Diagnostic(
            arguments,
            'parser',
            'INVALID_NODE',
            {
                code: 1060,
                message: "Template expression doesn't allow " + type,
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1060,
                documentationURL: null,
            }
        );
    },
    INVALID_TABINDEX_ATTRIBUTE: function () {
        return new Diagnostic(
            arguments,
            'parser',
            'INVALID_TABINDEX_ATTRIBUTE',
            {
                code: 1061,
                message: 'The attribute "tabindex" can only be set to "0" or "-1".',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1061,
                documentationURL: null,
            }
        );
    },
    DEPRECATED_IS_ATTRIBUTE_CANNOT_BE_EXPRESSION: function () {
        return new Diagnostic(
            arguments,
            'parser',
            'DEPRECATED_IS_ATTRIBUTE_CANNOT_BE_EXPRESSION',
            {
                code: 1062,
                message: '"is" attribute value can\'t be an expression',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1062,
                documentationURL: null,
            }
        );
    },
    IS_ATTRIBUTE_NOT_SUPPORTED: function (tag) {
        return new Diagnostic(
            arguments,
            'parser',
            'IS_ATTRIBUTE_NOT_SUPPORTED',
            {
                code: 1063,
                message: '"is" attribute is disallowed on element <' + tag + '>',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1063,
                documentationURL: null,
            }
        );
    },
    KEY_ATTRIBUTE_SHOULD_BE_EXPRESSION: function () {
        return new Diagnostic(
            arguments,
            'parser',
            'KEY_ATTRIBUTE_SHOULD_BE_EXPRESSION',
            {
                code: 1064,
                message: 'Key attribute value should be an expression',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1064,
                documentationURL: null,
            }
        );
    },
    KEY_SHOULDNT_REFERENCE_FOR_EACH_INDEX: function (tag, name) {
        return new Diagnostic(
            arguments,
            'parser',
            'KEY_SHOULDNT_REFERENCE_FOR_EACH_INDEX',
            {
                code: 1065,
                message:
                    'Invalid key value for element <' +
                    tag +
                    '>. Key cannot reference for:each index ' +
                    name,
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1065,
                documentationURL: null,
            }
        );
    },
    KEY_SHOULDNT_REFERENCE_ITERATOR_INDEX: function (tag) {
        return new Diagnostic(
            arguments,
            'parser',
            'KEY_SHOULDNT_REFERENCE_ITERATOR_INDEX',
            {
                code: 1066,
                message:
                    'Invalid key value for element <' +
                    tag +
                    '>. Key cannot reference iterator index',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1066,
                documentationURL: null,
            }
        );
    },
    MISSING_KEY_IN_ITERATOR: function (tag) {
        return new Diagnostic(
            arguments,
            'parser',
            'MISSING_KEY_IN_ITERATOR',
            {
                code: 1071,
                message:
                    'Missing key for element <' +
                    tag +
                    '> inside of iterator. Elements within iterators must have a unique, computed key value.',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1071,
                documentationURL: null,
            }
        );
    },
    MISSING_ROOT_TEMPLATE_TAG: function () {
        return new Diagnostic(
            arguments,
            'parser',
            'MISSING_ROOT_TEMPLATE_TAG',
            {
                code: 1072,
                message: 'Missing root template tag',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1072,
                documentationURL: null,
            }
        );
    },
    MODIFYING_ITERATORS_NOT_ALLOWED: function () {
        return new Diagnostic(
            arguments,
            'parser',
            'MODIFYING_ITERATORS_NOT_ALLOWED',
            {
                code: 1073,
                message: "Template expression doesn't allow to modify iterators",
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1073,
                documentationURL: null,
            }
        );
    },
    MULTIPLE_EXPRESSIONS: function () {
        return new Diagnostic(
            arguments,
            'parser',
            'MULTIPLE_EXPRESSIONS',
            {
                code: 1074,
                message: 'Multiple expressions found',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1074,
                documentationURL: null,
            }
        );
    },
    MULTIPLE_ROOTS_FOUND: function () {
        return new Diagnostic(
            arguments,
            'parser',
            'MULTIPLE_ROOTS_FOUND',
            {
                code: 1075,
                message: 'Multiple roots found',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1075,
                documentationURL: null,
            }
        );
    },
    NAME_ON_SLOT_CANNOT_BE_EXPRESSION: function () {
        return new Diagnostic(
            arguments,
            'parser',
            'NAME_ON_SLOT_CANNOT_BE_EXPRESSION',
            {
                code: 1076,
                message: "Name attribute on slot tag can't be an expression.",
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1076,
                documentationURL: null,
            }
        );
    },
    NO_DIRECTIVE_FOUND_ON_TEMPLATE: function () {
        return new Diagnostic(
            arguments,
            'parser',
            'NO_DIRECTIVE_FOUND_ON_TEMPLATE',
            {
                code: 1077,
                message:
                    'Invalid template tag. A directive is expected to be associated with the template tag.',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1077,
                documentationURL: null,
            }
        );
    },
    NO_MATCHING_CLOSING_TAGS: function (tagName) {
        return new Diagnostic(
            arguments,
            'parser',
            'NO_MATCHING_CLOSING_TAGS',
            {
                code: 1078,
                message: '<' + tagName + '> has no matching closing tag.',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1078,
                documentationURL: null,
            }
        );
    },
    ROOT_TAG_SHOULD_BE_TEMPLATE: function (tag) {
        return new Diagnostic(
            arguments,
            'parser',
            'ROOT_TAG_SHOULD_BE_TEMPLATE',
            {
                code: 1079,
                message: 'Expected root tag to be template, found ' + tag,
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1079,
                documentationURL: null,
            }
        );
    },
    ROOT_TEMPLATE_CANNOT_HAVE_ATTRIBUTES: function () {
        return new Diagnostic(
            arguments,
            'parser',
            'ROOT_TEMPLATE_CANNOT_HAVE_ATTRIBUTES',
            {
                code: 1080,
                message: "Root template doesn't allow attributes",
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1080,
                documentationURL: null,
            }
        );
    },
    SLOT_ATTRIBUTE_CANNOT_BE_EXPRESSION: function () {
        return new Diagnostic(
            arguments,
            'parser',
            'SLOT_ATTRIBUTE_CANNOT_BE_EXPRESSION',
            {
                code: 1081,
                message: "Slot attribute value can't be an expression.",
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1081,
                documentationURL: null,
            }
        );
    },
    SLOT_TAG_CANNOT_HAVE_DIRECTIVES: function () {
        return new Diagnostic(
            arguments,
            'parser',
            'SLOT_TAG_CANNOT_HAVE_DIRECTIVES',
            {
                code: 1082,
                message: "Slot tag can't be associated with directives",
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1082,
                documentationURL: null,
            }
        );
    },
    TEMPLATE_EXPRESSION_PARSING_ERROR: function () {
        return new Diagnostic(
            arguments,
            'parser',
            'TEMPLATE_EXPRESSION_PARSING_ERROR',
            {
                code: 1083,
                message: 'Error parsing template expression',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1083,
                documentationURL: null,
            }
        );
    },
    UNEXPECTED_IF_MODIFIER: function (modifier) {
        return new Diagnostic(
            arguments,
            'parser',
            'UNEXPECTED_IF_MODIFIER',
            {
                code: 1084,
                message: 'Unexpected if modifier ' + modifier,
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1084,
                documentationURL: null,
            }
        );
    },
    LWC_DOM_INVALID_VALUE: function (suggestion) {
        return new Diagnostic(
            arguments,
            'parser',
            'LWC_DOM_INVALID_VALUE',
            {
                code: 1085,
                message: 'Invalid value for "lwc:dom". "lwc:dom" can only be set to ' + suggestion,
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1085,
                documentationURL: null,
            }
        );
    },
    LWC_DOM_INVALID_CONTENTS: function () {
        return new Diagnostic(
            arguments,
            'parser',
            'LWC_DOM_INVALID_CONTENTS',
            {
                code: 1086,
                message: 'Invalid contents for element with "lwc:dom". Element must be empty',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1086,
                documentationURL: null,
            }
        );
    },
    LWC_DOM_INVALID_CUSTOM_ELEMENT: function (tag) {
        return new Diagnostic(
            arguments,
            'parser',
            'LWC_DOM_INVALID_CUSTOM_ELEMENT',
            {
                code: 1087,
                message:
                    'Invalid directive "lwc:dom" on element <' +
                    tag +
                    '>. "lwc:dom" cannot be added to a custom element',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1087,
                documentationURL: null,
            }
        );
    },
    LWC_DOM_INVALID_SLOT_ELEMENT: function () {
        return new Diagnostic(
            arguments,
            'parser',
            'LWC_DOM_INVALID_SLOT_ELEMENT',
            {
                code: 1088,
                message:
                    'Invalid directive "lwc:dom" on <slot>.. "lwc:dom" cannot be added to a <slot>',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1088,
                documentationURL: null,
            }
        );
    },
    STYLE_TAG_NOT_ALLOWED_IN_TEMPLATE: function () {
        return new Diagnostic(
            arguments,
            'parser',
            'STYLE_TAG_NOT_ALLOWED_IN_TEMPLATE',
            {
                code: 1122,
                message:
                    "The <style> element is disallowed inside the template. Please add css rules into '.css' file of your component bundle.",
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1122,
                documentationURL: null,
            }
        );
    },
    UNKNOWN_HTML_TAG_IN_TEMPLATE: function (tag) {
        return new Diagnostic(
            arguments,
            'parser',
            'UNKNOWN_HTML_TAG_IN_TEMPLATE',
            {
                code: 1123,
                message:
                    "Unknown html tag '<" +
                    tag +
                    ">'. For more information refer to https://developer.mozilla.org/en-US/docs/Web/HTML/Element and https://developer.mozilla.org/en-US/docs/Web/SVG/Element",
                severity: DiagnosticSeverity.Warning,
                url: '',
            },
            {
                code: 1123,
                documentationURL: null,
            }
        );
    },
    ATTRIBUTE_NAME_MUST_START_WITH_ALPHABETIC_OR_HYPHEN_CHARACTER: function (name, tag) {
        return new Diagnostic(
            arguments,
            'parser',
            'ATTRIBUTE_NAME_MUST_START_WITH_ALPHABETIC_OR_HYPHEN_CHARACTER',
            {
                code: 1124,
                message:
                    name +
                    ' is not valid attribute for ' +
                    tag +
                    '. Attribute name must start with alphabetic character or a hyphen.',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1124,
                documentationURL: null,
            }
        );
    },
    ATTRIBUTE_NAME_MUST_END_WITH_ALPHA_NUMERIC_CHARACTER: function (name, tag) {
        return new Diagnostic(
            arguments,
            'parser',
            'ATTRIBUTE_NAME_MUST_END_WITH_ALPHA_NUMERIC_CHARACTER',
            {
                code: 1125,
                message:
                    name +
                    ' is not valid attribute for ' +
                    tag +
                    '. Attribute name must end with alpha-numeric character.',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1125,
                documentationURL: null,
            }
        );
    },
    ATTRIBUTE_NAME_CANNOT_COMBINE_UNDERSCORE_WITH_SPECIAL_CHARS: function (name, tag) {
        return new Diagnostic(
            arguments,
            'parser',
            'ATTRIBUTE_NAME_CANNOT_COMBINE_UNDERSCORE_WITH_SPECIAL_CHARS',
            {
                code: 1126,
                message:
                    name +
                    ' is not valid attribute for ' +
                    tag +
                    '. Attribute name cannot contain combination of underscore and special characters.',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1126,
                documentationURL: null,
            }
        );
    },
    UNKNOWN_LWC_DIRECTIVE: function (name, tag) {
        return new Diagnostic(
            arguments,
            'parser',
            'UNKNOWN_LWC_DIRECTIVE',
            {
                code: 1127,
                message: 'Invalid directive "$' + name + '" on element <' + tag + '>.',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1127,
                documentationURL: null,
            }
        );
    },
    INVALID_OPTS_LWC_DYNAMIC: function (tag) {
        return new Diagnostic(
            arguments,
            'parser',
            'INVALID_OPTS_LWC_DYNAMIC',
            {
                code: 1128,
                message:
                    'Invalid lwc:dynamic usage on element <' +
                    tag +
                    '>. The LWC dynamic Directive must be enabled in order to use this feature.',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1128,
                documentationURL: null,
            }
        );
    },
    INVALID_LWC_DYNAMIC_ON_NATIVE_ELEMENT: function (tag) {
        return new Diagnostic(
            arguments,
            'parser',
            'INVALID_LWC_DYNAMIC_ON_NATIVE_ELEMENT',
            {
                code: 1129,
                message:
                    'Invalid lwc:dynamic usage on element "<' +
                    tag +
                    '>". This directive can only be used in a custom element.',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1129,
                documentationURL: null,
            }
        );
    },
    INVALID_LWC_DYNAMIC_LITERAL_PROP: function (tag) {
        return new Diagnostic(
            arguments,
            'parser',
            'INVALID_LWC_DYNAMIC_LITERAL_PROP',
            {
                code: 1130,
                message:
                    'Invalid lwc:dynamic usage on element "<' +
                    tag +
                    '>". The directive binding must be an expression.',
                severity: DiagnosticSeverity.Error,
                url: '',
            },
            {
                code: 1130,
                documentationURL: null,
            }
        );
    },
};

export {
    CompilerValidationErrors,
    DecoratorErrors,
    GENERIC_COMPILER_ERROR,
    LWCClassErrors,
    ModuleResolutionErrors,
    ParserDiagnostics,
    TemplateErrors,
    TransformerErrors,
};
