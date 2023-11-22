// swapping forwarded slots
// mixed shadow DOM and light DOM components
// Default slotted content for forwarded slots
// static content as parent
// slot attribute as a string/object prop/dynamic value
// light DOM forwarded slots 2x levels
// light DOM > light DOM > Shadow DOM

// light > light
// shadow > light
// light > shadow

// light > light > light
// light > light > shadow
// light > shadow > light
// shadow > light > shadow
// shadow > light > light

// mix of elements / custom elements / text / comments / static content

// Question: can static content trigger reactivity?

// trigger reactivity in forwarded slots and see what happens

// light light light
// light shadow light
// light light shadow
// shadow light light

// 1. forwarded slot default content
// 2. forwarded slot manipulated content ie the variables assigned to slot
// 3. forwarded slot content slotted correctly
