export default function computedFrom(...propNames) {
    return function decorator(target, key, descriptor) {
        // for now, we need to use the runtime to inspect each computed property
        // and keep track of it so we can use this
        // information later on to trigger a re-render process.
        if (!descriptor.get) {
            throw new Error(`Invalid target ${key} for computedFrom() decorator, it only accepts getters.`);
        }
        descriptor.get.dependencies = propNames;
        return descriptor;
    }
}
