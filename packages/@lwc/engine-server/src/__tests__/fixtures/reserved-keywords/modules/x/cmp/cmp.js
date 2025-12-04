import { LightningElement } from 'lwc';

const privateProperties = undefined;
const publicProperties = undefined;
const stylesheetScopeToken = undefined;
const hasScopedStylesheets = undefined;
const defaultScopedStylesheets = undefined;

export default class extends LightningElement {
    connectedCallback() {
        // just use the variables to avoid them being tree-shaken
        Object.assign(
            {},
            {
                privateProperties,
                publicProperties,
                stylesheetScopeToken,
                hasScopedStylesheets,
                defaultScopedStylesheets,
            }
        );
    }
}
