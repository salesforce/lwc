/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { compile } from '../../compiler/compiler';
import { pretify } from '../../__tests__/utils';
import { DiagnosticLevel } from '@lwc/errors';

const VALID_CONFIG = {
    isExplicitImport: true,
    outputConfig: {
        minify: false,
        compat: false,
        format: 'amd',
    },
    name: 'class_and_template',
    namespace: 'x',
};

describe('module resolver', () => {
    test('compiler should resolve bundle with manually imported and rendered template', async () => {
        const noOutputConfig = {
            ...VALID_CONFIG,
            files: {
                'class_and_template.js': `
                import { LightningElement } from 'lwc';
                import mytemplate from './class_and_template.html';

                export default class Test extends LightningElement {
                    render() {
                        return mytemplate;
                    }
                }`,
                'class_and_template.html': `<template><p>Manually Imported Template</p></template>`,
            },
        };

        const { success, result } = await compile(noOutputConfig);

        expect(success).toBe(true);
        expect(pretify(result.code)).toBe(
            pretify(`define('x/class_and_template', ['exports', 'lwc'], function (exports, lwc) {
                function tmpl($api, $cmp, $slotset, $ctx) {
                    const {
                        t: api_text,
                        h: api_element
                    } = $api;

                    return [api_element("p", {
                        key: 0
                    }, [api_text("Manually Imported Template")])];
                }

                var mytemplate = lwc.registerTemplate(tmpl);
                tmpl.stylesheets = [];
                tmpl.stylesheetTokens = {
                    hostAttribute: "x-class_and_template_class_and_template-host",
                    shadowAttribute: "x-class_and_template_class_and_template"
                };

                class Test extends lwc.LightningElement {
                    render() {
                        return mytemplate;
                    }
                }

                exports.default = Test;
                Object.defineProperty(exports, '__esModule', { value: true });
            });`)
        );
    });
    test('compiler should resolve bundle with manually imported template that does not match component name', async () => {
        const noOutputConfig = {
            ...VALID_CONFIG,
            files: {
                'class_and_template.js': `
                import { LightningElement } from 'lwc';
                import mytemplate from './anotherTemplate.html';

                export default class Test extends LightningElement {
                    render() {
                        return mytemplate;
                    }
                }`,
                'anotherTemplate.html': `<template><p>Another Template</p></template>`,
            },
        };

        const { success, result } = await compile(noOutputConfig);
        expect(success).toBe(true);
        expect(pretify(result.code)).toBe(
            pretify(`define('x/class_and_template', ['exports', 'lwc'], function (exports, lwc) {
                function tmpl($api, $cmp, $slotset, $ctx) {
                    const {
                        t: api_text,
                        h: api_element
                    } = $api;

                    return [api_element("p", {
                        key: 0
                    }, [api_text("Another Template")])];
                }

                var mytemplate = lwc.registerTemplate(tmpl);
                tmpl.stylesheets = [];
                tmpl.stylesheetTokens = {
                    hostAttribute: "x-class_and_template_anotherTemplate-host",
                    shadowAttribute: "x-class_and_template_anotherTemplate"
                };

                class Test extends lwc.LightningElement {
                    render() {
                        return mytemplate;
                    }
                }

                exports.default = Test;
                Object.defineProperty(exports, '__esModule', { value: true });
            });`)
        );
    });

    test('compiler should resolve bundle with local import', async () => {
        const COMPILER_CONFIG_BASEDIR = {
            name: 'foo',
            namespace: 'x',
            files: {
                'foo.js': `import { nested } from './lib/foo';`,
                'lib/foo.js': ``,
            },
        };

        const { result, success } = await compile(COMPILER_CONFIG_BASEDIR);
        expect(success).toBe(true);
        expect(result).toBeDefined();
    });

    test('compiler should report fatal diagnostic if local import cannot be resolved', async () => {
        const COMPILER_CONFIG_BASEDIR = {
            name: 'foo',
            namespace: 'x',
            files: {
                'foo.js': `import { nested } from './lib/foo';`,
            },
        };

        const { diagnostics, success } = await compile(COMPILER_CONFIG_BASEDIR);
        expect(success).toBe(false);
        expect(diagnostics).toMatchObject([
            {
                level: 0,
                message: expect.stringContaining(
                    'LWC1011: Failed to resolve import "./lib/foo" from "foo.js". Please add "lib/foo" file to the component folder.'
                ),
            },
        ]);
    });

    test('compiler should report name case mismatch diagnostic for local import', async () => {
        const COMPILER_CONFIG_BASEDIR = {
            name: 'foo',
            namespace: 'x',
            files: {
                'foo.js': `import { nested } from './lib/foo';`,
                'lib/Foo.js': ``,
            },
        };

        const { diagnostics, success } = await compile(COMPILER_CONFIG_BASEDIR);
        expect(success).toBe(false);
        expect(diagnostics).toMatchObject([
            {
                level: 0,
                message: expect.stringContaining(
                    'LWC1011: Failed to resolve import "./lib/foo" from "foo.js". Please add "lib/foo" file to the component folder.'
                ),
            },
        ]);
    });

    test('compiler should report fatal diagnostic when invalid entry path is specified', async () => {
        const COMPILER_CONFIG_BASEDIR = {
            name: 'modules/foo',
            namespace: 'x',
            files: {
                'foo.js': ``,
            },
        };

        const { diagnostics, success } = await compile(COMPILER_CONFIG_BASEDIR);
        expect(success).toBe(false);
        expect(diagnostics[0].level).toBe(DiagnosticLevel.Fatal);
    });

    test('#492 - compiler should not report external modules in diagnostics', async () => {
        const { success, diagnostics } = await compile({
            namespace: 'x',
            name: 'foo',
            files: {
                'foo.js': `
                    import { LightningElement } from 'lwc';
                    export default class Test extends LightningElement {}
                `,
                'foo.html': `
                    <template>
                        <x-foo></x-foo>
                    </template>
                `,
            },
        });

        expect(success).toBe(true);
        expect(diagnostics).toHaveLength(0);
    });
});

describe('module entry validation', () => {
    test('compiler should fail module resolution if an entry name starts with capital letter', async () => {
        const { diagnostics, success } = await compile({
            name: 'MycmpCamelcased',
            namespace: 'c',
            files: {
                'mycmpCamelcased.js': ``,
                'mycmpCamelcased.html': ``,
            },
        });

        expect(success).toBe(false);
        expect(diagnostics).toMatchObject([
            {
                level: 0,
                message: expect.stringContaining(
                    'Illegal folder name "MycmpCamelcased". The folder name must start with a lowercase character: "mycmpCamelcased".'
                ),
            },
        ]);
    });

    test('compiler should not fail module resolution if an entry contains non-leading capital letter', async () => {
        const { success } = await compile({
            name: 'myCmp',
            namespace: 'c',
            files: {
                'myCmp.js': `
                    import { LightningElement } from 'lwc';
                    export default class App extends LightningElement {}
                `,
                'myCmp.html': `<template></template>`,
            },
        });
        expect(success).toBe(true);
    });
});

describe('module file name validation', () => {
    test('compilation should fail when folder and its entry ".js" file names do not case match', async () => {
        const { diagnostics, success } = await compile({
            name: 'mycmp',
            namespace: 'c',
            files: {
                'Mycmp.js': ``,
                'Mycmp.html': ``,
            },
        });

        expect(success).toBe(false);
        expect(diagnostics).toMatchObject([
            {
                level: 0,
                message: expect.stringContaining(
                    'LWC1010: Failed to resolve entry for module "mycmp".'
                ),
            },
        ]);
    });
});
