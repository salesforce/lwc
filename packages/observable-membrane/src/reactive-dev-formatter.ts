import {
    TargetSlot,
    ArrayPush,
    ArrayConcat,
    isArray,
    ObjectCreate,
    getPrototypeOf,
    getOwnPropertyNames,
    getOwnPropertySymbols,
} from './shared';

interface DevToolFormatter {
    header: (object: any, config: any) => any;
    hasBody: (object: any, config: any) => boolean | null;
    body: (object: any, config: any) => any;
}

interface DevWindow extends Window {
    devtoolsFormatters: DevToolFormatter[];
}

function getTarget(item: any) {
    return item && item[TargetSlot];
}

function extract(objectOrArray: any): any {
    if (isArray(objectOrArray)) {
        return objectOrArray.map((item) => {
            const original = getTarget(item);
            if (original) {
                return extract(original);
            }
            return item;
        });
    }

    const obj = ObjectCreate(getPrototypeOf(objectOrArray));
    const names = getOwnPropertyNames(objectOrArray);
    return ArrayConcat.call(names, getOwnPropertySymbols(objectOrArray))
        .reduce((seed: any, key: PropertyKey) => {
            const item = objectOrArray[key];
            const original = getTarget(item);
            if (original) {
                seed[key] = extract(original);
            } else {
                seed[key] = item;
            }
            return seed;
        }, obj);
}

const formatter: DevToolFormatter = {
    header: (plainOrProxy) => {
        const originalTarget = plainOrProxy[TargetSlot];
        if (!originalTarget) {
            return null;
        }

        const obj = extract(plainOrProxy);
        return ['object', { object: obj }];
    },
    hasBody: () => {
        return false;
    },
    body: () => {
        return null;
    }
};

export function init() {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    // Custom Formatter for Dev Tools
    // To enable this, open Chrome Dev Tools
    // Go to Settings,
    // Under console, select "Enable custom formatters"
    // For more information, https://docs.google.com/document/d/1FTascZXT9cxfetuPRT2eXPQKXui4nWFivUnS_335T3U/preview
    const devWindow = (window as DevWindow);
    const devtoolsFormatters = devWindow.devtoolsFormatters || [];
    ArrayPush.call(devtoolsFormatters, formatter);
    devWindow.devtoolsFormatters = devtoolsFormatters;
}
