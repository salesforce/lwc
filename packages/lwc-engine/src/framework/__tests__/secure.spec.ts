import { secure, createElement, LightningElement } from '../main';

describe('secure', () => {
    beforeEach(() => (secure.enabled = true));
    afterEach(() => (secure.enabled = false));

    it.only('forbidden access to template', () => {
        function html($api) {
            return [$api.h('div', { key: 1 }, [])];
        };

        class Foo extends LightningElement {
            render() {
                return html;
            }
        }

        expect(() => {
            createElement('x-foo', { is: Foo });
        }).toThrowError('Unknown template');
    });
});
