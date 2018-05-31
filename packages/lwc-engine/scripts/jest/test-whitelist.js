const CONSOLE_WHITELIST = [
    'html-element #removeAttributeNS() should remove attribute on host element',
    'html-element #removeAttribute() should remove attribute on host element when element is nested in template',
    'html-element #removeAttribute() should remove attribute on host element',
    'html-element #getAttributeNS() should return correct attribute value',
    'html-element global HTML Properties should always return null',
    'html-element global HTML Properties should set user specified value during setAttribute call',
    'html-element global HTML Properties should log console error when user land code changes attribute via querySelector',
    'html-element global HTML Properties should log console error when user land code removes attribute via querySelector',
    'html-element global HTML Properties should log error message when attribute is set via elm.setAttribute if reflective property is defined',
    'html-element global HTML Properties should delete existing attribute prior rendering',
    'html-element global HTML Properties should correctly set child attribute',
    'html-element #tabIndex should have a valid value during connectedCallback',
    'html-element #tabIndex should have a valid value after initial render',
    'html-element #tabIndex should set tabindex correctly',
    'html-element #tabIndex should not trigger render cycle',
    'html-element #tabIndex should allow parent component to overwrite internally set tabIndex',
    'html-element Aria Properties #role AOM shim getAttribute reflect default value when aria-checked has been removed',
    'html-element Aria Properties #ariaChecked AOM shim external getAttribute reflect default value when aria-checked has been removed',
    'html-element global HTML Properties #lang should reflect attribute by default',
    'html-element global HTML Properties #lang should return correct value from getter',
    'html-element global HTML Properties #lang should be reactive by default',
    'html-element global HTML Properties #hidden should reflect attribute by default',
    'html-element global HTML Properties #hidden should return correct value from getter',
    'html-element global HTML Properties #hidden should be reactive by default',
    'html-element global HTML Properties #id should reflect attribute by default',
    'html-element global HTML Properties #id should return correct value from getter',
    'html-element global HTML Properties #id should be reactive by default',
    'html-element global HTML Properties #accessKey should reflect attribute by default',
    'html-element global HTML Properties #accessKey should return correct value from getter',
    'html-element global HTML Properties #accessKey should be reactive by default',
    'html-element global HTML Properties #title should reflect attribute by default',
    'html-element global HTML Properties #title should return correct value from getter',
    'html-element global HTML Properties #title should be reactive by default',
    'html-element global HTML Properties should always return null',
    'html-element global HTML Properties should set user specified value during setAttribute call',
    'html-element global HTML Properties should log console error when user land code changes attribute via querySelector',
    'html-element global HTML Properties should log console error when user land code removes attribute via querySelector',
    'html-element global HTML Properties should not log error message when arbitrary attribute is set via elm.setAttribute',
    'html-element global HTML Properties should delete existing attribute prior rendering',

    'component public methods should allow calling getAttribute on child when referenced with querySelector',
    'component public methods should allow calling setAttribute on child when referenced with querySelector',
    'component public methods should allow calling removeAttribute on child when referenced with querySelector'

    '#lightDomQuerySelectorAll() Invoked from within component should ignore elements passed to its slot',
    '#lightDomQuerySelectorAll() Invoked from within component should not throw an error if no nodes are found',
    '#lightDomQuerySelector() should not throw an error if element does not exist',
    '#lightDomQuerySelector() should return null if element does not exist',
    '#shadowRootQuerySelector should not throw error if querySelector does not match any elements',
    '#shadowRootQuerySelector should return null if querySelector does not match any elements',
    '#shadowRootQuerySelector should not throw error if querySelectorAll does not match any elements'

    'error boundary component errors occured inside boundary wrapped child`s lifecycle methods renderedCallback should unmount error boundary child if it throws inside renderedCallback',
    'error boundary component errors occured inside boundary wrapped child`s lifecycle methods renderedCallback should invoke parent boundary if child`s immediate boundary fails inside renderedCallback',
    'error boundary component errors occured inside boundary wrapped child`s lifecycle methods renderedCallback should unmount boundary child and its subtree if child throws inside renderedCallback',
    'error boundary component errors occured inside boundary wrapped child`s lifecycle methods connectedCallback should unmount boundary child and its subtree if boundary child throws inside connectedCallback',
    'error boundary component errors occured inside boundary wrapped child`s lifecycle methods error boundary failures in rendering alternative view should rethrow error to the parent error boundary when child boundary fails to render alternative view',

    'template integration should render arrays correctly',
    'template integration should render sets correctly',

    'Events on Custom Elements should add event listeners in connectedCallback when created via render',

    'invoker integration should invoke connectedCallback() before any child is inserted into the dom',

    'root integration should ignore elements from other owner',
    'root integration should ignore element from other owner',
];

module.exports = {
    CONSOLE_WHITELIST,
};
