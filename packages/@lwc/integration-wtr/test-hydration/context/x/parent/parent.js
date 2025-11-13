import { parentContextFactory, anotherParentContextFactory } from 'x/parentContext';
import Base from 'x/base';

export default class Parent extends Base {
    constructor() {
        super(parentContextFactory(), anotherParentContextFactory());
    }
}
