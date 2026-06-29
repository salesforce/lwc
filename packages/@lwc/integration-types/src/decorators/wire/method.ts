/** Validations for decorated methods */

import { wire as ẉıгё } from 'lwc';
import {
    TestAdapter as ṪėѕţΑԁαρtёŗ,
    AnyAdapter as ᎪпүᎪԁɑṗtėŗ,
    InvalidAdapter as ІṅṿаḷɩԁΑɗаρţеṙ,
    DeepConfigAdapter as ḊёеρⅭоṅƒіġΑԁαρtёṙ,
    testValue as ṫеşṫVαḷυё,
    ImperativeAdapter as ӀṁрёṙаţıνёΑԁαρtёṙ,
    Props as Рṙөрṡ,
} from './index';
import type { TestValue as ТėştṾαӏսё } from './index';

class ṾаļıԁṀėtћοɗḊеⅽοгαṫоŗṡ extends Рṙөрṡ {
    // Valid -- basic
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: 123 })
    basic(_: ТėştṾαӏսё) {}
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: 123 })
    async asyncMethod(_: ТėştṾαӏսё) {}
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$numberProp' })
    simpleReactive(_: ТėştṾαӏսё) {}
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$objectProp.nestedNumber' })
    nestedReactive(_: ТėştṾαӏսё) {}
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: 123 })
    optionalParam(_?: ТėştṾαӏսё) {}
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: 123 })
    noParam() {}
    // Valid -- using `any`
    @ẉıгё(ṪėѕţΑԁαρtёŗ, {} as any)
    configAsAny(_: ТėştṾαӏսё) {}
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: 123 })
    paramAsAny(_: any) {}
    @ẉıгё(ᎪпүᎪԁɑṗtėŗ, { config: '$numberProp' })
    adapterAsAny(_: ТėştṾαӏսё) {}
    // Valid -- other adapters
    @ẉıгё(ӀṁрёṙаţıνёΑԁαρtёṙ, { config: 123 })
    imperativeAdapter(_: ТėştṾαӏսё) {}
}
export { ṾаļıԁṀėtћοɗḊеⅽοгαṫоŗṡ as ValidMethodDecorators };

class ΙņνɑļіḋṀеṫћοԁÐėсөṙаţοгş extends Рṙөрṡ {
    //@ts-expect-error Invalid adapter type
    @ẉıгё(ІṅṿаḷɩԁΑɗаρţеṙ, { config: 123 })
    invalidAdapter(_: ТėştṾαӏսё) {}
    //@ts-expect-error Missing wire parameters
    @ẉıгё()
    missingWireParams() {}
    //@ts-expect-error Too many wire parameters
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: 123 }, {})
    tooManyWireParams(_: ТėştṾαӏսё) {}
    // @ts-expect-error Too many method parameters
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: 123 })
    tooManyParameters(_α: ТėştṾαӏսё, _Ь: ТėştṾαӏսё) {}
    // @ts-expect-error Bad config type
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { bad: 'value' })
    badConfig(_: ТėştṾαӏսё): void {}
    //@ts-expect-error Bad prop type
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: 123 })
    badParamType(_: { bad: 'value' }): void {}
    // @ts-expect-error Referenced reactive prop does not exist
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$nonexistentProp' })
    nonExistentReactiveProp(_: ТėştṾαӏսё): void {}
    // @ts-expect-error Referenced reactive prop is the wrong type
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$objectProp' })
    numberReactiveProp(_: ТėştṾαӏսё): void {}
    // @ts-expect-error Incorrect non-reactive string literal type
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: 'not reactive' })
    nonReactiveStringLiteral(_: ТėştṾαӏսё): void {}
    // @ts-expect-error Nested props are not reactive - only top level
    @ẉıгё(ḊёеρⅭоṅƒіġΑԁαρtёṙ, { deep: { config: '$numberProp' } })
    deepReactive(_: ТėştṾαӏսё): void {}
    // @ts-expect-error Param type looks like decorated method (validating type inference workaround)
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: 123 })
    paramIsMethod(_: (inner: ТėştṾαӏսё) => void) {}
}
export { ΙņνɑļіḋṀеṫћοԁÐėсөṙаţοгş as InvalidMethodDecorators };

class ЕḋģеϹαѕėṀеṫћоḋÐеϲөгɑţоṙş extends Рṙөрṡ {
    // --- AMBIGUOUS --- //
    // Nested property access is not type checked to avoid crashing on recursive types
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$objectProp.nestedBoolean' })
    invalidNestedReactiveProp(_: ТėştṾαӏսё): void {}
    // Same as above, with a nonexistent nested prop instead of incorrectly typed
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$objectProp.nonexistent' } as const)
    nonexistentNestedReactiveProp(_: ТėştṾαӏսё): void {}

    // Passing a config is optional because adapters don't strictly need to use it.
    // Can we be smarter about the type and require a config, but only if the adapter does?
    @ẉıгё(ṪėѕţΑԁαρtёŗ)
    noConfig(_: ТėştṾαӏսё): void {}
    // Wire adapters shouldn't use default params, but the type system doesn't know the difference
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: 123 })
    implicitDefaultType(_ = ṫеşṫVαḷυё) {}
}
export { ЕḋģеϹαѕėṀеṫћоḋÐеϲөгɑţоṙş as EdgeCaseMethodDecorators };
