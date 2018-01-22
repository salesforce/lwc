import { Element, track } from "engine";
import data from "./hardcoded-data";

export default class TreeContainer extends Element {
    @track
    myData = data;

    toggleAll() {}
}
