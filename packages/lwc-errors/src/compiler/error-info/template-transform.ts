import { DiagnosticLevel } from "../../shared/types";

export const TemplateErrors = {
    INVALID_TEMPLATE: {
        code: 1001,
        message: "Invalid template",
        level: DiagnosticLevel.Error,
        url: ""
    },

    MISSING_REQUIRED_PROPERTY: {
        code: 1001,
        message: "Missing required option property {0}",
        level: DiagnosticLevel.Error,
        url: ""
    },

    OPTIONS_MUST_BE_OBJECT: {
        code: 1001,
        message: 'Compiler options must be an object',
        level: DiagnosticLevel.Error,
        url: ""
    },

    UNKNOWN_IF_MODIFIER: {
        code: 1001,
        message: "Unknown if modifier {0}",
        level: DiagnosticLevel.Error,
        url: ""
    },

    UNKNOWN_OPTION_PROPERTY: {
        code: 1001,
        message: "Unknown option property {0}",
        level: DiagnosticLevel.Error,
        url: ""
    }
};

export const ParserDiagnostics = {
    AMBIGUOUS_ATTRIBUTE_VALUE: {
        code: 1001,

        message: "Ambiguous attribute value {0}. " +
        "If you want to make it a valid identifier you should remove the surrounding quotes {1}. " +
        "If you want to make it a string you should escape it {2}.",

        level: DiagnosticLevel.Error,
        url: ""
    },

    AMBIGUOUS_ATTRIBUTE_VALUE_STRING: {
        code: 1001,
        message: "Ambiguous attribute value {0}. If you want to make it a string you should escape it {1}",
        level: DiagnosticLevel.Error,
        url: ""
    },

    BOOLEAN_ATTRIBUTE_FALSE: {
        code: 1001,

        message:
            "To not set a boolean attribute, try <{0}> instead of <{0} {1}=\"{2}\">. " +
            "To represent a false value, the attribute has to be omitted altogether.",

        level: DiagnosticLevel.Error,
        url: ""
    },

    BOOLEAN_ATTRIBUTE_TRUE: {
        code: 1001,

        message:
            "To set a boolean attributes, try <{0} {1}> instead of <{0} {1}=\"{2}\">. " +
            "If the attribute is present, its value must either be the empty string " +
            "or a value that is an ASCII case -insensitive match for the attribute's canonical name " +
            "with no leading or trailing whitespace.",

        level: DiagnosticLevel.Error,
        url: ""
    },

    COMPUTED_PROPERTY_ACCESS_NOT_ALLOWED: {
        code: 1001,
        message: "Template expression doesn't allow computed property access",
        level: DiagnosticLevel.Error,
        url: ""
    },

    DIRECTIVE_SHOULD_BE_EXPRESSION: {
        code: 1001,
        message: "{0} directive is expected to be an expression",
        level: DiagnosticLevel.Error,
        url: ""
    },

    INVALID_ID_ATTRIBUTE: {
        code: 1001,
        message: "Invalid id value \"{0}\". Id values must not contain any whitespace.",
        level: DiagnosticLevel.Error,
        url: ""
    },

    INVALID_STATIC_ID_IN_ITERATION: {
        code: 1001,
        message: "Static id values are not allowed in iterators. Id values must be unique within a template and must therefore be computed with an expression.",
        level: DiagnosticLevel.Error,
        url: ""
    },

    DUPLICATE_ID_FOUND: {
        code: 1001,
        message: "Duplicate id value \"{0}\" detected. Id values must be unique within a template.",
        level: DiagnosticLevel.Error,
        url: ""
    },

    EVENT_HANDLER_SHOULD_BE_EXPRESSION: {
        code: 1001,
        message: "Event handler should be an expression",
        level: DiagnosticLevel.Error,
        url: ""
    },

    FOR_EACH_AND_FOR_ITEM_DIRECTIVES_SHOULD_BE_TOGETHER: {
        code: 1001,
        message: "for:each and for:item directives should be associated together.",
        level: DiagnosticLevel.Error,
        url: ""
    },

    // TODO: consolidate with other 'should be expression' errors
    FOR_EACH_DIRECTIVE_SHOULD_BE_EXPRESSION: {
        code: 1001,
        message: 'for:each directive is expected to be a expression.',
        level: DiagnosticLevel.Error,
        url: ""
    },

    FOR_INDEX_DIRECTIVE_SHOULD_BE_STRING: {
        code: 1001,
        message: "for:index directive is expected to be a string.",
        level: DiagnosticLevel.Error,
        url: ""
    },

    FOR_ITEM_DIRECTIVE_SHOULD_BE_STRING: {
        code: 1001,
        message: 'for:item directive is expected to be a string.',
        level: DiagnosticLevel.Error,
        url: ""
    },

    FORBIDDEN_SVG_NAMESPACE_IN_TEMPLATE: {
        code: 1001,
        message: "Forbidden svg namespace tag found in template: '<{0}>' tag is not allowed within <svg>",
        level: DiagnosticLevel.Error,
        url: ""
    },

    FORBIDDEN_TAG_ON_TEMPLATE: {
        code: 1001,
        message: "Forbidden tag found in template: '<{0}>' tag is not allowed.",
        level: DiagnosticLevel.Error,
        url: ""
    },

    GENERIC_PARSING_ERROR: {
        code: 1001,
        message: "Error parsing attribute: {0}",
        level: DiagnosticLevel.Error,
        url: ""
    },

    IDENTIFIER_PARSING_ERROR: {
        code: 1001,
        message: "Error parsing identifier: {0}",
        level: DiagnosticLevel.Error,
        url: ""
    },

    IF_DIRECTIVE_SHOULD_BE_EXPRESSION: {
        code: 1001,
        message: "If directive should be an expression",
        level: DiagnosticLevel.Error,
        url: ""
    },

    INVALID_ATTRIBUTE_CASE: {
        code: 1001,
        message: "{0} is not valid attribute for {1}. All attributes name should be all lowercase.",
        level: DiagnosticLevel.Error,
        url: ""
    },
    INVALID_EVENT_NAME: {
        code: 1001,
        message: "Invalid event name {0}. Event name can only contain lower-case alphabetic characters",
        level: DiagnosticLevel.Error,
        url: ""
    },

    INVALID_EXPRESSION: {
        code: 1001,
        message: "Invalid expression {0} - {1}",
        level: DiagnosticLevel.Error,
        url: ""
    },
    INVALID_HTML_ATTRIBUTE: {
        code: 1001,
        message: "{0} is not valid attribute for {1}. For more information refer to https://developer.mozilla.org/en-US/docs/Web/HTML/Element/{1}",
        level: DiagnosticLevel.Error,
        url: ""
    },

    INVALID_HTML_SYNTAX: {
        code: 1001,
        message: "Invalid HTML syntax: {0}. For more information, " +
        "please visit https://html.spec.whatwg.org/multipage/parsing.html#parse-error-{0}",
        level: DiagnosticLevel.Error,
        url: ""
    },

    // TODO: consolidate with other invalid identifier error
    INVALID_IDENTIFIER: {
        code: 1001,
        message: "{0} is not a valid identifier",
        level: DiagnosticLevel.Error,
        url: ""
    },

    INVALID_NODE: {
        code: 1001,
        message: "Template expression doesn't allow {0}",
        level: DiagnosticLevel.Error,
        url: ""
    },

    INVALID_TABINDEX_ATTRIBUTE: {
        code: 1001,
        message: "The attribute \"tabindex\" can only be set to \"0\" or \"-1\".",
        level: DiagnosticLevel.Error,
        url: ""
    },

    IS_ATTRIBUTE_CANNOT_BE_EXPRESSION: {
        code: 1001,
        message: "Is attribute value can't be an expression",
        level: DiagnosticLevel.Error,
        url: ""
    },

    KEY_ATTRIBUTE_SHOULD_BE_EXPRESSION: {
        code: 1001,
        message: "Key attribute value should be an expression",
        level: DiagnosticLevel.Error,
        url: ""
    },

    KEY_SHOULDNT_REFERENCE_FOR_EACH_INDEX: {
        code: 1001,
        message: "Invalid key value for element <{0}>. Key cannot reference for:each index {1}",
        level: DiagnosticLevel.Error,
        url: ""
    },

    KEY_SHOULDNT_REFERENCE_ITERATOR_INDEX: {
        code: 1001,
        message: "Invalid key value for element <{0}>. Key cannot reference iterator index",
        level: DiagnosticLevel.Error,
        url: ""
    },

    LOCATOR_CONTEXT_CANNOT_BE_MEMBER_EXPRESSION: {
        code: 1001,
        message: "locator:context cannot be a member expression. It can only be functions on the component",
        level: DiagnosticLevel.Error,
        url: ""
    },

    LOCATOR_CONTEXT_MUST_BE_USED_WITH_LOCATOR_ID: {
        code: 1001,
        message: "locator:context must be used with locator:id",
        level: DiagnosticLevel.Error,
        url: ""
    },

    LOCATOR_CONTEXT_SHOULD_BE_EXPRESSION: {
        code: 1001,
        message: "locator:context directive is expected to be an expression.",
        level: DiagnosticLevel.Error,
        url: ""
    },

    LOCATOR_ID_SHOULD_BE_STRING: {
        code: 1001,
        message: "locator:id directive is expected to be a string.",
        level: DiagnosticLevel.Error,
        url: ""
    },

    MISSING_KEY_IN_ITERATOR: {
        code: 1001,
        message: "Missing key for element <{0}> inside of iterator. Elements within iterators must have a unique, computed key value.",
        level: DiagnosticLevel.Error,
        url: ""
    },

    MISSING_ROOT_TEMPLATE_TAG: {
        code: 1001,
        message: "Missing root template tag",
        level: DiagnosticLevel.Error,
        url: ""
    },

    MODIFYING_ITERATORS_NOT_ALLOWED: {
        code: 1001,
        message: "Template expression doesn't allow to modify iterators",
        level: DiagnosticLevel.Error,
        url: ""
    },

    MULTIPLE_EXPRESSIONS: {
        code: 1001,
        message: "Multiple expressions found",
        level: DiagnosticLevel.Error,
        url: ""
    },

    MULTIPLE_ROOTS_FOUND: {
        code: 1001,
        message: "Multiple roots found",
        level: DiagnosticLevel.Error,
        url: ""
    },

    NAME_ON_SLOT_CANNOT_BE_EXPRESSION: {
        code: 1001,
        message: "Name attribute on slot tag can't be an expression.",
        level: DiagnosticLevel.Error,
        url: ""
    },

    NO_DIRECTIVE_FOUND_ON_TEMPLATE: {
        code: 1001,
        message: 'Invalid template tag. A directive is expected to be associated with the template tag.',
        level: DiagnosticLevel.Error,
        url: ""
    },

    NO_MATCHING_CLOSING_TAGS: {
        code: 1001,
        message: "<{0}> has no matching closing tag.",
        level: DiagnosticLevel.Error,
        url: ""
    },

    ROOT_TAG_SHOULD_BE_TEMPLATE: {
        code: 1001,
        message: "Expected root tag to be template, found {0}",
        level: DiagnosticLevel.Error,
        url: ""
    },

    ROOT_TEMPLATE_CANNOT_HAVE_ATTRIBUTES: {
        code: 1001,
        message: "Root template doesn't allow attributes",
        level: DiagnosticLevel.Error,
        url: ""
    },

    SLOT_ATTRIBUTE_CANNOT_BE_EXPRESSION: {
        code: 1001,
        message: "Slot attribute value can't be an expression.",
        level: DiagnosticLevel.Error,
        url: ""
    },

    SLOT_TAG_CANNOT_HAVE_DIRECTIVES: {
        code: 1001,
        message: "Slot tag can't be associated with directives",
        level: DiagnosticLevel.Error,
        url: ""
    },

    TEMPLATE_EXPRESSION_PARSING_ERROR: {
        code: 1001,
        message: "Error parsing template expression: {0}",
        level: DiagnosticLevel.Error,
        url: ""
    },

    UNEXPECTED_IF_MODIFIER: {
        code: 1001,
        message: "Unexpected if modifier {0}",
        level: DiagnosticLevel.Error,
        url: ""
    }
};
