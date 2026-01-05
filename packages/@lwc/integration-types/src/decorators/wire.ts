/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { LightningElement, wire } from 'lwc';
import type { WireAdapterConstructor } from 'lwc';

type TestConfig = { config: 'config' };
type TestValue = { value: 'value' };
type TestContext = { context: 'context' };
type DeepConfig = { deep: { config: number } };

declare const testConfig: TestConfig;
declare const testValue: TestValue;
declare const TestAdapter: WireAdapterConstructor<TestConfig, TestValue, TestContext>;
declare const TestAdapterWithImperative: {
    (config: TestConfig): TestValue;
    adapter: WireAdapterConstructor<TestConfig, TestValue, TestContext>;
};
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
    // 'nested.prop' is not directly used, but helps validate that the reactive config resolution
    // uses the object above, rather than a weird prop name
    'nested.prop' = false;
    number = 123;
    // --- VALID --- //
    // Valid - basic
    @wire(TestAdapter, { config: 'config' })
    basic?: TestValue;
    @wire(TestAdapter, { config: '$configProp' })
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
    // @ts-expect-error Missing wire parameters
    @wire()
    missingWireParams?: TestValue;
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
    propValueIsMethod = function (this: PropertyDecorators, _: TestValue): void {};

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

/** Validations for decorated properties/fields */
export class PropertyDecoratorsWithImperative extends LightningElement {
    // Helper props
    configProp = 'config' as const;
    nested = { prop: 'config', invalid: 123 } as const;
    // 'nested.prop' is not directly used, but helps validate that the reactive config resolution
    // uses the object above, rather than a weird prop name
    'nested.prop' = false;
    number = 123;
    // --- VALID --- //
    // Valid - basic
    @wire(TestAdapterWithImperative, { config: 'config' })
    basic?: TestValue;
    @wire(TestAdapterWithImperative, { config: '$configProp' })
    simpleReactive?: TestValue;
    @wire(TestAdapterWithImperative, { config: '$nested.prop' })
    nestedReactive?: TestValue;
    // Valid - as const
    @wire(TestAdapterWithImperative, { config: 'config' } as const)
    basicAsConst?: TestValue;
    @wire(TestAdapterWithImperative, { config: '$configProp' } as const)
    simpleReactiveAsConst?: TestValue;
    // Valid - using `any`
    @wire(TestAdapterWithImperative, {} as any)
    configAsAny?: TestValue;
    @wire(TestAdapterWithImperative, { config: 'config' })
    propAsAny?: any;
    // Valid - prop assignment
    @wire(TestAdapterWithImperative, { config: 'config' })
    nonNullAssertion!: TestValue;
    @wire(TestAdapterWithImperative, { config: 'config' })
    explicitDefaultType: TestValue = testValue;
    @wire(TestAdapterWithImperative, { config: 'config' })
    implicitDefaultType = testValue;

    // --- INVALID --- //
    // @ts-expect-error Too many wire parameters
    @wire(TestAdapterWithImperative, { config: 'config' }, {})
    tooManyWireParams?: TestValue;
    // @ts-expect-error Bad config type
    @wire(TestAdapterWithImperative, { bad: 'value' })
    badConfig?: TestValue;
    // @ts-expect-error Bad prop type
    @wire(TestAdapterWithImperative, { config: 'config' })
    badPropType?: { bad: 'value' };
    // @ts-expect-error Referenced reactive prop does not exist
    @wire(TestAdapterWithImperative, { config: '$nonexistentProp' } as const)
    nonExistentReactiveProp?: TestValue;

    // --- AMBIGUOUS --- //
    // Passing a config is optional because adapters don't strictly need to use it.
    // Can we be smarter about the type and require a config, but only if the adapter does?
    @wire(TestAdapterWithImperative)
    noConfig?: TestValue;
    // Because the basic type `string` could be _any_ string, we can't narrow it and compare against
    // the component's props, so we must accept all string props, even if they're incorrect.
    // We could technically be strict, and enforce that all configs objects use `as const`, but very
    // few projects currently use it (there is no need) and the error reported is not simple to
    // understand.
    @wire(TestAdapterWithImperative, { config: 'incorrect' })
    wrongConfigButInferredAsString?: TestValue;
    // People shouldn't do this, and they probably never (heh) will. TypeScript allows it, though.
    @wire(TestAdapterWithImperative, { config: 'config' })
    never?: never;
}

