// Per-file compiler config, used in configs/plugins/serve-integration.js
/*!WTR {"apiVersion": 66}*/
import { createElement } from 'lwc';

import Test from 'c/test';
import { API_VERSION } from '../../../helpers/options';

const cteEnabled = API_VERSION >= 66;

it.runIf(cteEnabled)(`should support call expressions`, () => {
    const elm = createElement('c-test', { is: Test });
    document.body.appendChild(elm);

    expect(elm.shadowRoot.querySelector('div').getAttribute('foo')).toBe('bar');
});
