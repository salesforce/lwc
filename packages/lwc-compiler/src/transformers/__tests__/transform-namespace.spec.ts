import { transform } from '../../transformers/transformer';
import { pretify } from '../../__tests__/utils';

describe('transform namespaced components', () => {
    it('should apply namespace transformation to javascript file', async () => {
        const actual = `
            import { LightningElement } from 'lwc';
            import { method } from 'c/utils';
            export default class Foo extends LightningElement {}
        `;

        const expected = `
            import _tmpl from \"./foo.html\";
            import { LightningElement } from 'lwc';
            import { method } from \"namespace/utils\";
            export default class Foo extends LightningElement {
                render() {
                    return _tmpl;
                }
            }
        `;
        const { code } = await transform(actual, 'foo.js', {
            namespace: 'namespace',
            name: 'foo',
        });
        expect(pretify(code)).toBe(pretify(expected));
    });

    it('should apply namespace transformation to html file', async () => {
        const actual = `
            import { LightningElement } from 'lwc';
            import template from 'c/foo.html';
            export default class Foo extends LightningElement {
                render() {
                    return template;
                }
            }
        `;

        const expected = `
            import { LightningElement } from 'lwc';
            import template from \"namespace/foo.html\";
            export default class Foo extends LightningElement {
                render() {
                    return template;
                }
            }
        `;
        const { code } = await transform(actual, 'foo.js', {
            namespace: 'namespace',
            name: 'foo',
        });
        expect(pretify(code)).toBe(pretify(expected));
    });

    it('should not apply namespace transformation if it is not provided', async () => {
        const actual = `
            import { LightningElement } from 'lwc';
            import { method } from './utils';
            import html from './foo.html';
            export default class Foo extends LightningElement {
                render() {
                    return html;
                }
            }
        `;

        const expected = `
            import { LightningElement } from 'lwc';
            import { method } from './utils';
            import html from './foo.html';
            export default class Foo extends LightningElement {
                render() {
                    return html;
                }
            }
        `;
        const { code } = await transform(actual, 'foo.js', {
            name: 'foo',
        });
        expect(pretify(code)).toBe(pretify(expected));
    });
});
