import { createElement } from 'lwc';
import Component from 'x/component';

describe('static props and attrs', () => {
    it('should render correctly with static props and attrs but dynamic class', async () => {
        const elm = createElement('x-component', { is: Component });
        elm.dynamic = 'first';
        document.body.appendChild(elm);

        await Promise.resolve();

        const div = elm.shadowRoot.querySelector('div');
        const otherElm = elm.shadowRoot.querySelector('x-other');

        expect(div.getAttribute('title')).toBe('static');
        expect(div.getAttribute('aria-label')).toBe('static');
        expect(div.getAttribute('class')).toBe('first');

        expect(otherElm.getAttribute('title')).toBe('static');
        expect(otherElm.prop).toBe('static');
        expect(otherElm.getAttribute('class')).toBe('first');

        elm.dynamic = 'second';

        await Promise.resolve();

        expect(div.getAttribute('title')).toBe('static');
        expect(div.getAttribute('aria-label')).toBe('static');
        expect(div.getAttribute('class')).toBe('second');

        expect(otherElm.getAttribute('title')).toBe('static');
        expect(otherElm.prop).toBe('static');
        expect(otherElm.getAttribute('class')).toBe('second');
    });
});
