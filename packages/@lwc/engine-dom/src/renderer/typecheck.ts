/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

// This file is purely for typechecking the renderer API

import * as renderer from './index';
import type { SandboxableRendererAPI } from '../renderer-factory';

// This export is intentionally unused
export const rendererApi: SandboxableRendererAPI = renderer;
