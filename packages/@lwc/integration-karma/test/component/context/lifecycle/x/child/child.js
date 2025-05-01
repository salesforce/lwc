import { api } from 'lwc';
import { childContextFactory, anotherChildContextFactory } from 'x/childContext';
import Base from 'x/base';

export default class Child extends Base {
    @api context = childContextFactory();
    @api anotherContext = anotherChildContextFactory();
}
