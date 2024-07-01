import { createElement } from 'lwc';
import Component from 'x/component';

describe('important styling and style override', () => {
    it('should render !important styles correctly', async () => {
        const elm = createElement('x-component', { is: Component });
        document.body.appendChild(elm);

        await Promise.resolve();
        const importantDivs = elm.shadowRoot.querySelectorAll('.important');
        expect(importantDivs.length).toBeGreaterThan(0);
        for (const div of importantDivs) {
            expect(getComputedStyle(div).getPropertyValue('color')).toBe('rgb(255, 0, 0)');
            expect(div.style.getPropertyPriority('color')).toBe('important');
        }
    });

    it('should render inline styles correctly', async () => {
        const elm = createElement('x-component', { is: Component });
        document.body.appendChild(elm);

        await Promise.resolve();
        const inlineDivs = elm.shadowRoot.querySelectorAll('.inline');
        expect(inlineDivs.length).toBeGreaterThan(0);
        for (const div of inlineDivs) {
            expect(getComputedStyle(div).getPropertyValue('color')).toBe('rgb(255, 0, 0)');
            expect(div.style.getPropertyPriority('color')).not.toBe('important');
        }
    });

    it('should render untouched styles correctly', async () => {
        const elm = createElement('x-component', { is: Component });
        document.body.appendChild(elm);

        await Promise.resolve();
        const untouchedDivs = elm.shadowRoot.querySelectorAll('.untouched');
        expect(untouchedDivs.length).toBeGreaterThan(0);
        for (const div of untouchedDivs) {
            expect(getComputedStyle(div).getPropertyValue('color')).toBe('rgb(0, 0, 255)');
        }
    });
});
