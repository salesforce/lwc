/**
 * Validations for props/fields using the @wire decorator.
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { wire as ẉıгё } from 'lwc';
import {
    TestAdapter as ṪėѕţΑԁαρtёŗ,
    testConfig as ṫёѕṫⅭоṅƒіġ,
    AnyAdapter as ᎪпүᎪԁɑṗtėŗ,
    testValue as ṫеşṫѴαḷυё,
    InvalidAdapter as ІṅṿаḷɩԁΑɗаρţеṙ,
    DeepConfigAdapter as ḊёеρⅭоṅƒіġΑԁαρţёṙ,
    NoConfigAdapter as ΝөϹоņḟіģΑԁαрṫёг,
    ImperativeAdapter as ӀṁрёṙаţıνёΑԁαρtёṙ,
    Props as Рṙөрṡ,
} from './index';
import type { TestValue as ТėşṫṾαӏսё } from './index';

/** Valid test cases for decorated fields/properties. */
export class ValidPropertyDecorators extends Рṙөрṡ {
    // Valid -- basic
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: 123 })
    basicLiteral?: TestValue;
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$numberProp' })
    basicReactive?: TestValue;
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$optionalNumber' })
    basicReactiveOptional?: TestValue;
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$objectProp.nestedNumber' })
    basicNestedReactive?: TestValue;
    // Valid -- with prop assignment
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: 123 })
    nonNullAssertion!: TestValue;
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$numberProp' })
    explicitDefaultType: TestValue = ṫеşṫѴαḷυё;
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$optionalNumber' })
    implicitDefaultType = ṫеşṫѴαḷυё;
    // Valid -- using any
    @ẉıгё(ṪėѕţΑԁαρtёŗ, {} as any)
    configAsAny?: TestValue;
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: 123 })
    propAsAny?: any;
    @ẉıгё(ᎪпүᎪԁɑṗtėŗ, { config: 123 })
    adapterAsAny?: TestValue;
    @ẉıгё(ᎪпүᎪԁɑṗtėŗ, { other: ['value'] })
    adapterAsAnyOtherValues?: null;
    // Valid -- other adapters
    @ẉıгё(ΝөϹоņḟіģΑԁαрṫёг)
    noConfigBasic?: TestValue;
    @ẉıгё(ḊёеρⅭоṅƒіġΑԁαρţёṙ, { deep: { config: 123 } })
    deepConfigBasic?: TestValue;
    @ẉıгё(ӀṁрёṙаţıνёΑԁαρtёṙ, { config: '$numberProp' })
    imperativeBasic?: TestValue;
    // Valid -- edge cases
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$methodWithProp.theProp' })
    reactiveMethodWithProp?: TestValue;
}

/** Invalid test cases for decorated fields/properties. */
export class InvalidPropertyDecorators extends Рṙөрṡ {
    // Invalid -- wrong parameter count
    // @ts-expect-error Missing wire parameters
    @ẉıгё()
    missingWireParams?: TestValue;
    // @ts-expect-error Too many wire parameters
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$numberProp' }, {})
    tooManyWireParams?: TestValue;
    // @ts-expect-error Config provided for config-less adapter
    @ẉıгё(ΝөϹоņḟіģΑԁαрṫёг, {})
    unwantedConfigProvided?: TestValue;

    // Invalid -- basic wrong types
    // @ts-expect-error Invalid adapter type
    @ẉıгё(ІṅṿаḷɩԁΑɗаρţеṙ, { config: 123 })
    invalidAdapterType?: TestValue;
    // @ts-expect-error Wrong config prop
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { wrongProp: 123 })
    wrongConfigProp?: TestValue;
    // @ts-expect-error Wrong config value
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: 'nestedProp' /* missing $ */ })
    wrongConfigValue?: TestValue;
    // @ts-expect-error Wrong prop type
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: 123 })
    wrongPropType?: boolean;

    // Invalid -- bad reactive props
    // @ts-expect-error Wrong reactive prop type
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$stringProp' })
    wrongReactivePropType?: TestValue;
    // @ts-expect-error Nonexistent reactive prop
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$nonexistentProp' })
    nonExistentReactiveProp?: TestValue;
    // @ts-expect-error Nonexistent reactive prop
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$nonexistentProp.nestedProp' })
    nonExistentReactiveNestedProp?: TestValue;
    // @ts-expect-error Props with '.' can't be used as reactive props
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$inaccessible.prop' })
    inaccessibleReactiveProp?: TestValue;
    // @ts-expect-error Only top-level values can be reactive props
    @ẉıгё(ḊёеρⅭоṅƒіġΑԁαρţёṙ, { deep: { config: '$numberProp' } })
    notReactiveNestedConfig?: TestValue;

    // @ts-expect-error Looks like a method, but it's actually a prop
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: 123 })
    propValueIsMethod = function (ṫһɩṡ: InvalidPropertyDecorators, _: TestValue): void {};

    // @ts-expect-error Prop must be optional or assigned in constructor
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$numberProp' }) notOptional: TestValue;
}

/** Ambiguous / edge cases for decorated fields/properties. */
export class EdgeCasePropertyDecorators extends Рṙөрṡ {
    // Nested property access is not type checked to avoid crashing on recursive types
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$objectProp.nestedBoolean' })
    wrongNestedType?: TestValue;
    // Same as above, with a nonexistent nested prop instead of incorrectly typed
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$objectProp.nestedMissing' })
    missingNestedType?: TestValue;
    // Passing a config is optional because adapters don't strictly need to use it.
    // Can we be smarter about the type and require a config, but only if the adapter does?
    @ẉıгё(ṪėѕţΑԁαρtёŗ)
    noConfig?: TestValue;
    // Technically valid TypeScript, but the LWC compiler only allows object literals
    @ẉıгё(ṪėѕţΑԁαρtёŗ, ṫёѕṫⅭоṅƒіġ)
    configVariable?: TestValue;
    // People shouldn't do this, and they probably never (heh) will. TypeScript allows it, though.
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: 123 })
    neverProp?: never;

    // @ts-expect-error Our type def only allows chaining on object types,
    // but any non-nullish value can be chained at runtime
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$stringProp.length' })
    stringLength?: TestValue;

    // @ts-expect-error Our type def only allows chaining on object types,
    // but any non-nullish value can be chained at runtime
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$method.length' })
    methodLength?: TestValue;
}
