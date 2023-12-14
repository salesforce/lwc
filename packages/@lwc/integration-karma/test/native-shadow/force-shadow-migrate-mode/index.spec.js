import { createElement, setFeatureFlagForTest } from 'lwc';
import Native from 'x/native';
import Synthetic from 'x/synthetic';
import StyledLight from 'x/styledLight';

function doubleMicrotask() {
    // wait for applyShadowMigrateMode()
    return Promise.resolve().then(() => Promise.resolve());
}

function isActuallyNativeShadow(shadowRoot) {
    return shadowRoot.constructor.toString().includes('[native code]');
}

function isClaimingToBeSyntheticShadow(shadowRoot) {
    return !!shadowRoot.synthetic;
}

// This test only makes sense for true native shadow mode, because if ENABLE_FORCE_SHADOW_MIGRATE_MODE is true,
// then the polyfill should not be loaded at all.
if (process.env.NATIVE_SHADOW && !process.env.MIXED_SHADOW) {
    describe('shadow migrate mode', () => {
        beforeEach(async () => {
            const style = document.createElement('style');
            style.textContent = 'h1 { color: blue }';
            document.head.appendChild(style);
        });

        describe('flag on', () => {
            beforeEach(() => {
                setFeatureFlagForTest('ENABLE_FORCE_SHADOW_MIGRATE_MODE', true);
            });

            afterEach(() => {
                setFeatureFlagForTest('ENABLE_FORCE_SHADOW_MIGRATE_MODE', false);
            });

            it('uses global styles for synthetic components', async () => {
                const elm = createElement('x-synthetic', { is: Synthetic });
                document.body.appendChild(elm);

                await doubleMicrotask();

                expect(isActuallyNativeShadow(elm.shadowRoot)).toBe(true);
                expect(isClaimingToBeSyntheticShadow(elm.shadowRoot)).toBe(true);
                expect(getComputedStyle(elm.shadowRoot.querySelector('h1')).color).toBe(
                    'rgb(0, 0, 255)'
                );
            });

            it('does not use global styles for native components', async () => {
                const elm = createElement('x-native', { is: Native });
                document.body.appendChild(elm);

                await doubleMicrotask();

                expect(isActuallyNativeShadow(elm.shadowRoot)).toBe(true);
                expect(isClaimingToBeSyntheticShadow(elm.shadowRoot)).toBe(false);
                expect(getComputedStyle(elm.shadowRoot.querySelector('h1')).color).toBe(
                    'rgb(0, 0, 0)'
                );
            });

            it('does not apply styles from global light DOM components to synthetic components', async () => {
                const light = createElement('x-styled-light', { is: StyledLight });
                document.body.appendChild(light);

                const elm = createElement('x-synthetic', { is: Synthetic });
                document.body.appendChild(elm);

                await doubleMicrotask();

                expect(getComputedStyle(elm.shadowRoot.querySelector('h1')).opacity).toBe('1');
                expect(getComputedStyle(light.querySelector('h1')).opacity).toBe('0.5');
            });

            it('uses new styles added to the head after component is rendered', async () => {
                const elm = createElement('x-synthetic', { is: Synthetic });
                document.body.appendChild(elm);

                await doubleMicrotask();

                expect(getComputedStyle(elm.shadowRoot.querySelector('h1')).color).toBe(
                    'rgb(0, 0, 255)'
                );

                const style = document.createElement('style');
                style.textContent = `h1 { color: purple; background-color: crimson }`;
                document.head.appendChild(style);

                await doubleMicrotask();

                expect(getComputedStyle(elm.shadowRoot.querySelector('h1')).color).toBe(
                    'rgb(128, 0, 128)'
                );
                expect(getComputedStyle(elm.shadowRoot.querySelector('h1')).backgroundColor).toBe(
                    'rgb(220, 20, 60)'
                );
            });

            it('local styles are defined after global styles', async () => {
                const elm = createElement('x-synthetic', { is: Synthetic });
                document.body.appendChild(elm);

                const style = document.createElement('style');
                style.textContent = `h1 { font-family: sans-serif; background-color: green; }`;
                document.head.appendChild(style);

                await doubleMicrotask();

                expect(getComputedStyle(elm.shadowRoot.querySelector('h1')).backgroundColor).toBe(
                    'rgb(0, 128, 0)'
                );
                expect(getComputedStyle(elm.shadowRoot.querySelector('h1')).fontFamily).toBe(
                    'monospace'
                );
            });
        });

        describe('flag off', () => {
            it('does not use global styles for synthetic components', async () => {
                const elm = createElement('x-synthetic', { is: Synthetic });
                document.body.appendChild(elm);

                await doubleMicrotask();
                expect(isActuallyNativeShadow(elm.shadowRoot)).toBe(true);
                expect(isClaimingToBeSyntheticShadow(elm.shadowRoot)).toBe(false);
                expect(getComputedStyle(elm.shadowRoot.querySelector('h1')).color).toBe(
                    'rgb(0, 0, 0)'
                );
            });

            it('does not use global styles for native components', async () => {
                const elm = createElement('x-native', { is: Native });
                document.body.appendChild(elm);

                await doubleMicrotask();
                expect(isActuallyNativeShadow(elm.shadowRoot)).toBe(true);
                expect(isClaimingToBeSyntheticShadow(elm.shadowRoot)).toBe(false);
                expect(getComputedStyle(elm.shadowRoot.querySelector('h1')).color).toBe(
                    'rgb(0, 0, 0)'
                );
            });
        });
    });
}
