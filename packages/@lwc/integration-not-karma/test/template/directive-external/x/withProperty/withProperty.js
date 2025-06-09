import { api, LightningElement } from 'lwc';

export default class Test extends LightningElement {
    @api data;

    spread = {
        kyoto: 'kamogawa',
        osaka: 'yodogawa',
        tokyo: 'tamagawa',
    };
}
