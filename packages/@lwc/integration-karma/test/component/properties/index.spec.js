import { createElement } from 'lwc';

import Component from 'x/component';

// This list can grow as we add more properties to the base LightningElement
const expectedEnumerableProps = [
    'accessKey',
    'accessKeyLabel',
    'addEventListener',
    'ariaActiveDescendant',
    'ariaAtomic',
    'ariaAutoComplete',
    'ariaBusy',
    'ariaChecked',
    'ariaColCount',
    'ariaColIndex',
    'ariaColSpan',
    'ariaControls',
    'ariaCurrent',
    'ariaDescribedBy',
    'ariaDetails',
    'ariaDisabled',
    'ariaErrorMessage',
    'ariaExpanded',
    'ariaFlowTo',
    'ariaHasPopup',
    'ariaHidden',
    'ariaInvalid',
    'ariaKeyShortcuts',
    'ariaLabel',
    'ariaLabelledBy',
    'ariaLevel',
    'ariaLive',
    'ariaModal',
    'ariaMultiLine',
    'ariaMultiSelectable',
    'ariaOrientation',
    'ariaOwns',
    'ariaPlaceholder',
    'ariaPosInSet',
    'ariaPressed',
    'ariaReadOnly',
    'ariaRelevant',
    'ariaRequired',
    'ariaRoleDescription',
    'ariaRowCount',
    'ariaRowIndex',
    'ariaRowSpan',
    'ariaSelected',
    'ariaSetSize',
    'ariaSort',
    'ariaValueMax',
    'ariaValueMin',
    'ariaValueNow',
    'ariaValueText',
    'childNodes',
    'children',
    'classList',
    'className',
    'contentEditable',
    'dataset',
    'dir',
    'dispatchEvent',
    'draggable',
    'dropzone',
    'firstChild',
    'firstElementChild',
    'getAttribute',
    'getAttributeNS',
    'getBoundingClientRect',
    'getElementsByClassName',
    'getElementsByTagName',
    'hasAttribute',
    'hasAttributeNS',
    'hidden',
    'id',
    'inputMode',
    'isConnected',
    'isContentEditable',
    'lang',
    'lastChild',
    'lastElementChild',
    'offsetHeight',
    'offsetLeft',
    'offsetParent',
    'offsetTop',
    'offsetWidth',
    'querySelector',
    'querySelectorAll',
    'removeAttribute',
    'removeAttributeNS',
    'removeEventListener',
    'render',
    'role',
    'setAttribute',
    'setAttributeNS',
    'shadowRoot',
    'slot',
    'spellcheck',
    'style',
    'tabIndex',
    'template',
    'title',
    'toString',
    'translate',
];

const expectedEnumerableAndWritableProps = [
    'addEventListener',
    'dispatchEvent',
    'getAttribute',
    'getAttributeNS',
    'getBoundingClientRect',
    'getElementsByClassName',
    'getElementsByTagName',
    'hasAttribute',
    'hasAttributeNS',
    'querySelector',
    'querySelectorAll',
    'removeAttribute',
    'removeAttributeNS',
    'removeEventListener',
    'render',
    'setAttribute',
    'setAttributeNS',
    'toString',
];

// Old versions of Safari return "constructor" in the props
function removeConstructor(array) {
    return array.filter((_) => _ !== 'constructor');
}

describe('properties', () => {
    let elm;

    beforeEach(() => {
        elm = createElement('x-component', { is: Component });
        document.body.appendChild(elm);
    });

    it('has expected enumerable properties', () => {
        const props = removeConstructor(elm.getEnumerableProps());
        expect(props).toEqual(expectedEnumerableProps);
    });

    it('has expected writable properties', () => {
        const props = removeConstructor(elm.getEnumerableAndWritableProps());
        expect(props).toEqual(expectedEnumerableAndWritableProps);
    });

    it('has expected configurable properties', () => {
        const props = removeConstructor(elm.getEnumerableAndConfigurableProps());
        expect(props).toEqual([]);
    });
});
