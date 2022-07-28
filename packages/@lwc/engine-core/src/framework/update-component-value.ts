import { VM } from './vm';
import { componentValueMutated } from './mutation-tracker';

export function updateComponentValue(vm: VM, key: string, newValue: any) {
    const { cmpFields } = vm;
    if (newValue !== cmpFields[key]) {
        cmpFields[key] = newValue;

        componentValueMutated(vm, key);
    }
}
