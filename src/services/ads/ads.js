import { getComponentDef, set } from "raptor";

const CAMEL_REGEX = /-([a-z])/g;

export default function ADS(Ctor: Class<Component>, annotations: Object): Class<Component> {

    const { props } = getComponentDef(Ctor);
    const { mapping } = annotations;
    const keys = Object.getOwnPropertyNames(mapping);
    const channel = create(annotations);
    let handler = null;

    const HOC = class {

        constructor() {
            this.data = null;
        }

        attributeChangedCallback(attrName: string, oldValue: any, newValue: any) {
            if (!handler) {
                handler = channel.connect((data: Object) => {
                    set(this, 'data', data);
                });
            }
            // Any mutation to the HOC component will be propagated to the data layer,
            // which might trigger a rehydration process for the data attribute.
            const propName = attrName.replace(CAMEL_REGEX, (g: string): string => g[1].toUpperCase());
            handler.set(propName, newValue);
        }

        disconnectCallback() {
            channel.disconnect(handler);
        }

        render({v,h}: Object): Object {
            if (this.data) {
                return v(Ctor, {
                    props: this.data
                }, this.body);
            } else {
                return h('div', 'loading...');
            }
        }

    }

    /**
     * The ADS factory can analyze the provided class, and shape the new
     * class based on it, including tagName, props, attrs, methods, etc.
     */
    const templateUsedProps = ['data'];
    // TODO: add maybe `dataset` identifier if pass-thru dataset is needed
    if (props.body) {
        templateUsedProps.push('body');
    }

    // Any identifier used during the rendering process
    HOC.templateUsedProps = templateUsedProps;
    // reusing the tagName of the underlaying component
    HOC.tagName = Ctor.tagName;
    // a new set of public props of the HOC can be inferred from the annotations
    HOC.publicProps = keys.reduce((props: HashTable<any>, propName: string): HashTable<any> => {
        props[propName] = null;
        return props;
    }, {});
    // TODO: methods are not piped for now, do we really need them?
    HOC.publicMethods = [];
    // attributes to be piped down to the data layer
    // TODO: keys are props, not attribute names, how should we convert them?
    HOC.observedAttributes = keys;
    return HOC;
}

ADS.QL = function QL(): Object {
    // fragment on User {
    //     profilePhoto(size: $bar, f: $foo) {
    //       uri,
    //     },
    //   }`
    return {
        // mapping between HOC component properties and the query properties
        mapping: {
            bar: 'size',
            foo: 'f',
        },
        // internally, this can store the actual query and the aggregation mechanism
    };
}

function create(annotations: any): DataStorage {
    const listeners = [];
    if (!annotations) {
        return;
    }
    return {
        connect(callback: (publicProps: Object) => void): DataHandler {
            let x = 1;
            let y = 1;
            const handler = {
                timer: setInterval(() => {
                    x += 1;
                    y *= 2;
                    callback({
                        x,
                        y,
                    });
                }, 2000),
                set() {
                    // TODO: implement
                }
            };
            listeners.push(handler);
            return handler;
        },
        disconnect(handler: DataHandler) {
            const index = listeners.indexOf(handler);
            clearInterval(handler.timer);
            listeners[index] = undefined;
        },
    };
}
