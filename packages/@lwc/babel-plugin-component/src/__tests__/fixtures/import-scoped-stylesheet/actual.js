import { LightningElement } from 'lwc';
import notScoped from './stylesheet.css';
import scoped from './stylesheet.scoped.css';

export default class extends LightningElement {
  static stylesheets = [notScoped, scoped];
}
