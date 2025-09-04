import { createElement, setFeatureFlagForTest } from 'lwc';
import Component from 'x/component';
import { LOWERCASE_SCOPE_TOKENS } from '../../../helpers/constants.js';

// TODO [#3733]: remove support for legacy scope tokens
[false, true].forEach((enableLegacyScopeTokens) => {
    describe(`enableLegacyScopeTokens=${enableLegacyScopeTokens}`, () => {
        beforeEach(() => {
            setFeatureFlagForTest('ENABLE_LEGACY_SCOPE_TOKENS', enableLegacyScopeTokens);
        });

        afterEach(() => {
            setFeatureFlagForTest('ENABLE_LEGACY_SCOPE_TOKENS', false);
            // We keep a cache of parsed static fragments; these need to be reset
            // since they can vary based on whether we use the legacy scope token or not.
            window.__lwcResetFragmentCache();
        });

        const expectedScopeTokens = [
            LOWERCASE_SCOPE_TOKENS && 'lwc-6a8uqob2ku4',
            (enableLegacyScopeTokens || !LOWERCASE_SCOPE_TOKENS) && 'x-component_component',
        ].filter(Boolean);

        it('consistent classes for scoped styles with class attribute #4714', async () => {
            const elm = createElement('x-component', { is: Component });
            document.body.appendChild(elm);
            await Promise.resolve();

            const divs = elm.shadowRoot.querySelectorAll('div');

            // TODO [#4714]: Scope token classes render in an inconsistent order for static vs dynamic classes
            expect(new Set(divs[0].classList)).toEqual(new Set(['foo', ...expectedScopeTokens]));

            expect(new Set(divs[1].classList)).toEqual(new Set(['bar', ...expectedScopeTokens]));
        });
    });
});
