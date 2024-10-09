/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * Imports from `lwc` that are allowed in the SSR runtime context.
 * Every listed item should be a top-level export from `@lwc/ssr-runtime`.
 */
export const allowedLwcImports = new Set(['LightningElement']);
