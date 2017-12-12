import { Element } from "engine";

const DEFAULT_ITEMS = [{ label: 'P1' }, { label: 'P2' }];

export default class AppList extends Element {
    state = { items: DEFAULT_ITEMS };
}