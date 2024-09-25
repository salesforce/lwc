import { LightningElement } from 'lwc';
import glamorous from './glamorous.css'
import snazzy from './snazzy.scoped.css'
import dazzling from './dazzling.html'

export default class extends LightningElement {
  static stylesheets = [glamorous, snazzy]

  render() {
    return dazzling;
  }
}
