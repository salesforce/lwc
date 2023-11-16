import { api } from "lwc";
import MyCoolMixin from './mixin.js'

const foo = class extends MyCoolMixin {
  @api
  foo;
};
export default foo;
