import { extractDataIds } from '../../helpers/utils.js';

export default {
    props: {},
    advancedTest(target, { Component, consoleSpy, hydrateComponent }) {
        const ids = Object.entries(extractDataIds(target)).filter(
            ([id]) => !id.endsWith('.shadowRoot')
        );
        for (const [id, node] of ids) {
            expect(node.childNodes.length).toBe(1);
            expect(node.firstChild.nodeType).toBe(Node.TEXT_NODE);
            const expected = id.startsWith('lwc-inner-html-') ? 'injected' : 'original';
            expect(node.firstChild.nodeValue).toBe(expected);
        }
        expect(consoleSpy.calls.warn).toHaveSize(0);
        expect(consoleSpy.calls.error).toHaveSize(0);

        hydrateComponent(target, Component, {});

        for (const [id, node] of ids) {
            expect(node.childNodes.length).toBe(1);
            expect(node.firstChild.nodeType).toBe(Node.TEXT_NODE);
            const expected = id.startsWith('lwc-inner-html-') ? 'injected' : 'original';
            expect(node.firstChild.nodeValue).toBe(expected);
        }

        const warns = process.env.NODE_ENV === 'production' ? 0 : 10;
        expect(consoleSpy.calls.warn).toHaveSize(warns);
    },
};
