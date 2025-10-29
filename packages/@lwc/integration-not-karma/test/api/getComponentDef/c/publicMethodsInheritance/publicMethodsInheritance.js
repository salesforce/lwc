import { api } from 'lwc';
import Base from './base';

export default class PublicMethodsInheritance extends Base {
    @api childMethod() {}
    @api overriddenInChild() {}
}
