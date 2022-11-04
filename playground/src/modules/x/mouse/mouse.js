import { LightningElement } from 'lwc';
import { computed } from "@preact/signals-core";
import { pos, sumOfXAndY } from "x/mousePosition";

export default class Mouse extends LightningElement {
    sumOfXAndY = sumOfXAndY;
    prettyPrint = computed(() => {
        return JSON.stringify(pos.value);
    });

    renderedCallback() {
        console.log('rendered: [Mouse]');
    }
}