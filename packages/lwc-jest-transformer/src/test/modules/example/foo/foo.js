import { LightningElement, api } from "lwc";
import { echo } from "./lib";

function pause(time) {
    return new Promise((resolve) => (
        setTimeout(resolve, time)
    ));
}

export default class Foo extends LightningElement {
    @api me = "foo";

    get computedClass() {
        if (this.me === "foo") {
            return "fooClass";
        }
        return echo("otherClass");
    }

    @api
    async asyncMethod(val) {
        await pause(10);
        return val;
    }
}
