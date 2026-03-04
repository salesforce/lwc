/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { DecoratorErrors } from '@lwc/errors';
import { LWC_COMPONENT_PROPERTIES } from '../constants';
import { handleError } from '../utils';
import type {
    KeyValueProperty,
    ObjectExpression,
    NumericLiteral,
    Identifier,
    StringLiteral,
    Span,
} from '@swc/types';
import type { DecoratorMeta } from './types';
import type { VisitorState } from '../utils';

const DUMMY_SPAN: Span = { start: 0, end: 0, ctxt: 0 };
const TRACK_PROPERTY_VALUE = 1;

function isTrackDecorator(decorator: DecoratorMeta) {
    return decorator.name === 'track';
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

export function validateTrack(decorators: DecoratorMeta[], state: VisitorState): void {
    for (const decorator of decorators.filter(isTrackDecorator)) {
        if (decorator.member.type !== 'ClassProperty') {
            handleError(
                decorator.decorator,
                { errorInfo: DecoratorErrors.TRACK_ONLY_ALLOWED_ON_CLASS_PROPERTIES },
                state
            );
        }
    }
}

export function transformTrack(decoratorMetas: DecoratorMeta[]): KeyValueProperty[] {
    const objectProperties: KeyValueProperty[] = [];
    const trackDecoratorMetas = decoratorMetas.filter(isTrackDecorator);
    if (trackDecoratorMetas.length) {
        const configProps: KeyValueProperty[] = trackDecoratorMetas.map((meta) =>
            makeKeyValueProperty(
                makeStringLiteral(meta.propertyName),
                makeNumericLiteral(TRACK_PROPERTY_VALUE)
            )
        );
        objectProperties.push(
            makeKeyValueProperty(
                makeIdentifier(LWC_COMPONENT_PROPERTIES.TRACK),
                makeObjectExpression(configProps)
            )
        );
    }
    return objectProperties;
}
