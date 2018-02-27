import { Element } from 'engine';

export default class App extends Element {
    handleClick() {
        const child = this.root.querySelector('x-child');
        child.foo();
    }
}
