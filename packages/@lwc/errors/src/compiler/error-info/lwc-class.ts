/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { createDiagnosticsCategory, DiagnosticSeverity } from '@scary/diagnostics';

/**
 * TODO [W-5678919]: implement script to determine the next available error code
 * In the meantime, reference and the update the value at src/compiler/error-info/index.ts
 */

export const LWCClassErrors = createDiagnosticsCategory('lwc-class', {
    INVALID_DYNAMIC_IMPORT_SOURCE_STRICT: (path: string) => ({
        code: 1121,
        message: `Invalid import. The argument "${path}" must be a stringLiteral for dynamic imports when strict mode is enabled.`,
        url: '',
    }),

    INVALID_IMPORT_MISSING_DEFAULT_EXPORT: (importName: string) => ({
        code: 1089,
        message: `Invalid import. "${importName}" doesn't have default export.`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    INVALID_IMPORT_NAMESPACE_IMPORTS_NOT_ALLOWED: (
        base: string,
        importName: string,
        importFrom: string
    ) => ({
        code: 1090,
        message: `Invalid import. Namespace imports are not allowed on "${base}", instead use named imports "import { ${importName} } from '${importFrom}'".`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    INVALID_IMPORT_PROHIBITED_API: (name: string) => ({
        code: 1091,
        message: `Invalid import. "${name}" is not part of the lwc api.`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),
});

export const DecoratorErrors = createDiagnosticsCategory('decorators', {
    ADAPTER_SHOULD_BE_FIRST_PARAMETER: {
        code: 1092,
        message:
            '@wire expects an adapter as first parameter. @wire(adapter: WireAdapter, config?: any).',
        severity: DiagnosticSeverity.Error,
        url: '',
    },

    API_AND_TRACK_DECORATOR_CONFLICT: {
        code: 1093,
        message: '@api method or property cannot be used with @track',
        severity: DiagnosticSeverity.Error,
        url: '',
    },

    CONFIG_OBJECT_SHOULD_BE_SECOND_PARAMETER: {
        code: 1094,
        message: '@wire expects a configuration object expression as second parameter.',
        severity: DiagnosticSeverity.Error,
        url: '',
    },

    CONFLICT_WITH_ANOTHER_DECORATOR: (name: string) => ({
        code: 1095,
        message: `@wire method or property cannot be used with @${name}`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    DUPLICATE_API_PROPERTY: (propertyName: string) => ({
        code: 1096,
        message: `Duplicate @api property "${propertyName}".`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    FUNCTION_IDENTIFIER_SHOULD_BE_FIRST_PARAMETER: {
        code: 1097,
        message: '@wire expects a function identifier as first parameter.',
        severity: DiagnosticSeverity.Error,
        url: '',
    },

    IMPORTED_FUNCTION_IDENTIFIER_SHOULD_BE_FIRST_PARAMETER: {
        code: 1098,
        message: '@wire expects a function identifier to be imported as first parameter.',
        severity: DiagnosticSeverity.Error,
        url: '',
    },

    INVALID_BOOLEAN_PUBLIC_PROPERTY: {
        code: 1099,
        message: 'Boolean public property must default to false.',
        severity: DiagnosticSeverity.Error,
        url: '',
    },

    INVALID_DECORATOR: (decorator: string, fromName: string) => ({
        code: 1100,
        message: `Invalid decorator usage. Supported decorators (${decorator}) should be imported from "${fromName}"`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    INVALID_DECORATOR_TYPE: {
        code: 1101,
        message: 'Invalid property of field type',
        severity: DiagnosticSeverity.Error,
        url: '',
    },

    INVALID_DECORATOR_WITH_NAME: (badDecorator: string, supported: string, fromName: string) => ({
        code: 1102,
        message: `Invalid "${badDecorator}" decorator usage. Supported decorators (${supported}) should be imported from "${fromName}"`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    IS_NOT_CLASS_PROPERTY_OR_CLASS_METHOD: (name: string) => ({
        code: 1103,
        message: `"@${name}" can only be applied on class properties`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    IS_NOT_DECORATOR: (name: string) => ({
        code: 1104,
        message: `"${name}" can only be used as a class decorator`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    ONE_WIRE_DECORATOR_ALLOWED: {
        code: 1105,
        message: 'Method or property can only have 1 @wire decorator',
        severity: DiagnosticSeverity.Error,
        url: '',
    },

    PROPERTY_CANNOT_BE_COMPUTED: {
        code: 1106,
        message: '@api cannot be applied to a computed property, getter, setter or method.',
        severity: DiagnosticSeverity.Error,
        url: '',
    },

    PROPERTY_NAME_CANNOT_START_WITH_DATA: (name: string) => ({
        code: 1107,
        message: `Invalid property name "${name}". Properties starting with "data" are reserved attributes.`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    PROPERTY_NAME_CANNOT_START_WITH_ON: (name: string) => ({
        code: 1108,
        message: `Invalid property name "${name}". Properties starting with "on" are reserved for event handlers.`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    PROPERTY_NAME_IS_AMBIGUOUS: (name: string, camelCaseName: string) => ({
        code: 1109,
        message: `Ambiguous attribute name "${name}". "${name}" will never be called from template because its corresponding property is camel cased. Consider renaming to "${camelCaseName}".`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    PROPERTY_NAME_IS_RESERVED: (name: string) => ({
        code: 1110,
        message: `Invalid property name "${name}". "${name}" is a reserved attribute.`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    PROPERTY_NAME_PART_IS_RESERVED: (name: string) => ({
        code: 1111,
        message: `Invalid property name "${name}". "part" is a future reserved attribute for web components.`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    SINGLE_DECORATOR_ON_SETTER_GETTER_PAIR: (name: string) => ({
        code: 1112,
        message: `@api get ${name} and @api set ${name} detected in class declaration. Only one of the two needs to be decorated with @api.`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    TRACK_ONLY_ALLOWED_ON_CLASS_PROPERTIES: {
        code: 1113,
        message: '@track decorator can only be applied to class properties.',
        severity: DiagnosticSeverity.Error,
        url: '',
    },

    WIRE_ADAPTER_SHOULD_BE_IMPORTED: (name: string) => ({
        code: 1119,
        message: `Failed to resolve @wire adapter "${name}". Ensure it is imported.`,
        severity: DiagnosticSeverity.Error,
        url: '',
    }),

    FUNCTION_IDENTIFIER_CANNOT_HAVE_COMPUTED_PROPS: {
        code: 1131,
        message: '@wire identifier cannot contain computed properties',
        severity: DiagnosticSeverity.Error,
        url: '',
    },

    FUNCTION_IDENTIFIER_CANNOT_HAVE_NESTED_MEMBER_EXRESSIONS: {
        code: 1132,
        message: '@wire identifier cannot contain nested member expressions',
        severity: DiagnosticSeverity.Error,
        url: '',
    },
});
