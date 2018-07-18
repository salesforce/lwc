import { compile } from "../../compiler/compiler";
import { pretify, readFixture } from "../../__tests__/utils";

const VALID_CONFIG = {
    outputConfig: {
        env: {},
        minify: false,
        compat: false,
        format: "amd"
    },
    name: "class_and_template",
    namespace: "x"
};

describe("module resolver", () => {
    test("compiler should resolve bundle with manually imported and rendered template", async () => {
        const noOutputConfig = {
            ...VALID_CONFIG,
            files: {
                "class_and_template.js": `
                import { Element } from 'engine';
                import mytemplate from './class_and_template.html';

                export default class Test extends Element {
                    render() {
                        return mytemplate;
                    }
                }`,
                "class_and_template.html": `<template><p>Manually Imported Template</p></template>`
            }
        };

        const { success, result } = await compile(noOutputConfig);
        expect(success).toBe(true);
        expect(pretify(result.code)).toMatch(
            pretify(`define('x-class_and_template', ['engine'], function (engine) {
                const style = undefined;
                function tmpl($api, $cmp, $slotset, $ctx) {
                const {
                t: api_text,
                h: api_element
                } = $api;
                return [api_element(\"p\", {
                key: 1
                }, [api_text(\"Manually Imported Template\")])];
                }
                if (style) {
                tmpl.hostToken = 'x-class_and_template_class_and_template-host';
                tmpl.shadowToken = 'x-class_and_template_class_and_template';
                const style$$1 = document.createElement('style');
                style$$1.type = 'text/css';
                style$$1.dataset.token = 'x-class_and_template_class_and_template';
                style$$1.textContent = style('x-class_and_template_class_and_template');
                document.head.appendChild(style$$1);
                }
                class Test extends engine.Element {
                render() {
                return tmpl;
                }
                }
                return Test;
                });`)
        );
    });
    test("compiler should resolve bundle with manually imported template that does not match component name", async () => {
        const noOutputConfig = {
            ...VALID_CONFIG,
            files: {
                "class_and_template.js": `
                import { Element } from 'engine';
                import mytemplate from './anotherTemplate.html';

                export default class Test extends Element {
                    render() {
                        return mytemplate;
                    }
                }`,
                "anotherTemplate.html": `<template><p>Another Template</p></template>`
            }
        };

        const { success, result } = await compile(noOutputConfig);
        expect(success).toBe(true);
        expect(pretify(result.code)).toBe(
            pretify(`define('x-class_and_template', ['engine'], function (engine) {
                const style = undefined;
                function tmpl($api, $cmp, $slotset, $ctx) {
                const {
                t: api_text,
                h: api_element
                } = $api;
                return [api_element(\"p\", {
                key: 1
                }, [api_text(\"Another Template\")])];
                }
                if (style) {
                tmpl.hostToken = 'x-class_and_template_anotherTemplate-host';
                tmpl.shadowToken = 'x-class_and_template_anotherTemplate';
                const style$$1 = document.createElement('style');
                style$$1.type = 'text/css';
                style$$1.dataset.token = 'x-class_and_template_anotherTemplate';
                style$$1.textContent = style('x-class_and_template_anotherTemplate');
                document.head.appendChild(style$$1);
                }
                class Test extends engine.Element {
                render() {
                return tmpl;
                }
                }
                return Test;
                });`)
        );
    });

    test("compiler should resolve bundle nested resource name after as the component name", async () => {
        const noOutputConfig = {
            ...VALID_CONFIG,
            files: {
                "class_and_template.js": `
                import { Element } from 'engine';
                export default class Test extends Element {}`,
                "class_and_template.html": `<template><p>Component Template</p></template>`,
                "lib/nested.js": `export function inner() { return null; }`
            }
        };

        const { success, result } = await compile(noOutputConfig);
        expect(success).toBe(true);
        expect(pretify(result.code)).toMatch(
            pretify(`define('x-class_and_template', ['engine'], function (engine) {
                const style = undefined;
                function tmpl($api, $cmp, $slotset, $ctx) {
                const {
                t: api_text,
                h: api_element
                } = $api;
                return [api_element(\"p\", {
                key: 1
                }, [api_text(\"Component Template\")])];
                }
                if (style) {
                tmpl.hostToken = 'x-class_and_template_class_and_template-host';
                tmpl.shadowToken = 'x-class_and_template_class_and_template';
                const style$$1 = document.createElement('style');
                style$$1.type = 'text/css';
                style$$1.dataset.token = 'x-class_and_template_class_and_template';
                style$$1.textContent = style('x-class_and_template_class_and_template');
                document.head.appendChild(style$$1);
                }
                class Test extends engine.Element {
                render() {
                return tmpl;
                }
                }
                return Test;
                });`)
        );
    });

    test.only("compiler should resolve bundle with nested resource name after as the component name", async () => {
        const COMPILER_CONFIG_BASEDIR = {
            name: "foo",
            namespace: "x",
            files: {
                "good/foo.js": `
                import { Element } from 'engine';
                import { nested } from './good/foo';
                export default class Test extends Element {
                    get mytitle() { return nested; }
                }`,
                "good/foo.html": `<template><p>Component Template</p></template>`,
                "lib/foo.js": `export function nested(){ return null;}`
            },
            outputConfig: {
                env: { NODE_ENV: "development" },
                minify: false,
                compat: false
            }
        };

        const { diagnostics, result, success } = await compile(COMPILER_CONFIG_BASEDIR);
        console.log('diagnostics---> ', diagnostics);
        expect(success).toBe(true);
        expect(result).toBeDefined();
    });

});
