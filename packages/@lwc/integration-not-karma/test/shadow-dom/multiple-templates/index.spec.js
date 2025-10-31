import { createElement } from 'lwc';
import Multi from 'c/multi';
import MultiNoStyleInFirst from 'c/multiNoStyleInFirst';

describe.runIf(process.env.NATIVE_SHADOW)(
    'Shadow DOM styling - multiple shadow DOM components',
    () => {
        it('Does not duplicate styles if template is re-rendered', async () => {
            const element = createElement('c-multi', { is: Multi });

            const getNumStyleSheets = () => {
                let count = 0;
                if (element.shadowRoot.adoptedStyleSheets) {
                    count += element.shadowRoot.adoptedStyleSheets.length;
                }
                count += element.shadowRoot.querySelectorAll('style').length;
                return count;
            };

            document.body.appendChild(element);
            await Promise.resolve();
            expect(getComputedStyle(element.shadowRoot.querySelector('div')).color).toEqual(
                'rgb(0, 0, 255)'
            );
            expect(getNumStyleSheets()).toEqual(1);
            element.next();
            await Promise.resolve();
            expect(getComputedStyle(element.shadowRoot.querySelector('div')).color).toEqual(
                'rgb(255, 0, 0)'
            );
            expect(getNumStyleSheets()).toEqual(2);
            element.next();
            await Promise.resolve();
            expect(getComputedStyle(element.shadowRoot.querySelector('div')).color).toEqual(
                'rgb(0, 0, 255)'
            );
            expect(getNumStyleSheets()).toEqual(2);
        });
    }
);

describe('multiple stylesheets rendered in same component', () => {
    it('works when first template has no style but second template does', async () => {
        const element = createElement('c-multi-no-style-in-first', { is: MultiNoStyleInFirst });
        document.body.appendChild(element);
        await Promise.resolve();
        expect(getComputedStyle(element.shadowRoot.querySelector('.red')).color).toEqual(
            'rgb(0, 0, 0)'
        );
        expect(getComputedStyle(element.shadowRoot.querySelector('.green')).color).toEqual(
            'rgb(0, 0, 0)'
        );
        expect(getComputedStyle(element).marginLeft).toEqual('0px');
        element.next();
        await new Promise((resolve) => requestAnimationFrame(() => resolve()));
        expect(getComputedStyle(element.shadowRoot.querySelector('.red')).color).toEqual(
            'rgb(255, 0, 0)'
        );
        expect(getComputedStyle(element.shadowRoot.querySelector('.green')).color).toEqual(
            'rgb(0, 128, 0)'
        );
        expect(getComputedStyle(element).marginLeft).toEqual('5px');
        element.next();
        await new Promise((resolve_1) => requestAnimationFrame(() => resolve_1()));
        if (process.env.NATIVE_SHADOW) {
            // TODO [#2466]: In native shadow, stylesheets are not removed from the DOM
            expect(getComputedStyle(element.shadowRoot.querySelector('.red')).color).toEqual(
                'rgb(255, 0, 0)'
            );
            expect(getComputedStyle(element.shadowRoot.querySelector('.green')).color).toEqual(
                'rgb(0, 128, 0)'
            );
            expect(getComputedStyle(element).marginLeft).toEqual('5px');
        } else {
            expect(getComputedStyle(element.shadowRoot.querySelector('.red')).color).toEqual(
                'rgb(0, 0, 0)'
            );
            expect(getComputedStyle(element.shadowRoot.querySelector('.green')).color).toEqual(
                'rgb(0, 0, 0)'
            );
            expect(getComputedStyle(element).marginLeft).toEqual('0px');
        }
        element.next();
        await new Promise((resolve_2) => requestAnimationFrame(() => resolve_2()));
        expect(getComputedStyle(element.shadowRoot.querySelector('.red')).color).toEqual(
            'rgb(255, 0, 0)'
        );
        expect(getComputedStyle(element.shadowRoot.querySelector('.green')).color).toEqual(
            'rgb(0, 128, 0)'
        );
        expect(getComputedStyle(element).marginLeft).toEqual('5px');
    });
});
