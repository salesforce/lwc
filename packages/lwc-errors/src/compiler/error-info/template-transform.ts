import { Level } from "../../shared/types";

export const TemplateErrors = {
    GENERIC_ERROR: {
        code: 0,
        message: '',
        type: "Error",
        level: Level.Error,
        url: ""
    },

    INVALID_TEMPLATE: {
        code: 0,
        message: "Invalid template",
        type: "Error",
        level: Level.Error,
        url: ""
    },

    MISSING_REQUIRED_PROPERTY: {
        code: 0,
        message: "Missing required option property {0}",
        type: "Error",
        level: Level.Error,
        url: ""
    },

    OPTIONS_MUST_BE_OBJECT: {
        code: 0,
        message: 'Compiler options must be an object',
        type: "Error",
        level: Level.Error,
        url: ""
    },

    UNKNOWN_IF_MODIFIER: {
        code: 0,
        message: "Unknown if modifier {0}",
        type: "Error",
        level: Level.Error,
        url: ""
    },

    UNKNOWN_OPTION_PROPERTY: {
        code: 0,
        message: "Unknown option property {0}",
        type: "Error",
        level: Level.Error,
        url: ""
    }
};

export const ParserErrors = {
    AMBIGUOUS_ATTRIBUTE_VALUE: {
        code: 0,
        message: "Ambiguous attribute value {0}. " +
        "If you want to make it a valid identifier you should remove the surrounding quotes {1}. " +
        "If you want to make it a string you should escape it {2}.",
        type: "Error",
        level: Level.Error,
        url: ""
    },

    AMBIGUOUS_ATTRIBUTE_VALUE_STRING: {
        code: 0,
        message: "Ambiguous attribute value {0}. If you want to make it a string you should escape it {1}",
        type: "Error",
        level: Level.Error,
        url: ""
    },

    BOOLEAN_ATTRIBUTE_FALSE: {
        code: 0,
        message:
            "To not set a boolean attribute, try <{0}> instead of <{0} {1}=\"{2}\">. " +
            "To represent a false value, the attribute has to be omitted altogether.",
        type: "Error",
        level: Level.Error,
        url: ""
    },

    // parser/attribute.js
    BOOLEAN_ATTRIBUTE_TRUE: {
        code: 0,
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
        code: 0,
        message: "Template expression doesn't allow computed property access",
        type: "Error",
        level: Level.Error,
        url: ""
    },

    INVALID_HTML_SYNTAX: {
        code: 0,
        message: "Invalid HTML syntax: {0}. For more information, " +
        "please visit https://html.spec.whatwg.org/multipage/parsing.html#parse-error-{0}",
        level: Level.Error,
        url: ""
    },

    INVALID_IDENTIFIER: {
        code: 0,
        message: "Invalid identifier",
        type: "Error",
        level: Level.Error,
        url: ""
    },

    // parser/expression.js
    INVALID_NODE: {
        code: 0,
        message: "Template expression doesn't allow {0}",
        type: "Error",
        level: Level.Error,
        url: ""
    },

    LINE_73: {
        code: 0,
        type: "err",
        level: Level.Error,
        url: ""
    },

    MODIFYING_ITERATORS_NOT_ALLOWED: {
        code: 0,
        message: "Template expression doesn't allow to modify iterators",
        type: "Error",
        level: Level.Error,
        url: ""
    },

    MULTIPLE_EXPRESSIONS: {
        code: 0,
        message: "Multiple expressions found",
        type: "Error",
        level: Level.Error,
        url: ""
    },

    NO_MATCHING_CLOSING_TAGS: {
        code: 0,
        message: "<{0}> has no matching closing tag.",
        type: "Error",
        level: Level.Error,
        url: ""
    }
};
