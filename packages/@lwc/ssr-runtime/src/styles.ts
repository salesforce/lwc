/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { Stylesheets, Stylesheet } from '@lwc/engine-core';
import { validateStyleTextContents } from './validate-style-text-contents';
import type { LightningElementConstructor } from './lightning-element';

function flattenStylesheets(stylesheets: Stylesheets): Array<Stylesheet> {
    // recursively flatten
    // @ts-expect-error we can optimize this function later
    return stylesheets.filter(Boolean).flat(Infinity);
}

export function hasScopedStaticStylesheets(Component: LightningElementConstructor): boolean {
    const { stylesheets } = Component;
    if (stylesheets) {
        return flattenStylesheets(stylesheets).some((stylesheet: any) => stylesheet.$scoped$);
    }
    return false;
}

export function renderStylesheets(
    stylesheets: Stylesheets,
    scopeToken: string,
    Component: LightningElementConstructor,
    hasScopedTemplateStyles: boolean
): string {
    const hasAnyScopedStyles = hasScopedTemplateStyles || hasScopedStaticStylesheets(Component);

    let result = '';

    for (const stylesheet of flattenStylesheets(stylesheets)) {
        // TODO [#2869]: `<style>`s should not have scope token classes
        result += `<style${hasAnyScopedStyles ? ` class="${scopeToken}"` : ''} type="text/css">`;

        const token = (stylesheet as any).$scoped$ ? scopeToken : undefined;
        const useActualHostSelector =
            !(stylesheet as any).$scoped$ || Component.renderMode !== 'light';
        const useNativeDirPseudoclass = true;

        const styleContents = stylesheet(token, useActualHostSelector, useNativeDirPseudoclass);
        validateStyleTextContents(styleContents);

        result += styleContents;
        result += '</' + 'style>';
    }

    return result;
}
