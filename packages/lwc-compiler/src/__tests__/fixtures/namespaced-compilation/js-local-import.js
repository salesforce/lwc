import { LightningElement } from 'lwc';
import { method } from 'c/utils';

export default class App extends LightningElement {
    get myname() {
        return 'my name comes from utils ' + method('App');
    }
}
