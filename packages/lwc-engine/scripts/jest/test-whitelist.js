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
    '#shadowRootQuerySelector should not throw error if querySelectorAll does not match any elements'
    '#shadowRootQuerySelector should return null if querySelector does not match any elements',

    'api #c() should coerce style to string when is object',
    'api #h() should coerce style to string when is object',
    'api #i() should support various types',

    'assignedSlot should return correct slot when text is slotted',

    'component public computed props should call setter function when used directly from DOM',
    'component public methods should allow calling getAttribute on child when referenced with querySelector',
    'component public methods should allow calling removeAttribute on child when referenced with querySelector'
    'component public methods should allow calling setAttribute on child when referenced with querySelector',

    'error boundary component errors occured inside boundary wrapped child`s lifecycle methods connectedCallback should unmount boundary child and its subtree if boundary child throws inside connectedCallback',
    'error boundary component errors occured inside boundary wrapped child`s lifecycle methods error boundary failures in rendering alternative view should rethrow error to the parent error boundary when child boundary fails to render alternative view',
    'error boundary component errors occured inside boundary wrapped child`s lifecycle methods renderedCallback should invoke parent boundary if child`s immediate boundary fails inside renderedCallback',
    'error boundary component errors occured inside boundary wrapped child`s lifecycle methods renderedCallback should unmount boundary child and its subtree if child throws inside renderedCallback',
    'error boundary component errors occured inside boundary wrapped child`s lifecycle methods renderedCallback should unmount error boundary child if it throws inside renderedCallback',

    'Events on Custom Elements should add event listeners in connectedCallback when created via render',

    'html-element #dispatchEvent should log warning when element is not connected',
    'html-element #dispatchEvent should log warning when event name contains non-alphanumeric lowercase characters',
    'html-element #dispatchEvent should log warning when event name does not start with alphabetic lowercase characters',
    'html-element #dispatchEvent should not log warning for alphanumeric lowercase event name',
    'html-element #dispatchEvent should not log warning when element is connected',
    'html-element #getAttribute() should not throw when attribute name matches a declared public property',
    'html-element #getAttributeNS() should return correct attribute value',
    'html-element #removeAttribute() should remove attribute on host element when element is nested in template',
    'html-element #removeAttribute() should remove attribute on host element',
    'html-element #removeAttributeNS() should remove attribute on host element',
    'html-element #removeAttributeNS() should remove namespaced attribute on host element when element is nested in template',
    'html-element #tabIndex should allow parent component to overwrite internally set tabIndex',
    'html-element #tabIndex should have a valid value after initial render',
    'html-element #tabIndex should have a valid value during connectedCallback',
    'html-element #tabIndex should not trigger render cycle',
    'html-element #tabIndex should set tabindex correctly',
    'html-element Aria Properties #ariaChecked AOM shim external getAttribute reflect default value when aria-checked has been removed',
    'html-element Aria Properties #ariaChecked AOM shim internal getAttribute reflect default value when aria-checked has been removed',
    'html-element Aria Properties #role AOM shim getAttribute reflect default value when aria-checked has been removed',
    'html-element global HTML Properties #accessKey should be reactive by default',
    'html-element global HTML Properties #accessKey should reflect attribute by default',
    'html-element global HTML Properties #accessKey should return correct value from getter',
    'html-element global HTML Properties #hidden should be reactive by default',
    'html-element global HTML Properties #hidden should reflect attribute by default',
    'html-element global HTML Properties #hidden should return correct value from getter',
    'html-element global HTML Properties #id should be reactive by default',
    'html-element global HTML Properties #id should reflect attribute by default',
    'html-element global HTML Properties #id should return correct value from getter',
    'html-element global HTML Properties #lang should be reactive by default',
    'html-element global HTML Properties #lang should reflect attribute by default',
    'html-element global HTML Properties #lang should return correct value from getter',
    'html-element global HTML Properties #title should be reactive by default',
    'html-element global HTML Properties #title should reflect attribute by default',
    'html-element global HTML Properties #title should return correct value from getter',
    'html-element global HTML Properties should always return null',
    'html-element global HTML Properties should correctly set child attribute',
    'html-element global HTML Properties should delete existing attribute prior rendering',
    'html-element global HTML Properties should log console error when user land code changes attribute via querySelector',
    'html-element global HTML Properties should log console error when user land code removes attribute via querySelector',
    'html-element global HTML Properties should log error message when attribute is set via elm.setAttribute if reflective property is defined',
    'html-element global HTML Properties should not log error message when arbitrary attribute is set via elm.setAttribute',
    'html-element global HTML Properties should set user specified value during setAttribute call',
    'html-element life-cycles should not throw error when accessing a non-observable property from tracked property when not rendering',

    'invoker integration should invoke connectedCallback() before any child is inserted into the dom',

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
    'root childNodes should return array of childnodes',
    'root integration should ignore element from other owner',
    'root integration should ignore elements from other owner',

    'template integration should render arrays correctly',
    'template integration should render sets correctly',

    'track.ts integration should not proxify exotic objects',
    'track.ts integration should not proxify non-observable object',

    'wire.ts integration should not proxify exotic objects',
    'wire.ts integration should not proxify non-observable object',
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
