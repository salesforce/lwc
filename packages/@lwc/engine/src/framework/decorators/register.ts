/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import assert from '../../shared/assert';
import {
    getOwnPropertyNames,
    isFunction,
    isUndefined,
    create,
    assign,
} from '../../shared/language';
import { ComponentConstructor } from '../component';
import wireDecorator from './wire';
import trackDecorator from './track';
import apiDecorator from './api';
import { EmptyObject } from '../utils';
import { getAttrNameFromPropName, getGlobalHTMLPropertiesInfo } from '../attributes';
import decorate, { DecoratorMap } from './decorate';

export interface PropDef {
    config: number;
    type: string; // TODO: make this an enum
    attr: string;
}
export interface WireDef {
    method?: number;
    [key: string]: any;
}
export interface PropsDef {
    [key: string]: PropDef;
}
interface TrackDef {
    [key: string]: 1;
}
type PublicMethod = (...args: any[]) => any;
interface MethodDef {
    [key: string]: PublicMethod;
}
export interface WireHash {
    [key: string]: WireDef;
}

export interface RegisterDecoratorMeta {
    readonly publicMethods?: string[];
    readonly publicProps?: PropsDef;
    readonly track?: TrackDef;
    readonly wire?: WireHash;
}

export interface DecoratorMeta {
    wire: WireHash | undefined;
    track: TrackDef;
    props: PropsDef;
    methods: MethodDef;
}

const signedDecoratorToMetaMap: Map<ComponentConstructor, DecoratorMeta> = new Map();

export function registerDecorators(
    Ctor: ComponentConstructor,
    meta: RegisterDecoratorMeta,
): ComponentConstructor {
    const decoratorMap: DecoratorMap = create(null);
    const props = getPublicPropertiesHash(Ctor, meta.publicProps);
    const methods = getPublicMethodsHash(Ctor, meta.publicMethods);
    const wire = getWireHash(Ctor, meta.wire);
    const track = getTrackHash(Ctor, meta.track);
    signedDecoratorToMetaMap.set(Ctor, {
        props,
        methods,
        wire,
        track,
    });
    for (const propName in props) {
        decoratorMap[propName] = apiDecorator;
    }
    if (wire) {
        for (const propName in wire) {
            const wireDef: WireDef = wire[propName];
            if (wireDef.method) {
                // for decorated methods we need to do nothing
                continue;
            }
            decoratorMap[propName] = wireDecorator(wireDef.adapter, wireDef.params);
        }
    }
    if (track) {
        for (const propName in track) {
            decoratorMap[propName] = trackDecorator;
        }
    }
    decorate(Ctor, decoratorMap);
    return Ctor;
}

export function getDecoratorsRegisteredMeta(Ctor: ComponentConstructor): DecoratorMeta | undefined {
    return signedDecoratorToMetaMap.get(Ctor);
}

function getTrackHash(target: ComponentConstructor, track: TrackDef | undefined): TrackDef {
    if (isUndefined(track) || getOwnPropertyNames(track).length === 0) {
        return EmptyObject;
    }

    // TODO: check that anything in `track` is correctly defined in the prototype
    return assign(create(null), track);
}

function getWireHash(
    target: ComponentConstructor,
    wire: WireHash | undefined,
): WireHash | undefined {
    if (isUndefined(wire) || getOwnPropertyNames(wire).length === 0) {
        return;
    }

    // TODO: check that anything in `wire` is correctly defined in the prototype
    return assign(create(null), wire);
}

function getPublicPropertiesHash(
    target: ComponentConstructor,
    props: PropsDef | undefined,
): PropsDef {
    if (isUndefined(props) || getOwnPropertyNames(props).length === 0) {
        return EmptyObject;
    }
    return getOwnPropertyNames(props).reduce((propsHash: PropsDef, propName: string): PropsDef => {
        const attrName = getAttrNameFromPropName(propName);
        if (process.env.NODE_ENV !== 'production') {
            const globalHTMLProperty = getGlobalHTMLPropertiesInfo()[propName];
            if (
                globalHTMLProperty &&
                globalHTMLProperty.attribute &&
                globalHTMLProperty.reflective === false
            ) {
                const { error, attribute, experimental } = globalHTMLProperty;
                const msg: string[] = [];
                if (error) {
                    msg.push(error);
                } else if (experimental) {
                    msg.push(
                        `"${propName}" is an experimental property that is not standardized or supported by all browsers. You should not use "${propName}" and attribute "${attribute}" in your component.`,
                    );
                } else {
                    msg.push(
                        `"${propName}" is a global HTML property. Instead access it via the reflective attribute "${attribute}" with one of these techniques:`,
                    );
                    msg.push(
                        `  * Use \`this.getAttribute("${attribute}")\` to access the attribute value. This option is best suited for accessing the value in a getter during the rendering process.`,
                    );
                }
                assert.logError(msg.join('\n'));
            }
        }

        propsHash[propName] = assign(
            {
                config: 0,
                type: 'any',
                attr: attrName,
            },
            props[propName],
        );
        return propsHash;
    }, create(null));
}

function getPublicMethodsHash(
    target: ComponentConstructor,
    publicMethods: string[] | undefined,
): MethodDef {
    if (isUndefined(publicMethods) || publicMethods.length === 0) {
        return EmptyObject;
    }
    return publicMethods.reduce((methodsHash: MethodDef, methodName: string): MethodDef => {
        if (process.env.NODE_ENV !== 'production') {
            assert.isTrue(
                isFunction(target.prototype[methodName]),
                `Component "${target.name}" should have a method \`${methodName}\` instead of ${
                    target.prototype[methodName]
                }.`,
            );
        }
        methodsHash[methodName] = target.prototype[methodName];
        return methodsHash;
    }, create(null));
}
