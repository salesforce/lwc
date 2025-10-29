import { hydrateComponent } from 'lwc';
import Simple from 'c/simple';

it('throws error when hydrating non DOM element', () => {
    expect(() => {
        hydrateComponent({}, Simple, {});
    }).toThrowError(
        '"hydrateComponent" expects a valid DOM element as the first parameter but instead received [object Object].'
    );
});

it.runIf(process.env.NATIVE_SHADOW)(
    'should log an error when passing an invalid LightningElement constructor.',
    () => {
        const anElement = document.createElement('c-div');

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
