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
    var _todo, _error, _todo2, _data, _todo3, _data2, _todo4, _data3, _title, _todo5, _data4, _todo6, _data5, _todo7, _data6, _completed;

    var api_dynamic = $api._ES5ProxyType ? $api.get("d") : $api.d,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_text = $api._ES5ProxyType ? $api.get("t") : $api.t;
    return [(_todo = $cmp._ES5ProxyType ? $cmp.get("todo") : $cmp.todo, _error = _todo._ES5ProxyType ? _todo.get("error") : _todo.error) ? api_element("span", {
      key: 3
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("error") : $cmp.error)]) : null, (_todo2 = $cmp._ES5ProxyType ? $cmp.get("todo") : $cmp.todo, _data = _todo2._ES5ProxyType ? _todo2.get("data") : _todo2.data) ? api_text("Title:") : null, (_todo3 = $cmp._ES5ProxyType ? $cmp.get("todo") : $cmp.todo, _data2 = _todo3._ES5ProxyType ? _todo3.get("data") : _todo3.data) ? api_element("span", {
      key: 5
    }, [api_dynamic((_todo4 = $cmp._ES5ProxyType ? $cmp.get("todo") : $cmp.todo, _data3 = _todo4._ES5ProxyType ? _todo4.get("data") : _todo4.data, _title = _data3._ES5ProxyType ? _data3.get("title") : _data3.title))]) : null, (_todo5 = $cmp._ES5ProxyType ? $cmp.get("todo") : $cmp.todo, _data4 = _todo5._ES5ProxyType ? _todo5.get("data") : _todo5.data) ? api_text(" Completed:") : null, (_todo6 = $cmp._ES5ProxyType ? $cmp.get("todo") : $cmp.todo, _data5 = _todo6._ES5ProxyType ? _todo6.get("data") : _todo6.data) ? api_element("span", {
      key: 6
    }, [api_dynamic((_todo7 = $cmp._ES5ProxyType ? $cmp.get("todo") : $cmp.todo, _data6 = _todo7._ES5ProxyType ? _todo7.get("data") : _todo7.data, _completed = _data6._ES5ProxyType ? _data6.get("completed") : _data6.completed))]) : null];
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "stylesheets", []);

  __setKey(tmpl, "stylesheetTokens", {
    hostAttribute: "integration-wiredProp_wiredProp-host",
    shadowAttribute: "integration-wiredProp_wiredProp"
  });

  var WiredProp =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(WiredProp, _LightningElement);

    function WiredProp() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, WiredProp);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(WiredProp), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "todoId", void 0);

      __setKey(_this, "todo", void 0);

      return _this;
    }

    _createClass(WiredProp, [{
      key: "error",
      get: function get() {
        var _todo, _error, _message;

        return 'Error loading data: ' + (_todo = this._ES5ProxyType ? this.get("todo") : this.todo, _error = _todo._ES5ProxyType ? _todo.get("error") : _todo.error, _message = _error._ES5ProxyType ? _error.get("message") : _error.message);
      }
    }]);

    return WiredProp;
  }(lwc.LightningElement);

  lwc.registerDecorators(WiredProp, {
    publicProps: {
      todoId: {
        config: 0
      }
    },
    wire: {
      todo: {
        adapter: todo.getTodo,
        params: {
          id: "todoId"
        },
        static: {}
      }
    }
  });

  var _integrationWiredProp = lwc.registerComponent(WiredProp, {
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
    }, [])]), api_custom_element("integration-wired-prop", _integrationWiredProp, {
      props: {
        "todoId": (_state = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _todoId = _state._ES5ProxyType ? _state.get("todoId") : _state.todoId)
      },
      key: 5
    }, [])];
  }

  var _tmpl$1 = lwc.registerTemplate(tmpl$1);

  __setKey(tmpl$1, "stylesheets", []);

  __setKey(tmpl$1, "stylesheetTokens", {
    hostAttribute: "integration-wired-prop-suite_wired-prop-suite-host",
    shadowAttribute: "integration-wired-prop-suite_wired-prop-suite"
  });

  var WiredPropSuite =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(WiredPropSuite, _LightningElement);

    function WiredPropSuite() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, WiredPropSuite);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(WiredPropSuite), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "state", {
        todoId: 0
      });

      return _this;
    }

    _createClass(WiredPropSuite, [{
      key: "handleClick",
      value: function handleClick() {
        __setKeyPostfixIncrement(this._ES5ProxyType ? this.get("state") : this.state, "todoId");
      }
    }]);

    return WiredPropSuite;
  }(lwc.LightningElement);

  lwc.registerDecorators(WiredPropSuite, {
    track: {
      state: 1
    }
  });

  var Cmp = lwc.registerComponent(WiredPropSuite, {
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
  var element = lwc.createElement('integration-wired-prop-suite', {
    is: Cmp
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

}(Engine,Todo,WireService));
