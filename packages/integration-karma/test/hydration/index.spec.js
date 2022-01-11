import { hydrateComponent } from 'lwc';
import Simple from 'x/simple';

it('throws error when hydrating non DOM element', () => {
    expect(() => {
        hydrateComponent({}, Simple, {});
    }).toThrowError(
        '"hydrateComponent" expects a valid DOM element as the first parameter but instead received [object Object].'
    );
});

it('should log an error when passing an invalid LightningElement constructor.', () => {
    const anElement = document.createElement('div');

    expect(() => {
        hydrateComponent(anElement, anElement.constructor, {});
    }).toThrowError(
        'function HTMLDivElement() { [native code] } is not a valid component, or does not extends LightningElement from "lwc". You probably forgot to add the extend clause on the class declaration.'
    );
});
