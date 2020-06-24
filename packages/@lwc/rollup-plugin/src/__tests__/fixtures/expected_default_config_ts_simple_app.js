(function (lwc) {
  'use strict';

  function stylesheet(hostSelector, shadowSelector, nativeShadow) {
    return ["\n", (nativeShadow ? (":host {color: var(--lwc-my-color);}") : [hostSelector, " {color: var(--lwc-my-color);}"].join('')), "\n"].join('');
  }
  var _implicitStylesheets = [stylesheet];

  function tmpl($api, $cmp, $slotset, $ctx) {
    const {
      d: api_dynamic,
      h: api_element
    } = $api;
    return [api_element("div", {
      key: 1
    }, [api_dynamic($cmp.x, 0)])];
  }

  var _tmpl = lwc.registerTemplate(tmpl);
  tmpl.stylesheets = [];

  if (_implicitStylesheets) {
    tmpl.stylesheets.push.apply(tmpl.stylesheets, _implicitStylesheets);
  }
  tmpl.stylesheetTokens = {
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
    }, [api_custom_element("ts-foo", _tsFoo, {
      props: {
        "x": "1"
      },
      key: 0
    }, [])])];
  }

  var _tmpl$1 = lwc.registerTemplate(tmpl$1);
  tmpl$1.stylesheets = [];
  tmpl$1.stylesheetTokens = {
    hostAttribute: "ts-app_app-host",
    shadowAttribute: "ts-app_app"
  };

  class App extends lwc.LightningElement {
    constructor() {
      super();
    }

  }

  var App$1 = lwc.registerComponent(App, {
    tmpl: _tmpl$1
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