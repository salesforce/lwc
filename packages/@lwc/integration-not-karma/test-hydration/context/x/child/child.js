import { api } from 'lwc';
import Base from 'x/base';
import { defineContext } from 'x/contextManager';
import { parentContextFactory, anotherParentContextFactory } from 'x/parentContext';

export default class Child extends Base {
    @api anotherContext = defineContext(anotherParentContextFactory)();

    constructor() {
        super(defineContext(parentContextFactory)());
    }
}
