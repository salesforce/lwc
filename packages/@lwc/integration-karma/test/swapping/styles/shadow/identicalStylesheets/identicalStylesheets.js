import { LightningElement } from 'lwc';
import style from './style.css';
import identicalStyle from './identicalStylesheets.css';
import newStyle from './newStyle.css';
import implicitTemplate from './identicalStylesheets.html';
import newTemplate from './newTemplate.html';

export default class IdenticalStylesheet extends LightningElement {
    static style = style;
    static identicalStyle = identicalStyle;
    static newStyle = newStyle;
    static implicitTemplate = implicitTemplate;
    static newTemplate = newTemplate;
}
