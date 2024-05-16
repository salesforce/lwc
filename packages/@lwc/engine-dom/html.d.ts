/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
/**
 * Enables importing of HTML files in LWC components.
 */
declare module '*.html' {
    import type { Template } from '@lwc/engine-core';
    const value: Template;
    export default value;
}
