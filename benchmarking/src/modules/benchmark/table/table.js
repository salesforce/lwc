import { HTMLElement } from "raptor";

import html from "./table.html";
import { Store } from './store';

var store = new Store();

function computeRows(store) {
    const rows = Array(store.data.length);
    const selected = store.selected;
    store.data.forEach((item, index) => {
        rows[index] = {
            className: selected === item.id ? 'danger' : 'nothing',
            id: item.id,
            label: item.label,
        };
    });
    return rows;
}

export default class Table extends HTMLElement {
    constructor() {
        super();
        this.rows = computeRows(store);
    }

    render() {
        return html;
    }

    @method
    add() {
        store.add();
        this.rows = computeRows(store);
    }

    @method
    remove(id) {
        store.delete(id);
        this.rows = computeRows(store);
    }

    @method
    select(id) {
        store.select(id);
        this.rows = computeRows(store);
    }

    @method
    run() {
        store.run();
        this.rows = computeRows(store);
    }

    @method
    update() {
        store.update();
        this.rows = computeRows(store);
    }

    @method
    runLots() {
        store.runLots();
        this.rows = computeRows(store);
    }

    @method
    clear() {
        store.clear();
        this.rows = computeRows(store);
    }

    @method
    swapRows() {
        store.swapRows();
        this.rows = computeRows(store);
    }

    @method
    handleSelect(e) {
        this.select(e.currentTarget.x);
    }

    @method
    handleRemove(e) {
        this.remove(e.currentTarget.x);
    }
}
