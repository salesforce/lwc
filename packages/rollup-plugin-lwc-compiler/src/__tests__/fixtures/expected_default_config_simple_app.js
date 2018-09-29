(function (lwc) {
    'use strict';

    const style = undefined;

    const style$1 = undefined;

    function tmpl($api, $cmp, $slotset, $ctx) {
      const {
        d: api_dynamic,
        h: api_element
      } = $api;

      return [api_element("div", {
        key: 1
      }, [api_dynamic($cmp.x)])];
    }

    if (style$1) {
        tmpl.stylesheet = style$1;
    }

    class Foo extends lwc.LightningElement {
      constructor(...args) {
        super(...args);
        this.x = void 0;
      }

      render() {
        return tmpl;
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
        key: 2
      }, [api_custom_element("x-foo", Foo, {
        props: {
          "x": "1"
        },
        key: 1
      }, [])])];
    }

    if (style) {
        tmpl$1.stylesheet = style;
    }

    class App extends lwc.LightningElement {
      constructor() {
        super();
        this.list = [];
      }

      render() {
        return tmpl$1;
      }

    }

    const container = document.getElementById('main');
    const element = lwc.createElement('x-app', {
      is: App
    });
    container.appendChild(element);

}(Engine));
