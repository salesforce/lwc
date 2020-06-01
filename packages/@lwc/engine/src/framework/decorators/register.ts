/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    assert,
    create,
    isFunction,
    isUndefined,
    forEach,
    defineProperty,
    getOwnPropertyDescriptor,
    toString,
    isFalse,
} from '@lwc/shared';
import { ComponentConstructor } from '../component';
import { internalWireFieldDecorator } from './wire';
import { internalTrackDecorator } from './track';
import { createPublicPropertyDescriptor, createPublicAccessorDescriptor } from './api';
import {
    WireAdapterConstructor,
    storeWiredMethodMeta,
    storeWiredFieldMeta,
    ConfigCallback,
} from '../wiring';
import { EmptyObject } from '../utils';
import { createObservedFieldPropertyDescriptor } from '../observed-fields';

// data produced by compiler
type WireCompilerMeta = Record<string, WireCompilerDef>;
type TrackCompilerMeta = Record<string, 1>;
type MethodCompilerMeta = string[];
type PropCompilerMeta = Record<string, PropCompilerDef>;
export enum PropType {
    Field = 0,
    Set = 1,
    Get = 2,
    GetSet = 3,
}

interface PropCompilerDef {
    config: PropType; // 0 m
    type: string; // TODO [#1301]: make this an enum
}
interface WireCompilerDef {
    method?: number;
    adapter: WireAdapterConstructor;
    config: ConfigCallback;
    dynamic?: string[];
}
interface RegisterDecoratorMeta {
    readonly publicMethods?: MethodCompilerMeta;
    readonly publicProps?: PropCompilerMeta;
    readonly track?: TrackCompilerMeta;
    readonly wire?: WireCompilerMeta;
    readonly fields?: string[];
}

function validateObservedField(
    Ctor: ComponentConstructor,
    fieldName: string,
    descriptor: PropertyDescriptor | undefined
) {
    if (process.env.NODE_ENV !== 'production') {
        if (!isUndefined(descriptor)) {
            assert.fail(`Compiler Error: Invalid field ${fieldName} declaration.`);
        }
    }
}

function validateFieldDecoratedWithTrack(
    Ctor: ComponentConstructor,
    fieldName: string,
    descriptor: PropertyDescriptor | undefined
) {
    if (process.env.NODE_ENV !== 'production') {
        if (!isUndefined(descriptor)) {
            assert.fail(`Compiler Error: Invalid @track ${fieldName} declaration.`);
        }
    }
}

function validateFieldDecoratedWithWire(
    Ctor: ComponentConstructor,
    fieldName: string,
    descriptor: PropertyDescriptor | undefined
) {
    if (process.env.NODE_ENV !== 'production') {
        if (!isUndefined(descriptor)) {
            assert.fail(`Compiler Error: Invalid @wire(...) ${fieldName} field declaration.`);
        }
    }
}

function validateMethodDecoratedWithWire(
    Ctor: ComponentConstructor,
    methodName: string,
    descriptor: PropertyDescriptor | undefined
) {
    if (process.env.NODE_ENV !== 'production') {
        if (
            isUndefined(descriptor) ||
            !isFunction(descriptor.value) ||
            isFalse(descriptor.writable)
        ) {
            assert.fail(`Compiler Error: Invalid @wire(...) ${methodName} method declaration.`);
        }
    }
}

function validateFieldDecoratedWithApi(
    Ctor: ComponentConstructor,
    fieldName: string,
    descriptor: PropertyDescriptor | undefined
) {
    if (process.env.NODE_ENV !== 'production') {
        if (!isUndefined(descriptor)) {
            assert.fail(`Compiler Error: Invalid @api ${fieldName} field declaration.`);
        }
    }
}

function validateAccessorDecoratedWithApi(
    Ctor: ComponentConstructor,
    fieldName: string,
    descriptor: PropertyDescriptor | undefined
) {
    if (process.env.NODE_ENV !== 'production') {
        if (isUndefined(descriptor)) {
            assert.fail(`Compiler Error: Invalid @api get ${fieldName} accessor declaration.`);
        } else if (isFunction(descriptor.set)) {
            assert.isTrue(
                isFunction(descriptor.get),
                `Compiler Error: Missing getter for property ${toString(
                    fieldName
                )} decorated with @api in ${Ctor}. You cannot have a setter without the corresponding getter.`
            );
        } else if (!isFunction(descriptor.get)) {
            assert.fail(`Compiler Error: Missing @api get ${fieldName} accessor declaration.`);
        }
    }
}

function validateMethodDecoratedWithApi(
    Ctor: ComponentConstructor,
    methodName: string,
    descriptor: PropertyDescriptor | undefined
) {
    if (process.env.NODE_ENV !== 'production') {
        if (
            isUndefined(descriptor) ||
            !isFunction(descriptor.value) ||
            isFalse(descriptor.writable)
        ) {
            assert.fail(`Compiler Error: Invalid @api ${methodName} method declaration.`);
        }
    }
}

/**
 * INTERNAL: This function can only be invoked by compiled code. The compiler
 * will prevent this function from being imported by user-land code.
 */
