// // @flow
//
// import {
//     getContext,
//     establishContext,
//     currentContext,
// } from "./context.js";
//
// import {
//     opaqueToComponentMap,
// } from "./createElement.js";
//
// import {
//     mountChildComponent,
// } from "./mounter.js";
//
// import {
//     dismountComponent,
// } from "./dismounter.js";
//
// import * as api from "./api.js";
//
// function attemptToUpdate(component: Object) {
//     const {isMounted, isDirty} = getContext(component);
//     if (isMounted && isDirty) {
//         renderComponent(component);
//     }
// }
//
// function invokeComponentRenderMethod(component: Object): any {
//     if (!component.render) {
//         return null;
//     }
//     const outerContext = currentContext;
//     const ctx = getContext(component);
//     establishContext(ctx);
//     const element = component.render(api);
//     establishContext(outerContext);
//     return element;
// }
//
// export function renderComponent(component: Object) {
//     const ctx = getContext(component);
//     ctx.isRendering = true;
//     let opaque = invokeComponentRenderMethod(component);
//     ctx.isRendering = false;
//     ctx.isRendered = true;
//     if (opaque === undefined) {
//         // assert ctx.isDirty === false
//         return; // rehydration
//     }
//     if (opaque === null) {
//         dockChildComponent(component, null);
//     } else if (opaqueToComponentMap.has(opaque)) {
//         const newChildComponent = opaqueToComponentMap.get(opaque);
//         dockChildComponent(component, newChildComponent);
//     } else {
//         throw new Error(`Invariant Violation: ${ctx.name}.render(): A valid Component element (or null) must be returned. You have returned ${opaque} instead.`);
//     }
// }
//
// function dockChildComponent(component: Object, newChildComponent: Object) {
//     const ctx = getContext(component);
//     const {childComponent} = ctx;
//     if (childComponent !== newChildComponent) {
//         ctx.childComponent = newChildComponent;
//         if (ctx.isMounted) {
//             if (childComponent) {
//                 dismountComponent(childComponent);
//             }
//             mountChildComponent(component, newChildComponent);
//         }
//     }
// }
//
// export function markComponentAsDirty(component: Object, propName: string) {
//     const ctx = getContext(component);
//     if (ctx.isRendering) {
//         throw new Error(`Invariant Violation: ${ctx.name}.render() method has side effects on the state of the component.`);
//     }
//     ctx.isDirty = true;
//     ctx.dirtyPropNames[propName] = true;
//     // TODO: this promise might need to be controlled so we only render once in the next tick
//     // maybe storing the promise into the component's context
//     Promise.resolve(component).then(attemptToUpdate);
// }