/** Validations for decorated methods */
export class MethodDecorators extends LightningElement {
    // Helper props
    configProp = 'config' as const;
    nested = { prop: 'config', invalid: 123 } as const;
    // 'nested.prop' is not directly used, but helps validate that the reactive config resolution
    // uses the object above, rather than a weird prop name
    'nested.prop' = false;
    number = 123;
    // --- VALID --- //
    // Valid - basic
    @wire(TestAdapter, { config: 'config' })
    basic(_: TestValue) {}
    @wire(TestAdapter, { config: 'config' })
    async asyncMethod(_: TestValue) {}
    @wire(TestAdapter, { config: '$configProp' })
    simpleReactive(_: TestValue) {}
    @wire(TestAdapter, { config: '$nested.prop' })
    nestedReactive(_: TestValue) {}
    @wire(TestAdapter, { config: '$configProp' })
    optionalParam(_?: TestValue) {}
    @wire(TestAdapter, { config: '$configProp' })
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
    // @ts-expect-error Missing wire parameters
    @wire()
    missingWireParams() {}
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

/** Validations for decorated methods */
export class MethodDecoratorsWithImperative extends LightningElement {
    // Helper props
    configProp = 'config' as const;
    nested = { prop: 'config', invalid: 123 } as const;
    // 'nested.prop' is not directly used, but helps validate that the reactive config resolution
    // uses the object above, rather than a weird prop name
    'nested.prop' = false;
    number = 123;
    // --- VALID --- //
    // Valid - basic
    @wire(TestAdapterWithImperative, { config: 'config' })
    basic(_: TestValue) {}
    @wire(TestAdapterWithImperative, { config: 'config' })
    async asyncMethod(_: TestValue) {}
    @wire(TestAdapterWithImperative, { config: '$configProp' })
    simpleReactive(_: TestValue) {}
    @wire(TestAdapterWithImperative, { config: '$nested.prop' })
    nestedReactive(_: TestValue) {}
    @wire(TestAdapterWithImperative, { config: '$configProp' })
    optionalParam(_?: TestValue) {}
    @wire(TestAdapterWithImperative, { config: '$configProp' })
    noParam() {}
    // Valid - as const
    @wire(TestAdapterWithImperative, { config: 'config' } as const)
    basicAsConst(_: TestValue) {}
    @wire(TestAdapterWithImperative, { config: '$configProp' } as const)
    simpleReactiveAsConst(_: TestValue) {}
    @wire(TestAdapterWithImperative, { config: '$nested.prop' } as const)
    nestedReactiveAsConst(_: TestValue) {}
    // Valid - using `any`
    @wire(TestAdapterWithImperative, {} as any)
    configAsAny(_: TestValue) {}
    @wire(TestAdapterWithImperative, { config: 'config' })
    paramAsAny(_: any) {}

    // --- INVALID --- //
    // @ts-expect-error Too many wire parameters
    @wire(TestAdapterWithImperative, { config: 'config' }, {})
    tooManyWireParams(_: TestValue) {}
    // @ts-expect-error Too many method parameters
    @wire(TestAdapterWithImperative, { config: 'config' })
    tooManyParameters(_a: TestValue, _b: TestValue) {}

    // --- AMBIGUOUS --- //
    // Passing a config is optional because adapters don't strictly need to use it.
    // Can we be smarter about the type and require a config, but only if the adapter does?
    @wire(TestAdapterWithImperative)
    noConfig(_: TestValue): void {}
    // Because the basic type `string` could be _any_ string, we can't narrow it and compare against
    // the component's props, so we must accept all string props, even if they're incorrect.
    // We could technically be strict, and enforce that all configs objects use `as const`, but very
    // few projects currently use it (there is no need) and the error reported is not simple to
    // understand.
    @wire(TestAdapterWithImperative, { config: 'incorrect' })
    wrongConfigButInferredAsString(_: TestValue): void {}
    // Wire adapters shouldn't use default params, but the type system doesn't know the difference
    @wire(TestAdapterWithImperative, { config: 'config' })
    implicitDefaultType(_ = testValue) {}
}

/** Validations for decorated getters */
export class GetterDecorators extends LightningElement {
    // Helper props
    configProp = 'config' as const;
    nested = { prop: 'config', invalid: 123 } as const;
    // 'nested.prop' is not directly used, but helps validate that the reactive config resolution
    // uses the object above, rather than a weird prop name
    'nested.prop' = false;
    number = 123;
    // --- VALID --- //

