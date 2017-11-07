import { unwrap } from './membrane';
const { assign, setPrototypeOf, getPrototypeOf } = Object;

const ProxySet = new WeakSet<any>();

export function addProxy(proxy: any) {
    ProxySet.add(proxy);
}

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

class ReactiveObject {
    constructor(o: any) {
        assign(this, o);
        setPrototypeOf(this, getPrototypeOf(o));
    }
}

const formatter: DevToolFormatter = {
    header: (plainOrProxy) => {
        if (!ProxySet.has(plainOrProxy)) {
            return null;
        }
        const originalTarget = unwrap(plainOrProxy);
        return ['object', { object: new ReactiveObject(originalTarget) }];
    },
    hasBody: () => {
        return false;
    },
    body: () => {
        return null;
    }
};


// Custom Formatter for Dev Tools
// To enable this, open Chrome Dev Tools
// Go to Settings,
// Under console, select "Enable custom formatters"
// For more information, https://docs.google.com/document/d/1FTascZXT9cxfetuPRT2eXPQKXui4nWFivUnS_335T3U/preview
const devWindow = (<DevWindow>window); // eslint-disable-line no-undef
const devtoolsFormatters = devWindow.devtoolsFormatters || [];
devtoolsFormatters.push(formatter);
devWindow.devtoolsFormatters = devtoolsFormatters; // eslint-disable-line no-undef