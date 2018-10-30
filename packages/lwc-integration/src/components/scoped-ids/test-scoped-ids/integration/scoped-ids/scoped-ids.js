import { LightningElement } from 'lwc';

export default class NestedScopedIds extends LightningElement {
    get childId() {
        return 'foo';
    }
    get hoge() {
        return 'hoge';
    }
}
