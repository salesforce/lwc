/* eslint-env node */

const fs = require('fs');
const path = require('path');
const babel = require('babel-core');
const proxyCompat = require('proxy-compat');

const transformRaptorCompat = require('../index');

const FIXTURE_DIR = path.join(__dirname, 'fixtures');
const FIXTURES = [
    'key-operations',
    'array-operations',
    'intrinsics',
    'no-compat-pragma',
    'no-compat-pragma-multiple',
];

function unpad(src) {
    return src.split('\n')
        .map(line => line.trim())
        .filter(line => line.length)
        .join('\n');
}

test('Validate config property', () => {
    expect(() => {
        babel.transform('', {
            plugins: [
                [transformRaptorCompat, {
                    resolveProxyCompat: {
                        unknown: 'window.MyGlobalProxy'
                    }
                }]
            ]
        });
    }).toThrow(
        /Unexpected resolveProxyCompat option/
    );
});

test('APIs retrieval from global', () => {
    const config = {
        plugins: [
            [transformRaptorCompat, {
                resolveProxyCompat: {
                    global: 'window.MyGlobalProxy'
                }
            }]
        ]
    };

    const { code } = babel.transform(`console.log(foo.bar)`, config);
    expect(unpad(code)).toBe(unpad(
        `var __callKey = window.MyGlobalProxy.callKey;
        var __getKey = window.MyGlobalProxy.getKey;
        __callKey(console, "log", __getKey(foo, "bar"));`
    ));
});

test('APIs retrieval from module', () => {
    const config = {
        plugins: [
            [transformRaptorCompat, {
                resolveProxyCompat: {
                    module: 'my-proxy-compat'
                }
            }]
        ]
    };

    const { code } = babel.transform(`console.log(foo.bar)`, config);
    expect(unpad(code)).toBe(unpad(
        `import __ProxyCompat from "my-proxy-compat";
        var __callKey = __ProxyCompat.callKey;
        var __getKey = __ProxyCompat.getKey;
        __callKey(console, "log", __getKey(foo, "bar"));`
    ));
});

test('APIs retrieval from independent modules', () => {
    const config = {
        plugins: [
            [transformRaptorCompat, {
                resolveProxyCompat: {
                    independent: 'my-proxy-compat'
                }
            }]
        ]
    };

    const { code } = babel.transform(`console.log(foo.bar)`, config);
    expect(unpad(code)).toBe(unpad(
        `import __callKey from "my-proxy-compat/callKey";
        import __getKey from "my-proxy-compat/getKey";
        __callKey(console, "log", __getKey(foo, "bar"));`
    ));
});

test('Should not stop other transforms if pragma is found', () => {
    const reverseIdentifierPlugin = {
        visitor: {
            Identifier(path) {
                path.node.name = path.node.name.split('').reverse().join('');
            }
        }
    };

    const config = {
        plugins: [
            transformRaptorCompat,
            reverseIdentifierPlugin
        ]
    };

    const { code } = babel.transform(unpad(`
        /* proxy-compat-disable */
        console.log(foo.bar);
    `), config);

    expect(unpad(code)).toBe(unpad(`
        /* proxy-compat-disable */
        elosnoc.gol(oof.rab);
    `));
});


describe('Compat transform fixtures', () => {
    for (let fixture of FIXTURES) {
        test(`${fixture}`, () => {
            const actual = fs.readFileSync(path.resolve(FIXTURE_DIR, fixture, 'actual.js'), 'utf-8');
            const expected = fs.readFileSync(path.resolve(FIXTURE_DIR, fixture, 'expected.js'), 'utf-8');

            const { code } = babel.transform(actual, {
                plugins: [
                    [transformRaptorCompat]
                ]
            });

            expect(unpad(code)).toBe(unpad(expected));
        })
    }
});
