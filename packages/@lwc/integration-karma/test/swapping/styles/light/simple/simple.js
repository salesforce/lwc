import { LightningElement } from 'lwc';
import block from './simple.scoped.css';
import inline from './inline.scoped.css';
import none from './none.scoped.css';

export default class Simple extends LightningElement {
    static renderMode = 'light';
    static blockStyle = block;
    static inlineStyle = inline;
    static noneStyle = none;
}
