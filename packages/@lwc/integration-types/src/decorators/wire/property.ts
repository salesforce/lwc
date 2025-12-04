import { LightningElement, wire } from 'lwc';
import {
    TestAdapter,
    testConfig,
    AnyAdapter,
    testValue,
    TestAdapterNoConfig,
    ImperativeAdapter,
    type TestValue,
} from './types';

/** Validations for decorated properties/fields */
export class PropertyDecorators extends LightningElement {
    // Helper props
    configProp = 'config' as const;
    nested = { prop: 'config', invalid: 123 } as const;
    // 'nested.prop' is not directly used, but helps validate that the reactive config resolution
    // uses the object above, rather than a weird prop name
    'nested.prop' = false;
    number = 123;
    anyProp: any;

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
    @wire(TestAdapter, { config: '$anyProp' })
    refAnyTypeProp = testValue;
    @wire(TestAdapter, { config: '$anyProp.nested.because.any' })
    refAnyTypeNestedProp = testValue;
    @wire(TestAdapterNoConfig)
    adapterRefusesConfig?: TestValue;

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
    // @ts-expect-error config limited to specific string or valid reactive prop
    @wire(TestAdapter, { config: 'incorrect' })
    wrongConfigButInferredAsString?: TestValue;
    // @ts-expect-error Nested props are not reactive - only top level
    @wire(DeepConfigAdapter, { deep: { config: '$number' } } as const)
    deepReactive?: TestValue;
    // @ts-expect-error Looks like a method, but it's actually a prop
    @wire(TestAdapter, { config: 'config' })
    propValueIsMethod = function (this: PropertyDecorators, _: TestValue): void {};
    // @ts-expect-error config now allowed
    @wire(TestAdapterNoConfig, {})
    forcingConfigOnAdapter?: TestValue;

    // --- AMBIGUOUS --- //
    // Passing a config is optional because adapters don't strictly need to use it.
    // Can we be smarter about the type and require a config, but only if the adapter does?
    @wire(TestAdapter)
    noConfig?: TestValue;
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
    @wire(ImperativeAdapter, { config: 'config' })
    basic?: TestValue;
    @wire(ImperativeAdapter, { config: '$configProp' })
    simpleReactive?: TestValue;
    @wire(ImperativeAdapter, { config: '$nested.prop' })
    nestedReactive?: TestValue;
    // Valid - as const
    @wire(ImperativeAdapter, { config: 'config' } as const)
    basicAsConst?: TestValue;
    @wire(ImperativeAdapter, { config: '$configProp' } as const)
    simpleReactiveAsConst?: TestValue;
    // Valid - using `any`
    @wire(ImperativeAdapter, {} as any)
    configAsAny?: TestValue;
    @wire(ImperativeAdapter, { config: 'config' })
    propAsAny?: any;
    // Valid - prop assignment
    @wire(ImperativeAdapter, { config: 'config' })
    nonNullAssertion!: TestValue;
    @wire(ImperativeAdapter, { config: 'config' })
    explicitDefaultType: TestValue = testValue;
    @wire(ImperativeAdapter, { config: 'config' })
    implicitDefaultType = testValue;

    // --- INVALID --- //
    // @ts-expect-error Too many wire parameters
    @wire(ImperativeAdapter, { config: 'config' }, {})
    tooManyWireParams?: TestValue;
    // @ts-expect-error Bad config type
    @wire(ImperativeAdapter, { bad: 'value' })
    badConfig?: TestValue;
    // @ts-expect-error Bad prop type
    @wire(ImperativeAdapter, { config: 'config' })
    badPropType?: { bad: 'value' };
    // @ts-expect-error Referenced reactive prop does not exist
    @wire(ImperativeAdapter, { config: '$nonexistentProp' } as const)
    nonExistentReactiveProp?: TestValue;

    // --- AMBIGUOUS --- //
    // Passing a config is optional because adapters don't strictly need to use it.
    // Can we be smarter about the type and require a config, but only if the adapter does?
    @wire(ImperativeAdapter)
    noConfig?: TestValue;
    // @ts-expect-error config limited to specific string or valid reactive prop
    @wire(ImperativeAdapter, { config: 'incorrect' })
    wrongConfigButInferredAsString?: TestValue;
    // People shouldn't do this, and they probably never (heh) will. TypeScript allows it, though.
    @wire(ImperativeAdapter, { config: 'config' })
    never?: never;
}
