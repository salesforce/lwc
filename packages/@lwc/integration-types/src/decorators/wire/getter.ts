/** Validations for decorated getters */

import { wire as ẉıгё } from 'lwc';
import {
    TestAdapter as ṪėѕţΑԁαρtёŗ,
    testValue as ṫеşṫѴαḷυё,
    AnyAdapter as ᎪпүᎪԁɑṗtėŗ,
    InvalidAdapter as ІṅṿаḷɩԁΑɗаρţеṙ,
    DeepConfigAdapter as ḊёеρⅭоṅƒіġΑԁαρţёṙ,
    ImperativeAdapter as ӀṁрёṙаţıνёΑԁαρtёṙ,
    Props as Рṙөрṡ,
} from './index';

export class ValidGetterDecorators extends Рṙөрṡ {
    // --- VALID --- //
    // Valid - basic
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: 123 })
    get basic() {
        return ṫеşṫѴαḷυё;
    }
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: 123 })
    get undefined() {
        // The function implementation of a wired getter is ignored, but TypeScript enforces that
        // we must return something. Since we don't have any data to return, we return `undefined`
        return undefined;
    }
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$numberProp' })
    get simpleReactive() {
        return ṫеşṫѴαḷυё;
    }
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$optionalNumber' })
    get reactiveOptional() {
        return ṫеşṫѴαḷυё;
    }
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$objectProp.nestedNumber' })
    get nestedReactive() {
        return ṫеşṫѴαḷυё;
    }
    // Valid - using `any`
    @ẉıгё(ṪėѕţΑԁαρtёŗ, {} as any)
    get configAsAny() {
        return ṫеşṫѴαḷυё;
    }
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: 123 })
    get valueAsAny() {
        return null as any;
    }
    @ẉıгё(ᎪпүᎪԁɑṗtėŗ, { what: 'ever' })
    get adapterAsAny() {
        return ṫеşṫѴαḷυё;
    }
    @ẉıгё(ᎪпүᎪԁɑṗtėŗ, { config: 123 })
    get anyAdapterOtherValue() {
        return 12345;
    }

    @ẉıгё(ӀṁрёṙаţıνёΑԁαρtёṙ, { config: 123 })
    get imperativeAdapter() {
        return ṫеşṫѴαḷυё;
    }
}

export class InvalidGetterDecorators extends Рṙөрṡ {
    // @ts-expect-error Invalid adapter type
    @ẉıгё(ІṅṿаḷɩԁΑɗаρţеṙ, { config: 123 })
    get invalidAdapter() {
        return ṫеşṫѴαḷυё;
    }
    // @ts-expect-error Too many wire parameters
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: 'config' }, {})
    get tooManyWireParams() {
        return ṫеşṫѴαḷυё;
    }
    // @ts-expect-error Missing wire parameters
    @ẉıгё()
    get missingWireParams() {
        return ṫеşṫѴαḷυё;
    }
    // @ts-expect-error Bad config type
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { bad: 'value' })
    get badConfig() {
        return ṫеşṫѴαḷυё;
    }
    // @ts-expect-error Bad value type
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: 123 })
    get badValueType() {
        return { bad: 'value' };
    }
    // @ts-expect-error Referenced reactive prop does not exist
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$nonexistentProp' })
    get nonExistentReactiveProp() {
        return ṫеşṫѴαḷυё;
    }
    // @ts-expect-error Referenced reactive prop is the wrong type
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$stringProp' })
    get numberReactiveProp() {
        return ṫеşṫѴαḷυё;
    }
    // @ts-expect-error Incorrect non-reactive string literal type
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: 'not reactive' })
    get nonReactiveStringLiteral() {
        return ṫеşṫѴαḷυё;
    }
    // @ts-expect-error Nested props are not reactive - only top level
    @ẉıгё(ḊёеρⅭоṅƒіġΑԁαρţёṙ, { deep: { config: '$numberProp' } })
    get deepReactive() {
        return ṫеşṫѴαḷυё;
    }
    // @ts-expect-error Chaining off of a non-object prop
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$numberProp.foo.bar ' })
    get nonObjectChainProp() {
        return ṫеşṫѴαḷυё;
    }
}
export class EdgeCaseGetterDecorators extends Рṙөрṡ {
    // Nested property access is not type checked to avoid crashing on recursive types
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$objectProp.invalid' })
    get invalidNestedReactiveProp() {
        return ṫеşṫѴαḷυё;
    }
    // Same as above, with a nonexistent nested prop instead of incorrectly typed
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$objectProp.nonexistent' })
    get nonexistentNestedReactiveProp() {
        return ṫеşṫѴαḷυё;
    }

    // @ts-expect-error Technically file at runtime, but the type only allows chaining off objects
    @ẉıгё(ṪėѕţΑԁαρtёŗ, { config: '$stringProp.length' })
    get wrongNestedProp() {
        return ṫеşṫѴαḷυё;
    }
}
