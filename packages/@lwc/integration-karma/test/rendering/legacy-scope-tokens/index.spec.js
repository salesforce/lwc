import { createElement, setFeatureFlagForTest } from 'lwc';
import Light from 'x/light';
import Shadow from 'x/shadow';

describe('legacy scope tokens', () => {
    [false, true].forEach((enableLegacyScopeTokens) => {
        describe(`enableLegacyScopeTokens=${enableLegacyScopeTokens}`, () => {
            beforeEach(() => {
                setFeatureFlagForTest('ENABLE_LEGACY_SCOPE_TOKENS', enableLegacyScopeTokens);
            });

            afterEach(() => {
                setFeatureFlagForTest('ENABLE_LEGACY_SCOPE_TOKENS', false);
            });

            function getAttributes(elm) {
                return [...elm.attributes]
                    .map((_) => _.name)
                    .filter((_) => _ !== 'class')
                    .sort();
            }

            function getClasses(elm) {
                return (
                    [...elm.classList]
                        // these are classes we add ourselves for the test
                        .filter((_) => !['static', 'dynamic', 'manual'].includes(_))
                        .sort()
                );
            }

            function expectTokens(modern, legacy) {
                return [
                    ...new Set(
                        [
                            process.env.API_VERSION <= 58 ? legacy : modern,
                            enableLegacyScopeTokens && legacy,
                        ].filter(Boolean)
                    ),
                ].sort();
            }

            function expectShadowAttrTokens(modern, legacy) {
                if (process.env.NATIVE_SHADOW) {
                    return []; // no scope attributes added in native shadow
                }
                return expectTokens(modern, legacy);
            }

            it('light dom', async () => {
                const elm = createElement('x-light', { is: Light });
                document.body.appendChild(elm);

                const verify = () => {
                    const staticDiv = elm.querySelector('.static');
                    const dynamicDiv = elm.querySelector('.dynamic');

                    expect(getClasses(elm)).toEqual(
                        expectTokens('lwc-1kadf5igpar-host', 'x-light_light-host')
                    );
                    expect(getClasses(staticDiv)).toEqual(
                        expectTokens('lwc-1kadf5igpar', 'x-light_light')
                    );
                    expect(getClasses(dynamicDiv)).toEqual(
                        expectTokens('lwc-1kadf5igpar', 'x-light_light')
                    );

                    expect(getAttributes(elm)).toEqual([]);
                    expect(getAttributes(staticDiv)).toEqual([]);
                    expect(getAttributes(dynamicDiv)).toEqual([]);
                };

                await Promise.resolve();

                verify();

                // force re-render
                elm.rerender = 1;
                await Promise.resolve();

                verify();
            });

            if (!process.env.NATIVE_SHADOW) {
                it('shadow dom', async () => {
                    const elm = createElement('x-shadow', { is: Shadow });
                    document.body.appendChild(elm);

                    const verify = () => {
                        const staticDiv = elm.shadowRoot.querySelector('.static');
                        const dynamicDiv = elm.shadowRoot.querySelector('.dynamic');
                        const manualDiv = elm.shadowRoot.querySelector('.manual');
                        const span = elm.shadowRoot.querySelector('span'); // inserted inside dom:manual

                        expect(getClasses(elm)).toEqual(
                            expectTokens('lwc-2idtulmc17f-host', 'x-shadow_shadow-host')
                        );
                        expect(getClasses(staticDiv)).toEqual(
                            expectTokens('lwc-2idtulmc17f', 'x-shadow_shadow')
                        );
                        expect(getClasses(dynamicDiv)).toEqual(
                            expectTokens('lwc-2idtulmc17f', 'x-shadow_shadow')
                        );
                        expect(getClasses(manualDiv)).toEqual(
                            expectTokens('lwc-2idtulmc17f', 'x-shadow_shadow')
                        );
                        expect(getClasses(span)).toEqual([]);

                        expect(getAttributes(elm)).toEqual(
                            expectShadowAttrTokens('lwc-2idtulmc17f-host', 'x-shadow_shadow-host')
                        );
                        expect(getAttributes(staticDiv)).toEqual(
                            expectShadowAttrTokens('lwc-2idtulmc17f', 'x-shadow_shadow')
                        );
                        expect(getAttributes(dynamicDiv)).toEqual(
                            expectShadowAttrTokens('lwc-2idtulmc17f', 'x-shadow_shadow')
                        );
                        expect(getClasses(manualDiv)).toEqual(
                            expectShadowAttrTokens('lwc-2idtulmc17f', 'x-shadow_shadow')
                        );
                        expect(getAttributes(span)).toEqual(
                            expectShadowAttrTokens('lwc-2idtulmc17f', 'x-shadow_shadow')
                        );
                    };

                    await Promise.resolve();

                    verify();

                    // force re-render
                    elm.rerender = 1;
                    await Promise.resolve();
                    await Promise.resolve(); // second microtask is for MutationObserver callbacks (portal)

                    verify();
                });
            }
        });
    });
});
