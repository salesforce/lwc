/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isArray } from '@lwc/shared';
import { validateStyleTextContents } from './validate-style-text-contents';
import type { LightningElementConstructor } from './lightning-element';
import type { Stylesheets, Stylesheet } from '@lwc/shared';

type ForgivingStylesheets =
    | Stylesheets
    | Stylesheet
    | undefined
    | null
    | Array<Stylesheets | undefined | null>;

// Traverse in the same order as `flattenStylesheets` but without creating unnecessary additional arrays
function traverseStylesheets(
    stylesheets: ForgivingStylesheets,
    callback: (stylesheet: Stylesheet) => void
): void {
    if (isArray(stylesheets)) {
        for (let i = 0; i < stylesheets.length; i++) {
            traverseStylesheets(stylesheets[i], callback);
        }
    } else if (stylesheets) {
        callback(stylesheets);
    }
}

export function hasScopedStaticStylesheets(Component: LightningElementConstructor): boolean {
    let scoped: boolean = false;
    traverseStylesheets(Component.stylesheets, (stylesheet) => {
        scoped ||= !!stylesheet.$scoped$;
    });
    return scoped;
}

export function renderStylesheets(
    emit: any, // sorry will
    defaultStylesheets: ForgivingStylesheets,
    defaultScopedStylesheets: ForgivingStylesheets,
    staticStylesheets: ForgivingStylesheets,
    scopeToken: string,
    Component: LightningElementConstructor,
    hasScopedTemplateStyles: boolean
): string {
    const hasAnyScopedStyles = hasScopedTemplateStyles || hasScopedStaticStylesheets(Component);
    const { renderMode } = Component;

    let result = '';

    const renderStylesheet = (stylesheet: Stylesheet) => {
        if (emit.cxt.stylesheetToId.has(stylesheet)) {
            const styleId = emit.cxt.stylesheetToId.get(stylesheet);
            result += `<lwc-style style-id="lwc-style-${emit.cxt.styleDedupePrefix}-${styleId}"></lwc-style>`;
        } else {
            const styleId = emit.cxt.nextId++;
            emit.cxt.stylesheetToId.set(stylesheet, styleId);

            const { $scoped$: scoped } = stylesheet;

            const token = scoped ? scopeToken : undefined;
            const useActualHostSelector = !scoped || renderMode !== 'light';
            const useNativeDirPseudoclass = true;

            const styleContents = stylesheet(token, useActualHostSelector, useNativeDirPseudoclass);
            validateStyleTextContents(styleContents);

            // TODO [#2869]: `<style>`s should not have scope token classes
            result += `<style${hasAnyScopedStyles ? ` class="${scopeToken}"` : ''} id="lwc-style-${emit.cxt.styleDedupePrefix}-${styleId}" type="text/css">${styleContents}</style>`;
            result += `<lwc-style style-id="lwc-style-${emit.cxt.styleDedupePrefix}-${styleId}"></lwc-style>`;
        }
    };

    traverseStylesheets(defaultStylesheets, renderStylesheet);
    traverseStylesheets(defaultScopedStylesheets, renderStylesheet);
    traverseStylesheets(staticStylesheets, renderStylesheet);

    return result;
}
