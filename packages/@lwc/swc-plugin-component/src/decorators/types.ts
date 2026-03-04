/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import type { ClassProperty, ClassMethod, Decorator } from '@swc/types';
import type { LWCErrorInfo } from '@lwc/errors';

export type LwcDecoratorName = 'api' | 'track' | 'wire';

export type DecoratorErrorOptions = {
    errorInfo: LWCErrorInfo;
    messageArgs?: any[];
};

export type DecoratorType = 'property' | 'getter' | 'setter' | 'method';

export interface DecoratorMeta {
    name: LwcDecoratorName;
    propertyName: string;
    decorator: Decorator;
    /** The class member that the decorator is applied to */
    member: ClassProperty | ClassMethod;
    decoratedNodeType: DecoratorType | null;
}

export type ClassBodyItem = ClassProperty | ClassMethod;
