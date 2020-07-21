/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { createDiagnosticsCategory, DiagnosticSeverity } from '@scary/diagnostics';

export const TemplateErrors = createDiagnosticsCategory('template-errors', {
    INVALID_TEMPLATE: {
        code: 1003,
        message: 'Invalid template',
        severity: DiagnosticSeverity.Error,
        url: '',
    },

    OPTIONS_MUST_BE_OBJECT: {
        code: 1028,
        message: 'Compiler options must be an object',
        severity: DiagnosticSeverity.Error,
        url: '',
    },

    UNKNOWN_IF_MODIFIER: (modifier: string) => ({
        code: 1029,
        message: `Unknown if modifier ${modifier}`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    UNKNOWN_OPTION_PROPERTY: (property: string) => ({
        code: 1030,
        message: `Unknown option property ${property}`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),
});

export const ParserDiagnostics = createDiagnosticsCategory('parser', {
    AMBIGUOUS_ATTRIBUTE_VALUE: (raw: string, unquoted: string, escaped: string) => ({
        code: 1034,
        message:
            `Ambiguous attribute value ${raw}. ` +
            `If you want to make it a valid identifier you should remove the surrounding quotes ${unquoted}. ` +
            `If you want to make it a string you should escape it ${escaped}.`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    AMBIGUOUS_ATTRIBUTE_VALUE_STRING: (raw: string, escaped: string) => ({
        code: 1035,
        message: `Ambiguous attribute value ${raw}. If you want to make it a string you should escape it ${escaped}`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    BOOLEAN_ATTRIBUTE_FALSE: (tag: string, name: string, value: string) => ({
        code: 1036,
        message:
            `To not set a boolean attribute, try <${tag}> instead of <${tag} ${name}="${value}">. ` +
            'To represent a false value, the attribute has to be omitted altogether.',

        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    BOOLEAN_ATTRIBUTE_TRUE: (tag: string, name: string, value: string) => ({
        code: 1037,
        message:
            `To set a boolean attributes, try <${tag} ${name}> instead of <${tag} ${name}="${value}">. ` +
            'If the attribute is present, its value must either be the empty string ' +
            "or a value that is an ASCII case -insensitive match for the attribute's canonical name " +
            'with no leading or trailing whitespace.',

        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    COMPUTED_PROPERTY_ACCESS_NOT_ALLOWED: {
        code: 1038,
        message: "Template expression doesn't allow computed property access",
        severity: DiagnosticSeverity.Error,
        url: '',
    },

    DIRECTIVE_SHOULD_BE_EXPRESSION: (name: string) => ({
        code: 1039,
        message: `${name} directive is expected to be an expression`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    INVALID_ID_ATTRIBUTE: (value: string) => ({
        code: 1040,
        message: `Invalid id value "${value}". Id values must not contain any whitespace.`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    INVALID_STATIC_ID_IN_ITERATION: (value: string) => ({
        code: 1041,
        message: `Invalid id value "${value}". Static id values are not allowed in iterators. Id values must be unique within a template and must therefore be computed with an expression.`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    DUPLICATE_ID_FOUND: (id: string) => ({
        code: 1042,
        message: `Duplicate id value "${id}" detected. Id values must be unique within a template.`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    EVENT_HANDLER_SHOULD_BE_EXPRESSION: {
        code: 1043,
        message: 'Event handler should be an expression',
        severity: DiagnosticSeverity.Error,
        url: '',
    },

    FOR_EACH_AND_FOR_ITEM_DIRECTIVES_SHOULD_BE_TOGETHER: {
        code: 1044,
        message: 'for:each and for:item directives should be associated together.',
        severity: DiagnosticSeverity.Error,
        url: '',
    },

    FOR_EACH_DIRECTIVE_SHOULD_BE_EXPRESSION: {
        code: 1045,
        message: 'for:each directive is expected to be a expression.',
        severity: DiagnosticSeverity.Error,
        url: '',
    },

    FOR_INDEX_DIRECTIVE_SHOULD_BE_STRING: {
        code: 1046,
        message: 'for:index directive is expected to be a string.',
        severity: DiagnosticSeverity.Error,
        url: '',
    },

    FOR_ITEM_DIRECTIVE_SHOULD_BE_STRING: {
        code: 1047,
        message: 'for:item directive is expected to be a string.',
        severity: DiagnosticSeverity.Error,
        url: '',
    },

    FORBIDDEN_IFRAME_SRCDOC_ATTRIBUTE: {
        code: 1048,
        message: 'srcdoc attribute is disallowed on <iframe> for security reasons',
        severity: DiagnosticSeverity.Error,
        url: '',
    },

    FORBIDDEN_SVG_NAMESPACE_IN_TEMPLATE: (tag: string) => ({
        code: 1049,
        message: `Forbidden svg namespace tag found in template: '<${tag}>' tag is not allowed within <svg>`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    FORBIDDEN_MATHML_NAMESPACE_IN_TEMPLATE: (tag: string) => ({
        code: 1050,
        message: `Forbidden MathML namespace tag found in template: '<${tag}>' tag is not allowed within <math>`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    FORBIDDEN_TAG_ON_TEMPLATE: (tag: string) => ({
        code: 1051,
        message: `Forbidden tag found in template: '<${tag}>' tag is not allowed.`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    GENERIC_PARSING_ERROR: (err: string) => ({
        code: 1052,
        message: `Error parsing attribute: ${err}`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    IDENTIFIER_PARSING_ERROR: {
        code: 1053,
        message: `Error parsing identifier`,
        severity: DiagnosticSeverity.Error,
        url: '',
    },

    IF_DIRECTIVE_SHOULD_BE_EXPRESSION: {
        code: 1054,
        message: 'If directive should be an expression',
        severity: DiagnosticSeverity.Error,
        url: '',
    },

    INVALID_ATTRIBUTE_CASE: (attribute: string, tag: string) => ({
        code: 1055,
        message: `${attribute} is not valid attribute for ${tag}. All attributes name should be all lowercase.`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    INVALID_EVENT_NAME: (name: string) => ({
        code: 1056,
        message: `Invalid event type "${name}". Event type must begin with a lower-case alphabetic character and contain only lower-case alphabetic characters, underscores, and numeric characters`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    INVALID_HTML_ATTRIBUTE: (name: string, tag: string) => ({
        code: 1057,
        message: `${name} is not valid attribute for ${tag}. For more information refer to https://developer.mozilla.org/en-US/docs/Web/HTML/Element/${tag}`,
        severity: DiagnosticSeverity.Warning,
        url: '',
    }),

    INVALID_HTML_SYNTAX: (code: string) => ({
        code: 1058,
        message:
            `Invalid HTML syntax: ${code}. For more information, ` +
            `please visit https://html.spec.whatwg.org/multipage/parsing.html#parse-error-${code}`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    INVALID_IDENTIFIER: (identifer: string) => ({
        code: 1059,
        message: `${identifer} is not a valid identifier`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    INVALID_NODE: (type: string) => ({
        code: 1060,
        message: `Template expression doesn't allow ${type}`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    INVALID_TABINDEX_ATTRIBUTE: {
        code: 1061,
        message: 'The attribute "tabindex" can only be set to "0" or "-1".',
        severity: DiagnosticSeverity.Error,
        url: '',
    },

    DEPRECATED_IS_ATTRIBUTE_CANNOT_BE_EXPRESSION: {
        code: 1062,
        message: '"is" attribute value can\'t be an expression',
        severity: DiagnosticSeverity.Error,
        url: '',
    },

    IS_ATTRIBUTE_NOT_SUPPORTED: (tag: string) => ({
        code: 1063,
        message: `"is" attribute is disallowed on element <${tag}>`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    KEY_ATTRIBUTE_SHOULD_BE_EXPRESSION: {
        code: 1064,
        message: 'Key attribute value should be an expression',
        severity: DiagnosticSeverity.Error,
        url: '',
    },

    KEY_SHOULDNT_REFERENCE_FOR_EACH_INDEX: (tag: string, name: any) => ({
        code: 1065,
        message: `Invalid key value for element <${tag}>. Key cannot reference for:each index ${name}`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    KEY_SHOULDNT_REFERENCE_ITERATOR_INDEX: (tag: string) => ({
        code: 1066,
        message: `Invalid key value for element <${tag}>. Key cannot reference iterator index`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    MISSING_KEY_IN_ITERATOR: (tag: string) => ({
        code: 1071,
        message: `Missing key for element <${tag}> inside of iterator. Elements within iterators must have a unique, computed key value.`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    MISSING_ROOT_TEMPLATE_TAG: {
        code: 1072,
        message: 'Missing root template tag',
        severity: DiagnosticSeverity.Error,
        url: '',
    },

    MODIFYING_ITERATORS_NOT_ALLOWED: {
        code: 1073,
        message: "Template expression doesn't allow to modify iterators",
        severity: DiagnosticSeverity.Error,
        url: '',
    },

    MULTIPLE_EXPRESSIONS: {
        code: 1074,
        message: 'Multiple expressions found',
        severity: DiagnosticSeverity.Error,
        url: '',
    },

    MULTIPLE_ROOTS_FOUND: {
        code: 1075,
        message: 'Multiple roots found',
        severity: DiagnosticSeverity.Error,
        url: '',
    },

    NAME_ON_SLOT_CANNOT_BE_EXPRESSION: {
        code: 1076,
        message: "Name attribute on slot tag can't be an expression.",
        severity: DiagnosticSeverity.Error,
        url: '',
    },

    NO_DIRECTIVE_FOUND_ON_TEMPLATE: {
        code: 1077,
        message:
            'Invalid template tag. A directive is expected to be associated with the template tag.',
        severity: DiagnosticSeverity.Error,
        url: '',
    },

    NO_MATCHING_CLOSING_TAGS: (tagName: string) => ({
        code: 1078,
        message: `<${tagName}> has no matching closing tag.`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    ROOT_TAG_SHOULD_BE_TEMPLATE: (tag: string) => ({
        code: 1079,
        message: `Expected root tag to be template, found ${tag}`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    ROOT_TEMPLATE_CANNOT_HAVE_ATTRIBUTES: {
        code: 1080,
        message: "Root template doesn't allow attributes",
        severity: DiagnosticSeverity.Error,
        url: '',
    },

    SLOT_ATTRIBUTE_CANNOT_BE_EXPRESSION: {
        code: 1081,
        message: "Slot attribute value can't be an expression.",
        severity: DiagnosticSeverity.Error,
        url: '',
    },

    SLOT_TAG_CANNOT_HAVE_DIRECTIVES: {
        code: 1082,
        message: "Slot tag can't be associated with directives",
        severity: DiagnosticSeverity.Error,
        url: '',
    },

    TEMPLATE_EXPRESSION_PARSING_ERROR: {
        code: 1083,
        message: `Error parsing template expression`,
        severity: DiagnosticSeverity.Error,
        url: '',
    },

    UNEXPECTED_IF_MODIFIER: (modifier: string) => ({
        code: 1084,
        message: `Unexpected if modifier ${modifier}`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    LWC_DOM_INVALID_VALUE: (suggestion: string) => ({
        code: 1085,
        message: `Invalid value for "lwc:dom". "lwc:dom" can only be set to ${suggestion}`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    LWC_DOM_INVALID_CONTENTS: {
        code: 1086,
        message: 'Invalid contents for element with "lwc:dom". Element must be empty',
        severity: DiagnosticSeverity.Error,
        url: '',
    },

    LWC_DOM_INVALID_CUSTOM_ELEMENT: (tag: string) => ({
        code: 1087,
        message: `Invalid directive "lwc:dom" on element <${tag}>. "lwc:dom" cannot be added to a custom element`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    LWC_DOM_INVALID_SLOT_ELEMENT: {
        code: 1088,
        message: 'Invalid directive "lwc:dom" on <slot>.. "lwc:dom" cannot be added to a <slot>',
        severity: DiagnosticSeverity.Error,
        url: '',
    },

    STYLE_TAG_NOT_ALLOWED_IN_TEMPLATE: {
        code: 1122,
        message:
            "The <style> element is disallowed inside the template. Please add css rules into '.css' file of your component bundle.",
        severity: DiagnosticSeverity.Error,
        url: '',
    },

    UNKNOWN_HTML_TAG_IN_TEMPLATE: (tag: string) => ({
        code: 1123,
        message: `Unknown html tag '<${tag}>'. For more information refer to https://developer.mozilla.org/en-US/docs/Web/HTML/Element and https://developer.mozilla.org/en-US/docs/Web/SVG/Element`,
        severity: DiagnosticSeverity.Warning,
        url: '',
    }),

    ATTRIBUTE_NAME_MUST_START_WITH_ALPHABETIC_OR_HYPHEN_CHARACTER: (name: string, tag: string) => ({
        code: 1124,
        message: `${name} is not valid attribute for ${tag}. Attribute name must start with alphabetic character or a hyphen.`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    ATTRIBUTE_NAME_MUST_END_WITH_ALPHA_NUMERIC_CHARACTER: (name: string, tag: string) => ({
        code: 1125,
        message: `${name} is not valid attribute for ${tag}. Attribute name must end with alpha-numeric character.`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    ATTRIBUTE_NAME_CANNOT_COMBINE_UNDERSCORE_WITH_SPECIAL_CHARS: (name: string, tag: string) => ({
        code: 1126,
        message: `${name} is not valid attribute for ${tag}. Attribute name cannot contain combination of underscore and special characters.`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    UNKNOWN_LWC_DIRECTIVE: (name: string, tag: string) => ({
        code: 1127,
        message: `Invalid directive "$${name}" on element <${tag}>.`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    INVALID_OPTS_LWC_DYNAMIC: (tag: string) => ({
        code: 1128,
        message: `Invalid lwc:dynamic usage on element <${tag}>. The LWC dynamic Directive must be enabled in order to use this feature.`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    INVALID_LWC_DYNAMIC_ON_NATIVE_ELEMENT: (tag: string) => ({
        code: 1129,
        message: `Invalid lwc:dynamic usage on element "<${tag}>". This directive can only be used in a custom element.`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    INVALID_LWC_DYNAMIC_LITERAL_PROP: (tag: string) => ({
        code: 1130,
        message: `Invalid lwc:dynamic usage on element "<${tag}>". The directive binding must be an expression.`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),
});
