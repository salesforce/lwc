import { api } from 'lwc';
import Base from 'c/base';
import { defineContext } from 'c/contextManager';
import { parentContextFactory, anotherParentContextFactory } from 'c/parentContext';

export default class Child extends Base {
    @api anotherContext = defineContext(anotherParentContextFactory)();

    constructor() {
        super(defineContext(parentContextFactory)());
    }
}
