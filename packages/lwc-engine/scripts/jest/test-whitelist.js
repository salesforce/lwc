/**
 * List of all tests that are permitted to log a warning or an error.
 *
 * The goal is disallow uninstrumented usage of logging in unit tests. All the tests
 * logging a warning or an error, that are not part of this list will automatically fail.
 *
 * BY ADDING A NEW ENTRY IN THIS LIST, YOU WILL BRING SHAME ON YOURSELF OVER MULTIPLE GENERATIONS!!
 */
const CONSOLE_WHITELIST = [
    '#childNodes should always return an empty array for slots not rendering default content',
    '#childNodes should not return child text from within template',
    '#childNodes should not return dynamic child text from within template',
    '#childNodes should return child text content passed via slot',
    '#childNodes should return correct childNodes from shadowRoot',
    '#childNodes should return correct elements for custom elements when children present',
    '#childNodes should return correct elements for custom elements when no children present',
    '#childNodes should return correct elements for non-slot elements',
    '#childNodes should return correct elements for slots rendering default content',
    '#shadowRoot querySelector should adopt elements not defined in template as part of the shadow',
    '#shadowRootQuerySelector should not throw error if querySelector does not match any elements',
    '#shadowRootQuerySelector should not throw error if querySelectorAll does not match any elements',
    '#shadowRootQuerySelector should return null if querySelector does not match any elements',
    'api #i() should support various types',
    'api #ti() should set tabIndex to -1 when value is not 0',
    'assignedSlot should return correct slot when text is slotted',
    'component public computed props should call setter function when used directly from DOM',
    'component public methods should allow calling getAttribute on child when referenced with querySelector',
    'component public methods should allow calling removeAttribute on child when referenced with querySelector',
    'component public methods should allow calling setAttribute on child when referenced with querySelector',
    'html-element #removeAttribute() should remove attribute on host element when element is nested in template',
    'html-element global HTML Properties should correctly set child attribute',
    'html-element global HTML Properties should log console error when user land code changes attribute via querySelector',
    'html-element global HTML Properties should log console error when user land code removes attribute via querySelector',
    'html-element global HTML Properties should log error message when attribute is set via elm.setAttribute if reflective property is defined',
    'html-element life-cycles should not throw error when accessing a non-observable property from tracked property when not rendering',
    'root .compareDocumentPosition should implements shadow dom semantics',
    'root .contains should implements shadow dom semantics',
    'root .firstChild could be a text node',
    'root .firstChild should return the first child',
    'root .hasChildNodes should return false for empty shadow root',
    'root .hasChildNodes should return false when no child is added to the shadow root',
    'root .hasChildNodes should return true when at least a slot is present',
    'root .hasChildNodes should return true when at least a text node is present',
    'root .lastChild could be a text node',
    'root .lastChild should return the last child',
    'root .parentElement should return null on child node',
    'root childNodes should return array of childnodes'
];

for (let i = 0; i < CONSOLE_WHITELIST.length; i++) {
    for (let j = i + 1; j < CONSOLE_WHITELIST.length; j++) {
        if (CONSOLE_WHITELIST[i] === CONSOLE_WHITELIST[j]) {
            throw new Error(
                `Duplicate test name in whitelist "${CONSOLE_WHITELIST[i]}"`,
            );
        }
    }
}

module.exports = {
    CONSOLE_WHITELIST,
};
