(function (lwc) {
  'use strict';

  function tmpl($api, $cmp, $slotset, $ctx) {
    const {d: api_dynamic_text, t: api_text, h: api_element} = $api;
    return [api_element("pre", {
      key: 0
    }, [api_text(api_dynamic_text($cmp.hello))])];
  }
  var _tmpl = lwc.registerTemplate(tmpl);
  tmpl.stylesheets = [];
  tmpl.stylesheetTokens = {
    hostAttribute: "x-app_app-host",
    shadowAttribute: "x-app_app"
  };

  function fake() {
    return 'woo hoo';
  }

  class App extends lwc.LightningElement {
    constructor(...args) {
      super(...args);
      this.hello = fake();
    }

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

}(LWC));
