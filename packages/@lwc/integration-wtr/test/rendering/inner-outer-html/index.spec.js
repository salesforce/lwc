import { createElement } from 'lwc';
import Inner from 'x/inner';
import Outer from 'x/outer';
import { spyOn } from '@vitest/spy';
import { extractDataIds } from '../../../helpers/utils.js';

beforeAll(() => {
    customElements.define('omg-whatever', class extends HTMLElement {});
});

let consoleSpy;
beforeAll(() => {
    consoleSpy = spyOn(console, 'warn');
});
afterEach(() => {
    consoleSpy.mockReset();
});
afterAll(() => {
    consoleSpy.mockRestore();
});

for (const whatter of ['inner', 'outer']) {
    // See W-16614337
    it(`does not render ${whatter} HTML from attributes`, async () => {
        const Whatter = whatter === 'inner' ? Inner : Outer;
        const elm = createElement(`x-${whatter}`, { is: Whatter });
        document.body.appendChild(elm);
        await Promise.resolve();

        const ids = Object.entries(extractDataIds(elm)).filter(
            ([id]) => !id.endsWith('.shadowRoot')
        );
        for (const [_id, node] of ids) {
            expect(node.childNodes.length).toBe(1);
            expect(node.firstChild.nodeType).toBe(Node.TEXT_NODE);
            expect(node.firstChild.nodeValue).toBe('original');
        }

        if (process.env.NODE_ENV === 'production') {
            expect(consoleSpy).not.toHaveBeenCalled();
        } else {
            const len = ids.filter(
                ([_id, elm]) => !elm.hasAttribute('data-expect-no-warning')
            ).length;
            expect(consoleSpy).toHaveBeenCalledTimes(len);

            const calls = consoleSpy.mock.calls;
            for (let i = 0; i < len; i += 1) {
                expect(calls[i][0].message).toContain(
                    `Cannot set property "${whatter}HTML". Instead, use lwc:inner-html or lwc:dom-manual.`
                );
            }
        }
    });
}
