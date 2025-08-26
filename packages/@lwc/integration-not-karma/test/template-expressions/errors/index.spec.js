import { createElement } from 'lwc';

import UndefinedMemberExpressionObjParent from 'x/undefinedMemberExpressionObjParent';
import ThrowDuringCallParent from 'x/throwDuringCallParent';

it(`should handle member expression with undefined object`, () => {
    const parent = createElement('x-parent', { is: UndefinedMemberExpressionObjParent });
    document.body.appendChild(parent);
    expect(parent.caughtError).toContain('undefined');
});

it(`should handle errors thrown during call expression`, () => {
    const parent = createElement('x-parent', { is: ThrowDuringCallParent });
    document.body.appendChild(parent);
    expect(parent.caughtError).toContain("I'm the Gingerbread man!");
});
