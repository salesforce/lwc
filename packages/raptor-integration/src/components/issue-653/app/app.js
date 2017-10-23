import { Element } from 'engine';

export default class App extends Element {
    handleClick() {
        this.root.querySelector('x-child').foo();
    }
}