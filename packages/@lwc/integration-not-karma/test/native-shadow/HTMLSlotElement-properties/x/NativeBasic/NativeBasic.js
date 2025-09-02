export default function () {
    const xSlotted = document.createElement('x-slotted-name-unique-to-this-test');
    xSlotted.innerHTML =
        "<div slot='slot1' data-slot-id='slot1'>Named slot content</div><div data-slot-id='default'><p>Default slot content</p></div>Text Node";
    const shadowRoot = xSlotted.attachShadow({ mode: 'open' });
    shadowRoot.innerHTML = "<slot>Default content</slot><slot name='slot1'></slot>";
    return xSlotted;
}
