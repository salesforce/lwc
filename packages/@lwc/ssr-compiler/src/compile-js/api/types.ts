/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import type { MethodDefinition, Identifier, PropertyDefinition } from 'estree';

export type ApiMethodDefinition = MethodDefinition & {
    key: Identifier;
};
export type ApiPropertyDefinition = PropertyDefinition & {
    key: Identifier;
};

export type ApiDefinition = ApiPropertyDefinition | ApiMethodDefinition;
