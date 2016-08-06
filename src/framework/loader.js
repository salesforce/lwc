const registry = {};

function loaderEvaluate(moduleStatus) {
    let exports;
    moduleStatus.ns = Promise.all(moduleStatus.deps.map((name) => name === 'exports' ? Promise.resolve((exports = {})) : loaderEvaluate(name)))
        .then((resolvedNamespaces) => {
            let returnedValue = moduleStatus.definition(resolvedNamespaces);
            return exports || returnedValue;
        });
}

function loaderLoadAndEvaluate(name) {
    return Promise.reject(new TypeError(`Bundle ${name} does not exists in the registry.`));
}

function loaderImportMethod(name) {
    if (!name) {
        return Promise.reject(new TypeError(`loader.import()'s name is required to be a non-empty string value.`));
    }
    let moduleStatus = registry[name];
    if (!moduleStatus) {
        loaderLoadAndEvaluate(name);
    }
    if (!moduleStatus.ns) {
        loaderEvaluate(moduleStatus);
    }
    return moduleStatus.ns;
}

function amdDefineMethod(name, deps, definition) {
    if (!definition) {
        amdDefineMethod(name, [], deps);
        return;
    }
    if (typeof name !== 'string') {
        throw new TypeError('Invalid AMD define() call.');
    }
    if (registry[name]) {
        console.warn(`Duplicated AMD entry ignored for name=${name}`);
    }
    registry[name] = {
        deps,
        definition,
        ns: undefined,
    };
}

export {loaderImportMethod};

// exposing the registry hook to add new bundles
window.define = amdDefineMethod;
