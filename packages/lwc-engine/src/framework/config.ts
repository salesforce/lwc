export let isSyntheticShadowRoot: boolean;

export function alwaysUseSyntheticShadowRoot() {
    isSyntheticShadowRoot = true;
}

export function alwaysUseNativeShadowRoot() {
    isSyntheticShadowRoot = false;
}
