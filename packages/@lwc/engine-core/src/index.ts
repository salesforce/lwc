/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// Tests
import './testFeatureFlag';

// Patches ---------------------------------------------------------------------------------------
import './patches/detect-synthetic-cross-root-aria';

export * from './framework/main';
