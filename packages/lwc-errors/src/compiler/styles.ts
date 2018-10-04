
/*
    Custom errors:
        root.error
            -- file, line and col info as properties
        decl.error
            -- file, line and col info as properties
*/

export const PostCSSErrors = {
    CONFIG_MISSING_EXPECTED_OPTIONS: {
        code: 0,
        message: 'Expected options with tagName and token properties',
        type: 'TypeError',
        level: 'error',
        url: ''
    },

    CONFIG_SELECTOR_TYPE_INVALID: {
        code: 0,
        message: '{0} option must be a string but instead received {1}',
        type: 'TypeError',
        level: 'error',
        url: ''
    },

    SELECTOR_SCOPE_DEPRECATED_SELECTOR: {
        code: 0,
        message: 'Invalid usage of deprecated selector "{0}"',
        type: 'Custom', // root.error
        level: 'error',
        url: ''
    },

    SELECTOR_SCOPE_UNSUPPORTED_SELECTOR: {
        code: 0,
        message: 'Invalid usage of unsupported selector "{0}".',
        type: 'Custom', // root.error
        level: 'error',
        url: ''
    },

    SELECTOR_SCOPE_ATTR_SELECTOR_MISSING_TAG_SELECTOR: {
        code: 0,
        message:
            'Invalid usage of attribute selector "{0}". ' +
            'For validation purposes, attributes that are not global attributes must be associated ' +
            'with a tag name when used in a CSS selector. (e.g., "input[min]" instead of "[min]")',
        type: 'Custom', // root.error
        level: 'error',
        url: ''
    },

    SELECTOR_SCOPE_ATTR_SELECTOR_NOT_KNOWN_ON_TAG: {
        code: 0,
        message:
            'Invalid usage of attribute selector "{0}". ' +
            'Attribute "{0}" is not a known attribute on <{1}> element.',
        type: 'Custom', // root.error
        level: 'error',
        url: ''
    },

    CUSTOM_PROPERTY_MISSING_CLOSING_PARENS: {
        code: 0,
        message: 'Missing closing ")" for "{0}"',
        type: 'Custom', // decl.error
        level: 'error'
    },

    CUSTOM_PROPERTY_INVALID_VAR_FUNC_SIGNATURE: {
        code: 0,
        message: 'Invalid var function signature for "{0}"',
        type: 'Custom', // decl.error
        level: 'error'
    },

    CUSTOM_PROPERTY_STRING_EXPECTED: {
        code: 0,
        message: 'Expected a string, but received instead "{0}"',
        type: 'TypeError',
        level: 'error'
    },

    CUSTOM_PROPERTY_INVALID_DEFINITION: {
        code: 0,
        message: 'Invalid definition of custom property "{0}".',
        type: 'Custom', // decl.error
        level: 'error'
    },

    SELECTOR_SCOPE_PARENT_NODE_MISSING: {
        code: 0,
        message: 'Impossible to replace root node.',
        type: 'Error',
        level: "error"
    }
};
