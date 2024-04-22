import { LightningElement } from 'lwc';
import block from './simple.css';
import inline from './inline.css';
import none from './none.css';

export default class Simple extends LightningElement {
    static renderMode = 'light';
    static blockStyle = block;
    static inlineStyle = inline;
    static noneStyle = none;
}
