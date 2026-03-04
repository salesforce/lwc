/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { DecoratorErrors } from '@lwc/errors';
import { AMBIGUOUS_PROP_SET, DISALLOWED_PROP_SET } from '@lwc/shared';
import { DECORATOR_TYPES, LWC_COMPONENT_PROPERTIES, LWC_PACKAGE_EXPORTS } from '../constants';
import { handleError } from '../utils';
import type {
    KeyValueProperty,
    ObjectExpression,
    NumericLiteral,
    Identifier,
    StringLiteral,
    ArrayExpression,
    Span,
    ClassProperty,
    ClassMethod,
} from '@swc/types';
import type { DecoratorMeta } from './types';
import type { VisitorState } from '../utils';

const DUMMY_SPAN: Span = { start: 0, end: 0, ctxt: 0 };

const { TRACK_DECORATOR } = LWC_PACKAGE_EXPORTS;
const { PUBLIC_PROPS, PUBLIC_METHODS } = LWC_COMPONENT_PROPERTIES;

const PUBLIC_PROP_BIT_MASK = {
    PROPERTY: 0,
    GETTER: 1,
    SETTER: 2,
};

function isApiDecorator(decorator: DecoratorMeta) {
    return decorator.name === 'api';
}

function getPropertyBitmask(type: string) {
    switch (type) {
        case DECORATOR_TYPES.GETTER:
            return PUBLIC_PROP_BIT_MASK.GETTER;
        case DECORATOR_TYPES.SETTER:
            return PUBLIC_PROP_BIT_MASK.SETTER;
        default:
            return PUBLIC_PROP_BIT_MASK.PROPERTY;
    }
}

function makeIdentifier(value: string): Identifier {
    return { type: 'Identifier', value, optional: false, span: DUMMY_SPAN, ctxt: 0 } as any;
}

function makeStringLiteral(value: string): StringLiteral {
    return { type: 'StringLiteral', value, span: DUMMY_SPAN, raw: JSON.stringify(value) };
}

function makeNumericLiteral(value: number): NumericLiteral {
    return { type: 'NumericLiteral', value, span: DUMMY_SPAN };
}

function makeObjectExpression(properties: KeyValueProperty[]): ObjectExpression {
    return { type: 'ObjectExpression', properties, span: DUMMY_SPAN };
}

function makeKeyValueProperty(key: Identifier | StringLiteral, value: any): KeyValueProperty {
    return { type: 'KeyValueProperty', key, value };
}

function makeArrayExpression(elements: StringLiteral[]): ArrayExpression {
    return {
        type: 'ArrayExpression',
        elements: elements.map((e) => ({ expression: e })),
        span: DUMMY_SPAN,
    };
}

function getSiblingGetSetPairType(
    propertyName: string,
    type: string,
    classBody: Array<ClassProperty | ClassMethod>
): string | undefined {
    // With the latest decorator spec, only one of the getter/setter pair needs a decorator.
    // We need to find the sibling getter/setter in the full class body (not just decorated members).
    const siblingKind = type === DECORATOR_TYPES.GETTER ? 'setter' : 'getter';
    const sibling = classBody.find(
        (m) =>
            m.type === 'ClassMethod' &&
            (m as ClassMethod).kind === siblingKind &&
            m.key.type === 'Identifier' &&
            (m.key as Identifier).value === propertyName
    );
    return sibling
        ? siblingKind === 'getter'
            ? DECORATOR_TYPES.GETTER
            : DECORATOR_TYPES.SETTER
        : undefined;
}

function computePublicPropsConfig(
    publicPropertyMetas: DecoratorMeta[],
    classBody: Array<ClassProperty | ClassMethod>,
    state: VisitorState
) {
    const acc: { [key: string]: { config: number } } = {};
    for (const { propertyName, decoratedNodeType } of publicPropertyMetas) {
        if (state.errorRecoveryMode && !decoratedNodeType) continue;
        if (!(propertyName in acc)) {
            acc[propertyName] = { config: 0 };
        }
        acc[propertyName].config |= getPropertyBitmask(decoratedNodeType!);

        if (
            decoratedNodeType === DECORATOR_TYPES.GETTER ||
            decoratedNodeType === DECORATOR_TYPES.SETTER
        ) {
            const pairType = getSiblingGetSetPairType(propertyName, decoratedNodeType, classBody);
            if (pairType) {
                acc[propertyName].config |= getPropertyBitmask(pairType);
            }
        }
    }
    return acc;
}

// --- Validation ---

function validateConflict(meta: DecoratorMeta, decorators: DecoratorMeta[], state: VisitorState) {
    const isPublicFieldTracked = decorators.some(
        (d) => d.name === TRACK_DECORATOR && d.member === meta.member
    );
    if (isPublicFieldTracked) {
        handleError(
            meta.decorator,
            { errorInfo: DecoratorErrors.API_AND_TRACK_DECORATOR_CONFLICT },
            state
        );
    }
}

function validatePropertyValue(meta: DecoratorMeta, state: VisitorState) {
    if (meta.member.type !== 'ClassProperty') return;
    const value = meta.member.value;
    if (value && value.type === 'BooleanLiteral' && value.value === true) {
        handleError(
            meta.decorator,
            { errorInfo: DecoratorErrors.INVALID_BOOLEAN_PUBLIC_PROPERTY },
            state
        );
    }
}

