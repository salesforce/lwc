// Per-file compiler config, used in configs/plugins/serve-integration.js
/*!WTR {"apiVersion": 66}*/
import { createElement } from 'lwc';

import UndefinedMemberExpressionObjParent from 'x/undefinedMemberExpressionObjParent';
import ThrowDuringCallParent from 'x/throwDuringCallParent';
import { API_VERSION } from '../../../helpers/options';

const cteEnabled = API_VERSION >= 66;

it.runIf(cteEnabled)(`should handle member expression with undefined object`, () => {
    const parent = createElement('x-parent', { is: UndefinedMemberExpressionObjParent });
    document.body.appendChild(parent);
    expect(parent.caughtError).toContain('undefined');
});

it.runIf(cteEnabled)(`should handle errors thrown during call expression`, () => {
    const parent = createElement('x-parent', { is: ThrowDuringCallParent });
    document.body.appendChild(parent);
    expect(parent.caughtError).toContain("I'm the Gingerbread man!");
});
