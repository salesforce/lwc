import { LightningElement } from 'lwc';
import glamorous from './glamorous.css'
import snazzy from './snazzy.scoped.css'

export default class extends LightningElement {
  static stylesheets = [glamorous, snazzy]
  clazz = 'yolo'
}
