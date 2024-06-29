import { createElement } from 'lwc';
import Component from 'x/component';

describe('important styling and style override', () => {
    it('should render !important styles correctly', async () => {
        const elm = createElement('x-component', { is: Component });
        document.body.appendChild(elm);

        await Promise.resolve();

        for (const div of elm.shadowRoot.querySelectorAll('.important')) {
            expect(getComputedStyle(div).getPropertyValue('color')).toBe('rgb(255, 0, 0)');
            expect(div.style.getPropertyPriority('color')).toBe('important');
        }
    });

    it('should render inline styles correctly', async () => {
        const elm = createElement('x-component', { is: Component });
        document.body.appendChild(elm);

        await Promise.resolve();

        for (const div of elm.shadowRoot.querySelectorAll('.inline')) {
            expect(getComputedStyle(div).getPropertyValue('color')).toBe('rgb(255, 0, 0)');
            expect(div.style.getPropertyPriority('color')).not.toBe('important');
        }
    });

    it('should render untouched styles correctly', async () => {
        const elm = createElement('x-component', { is: Component });
        document.body.appendChild(elm);

        await Promise.resolve();

        for (const div of elm.shadowRoot.querySelectorAll('.untouched')) {
            expect(getComputedStyle(div).getPropertyValue('color')).toBe('rgb(0, 0, 255)');
        }
    });
});
