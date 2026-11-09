import { hydrateComponent } from 'lwc';
import Simple from 'x/simple';

it('throws error when hydrating non DOM element', () => {
    expect(() => {
        hydrateComponent({}, Simple, {});
    }).toThrowError(
        '"hydrateComponent" expects a valid DOM element as the first parameter but instead received [object Object].'
    );
});

it('throws error when hydrating non custom element (W-23722850)', () => {
    expect(() => {
        hydrateComponent(document.createElement('p'), Simple, {});
    }).toThrowError(
        '"hydrateComponent" expects a custom element as the first parameter but instead received P.'
    );
});

it.runIf(process.env.NATIVE_SHADOW)(
    'should log an error when passing an invalid LightningElement constructor.',
    () => {
        const anElement = document.createElement('x-div');

        expect(() => {
            try {
                hydrateComponent(anElement, anElement.constructor, {});
            } catch (_error) {
                // Ignore the rehydration error.
            }
        }).toLogError(
            /is not a valid component, or does not extends LightningElement from "lwc". You probably forgot to add the extend clause on the class declaration./
        );
    }
);
