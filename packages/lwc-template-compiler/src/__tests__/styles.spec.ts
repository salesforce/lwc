import compile from '../index';

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

describe('inline styles', () => {

    it('default options', () => {
        const { code } = compile(`
            <template>
                <style>
                    :host { @import "foo"; color: var(--color) }
                </style>
                <h1>Hello world!</h1>
            </template>
        `, {});

        functionMatchCode(code , `
            import { registerTemplate } from "lwc";
            import stylesheet0 from "foo";

            function tmpl($api, $cmp, $slotset, $ctx) {
                const {
                    t: api_text,
                    h: api_element
                } = $api;

                return [api_element("h1", {
                    key: 3
                }, [api_text("Hello world!")])];
            }

            export default registerTemplate(tmpl);

            function stylesheet(hostSelector, shadowSelector, nativeShadow) {
                return \`
                \${nativeShadow ? \":host {color: var(--color)}\" : hostSelector + \" {color: var(--color)}\"}
                \`;
            }

            const stylesheets = [stylesheet0, stylesheet];
            tmpl.stylesheets = stylesheets;
        `);
    });

    it('inline styles with resolver', () => {
        const { code } = compile(`
            <template>
                <style>
                    :host { @import "foo"; color: var(--color) }
                </style>
                <h1>Hello world!</h1>
            </template>
        `, { stylesheetConfig: { customProperties: { resolverModule: '@css/varResolver' }}});

        functionMatchCode(code , `
        import { registerTemplate } from \"lwc\";
        import varResolver from \"@css/varResolver\";
        import stylesheet0 from \"foo\";
        function tmpl($api, $cmp, $slotset, $ctx) {
        const {
        t: api_text,
        h: api_element
        } = $api;
        return [api_element(\"h1\", {
        key: 3
        }, [api_text(\"Hello world!\")])];
        }
        export default registerTemplate(tmpl);
        function stylesheet(hostSelector, shadowSelector, nativeShadow) {
        return \`
        \${nativeShadow ? ":host {color: " + varResolver("--color") + ";}" : hostSelector + " {color: " + varResolver("--color") + ";}"}
        \`;
        }
        const stylesheets = [stylesheet0, stylesheet];
        tmpl.stylesheets = stylesheets;
        `);

    });
});
