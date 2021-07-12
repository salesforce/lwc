(function (lwc) {
    'use strict';

    function stylesheet(hostSelector, shadowSelector, nativeShadow) {
      return (nativeShadow ? ":host {color: var(--lwc-my-color);}" : [hostSelector, " {color: var(--lwc-my-color);}"].join(''));
    }
    var _implicitStylesheets = [stylesheet];

    function tmpl$1($api, $cmp, $slotset, $ctx) {
      const {d: api_dynamic_text, t: api_text, h: api_element} = $api;
      return [api_element("div", {
        key: 0
      }, [api_text(api_dynamic_text($cmp.x))])];
    }
    var _tmpl$1 = lwc.registerTemplate(tmpl$1);
    tmpl$1.stylesheets = [];


    if (_implicitStylesheets) {
      tmpl$1.stylesheets.push.apply(tmpl$1.stylesheets, _implicitStylesheets);
    }
    tmpl$1.stylesheetTokens = {
      hostAttribute: "ts-foo_foo-host",
      shadowAttribute: "ts-foo_foo"
    };

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

    var _tsFoo = lwc.registerComponent(Foo, {
      tmpl: _tmpl$1
    });

    function tmpl($api, $cmp, $slotset, $ctx) {
      const {c: api_custom_element, h: api_element} = $api;
      return [api_element("div", {
        classMap: {
          "container": true
        },
        key: 0
      }, [api_custom_element("ts-foo", _tsFoo, {
        props: {
          "x": "1"
        },
        key: 1
      }, [])])];
    }
    var _tmpl = lwc.registerTemplate(tmpl);
    tmpl.stylesheets = [];
    tmpl.stylesheetTokens = {
      hostAttribute: "ts-app_app-host",
      shadowAttribute: "ts-app_app"
    };

    class App extends lwc.LightningElement {
      constructor() {
        super();
      }

    }

    var App$1 = lwc.registerComponent(App, {
      tmpl: _tmpl
    });

    function doNothing() {
      return;
    }

    // @ts-ignore
    const container = document.getElementById('main');
    const element = lwc.createElement('ts-app', {
      is: App$1
    });
    container.appendChild(element); // testing relative import works

    console.log('>>', doNothing());

}(LWC));
