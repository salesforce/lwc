import { api } from 'lwc';
import Base from './base';

export default class PublicPropertiesInheritance extends Base {
    @api childProp;
    @api overriddenInChild;
}
