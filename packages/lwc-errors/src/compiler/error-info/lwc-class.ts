import { Level } from "../../shared/types";

// component.js
export const LWCClassErrors = {
    INVALID_IMPORT_MISSING_DEFAULT_EXPORT: {
        code: 1,
        message: "Invalid import. \"{0}\" doesn't have default export.",
        type: "specifier.buildCodeFrameError",
        level: Level.Error,
        url: ""
    },

    // utils.js
    INVALID_IMPORT_NAMESPACE_IMPORTS_NOT_ALLOWED: {
        code: 1,
        message: "Invalid import. Namespace imports are not allowed on \"{0}\", instead use named imports \"import { {1} } from '{2}'\".",
        type: "specifier.buildCodeFrameError",
        level: Level.Error,
        url: ""
    },
    INVALID_STATIC_OBSERVEDATTRIBUTES: {
        code: 1,
        message: "Invalid static property \"observedAttributes\". \"observedAttributes\" cannot be used to track attribute changes. Define setters for {0} instead.",
        type: "path.buildCodeFrameError",
        level: Level.Error,
        url: ""
    },

    LWC_CLASS_CANNOT_BE_ANONYMOUS: {
        code: 1,
        message: "LWC component class can't be an anonymous.",
        type: "error",
        level: Level.Error,
        url: ""
    },
};

export const DecoratorErrors = {
// decorators/wire/validate.js
    ADAPTER_SHOULD_BE_FIRST_PARAMETER: {
        code: 1,
        message: "@wire expects an adapter as first parameter. @wire(adapter: WireAdapter, config?: any).",
        type: "path.buildCodeFrameError",
        level: Level.Error,
        url: ""
    },

    // decorators/api/validate.js
    API_AND_TRACK_DECORATOR_CONFLICT: {
        code: 1,
        message: '@api method or property cannot be used with @track',
        type: "path.buildCodeFrameError",
        level: Level.Error,
        url: ""
    },

    CONFIG_OBJECT_SHOULD_BE_SECOND_PARAMETER: {
        code: 1,
        message: "@wire expects a configuration object expression as second parameter.",
        type: "config.buildCodeFrameError",
        level: Level.Error,
        url: ""
    },

    CONFLICT_WITH_ANOTHER_DECORATOR: {
        code: 1,
        message: "@wire method or property cannot be used with @{0}",
        type: "path.buildCodeFrameError",
        level: Level.Error,
        url: ""
    },

    DUPLICATE_API_PROPERTY: {
        code: 1,
        message: "Duplicate @api property \"{0}\".",
        type: "comparePath.buildCodeFrameError",
        level: Level.Error,
        url: ""
    },
    FUNCTION_IDENTIFIER_SHOULD_BE_FIRST_PARAMETER: {
        code: 1,
        message: "@wire expects a function identifier as first parameter.",
        type: "id.buildCodeFrameError",
        level: Level.Error,
        url: ""
    },

    IMPORTED_FUNCTION_IDENTIFIER_SHOULD_BE_FIRST_PARAMETER: {
        code: 1,
        message: "@wire expects a function identifier to be imported as first parameter.",
        type: "id.buildCodeFrameError",
        level: Level.Error,
        url: ""
    },

    INVALID_BOOLEAN_PUBLIC_PROPERTY: {
        code: 1,
        message: 'Boolean public property must default to false.',
        type: "property.buildCodeFrameError",
        level: Level.Error,
        url: ""
    },

    INVALID_DECORATOR: {
        code: 1,
        message: "Invalid decorator usage. Supported decorators ({0}) should be imported from \"{1}\"",
        type: "path.parentPath.buildCodeFrameError",
        level: Level.Error,
        url: ""
    },

    // decorators/index.js
    INVALID_DECORATOR_TYPE: {
        code: 1,
        message: "Invalid property of field type",
        type: "propertyOrMethod.buildCodeFrameError",
        level: Level.Error,
        url: ""
    },

    INVALID_DECORATOR_WITH_NAME: {
        code: 1,
        message: "Invalid '{0}' decorator usage. Supported decorators ({1}) should be imported from \"{2}\"",
        type: "path.parentPath.buildCodeFrameError",
        level: Level.Error,
        url: ""
    },

    IS_NOT_CLASS_PROPERTY_OR_CLASS_METHOD: {
        code: 1,
        message: "\"@{0}\" can only be applied on class properties",
        type: "propertyOrMethod.buildCodeFrameError",
        level: Level.Error,
        url: ""
    },

    IS_NOT_DECORATOR: {
        code: 1,
        message: "\"{0}\" can only be used as a class decorator",
        type: "decorator.buildCodeFrameError",
        level: Level.Error,
        url: ""
    },

    ONE_WIRE_DECORATOR_ALLOWED: {
        code: 1,
        message: 'Method or property can only have 1 @wire decorator',
        type: "path.buildCodeFrameError",
        level: Level.Error,
        url: ""
    },

    PROPERTY_CANNOT_BE_COMPUTED: {
        code: 1,
        message: '@api cannot be applied to a computed property, getter, setter or method.',
        type: "property.buildCodeFrameError",
        level: Level.Error,
        url: ""
    },
    PROPERTY_NAME_CANNOT_START_WITH_DATA: {
        code: 1,
        message: "Invalid property name {0}. Properties starting with \"data\" are reserved attributes.",
        type: "property.buildCodeFrameError",
        level: Level.Error,
        url: ""
    },
    PROPERTY_NAME_CANNOT_START_WITH_ON: {
        code: 1,
        message: "Invalid property name {0}. Properties starting with \"on\" are reserved for event handlers.",
        type: "property.buildCodeFrameError",
        level: Level.Error,
        url: ""
    },

    PROPERTY_NAME_IS_AMBIGUOUS: {
        code: 1,
        message: "Ambiguous attribute name {0}. {0} will never be called from template because its corresponding property is camel cased. Consider renaming to \"{1}\".",
        type: "property.buildCodeFrameError",
        level: Level.Error,
        url: ""
    },

    PROPERTY_NAME_IS_RESERVED: {
        code: 1,
        message: "Invalid property name \"{0}\". \"{0}\" is a reserved attribute.",
        type: "property.buildCodeFrameError",
        level: Level.Error,
        url: ""
    },

    PROPERTY_NAME_PART_IS_RESERVED: {
        code: 1,
        message: "Invalid property name {0}. \"part\" is a future reserved attribute for web components.",
        type: "property.buildCodeFrameError",
        level: Level.Error,
        url: ""
    },

    SINGLE_DECORATOR_ON_SETTER_GETTER_PAIR: {
        code: 1,
        message: "@api get {0} and @api set {0} detected in class declaration. Only one of the two needs to be decorated with @api.",
        type: "parentPath.buildCodeFrameError",
        level: Level.Error,
        url: ""
    },

    // decorators/track/index.js
    TRACK_ONLY_ALLOWED_ON_CLASS_PROPERTIES: {
        code: 1,
        message: "@track decorator can only be applied to class properties.",
        type: "path.buildCodeFrameError",
        level: Level.Error,
        url: ""
    }
};
