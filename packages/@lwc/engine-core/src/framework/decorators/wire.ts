/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { assert } from '@lwc/shared';
import { componentValueObserved } from '../mutation-tracker';
import { getAssociatedVM } from '../vm';
import { updateComponentValue } from '../update-component-value';
import type { LightningElement } from '../base-lightning-element';
import type {
    ConfigValue,
    ContextValue,
    ReplaceReactiveValues,
    WireAdapterConstructor,
} from '../wiring';

/**
 * The decorator returned by `@wire()`; not the `wire` function. Each overload corresponds to a
 * decorator type - field (prop), method, getter, or setter. There are two overloads for method
 * decorators due to a limitation of type inferencing.
 */
interface WireDecorator<Value, Class> {
    (
        target: unknown,
        context:
            | ClassFieldDecoratorContext<Class, Value | undefined>
            | ClassMethodDecoratorContext<
                  Class,
                  // The generic isn't inferred correctly when the adapter is type `any`;
                  // This conditional is a workaround for that case
                  Value extends (value: any) => any ? Value : (this: Class, value: Value) => void
              >
            | ClassGetterDecoratorContext<Class, Value>
            | ClassSetterDecoratorContext<Class, Value>
    ): void;
}

/**
 * Decorator factory to wire a property or method to a wire adapter data source.
 * @param adapter the adapter used to provision data
 * @param config configuration object for the adapter
 * @returns A decorator function
 * @example
 * export default class WireExample extends LightningElement {
 *   \@api bookId;
 *   \@wire(getBook, { id: '$bookId'}) book;
 * }
 */
export default function wire<
    ReactiveConfig extends ConfigValue = ConfigValue,
    Value = any,
    Context extends ContextValue = ContextValue,
    Class = LightningElement
>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    adapter: WireAdapterConstructor<ReplaceReactiveValues<ReactiveConfig, Class>, Value, Context>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    config?: ReactiveConfig
): WireDecorator<Value, Class> {
    if (process.env.NODE_ENV !== 'production') {
        assert.fail('@wire(adapter, config?) may only be used as a decorator.');
    }
    throw new Error();
}

export function internalWireFieldDecorator(key: string): PropertyDescriptor {
    return {
        get(this: LightningElement): any {
            const vm = getAssociatedVM(this);
            componentValueObserved(vm, key);
            return vm.cmpFields[key];
        },
        set(this: LightningElement, value: any) {
            const vm = getAssociatedVM(this);
            /**
             * Reactivity for wired fields is provided in wiring.
             * We intentionally add reactivity here since this is just
             * letting the author to do the wrong thing, but it will keep our
             * system to be backward compatible.
             */
            updateComponentValue(vm, key, value);
        },
        enumerable: true,
        configurable: true,
    };
}
