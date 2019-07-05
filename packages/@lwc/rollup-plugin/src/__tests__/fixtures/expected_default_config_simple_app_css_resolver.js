(function(lwc, varResolver) {
    'use strict';

   varResolver =
     varResolver && varResolver.hasOwnProperty("default")
       ? varResolver["default"]
       : varResolver;

   function stylesheet(hostSelector, shadowSelector, nativeShadow) {
     return (
       "\n" +
       (nativeShadow
         ? ":host {color: " + varResolver("--lwc-my-color") + ";}"
         : hostSelector + " {color: " + varResolver("--lwc-my-color") + ";}") +
       "\n"
     );
   }
   var _implicitStylesheets = [stylesheet];

    function tmpl($api, $cmp, $slotset, $ctx) {
      const {
        d: api_dynamic,
        h: api_element
      } = $api;
      return [api_element("div", {
        key: 0
      }, [api_dynamic($cmp.x)])];
    }

    var _tmpl = lwc.registerTemplate(tmpl);
    tmpl.stylesheets = [];

    if (_implicitStylesheets) {
        tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
    }
    tmpl.stylesheetTokens = {
        hostAttribute: "x-foo_foo-host",
        shadowAttribute: "x-foo_foo"
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

    var _xFoo = lwc.registerComponent(Foo, {
      tmpl: _tmpl
    });

    function tmpl$1($api, $cmp, $slotset, $ctx) {
      const {
        c: api_custom_element,
        h: api_element
      } = $api;
      return [api_element("div", {
        classMap: {
          "container": true
        },
        key: 1
      }, [api_custom_element("x-foo", _xFoo, {
        props: {
          "x": "1"
        },
        key: 0
      }, [])])];
    }

    var _tmpl$1 = lwc.registerTemplate(tmpl$1);
    tmpl$1.stylesheets = [];
    tmpl$1.stylesheetTokens = {
        hostAttribute: "x-app_app-host",
        shadowAttribute: "x-app_app"
    };

    class App extends lwc.LightningElement {
      constructor() {
        super();
        this.list = [];
      }

    }

    var App$1 = lwc.registerComponent(App, {
      tmpl: _tmpl$1
    });

    const container = document.getElementById('main');
    const element = lwc.createElement('x-app', {
      is: App$1
    });
    container.appendChild(element);

 })(LWC, resolveCss);
