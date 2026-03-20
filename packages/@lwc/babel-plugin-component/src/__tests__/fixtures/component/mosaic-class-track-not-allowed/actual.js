import { track, Mosaic } from "lwc";
export default class Test extends Mosaic {
    @track items = [];
    render() {
        return { definition: "tile/header" };
    }
}
