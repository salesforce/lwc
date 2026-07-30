import { describe, test, expect } from 'vitest';
import { registerPublicProperties } from '../register-public-properties';
import { setStaticInternals } from '../set-static-internals';
import { LightningElement, SYMBOL__GENERATE_MARKUP } from '../lightning-element';

describe('registerPublicProperties', () => {
    test('sets __lwcPublicProperties__ from own props', () => {
        class Base extends LightningElement {}
        registerPublicProperties(Base as any, ['baseProp']);

        expect((Base as any).__lwcPublicProperties__).toBeInstanceOf(Set);
        expect([...(Base as any).__lwcPublicProperties__]).toEqual(['baseProp']);
    });

    test('unions own props with the superclass __lwcPublicProperties__', () => {
        class Base extends LightningElement {}
        registerPublicProperties(Base as any, ['baseProp']);

        class Mid extends Base {}
        registerPublicProperties(Mid as any, ['midProp']);

        const props = [...(Mid as any).__lwcPublicProperties__];
        expect(props).toContain('baseProp');
        expect(props).toContain('midProp');
    });

    test('does not attach generate-markup or template symbols (base classes are not renderable)', () => {
        class Base extends LightningElement {}
        registerPublicProperties(Base as any, ['baseProp']);

        expect((Base as any)[SYMBOL__GENERATE_MARKUP]).toBeUndefined();
    });

    test('a leaf component compiled with setStaticInternals inherits props from a registered base', () => {
        // This is the crux of the fix: the in-file base class is marked via
        // registerPublicProperties, and the exported leaf goes through setStaticInternals as
        // usual. The runtime prototype-chain union stitches them together — no static chain
        // resolution in the compiler.
        class Base extends LightningElement {}
        registerPublicProperties(Base as any, ['baseProp']);

        class Leaf extends Base {}
        setStaticInternals(Leaf as any, 'x-leaf', ['leafProp'], [], 'sync', undefined);

        const props = [...(Leaf as any).__lwcPublicProperties__];
        expect(props).toContain('baseProp');
        expect(props).toContain('leafProp');
    });

    test('resolves a dynamically-chosen superclass at runtime (impossible to resolve statically)', () => {
        // The superclass is picked at runtime via a ternary over object members — the compiler
        // cannot know which branch runs, but Object.getPrototypeOf does.
        class One extends LightningElement {}
        registerPublicProperties(One as any, ['oneProp']);
        class Two extends LightningElement {}
        registerPublicProperties(Two as any, ['twoProp']);

        const Options = { one: One, two: Two };
        const Chosen = (globalThis as any).FLAG ? Options.one : Options.two;
        class Leaf extends Chosen {}
        setStaticInternals(Leaf as any, 'x-leaf', ['leafProp'], [], 'sync', undefined);

        const props = [...(Leaf as any).__lwcPublicProperties__];
        // FLAG is falsy → Two is chosen → twoProp inherited, oneProp NOT
        expect(props).toContain('twoProp');
        expect(props).toContain('leafProp');
        expect(props).not.toContain('oneProp');
    });
});
