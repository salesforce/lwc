export declare const LWCClassErrors: {
    INVALID_DYNAMIC_IMPORT_SOURCE_STRICT: (path: string) => import('@scary/diagnostics').Diagnostic;
    INVALID_IMPORT_MISSING_DEFAULT_EXPORT: (
        importName: string
    ) => import('@scary/diagnostics').Diagnostic;
    INVALID_IMPORT_NAMESPACE_IMPORTS_NOT_ALLOWED: (
        base: string,
        importName: string,
        importFrom: string
    ) => import('@scary/diagnostics').Diagnostic;
    INVALID_IMPORT_PROHIBITED_API: (name: string) => import('@scary/diagnostics').Diagnostic;
};
export declare const DecoratorErrors: {
    ADAPTER_SHOULD_BE_FIRST_PARAMETER: () => import('@scary/diagnostics').Diagnostic;
    API_AND_TRACK_DECORATOR_CONFLICT: () => import('@scary/diagnostics').Diagnostic;
    CONFIG_OBJECT_SHOULD_BE_SECOND_PARAMETER: () => import('@scary/diagnostics').Diagnostic;
    CONFLICT_WITH_ANOTHER_DECORATOR: (name: string) => import('@scary/diagnostics').Diagnostic;
    DUPLICATE_API_PROPERTY: (propertyName: string) => import('@scary/diagnostics').Diagnostic;
    FUNCTION_IDENTIFIER_SHOULD_BE_FIRST_PARAMETER: () => import('@scary/diagnostics').Diagnostic;
    IMPORTED_FUNCTION_IDENTIFIER_SHOULD_BE_FIRST_PARAMETER: () => import('@scary/diagnostics').Diagnostic;
    INVALID_BOOLEAN_PUBLIC_PROPERTY: () => import('@scary/diagnostics').Diagnostic;
    INVALID_DECORATOR: (
        decorator: string,
        fromName: string
    ) => import('@scary/diagnostics').Diagnostic;
    INVALID_DECORATOR_TYPE: () => import('@scary/diagnostics').Diagnostic;
    INVALID_DECORATOR_WITH_NAME: (
        badDecorator: string,
        supported: string,
        fromName: string
    ) => import('@scary/diagnostics').Diagnostic;
    IS_NOT_CLASS_PROPERTY_OR_CLASS_METHOD: (
        name: string
    ) => import('@scary/diagnostics').Diagnostic;
    IS_NOT_DECORATOR: (name: string) => import('@scary/diagnostics').Diagnostic;
    ONE_WIRE_DECORATOR_ALLOWED: () => import('@scary/diagnostics').Diagnostic;
    PROPERTY_CANNOT_BE_COMPUTED: () => import('@scary/diagnostics').Diagnostic;
    PROPERTY_NAME_CANNOT_START_WITH_DATA: (name: string) => import('@scary/diagnostics').Diagnostic;
    PROPERTY_NAME_CANNOT_START_WITH_ON: (name: string) => import('@scary/diagnostics').Diagnostic;
    PROPERTY_NAME_IS_AMBIGUOUS: (
        name: string,
        camelCaseName: string
    ) => import('@scary/diagnostics').Diagnostic;
    PROPERTY_NAME_IS_RESERVED: (name: string) => import('@scary/diagnostics').Diagnostic;
    PROPERTY_NAME_PART_IS_RESERVED: (name: string) => import('@scary/diagnostics').Diagnostic;
    SINGLE_DECORATOR_ON_SETTER_GETTER_PAIR: (
        name: string
    ) => import('@scary/diagnostics').Diagnostic;
    TRACK_ONLY_ALLOWED_ON_CLASS_PROPERTIES: () => import('@scary/diagnostics').Diagnostic;
    WIRE_ADAPTER_SHOULD_BE_IMPORTED: (name: string) => import('@scary/diagnostics').Diagnostic;
    FUNCTION_IDENTIFIER_CANNOT_HAVE_COMPUTED_PROPS: () => import('@scary/diagnostics').Diagnostic;
    FUNCTION_IDENTIFIER_CANNOT_HAVE_NESTED_MEMBER_EXRESSIONS: () => import('@scary/diagnostics').Diagnostic;
};
