import { LifecycleCallbacks } from '@lwc/engine-core';

let lifecycleCallbacks: LifecycleCallbacks | undefined;

export function setLifecycleCallbacks(callbacks: LifecycleCallbacks) {
    lifecycleCallbacks = callbacks;
}

export function getLifecycleCallbacks(): LifecycleCallbacks | undefined {
    return lifecycleCallbacks;
}
