import { wire, Mosaic } from "lwc";
import { getFoo } from "data-service";
export default class Test extends Mosaic {
    @wire(getFoo)
    data;
    render() {
        return { definition: "tile/header" };
    }
}
