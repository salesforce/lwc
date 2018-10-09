(function(lwc) {
    "use strict";

    var __callKey1 = Proxy.callKey1;

    var __setKey = Proxy.setKey;

    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    var __getKey = Proxy.getKey;

    var __inKey = Proxy.inKey;

    function _defineProperties(target, props) {
      for (var i = 0; i < __getKey(props, "length"); i++) {
        var descriptor = __getKey(props, i);

        __setKey(
          descriptor,
          "enumerable",
          __getKey(descriptor, "enumerable") || false
        );

        __setKey(descriptor, "configurable", true);

        if (__inKey(descriptor, "value")) __setKey(descriptor, "writable", true);
        Object.compatDefineProperty(
          target,
          __getKey(descriptor, "key"),
          descriptor
        );
      }
    }

    function _createClass(Constructor, protoProps, staticProps) {
      if (protoProps)
        _defineProperties(__getKey(Constructor, "prototype"), protoProps);
      if (staticProps) _defineProperties(Constructor, staticProps);
      return Constructor;
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
            return __getKey(o, "__proto__") || Object.getPrototypeOf(o);
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
        Object.create(superClass && __getKey(superClass, "prototype"), {
          constructor: {
            value: subClass,
            writable: true,
            configurable: true
          }
        })
      );

      if (superClass) _setPrototypeOf(subClass, superClass);
    }

    var style = undefined;

    var __callKey2 = Proxy.callKey2;

    var __concat = Proxy.concat;

    var style$1 = undefined;

    function tmpl($api, $cmp, $slotset, $ctx) {
      var api_dynamic = __getKey($api, "d"),
        api_element = __getKey($api, "h");

      return [
        api_element(
          "div",
          {
            key: 1
          },
          [api_dynamic(__getKey($cmp, "x"))]
        )
      ];
    }

    var html = lwc.registerTemplate(tmpl)

    if (style$1) {
      __setKey(tmpl, "hostToken", "x-foo_foo-host");

      __setKey(tmpl, "shadowToken", "x-foo_foo");

      var style$2 = __callKey1(document, "createElement", "style");

      __setKey(style$2, "type", "text/css");

      __setKey(__getKey(style$2, "dataset"), "token", "x-foo_foo");

      __setKey(style$2, "textContent", style$1("x-foo_foo"));

      __callKey1(__getKey(document, "head"), "appendChild", style$2);
    }

    var Foo =
      /*#__PURE__*/
      (function(_LightningElement) {
        _inherits(Foo, _LightningElement);

        function Foo() {
          var _getPrototypeOf2;

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
              __getKey((_getPrototypeOf2 = _getPrototypeOf(Foo)), "call"),
              "apply",
              _getPrototypeOf2,
              __concat([this], args)
            )
          );

          __setKey(_this, "x", void 0);

          return _this;
        }

        _createClass(Foo, [
          {
            key: "render",
            value: function render() {
              return html;
            }
          }
        ]);

        return Foo;
      })(lwc.LightningElement);

    __setKey(Foo, "publicProps", {
      x: {
        config: 0
      }
    });

    function tmpl$1($api, $cmp, $slotset, $ctx) {
      var api_custom_element = __getKey($api, "c"),
        api_element = __getKey($api, "h");

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
            api_custom_element(
              "x-foo",
              Foo,
              {
                props: {
                  x: "1"
                },
                key: 1
              },
              []
            )
          ]
        )
      ];
    }

    var html$1 = lwc.registerTemplate(tmpl$1);

    if (style) {
      __setKey(tmpl$1, "hostToken", "x-app_app-host");

      __setKey(tmpl$1, "shadowToken", "x-app_app");

      var style$3 = __callKey1(document, "createElement", "style");

      __setKey(style$3, "type", "text/css");

      __setKey(__getKey(style$3, "dataset"), "token", "x-app_app");

      __setKey(style$3, "textContent", style("x-app_app"));

      __callKey1(__getKey(document, "head"), "appendChild", style$3);
    }

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

        _createClass(App, [
          {
            key: "render",
            value: function render() {
              return html$1;
            }
          }
        ]);

        return App;
      })(lwc.LightningElement);

    var container = __callKey1(document, "getElementById", "main");

    var element = lwc.createElement("x-app", {
      is: App
    });

    __callKey1(container, "appendChild", element);
  })(Engine);
