/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * A small, focused parser for LWC template HTML. It recognizes the subset of
 * LWC template syntax relevant to vapor compilation: elements, interpolation
 * ({expr}), bound attributes (attr={expr}), event handlers (onclick={fn}), and
 * the structural directives if:true/if:false/lwc:if, for:each/for:item, key,
 * and lwc:ref.
 */

export interface ParsedElement {
    tag: string;
    attrs: Record<string, string>;
    events: Record<string, string>;
    props: Record<string, string>;
    classBinding?: string;
    styleBinding?: string;
    ifCondition?: string;
    /** True for the LEGACY `if:true`/`if:false` directive (renders NO `<!---->`
     *  bookends), vs `lwc:if` which brackets content with a comment pair (api>=60). */
    ifLegacy?: boolean;
    /** lwc:elseif={cond} — chains to the preceding lwc:if/lwc:elseif sibling. */
    elseifCondition?: string;
    /** lwc:else — chains to the preceding lwc:if/lwc:elseif sibling. */
    isElse?: boolean;
    /** Folded elseif/else branches attached to an lwc:if element. */
    negativeChain?: Array<{ condition: string | null; node: ParsedElement }>;
    forEachSource?: string;
    forEachItem?: string;
    forEachIndex?: string;
    /** iterator:<name> directive — name of the iterator variable. */
    iteratorName?: string;
    forKey?: string;
    ref?: string;
    /** lwc:spread={obj} — spread an object's properties onto this element/component. */
    spread?: string;
    /** lwc:dom="manual" — element's children are managed manually by the component. */
    domManual?: boolean;
    /** lwc:inner-html={expr} — set innerHTML reactively. */
    innerHTML?: string;
    /** lwc:is / lwc:dynamic — a runtime constructor expression for a dynamic component. */
    dynamicCtor?: string;
    /** lwc:on={obj} — bind each property of the object as an event listener. */
    lwcOn?: string;
    /** lwc:slot-data="name" — scoped-slot data binding name on a slotted <template>. */
    slotData?: string;
    /** lwc:slot-bind={expr} — data a <slot> exposes to its scoped-slot content. */
    slotBind?: string;
    isComponent: boolean;
    /**
     * Attribute names that were authored as BARE booleans (no `=`, e.g. `<x-child
     * hidden>`). The standard compiler turns these into `literal(true)`; on a
     * COMPONENT host they must forward as boolean `true` (not the empty string `""`,
     * which would coerce a reflective boolean property like `hidden` to false).
     */
    boolAttrs?: Set<string>;
    /** lwc:external — a non-LWC custom element (vanilla web component). */
    isExternal?: boolean;
    children: ParsedNode[];
}

export interface ParsedText {
    content: string;
    dynamic: boolean;
    expression?: string;
}

export type ParsedNode =
    | { type: 'element'; data: ParsedElement }
    | { type: 'text'; data: ParsedText }
    | { type: 'comment'; data: { content: string } };

// Set per parse run when the root `<template lwc:preserve-comments>` is present —
// comments are then emitted as `comment` nodes instead of being stripped.
let preserveComments = false;

// Set per parse run when the root template declares `lwc:render-mode="light"`.
// Light components have no shadow root, so `<slot>` cannot rely on native
// projection — every `<slot>` compiles to a `createSlot` block instead.
let lightRenderMode = false;
export function isLightRenderMode(): boolean {
    return lightRenderMode;
}

// Set per parse run when complex template expressions (CTE) are enabled: a QUOTED
// attribute value that is a single `{expr}` is treated as a dynamic binding.
let complexExpressions = false;

