import { parentContextFactory, anotherParentContextFactory } from 'c/parentContext';
import Base from 'c/base';

export default class Parent extends Base {
    constructor() {
        super(parentContextFactory(), anotherParentContextFactory());
    }
}
