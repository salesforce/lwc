(function(engine) {
    "use strict";

    const style = undefined;

    const style$1 = undefined;

    function tmpl($api, $cmp, $slotset, $ctx) {
      const { d: api_dynamic, h: api_element } = $api;

      return [
        api_element(
          "div",
          {
            key: 1
          },
          [api_dynamic($cmp.x)]
        )
      ];
    }

    if (style$1) {
      tmpl.token = "x-foo_foo";

      const style = document.createElement("style");
      style.type = "text/css";
      style.dataset.token = "x-foo_foo";
      style.textContent = style$1("x-foo", "x-foo_foo");
      document.head.appendChild(style);
    }

    class Foo extends engine.Element {
      constructor(...args) {
        var _temp;

        return (_temp = super(...args)), (this.x = void 0), _temp;
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
      const { c: api_custom_element, h: api_element } = $api;

      return [
        api_element(
          "div",
          {
            classMap: {
              container: true
            },
            key: 2
          },
          [
            api_custom_element("x-foo", Foo, {
              props: {
                x: "1"
              },
              key: 1
            })
          ]
        )
      ];
    }

    if (style) {
      tmpl$1.token = "x-app_app";

      const style$$1 = document.createElement("style");
      style$$1.type = "text/css";
      style$$1.dataset.token = "x-app_app";
      style$$1.textContent = style("x-app", "x-app_app");
      document.head.appendChild(style$$1);
    }

    class App extends engine.Element {
      constructor() {
        super();
        this.list = [];
      }

      render() {
        return tmpl$1;
      }
    }

    const container = document.getElementById("main");
    const element = engine.createElement("x-app", {
      is: App
    });
    container.appendChild(element);
  })(engine);
