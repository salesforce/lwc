import _tmpl from './actual.html';
import { Element } from 'engine';

class Test1 extends Element {}

export default class Test2 extends Element {
  render() {
    return _tmpl;
  }

}
