/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
// This informs the TS compiler about constructed stylesheets.
// It can be removed when this is fixed: https://github.com/Microsoft/TypeScript/issues/30022
declare interface DocumentOrShadowRoot {
    adoptedStyleSheets: CSSStyleSheet[];
}

declare interface CSSStyleSheet {
    replaceSync(text: string): void;
}
