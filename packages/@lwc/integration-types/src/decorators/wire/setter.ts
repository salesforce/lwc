import { LightningElement, wire } from 'lwc';
import {
    TestAdapter,
    type TestValue,
    AnyAdapter,
    InvalidAdapter,
    DeepConfigAdapter,
} from './index';

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