export function parseTemplate(
    source: string,
    warnings: string[],
    opts?: { experimentalComplexExpressions?: boolean }
): ParsedNode[] {
    complexExpressions = opts?.experimentalComplexExpressions === true;
    // Find the outermost <template> open tag, then use depth-aware matching to
    // find its corresponding close (so nested <template for:each>/<template
    // lwc:if> wrappers are preserved as children, not consumed by a greedy regex).
    const openMatch = source.match(/<template[^>]*>/);
    if (!openMatch) {
        warnings.push('Template must be wrapped in a <template> tag');
        return [];
    }
    // `lwc:preserve-comments` on the root template keeps HTML comments as nodes.
    preserveComments = /\blwc:preserve-comments\b/.test(openMatch[0]);
    // `lwc:render-mode="light"` marks a light-DOM component.
    lightRenderMode = /lwc:render-mode\s*=\s*["']light["']/.test(openMatch[0]);
    const afterOpen = source.slice(openMatch.index! + openMatch[0].length);
    const { children } = parseUntilClose(afterOpen, 'template', warnings);
    return children;
}

/**
 * Coalesces consecutive text nodes into one. After comment stripping, a source
 * like `{foo}<!--c-->{bar}` leaves two adjacent text runs which the browser would
 * merge into a single DOM text node on clone — so they must compile to one text
 * binding (concatenating their expressions) to keep index-based traversal valid
 * and match LWC's "adjacent text renders as one node" semantics.
 */
function coalesceText(nodes: ParsedNode[]): ParsedNode[] {
    const out: ParsedNode[] = [];
    for (const node of nodes) {
        const prev = out[out.length - 1];
        if (node.type === 'text' && prev && prev.type === 'text') {
            // Merge `node` into `prev`. Represent each as an expression segment:
            // dynamic text uses its expression; static text uses a string literal.
            // Because the segments are concatenated with `+`, each dynamic segment
            // must coerce null/undefined to '' (LWC renders nullish interpolation
            // as empty) — otherwise `undefined + " text"` would yield the literal
            // "undefined text".
            const seg = (n: ParsedNode): string =>
                n.type === 'text' && n.data.dynamic
                    ? `((${n.data.expression}) ?? '')`
                    : JSON.stringify((n as { data: { content: string } }).data.content);
            const merged = `${seg(prev)} + ${seg(node)}`;
            out[out.length - 1] = {
                type: 'text',
                data: { content: '', dynamic: true, expression: merged },
            };
        } else {
            out.push(node);
        }
    }
    return out;
}

/**
 * LWC default whitespace normalization for static text: collapse any run of
 * whitespace (spaces, tabs, newlines) to a single space, and trim leading/
 * trailing whitespace when it contained a newline (i.e. template indentation
 * around a text node). Preserves a single significant space otherwise.
 */
function normalizeTextWhitespace(text: string): string {
    const hadLeadingNewline = /^\s*\n/.test(text);
    const hadTrailingNewline = /\n\s*$/.test(text);
    let result = text.replace(/\s+/g, ' ');
    if (hadLeadingNewline) result = result.replace(/^ /, '');
    if (hadTrailingNewline) result = result.replace(/ $/, '');
    return result;
}

function parseChildren(html: string, warnings: string[]): ParsedNode[] {
    const rawNodes = parseChildrenRaw(html, warnings);
    return coalesceText(rawNodes);
}

function parseChildrenRaw(html: string, warnings: string[]): ParsedNode[] {
    const nodes: ParsedNode[] = [];
    let remaining = html.trim();

    while (remaining.length > 0) {
        if (remaining[0] !== '<') {
            const nextTag = remaining.indexOf('<');
            const text = nextTag === -1 ? remaining : remaining.slice(0, nextTag);
            remaining = nextTag === -1 ? '' : remaining.slice(nextTag);

            const parts = text.split(/(\{[^}]+\})/).filter((p) => p.length > 0);
            const hasInterpolation = parts.some((p) => /^\{(.+)\}$/.test(p));

            if (!hasInterpolation) {
                // Pure static text run. Apply LWC's default whitespace handling:
                // collapse runs of whitespace to a single space, and trim leading/
                // trailing whitespace that spans a newline (template indentation).
                if (text.trim() !== '') {
                    nodes.push({
                        type: 'text',
                        data: { content: normalizeTextWhitespace(text), dynamic: false },
                    });
                } else if (
                    text.length > 0 &&
                    nodes.length > 0 &&
                    nodes[nodes.length - 1].type === 'text'
                ) {
                    // A whitespace-only run BETWEEN two text segments collapses to a
                    // single space (not removed) — it's part of rendered text content,
                    // e.g. between `</div>` and an orphan `</noframes>` (rendering/noframes).
                    nodes.push({ type: 'text', data: { content: ' ', dynamic: false } });
                }
                continue;
            }

            // A run mixing static text and {interpolations} renders as a SINGLE
            // DOM text node, so compile it to one dynamic text binding whose
            // expression concatenates the literal and interpolated segments. This
            // avoids index-based traversal breaking when the browser merges
            // adjacent text into one node.
            const exprSegments: string[] = [];
            // Count interpolations vs static literals in this run. A run with more
            // than one segment is concatenated with `+`, so each dynamic segment
            // must coerce null/undefined to '' — otherwise `undefined + " text"`
            // would render the literal string "undefined text". LWC's text
            // interpolation renders null/undefined as empty. A LONE interpolation
            // (single segment, no concat) is passed raw to setText, which already
            // applies the null→'' rule itself.
            const segmentCount = parts.filter((p) => /^\{(.+)\}$/.test(p) || p.length > 0).length;
            const multi = segmentCount > 1;
            for (const part of parts) {
                const m = part.match(/^\{(.+)\}$/);
                if (m) {
                    const expr = m[1].trim();
                    exprSegments.push(multi ? `((${expr}) ?? '')` : `(${expr})`);
                } else if (part.length > 0) {
                    // Static literal segment in an interpolated run: apply LWC's
                    // whitespace normalization (collapse runs, trim newline-spanning
                    // edges) so template indentation between an interpolation and
                    // adjacent markup doesn't leak into the rendered text.
                    const normalized = normalizeTextWhitespace(part);
                    if (normalized.length > 0) exprSegments.push(JSON.stringify(normalized));
                }
            }
            const expression = exprSegments.join(' + ');
            nodes.push({ type: 'text', data: { content: '', dynamic: true, expression } });
            continue;
        }

        if (remaining.startsWith('<!--')) {
            const end = remaining.indexOf('-->');
            if (preserveComments) {
                const content = end === -1 ? remaining.slice(4) : remaining.slice(4, end);
                nodes.push({ type: 'comment', data: { content } });
            }
            remaining = end === -1 ? '' : remaining.slice(end + 3);
            continue;
        }

        // An ORPHAN close tag (`</name>`) reaching here has no matching open element
        // (a real close tag is consumed by parseUntilClose). The HTML parser renders
        // the surrounding characters as text, so emit the close tag as literal text
        // (rendering/noframes: `"></div> </noframes>` is text after the noframes).
        if (remaining.startsWith('</')) {
            const gt = remaining.indexOf('>');
            const literal = gt === -1 ? remaining : remaining.slice(0, gt + 1);
            const normalized = normalizeTextWhitespace(literal);
            if (normalized.length > 0) {
                nodes.push({ type: 'text', data: { content: normalized, dynamic: false } });
            }
            remaining = gt === -1 ? '' : remaining.slice(gt + 1);
            continue;
        }

        // Tag-name char class includes backslash so an escaped tag like `<s\ection>`
        // is captured whole (HTML treats `\` as a valid tag-name char); without it
        // the `\ection` leaked into the attribute string (escape-tag-name).
        const nameMatch = remaining.match(/^<([a-zA-Z][\w:\\-]*)/);
        if (!nameMatch) {
            warnings.push(`Failed to parse at: ${remaining.slice(0, 50)}`);
            break;
        }
        const tag = nameMatch[1];
        // Scan from the end of the tag name to the closing `>`, but SKIP any `>`
        // that appears inside a quoted attribute value — e.g.
        // `<div inner-h-t-m-l="<p>x</p>">`, where the `>` inside the value must not
        // be mistaken for the end of the tag (a plain `.*?>` regex stopped there and
        // corrupted the template). Tracks single/double quote state.
        let scan = nameMatch[0].length;
        let quote: string | null = null;
        let tagEnd = -1;
        while (scan < remaining.length) {
            const ch = remaining[scan];
            if (quote) {
                if (ch === quote) quote = null;
            } else if (ch === '"' || ch === "'") {
                quote = ch;
            } else if (ch === '>') {
                tagEnd = scan;
                break;
            }
            scan++;
        }
        if (tagEnd === -1) {
            warnings.push(`Failed to parse at: ${remaining.slice(0, 50)}`);
            break;
        }
        // The raw attribute string lives between the tag name and the closing `>`;
        // a trailing `/` marks a self-closing tag.
        let attrsStr = remaining.slice(nameMatch[0].length, tagEnd);
        let selfClose = '';
        const trimmedAttrs = attrsStr.replace(/\s+$/, '');
        if (trimmedAttrs.endsWith('/')) {
            selfClose = '/';
            attrsStr = trimmedAttrs.slice(0, -1);
        }
        remaining = remaining.slice(tagEnd + 1);

        const element = parseElement(tag, attrsStr);

        if (!selfClose && isRawTextElement(tag)) {
            // Raw-text elements (`noframes`, `style`, `script`, `textarea`, `title`,
            // …) do NOT parse their content as markup — everything up to the matching
            // close tag is literal text (so `<noframes><div class="</noframes>` keeps
            // `<div class="` as text). Matches the HTML parser's raw-text/CDATA modes.
            const closeTag = `</${tag}`;
            const lower = remaining.toLowerCase();
            const closeIdx = lower.indexOf(closeTag);
            const rawText = closeIdx === -1 ? remaining : remaining.slice(0, closeIdx);
            // LWC normalizes whitespace runs in raw-text content too (collapse runs to
            // a single space, trim newline-spanning edges), matching engine-core.
            const normalized = normalizeTextWhitespace(rawText);
            if (normalized.length > 0) {
                element.children = [
                    { type: 'text', data: { content: normalized, dynamic: false } },
                ];
            }
            if (closeIdx === -1) {
                remaining = '';
            } else {
                const after = remaining.slice(closeIdx);
                const gt = after.indexOf('>');
                remaining = gt === -1 ? '' : after.slice(gt + 1);
            }
        } else if (!selfClose && !isVoidElement(tag)) {
            const { children, rest } = parseUntilClose(remaining, tag, warnings);
            element.children = children;
            remaining = rest;
        }

        nodes.push({ type: 'element', data: element });
    }

    return nodes;
}

