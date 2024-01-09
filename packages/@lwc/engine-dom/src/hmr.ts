/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { accept, register } from '@lwc/hmr-client';
import type { HMR_Accept, HMR_Register } from '@lwc/hmr-client';
export let hot: undefined | { accept: HMR_Accept; register: HMR_Register };

if (process.env.NODE_ENV !== 'production') {
    hot = { accept, register };
}
