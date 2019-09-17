(function (lwc) {
    'use strict';

    function stylesheet(hostSelector, shadowSelector, nativeShadow) {
      return "\n" + (nativeShadow ? (":host {color: var(--lwc-my-color);}") : (hostSelector + " {color: var(--lwc-my-color);}")) + "\n";
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

    var _xFoo = lwc.registerTemplate(tmpl);
    tmpl.stylesheets = [];

    if (_implicitStylesheets) {
      tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
    }
    tmpl.stylesheetTokens = {
      hostAttribute: "undefined-undefined_foo-host",
      shadowAttribute: "undefined-undefined_foo"
    };

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

    var App = lwc.registerTemplate(tmpl$1);
    tmpl$1.stylesheets = [];
    tmpl$1.stylesheetTokens = {
      hostAttribute: "undefined-undefined_app-host",
      shadowAttribute: "undefined-undefined_app"
    };

    // @ts-ignore
    const container = document.getElementById('main');
    const element = lwc.createElement('x-app', {
      is: App
    });
    container.appendChild(element); // testing relative import works

}(LWC));
