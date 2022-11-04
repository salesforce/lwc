import { LightningElement } from 'lwc';
import { computed } from "@preact/signals-core";
import { location } from 'x/navLocation';

import Home from 'x/home';
import Mouse from 'x/mouse';
import ProductList from 'x/productList';

const pages = {
    'home': Home,
    'mouse': Mouse,
    'products': ProductList,
}

export default class App extends LightningElement {
    page = computed(() => pages[location.value]);

    renderedCallback() {
        console.log('rendered: [App]');
    }
}