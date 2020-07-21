export declare const TemplateErrors: {
    INVALID_TEMPLATE: () => import('@scary/diagnostics').Diagnostic;
    OPTIONS_MUST_BE_OBJECT: () => import('@scary/diagnostics').Diagnostic;
    UNKNOWN_IF_MODIFIER: (modifier: string) => import('@scary/diagnostics').Diagnostic;
    UNKNOWN_OPTION_PROPERTY: (property: string) => import('@scary/diagnostics').Diagnostic;
};
export declare const ParserDiagnostics: {
    AMBIGUOUS_ATTRIBUTE_VALUE: (
        raw: string,
        unquoted: string,
        escaped: string
    ) => import('@scary/diagnostics').Diagnostic;
    AMBIGUOUS_ATTRIBUTE_VALUE_STRING: (
        raw: string,
        escaped: string
    ) => import('@scary/diagnostics').Diagnostic;
    BOOLEAN_ATTRIBUTE_FALSE: (
        tag: string,
        name: string,
        value: string
    ) => import('@scary/diagnostics').Diagnostic;
    BOOLEAN_ATTRIBUTE_TRUE: (
        tag: string,
        name: string,
        value: string
    ) => import('@scary/diagnostics').Diagnostic;
    COMPUTED_PROPERTY_ACCESS_NOT_ALLOWED: () => import('@scary/diagnostics').Diagnostic;
    DIRECTIVE_SHOULD_BE_EXPRESSION: (name: string) => import('@scary/diagnostics').Diagnostic;
    INVALID_ID_ATTRIBUTE: (value: string) => import('@scary/diagnostics').Diagnostic;
    INVALID_STATIC_ID_IN_ITERATION: (value: string) => import('@scary/diagnostics').Diagnostic;
    DUPLICATE_ID_FOUND: (id: string) => import('@scary/diagnostics').Diagnostic;
    EVENT_HANDLER_SHOULD_BE_EXPRESSION: () => import('@scary/diagnostics').Diagnostic;
    FOR_EACH_AND_FOR_ITEM_DIRECTIVES_SHOULD_BE_TOGETHER: () => import('@scary/diagnostics').Diagnostic;
    FOR_EACH_DIRECTIVE_SHOULD_BE_EXPRESSION: () => import('@scary/diagnostics').Diagnostic;
    FOR_INDEX_DIRECTIVE_SHOULD_BE_STRING: () => import('@scary/diagnostics').Diagnostic;
    FOR_ITEM_DIRECTIVE_SHOULD_BE_STRING: () => import('@scary/diagnostics').Diagnostic;
    FORBIDDEN_IFRAME_SRCDOC_ATTRIBUTE: () => import('@scary/diagnostics').Diagnostic;
    FORBIDDEN_SVG_NAMESPACE_IN_TEMPLATE: (tag: string) => import('@scary/diagnostics').Diagnostic;
    FORBIDDEN_MATHML_NAMESPACE_IN_TEMPLATE: (
        tag: string
    ) => import('@scary/diagnostics').Diagnostic;
    FORBIDDEN_TAG_ON_TEMPLATE: (tag: string) => import('@scary/diagnostics').Diagnostic;
    GENERIC_PARSING_ERROR: (err: string) => import('@scary/diagnostics').Diagnostic;
    IDENTIFIER_PARSING_ERROR: () => import('@scary/diagnostics').Diagnostic;
    IF_DIRECTIVE_SHOULD_BE_EXPRESSION: () => import('@scary/diagnostics').Diagnostic;
    INVALID_ATTRIBUTE_CASE: (
        attribute: string,
        tag: string
    ) => import('@scary/diagnostics').Diagnostic;
    INVALID_EVENT_NAME: (name: string) => import('@scary/diagnostics').Diagnostic;
    INVALID_HTML_ATTRIBUTE: (name: string, tag: string) => import('@scary/diagnostics').Diagnostic;
    INVALID_HTML_SYNTAX: (code: string) => import('@scary/diagnostics').Diagnostic;
    INVALID_IDENTIFIER: (identifer: string) => import('@scary/diagnostics').Diagnostic;
    INVALID_NODE: (type: string) => import('@scary/diagnostics').Diagnostic;
    INVALID_TABINDEX_ATTRIBUTE: () => import('@scary/diagnostics').Diagnostic;
    DEPRECATED_IS_ATTRIBUTE_CANNOT_BE_EXPRESSION: () => import('@scary/diagnostics').Diagnostic;
    IS_ATTRIBUTE_NOT_SUPPORTED: (tag: string) => import('@scary/diagnostics').Diagnostic;
    KEY_ATTRIBUTE_SHOULD_BE_EXPRESSION: () => import('@scary/diagnostics').Diagnostic;
    KEY_SHOULDNT_REFERENCE_FOR_EACH_INDEX: (
        tag: string,
        name: any
    ) => import('@scary/diagnostics').Diagnostic;
    KEY_SHOULDNT_REFERENCE_ITERATOR_INDEX: (tag: string) => import('@scary/diagnostics').Diagnostic;
    MISSING_KEY_IN_ITERATOR: (tag: string) => import('@scary/diagnostics').Diagnostic;
    MISSING_ROOT_TEMPLATE_TAG: () => import('@scary/diagnostics').Diagnostic;
    MODIFYING_ITERATORS_NOT_ALLOWED: () => import('@scary/diagnostics').Diagnostic;
    MULTIPLE_EXPRESSIONS: () => import('@scary/diagnostics').Diagnostic;
    MULTIPLE_ROOTS_FOUND: () => import('@scary/diagnostics').Diagnostic;
    NAME_ON_SLOT_CANNOT_BE_EXPRESSION: () => import('@scary/diagnostics').Diagnostic;
    NO_DIRECTIVE_FOUND_ON_TEMPLATE: () => import('@scary/diagnostics').Diagnostic;
    NO_MATCHING_CLOSING_TAGS: (tagName: string) => import('@scary/diagnostics').Diagnostic;
    ROOT_TAG_SHOULD_BE_TEMPLATE: (tag: string) => import('@scary/diagnostics').Diagnostic;
    ROOT_TEMPLATE_CANNOT_HAVE_ATTRIBUTES: () => import('@scary/diagnostics').Diagnostic;
    SLOT_ATTRIBUTE_CANNOT_BE_EXPRESSION: () => import('@scary/diagnostics').Diagnostic;
    SLOT_TAG_CANNOT_HAVE_DIRECTIVES: () => import('@scary/diagnostics').Diagnostic;
    TEMPLATE_EXPRESSION_PARSING_ERROR: () => import('@scary/diagnostics').Diagnostic;
    UNEXPECTED_IF_MODIFIER: (modifier: string) => import('@scary/diagnostics').Diagnostic;
    LWC_DOM_INVALID_VALUE: (suggestion: string) => import('@scary/diagnostics').Diagnostic;
    LWC_DOM_INVALID_CONTENTS: () => import('@scary/diagnostics').Diagnostic;
    LWC_DOM_INVALID_CUSTOM_ELEMENT: (tag: string) => import('@scary/diagnostics').Diagnostic;
    LWC_DOM_INVALID_SLOT_ELEMENT: () => import('@scary/diagnostics').Diagnostic;
    STYLE_TAG_NOT_ALLOWED_IN_TEMPLATE: () => import('@scary/diagnostics').Diagnostic;
    UNKNOWN_HTML_TAG_IN_TEMPLATE: (tag: string) => import('@scary/diagnostics').Diagnostic;
    ATTRIBUTE_NAME_MUST_START_WITH_ALPHABETIC_OR_HYPHEN_CHARACTER: (
        name: string,
        tag: string
    ) => import('@scary/diagnostics').Diagnostic;
    ATTRIBUTE_NAME_MUST_END_WITH_ALPHA_NUMERIC_CHARACTER: (
        name: string,
        tag: string
    ) => import('@scary/diagnostics').Diagnostic;
    ATTRIBUTE_NAME_CANNOT_COMBINE_UNDERSCORE_WITH_SPECIAL_CHARS: (
        name: string,
        tag: string
    ) => import('@scary/diagnostics').Diagnostic;
    UNKNOWN_LWC_DIRECTIVE: (name: string, tag: string) => import('@scary/diagnostics').Diagnostic;
    INVALID_OPTS_LWC_DYNAMIC: (tag: string) => import('@scary/diagnostics').Diagnostic;
    INVALID_LWC_DYNAMIC_ON_NATIVE_ELEMENT: (tag: string) => import('@scary/diagnostics').Diagnostic;
    INVALID_LWC_DYNAMIC_LITERAL_PROP: (tag: string) => import('@scary/diagnostics').Diagnostic;
};
