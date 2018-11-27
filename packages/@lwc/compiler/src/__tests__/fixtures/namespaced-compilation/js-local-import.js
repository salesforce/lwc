import { LightningElement } from 'lwc';
import { log } from 'c/utils';
import { method } from './utils';

export default class App extends LightningElement {
    get myname() {
        log(method('App'));
        return 'my name comes from utils ' + method('App');
    }
}