function parseElement(tag: string, attrsStr: string): ParsedElement {
    const element: ParsedElement = {
        tag,
        attrs: {},
        events: {},
        props: {},
        children: [],
        isComponent: tag.includes('-'),
    };

    // Attribute forms: name="..", name='..', name={expr}, bare unquoted
    // name=value (no spaces/quotes), or a boolean name with no value.
    // The attribute NAME char class includes backtick so names like `` a`b`c `` are
    // preserved (HTML allows them); engine-core reads the raw name from parse5
    // source locations. Without backtick the name was split into separate attrs.
    // A leading `-` is allowed so an attribute like `-upper` keeps its dash (LWC
    // maps `-upper` → the `Upper` camelCase prop; stripping the dash lost that).
    const attrRegex =
        /(-?[a-zA-Z_][\w:.`-]*)(?:=(?:"([^"]*)"|'([^']*)'|\{([^}]+)\}|([^\s"'`=<>]+)))?/g;
    let match;
    while ((match = attrRegex.exec(attrsStr)) !== null) {
        const [, name, dqValRaw, sqValRaw, exprValRaw, uqVal] = match;
        let dqVal: string | undefined = dqValRaw;
        let sqVal: string | undefined = sqValRaw;
        let exprVal: string | undefined = exprValRaw;
        // Complex template expressions (CTE): a QUOTED attribute value that is a
        // single `{expr}` (e.g. `foo="{bar()}"`) is a dynamic binding, not a literal
        // string. Promote it to the expression slot. Only when CTE is enabled — in
        // normal mode `foo="{x}"` stays the literal string "{x}". (template-expressions)
        if (complexExpressions) {
            const quoted = dqVal ?? sqVal;
            if (quoted !== undefined) {
                const m = quoted.match(/^\s*\{(.+)\}\s*$/s);
                if (m) {
                    exprVal = m[1].trim();
                    dqVal = undefined;
                    sqVal = undefined;
                }
            }
        }
        const value = dqVal ?? sqVal ?? exprVal ?? uqVal ?? '';

        if (name === 'lwc:external') {
            // An `lwc:external` element is a NON-LWC custom element (e.g. a vanilla
            // web component). It must NOT be imported as an LWC module — render it
            // as a plain element (attrs serialized, dynamic props via setProp's
            // key-in-el reflection), matching the standard compiler's
            // ExternalComponent. Without this it's treated as a component and codegen
            // emits an unresolvable `import from 'ce/...'`.
            element.isComponent = false;
            element.isExternal = true;
        } else if (name.startsWith('on') && exprVal) {
            element.events[name.slice(2).toLowerCase()] = exprVal;
        } else if (name === 'if:true' || name === 'lwc:if') {
            element.ifCondition = value;
            // LEGACY `if:true`/`if:false` render NO `<!---->` delimiter bookends (engine-
            // dom emits zero comments for them); only `lwc:if`/`lwc:elseif` bracket their
            // content with a leading+trailing comment pair (api>=60). Track the variant.
            if (name === 'if:true') element.ifLegacy = true;
        } else if (name === 'lwc:elseif') {
            element.elseifCondition = value;
        } else if (name === 'lwc:else') {
            element.isElse = true;
        } else if (name === 'if:false') {
            element.ifCondition = `!${value}`;
            element.ifLegacy = true;
        } else if (name === 'for:each') {
            element.forEachSource = value;
        } else if (name === 'for:item') {
            element.forEachItem = value;
        } else if (name === 'for:index') {
            element.forEachIndex = value;
        } else if (name.startsWith('iterator:')) {
            // iterator:it={items} — `it` exposes { value, index, first, last }.
            element.forEachSource = exprVal ?? value;
            element.iteratorName = name.slice('iterator:'.length);
        } else if (name === 'key') {
            element.forKey = value;
        } else if (name === 'lwc:ref') {
            element.ref = value;
        } else if (name === 'lwc:spread') {
            element.spread = exprVal ?? value;
        } else if (name === 'lwc:dom') {
            element.domManual = value === 'manual';
        } else if (name === 'lwc:inner-html') {
            element.innerHTML = exprVal ?? value;
        } else if (name === 'lwc:is' || name === 'lwc:dynamic') {
            element.dynamicCtor = exprVal ?? value;
        } else if (name === 'lwc:on') {
            element.lwcOn = exprVal ?? value;
        } else if (name === 'lwc:slot-data') {
            // Scoped slot: the slotted `<template>` receives data under this name.
            element.slotData = value;
        } else if (name === 'lwc:slot-bind') {
            // `<slot lwc:slot-bind={expr}>`: data the child exposes to the scoped slot.
            element.slotBind = exprVal ?? value;
        } else if (name === 'class' && exprVal) {
            element.classBinding = exprVal;
        } else if (name === 'style' && exprVal) {
            element.styleBinding = exprVal;
        } else if (exprVal) {
            element.props[name] = exprVal;
        } else if (
            (name === 'spellcheck' || name === 'draggable') &&
            !element.isComponent &&
            match[0].includes('=')
        ) {
            // Explicit-boolean reflected attrs on a NATIVE element: a static value
            // (anything past a bare `spellcheck` with no `=`) is normalized to the
            // canonical "true"/"false" the IDL property reflects, matching
            // engine-core's explicit-boolean reflection. spellcheck: only "false"
            // (case-insensitive) → "false", everything else → "true". draggable:
            // only "true" → "true", everything else → "false". A BARE attribute
            // (no `=`) is left as-is (boolean-present). Custom elements forward the
            // raw value as a prop (the prop getter path), so they're excluded here.
            const isFalseLike = value.toLowerCase() === 'false';
            element.attrs[name] =
                name === 'spellcheck'
                    ? isFalseLike
                        ? 'false'
                        : 'true'
                    : value.toLowerCase() === 'true'
                      ? 'true'
                      : 'false';
        } else {
            element.attrs[name] = value;
            // Record bare boolean attributes (authored with no `=`) so a component
            // host forwards them as boolean `true` rather than the empty string.
            if (!match[0].includes('=')) {
                (element.boolAttrs ??= new Set()).add(name);
            }
        }
    }

    return element;
}

