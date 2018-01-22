import { Element } from "engine";
import data from "./hardcoded-data";

export default class TreeContainer extends Element {
    @track
    myData = data;

    toggleAll() {}
}
