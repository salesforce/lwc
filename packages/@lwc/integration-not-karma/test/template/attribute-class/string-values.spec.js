import { createElement } from 'lwc';

import Static from 'c/static';
import Dynamic from 'c/dynamic';

describe('static class attribute', () => {
    it('simple', () => {
        const elm = createElement('c-static', { is: Static });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('div').className).toBe('foo bar');
    });
});

describe('dynamic class attribute', () => {
    function createDynamicClass(value) {
        const elm = createElement('c-dynamic', { is: Dynamic });
        elm.dynamicClass = value;
        document.body.appendChild(elm);

        return {
            host: elm,
            target: elm.shadowRoot.querySelector('div'),
        };
    }

    it('simple', () => {
        const { target } = createDynamicClass('foo');
        expect(target.className).toBe('foo');
    });

    it('multiple classes', () => {
        const { target } = createDynamicClass('foo bar');
        expect(target.className).toBe('foo bar');
    });

    it('inconsistent spacing', () => {
        const { target } = createDynamicClass('  foo   bar baz');
        expect(target.className).toBe('foo bar baz');
    });

    it('empty', async () => {
        const { host, target } = createDynamicClass('foo');

        host.dynamicClass = '';
        await Promise.resolve();
        expect(target.className).toBe('');
    });

    it('partial replacement', async () => {
        const { host, target } = createDynamicClass('foo bar');

        host.dynamicClass = 'bar baz';
        await Promise.resolve();
        expect(target.className).toBe('bar baz');
    });

    it('full replacement', async () => {
        const { host, target } = createDynamicClass('foo bar');
        expect(target.className).toBe('foo bar');

        host.dynamicClass = 'baz buz';
        await Promise.resolve();
        expect(target.className).toBe('baz buz');
    });

    it('preserves manually added classes', async () => {
        const { host, target } = createDynamicClass('foo');
        target.classList.add('bar');
        expect(target.className).toBe('foo bar');

        host.dynamicClass = 'baz';
        await Promise.resolve();
        expect(target.className).toBe('bar baz');
    });

    describe('updating with null/undefined/empty string', () => {
        function testRenderClassAttribute(type, value, expectedValue) {
            it(`renders the class attribute for ${type}`, () => {
                const elm = createElement('c-dynamic', { is: Dynamic });
                elm.dynamicClass = value;
                document.body.appendChild(elm);

                expect(elm.shadowRoot.querySelector('div').getAttribute('class')).toBe(
                    expectedValue
                );
            });
        }

        testRenderClassAttribute('null', null, null);
        testRenderClassAttribute('undefined', undefined, null);
        testRenderClassAttribute('empty string', '', null);
        testRenderClassAttribute('class string', 'my-class', 'my-class');

        function testUpdateClassAttribute(type, value, expectedValue) {
            it(`updates the class attribute for ${type}`, async () => {
                const elm = createElement('c-dynamic', { is: Dynamic });
                elm.dynamicClass = 'my-class';
                document.body.appendChild(elm);

                expect(elm.shadowRoot.querySelector('div').getAttribute('class')).toBe('my-class');

                elm.dynamicClass = value;
                await Promise.resolve();
                expect(elm.shadowRoot.querySelector('div').getAttribute('class')).toBe(
                    expectedValue
                );
            });
        }

        testUpdateClassAttribute('null', null, '');
        testUpdateClassAttribute('undefined', undefined, '');
        testUpdateClassAttribute('empty string', '', '');
        testUpdateClassAttribute('class string', 'my-class', 'my-class');
    });
});
