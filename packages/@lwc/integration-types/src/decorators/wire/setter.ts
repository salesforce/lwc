/** Validations for decorated setters */
import { wire } from 'lwc';
import {
    TestAdapter,
    type TestValue,
    AnyAdapter,
    InvalidAdapter,
    DeepConfigAdapter,
    Props,
    ImperativeAdapter,
} from './index';

export class ValidSetterDecorators extends Props {
    // Valid - basic
    @wire(TestAdapter, { config: 123 })
    set basic(_: TestValue) {}
    @wire(TestAdapter, { config: '$numberProp' })
    set simpleReactive(_: TestValue) {}
    @wire(TestAdapter, { config: '$optionalNumber' })
    set reactiveOptional(_: TestValue) {}
    @wire(TestAdapter, { config: '$objectProp.nestedNumber' })
    set nestedReactive(_: TestValue) {}
    // Valid - using `any`
    @wire(TestAdapter, {} as any)
    set configAsAny(_: TestValue) {}
    @wire(TestAdapter, { config: 123 })
    set valueAsAny(_: any) {}
    // Valid - other adapters
    @wire(AnyAdapter, { config: 'config' })
    set anyAdapterOtherValue(_: 12345) {}
    @wire(ImperativeAdapter, { config: 123 })
    set imperativeAdapter(_: TestValue) {}
}
export class InvalidSetterDecorators extends Props {
    // --- INVALID --- //
    // @ts-expect-error Invalid adapter type
    @wire(InvalidAdapter, { config: 123 })
    set invalidAdapter(_: TestValue) {}
    // @ts-expect-error Too many wire parameters
    @wire(TestAdapter, { config: 123 }, {})
    set tooManyWireParams(_: TestValue) {}
    // @ts-expect-error Missing wire parameters
    @wire()
    set missingWireParams(_: TestValue) {}
    // @ts-expect-error Bad config type
    @wire(TestAdapter, { bad: 'value' })
    set badConfig(_: TestValue) {}
    // @ts-expect-error Bad value type
    @wire(TestAdapter, { config: 123 })
    set badValueType(_: { bad: 'value' }) {}
    // @ts-expect-error Referenced reactive prop does not exist
    @wire(TestAdapter, { config: '$nonexistentProp' })
    set nonExistentReactiveProp(_: TestValue) {}
    // @ts-expect-error Referenced reactive prop is the wrong type
    @wire(TestAdapter, { config: '$stringProp' })
    set numberReactiveProp(_: TestValue) {}
    // @ts-expect-error Incorrect non-reactive string literal type
    @wire(TestAdapter, { config: 'not reactive' })
    set nonReactiveStringLiteral(_: TestValue) {}
    // @ts-expect-error Nested props are not reactive
    @wire(DeepConfigAdapter, { deep: { config: '$numberProp' } })
    set nestedReactiveProp(_: TestValue) {}
}

export class EdgeCaseSetterDecorators extends Props {
    // Nested property access is not type checked to avoid crashing on recursive types
    @wire(TestAdapter, { config: '$objectProp.invalid' })
    set invalidNestedReactiveProp(_: TestValue) {}
    // Same as above, with a nonexistent nested prop instead of incorrectly typed
    @wire(TestAdapter, { config: '$objectProp.nonexistent' })
    set nonexistentNestedReactiveProp(_: TestValue) {}
    // @ts-expect-error Technically file at runtime, but the type only allows chaining off objects
    @wire(TestAdapter, { config: '$stringProp.length' })
    set wrongNestedProp(_: TestValue) {}
}
