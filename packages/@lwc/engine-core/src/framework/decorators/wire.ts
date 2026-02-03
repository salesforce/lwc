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
import type { ConfigValue, ConfigWithReactiveProps, WireAdapterConstructor } from '../wiring';

/**
 * The decorator returned by `@wire()`; not the `wire` function.
 */
interface WireDecorator<Value, Class> {
    (
        target: unknown,
        context: // A wired prop doesn't have any data on creation, so we must allow `undefined`
            | ClassFieldDecoratorContext<Class, Value | undefined>
            | ClassMethodDecoratorContext<
                  Class,
                  // When a wire adapter is typed as `WireAdapterConstructor`, then this `Value`
                  // generic is inferred as the value used by the adapter for all decorator contexts
                  // (field/method/getter/setter). But when the adapter is typed as `any`, then
                  // decorated methods have `Value` inferred as the full method. (I'm not sure why.)
                  // This conditional checks `Value` so that we get the correct decorator context.
                  Value extends (value: any) => any ? Value : (this: Class, value: Value) => void
              >
            // The implementation of a wired getter/setter is ignored; they are treated identically
            // to wired props. Wired props don't have data on creation, so we must allow `undefined`
            | ClassGetterDecoratorContext<Class, Value | undefined>
            | ClassSetterDecoratorContext<Class, Value>
    ): void;
}

/**
 * Decorator factory to wire a property or method to a wire adapter data source.
 *
 * TypeScript users: Due to limitations of the type system, some edge cases are
 * not fully type checked. See the type definition for {@linkcode ConfigWithReactiveProps}
 * for details.
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
    const Config extends ConfigValue = ConfigValue,
    const Value = any,
    const Class = LightningElement,
>(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    adapter:
        | WireAdapterConstructor<Config, Value>
        | {
              adapter: WireAdapterConstructor<Config, Value>;
          },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    config?: ConfigWithReactiveProps<Config, Class>
): WireDecorator<Value, Class> {
    assert.fail('@wire(adapter, config?) may only be used as a decorator.');
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
