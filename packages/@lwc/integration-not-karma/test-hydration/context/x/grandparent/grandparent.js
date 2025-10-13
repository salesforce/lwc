import { api } from 'lwc';
import Base from 'x/base';
import { grandparentContextFactory, anotherGrandparentContextFactory } from 'x/grandparentContext';

export default class Grandparent extends Base {
    @api context = grandparentContextFactory('grandparent provided value');
    @api anotherContext = anotherGrandparentContextFactory('another grandparent provided value');
}
