import { wire } from 'lwc';
import wireAdapter from 'x/wireAdapter';

import Base from './base';

export default class WireMethodsInheritance extends Base {
    @wire(wireAdapter, { child: true }) childMethod() {}
    @wire(wireAdapter, { child: true }) overriddenInChild() {}
}
