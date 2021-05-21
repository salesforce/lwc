import { createElement, setFeatureFlagForTest } from 'lwc';

import Shadow from 'x/shadow';
import Light from 'x/light';

describe('lwc:render-mode', () => {
    beforeEach(() => {
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', true);
    });
    afterEach(() => {
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', false);
    });
    it('should throw error if shadow template is passed to light component', () => {
        expect(() => {
            const root = createElement('x-test', { is: Light });
            document.body.appendChild(root);
        }).toThrowError('');
    });
    it('should throw error if light template is passed to shadow component', () => {
        expect(() => {
            const root = createElement('x-test', { is: Shadow });
            document.body.appendChild(root);
        }).toThrowError('');
    });
});
