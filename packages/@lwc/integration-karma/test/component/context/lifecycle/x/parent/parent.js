import { parentContextFactory, anotherParentContextFactory } from 'x/parentContext';
import Base from 'x/base';
import { api } from 'lwc';

export default class ContextParent extends Base {
    @api context = parentContextFactory('parent provided value');
    @api anotherContext = anotherParentContextFactory('another parent provided value');
}
