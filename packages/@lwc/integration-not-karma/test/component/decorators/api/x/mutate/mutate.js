import { LightningElement, api } from 'lwc';

export default class Mutate extends LightningElement {
    @api publicProp;

    @api
    mutateCmp(cb) {
        cb(this);
    }
}
