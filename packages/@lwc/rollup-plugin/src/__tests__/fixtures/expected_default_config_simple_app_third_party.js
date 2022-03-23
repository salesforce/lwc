(function (lwc) {
  'use strict';

  const {d: api_dynamic_text, t: api_text, h: api_element} = lwc.renderApi;
  const stc0 = {
    key: 0
  };
  function tmpl($api, $cmp, $slotset, $ctx) {
    return [api_element("pre", stc0, [api_text(api_dynamic_text($cmp.hello))])];
    /*LWC compiler vX.X.X*/
  }
  var _tmpl = lwc.registerTemplate(tmpl);
  tmpl.stylesheets = [];

  function fake() {
    return 'woo hoo';
  }

  class App extends lwc.LightningElement {
    constructor(...args) {
      super(...args);
      this.hello = fake();
    }
    /*LWC compiler vX.X.X*/


  }

  lwc.registerDecorators(App, {
    fields: ["hello"]
  });

  var App$1 = lwc.registerComponent(App, {
    tmpl: _tmpl
  });

  const container = document.getElementById('main');
  const element = lwc.createElement('x-app', {
    is: App$1
  });
  container.appendChild(element);

})(LWC);
