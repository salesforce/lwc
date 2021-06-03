import { createElement, setFeatureFlagForTest } from 'lwc';

import Native from 'x/native';
import Synthetic from 'x/synthetic';
import Light from 'x/light';

describe('this.shadowRoot', () => {
    it('elements that prefer native shadow should support this.shadowRoot', () => {
        const el = createElement('x-native', { is: Native });
        document.body.appendChild(el);
        expect(el.shadowRoot.querySelector('div').textContent).toEqual('true');
    });

    it('elements that do not prefer native shadow should not support this.shadowRoot', () => {
        const el = createElement('x-synthetic', { is: Synthetic });
        document.body.appendChild(el);
        expect(el.shadowRoot.querySelector('div').textContent).toEqual('false');
    });

    describe('light DOM', () => {
        beforeEach(() => {
            setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', true);
        });
        afterEach(() => {
            setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', false);
        });
        it('light DOM elements should not support this.shadowRoot', () => {
            expect(() => {
                const el = createElement('x-light', { is: Light });
                document.body.appendChild(el);
            }).toLogErrorDev(
                'Error: [LWC error]: `this.shadowRoot` returns null for light DOM components. Since there is no shadow, the rendered content can be accessed via `this` itself. e.g. instead of `this.shadowRoot.querySelector`, use `this.querySelector`.'
            );
        });
    });
});
