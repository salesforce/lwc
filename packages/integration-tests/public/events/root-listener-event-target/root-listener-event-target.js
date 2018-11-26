(function (lwc) {
  'use strict';

  var __callKey1 = Proxy.callKey1;

  var __callKey2 = Proxy.callKey2;

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

  var __setKey = Proxy.setKey;

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

  var __concat = Proxy.concat;

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

  function tmpl($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t;
    return [api_text("Click me")];
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "stylesheets", []);

  __setKey(tmpl, "stylesheetTokens", {
    hostAttribute: "integration-grandChild_grandChild-host",
    shadowAttribute: "integration-grandChild_grandChild"
  });

  var GrandChild =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(GrandChild, _LightningElement);

    function GrandChild() {
      _classCallCheck(this, GrandChild);

      return _possibleConstructorReturn(this, __callKey2(_getPrototypeOf(GrandChild), "apply", this, arguments));
    }

    return GrandChild;
  }(lwc.LightningElement);

  var _integrationGrandChild = lwc.registerComponent(GrandChild, {
    tmpl: _tmpl
  });

  function tmpl$1($api, $cmp, $slotset, $ctx) {
    var api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c,
        api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h;
    return [api_custom_element("integration-grand-child", _integrationGrandChild, {
      key: 2
    }, []), ($cmp._ES5ProxyType ? $cmp.get("eventTargetIsCorrect") : $cmp.eventTargetIsCorrect) ? api_element("div", {
      classMap: {
        "event-target-correct": true
      },
      key: 3
    }, [api_text("Event Target is correct element")]) : null];
  }

  var _tmpl$1 = lwc.registerTemplate(tmpl$1);

  __setKey(tmpl$1, "stylesheets", []);

  __setKey(tmpl$1, "stylesheetTokens", {
    hostAttribute: "integration-child_child-host",
    shadowAttribute: "integration-child_child"
  });

  var Child =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(Child, _LightningElement);

    function Child() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, Child);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(Child), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "eventTargetIsCorrect", false);

      return _this;
    }

    _createClass(Child, [{
      key: "connectedCallback",
      value: function connectedCallback() {
        var _this2 = this;

        __callKey2(this._ES5ProxyType ? this.get("template") : this.template, "addEventListener", 'click', function (evt) {
          var _target, _tagName;

          __setKey(_this2, "eventTargetIsCorrect", (_target = evt._ES5ProxyType ? evt.get("target") : evt.target, _tagName = _target._ES5ProxyType ? _target.get("tagName") : _target.tagName) === 'INTEGRATION-GRAND-CHILD');
        });
      }
    }]);

    return Child;
  }(lwc.LightningElement);

  lwc.registerDecorators(Child, {
    track: {
      eventTargetIsCorrect: 1
    }
  });

  var _integrationChild = lwc.registerComponent(Child, {
    tmpl: _tmpl$1
  });

  function tmpl$2($api, $cmp, $slotset, $ctx) {
    var api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c;
    return [api_custom_element("integration-child", _integrationChild, {
      key: 2
    }, [])];
  }

  var _tmpl$2 = lwc.registerTemplate(tmpl$2);

  __setKey(tmpl$2, "stylesheets", []);

  __setKey(tmpl$2, "stylesheetTokens", {
    hostAttribute: "integration-root-listener-event-target_root-listener-event-target-host",
    shadowAttribute: "integration-root-listener-event-target_root-listener-event-target"
  });

  var RootListenerEventTarget =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(RootListenerEventTarget, _LightningElement);

    function RootListenerEventTarget() {
      _classCallCheck(this, RootListenerEventTarget);

      return _possibleConstructorReturn(this, __callKey2(_getPrototypeOf(RootListenerEventTarget), "apply", this, arguments));
    }

    return RootListenerEventTarget;
  }(lwc.LightningElement);

  var Cmp = lwc.registerComponent(RootListenerEventTarget, {
    tmpl: _tmpl$2
  });

  var fallback = __callKey1(location._ES5ProxyType ? location.get("search") : location.search, "indexOf", 'nativeShadow=true') !== -1 ? false : true;
  var element = lwc.createElement('integration-root-listener-event-target', {
    is: Cmp,
    fallback: fallback
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

}(Engine));
