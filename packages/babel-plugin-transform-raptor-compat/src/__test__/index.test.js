/* eslint-env node */

const fs = require('fs');
const path = require('path');
const babel = require('babel-core');
const transfromRaptorCompat = require('../index');

const FIXTURE_DIR = path.join(__dirname, 'fixtures');

function unpad(src) {
    return src.split('\n')
        .map(line => line.trim())
        .filter(line => line.length)
        .join('\n');
}

test('validate config property', () => {
    expect(() => {
        babel.transform('', {
            plugins: [
                [transfromRaptorCompat, {
                    resolveProxyCompat: {
                        unknown: 'window.MyGlobalProxy'
                    }
                }]
            ]
        });
    }).toThrow(
        /Unexcepted resolveProxyCompat option/
    );
});

test('compat transform', () => {
    const actual = fs.readFileSync(path.resolve(FIXTURE_DIR, 'actual.js'), 'utf-8');
    const expected = fs.readFileSync(path.resolve(FIXTURE_DIR, 'expected.js'), 'utf-8');

    const { code } = babel.transform(actual, {
        plugins: [
            [transfromRaptorCompat]
        ]
    });

    expect(unpad(code)).toBe(unpad(expected));
});

test('APIs retrieval from global', () => {
    const config = {
        plugins: [
            [transfromRaptorCompat, {
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
            [transfromRaptorCompat, {
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

test('APIs retrieval from independant modules', () => {
    const config = {
        plugins: [
            [transfromRaptorCompat, {
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
