import { LightningElement, wire } from 'lwc';
import {
    TestAdapter,
    testValue,
    AnyAdapter,
    InvalidAdapter,
    DeepConfigAdapter,
    TestAdapterWithImperative,
} from './index';

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
