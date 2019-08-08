/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
// TODO: #1311 move this tests to integration
jest.mock('./../../env/element');
import { isTabbable } from '../focus';

describe('focus', () => {
    describe('isTabbable', () => {
        describe('Form control elements', () => {
            it('<button type="button"> is tabbable', () => {
                const el = document.createElement('button');
                el.setAttribute('type', 'button');
                document.body.appendChild(el);
                expect(isTabbable(el)).toBe(true);
            });

            it('<button type="button" disabled> is not tabbable', () => {
                const el = document.createElement('button');
                el.setAttribute('type', 'button');
                el.setAttribute('disabled', '');
                document.body.appendChild(el);
                expect(isTabbable(el)).toBe(false);
            });

            it('<input type="checkbox" /> is tabbable', () => {
                const el = document.createElement('input');
                el.setAttribute('type', 'checkbox');
                expect(isTabbable(el)).toBe(true);
            });

            it('<input type="checkbox" disabled /> is not tabbable', () => {
                const el = document.createElement('input');
                el.setAttribute('type', 'checkbox');
                el.setAttribute('disabled', '');
                expect(isTabbable(el)).toBe(false);
            });

            it('<input type="password"> is tabbable', () => {
                const el = document.createElement('input');
                el.setAttribute('type', 'password');
                expect(isTabbable(el)).toBe(true);
            });

            it('<input type="radio" /> is tabbable', () => {
                const el = document.createElement('input');
                el.setAttribute('type', 'radio');
                expect(isTabbable(el)).toBe(true);
            });

            it('<input type="submit" /> is tabbable', () => {
                const el = document.createElement('input');
                el.setAttribute('type', 'submit');
                expect(isTabbable(el)).toBe(true);
            });

            it('<input type="text" /> is tabbable', () => {
                const el = document.createElement('input');
                el.setAttribute('type', 'text');
                expect(isTabbable(el)).toBe(true);
            });

            it('<input type="reset" /> is tabbable', () => {
                const el = document.createElement('input');
                el.setAttribute('type', 'reset');
                expect(isTabbable(el)).toBe(true);
            });

            it('<select> is tabbable', () => {
                const el = document.createElement('select');
                expect(isTabbable(el)).toBe(true);
            });

            it('<select disabled> is not tabbable', () => {
                const el = document.createElement('select');
                el.setAttribute('disabled', '');
                expect(isTabbable(el)).toBe(false);
            });

            it('<textarea> is tabbable', () => {
                const el = document.createElement('textarea');
                expect(isTabbable(el)).toBe(true);
            });

            it('<textarea disabled> is not tabbable', () => {
                const el = document.createElement('textarea');
                el.setAttribute('disabled', '');
                expect(isTabbable(el)).toBe(false);
            });

            // Negative tab index
            it('<button type="button" tabindex="-1"> is not tabbable', () => {
                const el = document.createElement('button');
                el.setAttribute('type', 'button');
                el.setAttribute('tabindex', '-1');
                expect(isTabbable(el)).toBe(false);
            });

            it('<input type="checkbox" tabindex="-1" /> is not tabbable', () => {
                const el = document.createElement('input');
                el.setAttribute('type', 'checkbox');
                el.setAttribute('tabindex', '-1');
                expect(isTabbable(el)).toBe(false);
            });

            it('<input type="password" tabindex="-1" /> is not tabbable', () => {
                const el = document.createElement('input');
                el.setAttribute('type', 'password');
                el.setAttribute('tabindex', '-1');
                expect(isTabbable(el)).toBe(false);
            });

            it('<input type="radio" tabindex="-1" /> is not tabbable', () => {
                const el = document.createElement('input');
                el.setAttribute('type', 'radio');
                el.setAttribute('tabindex', '-1');
                expect(isTabbable(el)).toBe(false);
            });

            it('<input type="submit" tabindex="-1" /> is not tabbable', () => {
                const el = document.createElement('input');
                el.setAttribute('type', 'submit');
                el.setAttribute('tabindex', '-1');
                expect(isTabbable(el)).toBe(false);
            });

            it('<input type="text" tabindex="-1" /> is not tabbable', () => {
                const el = document.createElement('input');
                el.setAttribute('type', 'text');
                el.setAttribute('tabindex', '-1');
                expect(isTabbable(el)).toBe(false);
            });

            it('<input type="reset" tabindex="-1" /> is not tabbable', () => {
                const el = document.createElement('input');
                el.setAttribute('type', 'reset');
                el.setAttribute('tabindex', '-1');
                expect(isTabbable(el)).toBe(false);
            });

            it('<select tabindex="-1" /> is not tabbable', () => {
                const el = document.createElement('select');
                el.setAttribute('tabindex', '-1');
                expect(isTabbable(el)).toBe(false);
            });

            it('<textarea tabindex="-1" /> is not tabbable', () => {
                const el = document.createElement('textarea');
                el.setAttribute('tabindex', '-1');
                expect(isTabbable(el)).toBe(false);
            });
        });

        describe('Form element', () => {
            it('<form tabindex="-1" /> is not tabbable', () => {
                const el = document.createElement('form');
                el.setAttribute('tabindex', '-1');
                expect(isTabbable(el)).toBe(false);
            });

            it('<form tabindex="0" /> is focusable', () => {
                const el = document.createElement('form');
                el.setAttribute('tabindex', '0');
                expect(isTabbable(el)).toBe(true);
            });

            it('<form disabled tabindex="-1" /> is not tabbable', () => {
                const el = document.createElement('form');
                el.setAttribute('disabled', 'disabled');
                el.setAttribute('tabindex', '-1');
                expect(isTabbable(el)).toBe(false);
            });

            it('<form disabled tabindex="0" /> is tabbable', () => {
                const el = document.createElement('form');
                el.setAttribute('disabled', 'disabled');
                el.setAttribute('tabindex', '0');
                expect(isTabbable(el)).toBe(true);
            });
        });

        describe('Editable elements', () => {
            it('<div contenteditable /> is tabbable', () => {
                const el = document.createElement('div');
                el.setAttribute('contenteditable', 'contenteditable');
                expect(isTabbable(el)).toBe(true);
            });

            it('<div contenteditable tabindex="-1" /> is not tabbable', () => {
                const el = document.createElement('div');
                el.setAttribute('contenteditable', 'contenteditable');
                el.setAttribute('tabindex', '-1');
                expect(isTabbable(el)).toBe(false);
            });
        });

        describe('Tabindex attribute', () => {
            it('<div tabindex="-1" /> is not tabbable', () => {
                const el = document.createElement('div');
                el.setAttribute('tabindex', '-1');
                expect(isTabbable(el)).toBe(false);
            });

            it('<div tabindex="0" /> is tabbable', () => {
                const el = document.createElement('div');
                el.setAttribute('tabindex', '0');
                expect(isTabbable(el)).toBe(true);
            });

            it('<div tabindex=""> is not tabbable', () => {
                const el = document.createElement('div');
                el.setAttribute('tabindex', '');
                expect(isTabbable(el)).toBe(false);
            });

            it('<div tabindex="hello"> is not tabbable', () => {
                const el = document.createElement('div');
                el.setAttribute('tabindex', 'hello');
                expect(isTabbable(el)).toBe(false);
            });

            it('<input tabindex="hello" /> is tabbable', () => {
                const el = document.createElement('input');
                el.setAttribute('tabindex', 'hello');
                expect(isTabbable(el)).toBe(true);
            });
        });

        describe('navigation elements', () => {
            it('<a href=".."> is focusable', () => {
                const el = document.createElement('a');
                el.setAttribute('href', '#');
                expect(isTabbable(el)).toBe(true);
            });

            it('<a href> is focusable', () => {
                const el = document.createElement('a');
                el.setAttribute('href', '');
                expect(isTabbable(el)).toBe(true);
            });

            it('<a href=".." tabindex="-1"> is not tabbable', () => {
                const el = document.createElement('a');
                el.setAttribute('href', '#');
                el.setAttribute('tabindex', '-1');
                expect(isTabbable(el)).toBe(false);
            });
        });

        describe('media elements', () => {
            it('<audio controls> is tabbable', () => {
                const el = document.createElement('audio');
                el.setAttribute('controls', 'controls');
                expect(isTabbable(el)).toBe(true);
            });

            it('<audio controls tabindex="-1"> is not tabbable', () => {
                const el = document.createElement('audio');
                el.setAttribute('controls', 'controls');
                el.setAttribute('tabindex', '-1');
                expect(isTabbable(el)).toBe(false);
            });

            it('<video controls> is tabbable', () => {
                const el = document.createElement('video');
                el.setAttribute('controls', 'controls');
                expect(isTabbable(el)).toBe(true);
            });

            it('<video controls tabindex="-1"> is not tabbable', () => {
                const el = document.createElement('video');
                el.setAttribute('controls', 'controls');
                el.setAttribute('tabindex', '-1');
                expect(isTabbable(el)).toBe(false);
            });
        });

        describe('iframe elements', () => {
            it('<iframe src="..." tabindex="-1"> is not tabbable', () => {
                const el = document.createElement('iframe');
                el.setAttribute('src', 'https://salesforce.com');
                el.setAttribute('tabindex', '-1');
                expect(isTabbable(el)).toBe(false);
            });
        });

        describe('Table elements', () => {
            it('<table> is not tabbable', () => {
                const el = document.createElement('table');
                expect(isTabbable(el)).toBe(false);
            });

            it('<tr> is not tabbable', () => {
                const el = document.createElement('tr');
                expect(isTabbable(el)).toBe(false);
            });

            it('<td> is not tabbable', () => {
                const el = document.createElement('td');
                expect(isTabbable(el)).toBe(false);
            });
        });
    });
});
