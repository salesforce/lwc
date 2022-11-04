import { LightningElement } from 'lwc';
import { addItem } from 'x/cartStore';
import { allProducts } from './products';

export default class ProductList extends LightningElement {
    products = allProducts;

    addToCart(evt) {
        evt.preventDefault();

        const selectedProduct = this.products[parseInt(evt.target.getAttribute('data-id'), 10)];
        addItem(selectedProduct);
    }
}