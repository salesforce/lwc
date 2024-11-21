import FancyElement from 'x/fancyElement'
import {FancyMixin} from 'x/fancyMixin'

const FancyMixedInElement = FancyMixin(FancyElement, 'mixin')

export default class extends FancyMixedInElement {
    cmp = 'hello'
}
