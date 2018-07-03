// This must be run AFTER our event-composed polyfill
export default function () {
     // Fix for FF not respecting spec'd composed flat
    // for `focusout` events
    // This is defined here because we are guaranteed
    // to have the composed polyfill applied to Event.
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1472887
    const originalComposedGetter = Object.getOwnPropertyDescriptor(Event.prototype, 'composed')!.get!;
    Object.defineProperties(FocusEvent.prototype, {
        composed: {
            get(this: FocusEvent) {
                const { isTrusted } = this;
                const composed = originalComposedGetter.call(this);
                if (isTrusted && composed === false) {
                    return true;
                }
                return composed;
            },
            enumerable: true,
            configurable: true,
        },
    });
}
