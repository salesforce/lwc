(function (lwc) {
  'use strict';

  var __callKey1 = Proxy.callKey1;

  var __setKey = Proxy.setKey;

  var __callKey2 = Proxy.callKey2;

  var __concat = Proxy.concat;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var __inKey = Proxy.inKey;

  function _defineProperties(target, props) {
    for (var i = 0; i < (props._ES5ProxyType ? props.get("length") : props.length); i++) {
      var descriptor = props._ES5ProxyType ? props.get(i) : props[i];

      __setKey(descriptor, "enumerable", (descriptor._ES5ProxyType ? descriptor.get("enumerable") : descriptor.enumerable) || false);

      __setKey(descriptor, "configurable", true);

      if (__inKey(descriptor, "value")) __setKey(descriptor, "writable", true);
      Object.compatDefineProperty(target, descriptor._ES5ProxyType ? descriptor.get("key") : descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor._ES5ProxyType ? Constructor.get("prototype") : Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
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

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return (o._ES5ProxyType ? o.get("__proto__") : o.__proto__) || Object.getPrototypeOf(o);
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

    __setKey(subClass, "prototype", Object.create(superClass && (superClass._ES5ProxyType ? superClass.get("prototype") : superClass.prototype), {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    }));

    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function tmpl($api, $cmp, $slotset, $ctx) {
    var _stateBar, _handleClickInBar, _state, _todos;

    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        function_bind = $api._ES5ProxyType ? $api.get("fb") : $api.fb,
        locator_listener = $api._ES5ProxyType ? $api.get("ll") : $api.ll,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_bind = $api._ES5ProxyType ? $api.get("b") : $api.b,
        api_dynamic = $api._ES5ProxyType ? $api.get("d") : $api.d,
        api_key = $api._ES5ProxyType ? $api.get("k") : $api.k,
        api_iterator = $api._ES5ProxyType ? $api.get("i") : $api.i,
        api_slot = $api._ES5ProxyType ? $api.get("s") : $api.s;

    var _m0 = $ctx._ES5ProxyType ? $ctx.get("_m0") : $ctx._m0,
        _m1 = $ctx._ES5ProxyType ? $ctx.get("_m1") : $ctx._m1,
        _m2 = $ctx._ES5ProxyType ? $ctx.get("_m2") : $ctx._m2,
        _m3 = $ctx._ES5ProxyType ? $ctx.get("_m3") : $ctx._m3;

    return [api_element("div", {
      styleMap: {
        "border": "1px solid black",
        "width": "300px",
        "padding": "5px"
      },
      key: 2
    }, [api_text("This is a Root component wrapper"), api_element("div", {
      key: 3
    }, [api_element("button", {
      classMap: {
        "simple-locator": true
      },
      context: {
        locator: {
          id: "root",
          context: _m0 || __setKey($ctx, "_m0", function_bind($cmp._ES5ProxyType ? $cmp.get("rootContext") : $cmp.rootContext))
        }
      },
      key: 4,
      on: {
        "click": _m1 || __setKey($ctx, "_m1", locator_listener($cmp._ES5ProxyType ? $cmp.get("handleClick") : $cmp.handleClick, "root", function_bind($cmp._ES5ProxyType ? $cmp.get("rootContext") : $cmp.rootContext)))
      }
    }, [api_text("A simple button")]), api_element("button", {
      classMap: {
        "no_locator": true
      },
      key: 5,
      on: {
        "click": _m2 || __setKey($ctx, "_m2", api_bind((_stateBar = $cmp._ES5ProxyType ? $cmp.get("stateBar") : $cmp.stateBar, _handleClickInBar = _stateBar._ES5ProxyType ? _stateBar.get("handleClickInBar") : _stateBar.handleClickInBar)))
      }
    }, [api_text("Button without locator")])]), api_element("div", {
      key: 6
    }, [api_text("Content in iteration below")]), api_element("ol", {
      key: 7
    }, api_iterator((_state = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _todos = _state._ES5ProxyType ? _state.get("todos") : _state.todos), function (todo, index) {
      return api_element("li", {
        key: api_key(9, todo._ES5ProxyType ? todo.get("id") : todo.id)
      }, [api_element("button", {
        classMap: {
          "todo-item": true
        },
        context: {
          locator: {
            id: "todo-item",
            context: _m3 || __setKey($ctx, "_m3", function_bind($cmp._ES5ProxyType ? $cmp.get("todoContext") : $cmp.todoContext))
          }
        },
        key: 10,
        on: {
          "click": locator_listener(todo._ES5ProxyType ? todo.get("clickHandler") : todo.clickHandler, "todo-item", function_bind($cmp._ES5ProxyType ? $cmp.get("todoContext") : $cmp.todoContext))
        }
      }, [api_dynamic(todo._ES5ProxyType ? todo.get("text") : todo.text)])]);
    })), api_element("div", {
      styleMap: {
        "border": "1px dashed black",
        "margin": "10px"
      },
      key: 11
    }, [api_text("Content in a slot below in root"), api_element("div", {
      key: 12
    }, [api_slot("", {
      key: 13
    }, [], $slotset)])])])];
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "slots", [""]);

  __setKey(tmpl, "stylesheets", []);

  __setKey(tmpl, "stylesheetTokens", {
    hostAttribute: "integration-root_root-host",
    shadowAttribute: "integration-root_root"
  });

  var Root =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(Root, _LightningElement);

    function Root() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, Root);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(Root), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "stateVar1", "from-root-1");

      __setKey(_this, "stateVar2", "from-root-2");

      __setKey(_this, "state", {
        todos: [{
          id: 1,
          text: "Todo Item 1",
          clickHandler: function clickHandler(e) {
            return __setKey(window, "clicked", true);
          }
        }, {
          id: 2,
          text: "Todo Item 2",
          clickHandler: function clickHandler(e) {
            return __setKey(window, "clicked", true);
          }
        }]
      });

      __setKey(_this, "stateBar", {
        foo: 10,
        handleClickInBar: function handleClickInBar(e) {
          __setKey(window, "clicked", true);
        }
      });

      return _this;
    }

    _createClass(Root, [{
      key: "handleClick",
      value: function handleClick(e) {
        __setKey(window, "clicked", true);
      }
    }, {
      key: "rootContext",
      value: function rootContext() {
        return {
          "key-foo": this._ES5ProxyType ? this.get("stateVar2") : this.stateVar2
        };
      }
    }, {
      key: "todoContext",
      value: function todoContext() {
        return {
          "key-root": this._ES5ProxyType ? this.get("stateVar1") : this.stateVar1,
          "key-common": this._ES5ProxyType ? this.get("stateVar2") : this.stateVar2
        };
      }
    }]);

    return Root;
  }(lwc.LightningElement);

  var _integrationRoot = lwc.registerComponent(Root, {
    tmpl: _tmpl
  });

  function tmpl$1($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        function_bind = $api._ES5ProxyType ? $api.get("fb") : $api.fb,
        locator_listener = $api._ES5ProxyType ? $api.get("ll") : $api.ll,
        api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c;

    var _m0 = $ctx._ES5ProxyType ? $ctx.get("_m0") : $ctx._m0,
        _m1 = $ctx._ES5ProxyType ? $ctx.get("_m1") : $ctx._m1,
        _m2 = $ctx._ES5ProxyType ? $ctx.get("_m2") : $ctx._m2;

    return [api_element("div", {
      key: 2
    }, [api_text("Hello from  container")]), api_custom_element("integration-root", _integrationRoot, {
      context: {
        locator: {
          id: "root-container",
          context: _m2 || __setKey($ctx, "_m2", function_bind($cmp._ES5ProxyType ? $cmp.get("containerContext") : $cmp.containerContext))
        }
      },
      key: 3
    }, [api_element("button", {
      classMap: {
        "button-in-slot": true
      },
      context: {
        locator: {
          id: "slot-in-container",
          context: _m0 || __setKey($ctx, "_m0", function_bind($cmp._ES5ProxyType ? $cmp.get("containerSlotContext") : $cmp.containerSlotContext))
        }
      },
      key: 4,
      on: {
        "click": _m1 || __setKey($ctx, "_m1", locator_listener($cmp._ES5ProxyType ? $cmp.get("containerClick") : $cmp.containerClick, "slot-in-container", function_bind($cmp._ES5ProxyType ? $cmp.get("containerSlotContext") : $cmp.containerSlotContext)))
      }
    }, [api_text("Hello from slot injected by container")])])];
  }

  var _tmpl$1 = lwc.registerTemplate(tmpl$1);

  __setKey(tmpl$1, "stylesheets", []);

  __setKey(tmpl$1, "stylesheetTokens", {
    hostAttribute: "integration-container_container-host",
    shadowAttribute: "integration-container_container"
  });

  var Container =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(Container, _LightningElement);

    function Container() {
      _classCallCheck(this, Container);

      return _possibleConstructorReturn(this, __callKey2(_getPrototypeOf(Container), "apply", this, arguments));
    }

    _createClass(Container, [{
      key: "containerContext",
      value: function containerContext() {
        return {
          "key-parent": Container._ES5ProxyType ? Container.get("state1") : Container.state1,
          "key-common": Container._ES5ProxyType ? Container.get("state2") : Container.state2
        };
      }
    }, {
      key: "containerSlotContext",
      value: function containerSlotContext() {
        return {
          "key-slot": Container._ES5ProxyType ? Container.get("state3") : Container.state3
        };
      }
    }, {
      key: "containerClick",
      value: function containerClick() {
        __setKey(window, "clicked", true);
      }
    }]);

    return Container;
  }(lwc.LightningElement);

  var _integrationContainer = lwc.registerComponent(Container, {
    tmpl: _tmpl$1
  });

  __setKey(Container, "state1", "from-container-1");

  __setKey(Container, "state2", "from-container-2");

  __setKey(Container, "state3", "from-container-3");

  function tmpl$2($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        function_bind = $api._ES5ProxyType ? $api.get("fb") : $api.fb,
        api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c;

    var _m0 = $ctx._ES5ProxyType ? $ctx.get("_m0") : $ctx._m0;

    return [api_text("Hello From Container Parent - Locator-Check"), api_custom_element("integration-container", _integrationContainer, {
      styleMap: {
        "display": "block",
        "border": "1px solid black",
        "width": "350px",
        "padding": "10px"
      },
      context: {
        locator: {
          id: "container-parent",
          context: _m0 || __setKey($ctx, "_m0", function_bind($cmp._ES5ProxyType ? $cmp.get("containerParentContext") : $cmp.containerParentContext))
        }
      },
      key: 2
    }, [])];
  }

  var _tmpl$2 = lwc.registerTemplate(tmpl$2);

  __setKey(tmpl$2, "stylesheets", []);

  __setKey(tmpl$2, "stylesheetTokens", {
    hostAttribute: "integration-locator-check_locator-check-host",
    shadowAttribute: "integration-locator-check_locator-check"
  });

  var LocatorCheck =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(LocatorCheck, _LightningElement);

    function LocatorCheck() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, LocatorCheck);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(LocatorCheck), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "serviceRegistered", false);

      return _this;
    }

    _createClass(LocatorCheck, [{
      key: "connectedCallback",
      value: function connectedCallback() {
        if (!(this._ES5ProxyType ? this.get("serviceRegistered") : this.serviceRegistered)) {
          lwc.register({
            locator: function locator(component, data, def, context) {
              var _locator, _resolved;

              var _context$locator$reso = (_locator = context._ES5ProxyType ? context.get("locator") : context.locator, _resolved = _locator._ES5ProxyType ? _locator.get("resolved") : _locator.resolved),
                  target = _context$locator$reso._ES5ProxyType ? _context$locator$reso.get("target") : _context$locator$reso.target,
                  host = _context$locator$reso._ES5ProxyType ? _context$locator$reso.get("host") : _context$locator$reso.host,
                  targetContext = _context$locator$reso._ES5ProxyType ? _context$locator$reso.get("targetContext") : _context$locator$reso.targetContext,
                  hostContext = _context$locator$reso._ES5ProxyType ? _context$locator$reso.get("hostContext") : _context$locator$reso.hostContext;

              __setKey(window, "interaction", {
                target: target,
                scope: host,
                context: Object.compatAssign(targetContext || {}, hostContext)
              });
            }
          });

          __setKey(this, "serviceRegistered", true);
        }
      }
    }, {
      key: "containerParentContext",
      value: function containerParentContext() {
        return {
          "container-parent": LocatorCheck._ES5ProxyType ? LocatorCheck.get("state") : LocatorCheck.state
        };
      }
    }]);

    return LocatorCheck;
  }(lwc.LightningElement);

  var Cmp = lwc.registerComponent(LocatorCheck, {
    tmpl: _tmpl$2
  });

  __setKey(LocatorCheck, "state", "from-locator-check-1");

  var fallback = __callKey1(location._ES5ProxyType ? location.get("search") : location.search, "indexOf", 'nativeShadow=true') !== -1 ? false : true;
  var element = lwc.createElement('integration-locator-check', {
    is: Cmp,
    fallback: fallback
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

}(Engine));
