/* @flow */

const registry = {};

function loaderEvaluate(moduleStatus: Object): Promise {
    let exports: Object;
    moduleStatus.ns = Promise.all(moduleStatus.deps.map((name: string): Array<Promise> => name === 'exports' ? Promise.resolve((exports = {})) : loaderEvaluate(name)))
        .then((resolvedNamespaces: Array<Object>): Promise => {
            let returnedValue = moduleStatus.definition(resolvedNamespaces);
            return exports || returnedValue;
        });
    return moduleStatus.ns;
}

function loaderLoadAndEvaluate(name: string): Promise {
    return Promise.reject(new TypeError(`Bundle ${name} does not exists in the registry.`));
}

function loaderImportMethod(name: string): Promise {
    if (!name) {
        return Promise.reject(new TypeError(`loader.import()'s name is required to be a non-empty string value.`));
    }
    let moduleStatus = registry[name];
    if (!moduleStatus) {
        return loaderLoadAndEvaluate(name);
    }
    if (!moduleStatus.ns) {
        return loaderEvaluate(moduleStatus);
    }
    return moduleStatus.ns;
}

function amdDefineMethod(name: string, deps: any, definition?: any) {
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
