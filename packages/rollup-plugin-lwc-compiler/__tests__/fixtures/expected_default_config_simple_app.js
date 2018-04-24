(function(engine) {
    "use strict";

    const style = undefined;

    const style$2 = undefined;

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

    if (style$2) {
      const tagName = "x-foo";
      const token = "x-foo_foo";

      tmpl.token = token;
      tmpl.style = style$2(tagName, token);
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
      const tagName = "x-app";
      const token = "x-app_app";

      tmpl$1.token = token;
      tmpl$1.style = style(tagName, token);
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