function parseUntilClose(
    html: string,
    tag: string,
    warnings: string[]
): { children: ParsedNode[]; rest: string } {
    let depth = 1;
    let i = 0;

    while (i < html.length && depth > 0) {
        const openMatch = html.slice(i).match(new RegExp(`<${tag}[\\s/>]`));
        const closeIdx = html.indexOf(`</${tag}>`, i);

        if (closeIdx === -1) {
            warnings.push(`Unclosed tag: <${tag}>`);
            return { children: parseChildren(html, warnings), rest: '' };
        }

        const openIdx = openMatch ? i + openMatch.index! : Infinity;

        if (openIdx < closeIdx) {
            depth++;
            i = openIdx + tag.length + 1;
        } else {
            depth--;
            if (depth === 0) {
                const content = html.slice(0, closeIdx);
                const rest = html.slice(closeIdx + `</${tag}>`.length);
                return { children: parseChildren(content, warnings), rest };
            }
            i = closeIdx + `</${tag}>`.length;
        }
    }

    return { children: parseChildren(html, warnings), rest: '' };
}

export function isVoidElement(tag: string): boolean {
    return /^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i.test(tag);
}

/**
 * Raw-text / escapable-raw-text / CDATA elements whose content the HTML parser does
 * NOT interpret as markup — everything up to the matching close tag is literal text
 * (rendering/noframes W-16784305).
 */
export function isRawTextElement(tag: string): boolean {
    return /^(noframes|noscript|script|style|textarea|title|xmp|plaintext)$/i.test(tag);
}
