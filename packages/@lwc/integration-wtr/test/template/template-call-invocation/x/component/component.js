import { LightningElement, api } from 'lwc';
import tmpl from './component.html';

// Observations recorded by the shadowed `call` below. Reset at the start of every render so each
// test observes only its own render. The engine passes `undefined` as the invoked function's `this`
// value, so the function reports through this module-scoped state rather than through `this`.
let renderState = { ownCallInvoked: false, receivedRenderApi: false };

// A component can define an own `call` property on its compiled template function. The default
// invocation path (`template.call(...)`) resolves `call` as a property lookup, so this own value
// shadows `Function.prototype.call` and the engine invokes this function instead — handing it the
// engine-internal render `api` as its second argument. This benign stand-in records that it was
// invoked (and that it received the `api`) and renders a marker so the two code paths are
// distinguishable in the DOM. The intrinsic invocation path (`Reflect.apply`) ignores this own
// property and runs the real template.
tmpl.call = function shadowedCall(_thisArg, renderApi) {
    renderState.ownCallInvoked = true;
    // The presence of a usable render `api` here is exactly what the intrinsic path prevents.
    renderState.receivedRenderApi = typeof renderApi?.h === 'function';
    return [renderApi.h('div', { key: 0 }, [renderApi.t('shadowed')])];
};

export default class extends LightningElement {
    render() {
        renderState = { ownCallInvoked: false, receivedRenderApi: false };
        return tmpl;
    }

    @api get ownCallInvoked() {
        return renderState.ownCallInvoked;
    }

    @api get receivedRenderApi() {
        return renderState.receivedRenderApi;
    }
}
