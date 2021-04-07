import { createElement } from 'lwc';
import Component from 'x/component';

describe('style', () => {
    let container;
    beforeEach(() => {
        container = document.createElement('div');
        document.body.appendChild(container);
    });
    afterEach(() => {
        document.body.removeChild(container);
        container = undefined;
    });

    it('style scoping works correctly', () => {
        const style = document.createElement('style');
        style.textContent = 'div { color: blue }';
        const div = document.createElement('div');
        div.textContent = 'hello';
        const component = createElement('x-component', { is: Component });
        container.appendChild(style);
        container.appendChild(div);
        container.appendChild(component);

        expect(getComputedStyle(div).color).toEqual('rgb(0, 0, 255)'); // blue
        expect(getComputedStyle(component.shadowRoot.querySelector('div')).color).toEqual(
            'rgb(255, 0, 0)'
        ); // red
    });
});
