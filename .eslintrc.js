// Don't bother warning on these
const ignoredProperties = ['constructor', 'length', 'link']

const objectProtoFunctions = Object.keys(Object.getOwnPropertyDescriptors(Object.prototype))
  .filter(_ => ![...ignoredProperties].includes(_))

const arrayProtoFunctions = Object.keys(Object.getOwnPropertyDescriptors(Array.prototype))
  .filter(_ => ![...objectProtoFunctions, ...ignoredProperties].includes(_))

// Functions like `join` are ambiguous – for warning, consider it Array.prototype.*, not String.prototype.*
const stringProtoFunctions = Object.keys(Object.getOwnPropertyDescriptors(String.prototype))
  .filter(_ => ![...objectProtoFunctions, ...arrayProtoFunctions, ...ignoredProperties].includes(_))

module.exports = {
  "root": true,

  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "sourceType": "module"
  },

  "plugins": [
    "jest",
    "@lwc/lwc-internal",
    "@typescript-eslint",
    "import"
  ],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended"
  ],

  "env": {
    "es6": true
  },

  "rules": {
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {"argsIgnorePattern": "^_"}
    ],

    "block-scoped-var": "error",
    "no-alert": "error",
    "no-buffer-constructor": "error",
    "no-console": "error",
    "no-eval": "error",
    "no-extend-native": "error",
    "no-extra-bind": "error",
    "no-extra-label": "error",
    "no-iterator": "error",
    "no-lone-blocks": "error",
    "no-proto": "error",
    "no-prototype-builtins": "error",
    "no-new-require": "error",
    "no-restricted-properties": ["error", {
      "object": "arguments",
      "property": "callee",
      "message": "arguments.callee is deprecated"
    }, {
      "object": "global",
      "property": "isFinite",
      "message": "Please use Number.isFinite instead"
    }, {
      "object": "self",
      "property": "isFinite",
      "message": "Please use Number.isFinite instead"
    }, {
      "object": "window",
      "property": "isFinite",
      "message": "Please use Number.isFinite instead"
    }, {
      "object": "global",
      "property": "isNaN",
      "message": "Please use Number.isNaN instead"
    }, {
      "object": "self",
      "property": "isNaN",
      "message": "Please use Number.isNaN instead"
    }, {
      "object": "window",
      "property": "isNaN",
      "message": "Please use Number.isNaN instead"
    }, {
      "property": "__defineGetter__",
      "message": "Please use Object.defineProperty instead."
    }, {
      "property": "__defineSetter__",
      "message": "Please use Object.defineProperty instead."
    }, {
      "object": "Math",
      "property": "pow",
      "message": "Use the exponentiation operator (**) instead."
    }, {
      "object": "globalThis",
      "property": "lwcRuntimeFlags",
      "message": "Use the bare global lwcRuntimeFlags instead."
    }],
    "no-self-compare": "error",
    "no-undef-init": "error",
    "no-useless-computed-key": "error",
    "no-useless-return": "error",
    "prefer-const": ["error", {
      "destructuring": "any",
      "ignoreReadBeforeAssign": true
    }],
    "template-curly-spacing": "error",
    "yoda": "error",

    "@lwc/lwc-internal/no-invalid-todo": "error",
    "import/order": [
      "error",
      {"groups": ["builtin", "external", "internal", "parent", "index", "sibling", "object", "type"]}
    ],
    "no-restricted-imports": ["error", {
      "name": "@lwc/features",
      "importNames": ["lwcRuntimeFlags", "runtimeFlags", "default"],
      "message": "Do not directly import runtime flags from @lwc/features. Use the global lwcRuntimeFlags variable instead."
    }]
  },

  "overrides": [
    {
      "files": [
        "**/@lwc/engine-core/**",
        "**/@lwc/engine-dom/**",
        "**/@lwc/synthetic-shadow/**"
      ],
      "rules": {
        "@lwc/lwc-internal/no-global-node": "error",
        "prefer-rest-params": "off",
        "prefer-spread": "off"
      }
    },
    {
      "files": [
        "**/__tests__/**",
        "**/__mocks__/**",
        "**/@lwc/integration-karma/**"
      ],

      "env": {
        "jest": true,
        "es6": true,
        "es2017": true,
        "es2020": true
      },

      "rules": {
        "jest/no-focused-tests": "error",
        "jest/valid-expect": "error",
        "jest/valid-expect-in-promise": "error",
        "no-restricted-properties": "off"
      }
    },
    {
      "files": [
        "**/@lwc/integration-tests/**"
      ],

      "globals": {
        "$": true,
        "browser": true
      }
    },
    {
      "files": [
        "./*.js",
        "**/scripts/**",
        "**/jest.config.js"
      ],

      "env": {
        "node": true,
        "jest": true
      },

      "rules": {
        "no-console": "off"
      }
    },
    {
      "files": [
        "**/perf-benchmarks/**"
      ],

      "globals": {
        "after": true,
        "before": true,
        "benchmark": true,
        "run": true
      }
    },
    {
      // For server-side code, we don't need to use @lwc/shared because the perf improvement from minification and
      // protection from prototype pollution are not as important. So we only target client-side packages (and only
      // those that can actually import @lwc/shared).
      "files": [
        "**/@lwc/aria-reflection/src/**",
        "**/@lwc/engine-core/src/**",
        "**/@lwc/engine-dom/src/**",
        "**/@lwc/synthetic-shadow/src/**",
        "**/@lwc/wire-service/src/**"
      ],
      excludedFiles: [
        "**/__tests__/**",
      ],
      "rules": {
        "no-restricted-properties": [
          "error",
          {
            "object": "Object",
            "message": "Instead of Object.* functions, use @lwc/shared."
          },
          {
            "object": "Array",
            "message": "Instead of Array.* functions, use @lwc/shared."
          },
          ...objectProtoFunctions.map(property => ({
            property,
            "message": "Instead of Object.prototype.* functions, use @lwc/shared."
          })),
          ...arrayProtoFunctions.map(property => ({
            property,
            "message": "Instead of Array.prototype.* functions, use @lwc/shared."
          })),
          ...stringProtoFunctions.map(property => ({
            property,
            "message": "Instead of String.prototype.* functions, use @lwc/shared."
          })),
        ]
      }
    }
  ]
}
