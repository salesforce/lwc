/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
/**
 * @file TypeScript type definition for imported HTML templates. Just a helper, not a re-export of
 * an @lwc/ scoped package.
 */
/**
 * Enables importing of HTML files in LWC components authored using TypeScript.
 */
declare module '*.html' {
    import type { Template } from '@lwc/engine-core';
    const value: Template;
    export default value;
}
