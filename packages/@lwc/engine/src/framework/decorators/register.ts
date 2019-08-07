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
import { getAttrNameFromPropName } from '../attributes';
import decorate, { DecoratorMap } from './decorate';

export interface PropDef {
    config: number;
    type: string; // TODO: #1301 - make this an enum
    attr: string;
}
export interface WireDef {
    method?: number;
    [key: string]: any;
}
export interface PropsDef {
    [key: string]: PropDef;
}
export interface TrackDef {
    [key: string]: 1;
}
type PublicMethod = (...args: any[]) => any;
export interface MethodDef {
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
    readonly fields?: string[];
}

export interface DecoratorMeta {
    wire: WireHash | undefined;
    track: TrackDef;
    props: PropsDef;
    methods: MethodDef;
    fields: string[] | undefined;
}

const signedDecoratorToMetaMap: Map<ComponentConstructor, DecoratorMeta> = new Map();

/**
 * INTERNAL: This function can only be invoked by compiled code. The compiler
 * will prevent this function from being imported by userland code.
 */
export function registerDecorators(
    Ctor: ComponentConstructor,
    meta: RegisterDecoratorMeta
): ComponentConstructor {
    const decoratorMap: DecoratorMap = create(null);
    const props = getPublicPropertiesHash(Ctor, meta.publicProps);
    const methods = getPublicMethodsHash(Ctor, meta.publicMethods);
    const wire = getWireHash(Ctor, meta.wire);
    const track = getTrackHash(Ctor, meta.track);
    const fields = meta.fields;
    signedDecoratorToMetaMap.set(Ctor, {
        props,
        methods,
        wire,
        track,
        fields,
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

    // TODO: #1302 - check that anything in `track` is correctly defined in the prototype
    return assign(create(null), track);
}

function getWireHash(
    target: ComponentConstructor,
    wire: WireHash | undefined
): WireHash | undefined {
    if (isUndefined(wire) || getOwnPropertyNames(wire).length === 0) {
        return;
    }

    // TODO: #1302 - check that anything in `wire` is correctly defined in the prototype
    return assign(create(null), wire);
}

function getPublicPropertiesHash(
    target: ComponentConstructor,
    props: PropsDef | undefined
): PropsDef {
    if (isUndefined(props) || getOwnPropertyNames(props).length === 0) {
        return EmptyObject;
    }
    return getOwnPropertyNames(props).reduce((propsHash: PropsDef, propName: string): PropsDef => {
        const attr = getAttrNameFromPropName(propName);
        propsHash[propName] = assign(
            {
                config: 0,
                type: 'any',
                attr,
            },
            props[propName]
        );
        return propsHash;
    }, create(null));
}

function getPublicMethodsHash(
    target: ComponentConstructor,
    publicMethods: string[] | undefined
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
                }.`
            );
        }
        methodsHash[methodName] = target.prototype[methodName];
        return methodsHash;
    }, create(null));
}
