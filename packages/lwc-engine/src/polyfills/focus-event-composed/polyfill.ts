export default function () {
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
