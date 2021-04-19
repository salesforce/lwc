/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { DiagnosticLevel } from '../../shared/types';

/**
 * TODO [W-5678919]: implement script to determine the next available error code
 * In the meantime, reference and the update the value at src/compiler/error-info/index.ts
 */

export const TemplateErrors = {
    INVALID_TEMPLATE: {
        code: 1003,
        message: 'Invalid template',
        level: DiagnosticLevel.Error,
        url: '',
    },

    OPTIONS_MUST_BE_OBJECT: {
        code: 1028,
        message: 'Compiler options must be an object',
        level: DiagnosticLevel.Error,
        url: '',
    },

    UNKNOWN_IF_MODIFIER: {
        code: 1029,
        message: 'Unknown if modifier {0}',
        level: DiagnosticLevel.Error,
        url: '',
    },

    UNKNOWN_OPTION_PROPERTY: {
        code: 1030,
        message: 'Unknown option property {0}',
        level: DiagnosticLevel.Error,
        url: '',
    },
};

export const ParserDiagnostics = {
    AMBIGUOUS_ATTRIBUTE_VALUE: {
        code: 1034,
        message:
            'Ambiguous attribute value {0}. ' +
            'If you want to make it a valid identifier you should remove the surrounding quotes {1}. ' +
            'If you want to make it a string you should escape it {2}.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    AMBIGUOUS_ATTRIBUTE_VALUE_STRING: {
        code: 1035,
        message:
            'Ambiguous attribute value {0}. If you want to make it a string you should escape it {1}',
        level: DiagnosticLevel.Error,
        url: '',
    },

    BOOLEAN_ATTRIBUTE_FALSE: {
        code: 1036,
        message:
            'To not set a boolean attribute, try <{0}> instead of <{0} {1}="{2}">. ' +
            'To represent a false value, the attribute has to be omitted altogether.',

        level: DiagnosticLevel.Error,
        url: '',
    },

    BOOLEAN_ATTRIBUTE_TRUE: {
        code: 1037,
        message:
            'To set a boolean attributes, try <{0} {1}> instead of <{0} {1}="{2}">. ' +
            'If the attribute is present, its value must either be the empty string ' +
            "or a value that is an ASCII case -insensitive match for the attribute's canonical name " +
            'with no leading or trailing whitespace.',

        level: DiagnosticLevel.Error,
        url: '',
    },

    COMPUTED_PROPERTY_ACCESS_NOT_ALLOWED: {
        code: 1038,
        message: "Template expression doesn't allow computed property access",
        level: DiagnosticLevel.Error,
        url: '',
    },

    DIRECTIVE_SHOULD_BE_EXPRESSION: {
        code: 1039,
        message: '{0} directive is expected to be an expression',
        level: DiagnosticLevel.Error,
        url: '',
    },

    INVALID_ID_ATTRIBUTE: {
        code: 1040,
        message: 'Invalid id value "{0}". Id values must not contain any whitespace.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    INVALID_STATIC_ID_IN_ITERATION: {
        code: 1041,
        message:
            'Static id values are not allowed in iterators. Id values must be unique within a template and must therefore be computed with an expression.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    DUPLICATE_ID_FOUND: {
        code: 1042,
        message: 'Duplicate id value "{0}" detected. Id values must be unique within a template.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    EVENT_HANDLER_SHOULD_BE_EXPRESSION: {
        code: 1043,
        message: 'Event handler should be an expression',
        level: DiagnosticLevel.Error,
        url: '',
    },

    FOR_EACH_AND_FOR_ITEM_DIRECTIVES_SHOULD_BE_TOGETHER: {
        code: 1044,
        message: 'for:each and for:item directives should be associated together.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    FOR_EACH_DIRECTIVE_SHOULD_BE_EXPRESSION: {
        code: 1045,
        message: 'for:each directive is expected to be a expression.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    FOR_INDEX_DIRECTIVE_SHOULD_BE_STRING: {
        code: 1046,
        message: 'for:index directive is expected to be a string.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    FOR_ITEM_DIRECTIVE_SHOULD_BE_STRING: {
        code: 1047,
        message: 'for:item directive is expected to be a string.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    FORBIDDEN_IFRAME_SRCDOC_ATTRIBUTE: {
        code: 1048,
        message: 'srcdoc attribute is disallowed on <iframe> for security reasons',
        level: DiagnosticLevel.Error,
        url: '',
    },

    FORBIDDEN_SVG_NAMESPACE_IN_TEMPLATE: {
        code: 1049,
        message:
            "Forbidden svg namespace tag found in template: '<{0}>' tag is not allowed within <svg>",
        level: DiagnosticLevel.Error,
        url: '',
    },

    FORBIDDEN_MATHML_NAMESPACE_IN_TEMPLATE: {
        code: 1050,
        message:
            "Forbidden MathML namespace tag found in template: '<{0}>' tag is not allowed within <math>",
        level: DiagnosticLevel.Error,
        url: '',
    },

    FORBIDDEN_TAG_ON_TEMPLATE: {
        code: 1051,
        message: "Forbidden tag found in template: '<{0}>' tag is not allowed.",
        level: DiagnosticLevel.Error,
        url: '',
    },

    GENERIC_PARSING_ERROR: {
        code: 1052,
        message: 'Error parsing attribute: {0}',
        level: DiagnosticLevel.Error,
        url: '',
    },

    IDENTIFIER_PARSING_ERROR: {
        code: 1053,
        message: 'Error parsing identifier: {0}',
        level: DiagnosticLevel.Error,
        url: '',
    },

    IF_DIRECTIVE_SHOULD_BE_EXPRESSION: {
        code: 1054,
        message: 'If directive should be an expression',
        level: DiagnosticLevel.Error,
        url: '',
    },

    INVALID_ATTRIBUTE_CASE: {
        code: 1055,
        message: '{0} is not valid attribute for {1}. All attributes name should be all lowercase.',
        level: DiagnosticLevel.Error,
        url: '',
    },
    INVALID_EVENT_NAME: {
        code: 1056,
        message:
            'Invalid event type "{0}". Event type must begin with a lower-case alphabetic character and contain only lower-case alphabetic characters, underscores, and numeric characters',
        level: DiagnosticLevel.Error,
        url: '',
    },

    INVALID_HTML_ATTRIBUTE: {
        code: 1057,
        message:
            '{0} is not valid attribute for {1}. For more information refer to https://developer.mozilla.org/en-US/docs/Web/HTML/Element/{1}',
        level: DiagnosticLevel.Warning,
        url: '',
    },

    INVALID_HTML_SYNTAX: {
        code: 1058,
        message:
            'Invalid HTML syntax: {0}. For more information, ' +
            'please visit https://html.spec.whatwg.org/multipage/parsing.html#parse-error-{0}',
        level: DiagnosticLevel.Error,
        url: '',
    },

    INVALID_IDENTIFIER: {
        code: 1059,
        message: '{0} is not a valid identifier',
        level: DiagnosticLevel.Error,
        url: '',
    },

    INVALID_NODE: {
        code: 1060,
        message: "Template expression doesn't allow {0}",
        level: DiagnosticLevel.Error,
        url: '',
    },

    INVALID_TABINDEX_ATTRIBUTE: {
        code: 1061,
        message: 'The attribute "tabindex" can only be set to "0" or "-1".',
        level: DiagnosticLevel.Error,
        url: '',
    },

    DEPRECATED_IS_ATTRIBUTE_CANNOT_BE_EXPRESSION: {
        code: 1062,
        message: '"is" attribute value can\'t be an expression',
        level: DiagnosticLevel.Error,
        url: '',
    },

    IS_ATTRIBUTE_NOT_SUPPORTED: {
        code: 1063,
        message: '"is" attribute is disallowed',
        level: DiagnosticLevel.Error,
        url: '',
    },

    KEY_ATTRIBUTE_SHOULD_BE_EXPRESSION: {
        code: 1064,
        message: 'Key attribute value should be an expression',
        level: DiagnosticLevel.Error,
        url: '',
    },

    KEY_SHOULDNT_REFERENCE_FOR_EACH_INDEX: {
        code: 1065,
        message: 'Invalid key value for element <{0}>. Key cannot reference for:each index {1}',
        level: DiagnosticLevel.Error,
        url: '',
    },

    KEY_SHOULDNT_REFERENCE_ITERATOR_INDEX: {
        code: 1066,
        message: 'Invalid key value for element <{0}>. Key cannot reference iterator index',
        level: DiagnosticLevel.Error,
        url: '',
    },

    MISSING_KEY_IN_ITERATOR: {
        code: 1071,
        message:
            'Missing key for element <{0}> inside of iterator. Elements within iterators must have a unique, computed key value.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    MISSING_ROOT_TEMPLATE_TAG: {
        code: 1072,
        message: 'Missing root template tag',
        level: DiagnosticLevel.Error,
        url: '',
    },

    MODIFYING_ITERATORS_NOT_ALLOWED: {
        code: 1073,
        message: "Template expression doesn't allow to modify iterators",
        level: DiagnosticLevel.Error,
        url: '',
    },

    MULTIPLE_EXPRESSIONS: {
        code: 1074,
        message: 'Multiple expressions found',
        level: DiagnosticLevel.Error,
        url: '',
    },

    MULTIPLE_ROOTS_FOUND: {
        code: 1075,
        message: 'Multiple roots found',
        level: DiagnosticLevel.Error,
        url: '',
    },

    NAME_ON_SLOT_CANNOT_BE_EXPRESSION: {
        code: 1076,
        message: "Name attribute on slot tag can't be an expression.",
        level: DiagnosticLevel.Error,
        url: '',
    },

    NO_DIRECTIVE_FOUND_ON_TEMPLATE: {
        code: 1077,
        message:
            'Invalid template tag. A directive is expected to be associated with the template tag.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    NO_MATCHING_CLOSING_TAGS: {
        code: 1078,
        message: '<{0}> has no matching closing tag.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    ROOT_TAG_SHOULD_BE_TEMPLATE: {
        code: 1079,
        message: 'Expected root tag to be template, found {0}',
        level: DiagnosticLevel.Error,
        url: '',
    },

    ROOT_TEMPLATE_HAVE_UNKNOWN_ATTRIBUTES: {
        code: 1080,
        message: 'Root template has unknown attributes',
        level: DiagnosticLevel.Error,
        url: '',
    },

    SLOT_ATTRIBUTE_CANNOT_BE_EXPRESSION: {
        code: 1081,
        message: "Slot attribute value can't be an expression.",
        level: DiagnosticLevel.Error,
        url: '',
    },

    SLOT_TAG_CANNOT_HAVE_DIRECTIVES: {
        code: 1082,
        message: "Slot tag can't be associated with directives",
        level: DiagnosticLevel.Error,
        url: '',
    },

    TEMPLATE_EXPRESSION_PARSING_ERROR: {
        code: 1083,
        message: 'Error parsing template expression: {0}',
        level: DiagnosticLevel.Error,
        url: '',
    },

    UNEXPECTED_IF_MODIFIER: {
        code: 1084,
        message: 'Unexpected if modifier {0}',
        level: DiagnosticLevel.Error,
        url: '',
    },

    LWC_DOM_INVALID_VALUE: {
        code: 1085,
        message: 'Invalid value for "lwc:dom". \'lwc:dom\' can only be set to {0}',
        level: DiagnosticLevel.Error,
        url: '',
    },

    LWC_DOM_INVALID_CONTENTS: {
        code: 1086,
        message: 'Invalid contents for element with "lwc:dom". Element must be empty',
        level: DiagnosticLevel.Error,
        url: '',
    },

    LWC_DOM_INVALID_CUSTOM_ELEMENT: {
        code: 1087,
        message:
            'Invalid directive "lwc:dom" on element {0}. "lwc:dom" cannot be added to a custom element',
        level: DiagnosticLevel.Error,
        url: '',
    },

    LWC_DOM_INVALID_SLOT_ELEMENT: {
        code: 1088,
        message: 'Invalid directive "lwc:dom" on <slot>.. "lwc:dom" cannot be added to a <slot>',
        level: DiagnosticLevel.Error,
        url: '',
    },

    STYLE_TAG_NOT_ALLOWED_IN_TEMPLATE: {
        code: 1122,
        message:
            "The <style> element is disallowed inside the template. Please add css rules into '.css' file of your component bundle.",
        level: DiagnosticLevel.Error,
        url: '',
    },

    UNKNOWN_HTML_TAG_IN_TEMPLATE: {
        code: 1123,
        message:
            "Unknown html tag '<{0}>'. For more information refer to https://developer.mozilla.org/en-US/docs/Web/HTML/Element and https://developer.mozilla.org/en-US/docs/Web/SVG/Element",
        level: DiagnosticLevel.Warning,
        url: '',
    },

    ATTRIBUTE_NAME_MUST_START_WITH_ALPHABETIC_OR_HYPHEN_CHARACTER: {
        code: 1124,
        message:
            '{0} is not valid attribute for {1}. Attribute name must start with alphabetic character or a hyphen.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    ATTRIBUTE_NAME_MUST_END_WITH_ALPHA_NUMERIC_CHARACTER: {
        code: 1125,
        message:
            '{0} is not valid attribute for {1}. Attribute name must end with alpha-numeric character.',
        level: DiagnosticLevel.Error,
        url: '',
    },
    ATTRIBUTE_NAME_CANNOT_COMBINE_UNDERSCORE_WITH_SPECIAL_CHARS: {
        code: 1126,
        message:
            '{0} is not valid attribute for {1}. Attribute name cannot contain combination of underscore and special characters.',
        level: DiagnosticLevel.Error,
        url: '',
    },
    UNKNOWN_LWC_DIRECTIVE: {
        code: 1127,
        message: 'Invalid directive "${0}" on element {1}.',
        level: DiagnosticLevel.Error,
        url: '',
    },
    INVALID_OPTS_LWC_DYNAMIC: {
        code: 1128,
        message:
            'Invalid lwc:dynamic usage. The LWC dynamic Directive must be enabled in order to use this feature.',
        level: DiagnosticLevel.Error,
        url: '',
    },
    INVALID_LWC_DYNAMIC_ON_NATIVE_ELEMENT: {
        code: 1129,
        message:
            'Invalid lwc:dynamic usage on element "{0}". This directive can only be used in a custom element.',
        level: DiagnosticLevel.Error,
        url: '',
    },
    INVALID_LWC_DYNAMIC_LITERAL_PROP: {
        code: 1130,
        message:
            'Invalid lwc:dynamic usage on element "{0}". The directive binding must be an expression.',
        level: DiagnosticLevel.Error,
        url: '',
    },
};
