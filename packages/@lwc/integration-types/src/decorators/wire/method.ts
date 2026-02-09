/** Validations for decorated methods */

import { wire } from 'lwc';
import {
    TestAdapter,
    AnyAdapter,
    InvalidAdapter,
    DeepConfigAdapter,
    testValue,
    ImperativeAdapter,
    Props,
} from './index';
import type { TestValue } from './index';

export class ValidMethodDecorators extends Props {
    // Valid -- basic
    @wire(TestAdapter, { config: 123 })
    basic(_: TestValue) {}
    @wire(TestAdapter, { config: 123 })
    async asyncMethod(_: TestValue) {}
    @wire(TestAdapter, { config: '$numberProp' })
    simpleReactive(_: TestValue) {}
    @wire(TestAdapter, { config: '$objectProp.nestedNumber' })
    nestedReactive(_: TestValue) {}
    @wire(TestAdapter, { config: 123 })
    optionalParam(_?: TestValue) {}
    @wire(TestAdapter, { config: 123 })
    noParam() {}
    // Valid -- using `any`
    @wire(TestAdapter, {} as any)
    configAsAny(_: TestValue) {}
    @wire(TestAdapter, { config: 123 })
    paramAsAny(_: any) {}
    @wire(AnyAdapter, { config: '$numberProp' })
    adapterAsAny(_: TestValue) {}
    // Valid -- other adapters
    @wire(ImperativeAdapter, { config: 123 })
    imperativeAdapter(_: TestValue) {}
}

export class InvalidMethodDecorators extends Props {
    //@ts-expect-error Invalid adapter type
    @wire(InvalidAdapter, { config: 123 })
    invalidAdapter(_: TestValue) {}
    //@ts-expect-error Missing wire parameters
    @wire()
    missingWireParams() {}
    //@ts-expect-error Too many wire parameters
    @wire(TestAdapter, { config: 123 }, {})
    tooManyWireParams(_: TestValue) {}
    // @ts-expect-error Too many method parameters
    @wire(TestAdapter, { config: 123 })
    tooManyParameters(_a: TestValue, _b: TestValue) {}
    // @ts-expect-error Bad config type
    @wire(TestAdapter, { bad: 'value' })
    badConfig(_: TestValue): void {}
    //@ts-expect-error Bad prop type
    @wire(TestAdapter, { config: 123 })
    badParamType(_: { bad: 'value' }): void {}
    // @ts-expect-error Referenced reactive prop does not exist
    @wire(TestAdapter, { config: '$nonexistentProp' })
    nonExistentReactiveProp(_: TestValue): void {}
    // @ts-expect-error Referenced reactive prop is the wrong type
    @wire(TestAdapter, { config: '$objectProp' })
    numberReactiveProp(_: TestValue): void {}
    // @ts-expect-error Incorrect non-reactive string literal type
    @wire(TestAdapter, { config: 'not reactive' })
    nonReactiveStringLiteral(_: TestValue): void {}
    // @ts-expect-error Nested props are not reactive - only top level
    @wire(DeepConfigAdapter, { deep: { config: '$numberProp' } })
    deepReactive(_: TestValue): void {}
    // @ts-expect-error Param type looks like decorated method (validating type inference workaround)
    @wire(TestAdapter, { config: 123 })
    paramIsMethod(_: (inner: TestValue) => void) {}
}

export class EdgeCaseMethodDecorators extends Props {
    // --- AMBIGUOUS --- //
    // Nested property access is not type checked to avoid crashing on recursive types
    @wire(TestAdapter, { config: '$objectProp.nestedBoolean' })
    invalidNestedReactiveProp(_: TestValue): void {}
    // Same as above, with a nonexistent nested prop instead of incorrectly typed
    @wire(TestAdapter, { config: '$objectProp.nonexistent' } as const)
    nonexistentNestedReactiveProp(_: TestValue): void {}

    // Passing a config is optional because adapters don't strictly need to use it.
    // Can we be smarter about the type and require a config, but only if the adapter does?
    @wire(TestAdapter)
    noConfig(_: TestValue): void {}
    // Wire adapters shouldn't use default params, but the type system doesn't know the difference
    @wire(TestAdapter, { config: 123 })
    implicitDefaultType(_ = testValue) {}
}
