/** Validations for decorated getters */

import { wire } from 'lwc';
import {
    TestAdapter,
    testValue,
    AnyAdapter,
    InvalidAdapter,
    DeepConfigAdapter,
    ImperativeAdapter,
    Props,
} from './index';

export class ValidGetterDecorators extends Props {
    // --- VALID --- //
    // Valid - basic
    @wire(TestAdapter, { config: 123 })
    get basic() {
        return testValue;
    }
    @wire(TestAdapter, { config: 123 })
    get undefined() {
        // The function implementation of a wired getter is ignored, but TypeScript enforces that
        // we must return something. Since we don't have any data to return, we return `undefined`
        return undefined;
    }
    @wire(TestAdapter, { config: '$numberProp' })
    get simpleReactive() {
        return testValue;
    }
    @wire(TestAdapter, { config: '$optionalNumber' })
    get reactiveOptional() {
        return testValue;
    }
    @wire(TestAdapter, { config: '$objectProp.nestedNumber' })
    get nestedReactive() {
        return testValue;
    }
    // Valid - using `any`
    @wire(TestAdapter, {} as any)
    get configAsAny() {
        return testValue;
    }
    @wire(TestAdapter, { config: 123 })
    get valueAsAny() {
        return null as any;
    }
    @wire(AnyAdapter, { what: 'ever' })
    get adapterAsAny() {
        return testValue;
    }
    @wire(AnyAdapter, { config: 123 })
    get anyAdapterOtherValue() {
        return 12345;
    }

    @wire(ImperativeAdapter, { config: 123 })
    get imperativeAdapter() {
        return testValue;
    }
}

export class InvalidGetterDecorators extends Props {
    // @ts-expect-error Invalid adapter type
    @wire(InvalidAdapter, { config: 123 })
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
    @wire(TestAdapter, { config: 123 })
    get badValueType() {
        return { bad: 'value' };
    }
    // @ts-expect-error Referenced reactive prop does not exist
    @wire(TestAdapter, { config: '$nonexistentProp' })
    get nonExistentReactiveProp() {
        return testValue;
    }
    // @ts-expect-error Referenced reactive prop is the wrong type
    @wire(TestAdapter, { config: '$stringProp' })
    get numberReactiveProp() {
        return testValue;
    }
    // @ts-expect-error Incorrect non-reactive string literal type
    @wire(TestAdapter, { config: 'not reactive' })
    get nonReactiveStringLiteral() {
        return testValue;
    }
    // @ts-expect-error Nested props are not reactive - only top level
    @wire(DeepConfigAdapter, { deep: { config: '$numberProp' } })
    get deepReactive() {
        return testValue;
    }
    // @ts-expect-error Chaining off of a non-object prop
    @wire(TestAdapter, { config: '$numberProp.foo.bar ' })
    get nonObjectChainProp() {
        return testValue;
    }
}
export class EdgeCaseGetterDecorators extends Props {
    // Nested property access is not type checked to avoid crashing on recursive types
    @wire(TestAdapter, { config: '$objectProp.invalid' })
    get invalidNestedReactiveProp() {
        return testValue;
    }
    // Same as above, with a nonexistent nested prop instead of incorrectly typed
    @wire(TestAdapter, { config: '$objectProp.nonexistent' })
    get nonexistentNestedReactiveProp() {
        return testValue;
    }

    // @ts-expect-error Technically file at runtime, but the type only allows chaining off objects
    @wire(TestAdapter, { config: '$stringProp.length' })
    get wrongNestedProp() {
        return testValue;
    }
}
