import { LightningElement } from 'lwc';

export default class Sample extends LightningElement {
    expr1() {
        return 'bar';
    }

    expr2 = { expr21: { expr22: 'expr22' } };
    expr3 = [{ expr33: 'expr33' }];
}
