import { createElement, setFeatureFlagForTest } from 'lwc';

import One from 'x/one';
import Two from 'x/two';
import Shadow from 'x/shadow';

describe('Light DOM IDs and fragment links', () => {
    beforeEach(() => {
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', true);
    });
    afterEach(() => {
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', false);
    });
    it('should not mangle IDs or hrefs in light DOM', () => {
        document.body.appendChild(createElement('x-one', { is: One }));
        document.body.appendChild(createElement('x-two', { is: Two }));

        expect(document.body.querySelector('x-one .foo').id).toEqual('foo');
        expect(document.body.querySelector('x-one .bar').id).toEqual('bar');
        expect(document.body.querySelector('x-two .foo').id).toEqual('foo');
        expect(document.body.querySelector('x-two .quux').id).toEqual('quux');

        expect(document.body.querySelector('x-one .go-to-foo').href).toMatch(/#foo$/);
        expect(document.body.querySelector('x-one .go-to-bar').href).toMatch(/#bar$/);
        expect(document.body.querySelector('x-one .go-to-quux').href).toMatch(/#quux$/);

        expect(document.body.querySelector('x-two .go-to-foo').href).toMatch(/#foo$/);
        expect(document.body.querySelector('x-two .go-to-bar').href).toMatch(/#bar$/);
        expect(document.body.querySelector('x-two .go-to-quux').href).toMatch(/#quux$/);
    });

    // Remove this test when this is fixed: https://github.com/salesforce/lwc/issues/1150
    it('should only mangle non-dangling hrefs in shadow DOM', () => {
        document.body.appendChild(createElement('x-one', { is: One }));
        document.body.appendChild(createElement('x-shadow', { is: Shadow }));

        expect(document.body.querySelector('x-one .foo').id).toEqual('foo');
        expect(document.body.querySelector('x-one .bar').id).toEqual('bar');
        expect(document.body.querySelector('x-shadow').shadowRoot.querySelector('.foo').id).toMatch(
            /^foo-\d+$/
        );
        expect(
            document.body.querySelector('x-shadow').shadowRoot.querySelector('.quux').id
        ).toMatch(/^quux-\d+$/);

        expect(document.body.querySelector('x-one .go-to-foo').href).toMatch(/#foo$/);
        expect(document.body.querySelector('x-one .go-to-bar').href).toMatch(/#bar$/);
        expect(document.body.querySelector('x-one .go-to-quux').href).toMatch(/#quux$/);

        expect(
            document.body.querySelector('x-shadow').shadowRoot.querySelector('.go-to-foo').href
        ).toMatch(/#foo-\d+$/);
        expect(
            document.body.querySelector('x-shadow').shadowRoot.querySelector('.go-to-bar').href
        ).toMatch(/#bar-\d+$/);
        expect(
            document.body.querySelector('x-shadow').shadowRoot.querySelector('.go-to-quux').href
        ).toMatch(/#quux-\d+$/);
    });
});
