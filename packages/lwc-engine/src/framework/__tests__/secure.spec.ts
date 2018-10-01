import { secure, createElement, LightningElement } from '../main';

describe('secure', () => {
    beforeEach(() => (secure.enabled = true));
    afterEach(() => (secure.enabled = false));

    it('forbidden access to template', () => {
        // We can't use the inline template compiler here
        // since precesily we are trying to test that handcrafted
        // functions throw an exception.
        function html() {
            return [];
        }

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
