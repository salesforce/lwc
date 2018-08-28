import { compile } from "../index";
import { pretify, readFixture } from "./utils";

const BASE_CONFIG = {
    outputConfig: {
        env: {},
        minify: false,
        compat: false,
        format: "amd"
    },
    name: "js-local-import",
    namespace: "c",
    namespaceMapping: {
        c: 'namespace',
    },
    files: {
        "js-local-import.js": readFixture(
            "./namespaced-compilation/js-local-import.js"
        ),
        "js-local-import.html": readFixture(
            "./namespaced-compilation/js-local-import.html"
        ),
        "utils.js": readFixture(
            "./namespaced-compilation/utils.js"
        ),

    },
};

describe('test namespaced component compilation', () => {
    test('javascript with c- prefixes is replaced with namespace value', async () => {
        const { result: { code }} = await compile(BASE_CONFIG);
        expect(pretify(code)).toBe(pretify(readFixture('expected-ns-js-local-import.js')));
    });

    test('local html import', async () => {
        const customConfig = {
            name: "html-local-import",
            files: {
                "html-local-import.js": readFixture(
                    "./namespaced-compilation/html-local-import.js"
                ),
                "html-local-import.html": readFixture(
                    "./namespaced-compilation/html-local-import.html"
                ),
            }
        };
        const config = {...BASE_CONFIG, ...customConfig};
        const { result: { code }} = await compile(config);
        expect(pretify(code)).toBe(pretify(readFixture('expected-ns-html-local-import.js')));
    });

    // TODO: skip until static ComponentTagName is supported via @salesforce/ComponentTagName/Foo
    test.skip('query selector reference to local template contains namespace value', async () => {
        const customConfig = {
            name: "query-selector",
            files: {
                "query-selector.js": readFixture(
                    "./namespaced-compilation/query-selector.js"
                ),
                "query-selector.html": readFixture(
                    "./namespaced-compilation/query-selector.html"
                ),
            }
        };
        const config = {...BASE_CONFIG, ...customConfig};
        const { result: { code }} = await compile(config);
        expect(pretify(code)).toBe(pretify(readFixture('expected-ns-query-selector.js')));
    });

    // TODO: skip until static ComponentTagName is supported via @salesforce/ComponentTagName/Foo
    test.skip('query selector reference to local template in "es" compilation format', async () => {
        const customConfig = {
            outputConfig: {
                format: 'es'
            },
            name: "query-selector",
            namespace: "namespace",
            files: {
                "query-selector.js": readFixture(
                    "./namespaced-compilation/query-selector.js"
                ),
                "query-selector.html": readFixture(
                    "./namespaced-compilation/query-selector.html"
                ),
            }
        };
        const config = {...BASE_CONFIG, ...customConfig};
        const { result: { code }} = await compile(config);
        expect(pretify(code)).toBe(pretify(readFixture('expected-ns-query-selector-es.js')));
    });

    test.skip('css class reference is replaced with namespace value', async () => {
        const customConfig = {
            name: "css-local",
            files: {
                "css-local.js": readFixture(
                    "./namespaced-compilation/css-local.js"
                ),
                "css-local.html": readFixture(
                    "./namespaced-compilation/css-local.html"
                ),
                "css-local.css": readFixture(
                    "./namespaced-compilation/css-local.css"
                ),
            }
        };
        const config = {...BASE_CONFIG, ...customConfig};
        const { result: { code }} = await compile(config);
        expect(pretify(code)).toBe(pretify(readFixture('expected-ns-css.js')));
    });
});