    // Valid - basic
    @wire(TestAdapter, { config: 'config' })
    get basic() {
        return testValue;
    }
    @wire(TestAdapter, { config: 'config' })
    get undefined() {
        // The function implementation of a wired getter is ignored, but TypeScript enforces that
        // we must return something. Since we don't have any data to return, we return `undefined`
        return undefined;
    }
    @wire(TestAdapter, { config: '$configProp' })
    get simpleReactive() {
        return testValue;
    }
    @wire(TestAdapter, { config: '$nested.prop' })
    get nestedReactive() {
        return testValue;
    }
    // Valid - as const
    @wire(TestAdapter, { config: 'config' } as const)
    get basicAsConst() {
        return testValue;
    }
    @wire(TestAdapter, { config: '$configProp' } as const)
    get simpleReactiveAsConst() {
        return testValue;
    }
    @wire(TestAdapter, { config: '$nested.prop' } as const)
    get nestedReactiveAsConst() {
        return testValue;
    }
    // Valid - using `any`
    @wire(TestAdapter, {} as any)
    get configAsAny() {
        return testValue;
    }
    @wire(TestAdapter, { config: 'config' })
    get valueAsAny() {
        return null as any;
    }
    @wire(AnyAdapter, { config: 'config' })
    get adapterAsAny() {
        return testValue;
    }
    @wire(AnyAdapter, { config: 'config' })
    get anyAdapterOtherValue() {
        return 12345;
    }

    // --- INVALID --- //
    // @ts-expect-error Invalid adapter type
    @wire(InvalidAdapter, { config: 'config' })
    get invalidAdapter() {
        return testValue;
    }
    // @ts-expect-error Too many wire parameters
    @wire(TestAdapter, { config: 'config' }, {})
    get tooManyWireParams() {
        return testValue;
    }
    // @ts-expect-error Missing wire parameters
    @wire()
    get missingWireParams() {
        return testValue;
    }
    // @ts-expect-error Bad config type
    @wire(TestAdapter, { bad: 'value' })
    get badConfig() {
        return testValue;
    }
    // @ts-expect-error Bad value type
    @wire(TestAdapter, { config: 'config' })
    get badValueType() {
        return { bad: 'value' };
    }
    // @ts-expect-error Referenced reactive prop does not exist
    @wire(TestAdapter, { config: '$nonexistentProp' } as const)
    get nonExistentReactiveProp() {
        return testValue;
    }
    // @ts-expect-error Referenced reactive prop is the wrong type
    @wire(TestAdapter, { config: '$number' } as const)
    get numberReactiveProp() {
        return testValue;
    }
    // @ts-expect-error Referenced nested reactive prop does not exist
    @wire(TestAdapter, { config: '$nested.nonexistent' } as const)
    get nonexistentNestedReactiveProp() {
        return testValue;
    }
    // @ts-expect-error Referenced nested reactive prop does not exist
    @wire(TestAdapter, { config: '$nested.invalid' } as const)
    get invalidNestedReactiveProp() {
        return testValue;
    }
    // @ts-expect-error Incorrect non-reactive string literal type
    @wire(TestAdapter, { config: 'not reactive' } as const)
    get nonReactiveStringLiteral() {
        return testValue;
    }
    // @ts-expect-error Nested props are not reactive - only top level
    @wire(DeepConfigAdapter, { deep: { config: '$number' } } as const)
    get deepReactive() {
        return testValue;
    }
}

/** Validations for decorated getters */
export class GetterDecoratorsWithImperative extends LightningElement {
    // Helper props
    configProp = 'config' as const;
    nested = { prop: 'config', invalid: 123 } as const;
    // 'nested.prop' is not directly used, but helps validate that the reactive config resolution
    // uses the object above, rather than a weird prop name
    'nested.prop' = false;
    number = 123;
    // --- VALID --- //

