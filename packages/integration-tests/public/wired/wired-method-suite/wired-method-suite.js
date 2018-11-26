(function (lwc,todo,wireService) {
  'use strict';

  var __callKey1 = Proxy.callKey1;

  var __callKey2 = Proxy.callKey2;

  var __callKey0 = Proxy.callKey0;

  var __setKey = Proxy.setKey;

  var __concat = Proxy.concat;

  var __setKeyPostfixIncrement = Proxy.setKeyPostfixIncrement;

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
    var _state, _error, _state2, _error2, _message, _state3, _todo, _state4, _todo2, _state5, _todo3, _title, _state6, _todo4, _state7, _todo5, _state8, _todo6, _completed;

    var api_dynamic = $api._ES5ProxyType ? $api.get("d") : $api.d,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_text = $api._ES5ProxyType ? $api.get("t") : $api.t;
    return [(_state = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _error = _state._ES5ProxyType ? _state.get("error") : _state.error) ? api_element("span", {
      key: 3
    }, [api_dynamic((_state2 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _error2 = _state2._ES5ProxyType ? _state2.get("error") : _state2.error, _message = _error2._ES5ProxyType ? _error2.get("message") : _error2.message))]) : null, (_state3 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _todo = _state3._ES5ProxyType ? _state3.get("todo") : _state3.todo) ? api_text("Title:") : null, (_state4 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _todo2 = _state4._ES5ProxyType ? _state4.get("todo") : _state4.todo) ? api_element("span", {
      key: 5
    }, [api_dynamic((_state5 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _todo3 = _state5._ES5ProxyType ? _state5.get("todo") : _state5.todo, _title = _todo3._ES5ProxyType ? _todo3.get("title") : _todo3.title))]) : null, (_state6 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _todo4 = _state6._ES5ProxyType ? _state6.get("todo") : _state6.todo) ? api_text(" Completed:") : null, (_state7 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _todo5 = _state7._ES5ProxyType ? _state7.get("todo") : _state7.todo) ? api_element("span", {
      key: 6
    }, [api_dynamic((_state8 = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _todo6 = _state8._ES5ProxyType ? _state8.get("todo") : _state8.todo, _completed = _todo6._ES5ProxyType ? _todo6.get("completed") : _todo6.completed))]) : null];
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "stylesheets", []);

  __setKey(tmpl, "stylesheetTokens", {
    hostAttribute: "integration-wiredMethod_wiredMethod-host",
    shadowAttribute: "integration-wiredMethod_wiredMethod"
  });

  var WiredMethod =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(WiredMethod, _LightningElement);

    function WiredMethod() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, WiredMethod);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(WiredMethod), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "todoId", void 0);

      __setKey(_this, "state", {
        error: undefined,
        todo: undefined
      });

      return _this;
    }

    _createClass(WiredMethod, [{
      key: "function",
      value: function _function(_ref) {
        var error = _ref._ES5ProxyType ? _ref.get("error") : _ref.error,
            data = _ref._ES5ProxyType ? _ref.get("data") : _ref.data;

        __setKey(this, "state", {
          error: error,
          todo: data
        });
      }
    }]);

    return WiredMethod;
  }(lwc.LightningElement);

  lwc.registerDecorators(WiredMethod, {
    publicProps: {
      todoId: {
        config: 0
      }
    },
    wire: {
      function: {
        adapter: todo.getTodo,
        params: {
          id: "todoId"
        },
        static: {},
        method: 1
      }
    },
    track: {
      state: 1
    }
  });

  var _integrationWiredMethod = lwc.registerComponent(WiredMethod, {
    tmpl: _tmpl
  });

  function tmpl$1($api, $cmp, $slotset, $ctx) {
    var _state, _todoId;

    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_bind = $api._ES5ProxyType ? $api.get("b") : $api.b,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c;

    var _m0 = $ctx._ES5ProxyType ? $ctx.get("_m0") : $ctx._m0;

    return [api_element("div", {
      key: 2
    }, [api_text("Incement todo id:"), api_element("button", {
      classMap: {
        "increment": true
      },
      key: 3,
      on: {
        "click": _m0 || __setKey($ctx, "_m0", api_bind($cmp._ES5ProxyType ? $cmp.get("handleClick") : $cmp.handleClick))
      }
    }, [api_text("increment")]), api_element("br", {
      key: 4
    }, [])]), api_custom_element("integration-wired-method", _integrationWiredMethod, {
      props: {
        "todoId": (_state = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _todoId = _state._ES5ProxyType ? _state.get("todoId") : _state.todoId)
      },
      key: 5
    }, [])];
  }

  var _tmpl$1 = lwc.registerTemplate(tmpl$1);

  __setKey(tmpl$1, "stylesheets", []);

  __setKey(tmpl$1, "stylesheetTokens", {
    hostAttribute: "integration-wired-method-suite_wired-method-suite-host",
    shadowAttribute: "integration-wired-method-suite_wired-method-suite"
  });

  var WiredMethodSuite =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(WiredMethodSuite, _LightningElement);

    function WiredMethodSuite() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, WiredMethodSuite);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(WiredMethodSuite), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "state", {
        todoId: 0
      });

      return _this;
    }

    _createClass(WiredMethodSuite, [{
      key: "handleClick",
      value: function handleClick() {
        __setKeyPostfixIncrement(this._ES5ProxyType ? this.get("state") : this.state, "todoId");
      }
    }]);

    return WiredMethodSuite;
  }(lwc.LightningElement);

  lwc.registerDecorators(WiredMethodSuite, {
    track: {
      state: 1
    }
  });

  var Cmp = lwc.registerComponent(WiredMethodSuite, {
    tmpl: _tmpl$1
  });

  wireService.registerWireService(lwc.register); // Register the wire adapter for @wire(getTodo).

  wireService.register(todo.getTodo, function getTodoWireAdapter(wiredEventTarget) {
    var subscription;
    var config;

    __callKey1(wiredEventTarget, "dispatchEvent", new wireService.ValueChangedEvent({
      data: undefined,
      error: undefined
    }));

    var observer = {
      next: function next(data) {
        __callKey1(wiredEventTarget, "dispatchEvent", new wireService.ValueChangedEvent({
          data: data,
          error: undefined
        }));
      },
      error: function error(_error) {
        __callKey1(wiredEventTarget, "dispatchEvent", new wireService.ValueChangedEvent({
          data: undefined,
          error: _error
        }));
      }
    };

    __callKey2(wiredEventTarget, "addEventListener", 'connect', function () {
      var observable = todo.getObservable(config);

      if (observable) {
        subscription = __callKey1(observable, "subscribe", observer);
        return;
      }
    });

    __callKey2(wiredEventTarget, "addEventListener", 'disconnect', function () {
      __callKey0(subscription, "unsubscribe");
    });

    __callKey2(wiredEventTarget, "addEventListener", 'config', function (newConfig) {
      config = newConfig;

      if (subscription) {
        __callKey0(subscription, "unsubscribe");

        subscription = undefined;
      }

      var observable = todo.getObservable(config);

      if (observable) {
        subscription = __callKey1(observable, "subscribe", observer);
        return;
      }
    });
  });
  var element = lwc.createElement('integration-wired-method-suite', {
    is: Cmp
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

}(Engine,Todo,WireService));
