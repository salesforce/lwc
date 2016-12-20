import assert from "./assert.js";
import { isRendering, vmBeingRendered } from "./invoker.js";
import { notifyListeners } from "./watcher.js";

// special hook for forcing to render() the component:
//
//      import { set } from "raptor";
//      set(this.foo, "bar", 1); // sets this.foo.bar = 1; and resolves side effects of this assignment
//
export function set(obj: any, propName: string, newValue: any) {
    assert.invariant(!isRendering, `${vmBeingRendered}.render() method has side effects on the property ${propName} of ${obj}. You cannot call set(...) during the render phase.`);
    obj[propName] = newValue;
    assert.block(() => {
        console.log(`set(${obj}, "${propName}", ${newValue}) was invoked.`);
    });
    notifyListeners(obj, propName);
    // TODO: we might want to let them know if the set triggered the rehydration or not somehow
}
