import * as t from 'babel-types';

import {
    TEMPLATE_PARAMS,
} from '../shared/constants';

// FIXME: Need proper id generation support
// For now, reset the id at the beginning of each code generation

let id = 0;

export function memorize(expression: t.Expression): t.Expression {
    const memorized = t.memberExpression(
        t.identifier(TEMPLATE_PARAMS.CONTEXT),
        t.identifier(`_m${id++}`),
    );

    const rightExpression = t.assignmentExpression('=', memorized, expression);
    return t.logicalExpression('||', memorized, rightExpression);
}

export function reset() {
    id = 0;
}
