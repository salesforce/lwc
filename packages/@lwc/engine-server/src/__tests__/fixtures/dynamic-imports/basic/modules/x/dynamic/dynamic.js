import { LightningElement } from 'lwc';

export default class DynamicCtor extends LightningElement {
    importee

    constructor() {
        super()
        import('x/fake').then(result => {
            this.importee = result
        })
    }
}
