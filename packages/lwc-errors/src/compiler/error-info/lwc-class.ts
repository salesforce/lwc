import { DiagnosticLevel } from "../../shared/types";

export const LWCClassErrors = {
    INVALID_IMPORT_MISSING_DEFAULT_EXPORT: {
        code: 1001,
        message: "Invalid import. \"{0}\" doesn't have default export.",
        level: DiagnosticLevel.Error,
        url: ""
    },

    INVALID_IMPORT_NAMESPACE_IMPORTS_NOT_ALLOWED: {
        code: 1001,
        message: "Invalid import. Namespace imports are not allowed on \"{0}\", instead use named imports \"import { {1} } from '{2}'\".",
        level: DiagnosticLevel.Error,
        url: ""
    },

    INVALID_HTML_IMPORT_IMPLICIT_MODE: {
        code: 1001,
        message: "Invalid html import \"{0}\". If you want to manually import html modules you must switch to explicit mode",
        level: DiagnosticLevel.Error,
        url: ""
    },

    INVALID_IMPORT_PROHIBITED_API: {
        code: 1001,
        message: "Invalid import. \"{0}\" is not part of the lwc api.",
        level: DiagnosticLevel.Error,
        url: ""
    },

    INVALID_STATIC_OBSERVEDATTRIBUTES: {
        code: 1001,
        message: "Invalid static property \"observedAttributes\". \"observedAttributes\" cannot be used to track attribute changes. Define setters for {0} instead.",
        level: DiagnosticLevel.Error,
        url: ""
    },

    LWC_CLASS_CANNOT_BE_ANONYMOUS: {
        code: 1001,
        message: "LWC component class can't be an anonymous.",
        level: DiagnosticLevel.Error,
        url: ""
    },
};

export const DecoratorErrors = {
    ADAPTER_SHOULD_BE_FIRST_PARAMETER: {
        code: 1001,
        message: "@wire expects an adapter as first parameter. @wire(adapter: WireAdapter, config?: any).",
        level: DiagnosticLevel.Error,
        url: ""
    },

    API_AND_TRACK_DECORATOR_CONFLICT: {
        code: 1001,
        message: '@api method or property cannot be used with @track',
        level: DiagnosticLevel.Error,
        url: ""
    },

    CONFIG_OBJECT_SHOULD_BE_SECOND_PARAMETER: {
        code: 1001,
        message: "@wire expects a configuration object expression as second parameter.",
        level: DiagnosticLevel.Error,
        url: ""
    },

    CONFLICT_WITH_ANOTHER_DECORATOR: {
        code: 1001,
        message: "@wire method or property cannot be used with @{0}",
        level: DiagnosticLevel.Error,
        url: ""
    },

    DUPLICATE_API_PROPERTY: {
        code: 1001,
        message: "Duplicate @api property \"{0}\".",
        level: DiagnosticLevel.Error,
        url: ""
    },

    FUNCTION_IDENTIFIER_SHOULD_BE_FIRST_PARAMETER: {
        code: 1001,
        message: "@wire expects a function identifier as first parameter.",
        level: DiagnosticLevel.Error,
        url: ""
    },

    IMPORTED_FUNCTION_IDENTIFIER_SHOULD_BE_FIRST_PARAMETER: {
        code: 1001,
        message: "@wire expects a function identifier to be imported as first parameter.",
        level: DiagnosticLevel.Error,
        url: ""
    },

    INVALID_BOOLEAN_PUBLIC_PROPERTY: {
        code: 1001,
        message: 'Boolean public property must default to false.',
        level: DiagnosticLevel.Error,
        url: ""
    },

    INVALID_DECORATOR: {
        code: 1001,
        message: "Invalid decorator usage. Supported decorators ({0}) should be imported from \"{1}\"",
        level: DiagnosticLevel.Error,
        url: ""
    },

    INVALID_DECORATOR_TYPE: {
        code: 1001,
        message: "Invalid property of field type",
        level: DiagnosticLevel.Error,
        url: ""
    },

    INVALID_DECORATOR_WITH_NAME: {
        code: 1001,
        message: "Invalid '{0}' decorator usage. Supported decorators ({1}) should be imported from \"{2}\"",
        level: DiagnosticLevel.Error,
        url: ""
    },

    IS_NOT_CLASS_PROPERTY_OR_CLASS_METHOD: {
        code: 1001,
        message: "\"@{0}\" can only be applied on class properties",
        level: DiagnosticLevel.Error,
        url: ""
    },

    IS_NOT_DECORATOR: {
        code: 1001,
        message: "\"{0}\" can only be used as a class decorator",
        level: DiagnosticLevel.Error,
        url: ""
    },

    ONE_WIRE_DECORATOR_ALLOWED: {
        code: 1001,
        message: 'Method or property can only have 1 @wire decorator',
        level: DiagnosticLevel.Error,
        url: ""
    },

    PROPERTY_CANNOT_BE_COMPUTED: {
        code: 1001,
        message: '@api cannot be applied to a computed property, getter, setter or method.',
        level: DiagnosticLevel.Error,
        url: ""
    },

    PROPERTY_NAME_CANNOT_START_WITH_DATA: {
        code: 1001,
        message: "Invalid property name {0}. Properties starting with \"data\" are reserved attributes.",
        level: DiagnosticLevel.Error,
        url: ""
    },

    PROPERTY_NAME_CANNOT_START_WITH_ON: {
        code: 1001,
        message: "Invalid property name {0}. Properties starting with \"on\" are reserved for event handlers.",
        level: DiagnosticLevel.Error,
        url: ""
    },

    PROPERTY_NAME_IS_AMBIGUOUS: {
        code: 1001,
        message: "Ambiguous attribute name {0}. {0} will never be called from template because its corresponding property is camel cased. Consider renaming to \"{1}\".",
        level: DiagnosticLevel.Error,
        url: ""
    },

    PROPERTY_NAME_IS_RESERVED: {
        code: 1001,
        message: "Invalid property name \"{0}\". \"{0}\" is a reserved attribute.",
        level: DiagnosticLevel.Error,
        url: ""
    },

    PROPERTY_NAME_PART_IS_RESERVED: {
        code: 1001,
        message: "Invalid property name {0}. \"part\" is a future reserved attribute for web components.",
        level: DiagnosticLevel.Error,
        url: ""
    },

    SINGLE_DECORATOR_ON_SETTER_GETTER_PAIR: {
        code: 1001,
        message: "@api get {0} and @api set {0} detected in class declaration. Only one of the two needs to be decorated with @api.",
        level: DiagnosticLevel.Error,
        url: ""
    },

    TRACK_ONLY_ALLOWED_ON_CLASS_PROPERTIES: {
        code: 1001,
        message: "@track decorator can only be applied to class properties.",
        level: DiagnosticLevel.Error,
        url: ""
    }
};