function validatePropertyName(meta: DecoratorMeta, state: VisitorState) {
    const key = meta.member.key;
    // computed keys not allowed
    if (key.type === 'Computed') {
        handleError(
            meta.decorator,
            { errorInfo: DecoratorErrors.PROPERTY_CANNOT_BE_COMPUTED },
            state
        );
        return;
    }

    const propertyName = meta.propertyName;

    if (propertyName === 'part') {
        handleError(
            meta.decorator,
            {
                errorInfo: DecoratorErrors.PROPERTY_NAME_PART_IS_RESERVED,
                messageArgs: [propertyName],
            },
            state
        );
    } else if (propertyName.startsWith('on')) {
        handleError(
            meta.decorator,
            {
                errorInfo: DecoratorErrors.PROPERTY_NAME_CANNOT_START_WITH_ON,
                messageArgs: [propertyName],
            },
            state
        );
    } else if (propertyName.startsWith('data') && propertyName.length > 4) {
        handleError(
            meta.decorator,
            {
                errorInfo: DecoratorErrors.PROPERTY_NAME_CANNOT_START_WITH_DATA,
                messageArgs: [propertyName],
            },
            state
        );
    } else if (DISALLOWED_PROP_SET.has(propertyName)) {
        handleError(
            meta.decorator,
            { errorInfo: DecoratorErrors.PROPERTY_NAME_IS_RESERVED, messageArgs: [propertyName] },
            state
        );
    } else if (AMBIGUOUS_PROP_SET.has(propertyName)) {
        const camelCased = AMBIGUOUS_PROP_SET.get(propertyName);
        handleError(
            meta.decorator,
            {
                errorInfo: DecoratorErrors.PROPERTY_NAME_IS_AMBIGUOUS,
                messageArgs: [propertyName, camelCased],
            },
            state
        );
    }
}

function validateSingleApiDecoratorOnSetterGetterPair(
    decorators: DecoratorMeta[],
    state: VisitorState
) {
    const visitedMethods = new Set<string>();
    for (const decorator of decorators) {
        const { decoratedNodeType } = decorator;
        if (
            isApiDecorator(decorator) &&
            (decoratedNodeType === DECORATOR_TYPES.GETTER ||
                decoratedNodeType === DECORATOR_TYPES.SETTER)
        ) {
            const methodName = decorator.propertyName;
            if (visitedMethods.has(methodName)) {
                handleError(
                    decorator.decorator,
                    {
                        errorInfo: DecoratorErrors.SINGLE_DECORATOR_ON_SETTER_GETTER_PAIR,
                        messageArgs: [methodName],
                    },
                    state
                );
            }
            visitedMethods.add(methodName);
        }
    }
}

function validateUniqueness(decorators: DecoratorMeta[], state: VisitorState) {
    const apiDecorators = decorators.filter(isApiDecorator);
    for (let i = 0; i < apiDecorators.length; i++) {
        const current = apiDecorators[i];
        for (let j = 0; j < apiDecorators.length; j++) {
            const compare = apiDecorators[j];
            const haveSameName = current.propertyName === compare.propertyName;
            const isDifferentProperty = current.decorator !== compare.decorator;
            const isGetterSetterPair =
                (current.decoratedNodeType === DECORATOR_TYPES.GETTER &&
                    compare.decoratedNodeType === DECORATOR_TYPES.SETTER) ||
                (current.decoratedNodeType === DECORATOR_TYPES.SETTER &&
                    compare.decoratedNodeType === DECORATOR_TYPES.GETTER);

            if (haveSameName && isDifferentProperty && !isGetterSetterPair) {
                handleError(
                    compare.decorator,
                    {
                        errorInfo: DecoratorErrors.DUPLICATE_API_PROPERTY,
                        messageArgs: [current.propertyName],
                    },
                    state
                );
            }
        }
    }
}

export function validateApi(decorators: DecoratorMeta[], state: VisitorState): void {
    const apiDecorators = decorators.filter(isApiDecorator);
    if (apiDecorators.length === 0) return;

    for (const meta of apiDecorators) {
        validateConflict(meta, decorators, state);
        if (meta.decoratedNodeType !== DECORATOR_TYPES.METHOD) {
            validatePropertyName(meta, state);
            validatePropertyValue(meta, state);
        }
    }

    validateSingleApiDecoratorOnSetterGetterPair(decorators, state);
    validateUniqueness(decorators, state);
}

// --- Transform ---

export function transformApi(
    decoratorMetas: DecoratorMeta[],
    classBody: Array<ClassProperty | ClassMethod>,
    state: VisitorState
): KeyValueProperty[] {
    const objectProperties: KeyValueProperty[] = [];
    const apiDecoratorMetas = decoratorMetas.filter(isApiDecorator);

    const publicPropertyMetas = apiDecoratorMetas.filter(
        ({ decoratedNodeType }) => decoratedNodeType !== DECORATOR_TYPES.METHOD
    );
    if (publicPropertyMetas.length) {
        const propsConfig = computePublicPropsConfig(publicPropertyMetas, classBody, state);
        // Build { publicProps: { propName: { config: N }, ... } }
        const propsProps: KeyValueProperty[] = Object.entries(propsConfig).map(
            ([name, { config }]) => {
                return makeKeyValueProperty(
                    makeIdentifier(name),
                    makeObjectExpression([
                        makeKeyValueProperty(makeIdentifier('config'), makeNumericLiteral(config)),
                    ])
                );
            }
        );
        objectProperties.push(
            makeKeyValueProperty(makeIdentifier(PUBLIC_PROPS), makeObjectExpression(propsProps))
        );
    }

    const publicMethodMetas = apiDecoratorMetas.filter(
        ({ decoratedNodeType }) => decoratedNodeType === DECORATOR_TYPES.METHOD
    );
    if (publicMethodMetas.length) {
        const methodNames = publicMethodMetas.map(({ propertyName }) =>
            makeStringLiteral(propertyName)
        );
        objectProperties.push(
            makeKeyValueProperty(makeIdentifier(PUBLIC_METHODS), makeArrayExpression(methodNames))
        );
    }

    return objectProperties;
}
