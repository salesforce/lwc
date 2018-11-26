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

  var __callKey0 = Proxy.callKey0;

  function _defineProperty(obj, key, value) {
    if (__inKey(obj, key)) {
      Object.compatDefineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      __setKey(obj, key, value);
    }

    return obj;
  }

  var __setKeyPostfixIncrement = Proxy.setKeyPostfixIncrement;

  function tmpl($api, $cmp, $slotset, $ctx) {
    var _treeData, _id, _treeData2, _name, _treeData3, _address, _treeData4, _phone, _treeData5, _children;

    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_bind = $api._ES5ProxyType ? $api.get("b") : $api.b,
        api_dynamic = $api._ES5ProxyType ? $api.get("d") : $api.d,
        api_key = $api._ES5ProxyType ? $api.get("k") : $api.k,
        api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c,
        api_iterator = $api._ES5ProxyType ? $api.get("i") : $api.i;

    var _m0 = $ctx._ES5ProxyType ? $ctx.get("_m0") : $ctx._m0,
        _m1 = $ctx._ES5ProxyType ? $ctx.get("_m1") : $ctx._m1;

    return [api_element("ul", {
      key: 2
    }, [($cmp._ES5ProxyType ? $cmp.get("hasChildren") : $cmp.hasChildren) ? api_element("li", {
      key: 3
    }, [api_element("a", {
      attrs: {
        "href": "javascript:void(0)"
      },
      key: 4,
      on: {
        "click": _m0 || __setKey($ctx, "_m0", api_bind($cmp._ES5ProxyType ? $cmp.get("handleClick") : $cmp.handleClick))
      }
    }, [api_text("Toggle "), ($cmp._ES5ProxyType ? $cmp.get("isNodeCollapsed") : $cmp.isNodeCollapsed) ? api_element("span", {
      key: 5
    }, [api_text("(open)")]) : null, !($cmp._ES5ProxyType ? $cmp.get("isNodeCollapsed") : $cmp.isNodeCollapsed) ? api_element("span", {
      key: 6
    }, [api_text("(close)")]) : null])]) : null, api_element("li", {
      styleMap: {
        "display": "inline-block"
      },
      key: 7
    }, [api_text("Id: "), api_dynamic((_treeData = $cmp._ES5ProxyType ? $cmp.get("treeData") : $cmp.treeData, _id = _treeData._ES5ProxyType ? _treeData.get("id") : _treeData.id))]), api_element("li", {
      key: 8
    }, [api_text("Name: "), api_dynamic((_treeData2 = $cmp._ES5ProxyType ? $cmp.get("treeData") : $cmp.treeData, _name = _treeData2._ES5ProxyType ? _treeData2.get("name") : _treeData2.name))]), api_element("li", {
      key: 9
    }, [api_text("Address: "), api_dynamic((_treeData3 = $cmp._ES5ProxyType ? $cmp.get("treeData") : $cmp.treeData, _address = _treeData3._ES5ProxyType ? _treeData3.get("address") : _treeData3.address))]), api_element("li", {
      key: 10
    }, [api_text("Phone: "), api_dynamic((_treeData4 = $cmp._ES5ProxyType ? $cmp.get("treeData") : $cmp.treeData, _phone = _treeData4._ES5ProxyType ? _treeData4.get("phone") : _treeData4.phone))]), api_element("li", {
      key: 11
    }, [api_element("a", {
      attrs: {
        "href": "javascript:void"
      },
      key: 12,
      on: {
        "click": _m1 || __setKey($ctx, "_m1", api_bind($cmp._ES5ProxyType ? $cmp.get("handleRefresh") : $cmp.handleRefresh))
      }
    }, [api_text("Counter: "), api_dynamic($cmp._ES5ProxyType ? $cmp.get("counter") : $cmp.counter)])]), ($cmp._ES5ProxyType ? $cmp.get("hasChildrenAndIsNotCollapsed") : $cmp.hasChildrenAndIsNotCollapsed) ? api_element("li", {
      classMap: {
        "node": true
      },
      key: 14
    }, api_iterator((_treeData5 = $cmp._ES5ProxyType ? $cmp.get("treeData") : $cmp.treeData, _children = _treeData5._ES5ProxyType ? _treeData5.get("children") : _treeData5.children), function (child) {
      return api_custom_element("integration-tree-node", _integrationTreeNode, {
        props: {
          "treeData": child,
          "collapsedNodes": $cmp._ES5ProxyType ? $cmp.get("collapsedNodes") : $cmp.collapsedNodes
        },
        key: api_key(16, child._ES5ProxyType ? child.get("id") : child.id)
      }, []);
    })) : null])];
  }

  var _tmpl = lwc.registerTemplate(tmpl);

  __setKey(tmpl, "stylesheets", []);

  __setKey(tmpl, "stylesheetTokens", {
    hostAttribute: "integration-treeNode2_treeNode2-host",
    shadowAttribute: "integration-treeNode2_treeNode2"
  });

  var Tree2 =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(Tree2, _LightningElement);

    function Tree2() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, Tree2);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(Tree2), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "treeData", void 0);

      __setKey(_this, "collapsedNodes", []);

      __setKey(_this, "counter", 0);

      return _this;
    }

    _createClass(Tree2, [{
      key: "handleClick",
      value: function handleClick() {
        var _treeData, _id;

        __callKey1(this, "dispatchEvent", new CustomEvent('togglerow', {
          composed: true,
          bubbles: true,
          detail: {
            id: (_treeData = this._ES5ProxyType ? this.get("treeData") : this.treeData, _id = _treeData._ES5ProxyType ? _treeData.get("id") : _treeData.id)
          }
        }));
      }
    }, {
      key: "handleRefresh",
      value: function handleRefresh() {
        __setKeyPostfixIncrement(this, "counter");
      }
    }, {
      key: "hasChildren",
      get: function get() {
        var _treeData2, _children, _treeData3, _children2, _length;

        return (_treeData2 = this._ES5ProxyType ? this.get("treeData") : this.treeData, _children = _treeData2._ES5ProxyType ? _treeData2.get("children") : _treeData2.children) && !!(_treeData3 = this._ES5ProxyType ? this.get("treeData") : this.treeData, _children2 = _treeData3._ES5ProxyType ? _treeData3.get("children") : _treeData3.children, _length = _children2._ES5ProxyType ? _children2.get("length") : _children2.length);
      }
    }, {
      key: "isNodeCollapsed",
      get: function get() {
        var _treeData4, _id2;

        return __callKey1(this._ES5ProxyType ? this.get("collapsedNodes") : this.collapsedNodes, "includes", (_treeData4 = this._ES5ProxyType ? this.get("treeData") : this.treeData, _id2 = _treeData4._ES5ProxyType ? _treeData4.get("id") : _treeData4.id));
      }
    }, {
      key: "hasChildrenAndIsNotCollapsed",
      get: function get() {
        return (this._ES5ProxyType ? this.get("hasChildren") : this.hasChildren) && !(this._ES5ProxyType ? this.get("isNodeCollapsed") : this.isNodeCollapsed);
      }
    }]);

    return Tree2;
  }(lwc.LightningElement);

  lwc.registerDecorators(Tree2, {
    publicProps: {
      treeData: {
        config: 0
      },
      collapsedNodes: {
        config: 0
      }
    },
    track: {
      counter: 1
    }
  });

  var _integrationTreeNode2 = lwc.registerComponent(Tree2, {
    tmpl: _tmpl
  });

  function tmpl$1($api, $cmp, $slotset, $ctx) {
    var _treeData, _id, _treeData2, _name, _treeData3, _address, _treeData4, _phone, _treeData5, _children;

    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_bind = $api._ES5ProxyType ? $api.get("b") : $api.b,
        api_dynamic = $api._ES5ProxyType ? $api.get("d") : $api.d,
        api_key = $api._ES5ProxyType ? $api.get("k") : $api.k,
        api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c,
        api_iterator = $api._ES5ProxyType ? $api.get("i") : $api.i;

    var _m0 = $ctx._ES5ProxyType ? $ctx.get("_m0") : $ctx._m0,
        _m1 = $ctx._ES5ProxyType ? $ctx.get("_m1") : $ctx._m1;

    return [api_element("ul", {
      key: 2
    }, [($cmp._ES5ProxyType ? $cmp.get("hasChildren") : $cmp.hasChildren) ? api_element("li", {
      key: 3
    }, [api_element("a", {
      attrs: {
        "href": "javascript:void(0)"
      },
      key: 4,
      on: {
        "click": _m0 || __setKey($ctx, "_m0", api_bind($cmp._ES5ProxyType ? $cmp.get("handleClick") : $cmp.handleClick))
      }
    }, [api_text("Toggle "), ($cmp._ES5ProxyType ? $cmp.get("isNodeCollapsed") : $cmp.isNodeCollapsed) ? api_element("span", {
      key: 5
    }, [api_text("(open)")]) : null, !($cmp._ES5ProxyType ? $cmp.get("isNodeCollapsed") : $cmp.isNodeCollapsed) ? api_element("span", {
      key: 6
    }, [api_text("(close)")]) : null])]) : null, api_element("li", {
      styleMap: {
        "display": "inline-block"
      },
      key: 7
    }, [api_text("Id: "), api_dynamic((_treeData = $cmp._ES5ProxyType ? $cmp.get("treeData") : $cmp.treeData, _id = _treeData._ES5ProxyType ? _treeData.get("id") : _treeData.id))]), api_element("li", {
      key: 8
    }, [api_text("Name: "), api_dynamic((_treeData2 = $cmp._ES5ProxyType ? $cmp.get("treeData") : $cmp.treeData, _name = _treeData2._ES5ProxyType ? _treeData2.get("name") : _treeData2.name))]), api_element("li", {
      key: 9
    }, [api_text("Address: "), api_dynamic((_treeData3 = $cmp._ES5ProxyType ? $cmp.get("treeData") : $cmp.treeData, _address = _treeData3._ES5ProxyType ? _treeData3.get("address") : _treeData3.address))]), api_element("li", {
      key: 10
    }, [api_text("Phone: "), api_dynamic((_treeData4 = $cmp._ES5ProxyType ? $cmp.get("treeData") : $cmp.treeData, _phone = _treeData4._ES5ProxyType ? _treeData4.get("phone") : _treeData4.phone))]), api_element("li", {
      key: 11
    }, [api_element("a", {
      attrs: {
        "href": "javascript:void"
      },
      key: 12,
      on: {
        "click": _m1 || __setKey($ctx, "_m1", api_bind($cmp._ES5ProxyType ? $cmp.get("handleRefresh") : $cmp.handleRefresh))
      }
    }, [api_text("Counter: "), api_dynamic($cmp._ES5ProxyType ? $cmp.get("counter") : $cmp.counter)])]), ($cmp._ES5ProxyType ? $cmp.get("hasChildrenAndIsNotCollapsed") : $cmp.hasChildrenAndIsNotCollapsed) ? api_element("li", {
      classMap: {
        "node": true
      },
      key: 14
    }, api_iterator((_treeData5 = $cmp._ES5ProxyType ? $cmp.get("treeData") : $cmp.treeData, _children = _treeData5._ES5ProxyType ? _treeData5.get("children") : _treeData5.children), function (child) {
      return api_custom_element("integration-tree-node2", _integrationTreeNode2, {
        props: {
          "treeData": child,
          "collapsedNodes": $cmp._ES5ProxyType ? $cmp.get("collapsedNodes") : $cmp.collapsedNodes
        },
        key: api_key(16, child._ES5ProxyType ? child.get("id") : child.id)
      }, []);
    })) : null])];
  }

  var _tmpl$1 = lwc.registerTemplate(tmpl$1);

  __setKey(tmpl$1, "stylesheets", []);

  __setKey(tmpl$1, "stylesheetTokens", {
    hostAttribute: "integration-treeNode_treeNode-host",
    shadowAttribute: "integration-treeNode_treeNode"
  });

  var Tree1 =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(Tree1, _LightningElement);

    function Tree1() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, Tree1);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(Tree1), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "treeData", void 0);

      __setKey(_this, "collapsedNodes", []);

      __setKey(_this, "counter", 0);

      return _this;
    }

    _createClass(Tree1, [{
      key: "handleClick",
      value: function handleClick() {
        var _treeData, _id;

        __callKey1(this, "dispatchEvent", new CustomEvent('togglerow', {
          composed: true,
          bubbles: true,
          detail: {
            id: (_treeData = this._ES5ProxyType ? this.get("treeData") : this.treeData, _id = _treeData._ES5ProxyType ? _treeData.get("id") : _treeData.id)
          }
        }));
      }
    }, {
      key: "handleRefresh",
      value: function handleRefresh() {
        __setKeyPostfixIncrement(this, "counter");
      }
    }, {
      key: "hasChildren",
      get: function get() {
        var _treeData2, _children, _treeData3, _children2, _length;

        return (_treeData2 = this._ES5ProxyType ? this.get("treeData") : this.treeData, _children = _treeData2._ES5ProxyType ? _treeData2.get("children") : _treeData2.children) && !!(_treeData3 = this._ES5ProxyType ? this.get("treeData") : this.treeData, _children2 = _treeData3._ES5ProxyType ? _treeData3.get("children") : _treeData3.children, _length = _children2._ES5ProxyType ? _children2.get("length") : _children2.length);
      }
    }, {
      key: "isNodeCollapsed",
      get: function get() {
        var _treeData4, _id2;

        return __callKey1(this._ES5ProxyType ? this.get("collapsedNodes") : this.collapsedNodes, "includes", (_treeData4 = this._ES5ProxyType ? this.get("treeData") : this.treeData, _id2 = _treeData4._ES5ProxyType ? _treeData4.get("id") : _treeData4.id));
      }
    }, {
      key: "hasChildrenAndIsNotCollapsed",
      get: function get() {
        return (this._ES5ProxyType ? this.get("hasChildren") : this.hasChildren) && !(this._ES5ProxyType ? this.get("isNodeCollapsed") : this.isNodeCollapsed);
      }
    }]);

    return Tree1;
  }(lwc.LightningElement);

  lwc.registerDecorators(Tree1, {
    publicProps: {
      treeData: {
        config: 0
      },
      collapsedNodes: {
        config: 0
      }
    },
    track: {
      counter: 1
    }
  });

  var _integrationTreeNode = lwc.registerComponent(Tree1, {
    tmpl: _tmpl$1
  });

  function tmpl$2($api, $cmp, $slotset, $ctx) {
    var api_key = $api._ES5ProxyType ? $api.get("k") : $api.k,
        api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c,
        api_iterator = $api._ES5ProxyType ? $api.get("i") : $api.i;
    return api_iterator($cmp._ES5ProxyType ? $cmp.get("treeData") : $cmp.treeData, function (item) {
      return api_custom_element("integration-tree-node", _integrationTreeNode, {
        props: {
          "treeData": item,
          "collapsedNodes": $cmp._ES5ProxyType ? $cmp.get("collapsedNodes") : $cmp.collapsedNodes
        },
        key: api_key(3, item._ES5ProxyType ? item.get("id") : item.id)
      }, []);
    });
  }

  var _tmpl$2 = lwc.registerTemplate(tmpl$2);

  __setKey(tmpl$2, "stylesheets", []);

  __setKey(tmpl$2, "stylesheetTokens", {
    hostAttribute: "integration-treeGrid_treeGrid-host",
    shadowAttribute: "integration-treeGrid_treeGrid"
  });

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.compatKeys(source);

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = __concat(ownKeys, __callKey1(Object.getOwnPropertySymbols(source), "filter", function (sym) {
          var _Object$compatGetOwnP, _enumerable;

          return _Object$compatGetOwnP = Object.compatGetOwnPropertyDescriptor(source, sym), _enumerable = _Object$compatGetOwnP._ES5ProxyType ? _Object$compatGetOwnP.get("enumerable") : _Object$compatGetOwnP.enumerable;
        }));
      }

      __callKey1(ownKeys, "forEach", function (key) {
        _defineProperty$1(target, key, source._ES5ProxyType ? source.get(key) : source[key]);
      });
    }

    return target;
  }

  function _defineProperty$1(obj, key, value) {
    if (__inKey(obj, key)) {
      Object.compatDefineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      __setKey(obj, key, value);
    }

    return obj;
  }

  var Tree1$1 =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(Tree1, _LightningElement);

    function Tree1() {
      var _this;

      _classCallCheck(this, Tree1);

      _this = _possibleConstructorReturn(this, __callKey1(_getPrototypeOf(Tree1), "call", this));

      __setKey(_this, "treeData", void 0);

      __setKey(_this, "state", {});

      __callKey2(_this._ES5ProxyType ? _this.get("template") : _this.template, "addEventListener", 'togglerow', __callKey1(_this._ES5ProxyType ? _this.get("toggleRow") : _this.toggleRow, "bind", _assertThisInitialized(_assertThisInitialized(_this))));

      return _this;
    }

    _createClass(Tree1, [{
      key: "toggleRow",
      value: function toggleRow(event) {
        var _detail, _id, _state, _id2, _state2, _id3, _collapsed;

        __callKey0(event, "preventDefault");

        var id = (_detail = event._ES5ProxyType ? event.get("detail") : event.detail, _id = _detail._ES5ProxyType ? _detail.get("id") : _detail.id);

        __setKey(this, "state", _objectSpread({}, this._ES5ProxyType ? this.get("state") : this.state, _defineProperty({}, id, {
          collapsed: !((_state = this._ES5ProxyType ? this.get("state") : this.state, _id2 = _state._ES5ProxyType ? _state.get(id) : _state[id]) && (_state2 = this._ES5ProxyType ? this.get("state") : this.state, _id3 = _state2._ES5ProxyType ? _state2.get(id) : _state2[id], _collapsed = _id3._ES5ProxyType ? _id3.get("collapsed") : _id3.collapsed))
        })));
      }
    }, {
      key: "setState",
      value: function setState(state) {}
    }, {
      key: "collapsedNodes",
      get: function get() {
        var nodes = this._ES5ProxyType ? this.get("state") : this.state;

        var collapsedNodes = __callKey1(Object.compatKeys(nodes), "filter", function (node) {
          var _node, _collapsed2;

          return _node = nodes._ES5ProxyType ? nodes.get(node) : nodes[node], _collapsed2 = _node._ES5ProxyType ? _node.get("collapsed") : _node.collapsed;
        });

        return collapsedNodes;
      }
    }]);

    return Tree1;
  }(lwc.LightningElement);

  lwc.registerDecorators(Tree1$1, {
    publicProps: {
      treeData: {
        config: 0
      }
    },
    publicMethods: ["setState"],
    track: {
      state: 1
    }
  });

  var _integrationTreeGrid = lwc.registerComponent(Tree1$1, {
    tmpl: _tmpl$2
  });

  function tmpl$3($api, $cmp, $slotset, $ctx) {
    var api_text = $api._ES5ProxyType ? $api.get("t") : $api.t,
        api_bind = $api._ES5ProxyType ? $api.get("b") : $api.b,
        api_element = $api._ES5ProxyType ? $api.get("h") : $api.h,
        api_custom_element = $api._ES5ProxyType ? $api.get("c") : $api.c;

    var _m0 = $ctx._ES5ProxyType ? $ctx.get("_m0") : $ctx._m0;

    return [api_element("div", {
      key: 2
    }, [api_text("TreeContainer (owner of the data)"), api_element("button", {
      key: 3,
      on: {
        "click": _m0 || __setKey($ctx, "_m0", api_bind($cmp._ES5ProxyType ? $cmp.get("toggleAll") : $cmp.toggleAll))
      }
    }, [api_text("ToggleAll")]), api_custom_element("integration-tree-grid", _integrationTreeGrid, {
      props: {
        "treeData": $cmp._ES5ProxyType ? $cmp.get("myData") : $cmp.myData
      },
      key: 4
    }, [])])];
  }

  var _tmpl$3 = lwc.registerTemplate(tmpl$3);

  __setKey(tmpl$3, "stylesheets", []);

  __setKey(tmpl$3, "stylesheetTokens", {
    hostAttribute: "integration-simple-tree-grid_simple-tree-grid-host",
    shadowAttribute: "integration-simple-tree-grid_simple-tree-grid"
  });

  var _tmpl$4 = void 0;

  var DATA_FROM_NETWORK = [{
    id: '1',
    name: 'Name1',
    address: 'Address1',
    phone: 'phone1',
    children: [{
      id: "1.1",
      name: "Name1.1",
      address: 'Address1.1',
      phone: 'phone1.1'
    }, {
      id: "1.2",
      name: "Name1.2",
      address: 'Address1.2',
      phone: 'phone1.2',
      children: [{
        id: "1.2.1",
        name: "Name1.2.1",
        address: 'Address1.2.1',
        phone: 'phone1.2.1'
      }]
    }]
  }, {
    id: '2',
    name: 'Name2',
    address: 'Address2',
    phone: 'phone2',
    _isExpanded: false,
    children: [{
      id: "2.1",
      name: "Name2.1",
      address: 'Address2.1',
      phone: 'phone2.1'
    }]
  }];
  var data = lwc.registerComponent(DATA_FROM_NETWORK, {
    tmpl: _tmpl$4
  });

  var TreeContainer =
  /*#__PURE__*/
  function (_LightningElement) {
    _inherits(TreeContainer, _LightningElement);

    function TreeContainer() {
      var _getPrototypeOf2, _getPrototypeOf3, _call;

      var _this;

      _classCallCheck(this, TreeContainer);

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        __setKey(args, _key, arguments[_key]);
      }

      _this = _possibleConstructorReturn(this, __callKey2((_getPrototypeOf3 = _getPrototypeOf2 = _getPrototypeOf(TreeContainer), _call = _getPrototypeOf3._ES5ProxyType ? _getPrototypeOf3.get("call") : _getPrototypeOf3.call), "apply", _getPrototypeOf2, __concat([this], args)));

      __setKey(_this, "myData", data);

      return _this;
    }

    _createClass(TreeContainer, [{
      key: "toggleAll",
      value: function toggleAll() {}
    }]);

    return TreeContainer;
  }(lwc.LightningElement);

  lwc.registerDecorators(TreeContainer, {
    track: {
      myData: 1
    }
  });

  var Cmp = lwc.registerComponent(TreeContainer, {
    tmpl: _tmpl$3
  });

  var fallback = __callKey1(location._ES5ProxyType ? location.get("search") : location.search, "indexOf", 'nativeShadow=true') !== -1 ? false : true;
  var element = lwc.createElement('integration-simple-tree-grid', {
    is: Cmp,
    fallback: fallback
  });

  __callKey1(document._ES5ProxyType ? document.get("body") : document.body, "appendChild", element);

}(Engine));
