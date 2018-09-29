import { CompilerOptions } from '../../compiler/options';
import { transform } from '../transformer';

import { pretify } from '../../__tests__/utils';

const COMPILER_OPTIONS: CompilerOptions = {
    namespace: 'x',
    name: 'foo',
    files: {},
};

it('should throw when processing an invalid HTML file', async () => {
    await expect(
        transform(`<html`, 'foo.html', COMPILER_OPTIONS),
    ).rejects.toMatchObject({
        filename: 'foo.html',
        message: expect.stringContaining(
            'foo.html: Invalid HTML syntax: eof-in-tag.',
        ),
    });
});

it('should apply transformation for template file', async () => {
    const actual = `
        <template>
            <div>Hello</div>
        </template>
    `;

    const expected = `
        import stylesheet from './foo.css';

        export default function tmpl($api, $cmp, $slotset, $ctx) {
            const {
                t: api_text,
                h: api_element
            } = $api;

            return [api_element("div", {
                key: 1
            }, [api_text("Hello")])];
        }

        if (stylesheet) {
            tmpl.stylesheet = stylesheet;
        }
    `;

    const { code } = await transform(actual, 'foo.html', COMPILER_OPTIONS);

    expect(pretify(code)).toBe(pretify(expected));
});
