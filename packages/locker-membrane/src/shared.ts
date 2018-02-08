const { isArray } = Array;

const {
    getPrototypeOf,
} = Object;



const {
    push: ArrayPush,
    concat: ArrayConcat,
    map: ArrayMap,
} = Array.prototype;

export {
    ArrayPush,
    ArrayConcat,
    ArrayMap,
    isArray,
};

const ObjectDotPrototype = Object.prototype;

const OtS = {}.toString;
export function toString(obj: any): string {
    if (obj && obj.toString) {
        return obj.toString();
    } else if (typeof obj === 'object') {
        return OtS.call(obj);
    } else {
        return obj + '';
    }
}

export function isUndefined(obj: any): obj is undefined {
    return obj === undefined;
}

export const TargetSlot = Symbol();

// TODO: we are using a funky and leaky abstraction here to try to identify if
// the proxy is a compat proxy, and define the unwrap method accordingly.
// @ts-ignore
const { getKey } = Proxy;

export const unwrap = getKey ?
    (replicaOrAny: any): any => (replicaOrAny && getKey(replicaOrAny, TargetSlot)) || replicaOrAny
    : (replicaOrAny: any): any => (replicaOrAny && replicaOrAny[TargetSlot]) || replicaOrAny;


export function isObservable(value: any): boolean {
    if (!value) {
        return false;
    }
    if (isArray(value)) {
        return true;
    }
    if (isFunction(value)) {
        return true;
    }

    const proto = getPrototypeOf(value);
    return (proto === ObjectDotPrototype || proto === null || getPrototypeOf(proto) === null);
}

export function isObject(obj: any): obj is object {
    return typeof obj === 'object';
}

export function isFunction(obj: any): obj is Function {
    return typeof obj === 'function';
}

export function logWarning(msg: string) {
    try {
        throw new Error(msg);
    } catch (e) {
        const stackTraceLines: string[] = e.stack.split('\n');
        console.group(`Warning: ${msg}`); // tslint:disable-line
        stackTraceLines.filter((trace) => {
             // Chrome adds the error message as the first item in the stack trace
             // So we filter it out to prevent logging it twice.
            return trace.replace('Error: ', '') !== msg;
        })
        .forEach((trace) => {
            // We need to format this as a string,
            // because Safari will detect that the string
            // is a stack trace line item and will format it as so
            console.log('%s', trace.trim()); // tslint:disable-line
        });
        console.groupEnd(); // tslint:disable-line
    }
}

export function isNull(obj: any): obj is null {
    return obj === null;
}