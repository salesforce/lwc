import { LightningElement } from 'lwc';
import { FancyMixin } from 'x/mixinSuperclass';
import { NotDefault } from 'x/notLwcClass';
import Superless from 'x/superless';

export default class extends FancyMixin(LightningElement) {
    something = new NotDefault().prop;
    data = new Superless().method();
}
