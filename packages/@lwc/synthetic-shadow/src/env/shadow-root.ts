let NativeShadowRoot: typeof ShadowRoot;
if (typeof ShadowRoot !== 'undefined') {
    NativeShadowRoot = ShadowRoot;
} else {
    // A fake ShadowRoot class
    NativeShadowRoot = function () {} as any;
}

export { NativeShadowRoot };
