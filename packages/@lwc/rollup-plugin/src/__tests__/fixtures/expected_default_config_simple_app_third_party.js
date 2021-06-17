(function (lwc) {
  'use strict';

  function tmpl($api, $cmp, $slotset, $ctx) {
    const {d: api_dynamic, h: api_element} = $api;
    return [api_element("pre", {
      key: 0
    }, [api_dynamic($cmp.isRegex)])];
  }
  var _tmpl = lwc.registerTemplate(tmpl);
  tmpl.stylesheets = [];
  tmpl.stylesheetTokens = {
    hostAttribute: "x-app_app-host",
    shadowAttribute: "x-app_app"
  };

  function isRegexp(value) {
    return Object.prototype.toString.call(value) === '[object RegExp]';
  }

  class App extends lwc.LightningElement {
    constructor(...args) {
      super(...args);
      this.isRegex = isRegexp(/foo/);
    }

  }

  lwc.registerDecorators(App, {
    fields: ["isRegex"]
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
