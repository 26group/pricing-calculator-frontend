"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/index.ts
var src_exports = {};
__export(src_exports, {
  AuthKitProvider: () => AuthKitProvider,
  getClaims: () => import_authkit_js2.getClaims,
  useAuth: () => useAuth
});
module.exports = __toCommonJS(src_exports);

// src/hook.ts
var React2 = __toESM(require("react"));

// src/context.ts
var React = __toESM(require("react"));

// src/state.ts
var initialState = {
  isLoading: true,
  user: null,
  role: null,
  roles: null,
  organizationId: null,
  permissions: [],
  featureFlags: [],
  impersonator: null
};

// src/context.ts
var Context = React.createContext(
  initialState
);

// src/hook.ts
function useAuth() {
  const context = React2.useContext(Context);
  if (context === initialState) {
    throw new Error("useAuth must be used within an AuthKitProvider");
  }
  return context;
}

// src/provider.tsx
var React3 = __toESM(require("react"));
var import_authkit_js = require("@workos-inc/authkit-js");
function AuthKitProvider(props) {
  const {
    clientId,
    devMode,
    apiHostname,
    https,
    port,
    redirectUri,
    children,
    onRefresh,
    onRefreshFailure,
    onRedirectCallback,
    refreshBufferInterval
  } = props;
  const [client, setClient] = React3.useState(NOOP_CLIENT);
  const [state, setState] = React3.useState(initialState);
  const handleRefresh = React3.useCallback(
    (response) => {
      const {
        user,
        accessToken,
        organizationId = null,
        impersonator = null
      } = response;
      const {
        role = null,
        roles = null,
        permissions = [],
        feature_flags: featureFlags = []
      } = (0, import_authkit_js.getClaims)(accessToken);
      setState((prev) => {
        const next = __spreadProps(__spreadValues({}, prev), {
          user,
          organizationId,
          role,
          roles,
          permissions,
          featureFlags,
          impersonator
        });
        return isEquivalentWorkOSSession(prev, next) ? prev : next;
      });
      onRefresh == null ? void 0 : onRefresh(response);
    },
    [client]
  );
  React3.useEffect(() => {
    function initialize() {
      const timeoutId = setTimeout(() => {
        (0, import_authkit_js.createClient)(clientId, {
          apiHostname,
          port,
          https,
          redirectUri,
          devMode,
          onRedirectCallback,
          onRefresh: handleRefresh,
          onRefreshFailure,
          refreshBufferInterval
        }).then((client2) => __async(this, null, function* () {
          const user = client2.getUser();
          setClient({
            getAccessToken: client2.getAccessToken.bind(client2),
            getUser: client2.getUser.bind(client2),
            signIn: client2.signIn.bind(client2),
            signUp: client2.signUp.bind(client2),
            signOut: client2.signOut.bind(client2),
            switchToOrganization: client2.switchToOrganization.bind(client2)
          });
          setState((prev) => __spreadProps(__spreadValues({}, prev), { isLoading: false, user }));
        }));
      });
      return () => {
        clearTimeout(timeoutId);
      };
    }
    setClient(NOOP_CLIENT);
    setState(initialState);
    return initialize();
  }, [clientId, apiHostname, https, port, redirectUri, refreshBufferInterval]);
  return /* @__PURE__ */ React3.createElement(Context.Provider, { value: __spreadValues(__spreadValues({}, client), state) }, children);
}
function isEquivalentWorkOSSession(a, b) {
  var _a, _b, _c, _d, _e, _f;
  return ((_a = a.user) == null ? void 0 : _a.updatedAt) === ((_b = b.user) == null ? void 0 : _b.updatedAt) && a.organizationId === b.organizationId && a.role === b.role && a.roles === b.roles && a.permissions.length === b.permissions.length && a.permissions.every((perm, i) => perm === b.permissions[i]) && a.featureFlags.length === b.featureFlags.length && a.featureFlags.every((flag, i) => flag === b.featureFlags[i]) && ((_c = a.impersonator) == null ? void 0 : _c.email) === ((_d = b.impersonator) == null ? void 0 : _d.email) && ((_e = a.impersonator) == null ? void 0 : _e.reason) === ((_f = b.impersonator) == null ? void 0 : _f.reason);
}
var NOOP_CLIENT = {
  signIn: () => __async(void 0, null, function* () {
  }),
  signUp: () => __async(void 0, null, function* () {
  }),
  getUser: () => null,
  getAccessToken: () => Promise.reject(new import_authkit_js.LoginRequiredError()),
  switchToOrganization: () => Promise.resolve(),
  signOut: () => __async(void 0, null, function* () {
  })
};

// src/index.ts
var import_authkit_js2 = require("@workos-inc/authkit-js");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AuthKitProvider,
  getClaims,
  useAuth
});
//# sourceMappingURL=index.js.map