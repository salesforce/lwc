import * as Main from "./main.js";

const registry = {
    raptor: {
        get ns(): Promise<any> {
            return Promise.resolve(Main);
        }
    }
};

function loaderEvaluate(moduleStatus: Object): Promise<Namespace> {
    let exports: Object;
    moduleStatus.ns = Promise.all(moduleStatus.deps.map((name: string): Promise<Array<any>> => name === 'exports' ? Promise.resolve((exports = {})) : loaderImportMethod(name)))
        .then((resolvedNamespaces: Array<Object>): Promise => {
            let returnedValue = moduleStatus.definition.apply(undefined, resolvedNamespaces);
            return exports || returnedValue;
        });
    return moduleStatus.ns;
}

function loaderLoadAndEvaluate(name: string): Promise {
    return Promise.reject(new TypeError(`Bundle ${name} does not exist in the registry.`));
}

function loaderImportMethod(name: string): Promise {
    if (!name) {
        return Promise.reject(new TypeError(`loader.import()'s name is required to be a non-empty string value.`));
    }
    name = name.toLowerCase();
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
    name = name.toLowerCase();
    if (registry[name]) {
        console.warn(`Duplicated AMD entry ignored for name=${name}`);
    }
    registry[name] = {
        deps,
        definition,
        ns: undefined,
    };
}

export {
    loaderImportMethod,
    amdDefineMethod,
};
