/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import type { Decorator, Identifier } from 'estree';

type ApiDecorator = Decorator & {
    expression: Identifier & {
        name: 'api';
    };
};

export function isApiDecorator(decorator: Decorator | undefined): decorator is ApiDecorator {
    return decorator?.expression.type === 'Identifier' && decorator.expression.name === 'api';
}
