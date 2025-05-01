import { api } from 'lwc';
import Base from 'x/base';
import { defineContext } from 'test-utils';
import { childContextFactory } from 'x/childContext';

export default class Grandchild extends Base {
    @api context = defineContext(childContextFactory)();
}
