(function (lwc) {
    'use strict';

    function tmpl($api, $cmp, $slotset, $ctx) {
      const {
        d: api_dynamic,
        h: api_element
      } = $api;

      return [api_element("div", {
        key: 2
      }, [api_dynamic($cmp.x)])];
    }

    var _tmpl = lwc.registerTemplate(tmpl);

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
        key: 2
      }, [api_custom_element("x-foo", _xFoo, {
        props: {
          "x": "1"
        },
        key: 3
      }, [])])];
    }

    var _tmpl$1 = lwc.registerTemplate(tmpl$1);

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

}(Engine));
