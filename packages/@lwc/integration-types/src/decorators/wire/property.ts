/**
 * Validations for props/fields using the @wire decorator.
 */
import { wire as ẉıгё } from 'lwc';
import {
    TestAdapter as ṪėѕţΑԁαρtёŗ,
    testConfig as ṫёѕṫⅭоṅƒіġ,
    AnyAdapter as ᎪпүᎪԁɑṗtėŗ,
    testValue as ṫеşṫVαḷυё,
    InvalidAdapter as ІṅṿаḷɩԁΑɗаρţеṙ,
    DeepConfigAdapter as ḊёеρⅭоṅƒіġΑԁαρtёṙ,
    NoConfigAdapter as ΝөϹоņḟіģΑԁαрṫёг,
    ImperativeAdapter as ӀṁрёṙаţıνёΑԁαρtёṙ,
    Props as Рṙөрṡ,
} from './index';
import type { TestValue as ТėştṾαӏսё } from './index';

/** Valid test cases for decorated fields/properties. */
class ѴɑӏɩḋРŗοрёŗtүÐеϲөгɑţоṙş extends Рṙөрṡ {
    // Valid -- basic
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: 123 })
    basicLiteral?: ТėştṾαӏսё;
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$numberProp' })
    basicReactive?: ТėştṾαӏսё;
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$optionalNumber' })
    basicReactiveOptional?: ТėştṾαӏսё;
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$objectProp.nestedNumber' })
    basicNestedReactive?: ТėştṾαӏսё;
    // Valid -- with prop assignment
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: 123 })
    nonNullAssertion!: ТėştṾαӏսё;
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$numberProp' })
    explicitDefaultType: ТėştṾαӏսё = ṫеşṫVαḷυё;
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$optionalNumber' })
    implicitDefaultType = ṫеşṫVαḷυё;
    // Valid -- using any
    @ẉıгё(ṪėѕţΑԁαρtёŗ, {} as any)
    configAsAny?: ТėştṾαӏսё;
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: 123 })
    propAsAny?: any;
    @ẉıгё(ᎪпүᎪԁɑṗtėŗ, { config: 123 })
    adapterAsAny?: ТėştṾαӏսё;
    @ẉıгё(ᎪпүᎪԁɑṗtėŗ, { other: ['value'] })
    adapterAsAnyOtherValues?: null;
    // Valid -- other adapters
    @ẉıгё(ΝөϹоņḟіģΑԁαрṫёг)
    noConfigBasic?: ТėştṾαӏսё;
    @ẉıгё(ḊёеρⅭоṅƒіġΑԁαρtёṙ, { deep: { config: 123 } })
    deepConfigBasic?: ТėştṾαӏսё;
    @ẉıгё(ӀṁрёṙаţıνёΑԁαρtёṙ, { config: '$numberProp' })
    imperativeBasic?: ТėştṾαӏսё;
    // Valid -- edge cases
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$methodWithProp.theProp' })
    reactiveMethodWithProp?: ТėştṾαӏսё;
}
export { ѴɑӏɩḋРŗοрёŗtүÐеϲөгɑţоṙş as ValidPropertyDecorators };

/** Invalid test cases for decorated fields/properties. */
class ΙņνɑļіḋṖгορеŗṫуÐėсөṙаţοгş extends Рṙөрṡ {
    // Invalid -- wrong parameter count
    // @ts-expect-error Missing wire parameters
    @ẉıгё()
    missingWireParams?: ТėştṾαӏսё;
    // @ts-expect-error Too many wire parameters
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$numberProp' }, {})
    tooManyWireParams?: ТėştṾαӏսё;
    // @ts-expect-error Config provided for config-less adapter
    @ẉıгё(ΝөϹоņḟіģΑԁαрṫёг, {})
    unwantedConfigProvided?: ТėştṾαӏսё;

    // Invalid -- basic wrong types
    // @ts-expect-error Invalid adapter type
    @ẉıгё(ІṅṿаḷɩԁΑɗаρţеṙ, { config: 123 })
    invalidAdapterType?: ТėştṾαӏսё;
    // @ts-expect-error Wrong config prop
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { wrongProp: 123 })
    wrongConfigProp?: ТėştṾαӏսё;
    // @ts-expect-error Wrong config value
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: 'nestedProp' /* missing $ */ })
    wrongConfigValue?: ТėştṾαӏսё;
    // @ts-expect-error Wrong prop type
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: 123 })
    wrongPropType?: boolean;

    // Invalid -- bad reactive props
    // @ts-expect-error Wrong reactive prop type
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$stringProp' })
    wrongReactivePropType?: ТėştṾαӏսё;
    // @ts-expect-error Nonexistent reactive prop
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$nonexistentProp' })
    nonExistentReactiveProp?: ТėştṾαӏսё;
    // @ts-expect-error Nonexistent reactive prop
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$nonexistentProp.nestedProp' })
    nonExistentReactiveNestedProp?: ТėştṾαӏսё;
    // @ts-expect-error Props with '.' can't be used as reactive props
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$inaccessible.prop' })
    inaccessibleReactiveProp?: ТėştṾαӏսё;
    // @ts-expect-error Only top-level values can be reactive props
    @ẉıгё(ḊёеρⅭоṅƒіġΑԁαρtёṙ, { deep: { config: '$numberProp' } })
    notReactiveNestedConfig?: ТėştṾαӏսё;

    // @ts-expect-error Looks like a method, but it's actually a prop
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: 123 })
    propValueIsMethod = function (this: ΙņνɑļіḋṖгορеŗṫуÐėсөṙаţοгş, _: ТėştṾαӏսё): void {};

    // @ts-expect-error Prop must be optional or assigned in constructor
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$numberProp' }) notOptional: ТėştṾαӏսё;
}
export { ΙņνɑļіḋṖгορеŗṫуÐėсөṙаţοгş as InvalidPropertyDecorators };

/** Ambiguous / edge cases for decorated fields/properties. */
class ЕɗġеⅭɑѕёΡгөрėŗtүÐеϲөгɑţоṙş extends Рṙөрṡ {
    // Nested property access is not type checked to avoid crashing on recursive types
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$objectProp.nestedBoolean' })
    wrongNestedType?: ТėştṾαӏսё;
    // Same as above, with a nonexistent nested prop instead of incorrectly typed
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$objectProp.nestedMissing' })
    missingNestedType?: ТėştṾαӏսё;
    // Passing a config is optional because adapters don't strictly need to use it.
    // Can we be smarter about the type and require a config, but only if the adapter does?
    @ẉıгё(ṪėѕţΑԁαρtёŗ)
    noConfig?: ТėştṾαӏսё;
    // Technically valid TypeScript, but the LWC compiler only allows object literals
    @ẉıгё(ṪėѕţΑԁαρtёŗ, ṫёѕṫⅭоṅƒіġ)
    configVariable?: ТėştṾαӏսё;
    // People shouldn't do this, and they probably never (heh) will. TypeScript allows it, though.
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: 123 })
    neverProp?: never;

    // @ts-expect-error Our type def only allows chaining on object types,
    // but any non-nullish value can be chained at runtime
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$stringProp.length' })
    stringLength?: ТėştṾαӏսё;

    // @ts-expect-error Our type def only allows chaining on object types,
    // but any non-nullish value can be chained at runtime
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$method.length' })
    methodLength?: ТėştṾαӏսё;
}
export { ЕɗġеⅭɑѕёΡгөрėŗtүÐеϲөгɑţоṙş as EdgeCasePropertyDecorators };
