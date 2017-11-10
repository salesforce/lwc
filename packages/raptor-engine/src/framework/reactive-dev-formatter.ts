import { TargetSlot } from './membrane';
const { create, getPrototypeOf, getOwnPropertyNames, getOwnPropertySymbols } = Object;
const { isArray } = Array;
/* eslint-disable */
type DevToolFormatter = {
    header: (object: any, config: any) => any;
    hasBody: (object: any, config: any) => boolean | null;
    body: (object: any, config: any) => any;
}

interface DevWindow extends Window {
    devtoolsFormatters: Array<DevToolFormatter>
}
/* eslint-enable */

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
        })
    }

    const obj = create(getPrototypeOf(objectOrArray))

    return getOwnPropertyNames(objectOrArray).concat(getOwnPropertySymbols(objectOrArray))
        .reduce((seed: any, key: string | symbol) => {
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
    // Custom Formatter for Dev Tools
    // To enable this, open Chrome Dev Tools
    // Go to Settings,
    // Under console, select "Enable custom formatters"
    // For more information, https://docs.google.com/document/d/1FTascZXT9cxfetuPRT2eXPQKXui4nWFivUnS_335T3U/preview
    const devWindow = (<DevWindow>window); // eslint-disable-line no-undef
    const devtoolsFormatters = devWindow.devtoolsFormatters || [];
    devtoolsFormatters.push(formatter);
    devWindow.devtoolsFormatters = devtoolsFormatters; // eslint-disable-line no-undef
}