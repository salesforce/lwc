import { Mosaic, registerDecorators as _registerDecorators } from "lwc";
class Test extends Mosaic {
  constructor(...args) {
    super(...args);
    this.title = void 0;
  }
  render() {
    return {
      definition: "tile/header"
    };
  }
  /*LWC compiler vX.X.X*/
}
_registerDecorators(Test, {
  publicProps: {
    title: {
      config: 0
    }
  }
});
export { Test as default };