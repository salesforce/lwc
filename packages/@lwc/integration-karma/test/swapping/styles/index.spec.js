import { createElement, swapStyle } from 'lwc';
import { extractDataIds } from 'test-utils';
import ShadowSimple from 'shadow/simple';
import ShadowStaleProp from 'shadow/staleProp';
import LightSimple from 'light/simple';
import LightStaleProp from 'light/staleProp';
import LightGlobalSimple from 'light-global/simple';
import LightGlobalStaleProp from 'light-global/staleProp';

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
                },
            },
            {
                testName: 'light',
                components: {
                    Simple: LightSimple,
                    StaleProp: LightStaleProp,
                },
            },
            {
                testName: 'light-global',
                components: {
                    Simple: LightGlobalSimple,
                    StaleProp: LightGlobalStaleProp,
                },
            },
        ];
        scenarios.forEach(({ testName, components }) => {
            describe(testName, () => {
                const { Simple, StaleProp } = components;
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
            });
        });
    });
}
