/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * @file Provides utility type definitions for LWC projects authored using TypeScript. Unlike the
 * other `lwc/*` imports, it is not a re-export of an `@lwc`-scoped package, and it does not have
 * a corresponding JavaScript file.
 */

/** An LWC component template file. */
declare module '*.html' {
    import type { Template } from '@lwc/engine-core';
    const template: Template;
    export default template;
}

/** An LWC component CSS file. */
declare module '*.css' {
    import type { StylesheetFactory } from '@lwc/engine-core/dist/framework/stylesheet';
    const stylesheet: StylesheetFactory;
    export default stylesheet;
}
