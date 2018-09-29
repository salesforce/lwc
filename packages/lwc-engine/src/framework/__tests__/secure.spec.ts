import { secure, createElement, LightningElement } from '../main';

describe('secure', () => {
    beforeEach(() => (secure.enabled = true));
    afterEach(() => (secure.enabled = false));

    it('forbidden access to template', () => {
        function html($api) {
            return [$api.h('div', { key: 1 }, [])];
        };

        class Foo extends LightningElement {
            render() {
                return html;
            }
        }
        const elmt = createElement('x-foo', { is: Foo });;
        expect(() => {
            document.body.appendChild(elmt);
        }).toThrowError('Unknown template');
    });
});
