export default function apply() {
    // https://github.com/w3c/webcomponents/issues/513#issuecomment-224183937
    const composedEvents = {
        blur: true,
        focus: true,
        focusin: true,
        focusout: true,
        click: true,
        dblclick: true,
        mousedown: true,
        mouseenter: true,
        mouseleave: true,
        mousemove: true,
        mouseout: true,
        mouseover: true,
        mouseup: true,
        wheel: true,
        beforeinput: true,
        input: true,
        keydown: true,
        keyup: true,
        compositionstart: true,
        compositionupdate: true,
        compositionend: true,
        touchstart: true,
        touchend: true,
        touchmove: true,
        touchcancel: true,
        pointerover: true,
        pointerenter: true,
        pointerdown: true,
        pointermove: true,
        pointerup: true,
        pointercancel: true,
        pointerout: true,
        pointerleave: true,
        gotpointercapture: true,
        lostpointercapture: true,
        dragstart: true,
        drag: true,
        dragenter: true,
        dragleave: true,
        dragover: true,
        drop: true,
        dragend: true,
        DOMActivate: true,
        DOMFocusIn: true,
        DOMFocusOut: true,
        keypress: true,
    };
    Object.defineProperties(Event.prototype, {
        composed: {
            get() {
                const { type } = this;
                return composedEvents[type] !== undefined;
            },
            configurable: true,
            enumerable: true,
        },
    });
    const { CustomEvent: OriginalCustomEvent } = (window as any);
    (window as any).CustomEvent = function PatchedCustomEvent(this: Event, type: string, eventInitDict: CustomEventInit<any>): Event {
        const event = new OriginalCustomEvent(type, eventInitDict);
        // support for composed on custom events
        (event as any).composed = !!(eventInitDict && (eventInitDict as any).composed);
        return event;
    };
    (window as any).CustomEvent.prototype = OriginalCustomEvent.prototype;
}
