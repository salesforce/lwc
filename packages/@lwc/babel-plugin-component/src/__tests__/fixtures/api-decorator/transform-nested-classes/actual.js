import { api } from "lwc";
export default class Outer {
  @api outer;
  a = class {
    @api innerA;
  };
}