export function registerDecorators(
    Ctor: ComponentConstructor,
    meta: RegisterDecoratorMeta
): ComponentConstructor {
    const proto = Ctor.prototype;
    const { publicProps, publicMethods, wire, track, fields } = meta;
    const apiMethods: PropertyDescriptorMap = create(null);
    const apiFields: PropertyDescriptorMap = create(null);
    const wiredMethods: PropertyDescriptorMap = create(null);
    const wiredFields: PropertyDescriptorMap = create(null);
    const observedFields: PropertyDescriptorMap = create(null);
    const apiFieldsConfig: Record<string, PropType> = create(null);
    let descriptor: PropertyDescriptor | undefined;
    if (!isUndefined(publicProps)) {
        for (const fieldName in publicProps) {
            const propConfig = publicProps[fieldName];
            apiFieldsConfig[fieldName] = propConfig.config;

            descriptor = getOwnPropertyDescriptor(proto, fieldName);
            if (propConfig.config > 0) {
                // accessor declaration
                if (process.env.NODE_ENV !== 'production') {
                    validateAccessorDecoratedWithApi(Ctor, fieldName, descriptor);
                }
                if (isUndefined(descriptor)) {
                    throw new Error();
                }
                descriptor = createPublicAccessorDescriptor(fieldName, descriptor);
            } else {
                // field declaration
                if (process.env.NODE_ENV !== 'production') {
                    validateFieldDecoratedWithApi(Ctor, fieldName, descriptor);
                }
                descriptor = createPublicPropertyDescriptor(fieldName);
            }
            apiFields[fieldName] = descriptor;
            defineProperty(proto, fieldName, descriptor);
        }
    }
    if (!isUndefined(publicMethods)) {
        forEach.call(publicMethods, (methodName) => {
            descriptor = getOwnPropertyDescriptor(proto, methodName);
            if (process.env.NODE_ENV !== 'production') {
                validateMethodDecoratedWithApi(Ctor, methodName, descriptor);
            }
            if (isUndefined(descriptor)) {
                throw new Error();
            }
            apiMethods[methodName] = descriptor;
        });
    }
    if (!isUndefined(wire)) {
        for (const fieldOrMethodName in wire) {
            const { adapter, method, config: configCallback, dynamic = [] } = wire[
                fieldOrMethodName
            ];
            descriptor = getOwnPropertyDescriptor(proto, fieldOrMethodName);
            if (method === 1) {
                if (process.env.NODE_ENV !== 'production') {
                    assert.isTrue(
                        adapter,
                        `@wire on method "${fieldOrMethodName}": adapter id must be truthy.`
                    );
                    validateMethodDecoratedWithWire(Ctor, fieldOrMethodName, descriptor);
                }
                if (isUndefined(descriptor)) {
                    throw new Error();
                }
                wiredMethods[fieldOrMethodName] = descriptor;
                storeWiredMethodMeta(descriptor, adapter, configCallback, dynamic);
            } else {
                if (process.env.NODE_ENV !== 'production') {
                    assert.isTrue(
                        adapter,
                        `@wire on field "${fieldOrMethodName}": adapter id must be truthy.`
                    );
                    validateFieldDecoratedWithWire(Ctor, fieldOrMethodName, descriptor);
                }
                descriptor = internalWireFieldDecorator(fieldOrMethodName);
                wiredFields[fieldOrMethodName] = descriptor;
                storeWiredFieldMeta(descriptor, adapter, configCallback, dynamic);
                defineProperty(proto, fieldOrMethodName, descriptor);
            }
        }
    }

    if (!isUndefined(track)) {
        for (const fieldName in track) {
            descriptor = getOwnPropertyDescriptor(proto, fieldName);
            if (process.env.NODE_ENV !== 'production') {
                validateFieldDecoratedWithTrack(Ctor, fieldName, descriptor);
            }
            descriptor = internalTrackDecorator(fieldName);
            defineProperty(proto, fieldName, descriptor);
        }
    }
    if (!isUndefined(fields)) {
        for (let i = 0, n = fields.length; i < n; i++) {
            const fieldName = fields[i];
            descriptor = getOwnPropertyDescriptor(proto, fieldName);
            if (process.env.NODE_ENV !== 'production') {
                validateObservedField(Ctor, fieldName, descriptor);
            }
            observedFields[fieldName] = createObservedFieldPropertyDescriptor(fieldName);
        }
    }
    setDecoratorsMeta(Ctor, {
        apiMethods,
        apiFields,
        apiFieldsConfig,
        wiredMethods,
        wiredFields,
        observedFields,
    });
    return Ctor;
}

const signedDecoratorToMetaMap: Map<ComponentConstructor, DecoratorMeta> = new Map();

interface DecoratorMeta {
    readonly apiMethods: PropertyDescriptorMap;
    readonly apiFields: PropertyDescriptorMap;
    readonly apiFieldsConfig: Record<string, PropType>;
    readonly wiredMethods: PropertyDescriptorMap;
    readonly wiredFields: PropertyDescriptorMap;
    readonly observedFields: PropertyDescriptorMap;
}

function setDecoratorsMeta(Ctor: ComponentConstructor, meta: DecoratorMeta) {
    signedDecoratorToMetaMap.set(Ctor, meta);
}

const defaultMeta: DecoratorMeta = {
    apiMethods: EmptyObject,
    apiFields: EmptyObject,
    apiFieldsConfig: EmptyObject,
    wiredMethods: EmptyObject,
    wiredFields: EmptyObject,
    observedFields: EmptyObject,
};

export function getDecoratorsMeta(Ctor: ComponentConstructor): DecoratorMeta {
    const meta = signedDecoratorToMetaMap.get(Ctor);
    return isUndefined(meta) ? defaultMeta : meta;
}
