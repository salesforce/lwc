/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { flattenStylesheets } from '@lwc/shared';
import { validateStyleTextContents } from './validate-style-text-contents';
import type { LightningElementConstructor } from './lightning-element';
import type { Stylesheets } from '@lwc/shared';

export function hasScopedStaticStylesheets(Component: LightningElementConstructor): boolean {
    const { stylesheets } = Component;
    if (stylesheets) {
        return flattenStylesheets(stylesheets).some((stylesheet) => stylesheet.$scoped$);
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

        const token = stylesheet.$scoped$ ? scopeToken : undefined;
        const useActualHostSelector = !stylesheet.$scoped$ || Component.renderMode !== 'light';
        const useNativeDirPseudoclass = true;

        const styleContents = stylesheet(token, useActualHostSelector, useNativeDirPseudoclass);
        validateStyleTextContents(styleContents);

        result += styleContents;
        result += '</style>';
    }

    return result;
}
