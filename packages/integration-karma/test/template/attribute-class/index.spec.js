import { createElement } from 'test-utils';

import Dynamic from 'x/dynamic';

fdescribe('dynamic class attribute', () => {
    function createDynamicClass(className) {
        const elm = createElement('x-dynamic', { is: Dynamic });
        elm.dynamicClass = className;
        document.body.appendChild(elm);

        return {
            host: elm,
            target: elm.shadowRoot.querySelector('div')
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

    it('empty', () => {
        const { host, target } = createDynamicClass('foo');

        host.dynamicClass = '';
        return Promise.resolve().then(() => {
            expect(target.className).toBe('');
        });
    });

    it('partial replacement', () => {
        const { host, target } = createDynamicClass('foo bar');

        host.dynamicClass = 'bar baz';
        return Promise.resolve().then(() => {
            expect(target.className).toBe('bar baz');
        });
    });

    it('full replacement', () => {
        const { host, target } = createDynamicClass('foo bar');
        expect(target.className).toBe('foo bar');

        host.dynamicClass = 'baz buz';
        return Promise.resolve().then(() => {
            expect(target.className).toBe('baz buz');
        });
    });
});
