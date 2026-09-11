/*
 * Microbench: node-walk strategies (index-based nthChild vs sibling-walk).
 *
 * LWC compiler emits:
 *   const n27 = nthChild(nthChild(nthChild(n22, 1), 0), 0);  // tr → td[1] → a[0] → text[0]
 * which translates to:
 *   n22.childNodes[1].childNodes[0].childNodes[0]
 *
 * Vue Vapor uses:
 *   const n27 = child(next(child(n22)));  // tr.firstChild.nextSibling.firstChild
 * which translates to:
 *   n22.firstChild.nextSibling.firstChild
 *
 * Hypothesis: index-based reads (NodeList[i]) may be slower than pointer-chase
 * (firstChild/nextSibling) due to internal NodeList bookkeeping. Test on a typical
 * krausest row structure (4 td children, nested a/span).
 */

import { nthChild } from '../dom/node';

const html =
    '<tr><td class="col-md-1"> </td><td class="col-md-4"><a> </a></td><td class="col-md-1"><a><span class="glyphicon glyphicon-remove"></span></a></td><td class="col-md-6"></td></tr>';

function createRow(): Node {
    const t = document.createElement('template');
    t.innerHTML = html;
    return t.content.firstChild!.cloneNode(true);
}

// LWC: index-based (nthChild chain)
function locateLabelLwc(tr: Node): Node {
    // td[1] → a[0] → text[0]
    return nthChild(nthChild(nthChild(tr, 1), 0), 0);
}

// Vue: sibling-walk (firstChild + nextSibling)
function child(node: ParentNode): Node {
    return node.firstChild!;
}
function next(node: Node): Node {
    return node.nextSibling!;
}
function locateLabelVue(tr: Node): Node {
    // firstChild (td[0]) → nextSibling (td[1]) → firstChild (a) → firstChild (text)
    return child(child(next(child(tr))));
}

const ITERS = 100000;
const ROWS = Array.from({ length: 100 }, () => createRow());

describe('node-walk strategies', () => {
    it('LWC: index-based nthChild(node, i)', () => {
        const start = performance.now();
        for (let iter = 0; iter < ITERS; iter++) {
            for (const row of ROWS) {
                locateLabelLwc(row);
            }
        }
        const elapsed = performance.now() - start;
        console.log(`[LWC nthChild] ${ITERS * ROWS.length} walks in ${elapsed.toFixed(3)}ms`);
    });

    it('Vue: sibling-walk (firstChild + nextSibling)', () => {
        const start = performance.now();
        for (let iter = 0; iter < ITERS; iter++) {
            for (const row of ROWS) {
                locateLabelVue(row);
            }
        }
        const elapsed = performance.now() - start;
        console.log(`[VUE sibling] ${ITERS * ROWS.length} walks in ${elapsed.toFixed(3)}ms`);
    });
});
