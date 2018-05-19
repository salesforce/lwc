(function(engine) {
    "use strict";

    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    var __getKey = Proxy.getKey;
    var __setKey = Proxy.setKey;
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

    var __setKey$1 = Proxy.setKey;
    var __getKey$1 = Proxy.getKey;
    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function");
      }

      __setKey$1(
        subClass,
        "prototype",
        Object.create(superClass && __getKey$1(superClass, "prototype"), {
          constructor: {
            value: subClass,
            enumerable: false,
            writable: true,
            configurable: true
          }
        })
      );

      if (superClass)
        Object.setPrototypeOf
          ? Object.setPrototypeOf(subClass, superClass)
          : __setKey$1(subClass, "__proto__", superClass);
    }

    var style = undefined;

    var style$1 = undefined;

    var __getKey$2 = Proxy.getKey;
    var __setKey$2 = Proxy.setKey;
    var __callKey1 = Proxy.callKey1;
    function tmpl($api, $cmp, $slotset, $ctx) {
      var api_dynamic = __getKey$2($api, "d"),
        api_element = __getKey$2($api, "h");

      return [
        api_element(
          "div",
          {
            key: 1
          },
          [api_dynamic(__getKey$2($cmp, "x"))]
        )
      ];
    }

    if (style$1) {
      __setKey$2(tmpl, "token", "x-foo_foo");

      var style$2 = __callKey1(document, "createElement", "style");

      __setKey$2(style$2, "type", "text/css");

      __setKey$2(__getKey$2(style$2, "dataset"), "token", "x-foo_foo");

      __setKey$2(style$2, "textContent", style$1("x-foo", "x-foo_foo"));

      __callKey1(__getKey$2(document, "head"), "appendChild", style$2);
    }

    var __setKey$3 = Proxy.setKey;
    var __callKey2 = Proxy.callKey2;
    var __getKey$3 = Proxy.getKey;
    var __concat = Proxy.concat;

    var Foo =
      /*#__PURE__*/
      (function(_Element) {
        _inherits(Foo, _Element);

        function Foo() {
          var _ref;

          var _this;

          _classCallCheck(this, Foo);

          var _temp;

          for (
            var _len = arguments.length, args = new Array(_len), _key = 0;
            _key < _len;
            _key++
          ) {
            __setKey$3(args, _key, arguments[_key]);
          }

          return _possibleConstructorReturn(
            _this,
            ((_temp = _this = _possibleConstructorReturn(
              this,
              __callKey2(
                __getKey$3(
                  (_ref =
                    __getKey$3(Foo, "__proto__") || Object.getPrototypeOf(Foo)),
                  "call"
                ),
                "apply",
                _ref,
                __concat([this], args)
              )
            )),
            __setKey$3(_this, "x", void 0),
            _temp)
          );
        }

        _createClass(Foo, [
          {
            key: "render",
            value: function render() {
              return tmpl;
            }
          }
        ]);

        return Foo;
      })(engine.Element);

    __setKey$3(Foo, "publicProps", {
      x: {
        config: 0
      }
    });

    var __getKey$4 = Proxy.getKey;
    var __setKey$4 = Proxy.setKey;
    var __callKey1$1 = Proxy.callKey1;
    function tmpl$1($api, $cmp, $slotset, $ctx) {
      var api_custom_element = __getKey$4($api, "c"),
        api_element = __getKey$4($api, "h");

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
      __setKey$4(tmpl$1, "token", "x-app_app");

      var style$3 = __callKey1$1(document, "createElement", "style");

      __setKey$4(style$3, "type", "text/css");

      __setKey$4(__getKey$4(style$3, "dataset"), "token", "x-app_app");

      __setKey$4(style$3, "textContent", style("x-app", "x-app_app"));

      __callKey1$1(__getKey$4(document, "head"), "appendChild", style$3);
    }

    var __callKey1$2 = Proxy.callKey1;
    var __getKey$5 = Proxy.getKey;
    var __setKey$5 = Proxy.setKey;

    var App =
      /*#__PURE__*/
      (function(_Element) {
        _inherits(App, _Element);

        function App() {
          var _this;

          _classCallCheck(this, App);

          _this = _possibleConstructorReturn(
            this,
            __callKey1$2(
              __getKey$5(App, "__proto__") || Object.getPrototypeOf(App),
              "call",
              this
            )
          );

          __setKey$5(_this, "list", []);

          return _this;
        }

        _createClass(App, [
          {
            key: "render",
            value: function render() {
              return tmpl$1;
            }
          }
        ]);

        return App;
      })(engine.Element);

    var __callKey1$3 = Proxy.callKey1;

    var container = __callKey1$3(document, "getElementById", "main");

    var element = engine.createElement("x-app", {
      is: App
    });

    __callKey1$3(container, "appendChild", element);
  })(engine);
