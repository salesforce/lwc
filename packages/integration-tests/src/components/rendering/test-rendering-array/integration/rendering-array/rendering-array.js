import { LightningElement } from 'lwc';

const DEFAULT_ITEMS = [{ label: 'P1' }, { label: 'P2' }];

export default class AppList extends LightningElement {
    state = { items: DEFAULT_ITEMS };
}
