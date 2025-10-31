import { LightningElement } from 'lwc';

export default class Child extends LightningElement {
    static renderMode = 'light';
    slot1data = { name: '2021 World Series' };
    slot2data = { title: 'Houston Astros' };
    defaultdata = { title: 'Atlanta Braves' };
}
