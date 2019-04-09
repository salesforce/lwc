const features = {
    // examples
    foo: true, // this branch will be preserved but the condition removed
    bar: false, // this branch will be removed
    baz: null, // this branch will be preserved with a runtime condition

    // synthetic shadow configuration
    syntheticShadow: true,
    slotchangeEvent: true,
    childrenGetter: true,
};

// conditional configs for jest
if (process.env.NODE_ENV === 'test') {
    // slotchange event does not work in jest because mutation observer is not supported
    features.slotchangeEvent = false;
    // customElement.children getter cannot be patched in jest because it is used to
    // implement the querySelector* internal mechanism
    features.childrenGetter = false;
}

export default features;
