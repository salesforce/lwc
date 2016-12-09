import {
    getComponentDef,
} from "raptor";

function parseAnnotations(annotations: any): Object {
    // TODO: do the real parsing and/or validation somehow...
    return {
        attributes: annotations.attributes,
    };
}

export default function ADS(Ctor: Object, annotations: Object): Class {

    const { attributes: childAttributes } = getComponentDef(Ctor);
    const { attributes: proxyAttributes } = annotations;
    const channel = create(annotations);
    let handler = null;

    const proxyCtor = class ADS {

        constructor() {
            this.data = null;
        }

        updated() {
            if (!handler) {
                handler = channel.connect((data: Object) => {
                    this.data = data;
                });
            }
            handler.set(this);
        }

        dettach() {
            channel.disconnect(handler);
        }

        render({v,t}: Object): Object {
            if (this.data) {
                return v(Ctor, this.data, this.body);
            } else {
                return t('still loading...');
            }
        }

    }

    for (let attrName in childAttributes) {
        const { isRequired, initializer } = childAttributes[attrName];
        if (isRequired) {
            // TODO: validate that attrName is fulfilled by annotations
        }
        if (initializer) {
            // TODO: if ads needs the default value for each child attribute,
            // initializer can be reused for the following block
        }
    }

    for (let attrName in proxyAttributes) {
        const config = proxyAttributes[attrName];
        const attributeDecorator = attribute(Object.assign(config));
        const target = proxyCtor.prototype;
        Object.defineProperty(target, attrName, attributeDecorator(target, attrName, config));
    }

    // allow body attribute only if the underlaying Ctor allows it
    const { body } = childAttributes;
    if (body) {
        const attributeDecorator = attribute(Object.assign(body));
        attributeDecorator(proxyCtor, 'body', {
            initializer: body.initializer,
        });
    }

    return proxyCtor;
}

ADS.QL = function QL(): Object {
    const defaultValueForX = 1;
    return {
        // attributes are things that the query expects to be provided
        attributes: {
            x: {
                initializer: (): any => defaultValueForX,
            },
            y: {},
        },
        // internally, this can store the actual query and the aggregation mechanism
    };
}

function create(annotations) {
    const listeners = [];

    return {
        connect(callback) {
            const handler = {
                timer: setInterval(() => {
                    callback({
                        foo: 1,
                        bar: 2,
                    });
                }, 2000),
                set(props) {
                    // TODO: implement
                }
            };
            listeners.push(handler);
            return handler;
        },
        disconnect(handler: any) {
            const index = listeners.indexOf(handler);
            clearInterval(handler.timer);
            listeners[index] = undefined;
        },
    };
}
