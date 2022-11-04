import { signal } from "@preact/signals-core";

const FILTERS = {
    home: 'home',
    mouse: 'mouse',
    products: 'products'
};

export const location = signal(getCurrentFilter());

function getCurrentFilter() {
    const rawHash = document.location.hash;
    const location = rawHash.replace(/#\//, '').split('-')[0];
    return FILTERS[location] || FILTERS.home;
}

window.addEventListener('hashchange', () => (
    location.value = getCurrentFilter()
));