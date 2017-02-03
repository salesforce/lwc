export default class HelloWorld {
    constructor () {}

    label = 'Default label';
    name = 'Name';
    onclick; // callback

    handleClick (e) {
        if (this.onclick) {
            this.onclick(e);
        } else {
            console.log('Test:', e);
        }
    }
}
