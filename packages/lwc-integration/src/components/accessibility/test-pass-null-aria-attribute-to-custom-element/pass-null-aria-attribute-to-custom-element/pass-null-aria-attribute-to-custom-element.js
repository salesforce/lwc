import { Element } from 'engine';

export default class PassingNullAriaAttribute extends Element {
    get getComputedLabel() {
        return null;
    }
}
