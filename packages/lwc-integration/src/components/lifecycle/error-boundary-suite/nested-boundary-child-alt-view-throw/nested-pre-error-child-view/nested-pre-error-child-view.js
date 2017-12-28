import { Element } from 'engine';

export default class PreErrorChildView extends Element {
    renderedCallback() {
        throw new Error("Boundary Initial Child Offender Throws");
    }
}
