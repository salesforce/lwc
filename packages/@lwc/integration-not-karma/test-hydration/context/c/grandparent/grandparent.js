import { api } from 'lwc';
import Base from 'c/base';
import { grandparentContextFactory, anotherGrandparentContextFactory } from 'c/grandparentContext';

export default class Grandparent extends Base {
    @api anotherContext = anotherGrandparentContextFactory('another grandparent provided value');

    constructor() {
        super(grandparentContextFactory('grandparent provided value'));
    }
}
