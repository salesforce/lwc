import { LightningElement } from 'lwc';
import { computed } from "@preact/signals-core";
import { pos, sumOfXAndY } from "x/mousePosition";

export default class Home extends LightningElement {
    renderedCallback() {
        console.log('rendered: [Home]');
    }
}