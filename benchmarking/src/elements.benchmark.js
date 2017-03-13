import * as Raptor from 'raptor-engine';
import { benchmark } from 'runner';

import SimpleElement from 'benchmark:simple-element';
import NestedElement from 'benchmark:nested-element';

let element;

benchmark({
    name: 'element/create/simple',
    description: 'Create and render a component with simple element structure',
    run(cb) {
        element = Raptor.createElement(SimpleElement.tagName, { is: SimpleElement });
        document.body.appendChild(element);
        return Promise.resolve().then(cb);
    },
    after(cb) {
        element.parentElement.removeChild(element);
        setTimeout(cb, 0);
    }
});

benchmark({
    name: 'element/create/nested',
    description: 'Create and render a component with a nested element structure',
    run(cb) {
        element = Raptor.createElement(NestedElement.tagName, { is: NestedElement });
        document.body.appendChild(element);
        return Promise.resolve().then(cb);
    },
    after(cb) {
        element.parentElement.removeChild(element);
        setTimeout(cb, 0);
    }
});
