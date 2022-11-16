import { LightningElement } from 'lwc';
import { computed } from "@preact/signals-core";
import { pos } from "x/mousePosition";

export default class Mouse extends LightningElement {
    sumOfXAndY = computed(() => pos.value.x + pos.value.y);;
    prettyPrint = computed(() => {
        return JSON.stringify(pos.value);
    });

    renderedCallback() {
        console.log('rendered: [Mouse]');
    }
}