import { LightningElement, wire } from 'lwc';
import { TestAdapter, AnyAdapter, InvalidAdapter, DeepConfigAdapter, testValue } from './index';
import type { TestValue } from './index';

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
    @wire(TestAdapter, { config: 'incorrect' as string })
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
    @wire(TestAdapterWithImperative, { config: 'incorrect' as string })
    wrongConfigButInferredAsString(_: TestValue): void {}
    // Wire adapters shouldn't use default params, but the type system doesn't know the difference
    @wire(TestAdapterWithImperative, { config: 'config' })
    implicitDefaultType(_ = testValue) {}
}
