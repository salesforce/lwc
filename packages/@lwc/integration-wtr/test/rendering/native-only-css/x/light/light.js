import { LightningElement } from 'lwc';
import chic from './chic.native-only.css';
import glamorous from './glamorous.css';
import hip from './hip.scoped.css';
import snazzy from './snazzy.native-only.scoped.css';

export default class extends LightningElement {
    static renderMode = 'light';
    static stylesheets = [chic, glamorous, hip, snazzy];
}
