/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { LightningElement, WireAdapterConstructor, wire } from 'lwc';

type TestConfig = { config: 'config' };
type TestValue = { value: 'value' };
type TestContext = { context: 'context' };
type DeepConfig = { deep: { config: number } };

declare const testConfig: TestConfig;
declare const testValue: TestValue;
declare const TestAdapter: WireAdapterConstructor<TestConfig, TestValue, TestContext>;
declare const AnyAdapter: any;
declare const InvalidAdapter: object;
declare const DeepConfigAdapter: WireAdapterConstructor<DeepConfig, TestValue>;

// @ts-expect-error bare decorator cannot be used
wire(FakeWireAdapter, { config: 'config' })();

// @ts-expect-error decorator cannot be used on classes
@wire(FakeWireAdapter, { config: 'config' })
export class InvalidContext extends LightningElement {}

/** Validations for decorated properties/fields */
export class PropertyDecorators extends LightningElement {
    // Helper props
    configProp = 'config' as const;
    nested = { prop: 'config', invalid: 123 } as const;
    'nested.prop' = false; // should be unused
    number = 123;
    // --- VALID --- //
    // Valid - basic
    @wire(TestAdapter, { config: 'config' })
    basic?: TestValue;
    @wire(TestAdapter, { config: '$config' })
    simpleReactive?: TestValue;
    @wire(TestAdapter, { config: '$nested.prop' })
    nestedReactive?: TestValue;
    @wire(TestAdapter, testConfig)
    configVariable?: TestValue;
    // Valid - as const
    @wire(TestAdapter, { config: 'config' } as const)
    basicAsConst?: TestValue;
    @wire(TestAdapter, { config: '$configProp' } as const)
    simpleReactiveAsConst?: TestValue;
    @wire(TestAdapter, { config: '$nested.prop' } as const)
    nestedReactiveAsConst?: TestValue;
    // Valid - using `any`
    @wire(TestAdapter, {} as any)
    configAsAny?: TestValue;
    @wire(TestAdapter, { config: 'config' })
    propAsAny?: any;
    @wire(AnyAdapter, { config: 'config' })
    adapterAsAny?: TestValue;
    @wire(AnyAdapter, { other: ['value'] })
    adapterAsAnyOtherValues?: null;
    // Valid - prop assignment
    @wire(TestAdapter, { config: 'config' })
    nonNullAssertion!: TestValue;
    @wire(TestAdapter, { config: 'config' })
    explicitDefaultType: TestValue = testValue;
    @wire(TestAdapter, { config: 'config' })
    implicitDefaultType = testValue;

    // --- INVALID --- //
    // @ts-expect-error Invalid adapter type
    @wire(InvalidAdapter, { config: 'config' })
    invalidAdapter?: TestValue;
    // @ts-expect-error Too many wire parameters
    @wire(TestAdapter, { config: 'config' }, {})
    tooManyWireParams?: TestValue;
    // @ts-expect-error Bad config type
    @wire(TestAdapter, { bad: 'value' })
    badConfig?: TestValue;
    // @ts-expect-error Bad prop type
    @wire(TestAdapter, { config: 'config' })
    badPropType?: { bad: 'value' };
    // @ts-expect-error Prop must be optional or assigned in constructor
    @wire(TestAdapter, { config: 'config' }) notOptional: TestValue;
    // @ts-expect-error Referenced reactive prop does not exist
    @wire(TestAdapter, { config: '$nonexistentProp' } as const)
    nonExistentReactiveProp?: TestValue;
    // @ts-expect-error Referenced reactive prop is the wrong type
    @wire(TestAdapter, { config: '$number' } as const)
    numberReactiveProp?: TestValue;
    // @ts-expect-error Referenced nested reactive prop does not exist
    @wire(TestAdapter, { config: '$nested.nonexistent' } as const)
    nonexistentNestedReactiveProp?: TestValue;
    // @ts-expect-error Referenced nested reactive prop does not exist
    @wire(TestAdapter, { config: '$nested.invalid' } as const)
    invalidNestedReactiveProp?: TestValue;
    // @ts-expect-error Incorrect non-reactive string literal type
    @wire(TestAdapter, { config: 'not reactive' } as const)
    nonReactiveStringLiteral?: TestValue;
    // @ts-expect-error Nested props are not reactive - only top level
    @wire(DeepConfigAdapter, { deep: { config: '$number' } } as const)
    deepReactive?: TestValue;
    // @ts-expect-error Looks like a method, but it's actually a prop
    @wire(TestAdapter, { config: 'config' })
    weird = (_: TestValue): void => {};

