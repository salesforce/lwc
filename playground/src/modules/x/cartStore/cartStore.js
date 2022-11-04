import { signal, computed } from "@preact/signals-core";

export const cartContent = signal([]);
export const itemsInCart = computed(() => { return cartContent.value.reduce((acc, { qty }) => acc + qty, 0)});
export const cartTotal = computed(() => cartContent.value.reduce((acc, { item, qty }) => acc + qty * item.price, 0).toFixed(2));

export function addItem(newItem) {
    const content = cartContent.value;
    const existingItem = content.find(({ item }) => item.id === newItem.id);

    if (existingItem) {
        existingItem.id = Math.random();
        existingItem.qty++;
        existingItem.lineTotal += newItem.price;
    } else {
        content.push({
            id: Math.random(),
            item: newItem,
            qty: 1,
            lineTotal: newItem.price,
        });
    }

    cartContent.value = [...cartContent.value];
}