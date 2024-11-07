import { LightningElement, api } from "lwc";

export default class extends LightningElement {
  // Intentionally using the HTML global attribute names disabled/title/spellcheck here
  @api disabled // array
  @api title // object
  @api spellcheck // deep

  result

  connectedCallback() {
    const results = []
    
    try {
      this.disabled.push('bar')
    } catch (err) {
      results.push('array(disabled): error hit during mutation')
    }

    try {
      this.title.foo = 'baz'
    } catch (err) {
      results.push('object(title): error hit during mutation')
    }
    
    try {
      this.spellcheck.foo[0].quux = 'quux'
    } catch (err) {
      results.push('deep(spellcheck): error hit during mutation')
    }

    try {
      delete this.title.foo
    } catch (err) {
      results.push('object(title): error hit during deletion')
    }

    this.result = '\n' + results.join('\n')
  }
}
