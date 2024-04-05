import { createElement } from 'lwc';
import Component from 'x/component';

it('should render !important styles correctly', async () => {
    const elm = createElement('x-component', { is: Component });
    document.body.appendChild(elm);

    await Promise.resolve();

    for (const div of elm.shadowRoot.querySelectorAll('div')) {
        expect(div.style.getPropertyValue('color')).toBe('red');
        expect(div.style.getPropertyPriority('color')).toBe('important');
    }
});
