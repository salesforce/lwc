import { wire } from 'lwc';
import wireAdapter from 'x/wireAdapter';

import Base from './base';

export default class WirePropertiesInheritance extends Base {
    @wire(wireAdapter, { child: true }) childProp;
    @wire(wireAdapter, { child: true }) overriddenInChild;
}
