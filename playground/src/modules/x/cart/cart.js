import { LightningElement } from 'lwc';
import { cartContent, itemsInCart, cartTotal } from 'x/cartStore';

export default class Cart extends LightningElement {
    total = cartTotal;
    items = itemsInCart;
    contents = cartContent;

    renderedCallback() {
        console.log("Rendered: [Cart]");
    }
}