import {createElement, wire} from "lwc";

export default class {
  @wire(createElement) wiredProp;
  foo;
};
