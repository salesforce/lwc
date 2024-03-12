import { LightningElement } from 'lwc';

export default class extends LightningElement {
    test = window.location.href;
    async foo() {
        await bar();
    }
    async bar() {
        for await (const num of baz()) {
            break;
        }
    }
    // eslint-disable-next-line @typescript-eslint/require-await
    async * baz() {
        yield 1;
        yield 2;
    }
}
