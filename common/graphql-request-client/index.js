"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
require("cross-fetch/polyfill");
var printer_1 = require("graphql/language/printer");
var types_1 = require("./types");
exports.ClientError = types_1.ClientError;
var GraphQLClient = /** @class */ (function () {
    function GraphQLClient(url, options) {
        this.url = url;
        this.options = options || {};
    }
    // async rawRequest<T extends any>(
    //   query: string,
    //   variables?: Variables
    // ): Promise<{ data?: T; extensions?: any; headers: Headers; status: number; errors?: GraphQLError[] }> {
    //   const { headers, ...others } = this.options;
    //   const body = JSON.stringify({
    //     query,
    //     variables: variables ? variables : undefined
    //   });
    //   const response = await fetch(this.url, {
    //     method: 'POST',
    //     headers: this.processHeaders(Object.assign({ 'Content-Type': 'application/json' }, headers)),
    //     body,
    //     ...others
    //   });
    //   const result = await getResult(response);
    //   if (response.ok && !result.errors && result.data) {
    //     // tslint:disable-next-line
    //     const { headers, status } = response;
    //     return { ...result, headers, status };
    //   } else {
    //     const errorResult = typeof result === 'string' ? { error: result } : result;
    //     throw new ClientError(
    //       { ...errorResult, status: response.status, headers: response.headers },
    //       { query, variables }
    //     );
    //   }
    // }
    GraphQLClient.prototype.request = function (query, variables, options) {
        return __awaiter(this, void 0, void 0, function () {
            var opt, headers, token, others, body, response, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        opt = __assign({}, this.options, options);
                        headers = opt.headers, token = opt.token, others = __rest(opt, ["headers", "token"]);
                        if (token) {
                            headers.Authorization = "Bearer: " + token;
                        }
                        if (others.debug) {
                            console.log('\x1b[1m', '=== DEBUG QUERY TO GRAPHQL ===', '\x1b[0m', '\x1b[32m', "\n " + (typeof query === 'string' ? query : printer_1.print(query)), '\x1b[0m');
                            if (variables) {
                                console.log('   variables:\n', variables);
                            }
                            if (token) {
                                console.log('   \nauth:', "\n { \"Authorization\": \"" + headers.Authorization + "\" }");
                            }
                            console.log('\x1b[1m', '=== DEBUG QUERY TO GRAPHQL ===', '\x1b[0m');
                        }
                        body = JSON.stringify({
                            query: typeof query === 'string' ? query : printer_1.print(query),
                            variables: variables ? variables : undefined
                        });
                        return [4 /*yield*/, fetch(this.url, __assign({ method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, headers), body: body }, others))];
                    case 1:
                        response = _a.sent();
                        return [4 /*yield*/, getResult(response)];
                    case 2:
                        result = _a.sent();
                        if (response.ok && !result.errors && result.data) {
                            return [2 /*return*/, result.data];
                        }
                        else {
                            console.error('GraphQL request errors', result.errors);
                            console.error({ query: query, variables: variables });
                            result.error = true;
                            return [2 /*return*/, result];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    GraphQLClient.prototype.setHeaders = function (headers) {
        this.options.headers = headers;
        return this;
    };
    GraphQLClient.prototype.setHeader = function (key, value) {
        var _a;
        var headers = this.options.headers;
        if (headers) {
            headers[key] = value;
        }
        else {
            this.options.headers = (_a = {}, _a[key] = value, _a);
        }
        return this;
    };
    return GraphQLClient;
}());
exports["default"] = GraphQLClient;
// export async function rawRequest<T extends any>(
//   url: string,
//   query: string,
//   variables?: Variables
// ): Promise<{ data?: T; extensions?: any; headers: Headers; status: number; errors?: GraphQLError[] }> {
//   const client = new GraphQLClient(url);
//   return client.rawRequest<T>(query, variables);
// }
// export async function request<T extends any>(url: string, query: string, variables?: Variables): Promise<T> {
//   const client = new GraphQLClient(url);
//   return client.request<T>(query, variables);
// }
// export default request;
function getResult(response) {
    return __awaiter(this, void 0, void 0, function () {
        var contentType;
        return __generator(this, function (_a) {
            contentType = response.headers.get('Content-Type');
            if (contentType && contentType.startsWith('application/json')) {
                return [2 /*return*/, response.json()];
            }
            else {
                return [2 /*return*/, response.text()];
            }
            return [2 /*return*/];
        });
    });
}
