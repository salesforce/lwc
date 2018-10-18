import { Level } from "../../shared/types";

export const TemplateErrors = {
    GENERIC_ERROR: {
        code: 1,
        message: '',
        type: "Error",
        level: Level.Error,
        url: ""
    },

    INVALID_TEMPLATE: {
        code: 1,
        message: "Invalid template",
        type: "Error",
        level: Level.Error,
        url: ""
    },

    MISSING_REQUIRED_PROPERTY: {
        code: 1,
        message: "Missing required option property {0}",
        type: "Error",
        level: Level.Error,
        url: ""
    },

    OPTIONS_MUST_BE_OBJECT: {
        code: 1,
        message: 'Compiler options must be an object',
        type: "Error",
        level: Level.Error,
        url: ""
    },

    UNKNOWN_IF_MODIFIER: {
        code: 1,
        message: "Unknown if modifier {0}",
        type: "Error",
        level: Level.Error,
        url: ""
    },

    UNKNOWN_OPTION_PROPERTY: {
        code: 1,
        message: "Unknown option property {0}",
        type: "Error",
        level: Level.Error,
        url: ""
    }
};

export const ParserDiagnostics = {
    AMBIGUOUS_ATTRIBUTE_VALUE: {
        code: 1,
        message: "Ambiguous attribute value {0}. " +
        "If you want to make it a valid identifier you should remove the surrounding quotes {1}. " +
        "If you want to make it a string you should escape it {2}.",
        type: "Error",
        level: Level.Error,
        url: ""
    },

    AMBIGUOUS_ATTRIBUTE_VALUE_STRING: {
        code: 1,
        message: "Ambiguous attribute value {0}. If you want to make it a string you should escape it {1}",
        type: "Error",
        level: Level.Error,
        url: ""
    },

    BOOLEAN_ATTRIBUTE_FALSE: {
        code: 1,
        message:
            "To not set a boolean attribute, try <{0}> instead of <{0} {1}=\"{2}\">. " +
            "To represent a false value, the attribute has to be omitted altogether.",
        type: "Error",
        level: Level.Error,
        url: ""
    },

    // parser/attribute.js
    BOOLEAN_ATTRIBUTE_TRUE: {
        code: 1,
        message:
            "To set a boolean attributes, try <{0} {1}> instead of <{0} {1}=\"{2}\">." +
            "If the attribute is present, its value must either be the empty string" +
            "or a value that is an ASCII case -insensitive match for the attribute's canonical name" +
            "with no leading or trailing whitespace.",
        type: "Error",
        level: Level.Error,
        url: ""
    },
    COMPUTED_PROPERTY_ACCESS_NOT_ALLOWED: {
        code: 1,
        message: "Template expression doesn't allow computed property access",
        type: "Error",
        level: Level.Error,
        url: ""
    },

    INVALID_HTML_SYNTAX: {
        code: 1,
        message: "Invalid HTML syntax: {0}. For more information, " +
        "please visit https://html.spec.whatwg.org/multipage/parsing.html#parse-error-{0}",
        level: Level.Error,
        url: ""
    },

    INVALID_IDENTIFIER: {
        code: 1,
        message: "Invalid identifier",
        type: "Error",
        level: Level.Error,
        url: ""
    },

    // parser/expression.js
    INVALID_NODE: {
        code: 1,
        message: "Template expression doesn't allow {0}",
        type: "Error",
        level: Level.Error,
        url: ""
    },

    INVALID_EXPRESSION: {
        code: 1,
        message: "Invalid expression {0} - {1}",
        type: "err",
        level: Level.Error,
        url: ""
    },

    MODIFYING_ITERATORS_NOT_ALLOWED: {
        code: 1,
        message: "Template expression doesn't allow to modify iterators",
        type: "Error",
        level: Level.Error,
        url: ""
    },

    MULTIPLE_EXPRESSIONS: {
        code: 1,
        message: "Multiple expressions found",
        type: "Error",
        level: Level.Error,
        url: ""
    },

    NO_MATCHING_CLOSING_TAGS: {
        code: 1,
        message: "<{0}> has no matching closing tag.",
        type: "Error",
        level: Level.Error,
        url: ""
    },

    TEMPLATE_EXPRESSION_PARSING_ERROR: {
        code: 1,
        message: "Error parsing template expression: {0}",
        level: Level.Error,
        url: ""
    },

    MULTIPLE_ROOTS_FOUND: {
        code: 1,
        message: "Multiple roots found",
        level: Level.Error,
        url: ""
    },

    MISSING_ROOT_TEMPLATE_TAG: {
        code: 1,
        message: "Missing root template tag",
        level: Level.Error,
        url: ""
    },

    EVENT_HANDLER_SHOULD_BE_EXPRESSION: {
        code: 1,
        message: "Event handler should be an expression",
        level: Level.Error,
        url: ""
    },

    INVALID_EVENT_NAME: {
        code: 1,
        message: "Invalid event name {0}. Event name can only contain lower-case alphabetic characters",
        level: Level.Error,
        url: ""
    },

    IF_DIRECTIVE_SHOULD_BE_EXPRESSION: {
        code: 1,
        message: "If directive should be an expression",
        level: Level.Error,
        url: ""
    },

    UNEXPECTED_IF_MODIFIER: {
        code: 1,
        message: "Unexpected if modifier {0}",
        level: Level.Error,
        url: ""
    },
// TODO: consolidate with other 'should be expression' errors
    FOR_EACH_DIRECTIVE_SHOULD_BE_EXPRESSION: {
        code: 1,
        message: 'for:each directive is expected to be a expression.',
        level: Level.Error,
        url: ""
    },

    FOR_ITEM_DIRECTIVE_SHOULD_BE_STRING: {
        code: 1,
        message: 'for:item directive is expected to be a string.',
        level: Level.Error,
        url: ""
    },
// TODO: consolidate with other invalid identifier error
    INVALID_IDENTIFIER_TWO: {
        code: 1,
        message: "{0} is not a valid identifier",
        level: Level.Error,
        url: ""
    },

    FOR_INDEX_DIRECTIVE_SHOULD_BE_STRING: {
        code: 1,
        message: "for:index directive is expected to be a string.",
        level: Level.Error,
        url: ""
    },

    FOR_EACH_AND_FOR_ITEM_DIRECTIVES_SHOULD_BE_TOGETHER: {
        code: 1,
        message: "for:each and for:item directives should be associated together.",
        level: Level.Error,
        url: ""
    },

    DIRECTIVE_SHOULD_BE_EXPRESSION: {
        code: 1,
        message: "{0} directive is expected to be an expression",
        level: Level.Error,
        url: ""
    },

    KEY_ATTRIBUTE_SHOULD_BE_EXPRESSION: {
        code: 1,
        message: "Key attribute value should be an expression",
        level: Level.Error,
        url: ""
    },

    KEY_SHOULDNT_REFERENCE_ITERATOR_INDEX: {
        code: 1,
        message: "Invalid key value for element <{0}>. Key cannot reference iterator index",
        level: Level.Error,
        url: ""
    },

    KEY_SHOULDNT_REFERENCE_FOR_EACH_INDEX: {
        code: 1,
        message: "Invalid key value for element <{0}>. Key cannot reference for:each index {1}",
        level: Level.Error,
        url: ""
    },

    MISSING_KEY_IN_ITERATOR: {
        code: 1,
        message: "Missing key for element <{0}> inside of iterator. Elements within iterators must have a unique, computed key value.",
        level: Level.Error,
        url: ""
    },

    IS_ATTRIBUTE_CANNOT_BE_EXPRESSION: {
        code: 1,
        message: "Is attribute value can't be an expression",
        level: Level.Error,
        url: ""
    },

    SLOT_ATTRIBUTE_CANNOT_BE_EXPRESSION: {
        code: 1,
        message: "Slot attribute value can't be an expression.",
        level: Level.Error,
        url: ""
    },

    SLOT_TAG_CANNOT_HAVE_DIRECTIVES: {
        code: 1,
        message: "Slot tag can't be associated with directives",
        level: Level.Error,
        url: ""
    },

    NAME_ON_SLOT_CANNOT_BE_EXPRESSION: {
        code: 1,
        message: "Name attribute on slot tag can't be an expression.",
        level: Level.Error,
        url: ""
    },

    INVALID_HTML_ATTRIBUTE: {
        code: 1,
        message: "{0} is not valid attribute for {1}. For more information refer to https://developer.mozilla.org/en-US/docs/Web/HTML/Element/{1}",
        level: Level.Error,
        url: ""
    },

    TAG_SHOULD_BE_TEMPLATE: {
        code: 1,
        message: "Expected root tag to be template, found {0}",
        level: Level.Error,
        url: ""
    },

    ROOT_TEMPLATE_CANNOT_HAVE_ATTRIBUTES: {
        code: 1,
        message: "Root template doesn't allow attributes",
        level: Level.Error,
        url: ""
    },

    NO_DIRECTIVE_FOUND_ON_TEMPLATE: {
        code: 1,
        message: 'Invalid template tag. A directive is expected to be associated with the template tag.',
        level: Level.Error,
        url: ""
    },

    FORBIDDEN_TAG_ON_TEMPLATE: {
        code: 1,
        message: "Forbidden tag found in template: '<{0}>' tag is not allowed.",
        level: Level.Error,
        url: ""
    },

    FORBIDDEN_SVG_NAMESPACE_IN_TEMPLATE: {
        code: 1,
        message: "Forbidden svg namespace tag found in template: '<{0}>' tag is not allowed within <svg>",
        level: Level.Error,
        url: ""
    },

    INVALID_TABINDEX_ATTRIBUTE: {
        code: 1,
        message: "The attribute \"tabindex\" can only be set to \"0\" or \"-1\".",
        level: Level.Error,
        url: ""
    },

    ATTRIBUTE_SHOULD_BE_STATIC_STRING: {
        code: 1,
        message: "The attribute \"{0}\" cannot be an expression. It must be a static string value.",
        level: Level.Warning,
        url: ""
    },

    ATTRIBUTE_CANNOT_BE_EMPTY: {
        code: 1,
        message: "The attribute \"{0}\" cannot be an empty string. Remove the attribute if it is unnecessary.",
        level: Level.Warning,
        url: ""
    },

    DUPLICATE_ID_FOUND: {
        code: 1,
        message: "Duplicate id value \"{0}\" detected. Id values must be unique within a template.",
        level: Level.Error,
        url: ""
    },

    ATTRIBUTE_REFERENCES_NONEXISTENT_ID: {
        code: 1,
        message: "Attribute \"{0}\" references a non-existant id \"{1}\".",
        level: Level.Error,
        url: ""
    },

    INVALID_ID_REFERENCE: {
        code: 1,
        message: "Id \"{0}\" must be referenced in the template by an id-referencing attribute such as \"for\" or \"aria-describedby\".",
        level: Level.Warning,
        url: ""
    },

    INVALID_ATTRIBUTE_CASE: {
        code: 1,
        message: "{0} is not valid attribute for {1}. All attributes name should be all lowercase.",
        level: Level.Error,
        url: ""
    },

    LINE_774: {
        code: 1,
        message: "Error parsing attribute: {0}",
        level: Level.Error,
        url: ""
    }
};
