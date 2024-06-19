import { createElement, swapStyle } from 'lwc';
import { extractDataIds } from 'test-utils';
import ShadowUsesStaticStylesheets from 'shadow/usesStaticStylesheets';
import LightUsesStaticStylesheets from 'light/usesStaticStylesheets';
import LightGlobalUsesStaticStylesheets from 'light-global/usesStaticStylesheets';
import ShadowSimple from 'shadow/simple';
import ShadowStaleProp from 'shadow/staleProp';
import LightSimple from 'light/simple';
import LightStaleProp from 'light/staleProp';
import LightGlobalSimple from 'light-global/simple';
import LightGlobalStaleProp from 'light-global/staleProp';
import LibraryUserA from 'x/libraryUserA';
import LibraryUserB from 'x/libraryUserB';
import libraryStyle from 'x/library';
import libraryStyleV2 from 'x/libraryV2';

function expectStyles(elm, styles) {
    const computed = getComputedStyle(elm);
    for (const [style, value] of Object.entries(styles)) {
        expect(computed[style]).toBe(value);
    }
}

// Swapping is only enabled in dev mode
if (process.env.NODE_ENV !== 'production') {
    describe('style swapping', () => {
        afterEach(() => {
            window.__lwcResetHotSwaps();
            window.__lwcResetStylesheetCache();
            window.__lwcResetGlobalStylesheets();
        });

        const scenarios = [
            {
                testName: 'shadow',
                components: {
                    Simple: ShadowSimple,
                    StaleProp: ShadowStaleProp,
                    UsesStaticStylesheets: ShadowUsesStaticStylesheets,
                },
            },
            {
                testName: 'light',
                components: {
                    Simple: LightSimple,
                    StaleProp: LightStaleProp,
                    UsesStaticStylesheets: LightUsesStaticStylesheets,
                },
            },
            {
                testName: 'light-global',
                components: {
                    Simple: LightGlobalSimple,
                    StaleProp: LightGlobalStaleProp,
                    UsesStaticStylesheets: LightGlobalUsesStaticStylesheets,
                },
            },
        ];
        scenarios.forEach(({ testName, components }) => {
            describe(testName, () => {
                const { Simple, StaleProp, UsesStaticStylesheets } = components;
                it('should work with components with implicit style definition', async () => {
                    const { blockStyle, inlineStyle, noneStyle } = Simple;
                    const elm = createElement(`${testName}-simple`, { is: Simple });
                    document.body.appendChild(elm);

                    await Promise.resolve();
                    expectStyles(extractDataIds(elm).paragraph, {
                        display: 'block',
                    });
                    swapStyle(blockStyle[0], inlineStyle[0]);

                    await Promise.resolve();
                    expectStyles(extractDataIds(elm).paragraph, {
                        display: 'inline',
                    });
                    swapStyle(inlineStyle[0], noneStyle[0]);

                    await Promise.resolve();
                    expectStyles(extractDataIds(elm).paragraph, {
                        display: 'none',
                    });
                });

                it('should remove stale prop', async () => {
                    const { stylesV1, stylesV2, stylesV3 } = StaleProp;
                    const elm = createElement(`${testName}-stale-prop`, { is: StaleProp });
                    document.body.appendChild(elm);

                    await Promise.resolve();
                    expectStyles(extractDataIds(elm).paragraph, {
                        display: 'flex',
                        opacity: '1',
                        borderRadius: '0px',
                    });
                    swapStyle(stylesV1[0], stylesV2[0]);

                    await Promise.resolve();
                    expectStyles(extractDataIds(elm).paragraph, {
                        display: 'block',
                        opacity: '0.5',
                        borderRadius: '0px',
                    });
                    swapStyle(stylesV2[0], stylesV3[0]);

                    await Promise.resolve();
                    expectStyles(extractDataIds(elm).paragraph, {
                        display: 'block',
                        opacity: '1',
                        borderRadius: '5px',
                    });
                });

                it('should remove stale prop while swapping back and forth', async () => {
                    const { stylesV1, stylesV2 } = StaleProp;
                    const elm = createElement(`${testName}-stale-prop`, { is: StaleProp });
                    document.body.appendChild(elm);

                    await Promise.resolve();
                    expectStyles(extractDataIds(elm).paragraph, {
                        display: 'flex',
                        opacity: '1',
                    });
                    swapStyle(stylesV1[0], stylesV2[0]);

                    await Promise.resolve();
                    expectStyles(extractDataIds(elm).paragraph, {
                        display: 'block',
                        opacity: '0.5',
                    });
                    swapStyle(stylesV2[0], stylesV1[0]);

                    await Promise.resolve();
                    expectStyles(extractDataIds(elm).paragraph, {
                        display: 'flex',
                        opacity: '1',
                    });
                });

                it('should replace the same stylesheet in multiple components', async () => {
                    const { stylesV1, stylesV2 } = StaleProp;
                    const elm1 = createElement(`${testName}-stale-prop`, { is: StaleProp });
                    const elm2 = createElement(`${testName}-stale-prop`, { is: StaleProp });
                    document.body.appendChild(elm1);
                    document.body.appendChild(elm2);

                    await Promise.resolve();
                    for (const elm of [elm1, elm2]) {
                        expectStyles(extractDataIds(elm).paragraph, {
                            display: 'flex',
                            opacity: '1',
                        });
                    }
                    swapStyle(stylesV1[0], stylesV2[0]);

                    await Promise.resolve();
                    for (const elm of [elm1, elm2]) {
                        expectStyles(extractDataIds(elm).paragraph, {
                            display: 'block',
                            opacity: '0.5',
                        });
                    }
                });

                it('should replace static stylesheets', async () => {
                    const { asStatic, asStaticV2 } = UsesStaticStylesheets;
                    const elm = createElement(`${testName}-uses-static-stylesheets`, {
                        is: UsesStaticStylesheets,
                    });
                    document.body.appendChild(elm);

                    await Promise.resolve();
                    expectStyles(extractDataIds(elm).paragraph, {
                        color: 'rgba(255, 0, 0, 0)',
                        fontStyle: 'italic',
                    });

                    swapStyle(asStatic[0], asStaticV2[0]);

                    await Promise.resolve();
                    expectStyles(extractDataIds(elm).paragraph, {
                        color: 'rgba(0, 0, 255, 0)',
                        fontStyle: 'italic',
                    });
                });

                it('should be able to swap a style that will be used in future', async () => {
                    const { blockStyle, inlineStyle, noneStyle } = Simple;
                    const elm = createElement(`${testName}-simple`, { is: Simple });
                    document.body.appendChild(elm);

                    await Promise.resolve();
                    expectStyles(extractDataIds(elm).paragraph, {
                        display: 'block',
                    });
                    // Swap inlineStyle that hasn't been rendered yet
                    swapStyle(inlineStyle[0], noneStyle[0]);

                    await Promise.resolve();
                    // Verify that rendered content did not change
                    expectStyles(extractDataIds(elm).paragraph, {
                        display: 'block',
                    });
                    // Swap blockStyle to inlineStyle, which will transitively be swapped to noneStyle
                    swapStyle(blockStyle[0], inlineStyle[0]);

                    await Promise.resolve();
                    expectStyles(extractDataIds(elm).paragraph, {
                        display: 'none',
                    });
                });
            });
        });

        describe('CSS library', () => {
            const { style: styleA, styleV2: styleAV2 } = LibraryUserA;
            const { style: styleB, styleV2: styleBV2 } = LibraryUserB;

            let elmA;
            let elmB;

            beforeEach(async () => {
                elmA = createElement('x-library-user-a', { is: LibraryUserA });
                elmB = createElement(`x-library-user-b`, { is: LibraryUserB });
                document.body.appendChild(elmA);
                document.body.appendChild(elmB);

                await Promise.resolve();
                expectStyles(extractDataIds(elmA).paragraph, {
                    fontSize: '10px',
                    fontWeight: '100',
                });
                expectStyles(extractDataIds(elmB).paragraph, {
                    fontSize: '10px',
                    fontWeight: '800',
                });
            });

            it('swaps a library CSS file', async () => {
                swapStyle(libraryStyle[0], libraryStyleV2[0]);

                await Promise.resolve();
                expectStyles(extractDataIds(elmA).paragraph, {
                    fontSize: '20px',
                    fontWeight: '100',
                });
                expectStyles(extractDataIds(elmB).paragraph, {
                    fontSize: '20px',
                    fontWeight: '800',
                });
            });

            it('swaps a non-library CSS file while keeping library styles', async () => {
                // The library (`@import`) is the first stylesheet, so grab the second instead
                swapStyle(styleA[1], styleAV2[1]);

                await Promise.resolve();
                expectStyles(extractDataIds(elmA).paragraph, {
                    fontSize: '10px',
                    fontWeight: '200',
                });
                expectStyles(extractDataIds(elmB).paragraph, {
                    fontSize: '10px',
                    fontWeight: '800',
                });

                // The library (`@import`) is the first stylesheet, so grab the second instead
                swapStyle(styleB[1], styleBV2[1]);

                await Promise.resolve();
                expectStyles(extractDataIds(elmA).paragraph, {
                    fontSize: '10px',
                    fontWeight: '200',
                });
                expectStyles(extractDataIds(elmB).paragraph, {
                    fontSize: '10px',
                    fontWeight: '900',
                });
            });
        });
    });
}
