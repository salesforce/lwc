import { createElement } from 'lwc';

import Enabled from 'x/enabled';
import Disabled from 'x/disabled';
import NoFlag from 'x/no-flag';

import { resetDOM } from '../../../helpers/reset.js';

describe('Component feature flag enforcement', () => {
    afterEach(resetDOM);

    it('should render component when feature flag is enabled (true)', () => {
        const elm = createElement('x-enabled', { is: Enabled });
        document.body.appendChild(elm);

        expect(elm.shadowRoot).not.toBeNull();
        const div = elm.shadowRoot.querySelector('div');
        expect(div).not.toBeNull();
        expect(div.textContent).toBe('Feature flag enabled component');
    });

    it('should throw error when feature flag is disabled (false)', () => {
        expect(() => {
            const elm = createElement('x-disabled', { is: Disabled });
            document.body.appendChild(elm);
        }).toThrow(
            'Component Disabled is disabled by the feature flag at @salesforce/featureFlag/TEST_FLAG_DISABLED.'
        );
    });

    it('should render component normally when no feature flag is specified', () => {
        const elm = createElement('x-no-flag', { is: NoFlag });
        document.body.appendChild(elm);

        expect(elm.shadowRoot).not.toBeNull();
        const div = elm.shadowRoot.querySelector('div');
        expect(div).not.toBeNull();
        expect(div.textContent).toBe('Component without feature flag');
    });
});
