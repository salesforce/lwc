import FancyElement from 'x/fancyElement'
import sub from './sub.html'

export default class extends FancyElement {
    hello = 'foobar'

    render() {
        return sub
    }
}
