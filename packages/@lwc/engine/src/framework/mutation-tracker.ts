import {
    valueMutated as mtValueMutated,
    valueObserved,
    ReactiveObserver,
} from '../libs/mutation-tracker';
import { VM } from './vm';
// import { isFalse } from "@lwc/shared";

export function valueMutated(vm: VM, key: PropertyKey) {
    const { component } = vm;
    // if (isFalse(vm.isDirty)) {
    mtValueMutated(component, key);
    // }
}

export { valueObserved, ReactiveObserver };
