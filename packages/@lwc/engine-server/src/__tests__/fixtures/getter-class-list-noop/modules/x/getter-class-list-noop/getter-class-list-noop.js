import { LightningElement } from 'lwc';

export default class GetterClassListNoop extends LightningElement{
    connectedCallback() {
        const { classList } = this;
        // Get the classList without actually mutating any classes
        expect(classList).not.toBeUndefined()
    }
}