    // Valid - basic
    @wire(TestAdapterWithImperative, { config: 'config' })
    get basic() {
        return testValue;
    }
    @wire(TestAdapterWithImperative, { config: 'config' })
    get undefined() {
        // The function implementation of a wired getter is ignored, but TypeScript enforces that
        // we must return something. Since we don't have any data to return, we return `undefined`
        return undefined;
    }
    @wire(TestAdapterWithImperative, { config: '$configProp' })
    get simpleReactive() {
        return testValue;
    }
    @wire(TestAdapterWithImperative, { config: '$nested.prop' })
    get nestedReactive() {
        return testValue;
    }
    // Valid - using `any`
    @wire(TestAdapterWithImperative, {} as any)
    get configAsAny() {
        return testValue;
    }
    @wire(TestAdapterWithImperative, { config: 'config' })
    get valueAsAny() {
        return null as any;
    }

    // --- INVALID --- //
    // @ts-expect-error Too many wire parameters
    @wire(TestAdapterWithImperative, { config: 'config' }, {})
    get tooManyWireParams() {
        return testValue;
    }
    // @ts-expect-error Bad config type
    @wire(TestAdapterWithImperative, { bad: 'value' })
    get badConfig() {
        return testValue;
    }
    // @ts-expect-error Bad value type
    @wire(TestAdapterWithImperative, { config: 'config' })
    get badValueType() {
        return { bad: 'value' };
    }
    // @ts-expect-error Referenced reactive prop does not exist
    @wire(TestAdapterWithImperative, { config: '$nonexistentProp' } as const)
    get nonExistentReactiveProp() {
        return testValue;
    }
}

/** Validations for decorated setters */
export class Setter extends LightningElement {
    // Helper props
    configProp = 'config' as const;
    nested = { prop: 'config', invalid: 123 } as const;
    // 'nested.prop' is not directly used, but helps validate that the reactive config resolution
    // uses the object above, rather than a weird prop name
    'nested.prop' = false;
    number = 123;
    // --- VALID --- //

    // Valid - basic
    @wire(TestAdapter, { config: 'config' })
    set basic(_: TestValue) {}
    @wire(TestAdapter, { config: '$configProp' })
    set simpleReactive(_: TestValue) {}
    @wire(TestAdapter, { config: '$nested.prop' })
    set nestedReactive(_: TestValue) {}
    // Valid - as const
    @wire(TestAdapter, { config: 'config' } as const)
    set basicAsConst(_: TestValue) {}
    @wire(TestAdapter, { config: '$configProp' } as const)
    set simpleReactiveAsConst(_: TestValue) {}
    @wire(TestAdapter, { config: '$nested.prop' } as const)
    set nestedReactiveAsConst(_: TestValue) {}
    // Valid - using `any`
    @wire(TestAdapter, {} as any)
    set configAsAny(_: TestValue) {}
    @wire(TestAdapter, { config: 'config' })
    set valueAsAny(_: any) {}
    @wire(AnyAdapter, { config: 'config' })
    set adapterAsAny(_: TestValue) {}
    @wire(AnyAdapter, { config: 'config' })
    set anyAdapterOtherValue(_: 12345) {}

