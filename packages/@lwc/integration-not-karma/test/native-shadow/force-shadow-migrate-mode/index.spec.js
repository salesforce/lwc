import { createElement, setFeatureFlagForTest } from 'lwc';
import Native from 'c/native';
import Synthetic from 'c/synthetic';
import StyledLight from 'c/styledLight';

async function doubleMicrotask() {
    // wait for applyShadowMigrateMode()
    await Promise.resolve();
    return await Promise.resolve();
}

function isActuallyNativeShadow(shadowRoot) {
    return shadowRoot.constructor.toString().includes('[native code]');
}

function isClaimingToBeSyntheticShadow(shadowRoot) {
    return !!shadowRoot.synthetic;
}

// This test only makes sense for true native shadow mode, because if ENABLE_FORCE_SHADOW_MIGRATE_MODE is true,
// then the polyfill should not be loaded at all.

describe.runIf(process.env.NATIVE_SHADOW && !process.env.FORCE_NATIVE_SHADOW_MODE_FOR_TEST)(
    'shadow migrate mode',
    () => {
        beforeEach(() => {
            const style = document.createElement('style');
            style.textContent = 'h1 { color: blue }';
            document.head.appendChild(style);
        });

        describe('flag on', () => {
            beforeEach(async () => {
                setFeatureFlagForTest('ENABLE_FORCE_SHADOW_MIGRATE_MODE', true);
                await Promise.resolve();
            });

            afterEach(() => {
                setFeatureFlagForTest('ENABLE_FORCE_SHADOW_MIGRATE_MODE', false);
            });

            it('uses global styles for synthetic components', async () => {
                const elm = createElement('c-synthetic', { is: Synthetic });
                document.body.appendChild(elm);

                await doubleMicrotask();

                expect(isActuallyNativeShadow(elm.shadowRoot)).toBe(true);
                expect(isClaimingToBeSyntheticShadow(elm.shadowRoot)).toBe(true);
                expect(getComputedStyle(elm.shadowRoot.querySelector('h1')).color).toBe(
                    'rgb(0, 0, 255)'
                );
            });

            it('does not use global styles for native components', async () => {
                const elm = createElement('c-native', { is: Native });
                document.body.appendChild(elm);

                await doubleMicrotask();

                expect(isActuallyNativeShadow(elm.shadowRoot)).toBe(true);
                expect(isClaimingToBeSyntheticShadow(elm.shadowRoot)).toBe(false);
                const computed = getComputedStyle(elm.shadowRoot.querySelector('h1'));
                expect(computed.color).toBe('rgb(0, 0, 0)');
            });

            it('does not apply styles from global light DOM components to synthetic components', async () => {
                const light = createElement('c-styled-light', { is: StyledLight });
                document.body.appendChild(light);

                const elm = createElement('c-synthetic', { is: Synthetic });
                document.body.appendChild(elm);

                await doubleMicrotask();

                expect(getComputedStyle(elm.shadowRoot.querySelector('h1')).opacity).toBe('1');
                expect(getComputedStyle(light.querySelector('h1')).opacity).toBe('0.5');
            });

            it('uses new styles added to the head after component is rendered', async () => {
                const elm = createElement('c-synthetic', { is: Synthetic });
                document.body.appendChild(elm);

                await doubleMicrotask();

                let computed = getComputedStyle(elm.shadowRoot.querySelector('h1'));
                expect(computed.color).toBe('rgb(0, 0, 255)');

                const style = document.createElement('style');
                style.textContent = `h1 { color: purple; background-color: crimson }`;
                document.head.appendChild(style);

                await doubleMicrotask();

                computed = getComputedStyle(elm.shadowRoot.querySelector('h1'));
                expect(computed.color).toBe('rgb(128, 0, 128)');
                expect(computed.backgroundColor).toBe('rgb(220, 20, 60)');
            });

            it('local styles are defined after global styles', async () => {
                const elm = createElement('c-synthetic', { is: Synthetic });
                document.body.appendChild(elm);

                const style = document.createElement('style');
                style.textContent = `h1 { font-family: sans-serif; background-color: green; }`;
                document.head.appendChild(style);

                await doubleMicrotask();

                const computed = getComputedStyle(elm.shadowRoot.querySelector('h1'));
                expect(computed.backgroundColor).toBe('rgb(0, 128, 0)');
                expect(computed.fontFamily).toBe('monospace');
            });
        });

        describe('flag off', () => {
            it('does not use global styles for synthetic components', async () => {
                const elm = createElement('c-synthetic', { is: Synthetic });
                document.body.appendChild(elm);

                await doubleMicrotask();
                expect(isActuallyNativeShadow(elm.shadowRoot)).toBe(true);
                expect(isClaimingToBeSyntheticShadow(elm.shadowRoot)).toBe(false);
                const computed = getComputedStyle(elm.shadowRoot.querySelector('h1'));
                expect(computed.color).toBe('rgb(0, 0, 0)');
            });

            it('does not use global styles for native components', async () => {
                const elm = createElement('c-native', { is: Native });
                document.body.appendChild(elm);

                await doubleMicrotask();
                expect(isActuallyNativeShadow(elm.shadowRoot)).toBe(true);
                expect(isClaimingToBeSyntheticShadow(elm.shadowRoot)).toBe(false);
                const computed = getComputedStyle(elm.shadowRoot.querySelector('h1'));
                expect(computed.color).toBe('rgb(0, 0, 0)');
            });
        });
    }
);
