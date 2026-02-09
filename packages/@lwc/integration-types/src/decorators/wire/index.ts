/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { LightningElement, wire } from 'lwc';
import type { WireAdapterConstructor } from 'lwc';

// Helper types
type TestConfig = { config: number };
type DeepConfig = { deep: { config: number } };
export type TestValue = 'test value';

// Adapters
export declare const TestAdapter: WireAdapterConstructor<TestConfig, TestValue>;
export declare const AnyAdapter: any;
export declare const InvalidAdapter: object;
export declare const NoConfigAdapter: WireAdapterConstructor<never, TestValue>;
export declare const DeepConfigAdapter: WireAdapterConstructor<DeepConfig, TestValue>;
export declare const ImperativeAdapter: { adapter: typeof TestAdapter };

// Values
export declare const testConfig: TestConfig;
export declare const testValue: TestValue;

/** Defines the props used in the other test classes */
export class Props extends LightningElement {
    numberProp = +1.2_3e-4;
    optionalNumber?: number;
    stringProp = 'arrivederci';
    objectProp = { nestedNumber: 123, nestedBoolean: true };
    'inaccessible.prop'?: number;
    // Not used directly, but helps validate that the reactive config doesn't use this
    'objectProp.nestedNumber' = false;

    // Cannot be used as the parent of a nested reactive prop because it has no props
    methodWithoutProp() {}
    // *Can* be used as the parent of a nested reactive prop because it has a prop
    methodWithProp?: {
        (): void;
        theProp?: number;
    };
}

// --- Generic test cases --- //

// @ts-expect-error bare decorator cannot be used
wire(TestAdapter, { config: 'config' })();

// @ts-expect-error decorator cannot be used on classes
@wire(TestAdapter, { config: 'config' })
export class InvalidContext extends LightningElement {}
