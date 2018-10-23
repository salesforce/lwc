(function (lwc) {
    'use strict';

    function tmpl($api, $cmp, $slotset, $ctx) {
      const {
        d: api_dynamic,
        h: api_element
      } = $api;

      return [api_element("div", {
        key: 2,
        create: () => {},
        update: () => {}
      }, [api_dynamic($cmp.x)])];
    }

    var html = lwc.registerTemplate(tmpl);

    class Foo extends lwc.LightningElement {
      constructor(...args) {
        super(...args);
        this.x = void 0;
      }

      render() {
        return html;
      }

    }
    Foo.publicProps = {
      x: {
        config: 0
      }
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
        key: 2,
        update: () => {}
      }, [api_custom_element("x-foo", Foo, {
        props: {
          "x": "1"
        },
        key: 3,
        update: () => {}
      }, [])])];
    }

    var html$1 = lwc.registerTemplate(tmpl$1);

    class App extends lwc.LightningElement {
      constructor() {
        super();
        this.list = [];
      }

      render() {
        return html$1;
      }

    }

    const container = document.getElementById('main');
    const element = lwc.createElement('x-app', {
      is: App
    });
    container.appendChild(element);

}(Engine));
