import { LightningElement } from 'lwc';
import html from './html-local-import.html';

export default class App extends LightningElement {
    get myname () {
        return 'hello';
    }
    render() {
        return html;
    }
}
