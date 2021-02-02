/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { compile } from '../index';
import { readFixture, pretify } from './utils';

describe('regression test', () => {
    it('#743 - Object rest spread throwing', async () => {
        const actual = `const base = { foo: true }; const res = { ...base, bar: false };`;
        const expected = `
            define('x/foo', function () {
                function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }
                function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }
                function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
                const base = {
                    foo: true
                };
                _objectSpread(_objectSpread({}, base), {}, {
                    bar: false
                });
            });
        `;

        const { result } = await compile({
            name: 'foo',
            namespace: 'x',
            files: {
                'foo.js': actual,
            },
        });
        expect(pretify(result.code)).toBe(pretify(expected));
    });
});

describe('smoke test for babel transform', () => {
    it('should transpile none stage-4 syntax features in none-compat', async () => {
        const { result } = await compile({
            name: 'babel',
            namespace: 'x',
            files: {
                'babel.js': readFixture('namespaced_folder/babel/babel.js'),
            },
            outputConfig: { format: 'es' },
        });

        expect(pretify(result.code)).toBe(pretify(readFixture('expected-babel.js')));
    });

    it('should transpile back to es5 in compat mode', async () => {
        const { result } = await compile({
            name: 'babel',
            namespace: 'x',
            files: {
                'babel.js': readFixture('namespaced_folder/babel/babel.js'),
            },
            outputConfig: {
                compat: true,
                format: 'es',
            },
        });

        expect(pretify(result.code)).toBe(pretify(readFixture('expected-babel-compat.js')));
    });
});
