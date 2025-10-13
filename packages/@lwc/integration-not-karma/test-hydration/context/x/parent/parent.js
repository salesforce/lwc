import { api } from 'lwc';
import { parentContextFactory, anotherParentContextFactory } from 'x/parentContext';
import Base from 'x/base';

export default class Parent extends Base {
    @api anotherContext = anotherParentContextFactory();

    constructor() {
        super(parentContextFactory());
    }
}
