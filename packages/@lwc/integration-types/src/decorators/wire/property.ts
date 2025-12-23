/**
 * Validations for props/fields using the @wire decorator.
 */
import { wire } from 'lwc';
import {
    TestAdapter,
    testConfig,
    AnyAdapter,
    testValue,
    InvalidAdapter,
    DeepConfigAdapter,
    NoConfigAdapter,
    ImperativeAdapter,
    Props,
} from './index';
import type { TestValue } from './index';

/** Valid test cases for decorated fields/properties. */
export class ValidPropertyDecorators extends Props {
    // Valid -- basic
    @wire(TestAdapter, { config: 123 })
    basicLiteral?: TestValue;
    @wire(TestAdapter, { config: '$numberProp' })
    basicReactive?: TestValue;
    @wire(TestAdapter, { config: '$optionalNumber' })
    basicReactiveOptional?: TestValue;
    @wire(TestAdapter, { config: '$objectProp.nestedNumber' })
    basicNestedReactive?: TestValue;
    // Valid -- with prop assignment
    @wire(TestAdapter, { config: 123 })
    nonNullAssertion!: TestValue;
    @wire(TestAdapter, { config: '$numberProp' })
    explicitDefaultType: TestValue = testValue;
    @wire(TestAdapter, { config: '$optionalNumber' })
    implicitDefaultType = testValue;
    // Valid -- using any
    @wire(TestAdapter, {} as any)
    configAsAny?: TestValue;
    @wire(TestAdapter, { config: 123 })
    propAsAny?: any;
    @wire(AnyAdapter, { config: 123 })
    adapterAsAny?: TestValue;
    @wire(AnyAdapter, { other: ['value'] })
    adapterAsAnyOtherValues?: null;
    // Valid -- other adapters
    @wire(NoConfigAdapter)
    noConfigBasic?: TestValue;
    @wire(DeepConfigAdapter, { deep: { config: 123 } })
    deepConfigBasic?: TestValue;
    @wire(ImperativeAdapter, { config: '$numberProp' })
    imperativeBasic?: TestValue;
}

/** Invalid test cases for decorated fields/properties. */
export class InvalidPropertyDecorators extends Props {
    // Invalid -- wrong parameter count
    // @ts-expect-error Missing wire parameters
    @wire()
    missingWireParams?: TestValue;
    // @ts-expect-error Too many wire parameters
    @wire(TestAdapter, { config: '$numberProp' }, {})
    tooManyWireParams?: TestValue;
    // @ts-expect-error Config provided for config-less adapter
    @wire(NoConfigAdapter, {})
    unwantedConfigProvided?: TestValue;

    // Invalid -- basic wrong types
    // @ts-expect-error Invalid adapter type
    @wire(InvalidAdapter, { config: 123 })
    invalidAdapterType?: TestValue;
    // @ts-expect-error Wrong config prop
    @wire(TestAdapter, { wrongProp: 123 })
    wrongConfigProp?: TestValue;
    // @ts-expect-error Wrong config value
    @wire(TestAdapter, { config: 'nestedProp' /* missing $ */ })
    wrongConfigValue?: TestValue;
    // @ts-expect-error Wrong prop type
    @wire(TestAdapter, { config: 123 })
    wrongPropType?: boolean;

    // Invalid -- bad reactive props
    // @ts-expect-error Wrong reactive prop type
    @wire(TestAdapter, { config: '$stringProp' })
    wrongReactivePropType?: TestValue;
    // @ts-expect-error Nonexistent reactive prop
    @wire(TestAdapter, { config: '$nonexistentProp' })
    nonExistentReactiveProp?: TestValue;
    // @ts-expect-error Nonexistent reactive prop
    @wire(TestAdapter, { config: '$nonexistentProp.nestedProp' })
    nonExistentReactiveNestedProp?: TestValue;
    // @ts-expect-error Props with '.' can't be used as reactive props
    @wire(TestAdapter, { config: '$inaccessible.prop' })
    inaccessibleReactiveProp?: TestValue;
    // @ts-expect-error Only top-level values can be reactive props
    @wire(DeepConfigAdapter, { deep: { config: '$numberProp' } })
    notReactiveNestedConfig?: TestValue;

    // @ts-expect-error Looks like a method, but it's actually a prop
    @wire(TestAdapter, { config: 123 })
    propValueIsMethod = function (this: InvalidPropertyDecorators, _: TestValue): void {};

    // @ts-expect-error Prop must be optional or assigned in constructor
    @wire(TestAdapter, { config: '$numberProp' }) notOptional: TestValue;
}

/** Ambiguous / edge cases for decorated fields/properties. */
export class EdgeCasePropertyDecorators extends Props {
    // Nested property access is not type checked to avoid crashing on recursive types
    @wire(TestAdapter, { config: '$objectProp.nestedBoolean' })
    wrongNestedType?: TestValue;
    // Same as above, with a nonexistent nested prop instead of incorrectly typed
    @wire(TestAdapter, { config: '$objectProp.nestedMissing' })
    missingNestedType?: TestValue;
    // Passing a config is optional because adapters don't strictly need to use it.
    // Can we be smarter about the type and require a config, but only if the adapter does?
    @wire(TestAdapter)
    noConfig?: TestValue;
    // Technically valid TypeScript, but the LWC compiler only allows object literals
    @wire(TestAdapter, testConfig)
    configVariable?: TestValue;
    // People shouldn't do this, and they probably never (heh) will. TypeScript allows it, though.
    @wire(TestAdapter, { config: 123 })
    neverProp?: never;

    // @ts-expect-error Our type def only allows chaining on object types,
    // but any non-nullish value can be chained at runtime
    @wire(TestAdapter, { config: '$stringProp.length' })
    stringLength?: TestValue;
}
