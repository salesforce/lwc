/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { assign, create, defineProperties } from '@lwc/shared';

export default function apply() {
    // https://github.com/w3c/webcomponents/issues/513#issuecomment-224183937
    const composedEvents = assign(create(null), {
        beforeinput: 1,
        blur: 1,
        click: 1,
        compositionend: 1,
        compositionstart: 1,
        compositionupdate: 1,
        copy: 1,
        cut: 1,
        dblclick: 1,
        DOMActivate: 1,
        DOMFocusIn: 1,
        DOMFocusOut: 1,
        drag: 1,
        dragend: 1,
        dragenter: 1,
        dragleave: 1,
        dragover: 1,
        dragstart: 1,
        drop: 1,
        focus: 1,
        focusin: 1,
        focusout: 1,
        gotpointercapture: 1,
        input: 1,
        keydown: 1,
        keypress: 1,
        keyup: 1,
        lostpointercapture: 1,
        mousedown: 1,
        mouseenter: 1,
        mouseleave: 1,
        mousemove: 1,
        mouseout: 1,
        mouseover: 1,
        mouseup: 1,
        paste: 1,
        pointercancel: 1,
        pointerdown: 1,
        pointerenter: 1,
        pointerleave: 1,
        pointermove: 1,
        pointerout: 1,
        pointerover: 1,
        pointerup: 1,
        touchcancel: 1,
        touchend: 1,
        touchmove: 1,
        touchstart: 1,
        wheel: 1,
    });

    const EventConstructor = Event;

    // Patch Event constructor to add the composed property on events created via new Event.
    function PatchedEvent(this: Event, type: string, eventInitDict?: EventInit): Event {
        const event = new EventConstructor(type, eventInitDict);

        const isComposed = !!(eventInitDict && eventInitDict.composed);
        defineProperties(event, {
            composed: {
                get(): boolean {
                    return isComposed;
                },
                configurable: true,
                enumerable: true,
            },
        });

        return event;
    }

    PatchedEvent.prototype = EventConstructor.prototype;
    PatchedEvent.AT_TARGET = EventConstructor.AT_TARGET;
    PatchedEvent.BUBBLING_PHASE = EventConstructor.BUBBLING_PHASE;
    PatchedEvent.CAPTURING_PHASE = EventConstructor.CAPTURING_PHASE;
    PatchedEvent.NONE = EventConstructor.NONE;

    (window as any).Event = PatchedEvent;

    // Patch the Event prototype to add the composed property on user agent dispatched event.
    defineProperties(Event.prototype, {
        composed: {
            get() {
                const { type } = this;
                return composedEvents[type] === 1;
            },
            configurable: true,
            enumerable: true,
        },
    });
}
