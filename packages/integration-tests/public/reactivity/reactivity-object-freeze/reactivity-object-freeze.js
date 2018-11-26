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

  Proxy.callKey2;

  function tmpl($api, $cmp, $slotset, $ctx) {
    var _state, _todos;

    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_dynamic = $api._ES5ProxyType ? $api.get("d") : $api.d,
        api_key = $api._ES5ProxyType ? $api.get("k") : $api.k,
        api_iterator = $api._ES5ProxyType ? $api.get("i") : $api.i;
    return [api_element("h2", {
      key: 2
    }, [api_text(" Sample to show error when we use objects that are frozen. Click on button to see error in console.")]), api_element("ul", {
      key: 3
    }, api_iterator((_state = $cmp._ES5ProxyType ? $cmp.get("state") : $cmp.state, _todos = _state._ES5ProxyType ? _state.get("todos") : _state.todos), function (todo) {
      return api_element("li", {
        key: api_key(5, todo._ES5ProxyType ? todo.get("text") : todo.text)
      }, [api_dynamic(todo._ES5ProxyType ? todo.get("text") : todo.text)]);
    }))];
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "stylesheets", []);

  __setKey(tmpl, "stylesheetTokens", {
    hostAttribute: "integration-reactivity-object-freeze_reactivity-object-freeze-host",
    shadowAttribute: "integration-reactivity-object-freeze_reactivity-object-freeze"
  });

  var ReactivityObjectFreeze =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(ReactivityObjectFreeze, _LightningElement);

    function ReactivityObjectFreeze() {
      var _state, _todos;

      var _this;

      _classCallCheck(this, ReactivityObjectFreeze);

      _this = _possibleConstructorReturn(this, __callKey1(_getPrototypeOf(ReactivityObjectFreeze), "call", this));

      __setKey(_this, "state", {
        title: 'Welcome to Raptor fiddle!',
        todos: [{
          text: 'Learn JavaScript'
        }, {
          text: 'Learn Raptor'
        }, {
          text: 'Build something awesome'
        }],
        message: "Click to freeze"
      });

      Object.freeze((_state = _this._ES5ProxyType ? _this.get("state") : _this.state, _todos = _state._ES5ProxyType ? _state.get("todos") : _state.todos));
      return _this;
    }

    return ReactivityObjectFreeze;
  }(lwc.LightningElement);

  var Cmp = lwc.registerComponent(ReactivityObjectFreeze, {
    tmpl: _tmpl
  });

  var fallback = __callKey1(location._ES5ProxyType ? location.get("search") : location.search, "indexOf", 'nativeShadow=true') !== -1 ? false : true;
  var element = lwc.createElement('integration-reactivity-object-freeze', {
    is: Cmp,
    fallback: fallback
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

}(Engine));
