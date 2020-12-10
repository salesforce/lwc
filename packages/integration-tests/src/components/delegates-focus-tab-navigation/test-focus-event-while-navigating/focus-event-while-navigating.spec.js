/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = '/focus-event-while-navigating';

function resetCounts() {
    return browser.execute(function () {
        document.querySelector('integration-focus-event-while-navigating').reset();
    });
}

function getFocusCounts() {
    return browser.execute(function () {
        var container = document.querySelector('integration-focus-event-while-navigating');
        return {
            host: container.hostFocusCount(),
            shadow: container.shadowFocusCount(),
        };
    });
}

describe('Focus event while sequential focus navigation', () => {
    beforeEach(async () => {
        await browser.url(URL);
    });

    // TODO [#1243]: Fix bug where shadow tree receives focus event when it should be skipped
    describe.skip('delegatesFocus: true, tabindex: -1', async () => {
        beforeEach(async () => {
            await resetCounts();
        });

        it('should not invoke focus event listeners (forward)', async () => {
            const headInput = await browser.shadowDeep$(
                'integration-focus-event-while-navigating',
                '.delegates-true-tabindex-negative .head'
            );
            await headInput.click();

            await browser.keys(['Tab']);

            const count = await getFocusCounts();
            assert.strictEqual(
                count.host,
                0,
                `Expected host focus count to be 0 but got ${count.host} instead.`
            );
            assert.strictEqual(
                count.shadow,
                0,
                `Expected shadow focus count to be 0 but got ${count.shadow} instead.`
            );
        });

        it('should not invoke focus event listeners (backward)', async () => {
            const tailInput = await browser.shadowDeep$(
                'integration-focus-event-while-navigating',
                '.delegates-true-tabindex-negative .tail'
            );
            await tailInput.click();

            await browser.keys(['Shift', 'Tab', 'Shift']);

            const count = await getFocusCounts();
            assert.strictEqual(
                count.host,
                0,
                `Expected host focus count to be 0 but got ${count.host} instead.`
            );
            assert.strictEqual(
                count.shadow,
                0,
                `Expected shadow focus count to be 0 but got ${count.shadow} instead.`
            );
        });
    });

    // TODO [#1244]: Fix bug where host does not receive focus event when it should
    describe.skip('delegatesFocus: true, tabindex: none', () => {
        beforeEach(async () => {
            await resetCounts();
        });

        it('should invoke focus event listeners (forward)', async () => {
            const headInput = await browser.shadowDeep$(
                'integration-focus-event-while-navigating',
                '.delegates-true-tabindex-none .head'
            );
            await headInput.click();

            await browser.keys(['Tab']); // internal input
            await browser.keys(['Tab']); // external input

            const count = await getFocusCounts();
            assert.strictEqual(
                count.host,
                1,
                `Expected host focus count to be 1 but got ${count.host} instead.`
            );
            assert.strictEqual(
                count.shadow,
                1,
                `Expected shadow focus count to be 1 but got ${count.shadow} instead.`
            );
        });

        it('should invoke focus event listeners (backward)', async () => {
            const tailInput = await browser.shadowDeep$(
                'integration-focus-event-while-navigating',
                '.delegates-true-tabindex-none .tail'
            );
            await tailInput.click();

            await browser.keys(['Shift', 'Tab', 'Shift']); // internal input
            await browser.keys(['Shift', 'Tab', 'Shift']); // external input

            const count = await getFocusCounts();
            assert.strictEqual(
                count.host,
                1,
                `Expected host focus count to be 1 but got ${count.host} instead.`
            );
            assert.strictEqual(
                count.shadow,
                1,
                `Expected shadow focus count to be 1 but got ${count.shadow} instead.`
            );
        });
    });

    describe('delegatesFocus: true, tabindex: 0', () => {
        beforeEach(async () => {
            await resetCounts();
        });

        it('should not invoke focus event listener on host and should invoke focus event listener in shadow (forward)', async () => {
            const headInput = await browser.shadowDeep$(
                'integration-focus-event-while-navigating',
                '.delegates-true-tabindex-zero .head'
            );
            await headInput.click();

            await browser.keys(['Tab']); // internal input
            await browser.keys(['Tab']); // external input

            const count = await getFocusCounts();
            assert.strictEqual(
                count.host,
                1,
                `Expected host focus count to be 1 but got ${count.host} instead.`
            );
            assert.strictEqual(
                count.shadow,
                1,
                `Expected shadow focus count to be 1 but got ${count.shadow} instead.`
            );
        });

        it('should not invoke focus event listener on host and should invoke focus event listener in shadow (backward)', async () => {
            const tailInput = await browser.shadowDeep$(
                'integration-focus-event-while-navigating',
                '.delegates-true-tabindex-zero .tail'
            );
            await tailInput.click();

            await browser.keys(['Shift', 'Tab', 'Shift']); // internal input
            await browser.keys(['Shift', 'Tab', 'Shift']); // external input

            const count = await getFocusCounts();
            assert.strictEqual(
                count.host,
                1,
                `Expected host focus count to be 1 but got ${count.host} instead.`
            );
            assert.strictEqual(
                count.shadow,
                1,
                `Expected shadow focus count to be 1 but got ${count.shadow} instead.`
            );
        });
    });

    // TODO [#1243]: Fix bug where shadow tree receives focus event when it should be skipped
    describe.skip('delegatesFocus: false, tabindex: -1', () => {
        beforeEach(async () => {
            await resetCounts();
        });

        it('should not invoke focus event listeners (forward)', async () => {
            const headInput = await browser.shadowDeep$(
                'integration-focus-event-while-navigating',
                '.delegates-false-tabindex-negative .head'
            );
            await headInput.click();

            await browser.keys(['Tab']); // external input

            const count = await getFocusCounts();
            assert.strictEqual(
                count.host,
                0,
                `Expected host focus count to be 0 but got ${count.host} instead.`
            );
            assert.strictEqual(
                count.shadow,
                0,
                `Expected shadow focus count to be 0 but got ${count.shadow} instead.`
            );
        });

        it('should not invoke focus event listeners (backward)', async () => {
            const tailInput = await browser.shadowDeep$(
                'integration-focus-event-while-navigating',
                '.delegates-false-tabindex-negative .tail'
            );
            await tailInput.click();

            await browser.keys(['Shift', 'Tab', 'Shift']); // external input

            const count = await getFocusCounts();
            assert.strictEqual(
                count.host,
                0,
                `Expected host focus count to be 0 but got ${count.host} instead.`
            );
            assert.strictEqual(
                count.shadow,
                0,
                `Expected shadow focus count to be 0 but got ${count.shadow} instead.`
            );
        });
    });

    describe('delegatesFocus: false, tabindex: 0', () => {
        beforeEach(async () => {
            await resetCounts();
        });

        it('should invoke focus event listener on both host and in shadow (forward)', async () => {
            const headInput = await browser.shadowDeep$(
                'integration-focus-event-while-navigating',
                '.delegates-false-tabindex-zero .head'
            );
            await headInput.click();

            await browser.keys(['Tab']); // host
            await browser.keys(['Tab']); // internal input
            await browser.keys(['Tab']); // external input

            const count = await getFocusCounts();
            assert.strictEqual(
                count.host,
                1,
                `Expected host focus count to be 1 but got ${count.host} instead.`
            );
            assert.strictEqual(
                count.shadow,
                1,
                `Expected shadow focus count to be 1 but got ${count.shadow} instead.`
            );
        });

        it('should invoke focus event listener on both host and in shadow (backward)', async () => {
            const tailInput = await browser.shadowDeep$(
                'integration-focus-event-while-navigating',
                '.delegates-false-tabindex-zero .tail'
            );
            await tailInput.click();

            await browser.keys(['Shift', 'Tab', 'Shift']); // internal input
            await browser.keys(['Shift', 'Tab', 'Shift']); // host
            await browser.keys(['Shift', 'Tab', 'Shift']); // external input

            const count = await getFocusCounts();
            assert.strictEqual(
                count.host,
                1,
                `Expected host focus count to be 1 but got ${count.host} instead.`
            );
            assert.strictEqual(
                count.shadow,
                1,
                `Expected shadow focus count to be 1 but got ${count.shadow} instead.`
            );
        });
    });

    // TODO [#1244]: Fix bug where host does not receive focus event when it should
    describe.skip('delegatesFocus: false, tabindex: none', () => {
        beforeEach(async () => {
            await resetCounts();
        });

        it('should invoke focus event listeners (forward)', async () => {
            const headInput = await browser.shadowDeep$(
                'integration-focus-event-while-navigating',
                '.delegates-true-tabindex-none .head'
            );
            await headInput.click();

            await browser.keys(['Tab']); // internal input
            await browser.keys(['Tab']); // external input

            const count = await getFocusCounts();
            assert.strictEqual(
                count.host,
                1,
                `Expected host focus count to be 1 but got ${count.host} instead.`
            );
            assert.strictEqual(
                count.shadow,
                1,
                `Expected shadow focus count to be 1 but got ${count.shadow} instead.`
            );
        });

        it('should invoke focus event listeners (backward)', async () => {
            const tailInput = await browser.shadowDeep$(
                'integration-focus-event-while-navigating',
                '.delegates-true-tabindex-none .tail'
            );
            await tailInput.click();

            await browser.keys(['Shift', 'Tab', 'Shift']); // internal input
            await browser.keys(['Shift', 'Tab', 'Shift']); // external input

            const count = await getFocusCounts();
            assert.strictEqual(
                count.host,
                1,
                `Expected host focus count to be 1 but got ${count.host} instead.`
            );
            assert.strictEqual(
                count.shadow,
                1,
                `Expected shadow focus count to be 1 but got ${count.shadow} instead.`
            );
        });
    });
});
