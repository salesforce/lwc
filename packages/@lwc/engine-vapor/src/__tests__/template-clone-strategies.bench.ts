/*
 * Microbench: template cloning strategies (LWC vs Vue Vapor).
 *
 * LWC: template(html) returns a factory that caches a PARSED node and calls
 *      `parsedNode.cloneNode(true)` on every invocation.
 * Vue: template(html) caches a cloned FRAGMENT from t.content and clones from that.
 *
 * Both use a SINGLE shared <template> element for parsing. Difference: LWC caches
 * `t.content.firstChild.cloneNode(true)`, Vue caches `t.content.cloneNode(true)` (fragment).
 *
 * Hypothesis: for single-root templates (the common case — krausest row is single <tr>),
 * Vue's extra fragment wrapper may add overhead. Test both strategies.
 */

const html =
    '<tr><td class="col-md-1"> </td><td class="col-md-4"><a> </a></td><td class="col-md-1"><a><span class="glyphicon glyphicon-remove"></span></a></td><td class="col-md-6"></td></tr>';

let t: HTMLTemplateElement;
function getTemplate(): HTMLTemplateElement {
    if (!t) t = document.createElement('template');
    return t;
}

// LWC strategy: cache firstChild, clone the node directly
function lwcTemplateFactory(html: string): () => Node {
    let parsedNode: Node | null = null;
    return (): Node => {
        if (!parsedNode) {
            const tmpl = getTemplate();
            tmpl.innerHTML = html;
            parsedNode = tmpl.content.firstChild!.cloneNode(true);
        }
        return parsedNode.cloneNode(true);
    };
}

// Vue strategy: cache fragment, clone fragment then return firstChild
function vueTemplateFactory(html: string): () => Node {
    let parsedFragment: DocumentFragment | null = null;
    return (): Node => {
        if (!parsedFragment) {
            const tmpl = getTemplate();
            tmpl.innerHTML = html;
            parsedFragment = tmpl.content.cloneNode(true) as DocumentFragment;
        }
        // Vue clones the fragment and returns it (for multi-root) or firstChild (single-root)
        const cloned = parsedFragment.cloneNode(true) as DocumentFragment;
        return cloned.firstChild!;
    };
}

// Alternative: Vue-like but return the node from the cloned fragment directly (no intermediate)
function vueOptimizedFactory(html: string): () => Node {
    let parsedNode: Node | null = null;
    return (): Node => {
        if (!parsedNode) {
            const tmpl = getTemplate();
            tmpl.innerHTML = html;
            const frag = tmpl.content.cloneNode(true) as DocumentFragment;
            parsedNode = frag.firstChild!;
        }
        return parsedNode.cloneNode(true);
    };
}

const ITERS = 10000;

describe('template clone strategies', () => {
    it('LWC: cache firstChild, clone node', () => {
        const factory = lwcTemplateFactory(html);
        const start = performance.now();
        for (let i = 0; i < ITERS; i++) {
            factory();
        }
        const elapsed = performance.now() - start;
        console.log(`[LWC] ${ITERS} clones in ${elapsed.toFixed(3)}ms`);
    });

    it('Vue: cache fragment, clone fragment → firstChild', () => {
        const factory = vueTemplateFactory(html);
        const start = performance.now();
        for (let i = 0; i < ITERS; i++) {
            factory();
        }
        const elapsed = performance.now() - start;
        console.log(`[VUE] ${ITERS} clones in ${elapsed.toFixed(3)}ms`);
    });

    it('Vue-optimized: cache fragment firstChild, clone node', () => {
        const factory = vueOptimizedFactory(html);
        const start = performance.now();
        for (let i = 0; i < ITERS; i++) {
            factory();
        }
        const elapsed = performance.now() - start;
        console.log(`[VUE-OPT] ${ITERS} clones in ${elapsed.toFixed(3)}ms`);
    });
});
