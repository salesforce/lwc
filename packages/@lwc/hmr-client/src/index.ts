/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { initializeClient } from './client';
export { accept } from './api';
export type { HMR_Register, HMR_Accept } from './api';

// May be this can be exported and lazily initialized
if (process.env.NODE_ENV !== 'production') {
    initializeClient();
}
