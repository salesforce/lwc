import {
    markComponentAsDirty,
} from "./rendering.js";

export class AuraComponent {
    constructor() {}
    set(name, value) {
        let prevValue = this[name];
        this[name] = value;
        // intentionally checking after the value was set to allow custom setters
        if (this[name] !== prevValue) {
            markComponentAsDirty(this, name);
        }
    }
    get(name) {
        return this[name];
    }
    render() {}
}
