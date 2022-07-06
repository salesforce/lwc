# Ephemeral Notes

**NOTE: This doc will be deleted before merging and only serves as a temporary location for feedback.**

- **Why not use the `EventTarget` implementation in Node v14+?** The Node implementation leaves out support for event propagation through a hierarchy of `EventTarget`s. This is the exact behavior that is required to support LWR use cases; much of the rest of the `EventTarget` interface is superfluous.
- **What version of Node is required?** Node >= 16
- **Why redefine types in `engine-server` that are implicit DOM types (see `lib.dom.d.ts`)?** Unfortunately, it is not permitted to import specific types explicity. Typescript assumes that if you want one DOM type, you are in a browser and will want _all_ DOM types to be implicityly available globally. That may lead to confusion in the future when browser-only types are available in Node-only code. The best alternative is to copy the types we need into `engine-server`.
- **Which DOM event phases will be supported?** At present, there does not appear to be a use case for supporting the `capture` or `target` phases. As such, server-side DOM-like events will only support the `bubble` phase of event propagation.
- **Is `Event#preventDefault` handled in any way?** No. Firstly, we're not providing an actual `Event` type - that's up to consumers. Secondly, there is no default behavior to prevent, so this isn't a consideration in the SSR context.

