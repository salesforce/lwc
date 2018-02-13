import { Element, track } from "engine";
import { mockState } from "./hardcoded-state";

export default class RecordLayout extends Element {
    @track
    state = mockState;
}
