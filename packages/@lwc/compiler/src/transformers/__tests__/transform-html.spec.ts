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

it('should throw when processing an invalid HTML file', async () => {
    await expect(transform(`<html`, 'foo.html', TRANSFORMATION_OPTIONS)).rejects.toMatchObject({
        filename: 'foo.html',
        message: expect.stringContaining('Invalid HTML syntax: eof-in-tag.'),
    });
});

it('should apply transformation for template file', async () => {
    const actual = `
        <template>
            <div>Hello</div>
        </template>
    `;

    const expected = `
        import _implicitStylesheets from "./foo.css";
        import { registerTemplate } from "lwc";

        function tmpl($api, $cmp, $slotset, $ctx) {
            const {
                t: api_text,
                h: api_element
            } = $api;

            return [api_element("div", {
                key: 1
            }, [api_text("Hello", 0)])];
        }

        export default registerTemplate(tmpl);
        tmpl.stylesheets = [];
        if (_implicitStylesheets) {
            tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets)
        }
        tmpl.stylesheetTokens = {
            hostAttribute: "x-foo_foo-host",
            shadowAttribute: "x-foo_foo"
        };
    `;

    const { code } = await transform(actual, 'foo.html', TRANSFORMATION_OPTIONS);

    expect(pretify(code)).toBe(pretify(expected));
});
