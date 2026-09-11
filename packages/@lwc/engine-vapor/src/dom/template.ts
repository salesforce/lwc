/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

let cachedTemplate: HTMLTemplateElement | null = null;

function getTemplateElement(): HTMLTemplateElement {
    if (!cachedTemplate) {
        cachedTemplate = document.createElement('template');
    }
    return cachedTemplate;
}

/**
 * Creates a factory that clones a parsed template. The factory is invoked as
 * `t0()` for the common single-root case (returns the first root node) or
 * `t0(true)` for a multi-root template (returns a cloned DocumentFragment of all
 * root nodes, so callers can capture references to each sibling before
 * insertion empties the fragment). The multi-root flag is supplied at call time
 * because the same hoisted factory could, in principle, be cloned either way.
 */
export function template(html: string): (multiRoot?: boolean) => Node {
    let parsedNode: Node | null = null;
    let parsedFragment: DocumentFragment | null = null;
    return (multiRoot = false): Node => {
        // Text node fast path: only for a genuinely text-only SINGLE-root template (no
        // markup at all). A multi-root template such as "Result: <span>..</span>" also
        // starts with a non-`<` char but contains elements — it must go through the
        // fragment path. A multiRoot block whose static HTML is text-only (e.g. an
        // anchorless `for:each` sibling of a `{dummy}` text node, where the for emits no
        // static node) MUST also return a FRAGMENT so the caller can `nthChild` it and
        // insert the list's items as siblings — collapsing to a bare Text node would
        // make `nthChild`/insert fail (HierarchyRequestError).
        if (!multiRoot && html.indexOf('<') === -1) {
            // Text node fast path (not cached; cheap to create).
            return document.createTextNode(html);
        }
        if (multiRoot) {
            if (!parsedFragment) {
                const t = getTemplateElement();
                t.innerHTML = html;
                // IMPORTANT: clone out of the SHARED template element. `t.content`
                // is reused by every template() factory, so holding a reference to
                // it would be clobbered the next time another factory sets
                // `t.innerHTML`. Cache an owned clone and clone from that.
                parsedFragment = t.content.cloneNode(true) as DocumentFragment;
            }
            return parsedFragment.cloneNode(true);
        }
        if (!parsedNode) {
            const t = getTemplateElement();
            t.innerHTML = html;
            // Same reasoning: own a detached clone of the first child rather than
            // pointing into the shared template's live content.
            parsedNode = t.content.firstChild!.cloneNode(true);
        }
        return parsedNode.cloneNode(true);
    };
}
