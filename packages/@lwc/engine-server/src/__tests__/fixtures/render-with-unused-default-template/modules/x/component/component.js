import { LightningElement } from 'lwc'
import tmpl from './tmpl.html'

export default class extends LightningElement {
    hello = 'foobar'

    render () {
        return tmpl
    }
}
