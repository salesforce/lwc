const { CustomEvent: OriginalCustomEvent } = (window as any);
export function PatchedCustomEvent(this: Event, type: string, eventInitDict: CustomEventInit<any>): Event {
    const event = new OriginalCustomEvent(type, eventInitDict);
    // support for composed on custom events
    Object.defineProperties(event, {
        composed: {
            // We can't use "value" here, because IE11 doesn't like mixing and matching
            // value with get() from Event.prototype.
            get() {
                return !!(eventInitDict && (eventInitDict as any).composed);
            },
            configurable: true,
            enumerable: true,
        },
    });
    return event;
}

export default function apply() {
    // https://github.com/w3c/webcomponents/issues/513#issuecomment-224183937
    const composedEvents = {
        blur: 1,
        focus: 1,
        focusin: 1,
        focusout: 1,
        click: 1,
        dblclick: 1,
        mousedown: 1,
        mouseenter: 1,
        mouseleave: 1,
        mousemove: 1,
        mouseout: 1,
        mouseover: 1,
        mouseup: 1,
        wheel: 1,
        beforeinput: 1,
        input: 1,
        keydown: 1,
        keyup: 1,
        compositionstart: 1,
        compositionupdate: 1,
        compositionend: 1,
        touchstart: 1,
        touchend: 1,
        touchmove: 1,
        touchcancel: 1,
        pointerover: 1,
        pointerenter: 1,
        pointerdown: 1,
        pointermove: 1,
        pointerup: 1,
        pointercancel: 1,
        pointerout: 1,
        pointerleave: 1,
        gotpointercapture: 1,
        lostpointercapture: 1,
        dragstart: 1,
        drag: 1,
        dragenter: 1,
        dragleave: 1,
        dragover: 1,
        drop: 1,
        dragend: 1,
        DOMActivate: 1,
        DOMFocusIn: 1,
        DOMFocusOut: 1,
        keypress: 1,
    };

    const { hasOwnProperty } = composedEvents;

    // Composed for Native events
    Object.defineProperties(Event.prototype, {
        composed: {
            get() {
                const { type } = this;
                return hasOwnProperty.call(composedEvents, type);
            },
            configurable: true,
            enumerable: true,
        },
    });
    (window as any).CustomEvent = PatchedCustomEvent;
    (window as any).CustomEvent.prototype = OriginalCustomEvent.prototype;
}