    // --- INVALID --- //
    // @ts-expect-error Invalid adapter type
    @wire(InvalidAdapter, { config: 'config' })
    set invalidAdapter(_: TestValue) {}
    // @ts-expect-error Too many wire parameters
    @wire(TestAdapter, { config: 'config' }, {})
    set tooManyWireParams(_: TestValue) {}
    // @ts-expect-error Missing wire parameters
    @wire()
    set missingWireParams(_: TestValue) {}
    // @ts-expect-error Bad config type
    @wire(TestAdapter, { bad: 'value' })
    set badConfig(_: TestValue) {}
    // @ts-expect-error Bad value type
    @wire(TestAdapter, { config: 'config' })
    set badValueType(_: { bad: 'value' }) {}
    // @ts-expect-error Referenced reactive prop does not exist
    @wire(TestAdapter, { config: '$nonexistentProp' } as const)
    set nonExistentReactiveProp(_: TestValue) {}
    // @ts-expect-error Referenced reactive prop is the wrong type
    @wire(TestAdapter, { config: '$number' } as const)
    set numberReactiveProp(_: TestValue) {}
    // @ts-expect-error Referenced nested reactive prop does not exist
    @wire(TestAdapter, { config: '$nested.nonexistent' } as const)
    set nonexistentNestedReactiveProp(_: TestValue) {}
    // @ts-expect-error Referenced nested reactive prop does not exist
    @wire(TestAdapter, { config: '$nested.invalid' } as const)
    set invalidNestedReactiveProp(_: TestValue) {}
    // @ts-expect-error Incorrect non-reactive string literal type
    @wire(TestAdapter, { config: 'not reactive' } as const)
    set nonReactiveStringLiteral(_: TestValue) {}
    // @ts-expect-error Nested props are not reactive - only top level
    @wire(DeepConfigAdapter, { deep: { config: '$number' } } as const)
    set deepReactive(_: TestValue) {}
}

/** Validations for decorated setters */
export class SetterWithImperative extends LightningElement {
    // Helper props
    configProp = 'config' as const;
    nested = { prop: 'config', invalid: 123 } as const;
    // 'nested.prop' is not directly used, but helps validate that the reactive config resolution
    // uses the object above, rather than a weird prop name
    'nested.prop' = false;
    number = 123;
    // --- VALID --- //

    // Valid - basic
    @wire(TestAdapterWithImperative, { config: 'config' })
    set basic(_: TestValue) {}
    @wire(TestAdapterWithImperative, { config: '$configProp' })
    set simpleReactive(_: TestValue) {}
    @wire(TestAdapterWithImperative, { config: '$nested.prop' })
    set nestedReactive(_: TestValue) {}
    // Valid - as const
    @wire(TestAdapterWithImperative, { config: 'config' } as const)
    set basicAsConst(_: TestValue) {}
    @wire(TestAdapterWithImperative, { config: '$configProp' } as const)
    set simpleReactiveAsConst(_: TestValue) {}
    @wire(TestAdapterWithImperative, { config: '$nested.prop' } as const)
    set nestedReactiveAsConst(_: TestValue) {}
    // Valid - using `any`
    @wire(TestAdapterWithImperative, {} as any)
    set configAsAny(_: TestValue) {}
    @wire(TestAdapterWithImperative, { config: 'config' })
    set valueAsAny(_: any) {}

    // --- INVALID --- //
    // @ts-expect-error Too many wire parameters
    @wire(TestAdapterWithImperative, { config: 'config' }, {})
    set tooManyWireParams(_: TestValue) {}
    // @ts-expect-error Bad config type
    @wire(TestAdapterWithImperative, { bad: 'value' })
    set badConfig(_: TestValue) {}
    // @ts-expect-error Bad value type
    @wire(TestAdapterWithImperative, { config: 'config' })
    set badValueType(_: { bad: 'value' }) {}
    // @ts-expect-error Referenced reactive prop does not exist
    @wire(TestAdapterWithImperative, { config: '$nonexistentProp' } as const)
    set nonExistentReactiveProp(_: TestValue) {}
    // @ts-expect-error Referenced reactive prop is the wrong type
    @wire(TestAdapterWithImperative, { config: '$number' } as const)
    set numberReactiveProp(_: TestValue) {}
    // @ts-expect-error Referenced nested reactive prop does not exist
    @wire(TestAdapterWithImperative, { config: '$nested.nonexistent' } as const)
    set nonexistentNestedReactiveProp(_: TestValue) {}
    // @ts-expect-error Referenced nested reactive prop does not exist
    @wire(TestAdapterWithImperative, { config: '$nested.invalid' } as const)
    set invalidNestedReactiveProp(_: TestValue) {}
    // @ts-expect-error Incorrect non-reactive string literal type
    @wire(TestAdapterWithImperative, { config: 'not reactive' } as const)
    set nonReactiveStringLiteral(_: TestValue) {}
}

// import { LightningElement, wire, type WireAdapterConstructor } from 'lwc';
declare const Adapter: WireAdapterConstructor<{ id: number }, object>;
export default class Component extends LightningElement {
    prop?: number;
    bool?: boolean;
    @wire(Adapter, { id: '$bool' } as const) wired?: object;
}