    // --- AMBIGUOUS --- //
    // Passing a config is optional because adapters don't strictly need to use it.
    // Can we be smarter about the type and require a config, but only if the adapter does?
    @wire(TestAdapter)
    noConfig?: TestValue;
    // Because the basic type `string` could be _any_ string, we can't narrow it and compare against
    // the component's props, so we must accept all string props, even if they're incorrect.
    // We could technically be strict, and enforce that all configs objects use `as const`, but very
    // few projects currently use it (there is no need) and the error reported is not simple to
    // understand.
    @wire(TestAdapter, { config: 'incorrect' })
    wrongConfigButInferredAsString?: TestValue;
    // People shouldn't do this, and they probably never (heh) will. TypeScript allows it, though.
    @wire(TestAdapter, { config: 'config' })
    never?: never;
}

/** Validations for decorated methods */

export class MethodDecorators extends LightningElement {
    // Helper props
    configProp = 'config' as const;
    nested = { prop: 'config', invalid: 123 } as const;
    'nested.prop' = false; // should be unused
    number = 123;
    // --- VALID --- //
    // Valid - basic
    @wire(TestAdapter, { config: 'config' })
    basic(_: TestValue) {}
    @wire(TestAdapter, { config: 'config' })
    async asyncMethod(_: TestValue) {}
    @wire(TestAdapter, { config: '$config' })
    simpleReactive(_: TestValue) {}
    @wire(TestAdapter, { config: '$nested.prop' })
    nestedReactive(_: TestValue) {}
    @wire(TestAdapter, testConfig)
    optionalParam(_?: TestValue) {}
    @wire(TestAdapter, testConfig)
    noParam() {}
    // Valid - as const
    @wire(TestAdapter, { config: 'config' } as const)
    basicAsConst(_: TestValue) {}
    @wire(TestAdapter, { config: '$configProp' } as const)
    simpleReactiveAsConst(_: TestValue) {}
    @wire(TestAdapter, { config: '$nested.prop' } as const)
    nestedReactiveAsConst(_: TestValue) {}
    // Valid - using `any`
    @wire(TestAdapter, {} as any)
    configAsAny(_: TestValue) {}
    @wire(TestAdapter, { config: 'config' })
    paramAsAny(_: any) {}
    @wire(AnyAdapter, { config: 'config' })
    adapterAsAny(_: TestValue) {}

    // --- INVALID --- //
    // @ts-expect-error Invalid adapter type
    @wire(InvalidAdapter, { config: 'config' })
    invalidAdapter(_: TestValue) {}
    // @ts-expect-error Too many wire parameters
    @wire(TestAdapter, { config: 'config' }, {})
    tooManyWireParams(_: TestValue) {}
    // @ts-expect-error Too many method parameters
    @wire(TestAdapter, { config: 'config' })
    tooManyParameters(_a: TestValue, _b: TestValue) {}
    // @ts-expect-error Bad config type
    @wire(TestAdapter, { bad: 'value' })
    badConfig(_: TestValue): void {}
    // @ts-expect-error Bad prop type
    @wire(TestAdapter, { config: 'config' })
    badParamType(_: { bad: 'value' }): void {}
    // @ts-expect-error Referenced reactive prop does not exist
    @wire(TestAdapter, { config: '$nonexistentProp' } as const)
    nonExistentReactiveProp(_: TestValue): void {}
    // @ts-expect-error Referenced reactive prop is the wrong type
    @wire(TestAdapter, { config: '$number' } as const)
    numberReactiveProp(_: TestValue): void {}
    // @ts-expect-error Referenced nested reactive prop does not exist
    @wire(TestAdapter, { config: '$nested.nonexistent' } as const)
    nonexistentNestedReactiveProp(_: TestValue): void {}
    // @ts-expect-error Referenced nested reactive prop does not exist
    @wire(TestAdapter, { config: '$nested.invalid' } as const)
    invalidNestedReactiveProp(_: TestValue): void {}
    // @ts-expect-error Incorrect non-reactive string literal type
    @wire(TestAdapter, { config: 'not reactive' } as const)
    nonReactiveStringLiteral(_: TestValue): void {}
    // @ts-expect-error Nested props are not reactive - only top level
    @wire(DeepConfigAdapter, { deep: { config: '$number' } } as const)
    deepReactive(_: TestValue): void {}
    // @ts-expect-error Param type looks like decorated method (validating type inference workaround)
    @wire(TestAdapter, { config: 'config' })
    paramIsMethod(_: (inner: TestValue) => void) {}

    // --- AMBIGUOUS --- //
    // Passing a config is optional because adapters don't strictly need to use it.
    // Can we be smarter about the type and require a config, but only if the adapter does?
    @wire(TestAdapter)
    noConfig(_: TestValue): void {}
    // Because the basic type `string` could be _any_ string, we can't narrow it and compare against
    // the component's props, so we must accept all string props, even if they're incorrect.
    // We could technically be strict, and enforce that all configs objects use `as const`, but very
    // few projects currently use it (there is no need) and the error reported is not simple to
    // understand.
    @wire(TestAdapter, { config: 'incorrect' })
    wrongConfigButInferredAsString(_: TestValue): void {}
    // Wire adapters shouldn't use default params, but the type system doesn't know the difference
    @wire(TestAdapter, { config: 'config' })
    implicitDefaultType(_ = testValue) {}
}
