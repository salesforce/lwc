/*
 * Microbench: per-row event delegation cost on mount (memoEvent + delegate calls).
 * Tests whether the handler closure (`e => invokeHandler($cmp, _h6, e)`) could be
 * hoisted to a SINGLE instance per component rather than created per row.
 */

import { template, delegateEvents, memoEvent, delegate, invokeHandler } from '..';

const t0 = template(
    '<tr><td class="col-md-1"> </td><td class="col-md-4"><a> </a></td><td class="col-md-1"><a><span class="glyphicon glyphicon-remove"></span></a></td><td class="col-md-6"></td></tr>'
);

delegateEvents('click');

interface Row {
    id: number;
    label: string;
}

class MockComponent {
    handleRowClick(_evt: Event): void {
        // no-op
    }
}

// BASELINE: current codegen — per-row memoEvent + per-row closure creation
function mountRowBaseline(cmp: MockComponent, _row: Row): Node {
    const n22 = t0();
    const _h6 = memoEvent(cmp, 6, () => cmp.handleRowClick);
    delegate(n22, 'click', (e) => invokeHandler(cmp, _h6, e));
    return n22;
}

// CANDIDATE: hoist the handler closure to a SINGLE shared one (created once per component).
// The per-row delegate call still fires (to store `$evtclick` on each element), but the
// closure is reused. Vue Vapor's compiled for-loop does this — event handlers are hoisted
// to module scope and reused across all rows.
const HANDLER_CACHE = new WeakMap<MockComponent, (e: Event) => any>();
function mountRowHoisted(cmp: MockComponent, _row: Row): Node {
    const n22 = t0();
    let handler = HANDLER_CACHE.get(cmp);
    if (!handler) {
        const _h6 = memoEvent(cmp, 6, () => cmp.handleRowClick);
        handler = (e: Event) => invokeHandler(cmp, _h6, e);
        HANDLER_CACHE.set(cmp, handler);
    }
    delegate(n22, 'click', handler);
    return n22;
}

// Benchmark setup: mount 1000 rows to measure per-row event-wiring cost.
const ROWS = Array.from({ length: 1000 }, (_, i) => ({
    id: i + 1,
    label: `Row ${i + 1}`,
}));

describe('event-delegation mount microbench', () => {
    it('baseline: per-row memoEvent + per-row closure', () => {
        const cmp = new MockComponent();
        const parent = document.createElement('tbody');
        const start = performance.now();
        for (const row of ROWS) {
            const el = mountRowBaseline(cmp, row);
            parent.appendChild(el);
        }
        const elapsed = performance.now() - start;
        console.log(`[BASELINE] ${ROWS.length} rows in ${elapsed.toFixed(3)}ms`);
    });

    it('candidate: hoist handler closure, reuse across rows', () => {
        const cmp = new MockComponent();
        const parent = document.createElement('tbody');
        const start = performance.now();
        for (const row of ROWS) {
            const el = mountRowHoisted(cmp, row);
            parent.appendChild(el);
        }
        const elapsed = performance.now() - start;
        console.log(`[HOISTED] ${ROWS.length} rows in ${elapsed.toFixed(3)}ms`);
    });
});
