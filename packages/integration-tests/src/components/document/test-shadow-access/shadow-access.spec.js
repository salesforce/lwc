/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const assert = require('assert');
const URL = '/shadow-access';

describe('document.prototype query methods', () => {
    before(() => {
        browser.url(URL);
    });

    it('should not have access to shadowed elements (getElementById)', () => {
        var elm = browser.execute(function() {
            var container = document.querySelector('integration-shadow-access');
            var id = container.shadowRoot.querySelector('integration-parent').id;
            return document.getElementById(id);
        });
        assert.strictEqual(elm, null);
    });

    it('should not have access to shadowed elements (querySelector)', () => {
        var elm = browser.execute(function() {
            return document.querySelector('input');
        });
        assert.strictEqual(elm, null, 'selector: input');

        elm = browser.execute(function() {
            return document.querySelector('.bar');
        });
        assert.strictEqual(elm, null, 'selector: .bar');

        elm = browser.execute(function() {
            return document.querySelector('[name="baz"]');
        });
        assert.strictEqual(elm, null, 'selector: [name="baz"]');
    });

    it('should not have access to shadowed elements (querySelectorAll)', () => {
        var count = browser.execute(function() {
            return document.querySelectorAll('input').length;
        });
        assert.strictEqual(count, 0, 'selector: input');

        count = browser.execute(function() {
            return document.querySelectorAll('.bar').length;
        });
        assert.strictEqual(count, 0, 'selector: .bar');

        count = browser.execute(function() {
            return document.querySelectorAll('[name="baz"]').length;
        });
        assert.strictEqual(count, 0, 'selector: [name="baz"]');
    });

    it('should not have access to shadowed elements (getElementsByClassName)', () => {
        var count = browser.execute(function() {
            return document.getElementsByClassName('bar').length;
        });
        assert.strictEqual(count, 0);
    });

    it('should not have access to shadowed elements (getElementsByTagName)', () => {
        var count = browser.execute(function() {
            return document.getElementsByTagName('input').length;
        });
        assert.strictEqual(count, 0);
    });

    it('should not have access to shadowed elements (getElementsByTagNameNS)', () => {
        var count = browser.execute(function() {
            return document.getElementsByTagNameNS('http://www.w3.org/2000/svg', '*').length;
        });
        assert.strictEqual(count, 0);
    });

    it('should not have access to shadowed elements (getElementsByName)', () => {
        var count = browser.execute(function() {
            return document.getElementsByName('baz').length;
        });
        assert.strictEqual(count, 0);
    });
});
