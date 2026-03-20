import { api, Mosaic } from "lwc";
export default class Test extends Mosaic {
    @api title;
    render() {
        return { definition: "tile/header" };
    }
}
