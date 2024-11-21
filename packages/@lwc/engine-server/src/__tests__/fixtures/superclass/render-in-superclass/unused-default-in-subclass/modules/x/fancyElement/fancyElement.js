import { LightningElement } from 'lwc';
import tmpl from './tmpl.html'

export default class extends LightningElement {
    hello = 'yolo'
    render() {
        return tmpl
    }
}
