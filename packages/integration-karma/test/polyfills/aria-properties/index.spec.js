function testAriaProperty(property, attribute, standard) {
    describe(property, () => {
        it(`should ${
            standard ? '' : 'not'
        } assign property ${property} to Element prototype`, () => {
            expect(Object.prototype.hasOwnProperty.call(Element.prototype, property)).toBe(
                standard
            );
        });

        it(`should ${standard ? '' : 'not'} return null if the value is not set`, () => {
            const el = document.createElement('div');
            expect(el[property]).toBe(standard ? null : undefined);
        });

        it(`should return the right value from the getter`, () => {
            const el = document.createElement('div');
            el[property] = 'foo';
            expect(el[property]).toBe('foo');
        });

        it(`should ${
            standard ? '' : 'not'
        } reflect the property to the associated attribute`, () => {
            const el = document.createElement('div');
            el[property] = 'foo';
            expect(el.getAttribute(attribute)).toBe(standard ? 'foo' : null);
        });

        it(`should ${standard ? '' : 'not'} reflect the attribute to the property`, () => {
            const el = document.createElement('div');
            el.setAttribute(attribute, 'foo');
            expect(el[property]).toBe(standard ? 'foo' : undefined);
        });

        it(`should ${
            standard ? '' : 'not'
        } remove the attribute if the property is set to null`, () => {
            const el = document.createElement('div');
            el.setAttribute(attribute, 'foo');

            el[property] = null;
            expect(el.hasAttribute(attribute)).toBe(!standard);
        });
    });
}

const ariaPropertiesMapping = {
    ariaAtomic: 'aria-atomic',
    ariaAutoComplete: 'aria-autocomplete',
    ariaBusy: 'aria-busy',
    ariaChecked: 'aria-checked',
    ariaColCount: 'aria-colcount',
    ariaColIndex: 'aria-colindex',
    ariaColSpan: 'aria-colspan',
    ariaCurrent: 'aria-current',
    ariaDisabled: 'aria-disabled',
    ariaExpanded: 'aria-expanded',
    ariaHasPopup: 'aria-haspopup',
    ariaHidden: 'aria-hidden',
    ariaInvalid: 'aria-invalid',
    ariaKeyShortcuts: 'aria-keyshortcuts',
    ariaLabel: 'aria-label',
    ariaLevel: 'aria-level',
    ariaLive: 'aria-live',
    ariaModal: 'aria-modal',
    ariaMultiLine: 'aria-multiline',
    ariaMultiSelectable: 'aria-multiselectable',
    ariaOrientation: 'aria-orientation',
    ariaPlaceholder: 'aria-placeholder',
    ariaPosInSet: 'aria-posinset',
    ariaPressed: 'aria-pressed',
    ariaReadOnly: 'aria-readonly',
    ariaRelevant: 'aria-relevant',
    ariaRequired: 'aria-required',
    ariaRoleDescription: 'aria-roledescription',
    ariaRowCount: 'aria-rowcount',
    ariaRowIndex: 'aria-rowindex',
    ariaRowSpan: 'aria-rowspan',
    ariaSelected: 'aria-selected',
    ariaSetSize: 'aria-setsize',
    ariaSort: 'aria-sort',
    ariaValueMax: 'aria-valuemax',
    ariaValueMin: 'aria-valuemin',
    ariaValueNow: 'aria-valuenow',
    ariaValueText: 'aria-valuetext',
    role: 'role',
};

// The non-standard list includes prop->attr mappings that we have added in the
// past, but which are not part of AOM ARIA reflection as supported in browsers.
// https://github.com/salesforce/lwc/issues/2733
const nonStandardAriaPropertiesMapping = {
    ariaActiveDescendant: 'aria-activedescendant',
    ariaControls: 'aria-controls',
    ariaDescribedBy: 'aria-describedby',
    ariaDetails: 'aria-details',
    ariaErrorMessage: 'aria-errormessage',
    ariaFlowTo: 'aria-flowto',
    ariaLabelledBy: 'aria-labelledby',
    ariaOwns: 'aria-owns',
};

for (const [ariaProperty, ariaAttribute] of Object.entries(ariaPropertiesMapping)) {
    testAriaProperty(ariaProperty, ariaAttribute, true);
}

for (const [ariaProperty, ariaAttribute] of Object.entries(nonStandardAriaPropertiesMapping)) {
    testAriaProperty(ariaProperty, ariaAttribute, false);
}
