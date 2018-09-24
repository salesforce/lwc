(function (lwc) {
    'use strict';

    const stylesheet = undefined;

    const stylesheet$1 = undefined;

    function tmpl($api, $cmp, $slotset, $ctx) {
      const {
        d: api_dynamic,
        h: api_element
      } = $api;

      return [api_element("div", {
        key: 1
      }, [api_dynamic($cmp.x)])];
    }

    if (stylesheet$1) {
        tmpl.hostToken = stylesheet$1.hostToken;
        tmpl.shadowToken = stylesheet$1.shadowToken;

        const style = document.createElement('style');
        style.type = 'text/css';
        style.dataset.token = stylesheet$1.shadowToken;
        style.textContent = stylesheet$1.content;
        document.head.appendChild(style);
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

    if (stylesheet) {
        tmpl$1.hostToken = stylesheet.hostToken;
        tmpl$1.shadowToken = stylesheet.shadowToken;

        const style = document.createElement('style');
        style.type = 'text/css';
        style.dataset.token = stylesheet.shadowToken;
        style.textContent = stylesheet.content;
        document.head.appendChild(style);
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
