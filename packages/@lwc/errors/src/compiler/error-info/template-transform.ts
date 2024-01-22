/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { DiagnosticLevel } from '../../shared/types';

/*
 * For the next available error code, reference (and update!) the value in ./index.ts
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

    DUPLICATE_ELEMENT_ENTRY: {
        code: 1150,
        message: 'customRendererConfig contains duplicate entry for {0} element tag',
        level: DiagnosticLevel.Error,
        url: '',
    },

    CUSTOM_ELEMENT_TAG_DISALLOWED: {
        code: 1151,
        message: 'customRendererConfig should not contain a custom element tag, but found {0}',
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
        level: DiagnosticLevel.Warning,
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

    ROOT_TEMPLATE_HAS_UNKNOWN_ATTRIBUTES: {
        code: 1080,
        message: 'Root template has unknown or disallowed attributes: {0}',
        level: DiagnosticLevel.Error,
        url: '',
    },

    // TODO [#3100]: Update message to point to external documentation once available.
    SLOT_TAG_CANNOT_HAVE_DIRECTIVES: {
        code: 1082,
        message: "<slot> tag can't be associated with {0} template directives.",
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

    ATTRIBUTE_NAME_STARTS_WITH_INVALID_CHARACTER: {
        code: 1124,
        message:
            '{0} is not valid attribute for {1}. Attribute name must start with an underscore, dollar sign, or an optional hyphen character followed by an alphabetic character.',
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

    UNKNOWN_LWC_DIRECTIVE: {
        code: 1127,
        message: 'Invalid directive "{0}" on element {1}.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    INVALID_OPTS_LWC_DYNAMIC: {
        code: 1128,
        message:
            'Invalid lwc:dynamic usage. The LWC dynamic directive must be enabled in order to use this feature.',
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

    LWC_RENDER_MODE_INVALID_VALUE: {
        code: 1133,
        message:
            'Invalid value for "lwc:render-mode". \'lwc:render-mode\' can only be set to "shadow", or "light"',
        level: DiagnosticLevel.Error,
        url: '',
    },

    LWC_LIGHT_SLOT_INVALID_ATTRIBUTES: {
        code: 1134,
        message:
            "Invalid attribute(s) '{0}' on slot. Slots in Light DOM templates (which have 'lwc:render-mode' directive) can only have [{1}] attributes",
        level: DiagnosticLevel.Error,
        url: '',
    },

    LWC_DOM_INVALID_IN_LIGHT_DOM: {
        code: 1135,
        message:
            "Invalid directive 'lwc:dom' on element {0}. 'lwc:dom' is not necessary in Light DOM components.",
        level: DiagnosticLevel.Error,
        url: '',
    },

    INVALID_FOR_EACH_WITH_ITERATOR: {
        code: 1136,
        message: "Invalid usage for 'for:each' and '{0}' directives on the same element.",
        level: DiagnosticLevel.Error,
        url: '',
    },

    NO_DUPLICATE_SLOTS: {
        code: 1137,
        message: 'Invalid duplicate slot ({0}).',
        level: DiagnosticLevel.Warning,
        url: '',
    },

    NO_SLOTS_IN_ITERATOR: {
        code: 1138,
        message: 'Invalid slot ({0}). A slot cannot appear inside of an iterator.',
        level: DiagnosticLevel.Warning,
        url: '',
    },

    LWC_LIGHT_SLOT_INVALID_EVENT_LISTENER: {
        code: 1139,
        message:
            "Invalid event listener '{0}' on slot. Slots in Light DOM templates cannot have event listeners.",
        level: DiagnosticLevel.Error,
        url: '',
    },

    LWC_INNER_HTML_INVALID_CUSTOM_ELEMENT: {
        code: 1140,
        message:
            'Invalid lwc:inner-html usage on element "{0}". The directive can\'t be used on a custom element or special LWC managed elements denoted with lwc:*.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    LWC_INNER_HTML_INVALID_ELEMENT: {
        code: 1141,
        message:
            'Invalid lwc:inner-html usage on element "{0}". The directive can\'t be used on a slot or a template element.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    LWC_INNER_HTML_INVALID_CONTENTS: {
        code: 1142,
        message:
            'Invalid lwc:inner-html usage on element "{0}". The directive can\'t be used on an element with content.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    LWC_INNER_HTML_INVALID_VALUE: {
        code: 1143,
        message:
            'Invalid lwc:inner-html usage on element "{0}". The directive binding can only be an expression or a string.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    INVALID_HTML_RECOVERY: {
        code: 1144,
        message:
            'Invalid HTML detected, "<{0}>" was automatically inserted within "<{1}>"; the compiled template may not match the template source.',
        level: DiagnosticLevel.Warning,
        url: '',
    },

    INVALID_TEMPLATE_ATTRIBUTE: {
        code: 1145,
        message:
            'Invalid attributes detected on template. The following attributes are not supported on template tags in LWC: {0}. For more information, ' +
            'please visit https://sfdc.co/template-directives',
        level: DiagnosticLevel.Warning,
        url: '',
    },

    PRESERVE_COMMENTS_MUST_BE_BOOLEAN: {
        code: 1146,
        message: 'lwc:preserve-comments must be a boolean attribute.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    DUPLICATE_ATTR_PROP_TRANSFORM: {
        code: 1147,
        message:
            'Found multiple HTML attributes mapping to the same JavaScript property. "{0}" and "{1}" both map to "{2}".',
        level: DiagnosticLevel.Warning,
        url: '',
    },

    INVALID_HTML_SYNTAX_WARNING: {
        code: 1148,
        message:
            'Invalid HTML syntax: {0}. This will not be supported in future versions of LWC. For more information, ' +
            'please visit https://html.spec.whatwg.org/multipage/parsing.html#parse-error-{0}',
        level: DiagnosticLevel.Warning,
        url: '',
    },

    KEY_SHOULD_BE_IN_ITERATION: {
        code: 1149,
        message:
            'Invalid key attribute on element <{0}>. The key attribute should be applied to an element with for:each or iterator:*, or to a direct child of a <template> element with for:each or iterator:*. This key will be ignored, and may throw an error in future versions of LWC.',
        level: DiagnosticLevel.Warning,
        url: '',
    },

    INVALID_TEMPLATE_WARNING: {
        code: 1153,
        message:
            'Non-root template elements must contain valid LWC template directive attributes. Otherwise, the template and its children will be ignored. ' +
            'For more information please visit https://sfdc.co/template-directives',
        level: DiagnosticLevel.Warning,
        url: '',
    },

    INVALID_LWC_SPREAD_LITERAL_PROP: {
        code: 1155,
        message:
            'Invalid lwc:spread usage on element "{0}". The directive binding must be an expression.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    LWC_REF_INVALID_ELEMENT: {
        code: 1156,
        message:
            'Invalid lwc:ref usage on element "{0}". The directive can\'t be used on a slot or a template element.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    LWC_REF_INVALID_VALUE: {
        code: 1157,
        message:
            'Invalid lwc:ref usage on element "{0}". The directive binding must be a non-empty string.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    LWC_REF_INVALID_LOCATION_INSIDE_ITERATION: {
        code: 1158,
        message:
            'Invalid lwc:ref usage on element "{0}". lwc:ref cannot be used inside for:each or an iterator.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    IF_BLOCK_DIRECTIVE_SHOULD_BE_EXPRESSION: {
        code: 1159,
        message: 'lwc:if directive value should be an expression',
        level: DiagnosticLevel.Error,
        url: '',
    },

    ELSEIF_BLOCK_DIRECTIVE_SHOULD_BE_EXPRESSION: {
        code: 1160,
        message: 'lwc:elseif directive value should be an expression',
        level: DiagnosticLevel.Error,
        url: '',
    },

    ELSE_BLOCK_DIRECTIVE_CANNOT_HAVE_VALUE: {
        code: 1161,
        message: 'lwc:else directive cannot have a value',
        level: DiagnosticLevel.Error,
        url: '',
    },

    INVALID_IF_BLOCK_DIRECTIVE_WITH_CONDITIONAL: {
        code: 1162,
        message: "Invalid usage of 'lwc:if' and '{0}' directives on the same element.",
        level: DiagnosticLevel.Error,
        url: '',
    },

    INVALID_ELSEIF_BLOCK_DIRECTIVE_WITH_CONDITIONAL: {
        code: 1163,
        message: "Invalid usage of 'lwc:elseif' and '{0}' directives on the same element.",
        level: DiagnosticLevel.Error,
        url: '',
    },

    INVALID_ELSE_BLOCK_DIRECTIVE_WITH_CONDITIONAL: {
        code: 1164,
        message: "Invalid usage of 'lwc:else' and '{0}' directives on the same element.",
        level: DiagnosticLevel.Error,
        url: '',
    },

    LWC_IF_SCOPE_NOT_FOUND: {
        code: 1165,
        message:
            "'{0}' directive must be used immediately after an element with 'lwc:if' or 'lwc:elseif'. No such element found.",
        level: DiagnosticLevel.Error,
        url: '',
    },

    LWC_IF_CANNOT_BE_USED_WITH_IF_DIRECTIVE: {
        code: 1166,
        message:
            "'{0}' directive cannot be used with 'lwc:if', 'lwc:elseif', or 'lwc:else directives on the same element.",
        level: DiagnosticLevel.Error,
        url: '',
    },

    SCOPED_SLOT_BIND_IN_LIGHT_DOM_ONLY: {
        code: 1169,
        message:
            'Invalid lwc:slot-bind usage on <slot> element. Scoped slots usage is allowed in Light DOM templates only.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    INVALID_LWC_SLOT_BIND_LITERAL_PROP: {
        code: 1170,
        message:
            'Invalid lwc:slot-bind usage on element {0}. The directive binding must be an expression.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    INVALID_LWC_SLOT_BIND_NON_SLOT_ELEMENT: {
        code: 1171,
        message:
            'Invalid lwc:slot-bind usage on element {0}. The directive can be used on a <slot> element only.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    NO_DUPLICATE_SCOPED_SLOT: {
        code: 1172,
        message: 'Invalid duplicate scoped slots ({0})',
        level: DiagnosticLevel.Error,
        url: '',
    },

    NO_MIXED_SLOT_TYPES: {
        code: 1173,
        message: 'Mixing slot types disallowed for same ({0}) slot.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    SLOT_DATA_VALUE_SHOULD_BE_STRING: {
        code: 1174,
        message: 'lwc:slot-data attribute value is expected to be a string.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    SCOPED_SLOT_DATA_ON_TEMPLATE_ONLY: {
        code: 1176,
        message: 'lwc:slot-data directive can be used on <template> elements only.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    NON_ELEMENT_SCOPED_SLOT_CONTENT: {
        code: 1177,
        message:
            '<template> tag with lwc:slot-data directive cannot contain a comment or text node as a direct child.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    INVALID_PARENT_OF_LWC_SLOT_DATA: {
        code: 1178,
        message:
            '<template> tag with lwc:slot-data directive must be the direct child of a custom element.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    SCOPED_SLOTDATA_CANNOT_BE_COMBINED_WITH_OTHER_DIRECTIVE: {
        code: 1179,
        message:
            'lwc:slot-data directive cannot be combined with other directives on the same <template> tag.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    INVALID_LWC_EXTERNAL_ON_NON_CUSTOM_ELEMENT: {
        code: 1180,
        message:
            'Invalid lwc:external directive usage: {0}. This directive can only be used on custom elements.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    INVALID_LWC_EXTERNAL_VALUE: {
        code: 1181,
        message:
            'Invalid lwc:external directive usage: {0}. This directive is a boolean attribute and should not have a value.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    SINGLE_IF_DIRECTIVE_ALLOWED: {
        code: 1182,
        message: `Multiple if: directives found on '{0}'. Only one if: directive is allowed; the rest are ignored.Only one If directive is allowed. The rest are ignored.`,
        level: DiagnosticLevel.Warning,
        url: '',
    },

    LWC_COMPONENT_TAG_WITHOUT_IS_DIRECTIVE: {
        code: 1183,
        message: `<lwc:component> must have an 'lwc:is' attribute.`,
        level: DiagnosticLevel.Error,
        url: '',
    },

    UNSUPPORTED_LWC_TAG_NAME: {
        code: 1184,
        message: '{0} is not a special LWC tag name and will be treated as an HTML element.',
        level: DiagnosticLevel.Warning,
        url: '',
    },

    INVALID_LWC_IS_DIRECTIVE_VALUE: {
        code: 1185,
        message:
            'Invalid lwc:is usage for value {0}. The value assigned to lwc:is must be an expression.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    LWC_IS_INVALID_ELEMENT: {
        code: 1186,
        message:
            'Invalid lwc:is usage for element {0}. The directive can only be used with <lwc:component>',
        level: DiagnosticLevel.Error,
        url: '',
    },

    DEPRECATED_LWC_DYNAMIC_ATTRIBUTE: {
        code: 1187,
        message: `The lwc:dynamic directive is deprecated and will be removed in a future release. Please use lwc:is instead.`,
        level: DiagnosticLevel.Warning,
        url: '',
    },

    INVALID_OPTS_LWC_ENABLE_DYNAMIC_COMPONENTS: {
        code: 1188,
        message:
            'Invalid dynamic components usage, lwc:component and lwc:is can only be used when dynamic components have been enabled.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    // TODO [#3370]: remove this error if template expressions is removed
    INVALID_EXPR_ARROW_FN_PARAM: {
        code: 1189,
        message: "Template expression doesn't allow {0} in arrow function params.",
        level: DiagnosticLevel.Error,
        url: '',
    },

    // TODO [#3370]: remove this error if template expressions is removed
    INVALID_EXPR_STATEMENTS_PROHIBITED: {
        code: 1190,
        message: 'Statements are disallowed in template expressions.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    // TODO [#3370]: remove this error if template expressions is removed
    INVALID_EXPR_MUTATION_OUTSIDE_ARROW: {
        code: 1191,
        message: 'Field mutations are only permitted within arrow functions.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    // TODO [#3370]: remove this error if template expressions is removed
    INVALID_EXPR_DELETE_OP: {
        code: 1192,
        message: 'Use of the delete operator is prohibited within template expressions.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    // TODO [#3370]: remove this error if template expressions is removed
    INVALID_EXPR_ARROW_FN_BODY: {
        code: 1193,
        message: 'The body of arrow functions in template expressions must be an expression.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    // TODO [#3370]: remove this error if template expressions is removed
    INVALID_EXPR_ARROW_FN_KIND: {
        code: 1194,
        message: 'Arrow functions in template expressions cannot be {0}.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    // TODO [#3370]: remove this error if template expressions is removed
    INVALID_EXPR_EARLY_STAGE_FEATURE: {
        code: 1195,
        message: 'Early-stage JS features are disallowed in template expressions.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    // TODO [#3370]: remove this error if template expressions is removed
    INVALID_EXPR_PROHIBITED_NODE_TYPE: {
        code: 1196,
        message: 'Use of {0} is disallowed within template expressions.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    // TODO [#3370]: remove this error if template expressions is removed
    INVALID_EXPR_COMMENTS_DISALLOWED: {
        code: 1197,
        message: 'Use of comments is disallowed within template expressions.',
        level: DiagnosticLevel.Error,
        url: '',
    },
};
