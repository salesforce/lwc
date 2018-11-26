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
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_dynamic = $api._ES5ProxyType ? $api.get("d") : $api.d;
    return [api_element("div", {
      key: 2
    }, [api_text("I'm a child in a shadow")]), api_element("div", {
      key: 3
    }, [api_element("div", {
      classMap: {
        "children-length": true
      },
      key: 4
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("childrenLength") : $cmp.childrenLength)]), api_element("div", {
      classMap: {
        "childnodes-length": true
      },
      key: 5
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("childNodesLength") : $cmp.childNodesLength)]), api_element("div", {
      classMap: {
        "shadow-children-length": true
      },
      key: 6
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("shadowChildrenLength") : $cmp.shadowChildrenLength)]), api_element("div", {
      classMap: {
        "shadow-childnodes-length": true
      },
      key: 7
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("shadowChildNodesLength") : $cmp.shadowChildNodesLength)]), api_element("hr", {
      key: 8
    }, []), api_element("div", {
      classMap: {
        "child-element-count": true
      },
      key: 9
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("childElementCount") : $cmp.childElementCount)]), api_element("div", {
      classMap: {
        "shadow-root-child-element-count": true
      },
      key: 10
    }, [api_dynamic($cmp._ES5ProxyType ? $cmp.get("shadowRootChildElementCount") : $cmp.shadowRootChildElementCount)])])];
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "stylesheets", []);

  __setKey(tmpl, "stylesheetTokens", {
    hostAttribute: "integration-custom-element-children_custom-element-children-host",
    shadowAttribute: "integration-custom-element-children_custom-element-children"
  });

  var CustomElementChildren =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(CustomElementChildren, _LightningElement);

    function CustomElementChildren() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, CustomElementChildren);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(CustomElementChildren), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "childrenLength", void 0);

      __setKey(_this, "childNodesLength", void 0);

      __setKey(_this, "shadowChildrenLength", void 0);

      __setKey(_this, "shadowChildNodesLength", void 0);

      __setKey(_this, "childElementCount", void 0);

      __setKey(_this, "shadowRootChildElementCount", void 0);

      return _this;
    }

    _createClass(CustomElementChildren, [{
      key: "renderedCallback",
      value: function renderedCallback() {
        if ((this._ES5ProxyType ? this.get("childrenLength") : this.childrenLength) === undefined) {
          var _template, _host, _children, _length, _template2, _host2, _childNodes, _length2, _template3, _children2, _length3, _template4, _childNodes2, _length4, _template5, _host3, _childElementCount, _template6, _childElementCount2;

          __setKey(this, "childrenLength", (_template = this._ES5ProxyType ? this.get("template") : this.template, _host = _template._ES5ProxyType ? _template.get("host") : _template.host, _children = _host._ES5ProxyType ? _host.get("children") : _host.children, _length = _children._ES5ProxyType ? _children.get("length") : _children.length));

          __setKey(this, "childNodesLength", (_template2 = this._ES5ProxyType ? this.get("template") : this.template, _host2 = _template2._ES5ProxyType ? _template2.get("host") : _template2.host, _childNodes = _host2._ES5ProxyType ? _host2.get("childNodes") : _host2.childNodes, _length2 = _childNodes._ES5ProxyType ? _childNodes.get("length") : _childNodes.length));

          __setKey(this, "shadowChildrenLength", (_template3 = this._ES5ProxyType ? this.get("template") : this.template, _children2 = _template3._ES5ProxyType ? _template3.get("children") : _template3.children, _length3 = _children2._ES5ProxyType ? _children2.get("length") : _children2.length));

          __setKey(this, "shadowChildNodesLength", (_template4 = this._ES5ProxyType ? this.get("template") : this.template, _childNodes2 = _template4._ES5ProxyType ? _template4.get("childNodes") : _template4.childNodes, _length4 = _childNodes2._ES5ProxyType ? _childNodes2.get("length") : _childNodes2.length));

          __setKey(this, "childElementCount", (_template5 = this._ES5ProxyType ? this.get("template") : this.template, _host3 = _template5._ES5ProxyType ? _template5.get("host") : _template5.host, _childElementCount = _host3._ES5ProxyType ? _host3.get("childElementCount") : _host3.childElementCount));

          __setKey(this, "shadowRootChildElementCount", (_template6 = this._ES5ProxyType ? this.get("template") : this.template, _childElementCount2 = _template6._ES5ProxyType ? _template6.get("childElementCount") : _template6.childElementCount));
        }
      }
    }]);

    return CustomElementChildren;
  }(lwc.LightningElement);

  lwc.registerDecorators(CustomElementChildren, {
    track: {
      childrenLength: 1,
      childNodesLength: 1,
      shadowChildrenLength: 1,
      shadowChildNodesLength: 1,
      childElementCount: 1,
      shadowRootChildElementCount: 1
    }
  });

  var Cmp = lwc.registerComponent(CustomElementChildren, {
    tmpl: _tmpl
  });

  var fallback = __callKey1(location._ES5ProxyType ? location.get("search") : location.search, "indexOf", 'nativeShadow=true') !== -1 ? false : true;
  var element = lwc.createElement('integration-custom-element-children', {
    is: Cmp,
    fallback: fallback
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

}(Engine));
