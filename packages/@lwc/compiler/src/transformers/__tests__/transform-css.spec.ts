/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { TransformOptions } from '../../options';
import { transform } from '../transformer';

import { pretify } from '../../__tests__/utils';

const TRANSFORMATION_OPTIONS: TransformOptions = {
    namespace: 'x',
    name: 'foo',
};

it('should throw when processing an invalid CSS file', async () => {
    await expect(transform(`<`, 'foo.css', TRANSFORMATION_OPTIONS)).rejects.toMatchObject({
        filename: 'foo.css',
        message: expect.stringContaining('foo.css:1:1: Unknown word'),
    });
});

it('should apply transformation for stylesheet file', async () => {
    const actual = `
        :host {
            color: red;
        }

        div {
            background-color: red;
        }
    `;

    const expected = `
        function stylesheet(hostSelector, shadowSelector, nativeShadow) {
            return ["\\n", (nativeShadow ? ":host {color: red;}" : [hostSelector, " {color: red;}"].join('')), "\\ndiv", shadowSelector, " {background-color: red;}\\n"].join('');
        }
        export default [stylesheet];
    `;

    const { code } = await transform(actual, 'foo.css', TRANSFORMATION_OPTIONS);
    expect(pretify(code)).toBe(pretify(expected));
});

describe('custom properties', () => {
    it('should not transform var functions if custom properties a resolved natively', async () => {
        const actual = `div { color: var(--bg-color); }`;
        const expected = `
            function stylesheet(hostSelector, shadowSelector, nativeShadow) {
                return ["div", shadowSelector, " {color: var(--bg-color);}\\n"].join('');
            }

            export default [stylesheet];
        `;

        const { code } = await transform(actual, 'foo.css', {
            ...TRANSFORMATION_OPTIONS,
            stylesheetConfig: {
                customProperties: { resolution: { type: 'native' } },
            },
        });

        expect(pretify(code)).toBe(pretify(expected));
    });

    it('should transform var functions if custom properties a resolved via a module', async () => {
        const actual = `div {
            color: var(--bg-color);
            font-size: var(--font-size, 16px);
            margin: var(--margin-small, var(--margin-medium, 20px));
            border-bottom: 1px solid var(--lwc-border);
        }`;

        const expected = `
        import varResolver from "@customProperties";
        function stylesheet(hostSelector, shadowSelector, nativeShadow) {
            return ["div", shadowSelector, " {color: ", varResolver("--bg-color"), ";font-size: ", varResolver("--font-size","16px"), ";margin: ", varResolver("--margin-small",varResolver("--margin-medium","20px")), ";border-bottom: 1px solid ", varResolver("--lwc-border"), ";}\\n"].join('');
        }
        export default [stylesheet];
        `;

        const { code } = await transform(actual, 'foo.css', {
            ...TRANSFORMATION_OPTIONS,
            stylesheetConfig: {
                customProperties: {
                    resolution: { type: 'module', name: '@customProperties' },
                },
            },
        });

        expect(pretify(code)).toBe(pretify(expected));
    });

    it('should transform var functions properly when minification is enabled', async () => {
        const actual = `div {
            color: var(--bg-color);
            font-size: var(--font-size, 16px);
            margin: var(--margin-small, var(--margin-medium, 20px));
            border-bottom: 1px solid var(--lwc-border);
        }`;

        const expected = `
        import varResolver from "@customProperties";
        function stylesheet(hostSelector, shadowSelector, nativeShadow) {
            return ["div", shadowSelector, "{color: ", varResolver("--bg-color"), ";font-size: ", varResolver("--font-size","16px"), ";margin: ", varResolver("--margin-small",varResolver("--margin-medium","20px")), ";border-bottom: 1px solid ", varResolver("--lwc-border"), ";}"].join('');
        }
        export default [stylesheet];
        `;

        const { code } = await transform(actual, 'foo.css', {
            ...TRANSFORMATION_OPTIONS,
            stylesheetConfig: {
                customProperties: {
                    resolution: { type: 'module', name: '@customProperties' },
                },
            },
            outputConfig: {
                minify: true,
            },
        });

        expect(pretify(code)).toBe(pretify(expected));
    });
});

describe('regressions', () => {
    it('should escape grave accents', async () => {
        const actual = `/* Comment with grave accents \`#\` */`;
        const expected = `export default [];`;

        const { code } = await transform(actual, 'foo.css', TRANSFORMATION_OPTIONS);
        expect(pretify(code)).toBe(pretify(expected));
    });

    it('should escape backslash', async () => {
        const actual = `.foo { content: "x\\x"; }`;
        const expected = `
            function stylesheet(hostSelector, shadowSelector, nativeShadow) {
                return [".foo", shadowSelector, " {content: \\"x\\\\x\\";}\\n"].join('');
            }

            export default [stylesheet];
        `;

        const { code } = await transform(actual, 'foo.css', TRANSFORMATION_OPTIONS);
        expect(pretify(code)).toBe(pretify(expected));
    });

    it('#689 - should not transform z-index in production', async () => {
        const actual = 'h1 { z-index: 100; } h2 { z-index: 500; }';

        const { code } = await transform(actual, 'foo.css', {
            ...TRANSFORMATION_OPTIONS,
            outputConfig: {
                minify: true,
            },
        });

        expect(code).toContain('z-index:100');
        expect(code).toContain('z-index:500');
    });
});
