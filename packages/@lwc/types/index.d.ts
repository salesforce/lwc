/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * @file Provides utility type definitions for LWC projects authored using TypeScript.
 */

/** An LWC component [template file](https://lwc.dev/guide/html_templates). */
declare module '*.html' {
    import type { Template } from '@lwc/engine-core';
    /** A representation of an [LWC template](https://lwc.dev/guide/html_templates). */
    const template: Template;
    export default template;
}

/** An LWC component [stylesheet file](https://lwc.dev/guide/css). */
declare module '*.css' {
    import type { Stylesheets } from '@lwc/engine-core';
    /** A representation of an [LWC stylesheet](https://lwc.dev/guide/css). */
    const stylesheets: Stylesheets;
    export default stylesheets;
}
