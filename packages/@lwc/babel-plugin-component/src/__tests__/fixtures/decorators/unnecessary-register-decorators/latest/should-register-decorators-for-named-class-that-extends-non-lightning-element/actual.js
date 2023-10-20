import { api } from "lwc";
import MyCoolMixin from './mixin.js'

export default class MyElement extends MyCoolMixin {
  @api
  foo;
}
