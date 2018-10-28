import { compileToFunction } from '../index';

function prettify(str) {
    return str.toString()
        .replace(/^\s+|\s+$/, '')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length)
        .join('\n');
}

function functionMatchCode(fn, code) {
    return expect(
        prettify(fn.toString()),
    ).toContain(
        prettify(code),
    );
}

describe('compileToFunction', () => {
    it('should compile correctly simple components', () => {
        const renderFn = compileToFunction(`
            <template>
                <style>
                    :host { color: red }
                </style>
                <h1>Hello world!</h1>
            </template>
        `);

        functionMatchCode(renderFn, `
            function tmpl($api, $cmp, $slotset, $ctx) {
              const {
                  t: api_text,
                  h: api_element
                } = $api;

              return [api_element("h1", {
                    key: 2
                }, [api_text("Hello world!")])];
            }

            return tmpl;
        `);
    });
});
