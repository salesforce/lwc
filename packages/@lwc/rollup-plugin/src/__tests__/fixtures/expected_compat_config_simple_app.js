(function(lwc) {
    "use strict";

    var __callKey1 = Proxy.callKey1;

    var __setKey = Proxy.setKey;

    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    function _assertThisInitialized(self) {
      if (self === void 0) {
        throw new ReferenceError(
          "this hasn't been initialised - super() hasn't been called"
        );
      }

      return self;
    }

    function _possibleConstructorReturn(self, call) {
      if (call && (typeof call === "object" || typeof call === "function")) {
        return call;
      }

      return _assertThisInitialized(self);
    }

    function _getPrototypeOf(o) {
      _getPrototypeOf = Object.setPrototypeOf
        ? Object.getPrototypeOf
        : function _getPrototypeOf(o) {
            return (
              (o._ES5ProxyType ? o.get("__proto__") : o.__proto__) ||
              Object.getPrototypeOf(o)
            );
          };
      return _getPrototypeOf(o);
    }

    function _setPrototypeOf(o, p) {
      _setPrototypeOf =
        Object.setPrototypeOf ||
        function _setPrototypeOf(o, p) {
          __setKey(o, "__proto__", p);

          return o;
        };

      return _setPrototypeOf(o, p);
    }

    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function");
      }

      __setKey(
        subClass,
        "prototype",
        Object.create(
          superClass &&
            (superClass._ES5ProxyType
              ? superClass.get("prototype")
              : superClass.prototype),
          {
            constructor: {
              value: subClass,
              writable: true,
              configurable: true
            }
          }
        )
      );

      if (superClass) _setPrototypeOf(subClass, superClass);
    }

    var __callKey2 = Proxy.callKey2;

    var __concat = Proxy.concat;

   function stylesheet(hostSelector, shadowSelector, nativeShadow) {
     return (
       "\n" +
       (nativeShadow
         ? ":host {color: var(--lwc-my-color);}"
         : hostSelector + " {color: var(--lwc-my-color);}") +
       "\n"
     );
   }

   var _implicitStylesheets = [stylesheet];

    function tmpl($api, $cmp, $slotset, $ctx) {
      var api_dynamic = $api._ES5ProxyType ? $api.get("d") : $api.d,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
      return [
        api_element(
          "div",
          {
            key: 0
          },
          [api_dynamic($cmp._ES5ProxyType ? $cmp.get("x") : $cmp.x)]
        )
      ];
    }

    var _tmpl = lwc.registerTemplate(tmpl);

    __setKey(tmpl, "stylesheets", []);

    if (_implicitStylesheets) {
     __callKey2(
       (tmpl._ES5ProxyType ? tmpl.get("stylesheets") : tmpl.stylesheets).push,
       "apply",
       tmpl._ES5ProxyType ? tmpl.get("stylesheets") : tmpl.stylesheets,
       _implicitStylesheets
     );
   }

   __setKey(tmpl, "stylesheetTokens", {
     hostAttribute: "x-foo_foo-host",
     shadowAttribute: "x-foo_foo"
   });

    var Foo =
      /*#__PURE__*/
      (function(_LightningElement) {
        _inherits(Foo, _LightningElement);

        function Foo() {
          var _getPrototypeOf2, _getPrototypeOf3, _call;

          var _this;

          _classCallCheck(this, Foo);

          for (
            var _len = arguments.length, args = new Array(_len), _key = 0;
            _key < _len;
            _key++
          ) {
            __setKey(args, _key, arguments[_key]);
          }

          _this = _possibleConstructorReturn(
            this,
            __callKey2(
              ((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(Foo)),
              (_call = _getPrototypeOf3._ES5ProxyType
                ? _getPrototypeOf3.get("call")
                : _getPrototypeOf3.call)),
              "apply",
              _getPrototypeOf2,
              __concat([this], args)
            )
          );

          __setKey(_this, "x", void 0);

          return _this;
        }

        return Foo;
      })(lwc.LightningElement);

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
      var api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
      return [
        api_element(
          "div",
          {
            attrs: {
              class: "container"
            },
            key: 1
          },
          [
            api_custom_element(
              "x-foo",
              _xFoo,
              {
                props: {
                  x: "1"
                },
                key: 0
              },
              []
            )
          ]
        )
      ];
    }

    var _tmpl$1 = lwc.registerTemplate(tmpl$1);

    __setKey(tmpl$1, "stylesheets", []);

    __setKey(tmpl$1, "stylesheetTokens", {
      hostAttribute: "x-app_app-host",
      shadowAttribute: "x-app_app"
    });

    var App =
      /*#__PURE__*/
      (function(_LightningElement) {
        _inherits(App, _LightningElement);

        function App() {
          var _this;

          _classCallCheck(this, App);

          _this = _possibleConstructorReturn(
            this,
            __callKey1(_getPrototypeOf(App), "call", this)
          );

          __setKey(_this, "list", []);

          return _this;
        }

        return App;
      })(lwc.LightningElement);

    var App$1 = lwc.registerComponent(App, {
      tmpl: _tmpl$1
    });

    var container = __callKey1(document, "getElementById", "main");

    var element = lwc.createElement("x-app", {
      is: App$1
    });

    __callKey1(container, "appendChild", element);
  })(LWC);
