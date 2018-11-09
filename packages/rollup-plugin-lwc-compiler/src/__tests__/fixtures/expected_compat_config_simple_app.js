(function (lwc) {
    'use strict';

    var __callKey1 = Proxy.callKey1;

    var __setKey = Proxy.setKey;

    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    function _assertThisInitialized(self) {
      if (self === void 0) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
      }

      return self;
    }

    function _possibleConstructorReturn(self, call) {
      if (call && (typeof call === "object" || typeof call === "function")) {
        return call;
      }

      return _assertThisInitialized(self);
    }

    var __getKey = Proxy.getKey;

    function _getPrototypeOf(o) {
      _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
        return __getKey(o, "__proto__") || Object.getPrototypeOf(o);
      };
      return _getPrototypeOf(o);
    }

    function _setPrototypeOf(o, p) {
      _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
        __setKey(o, "__proto__", p);

        return o;
      };

      return _setPrototypeOf(o, p);
    }

    function _inherits(subClass, superClass) {
      if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function");
      }

      __setKey(subClass, "prototype", Object.create(superClass && __getKey(superClass, "prototype"), {
        constructor: {
          value: subClass,
          writable: true,
          configurable: true
        }
      }));

      if (superClass) _setPrototypeOf(subClass, superClass);
    }

    var __callKey2 = Proxy.callKey2;

    var __concat = Proxy.concat;

    function tmpl($api, $cmp, $slotset, $ctx) {
      var api_dynamic = __getKey($api, "d"),
          api_element = __getKey($api, "h");

      return [api_element("div", {
        key: 2
      }, [api_dynamic(__getKey($cmp, "x"))])];
    }

    var _tmpl = lwc.registerTemplate(tmpl);

    var Foo =
    /*#__PURE__*/
    function (_LightningElement) {
      _inherits(Foo, _LightningElement);

      function Foo() {
        var _getPrototypeOf2;

        var _this;

        _classCallCheck(this, Foo);

        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          __setKey(args, _key, arguments[_key]);
        }

        _this = _possibleConstructorReturn(this, __callKey2(__getKey(_getPrototypeOf2 = _getPrototypeOf(Foo), "call"), "apply", _getPrototypeOf2, __concat([this], args)));

        __setKey(_this, "x", void 0);

        return _this;
      }

      return Foo;
    }(lwc.LightningElement);

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
      var api_custom_element = __getKey($api, "c"),
          api_element = __getKey($api, "h");

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

    var App =
    /*#__PURE__*/
    function (_LightningElement) {
      _inherits(App, _LightningElement);

      function App() {
        var _this;

        _classCallCheck(this, App);

        _this = _possibleConstructorReturn(this, __callKey1(_getPrototypeOf(App), "call", this));

        __setKey(_this, "list", []);

        return _this;
      }

      return App;
    }(lwc.LightningElement);

    var App$1 = lwc.registerComponent(App, {
      tmpl: _tmpl$1
    });

    var container = __callKey1(document, "getElementById", 'main');

    var element = lwc.createElement('x-app', {
      is: App$1
    });

    __callKey1(container, "appendChild", element);

  }(Engine));
