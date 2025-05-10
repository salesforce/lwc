import { grandparentContextFactory } from 'x/grandparentContext';
import { LightningElement } from 'lwc';

export default class TooMuchContext extends LightningElement {
    context = grandparentContextFactory('grandparent provided value');
    tooMuch = grandparentContextFactory('this world is not big enough for me');
}
