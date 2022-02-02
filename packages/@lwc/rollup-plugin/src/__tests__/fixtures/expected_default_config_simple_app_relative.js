(function (lwc) {
    'use strict';

    function stylesheet(token, useActualHostSelector, useNativeDirPseudoclass) {
      var hostSelector = token ? ("[" + token + "-host]") : "";
      return (useActualHostSelector ? ":host {color: var(--lwc-my-color);}" : [hostSelector, " {color: var(--lwc-my-color);}"].join(''));
    }
    var _implicitStylesheets = [stylesheet];

    const stc0$1 = {
      key: 0
    };
    function tmpl$1($api, $cmp, $slotset, $ctx) {
      const {d: api_dynamic_text, t: api_text, h: api_element} = $api;
      return [api_element("div", stc0$1, [api_text(api_dynamic_text($cmp.x))])];
    }
    var _tmpl$1 = lwc.registerTemplate(tmpl$1);
    tmpl$1.stylesheets = [];


    if (_implicitStylesheets) {
      tmpl$1.stylesheets.push.apply(tmpl$1.stylesheets, _implicitStylesheets);
    }
    tmpl$1.stylesheetToken = "x-foo_foo";

    class Foo extends lwc.LightningElement {
      constructor(...args) {
        super(...args);
        this.x = void 0;
      }

    }

    lwc.registerDecorators(Foo, {
      publicProps: {
        x: {
          config: 0
        }
      }
    });

    var _xFoo = lwc.registerComponent(Foo, {
      tmpl: _tmpl$1
    });

    const stc0 = {
      classMap: {
        "container": true
      },
      key: 0
    };
    const stc1 = {
      props: {
        "x": "1"
      },
      key: 1
    };
    const stc2 = [];
    function tmpl($api, $cmp, $slotset, $ctx) {
      const {c: api_custom_element, h: api_element} = $api;
      return [api_element("div", stc0, [api_custom_element("x-foo", _xFoo, stc1, stc2)])];
    }
    var _tmpl = lwc.registerTemplate(tmpl);
    tmpl.stylesheets = [];
    tmpl.stylesheetToken = "x-app_app";

    class App extends lwc.LightningElement {
      constructor() {
        super();
        this.list = [];
      }

    }

    var App$1 = lwc.registerComponent(App, {
      tmpl: _tmpl
    });

    const container = document.getElementById('main');
    const element = lwc.createElement('x-app', {
      is: App$1
    });
    container.appendChild(element);

})(LWC);
