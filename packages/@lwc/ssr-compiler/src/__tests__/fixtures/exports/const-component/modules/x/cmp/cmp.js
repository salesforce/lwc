import { LightningElement } from 'lwc';

class Base {
    base = true;
}

class Ext extends Base {
    ext = true;
}

export const ext = new Ext();

const Component = class extends LightningElement {
    prop = 'grace was here';
};

export default Math.random() ? Component : Ext;
