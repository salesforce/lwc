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

export const LWCClassErrors = {
    INVALID_DYNAMIC_IMPORT_SOURCE_STRICT: {
        code: 1121,
        message:
            'Invalid import. The argument "{0}" must be a stringLiteral for dynamic imports when strict mode is enabled.',
        url: '',
        level: DiagnosticLevel.Error,
    },
};

export const DecoratorErrors = {
    ADAPTER_SHOULD_BE_FIRST_PARAMETER: {
        code: 1092,
        message:
            '@wire expects an adapter as first parameter. @wire(adapter: WireAdapter, config?: any).',
        level: DiagnosticLevel.Error,
        url: '',
    },

    API_AND_TRACK_DECORATOR_CONFLICT: {
        code: 1093,
        message: '@api method or property cannot be used with @track',
        level: DiagnosticLevel.Error,
        url: '',
    },

    CONFIG_OBJECT_SHOULD_BE_SECOND_PARAMETER: {
        code: 1094,
        message: '@wire expects a configuration object expression as second parameter.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    CONFLICT_WITH_ANOTHER_DECORATOR: {
        code: 1095,
        message: '@wire method or property cannot be used with @{0}',
        level: DiagnosticLevel.Error,
        url: '',
    },

    DUPLICATE_API_PROPERTY: {
        code: 1096,
        message: 'Duplicate @api property "{0}".',
        level: DiagnosticLevel.Error,
        url: '',
    },

    FUNCTION_IDENTIFIER_SHOULD_BE_FIRST_PARAMETER: {
        code: 1097,
        message: '@wire expects a function identifier as first parameter.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    IMPORTED_FUNCTION_IDENTIFIER_SHOULD_BE_FIRST_PARAMETER: {
        code: 1098,
        message: '@wire expects a function identifier to be imported as first parameter.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    INVALID_BOOLEAN_PUBLIC_PROPERTY: {
        code: 1099,
        message: 'Boolean public property must default to false.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    INVALID_DECORATOR: {
        code: 1100,
        message:
            'Invalid decorator usage. Supported decorators ({0}) should be imported from "{1}"',
        level: DiagnosticLevel.Error,
        url: '',
    },

    INVALID_DECORATOR_TYPE: {
        code: 1101,
        message: 'Invalid property of field type',
        level: DiagnosticLevel.Error,
        url: '',
    },

    INVALID_DECORATOR_WITH_NAME: {
        code: 1102,
        message:
            'Invalid \'{0}\' decorator usage. Supported decorators ({1}) should be imported from "{2}"',
        level: DiagnosticLevel.Error,
        url: '',
    },

    IS_NOT_CLASS_PROPERTY_OR_CLASS_METHOD: {
        code: 1103,
        message: '"@{0}" can only be applied on class properties',
        level: DiagnosticLevel.Error,
        url: '',
    },

    IS_NOT_DECORATOR: {
        code: 1104,
        message: '"{0}" can only be used as a class decorator',
        level: DiagnosticLevel.Error,
        url: '',
    },

    ONE_WIRE_DECORATOR_ALLOWED: {
        code: 1105,
        message: 'Method or property can only have 1 @wire decorator',
        level: DiagnosticLevel.Error,
        url: '',
    },

    PROPERTY_CANNOT_BE_COMPUTED: {
        code: 1106,
        message: '@api cannot be applied to a computed property, getter, setter or method.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    PROPERTY_NAME_CANNOT_START_WITH_DATA: {
        code: 1107,
        message:
            'Invalid property name "{0}". Properties starting with "data" are reserved attributes.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    PROPERTY_NAME_CANNOT_START_WITH_ON: {
        code: 1108,
        message:
            'Invalid property name "{0}". Properties starting with "on" are reserved for event handlers.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    PROPERTY_NAME_IS_AMBIGUOUS: {
        code: 1109,
        message:
            'Ambiguous attribute name "{0}". "{0}" will never be called from template because its corresponding property is camel cased. Consider renaming to "{1}".',
        level: DiagnosticLevel.Error,
        url: '',
    },

    PROPERTY_NAME_IS_RESERVED: {
        code: 1110,
        message: 'Invalid property name "{0}". "{0}" is a reserved attribute.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    PROPERTY_NAME_PART_IS_RESERVED: {
        code: 1111,
        message:
            'Invalid property name "{0}". "part" is a future reserved attribute for web components.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    SINGLE_DECORATOR_ON_SETTER_GETTER_PAIR: {
        code: 1112,
        message:
            '@api get {0} and @api set {0} detected in class declaration. Only one of the two needs to be decorated with @api.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    TRACK_ONLY_ALLOWED_ON_CLASS_PROPERTIES: {
        code: 1113,
        message: '@track decorator can only be applied to class properties.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    WIRE_ADAPTER_SHOULD_BE_IMPORTED: {
        code: 1119,
        message: 'Failed to resolve @wire adapter "{0}". Ensure it is imported.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    FUNCTION_IDENTIFIER_CANNOT_HAVE_COMPUTED_PROPS: {
        code: 1131,
        message: '@wire identifier cannot contain computed properties',
        level: DiagnosticLevel.Error,
        url: '',
    },

    FUNCTION_IDENTIFIER_CANNOT_HAVE_NESTED_MEMBER_EXRESSIONS: {
        code: 1132,
        message: '@wire identifier cannot contain nested member expressions',
        level: DiagnosticLevel.Error,
        url: '',
    },

    COMPUTED_PROPERTY_CANNOT_BE_TEMPLATE_LITERAL: {
        code: 1199,
        message:
            'Cannot use a template literal as a computed property key. Instead, use a string or extract the value to a constant.',
        level: DiagnosticLevel.Error,
        url: '',
    },

    COMPUTED_PROPERTY_MUST_BE_CONSTANT_OR_LITERAL: {
        code: 1200,
        message: 'Computed property in @wire config must be a constant or primitive literal.',
        level: DiagnosticLevel.Error,
        url: '',
    },
};
