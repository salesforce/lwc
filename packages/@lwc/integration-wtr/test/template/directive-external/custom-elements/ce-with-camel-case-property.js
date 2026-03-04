customElements.define(
    'ce-with-camel-case-property',
    class extends HTMLElement {
        // Use explicit undefined initializer so that the LWC compiler's
        // useDefineForClassFields:false setting still generates a constructor
        // assignment (this.camelCaseProp = undefined), preserving the own
        // property needed for native custom-element property assignment.
        camelCaseProp = undefined;
    }
);
