"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => NotebrainPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian16 = require("obsidian");

// node_modules/openai/internal/qs/formats.mjs
var default_format = "RFC3986";
var formatters = {
  RFC1738: (v) => String(v).replace(/%20/g, "+"),
  RFC3986: (v) => String(v)
};
var RFC1738 = "RFC1738";

// node_modules/openai/internal/qs/utils.mjs
var is_array = Array.isArray;
var hex_table = (() => {
  const array = [];
  for (let i = 0; i < 256; ++i) {
    array.push("%" + ((i < 16 ? "0" : "") + i.toString(16)).toUpperCase());
  }
  return array;
})();
var limit = 1024;
var encode = (str2, _defaultEncoder, charset, _kind, format) => {
  if (str2.length === 0) {
    return str2;
  }
  let string = str2;
  if (typeof str2 === "symbol") {
    string = Symbol.prototype.toString.call(str2);
  } else if (typeof str2 !== "string") {
    string = String(str2);
  }
  if (charset === "iso-8859-1") {
    return escape(string).replace(/%u[0-9a-f]{4}/gi, function($0) {
      return "%26%23" + parseInt($0.slice(2), 16) + "%3B";
    });
  }
  let out = "";
  for (let j = 0; j < string.length; j += limit) {
    const segment = string.length >= limit ? string.slice(j, j + limit) : string;
    const arr = [];
    for (let i = 0; i < segment.length; ++i) {
      let c = segment.charCodeAt(i);
      if (c === 45 || // -
      c === 46 || // .
      c === 95 || // _
      c === 126 || // ~
      c >= 48 && c <= 57 || // 0-9
      c >= 65 && c <= 90 || // a-z
      c >= 97 && c <= 122 || // A-Z
      format === RFC1738 && (c === 40 || c === 41)) {
        arr[arr.length] = segment.charAt(i);
        continue;
      }
      if (c < 128) {
        arr[arr.length] = hex_table[c];
        continue;
      }
      if (c < 2048) {
        arr[arr.length] = hex_table[192 | c >> 6] + hex_table[128 | c & 63];
        continue;
      }
      if (c < 55296 || c >= 57344) {
        arr[arr.length] = hex_table[224 | c >> 12] + hex_table[128 | c >> 6 & 63] + hex_table[128 | c & 63];
        continue;
      }
      i += 1;
      c = 65536 + ((c & 1023) << 10 | segment.charCodeAt(i) & 1023);
      arr[arr.length] = hex_table[240 | c >> 18] + hex_table[128 | c >> 12 & 63] + hex_table[128 | c >> 6 & 63] + hex_table[128 | c & 63];
    }
    out += arr.join("");
  }
  return out;
};
function is_buffer(obj) {
  if (!obj || typeof obj !== "object") {
    return false;
  }
  return !!(obj.constructor && obj.constructor.isBuffer && obj.constructor.isBuffer(obj));
}
function maybe_map(val, fn) {
  if (is_array(val)) {
    const mapped = [];
    for (let i = 0; i < val.length; i += 1) {
      mapped.push(fn(val[i]));
    }
    return mapped;
  }
  return fn(val);
}

// node_modules/openai/internal/qs/stringify.mjs
var has = Object.prototype.hasOwnProperty;
var array_prefix_generators = {
  brackets(prefix) {
    return String(prefix) + "[]";
  },
  comma: "comma",
  indices(prefix, key) {
    return String(prefix) + "[" + key + "]";
  },
  repeat(prefix) {
    return String(prefix);
  }
};
var is_array2 = Array.isArray;
var push = Array.prototype.push;
var push_to_array = function(arr, value_or_array) {
  push.apply(arr, is_array2(value_or_array) ? value_or_array : [value_or_array]);
};
var to_ISO = Date.prototype.toISOString;
var defaults = {
  addQueryPrefix: false,
  allowDots: false,
  allowEmptyArrays: false,
  arrayFormat: "indices",
  charset: "utf-8",
  charsetSentinel: false,
  delimiter: "&",
  encode: true,
  encodeDotInKeys: false,
  encoder: encode,
  encodeValuesOnly: false,
  format: default_format,
  formatter: formatters[default_format],
  /** @deprecated */
  indices: false,
  serializeDate(date) {
    return to_ISO.call(date);
  },
  skipNulls: false,
  strictNullHandling: false
};
function is_non_nullish_primitive(v) {
  return typeof v === "string" || typeof v === "number" || typeof v === "boolean" || typeof v === "symbol" || typeof v === "bigint";
}
var sentinel = {};
function inner_stringify(object, prefix, generateArrayPrefix, commaRoundTrip, allowEmptyArrays, strictNullHandling, skipNulls, encodeDotInKeys, encoder, filter, sort, allowDots, serializeDate, format, formatter, encodeValuesOnly, charset, sideChannel) {
  let obj = object;
  let tmp_sc = sideChannel;
  let step = 0;
  let find_flag = false;
  while ((tmp_sc = tmp_sc.get(sentinel)) !== void 0 && !find_flag) {
    const pos = tmp_sc.get(object);
    step += 1;
    if (typeof pos !== "undefined") {
      if (pos === step) {
        throw new RangeError("Cyclic object value");
      } else {
        find_flag = true;
      }
    }
    if (typeof tmp_sc.get(sentinel) === "undefined") {
      step = 0;
    }
  }
  if (typeof filter === "function") {
    obj = filter(prefix, obj);
  } else if (obj instanceof Date) {
    obj = serializeDate?.(obj);
  } else if (generateArrayPrefix === "comma" && is_array2(obj)) {
    obj = maybe_map(obj, function(value) {
      if (value instanceof Date) {
        return serializeDate?.(value);
      }
      return value;
    });
  }
  if (obj === null) {
    if (strictNullHandling) {
      return encoder && !encodeValuesOnly ? (
        // @ts-expect-error
        encoder(prefix, defaults.encoder, charset, "key", format)
      ) : prefix;
    }
    obj = "";
  }
  if (is_non_nullish_primitive(obj) || is_buffer(obj)) {
    if (encoder) {
      const key_value = encodeValuesOnly ? prefix : encoder(prefix, defaults.encoder, charset, "key", format);
      return [
        formatter?.(key_value) + "=" + // @ts-expect-error
        formatter?.(encoder(obj, defaults.encoder, charset, "value", format))
      ];
    }
    return [formatter?.(prefix) + "=" + formatter?.(String(obj))];
  }
  const values = [];
  if (typeof obj === "undefined") {
    return values;
  }
  let obj_keys;
  if (generateArrayPrefix === "comma" && is_array2(obj)) {
    if (encodeValuesOnly && encoder) {
      obj = maybe_map(obj, encoder);
    }
    obj_keys = [{ value: obj.length > 0 ? obj.join(",") || null : void 0 }];
  } else if (is_array2(filter)) {
    obj_keys = filter;
  } else {
    const keys = Object.keys(obj);
    obj_keys = sort ? keys.sort(sort) : keys;
  }
  const encoded_prefix = encodeDotInKeys ? String(prefix).replace(/\./g, "%2E") : String(prefix);
  const adjusted_prefix = commaRoundTrip && is_array2(obj) && obj.length === 1 ? encoded_prefix + "[]" : encoded_prefix;
  if (allowEmptyArrays && is_array2(obj) && obj.length === 0) {
    return adjusted_prefix + "[]";
  }
  for (let j = 0; j < obj_keys.length; ++j) {
    const key = obj_keys[j];
    const value = (
      // @ts-ignore
      typeof key === "object" && typeof key.value !== "undefined" ? key.value : obj[key]
    );
    if (skipNulls && value === null) {
      continue;
    }
    const encoded_key = allowDots && encodeDotInKeys ? key.replace(/\./g, "%2E") : key;
    const key_prefix = is_array2(obj) ? typeof generateArrayPrefix === "function" ? generateArrayPrefix(adjusted_prefix, encoded_key) : adjusted_prefix : adjusted_prefix + (allowDots ? "." + encoded_key : "[" + encoded_key + "]");
    sideChannel.set(object, step);
    const valueSideChannel = /* @__PURE__ */ new WeakMap();
    valueSideChannel.set(sentinel, sideChannel);
    push_to_array(values, inner_stringify(
      value,
      key_prefix,
      generateArrayPrefix,
      commaRoundTrip,
      allowEmptyArrays,
      strictNullHandling,
      skipNulls,
      encodeDotInKeys,
      // @ts-ignore
      generateArrayPrefix === "comma" && encodeValuesOnly && is_array2(obj) ? null : encoder,
      filter,
      sort,
      allowDots,
      serializeDate,
      format,
      formatter,
      encodeValuesOnly,
      charset,
      valueSideChannel
    ));
  }
  return values;
}
function normalize_stringify_options(opts = defaults) {
  if (typeof opts.allowEmptyArrays !== "undefined" && typeof opts.allowEmptyArrays !== "boolean") {
    throw new TypeError("`allowEmptyArrays` option can only be `true` or `false`, when provided");
  }
  if (typeof opts.encodeDotInKeys !== "undefined" && typeof opts.encodeDotInKeys !== "boolean") {
    throw new TypeError("`encodeDotInKeys` option can only be `true` or `false`, when provided");
  }
  if (opts.encoder !== null && typeof opts.encoder !== "undefined" && typeof opts.encoder !== "function") {
    throw new TypeError("Encoder has to be a function.");
  }
  const charset = opts.charset || defaults.charset;
  if (typeof opts.charset !== "undefined" && opts.charset !== "utf-8" && opts.charset !== "iso-8859-1") {
    throw new TypeError("The charset option must be either utf-8, iso-8859-1, or undefined");
  }
  let format = default_format;
  if (typeof opts.format !== "undefined") {
    if (!has.call(formatters, opts.format)) {
      throw new TypeError("Unknown format option provided.");
    }
    format = opts.format;
  }
  const formatter = formatters[format];
  let filter = defaults.filter;
  if (typeof opts.filter === "function" || is_array2(opts.filter)) {
    filter = opts.filter;
  }
  let arrayFormat;
  if (opts.arrayFormat && opts.arrayFormat in array_prefix_generators) {
    arrayFormat = opts.arrayFormat;
  } else if ("indices" in opts) {
    arrayFormat = opts.indices ? "indices" : "repeat";
  } else {
    arrayFormat = defaults.arrayFormat;
  }
  if ("commaRoundTrip" in opts && typeof opts.commaRoundTrip !== "boolean") {
    throw new TypeError("`commaRoundTrip` must be a boolean, or absent");
  }
  const allowDots = typeof opts.allowDots === "undefined" ? !!opts.encodeDotInKeys === true ? true : defaults.allowDots : !!opts.allowDots;
  return {
    addQueryPrefix: typeof opts.addQueryPrefix === "boolean" ? opts.addQueryPrefix : defaults.addQueryPrefix,
    // @ts-ignore
    allowDots,
    allowEmptyArrays: typeof opts.allowEmptyArrays === "boolean" ? !!opts.allowEmptyArrays : defaults.allowEmptyArrays,
    arrayFormat,
    charset,
    charsetSentinel: typeof opts.charsetSentinel === "boolean" ? opts.charsetSentinel : defaults.charsetSentinel,
    commaRoundTrip: !!opts.commaRoundTrip,
    delimiter: typeof opts.delimiter === "undefined" ? defaults.delimiter : opts.delimiter,
    encode: typeof opts.encode === "boolean" ? opts.encode : defaults.encode,
    encodeDotInKeys: typeof opts.encodeDotInKeys === "boolean" ? opts.encodeDotInKeys : defaults.encodeDotInKeys,
    encoder: typeof opts.encoder === "function" ? opts.encoder : defaults.encoder,
    encodeValuesOnly: typeof opts.encodeValuesOnly === "boolean" ? opts.encodeValuesOnly : defaults.encodeValuesOnly,
    filter,
    format,
    formatter,
    serializeDate: typeof opts.serializeDate === "function" ? opts.serializeDate : defaults.serializeDate,
    skipNulls: typeof opts.skipNulls === "boolean" ? opts.skipNulls : defaults.skipNulls,
    // @ts-ignore
    sort: typeof opts.sort === "function" ? opts.sort : null,
    strictNullHandling: typeof opts.strictNullHandling === "boolean" ? opts.strictNullHandling : defaults.strictNullHandling
  };
}
function stringify(object, opts = {}) {
  let obj = object;
  const options = normalize_stringify_options(opts);
  let obj_keys;
  let filter;
  if (typeof options.filter === "function") {
    filter = options.filter;
    obj = filter("", obj);
  } else if (is_array2(options.filter)) {
    filter = options.filter;
    obj_keys = filter;
  }
  const keys = [];
  if (typeof obj !== "object" || obj === null) {
    return "";
  }
  const generateArrayPrefix = array_prefix_generators[options.arrayFormat];
  const commaRoundTrip = generateArrayPrefix === "comma" && options.commaRoundTrip;
  if (!obj_keys) {
    obj_keys = Object.keys(obj);
  }
  if (options.sort) {
    obj_keys.sort(options.sort);
  }
  const sideChannel = /* @__PURE__ */ new WeakMap();
  for (let i = 0; i < obj_keys.length; ++i) {
    const key = obj_keys[i];
    if (options.skipNulls && obj[key] === null) {
      continue;
    }
    push_to_array(keys, inner_stringify(
      obj[key],
      key,
      // @ts-expect-error
      generateArrayPrefix,
      commaRoundTrip,
      options.allowEmptyArrays,
      options.strictNullHandling,
      options.skipNulls,
      options.encodeDotInKeys,
      options.encode ? options.encoder : null,
      options.filter,
      options.sort,
      options.allowDots,
      options.serializeDate,
      options.format,
      options.formatter,
      options.encodeValuesOnly,
      options.charset,
      sideChannel
    ));
  }
  const joined = keys.join(options.delimiter);
  let prefix = options.addQueryPrefix === true ? "?" : "";
  if (options.charsetSentinel) {
    if (options.charset === "iso-8859-1") {
      prefix += "utf8=%26%2310003%3B&";
    } else {
      prefix += "utf8=%E2%9C%93&";
    }
  }
  return joined.length > 0 ? prefix + joined : "";
}

// node_modules/openai/version.mjs
var VERSION = "4.104.0";

// node_modules/openai/_shims/registry.mjs
var auto = false;
var kind = void 0;
var fetch2 = void 0;
var Request2 = void 0;
var Response2 = void 0;
var Headers2 = void 0;
var FormData2 = void 0;
var Blob2 = void 0;
var File2 = void 0;
var ReadableStream2 = void 0;
var getMultipartRequestOptions = void 0;
var getDefaultAgent = void 0;
var fileFromPath = void 0;
var isFsReadStream = void 0;
function setShims(shims, options = { auto: false }) {
  if (auto) {
    throw new Error(`you must \`import 'openai/shims/${shims.kind}'\` before importing anything else from openai`);
  }
  if (kind) {
    throw new Error(`can't \`import 'openai/shims/${shims.kind}'\` after \`import 'openai/shims/${kind}'\``);
  }
  auto = options.auto;
  kind = shims.kind;
  fetch2 = shims.fetch;
  Request2 = shims.Request;
  Response2 = shims.Response;
  Headers2 = shims.Headers;
  FormData2 = shims.FormData;
  Blob2 = shims.Blob;
  File2 = shims.File;
  ReadableStream2 = shims.ReadableStream;
  getMultipartRequestOptions = shims.getMultipartRequestOptions;
  getDefaultAgent = shims.getDefaultAgent;
  fileFromPath = shims.fileFromPath;
  isFsReadStream = shims.isFsReadStream;
}

// node_modules/openai/_shims/MultipartBody.mjs
var MultipartBody = class {
  constructor(body) {
    this.body = body;
  }
  get [Symbol.toStringTag]() {
    return "MultipartBody";
  }
};

// node_modules/openai/_shims/web-runtime.mjs
function getRuntime({ manuallyImported } = {}) {
  const recommendation = manuallyImported ? `You may need to use polyfills` : `Add one of these imports before your first \`import \u2026 from 'openai'\`:
- \`import 'openai/shims/node'\` (if you're running on Node)
- \`import 'openai/shims/web'\` (otherwise)
`;
  let _fetch, _Request, _Response, _Headers;
  try {
    _fetch = fetch;
    _Request = Request;
    _Response = Response;
    _Headers = Headers;
  } catch (error) {
    throw new Error(`this environment is missing the following Web Fetch API type: ${error.message}. ${recommendation}`);
  }
  return {
    kind: "web",
    fetch: _fetch,
    Request: _Request,
    Response: _Response,
    Headers: _Headers,
    FormData: (
      // @ts-ignore
      typeof FormData !== "undefined" ? FormData : class FormData {
        // @ts-ignore
        constructor() {
          throw new Error(`file uploads aren't supported in this environment yet as 'FormData' is undefined. ${recommendation}`);
        }
      }
    ),
    Blob: typeof Blob !== "undefined" ? Blob : class Blob {
      constructor() {
        throw new Error(`file uploads aren't supported in this environment yet as 'Blob' is undefined. ${recommendation}`);
      }
    },
    File: (
      // @ts-ignore
      typeof File !== "undefined" ? File : class File {
        // @ts-ignore
        constructor() {
          throw new Error(`file uploads aren't supported in this environment yet as 'File' is undefined. ${recommendation}`);
        }
      }
    ),
    ReadableStream: (
      // @ts-ignore
      typeof ReadableStream !== "undefined" ? ReadableStream : class ReadableStream {
        // @ts-ignore
        constructor() {
          throw new Error(`streaming isn't supported in this environment yet as 'ReadableStream' is undefined. ${recommendation}`);
        }
      }
    ),
    getMultipartRequestOptions: async (form, opts) => ({
      ...opts,
      body: new MultipartBody(form)
    }),
    getDefaultAgent: (url) => void 0,
    fileFromPath: () => {
      throw new Error("The `fileFromPath` function is only supported in Node. See the README for more details: https://www.github.com/openai/openai-node#file-uploads");
    },
    isFsReadStream: (value) => false
  };
}

// node_modules/openai/_shims/index.mjs
var init = () => {
  if (!kind) setShims(getRuntime(), { auto: true });
};
init();

// node_modules/openai/error.mjs
var OpenAIError = class extends Error {
};
var APIError = class _APIError extends OpenAIError {
  constructor(status, error, message, headers) {
    super(`${_APIError.makeMessage(status, error, message)}`);
    this.status = status;
    this.headers = headers;
    this.request_id = headers?.["x-request-id"];
    this.error = error;
    const data = error;
    this.code = data?.["code"];
    this.param = data?.["param"];
    this.type = data?.["type"];
  }
  static makeMessage(status, error, message) {
    const msg = error?.message ? typeof error.message === "string" ? error.message : JSON.stringify(error.message) : error ? JSON.stringify(error) : message;
    if (status && msg) {
      return `${status} ${msg}`;
    }
    if (status) {
      return `${status} status code (no body)`;
    }
    if (msg) {
      return msg;
    }
    return "(no status code or body)";
  }
  static generate(status, errorResponse, message, headers) {
    if (!status || !headers) {
      return new APIConnectionError({ message, cause: castToError(errorResponse) });
    }
    const error = errorResponse?.["error"];
    if (status === 400) {
      return new BadRequestError(status, error, message, headers);
    }
    if (status === 401) {
      return new AuthenticationError(status, error, message, headers);
    }
    if (status === 403) {
      return new PermissionDeniedError(status, error, message, headers);
    }
    if (status === 404) {
      return new NotFoundError(status, error, message, headers);
    }
    if (status === 409) {
      return new ConflictError(status, error, message, headers);
    }
    if (status === 422) {
      return new UnprocessableEntityError(status, error, message, headers);
    }
    if (status === 429) {
      return new RateLimitError(status, error, message, headers);
    }
    if (status >= 500) {
      return new InternalServerError(status, error, message, headers);
    }
    return new _APIError(status, error, message, headers);
  }
};
var APIUserAbortError = class extends APIError {
  constructor({ message } = {}) {
    super(void 0, void 0, message || "Request was aborted.", void 0);
  }
};
var APIConnectionError = class extends APIError {
  constructor({ message, cause }) {
    super(void 0, void 0, message || "Connection error.", void 0);
    if (cause)
      this.cause = cause;
  }
};
var APIConnectionTimeoutError = class extends APIConnectionError {
  constructor({ message } = {}) {
    super({ message: message ?? "Request timed out." });
  }
};
var BadRequestError = class extends APIError {
};
var AuthenticationError = class extends APIError {
};
var PermissionDeniedError = class extends APIError {
};
var NotFoundError = class extends APIError {
};
var ConflictError = class extends APIError {
};
var UnprocessableEntityError = class extends APIError {
};
var RateLimitError = class extends APIError {
};
var InternalServerError = class extends APIError {
};
var LengthFinishReasonError = class extends OpenAIError {
  constructor() {
    super(`Could not parse response content as the length limit was reached`);
  }
};
var ContentFilterFinishReasonError = class extends OpenAIError {
  constructor() {
    super(`Could not parse response content as the request was rejected by the content filter`);
  }
};

// node_modules/openai/internal/decoders/line.mjs
var __classPrivateFieldSet = function(receiver, state, value, kind2, f) {
  if (kind2 === "m") throw new TypeError("Private method is not writable");
  if (kind2 === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind2 === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
};
var __classPrivateFieldGet = function(receiver, state, kind2, f) {
  if (kind2 === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind2 === "m" ? f : kind2 === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _LineDecoder_carriageReturnIndex;
var LineDecoder = class {
  constructor() {
    _LineDecoder_carriageReturnIndex.set(this, void 0);
    this.buffer = new Uint8Array();
    __classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, null, "f");
  }
  decode(chunk) {
    if (chunk == null) {
      return [];
    }
    const binaryChunk = chunk instanceof ArrayBuffer ? new Uint8Array(chunk) : typeof chunk === "string" ? new TextEncoder().encode(chunk) : chunk;
    let newData = new Uint8Array(this.buffer.length + binaryChunk.length);
    newData.set(this.buffer);
    newData.set(binaryChunk, this.buffer.length);
    this.buffer = newData;
    const lines = [];
    let patternIndex;
    while ((patternIndex = findNewlineIndex(this.buffer, __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f"))) != null) {
      if (patternIndex.carriage && __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") == null) {
        __classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, patternIndex.index, "f");
        continue;
      }
      if (__classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") != null && (patternIndex.index !== __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") + 1 || patternIndex.carriage)) {
        lines.push(this.decodeText(this.buffer.slice(0, __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") - 1)));
        this.buffer = this.buffer.slice(__classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f"));
        __classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, null, "f");
        continue;
      }
      const endIndex = __classPrivateFieldGet(this, _LineDecoder_carriageReturnIndex, "f") !== null ? patternIndex.preceding - 1 : patternIndex.preceding;
      const line = this.decodeText(this.buffer.slice(0, endIndex));
      lines.push(line);
      this.buffer = this.buffer.slice(patternIndex.index);
      __classPrivateFieldSet(this, _LineDecoder_carriageReturnIndex, null, "f");
    }
    return lines;
  }
  decodeText(bytes) {
    if (bytes == null)
      return "";
    if (typeof bytes === "string")
      return bytes;
    if (typeof Buffer !== "undefined") {
      if (bytes instanceof Buffer) {
        return bytes.toString();
      }
      if (bytes instanceof Uint8Array) {
        return Buffer.from(bytes).toString();
      }
      throw new OpenAIError(`Unexpected: received non-Uint8Array (${bytes.constructor.name}) stream chunk in an environment with a global "Buffer" defined, which this library assumes to be Node. Please report this error.`);
    }
    if (typeof TextDecoder !== "undefined") {
      if (bytes instanceof Uint8Array || bytes instanceof ArrayBuffer) {
        this.textDecoder ?? (this.textDecoder = new TextDecoder("utf8"));
        return this.textDecoder.decode(bytes);
      }
      throw new OpenAIError(`Unexpected: received non-Uint8Array/ArrayBuffer (${bytes.constructor.name}) in a web platform. Please report this error.`);
    }
    throw new OpenAIError(`Unexpected: neither Buffer nor TextDecoder are available as globals. Please report this error.`);
  }
  flush() {
    if (!this.buffer.length) {
      return [];
    }
    return this.decode("\n");
  }
};
_LineDecoder_carriageReturnIndex = /* @__PURE__ */ new WeakMap();
LineDecoder.NEWLINE_CHARS = /* @__PURE__ */ new Set(["\n", "\r"]);
LineDecoder.NEWLINE_REGEXP = /\r\n|[\n\r]/g;
function findNewlineIndex(buffer, startIndex) {
  const newline = 10;
  const carriage = 13;
  for (let i = startIndex ?? 0; i < buffer.length; i++) {
    if (buffer[i] === newline) {
      return { preceding: i, index: i + 1, carriage: false };
    }
    if (buffer[i] === carriage) {
      return { preceding: i, index: i + 1, carriage: true };
    }
  }
  return null;
}
function findDoubleNewlineIndex(buffer) {
  const newline = 10;
  const carriage = 13;
  for (let i = 0; i < buffer.length - 1; i++) {
    if (buffer[i] === newline && buffer[i + 1] === newline) {
      return i + 2;
    }
    if (buffer[i] === carriage && buffer[i + 1] === carriage) {
      return i + 2;
    }
    if (buffer[i] === carriage && buffer[i + 1] === newline && i + 3 < buffer.length && buffer[i + 2] === carriage && buffer[i + 3] === newline) {
      return i + 4;
    }
  }
  return -1;
}

// node_modules/openai/internal/stream-utils.mjs
function ReadableStreamToAsyncIterable(stream) {
  if (stream[Symbol.asyncIterator])
    return stream;
  const reader = stream.getReader();
  return {
    async next() {
      try {
        const result = await reader.read();
        if (result?.done)
          reader.releaseLock();
        return result;
      } catch (e) {
        reader.releaseLock();
        throw e;
      }
    },
    async return() {
      const cancelPromise = reader.cancel();
      reader.releaseLock();
      await cancelPromise;
      return { done: true, value: void 0 };
    },
    [Symbol.asyncIterator]() {
      return this;
    }
  };
}

// node_modules/openai/streaming.mjs
var Stream = class _Stream {
  constructor(iterator, controller) {
    this.iterator = iterator;
    this.controller = controller;
  }
  static fromSSEResponse(response, controller) {
    let consumed = false;
    async function* iterator() {
      if (consumed) {
        throw new Error("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      }
      consumed = true;
      let done = false;
      try {
        for await (const sse of _iterSSEMessages(response, controller)) {
          if (done)
            continue;
          if (sse.data.startsWith("[DONE]")) {
            done = true;
            continue;
          }
          if (sse.event === null || sse.event.startsWith("response.") || sse.event.startsWith("transcript.")) {
            let data;
            try {
              data = JSON.parse(sse.data);
            } catch (e) {
              console.error(`Could not parse message into JSON:`, sse.data);
              console.error(`From chunk:`, sse.raw);
              throw e;
            }
            if (data && data.error) {
              throw new APIError(void 0, data.error, void 0, createResponseHeaders(response.headers));
            }
            yield data;
          } else {
            let data;
            try {
              data = JSON.parse(sse.data);
            } catch (e) {
              console.error(`Could not parse message into JSON:`, sse.data);
              console.error(`From chunk:`, sse.raw);
              throw e;
            }
            if (sse.event == "error") {
              throw new APIError(void 0, data.error, data.message, void 0);
            }
            yield { event: sse.event, data };
          }
        }
        done = true;
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError")
          return;
        throw e;
      } finally {
        if (!done)
          controller.abort();
      }
    }
    return new _Stream(iterator, controller);
  }
  /**
   * Generates a Stream from a newline-separated ReadableStream
   * where each item is a JSON value.
   */
  static fromReadableStream(readableStream, controller) {
    let consumed = false;
    async function* iterLines() {
      const lineDecoder = new LineDecoder();
      const iter = ReadableStreamToAsyncIterable(readableStream);
      for await (const chunk of iter) {
        for (const line of lineDecoder.decode(chunk)) {
          yield line;
        }
      }
      for (const line of lineDecoder.flush()) {
        yield line;
      }
    }
    async function* iterator() {
      if (consumed) {
        throw new Error("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
      }
      consumed = true;
      let done = false;
      try {
        for await (const line of iterLines()) {
          if (done)
            continue;
          if (line)
            yield JSON.parse(line);
        }
        done = true;
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError")
          return;
        throw e;
      } finally {
        if (!done)
          controller.abort();
      }
    }
    return new _Stream(iterator, controller);
  }
  [Symbol.asyncIterator]() {
    return this.iterator();
  }
  /**
   * Splits the stream into two streams which can be
   * independently read from at different speeds.
   */
  tee() {
    const left = [];
    const right = [];
    const iterator = this.iterator();
    const teeIterator = (queue) => {
      return {
        next: () => {
          if (queue.length === 0) {
            const result = iterator.next();
            left.push(result);
            right.push(result);
          }
          return queue.shift();
        }
      };
    };
    return [
      new _Stream(() => teeIterator(left), this.controller),
      new _Stream(() => teeIterator(right), this.controller)
    ];
  }
  /**
   * Converts this stream to a newline-separated ReadableStream of
   * JSON stringified values in the stream
   * which can be turned back into a Stream with `Stream.fromReadableStream()`.
   */
  toReadableStream() {
    const self = this;
    let iter;
    const encoder = new TextEncoder();
    return new ReadableStream2({
      async start() {
        iter = self[Symbol.asyncIterator]();
      },
      async pull(ctrl) {
        try {
          const { value, done } = await iter.next();
          if (done)
            return ctrl.close();
          const bytes = encoder.encode(JSON.stringify(value) + "\n");
          ctrl.enqueue(bytes);
        } catch (err) {
          ctrl.error(err);
        }
      },
      async cancel() {
        await iter.return?.();
      }
    });
  }
};
async function* _iterSSEMessages(response, controller) {
  if (!response.body) {
    controller.abort();
    throw new OpenAIError(`Attempted to iterate over a response with no body`);
  }
  const sseDecoder = new SSEDecoder();
  const lineDecoder = new LineDecoder();
  const iter = ReadableStreamToAsyncIterable(response.body);
  for await (const sseChunk of iterSSEChunks(iter)) {
    for (const line of lineDecoder.decode(sseChunk)) {
      const sse = sseDecoder.decode(line);
      if (sse)
        yield sse;
    }
  }
  for (const line of lineDecoder.flush()) {
    const sse = sseDecoder.decode(line);
    if (sse)
      yield sse;
  }
}
async function* iterSSEChunks(iterator) {
  let data = new Uint8Array();
  for await (const chunk of iterator) {
    if (chunk == null) {
      continue;
    }
    const binaryChunk = chunk instanceof ArrayBuffer ? new Uint8Array(chunk) : typeof chunk === "string" ? new TextEncoder().encode(chunk) : chunk;
    let newData = new Uint8Array(data.length + binaryChunk.length);
    newData.set(data);
    newData.set(binaryChunk, data.length);
    data = newData;
    let patternIndex;
    while ((patternIndex = findDoubleNewlineIndex(data)) !== -1) {
      yield data.slice(0, patternIndex);
      data = data.slice(patternIndex);
    }
  }
  if (data.length > 0) {
    yield data;
  }
}
var SSEDecoder = class {
  constructor() {
    this.event = null;
    this.data = [];
    this.chunks = [];
  }
  decode(line) {
    if (line.endsWith("\r")) {
      line = line.substring(0, line.length - 1);
    }
    if (!line) {
      if (!this.event && !this.data.length)
        return null;
      const sse = {
        event: this.event,
        data: this.data.join("\n"),
        raw: this.chunks
      };
      this.event = null;
      this.data = [];
      this.chunks = [];
      return sse;
    }
    this.chunks.push(line);
    if (line.startsWith(":")) {
      return null;
    }
    let [fieldname, _, value] = partition(line, ":");
    if (value.startsWith(" ")) {
      value = value.substring(1);
    }
    if (fieldname === "event") {
      this.event = value;
    } else if (fieldname === "data") {
      this.data.push(value);
    }
    return null;
  }
};
function partition(str2, delimiter) {
  const index = str2.indexOf(delimiter);
  if (index !== -1) {
    return [str2.substring(0, index), delimiter, str2.substring(index + delimiter.length)];
  }
  return [str2, "", ""];
}

// node_modules/openai/uploads.mjs
var isResponseLike = (value) => value != null && typeof value === "object" && typeof value.url === "string" && typeof value.blob === "function";
var isFileLike = (value) => value != null && typeof value === "object" && typeof value.name === "string" && typeof value.lastModified === "number" && isBlobLike(value);
var isBlobLike = (value) => value != null && typeof value === "object" && typeof value.size === "number" && typeof value.type === "string" && typeof value.text === "function" && typeof value.slice === "function" && typeof value.arrayBuffer === "function";
var isUploadable = (value) => {
  return isFileLike(value) || isResponseLike(value) || isFsReadStream(value);
};
async function toFile(value, name, options) {
  value = await value;
  if (isFileLike(value)) {
    return value;
  }
  if (isResponseLike(value)) {
    const blob = await value.blob();
    name || (name = new URL(value.url).pathname.split(/[\\/]/).pop() ?? "unknown_file");
    const data = isBlobLike(blob) ? [await blob.arrayBuffer()] : [blob];
    return new File2(data, name, options);
  }
  const bits = await getBytes(value);
  name || (name = getName(value) ?? "unknown_file");
  if (!options?.type) {
    const type = bits[0]?.type;
    if (typeof type === "string") {
      options = { ...options, type };
    }
  }
  return new File2(bits, name, options);
}
async function getBytes(value) {
  let parts = [];
  if (typeof value === "string" || ArrayBuffer.isView(value) || // includes Uint8Array, Buffer, etc.
  value instanceof ArrayBuffer) {
    parts.push(value);
  } else if (isBlobLike(value)) {
    parts.push(await value.arrayBuffer());
  } else if (isAsyncIterableIterator(value)) {
    for await (const chunk of value) {
      parts.push(chunk);
    }
  } else {
    throw new Error(`Unexpected data type: ${typeof value}; constructor: ${value?.constructor?.name}; props: ${propsForError(value)}`);
  }
  return parts;
}
function propsForError(value) {
  const props = Object.getOwnPropertyNames(value);
  return `[${props.map((p) => `"${p}"`).join(", ")}]`;
}
function getName(value) {
  return getStringFromMaybeBuffer(value.name) || getStringFromMaybeBuffer(value.filename) || // For fs.ReadStream
  getStringFromMaybeBuffer(value.path)?.split(/[\\/]/).pop();
}
var getStringFromMaybeBuffer = (x) => {
  if (typeof x === "string")
    return x;
  if (typeof Buffer !== "undefined" && x instanceof Buffer)
    return String(x);
  return void 0;
};
var isAsyncIterableIterator = (value) => value != null && typeof value === "object" && typeof value[Symbol.asyncIterator] === "function";
var isMultipartBody = (body) => body && typeof body === "object" && body.body && body[Symbol.toStringTag] === "MultipartBody";
var multipartFormRequestOptions = async (opts) => {
  const form = await createForm(opts.body);
  return getMultipartRequestOptions(form, opts);
};
var createForm = async (body) => {
  const form = new FormData2();
  await Promise.all(Object.entries(body || {}).map(([key, value]) => addFormValue(form, key, value)));
  return form;
};
var addFormValue = async (form, key, value) => {
  if (value === void 0)
    return;
  if (value == null) {
    throw new TypeError(`Received null for "${key}"; to pass null in FormData, you must use the string 'null'`);
  }
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    form.append(key, String(value));
  } else if (isUploadable(value)) {
    const file = await toFile(value);
    form.append(key, file);
  } else if (Array.isArray(value)) {
    await Promise.all(value.map((entry) => addFormValue(form, key + "[]", entry)));
  } else if (typeof value === "object") {
    await Promise.all(Object.entries(value).map(([name, prop]) => addFormValue(form, `${key}[${name}]`, prop)));
  } else {
    throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${value} instead`);
  }
};

// node_modules/openai/core.mjs
var __classPrivateFieldSet2 = function(receiver, state, value, kind2, f) {
  if (kind2 === "m") throw new TypeError("Private method is not writable");
  if (kind2 === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind2 === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
};
var __classPrivateFieldGet2 = function(receiver, state, kind2, f) {
  if (kind2 === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind2 === "m" ? f : kind2 === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _AbstractPage_client;
init();
async function defaultParseResponse(props) {
  const { response } = props;
  if (props.options.stream) {
    debug("response", response.status, response.url, response.headers, response.body);
    if (props.options.__streamClass) {
      return props.options.__streamClass.fromSSEResponse(response, props.controller);
    }
    return Stream.fromSSEResponse(response, props.controller);
  }
  if (response.status === 204) {
    return null;
  }
  if (props.options.__binaryResponse) {
    return response;
  }
  const contentType = response.headers.get("content-type");
  const mediaType = contentType?.split(";")[0]?.trim();
  const isJSON = mediaType?.includes("application/json") || mediaType?.endsWith("+json");
  if (isJSON) {
    const json = await response.json();
    debug("response", response.status, response.url, response.headers, json);
    return _addRequestID(json, response);
  }
  const text = await response.text();
  debug("response", response.status, response.url, response.headers, text);
  return text;
}
function _addRequestID(value, response) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }
  return Object.defineProperty(value, "_request_id", {
    value: response.headers.get("x-request-id"),
    enumerable: false
  });
}
var APIPromise = class _APIPromise extends Promise {
  constructor(responsePromise, parseResponse2 = defaultParseResponse) {
    super((resolve) => {
      resolve(null);
    });
    this.responsePromise = responsePromise;
    this.parseResponse = parseResponse2;
  }
  _thenUnwrap(transform) {
    return new _APIPromise(this.responsePromise, async (props) => _addRequestID(transform(await this.parseResponse(props), props), props.response));
  }
  /**
   * Gets the raw `Response` instance instead of parsing the response
   * data.
   *
   * If you want to parse the response body but still get the `Response`
   * instance, you can use {@link withResponse()}.
   *
   * 👋 Getting the wrong TypeScript type for `Response`?
   * Try setting `"moduleResolution": "NodeNext"` if you can,
   * or add one of these imports before your first `import … from 'openai'`:
   * - `import 'openai/shims/node'` (if you're running on Node)
   * - `import 'openai/shims/web'` (otherwise)
   */
  asResponse() {
    return this.responsePromise.then((p) => p.response);
  }
  /**
   * Gets the parsed response data, the raw `Response` instance and the ID of the request,
   * returned via the X-Request-ID header which is useful for debugging requests and reporting
   * issues to OpenAI.
   *
   * If you just want to get the raw `Response` instance without parsing it,
   * you can use {@link asResponse()}.
   *
   *
   * 👋 Getting the wrong TypeScript type for `Response`?
   * Try setting `"moduleResolution": "NodeNext"` if you can,
   * or add one of these imports before your first `import … from 'openai'`:
   * - `import 'openai/shims/node'` (if you're running on Node)
   * - `import 'openai/shims/web'` (otherwise)
   */
  async withResponse() {
    const [data, response] = await Promise.all([this.parse(), this.asResponse()]);
    return { data, response, request_id: response.headers.get("x-request-id") };
  }
  parse() {
    if (!this.parsedPromise) {
      this.parsedPromise = this.responsePromise.then(this.parseResponse);
    }
    return this.parsedPromise;
  }
  then(onfulfilled, onrejected) {
    return this.parse().then(onfulfilled, onrejected);
  }
  catch(onrejected) {
    return this.parse().catch(onrejected);
  }
  finally(onfinally) {
    return this.parse().finally(onfinally);
  }
};
var APIClient = class {
  constructor({
    baseURL,
    maxRetries = 2,
    timeout = 6e5,
    // 10 minutes
    httpAgent,
    fetch: overriddenFetch
  }) {
    this.baseURL = baseURL;
    this.maxRetries = validatePositiveInteger("maxRetries", maxRetries);
    this.timeout = validatePositiveInteger("timeout", timeout);
    this.httpAgent = httpAgent;
    this.fetch = overriddenFetch ?? fetch2;
  }
  authHeaders(opts) {
    return {};
  }
  /**
   * Override this to add your own default headers, for example:
   *
   *  {
   *    ...super.defaultHeaders(),
   *    Authorization: 'Bearer 123',
   *  }
   */
  defaultHeaders(opts) {
    return {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": this.getUserAgent(),
      ...getPlatformHeaders(),
      ...this.authHeaders(opts)
    };
  }
  /**
   * Override this to add your own headers validation:
   */
  validateHeaders(headers, customHeaders) {
  }
  defaultIdempotencyKey() {
    return `stainless-node-retry-${uuid4()}`;
  }
  get(path, opts) {
    return this.methodRequest("get", path, opts);
  }
  post(path, opts) {
    return this.methodRequest("post", path, opts);
  }
  patch(path, opts) {
    return this.methodRequest("patch", path, opts);
  }
  put(path, opts) {
    return this.methodRequest("put", path, opts);
  }
  delete(path, opts) {
    return this.methodRequest("delete", path, opts);
  }
  methodRequest(method, path, opts) {
    return this.request(Promise.resolve(opts).then(async (opts2) => {
      const body = opts2 && isBlobLike(opts2?.body) ? new DataView(await opts2.body.arrayBuffer()) : opts2?.body instanceof DataView ? opts2.body : opts2?.body instanceof ArrayBuffer ? new DataView(opts2.body) : opts2 && ArrayBuffer.isView(opts2?.body) ? new DataView(opts2.body.buffer) : opts2?.body;
      return { method, path, ...opts2, body };
    }));
  }
  getAPIList(path, Page2, opts) {
    return this.requestAPIList(Page2, { method: "get", path, ...opts });
  }
  calculateContentLength(body) {
    if (typeof body === "string") {
      if (typeof Buffer !== "undefined") {
        return Buffer.byteLength(body, "utf8").toString();
      }
      if (typeof TextEncoder !== "undefined") {
        const encoder = new TextEncoder();
        const encoded = encoder.encode(body);
        return encoded.length.toString();
      }
    } else if (ArrayBuffer.isView(body)) {
      return body.byteLength.toString();
    }
    return null;
  }
  buildRequest(inputOptions, { retryCount = 0 } = {}) {
    const options = { ...inputOptions };
    const { method, path, query, headers = {} } = options;
    const body = ArrayBuffer.isView(options.body) || options.__binaryRequest && typeof options.body === "string" ? options.body : isMultipartBody(options.body) ? options.body.body : options.body ? JSON.stringify(options.body, null, 2) : null;
    const contentLength = this.calculateContentLength(body);
    const url = this.buildURL(path, query);
    if ("timeout" in options)
      validatePositiveInteger("timeout", options.timeout);
    options.timeout = options.timeout ?? this.timeout;
    const httpAgent = options.httpAgent ?? this.httpAgent ?? getDefaultAgent(url);
    const minAgentTimeout = options.timeout + 1e3;
    if (typeof httpAgent?.options?.timeout === "number" && minAgentTimeout > (httpAgent.options.timeout ?? 0)) {
      httpAgent.options.timeout = minAgentTimeout;
    }
    if (this.idempotencyHeader && method !== "get") {
      if (!inputOptions.idempotencyKey)
        inputOptions.idempotencyKey = this.defaultIdempotencyKey();
      headers[this.idempotencyHeader] = inputOptions.idempotencyKey;
    }
    const reqHeaders = this.buildHeaders({ options, headers, contentLength, retryCount });
    const req = {
      method,
      ...body && { body },
      headers: reqHeaders,
      ...httpAgent && { agent: httpAgent },
      // @ts-ignore node-fetch uses a custom AbortSignal type that is
      // not compatible with standard web types
      signal: options.signal ?? null
    };
    return { req, url, timeout: options.timeout };
  }
  buildHeaders({ options, headers, contentLength, retryCount }) {
    const reqHeaders = {};
    if (contentLength) {
      reqHeaders["content-length"] = contentLength;
    }
    const defaultHeaders = this.defaultHeaders(options);
    applyHeadersMut(reqHeaders, defaultHeaders);
    applyHeadersMut(reqHeaders, headers);
    if (isMultipartBody(options.body) && kind !== "node") {
      delete reqHeaders["content-type"];
    }
    if (getHeader(defaultHeaders, "x-stainless-retry-count") === void 0 && getHeader(headers, "x-stainless-retry-count") === void 0) {
      reqHeaders["x-stainless-retry-count"] = String(retryCount);
    }
    if (getHeader(defaultHeaders, "x-stainless-timeout") === void 0 && getHeader(headers, "x-stainless-timeout") === void 0 && options.timeout) {
      reqHeaders["x-stainless-timeout"] = String(Math.trunc(options.timeout / 1e3));
    }
    this.validateHeaders(reqHeaders, headers);
    return reqHeaders;
  }
  /**
   * Used as a callback for mutating the given `FinalRequestOptions` object.
   */
  async prepareOptions(options) {
  }
  /**
   * Used as a callback for mutating the given `RequestInit` object.
   *
   * This is useful for cases where you want to add certain headers based off of
   * the request properties, e.g. `method` or `url`.
   */
  async prepareRequest(request, { url, options }) {
  }
  parseHeaders(headers) {
    return !headers ? {} : Symbol.iterator in headers ? Object.fromEntries(Array.from(headers).map((header) => [...header])) : { ...headers };
  }
  makeStatusError(status, error, message, headers) {
    return APIError.generate(status, error, message, headers);
  }
  request(options, remainingRetries = null) {
    return new APIPromise(this.makeRequest(options, remainingRetries));
  }
  async makeRequest(optionsInput, retriesRemaining) {
    const options = await optionsInput;
    const maxRetries = options.maxRetries ?? this.maxRetries;
    if (retriesRemaining == null) {
      retriesRemaining = maxRetries;
    }
    await this.prepareOptions(options);
    const { req, url, timeout } = this.buildRequest(options, { retryCount: maxRetries - retriesRemaining });
    await this.prepareRequest(req, { url, options });
    debug("request", url, options, req.headers);
    if (options.signal?.aborted) {
      throw new APIUserAbortError();
    }
    const controller = new AbortController();
    const response = await this.fetchWithTimeout(url, req, timeout, controller).catch(castToError);
    if (response instanceof Error) {
      if (options.signal?.aborted) {
        throw new APIUserAbortError();
      }
      if (retriesRemaining) {
        return this.retryRequest(options, retriesRemaining);
      }
      if (response.name === "AbortError") {
        throw new APIConnectionTimeoutError();
      }
      throw new APIConnectionError({ cause: response });
    }
    const responseHeaders = createResponseHeaders(response.headers);
    if (!response.ok) {
      if (retriesRemaining && this.shouldRetry(response)) {
        const retryMessage2 = `retrying, ${retriesRemaining} attempts remaining`;
        debug(`response (error; ${retryMessage2})`, response.status, url, responseHeaders);
        return this.retryRequest(options, retriesRemaining, responseHeaders);
      }
      const errText = await response.text().catch((e) => castToError(e).message);
      const errJSON = safeJSON(errText);
      const errMessage = errJSON ? void 0 : errText;
      const retryMessage = retriesRemaining ? `(error; no more retries left)` : `(error; not retryable)`;
      debug(`response (error; ${retryMessage})`, response.status, url, responseHeaders, errMessage);
      const err = this.makeStatusError(response.status, errJSON, errMessage, responseHeaders);
      throw err;
    }
    return { response, options, controller };
  }
  requestAPIList(Page2, options) {
    const request = this.makeRequest(options, null);
    return new PagePromise(this, request, Page2);
  }
  buildURL(path, query) {
    const url = isAbsoluteURL(path) ? new URL(path) : new URL(this.baseURL + (this.baseURL.endsWith("/") && path.startsWith("/") ? path.slice(1) : path));
    const defaultQuery = this.defaultQuery();
    if (!isEmptyObj(defaultQuery)) {
      query = { ...defaultQuery, ...query };
    }
    if (typeof query === "object" && query && !Array.isArray(query)) {
      url.search = this.stringifyQuery(query);
    }
    return url.toString();
  }
  stringifyQuery(query) {
    return Object.entries(query).filter(([_, value]) => typeof value !== "undefined").map(([key, value]) => {
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      }
      if (value === null) {
        return `${encodeURIComponent(key)}=`;
      }
      throw new OpenAIError(`Cannot stringify type ${typeof value}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
    }).join("&");
  }
  async fetchWithTimeout(url, init2, ms, controller) {
    const { signal, ...options } = init2 || {};
    if (signal)
      signal.addEventListener("abort", () => controller.abort());
    const timeout = setTimeout(() => controller.abort(), ms);
    const fetchOptions = {
      signal: controller.signal,
      ...options
    };
    if (fetchOptions.method) {
      fetchOptions.method = fetchOptions.method.toUpperCase();
    }
    return (
      // use undefined this binding; fetch errors if bound to something else in browser/cloudflare
      this.fetch.call(void 0, url, fetchOptions).finally(() => {
        clearTimeout(timeout);
      })
    );
  }
  shouldRetry(response) {
    const shouldRetryHeader = response.headers.get("x-should-retry");
    if (shouldRetryHeader === "true")
      return true;
    if (shouldRetryHeader === "false")
      return false;
    if (response.status === 408)
      return true;
    if (response.status === 409)
      return true;
    if (response.status === 429)
      return true;
    if (response.status >= 500)
      return true;
    return false;
  }
  async retryRequest(options, retriesRemaining, responseHeaders) {
    let timeoutMillis;
    const retryAfterMillisHeader = responseHeaders?.["retry-after-ms"];
    if (retryAfterMillisHeader) {
      const timeoutMs = parseFloat(retryAfterMillisHeader);
      if (!Number.isNaN(timeoutMs)) {
        timeoutMillis = timeoutMs;
      }
    }
    const retryAfterHeader = responseHeaders?.["retry-after"];
    if (retryAfterHeader && !timeoutMillis) {
      const timeoutSeconds = parseFloat(retryAfterHeader);
      if (!Number.isNaN(timeoutSeconds)) {
        timeoutMillis = timeoutSeconds * 1e3;
      } else {
        timeoutMillis = Date.parse(retryAfterHeader) - Date.now();
      }
    }
    if (!(timeoutMillis && 0 <= timeoutMillis && timeoutMillis < 60 * 1e3)) {
      const maxRetries = options.maxRetries ?? this.maxRetries;
      timeoutMillis = this.calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries);
    }
    await sleep(timeoutMillis);
    return this.makeRequest(options, retriesRemaining - 1);
  }
  calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries) {
    const initialRetryDelay = 0.5;
    const maxRetryDelay = 8;
    const numRetries = maxRetries - retriesRemaining;
    const sleepSeconds = Math.min(initialRetryDelay * Math.pow(2, numRetries), maxRetryDelay);
    const jitter = 1 - Math.random() * 0.25;
    return sleepSeconds * jitter * 1e3;
  }
  getUserAgent() {
    return `${this.constructor.name}/JS ${VERSION}`;
  }
};
var AbstractPage = class {
  constructor(client, response, body, options) {
    _AbstractPage_client.set(this, void 0);
    __classPrivateFieldSet2(this, _AbstractPage_client, client, "f");
    this.options = options;
    this.response = response;
    this.body = body;
  }
  hasNextPage() {
    const items = this.getPaginatedItems();
    if (!items.length)
      return false;
    return this.nextPageInfo() != null;
  }
  async getNextPage() {
    const nextInfo = this.nextPageInfo();
    if (!nextInfo) {
      throw new OpenAIError("No next page expected; please check `.hasNextPage()` before calling `.getNextPage()`.");
    }
    const nextOptions = { ...this.options };
    if ("params" in nextInfo && typeof nextOptions.query === "object") {
      nextOptions.query = { ...nextOptions.query, ...nextInfo.params };
    } else if ("url" in nextInfo) {
      const params = [...Object.entries(nextOptions.query || {}), ...nextInfo.url.searchParams.entries()];
      for (const [key, value] of params) {
        nextInfo.url.searchParams.set(key, value);
      }
      nextOptions.query = void 0;
      nextOptions.path = nextInfo.url.toString();
    }
    return await __classPrivateFieldGet2(this, _AbstractPage_client, "f").requestAPIList(this.constructor, nextOptions);
  }
  async *iterPages() {
    let page = this;
    yield page;
    while (page.hasNextPage()) {
      page = await page.getNextPage();
      yield page;
    }
  }
  async *[(_AbstractPage_client = /* @__PURE__ */ new WeakMap(), Symbol.asyncIterator)]() {
    for await (const page of this.iterPages()) {
      for (const item of page.getPaginatedItems()) {
        yield item;
      }
    }
  }
};
var PagePromise = class extends APIPromise {
  constructor(client, request, Page2) {
    super(request, async (props) => new Page2(client, props.response, await defaultParseResponse(props), props.options));
  }
  /**
   * Allow auto-paginating iteration on an unawaited list call, eg:
   *
   *    for await (const item of client.items.list()) {
   *      console.log(item)
   *    }
   */
  async *[Symbol.asyncIterator]() {
    const page = await this;
    for await (const item of page) {
      yield item;
    }
  }
};
var createResponseHeaders = (headers) => {
  return new Proxy(Object.fromEntries(
    // @ts-ignore
    headers.entries()
  ), {
    get(target, name) {
      const key = name.toString();
      return target[key.toLowerCase()] || target[key];
    }
  });
};
var requestOptionsKeys = {
  method: true,
  path: true,
  query: true,
  body: true,
  headers: true,
  maxRetries: true,
  stream: true,
  timeout: true,
  httpAgent: true,
  signal: true,
  idempotencyKey: true,
  __metadata: true,
  __binaryRequest: true,
  __binaryResponse: true,
  __streamClass: true
};
var isRequestOptions = (obj) => {
  return typeof obj === "object" && obj !== null && !isEmptyObj(obj) && Object.keys(obj).every((k) => hasOwn(requestOptionsKeys, k));
};
var getPlatformProperties = () => {
  if (typeof Deno !== "undefined" && Deno.build != null) {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": normalizePlatform(Deno.build.os),
      "X-Stainless-Arch": normalizeArch(Deno.build.arch),
      "X-Stainless-Runtime": "deno",
      "X-Stainless-Runtime-Version": typeof Deno.version === "string" ? Deno.version : Deno.version?.deno ?? "unknown"
    };
  }
  if (typeof EdgeRuntime !== "undefined") {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": "Unknown",
      "X-Stainless-Arch": `other:${EdgeRuntime}`,
      "X-Stainless-Runtime": "edge",
      "X-Stainless-Runtime-Version": process.version
    };
  }
  if (Object.prototype.toString.call(typeof process !== "undefined" ? process : 0) === "[object process]") {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": normalizePlatform(process.platform),
      "X-Stainless-Arch": normalizeArch(process.arch),
      "X-Stainless-Runtime": "node",
      "X-Stainless-Runtime-Version": process.version
    };
  }
  const browserInfo = getBrowserInfo();
  if (browserInfo) {
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": "Unknown",
      "X-Stainless-Arch": "unknown",
      "X-Stainless-Runtime": `browser:${browserInfo.browser}`,
      "X-Stainless-Runtime-Version": browserInfo.version
    };
  }
  return {
    "X-Stainless-Lang": "js",
    "X-Stainless-Package-Version": VERSION,
    "X-Stainless-OS": "Unknown",
    "X-Stainless-Arch": "unknown",
    "X-Stainless-Runtime": "unknown",
    "X-Stainless-Runtime-Version": "unknown"
  };
};
function getBrowserInfo() {
  if (typeof navigator === "undefined" || !navigator) {
    return null;
  }
  const browserPatterns = [
    { key: "edge", pattern: /Edge(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "ie", pattern: /MSIE(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "ie", pattern: /Trident(?:.*rv\:(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "chrome", pattern: /Chrome(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "firefox", pattern: /Firefox(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
    { key: "safari", pattern: /(?:Version\W+(\d+)\.(\d+)(?:\.(\d+))?)?(?:\W+Mobile\S*)?\W+Safari/ }
  ];
  for (const { key, pattern } of browserPatterns) {
    const match = pattern.exec(navigator.userAgent);
    if (match) {
      const major = match[1] || 0;
      const minor = match[2] || 0;
      const patch = match[3] || 0;
      return { browser: key, version: `${major}.${minor}.${patch}` };
    }
  }
  return null;
}
var normalizeArch = (arch) => {
  if (arch === "x32")
    return "x32";
  if (arch === "x86_64" || arch === "x64")
    return "x64";
  if (arch === "arm")
    return "arm";
  if (arch === "aarch64" || arch === "arm64")
    return "arm64";
  if (arch)
    return `other:${arch}`;
  return "unknown";
};
var normalizePlatform = (platform) => {
  platform = platform.toLowerCase();
  if (platform.includes("ios"))
    return "iOS";
  if (platform === "android")
    return "Android";
  if (platform === "darwin")
    return "MacOS";
  if (platform === "win32")
    return "Windows";
  if (platform === "freebsd")
    return "FreeBSD";
  if (platform === "openbsd")
    return "OpenBSD";
  if (platform === "linux")
    return "Linux";
  if (platform)
    return `Other:${platform}`;
  return "Unknown";
};
var _platformHeaders;
var getPlatformHeaders = () => {
  return _platformHeaders ?? (_platformHeaders = getPlatformProperties());
};
var safeJSON = (text) => {
  try {
    return JSON.parse(text);
  } catch (err) {
    return void 0;
  }
};
var startsWithSchemeRegexp = /^[a-z][a-z0-9+.-]*:/i;
var isAbsoluteURL = (url) => {
  return startsWithSchemeRegexp.test(url);
};
var sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
var validatePositiveInteger = (name, n) => {
  if (typeof n !== "number" || !Number.isInteger(n)) {
    throw new OpenAIError(`${name} must be an integer`);
  }
  if (n < 0) {
    throw new OpenAIError(`${name} must be a positive integer`);
  }
  return n;
};
var castToError = (err) => {
  if (err instanceof Error)
    return err;
  if (typeof err === "object" && err !== null) {
    try {
      return new Error(JSON.stringify(err));
    } catch {
    }
  }
  return new Error(err);
};
var readEnv = (env) => {
  if (typeof process !== "undefined") {
    return process.env?.[env]?.trim() ?? void 0;
  }
  if (typeof Deno !== "undefined") {
    return Deno.env?.get?.(env)?.trim();
  }
  return void 0;
};
function isEmptyObj(obj) {
  if (!obj)
    return true;
  for (const _k in obj)
    return false;
  return true;
}
function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}
function applyHeadersMut(targetHeaders, newHeaders) {
  for (const k in newHeaders) {
    if (!hasOwn(newHeaders, k))
      continue;
    const lowerKey = k.toLowerCase();
    if (!lowerKey)
      continue;
    const val = newHeaders[k];
    if (val === null) {
      delete targetHeaders[lowerKey];
    } else if (val !== void 0) {
      targetHeaders[lowerKey] = val;
    }
  }
}
var SENSITIVE_HEADERS = /* @__PURE__ */ new Set(["authorization", "api-key"]);
function debug(action, ...args) {
  if (typeof process !== "undefined" && process?.env?.["DEBUG"] === "true") {
    const modifiedArgs = args.map((arg) => {
      if (!arg) {
        return arg;
      }
      if (arg["headers"]) {
        const modifiedArg2 = { ...arg, headers: { ...arg["headers"] } };
        for (const header in arg["headers"]) {
          if (SENSITIVE_HEADERS.has(header.toLowerCase())) {
            modifiedArg2["headers"][header] = "REDACTED";
          }
        }
        return modifiedArg2;
      }
      let modifiedArg = null;
      for (const header in arg) {
        if (SENSITIVE_HEADERS.has(header.toLowerCase())) {
          modifiedArg ?? (modifiedArg = { ...arg });
          modifiedArg[header] = "REDACTED";
        }
      }
      return modifiedArg ?? arg;
    });
    console.log(`OpenAI:DEBUG:${action}`, ...modifiedArgs);
  }
}
var uuid4 = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
};
var isRunningInBrowser = () => {
  return (
    // @ts-ignore
    typeof window !== "undefined" && // @ts-ignore
    typeof window.document !== "undefined" && // @ts-ignore
    typeof navigator !== "undefined"
  );
};
var isHeadersProtocol = (headers) => {
  return typeof headers?.get === "function";
};
var getHeader = (headers, header) => {
  const lowerCasedHeader = header.toLowerCase();
  if (isHeadersProtocol(headers)) {
    const intercapsHeader = header[0]?.toUpperCase() + header.substring(1).replace(/([^\w])(\w)/g, (_m, g1, g2) => g1 + g2.toUpperCase());
    for (const key of [header, lowerCasedHeader, header.toUpperCase(), intercapsHeader]) {
      const value = headers.get(key);
      if (value) {
        return value;
      }
    }
  }
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === lowerCasedHeader) {
      if (Array.isArray(value)) {
        if (value.length <= 1)
          return value[0];
        console.warn(`Received ${value.length} entries for the ${header} header, using the first entry.`);
        return value[0];
      }
      return value;
    }
  }
  return void 0;
};
var toFloat32Array = (base64Str) => {
  if (typeof Buffer !== "undefined") {
    const buf = Buffer.from(base64Str, "base64");
    return Array.from(new Float32Array(buf.buffer, buf.byteOffset, buf.length / Float32Array.BYTES_PER_ELEMENT));
  } else {
    const binaryStr = atob(base64Str);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    return Array.from(new Float32Array(bytes.buffer));
  }
};
function isObj(obj) {
  return obj != null && typeof obj === "object" && !Array.isArray(obj);
}

// node_modules/openai/pagination.mjs
var Page = class extends AbstractPage {
  constructor(client, response, body, options) {
    super(client, response, body, options);
    this.data = body.data || [];
    this.object = body.object;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  // @deprecated Please use `nextPageInfo()` instead
  /**
   * This page represents a response that isn't actually paginated at the API level
   * so there will never be any next page params.
   */
  nextPageParams() {
    return null;
  }
  nextPageInfo() {
    return null;
  }
};
var CursorPage = class extends AbstractPage {
  constructor(client, response, body, options) {
    super(client, response, body, options);
    this.data = body.data || [];
    this.has_more = body.has_more || false;
  }
  getPaginatedItems() {
    return this.data ?? [];
  }
  hasNextPage() {
    if (this.has_more === false) {
      return false;
    }
    return super.hasNextPage();
  }
  // @deprecated Please use `nextPageInfo()` instead
  nextPageParams() {
    const info = this.nextPageInfo();
    if (!info)
      return null;
    if ("params" in info)
      return info.params;
    const params = Object.fromEntries(info.url.searchParams);
    if (!Object.keys(params).length)
      return null;
    return params;
  }
  nextPageInfo() {
    const data = this.getPaginatedItems();
    if (!data.length) {
      return null;
    }
    const id = data[data.length - 1]?.id;
    if (!id) {
      return null;
    }
    return { params: { after: id } };
  }
};

// node_modules/openai/resource.mjs
var APIResource = class {
  constructor(client) {
    this._client = client;
  }
};

// node_modules/openai/resources/chat/completions/messages.mjs
var Messages = class extends APIResource {
  list(completionId, query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list(completionId, {}, query);
    }
    return this._client.getAPIList(`/chat/completions/${completionId}/messages`, ChatCompletionStoreMessagesPage, { query, ...options });
  }
};

// node_modules/openai/resources/chat/completions/completions.mjs
var Completions = class extends APIResource {
  constructor() {
    super(...arguments);
    this.messages = new Messages(this._client);
  }
  create(body, options) {
    return this._client.post("/chat/completions", { body, ...options, stream: body.stream ?? false });
  }
  /**
   * Get a stored chat completion. Only Chat Completions that have been created with
   * the `store` parameter set to `true` will be returned.
   *
   * @example
   * ```ts
   * const chatCompletion =
   *   await client.chat.completions.retrieve('completion_id');
   * ```
   */
  retrieve(completionId, options) {
    return this._client.get(`/chat/completions/${completionId}`, options);
  }
  /**
   * Modify a stored chat completion. Only Chat Completions that have been created
   * with the `store` parameter set to `true` can be modified. Currently, the only
   * supported modification is to update the `metadata` field.
   *
   * @example
   * ```ts
   * const chatCompletion = await client.chat.completions.update(
   *   'completion_id',
   *   { metadata: { foo: 'string' } },
   * );
   * ```
   */
  update(completionId, body, options) {
    return this._client.post(`/chat/completions/${completionId}`, { body, ...options });
  }
  list(query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.getAPIList("/chat/completions", ChatCompletionsPage, { query, ...options });
  }
  /**
   * Delete a stored chat completion. Only Chat Completions that have been created
   * with the `store` parameter set to `true` can be deleted.
   *
   * @example
   * ```ts
   * const chatCompletionDeleted =
   *   await client.chat.completions.del('completion_id');
   * ```
   */
  del(completionId, options) {
    return this._client.delete(`/chat/completions/${completionId}`, options);
  }
};
var ChatCompletionsPage = class extends CursorPage {
};
var ChatCompletionStoreMessagesPage = class extends CursorPage {
};
Completions.ChatCompletionsPage = ChatCompletionsPage;
Completions.Messages = Messages;

// node_modules/openai/resources/chat/chat.mjs
var Chat = class extends APIResource {
  constructor() {
    super(...arguments);
    this.completions = new Completions(this._client);
  }
};
Chat.Completions = Completions;
Chat.ChatCompletionsPage = ChatCompletionsPage;

// node_modules/openai/resources/audio/speech.mjs
var Speech = class extends APIResource {
  /**
   * Generates audio from the input text.
   *
   * @example
   * ```ts
   * const speech = await client.audio.speech.create({
   *   input: 'input',
   *   model: 'string',
   *   voice: 'ash',
   * });
   *
   * const content = await speech.blob();
   * console.log(content);
   * ```
   */
  create(body, options) {
    return this._client.post("/audio/speech", {
      body,
      ...options,
      headers: { Accept: "application/octet-stream", ...options?.headers },
      __binaryResponse: true
    });
  }
};

// node_modules/openai/resources/audio/transcriptions.mjs
var Transcriptions = class extends APIResource {
  create(body, options) {
    return this._client.post("/audio/transcriptions", multipartFormRequestOptions({
      body,
      ...options,
      stream: body.stream ?? false,
      __metadata: { model: body.model }
    }));
  }
};

// node_modules/openai/resources/audio/translations.mjs
var Translations = class extends APIResource {
  create(body, options) {
    return this._client.post("/audio/translations", multipartFormRequestOptions({ body, ...options, __metadata: { model: body.model } }));
  }
};

// node_modules/openai/resources/audio/audio.mjs
var Audio = class extends APIResource {
  constructor() {
    super(...arguments);
    this.transcriptions = new Transcriptions(this._client);
    this.translations = new Translations(this._client);
    this.speech = new Speech(this._client);
  }
};
Audio.Transcriptions = Transcriptions;
Audio.Translations = Translations;
Audio.Speech = Speech;

// node_modules/openai/resources/batches.mjs
var Batches = class extends APIResource {
  /**
   * Creates and executes a batch from an uploaded file of requests
   */
  create(body, options) {
    return this._client.post("/batches", { body, ...options });
  }
  /**
   * Retrieves a batch.
   */
  retrieve(batchId, options) {
    return this._client.get(`/batches/${batchId}`, options);
  }
  list(query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.getAPIList("/batches", BatchesPage, { query, ...options });
  }
  /**
   * Cancels an in-progress batch. The batch will be in status `cancelling` for up to
   * 10 minutes, before changing to `cancelled`, where it will have partial results
   * (if any) available in the output file.
   */
  cancel(batchId, options) {
    return this._client.post(`/batches/${batchId}/cancel`, options);
  }
};
var BatchesPage = class extends CursorPage {
};
Batches.BatchesPage = BatchesPage;

// node_modules/openai/lib/EventStream.mjs
var __classPrivateFieldSet3 = function(receiver, state, value, kind2, f) {
  if (kind2 === "m") throw new TypeError("Private method is not writable");
  if (kind2 === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind2 === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
};
var __classPrivateFieldGet3 = function(receiver, state, kind2, f) {
  if (kind2 === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind2 === "m" ? f : kind2 === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _EventStream_instances;
var _EventStream_connectedPromise;
var _EventStream_resolveConnectedPromise;
var _EventStream_rejectConnectedPromise;
var _EventStream_endPromise;
var _EventStream_resolveEndPromise;
var _EventStream_rejectEndPromise;
var _EventStream_listeners;
var _EventStream_ended;
var _EventStream_errored;
var _EventStream_aborted;
var _EventStream_catchingPromiseCreated;
var _EventStream_handleError;
var EventStream = class {
  constructor() {
    _EventStream_instances.add(this);
    this.controller = new AbortController();
    _EventStream_connectedPromise.set(this, void 0);
    _EventStream_resolveConnectedPromise.set(this, () => {
    });
    _EventStream_rejectConnectedPromise.set(this, () => {
    });
    _EventStream_endPromise.set(this, void 0);
    _EventStream_resolveEndPromise.set(this, () => {
    });
    _EventStream_rejectEndPromise.set(this, () => {
    });
    _EventStream_listeners.set(this, {});
    _EventStream_ended.set(this, false);
    _EventStream_errored.set(this, false);
    _EventStream_aborted.set(this, false);
    _EventStream_catchingPromiseCreated.set(this, false);
    __classPrivateFieldSet3(this, _EventStream_connectedPromise, new Promise((resolve, reject) => {
      __classPrivateFieldSet3(this, _EventStream_resolveConnectedPromise, resolve, "f");
      __classPrivateFieldSet3(this, _EventStream_rejectConnectedPromise, reject, "f");
    }), "f");
    __classPrivateFieldSet3(this, _EventStream_endPromise, new Promise((resolve, reject) => {
      __classPrivateFieldSet3(this, _EventStream_resolveEndPromise, resolve, "f");
      __classPrivateFieldSet3(this, _EventStream_rejectEndPromise, reject, "f");
    }), "f");
    __classPrivateFieldGet3(this, _EventStream_connectedPromise, "f").catch(() => {
    });
    __classPrivateFieldGet3(this, _EventStream_endPromise, "f").catch(() => {
    });
  }
  _run(executor) {
    setTimeout(() => {
      executor().then(() => {
        this._emitFinal();
        this._emit("end");
      }, __classPrivateFieldGet3(this, _EventStream_instances, "m", _EventStream_handleError).bind(this));
    }, 0);
  }
  _connected() {
    if (this.ended)
      return;
    __classPrivateFieldGet3(this, _EventStream_resolveConnectedPromise, "f").call(this);
    this._emit("connect");
  }
  get ended() {
    return __classPrivateFieldGet3(this, _EventStream_ended, "f");
  }
  get errored() {
    return __classPrivateFieldGet3(this, _EventStream_errored, "f");
  }
  get aborted() {
    return __classPrivateFieldGet3(this, _EventStream_aborted, "f");
  }
  abort() {
    this.controller.abort();
  }
  /**
   * Adds the listener function to the end of the listeners array for the event.
   * No checks are made to see if the listener has already been added. Multiple calls passing
   * the same combination of event and listener will result in the listener being added, and
   * called, multiple times.
   * @returns this ChatCompletionStream, so that calls can be chained
   */
  on(event, listener) {
    const listeners = __classPrivateFieldGet3(this, _EventStream_listeners, "f")[event] || (__classPrivateFieldGet3(this, _EventStream_listeners, "f")[event] = []);
    listeners.push({ listener });
    return this;
  }
  /**
   * Removes the specified listener from the listener array for the event.
   * off() will remove, at most, one instance of a listener from the listener array. If any single
   * listener has been added multiple times to the listener array for the specified event, then
   * off() must be called multiple times to remove each instance.
   * @returns this ChatCompletionStream, so that calls can be chained
   */
  off(event, listener) {
    const listeners = __classPrivateFieldGet3(this, _EventStream_listeners, "f")[event];
    if (!listeners)
      return this;
    const index = listeners.findIndex((l) => l.listener === listener);
    if (index >= 0)
      listeners.splice(index, 1);
    return this;
  }
  /**
   * Adds a one-time listener function for the event. The next time the event is triggered,
   * this listener is removed and then invoked.
   * @returns this ChatCompletionStream, so that calls can be chained
   */
  once(event, listener) {
    const listeners = __classPrivateFieldGet3(this, _EventStream_listeners, "f")[event] || (__classPrivateFieldGet3(this, _EventStream_listeners, "f")[event] = []);
    listeners.push({ listener, once: true });
    return this;
  }
  /**
   * This is similar to `.once()`, but returns a Promise that resolves the next time
   * the event is triggered, instead of calling a listener callback.
   * @returns a Promise that resolves the next time given event is triggered,
   * or rejects if an error is emitted.  (If you request the 'error' event,
   * returns a promise that resolves with the error).
   *
   * Example:
   *
   *   const message = await stream.emitted('message') // rejects if the stream errors
   */
  emitted(event) {
    return new Promise((resolve, reject) => {
      __classPrivateFieldSet3(this, _EventStream_catchingPromiseCreated, true, "f");
      if (event !== "error")
        this.once("error", reject);
      this.once(event, resolve);
    });
  }
  async done() {
    __classPrivateFieldSet3(this, _EventStream_catchingPromiseCreated, true, "f");
    await __classPrivateFieldGet3(this, _EventStream_endPromise, "f");
  }
  _emit(event, ...args) {
    if (__classPrivateFieldGet3(this, _EventStream_ended, "f")) {
      return;
    }
    if (event === "end") {
      __classPrivateFieldSet3(this, _EventStream_ended, true, "f");
      __classPrivateFieldGet3(this, _EventStream_resolveEndPromise, "f").call(this);
    }
    const listeners = __classPrivateFieldGet3(this, _EventStream_listeners, "f")[event];
    if (listeners) {
      __classPrivateFieldGet3(this, _EventStream_listeners, "f")[event] = listeners.filter((l) => !l.once);
      listeners.forEach(({ listener }) => listener(...args));
    }
    if (event === "abort") {
      const error = args[0];
      if (!__classPrivateFieldGet3(this, _EventStream_catchingPromiseCreated, "f") && !listeners?.length) {
        Promise.reject(error);
      }
      __classPrivateFieldGet3(this, _EventStream_rejectConnectedPromise, "f").call(this, error);
      __classPrivateFieldGet3(this, _EventStream_rejectEndPromise, "f").call(this, error);
      this._emit("end");
      return;
    }
    if (event === "error") {
      const error = args[0];
      if (!__classPrivateFieldGet3(this, _EventStream_catchingPromiseCreated, "f") && !listeners?.length) {
        Promise.reject(error);
      }
      __classPrivateFieldGet3(this, _EventStream_rejectConnectedPromise, "f").call(this, error);
      __classPrivateFieldGet3(this, _EventStream_rejectEndPromise, "f").call(this, error);
      this._emit("end");
    }
  }
  _emitFinal() {
  }
};
_EventStream_connectedPromise = /* @__PURE__ */ new WeakMap(), _EventStream_resolveConnectedPromise = /* @__PURE__ */ new WeakMap(), _EventStream_rejectConnectedPromise = /* @__PURE__ */ new WeakMap(), _EventStream_endPromise = /* @__PURE__ */ new WeakMap(), _EventStream_resolveEndPromise = /* @__PURE__ */ new WeakMap(), _EventStream_rejectEndPromise = /* @__PURE__ */ new WeakMap(), _EventStream_listeners = /* @__PURE__ */ new WeakMap(), _EventStream_ended = /* @__PURE__ */ new WeakMap(), _EventStream_errored = /* @__PURE__ */ new WeakMap(), _EventStream_aborted = /* @__PURE__ */ new WeakMap(), _EventStream_catchingPromiseCreated = /* @__PURE__ */ new WeakMap(), _EventStream_instances = /* @__PURE__ */ new WeakSet(), _EventStream_handleError = function _EventStream_handleError2(error) {
  __classPrivateFieldSet3(this, _EventStream_errored, true, "f");
  if (error instanceof Error && error.name === "AbortError") {
    error = new APIUserAbortError();
  }
  if (error instanceof APIUserAbortError) {
    __classPrivateFieldSet3(this, _EventStream_aborted, true, "f");
    return this._emit("abort", error);
  }
  if (error instanceof OpenAIError) {
    return this._emit("error", error);
  }
  if (error instanceof Error) {
    const openAIError = new OpenAIError(error.message);
    openAIError.cause = error;
    return this._emit("error", openAIError);
  }
  return this._emit("error", new OpenAIError(String(error)));
};

// node_modules/openai/lib/AssistantStream.mjs
var __classPrivateFieldGet4 = function(receiver, state, kind2, f) {
  if (kind2 === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind2 === "m" ? f : kind2 === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet4 = function(receiver, state, value, kind2, f) {
  if (kind2 === "m") throw new TypeError("Private method is not writable");
  if (kind2 === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind2 === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
};
var _AssistantStream_instances;
var _AssistantStream_events;
var _AssistantStream_runStepSnapshots;
var _AssistantStream_messageSnapshots;
var _AssistantStream_messageSnapshot;
var _AssistantStream_finalRun;
var _AssistantStream_currentContentIndex;
var _AssistantStream_currentContent;
var _AssistantStream_currentToolCallIndex;
var _AssistantStream_currentToolCall;
var _AssistantStream_currentEvent;
var _AssistantStream_currentRunSnapshot;
var _AssistantStream_currentRunStepSnapshot;
var _AssistantStream_addEvent;
var _AssistantStream_endRequest;
var _AssistantStream_handleMessage;
var _AssistantStream_handleRunStep;
var _AssistantStream_handleEvent;
var _AssistantStream_accumulateRunStep;
var _AssistantStream_accumulateMessage;
var _AssistantStream_accumulateContent;
var _AssistantStream_handleRun;
var AssistantStream = class _AssistantStream extends EventStream {
  constructor() {
    super(...arguments);
    _AssistantStream_instances.add(this);
    _AssistantStream_events.set(this, []);
    _AssistantStream_runStepSnapshots.set(this, {});
    _AssistantStream_messageSnapshots.set(this, {});
    _AssistantStream_messageSnapshot.set(this, void 0);
    _AssistantStream_finalRun.set(this, void 0);
    _AssistantStream_currentContentIndex.set(this, void 0);
    _AssistantStream_currentContent.set(this, void 0);
    _AssistantStream_currentToolCallIndex.set(this, void 0);
    _AssistantStream_currentToolCall.set(this, void 0);
    _AssistantStream_currentEvent.set(this, void 0);
    _AssistantStream_currentRunSnapshot.set(this, void 0);
    _AssistantStream_currentRunStepSnapshot.set(this, void 0);
  }
  [(_AssistantStream_events = /* @__PURE__ */ new WeakMap(), _AssistantStream_runStepSnapshots = /* @__PURE__ */ new WeakMap(), _AssistantStream_messageSnapshots = /* @__PURE__ */ new WeakMap(), _AssistantStream_messageSnapshot = /* @__PURE__ */ new WeakMap(), _AssistantStream_finalRun = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentContentIndex = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentContent = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentToolCallIndex = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentToolCall = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentEvent = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentRunSnapshot = /* @__PURE__ */ new WeakMap(), _AssistantStream_currentRunStepSnapshot = /* @__PURE__ */ new WeakMap(), _AssistantStream_instances = /* @__PURE__ */ new WeakSet(), Symbol.asyncIterator)]() {
    const pushQueue = [];
    const readQueue = [];
    let done = false;
    this.on("event", (event) => {
      const reader = readQueue.shift();
      if (reader) {
        reader.resolve(event);
      } else {
        pushQueue.push(event);
      }
    });
    this.on("end", () => {
      done = true;
      for (const reader of readQueue) {
        reader.resolve(void 0);
      }
      readQueue.length = 0;
    });
    this.on("abort", (err) => {
      done = true;
      for (const reader of readQueue) {
        reader.reject(err);
      }
      readQueue.length = 0;
    });
    this.on("error", (err) => {
      done = true;
      for (const reader of readQueue) {
        reader.reject(err);
      }
      readQueue.length = 0;
    });
    return {
      next: async () => {
        if (!pushQueue.length) {
          if (done) {
            return { value: void 0, done: true };
          }
          return new Promise((resolve, reject) => readQueue.push({ resolve, reject })).then((chunk2) => chunk2 ? { value: chunk2, done: false } : { value: void 0, done: true });
        }
        const chunk = pushQueue.shift();
        return { value: chunk, done: false };
      },
      return: async () => {
        this.abort();
        return { value: void 0, done: true };
      }
    };
  }
  static fromReadableStream(stream) {
    const runner = new _AssistantStream();
    runner._run(() => runner._fromReadableStream(stream));
    return runner;
  }
  async _fromReadableStream(readableStream, options) {
    const signal = options?.signal;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      signal.addEventListener("abort", () => this.controller.abort());
    }
    this._connected();
    const stream = Stream.fromReadableStream(readableStream, this.controller);
    for await (const event of stream) {
      __classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_addEvent).call(this, event);
    }
    if (stream.controller.signal?.aborted) {
      throw new APIUserAbortError();
    }
    return this._addRun(__classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_endRequest).call(this));
  }
  toReadableStream() {
    const stream = new Stream(this[Symbol.asyncIterator].bind(this), this.controller);
    return stream.toReadableStream();
  }
  static createToolAssistantStream(threadId, runId, runs, params, options) {
    const runner = new _AssistantStream();
    runner._run(() => runner._runToolAssistantStream(threadId, runId, runs, params, {
      ...options,
      headers: { ...options?.headers, "X-Stainless-Helper-Method": "stream" }
    }));
    return runner;
  }
  async _createToolAssistantStream(run, threadId, runId, params, options) {
    const signal = options?.signal;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      signal.addEventListener("abort", () => this.controller.abort());
    }
    const body = { ...params, stream: true };
    const stream = await run.submitToolOutputs(threadId, runId, body, {
      ...options,
      signal: this.controller.signal
    });
    this._connected();
    for await (const event of stream) {
      __classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_addEvent).call(this, event);
    }
    if (stream.controller.signal?.aborted) {
      throw new APIUserAbortError();
    }
    return this._addRun(__classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_endRequest).call(this));
  }
  static createThreadAssistantStream(params, thread, options) {
    const runner = new _AssistantStream();
    runner._run(() => runner._threadAssistantStream(params, thread, {
      ...options,
      headers: { ...options?.headers, "X-Stainless-Helper-Method": "stream" }
    }));
    return runner;
  }
  static createAssistantStream(threadId, runs, params, options) {
    const runner = new _AssistantStream();
    runner._run(() => runner._runAssistantStream(threadId, runs, params, {
      ...options,
      headers: { ...options?.headers, "X-Stainless-Helper-Method": "stream" }
    }));
    return runner;
  }
  currentEvent() {
    return __classPrivateFieldGet4(this, _AssistantStream_currentEvent, "f");
  }
  currentRun() {
    return __classPrivateFieldGet4(this, _AssistantStream_currentRunSnapshot, "f");
  }
  currentMessageSnapshot() {
    return __classPrivateFieldGet4(this, _AssistantStream_messageSnapshot, "f");
  }
  currentRunStepSnapshot() {
    return __classPrivateFieldGet4(this, _AssistantStream_currentRunStepSnapshot, "f");
  }
  async finalRunSteps() {
    await this.done();
    return Object.values(__classPrivateFieldGet4(this, _AssistantStream_runStepSnapshots, "f"));
  }
  async finalMessages() {
    await this.done();
    return Object.values(__classPrivateFieldGet4(this, _AssistantStream_messageSnapshots, "f"));
  }
  async finalRun() {
    await this.done();
    if (!__classPrivateFieldGet4(this, _AssistantStream_finalRun, "f"))
      throw Error("Final run was not received.");
    return __classPrivateFieldGet4(this, _AssistantStream_finalRun, "f");
  }
  async _createThreadAssistantStream(thread, params, options) {
    const signal = options?.signal;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      signal.addEventListener("abort", () => this.controller.abort());
    }
    const body = { ...params, stream: true };
    const stream = await thread.createAndRun(body, { ...options, signal: this.controller.signal });
    this._connected();
    for await (const event of stream) {
      __classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_addEvent).call(this, event);
    }
    if (stream.controller.signal?.aborted) {
      throw new APIUserAbortError();
    }
    return this._addRun(__classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_endRequest).call(this));
  }
  async _createAssistantStream(run, threadId, params, options) {
    const signal = options?.signal;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      signal.addEventListener("abort", () => this.controller.abort());
    }
    const body = { ...params, stream: true };
    const stream = await run.create(threadId, body, { ...options, signal: this.controller.signal });
    this._connected();
    for await (const event of stream) {
      __classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_addEvent).call(this, event);
    }
    if (stream.controller.signal?.aborted) {
      throw new APIUserAbortError();
    }
    return this._addRun(__classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_endRequest).call(this));
  }
  static accumulateDelta(acc, delta) {
    for (const [key, deltaValue] of Object.entries(delta)) {
      if (!acc.hasOwnProperty(key)) {
        acc[key] = deltaValue;
        continue;
      }
      let accValue = acc[key];
      if (accValue === null || accValue === void 0) {
        acc[key] = deltaValue;
        continue;
      }
      if (key === "index" || key === "type") {
        acc[key] = deltaValue;
        continue;
      }
      if (typeof accValue === "string" && typeof deltaValue === "string") {
        accValue += deltaValue;
      } else if (typeof accValue === "number" && typeof deltaValue === "number") {
        accValue += deltaValue;
      } else if (isObj(accValue) && isObj(deltaValue)) {
        accValue = this.accumulateDelta(accValue, deltaValue);
      } else if (Array.isArray(accValue) && Array.isArray(deltaValue)) {
        if (accValue.every((x) => typeof x === "string" || typeof x === "number")) {
          accValue.push(...deltaValue);
          continue;
        }
        for (const deltaEntry of deltaValue) {
          if (!isObj(deltaEntry)) {
            throw new Error(`Expected array delta entry to be an object but got: ${deltaEntry}`);
          }
          const index = deltaEntry["index"];
          if (index == null) {
            console.error(deltaEntry);
            throw new Error("Expected array delta entry to have an `index` property");
          }
          if (typeof index !== "number") {
            throw new Error(`Expected array delta entry \`index\` property to be a number but got ${index}`);
          }
          const accEntry = accValue[index];
          if (accEntry == null) {
            accValue.push(deltaEntry);
          } else {
            accValue[index] = this.accumulateDelta(accEntry, deltaEntry);
          }
        }
        continue;
      } else {
        throw Error(`Unhandled record type: ${key}, deltaValue: ${deltaValue}, accValue: ${accValue}`);
      }
      acc[key] = accValue;
    }
    return acc;
  }
  _addRun(run) {
    return run;
  }
  async _threadAssistantStream(params, thread, options) {
    return await this._createThreadAssistantStream(thread, params, options);
  }
  async _runAssistantStream(threadId, runs, params, options) {
    return await this._createAssistantStream(runs, threadId, params, options);
  }
  async _runToolAssistantStream(threadId, runId, runs, params, options) {
    return await this._createToolAssistantStream(runs, threadId, runId, params, options);
  }
};
_AssistantStream_addEvent = function _AssistantStream_addEvent2(event) {
  if (this.ended)
    return;
  __classPrivateFieldSet4(this, _AssistantStream_currentEvent, event, "f");
  __classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_handleEvent).call(this, event);
  switch (event.event) {
    case "thread.created":
      break;
    case "thread.run.created":
    case "thread.run.queued":
    case "thread.run.in_progress":
    case "thread.run.requires_action":
    case "thread.run.completed":
    case "thread.run.incomplete":
    case "thread.run.failed":
    case "thread.run.cancelling":
    case "thread.run.cancelled":
    case "thread.run.expired":
      __classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_handleRun).call(this, event);
      break;
    case "thread.run.step.created":
    case "thread.run.step.in_progress":
    case "thread.run.step.delta":
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
      __classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_handleRunStep).call(this, event);
      break;
    case "thread.message.created":
    case "thread.message.in_progress":
    case "thread.message.delta":
    case "thread.message.completed":
    case "thread.message.incomplete":
      __classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_handleMessage).call(this, event);
      break;
    case "error":
      throw new Error("Encountered an error event in event processing - errors should be processed earlier");
    default:
      assertNever(event);
  }
}, _AssistantStream_endRequest = function _AssistantStream_endRequest2() {
  if (this.ended) {
    throw new OpenAIError(`stream has ended, this shouldn't happen`);
  }
  if (!__classPrivateFieldGet4(this, _AssistantStream_finalRun, "f"))
    throw Error("Final run has not been received");
  return __classPrivateFieldGet4(this, _AssistantStream_finalRun, "f");
}, _AssistantStream_handleMessage = function _AssistantStream_handleMessage2(event) {
  const [accumulatedMessage, newContent] = __classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_accumulateMessage).call(this, event, __classPrivateFieldGet4(this, _AssistantStream_messageSnapshot, "f"));
  __classPrivateFieldSet4(this, _AssistantStream_messageSnapshot, accumulatedMessage, "f");
  __classPrivateFieldGet4(this, _AssistantStream_messageSnapshots, "f")[accumulatedMessage.id] = accumulatedMessage;
  for (const content of newContent) {
    const snapshotContent = accumulatedMessage.content[content.index];
    if (snapshotContent?.type == "text") {
      this._emit("textCreated", snapshotContent.text);
    }
  }
  switch (event.event) {
    case "thread.message.created":
      this._emit("messageCreated", event.data);
      break;
    case "thread.message.in_progress":
      break;
    case "thread.message.delta":
      this._emit("messageDelta", event.data.delta, accumulatedMessage);
      if (event.data.delta.content) {
        for (const content of event.data.delta.content) {
          if (content.type == "text" && content.text) {
            let textDelta = content.text;
            let snapshot = accumulatedMessage.content[content.index];
            if (snapshot && snapshot.type == "text") {
              this._emit("textDelta", textDelta, snapshot.text);
            } else {
              throw Error("The snapshot associated with this text delta is not text or missing");
            }
          }
          if (content.index != __classPrivateFieldGet4(this, _AssistantStream_currentContentIndex, "f")) {
            if (__classPrivateFieldGet4(this, _AssistantStream_currentContent, "f")) {
              switch (__classPrivateFieldGet4(this, _AssistantStream_currentContent, "f").type) {
                case "text":
                  this._emit("textDone", __classPrivateFieldGet4(this, _AssistantStream_currentContent, "f").text, __classPrivateFieldGet4(this, _AssistantStream_messageSnapshot, "f"));
                  break;
                case "image_file":
                  this._emit("imageFileDone", __classPrivateFieldGet4(this, _AssistantStream_currentContent, "f").image_file, __classPrivateFieldGet4(this, _AssistantStream_messageSnapshot, "f"));
                  break;
              }
            }
            __classPrivateFieldSet4(this, _AssistantStream_currentContentIndex, content.index, "f");
          }
          __classPrivateFieldSet4(this, _AssistantStream_currentContent, accumulatedMessage.content[content.index], "f");
        }
      }
      break;
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (__classPrivateFieldGet4(this, _AssistantStream_currentContentIndex, "f") !== void 0) {
        const currentContent = event.data.content[__classPrivateFieldGet4(this, _AssistantStream_currentContentIndex, "f")];
        if (currentContent) {
          switch (currentContent.type) {
            case "image_file":
              this._emit("imageFileDone", currentContent.image_file, __classPrivateFieldGet4(this, _AssistantStream_messageSnapshot, "f"));
              break;
            case "text":
              this._emit("textDone", currentContent.text, __classPrivateFieldGet4(this, _AssistantStream_messageSnapshot, "f"));
              break;
          }
        }
      }
      if (__classPrivateFieldGet4(this, _AssistantStream_messageSnapshot, "f")) {
        this._emit("messageDone", event.data);
      }
      __classPrivateFieldSet4(this, _AssistantStream_messageSnapshot, void 0, "f");
  }
}, _AssistantStream_handleRunStep = function _AssistantStream_handleRunStep2(event) {
  const accumulatedRunStep = __classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_accumulateRunStep).call(this, event);
  __classPrivateFieldSet4(this, _AssistantStream_currentRunStepSnapshot, accumulatedRunStep, "f");
  switch (event.event) {
    case "thread.run.step.created":
      this._emit("runStepCreated", event.data);
      break;
    case "thread.run.step.delta":
      const delta = event.data.delta;
      if (delta.step_details && delta.step_details.type == "tool_calls" && delta.step_details.tool_calls && accumulatedRunStep.step_details.type == "tool_calls") {
        for (const toolCall of delta.step_details.tool_calls) {
          if (toolCall.index == __classPrivateFieldGet4(this, _AssistantStream_currentToolCallIndex, "f")) {
            this._emit("toolCallDelta", toolCall, accumulatedRunStep.step_details.tool_calls[toolCall.index]);
          } else {
            if (__classPrivateFieldGet4(this, _AssistantStream_currentToolCall, "f")) {
              this._emit("toolCallDone", __classPrivateFieldGet4(this, _AssistantStream_currentToolCall, "f"));
            }
            __classPrivateFieldSet4(this, _AssistantStream_currentToolCallIndex, toolCall.index, "f");
            __classPrivateFieldSet4(this, _AssistantStream_currentToolCall, accumulatedRunStep.step_details.tool_calls[toolCall.index], "f");
            if (__classPrivateFieldGet4(this, _AssistantStream_currentToolCall, "f"))
              this._emit("toolCallCreated", __classPrivateFieldGet4(this, _AssistantStream_currentToolCall, "f"));
          }
        }
      }
      this._emit("runStepDelta", event.data.delta, accumulatedRunStep);
      break;
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
      __classPrivateFieldSet4(this, _AssistantStream_currentRunStepSnapshot, void 0, "f");
      const details = event.data.step_details;
      if (details.type == "tool_calls") {
        if (__classPrivateFieldGet4(this, _AssistantStream_currentToolCall, "f")) {
          this._emit("toolCallDone", __classPrivateFieldGet4(this, _AssistantStream_currentToolCall, "f"));
          __classPrivateFieldSet4(this, _AssistantStream_currentToolCall, void 0, "f");
        }
      }
      this._emit("runStepDone", event.data, accumulatedRunStep);
      break;
    case "thread.run.step.in_progress":
      break;
  }
}, _AssistantStream_handleEvent = function _AssistantStream_handleEvent2(event) {
  __classPrivateFieldGet4(this, _AssistantStream_events, "f").push(event);
  this._emit("event", event);
}, _AssistantStream_accumulateRunStep = function _AssistantStream_accumulateRunStep2(event) {
  switch (event.event) {
    case "thread.run.step.created":
      __classPrivateFieldGet4(this, _AssistantStream_runStepSnapshots, "f")[event.data.id] = event.data;
      return event.data;
    case "thread.run.step.delta":
      let snapshot = __classPrivateFieldGet4(this, _AssistantStream_runStepSnapshots, "f")[event.data.id];
      if (!snapshot) {
        throw Error("Received a RunStepDelta before creation of a snapshot");
      }
      let data = event.data;
      if (data.delta) {
        const accumulated = AssistantStream.accumulateDelta(snapshot, data.delta);
        __classPrivateFieldGet4(this, _AssistantStream_runStepSnapshots, "f")[event.data.id] = accumulated;
      }
      return __classPrivateFieldGet4(this, _AssistantStream_runStepSnapshots, "f")[event.data.id];
    case "thread.run.step.completed":
    case "thread.run.step.failed":
    case "thread.run.step.cancelled":
    case "thread.run.step.expired":
    case "thread.run.step.in_progress":
      __classPrivateFieldGet4(this, _AssistantStream_runStepSnapshots, "f")[event.data.id] = event.data;
      break;
  }
  if (__classPrivateFieldGet4(this, _AssistantStream_runStepSnapshots, "f")[event.data.id])
    return __classPrivateFieldGet4(this, _AssistantStream_runStepSnapshots, "f")[event.data.id];
  throw new Error("No snapshot available");
}, _AssistantStream_accumulateMessage = function _AssistantStream_accumulateMessage2(event, snapshot) {
  let newContent = [];
  switch (event.event) {
    case "thread.message.created":
      return [event.data, newContent];
    case "thread.message.delta":
      if (!snapshot) {
        throw Error("Received a delta with no existing snapshot (there should be one from message creation)");
      }
      let data = event.data;
      if (data.delta.content) {
        for (const contentElement of data.delta.content) {
          if (contentElement.index in snapshot.content) {
            let currentContent = snapshot.content[contentElement.index];
            snapshot.content[contentElement.index] = __classPrivateFieldGet4(this, _AssistantStream_instances, "m", _AssistantStream_accumulateContent).call(this, contentElement, currentContent);
          } else {
            snapshot.content[contentElement.index] = contentElement;
            newContent.push(contentElement);
          }
        }
      }
      return [snapshot, newContent];
    case "thread.message.in_progress":
    case "thread.message.completed":
    case "thread.message.incomplete":
      if (snapshot) {
        return [snapshot, newContent];
      } else {
        throw Error("Received thread message event with no existing snapshot");
      }
  }
  throw Error("Tried to accumulate a non-message event");
}, _AssistantStream_accumulateContent = function _AssistantStream_accumulateContent2(contentElement, currentContent) {
  return AssistantStream.accumulateDelta(currentContent, contentElement);
}, _AssistantStream_handleRun = function _AssistantStream_handleRun2(event) {
  __classPrivateFieldSet4(this, _AssistantStream_currentRunSnapshot, event.data, "f");
  switch (event.event) {
    case "thread.run.created":
      break;
    case "thread.run.queued":
      break;
    case "thread.run.in_progress":
      break;
    case "thread.run.requires_action":
    case "thread.run.cancelled":
    case "thread.run.failed":
    case "thread.run.completed":
    case "thread.run.expired":
      __classPrivateFieldSet4(this, _AssistantStream_finalRun, event.data, "f");
      if (__classPrivateFieldGet4(this, _AssistantStream_currentToolCall, "f")) {
        this._emit("toolCallDone", __classPrivateFieldGet4(this, _AssistantStream_currentToolCall, "f"));
        __classPrivateFieldSet4(this, _AssistantStream_currentToolCall, void 0, "f");
      }
      break;
    case "thread.run.cancelling":
      break;
  }
};
function assertNever(_x) {
}

// node_modules/openai/resources/beta/assistants.mjs
var Assistants = class extends APIResource {
  /**
   * Create an assistant with a model and instructions.
   *
   * @example
   * ```ts
   * const assistant = await client.beta.assistants.create({
   *   model: 'gpt-4o',
   * });
   * ```
   */
  create(body, options) {
    return this._client.post("/assistants", {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Retrieves an assistant.
   *
   * @example
   * ```ts
   * const assistant = await client.beta.assistants.retrieve(
   *   'assistant_id',
   * );
   * ```
   */
  retrieve(assistantId, options) {
    return this._client.get(`/assistants/${assistantId}`, {
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Modifies an assistant.
   *
   * @example
   * ```ts
   * const assistant = await client.beta.assistants.update(
   *   'assistant_id',
   * );
   * ```
   */
  update(assistantId, body, options) {
    return this._client.post(`/assistants/${assistantId}`, {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  list(query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.getAPIList("/assistants", AssistantsPage, {
      query,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Delete an assistant.
   *
   * @example
   * ```ts
   * const assistantDeleted = await client.beta.assistants.del(
   *   'assistant_id',
   * );
   * ```
   */
  del(assistantId, options) {
    return this._client.delete(`/assistants/${assistantId}`, {
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
};
var AssistantsPage = class extends CursorPage {
};
Assistants.AssistantsPage = AssistantsPage;

// node_modules/openai/lib/RunnableFunction.mjs
function isRunnableFunctionWithParse(fn) {
  return typeof fn.parse === "function";
}

// node_modules/openai/lib/chatCompletionUtils.mjs
var isAssistantMessage = (message) => {
  return message?.role === "assistant";
};
var isFunctionMessage = (message) => {
  return message?.role === "function";
};
var isToolMessage = (message) => {
  return message?.role === "tool";
};

// node_modules/openai/lib/parser.mjs
function isAutoParsableResponseFormat(response_format) {
  return response_format?.["$brand"] === "auto-parseable-response-format";
}
function isAutoParsableTool(tool) {
  return tool?.["$brand"] === "auto-parseable-tool";
}
function maybeParseChatCompletion(completion, params) {
  if (!params || !hasAutoParseableInput(params)) {
    return {
      ...completion,
      choices: completion.choices.map((choice) => ({
        ...choice,
        message: {
          ...choice.message,
          parsed: null,
          ...choice.message.tool_calls ? {
            tool_calls: choice.message.tool_calls
          } : void 0
        }
      }))
    };
  }
  return parseChatCompletion(completion, params);
}
function parseChatCompletion(completion, params) {
  const choices = completion.choices.map((choice) => {
    if (choice.finish_reason === "length") {
      throw new LengthFinishReasonError();
    }
    if (choice.finish_reason === "content_filter") {
      throw new ContentFilterFinishReasonError();
    }
    return {
      ...choice,
      message: {
        ...choice.message,
        ...choice.message.tool_calls ? {
          tool_calls: choice.message.tool_calls?.map((toolCall) => parseToolCall(params, toolCall)) ?? void 0
        } : void 0,
        parsed: choice.message.content && !choice.message.refusal ? parseResponseFormat(params, choice.message.content) : null
      }
    };
  });
  return { ...completion, choices };
}
function parseResponseFormat(params, content) {
  if (params.response_format?.type !== "json_schema") {
    return null;
  }
  if (params.response_format?.type === "json_schema") {
    if ("$parseRaw" in params.response_format) {
      const response_format = params.response_format;
      return response_format.$parseRaw(content);
    }
    return JSON.parse(content);
  }
  return null;
}
function parseToolCall(params, toolCall) {
  const inputTool = params.tools?.find((inputTool2) => inputTool2.function?.name === toolCall.function.name);
  return {
    ...toolCall,
    function: {
      ...toolCall.function,
      parsed_arguments: isAutoParsableTool(inputTool) ? inputTool.$parseRaw(toolCall.function.arguments) : inputTool?.function.strict ? JSON.parse(toolCall.function.arguments) : null
    }
  };
}
function shouldParseToolCall(params, toolCall) {
  if (!params) {
    return false;
  }
  const inputTool = params.tools?.find((inputTool2) => inputTool2.function?.name === toolCall.function.name);
  return isAutoParsableTool(inputTool) || inputTool?.function.strict || false;
}
function hasAutoParseableInput(params) {
  if (isAutoParsableResponseFormat(params.response_format)) {
    return true;
  }
  return params.tools?.some((t2) => isAutoParsableTool(t2) || t2.type === "function" && t2.function.strict === true) ?? false;
}
function validateInputTools(tools) {
  for (const tool of tools ?? []) {
    if (tool.type !== "function") {
      throw new OpenAIError(`Currently only \`function\` tool types support auto-parsing; Received \`${tool.type}\``);
    }
    if (tool.function.strict !== true) {
      throw new OpenAIError(`The \`${tool.function.name}\` tool is not marked with \`strict: true\`. Only strict function tools can be auto-parsed`);
    }
  }
}

// node_modules/openai/lib/AbstractChatCompletionRunner.mjs
var __classPrivateFieldGet5 = function(receiver, state, kind2, f) {
  if (kind2 === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind2 === "m" ? f : kind2 === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _AbstractChatCompletionRunner_instances;
var _AbstractChatCompletionRunner_getFinalContent;
var _AbstractChatCompletionRunner_getFinalMessage;
var _AbstractChatCompletionRunner_getFinalFunctionCall;
var _AbstractChatCompletionRunner_getFinalFunctionCallResult;
var _AbstractChatCompletionRunner_calculateTotalUsage;
var _AbstractChatCompletionRunner_validateParams;
var _AbstractChatCompletionRunner_stringifyFunctionCallResult;
var DEFAULT_MAX_CHAT_COMPLETIONS = 10;
var AbstractChatCompletionRunner = class extends EventStream {
  constructor() {
    super(...arguments);
    _AbstractChatCompletionRunner_instances.add(this);
    this._chatCompletions = [];
    this.messages = [];
  }
  _addChatCompletion(chatCompletion) {
    this._chatCompletions.push(chatCompletion);
    this._emit("chatCompletion", chatCompletion);
    const message = chatCompletion.choices[0]?.message;
    if (message)
      this._addMessage(message);
    return chatCompletion;
  }
  _addMessage(message, emit = true) {
    if (!("content" in message))
      message.content = null;
    this.messages.push(message);
    if (emit) {
      this._emit("message", message);
      if ((isFunctionMessage(message) || isToolMessage(message)) && message.content) {
        this._emit("functionCallResult", message.content);
      } else if (isAssistantMessage(message) && message.function_call) {
        this._emit("functionCall", message.function_call);
      } else if (isAssistantMessage(message) && message.tool_calls) {
        for (const tool_call of message.tool_calls) {
          if (tool_call.type === "function") {
            this._emit("functionCall", tool_call.function);
          }
        }
      }
    }
  }
  /**
   * @returns a promise that resolves with the final ChatCompletion, or rejects
   * if an error occurred or the stream ended prematurely without producing a ChatCompletion.
   */
  async finalChatCompletion() {
    await this.done();
    const completion = this._chatCompletions[this._chatCompletions.length - 1];
    if (!completion)
      throw new OpenAIError("stream ended without producing a ChatCompletion");
    return completion;
  }
  /**
   * @returns a promise that resolves with the content of the final ChatCompletionMessage, or rejects
   * if an error occurred or the stream ended prematurely without producing a ChatCompletionMessage.
   */
  async finalContent() {
    await this.done();
    return __classPrivateFieldGet5(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalContent).call(this);
  }
  /**
   * @returns a promise that resolves with the the final assistant ChatCompletionMessage response,
   * or rejects if an error occurred or the stream ended prematurely without producing a ChatCompletionMessage.
   */
  async finalMessage() {
    await this.done();
    return __classPrivateFieldGet5(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalMessage).call(this);
  }
  /**
   * @returns a promise that resolves with the content of the final FunctionCall, or rejects
   * if an error occurred or the stream ended prematurely without producing a ChatCompletionMessage.
   */
  async finalFunctionCall() {
    await this.done();
    return __classPrivateFieldGet5(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalFunctionCall).call(this);
  }
  async finalFunctionCallResult() {
    await this.done();
    return __classPrivateFieldGet5(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalFunctionCallResult).call(this);
  }
  async totalUsage() {
    await this.done();
    return __classPrivateFieldGet5(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_calculateTotalUsage).call(this);
  }
  allChatCompletions() {
    return [...this._chatCompletions];
  }
  _emitFinal() {
    const completion = this._chatCompletions[this._chatCompletions.length - 1];
    if (completion)
      this._emit("finalChatCompletion", completion);
    const finalMessage = __classPrivateFieldGet5(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalMessage).call(this);
    if (finalMessage)
      this._emit("finalMessage", finalMessage);
    const finalContent = __classPrivateFieldGet5(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalContent).call(this);
    if (finalContent)
      this._emit("finalContent", finalContent);
    const finalFunctionCall = __classPrivateFieldGet5(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalFunctionCall).call(this);
    if (finalFunctionCall)
      this._emit("finalFunctionCall", finalFunctionCall);
    const finalFunctionCallResult = __classPrivateFieldGet5(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalFunctionCallResult).call(this);
    if (finalFunctionCallResult != null)
      this._emit("finalFunctionCallResult", finalFunctionCallResult);
    if (this._chatCompletions.some((c) => c.usage)) {
      this._emit("totalUsage", __classPrivateFieldGet5(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_calculateTotalUsage).call(this));
    }
  }
  async _createChatCompletion(client, params, options) {
    const signal = options?.signal;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      signal.addEventListener("abort", () => this.controller.abort());
    }
    __classPrivateFieldGet5(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_validateParams).call(this, params);
    const chatCompletion = await client.chat.completions.create({ ...params, stream: false }, { ...options, signal: this.controller.signal });
    this._connected();
    return this._addChatCompletion(parseChatCompletion(chatCompletion, params));
  }
  async _runChatCompletion(client, params, options) {
    for (const message of params.messages) {
      this._addMessage(message, false);
    }
    return await this._createChatCompletion(client, params, options);
  }
  async _runFunctions(client, params, options) {
    const role = "function";
    const { function_call = "auto", stream, ...restParams } = params;
    const singleFunctionToCall = typeof function_call !== "string" && function_call?.name;
    const { maxChatCompletions = DEFAULT_MAX_CHAT_COMPLETIONS } = options || {};
    const functionsByName = {};
    for (const f of params.functions) {
      functionsByName[f.name || f.function.name] = f;
    }
    const functions = params.functions.map((f) => ({
      name: f.name || f.function.name,
      parameters: f.parameters,
      description: f.description
    }));
    for (const message of params.messages) {
      this._addMessage(message, false);
    }
    for (let i = 0; i < maxChatCompletions; ++i) {
      const chatCompletion = await this._createChatCompletion(client, {
        ...restParams,
        function_call,
        functions,
        messages: [...this.messages]
      }, options);
      const message = chatCompletion.choices[0]?.message;
      if (!message) {
        throw new OpenAIError(`missing message in ChatCompletion response`);
      }
      if (!message.function_call)
        return;
      const { name, arguments: args } = message.function_call;
      const fn = functionsByName[name];
      if (!fn) {
        const content2 = `Invalid function_call: ${JSON.stringify(name)}. Available options are: ${functions.map((f) => JSON.stringify(f.name)).join(", ")}. Please try again`;
        this._addMessage({ role, name, content: content2 });
        continue;
      } else if (singleFunctionToCall && singleFunctionToCall !== name) {
        const content2 = `Invalid function_call: ${JSON.stringify(name)}. ${JSON.stringify(singleFunctionToCall)} requested. Please try again`;
        this._addMessage({ role, name, content: content2 });
        continue;
      }
      let parsed;
      try {
        parsed = isRunnableFunctionWithParse(fn) ? await fn.parse(args) : args;
      } catch (error) {
        this._addMessage({
          role,
          name,
          content: error instanceof Error ? error.message : String(error)
        });
        continue;
      }
      const rawContent = await fn.function(parsed, this);
      const content = __classPrivateFieldGet5(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_stringifyFunctionCallResult).call(this, rawContent);
      this._addMessage({ role, name, content });
      if (singleFunctionToCall)
        return;
    }
  }
  async _runTools(client, params, options) {
    const role = "tool";
    const { tool_choice = "auto", stream, ...restParams } = params;
    const singleFunctionToCall = typeof tool_choice !== "string" && tool_choice?.function?.name;
    const { maxChatCompletions = DEFAULT_MAX_CHAT_COMPLETIONS } = options || {};
    const inputTools = params.tools.map((tool) => {
      if (isAutoParsableTool(tool)) {
        if (!tool.$callback) {
          throw new OpenAIError("Tool given to `.runTools()` that does not have an associated function");
        }
        return {
          type: "function",
          function: {
            function: tool.$callback,
            name: tool.function.name,
            description: tool.function.description || "",
            parameters: tool.function.parameters,
            parse: tool.$parseRaw,
            strict: true
          }
        };
      }
      return tool;
    });
    const functionsByName = {};
    for (const f of inputTools) {
      if (f.type === "function") {
        functionsByName[f.function.name || f.function.function.name] = f.function;
      }
    }
    const tools = "tools" in params ? inputTools.map((t2) => t2.type === "function" ? {
      type: "function",
      function: {
        name: t2.function.name || t2.function.function.name,
        parameters: t2.function.parameters,
        description: t2.function.description,
        strict: t2.function.strict
      }
    } : t2) : void 0;
    for (const message of params.messages) {
      this._addMessage(message, false);
    }
    for (let i = 0; i < maxChatCompletions; ++i) {
      const chatCompletion = await this._createChatCompletion(client, {
        ...restParams,
        tool_choice,
        tools,
        messages: [...this.messages]
      }, options);
      const message = chatCompletion.choices[0]?.message;
      if (!message) {
        throw new OpenAIError(`missing message in ChatCompletion response`);
      }
      if (!message.tool_calls?.length) {
        return;
      }
      for (const tool_call of message.tool_calls) {
        if (tool_call.type !== "function")
          continue;
        const tool_call_id = tool_call.id;
        const { name, arguments: args } = tool_call.function;
        const fn = functionsByName[name];
        if (!fn) {
          const content2 = `Invalid tool_call: ${JSON.stringify(name)}. Available options are: ${Object.keys(functionsByName).map((name2) => JSON.stringify(name2)).join(", ")}. Please try again`;
          this._addMessage({ role, tool_call_id, content: content2 });
          continue;
        } else if (singleFunctionToCall && singleFunctionToCall !== name) {
          const content2 = `Invalid tool_call: ${JSON.stringify(name)}. ${JSON.stringify(singleFunctionToCall)} requested. Please try again`;
          this._addMessage({ role, tool_call_id, content: content2 });
          continue;
        }
        let parsed;
        try {
          parsed = isRunnableFunctionWithParse(fn) ? await fn.parse(args) : args;
        } catch (error) {
          const content2 = error instanceof Error ? error.message : String(error);
          this._addMessage({ role, tool_call_id, content: content2 });
          continue;
        }
        const rawContent = await fn.function(parsed, this);
        const content = __classPrivateFieldGet5(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_stringifyFunctionCallResult).call(this, rawContent);
        this._addMessage({ role, tool_call_id, content });
        if (singleFunctionToCall) {
          return;
        }
      }
    }
    return;
  }
};
_AbstractChatCompletionRunner_instances = /* @__PURE__ */ new WeakSet(), _AbstractChatCompletionRunner_getFinalContent = function _AbstractChatCompletionRunner_getFinalContent2() {
  return __classPrivateFieldGet5(this, _AbstractChatCompletionRunner_instances, "m", _AbstractChatCompletionRunner_getFinalMessage).call(this).content ?? null;
}, _AbstractChatCompletionRunner_getFinalMessage = function _AbstractChatCompletionRunner_getFinalMessage2() {
  let i = this.messages.length;
  while (i-- > 0) {
    const message = this.messages[i];
    if (isAssistantMessage(message)) {
      const { function_call, ...rest } = message;
      const ret = {
        ...rest,
        content: message.content ?? null,
        refusal: message.refusal ?? null
      };
      if (function_call) {
        ret.function_call = function_call;
      }
      return ret;
    }
  }
  throw new OpenAIError("stream ended without producing a ChatCompletionMessage with role=assistant");
}, _AbstractChatCompletionRunner_getFinalFunctionCall = function _AbstractChatCompletionRunner_getFinalFunctionCall2() {
  for (let i = this.messages.length - 1; i >= 0; i--) {
    const message = this.messages[i];
    if (isAssistantMessage(message) && message?.function_call) {
      return message.function_call;
    }
    if (isAssistantMessage(message) && message?.tool_calls?.length) {
      return message.tool_calls.at(-1)?.function;
    }
  }
  return;
}, _AbstractChatCompletionRunner_getFinalFunctionCallResult = function _AbstractChatCompletionRunner_getFinalFunctionCallResult2() {
  for (let i = this.messages.length - 1; i >= 0; i--) {
    const message = this.messages[i];
    if (isFunctionMessage(message) && message.content != null) {
      return message.content;
    }
    if (isToolMessage(message) && message.content != null && typeof message.content === "string" && this.messages.some((x) => x.role === "assistant" && x.tool_calls?.some((y) => y.type === "function" && y.id === message.tool_call_id))) {
      return message.content;
    }
  }
  return;
}, _AbstractChatCompletionRunner_calculateTotalUsage = function _AbstractChatCompletionRunner_calculateTotalUsage2() {
  const total = {
    completion_tokens: 0,
    prompt_tokens: 0,
    total_tokens: 0
  };
  for (const { usage } of this._chatCompletions) {
    if (usage) {
      total.completion_tokens += usage.completion_tokens;
      total.prompt_tokens += usage.prompt_tokens;
      total.total_tokens += usage.total_tokens;
    }
  }
  return total;
}, _AbstractChatCompletionRunner_validateParams = function _AbstractChatCompletionRunner_validateParams2(params) {
  if (params.n != null && params.n > 1) {
    throw new OpenAIError("ChatCompletion convenience helpers only support n=1 at this time. To use n>1, please use chat.completions.create() directly.");
  }
}, _AbstractChatCompletionRunner_stringifyFunctionCallResult = function _AbstractChatCompletionRunner_stringifyFunctionCallResult2(rawContent) {
  return typeof rawContent === "string" ? rawContent : rawContent === void 0 ? "undefined" : JSON.stringify(rawContent);
};

// node_modules/openai/lib/ChatCompletionRunner.mjs
var ChatCompletionRunner = class _ChatCompletionRunner extends AbstractChatCompletionRunner {
  /** @deprecated - please use `runTools` instead. */
  static runFunctions(client, params, options) {
    const runner = new _ChatCompletionRunner();
    const opts = {
      ...options,
      headers: { ...options?.headers, "X-Stainless-Helper-Method": "runFunctions" }
    };
    runner._run(() => runner._runFunctions(client, params, opts));
    return runner;
  }
  static runTools(client, params, options) {
    const runner = new _ChatCompletionRunner();
    const opts = {
      ...options,
      headers: { ...options?.headers, "X-Stainless-Helper-Method": "runTools" }
    };
    runner._run(() => runner._runTools(client, params, opts));
    return runner;
  }
  _addMessage(message, emit = true) {
    super._addMessage(message, emit);
    if (isAssistantMessage(message) && message.content) {
      this._emit("content", message.content);
    }
  }
};

// node_modules/openai/_vendor/partial-json-parser/parser.mjs
var STR = 1;
var NUM = 2;
var ARR = 4;
var OBJ = 8;
var NULL = 16;
var BOOL = 32;
var NAN = 64;
var INFINITY = 128;
var MINUS_INFINITY = 256;
var INF = INFINITY | MINUS_INFINITY;
var SPECIAL = NULL | BOOL | INF | NAN;
var ATOM = STR | NUM | SPECIAL;
var COLLECTION = ARR | OBJ;
var ALL = ATOM | COLLECTION;
var Allow = {
  STR,
  NUM,
  ARR,
  OBJ,
  NULL,
  BOOL,
  NAN,
  INFINITY,
  MINUS_INFINITY,
  INF,
  SPECIAL,
  ATOM,
  COLLECTION,
  ALL
};
var PartialJSON = class extends Error {
};
var MalformedJSON = class extends Error {
};
function parseJSON(jsonString, allowPartial = Allow.ALL) {
  if (typeof jsonString !== "string") {
    throw new TypeError(`expecting str, got ${typeof jsonString}`);
  }
  if (!jsonString.trim()) {
    throw new Error(`${jsonString} is empty`);
  }
  return _parseJSON(jsonString.trim(), allowPartial);
}
var _parseJSON = (jsonString, allow) => {
  const length = jsonString.length;
  let index = 0;
  const markPartialJSON = (msg) => {
    throw new PartialJSON(`${msg} at position ${index}`);
  };
  const throwMalformedError = (msg) => {
    throw new MalformedJSON(`${msg} at position ${index}`);
  };
  const parseAny = () => {
    skipBlank();
    if (index >= length)
      markPartialJSON("Unexpected end of input");
    if (jsonString[index] === '"')
      return parseStr();
    if (jsonString[index] === "{")
      return parseObj();
    if (jsonString[index] === "[")
      return parseArr();
    if (jsonString.substring(index, index + 4) === "null" || Allow.NULL & allow && length - index < 4 && "null".startsWith(jsonString.substring(index))) {
      index += 4;
      return null;
    }
    if (jsonString.substring(index, index + 4) === "true" || Allow.BOOL & allow && length - index < 4 && "true".startsWith(jsonString.substring(index))) {
      index += 4;
      return true;
    }
    if (jsonString.substring(index, index + 5) === "false" || Allow.BOOL & allow && length - index < 5 && "false".startsWith(jsonString.substring(index))) {
      index += 5;
      return false;
    }
    if (jsonString.substring(index, index + 8) === "Infinity" || Allow.INFINITY & allow && length - index < 8 && "Infinity".startsWith(jsonString.substring(index))) {
      index += 8;
      return Infinity;
    }
    if (jsonString.substring(index, index + 9) === "-Infinity" || Allow.MINUS_INFINITY & allow && 1 < length - index && length - index < 9 && "-Infinity".startsWith(jsonString.substring(index))) {
      index += 9;
      return -Infinity;
    }
    if (jsonString.substring(index, index + 3) === "NaN" || Allow.NAN & allow && length - index < 3 && "NaN".startsWith(jsonString.substring(index))) {
      index += 3;
      return NaN;
    }
    return parseNum();
  };
  const parseStr = () => {
    const start = index;
    let escape2 = false;
    index++;
    while (index < length && (jsonString[index] !== '"' || escape2 && jsonString[index - 1] === "\\")) {
      escape2 = jsonString[index] === "\\" ? !escape2 : false;
      index++;
    }
    if (jsonString.charAt(index) == '"') {
      try {
        return JSON.parse(jsonString.substring(start, ++index - Number(escape2)));
      } catch (e) {
        throwMalformedError(String(e));
      }
    } else if (Allow.STR & allow) {
      try {
        return JSON.parse(jsonString.substring(start, index - Number(escape2)) + '"');
      } catch (e) {
        return JSON.parse(jsonString.substring(start, jsonString.lastIndexOf("\\")) + '"');
      }
    }
    markPartialJSON("Unterminated string literal");
  };
  const parseObj = () => {
    index++;
    skipBlank();
    const obj = {};
    try {
      while (jsonString[index] !== "}") {
        skipBlank();
        if (index >= length && Allow.OBJ & allow)
          return obj;
        const key = parseStr();
        skipBlank();
        index++;
        try {
          const value = parseAny();
          Object.defineProperty(obj, key, { value, writable: true, enumerable: true, configurable: true });
        } catch (e) {
          if (Allow.OBJ & allow)
            return obj;
          else
            throw e;
        }
        skipBlank();
        if (jsonString[index] === ",")
          index++;
      }
    } catch (e) {
      if (Allow.OBJ & allow)
        return obj;
      else
        markPartialJSON("Expected '}' at end of object");
    }
    index++;
    return obj;
  };
  const parseArr = () => {
    index++;
    const arr = [];
    try {
      while (jsonString[index] !== "]") {
        arr.push(parseAny());
        skipBlank();
        if (jsonString[index] === ",") {
          index++;
        }
      }
    } catch (e) {
      if (Allow.ARR & allow) {
        return arr;
      }
      markPartialJSON("Expected ']' at end of array");
    }
    index++;
    return arr;
  };
  const parseNum = () => {
    if (index === 0) {
      if (jsonString === "-" && Allow.NUM & allow)
        markPartialJSON("Not sure what '-' is");
      try {
        return JSON.parse(jsonString);
      } catch (e) {
        if (Allow.NUM & allow) {
          try {
            if ("." === jsonString[jsonString.length - 1])
              return JSON.parse(jsonString.substring(0, jsonString.lastIndexOf(".")));
            return JSON.parse(jsonString.substring(0, jsonString.lastIndexOf("e")));
          } catch (e2) {
          }
        }
        throwMalformedError(String(e));
      }
    }
    const start = index;
    if (jsonString[index] === "-")
      index++;
    while (jsonString[index] && !",]}".includes(jsonString[index]))
      index++;
    if (index == length && !(Allow.NUM & allow))
      markPartialJSON("Unterminated number literal");
    try {
      return JSON.parse(jsonString.substring(start, index));
    } catch (e) {
      if (jsonString.substring(start, index) === "-" && Allow.NUM & allow)
        markPartialJSON("Not sure what '-' is");
      try {
        return JSON.parse(jsonString.substring(start, jsonString.lastIndexOf("e")));
      } catch (e2) {
        throwMalformedError(String(e2));
      }
    }
  };
  const skipBlank = () => {
    while (index < length && " \n\r	".includes(jsonString[index])) {
      index++;
    }
  };
  return parseAny();
};
var partialParse = (input) => parseJSON(input, Allow.ALL ^ Allow.NUM);

// node_modules/openai/lib/ChatCompletionStream.mjs
var __classPrivateFieldSet5 = function(receiver, state, value, kind2, f) {
  if (kind2 === "m") throw new TypeError("Private method is not writable");
  if (kind2 === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind2 === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
};
var __classPrivateFieldGet6 = function(receiver, state, kind2, f) {
  if (kind2 === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind2 === "m" ? f : kind2 === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ChatCompletionStream_instances;
var _ChatCompletionStream_params;
var _ChatCompletionStream_choiceEventStates;
var _ChatCompletionStream_currentChatCompletionSnapshot;
var _ChatCompletionStream_beginRequest;
var _ChatCompletionStream_getChoiceEventState;
var _ChatCompletionStream_addChunk;
var _ChatCompletionStream_emitToolCallDoneEvent;
var _ChatCompletionStream_emitContentDoneEvents;
var _ChatCompletionStream_endRequest;
var _ChatCompletionStream_getAutoParseableResponseFormat;
var _ChatCompletionStream_accumulateChatCompletion;
var ChatCompletionStream = class _ChatCompletionStream extends AbstractChatCompletionRunner {
  constructor(params) {
    super();
    _ChatCompletionStream_instances.add(this);
    _ChatCompletionStream_params.set(this, void 0);
    _ChatCompletionStream_choiceEventStates.set(this, void 0);
    _ChatCompletionStream_currentChatCompletionSnapshot.set(this, void 0);
    __classPrivateFieldSet5(this, _ChatCompletionStream_params, params, "f");
    __classPrivateFieldSet5(this, _ChatCompletionStream_choiceEventStates, [], "f");
  }
  get currentChatCompletionSnapshot() {
    return __classPrivateFieldGet6(this, _ChatCompletionStream_currentChatCompletionSnapshot, "f");
  }
  /**
   * Intended for use on the frontend, consuming a stream produced with
   * `.toReadableStream()` on the backend.
   *
   * Note that messages sent to the model do not appear in `.on('message')`
   * in this context.
   */
  static fromReadableStream(stream) {
    const runner = new _ChatCompletionStream(null);
    runner._run(() => runner._fromReadableStream(stream));
    return runner;
  }
  static createChatCompletion(client, params, options) {
    const runner = new _ChatCompletionStream(params);
    runner._run(() => runner._runChatCompletion(client, { ...params, stream: true }, { ...options, headers: { ...options?.headers, "X-Stainless-Helper-Method": "stream" } }));
    return runner;
  }
  async _createChatCompletion(client, params, options) {
    super._createChatCompletion;
    const signal = options?.signal;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      signal.addEventListener("abort", () => this.controller.abort());
    }
    __classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_beginRequest).call(this);
    const stream = await client.chat.completions.create({ ...params, stream: true }, { ...options, signal: this.controller.signal });
    this._connected();
    for await (const chunk of stream) {
      __classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_addChunk).call(this, chunk);
    }
    if (stream.controller.signal?.aborted) {
      throw new APIUserAbortError();
    }
    return this._addChatCompletion(__classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_endRequest).call(this));
  }
  async _fromReadableStream(readableStream, options) {
    const signal = options?.signal;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      signal.addEventListener("abort", () => this.controller.abort());
    }
    __classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_beginRequest).call(this);
    this._connected();
    const stream = Stream.fromReadableStream(readableStream, this.controller);
    let chatId;
    for await (const chunk of stream) {
      if (chatId && chatId !== chunk.id) {
        this._addChatCompletion(__classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_endRequest).call(this));
      }
      __classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_addChunk).call(this, chunk);
      chatId = chunk.id;
    }
    if (stream.controller.signal?.aborted) {
      throw new APIUserAbortError();
    }
    return this._addChatCompletion(__classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_endRequest).call(this));
  }
  [(_ChatCompletionStream_params = /* @__PURE__ */ new WeakMap(), _ChatCompletionStream_choiceEventStates = /* @__PURE__ */ new WeakMap(), _ChatCompletionStream_currentChatCompletionSnapshot = /* @__PURE__ */ new WeakMap(), _ChatCompletionStream_instances = /* @__PURE__ */ new WeakSet(), _ChatCompletionStream_beginRequest = function _ChatCompletionStream_beginRequest2() {
    if (this.ended)
      return;
    __classPrivateFieldSet5(this, _ChatCompletionStream_currentChatCompletionSnapshot, void 0, "f");
  }, _ChatCompletionStream_getChoiceEventState = function _ChatCompletionStream_getChoiceEventState2(choice) {
    let state = __classPrivateFieldGet6(this, _ChatCompletionStream_choiceEventStates, "f")[choice.index];
    if (state) {
      return state;
    }
    state = {
      content_done: false,
      refusal_done: false,
      logprobs_content_done: false,
      logprobs_refusal_done: false,
      done_tool_calls: /* @__PURE__ */ new Set(),
      current_tool_call_index: null
    };
    __classPrivateFieldGet6(this, _ChatCompletionStream_choiceEventStates, "f")[choice.index] = state;
    return state;
  }, _ChatCompletionStream_addChunk = function _ChatCompletionStream_addChunk2(chunk) {
    if (this.ended)
      return;
    const completion = __classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_accumulateChatCompletion).call(this, chunk);
    this._emit("chunk", chunk, completion);
    for (const choice of chunk.choices) {
      const choiceSnapshot = completion.choices[choice.index];
      if (choice.delta.content != null && choiceSnapshot.message?.role === "assistant" && choiceSnapshot.message?.content) {
        this._emit("content", choice.delta.content, choiceSnapshot.message.content);
        this._emit("content.delta", {
          delta: choice.delta.content,
          snapshot: choiceSnapshot.message.content,
          parsed: choiceSnapshot.message.parsed
        });
      }
      if (choice.delta.refusal != null && choiceSnapshot.message?.role === "assistant" && choiceSnapshot.message?.refusal) {
        this._emit("refusal.delta", {
          delta: choice.delta.refusal,
          snapshot: choiceSnapshot.message.refusal
        });
      }
      if (choice.logprobs?.content != null && choiceSnapshot.message?.role === "assistant") {
        this._emit("logprobs.content.delta", {
          content: choice.logprobs?.content,
          snapshot: choiceSnapshot.logprobs?.content ?? []
        });
      }
      if (choice.logprobs?.refusal != null && choiceSnapshot.message?.role === "assistant") {
        this._emit("logprobs.refusal.delta", {
          refusal: choice.logprobs?.refusal,
          snapshot: choiceSnapshot.logprobs?.refusal ?? []
        });
      }
      const state = __classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_getChoiceEventState).call(this, choiceSnapshot);
      if (choiceSnapshot.finish_reason) {
        __classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_emitContentDoneEvents).call(this, choiceSnapshot);
        if (state.current_tool_call_index != null) {
          __classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_emitToolCallDoneEvent).call(this, choiceSnapshot, state.current_tool_call_index);
        }
      }
      for (const toolCall of choice.delta.tool_calls ?? []) {
        if (state.current_tool_call_index !== toolCall.index) {
          __classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_emitContentDoneEvents).call(this, choiceSnapshot);
          if (state.current_tool_call_index != null) {
            __classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_emitToolCallDoneEvent).call(this, choiceSnapshot, state.current_tool_call_index);
          }
        }
        state.current_tool_call_index = toolCall.index;
      }
      for (const toolCallDelta of choice.delta.tool_calls ?? []) {
        const toolCallSnapshot = choiceSnapshot.message.tool_calls?.[toolCallDelta.index];
        if (!toolCallSnapshot?.type) {
          continue;
        }
        if (toolCallSnapshot?.type === "function") {
          this._emit("tool_calls.function.arguments.delta", {
            name: toolCallSnapshot.function?.name,
            index: toolCallDelta.index,
            arguments: toolCallSnapshot.function.arguments,
            parsed_arguments: toolCallSnapshot.function.parsed_arguments,
            arguments_delta: toolCallDelta.function?.arguments ?? ""
          });
        } else {
          assertNever2(toolCallSnapshot?.type);
        }
      }
    }
  }, _ChatCompletionStream_emitToolCallDoneEvent = function _ChatCompletionStream_emitToolCallDoneEvent2(choiceSnapshot, toolCallIndex) {
    const state = __classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_getChoiceEventState).call(this, choiceSnapshot);
    if (state.done_tool_calls.has(toolCallIndex)) {
      return;
    }
    const toolCallSnapshot = choiceSnapshot.message.tool_calls?.[toolCallIndex];
    if (!toolCallSnapshot) {
      throw new Error("no tool call snapshot");
    }
    if (!toolCallSnapshot.type) {
      throw new Error("tool call snapshot missing `type`");
    }
    if (toolCallSnapshot.type === "function") {
      const inputTool = __classPrivateFieldGet6(this, _ChatCompletionStream_params, "f")?.tools?.find((tool) => tool.type === "function" && tool.function.name === toolCallSnapshot.function.name);
      this._emit("tool_calls.function.arguments.done", {
        name: toolCallSnapshot.function.name,
        index: toolCallIndex,
        arguments: toolCallSnapshot.function.arguments,
        parsed_arguments: isAutoParsableTool(inputTool) ? inputTool.$parseRaw(toolCallSnapshot.function.arguments) : inputTool?.function.strict ? JSON.parse(toolCallSnapshot.function.arguments) : null
      });
    } else {
      assertNever2(toolCallSnapshot.type);
    }
  }, _ChatCompletionStream_emitContentDoneEvents = function _ChatCompletionStream_emitContentDoneEvents2(choiceSnapshot) {
    const state = __classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_getChoiceEventState).call(this, choiceSnapshot);
    if (choiceSnapshot.message.content && !state.content_done) {
      state.content_done = true;
      const responseFormat = __classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_getAutoParseableResponseFormat).call(this);
      this._emit("content.done", {
        content: choiceSnapshot.message.content,
        parsed: responseFormat ? responseFormat.$parseRaw(choiceSnapshot.message.content) : null
      });
    }
    if (choiceSnapshot.message.refusal && !state.refusal_done) {
      state.refusal_done = true;
      this._emit("refusal.done", { refusal: choiceSnapshot.message.refusal });
    }
    if (choiceSnapshot.logprobs?.content && !state.logprobs_content_done) {
      state.logprobs_content_done = true;
      this._emit("logprobs.content.done", { content: choiceSnapshot.logprobs.content });
    }
    if (choiceSnapshot.logprobs?.refusal && !state.logprobs_refusal_done) {
      state.logprobs_refusal_done = true;
      this._emit("logprobs.refusal.done", { refusal: choiceSnapshot.logprobs.refusal });
    }
  }, _ChatCompletionStream_endRequest = function _ChatCompletionStream_endRequest2() {
    if (this.ended) {
      throw new OpenAIError(`stream has ended, this shouldn't happen`);
    }
    const snapshot = __classPrivateFieldGet6(this, _ChatCompletionStream_currentChatCompletionSnapshot, "f");
    if (!snapshot) {
      throw new OpenAIError(`request ended without sending any chunks`);
    }
    __classPrivateFieldSet5(this, _ChatCompletionStream_currentChatCompletionSnapshot, void 0, "f");
    __classPrivateFieldSet5(this, _ChatCompletionStream_choiceEventStates, [], "f");
    return finalizeChatCompletion(snapshot, __classPrivateFieldGet6(this, _ChatCompletionStream_params, "f"));
  }, _ChatCompletionStream_getAutoParseableResponseFormat = function _ChatCompletionStream_getAutoParseableResponseFormat2() {
    const responseFormat = __classPrivateFieldGet6(this, _ChatCompletionStream_params, "f")?.response_format;
    if (isAutoParsableResponseFormat(responseFormat)) {
      return responseFormat;
    }
    return null;
  }, _ChatCompletionStream_accumulateChatCompletion = function _ChatCompletionStream_accumulateChatCompletion2(chunk) {
    var _a2, _b, _c, _d;
    let snapshot = __classPrivateFieldGet6(this, _ChatCompletionStream_currentChatCompletionSnapshot, "f");
    const { choices, ...rest } = chunk;
    if (!snapshot) {
      snapshot = __classPrivateFieldSet5(this, _ChatCompletionStream_currentChatCompletionSnapshot, {
        ...rest,
        choices: []
      }, "f");
    } else {
      Object.assign(snapshot, rest);
    }
    for (const { delta, finish_reason, index, logprobs = null, ...other } of chunk.choices) {
      let choice = snapshot.choices[index];
      if (!choice) {
        choice = snapshot.choices[index] = { finish_reason, index, message: {}, logprobs, ...other };
      }
      if (logprobs) {
        if (!choice.logprobs) {
          choice.logprobs = Object.assign({}, logprobs);
        } else {
          const { content: content2, refusal: refusal2, ...rest3 } = logprobs;
          assertIsEmpty(rest3);
          Object.assign(choice.logprobs, rest3);
          if (content2) {
            (_a2 = choice.logprobs).content ?? (_a2.content = []);
            choice.logprobs.content.push(...content2);
          }
          if (refusal2) {
            (_b = choice.logprobs).refusal ?? (_b.refusal = []);
            choice.logprobs.refusal.push(...refusal2);
          }
        }
      }
      if (finish_reason) {
        choice.finish_reason = finish_reason;
        if (__classPrivateFieldGet6(this, _ChatCompletionStream_params, "f") && hasAutoParseableInput(__classPrivateFieldGet6(this, _ChatCompletionStream_params, "f"))) {
          if (finish_reason === "length") {
            throw new LengthFinishReasonError();
          }
          if (finish_reason === "content_filter") {
            throw new ContentFilterFinishReasonError();
          }
        }
      }
      Object.assign(choice, other);
      if (!delta)
        continue;
      const { content, refusal, function_call, role, tool_calls, ...rest2 } = delta;
      assertIsEmpty(rest2);
      Object.assign(choice.message, rest2);
      if (refusal) {
        choice.message.refusal = (choice.message.refusal || "") + refusal;
      }
      if (role)
        choice.message.role = role;
      if (function_call) {
        if (!choice.message.function_call) {
          choice.message.function_call = function_call;
        } else {
          if (function_call.name)
            choice.message.function_call.name = function_call.name;
          if (function_call.arguments) {
            (_c = choice.message.function_call).arguments ?? (_c.arguments = "");
            choice.message.function_call.arguments += function_call.arguments;
          }
        }
      }
      if (content) {
        choice.message.content = (choice.message.content || "") + content;
        if (!choice.message.refusal && __classPrivateFieldGet6(this, _ChatCompletionStream_instances, "m", _ChatCompletionStream_getAutoParseableResponseFormat).call(this)) {
          choice.message.parsed = partialParse(choice.message.content);
        }
      }
      if (tool_calls) {
        if (!choice.message.tool_calls)
          choice.message.tool_calls = [];
        for (const { index: index2, id, type, function: fn, ...rest3 } of tool_calls) {
          const tool_call = (_d = choice.message.tool_calls)[index2] ?? (_d[index2] = {});
          Object.assign(tool_call, rest3);
          if (id)
            tool_call.id = id;
          if (type)
            tool_call.type = type;
          if (fn)
            tool_call.function ?? (tool_call.function = { name: fn.name ?? "", arguments: "" });
          if (fn?.name)
            tool_call.function.name = fn.name;
          if (fn?.arguments) {
            tool_call.function.arguments += fn.arguments;
            if (shouldParseToolCall(__classPrivateFieldGet6(this, _ChatCompletionStream_params, "f"), tool_call)) {
              tool_call.function.parsed_arguments = partialParse(tool_call.function.arguments);
            }
          }
        }
      }
    }
    return snapshot;
  }, Symbol.asyncIterator)]() {
    const pushQueue = [];
    const readQueue = [];
    let done = false;
    this.on("chunk", (chunk) => {
      const reader = readQueue.shift();
      if (reader) {
        reader.resolve(chunk);
      } else {
        pushQueue.push(chunk);
      }
    });
    this.on("end", () => {
      done = true;
      for (const reader of readQueue) {
        reader.resolve(void 0);
      }
      readQueue.length = 0;
    });
    this.on("abort", (err) => {
      done = true;
      for (const reader of readQueue) {
        reader.reject(err);
      }
      readQueue.length = 0;
    });
    this.on("error", (err) => {
      done = true;
      for (const reader of readQueue) {
        reader.reject(err);
      }
      readQueue.length = 0;
    });
    return {
      next: async () => {
        if (!pushQueue.length) {
          if (done) {
            return { value: void 0, done: true };
          }
          return new Promise((resolve, reject) => readQueue.push({ resolve, reject })).then((chunk2) => chunk2 ? { value: chunk2, done: false } : { value: void 0, done: true });
        }
        const chunk = pushQueue.shift();
        return { value: chunk, done: false };
      },
      return: async () => {
        this.abort();
        return { value: void 0, done: true };
      }
    };
  }
  toReadableStream() {
    const stream = new Stream(this[Symbol.asyncIterator].bind(this), this.controller);
    return stream.toReadableStream();
  }
};
function finalizeChatCompletion(snapshot, params) {
  const { id, choices, created, model, system_fingerprint, ...rest } = snapshot;
  const completion = {
    ...rest,
    id,
    choices: choices.map(({ message, finish_reason, index, logprobs, ...choiceRest }) => {
      if (!finish_reason) {
        throw new OpenAIError(`missing finish_reason for choice ${index}`);
      }
      const { content = null, function_call, tool_calls, ...messageRest } = message;
      const role = message.role;
      if (!role) {
        throw new OpenAIError(`missing role for choice ${index}`);
      }
      if (function_call) {
        const { arguments: args, name } = function_call;
        if (args == null) {
          throw new OpenAIError(`missing function_call.arguments for choice ${index}`);
        }
        if (!name) {
          throw new OpenAIError(`missing function_call.name for choice ${index}`);
        }
        return {
          ...choiceRest,
          message: {
            content,
            function_call: { arguments: args, name },
            role,
            refusal: message.refusal ?? null
          },
          finish_reason,
          index,
          logprobs
        };
      }
      if (tool_calls) {
        return {
          ...choiceRest,
          index,
          finish_reason,
          logprobs,
          message: {
            ...messageRest,
            role,
            content,
            refusal: message.refusal ?? null,
            tool_calls: tool_calls.map((tool_call, i) => {
              const { function: fn, type, id: id2, ...toolRest } = tool_call;
              const { arguments: args, name, ...fnRest } = fn || {};
              if (id2 == null) {
                throw new OpenAIError(`missing choices[${index}].tool_calls[${i}].id
${str(snapshot)}`);
              }
              if (type == null) {
                throw new OpenAIError(`missing choices[${index}].tool_calls[${i}].type
${str(snapshot)}`);
              }
              if (name == null) {
                throw new OpenAIError(`missing choices[${index}].tool_calls[${i}].function.name
${str(snapshot)}`);
              }
              if (args == null) {
                throw new OpenAIError(`missing choices[${index}].tool_calls[${i}].function.arguments
${str(snapshot)}`);
              }
              return { ...toolRest, id: id2, type, function: { ...fnRest, name, arguments: args } };
            })
          }
        };
      }
      return {
        ...choiceRest,
        message: { ...messageRest, content, role, refusal: message.refusal ?? null },
        finish_reason,
        index,
        logprobs
      };
    }),
    created,
    model,
    object: "chat.completion",
    ...system_fingerprint ? { system_fingerprint } : {}
  };
  return maybeParseChatCompletion(completion, params);
}
function str(x) {
  return JSON.stringify(x);
}
function assertIsEmpty(obj) {
  return;
}
function assertNever2(_x) {
}

// node_modules/openai/lib/ChatCompletionStreamingRunner.mjs
var ChatCompletionStreamingRunner = class _ChatCompletionStreamingRunner extends ChatCompletionStream {
  static fromReadableStream(stream) {
    const runner = new _ChatCompletionStreamingRunner(null);
    runner._run(() => runner._fromReadableStream(stream));
    return runner;
  }
  /** @deprecated - please use `runTools` instead. */
  static runFunctions(client, params, options) {
    const runner = new _ChatCompletionStreamingRunner(null);
    const opts = {
      ...options,
      headers: { ...options?.headers, "X-Stainless-Helper-Method": "runFunctions" }
    };
    runner._run(() => runner._runFunctions(client, params, opts));
    return runner;
  }
  static runTools(client, params, options) {
    const runner = new _ChatCompletionStreamingRunner(
      // @ts-expect-error TODO these types are incompatible
      params
    );
    const opts = {
      ...options,
      headers: { ...options?.headers, "X-Stainless-Helper-Method": "runTools" }
    };
    runner._run(() => runner._runTools(client, params, opts));
    return runner;
  }
};

// node_modules/openai/resources/beta/chat/completions.mjs
var Completions2 = class extends APIResource {
  parse(body, options) {
    validateInputTools(body.tools);
    return this._client.chat.completions.create(body, {
      ...options,
      headers: {
        ...options?.headers,
        "X-Stainless-Helper-Method": "beta.chat.completions.parse"
      }
    })._thenUnwrap((completion) => parseChatCompletion(completion, body));
  }
  runFunctions(body, options) {
    if (body.stream) {
      return ChatCompletionStreamingRunner.runFunctions(this._client, body, options);
    }
    return ChatCompletionRunner.runFunctions(this._client, body, options);
  }
  runTools(body, options) {
    if (body.stream) {
      return ChatCompletionStreamingRunner.runTools(this._client, body, options);
    }
    return ChatCompletionRunner.runTools(this._client, body, options);
  }
  /**
   * Creates a chat completion stream
   */
  stream(body, options) {
    return ChatCompletionStream.createChatCompletion(this._client, body, options);
  }
};

// node_modules/openai/resources/beta/chat/chat.mjs
var Chat2 = class extends APIResource {
  constructor() {
    super(...arguments);
    this.completions = new Completions2(this._client);
  }
};
(function(Chat3) {
  Chat3.Completions = Completions2;
})(Chat2 || (Chat2 = {}));

// node_modules/openai/resources/beta/realtime/sessions.mjs
var Sessions = class extends APIResource {
  /**
   * Create an ephemeral API token for use in client-side applications with the
   * Realtime API. Can be configured with the same session parameters as the
   * `session.update` client event.
   *
   * It responds with a session object, plus a `client_secret` key which contains a
   * usable ephemeral API token that can be used to authenticate browser clients for
   * the Realtime API.
   *
   * @example
   * ```ts
   * const session =
   *   await client.beta.realtime.sessions.create();
   * ```
   */
  create(body, options) {
    return this._client.post("/realtime/sessions", {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
};

// node_modules/openai/resources/beta/realtime/transcription-sessions.mjs
var TranscriptionSessions = class extends APIResource {
  /**
   * Create an ephemeral API token for use in client-side applications with the
   * Realtime API specifically for realtime transcriptions. Can be configured with
   * the same session parameters as the `transcription_session.update` client event.
   *
   * It responds with a session object, plus a `client_secret` key which contains a
   * usable ephemeral API token that can be used to authenticate browser clients for
   * the Realtime API.
   *
   * @example
   * ```ts
   * const transcriptionSession =
   *   await client.beta.realtime.transcriptionSessions.create();
   * ```
   */
  create(body, options) {
    return this._client.post("/realtime/transcription_sessions", {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
};

// node_modules/openai/resources/beta/realtime/realtime.mjs
var Realtime = class extends APIResource {
  constructor() {
    super(...arguments);
    this.sessions = new Sessions(this._client);
    this.transcriptionSessions = new TranscriptionSessions(this._client);
  }
};
Realtime.Sessions = Sessions;
Realtime.TranscriptionSessions = TranscriptionSessions;

// node_modules/openai/resources/beta/threads/messages.mjs
var Messages2 = class extends APIResource {
  /**
   * Create a message.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  create(threadId, body, options) {
    return this._client.post(`/threads/${threadId}/messages`, {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Retrieve a message.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  retrieve(threadId, messageId, options) {
    return this._client.get(`/threads/${threadId}/messages/${messageId}`, {
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Modifies a message.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  update(threadId, messageId, body, options) {
    return this._client.post(`/threads/${threadId}/messages/${messageId}`, {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  list(threadId, query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list(threadId, {}, query);
    }
    return this._client.getAPIList(`/threads/${threadId}/messages`, MessagesPage, {
      query,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Deletes a message.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  del(threadId, messageId, options) {
    return this._client.delete(`/threads/${threadId}/messages/${messageId}`, {
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
};
var MessagesPage = class extends CursorPage {
};
Messages2.MessagesPage = MessagesPage;

// node_modules/openai/resources/beta/threads/runs/steps.mjs
var Steps = class extends APIResource {
  retrieve(threadId, runId, stepId, query = {}, options) {
    if (isRequestOptions(query)) {
      return this.retrieve(threadId, runId, stepId, {}, query);
    }
    return this._client.get(`/threads/${threadId}/runs/${runId}/steps/${stepId}`, {
      query,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  list(threadId, runId, query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list(threadId, runId, {}, query);
    }
    return this._client.getAPIList(`/threads/${threadId}/runs/${runId}/steps`, RunStepsPage, {
      query,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
};
var RunStepsPage = class extends CursorPage {
};
Steps.RunStepsPage = RunStepsPage;

// node_modules/openai/resources/beta/threads/runs/runs.mjs
var Runs = class extends APIResource {
  constructor() {
    super(...arguments);
    this.steps = new Steps(this._client);
  }
  create(threadId, params, options) {
    const { include, ...body } = params;
    return this._client.post(`/threads/${threadId}/runs`, {
      query: { include },
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers },
      stream: params.stream ?? false
    });
  }
  /**
   * Retrieves a run.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  retrieve(threadId, runId, options) {
    return this._client.get(`/threads/${threadId}/runs/${runId}`, {
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Modifies a run.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  update(threadId, runId, body, options) {
    return this._client.post(`/threads/${threadId}/runs/${runId}`, {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  list(threadId, query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list(threadId, {}, query);
    }
    return this._client.getAPIList(`/threads/${threadId}/runs`, RunsPage, {
      query,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Cancels a run that is `in_progress`.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  cancel(threadId, runId, options) {
    return this._client.post(`/threads/${threadId}/runs/${runId}/cancel`, {
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * A helper to create a run an poll for a terminal state. More information on Run
   * lifecycles can be found here:
   * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
   */
  async createAndPoll(threadId, body, options) {
    const run = await this.create(threadId, body, options);
    return await this.poll(threadId, run.id, options);
  }
  /**
   * Create a Run stream
   *
   * @deprecated use `stream` instead
   */
  createAndStream(threadId, body, options) {
    return AssistantStream.createAssistantStream(threadId, this._client.beta.threads.runs, body, options);
  }
  /**
   * A helper to poll a run status until it reaches a terminal state. More
   * information on Run lifecycles can be found here:
   * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
   */
  async poll(threadId, runId, options) {
    const headers = { ...options?.headers, "X-Stainless-Poll-Helper": "true" };
    if (options?.pollIntervalMs) {
      headers["X-Stainless-Custom-Poll-Interval"] = options.pollIntervalMs.toString();
    }
    while (true) {
      const { data: run, response } = await this.retrieve(threadId, runId, {
        ...options,
        headers: { ...options?.headers, ...headers }
      }).withResponse();
      switch (run.status) {
        //If we are in any sort of intermediate state we poll
        case "queued":
        case "in_progress":
        case "cancelling":
          let sleepInterval = 5e3;
          if (options?.pollIntervalMs) {
            sleepInterval = options.pollIntervalMs;
          } else {
            const headerInterval = response.headers.get("openai-poll-after-ms");
            if (headerInterval) {
              const headerIntervalMs = parseInt(headerInterval);
              if (!isNaN(headerIntervalMs)) {
                sleepInterval = headerIntervalMs;
              }
            }
          }
          await sleep(sleepInterval);
          break;
        //We return the run in any terminal state.
        case "requires_action":
        case "incomplete":
        case "cancelled":
        case "completed":
        case "failed":
        case "expired":
          return run;
      }
    }
  }
  /**
   * Create a Run stream
   */
  stream(threadId, body, options) {
    return AssistantStream.createAssistantStream(threadId, this._client.beta.threads.runs, body, options);
  }
  submitToolOutputs(threadId, runId, body, options) {
    return this._client.post(`/threads/${threadId}/runs/${runId}/submit_tool_outputs`, {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers },
      stream: body.stream ?? false
    });
  }
  /**
   * A helper to submit a tool output to a run and poll for a terminal run state.
   * More information on Run lifecycles can be found here:
   * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
   */
  async submitToolOutputsAndPoll(threadId, runId, body, options) {
    const run = await this.submitToolOutputs(threadId, runId, body, options);
    return await this.poll(threadId, run.id, options);
  }
  /**
   * Submit the tool outputs from a previous run and stream the run to a terminal
   * state. More information on Run lifecycles can be found here:
   * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
   */
  submitToolOutputsStream(threadId, runId, body, options) {
    return AssistantStream.createToolAssistantStream(threadId, runId, this._client.beta.threads.runs, body, options);
  }
};
var RunsPage = class extends CursorPage {
};
Runs.RunsPage = RunsPage;
Runs.Steps = Steps;
Runs.RunStepsPage = RunStepsPage;

// node_modules/openai/resources/beta/threads/threads.mjs
var Threads = class extends APIResource {
  constructor() {
    super(...arguments);
    this.runs = new Runs(this._client);
    this.messages = new Messages2(this._client);
  }
  create(body = {}, options) {
    if (isRequestOptions(body)) {
      return this.create({}, body);
    }
    return this._client.post("/threads", {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Retrieves a thread.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  retrieve(threadId, options) {
    return this._client.get(`/threads/${threadId}`, {
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Modifies a thread.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  update(threadId, body, options) {
    return this._client.post(`/threads/${threadId}`, {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Delete a thread.
   *
   * @deprecated The Assistants API is deprecated in favor of the Responses API
   */
  del(threadId, options) {
    return this._client.delete(`/threads/${threadId}`, {
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  createAndRun(body, options) {
    return this._client.post("/threads/runs", {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers },
      stream: body.stream ?? false
    });
  }
  /**
   * A helper to create a thread, start a run and then poll for a terminal state.
   * More information on Run lifecycles can be found here:
   * https://platform.openai.com/docs/assistants/how-it-works/runs-and-run-steps
   */
  async createAndRunPoll(body, options) {
    const run = await this.createAndRun(body, options);
    return await this.runs.poll(run.thread_id, run.id, options);
  }
  /**
   * Create a thread and stream the run back
   */
  createAndRunStream(body, options) {
    return AssistantStream.createThreadAssistantStream(body, this._client.beta.threads, options);
  }
};
Threads.Runs = Runs;
Threads.RunsPage = RunsPage;
Threads.Messages = Messages2;
Threads.MessagesPage = MessagesPage;

// node_modules/openai/resources/beta/beta.mjs
var Beta = class extends APIResource {
  constructor() {
    super(...arguments);
    this.realtime = new Realtime(this._client);
    this.chat = new Chat2(this._client);
    this.assistants = new Assistants(this._client);
    this.threads = new Threads(this._client);
  }
};
Beta.Realtime = Realtime;
Beta.Assistants = Assistants;
Beta.AssistantsPage = AssistantsPage;
Beta.Threads = Threads;

// node_modules/openai/resources/completions.mjs
var Completions3 = class extends APIResource {
  create(body, options) {
    return this._client.post("/completions", { body, ...options, stream: body.stream ?? false });
  }
};

// node_modules/openai/resources/containers/files/content.mjs
var Content = class extends APIResource {
  /**
   * Retrieve Container File Content
   */
  retrieve(containerId, fileId, options) {
    return this._client.get(`/containers/${containerId}/files/${fileId}/content`, {
      ...options,
      headers: { Accept: "application/binary", ...options?.headers },
      __binaryResponse: true
    });
  }
};

// node_modules/openai/resources/containers/files/files.mjs
var Files = class extends APIResource {
  constructor() {
    super(...arguments);
    this.content = new Content(this._client);
  }
  /**
   * Create a Container File
   *
   * You can send either a multipart/form-data request with the raw file content, or
   * a JSON request with a file ID.
   */
  create(containerId, body, options) {
    return this._client.post(`/containers/${containerId}/files`, multipartFormRequestOptions({ body, ...options }));
  }
  /**
   * Retrieve Container File
   */
  retrieve(containerId, fileId, options) {
    return this._client.get(`/containers/${containerId}/files/${fileId}`, options);
  }
  list(containerId, query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list(containerId, {}, query);
    }
    return this._client.getAPIList(`/containers/${containerId}/files`, FileListResponsesPage, {
      query,
      ...options
    });
  }
  /**
   * Delete Container File
   */
  del(containerId, fileId, options) {
    return this._client.delete(`/containers/${containerId}/files/${fileId}`, {
      ...options,
      headers: { Accept: "*/*", ...options?.headers }
    });
  }
};
var FileListResponsesPage = class extends CursorPage {
};
Files.FileListResponsesPage = FileListResponsesPage;
Files.Content = Content;

// node_modules/openai/resources/containers/containers.mjs
var Containers = class extends APIResource {
  constructor() {
    super(...arguments);
    this.files = new Files(this._client);
  }
  /**
   * Create Container
   */
  create(body, options) {
    return this._client.post("/containers", { body, ...options });
  }
  /**
   * Retrieve Container
   */
  retrieve(containerId, options) {
    return this._client.get(`/containers/${containerId}`, options);
  }
  list(query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.getAPIList("/containers", ContainerListResponsesPage, { query, ...options });
  }
  /**
   * Delete Container
   */
  del(containerId, options) {
    return this._client.delete(`/containers/${containerId}`, {
      ...options,
      headers: { Accept: "*/*", ...options?.headers }
    });
  }
};
var ContainerListResponsesPage = class extends CursorPage {
};
Containers.ContainerListResponsesPage = ContainerListResponsesPage;
Containers.Files = Files;
Containers.FileListResponsesPage = FileListResponsesPage;

// node_modules/openai/resources/embeddings.mjs
var Embeddings = class extends APIResource {
  /**
   * Creates an embedding vector representing the input text.
   *
   * @example
   * ```ts
   * const createEmbeddingResponse =
   *   await client.embeddings.create({
   *     input: 'The quick brown fox jumped over the lazy dog',
   *     model: 'text-embedding-3-small',
   *   });
   * ```
   */
  create(body, options) {
    const hasUserProvidedEncodingFormat = !!body.encoding_format;
    let encoding_format = hasUserProvidedEncodingFormat ? body.encoding_format : "base64";
    if (hasUserProvidedEncodingFormat) {
      debug("Request", "User defined encoding_format:", body.encoding_format);
    }
    const response = this._client.post("/embeddings", {
      body: {
        ...body,
        encoding_format
      },
      ...options
    });
    if (hasUserProvidedEncodingFormat) {
      return response;
    }
    debug("response", "Decoding base64 embeddings to float32 array");
    return response._thenUnwrap((response2) => {
      if (response2 && response2.data) {
        response2.data.forEach((embeddingBase64Obj) => {
          const embeddingBase64Str = embeddingBase64Obj.embedding;
          embeddingBase64Obj.embedding = toFloat32Array(embeddingBase64Str);
        });
      }
      return response2;
    });
  }
};

// node_modules/openai/resources/evals/runs/output-items.mjs
var OutputItems = class extends APIResource {
  /**
   * Get an evaluation run output item by ID.
   */
  retrieve(evalId, runId, outputItemId, options) {
    return this._client.get(`/evals/${evalId}/runs/${runId}/output_items/${outputItemId}`, options);
  }
  list(evalId, runId, query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list(evalId, runId, {}, query);
    }
    return this._client.getAPIList(`/evals/${evalId}/runs/${runId}/output_items`, OutputItemListResponsesPage, { query, ...options });
  }
};
var OutputItemListResponsesPage = class extends CursorPage {
};
OutputItems.OutputItemListResponsesPage = OutputItemListResponsesPage;

// node_modules/openai/resources/evals/runs/runs.mjs
var Runs2 = class extends APIResource {
  constructor() {
    super(...arguments);
    this.outputItems = new OutputItems(this._client);
  }
  /**
   * Kicks off a new run for a given evaluation, specifying the data source, and what
   * model configuration to use to test. The datasource will be validated against the
   * schema specified in the config of the evaluation.
   */
  create(evalId, body, options) {
    return this._client.post(`/evals/${evalId}/runs`, { body, ...options });
  }
  /**
   * Get an evaluation run by ID.
   */
  retrieve(evalId, runId, options) {
    return this._client.get(`/evals/${evalId}/runs/${runId}`, options);
  }
  list(evalId, query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list(evalId, {}, query);
    }
    return this._client.getAPIList(`/evals/${evalId}/runs`, RunListResponsesPage, { query, ...options });
  }
  /**
   * Delete an eval run.
   */
  del(evalId, runId, options) {
    return this._client.delete(`/evals/${evalId}/runs/${runId}`, options);
  }
  /**
   * Cancel an ongoing evaluation run.
   */
  cancel(evalId, runId, options) {
    return this._client.post(`/evals/${evalId}/runs/${runId}`, options);
  }
};
var RunListResponsesPage = class extends CursorPage {
};
Runs2.RunListResponsesPage = RunListResponsesPage;
Runs2.OutputItems = OutputItems;
Runs2.OutputItemListResponsesPage = OutputItemListResponsesPage;

// node_modules/openai/resources/evals/evals.mjs
var Evals = class extends APIResource {
  constructor() {
    super(...arguments);
    this.runs = new Runs2(this._client);
  }
  /**
   * Create the structure of an evaluation that can be used to test a model's
   * performance. An evaluation is a set of testing criteria and the config for a
   * data source, which dictates the schema of the data used in the evaluation. After
   * creating an evaluation, you can run it on different models and model parameters.
   * We support several types of graders and datasources. For more information, see
   * the [Evals guide](https://platform.openai.com/docs/guides/evals).
   */
  create(body, options) {
    return this._client.post("/evals", { body, ...options });
  }
  /**
   * Get an evaluation by ID.
   */
  retrieve(evalId, options) {
    return this._client.get(`/evals/${evalId}`, options);
  }
  /**
   * Update certain properties of an evaluation.
   */
  update(evalId, body, options) {
    return this._client.post(`/evals/${evalId}`, { body, ...options });
  }
  list(query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.getAPIList("/evals", EvalListResponsesPage, { query, ...options });
  }
  /**
   * Delete an evaluation.
   */
  del(evalId, options) {
    return this._client.delete(`/evals/${evalId}`, options);
  }
};
var EvalListResponsesPage = class extends CursorPage {
};
Evals.EvalListResponsesPage = EvalListResponsesPage;
Evals.Runs = Runs2;
Evals.RunListResponsesPage = RunListResponsesPage;

// node_modules/openai/resources/files.mjs
var Files2 = class extends APIResource {
  /**
   * Upload a file that can be used across various endpoints. Individual files can be
   * up to 512 MB, and the size of all files uploaded by one organization can be up
   * to 100 GB.
   *
   * The Assistants API supports files up to 2 million tokens and of specific file
   * types. See the
   * [Assistants Tools guide](https://platform.openai.com/docs/assistants/tools) for
   * details.
   *
   * The Fine-tuning API only supports `.jsonl` files. The input also has certain
   * required formats for fine-tuning
   * [chat](https://platform.openai.com/docs/api-reference/fine-tuning/chat-input) or
   * [completions](https://platform.openai.com/docs/api-reference/fine-tuning/completions-input)
   * models.
   *
   * The Batch API only supports `.jsonl` files up to 200 MB in size. The input also
   * has a specific required
   * [format](https://platform.openai.com/docs/api-reference/batch/request-input).
   *
   * Please [contact us](https://help.openai.com/) if you need to increase these
   * storage limits.
   */
  create(body, options) {
    return this._client.post("/files", multipartFormRequestOptions({ body, ...options }));
  }
  /**
   * Returns information about a specific file.
   */
  retrieve(fileId, options) {
    return this._client.get(`/files/${fileId}`, options);
  }
  list(query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.getAPIList("/files", FileObjectsPage, { query, ...options });
  }
  /**
   * Delete a file.
   */
  del(fileId, options) {
    return this._client.delete(`/files/${fileId}`, options);
  }
  /**
   * Returns the contents of the specified file.
   */
  content(fileId, options) {
    return this._client.get(`/files/${fileId}/content`, {
      ...options,
      headers: { Accept: "application/binary", ...options?.headers },
      __binaryResponse: true
    });
  }
  /**
   * Returns the contents of the specified file.
   *
   * @deprecated The `.content()` method should be used instead
   */
  retrieveContent(fileId, options) {
    return this._client.get(`/files/${fileId}/content`, options);
  }
  /**
   * Waits for the given file to be processed, default timeout is 30 mins.
   */
  async waitForProcessing(id, { pollInterval = 5e3, maxWait = 30 * 60 * 1e3 } = {}) {
    const TERMINAL_STATES = /* @__PURE__ */ new Set(["processed", "error", "deleted"]);
    const start = Date.now();
    let file = await this.retrieve(id);
    while (!file.status || !TERMINAL_STATES.has(file.status)) {
      await sleep(pollInterval);
      file = await this.retrieve(id);
      if (Date.now() - start > maxWait) {
        throw new APIConnectionTimeoutError({
          message: `Giving up on waiting for file ${id} to finish processing after ${maxWait} milliseconds.`
        });
      }
    }
    return file;
  }
};
var FileObjectsPage = class extends CursorPage {
};
Files2.FileObjectsPage = FileObjectsPage;

// node_modules/openai/resources/fine-tuning/methods.mjs
var Methods = class extends APIResource {
};

// node_modules/openai/resources/fine-tuning/alpha/graders.mjs
var Graders = class extends APIResource {
  /**
   * Run a grader.
   *
   * @example
   * ```ts
   * const response = await client.fineTuning.alpha.graders.run({
   *   grader: {
   *     input: 'input',
   *     name: 'name',
   *     operation: 'eq',
   *     reference: 'reference',
   *     type: 'string_check',
   *   },
   *   model_sample: 'model_sample',
   *   reference_answer: 'string',
   * });
   * ```
   */
  run(body, options) {
    return this._client.post("/fine_tuning/alpha/graders/run", { body, ...options });
  }
  /**
   * Validate a grader.
   *
   * @example
   * ```ts
   * const response =
   *   await client.fineTuning.alpha.graders.validate({
   *     grader: {
   *       input: 'input',
   *       name: 'name',
   *       operation: 'eq',
   *       reference: 'reference',
   *       type: 'string_check',
   *     },
   *   });
   * ```
   */
  validate(body, options) {
    return this._client.post("/fine_tuning/alpha/graders/validate", { body, ...options });
  }
};

// node_modules/openai/resources/fine-tuning/alpha/alpha.mjs
var Alpha = class extends APIResource {
  constructor() {
    super(...arguments);
    this.graders = new Graders(this._client);
  }
};
Alpha.Graders = Graders;

// node_modules/openai/resources/fine-tuning/checkpoints/permissions.mjs
var Permissions = class extends APIResource {
  /**
   * **NOTE:** Calling this endpoint requires an [admin API key](../admin-api-keys).
   *
   * This enables organization owners to share fine-tuned models with other projects
   * in their organization.
   *
   * @example
   * ```ts
   * // Automatically fetches more pages as needed.
   * for await (const permissionCreateResponse of client.fineTuning.checkpoints.permissions.create(
   *   'ft:gpt-4o-mini-2024-07-18:org:weather:B7R9VjQd',
   *   { project_ids: ['string'] },
   * )) {
   *   // ...
   * }
   * ```
   */
  create(fineTunedModelCheckpoint, body, options) {
    return this._client.getAPIList(`/fine_tuning/checkpoints/${fineTunedModelCheckpoint}/permissions`, PermissionCreateResponsesPage, { body, method: "post", ...options });
  }
  retrieve(fineTunedModelCheckpoint, query = {}, options) {
    if (isRequestOptions(query)) {
      return this.retrieve(fineTunedModelCheckpoint, {}, query);
    }
    return this._client.get(`/fine_tuning/checkpoints/${fineTunedModelCheckpoint}/permissions`, {
      query,
      ...options
    });
  }
  /**
   * **NOTE:** This endpoint requires an [admin API key](../admin-api-keys).
   *
   * Organization owners can use this endpoint to delete a permission for a
   * fine-tuned model checkpoint.
   *
   * @example
   * ```ts
   * const permission =
   *   await client.fineTuning.checkpoints.permissions.del(
   *     'ft:gpt-4o-mini-2024-07-18:org:weather:B7R9VjQd',
   *     'cp_zc4Q7MP6XxulcVzj4MZdwsAB',
   *   );
   * ```
   */
  del(fineTunedModelCheckpoint, permissionId, options) {
    return this._client.delete(`/fine_tuning/checkpoints/${fineTunedModelCheckpoint}/permissions/${permissionId}`, options);
  }
};
var PermissionCreateResponsesPage = class extends Page {
};
Permissions.PermissionCreateResponsesPage = PermissionCreateResponsesPage;

// node_modules/openai/resources/fine-tuning/checkpoints/checkpoints.mjs
var Checkpoints = class extends APIResource {
  constructor() {
    super(...arguments);
    this.permissions = new Permissions(this._client);
  }
};
Checkpoints.Permissions = Permissions;
Checkpoints.PermissionCreateResponsesPage = PermissionCreateResponsesPage;

// node_modules/openai/resources/fine-tuning/jobs/checkpoints.mjs
var Checkpoints2 = class extends APIResource {
  list(fineTuningJobId, query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list(fineTuningJobId, {}, query);
    }
    return this._client.getAPIList(`/fine_tuning/jobs/${fineTuningJobId}/checkpoints`, FineTuningJobCheckpointsPage, { query, ...options });
  }
};
var FineTuningJobCheckpointsPage = class extends CursorPage {
};
Checkpoints2.FineTuningJobCheckpointsPage = FineTuningJobCheckpointsPage;

// node_modules/openai/resources/fine-tuning/jobs/jobs.mjs
var Jobs = class extends APIResource {
  constructor() {
    super(...arguments);
    this.checkpoints = new Checkpoints2(this._client);
  }
  /**
   * Creates a fine-tuning job which begins the process of creating a new model from
   * a given dataset.
   *
   * Response includes details of the enqueued job including job status and the name
   * of the fine-tuned models once complete.
   *
   * [Learn more about fine-tuning](https://platform.openai.com/docs/guides/fine-tuning)
   *
   * @example
   * ```ts
   * const fineTuningJob = await client.fineTuning.jobs.create({
   *   model: 'gpt-4o-mini',
   *   training_file: 'file-abc123',
   * });
   * ```
   */
  create(body, options) {
    return this._client.post("/fine_tuning/jobs", { body, ...options });
  }
  /**
   * Get info about a fine-tuning job.
   *
   * [Learn more about fine-tuning](https://platform.openai.com/docs/guides/fine-tuning)
   *
   * @example
   * ```ts
   * const fineTuningJob = await client.fineTuning.jobs.retrieve(
   *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
   * );
   * ```
   */
  retrieve(fineTuningJobId, options) {
    return this._client.get(`/fine_tuning/jobs/${fineTuningJobId}`, options);
  }
  list(query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.getAPIList("/fine_tuning/jobs", FineTuningJobsPage, { query, ...options });
  }
  /**
   * Immediately cancel a fine-tune job.
   *
   * @example
   * ```ts
   * const fineTuningJob = await client.fineTuning.jobs.cancel(
   *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
   * );
   * ```
   */
  cancel(fineTuningJobId, options) {
    return this._client.post(`/fine_tuning/jobs/${fineTuningJobId}/cancel`, options);
  }
  listEvents(fineTuningJobId, query = {}, options) {
    if (isRequestOptions(query)) {
      return this.listEvents(fineTuningJobId, {}, query);
    }
    return this._client.getAPIList(`/fine_tuning/jobs/${fineTuningJobId}/events`, FineTuningJobEventsPage, {
      query,
      ...options
    });
  }
  /**
   * Pause a fine-tune job.
   *
   * @example
   * ```ts
   * const fineTuningJob = await client.fineTuning.jobs.pause(
   *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
   * );
   * ```
   */
  pause(fineTuningJobId, options) {
    return this._client.post(`/fine_tuning/jobs/${fineTuningJobId}/pause`, options);
  }
  /**
   * Resume a fine-tune job.
   *
   * @example
   * ```ts
   * const fineTuningJob = await client.fineTuning.jobs.resume(
   *   'ft-AF1WoRqd3aJAHsqc9NY7iL8F',
   * );
   * ```
   */
  resume(fineTuningJobId, options) {
    return this._client.post(`/fine_tuning/jobs/${fineTuningJobId}/resume`, options);
  }
};
var FineTuningJobsPage = class extends CursorPage {
};
var FineTuningJobEventsPage = class extends CursorPage {
};
Jobs.FineTuningJobsPage = FineTuningJobsPage;
Jobs.FineTuningJobEventsPage = FineTuningJobEventsPage;
Jobs.Checkpoints = Checkpoints2;
Jobs.FineTuningJobCheckpointsPage = FineTuningJobCheckpointsPage;

// node_modules/openai/resources/fine-tuning/fine-tuning.mjs
var FineTuning = class extends APIResource {
  constructor() {
    super(...arguments);
    this.methods = new Methods(this._client);
    this.jobs = new Jobs(this._client);
    this.checkpoints = new Checkpoints(this._client);
    this.alpha = new Alpha(this._client);
  }
};
FineTuning.Methods = Methods;
FineTuning.Jobs = Jobs;
FineTuning.FineTuningJobsPage = FineTuningJobsPage;
FineTuning.FineTuningJobEventsPage = FineTuningJobEventsPage;
FineTuning.Checkpoints = Checkpoints;
FineTuning.Alpha = Alpha;

// node_modules/openai/resources/graders/grader-models.mjs
var GraderModels = class extends APIResource {
};

// node_modules/openai/resources/graders/graders.mjs
var Graders2 = class extends APIResource {
  constructor() {
    super(...arguments);
    this.graderModels = new GraderModels(this._client);
  }
};
Graders2.GraderModels = GraderModels;

// node_modules/openai/resources/images.mjs
var Images = class extends APIResource {
  /**
   * Creates a variation of a given image. This endpoint only supports `dall-e-2`.
   *
   * @example
   * ```ts
   * const imagesResponse = await client.images.createVariation({
   *   image: fs.createReadStream('otter.png'),
   * });
   * ```
   */
  createVariation(body, options) {
    return this._client.post("/images/variations", multipartFormRequestOptions({ body, ...options }));
  }
  /**
   * Creates an edited or extended image given one or more source images and a
   * prompt. This endpoint only supports `gpt-image-1` and `dall-e-2`.
   *
   * @example
   * ```ts
   * const imagesResponse = await client.images.edit({
   *   image: fs.createReadStream('path/to/file'),
   *   prompt: 'A cute baby sea otter wearing a beret',
   * });
   * ```
   */
  edit(body, options) {
    return this._client.post("/images/edits", multipartFormRequestOptions({ body, ...options }));
  }
  /**
   * Creates an image given a prompt.
   * [Learn more](https://platform.openai.com/docs/guides/images).
   *
   * @example
   * ```ts
   * const imagesResponse = await client.images.generate({
   *   prompt: 'A cute baby sea otter',
   * });
   * ```
   */
  generate(body, options) {
    return this._client.post("/images/generations", { body, ...options });
  }
};

// node_modules/openai/resources/models.mjs
var Models = class extends APIResource {
  /**
   * Retrieves a model instance, providing basic information about the model such as
   * the owner and permissioning.
   */
  retrieve(model, options) {
    return this._client.get(`/models/${model}`, options);
  }
  /**
   * Lists the currently available models, and provides basic information about each
   * one such as the owner and availability.
   */
  list(options) {
    return this._client.getAPIList("/models", ModelsPage, options);
  }
  /**
   * Delete a fine-tuned model. You must have the Owner role in your organization to
   * delete a model.
   */
  del(model, options) {
    return this._client.delete(`/models/${model}`, options);
  }
};
var ModelsPage = class extends Page {
};
Models.ModelsPage = ModelsPage;

// node_modules/openai/resources/moderations.mjs
var Moderations = class extends APIResource {
  /**
   * Classifies if text and/or image inputs are potentially harmful. Learn more in
   * the [moderation guide](https://platform.openai.com/docs/guides/moderation).
   */
  create(body, options) {
    return this._client.post("/moderations", { body, ...options });
  }
};

// node_modules/openai/lib/ResponsesParser.mjs
function maybeParseResponse(response, params) {
  if (!params || !hasAutoParseableInput2(params)) {
    return {
      ...response,
      output_parsed: null,
      output: response.output.map((item) => {
        if (item.type === "function_call") {
          return {
            ...item,
            parsed_arguments: null
          };
        }
        if (item.type === "message") {
          return {
            ...item,
            content: item.content.map((content) => ({
              ...content,
              parsed: null
            }))
          };
        } else {
          return item;
        }
      })
    };
  }
  return parseResponse(response, params);
}
function parseResponse(response, params) {
  const output = response.output.map((item) => {
    if (item.type === "function_call") {
      return {
        ...item,
        parsed_arguments: parseToolCall2(params, item)
      };
    }
    if (item.type === "message") {
      const content = item.content.map((content2) => {
        if (content2.type === "output_text") {
          return {
            ...content2,
            parsed: parseTextFormat(params, content2.text)
          };
        }
        return content2;
      });
      return {
        ...item,
        content
      };
    }
    return item;
  });
  const parsed = Object.assign({}, response, { output });
  if (!Object.getOwnPropertyDescriptor(response, "output_text")) {
    addOutputText(parsed);
  }
  Object.defineProperty(parsed, "output_parsed", {
    enumerable: true,
    get() {
      for (const output2 of parsed.output) {
        if (output2.type !== "message") {
          continue;
        }
        for (const content of output2.content) {
          if (content.type === "output_text" && content.parsed !== null) {
            return content.parsed;
          }
        }
      }
      return null;
    }
  });
  return parsed;
}
function parseTextFormat(params, content) {
  if (params.text?.format?.type !== "json_schema") {
    return null;
  }
  if ("$parseRaw" in params.text?.format) {
    const text_format = params.text?.format;
    return text_format.$parseRaw(content);
  }
  return JSON.parse(content);
}
function hasAutoParseableInput2(params) {
  if (isAutoParsableResponseFormat(params.text?.format)) {
    return true;
  }
  return false;
}
function isAutoParsableTool2(tool) {
  return tool?.["$brand"] === "auto-parseable-tool";
}
function getInputToolByName(input_tools, name) {
  return input_tools.find((tool) => tool.type === "function" && tool.name === name);
}
function parseToolCall2(params, toolCall) {
  const inputTool = getInputToolByName(params.tools ?? [], toolCall.name);
  return {
    ...toolCall,
    ...toolCall,
    parsed_arguments: isAutoParsableTool2(inputTool) ? inputTool.$parseRaw(toolCall.arguments) : inputTool?.strict ? JSON.parse(toolCall.arguments) : null
  };
}
function addOutputText(rsp) {
  const texts = [];
  for (const output of rsp.output) {
    if (output.type !== "message") {
      continue;
    }
    for (const content of output.content) {
      if (content.type === "output_text") {
        texts.push(content.text);
      }
    }
  }
  rsp.output_text = texts.join("");
}

// node_modules/openai/resources/responses/input-items.mjs
var InputItems = class extends APIResource {
  list(responseId, query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list(responseId, {}, query);
    }
    return this._client.getAPIList(`/responses/${responseId}/input_items`, ResponseItemsPage, {
      query,
      ...options
    });
  }
};

// node_modules/openai/lib/responses/ResponseStream.mjs
var __classPrivateFieldSet6 = function(receiver, state, value, kind2, f) {
  if (kind2 === "m") throw new TypeError("Private method is not writable");
  if (kind2 === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return kind2 === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
};
var __classPrivateFieldGet7 = function(receiver, state, kind2, f) {
  if (kind2 === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind2 === "m" ? f : kind2 === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ResponseStream_instances;
var _ResponseStream_params;
var _ResponseStream_currentResponseSnapshot;
var _ResponseStream_finalResponse;
var _ResponseStream_beginRequest;
var _ResponseStream_addEvent;
var _ResponseStream_endRequest;
var _ResponseStream_accumulateResponse;
var ResponseStream = class _ResponseStream extends EventStream {
  constructor(params) {
    super();
    _ResponseStream_instances.add(this);
    _ResponseStream_params.set(this, void 0);
    _ResponseStream_currentResponseSnapshot.set(this, void 0);
    _ResponseStream_finalResponse.set(this, void 0);
    __classPrivateFieldSet6(this, _ResponseStream_params, params, "f");
  }
  static createResponse(client, params, options) {
    const runner = new _ResponseStream(params);
    runner._run(() => runner._createOrRetrieveResponse(client, params, {
      ...options,
      headers: { ...options?.headers, "X-Stainless-Helper-Method": "stream" }
    }));
    return runner;
  }
  async _createOrRetrieveResponse(client, params, options) {
    const signal = options?.signal;
    if (signal) {
      if (signal.aborted)
        this.controller.abort();
      signal.addEventListener("abort", () => this.controller.abort());
    }
    __classPrivateFieldGet7(this, _ResponseStream_instances, "m", _ResponseStream_beginRequest).call(this);
    let stream;
    let starting_after = null;
    if ("response_id" in params) {
      stream = await client.responses.retrieve(params.response_id, { stream: true }, { ...options, signal: this.controller.signal, stream: true });
      starting_after = params.starting_after ?? null;
    } else {
      stream = await client.responses.create({ ...params, stream: true }, { ...options, signal: this.controller.signal });
    }
    this._connected();
    for await (const event of stream) {
      __classPrivateFieldGet7(this, _ResponseStream_instances, "m", _ResponseStream_addEvent).call(this, event, starting_after);
    }
    if (stream.controller.signal?.aborted) {
      throw new APIUserAbortError();
    }
    return __classPrivateFieldGet7(this, _ResponseStream_instances, "m", _ResponseStream_endRequest).call(this);
  }
  [(_ResponseStream_params = /* @__PURE__ */ new WeakMap(), _ResponseStream_currentResponseSnapshot = /* @__PURE__ */ new WeakMap(), _ResponseStream_finalResponse = /* @__PURE__ */ new WeakMap(), _ResponseStream_instances = /* @__PURE__ */ new WeakSet(), _ResponseStream_beginRequest = function _ResponseStream_beginRequest2() {
    if (this.ended)
      return;
    __classPrivateFieldSet6(this, _ResponseStream_currentResponseSnapshot, void 0, "f");
  }, _ResponseStream_addEvent = function _ResponseStream_addEvent2(event, starting_after) {
    if (this.ended)
      return;
    const maybeEmit = (name, event2) => {
      if (starting_after == null || event2.sequence_number > starting_after) {
        this._emit(name, event2);
      }
    };
    const response = __classPrivateFieldGet7(this, _ResponseStream_instances, "m", _ResponseStream_accumulateResponse).call(this, event);
    maybeEmit("event", event);
    switch (event.type) {
      case "response.output_text.delta": {
        const output = response.output[event.output_index];
        if (!output) {
          throw new OpenAIError(`missing output at index ${event.output_index}`);
        }
        if (output.type === "message") {
          const content = output.content[event.content_index];
          if (!content) {
            throw new OpenAIError(`missing content at index ${event.content_index}`);
          }
          if (content.type !== "output_text") {
            throw new OpenAIError(`expected content to be 'output_text', got ${content.type}`);
          }
          maybeEmit("response.output_text.delta", {
            ...event,
            snapshot: content.text
          });
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const output = response.output[event.output_index];
        if (!output) {
          throw new OpenAIError(`missing output at index ${event.output_index}`);
        }
        if (output.type === "function_call") {
          maybeEmit("response.function_call_arguments.delta", {
            ...event,
            snapshot: output.arguments
          });
        }
        break;
      }
      default:
        maybeEmit(event.type, event);
        break;
    }
  }, _ResponseStream_endRequest = function _ResponseStream_endRequest2() {
    if (this.ended) {
      throw new OpenAIError(`stream has ended, this shouldn't happen`);
    }
    const snapshot = __classPrivateFieldGet7(this, _ResponseStream_currentResponseSnapshot, "f");
    if (!snapshot) {
      throw new OpenAIError(`request ended without sending any events`);
    }
    __classPrivateFieldSet6(this, _ResponseStream_currentResponseSnapshot, void 0, "f");
    const parsedResponse = finalizeResponse(snapshot, __classPrivateFieldGet7(this, _ResponseStream_params, "f"));
    __classPrivateFieldSet6(this, _ResponseStream_finalResponse, parsedResponse, "f");
    return parsedResponse;
  }, _ResponseStream_accumulateResponse = function _ResponseStream_accumulateResponse2(event) {
    let snapshot = __classPrivateFieldGet7(this, _ResponseStream_currentResponseSnapshot, "f");
    if (!snapshot) {
      if (event.type !== "response.created") {
        throw new OpenAIError(`When snapshot hasn't been set yet, expected 'response.created' event, got ${event.type}`);
      }
      snapshot = __classPrivateFieldSet6(this, _ResponseStream_currentResponseSnapshot, event.response, "f");
      return snapshot;
    }
    switch (event.type) {
      case "response.output_item.added": {
        snapshot.output.push(event.item);
        break;
      }
      case "response.content_part.added": {
        const output = snapshot.output[event.output_index];
        if (!output) {
          throw new OpenAIError(`missing output at index ${event.output_index}`);
        }
        if (output.type === "message") {
          output.content.push(event.part);
        }
        break;
      }
      case "response.output_text.delta": {
        const output = snapshot.output[event.output_index];
        if (!output) {
          throw new OpenAIError(`missing output at index ${event.output_index}`);
        }
        if (output.type === "message") {
          const content = output.content[event.content_index];
          if (!content) {
            throw new OpenAIError(`missing content at index ${event.content_index}`);
          }
          if (content.type !== "output_text") {
            throw new OpenAIError(`expected content to be 'output_text', got ${content.type}`);
          }
          content.text += event.delta;
        }
        break;
      }
      case "response.function_call_arguments.delta": {
        const output = snapshot.output[event.output_index];
        if (!output) {
          throw new OpenAIError(`missing output at index ${event.output_index}`);
        }
        if (output.type === "function_call") {
          output.arguments += event.delta;
        }
        break;
      }
      case "response.completed": {
        __classPrivateFieldSet6(this, _ResponseStream_currentResponseSnapshot, event.response, "f");
        break;
      }
    }
    return snapshot;
  }, Symbol.asyncIterator)]() {
    const pushQueue = [];
    const readQueue = [];
    let done = false;
    this.on("event", (event) => {
      const reader = readQueue.shift();
      if (reader) {
        reader.resolve(event);
      } else {
        pushQueue.push(event);
      }
    });
    this.on("end", () => {
      done = true;
      for (const reader of readQueue) {
        reader.resolve(void 0);
      }
      readQueue.length = 0;
    });
    this.on("abort", (err) => {
      done = true;
      for (const reader of readQueue) {
        reader.reject(err);
      }
      readQueue.length = 0;
    });
    this.on("error", (err) => {
      done = true;
      for (const reader of readQueue) {
        reader.reject(err);
      }
      readQueue.length = 0;
    });
    return {
      next: async () => {
        if (!pushQueue.length) {
          if (done) {
            return { value: void 0, done: true };
          }
          return new Promise((resolve, reject) => readQueue.push({ resolve, reject })).then((event2) => event2 ? { value: event2, done: false } : { value: void 0, done: true });
        }
        const event = pushQueue.shift();
        return { value: event, done: false };
      },
      return: async () => {
        this.abort();
        return { value: void 0, done: true };
      }
    };
  }
  /**
   * @returns a promise that resolves with the final Response, or rejects
   * if an error occurred or the stream ended prematurely without producing a REsponse.
   */
  async finalResponse() {
    await this.done();
    const response = __classPrivateFieldGet7(this, _ResponseStream_finalResponse, "f");
    if (!response)
      throw new OpenAIError("stream ended without producing a ChatCompletion");
    return response;
  }
};
function finalizeResponse(snapshot, params) {
  return maybeParseResponse(snapshot, params);
}

// node_modules/openai/resources/responses/responses.mjs
var Responses = class extends APIResource {
  constructor() {
    super(...arguments);
    this.inputItems = new InputItems(this._client);
  }
  create(body, options) {
    return this._client.post("/responses", { body, ...options, stream: body.stream ?? false })._thenUnwrap((rsp) => {
      if ("object" in rsp && rsp.object === "response") {
        addOutputText(rsp);
      }
      return rsp;
    });
  }
  retrieve(responseId, query = {}, options) {
    return this._client.get(`/responses/${responseId}`, {
      query,
      ...options,
      stream: query?.stream ?? false
    });
  }
  /**
   * Deletes a model response with the given ID.
   *
   * @example
   * ```ts
   * await client.responses.del(
   *   'resp_677efb5139a88190b512bc3fef8e535d',
   * );
   * ```
   */
  del(responseId, options) {
    return this._client.delete(`/responses/${responseId}`, {
      ...options,
      headers: { Accept: "*/*", ...options?.headers }
    });
  }
  parse(body, options) {
    return this._client.responses.create(body, options)._thenUnwrap((response) => parseResponse(response, body));
  }
  /**
   * Creates a model response stream
   */
  stream(body, options) {
    return ResponseStream.createResponse(this._client, body, options);
  }
  /**
   * Cancels a model response with the given ID. Only responses created with the
   * `background` parameter set to `true` can be cancelled.
   * [Learn more](https://platform.openai.com/docs/guides/background).
   *
   * @example
   * ```ts
   * await client.responses.cancel(
   *   'resp_677efb5139a88190b512bc3fef8e535d',
   * );
   * ```
   */
  cancel(responseId, options) {
    return this._client.post(`/responses/${responseId}/cancel`, {
      ...options,
      headers: { Accept: "*/*", ...options?.headers }
    });
  }
};
var ResponseItemsPage = class extends CursorPage {
};
Responses.InputItems = InputItems;

// node_modules/openai/resources/uploads/parts.mjs
var Parts = class extends APIResource {
  /**
   * Adds a
   * [Part](https://platform.openai.com/docs/api-reference/uploads/part-object) to an
   * [Upload](https://platform.openai.com/docs/api-reference/uploads/object) object.
   * A Part represents a chunk of bytes from the file you are trying to upload.
   *
   * Each Part can be at most 64 MB, and you can add Parts until you hit the Upload
   * maximum of 8 GB.
   *
   * It is possible to add multiple Parts in parallel. You can decide the intended
   * order of the Parts when you
   * [complete the Upload](https://platform.openai.com/docs/api-reference/uploads/complete).
   */
  create(uploadId, body, options) {
    return this._client.post(`/uploads/${uploadId}/parts`, multipartFormRequestOptions({ body, ...options }));
  }
};

// node_modules/openai/resources/uploads/uploads.mjs
var Uploads = class extends APIResource {
  constructor() {
    super(...arguments);
    this.parts = new Parts(this._client);
  }
  /**
   * Creates an intermediate
   * [Upload](https://platform.openai.com/docs/api-reference/uploads/object) object
   * that you can add
   * [Parts](https://platform.openai.com/docs/api-reference/uploads/part-object) to.
   * Currently, an Upload can accept at most 8 GB in total and expires after an hour
   * after you create it.
   *
   * Once you complete the Upload, we will create a
   * [File](https://platform.openai.com/docs/api-reference/files/object) object that
   * contains all the parts you uploaded. This File is usable in the rest of our
   * platform as a regular File object.
   *
   * For certain `purpose` values, the correct `mime_type` must be specified. Please
   * refer to documentation for the
   * [supported MIME types for your use case](https://platform.openai.com/docs/assistants/tools/file-search#supported-files).
   *
   * For guidance on the proper filename extensions for each purpose, please follow
   * the documentation on
   * [creating a File](https://platform.openai.com/docs/api-reference/files/create).
   */
  create(body, options) {
    return this._client.post("/uploads", { body, ...options });
  }
  /**
   * Cancels the Upload. No Parts may be added after an Upload is cancelled.
   */
  cancel(uploadId, options) {
    return this._client.post(`/uploads/${uploadId}/cancel`, options);
  }
  /**
   * Completes the
   * [Upload](https://platform.openai.com/docs/api-reference/uploads/object).
   *
   * Within the returned Upload object, there is a nested
   * [File](https://platform.openai.com/docs/api-reference/files/object) object that
   * is ready to use in the rest of the platform.
   *
   * You can specify the order of the Parts by passing in an ordered list of the Part
   * IDs.
   *
   * The number of bytes uploaded upon completion must match the number of bytes
   * initially specified when creating the Upload object. No Parts may be added after
   * an Upload is completed.
   */
  complete(uploadId, body, options) {
    return this._client.post(`/uploads/${uploadId}/complete`, { body, ...options });
  }
};
Uploads.Parts = Parts;

// node_modules/openai/lib/Util.mjs
var allSettledWithThrow = async (promises) => {
  const results = await Promise.allSettled(promises);
  const rejected = results.filter((result) => result.status === "rejected");
  if (rejected.length) {
    for (const result of rejected) {
      console.error(result.reason);
    }
    throw new Error(`${rejected.length} promise(s) failed - see the above errors`);
  }
  const values = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      values.push(result.value);
    }
  }
  return values;
};

// node_modules/openai/resources/vector-stores/files.mjs
var Files3 = class extends APIResource {
  /**
   * Create a vector store file by attaching a
   * [File](https://platform.openai.com/docs/api-reference/files) to a
   * [vector store](https://platform.openai.com/docs/api-reference/vector-stores/object).
   */
  create(vectorStoreId, body, options) {
    return this._client.post(`/vector_stores/${vectorStoreId}/files`, {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Retrieves a vector store file.
   */
  retrieve(vectorStoreId, fileId, options) {
    return this._client.get(`/vector_stores/${vectorStoreId}/files/${fileId}`, {
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Update attributes on a vector store file.
   */
  update(vectorStoreId, fileId, body, options) {
    return this._client.post(`/vector_stores/${vectorStoreId}/files/${fileId}`, {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  list(vectorStoreId, query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list(vectorStoreId, {}, query);
    }
    return this._client.getAPIList(`/vector_stores/${vectorStoreId}/files`, VectorStoreFilesPage, {
      query,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Delete a vector store file. This will remove the file from the vector store but
   * the file itself will not be deleted. To delete the file, use the
   * [delete file](https://platform.openai.com/docs/api-reference/files/delete)
   * endpoint.
   */
  del(vectorStoreId, fileId, options) {
    return this._client.delete(`/vector_stores/${vectorStoreId}/files/${fileId}`, {
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Attach a file to the given vector store and wait for it to be processed.
   */
  async createAndPoll(vectorStoreId, body, options) {
    const file = await this.create(vectorStoreId, body, options);
    return await this.poll(vectorStoreId, file.id, options);
  }
  /**
   * Wait for the vector store file to finish processing.
   *
   * Note: this will return even if the file failed to process, you need to check
   * file.last_error and file.status to handle these cases
   */
  async poll(vectorStoreId, fileId, options) {
    const headers = { ...options?.headers, "X-Stainless-Poll-Helper": "true" };
    if (options?.pollIntervalMs) {
      headers["X-Stainless-Custom-Poll-Interval"] = options.pollIntervalMs.toString();
    }
    while (true) {
      const fileResponse = await this.retrieve(vectorStoreId, fileId, {
        ...options,
        headers
      }).withResponse();
      const file = fileResponse.data;
      switch (file.status) {
        case "in_progress":
          let sleepInterval = 5e3;
          if (options?.pollIntervalMs) {
            sleepInterval = options.pollIntervalMs;
          } else {
            const headerInterval = fileResponse.response.headers.get("openai-poll-after-ms");
            if (headerInterval) {
              const headerIntervalMs = parseInt(headerInterval);
              if (!isNaN(headerIntervalMs)) {
                sleepInterval = headerIntervalMs;
              }
            }
          }
          await sleep(sleepInterval);
          break;
        case "failed":
        case "completed":
          return file;
      }
    }
  }
  /**
   * Upload a file to the `files` API and then attach it to the given vector store.
   *
   * Note the file will be asynchronously processed (you can use the alternative
   * polling helper method to wait for processing to complete).
   */
  async upload(vectorStoreId, file, options) {
    const fileInfo = await this._client.files.create({ file, purpose: "assistants" }, options);
    return this.create(vectorStoreId, { file_id: fileInfo.id }, options);
  }
  /**
   * Add a file to a vector store and poll until processing is complete.
   */
  async uploadAndPoll(vectorStoreId, file, options) {
    const fileInfo = await this.upload(vectorStoreId, file, options);
    return await this.poll(vectorStoreId, fileInfo.id, options);
  }
  /**
   * Retrieve the parsed contents of a vector store file.
   */
  content(vectorStoreId, fileId, options) {
    return this._client.getAPIList(`/vector_stores/${vectorStoreId}/files/${fileId}/content`, FileContentResponsesPage, { ...options, headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers } });
  }
};
var VectorStoreFilesPage = class extends CursorPage {
};
var FileContentResponsesPage = class extends Page {
};
Files3.VectorStoreFilesPage = VectorStoreFilesPage;
Files3.FileContentResponsesPage = FileContentResponsesPage;

// node_modules/openai/resources/vector-stores/file-batches.mjs
var FileBatches = class extends APIResource {
  /**
   * Create a vector store file batch.
   */
  create(vectorStoreId, body, options) {
    return this._client.post(`/vector_stores/${vectorStoreId}/file_batches`, {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Retrieves a vector store file batch.
   */
  retrieve(vectorStoreId, batchId, options) {
    return this._client.get(`/vector_stores/${vectorStoreId}/file_batches/${batchId}`, {
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Cancel a vector store file batch. This attempts to cancel the processing of
   * files in this batch as soon as possible.
   */
  cancel(vectorStoreId, batchId, options) {
    return this._client.post(`/vector_stores/${vectorStoreId}/file_batches/${batchId}/cancel`, {
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Create a vector store batch and poll until all files have been processed.
   */
  async createAndPoll(vectorStoreId, body, options) {
    const batch = await this.create(vectorStoreId, body);
    return await this.poll(vectorStoreId, batch.id, options);
  }
  listFiles(vectorStoreId, batchId, query = {}, options) {
    if (isRequestOptions(query)) {
      return this.listFiles(vectorStoreId, batchId, {}, query);
    }
    return this._client.getAPIList(`/vector_stores/${vectorStoreId}/file_batches/${batchId}/files`, VectorStoreFilesPage, { query, ...options, headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers } });
  }
  /**
   * Wait for the given file batch to be processed.
   *
   * Note: this will return even if one of the files failed to process, you need to
   * check batch.file_counts.failed_count to handle this case.
   */
  async poll(vectorStoreId, batchId, options) {
    const headers = { ...options?.headers, "X-Stainless-Poll-Helper": "true" };
    if (options?.pollIntervalMs) {
      headers["X-Stainless-Custom-Poll-Interval"] = options.pollIntervalMs.toString();
    }
    while (true) {
      const { data: batch, response } = await this.retrieve(vectorStoreId, batchId, {
        ...options,
        headers
      }).withResponse();
      switch (batch.status) {
        case "in_progress":
          let sleepInterval = 5e3;
          if (options?.pollIntervalMs) {
            sleepInterval = options.pollIntervalMs;
          } else {
            const headerInterval = response.headers.get("openai-poll-after-ms");
            if (headerInterval) {
              const headerIntervalMs = parseInt(headerInterval);
              if (!isNaN(headerIntervalMs)) {
                sleepInterval = headerIntervalMs;
              }
            }
          }
          await sleep(sleepInterval);
          break;
        case "failed":
        case "cancelled":
        case "completed":
          return batch;
      }
    }
  }
  /**
   * Uploads the given files concurrently and then creates a vector store file batch.
   *
   * The concurrency limit is configurable using the `maxConcurrency` parameter.
   */
  async uploadAndPoll(vectorStoreId, { files, fileIds = [] }, options) {
    if (files == null || files.length == 0) {
      throw new Error(`No \`files\` provided to process. If you've already uploaded files you should use \`.createAndPoll()\` instead`);
    }
    const configuredConcurrency = options?.maxConcurrency ?? 5;
    const concurrencyLimit = Math.min(configuredConcurrency, files.length);
    const client = this._client;
    const fileIterator = files.values();
    const allFileIds = [...fileIds];
    async function processFiles(iterator) {
      for (let item of iterator) {
        const fileObj = await client.files.create({ file: item, purpose: "assistants" }, options);
        allFileIds.push(fileObj.id);
      }
    }
    const workers = Array(concurrencyLimit).fill(fileIterator).map(processFiles);
    await allSettledWithThrow(workers);
    return await this.createAndPoll(vectorStoreId, {
      file_ids: allFileIds
    });
  }
};

// node_modules/openai/resources/vector-stores/vector-stores.mjs
var VectorStores = class extends APIResource {
  constructor() {
    super(...arguments);
    this.files = new Files3(this._client);
    this.fileBatches = new FileBatches(this._client);
  }
  /**
   * Create a vector store.
   */
  create(body, options) {
    return this._client.post("/vector_stores", {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Retrieves a vector store.
   */
  retrieve(vectorStoreId, options) {
    return this._client.get(`/vector_stores/${vectorStoreId}`, {
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Modifies a vector store.
   */
  update(vectorStoreId, body, options) {
    return this._client.post(`/vector_stores/${vectorStoreId}`, {
      body,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  list(query = {}, options) {
    if (isRequestOptions(query)) {
      return this.list({}, query);
    }
    return this._client.getAPIList("/vector_stores", VectorStoresPage, {
      query,
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Delete a vector store.
   */
  del(vectorStoreId, options) {
    return this._client.delete(`/vector_stores/${vectorStoreId}`, {
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
  /**
   * Search a vector store for relevant chunks based on a query and file attributes
   * filter.
   */
  search(vectorStoreId, body, options) {
    return this._client.getAPIList(`/vector_stores/${vectorStoreId}/search`, VectorStoreSearchResponsesPage, {
      body,
      method: "post",
      ...options,
      headers: { "OpenAI-Beta": "assistants=v2", ...options?.headers }
    });
  }
};
var VectorStoresPage = class extends CursorPage {
};
var VectorStoreSearchResponsesPage = class extends Page {
};
VectorStores.VectorStoresPage = VectorStoresPage;
VectorStores.VectorStoreSearchResponsesPage = VectorStoreSearchResponsesPage;
VectorStores.Files = Files3;
VectorStores.VectorStoreFilesPage = VectorStoreFilesPage;
VectorStores.FileContentResponsesPage = FileContentResponsesPage;
VectorStores.FileBatches = FileBatches;

// node_modules/openai/index.mjs
var _a;
var OpenAI = class extends APIClient {
  /**
   * API Client for interfacing with the OpenAI API.
   *
   * @param {string | undefined} [opts.apiKey=process.env['OPENAI_API_KEY'] ?? undefined]
   * @param {string | null | undefined} [opts.organization=process.env['OPENAI_ORG_ID'] ?? null]
   * @param {string | null | undefined} [opts.project=process.env['OPENAI_PROJECT_ID'] ?? null]
   * @param {string} [opts.baseURL=process.env['OPENAI_BASE_URL'] ?? https://api.openai.com/v1] - Override the default base URL for the API.
   * @param {number} [opts.timeout=10 minutes] - The maximum amount of time (in milliseconds) the client will wait for a response before timing out.
   * @param {number} [opts.httpAgent] - An HTTP agent used to manage HTTP(s) connections.
   * @param {Core.Fetch} [opts.fetch] - Specify a custom `fetch` function implementation.
   * @param {number} [opts.maxRetries=2] - The maximum number of times the client will retry a request.
   * @param {Core.Headers} opts.defaultHeaders - Default headers to include with every request to the API.
   * @param {Core.DefaultQuery} opts.defaultQuery - Default query parameters to include with every request to the API.
   * @param {boolean} [opts.dangerouslyAllowBrowser=false] - By default, client-side use of this library is not allowed, as it risks exposing your secret API credentials to attackers.
   */
  constructor({ baseURL = readEnv("OPENAI_BASE_URL"), apiKey = readEnv("OPENAI_API_KEY"), organization = readEnv("OPENAI_ORG_ID") ?? null, project = readEnv("OPENAI_PROJECT_ID") ?? null, ...opts } = {}) {
    if (apiKey === void 0) {
      throw new OpenAIError("The OPENAI_API_KEY environment variable is missing or empty; either provide it, or instantiate the OpenAI client with an apiKey option, like new OpenAI({ apiKey: 'My API Key' }).");
    }
    const options = {
      apiKey,
      organization,
      project,
      ...opts,
      baseURL: baseURL || `https://api.openai.com/v1`
    };
    if (!options.dangerouslyAllowBrowser && isRunningInBrowser()) {
      throw new OpenAIError("It looks like you're running in a browser-like environment.\n\nThis is disabled by default, as it risks exposing your secret API credentials to attackers.\nIf you understand the risks and have appropriate mitigations in place,\nyou can set the `dangerouslyAllowBrowser` option to `true`, e.g.,\n\nnew OpenAI({ apiKey, dangerouslyAllowBrowser: true });\n\nhttps://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety\n");
    }
    super({
      baseURL: options.baseURL,
      timeout: options.timeout ?? 6e5,
      httpAgent: options.httpAgent,
      maxRetries: options.maxRetries,
      fetch: options.fetch
    });
    this.completions = new Completions3(this);
    this.chat = new Chat(this);
    this.embeddings = new Embeddings(this);
    this.files = new Files2(this);
    this.images = new Images(this);
    this.audio = new Audio(this);
    this.moderations = new Moderations(this);
    this.models = new Models(this);
    this.fineTuning = new FineTuning(this);
    this.graders = new Graders2(this);
    this.vectorStores = new VectorStores(this);
    this.beta = new Beta(this);
    this.batches = new Batches(this);
    this.uploads = new Uploads(this);
    this.responses = new Responses(this);
    this.evals = new Evals(this);
    this.containers = new Containers(this);
    this._options = options;
    this.apiKey = apiKey;
    this.organization = organization;
    this.project = project;
  }
  defaultQuery() {
    return this._options.defaultQuery;
  }
  defaultHeaders(opts) {
    return {
      ...super.defaultHeaders(opts),
      "OpenAI-Organization": this.organization,
      "OpenAI-Project": this.project,
      ...this._options.defaultHeaders
    };
  }
  authHeaders(opts) {
    return { Authorization: `Bearer ${this.apiKey}` };
  }
  stringifyQuery(query) {
    return stringify(query, { arrayFormat: "brackets" });
  }
};
_a = OpenAI;
OpenAI.OpenAI = _a;
OpenAI.DEFAULT_TIMEOUT = 6e5;
OpenAI.OpenAIError = OpenAIError;
OpenAI.APIError = APIError;
OpenAI.APIConnectionError = APIConnectionError;
OpenAI.APIConnectionTimeoutError = APIConnectionTimeoutError;
OpenAI.APIUserAbortError = APIUserAbortError;
OpenAI.NotFoundError = NotFoundError;
OpenAI.ConflictError = ConflictError;
OpenAI.RateLimitError = RateLimitError;
OpenAI.BadRequestError = BadRequestError;
OpenAI.AuthenticationError = AuthenticationError;
OpenAI.InternalServerError = InternalServerError;
OpenAI.PermissionDeniedError = PermissionDeniedError;
OpenAI.UnprocessableEntityError = UnprocessableEntityError;
OpenAI.toFile = toFile;
OpenAI.fileFromPath = fileFromPath;
OpenAI.Completions = Completions3;
OpenAI.Chat = Chat;
OpenAI.ChatCompletionsPage = ChatCompletionsPage;
OpenAI.Embeddings = Embeddings;
OpenAI.Files = Files2;
OpenAI.FileObjectsPage = FileObjectsPage;
OpenAI.Images = Images;
OpenAI.Audio = Audio;
OpenAI.Moderations = Moderations;
OpenAI.Models = Models;
OpenAI.ModelsPage = ModelsPage;
OpenAI.FineTuning = FineTuning;
OpenAI.Graders = Graders2;
OpenAI.VectorStores = VectorStores;
OpenAI.VectorStoresPage = VectorStoresPage;
OpenAI.VectorStoreSearchResponsesPage = VectorStoreSearchResponsesPage;
OpenAI.Beta = Beta;
OpenAI.Batches = Batches;
OpenAI.BatchesPage = BatchesPage;
OpenAI.Uploads = Uploads;
OpenAI.Responses = Responses;
OpenAI.Evals = Evals;
OpenAI.EvalListResponsesPage = EvalListResponsesPage;
OpenAI.Containers = Containers;
OpenAI.ContainerListResponsesPage = ContainerListResponsesPage;
var openai_default = OpenAI;

// src/api/deepseek.ts
var DeepSeekClient = class {
  constructor(config) {
    this.config = config;
    this.client = new openai_default({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
      dangerouslyAllowBrowser: true
    });
  }
  updateConfig(config) {
    Object.assign(this.config, config);
    this.client = new openai_default({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseUrl,
      dangerouslyAllowBrowser: true
    });
  }
  async listModels() {
    try {
      const response = await this.client.models.list();
      const ids = response.data.map((m) => m.id);
      const chatModels = ids.filter(
        (id) => id.startsWith("deepseek") && !id.includes("embed")
      );
      return chatModels.sort().reverse();
    } catch {
      return [];
    }
  }
  async chat(messages, tools) {
    const body = {
      model: this.config.model,
      messages,
      stream: false
    };
    if (this.config.thinkingEnabled) {
      body.reasoning_effort = this.config.reasoningEffort;
      body.thinking = { type: "enabled" };
    } else {
      body.thinking = { type: "disabled" };
      if (this.config.temperature !== void 0) {
        body.temperature = this.config.temperature;
      }
    }
    if (tools && tools.length > 0) {
      body.tools = tools;
    }
    const response = await this.client.chat.completions.create(body);
    const choice = response.choices?.[0];
    if (!choice) {
      return {
        content: null,
        reasoningContent: null,
        toolCalls: null,
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
      };
    }
    const message = choice.message ?? {};
    const toolCalls = message.tool_calls?.map(
      (tc) => ({
        id: tc.id,
        name: tc.function.name,
        arguments: tc.function.arguments
      })
    ) ?? null;
    return {
      content: message.content ?? null,
      reasoningContent: message.reasoning_content ?? null,
      toolCalls,
      usage: {
        promptTokens: response.usage?.prompt_tokens ?? 0,
        completionTokens: response.usage?.completion_tokens ?? 0,
        totalTokens: response.usage?.total_tokens ?? 0
      }
    };
  }
  async chatStream(messages, tools, onChunk) {
    const body = {
      model: this.config.model,
      messages,
      stream: true,
      stream_options: { include_usage: true }
    };
    if (this.config.thinkingEnabled) {
      body.reasoning_effort = this.config.reasoningEffort;
      body.thinking = { type: "enabled" };
    } else {
      body.thinking = { type: "disabled" };
      if (this.config.temperature !== void 0) {
        body.temperature = this.config.temperature;
      }
    }
    if (tools && tools.length > 0) {
      body.tools = tools;
    }
    const stream = await this.client.chat.completions.create(body);
    const toolCallAccumulators = /* @__PURE__ */ new Map();
    let usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
    for await (const chunk of stream) {
      if (chunk.usage) {
        usage = {
          promptTokens: chunk.usage.prompt_tokens ?? 0,
          completionTokens: chunk.usage.completion_tokens ?? 0,
          totalTokens: chunk.usage.total_tokens ?? 0
        };
      }
      const delta = chunk.choices?.[0]?.delta;
      if (!delta) continue;
      const content = delta.content ?? "";
      const reasoningContent = delta.reasoning_content ?? "";
      let aggregatedToolCalls = null;
      if (delta.tool_calls) {
        for (const tc of delta.tool_calls) {
          const idx = tc.index;
          const existing = toolCallAccumulators.get(idx) ?? { id: "", name: "", arguments: "" };
          existing.id = tc.id ?? existing.id;
          existing.name = tc.function?.name ?? existing.name;
          existing.arguments = existing.arguments + (tc.function?.arguments ?? "");
          toolCallAccumulators.set(idx, existing);
        }
        aggregatedToolCalls = Array.from(toolCallAccumulators.entries()).map(
          ([index, v]) => ({ index, ...v })
        );
      }
      const done = chunk.choices?.[0]?.finish_reason !== null && chunk.choices?.[0]?.finish_reason !== void 0;
      onChunk({ content, reasoningContent, toolCalls: aggregatedToolCalls, done });
    }
    return { usage };
  }
};

// src/tools/getCurrentTime.ts
function pad(n) {
  return String(n).padStart(2, "0");
}
function formatLocal(d, utcOffsetMinutes) {
  const localTime = new Date(d.getTime() + utcOffsetMinutes * 6e4);
  const y = localTime.getUTCFullYear();
  const mo = pad(localTime.getUTCMonth() + 1);
  const day = pad(localTime.getUTCDate());
  const h = pad(localTime.getUTCHours());
  const mi = pad(localTime.getUTCMinutes());
  const s = pad(localTime.getUTCSeconds());
  const sign = utcOffsetMinutes >= 0 ? "+" : "-";
  const absH = pad(Math.floor(Math.abs(utcOffsetMinutes) / 60));
  const absM = pad(Math.abs(utcOffsetMinutes) % 60);
  return `${y}-${mo}-${day}T${h}:${mi}:${s}${sign}${absH}:${absM}`;
}
var getCurrentTimeTool = {
  definition: {
    type: "function",
    function: {
      name: "getCurrentTime",
      description: "Get the current date and time. Returns local time with timezone info. Use timezoneOffset to query a specific timezone (e.g. '+8' for Beijing, '-5' for New York).",
      parameters: {
        type: "object",
        properties: {
          timezoneOffset: {
            type: "string",
            description: "UTC offset string like '+8', '-5', '+0'. Omit for local timezone."
          }
        },
        required: []
      }
    }
  },
  execute: (args) => {
    const now = /* @__PURE__ */ new Date();
    const localOffset = -now.getTimezoneOffset();
    const tzOffset = args.timezoneOffset;
    if (tzOffset) {
      const offsetHours = parseInt(tzOffset, 10);
      if (isNaN(offsetHours)) {
        return JSON.stringify({
          error: `Invalid timezone offset: ${tzOffset}`,
          localDatetime: formatLocal(now, localOffset),
          localTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          localOffsetHours: localOffset / 60
        });
      }
      const targetOffsetMinutes = offsetHours * 60;
      return JSON.stringify({
        datetime: formatLocal(now, targetOffsetMinutes),
        timezone: `UTC${args.timezoneOffset}`,
        unixTimestamp: Math.floor(now.getTime() / 1e3),
        dayOfWeek: now.toLocaleDateString("en-US", { weekday: "long", timeZone: `Etc/GMT${offsetHours > 0 ? "-" : "+"}${Math.abs(offsetHours)}` })
      });
    }
    return JSON.stringify({
      datetime: formatLocal(now, localOffset),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      utcOffset: `UTC${localOffset >= 0 ? "+" : ""}${localOffset / 60}`,
      unixTimestamp: Math.floor(now.getTime() / 1e3),
      dayOfWeek: now.toLocaleDateString("en-US", { weekday: "long" })
    });
  }
};

// src/tools/searchNotes.ts
var vaultApp = null;
function setSearchNotesApp(app) {
  vaultApp = app;
}
var searchNotesTool = {
  definition: {
    type: "function",
    function: {
      name: "searchNotes",
      description: 'Search notes in the Obsidian vault. Supports keyword, tag, filename, path, property, regex, and full-text search. Use operators: OR, -exclude, "exact phrase".',
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: 'Search query. Supports: keywords (AND by default, OR for any), -word to exclude, "exact phrase", /regex/. Omit to list files without filtering.'
          },
          searchIn: {
            type: "string",
            enum: ["content", "filename", "path", "tag", "property", "all"],
            description: "Where to search: 'content' (default), 'filename', 'path', 'tag' (prefix with #), 'property' (use with propertyName), or 'all'."
          },
          propertyName: {
            type: "string",
            description: "Property name to search. Use with searchIn=property. Example: 'status' searches [status:...]. Omit to find files that have this property at all."
          },
          propertyValue: {
            type: "string",
            description: "Property value to match. Use with propertyName. Supports exact match, 'null' for empty, or /regex/. Example: 'Draft' or '/2024/'."
          },
          caseSensitive: {
            type: "boolean",
            description: "Case sensitive search (default: false)."
          },
          maxResults: {
            type: "integer",
            description: "Max results to return (default: 15)."
          }
        }
      }
    }
  },
  execute: async (args) => {
    if (!vaultApp) return JSON.stringify({ error: "Vault not available" });
    const query = args.query || "";
    const searchIn = args.searchIn || "content";
    const propertyName = args.propertyName;
    const propertyValue = args.propertyValue;
    const caseSensitive = !!args.caseSensitive;
    const maxResults = Math.min(Math.max(Number(args.maxResults) || 15, 1), 100);
    const files = vaultApp.vault.getMarkdownFiles();
    let results = [];
    if (!query && !propertyName) {
      results = listAllNotes(files);
    } else if (searchIn === "tag") {
      results = searchTags(files, query, caseSensitive);
    } else if (searchIn === "property" || propertyName) {
      results = searchProperties(files, propertyName || query, propertyValue, caseSensitive);
    } else if (searchIn === "filename") {
      results = searchFilename(files, query, caseSensitive);
    } else if (searchIn === "path") {
      results = searchPath(files, query, caseSensitive);
    } else {
      results = await searchContent(files, query, caseSensitive);
    }
    if (searchIn === "all" && propertyName && query) {
      results = filterByProperty(results, propertyName, propertyValue, caseSensitive);
    }
    return JSON.stringify({
      query: query || "(all notes)",
      total: results.length,
      results: results.slice(0, maxResults)
    });
  }
};
function listAllNotes(files) {
  return files.map((f) => {
    const cache = vaultApp.metadataCache.getFileCache(f);
    return {
      file: f.basename,
      path: f.path,
      snippet: f.path,
      tags: (cache?.tags || []).map((t2) => t2.tag),
      properties: cache?.frontmatter || {}
    };
  });
}
function searchTags(files, query, caseSensitive) {
  const results = [];
  const cleanQuery = query.replace(/^#/, "");
  for (const f of files) {
    const cache = vaultApp.metadataCache.getFileCache(f);
    const inlineTags = (cache?.tags || []).map((t2) => t2.tag);
    const fmTags = cache?.frontmatter?.tags?.map((t2) => String(t2)) || [];
    const allTags = [.../* @__PURE__ */ new Set([...inlineTags, ...fmTags])];
    if (allTags.length === 0) continue;
    const matched = allTags.some((t2) => {
      const tagName = t2.replace(/^#/, "");
      return caseSensitive ? tagName.includes(cleanQuery) : tagName.toLowerCase().includes(cleanQuery.toLowerCase());
    });
    if (!matched && cleanQuery) continue;
    results.push({
      file: f.basename,
      path: f.path,
      snippet: allTags.join(", "),
      tags: allTags,
      properties: cache?.frontmatter || {}
    });
  }
  return results;
}
function searchProperties(files, name, value, caseSensitive) {
  const results = [];
  for (const f of files) {
    const cache = vaultApp.metadataCache.getFileCache(f);
    const fm = cache?.frontmatter || {};
    if (!(name in fm)) continue;
    if (value !== void 0 && value !== "") {
      if (!matchPropertyVal(fm[name], value, caseSensitive)) continue;
    }
    results.push({
      file: f.basename,
      path: f.path,
      snippet: `[${name}: ${JSON.stringify(fm[name])}]`,
      tags: (cache?.tags || []).map((t2) => t2.tag),
      properties: fm
    });
  }
  return results;
}
function searchFilename(files, query, caseSensitive) {
  const results = [];
  for (const f of files) {
    const target = caseSensitive ? f.basename : f.basename.toLowerCase();
    const q = caseSensitive ? query : query.toLowerCase();
    if (query && !target.includes(q)) continue;
    const cache = vaultApp.metadataCache.getFileCache(f);
    results.push({
      file: f.basename,
      path: f.path,
      snippet: f.path,
      tags: (cache?.tags || []).map((t2) => t2.tag),
      properties: cache?.frontmatter || {}
    });
  }
  return results;
}
function searchPath(files, query, caseSensitive) {
  const results = [];
  for (const f of files) {
    const target = caseSensitive ? f.path : f.path.toLowerCase();
    const q = caseSensitive ? query : query.toLowerCase();
    if (query && !target.includes(q)) continue;
    const cache = vaultApp.metadataCache.getFileCache(f);
    results.push({
      file: f.basename,
      path: f.path,
      snippet: f.path,
      tags: (cache?.tags || []).map((t2) => t2.tag),
      properties: cache?.frontmatter || {}
    });
  }
  return results;
}
async function searchContent(files, query, caseSensitive) {
  const results = [];
  if (!query) {
    for (const f of files) {
      const cache = vaultApp.metadataCache.getFileCache(f);
      results.push({
        file: f.basename,
        path: f.path,
        snippet: f.path,
        tags: (cache?.tags || []).map((t2) => t2.tag),
        properties: cache?.frontmatter || {}
      });
    }
    return results;
  }
  const groups = parseQuery(query, caseSensitive);
  for (const f of files) {
    const cache = vaultApp.metadataCache.getFileCache(f);
    const inlineTags = (cache?.tags || []).map((t2) => t2.tag);
    const properties = cache?.frontmatter || {};
    const hasFilter = groups.length > 0 && groups.some((g) => g.include.length > 0 || g.exclude.length > 0 || g.regex || g.phrase || g.tags.length > 0 || g.properties.length > 0);
    if (!hasFilter) {
      results.push({ file: f.basename, path: f.path, snippet: f.path, tags: inlineTags, properties });
      continue;
    }
    for (const terms of groups) {
      if (terms.tags.length > 0) {
        const fileTags = inlineTags.map((t2) => t2.replace(/^#/, ""));
        const allTagMatch = terms.tags.every(
          (t2) => fileTags.some((ft) => caseSensitive ? ft.includes(t2) : ft.toLowerCase().includes(t2.toLowerCase()))
        );
        if (!allTagMatch) continue;
      }
      if (terms.properties.length > 0) {
        const allPropMatch = terms.properties.every(([k, v]) => {
          if (!(k in properties)) return false;
          return matchPropertyVal(properties[k], v || "", caseSensitive);
        });
        if (!allPropMatch) continue;
      }
      if (terms.include.length > 0 || terms.exclude.length > 0 || terms.regex || terms.phrase) {
        const content = await vaultApp.vault.read(f);
        let text = caseSensitive ? content : content.toLowerCase();
        if (terms.exclude.length > 0 && terms.exclude.some((w) => text.includes(w))) continue;
        if (terms.include.length > 0 && !terms.include.every((w) => text.includes(w))) continue;
        if (terms.phrase && !text.includes(terms.phrase)) continue;
        if (terms.regex) {
          try {
            if (!new RegExp(terms.regex.pattern, terms.regex.flags + (caseSensitive ? "" : "i")).test(content)) continue;
          } catch {
            continue;
          }
        }
        const snippet = extractSnippet(content, terms.include[0] || terms.phrase || terms.regex?.pattern || "", 200);
        results.push({ file: f.basename, path: f.path, snippet, tags: inlineTags, properties });
      } else {
        results.push({ file: f.basename, path: f.path, snippet: f.path, tags: inlineTags, properties });
      }
      break;
    }
  }
  return results;
}
function parseQuery(raw, caseSensitive) {
  const groupStrings = raw.split(/\s+OR\s+/i).map((g) => g.trim()).filter((g) => g);
  if (groupStrings.length === 0) return [];
  return groupStrings.map((g) => parseSingleGroup(g, caseSensitive));
}
function parseSingleGroup(raw, caseSensitive) {
  const include = [];
  const exclude = [];
  const tags = [];
  const properties = [];
  let phrase = null;
  let regex = null;
  const regexMatch = raw.match(/^\/(.+?)\/([a-z]*)$/);
  if (regexMatch) {
    return { include, exclude, phrase, tags, properties, regex: { pattern: regexMatch[1], flags: regexMatch[2] } };
  }
  const phraseMatches = raw.match(/"([^"]+)"/g);
  if (phraseMatches) {
    phrase = phraseMatches.map((m) => m.slice(1, -1)).join(" ");
    raw = raw.replace(/"([^"]+)"/g, "");
  }
  const tokens = raw.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
  for (const token of tokens) {
    const t2 = caseSensitive ? token : token.toLowerCase();
    if (t2.startsWith("-") && t2.length > 1) {
      exclude.push(t2.slice(1));
    } else if (t2.startsWith("#")) {
      tags.push(t2.slice(1));
    } else if (t2.match(/^\[(.+?)(?::(.+?))?\]$/)) {
      const pm = t2.match(/^\[(.+?)(?::(.+?))?\]$/);
      if (pm) properties.push([pm[1], pm[2] || null]);
    } else {
      include.push(t2);
    }
  }
  return { include, exclude, phrase, tags, properties, regex };
}
function extractSnippet(content, query, maxLen) {
  if (!query) return content.slice(0, maxLen);
  const idx = content.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return content.slice(0, maxLen);
  const start = Math.max(0, idx - 60);
  const end = Math.min(content.length, idx + query.length + 60);
  let snip = content.slice(start, end);
  if (start > 0) snip = "..." + snip;
  if (end < content.length) snip += "...";
  return snip;
}
function matchPropertyVal(propVal, searchVal, caseSensitive) {
  const pv = String(propVal ?? "");
  if (searchVal === "null") return !propVal;
  const reMatch = searchVal.match(/^\/(.+?)\/([a-z]*)$/);
  if (reMatch) {
    try {
      return new RegExp(reMatch[1], reMatch[2] + (caseSensitive ? "" : "i")).test(pv);
    } catch {
      return false;
    }
  }
  const a = caseSensitive ? pv : pv.toLowerCase();
  const b = caseSensitive ? searchVal : searchVal.toLowerCase();
  return a.includes(b);
}
function filterByProperty(results, name, value, caseSensitive) {
  return results.filter((r) => {
    if (!(name in r.properties)) return false;
    if (value === void 0 || value === "") return true;
    return matchPropertyVal(r.properties[name], value, caseSensitive);
  });
}

// src/tools/tavilySearch.ts
var import_obsidian = require("obsidian");
var API_URL = "https://api.tavily.com/search";
var tavilySearchTool = {
  definition: {
    type: "function",
    function: {
      name: "tavilySearch",
      description: "Search the web using Tavily. Returns AI-curated results with titles, URLs, content snippets, and relevance scores. Use for up-to-date information, current events, and facts beyond your knowledge cutoff.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query string"
          },
          search_depth: {
            type: "string",
            enum: ["basic", "advanced"],
            description: "Search depth: 'basic' for fast results, 'advanced' for thorough search (default: basic)"
          },
          topic: {
            type: "string",
            enum: ["general", "news", "finance"],
            description: "Search topic category (default: general)"
          },
          max_results: {
            type: "integer",
            description: "Maximum number of results (1-20, default: 5)"
          },
          include_domains: {
            type: "array",
            items: { type: "string" },
            description: "Only include results from these domains"
          },
          exclude_domains: {
            type: "array",
            items: { type: "string" },
            description: "Exclude results from these domains"
          }
        },
        required: ["query"]
      }
    }
  },
  execute: async (args, apiKeys) => {
    const query = args.query;
    if (!query?.trim()) return JSON.stringify({ error: "'query' is required" });
    const token = apiKeys?.tavilyKey || "";
    if (!token) return JSON.stringify({ error: "Tavily API key not configured. Set it in Settings \u2192 Tools." });
    const body = {
      query: query.trim(),
      search_depth: args.search_depth || "basic",
      max_results: Math.min(Math.max(Number(args.max_results) || 5, 1), 20)
    };
    if (args.topic) body.topic = args.topic;
    if (args.include_domains) body.include_domains = args.include_domains;
    if (args.exclude_domains) body.exclude_domains = args.exclude_domains;
    try {
      const res = await (0, import_obsidian.requestUrl)({
        url: API_URL,
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
      if (res.status !== 200) {
        if (res.status === 401) return JSON.stringify({ error: "Tavily API key invalid or expired (HTTP 401)" });
        if (res.status === 429) return JSON.stringify({ error: "Tavily rate limit exceeded (HTTP 429)" });
        return JSON.stringify({ error: `Tavily API error: HTTP ${res.status}` });
      }
      const data = res.json;
      const results = (data.results || []).map((r) => ({
        url: r.url,
        title: r.title,
        content: r.content,
        score: r.score
      }));
      return JSON.stringify({
        query: data.query,
        response_time: data.response_time,
        answer: data.answer || null,
        results
      });
    } catch (e) {
      return JSON.stringify({ error: e.message || "Tavily request failed" });
    }
  }
};

// src/tools/tavilyExtract.ts
var import_obsidian2 = require("obsidian");
var API_URL2 = "https://api.tavily.com/extract";
var tavilyExtractTool = {
  definition: {
    type: "function",
    function: {
      name: "tavilyExtract",
      description: "Extract clean content (markdown or text) from one or more URLs using Tavily. Strips navigation, ads, and clutter. Supports up to 20 URLs per request. Use after tavilySearch to read full article content.",
      parameters: {
        type: "object",
        properties: {
          urls: {
            type: "array",
            items: { type: "string" },
            description: "List of URLs to extract content from (max 20)"
          },
          extract_depth: {
            type: "string",
            enum: ["basic", "advanced"],
            description: "'basic' for fast plain text, 'advanced' for complex JS-heavy pages (default: basic)"
          },
          format: {
            type: "string",
            enum: ["markdown", "text"],
            description: "Output format (default: markdown)"
          }
        },
        required: ["urls"]
      }
    }
  },
  execute: async (args, apiKeys) => {
    const urls = args.urls;
    if (!urls || urls.length === 0) return JSON.stringify({ error: "'urls' is required" });
    const token = apiKeys?.tavilyKey || "";
    if (!token) return JSON.stringify({ error: "Tavily API key not configured." });
    const body = {
      urls: urls.slice(0, 20),
      extract_depth: args.extract_depth || "basic",
      format: args.format || "markdown"
    };
    try {
      const res = await (0, import_obsidian2.requestUrl)({
        url: API_URL2,
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
      if (res.status !== 200) {
        return JSON.stringify({ error: `Tavily Extract error: HTTP ${res.status}` });
      }
      const data = res.json;
      const results = (data.results || []).map((r) => ({
        url: r.url,
        content: r.raw_content || r.content || ""
      }));
      for (const r of results) {
        if (r.content.length > 8e3) {
          r.content = r.content.slice(0, 8e3) + "...[truncated]";
        }
      }
      return JSON.stringify({
        results,
        failed_results: data.failed_results || [],
        response_time: data.response_time
      });
    } catch (e) {
      return JSON.stringify({ error: e.message || "Tavily Extract failed" });
    }
  }
};

// src/tools/tavilyMap.ts
var import_obsidian3 = require("obsidian");
var API_URL3 = "https://api.tavily.com/map";
var tavilyMapTool = {
  definition: {
    type: "function",
    function: {
      name: "tavilyMap",
      description: "Discover the URL structure of a website using Tavily Map. Returns a list of discovered URLs without page content. Ideal for site discovery before using tavilyExtract on specific pages.",
      parameters: {
        type: "object",
        properties: {
          url: { type: "string", description: "Root URL to start mapping from" },
          max_depth: { type: "integer", description: "Mapping depth 1-5 (default: 1)" },
          max_breadth: { type: "integer", description: "Max links per page 1-500 (default: 20)" },
          limit: { type: "integer", description: "Total URLs to discover (default: 50)" },
          instructions: { type: "string", description: "Natural language instructions for focused mapping, e.g. 'find API docs'" },
          select_paths: { type: "array", items: { type: "string" }, description: "Regex patterns to include matching URL paths" },
          exclude_paths: { type: "array", items: { type: "string" }, description: "Regex patterns to exclude matching URL paths" },
          allow_external: { type: "boolean", description: "Allow mapping external domains (default: true)" }
        },
        required: ["url"]
      }
    }
  },
  execute: async (args, apiKeys) => {
    const url = args.url;
    if (!url?.trim()) return JSON.stringify({ error: "'url' is required" });
    const token = apiKeys?.tavilyKey || "";
    if (!token) return JSON.stringify({ error: "Tavily API key not configured." });
    const body = {
      url: url.trim(),
      max_depth: Math.min(Math.max(Number(args.max_depth) || 1, 1), 5),
      max_breadth: Math.min(Math.max(Number(args.max_breadth) || 20, 1), 500),
      limit: Math.max(Number(args.limit) || 50, 1)
    };
    if (args.instructions) body.instructions = args.instructions;
    if (args.select_paths) body.select_paths = args.select_paths;
    if (args.exclude_paths) body.exclude_paths = args.exclude_paths;
    if (args.allow_external !== void 0) body.allow_external = args.allow_external;
    try {
      const res = await (0, import_obsidian3.requestUrl)({
        url: API_URL3,
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (res.status !== 200) {
        if (res.status === 401) return JSON.stringify({ error: "Tavily API key invalid or expired (HTTP 401)" });
        if (res.status === 429) return JSON.stringify({ error: "Tavily API rate limit exceeded (HTTP 429)" });
        return JSON.stringify({ error: `Tavily Map error: HTTP ${res.status}` });
      }
      const data = res.json;
      return JSON.stringify({
        base_url: data.base_url || url,
        response_time: data.response_time,
        results: data.results || []
      });
    } catch (e) {
      return JSON.stringify({ error: e.message || "Tavily Map failed" });
    }
  }
};

// src/tools/tavilyCrawl.ts
var import_obsidian4 = require("obsidian");
var API_URL4 = "https://api.tavily.com/crawl";
var tavilyCrawlTool = {
  definition: {
    type: "function",
    function: {
      name: "tavilyCrawl",
      description: "Crawl a website starting from a URL using Tavily. Follows links and extracts content from discovered pages with configurable depth/breadth. Use for deep research into a specific site or documentation.",
      parameters: {
        type: "object",
        properties: {
          url: { type: "string", description: "Root URL to start crawling from" },
          max_depth: { type: "integer", description: "Crawl depth 1-5 (default: 1). Higher = more pages" },
          max_breadth: { type: "integer", description: "Max links per page level 1-500 (default: 20)" },
          limit: { type: "integer", description: "Total pages to crawl (default: 50)" },
          instructions: { type: "string", description: "Natural language instructions for focused crawling, e.g. 'find API docs'" },
          select_paths: { type: "array", items: { type: "string" }, description: "Regex patterns to include matching URL paths" },
          exclude_paths: { type: "array", items: { type: "string" }, description: "Regex patterns to exclude matching URL paths" },
          extract_depth: { type: "string", enum: ["basic", "advanced"], description: "Extraction quality (default: basic)" },
          format: { type: "string", enum: ["markdown", "text"], description: "Output format (default: markdown)" },
          allow_external: { type: "boolean", description: "Allow crawling external domains (default: true)" },
          include_images: { type: "boolean", description: "Include image URLs (default: false)" }
        },
        required: ["url"]
      }
    }
  },
  execute: async (args, apiKeys) => {
    const url = args.url;
    if (!url?.trim()) return JSON.stringify({ error: "'url' is required" });
    const token = apiKeys?.tavilyKey || "";
    if (!token) return JSON.stringify({ error: "Tavily API key not configured." });
    const body = {
      url: url.trim(),
      max_depth: Math.min(Math.max(Number(args.max_depth) || 1, 1), 5),
      max_breadth: Math.min(Math.max(Number(args.max_breadth) || 20, 1), 500),
      limit: Math.max(Number(args.limit) || 50, 1),
      extract_depth: args.extract_depth || "basic",
      format: args.format || "markdown"
    };
    if (args.instructions) body.instructions = args.instructions;
    if (args.select_paths) body.select_paths = args.select_paths;
    if (args.exclude_paths) body.exclude_paths = args.exclude_paths;
    if (args.allow_external !== void 0) body.allow_external = args.allow_external;
    if (args.include_images !== void 0) body.include_images = args.include_images;
    try {
      const res = await (0, import_obsidian4.requestUrl)({
        url: API_URL4,
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (res.status !== 200) return JSON.stringify({ error: `Tavily Crawl error: HTTP ${res.status}` });
      const data = res.json;
      const results = (data.results || []).map((r) => ({
        url: r.url,
        content: (r.raw_content || r.content || "").slice(0, 5e3)
      }));
      return JSON.stringify({ url: data.url, response_time: data.response_time, results_count: results.length, results });
    } catch (e) {
      return JSON.stringify({ error: e.message || "Tavily Crawl failed" });
    }
  }
};

// src/tools/tavilyResearch.ts
var import_obsidian5 = require("obsidian");
var API_URL5 = "https://api.tavily.com/research";
async function pollResearch(token, requestId) {
  const maxTime = 18e4;
  const interval = 5e3;
  const start = Date.now();
  while (Date.now() - start < maxTime) {
    await new Promise((r) => setTimeout(r, interval));
    try {
      const res = await (0, import_obsidian5.requestUrl)({
        url: `${API_URL5}/${requestId}`,
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
      });
      if (res.status !== 200) {
        return JSON.stringify({ error: `Research poll error: HTTP ${res.status}`, request_id: requestId });
      }
      const data = res.json;
      if (data.status === "completed") {
        return JSON.stringify({
          request_id: data.request_id,
          status: data.status,
          input: data.input,
          model: data.model,
          content: data.content,
          sources: (data.sources || []).map((s) => s.url || s),
          response_time: data.response_time
        });
      }
      if (data.status === "failed" || data.status === "error") {
        return JSON.stringify({ error: `Research ${data.status}`, request_id: requestId, status: data.status });
      }
    } catch (e) {
      return JSON.stringify({ error: e.message, request_id: requestId });
    }
  }
  return JSON.stringify({
    request_id: requestId,
    status: "pending",
    message: "Research still in progress. Use tavilyResearchGet with this request_id to retrieve results later."
  });
}
var tavilyResearchTool = {
  definition: {
    type: "function",
    function: {
      name: "tavilyResearch",
      description: "Perform comprehensive multi-step research on a topic using Tavily Research. Submits a query, polls for completion (up to 3 min), and returns an AI-generated report with sources. For long-running research, use tavilyResearchGet with the returned request_id.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Research topic or question" },
          model: { type: "string", enum: ["auto", "mini", "pro"], description: "Research depth (default: auto)" },
          citation_format: { type: "string", enum: ["numbered", "mla", "apa", "chicago"], description: "Citation style (default: numbered)" }
        },
        required: ["query"]
      }
    }
  },
  execute: async (args, apiKeys) => {
    const query = args.query;
    if (!query?.trim()) return JSON.stringify({ error: "'query' is required" });
    const token = apiKeys?.tavilyKey || "";
    if (!token) return JSON.stringify({ error: "Tavily API key not configured." });
    const body = {
      input: query.trim(),
      model: args.model || "auto",
      citation_format: args.citation_format || "numbered"
    };
    try {
      const res = await (0, import_obsidian5.requestUrl)({
        url: API_URL5,
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (res.status !== 200) {
        return JSON.stringify({ error: `Tavily Research error: HTTP ${res.status}` });
      }
      const data = res.json;
      if (data.status === "completed") {
        return JSON.stringify({
          request_id: data.request_id,
          status: "completed",
          input: data.input,
          model: data.model,
          content: data.content,
          sources: (data.sources || []).map((s) => s.url || s),
          response_time: data.response_time
        });
      }
      const requestId = data.request_id;
      if (!requestId) {
        return JSON.stringify({ error: "No request_id returned", raw: JSON.stringify(data).slice(0, 500) });
      }
      return await pollResearch(token, requestId);
    } catch (e) {
      return JSON.stringify({ error: e.message || "Tavily Research failed" });
    }
  }
};

// src/tools/tavilyResearchGet.ts
var import_obsidian6 = require("obsidian");
var API_URL6 = "https://api.tavily.com/research";
var tavilyResearchGetTool = {
  definition: {
    type: "function",
    function: {
      name: "tavilyResearchGet",
      description: "Retrieve a completed research report by request_id from a previous tavilyResearch call. Use when research didn't complete within the initial polling timeout. Returns the report content, status, and sources.",
      parameters: {
        type: "object",
        properties: {
          request_id: { type: "string", description: "Request ID returned by tavilyResearch" }
        },
        required: ["request_id"]
      }
    }
  },
  execute: async (args, apiKeys) => {
    const requestId = args.request_id;
    if (!requestId?.trim()) return JSON.stringify({ error: "'request_id' is required" });
    const token = apiKeys?.tavilyKey || "";
    if (!token) return JSON.stringify({ error: "Tavily API key not configured." });
    try {
      const res = await (0, import_obsidian6.requestUrl)({
        url: `${API_URL6}/${requestId.trim()}`,
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
      });
      if (res.status !== 200) {
        if (res.status === 404) return JSON.stringify({ error: "Research request not found (HTTP 404)" });
        return JSON.stringify({ error: `Tavily Research Get error: HTTP ${res.status}` });
      }
      const data = res.json;
      return JSON.stringify({
        request_id: data.request_id,
        status: data.status,
        created_at: data.created_at,
        input: data.input,
        model: data.model,
        content: data.content,
        sources: (data.sources || []).map((s) => s.url || s),
        response_time: data.response_time
      });
    } catch (e) {
      return JSON.stringify({ error: e.message || "Tavily Research Get failed" });
    }
  }
};

// src/tools/webFetch.ts
var import_obsidian7 = require("obsidian");
var MAX_CONTENT_LENGTH = 5e4;
var BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9"
};
var NON_CONTENT_SELECTORS = [
  "script",
  "style",
  "nav",
  "footer",
  "header",
  "aside",
  "noscript",
  "iframe",
  "form",
  "svg",
  "canvas",
  "[role=navigation]",
  "[role=banner]",
  "[role=contentinfo]",
  "[aria-hidden=true]",
  ".sidebar",
  ".nav",
  ".navigation",
  ".footer",
  ".header",
  ".menu",
  ".advertisement",
  ".ad",
  ".ads"
];
var MAIN_SELECTORS = [
  "article",
  "main",
  "[role=main]",
  ".post-content",
  ".article-content",
  ".entry-content",
  "#content",
  "#article",
  ".markdown-body",
  "div.post",
  "div.article"
];
var headlessEndpoint = "";
function setWebFetchConfig(cfg) {
  headlessEndpoint = cfg.headlessBrowserEndpoint || "";
}
var webFetchTool = {
  definition: {
    type: "function",
    function: {
      name: "webFetch",
      description: "Fetch and extract readable content from a web page. Set renderJs=true for JavaScript-rendered pages (uses built-in free renderer \u2014 works on all platforms, no setup needed). Without renderJs, does fast static HTML extraction.",
      parameters: {
        type: "object",
        properties: {
          url: {
            type: "string",
            description: "The full URL to fetch (must start with http:// or https://)"
          },
          extract_mode: {
            type: "string",
            enum: ["text", "markdown"],
            description: "Output format: 'text' for plain text, 'markdown' for formatted output (default: text)"
          },
          renderJs: {
            type: "boolean",
            description: "If true, renders the page with a headless browser first (built-in free renderer, no setup needed). Default: false."
          },
          collectLinks: {
            type: "boolean",
            description: "If true, also collect and return all secondary links (href URLs) found on the page. Default: false."
          }
        },
        required: ["url"]
      }
    }
  },
  execute: async (args, _apiKeys) => {
    const url = args.url;
    if (!url) return JSON.stringify({ error: "'url' is required" });
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return JSON.stringify({ error: "invalid URL: must start with http:// or https://" });
    }
    const mode = (args.extract_mode || "text").toLowerCase();
    const renderJs = !!args.renderJs;
    const collectLinks = !!args.collectLinks;
    try {
      if (renderJs) {
        return await fetchRendered(url, mode, collectLinks);
      }
      const html = await fetchPage(url);
      return extractContent(html, url, mode, collectLinks);
    } catch (e) {
      return JSON.stringify({ error: e.message || "web_fetch failed" });
    }
  }
};
async function fetchPage(url) {
  const res = await (0, import_obsidian7.requestUrl)({
    url,
    method: "GET",
    headers: BROWSER_HEADERS
  });
  if (res.status !== 200) {
    throw new Error(`HTTP ${res.status}`);
  }
  const contentType = (res.headers["content-type"] || "").toLowerCase();
  if (contentType && !contentType.includes("text/html") && !contentType.includes("text/plain") && !contentType.includes("application/xhtml")) {
    throw new Error(`Unsupported content type: ${contentType}. Only HTML/text pages are supported.`);
  }
  return res.text;
}
var DEFAULT_RENDERERS = [
  {
    name: "jina",
    buildUrl: (url) => `https://r.jina.ai/${url}`,
    extract: (text, _url, _mode, collectLinks) => {
      if (!collectLinks) return text;
      const linkRe = /\[([^\]]*)\]\((https?:\/\/[^)]+)\)/g;
      const links = [];
      let m;
      while ((m = linkRe.exec(text)) !== null) {
        if (!links.includes(m[2])) links.push(m[2]);
        if (links.length >= 200) break;
      }
      return links.length > 0 ? `[Page links] (${links.length} found)
${links.map((l) => `  - ${l}`).join("\n")}

${text}` : text;
    }
  }
];
async function fetchRendered(url, mode, collectLinks) {
  if (headlessEndpoint) {
    try {
      const isGetStyle = headlessEndpoint.includes("?") || headlessEndpoint.endsWith("/render");
      if (isGetStyle) {
        const sep = headlessEndpoint.includes("?") ? "&" : "?";
        const renderUrl = `${headlessEndpoint}${sep}url=${encodeURIComponent(url)}`;
        const res2 = await (0, import_obsidian7.requestUrl)({ url: renderUrl, method: "GET" });
        if (res2.status === 200) return extractContent(res2.text, url, mode, collectLinks);
        throw new Error(`HTTP ${res2.status}`);
      }
      const res = await (0, import_obsidian7.requestUrl)({
        url: headlessEndpoint,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      if (res.status === 200) return extractContent(res.text, url, mode, collectLinks);
      throw new Error(`HTTP ${res.status}`);
    } catch (e) {
    }
  }
  for (const renderer of DEFAULT_RENDERERS) {
    try {
      const renderUrl = renderer.buildUrl(url);
      const res = await (0, import_obsidian7.requestUrl)({
        url: renderUrl,
        method: "GET",
        headers: {
          "Accept": "text/markdown, text/plain, */*",
          "User-Agent": "Mozilla/5.0 (compatible; Notebrain/1.0)"
        }
      });
      if (res.status === 200) {
        return renderer.extract(res.text, url, mode, collectLinks);
      }
    } catch {
    }
  }
  try {
    const html = await fetchPage(url);
    return extractContent(html, url, mode, collectLinks);
  } catch (e) {
    return JSON.stringify({ error: `Page fetch failed: ${e.message || "unknown error"}. Static extraction also failed.` });
  }
}
function extractContent(html, baseUrl, mode, collectLinks) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const inlineData = extractInlineData(doc);
  for (const sel of NON_CONTENT_SELECTORS) {
    try {
      doc.querySelectorAll(sel).forEach((el) => el.remove());
    } catch {
    }
  }
  let contentRoot = null;
  for (const sel of MAIN_SELECTORS) {
    try {
      contentRoot = doc.querySelector(sel);
      if (contentRoot) break;
    } catch {
    }
  }
  if (!contentRoot) contentRoot = doc.body;
  if (!contentRoot) return "No readable content found on this page.";
  let linksSection = "";
  if (collectLinks) {
    const links = collectPageLinks(contentRoot, baseUrl);
    if (links.length > 0) {
      linksSection = `
[Page links] (${links.length} found)
${links.map((l) => `  - ${l}`).join("\n")}
`;
    }
  }
  let extracted;
  if (mode === "markdown") {
    extracted = htmlToMarkdown(contentRoot, baseUrl);
  } else {
    extracted = contentRoot.textContent || "";
  }
  if (linksSection || inlineData) {
    extracted = `${linksSection}${inlineData ? `[Structured data from page]
${inlineData}

` : ""}[Page content]
${extracted}`;
  }
  extracted = extracted.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  if (extracted.length > MAX_CONTENT_LENGTH) {
    extracted = extracted.slice(0, MAX_CONTENT_LENGTH) + "\n\n[Content truncated at 50,000 characters...]";
  }
  return extracted;
}
function collectPageLinks(root, baseUrl) {
  const seen = /* @__PURE__ */ new Set();
  const result = [];
  const anchors = root.querySelectorAll("a[href]");
  for (const a of anchors) {
    const raw = a.getAttribute("href") || "";
    if (!raw || raw.startsWith("#") || raw.startsWith("javascript:")) continue;
    const resolved = resolveUrl(raw, baseUrl);
    if (!resolved || !/^https?:\/\//i.test(resolved)) continue;
    if (seen.has(resolved)) continue;
    seen.add(resolved);
    result.push(resolved);
    if (result.length >= 200) break;
  }
  return result;
}
function extractInlineData(doc) {
  const parts = [];
  const scripts = doc.querySelectorAll("script");
  const dataSelectors = [
    { selector: 'script[type="application/ld+json"]', label: "JSON-LD" },
    { selector: 'script[type="application/json"]', label: "JSON Data" },
    { selector: "script#__NEXT_DATA__", label: "Next.js Data" },
    { selector: "script#__NUXT_DATA__", label: "Nuxt Data" }
  ];
  for (const { selector, label } of dataSelectors) {
    try {
      const els = doc.querySelectorAll(selector);
      for (const el of els) {
        const text = el.textContent?.trim();
        if (text) {
          try {
            const parsed = JSON.parse(text);
            const summary = summarizeJson(parsed, label);
            if (summary) parts.push(summary);
          } catch {
          }
        }
      }
    } catch {
    }
  }
  const stateRegex = /window\.__(?:INITIAL|REDUX|APP)_(?:STATE|DATA)__\s*=\s*({.+?});/s;
  const allScripts = Array.from(scripts);
  for (const s of allScripts) {
    const text = s.textContent || "";
    const match = text.match(stateRegex);
    if (match) {
      try {
        const parsed = JSON.parse(match[1]);
        const summary = summarizeJson(parsed, "App State");
        if (summary) parts.push(summary);
      } catch {
      }
    }
  }
  return parts.length > 0 ? parts.join("\n") : null;
}
function summarizeJson(data, label, depth = 0) {
  if (depth > 4) return null;
  if (data === null || data === void 0) return null;
  if (typeof data === "string") {
    return data.length > 500 ? `${label}: ${data.slice(0, 500)}...` : `${label}: ${data}`;
  }
  if (Array.isArray(data)) {
    if (data.length === 0) return null;
    const items = data.slice(0, 5).map((item) => {
      if (typeof item === "object") return summarizeJson(item, "", depth + 1);
      return String(item).slice(0, 100);
    }).filter(Boolean);
    return `${label} (${data.length} items):
${items.map((i) => `  - ${i}`).join("\n")}`;
  }
  if (typeof data === "object") {
    const keys = Object.keys(data);
    if (keys.length === 0) return null;
    const textKeys = ["name", "title", "description", "headline", "text", "content", "summary", "body", "articleBody", "abstract"];
    const extracted = [];
    for (const k of textKeys) {
      if (data[k] && typeof data[k] === "string" && data[k].length > 10) {
        extracted.push(`${k}: ${data[k].slice(0, 200)}`);
      }
    }
    if (extracted.length > 0) {
      return `${label}:
${extracted.map((e) => `  - ${e}`).join("\n")}`;
    }
    return `${label} fields: ${keys.join(", ")}`;
  }
  return `${label}: ${String(data).slice(0, 200)}`;
}
function htmlToMarkdown(root, baseUrl) {
  const sb = [];
  appendMarkdown(sb, root, baseUrl);
  return sb.join("").trim();
}
function appendMarkdown(sb, node, baseUrl) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = (node.textContent || "").trim();
    if (text) sb.push(text);
    return;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  const el = node;
  const tag = el.tagName.toLowerCase();
  switch (tag) {
    case "h1":
      blockTag(sb, el, baseUrl, "# ");
      break;
    case "h2":
      blockTag(sb, el, baseUrl, "## ");
      break;
    case "h3":
      blockTag(sb, el, baseUrl, "### ");
      break;
    case "h4":
      blockTag(sb, el, baseUrl, "#### ");
      break;
    case "h5":
      blockTag(sb, el, baseUrl, "##### ");
      break;
    case "h6":
      blockTag(sb, el, baseUrl, "###### ");
      break;
    case "p": {
      sb.push("\n\n");
      traverseChildren(sb, el, baseUrl);
      sb.push("\n");
      break;
    }
    case "br":
      sb.push("\n");
      break;
    case "strong":
    case "b": {
      sb.push("**");
      traverseChildren(sb, el, baseUrl);
      sb.push("**");
      break;
    }
    case "em":
    case "i": {
      sb.push("*");
      traverseChildren(sb, el, baseUrl);
      sb.push("*");
      break;
    }
    case "a": {
      const href = resolveUrl(el.getAttribute("href"), baseUrl);
      sb.push("[");
      traverseChildren(sb, el, baseUrl);
      sb.push(`](${href})`);
      break;
    }
    case "img": {
      const src = resolveUrl(el.getAttribute("src"), baseUrl);
      const alt = el.getAttribute("alt") || "";
      sb.push(`

![${alt}](${src})

`);
      break;
    }
    case "ul": {
      sb.push("\n");
      traverseChildren(sb, el, baseUrl);
      sb.push("\n");
      break;
    }
    case "ol": {
      sb.push("\n");
      traverseChildren(sb, el, baseUrl);
      sb.push("\n");
      break;
    }
    case "li": {
      sb.push("- ");
      traverseChildren(sb, el, baseUrl);
      sb.push("\n");
      break;
    }
    case "pre":
    case "code": {
      const code = el.textContent?.trim() || "";
      if (code) sb.push(`
\`\`\`
${code}
\`\`\`
`);
      break;
    }
    case "blockquote": {
      const inner = el.textContent || "";
      inner.split("\n").forEach((line) => sb.push(`> ${line}
`));
      break;
    }
    case "hr":
      sb.push("\n\n---\n\n");
      break;
    default:
      traverseChildren(sb, el, baseUrl);
      break;
  }
}
function blockTag(sb, el, baseUrl, prefix) {
  sb.push(`

${prefix}`);
  traverseChildren(sb, el, baseUrl);
  sb.push("\n");
}
function traverseChildren(sb, parent, baseUrl) {
  parent.childNodes.forEach((child) => appendMarkdown(sb, child, baseUrl));
}
function resolveUrl(raw, baseUrl) {
  if (!raw) return "";
  try {
    return new URL(raw, baseUrl).href;
  } catch {
    return raw;
  }
}

// src/tools/githubSearch.ts
var import_obsidian8 = require("obsidian");
var githubSearchTool = {
  definition: {
    type: "function",
    function: {
      name: "githubSearch",
      description: "Search GitHub via the REST API. Supports repositories, commits, issues (includes PRs), users, code, topics, and labels. Use search qualifiers like language:typescript, stars:>100, is:public, path:src, etc. Does NOT require authentication (lower rate limit without token).",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query. Supports GitHub qualifiers: language:python, stars:>100, fork:true, is:public, path:src, user:name, org:name, etc."
          },
          type: {
            type: "string",
            enum: ["repositories", "commits", "issues", "users", "code", "topics", "labels"],
            description: "Type of search (default: repositories)"
          },
          sort: {
            type: "string",
            description: "Sort field. Varies by type: repositories\u2192stars/forks/updated, issues\u2192comments/created/updated, users\u2192followers/joined/repositories. Omit for best match."
          },
          order: {
            type: "string",
            enum: ["desc", "asc"],
            description: "Sort direction (default: desc)"
          },
          page: {
            type: "integer",
            description: "Page number, 1-based (default: 1)"
          },
          per_page: {
            type: "integer",
            description: "Results per page, max 100 (default: 20)"
          }
        },
        required: ["query"]
      }
    }
  },
  execute: async (args, apiKeys) => {
    const query = args.query;
    if (!query?.trim()) return JSON.stringify({ error: "'query' is required" });
    const searchType = ["repositories", "commits", "issues", "users", "code", "topics", "labels"].includes(args.type) ? args.type : "repositories";
    const sort = args.sort;
    const order = args.order === "asc" ? "asc" : "desc";
    const page = Math.max(Number(args.page) || 1, 1);
    const perPage = Math.min(Math.max(Number(args.per_page) || 20, 1), 100);
    const params = new URLSearchParams();
    params.set("q", query.trim());
    params.set("order", order);
    params.set("page", String(page));
    params.set("per_page", String(perPage));
    if (sort) params.set("sort", sort);
    const url = `https://api.github.com/search/${searchType}?${params.toString()}`;
    try {
      const headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
      };
      if (apiKeys?.githubKey) headers["Authorization"] = `Bearer ${apiKeys.githubKey}`;
      const res = await (0, import_obsidian8.requestUrl)({ url, headers });
      if (res.status !== 200) {
        if (res.status === 401) return JSON.stringify({ error: "GitHub token invalid (HTTP 401)" });
        if (res.status === 403) {
          const remaining = res.headers["x-ratelimit-remaining"];
          if (remaining === "0") return JSON.stringify({ error: "GitHub API rate limit exceeded. Wait or use a token." });
          return JSON.stringify({ error: "GitHub API forbidden (HTTP 403)" });
        }
        if (res.status === 422) return JSON.stringify({ error: "GitHub validation failed. Check query syntax." });
        return JSON.stringify({ error: `GitHub API error: HTTP ${res.status}` });
      }
      const data = res.json;
      const totalCount = data.total_count || 0;
      const items = (data.items || []).slice(0, 20).map((item) => {
        const entry = {};
        for (const key of Object.keys(item).slice(0, 15)) {
          const val = item[key];
          if (val === null) continue;
          if (typeof val === "object" && !Array.isArray(val)) {
            entry[key] = val.login || val.name || val.full_name || val.html_url || val.description || "[object]";
          } else {
            entry[key] = val;
          }
        }
        return entry;
      });
      return JSON.stringify({ total_count: totalCount, page, per_page: perPage, results: items });
    } catch (e) {
      return JSON.stringify({ error: e.message || "GitHub request failed" });
    }
  }
};

// src/tools/arxivSearch.ts
var import_obsidian9 = require("obsidian");

// src/tools/arxivRateLimit.ts
var lastRequestTime = 0;
function enforceArxivRateLimit() {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  const wait = Math.max(0, 3e3 - elapsed);
  lastRequestTime = now + wait;
  if (wait > 0) {
    return new Promise((resolve) => setTimeout(resolve, wait));
  }
  return Promise.resolve();
}

// src/tools/arxivSearch.ts
var API_URL7 = "https://export.arxiv.org/api/query";
function parseAtomXml(xml, startOffset) {
  const entryRe = /<entry>([\s\S]*?)<\/entry>/g;
  const papers = [];
  const totalResultsMatch = xml.match(/<opensearch:totalResults[^>]*>(\d+)<\/opensearch:totalResults>/);
  const totalResults = totalResultsMatch ? parseInt(totalResultsMatch[1], 10) : 0;
  let entryMatch;
  while ((entryMatch = entryRe.exec(xml)) !== null) {
    const entry = entryMatch[1];
    const paper = {
      id: extractTag(entry, "id")?.split("/abs/").pop() || "",
      title: extractTag(entry, "title")?.replace(/\s+/g, " ").trim() || "",
      abstract: extractTag(entry, "summary")?.replace(/\s+/g, " ").trim() || "",
      authors: [],
      categories: [],
      primary_category: "",
      pdf_url: "",
      html_url: "",
      published: extractTag(entry, "published") || "",
      updated: extractTag(entry, "updated") || "",
      comment: extractTag(entry, "arxiv:comment") || ""
    };
    const authorRe = /<author>[\s\S]*?<name>([\s\S]*?)<\/name>[\s\S]*?<\/author>/g;
    let authorMatch;
    while ((authorMatch = authorRe.exec(entry)) !== null) {
      paper.authors.push(authorMatch[1].trim());
    }
    const catRe = /<category[^>]*term="([^"]+)"/g;
    let catMatch;
    while ((catMatch = catRe.exec(entry)) !== null) {
      paper.categories.push(catMatch[1]);
    }
    const primaryMatch = entry.match(/<arxiv:primary_category[^>]*term="([^"]+)"/);
    if (primaryMatch) paper.primary_category = primaryMatch[1];
    const linkRe = /<link[^>]*href="([^"]+)"[^>]*title="([^"]*)"[^>]*type="([^"]*)"[^>]*\/>/g;
    let linkMatch;
    while ((linkMatch = linkRe.exec(entry)) !== null) {
      const href = linkMatch[1];
      const title = linkMatch[2];
      const type = linkMatch[3];
      if (title === "pdf" || type === "application/pdf") paper.pdf_url = href;
      if (!paper.pdf_url && href.endsWith(".pdf")) paper.pdf_url = href;
    }
    if (!paper.html_url && paper.id) {
      paper.html_url = `https://arxiv.org/abs/${paper.id}`;
    }
    papers.push(paper);
  }
  return { totalResults, start: startOffset, papers };
}
function extractTag(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = xml.match(re);
  return m ? m[1] : void 0;
}
var arxivSearchTool = {
  definition: {
    type: "function",
    function: {
      name: "arxivSearch",
      description: "Search arXiv for academic papers. Supports fielded queries (ti:title, au:author, abs:abstract, cat:category, all:all fields), boolean operators (AND, OR, ANDNOT), and ID lookup via id_list. Use for research and academic literature discovery. IMPORTANT: arXiv requires 3 seconds between requests.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: `Search query with field prefixes (ti:, au:, abs:, cat:, all:), boolean operators (AND, OR, ANDNOT). Example: 'au:"Geoffrey Hinton" AND cat:cs.LG'. Required unless id_list is provided.`
          },
          id_list: {
            type: "string",
            description: "Comma-separated arXiv IDs, e.g. '2301.12345,2302.67890'. Required unless query is provided."
          },
          start: {
            type: "integer",
            description: "Pagination offset, 0-based (default: 0)"
          },
          max_results: {
            type: "integer",
            description: "Max results (1-50, default: 5)"
          },
          sort_by: {
            type: "string",
            enum: ["relevance", "lastUpdatedDate", "submittedDate"],
            description: "Sort field (default: relevance)"
          },
          sort_order: {
            type: "string",
            enum: ["ascending", "descending"],
            description: "Sort direction (default: descending)"
          }
        }
      }
    }
  },
  execute: async (args, _apiKeys) => {
    const query = args.query;
    const idList = args.id_list;
    if (!query?.trim() && !idList?.trim()) {
      return JSON.stringify({ error: "Either 'query' or 'id_list' is required" });
    }
    const start = Math.max(Number(args.start) || 0, 0);
    const maxResults = Math.min(Math.max(Number(args.max_results) || 5, 1), 50);
    const sortBy = ["relevance", "lastUpdatedDate", "submittedDate"].includes(args.sort_by) ? args.sort_by : "relevance";
    const sortOrder = args.sort_order === "ascending" ? "ascending" : "descending";
    await enforceArxivRateLimit();
    const params = new URLSearchParams();
    if (query?.trim()) params.set("search_query", query.trim());
    if (idList?.trim()) params.set("id_list", idList.trim());
    params.set("start", String(start));
    params.set("max_results", String(maxResults));
    params.set("sortBy", sortBy);
    params.set("sortOrder", sortOrder);
    const url = `${API_URL7}?${params.toString()}`;
    try {
      const res = await (0, import_obsidian9.requestUrl)({ url, method: "GET" });
      if (res.status !== 200) return JSON.stringify({ error: `arXiv API error: HTTP ${res.status}` });
      const xml = res.text;
      const result = parseAtomXml(xml, start);
      return JSON.stringify({
        total_results: result.totalResults,
        start: result.start,
        papers: result.papers.slice(0, maxResults).map((p) => ({
          id: p.id,
          title: p.title,
          authors: p.authors,
          abstract: p.abstract,
          categories: p.categories,
          primary_category: p.primary_category,
          pdf_url: p.pdf_url || null,
          html_url: p.html_url || null,
          published: p.published,
          updated: p.updated,
          comment: p.comment || null
        }))
      });
    } catch (e) {
      return JSON.stringify({ error: e.message || "arXiv request failed" });
    }
  }
};

// src/tools/arxivDownload.ts
var import_obsidian10 = require("obsidian");
var vaultApp2 = null;
function setArxivVaultApp(app) {
  vaultApp2 = app;
}
var arxivDownloadTool = {
  definition: {
    type: "function",
    function: {
      name: "arxivDownload",
      description: "Download an arXiv paper in HTML or PDF format. HTML returns clean article text for immediate reading. PDF is saved to vault root. Use arxivSearch first to find the paper ID.",
      parameters: {
        type: "object",
        properties: {
          paper_id: {
            type: "string",
            description: "arXiv paper ID, e.g. '2605.04948' or '2605.04948v1'. Obtain from arxivSearch results."
          },
          format: {
            type: "string",
            enum: ["html", "pdf"],
            description: "Download format: 'html' (default, returns clean article text), 'pdf' (saves to vault root)."
          },
          preview: {
            type: "boolean",
            description: "For HTML only: true (default) returns content directly. false saves to vault as .md file."
          }
        },
        required: ["paper_id"]
      }
    }
  },
  execute: async (args, _apiKeys) => {
    const paperId = args.paper_id?.trim();
    if (!paperId) return JSON.stringify({ error: "'paper_id' is required (e.g. '2605.04948' or '2605.04948v1')" });
    const format = args.format?.toLowerCase() === "pdf" ? "pdf" : "html";
    const preview = args.preview !== void 0 ? !!args.preview : format === "html";
    try {
      if (format === "html") {
        return await downloadHtml(paperId, preview);
      }
      return await downloadPdf(paperId);
    } catch (e) {
      return JSON.stringify({ error: e.message || "arXiv download failed" });
    }
  }
};
async function downloadHtml(paperId, returnContent) {
  const url = `https://arxiv.org/html/${paperId}`;
  await enforceArxivRateLimit();
  const res = await (0, import_obsidian10.requestUrl)({ url, method: "GET" });
  if (res.status !== 200) {
    return JSON.stringify({ error: `HTTP ${res.status} fetching ${url}` });
  }
  const extracted = extractArticle(res.text, paperId);
  if (returnContent) {
    return JSON.stringify({
      paper_id: paperId,
      format: "html",
      source_url: url,
      content: extracted
    });
  }
  const filename = `${paperId}.html`;
  if (vaultApp2) {
    const existing = vaultApp2.vault.getAbstractFileByPath(filename);
    if (existing) {
      await vaultApp2.vault.modify(existing, extracted);
    } else {
      await vaultApp2.vault.create(filename, extracted);
    }
  }
  return JSON.stringify({
    paper_id: paperId,
    format: "html",
    file_path: filename,
    message: `HTML saved to vault: ${filename}`
  });
}
async function downloadPdf(paperId) {
  const url = `https://arxiv.org/pdf/${paperId}`;
  await enforceArxivRateLimit();
  const res = await (0, import_obsidian10.requestUrl)({ url, method: "GET" });
  if (res.status !== 200) {
    return JSON.stringify({ error: `HTTP ${res.status} fetching ${url}` });
  }
  const data = res.arrayBuffer;
  const filename = `${paperId}.pdf`;
  if (vaultApp2) {
    const existing = vaultApp2.vault.getAbstractFileByPath(filename);
    if (existing) {
      await vaultApp2.vault.delete(existing);
    }
    await vaultApp2.vault.createBinary(filename, data);
  }
  return JSON.stringify({
    paper_id: paperId,
    format: "pdf",
    file_path: filename,
    file_size: data.byteLength,
    message: `PDF saved to vault root. Reference as [[${filename}]]`
  });
}
function extractArticle(html, _paperId) {
  let cleaned = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "").replace(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi, "").replace(/<meta[^>]*>/gi, "").replace(/<nav[\s\S]*?<\/nav>/gi, "").replace(/<header[\s\S]*?<\/header>/gi, "").replace(/<footer[\s\S]*?<\/footer>/gi, "").replace(/<noscript[\s\S]*?<\/noscript>/gi, "");
  const selectors = [
    /<article[^>]*class="[^"]*ltx_document[^"]*"[\s\S]*?<\/article>/i,
    /<div[^>]*class="[^"]*ltx_page_content[^"]*"[\s\S]*?<\/div>/i,
    /<article[^>]*>[\s\S]*?<\/article>/i,
    /<main[^>]*>[\s\S]*?<\/main>/i,
    /<div[^>]*id="content"[^>]*>[\s\S]*?<\/div>/i
  ];
  for (const sel of selectors) {
    const m = cleaned.match(sel);
    if (m) {
      return m[0];
    }
  }
  const bodyMatch = cleaned.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  return bodyMatch ? bodyMatch[1] : cleaned;
}

// src/tools/baiduBaike.ts
var import_obsidian11 = require("obsidian");
var APP_BUILDER_URL = "https://appbuilder.baidu.com/v2/baike/lemma/get_content";
var FREE_API_URL = "https://baike.baidu.com/api/openapi/BaikeLemmaCardApi";
var FREE_APPID = "379020";
var baiduBaikeTool = {
  definition: {
    type: "function",
    function: {
      name: "baiduBaike",
      description: "Query Baidu Baike (\u767E\u5EA6\u767E\u79D1) for encyclopedia entries by title. Returns structured info: abstract, card fields (birth/death/occupation etc.), related entries, and URL. Falls back to free public API if no AppBuilder key configured.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Entry name to search, e.g. '\u5218\u5FB7\u534E', '\u8427\u5B50\u54CD'."
          }
        },
        required: ["query"]
      }
    }
  },
  execute: async (args, apiKeys) => {
    const query = args.query?.trim();
    if (!query) return JSON.stringify({ error: "'query' is required" });
    const token = apiKeys?.baiduKey || "";
    if (token) {
      const result = await tryAppBuilder(query, token);
      if (result) return result;
    }
    return await queryFreeApi(query);
  }
};
async function tryAppBuilder(query, token) {
  const url = `${APP_BUILDER_URL}?search_type=lemmaTitle&search_key=${encodeURIComponent(query)}`;
  try {
    const res = await (0, import_obsidian11.requestUrl)({
      url,
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    if (res.status !== 200) return null;
    const data = res.json;
    if (data.code && data.code !== 0 && data.code !== "0") return null;
    const r = data.result;
    if (!r) return null;
    return JSON.stringify({
      source: "appbuilder",
      title: r.lemma_title,
      id: r.lemma_id,
      desc: r.lemma_desc,
      summary: r.summary,
      url: r.url,
      image: r.pic_url || null,
      relations: (r.relations || []).map((rel) => ({
        name: rel.lemma_title,
        relation: rel.relation_name,
        id: rel.lemma_id,
        image: rel.square_pic_url || null
      })),
      videos: (r.videos || []).map((v) => ({
        title: v.second_title,
        id: v.second_id,
        url: v.page_url,
        cover: v.cover_pic_url || null
      }))
    });
  } catch {
    return null;
  }
}
async function queryFreeApi(query) {
  const url = `${FREE_API_URL}?appid=${FREE_APPID}&bk_key=${encodeURIComponent(query)}`;
  try {
    const res = await (0, import_obsidian11.requestUrl)({
      url,
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json, text/plain, */*"
      }
    });
    if (res.status !== 200) {
      return JSON.stringify({ error: `Baike API HTTP ${res.status}` });
    }
    const data = res.json;
    if (!data || !data.title) {
      return JSON.stringify({ error: "No entry found for: " + query });
    }
    const fields = {};
    if (data.card) {
      for (const item of data.card) {
        const value = stripHtml(item.value?.[0] || item.format?.[0] || "");
        if (value) fields[item.name] = value;
      }
    }
    return JSON.stringify({
      source: "free_api",
      title: data.title,
      id: data.id,
      desc: data.desc || "",
      abstract: data.abstract || "",
      url: data.url || `https://baike.baidu.com/view/${data.id}.htm`,
      wapUrl: data.wapUrl || "",
      image: data.logo || null,
      fields
    });
  } catch (e) {
    return JSON.stringify({ error: e.message || "Baike request failed" });
  }
}
function stripHtml(html) {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ").replace(/\\u([a-fA-F0-9]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16))).trim();
}

// src/tools/wikipedia.ts
var import_obsidian12 = require("obsidian");
var wikipediaTool = {
  definition: {
    type: "function",
    function: {
      name: "wikipedia",
      description: "Search Wikipedia or get article content. Supports 300+ languages via lang code. Typical workflow: (1) use mode='search' to find articles by keyword, (2) pick the best title from results, (3) use mode='article' with that title to get summary, (4) if user needs more detail, use full=true for complete article text. ALWAYS prefer this over webFetch for Wikipedia URLs \u2014 it's faster, cleaner, and free.",
      parameters: {
        type: "object",
        properties: {
          mode: {
            type: "string",
            enum: ["search", "article"],
            description: "Operation mode. 'search': find articles matching a keyword, returns title + snippet + wordcount + last edited. 'article': fetch content for a specific title, returns summary (description + first paragraph + thumbnail) or full extract if full=true."
          },
          query: {
            type: "string",
            description: "Search keyword. Required for 'search' mode. Use the user's language. Examples: 'Transformer (deep learning)', '\u6728\u661F', 'Quantencomputing'."
          },
          title: {
            type: "string",
            description: "Exact article title. Required for 'article' mode. MUST be the exact title from search results \u2014 spelling, capitalization, and punctuation matter. Examples: 'Transformer_(deep_learning)', '\u6728\u661F', 'Albert_Einstein'."
          },
          lang: {
            type: "string",
            description: "Wikipedia language code. Default 'en'. Match the user's language: 'zh' for Chinese, 'ja' for Japanese, 'de' for German, 'fr' for French, etc. Search and article modes both respect this."
          },
          full: {
            type: "boolean",
            description: "For 'article' mode only. false (default): returns summary (~2-3 paragraphs + thumbnail + description). true: returns full article text (up to 30k characters). Use true only when the user explicitly wants comprehensive detail."
          },
          limit: {
            type: "integer",
            description: "For 'search' mode only. Max results to return (1-20, default 5). Use smaller values for focused queries, larger when the user wants to browse."
          }
        },
        required: ["mode"]
      }
    }
  },
  execute: async (args) => {
    const mode = args.mode || "search";
    const lang = args.lang || "en";
    const base = `https://${lang}.wikipedia.org`;
    if (mode === "search") {
      const query = args.query?.trim();
      if (!query) return JSON.stringify({ error: "'query' is required for search mode" });
      const limit2 = Math.min(Math.max(Number(args.limit) || 5, 1), 20);
      return await doSearch(base, query, limit2);
    }
    const title = args.title?.trim();
    if (!title) return JSON.stringify({ error: "'title' is required for article mode" });
    const full = !!args.full;
    return full ? await doFullExtract(base, title) : await doSummary(base, title);
  }
};
async function doSearch(base, query, limit2) {
  const url = `${base}/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=${limit2}&format=json`;
  try {
    const res = await (0, import_obsidian12.requestUrl)({ url, method: "GET" });
    if (res.status !== 200) return JSON.stringify({ error: `Wikipedia search HTTP ${res.status}` });
    const data = res.json;
    const total = data.query?.searchinfo?.totalhits || 0;
    const results = (data.query?.search || []).map((s) => ({
      title: s.title,
      snippet: stripTags(s.snippet || ""),
      wordcount: s.wordcount,
      timestamp: s.timestamp
    }));
    return JSON.stringify({ total, results });
  } catch (e) {
    return JSON.stringify({ error: e.message || "Wikipedia search failed" });
  }
}
async function doSummary(base, title) {
  const url = `${base}/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  try {
    const res = await (0, import_obsidian12.requestUrl)({ url, method: "GET" });
    if (res.status !== 200) {
      if (res.status === 404) return JSON.stringify({ error: `Article not found: ${title}` });
      return JSON.stringify({ error: `Wikipedia summary HTTP ${res.status}` });
    }
    const d = res.json;
    return JSON.stringify({
      title: d.title,
      pageid: d.pageid,
      lang: d.lang,
      description: d.description || null,
      extract: d.extract || "",
      thumbnail: d.thumbnail?.source || null,
      url: d.content_urls?.desktop?.page || `https://${new URL(base).hostname}/wiki/${encodeURIComponent(title)}`
    });
  } catch (e) {
    return JSON.stringify({ error: e.message || "Wikipedia summary failed" });
  }
}
async function doFullExtract(base, title) {
  const url = `${base}/w/api.php?action=query&prop=extracts&explaintext&exlimit=1&titles=${encodeURIComponent(title)}&format=json`;
  try {
    const res = await (0, import_obsidian12.requestUrl)({ url, method: "GET" });
    if (res.status !== 200) return JSON.stringify({ error: `Wikipedia extract HTTP ${res.status}` });
    const pages = Object.values(res.json.query?.pages || {});
    const page = pages[0];
    if (!page || page.missing) return JSON.stringify({ error: `Article not found: ${title}` });
    const extract = page.extract || "";
    return JSON.stringify({
      title: page.title,
      pageid: page.pageid,
      length: extract.length,
      extract: extract.slice(0, 3e4),
      truncated: extract.length > 3e4
    });
  } catch (e) {
    return JSON.stringify({ error: e.message || "Wikipedia extract failed" });
  }
}
function stripTags(html) {
  return html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').trim();
}

// src/tools/readNote.ts
var vaultApp3 = null;
function setReadNoteApp(app) {
  vaultApp3 = app;
}
var readNoteTool = {
  definition: {
    type: "function",
    function: {
      name: "readNote",
      description: "Read the content of an Obsidian note. Use file (wikilink-style name without extension) or path (vault-relative). Omit both to read the currently active note. Supports offset/limit for large files.",
      parameters: {
        type: "object",
        properties: {
          file: {
            type: "string",
            description: "Note name without extension (wikilink-style), e.g. 'My Note', '\u65E5\u8BB0'. Omit to read active note."
          },
          path: {
            type: "string",
            description: "Vault-relative path, e.g. 'folder/note.md'. More precise than file. Omit to read active note."
          },
          offset: {
            type: "integer",
            description: "Line number to start reading from (1-based, default 1). Use for large notes."
          },
          limit: {
            type: "integer",
            description: "Max lines to read. Omit for full note content."
          }
        }
      }
    }
  },
  execute: async (args) => {
    if (!vaultApp3) return JSON.stringify({ error: "Vault not available" });
    const fileName = args.file;
    const filePath = args.path;
    const offset = Math.max(Number(args.offset) || 1, 1);
    const limit2 = args.limit ? Number(args.limit) : void 0;
    let file = null;
    if (filePath) {
      const f = vaultApp3.vault.getAbstractFileByPath(filePath);
      if (f && f.extension === "md") {
        file = f;
      }
    }
    if (!file && fileName) {
      const clean = fileName.replace(/\.md$/, "");
      const all = vaultApp3.vault.getMarkdownFiles();
      const matches = all.filter(
        (f) => f.basename === clean || f.basename.toLowerCase() === clean.toLowerCase()
      );
      if (matches.length === 1) file = matches[0];
      else if (matches.length > 1) {
        return JSON.stringify({
          error: `Multiple notes match "${clean}". Use path instead.`,
          candidates: matches.map((f) => f.path)
        });
      }
      if (!file) {
        const ci = all.filter((f) => f.basename.toLowerCase() === clean.toLowerCase());
        if (ci.length === 1) file = ci[0];
        if (!file) {
          return JSON.stringify({ error: `Note not found: ${clean}` });
        }
      }
    }
    if (!file && !fileName && !filePath) {
      file = vaultApp3.workspace.getActiveFile();
      if (!file) return JSON.stringify({ error: "No note specified and no active note" });
    }
    if (!file) return JSON.stringify({ error: "Could not resolve note" });
    try {
      const content = await vaultApp3.vault.read(file);
      const cache = vaultApp3.metadataCache.getFileCache(file);
      let text = content;
      let totalLines = text.split("\n").length;
      let readFrom = 1;
      if (offset > 1) {
        const lines = text.split("\n");
        readFrom = Math.min(offset, lines.length);
        text = lines.slice(readFrom - 1).join("\n");
      }
      if (limit2 && limit2 > 0) {
        const lines = text.split("\n");
        text = lines.slice(0, limit2).join("\n");
      }
      return JSON.stringify({
        file: file.basename,
        path: file.path,
        offset: readFrom,
        lines: text.split("\n").length,
        totalLines,
        truncated: limit2 ? text.split("\n").length < content.split("\n").length - (readFrom - 1) : false,
        tags: (cache?.tags || []).map((t2) => t2.tag),
        properties: cache?.frontmatter || {},
        links: cache?.links?.map((l) => l.link) || [],
        embeds: cache?.embeds?.map((e) => e.link) || [],
        headings: cache?.headings?.map((h) => ({ level: h.level, text: h.heading })) || [],
        content: text
      });
    } catch (e) {
      return JSON.stringify({ error: e.message || "Read failed" });
    }
  }
};

// src/tools/webSearch.ts
var MAX_RESULTS = 20;
var SEARCH_DELAY_MS = 2e3;
function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
async function searchBaidu(query) {
  const url = `https://www.baidu.com/s?wd=${encodeURIComponent(query)}&rn=${MAX_RESULTS}`;
  try {
    const html = await fetchPage(url);
    const results = [];
    const blockRe = /<div[^>]*class="[^"]*c-container[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?=<div[^>]*class="[^"]*c-container|<div[^>]*id="page|<script|$)/gi;
    let match;
    while ((match = blockRe.exec(html)) !== null && results.length < MAX_RESULTS) {
      const block = match[1];
      const titleMatch = block.match(/<a[^>]*>([\s\S]*?)<\/a>/);
      const snippetMatch = block.match(/<span[^>]*class="[^"]*content-right_[^"]*"[^>]*>([\s\S]*?)<\/span>/) || block.match(/<div[^>]*class="[^"]*c-abstract[^"]*"[^>]*>([\s\S]*?)<\/div>/) || block.match(/<span[^>]*class="[^"]*c-color-text[^"]*"[^>]*>([\s\S]*?)<\/span>/);
      const title = stripHtml2(titleMatch?.[1] || "");
      const snippet = stripHtml2(snippetMatch?.[1] || "");
      if (title) results.push(`${title}
  ${snippet}`);
    }
    return results;
  } catch {
    return [];
  }
}
async function searchBing(query) {
  const url = `https://cn.bing.com/search?q=${encodeURIComponent(query)}&count=${MAX_RESULTS}`;
  try {
    const html = await fetchPage(url);
    const results = [];
    const blockRe = /<li[^>]*class="[^"]*b_algo[^"]*"[^>]*>([\s\S]*?)<\/li>/gi;
    let match;
    while ((match = blockRe.exec(html)) !== null && results.length < MAX_RESULTS) {
      const block = match[1];
      const titleMatch = block.match(/<a[^>]*>([\s\S]*?)<\/a>/);
      const snippetMatch = block.match(/<p[^>]*class="[^"]*b_lineclamp[^"]*"[^>]*>([\s\S]*?)<\/p>/i) || block.match(/<p[^>]*>([\s\S]*?)<\/p>/);
      const title = stripHtml2(titleMatch?.[1] || "");
      const snippet = stripHtml2(snippetMatch?.[1] || "");
      if (title) results.push(`${title}
  ${snippet}`);
    }
    return results;
  } catch {
    return [];
  }
}
function stripHtml2(text) {
  return text.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#?\w+;/g, "").replace(/\s+/g, " ").trim();
}
var webSearchTool = {
  definition: {
    type: "function",
    function: {
      name: "webSearch",
      description: "Free web search using Baidu and Bing. Requires at least 3 keywords for better results. Searches both engines for each keyword, aggregates and deduplicates results. No API key needed. 2s delay between keywords.",
      parameters: {
        type: "object",
        properties: {
          keywords: {
            type: "array",
            items: { type: "string" },
            description: "At least 3 search keyword strings. More specific keywords = better results. Example: ['AI news today', 'machine learning 2025', 'deep learning trends']"
          }
        },
        required: ["keywords"]
      }
    }
  },
  execute: async (args) => {
    const keywords = args.keywords;
    if (!keywords || keywords.length < 3) {
      return JSON.stringify({ error: "At least 3 keywords required. Use specific phrases for better results." });
    }
    const allResults = [];
    for (let i = 0; i < keywords.length; i++) {
      const kw = keywords[i].trim();
      if (!kw) continue;
      const baiduResults = await searchBaidu(kw);
      for (const r of baiduResults) {
        allResults.push({ source: "baidu", keyword: kw, result: r });
      }
      const bingResults = await searchBing(kw);
      for (const r of bingResults) {
        allResults.push({ source: "bing", keyword: kw, result: r });
      }
      if (i < keywords.length - 1) {
        await delay(SEARCH_DELAY_MS);
      }
    }
    if (allResults.length === 0) {
      return JSON.stringify({ error: "No results found. Try different keywords." });
    }
    const grouped = {};
    for (const r of allResults) {
      if (!grouped[r.keyword]) grouped[r.keyword] = [];
      grouped[r.keyword].push({ source: r.source, result: r.result });
    }
    return JSON.stringify({
      total: allResults.length,
      keywords: Object.keys(grouped).length,
      results: grouped
    });
  }
};

// src/tools/createNote.ts
var vaultApp4 = null;
function setCreateNoteApp(app) {
  vaultApp4 = app;
}
var yamlEnabled = true;
var noteTemplate = "";
function setCreateNoteConfig(cfg) {
  yamlEnabled = cfg.yamlEnabled;
  noteTemplate = cfg.noteTemplate;
}
function stripFrontmatter(content) {
  return content.replace(/^---[\s\S]*?---\n*/, "");
}
var createNoteTool = {
  definition: {
    type: "function",
    function: {
      name: "createNote",
      description: "Create a new markdown note in the vault. Specify file name (without .md), optional folder path, and markdown content. Returns the path of the created note.",
      parameters: {
        type: "object",
        properties: {
          file: {
            type: "string",
            description: "Note name without extension, e.g. 'Meeting Notes', 'Project Plan'. Required."
          },
          folder: {
            type: "string",
            description: "Folder path relative to vault root, e.g. 'Projects', 'Daily/2025'. Created if it doesn't exist. Omit for vault root."
          },
          content: {
            type: "string",
            description: "Markdown content for the note. Supports full markdown: headings, wikilinks, frontmatter, etc. Omit to create an empty note."
          }
        },
        required: ["file"]
      }
    }
  },
  execute: async (args) => {
    if (!vaultApp4) return JSON.stringify({ error: "Vault not available" });
    const fileName = args.file;
    const folder = args.folder;
    const rawContent = args.content || "";
    if (!fileName || !fileName.trim()) {
      return JSON.stringify({ error: "file name is required" });
    }
    const cleanName = fileName.replace(/\.md$/, "").trim();
    const disallowed = /[\\/:*?"<>|#^\[\]]/;
    if (disallowed.test(cleanName)) {
      return JSON.stringify({ error: `Invalid file name: ${cleanName}. Avoid characters: \\ / : * ? " < > | # ^ [ ]` });
    }
    const folderPath = folder?.replace(/^\/+|\/+$/g, "").trim();
    try {
      if (folderPath) {
        const parts = folderPath.split("/");
        let currentPath = "";
        const adapter = vaultApp4.vault.adapter;
        for (const part of parts) {
          currentPath += (currentPath ? "/" : "") + part;
          if (!await adapter.exists(currentPath)) {
            await vaultApp4.vault.createFolder(currentPath);
          }
        }
      }
      const notePath = folderPath ? `${folderPath}/${cleanName}.md` : `${cleanName}.md`;
      const existing = vaultApp4.vault.getAbstractFileByPath(notePath);
      if (existing) {
        return JSON.stringify({ error: `Note already exists: ${notePath}` });
      }
      let finalContent = rawContent;
      if (noteTemplate) {
        const tf = vaultApp4.vault.getAbstractFileByPath(noteTemplate);
        if (tf && tf.extension === "md") {
          const templateContent = await vaultApp4.vault.read(tf);
          finalContent = stripFrontmatter(finalContent.trimStart());
          finalContent = finalContent.replace(/^#\s[^\n]+\n?/, "").trimStart();
          if (!yamlEnabled) {
            finalContent = stripFrontmatter(templateContent) + finalContent;
          } else {
            finalContent = templateContent + finalContent;
          }
        }
      }
      if (!yamlEnabled) {
        finalContent = stripFrontmatter(finalContent);
      }
      await vaultApp4.vault.create(notePath, finalContent);
      return JSON.stringify({
        success: true,
        path: notePath,
        file: cleanName,
        folder: folderPath || "/",
        size: finalContent.length
      });
    } catch (e) {
      return JSON.stringify({ error: e.message || "Create failed" });
    }
  }
};

// src/tools/editNote.ts
var vaultApp5 = null;
function setEditNoteApp(app) {
  vaultApp5 = app;
}
var permissionTag = "#notebrain";
function setEditNoteConfig(cfg) {
  permissionTag = cfg.permissionTag || "#notebrain";
}
function hasPermissionTag(file) {
  if (!vaultApp5) return false;
  const cache = vaultApp5.metadataCache.getFileCache(file);
  const inlineTags = (cache?.tags || []).map((t2) => t2.tag);
  const fmTags = cache?.frontmatter?.tags?.map((t2) => String(t2)) || [];
  const allTags = [...inlineTags, ...fmTags];
  const barePermission = permissionTag.replace(/^#/, "");
  return allTags.some((t2) => t2 === permissionTag || t2 === barePermission || t2 === `#${barePermission}`);
}
function resolveFile(args) {
  if (!vaultApp5) return null;
  const fileName = args.file;
  const filePath = args.path;
  if (filePath) {
    const f = vaultApp5.vault.getAbstractFileByPath(filePath);
    if (f && f.extension === "md") return f;
  }
  if (fileName) {
    const clean = fileName.replace(/\.md$/, "");
    const all = vaultApp5.vault.getMarkdownFiles();
    const matches = all.filter((f) => f.basename === clean);
    if (matches.length === 1) return matches[0];
    if (matches.length > 1) return null;
  }
  return null;
}
var editNoteTool = {
  definition: {
    type: "function",
    function: {
      name: "editNote",
      description: "Edit an existing note. Supports replace (find/replace text), append (add to end), and prepend (add to start). The note must have the configured permission tag.",
      parameters: {
        type: "object",
        properties: {
          file: {
            type: "string",
            description: "Note name without extension, e.g. 'My Note'. Use with path if ambiguous."
          },
          path: {
            type: "string",
            description: "Vault-relative path, e.g. 'folder/note.md'. More precise than file."
          },
          mode: {
            type: "string",
            enum: ["replace", "append", "prepend"],
            description: "Edit mode: 'replace' finds and replaces text, 'append' adds to end, 'prepend' adds to start."
          },
          search: {
            type: "string",
            description: "Text to find (for replace mode). Must match exactly once in the note."
          },
          replace: {
            type: "string",
            description: "Replacement text (for replace mode). Use an empty string to delete the matched text."
          },
          content: {
            type: "string",
            description: "Content to add (for append/prepend mode). Added with a newline separator."
          }
        },
        required: ["mode"]
      }
    }
  },
  execute: async (args) => {
    if (!vaultApp5) return JSON.stringify({ error: "Vault not available" });
    const mode = args.mode;
    const search = args.search;
    const replace = args.replace;
    const content = args.content;
    const file = resolveFile(args);
    if (!file) return JSON.stringify({ error: "Note not found. Provide a valid file name or path." });
    if (!hasPermissionTag(file)) {
      return JSON.stringify({
        error: `Permission denied. This note does not have the required tag "${permissionTag}". Add "${permissionTag}" to the note body or frontmatter tags to grant edit access.`
      });
    }
    try {
      if (mode === "replace") {
        if (search === void 0) {
          return JSON.stringify({ error: "search is required for replace mode" });
        }
        const result = await vaultApp5.vault.process(file, (current) => {
          const idx = current.indexOf(search);
          if (idx === -1) return current;
          const secondIdx = current.indexOf(search, idx + 1);
          if (secondIdx !== -1) {
            return current;
          }
          return current.slice(0, idx) + (replace ?? "") + current.slice(idx + search.length);
        });
        const replaced = !result.includes(search);
        return JSON.stringify({
          success: replaced,
          path: file.path,
          file: file.basename,
          mode: "replace",
          replaced,
          message: replaced ? "Text replaced." : "Search text not found or not unique. Try a more specific search string."
        });
      }
      if (mode === "append") {
        if (!content) return JSON.stringify({ error: "content is required for append mode" });
        await vaultApp5.vault.process(file, (current) => {
          const trimmed = current.trimEnd();
          return trimmed + "\n\n" + content + "\n";
        });
        return JSON.stringify({
          success: true,
          path: file.path,
          file: file.basename,
          mode: "append"
        });
      }
      if (mode === "prepend") {
        if (!content) return JSON.stringify({ error: "content is required for prepend mode" });
        await vaultApp5.vault.process(file, (current) => {
          const trimmed = current.trimStart();
          return content + "\n\n" + trimmed;
        });
        return JSON.stringify({
          success: true,
          path: file.path,
          file: file.basename,
          mode: "prepend"
        });
      }
      return JSON.stringify({ error: `Unknown mode: ${mode}` });
    } catch (e) {
      return JSON.stringify({ error: e.message || "Edit failed" });
    }
  }
};

// src/tools/getBacklinks.ts
var vaultApp6 = null;
function setGetBacklinksApp(app) {
  vaultApp6 = app;
}
function resolveFile2(args) {
  if (!vaultApp6) return null;
  const filePath = args.path;
  const fileName = args.file;
  if (filePath) {
    const f = vaultApp6.vault.getAbstractFileByPath(filePath);
    if (f && f.extension === "md") return f;
  }
  if (fileName) {
    const clean = fileName.replace(/\.md$/, "");
    const all = vaultApp6.vault.getMarkdownFiles();
    const matches = all.filter((f) => f.basename === clean);
    if (matches.length === 1) return matches[0];
    const ci = all.filter((f) => f.basename.toLowerCase() === clean.toLowerCase());
    if (ci.length === 1) return ci[0];
  }
  return null;
}
var getBacklinksTool = {
  definition: {
    type: "function",
    function: {
      name: "getBacklinks",
      description: "Get all notes that link to a given note (backlinks). Specify the target note by file name or path. Omit both to use the currently active note. Returns linking note paths and the context around each link.",
      parameters: {
        type: "object",
        properties: {
          file: {
            type: "string",
            description: "Target note name without extension. Omit to use active note."
          },
          path: {
            type: "string",
            description: "Vault-relative path of the target note. More precise than file."
          }
        }
      }
    }
  },
  execute: async (args) => {
    if (!vaultApp6) return JSON.stringify({ error: "Vault not available" });
    let file = resolveFile2(args);
    if (!file && !args.file && !args.path) {
      file = vaultApp6.workspace.getActiveFile();
    }
    if (!file) return JSON.stringify({ error: "Note not found. Provide a valid file name or path." });
    try {
      const targetPath = file.path;
      const result = [];
      const allFiles = vaultApp6.vault.getMarkdownFiles();
      for (const src of allFiles) {
        if (src.path === targetPath) continue;
        const cache = vaultApp6.metadataCache.getFileCache(src);
        if (!cache?.links) continue;
        for (const link of cache.links) {
          const resolved = vaultApp6.metadataCache.getFirstLinkpathDest(link.link, src.path);
          if (resolved?.path === targetPath) {
            const line = link.position?.start?.line ?? 0;
            result.push({
              file: src.basename,
              path: src.path,
              displayText: link.displayText || link.link,
              line: line + 1
            });
            break;
          }
        }
      }
      return JSON.stringify({
        file: file.basename,
        path: file.path,
        backlinks: result,
        count: result.length
      });
    } catch (e) {
      return JSON.stringify({ error: e.message || "Failed to get backlinks" });
    }
  }
};

// src/tools/listFolder.ts
var vaultApp7 = null;
function setListFolderApp(app) {
  vaultApp7 = app;
}
var listFolderTool = {
  definition: {
    type: "function",
    function: {
      name: "listFolder",
      description: "List the contents of a vault folder. Shows markdown files, other files, and subfolders. Use this to browse vault structure or explore a directory. Omit path for vault root.",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description: "Folder path relative to vault root. Omit or use '/' for root. e.g. 'Daily', 'Projects/Active'."
          }
        }
      }
    }
  },
  execute: async (args) => {
    if (!vaultApp7) return JSON.stringify({ error: "Vault not available" });
    let folderPath = args.path || "";
    folderPath = folderPath.replace(/^\/+|\/+$/g, "").trim();
    try {
      const adapter = vaultApp7.vault.adapter;
      const listPath = folderPath || "/";
      const exists = await adapter.exists(listPath);
      if (!exists) return JSON.stringify({ error: `Folder not found: ${folderPath || "/"}` });
      const list = await adapter.list(listPath);
      const mdFiles = [];
      const otherFiles = [];
      const folders = [];
      for (const f of list.files) {
        if (f.endsWith(".md")) mdFiles.push(f);
        else otherFiles.push(f);
      }
      for (const d of list.folders) {
        if (!d.startsWith(".")) folders.push(d);
      }
      return JSON.stringify({
        path: folderPath || "/",
        markdownFiles: mdFiles,
        otherFiles: otherFiles.length > 0 ? otherFiles : void 0,
        folders,
        totalFiles: list.files.length,
        totalFolders: list.folders.length
      });
    } catch (e) {
      return JSON.stringify({ error: e.message || "Failed to list folder" });
    }
  }
};

// src/tools/cnNews.ts
var SITES = [
  { name: "\u65B0\u534E\u7F51", url: "https://www.xinhuanet.com", tier: 1 },
  { name: "\u4EBA\u6C11\u7F51", url: "https://www.people.com.cn", tier: 1 },
  { name: "\u592E\u89C6\u7F51", url: "https://www.cctv.com", tier: 1 },
  { name: "\u7F51\u6613\u65B0\u95FB", url: "https://news.163.com", tier: 1 },
  { name: "\u65B0\u6D6A\u65B0\u95FB", url: "https://news.sina.com.cn", tier: 1 },
  { name: "\u4E2D\u56FD\u519B\u7F51", url: "http://www.81.cn", tier: 1 },
  { name: "\u5357\u65B9\u7F51", url: "https://www.southcn.com", tier: 1 },
  { name: "\u7EA2\u7F51", url: "https://www.rednet.cn", tier: 1 },
  { name: "\u89C2\u5BDF\u8005\u7F51", url: "https://www.guancha.cn", tier: 1 },
  { name: "\u5149\u660E\u7F51", url: "https://www.gmw.cn", tier: 1 },
  { name: "\u4E2D\u56FD\u65B0\u95FB\u7F51", url: "https://www.chinanews.com.cn", tier: 2 },
  { name: "\u51E4\u51F0\u7F51", url: "https://www.ifeng.com", tier: 2 },
  { name: "\u4E2D\u56FD\u7ECF\u6D4E\u7F51", url: "https://www.ce.cn", tier: 2 },
  { name: "\u4E2D\u56FD\u65E5\u62A5\u7F51", url: "https://www.chinadaily.com.cn", tier: 2 },
  { name: "\u6F8E\u6E43\u65B0\u95FB", url: "https://www.thepaper.cn", tier: 2 },
  { name: "\u8D22\u65B0\u7F51", url: "https://www.caixin.com", tier: 2 },
  { name: "\u56FD\u9645\u5728\u7EBF", url: "https://www.cri.cn", tier: 2 },
  { name: "\u4EBA\u6C11\u653F\u534F\u7F51", url: "https://www.rmzxb.com.cn", tier: 2 },
  { name: "\u534E\u9F99\u7F51", url: "https://www.cqnews.net", tier: 2 },
  { name: "\u9F50\u9C81\u7F51", url: "https://www.iqilu.com", tier: 2 },
  { name: "\u5927\u6CB3\u7F51", url: "https://www.dahe.cn", tier: 2 },
  { name: "\u641C\u72D0\u65B0\u95FB", url: "https://news.sohu.com", tier: 2 },
  { name: "\u6D77\u5916\u7F51", url: "https://www.haiwainet.cn", tier: 2 }
];
var CONCURRENCY = 3;
var MAX_ARTICLES_PER_SITE = 3;
var ARTICLE_TRUNCATE = 500;
function stripHtml3(text) {
  return text.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&#?\w+;/g, "").replace(/\s+/g, " ").trim();
}
function resolveUrl2(raw, baseUrl) {
  if (!raw) return "";
  try {
    return new URL(raw, baseUrl).href;
  } catch {
    return raw;
  }
}
function hasChinese(text) {
  return /[一-鿿]/.test(text);
}
var NON_NEWS_RE = /公开课|邮箱|VIP|付费|下载|客户端|APP|服务平台|辟谣平台|政府网站|国务院|网上办事|政务公开|政务服务|注册|登录/;
function looksLikeArticle(href, baseUrl) {
  const path = href.replace(baseUrl, "").replace(/^https?:\/\/[^/]+/, "");
  if (/\d{4}[-/]?\d{1,2}[-/]?\d{1,2}/.test(path)) return true;
  if (/\/c\.html|\/detail\/|\/news\/|\/a\/|article\/|[a-z]\d{5,}/i.test(path)) return true;
  if (/\d{5,}/.test(path)) return true;
  return false;
}
function extractLinks(html, baseUrl) {
  const stripped = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<nav[\s\S]*?<\/nav>/gi, "").replace(/<footer[\s\S]*?<\/footer>/gi, "");
  const links = [];
  const seen = /* @__PURE__ */ new Set();
  const linkRe = /<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = linkRe.exec(stripped)) !== null) {
    const text = stripHtml3(match[2]);
    if (text.length < 8 || text.length > 100) continue;
    if (!hasChinese(text)) continue;
    if (NON_NEWS_RE.test(text)) continue;
    const href = resolveUrl2(match[1], baseUrl);
    if (!href || !/^https?:\/\//.test(href) || href === baseUrl) continue;
    if (seen.has(href)) continue;
    seen.add(href);
    links.push({ text, href });
    if (links.length >= 30) break;
  }
  links.sort((a, b) => {
    const aArt = looksLikeArticle(a.href, baseUrl) ? 0 : 1;
    const bArt = looksLikeArticle(b.href, baseUrl) ? 0 : 1;
    return aArt - bArt;
  });
  return links;
}
function extractArticleText(html) {
  const stripped = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<nav[\s\S]*?<\/nav>/gi, "").replace(/<footer[\s\S]*?<\/footer>/gi, "").replace(/<header[\s\S]*?<\/header>/gi, "");
  const articleMatch = stripped.match(/(?:<article[^>]*>|<main[^>]*>|<div[^>]*class="[^"]*(?:article|content|post|entry)[^"]*"[^>]*>)([\s\S]*?)(?:<\/article>|<\/main>|<\/div>)/i);
  const body = articleMatch ? articleMatch[1] : stripped;
  return stripHtml3(body).slice(0, ARTICLE_TRUNCATE);
}
function delay2(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
var cnNewsTool = {
  definition: {
    type: "function",
    function: {
      name: "cnNews",
      description: "Fetch news from 23 major Chinese news sites. Gets homepage headlines + follows top article sub-links to extract content summaries. No API key needed.",
      parameters: {
        type: "object",
        properties: {
          tier: {
            type: "integer",
            description: "Filter by tier: 1 for top 10 sites, 2 for additional 13 sites. Omit for all 23."
          },
          maxArticles: {
            type: "integer",
            description: "Max article sub-links to follow per site (default 3, max 5)."
          }
        }
      }
    }
  },
  execute: async (args) => {
    const tier = args.tier ? Number(args.tier) : 0;
    const maxArticles = Math.min(Number(args.maxArticles) || MAX_ARTICLES_PER_SITE, 5);
    const sites = tier ? SITES.filter((s) => s.tier === tier) : SITES;
    const results = [];
    for (let i = 0; i < sites.length; i += CONCURRENCY) {
      const batch = sites.slice(i, i + CONCURRENCY);
      const batchResults = await Promise.all(
        batch.map(async (site) => {
          try {
            const html = await fetchPage(site.url);
            const links = extractLinks(html, site.url);
            const headlines = links.slice(0, 20).map((l) => l.text);
            const toFetch = links.slice(0, maxArticles);
            const articles = await Promise.all(
              toFetch.map(async (link) => {
                try {
                  const articleHtml = await fetchPage(link.href);
                  return { title: link.text, url: link.href, summary: extractArticleText(articleHtml) };
                } catch {
                  return { title: link.text, url: link.href, summary: "(fetch failed)" };
                }
              })
            );
            return { site: site.name, url: site.url, tier: site.tier, headlines, articles };
          } catch (e) {
            return { site: site.name, url: site.url, tier: site.tier, headlines: [], articles: [], error: e.message };
          }
        })
      );
      results.push(...batchResults);
      if (i + CONCURRENCY < sites.length) await delay2(500);
    }
    const byTier = {};
    for (const r of results) {
      if (!byTier[r.tier]) byTier[r.tier] = [];
      byTier[r.tier].push(r);
    }
    const totalArticles = results.reduce((s, r) => s + r.articles.length, 0);
    let output = `Total sites: ${results.length}, headlines: ${results.reduce((s, r) => s + r.headlines.length, 0)}, articles followed: ${totalArticles}

`;
    for (const t2 of [1, 2]) {
      if (!byTier[t2]) continue;
      output += `== Tier ${t2} ==
`;
      for (const r of byTier[t2]) {
        if (r.error) {
          output += `${r.site}: ERROR - ${r.error}
`;
          continue;
        }
        output += `
${r.site}:
`;
        for (const h of r.headlines) {
          output += `  - ${h}
`;
        }
        if (r.articles.length > 0) {
          output += `  [Article summaries]:
`;
          for (const a of r.articles) {
            output += `    * ${a.title}
      ${a.summary}
`;
          }
        }
      }
      output += "\n";
    }
    return output;
  }
};

// src/tools/registry.ts
var toolRegistry = /* @__PURE__ */ new Map();
var toolApiKeys = {};
var disabledTools = /* @__PURE__ */ new Set();
function setToolApiKeys(keys) {
  toolApiKeys = keys;
}
function setDisabledTools(tools) {
  disabledTools = new Set(tools);
}
function registerTool(name, tool) {
  toolRegistry.set(name, tool);
}
function getToolDefinitions() {
  return Array.from(toolRegistry.entries()).filter(([name]) => !disabledTools.has(name)).map(([, t2]) => t2.definition);
}
function getAllTools() {
  const result = /* @__PURE__ */ new Map();
  for (const [name, tool] of toolRegistry) {
    if (!disabledTools.has(name)) result.set(name, tool);
  }
  return result;
}
function registerAllBuiltinTools() {
  registerTool("getCurrentTime", getCurrentTimeTool);
  registerTool("searchNotes", searchNotesTool);
  registerTool("tavilySearch", tavilySearchTool);
  registerTool("tavilyExtract", tavilyExtractTool);
  registerTool("tavilyMap", tavilyMapTool);
  registerTool("tavilyCrawl", tavilyCrawlTool);
  registerTool("tavilyResearch", tavilyResearchTool);
  registerTool("tavilyResearchGet", tavilyResearchGetTool);
  registerTool("webFetch", webFetchTool);
  registerTool("githubSearch", githubSearchTool);
  registerTool("arxivSearch", arxivSearchTool);
  registerTool("arxivDownload", arxivDownloadTool);
  registerTool("baiduBaike", baiduBaikeTool);
  registerTool("wikipedia", wikipediaTool);
  registerTool("readNote", readNoteTool);
  registerTool("createNote", createNoteTool);
  registerTool("editNote", editNoteTool);
  registerTool("getBacklinks", getBacklinksTool);
  registerTool("listFolder", listFolderTool);
  registerTool("webSearch", webSearchTool);
  registerTool("cnNews", cnNewsTool);
}

// src/settings/settings.ts
var import_obsidian13 = require("obsidian");

// src/settings/i18n.ts
var zh = {
  // Tabs
  "tab.basic": "\u57FA\u7840",
  "tab.model": "\u6A21\u578B",
  "tab.tools": "\u5DE5\u5177",
  "tab.note": "\u7B14\u8BB0",
  // Basic
  "basic.language": "\u8BED\u8A00",
  "basic.languageDesc": "\u8BBE\u7F6E\u754C\u9762\u663E\u793A\u8BED\u8A00\u3002",
  "basic.notebrainMdPath": "NOTEBRAIN.md \u8DEF\u5F84",
  "basic.notebrainMdPathDesc": "\u9009\u62E9 NOTEBRAIN.md \u7684\u5B58\u653E\u4F4D\u7F6E\u3002\u8BE5\u6587\u4EF6\u5B58\u50A8 AI \u7684\u884C\u4E3A\u6307\u5357\u548C vault \u7ED3\u6784\u8BF4\u660E\u3002",
  "basic.writeFrequency": "\u5199\u5165\u9891\u7387",
  "basic.writeFrequencyDesc": "\u6D41\u5F0F\u8F93\u51FA\u65F6\u6587\u4EF6\u5199\u5165\u95F4\u9694(\u6BEB\u79D2)\u3002\u8D8A\u4F4E\u8D8A\u6D41\u7545\u4F46CPU\u5360\u7528\u66F4\u9AD8\u3002\u9ED8\u8BA4: 80ms\u3002",
  // Model
  "model.apiKey": "API \u5BC6\u94A5",
  "model.apiKeyDesc": "DeepSeek API key\uFF0C\u4ECE platform.deepseek.com \u83B7\u53D6",
  "model.baseUrl": "Base URL",
  "model.baseUrlDesc": "API \u7AEF\u70B9\u5730\u5740",
  "model.model": "\u6A21\u578B",
  "model.modelDesc": "DeepSeek \u6A21\u578B",
  "model.available": "\u53EF\u7528",
  "model.modelPro": "deepseek-v4-pro (\u65D7\u8230)",
  "model.modelFlash": "deepseek-v4-flash (\u8F7B\u91CF)",
  "model.thinking": "\u601D\u8003\u6A21\u5F0F",
  "model.thinkingDesc": "\u542F\u7528\u63A8\u7406/\u601D\u8003\u6A21\u5F0F(\u5728\u7B14\u8BB0\u4E2D\u4EE5 %%\u6CE8\u91CA%% \u5F62\u5F0F\u8F93\u51FA)",
  "model.reasoningEffort": "\u601D\u8003\u5F3A\u5EA6",
  "model.reasoningEffortDesc": "\u601D\u8003\u5F3A\u5EA6",
  "model.temperature": "Temperature",
  "model.temperatureDesc": "\u521B\u9020\u529B\u6C34\u5E73(0-2)\u3002\u4EC5\u5728\u5173\u95ED\u601D\u8003\u6A21\u5F0F\u65F6\u751F\u6548\u3002\u9ED8\u8BA4: 0.7\u3002",
  // Note
  "note.yaml": "\u542F\u7528 YAML",
  "note.yamlDesc": "\u5173\u95ED\u540E\uFF0CAI \u88AB\u7981\u6B62\u521B\u5EFA\u542B YAML frontmatter \u7684\u7B14\u8BB0\u3002\u751F\u6210\u5185\u5BB9\u4E2D\u7684 frontmatter \u4F1A\u88AB\u81EA\u52A8\u5265\u79BB\u3002",
  "note.editPermissionTag": "\u7F16\u8F91\u6743\u9650\u6807\u7B7E",
  "note.editPermissionTagDesc": "\u53EA\u6709\u5E26\u6709\u6B64\u6807\u7B7E\u7684\u7B14\u8BB0\u624D\u5141\u8BB8 AI \u7F16\u8F91\u3002\u5728\u7B14\u8BB0\u6B63\u6587\u6216 frontmatter tags \u4E2D\u6DFB\u52A0\u3002",
  "note.noteTemplate": "\u7B14\u8BB0\u6A21\u677F",
  "note.noteTemplateDesc": "\u9009\u62E9\u4E00\u7BC7\u7B14\u8BB0\u4F5C\u4E3A\u65B0\u7B14\u8BB0\u7684\u6A21\u677F\u3002\u521B\u5EFA\u7684\u7B14\u8BB0\u5C06\u9075\u5FAA\u6A21\u677F\u7ED3\u6784\u3002",
  "note.templateNone": "(\u65E0)",
  // Tools
  "tools.apiKeys": "API \u5BC6\u94A5",
  "tools.availableTools": "\u53EF\u7528\u5DE5\u5177",
  "tools.tavilyKey": "Tavily API Key",
  "tools.tavilyKeyDesc": "\u7F51\u9875\u641C\u7D22\u9700\u8981\u3002\u5728 tavily.com \u83B7\u53D6",
  "tools.githubKey": "GitHub Token",
  "tools.githubKeyDesc": "\u53EF\u9009\u3002\u4E2A\u4EBA\u8BBF\u95EE\u4EE4\u724C\uFF0C\u7528\u4E8E\u63D0\u9AD8 API \u901F\u7387\u9650\u5236 (github.com/settings/tokens)",
  "tools.baiduKey": "Baidu AppBuilder Key",
  "tools.baiduKeyDesc": "\u767E\u5EA6\u767E\u79D1\u67E5\u8BE2\u9700\u8981\u3002\u5728 appbuilder.baidu.com \u83B7\u53D6",
  "tools.headlessBrowser": "Headless Browser Endpoint",
  "tools.headlessBrowserDesc": "\u53EF\u9009\u3002\u81EA\u5B9A\u4E49\u65E0\u5934\u6D4F\u89C8\u5668\u7AEF\u70B9(\u5982 browserless)\u3002\u7559\u7A7A\u5219\u4F7F\u7528\u5185\u7F6E\u514D\u8D39\u6E32\u67D3\u5668(Jina AI)\u3002",
  // Tool names (display)
  "toolName.searchNotes": "\u641C\u7D22\u7B14\u8BB0",
  "toolName.readNote": "\u8BFB\u53D6\u7B14\u8BB0",
  "toolName.listFolder": "\u6D4F\u89C8\u6587\u4EF6\u5939",
  "toolName.getBacklinks": "\u53CD\u5411\u94FE\u63A5",
  "toolName.createNote": "\u521B\u5EFA\u7B14\u8BB0",
  "toolName.editNote": "\u7F16\u8F91\u7B14\u8BB0",
  "toolName.getCurrentTime": "\u83B7\u53D6\u65F6\u95F4",
  "toolName.cnNews": "\u4E2D\u56FD\u65B0\u95FB\u7F51\u805A\u5408",
  "toolName.webSearch": "\u767E\u5EA6\u5FC5\u5E94\u641C\u7D22",
  "toolName.webFetch": "\u7F51\u9875\u6293\u53D6",
  "toolName.tavilySearch": "\u7F51\u9875\u641C\u7D22",
  "toolName.tavilyExtract": "\u5185\u5BB9\u63D0\u53D6",
  "toolName.tavilyMap": "\u7F51\u7AD9\u5730\u56FE",
  "toolName.tavilyCrawl": "\u7F51\u7AD9\u722C\u53D6",
  "toolName.tavilyResearch": "\u6DF1\u5EA6\u7814\u7A76",
  "toolName.tavilyResearchGet": "\u83B7\u53D6\u7814\u7A76\u62A5\u544A",
  "toolName.githubSearch": "GitHub \u641C\u7D22",
  "toolName.arxivSearch": "arXiv \u641C\u7D22",
  "toolName.arxivDownload": "arXiv \u4E0B\u8F7D",
  "toolName.baiduBaike": "\u767E\u5EA6\u767E\u79D1",
  "toolName.wikipedia": "\u7EF4\u57FA\u767E\u79D1",
  // Tool descriptions
  "tool.searchNotes": "\u641C\u7D22\u7B14\u8BB0\u5E93: \u5185\u5BB9\u3001\u6807\u7B7E\u3001\u6587\u4EF6\u540D\u3001\u8DEF\u5F84\u3001\u5C5E\u6027\u3001\u6B63\u5219\u3002",
  "tool.readNote": "\u6309\u540D\u79F0\u6216\u8DEF\u5F84\u8BFB\u53D6\u7B14\u8BB0\u5185\u5BB9\u3002\u8FD4\u56DE\u5143\u6570\u636E\u3001\u94FE\u63A5\u3001\u6807\u9898\u3002",
  "tool.listFolder": "\u5217\u51FA\u6587\u4EF6\u5939\u5185\u5BB9(\u6587\u4EF6\u3001\u5B50\u6587\u4EF6\u5939)\u3002\u6D4F\u89C8\u7B14\u8BB0\u5E93\u7ED3\u6784\u3002",
  "tool.getBacklinks": "\u83B7\u53D6\u6307\u5411\u6307\u5B9A\u7B14\u8BB0\u7684\u6240\u6709\u53CD\u5411\u94FE\u63A5\u3002",
  "tool.createNote": "\u521B\u5EFA\u65B0\u7B14\u8BB0\u3002\u4EC5\u5728\u7528\u6237\u660E\u786E\u8981\u6C42\u65F6\u4F7F\u7528\u3002",
  "tool.editNote": "\u7F16\u8F91\u73B0\u6709\u7B14\u8BB0(\u66FF\u6362\u3001\u8FFD\u52A0\u3001\u524D\u7F6E)\u3002\u4EC5\u5728\u7528\u6237\u660E\u786E\u8981\u6C42\u65F6\u4F7F\u7528\u3002",
  "tool.getCurrentTime": "\u83B7\u53D6\u5F53\u524D\u65E5\u671F\u548C\u65F6\u95F4\uFF0C\u652F\u6301\u65F6\u533A\u3002",
  "tool.cnNews": "\u6293\u53D623\u5BB6\u4E2D\u56FD\u4E3B\u6D41\u65B0\u95FB\u7F51\u7AD9\u9996\u9875\u6807\u9898\uFF08\u65B0\u534E\u7F51\u3001\u4EBA\u6C11\u7F51\u3001\u592E\u89C6\u7B49\uFF09\u3002\u53EF\u9009tier\u53C2\u6570\u7B5B\u9009\u3002",
  "tool.webSearch": "\u514D\u8D39\u7F51\u9875\u641C\u7D22(\u767E\u5EA6+\u5FC5\u5E94)\u3002\u81F3\u5C113\u4E2A\u5173\u952E\u8BCD\uFF0C\u6BCF\u4E2A\u8BCD\u641C\u53CC\u5F15\u64CE\uFF0C\u65E0\u9700 API Key\u3002",
  "tool.webFetch": "\u4ECE\u4EFB\u610F URL \u63D0\u53D6\u53EF\u8BFB\u5185\u5BB9\u3002renderJs=true \u53EF\u6E32\u67D3 JS \u9875\u9762(\u5185\u7F6E\u514D\u8D39\u6E32\u67D3\u5668\uFF0C\u65E0\u9700\u914D\u7F6E)\u3002",
  "tool.tavilySearch": "\u901A\u8FC7 Tavily \u8FDB\u884C\u7F51\u9875\u641C\u7D22\u3002\u9700\u8981\u4E0A\u65B9 API Key\u3002",
  "tool.tavilyExtract": "\u4ECE URL \u63D0\u53D6\u5E72\u51C0\u5185\u5BB9\u3002\u9700\u8981\u4E0A\u65B9 API Key\u3002",
  "tool.tavilyMap": "\u53D1\u73B0\u7F51\u7AD9\u7684 URL \u7ED3\u6784\u3002\u9700\u8981\u4E0A\u65B9 API Key\u3002",
  "tool.tavilyCrawl": "\u6309\u6DF1\u5EA6/\u5E7F\u5EA6\u722C\u53D6\u7F51\u7AD9\u3002\u9700\u8981\u4E0A\u65B9 API Key\u3002",
  "tool.tavilyResearch": "\u591A\u6B65\u6DF1\u5EA6\u7814\u7A76\u3002\u6700\u957F\u8F6E\u8BE2 3 \u5206\u949F\u3002\u9700\u8981\u4E0A\u65B9 API Key\u3002",
  "tool.tavilyResearchGet": "\u901A\u8FC7 request_id \u83B7\u53D6\u5DF2\u5B8C\u6210\u7684\u7814\u7A76\u62A5\u544A\u3002",
  "tool.githubSearch": "\u641C\u7D22 GitHub \u4ED3\u5E93\u3001\u4EE3\u7801\u3001Issues\u3001\u7528\u6237\u3002\u65E0\u9700 Token\u3002",
  "tool.arxivSearch": "\u641C\u7D22 arXiv \u5B66\u672F\u8BBA\u6587\u3002\u65E0\u9700\u8BA4\u8BC1(3 \u79D2\u9650\u901F)\u3002",
  "tool.arxivDownload": "\u4E0B\u8F7D\u8BBA\u6587 HTML \u9884\u89C8\u6216 PDF\u3002\u4FDD\u5B58\u5728\u7B14\u8BB0\u5E93\u6839\u76EE\u5F55\u3002",
  "tool.baiduBaike": "\u6309\u6807\u9898\u6216 ID \u67E5\u8BE2\u767E\u5EA6\u767E\u79D1\u6761\u76EE\u3002\u9700\u8981 Baidu AppBuilder Key\u3002",
  "tool.wikipedia": "\u641C\u7D22 Wikipedia \u6216\u83B7\u53D6\u6587\u7AE0\u5185\u5BB9\u3002\u591A\u8BED\u8A00\u652F\u6301\uFF0C\u65E0\u9700 Key\u3002",
  // FIM tab
  "tab.fim": "FIM",
  "fim.apiSettings": "API \u8BBE\u7F6E",
  "fim.apiKey": "API Key",
  "fim.apiKeyDesc": "FIM \u4E13\u7528 API key\u3002\u7559\u7A7A\u5219\u4F7F\u7528\u6A21\u578B\u754C\u9762\u7684 API key\u3002",
  "fim.baseUrl": "Base URL",
  "fim.baseUrlDesc": "FIM API \u7AEF\u70B9\uFF08\u81EA\u52A8\u8FFD\u52A0 /beta\uFF09\u3002\u9ED8\u8BA4: https://api.deepseek.com",
  "fim.model": "Model",
  "fim.modelDesc": "FIM \u8865\u5168\u6A21\u578B\u3002\u7559\u7A7A\u5219\u4F7F\u7528\u6A21\u578B\u754C\u9762\u7684\u6A21\u578B\u3002",
  "fim.params": "\u53C2\u6570",
  "fim.temperature": "Temperature",
  "fim.temperatureDesc": "\u9ED8\u8BA4\u6E29\u5EA6(0-2)\u3002\u8D8A\u4F4E\u8D8A\u4E13\u6CE8\u3002\u9ED8\u8BA4: 1.0\u3002",
  "fim.maxTokens": "Max Tokens",
  "fim.maxTokensDesc": "\u9ED8\u8BA4\u6700\u5927\u8865\u5168\u957F\u5EA6(1-4096)\u3002\u53EF\u5355\u6B21\u8986\u5199: +++512\u3002\u9ED8\u8BA4: 1024\u3002",
  "fim.usage": "\u7528\u6CD5",
  "fim.usageTitle": "\u5C06\u5149\u6807\u653E\u5728 +++ \u884C\u4E0A\uFF0C\u89E6\u53D1 FIM:",
  "fim.usage1": "\u524D\u540E\u6587\u4E4B\u95F4\u586B\u5145:",
  "fim.usage2": "\u81EA\u5B9A\u4E49\u6700\u5927 token \u6570(512):",
  "fim.usage3": "\u4EC5\u540E\u7F00\u8865\u5168(+++ \u540E\u65E0\u6587\u672C):"
};
var en = {
  "tab.basic": "Basic",
  "tab.model": "Model",
  "tab.tools": "Tools",
  "tab.note": "Note",
  "basic.notebrainMdPath": "NOTEBRAIN.md Path",
  "basic.notebrainMdPathDesc": "Choose where NOTEBRAIN.md is stored. This file contains AI behavior guidelines and vault structure info.",
  "basic.writeFrequency": "Write Frequency",
  "basic.writeFrequencyDesc": "Milliseconds between file writes during streaming. Lower = smoother but more CPU. Default: 80ms.",
  "basic.language": "Language",
  "basic.languageDesc": "Settings UI display language.",
  "model.apiKey": "API Key",
  "model.apiKeyDesc": "DeepSeek API key from platform.deepseek.com",
  "model.baseUrl": "Base URL",
  "model.baseUrlDesc": "API endpoint",
  "model.model": "Model",
  "model.modelDesc": "DeepSeek model",
  "model.available": "Available",
  "model.modelPro": "deepseek-v4-pro (Flagship)",
  "model.modelFlash": "deepseek-v4-flash (Lightweight)",
  "model.thinking": "Thinking Mode",
  "model.thinkingDesc": "Enable reasoning/thinking (outputs as %%comments%% in notes)",
  "model.reasoningEffort": "Reasoning Effort",
  "model.reasoningEffortDesc": "Thinking intensity",
  "model.temperature": "Temperature",
  "model.temperatureDesc": "Creativity level (0-2). Only applies when Thinking Mode is off. Default: 0.7.",
  "note.yaml": "Enable YAML",
  "note.yamlDesc": "When off, the AI is forbidden from creating notes with YAML frontmatter. Any frontmatter in generated content will be stripped.",
  "note.editPermissionTag": "Edit Permission Tag",
  "note.editPermissionTagDesc": "Only notes with this tag can be edited by the AI. Add the tag in note body or frontmatter tags.",
  "note.noteTemplate": "Note Template",
  "note.noteTemplateDesc": "Select a note as template for new notes. Created notes will include the template structure.",
  "note.templateNone": "(none)",
  "tools.apiKeys": "API Keys",
  "tools.availableTools": "Available Tools",
  "tools.tavilyKey": "Tavily API Key",
  "tools.tavilyKeyDesc": "Required for web search. Get one at tavily.com",
  "tools.githubKey": "GitHub Token",
  "tools.githubKeyDesc": "Optional. Personal access token for higher API rate limits (github.com/settings/tokens)",
  "tools.baiduKey": "Baidu AppBuilder Key",
  "tools.baiduKeyDesc": "For \u767E\u5EA6\u767E\u79D1 lookup. Get one at appbuilder.baidu.com",
  "tools.headlessBrowser": "Headless Browser Endpoint",
  "tools.headlessBrowserDesc": "Optional. Custom headless browser endpoint (e.g. browserless). Leave empty to use built-in free renderer (Jina AI).",
  "toolName.searchNotes": "Search Vault",
  "toolName.readNote": "Read Note",
  "toolName.listFolder": "List Folder",
  "toolName.getBacklinks": "Backlinks",
  "toolName.createNote": "Create Note",
  "toolName.editNote": "Edit Note",
  "toolName.getCurrentTime": "Get Time",
  "toolName.cnNews": "CN News Aggregator",
  "toolName.webSearch": "Web Search (Free)",
  "toolName.webFetch": "Web Fetch",
  "toolName.tavilySearch": "Web Search",
  "toolName.tavilyExtract": "Extract Content",
  "toolName.tavilyMap": "Site Map",
  "toolName.tavilyCrawl": "Crawl Site",
  "toolName.tavilyResearch": "Deep Research",
  "toolName.tavilyResearchGet": "Get Research",
  "toolName.githubSearch": "GitHub Search",
  "toolName.arxivSearch": "arXiv Search",
  "toolName.arxivDownload": "arXiv Download",
  "toolName.baiduBaike": "Baidu Baike",
  "toolName.wikipedia": "Wikipedia",
  "tool.searchNotes": "Search vault: content, tags, filename, path, properties, regex.",
  "tool.readNote": "Read note content by name or path. Returns metadata, links, headings.",
  "tool.listFolder": "List contents of a vault folder (files, subfolders). Browse vault structure.",
  "tool.getBacklinks": "Get all notes that link to a given note (backlinks).",
  "tool.createNote": "Create a new note. Only when user explicitly requests.",
  "tool.editNote": "Edit an existing note (replace, append, prepend). Only when user explicitly requests.",
  "tool.getCurrentTime": "Get current date and time with timezone support.",
  "tool.cnNews": "Fetch headlines from 23 major Chinese news sites (Xinhua, People Daily, CCTV, etc.). Optional tier filter.",
  "tool.webSearch": "Free web search (Baidu + Bing). Min 3 keywords, searches both engines per keyword, no API key needed.",
  "tool.webFetch": "Fetch and extract content from any URL. renderJs=true for JS pages (built-in free renderer, no setup needed).",
  "tool.tavilySearch": "Web search via Tavily. Requires API key above.",
  "tool.tavilyExtract": "Extract clean content from URLs. Requires API key above.",
  "tool.tavilyMap": "Discover URL structure of a website. Requires API key above.",
  "tool.tavilyCrawl": "Crawl a website with depth/breadth control. Requires API key above.",
  "tool.tavilyResearch": "Multi-step deep research. Polls up to 3 min. Requires API key above.",
  "tool.tavilyResearchGet": "Retrieve a completed research report by request_id.",
  "tool.githubSearch": "Search GitHub repos, code, issues, users. Works without token.",
  "tool.arxivSearch": "Search arXiv for academic papers. No auth (3s rate limit).",
  "tool.arxivDownload": "Download paper as HTML preview or PDF. Saved to vault root.",
  "tool.baiduBaike": "Query \u767E\u5EA6\u767E\u79D1 entries by title or ID. Requires Baidu AppBuilder key.",
  "tool.wikipedia": "Search Wikipedia or get article content. Multi-language, no key needed.",
  // FIM tab
  "tab.fim": "FIM",
  "fim.apiSettings": "API Settings",
  "fim.apiKey": "API Key",
  "fim.apiKeyDesc": "FIM API key. Leave empty to use the main Model API key.",
  "fim.baseUrl": "Base URL",
  "fim.baseUrlDesc": "FIM API endpoint (/beta will be appended automatically). Default: https://api.deepseek.com",
  "fim.model": "Model",
  "fim.modelDesc": "Model for FIM completions. Leave empty to use the main model.",
  "fim.params": "Parameters",
  "fim.temperature": "Temperature",
  "fim.temperatureDesc": "Default temperature (0-2). Lower = more focused. Default: 1.0.",
  "fim.maxTokens": "Max Tokens",
  "fim.maxTokensDesc": "Default max completion length (1-4096). Can be overridden per-marker: +++512. Default: 1024.",
  "fim.usage": "Usage",
  "fim.usageTitle": "Place cursor on the +++ line and trigger FIM:",
  "fim.usage1": "Fill between prefix and suffix:",
  "fim.usage2": "Custom max tokens (512):",
  "fim.usage3": "Suffix-only fill (no text after +++):"
};
var locales = { zh, en };
function t(lang, key) {
  return locales[lang]?.[key] || locales.en[key] || key;
}

// src/settings/settings.ts
var DEFAULT_SETTINGS = {
  apiKey: "",
  baseUrl: "https://api.deepseek.com",
  model: "deepseek-v4-pro",
  thinkingEnabled: true,
  reasoningEffort: "high",
  tavilyKey: "",
  githubKey: "",
  baiduKey: "",
  yamlEnabled: true,
  noteTemplate: "",
  editPermissionTag: "#notebrain",
  disabledTools: [],
  headlessBrowserEndpoint: "",
  writeFrequency: 80,
  language: "zh",
  temperature: 0.7,
  notebrainMdPath: "NOTEBRAIN.md",
  fimTemperature: 1,
  fimMaxTokens: 1024,
  fimApiKey: "",
  fimBaseUrl: "https://api.deepseek.com",
  fimModel: "deepseek-v4-pro"
};
var NotebrainSettingTab = class extends import_obsidian13.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  tr(key) {
    return t(this.plugin.settings.language || "zh", key);
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass("chamberlain-settings");
    const _ = this.tr.bind(this);
    const toolbar = containerEl.createEl("div", { cls: "chamberlain-settings-toolbar" });
    const tabs = ["basic", "model", "tools", "note", "fim"].map(
      (id) => toolbar.createEl("button", {
        text: _(`tab.${id}`),
        cls: `chamberlain-settings-tab${id === "basic" ? " active" : ""}`
      })
    );
    const [basicTab, modelTab, toolsTab, noteTab, fimTab] = tabs;
    const panels = tabs.map(() => containerEl.createEl("div", { cls: "chamberlain-settings-panel" }));
    const [basicPanel, modelPanel, toolsPanel, notePanel, fimPanel] = panels;
    panels.slice(1).forEach((p) => p.style.display = "none");
    const switchTab = (activeIdx) => {
      tabs.forEach((t2, i) => {
        if (i === activeIdx) t2.addClass("active");
        else t2.removeClass("active");
      });
      panels.forEach((p, i) => {
        p.style.display = i === activeIdx ? "block" : "none";
      });
    };
    basicTab.onclick = () => switchTab(0);
    modelTab.onclick = () => switchTab(1);
    toolsTab.onclick = () => switchTab(2);
    noteTab.onclick = () => switchTab(3);
    fimTab.onclick = () => switchTab(4);
    this.buildBasicPanel(basicPanel);
    this.buildModelPanel(modelPanel);
    this.buildToolsPanel(toolsPanel);
    this.buildNotePanel(notePanel);
    this.buildFimPanel(fimPanel);
  }
  buildBasicPanel(el) {
    const _ = this.tr.bind(this);
    new import_obsidian13.Setting(el).setName(_("basic.language")).setDesc(_("basic.languageDesc")).addDropdown(
      (d) => d.addOption("zh", "\u4E2D\u6587").addOption("en", "English").setValue(this.plugin.settings.language || "zh").onChange(async (v) => {
        this.plugin.settings.language = v;
        await this.plugin.saveSettings();
        this.display();
      })
    );
    new import_obsidian13.Setting(el).setName(_("basic.notebrainMdPath")).setDesc(_("basic.notebrainMdPathDesc")).addDropdown((d) => {
      d.addOption("NOTEBRAIN.md", "NOTEBRAIN.md (root)");
      const notebrainFiles = this.app.vault.getMarkdownFiles().filter((f) => f.basename.toLowerCase() === "notebrain" && f.path !== "NOTEBRAIN.md");
      for (const f of notebrainFiles) {
        d.addOption(f.path, f.path);
      }
      d.setValue(this.plugin.settings.notebrainMdPath || "NOTEBRAIN.md");
      d.onChange(async (v) => {
        this.plugin.settings.notebrainMdPath = v;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian13.Setting(el).setName(_("basic.writeFrequency")).setDesc(_("basic.writeFrequencyDesc")).addText(
      (t2) => t2.setPlaceholder("80").setValue(String(this.plugin.settings.writeFrequency)).onChange(async (v) => {
        const n = parseInt(v, 10);
        if (!isNaN(n) && n >= 20 && n <= 500) {
          this.plugin.settings.writeFrequency = n;
          await this.plugin.saveSettings();
        }
      })
    );
  }
  buildModelPanel(el) {
    const _ = this.tr.bind(this);
    new import_obsidian13.Setting(el).setName(_("model.apiKey")).setDesc(_("model.apiKeyDesc")).addText(
      (t2) => t2.setPlaceholder("sk-...").setValue(this.plugin.settings.apiKey).onChange(async (v) => {
        this.plugin.settings.apiKey = v.trim();
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian13.Setting(el).setName(_("model.baseUrl")).setDesc(_("model.baseUrlDesc")).addText(
      (t2) => t2.setPlaceholder("https://api.deepseek.com").setValue(this.plugin.settings.baseUrl).onChange(async (v) => {
        this.plugin.settings.baseUrl = v.trim();
        await this.plugin.saveSettings();
      })
    );
    const modelSetting = new import_obsidian13.Setting(el).setName(_("model.model")).setDesc(_("model.modelDesc")).addText(
      (t2) => t2.setPlaceholder("deepseek-v4-pro").setValue(this.plugin.settings.model).onChange(async (v) => {
        this.plugin.settings.model = v.trim();
        await this.plugin.saveSettings();
      })
    );
    const refreshModels = async () => {
      try {
        const models = await this.plugin.client.listModels();
        if (models.length > 0) {
          modelSetting.setDesc(
            `${_("model.modelDesc")}  ${_("model.available")}: ${models.slice(0, 8).join(", ")}`
          );
        }
      } catch {
      }
    };
    refreshModels();
    new import_obsidian13.Setting(el).setName(_("model.thinking")).setDesc(_("model.thinkingDesc")).addToggle(
      (t2) => t2.setValue(this.plugin.settings.thinkingEnabled).onChange(async (v) => {
        this.plugin.settings.thinkingEnabled = v;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian13.Setting(el).setName(_("model.reasoningEffort")).setDesc(_("model.reasoningEffortDesc")).addDropdown(
      (d) => d.addOption("high", "high").addOption("max", "max").setValue(this.plugin.settings.reasoningEffort).onChange(async (v) => {
        this.plugin.settings.reasoningEffort = v;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian13.Setting(el).setName(_("model.temperature")).setDesc(_("model.temperatureDesc")).addText(
      (t2) => t2.setPlaceholder("0.7").setValue(String(this.plugin.settings.temperature)).onChange(async (v) => {
        const n = parseFloat(v);
        if (!isNaN(n) && n >= 0 && n <= 2) {
          this.plugin.settings.temperature = n;
          await this.plugin.saveSettings();
        }
      })
    );
  }
  buildNotePanel(el) {
    const _ = this.tr.bind(this);
    new import_obsidian13.Setting(el).setName(_("note.yaml")).setDesc(_("note.yamlDesc")).addToggle(
      (t2) => t2.setValue(this.plugin.settings.yamlEnabled).onChange(async (v) => {
        this.plugin.settings.yamlEnabled = v;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian13.Setting(el).setName(_("note.editPermissionTag")).setDesc(_("note.editPermissionTagDesc")).addText(
      (t2) => t2.setPlaceholder("#notebrain").setValue(this.plugin.settings.editPermissionTag).onChange(async (v) => {
        let tag = v.trim();
        if (tag && !tag.startsWith("#")) tag = "#" + tag;
        this.plugin.settings.editPermissionTag = tag || "#notebrain";
        await this.plugin.saveSettings();
      })
    );
    const files = this.app.vault.getMarkdownFiles();
    new import_obsidian13.Setting(el).setName(_("note.noteTemplate")).setDesc(_("note.noteTemplateDesc")).addDropdown((d) => {
      d.addOption("", _("note.templateNone"));
      for (const f of files) {
        d.addOption(f.path, f.path);
      }
      d.setValue(this.plugin.settings.noteTemplate || "");
      d.onChange(async (v) => {
        this.plugin.settings.noteTemplate = v;
        await this.plugin.saveSettings();
      });
    });
  }
  buildToolsPanel(el) {
    const _ = this.tr.bind(this);
    el.createEl("h3", { text: _("tools.apiKeys") });
    new import_obsidian13.Setting(el).setName(_("tools.tavilyKey")).setDesc(_("tools.tavilyKeyDesc")).addText(
      (t2) => t2.setPlaceholder("tvly-...").setValue(this.plugin.settings.tavilyKey).onChange(async (v) => {
        this.plugin.settings.tavilyKey = v.trim();
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian13.Setting(el).setName(_("tools.githubKey")).setDesc(_("tools.githubKeyDesc")).addText(
      (t2) => t2.setPlaceholder("ghp_...").setValue(this.plugin.settings.githubKey).onChange(async (v) => {
        this.plugin.settings.githubKey = v.trim();
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian13.Setting(el).setName(_("tools.baiduKey")).setDesc(_("tools.baiduKeyDesc")).addText(
      (t2) => t2.setPlaceholder("bce-...").setValue(this.plugin.settings.baiduKey).onChange(async (v) => {
        this.plugin.settings.baiduKey = v.trim();
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian13.Setting(el).setName(_("tools.headlessBrowser")).setDesc(_("tools.headlessBrowserDesc")).addText(
      (t2) => t2.setPlaceholder("https://...").setValue(this.plugin.settings.headlessBrowserEndpoint).onChange(async (v) => {
        this.plugin.settings.headlessBrowserEndpoint = v.trim();
        await this.plugin.saveSettings();
      })
    );
    el.createEl("h3", { text: _("tools.availableTools") });
    const toolNames = [
      "searchNotes",
      "readNote",
      "listFolder",
      "getBacklinks",
      "createNote",
      "editNote",
      "getCurrentTime",
      "webSearch",
      "cnNews",
      "webFetch",
      "tavilySearch",
      "tavilyExtract",
      "tavilyMap",
      "tavilyCrawl",
      "tavilyResearch",
      "tavilyResearchGet",
      "githubSearch",
      "arxivSearch",
      "arxivDownload",
      "baiduBaike",
      "wikipedia"
    ];
    for (const name of toolNames) {
      const disabled = this.plugin.settings.disabledTools;
      new import_obsidian13.Setting(el).setName(_(`toolName.${name}`)).setDesc(_(`tool.${name}`)).addToggle(
        (toggle) => toggle.setValue(!disabled.includes(name)).onChange(async (v) => {
          if (v) {
            this.plugin.settings.disabledTools = disabled.filter((n) => n !== name);
          } else {
            if (!disabled.includes(name)) disabled.push(name);
          }
          await this.plugin.saveSettings();
        })
      );
    }
  }
  buildFimPanel(el) {
    const _ = this.tr.bind(this);
    el.createEl("h3", { text: _("fim.apiSettings") });
    new import_obsidian13.Setting(el).setName(_("fim.apiKey")).setDesc(_("fim.apiKeyDesc")).addText(
      (t2) => t2.setPlaceholder("sk-...").setValue(this.plugin.settings.fimApiKey).onChange(async (v) => {
        this.plugin.settings.fimApiKey = v.trim();
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian13.Setting(el).setName(_("fim.baseUrl")).setDesc(_("fim.baseUrlDesc")).addText(
      (t2) => t2.setPlaceholder("https://api.deepseek.com").setValue(this.plugin.settings.fimBaseUrl).onChange(async (v) => {
        this.plugin.settings.fimBaseUrl = v.trim();
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian13.Setting(el).setName(_("fim.model")).setDesc(_("fim.modelDesc")).addText(
      (t2) => t2.setPlaceholder("deepseek-v4-pro").setValue(this.plugin.settings.fimModel).onChange(async (v) => {
        this.plugin.settings.fimModel = v.trim();
        await this.plugin.saveSettings();
      })
    );
    el.createEl("h3", { text: _("fim.params") });
    new import_obsidian13.Setting(el).setName(_("fim.temperature")).setDesc(_("fim.temperatureDesc")).addText(
      (t2) => t2.setPlaceholder("1.0").setValue(String(this.plugin.settings.fimTemperature)).onChange(async (v) => {
        const n = parseFloat(v);
        if (!isNaN(n) && n >= 0 && n <= 2) {
          this.plugin.settings.fimTemperature = n;
          await this.plugin.saveSettings();
        }
      })
    );
    new import_obsidian13.Setting(el).setName(_("fim.maxTokens")).setDesc(_("fim.maxTokensDesc")).addText(
      (t2) => t2.setPlaceholder("1024").setValue(String(this.plugin.settings.fimMaxTokens)).onChange(async (v) => {
        const n = parseInt(v, 10);
        if (!isNaN(n) && n >= 1 && n <= 4096) {
          this.plugin.settings.fimMaxTokens = n;
          await this.plugin.saveSettings();
        }
      })
    );
    el.createEl("h3", { text: _("fim.usage") });
    el.createEl("pre", {
      text: `${_("fim.usageTitle")}

  ${_("fim.usage1")}
    \u524D\u6587\u5185\u5BB9...
    +++
    \u540E\u6587\u5185\u5BB9...

  ${_("fim.usage2")}
    \u7B2C\u4E00\u7AE0\u5F00\u59CB...
    +++512

  ${_("fim.usage3")}
    \u5F85\u7EED\u5199\u6BB5\u843D...
    +++`,
      cls: "notebrain-fim-usage"
    });
  }
};

// src/editor/noteChat.ts
var import_obsidian14 = require("obsidian");

// src/chat/cache.ts
var TTL_MS = 30 * 60 * 1e3;
var store = /* @__PURE__ */ new Map();
function resetTimer(filePath, entry) {
  if (entry.timer) clearTimeout(entry.timer);
  entry.timer = setTimeout(() => {
    store.delete(filePath);
  }, TTL_MS);
}
function getCache(filePath) {
  const entry = store.get(filePath);
  if (!entry) return null;
  const elapsed = Date.now() - entry.lastActivity;
  if (elapsed > TTL_MS) {
    store.delete(filePath);
    if (entry.timer) clearTimeout(entry.timer);
    return null;
  }
  entry.lastActivity = Date.now();
  resetTimer(filePath, entry);
  return entry.messages;
}
function setCache(filePath, messages) {
  const existing = store.get(filePath);
  if (existing?.timer) clearTimeout(existing.timer);
  const entry = {
    messages,
    lastActivity: Date.now(),
    timer: null
  };
  resetTimer(filePath, entry);
  store.set(filePath, entry);
}

// src/editor/noteChat.ts
var TURN_SEP_RE = /\n---\n/;
var USER_OPEN = "\n%%\nuser\n";
var ASSISTANT_OPEN = "\n%%\nassistant\n";
var BLOCK_CLOSE = "\n%%";
var SESSION_TAG = "notebrain-session";
function stripYamlFrontmatter(content) {
  return content.replace(/^---[\s\S]*?---\n*/, "");
}
async function ensureSessionTag(file, app) {
  const cache = app.metadataCache.getFileCache(file);
  const inlineTags = (cache?.tags || []).map((t2) => t2.tag.replace(/^#/, ""));
  const fmTags = cache?.frontmatter?.tags?.map((t2) => String(t2)) || [];
  const allTags = [...inlineTags, ...fmTags];
  if (allTags.some((t2) => t2 === SESSION_TAG || t2 === `#${SESSION_TAG}`)) return;
  try {
    const raw = await app.vault.read(file);
    if (raw.includes(`#${SESSION_TAG}`) || raw.includes(SESSION_TAG)) return;
    await app.vault.process(file, (current) => {
      const TAG = SESSION_TAG;
      if (!current.startsWith("---")) {
        return `---
tags:
  - ${TAG}
---

${current}`;
      }
      const endIdx = current.indexOf("---", 3);
      if (endIdx === -1) return current;
      const fm = current.slice(3, endIdx);
      const after = current.slice(endIdx + 3);
      if (fm.includes(TAG)) return current;
      const inlineArr = fm.match(/^tags?\s*:\s*\[([^\]]*)\]/m);
      if (inlineArr) {
        const items = inlineArr[1].split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
        items.push(TAG);
        const newFm = fm.replace(/^tags?\s*:\s*\[[^\]]*\]/m, `tags: [${items.join(", ")}]`);
        return `---${newFm}---${after}`;
      }
      if (/^tags?\s*:\s*\n/m.test(fm)) {
        const newFm = fm.replace(/^(tags?\s*:\s*\n)/m, `$1  - ${TAG}
`);
        return `---${newFm}---${after}`;
      }
      const single = fm.match(/^tags?\s*:\s*(.+)$/m);
      if (single) {
        const val = single[1].trim();
        const newFm = fm.replace(/^tags?\s*:\s*.+$/m, `tags:
  - ${val}
  - ${TAG}`);
        return `---${newFm}---${after}`;
      }
      return `---
tags:
  - ${TAG}
${fm}---${after}`;
    });
  } catch {
  }
}
function formatTimestamp(date = /* @__PURE__ */ new Date()) {
  const pad2 = (n) => String(n).padStart(2, "0");
  const y = date.getFullYear();
  const mo = pad2(date.getMonth() + 1);
  const d = pad2(date.getDate());
  const h = pad2(date.getHours());
  const mi = pad2(date.getMinutes());
  const s = pad2(date.getSeconds());
  return `${y}-${mo}-${d} ${h}:${mi}:${s}`;
}
function getOpenTabsContext(plugin) {
  const contexts = [];
  const workspace = plugin.app.workspace;
  const activeFile = workspace.getActiveFile();
  for (const leaf of workspace.getLeavesOfType("markdown")) {
    const file = leaf.view?.file;
    if (file && file instanceof import_obsidian14.TFile && file !== activeFile) {
      contexts.push(`[File: ${file.path}]`);
    }
  }
  for (const leaf of workspace.getLeavesOfType("webviewer")) {
    const state = leaf.getViewState();
    const url = state.state?.url;
    if (url) {
      contexts.push(`[Web: ${url}]`);
    }
  }
  return contexts;
}
function parseConversationTurns(content) {
  const turns = [];
  let searchFrom = 0;
  while (true) {
    const markerPos = content.indexOf(USER_OPEN, searchFrom);
    if (markerPos === -1) break;
    const userText = content.slice(searchFrom, markerPos).trim();
    const userClosePos = content.indexOf(BLOCK_CLOSE, markerPos + USER_OPEN.length);
    if (userClosePos === -1) {
      searchFrom = markerPos + USER_OPEN.length;
      continue;
    }
    const userBlockEnd = userClosePos + BLOCK_CLOSE.length;
    const nextMarker = content.indexOf(USER_OPEN, userBlockEnd);
    const turnEnd = nextMarker !== -1 ? nextMarker : content.length;
    const turnContent = content.slice(userBlockEnd, turnEnd);
    const sepMatch = TURN_SEP_RE.exec(turnContent);
    if (!sepMatch) {
      searchFrom = turnEnd;
      continue;
    }
    const bodySection = turnContent.slice(sepMatch.index + sepMatch[0].length);
    const assistantPos = bodySection.indexOf(ASSISTANT_OPEN);
    let responseText = "";
    let thinkingText = "";
    if (assistantPos !== -1) {
      const responseBlock = bodySection.slice(0, assistantPos);
      thinkingText = (responseBlock.match(/%%([\s\S]*?)%%/)?.[1] ?? "").trim();
      responseText = responseBlock.replace(/%%[\s\S]*?%%/g, "").trim();
    } else {
      thinkingText = (bodySection.match(/%%([\s\S]*?)%%/)?.[1] ?? "").trim();
      responseText = bodySection.replace(/%%[\s\S]*?%%/g, "").trim();
    }
    const userBlockContent = content.slice(markerPos + USER_OPEN.length, userClosePos);
    const userContext = [];
    let userTimestamp = "";
    for (const line of userBlockContent.split("\n")) {
      const tsMatch = line.match(/^\[Timestamp:\s*(.+?)\]$/);
      if (tsMatch) {
        userTimestamp = tsMatch[1].trim();
      } else if (line.startsWith("[") && line.endsWith("]")) {
        userContext.push(line);
      }
    }
    turns.push({
      userText,
      userContext,
      timestamp: userTimestamp,
      assistantText: responseText,
      thinkingText,
      startOffset: markerPos + 1,
      endOffset: turnEnd
    });
    searchFrom = turnEnd;
  }
  return turns;
}
function buildApiMessages(turns, systemPrompt) {
  const messages = [
    { role: "system", content: systemPrompt }
  ];
  for (const turn of turns) {
    let userContent = turn.userText;
    if (turn.userContext.length > 0) {
      userContent += "\n\n[Context]\n" + turn.userContext.join("\n");
    }
    messages.push({ role: "user", content: userContent });
    if (turn.assistantText) {
      messages.push({ role: "assistant", content: turn.assistantText });
    }
  }
  return messages;
}
function validateChatStart(content) {
  if (!content.trim()) return "Note is empty. Type a message first.";
  const lastUser = content.lastIndexOf(USER_OPEN);
  const lastAssist = content.lastIndexOf(ASSISTANT_OPEN);
  const suffixEnd = (markerOpen, type) => {
    const afterOpen = markerOpen + (type === "user" ? USER_OPEN.length : ASSISTANT_OPEN.length);
    const close = content.indexOf(BLOCK_CLOSE, afterOpen);
    if (close === -1) return -1;
    const dash = content.indexOf("\n---\n", close + BLOCK_CLOSE.length);
    if (dash === -1) return -1;
    return dash + 5;
  };
  if (lastUser > lastAssist) {
    return "The last message is yours. Wait for the AI to finish responding before sending another.";
  }
  if (lastAssist !== -1) {
    const end = suffixEnd(lastAssist, "assistant");
    if (end !== -1) {
      const after = content.slice(end);
      if (!after.trim()) return "No new message. Type something after the last response.";
    } else {
      return "The last AI response marker is malformed. Check the %% and --- markers.";
    }
  }
  return null;
}
async function runInlineChat(plugin, editor, view) {
  const isReading = view.leaf.getViewState().state?.mode === "preview";
  const file = view.file;
  let fullContent;
  let userInput;
  let insertAt;
  if (isReading) {
    fullContent = await plugin.app.vault.read(file);
    const lastTurnEnd = findLastTurnEnd(fullContent);
    const rawInputFull = fullContent.slice(lastTurnEnd);
    userInput = stripYamlFrontmatter(rawInputFull).trim();
    if (!userInput) return;
    insertAt = lastTurnEnd + rawInputFull.length;
  } else {
    const doc = editor.getDoc();
    fullContent = doc.getValue();
    const cursor = editor.getCursor();
    const cursorOffset = doc.posToOffset(cursor);
    const selection = editor.getSelection();
    if (selection) {
      userInput = selection.trim();
      insertAt = doc.posToOffset(editor.getCursor("to")) + 1;
    } else {
      const textBeforeCursor = fullContent.slice(0, cursorOffset);
      const lastTurnEnd = findLastTurnEnd(textBeforeCursor);
      const rawInputFull = fullContent.slice(lastTurnEnd);
      userInput = stripYamlFrontmatter(rawInputFull).trim();
      insertAt = lastTurnEnd + rawInputFull.length;
    }
    if (!userInput) return;
    await plugin.app.vault.modify(file, fullContent);
    fullContent = await plugin.app.vault.read(file);
  }
  const err = validateChatStart(fullContent);
  if (err) {
    new import_obsidian14.Notice(`Notebrain: ${err}`);
    return;
  }
  const contextContent = stripYamlFrontmatter(fullContent);
  const previousTurns = parseConversationTurns(contextContent);
  const openContexts = isReading ? [] : getOpenTabsContext(plugin);
  const timestamp = formatTimestamp();
  const contextSection = openContexts.map((c) => c).join("\n");
  const userBlock = [
    "",
    "",
    "%%",
    "user",
    ...contextSection ? [contextSection] : [],
    `[Timestamp: ${timestamp}]`,
    "%%",
    ""
  ].join("\n");
  const headerToInsert = userBlock + "\n---\n\n";
  const before = fullContent.slice(0, insertAt);
  const after = fullContent.slice(insertAt);
  fullContent = before + headerToInsert + after;
  await plugin.app.vault.modify(file, fullContent);
  let apiMessages = getCache(file.path);
  if (apiMessages) {
    apiMessages.push({ role: "user", content: userInput });
  } else {
    apiMessages = buildApiMessages(previousTurns, plugin.systemPrompt);
    apiMessages.push({ role: "user", content: userInput });
  }
  const tools = getToolDefinitions();
  const toolRegistry2 = getAllTools();
  const writeFreq = plugin.settings.writeFrequency || 80;
  let streamBuffer = "";
  let lastFlush = 0;
  let writeChain = Promise.resolve();
  let toolsRunning = false;
  const drainWrites = async () => {
    if (streamBuffer) {
      writeChain = writeChain.then(async () => {
        await plugin.app.vault.modify(file, before + headerToInsert + streamBuffer + after);
      });
    }
    await writeChain;
    writeChain = Promise.resolve();
  };
  try {
    await runAgentLoop(plugin.client, apiMessages, tools, toolRegistry2, (text) => {
      streamBuffer += text;
      if (toolsRunning) return;
      const now = Date.now();
      if (now - lastFlush > writeFreq) {
        lastFlush = now;
        writeChain = writeChain.then(async () => {
          await plugin.app.vault.modify(file, before + headerToInsert + streamBuffer + after);
        });
      }
    }, plugin.app, async () => {
      toolsRunning = true;
      await drainWrites();
    }, () => {
      toolsRunning = false;
      lastFlush = 0;
    });
    await writeChain;
    if (streamBuffer) {
      await plugin.app.vault.modify(file, before + headerToInsert + streamBuffer + after);
    }
    const footer = [
      "",
      "",
      "%%",
      "assistant",
      `[Timestamp: ${formatTimestamp()}]`,
      "%%",
      "",
      "---",
      ""
    ].join("\n");
    await plugin.app.vault.modify(file, before + headerToInsert + streamBuffer + footer + after);
  } catch (err2) {
    console.error("[Notebrain] error:", err2);
    const errMsg = `

Error: ${err2.message ?? "Unknown error"}
`;
    await plugin.app.vault.modify(file, before + headerToInsert + streamBuffer + errMsg + after);
  }
  setCache(file.path, apiMessages);
  if (!isReading) {
    try {
      const state = view.leaf.getViewState();
      if (state.state?.mode !== "preview") {
        state.state.mode = "preview";
        await view.leaf.setViewState(state);
      }
    } catch {
    }
  }
  ensureSessionTag(file, plugin.app);
}
function findLastTurnEnd(text) {
  const closingMarker = "\n%%\n";
  const lastSep = text.lastIndexOf(closingMarker);
  if (lastSep !== -1) {
    const afterClose = text.indexOf("\n", lastSep + closingMarker.length);
    if (afterClose !== -1) {
      const afterDash = text.indexOf("---\n", afterClose);
      if (afterDash !== -1) {
        return afterDash + "---\n".length;
      }
    }
    return lastSep + closingMarker.length;
  }
  return 0;
}
var PERMISSION_TOOLS = /* @__PURE__ */ new Set(["createNote", "editNote"]);
var ToolPermissionModal = class extends import_obsidian14.Modal {
  constructor(app, toolName, args) {
    super(app);
    this.toolName = toolName;
    this.args = args;
  }
  openModal() {
    return new Promise((resolve) => {
      this.resolve = resolve;
      this.open();
    });
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("notebrain-permission-modal");
    contentEl.createEl("h3", { text: "Notebrain \u5DE5\u5177\u6743\u9650" });
    const info = contentEl.createEl("div", { cls: "notebrain-permission-info" });
    if (this.toolName === "createNote") {
      info.createEl("p", { text: `\u5DE5\u5177: \u521B\u5EFA\u7B14\u8BB0` });
      info.createEl("p", { text: `\u6587\u4EF6\u540D: ${this.args.file || "?"}` });
      if (this.args.folder) info.createEl("p", { text: `\u6587\u4EF6\u5939: ${this.args.folder}` });
      const contentPreview = this.args.content || "";
      if (contentPreview) {
        info.createEl("p", { text: `\u5185\u5BB9\u9884\u89C8: ${contentPreview.slice(0, 200)}${contentPreview.length > 200 ? "..." : ""}` });
      }
    } else if (this.toolName === "editNote") {
      const modeMap = { replace: "\u66FF\u6362\u6587\u672C", append: "\u8FFD\u52A0\u5185\u5BB9", prepend: "\u524D\u7F6E\u5185\u5BB9" };
      info.createEl("p", { text: `\u5DE5\u5177: \u7F16\u8F91\u7B14\u8BB0` });
      info.createEl("p", { text: `\u6587\u4EF6: ${this.args.file || this.args.path || "?"}` });
      info.createEl("p", { text: `\u6A21\u5F0F: ${modeMap[this.args.mode] || this.args.mode}` });
      if (this.args.search) info.createEl("p", { text: `\u67E5\u627E: ${this.args.search.slice(0, 100)}` });
      const editContent = this.args.replace || this.args.content || "";
      if (editContent) {
        info.createEl("p", { text: `\u5185\u5BB9: ${editContent.slice(0, 200)}${editContent.length > 200 ? "..." : ""}` });
      }
    }
    const btnRow = contentEl.createEl("div", { cls: "notebrain-permission-buttons" });
    const denyBtn = btnRow.createEl("button", { text: "\u62D2\u7EDD", cls: "notebrain-permission-deny" });
    denyBtn.onclick = () => {
      this.resolve(false);
      this.close();
    };
    const approveBtn = btnRow.createEl("button", { text: "\u6279\u51C6", cls: "notebrain-permission-approve" });
    approveBtn.onclick = () => {
      this.resolve(true);
      this.close();
    };
  }
  onClose() {
    if (this.resolve) this.resolve(false);
  }
};
async function runAgentLoop(client, messages, tools, toolRegistry2, onStream, app, beforeTools, afterTools) {
  const maxTurns = 10;
  let commentOpen = false;
  let hasWritten = false;
  for (let turn = 0; turn < maxTurns; turn++) {
    let content = "";
    let reasoningContent = "";
    const toolCallResult = { calls: [] };
    await client.chatStream(
      messages,
      tools.length > 0 ? tools : void 0,
      (chunk) => {
        if (chunk.reasoningContent || chunk.toolCalls) {
          if (!commentOpen) {
            commentOpen = true;
            onStream(hasWritten ? "\n%%" : "%%");
          }
          if (chunk.reasoningContent) {
            onStream(chunk.reasoningContent);
            reasoningContent += chunk.reasoningContent;
          }
        }
        if (chunk.content) {
          if (commentOpen) {
            onStream("%%\n");
            commentOpen = false;
          }
          onStream(chunk.content);
          content += chunk.content;
          hasWritten = true;
        }
        if (chunk.toolCalls) {
          toolCallResult.calls = chunk.toolCalls;
        }
      }
    );
    const toolCalls = toolCallResult.calls;
    if (toolCalls.length > 0) {
      if (beforeTools) await beforeTools();
      const callsForApi = toolCalls.map((tc) => ({
        id: tc.id,
        type: "function",
        function: { name: tc.name, arguments: tc.arguments }
      }));
      messages.push({
        role: "assistant",
        content: content || "",
        reasoning_content: reasoningContent,
        tool_calls: callsForApi
      });
      if (!commentOpen) {
        commentOpen = true;
        onStream(hasWritten ? "\n%%" : "%%");
      }
      onStream(`
[Tool calls]
`);
      for (const tc of toolCalls) {
        let argsStr = tc.arguments;
        try {
          argsStr = JSON.stringify(JSON.parse(tc.arguments));
        } catch {
        }
        onStream(`${tc.name}: ${argsStr}
`);
      }
      for (const tc of toolCalls) {
        const tool = toolRegistry2.get(tc.name);
        let result;
        if (tool) {
          try {
            const args = JSON.parse(tc.arguments);
            if (PERMISSION_TOOLS.has(tc.name) && app) {
              onStream(`
[Permission requested: ${tc.name}]
`);
              const approved = await new ToolPermissionModal(app, tc.name, args).openModal();
              if (!approved) {
                result = JSON.stringify({ error: "User denied the operation." });
                messages.push({
                  role: "tool",
                  tool_call_id: tc.id,
                  content: result
                });
                onStream(`
[Permission denied: ${tc.name}]
`);
                continue;
              }
              onStream(`
[Permission granted: ${tc.name}]
`);
            }
            result = String(await tool.execute(args, toolApiKeys));
          } catch (e) {
            result = JSON.stringify({ error: `${tc.name} failed: ${e?.message || "unknown error"}` });
          }
        } else {
          result = JSON.stringify({ error: `Unknown tool: ${tc.name}` });
        }
        messages.push({
          role: "tool",
          tool_call_id: tc.id,
          content: result
        });
      }
      if (afterTools) afterTools();
      continue;
    }
    if (commentOpen) {
      onStream("%%\n");
      commentOpen = false;
    }
    break;
  }
  if (!commentOpen) {
    commentOpen = true;
    onStream(hasWritten ? "\n%%" : "%%");
  }
  onStream(`
[Tool calls exceeded max rounds (${maxTurns}) \u2014 stopped]
`);
  if (commentOpen) {
    onStream("%%\n");
  }
}

// src/editor/fimComplete.ts
var import_obsidian15 = require("obsidian");

// src/api/deepseekFim.ts
var DeepSeekFimClient = class {
  constructor(config) {
    this.config = config;
    this.client = new openai_default({
      apiKey: config.apiKey,
      baseURL: config.baseUrl.replace(/\/+$/, "") + "/beta",
      dangerouslyAllowBrowser: true
    });
  }
  async complete(prompt, suffix, maxTokens, temperature) {
    const body = {
      model: this.config.model,
      prompt,
      max_tokens: maxTokens ?? 1024,
      temperature: temperature ?? 1
    };
    if (suffix) body.suffix = suffix;
    const response = await this.client.completions.create(body);
    return response.choices?.[0]?.text ?? "";
  }
};

// src/editor/fimComplete.ts
function findMarker(content, cursorOffset) {
  const lines = content.split("\n");
  let lineStart = 0;
  for (let i = 0; i < lines.length; i++) {
    const lineEnd = lineStart + lines[i].length;
    const match = lines[i].match(/^\++(\d*)$/);
    if (match && lines[i].startsWith("+++")) {
      const markerStart = lineStart;
      const markerEnd = lineEnd + 1;
      if (cursorOffset >= markerStart && cursorOffset <= markerEnd + 1) {
        const prefix = content.slice(0, markerStart).trimEnd();
        const suffix = content.slice(markerEnd).trimStart();
        const maxTokens = match[1] ? parseInt(match[1], 10) : 0;
        return { prefix, suffix, maxTokens, markerStart, markerEnd };
      }
    }
    lineStart = lineEnd + 1;
  }
  return null;
}
async function runFimComplete(plugin, editor) {
  const doc = editor.getDoc();
  const content = doc.getValue();
  const cursorOffset = doc.posToOffset(editor.getCursor());
  const s = plugin.settings;
  if (!s.fimApiKey && !s.apiKey) {
    new import_obsidian15.Notice("Notebrain FIM: API key not configured.");
    return;
  }
  const marker = findMarker(content, cursorOffset);
  if (!marker) {
    new import_obsidian15.Notice("Notebrain FIM: Place cursor on a +++ line (or +++512 for custom max tokens).");
    return;
  }
  const fimClient = new DeepSeekFimClient({
    apiKey: s.fimApiKey || s.apiKey,
    baseUrl: s.fimBaseUrl || "https://api.deepseek.com",
    model: s.fimModel || s.model
  });
  const maxTokens = marker.maxTokens || s.fimMaxTokens;
  const temperature = s.fimTemperature;
  new import_obsidian15.Notice("Notebrain FIM: Completing...");
  const result = await fimClient.complete(
    marker.prefix,
    marker.suffix || void 0,
    maxTokens,
    temperature
  );
  const from = editor.offsetToPos(marker.markerStart);
  const to = editor.offsetToPos(marker.markerEnd);
  editor.replaceRange(result + "\n", from, to);
}

// main.ts
var BRAIN_ICON = `<svg t="1779116087829" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9928" width="100" height="100"><path d="M902.709 416.67c-0.445 36.855-16.859 71.907-44.805 96.546 28.334 24.98 44.885 60.66 44.885 98.074 0 64.151-48.934 119.599-111.602 129.557 1.517 7.791 2.27 15.479 2.27 22.984 0 71.177-60.33 131.302-131.747 131.302-63.09 0-118.595-46.756-129.636-108.968-1.392-3.741-2.11-7.585-2.11-11.429V531.592c0-0.103-0.011-0.194-0.011-0.285 0-0.011 0.011-0.034 0.011-0.057V292.041c-12.296-52.619 8.361-107.04 52.881-138.978l1.209-0.764c15.992-8.692 32.84-14.772 50.064-18.08 1.677-0.354 2.989-0.627 4.312-0.855 2.361-0.376 4.597-0.707 6.844-0.97 11.863-1.426 19.973-1.437 31.094-0.251l1.506 0.205a136.72 136.72 0 0 1 14.201 2.464c24.513 5.68 45.604 17.338 63.033 34.71 29.942 29.84 43.722 74.257 36.832 116.188 62.223 10.3 110.85 65.771 110.85 129.442 0 0.171-0.034 0.354-0.034 0.525 0 0.194 0.034 0.388 0.034 0.582-0.001 0.137-0.081 0.263-0.081 0.411zM773.061 309.847c-56.805 0-103.241 44.452-106.458 100.276 16.848 3.171 29.646 17.908 29.646 35.612 0 19.996-16.334 36.273-36.41 36.273s-36.399-16.277-36.399-36.273c0-14.11 8.201-26.235 20.03-32.235 1.449-68.337 56.303-123.671 124.583-126.283 7.871-36.284-3.148-75.569-29.178-101.519-14.361-14.304-31.722-23.897-51.615-28.517-4.072-0.924-7.882-1.597-11.703-2.053l-0.422-11.612-1.232 11.372c-8.099-0.878-15.296-1.061-25.904 0.228-1.951 0.228-3.878 0.502-5.806 0.821-0.878 0.148-1.871 0.365-2.874 0.582-15.524 2.989-29.92 8.156-43.63 15.524-30.878 22.437-47.486 57.934-45.889 94.538 0.068 0.354 0.285 0.639 0.319 1.015 3.764 33.581 22.631 62.702 51.786 79.892 5.452 3.205 7.266 10.22 4.038 15.661-2.144 3.605-5.977 5.623-9.901 5.623-1.985 0-3.992-0.513-5.829-1.597-14.806-8.726-27.273-20.11-37.288-33.239v197.7c-0.24 36.889 29.623 67.139 66.649 67.459 6.331 0.057 11.429 5.213 11.384 11.544-0.057 6.274-5.19 11.338-11.486 11.338h-0.091c-26.452-0.228-50.098-11.909-66.455-30.182v182.94c0 1.232 0.297 2.589 0.844 3.901l0.741 2.544c8.703 51.923 54.786 91.07 107.199 91.07 58.972 0 108.785-49.642 108.785-108.42 0-1.209-0.24-2.487-0.285-3.707-0.068-0.445-0.285-0.821-0.297-1.278a87.476 87.476 0 0 0-2.19-16.813c-0.034-0.137-0.057-0.262-0.091-0.399-3.867-16.505-12.513-31.528-25.197-43.402-14.772-13.825-33.524-21.33-53.474-22.859-5.03 14.03-18.376 24.159-34.151 24.159-20.076 0-36.41-16.289-36.41-36.296 0-19.996 16.334-36.273 36.41-36.273 16.083 0 29.612 10.517 34.414 24.969 25.711 1.255 49.904 11.806 68.93 29.612 11.338 10.608 20.03 23.247 25.939 37.094 53.44-6.65 95.736-53.189 95.736-107.348 0-34.927-17.578-68.098-47.03-88.721l-13.369-9.353 13.369-9.365c29.315-20.509 46.836-53.451 46.995-88.207-0.332-58.39-48.068-105.796-106.733-105.796zM659.839 432.32c-7.414 0-13.448 6.011-13.448 13.414 0 7.38 6.034 13.391 13.448 13.391s13.448-6.011 13.448-13.391c0.001-7.403-6.034-13.414-13.448-13.414z m8.407 230.881c-0.023-7.369-6.034-13.357-13.437-13.357-7.414 0-13.448 6.011-13.448 13.391 0 7.391 6.034 13.414 13.448 13.414 7.266 0 13.129-5.806 13.357-12.992v-0.011c0-0.16 0.08-0.285 0.08-0.445zM447.22 873.368l-1.209 0.764c-15.992 8.692-32.828 14.772-50.064 18.079-1.677 0.354-2.977 0.639-4.3 0.856-2.361 0.376-4.608 0.707-6.855 0.981-6.205 0.741-11.429 1.084-16.437 1.084-4.563 0-9.353-0.274-14.658-0.844l-1.506-0.205a137.059 137.059 0 0 1-14.19-2.464c-24.547-5.692-45.627-17.327-63.044-34.699-29.942-29.851-43.722-74.257-36.832-116.199-62.212-10.3-110.838-65.771-110.838-129.431 0-0.182 0.023-0.354 0.023-0.536 0-0.194-0.023-0.376-0.023-0.57 0-0.148 0.068-0.274 0.08-0.411 0.445-36.866 16.836-71.919 44.805-96.546-28.345-24.98-44.885-60.672-44.885-98.074 0-64.151 48.923-119.61 111.591-129.556-1.506-7.791-2.259-15.49-2.259-22.996 0-71.177 60.33-131.302 131.735-131.302 63.09 0 118.606 46.756 129.636 108.968 1.403 3.741 2.11 7.585 2.11 11.441v243.36c0 0.011 0.011 0.034 0.011 0.057 0 0.011-0.011 0.011-0.011 0.023V734.39c12.297 52.619-8.36 107.04-52.88 138.978z m32.725-114.511c-3.764-33.615-22.631-62.725-51.775-79.915-5.452-3.205-7.266-10.22-4.038-15.661 3.217-5.43 10.266-7.243 15.73-4.015 14.806 8.726 27.273 20.098 37.277 33.239V494.862c0.148-17.874-6.696-34.745-19.277-47.497-12.582-12.764-29.406-19.87-47.36-20.03-6.342-0.057-11.441-5.213-11.384-11.544 0.057-6.274 5.179-11.338 11.475-11.338h0.103c24.091 0.205 46.653 9.764 63.546 26.874 1.095 1.106 1.871 2.43 2.897 3.582V251.707c0-1.243-0.285-2.601-0.844-3.912l-0.741-2.544c-8.692-51.923-54.775-91.071-107.2-91.071-58.961 0-108.785 49.653-108.785 108.42 0 1.221 0.251 2.509 0.297 3.741 0.068 0.433 0.285 0.81 0.297 1.255a87.926 87.926 0 0 0 2.19 16.848l0.068 0.308c3.867 16.528 12.513 31.574 25.209 43.448 14.772 13.825 33.524 21.501 53.463 22.916 5.019-14.064 18.365-24.205 34.163-24.205 20.076 0 36.41 16.277 36.41 36.284 0 19.996-16.334 36.285-36.41 36.285-16.14 0-29.703-10.608-34.459-25.14-25.711-1.483-49.881-11.669-68.873-29.452-11.338-10.608-20.041-23.247-25.95-37.094-53.44 6.65-95.736 53.201-95.736 107.359 0 34.939 17.578 68.098 47.03 88.709l13.38 9.365-13.38 9.365c-29.304 20.498-46.824 53.44-46.995 88.196 0.331 58.402 48.068 105.797 106.743 105.797 56.794 0 103.241-44.452 106.458-100.264-16.848-3.182-29.646-17.908-29.646-35.612 0-20.007 16.334-36.284 36.399-36.284 20.076 0 36.41 16.277 36.41 36.284 0 14.11-8.201 26.224-20.03 32.224-1.46 68.337-56.315 123.671-124.595 126.283-7.871 36.296 3.148 75.569 29.19 101.519 14.338 14.304 31.699 23.897 51.615 28.517 4.072 0.924 7.871 1.597 11.703 2.053l0.411 11.612 1.232-11.372c8.087 0.855 15.308 1.038 25.904-0.228a122.79 122.79 0 0 0 5.806-0.81c0.89-0.16 1.882-0.376 2.886-0.582 15.513-3 29.92-8.156 43.63-15.536 30.844-22.414 47.452-57.889 45.889-94.47-0.082-0.366-0.287-0.685-0.333-1.062zM361.818 363.23c0.023 7.369 6.046 13.369 13.437 13.369 7.414 0 13.448-6.023 13.448-13.403 0-7.391-6.034-13.403-13.448-13.403-7.266 0-13.14 5.806-13.357 13.004 0 0.159-0.08 0.285-0.08 0.433z m8.407 230.881c7.414 0 13.448-6.011 13.448-13.403s-6.034-13.403-13.448-13.403-13.448 6.011-13.448 13.403 6.034 13.403 13.448 13.403z" p-id="9929"></path></svg>`;
var PEN_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>`;
var TOOL_CATEGORIES = [
  { name: "Vault", items: ["searchNotes", "readNote", "listFolder", "createNote", "editNote", "getBacklinks"] },
  { name: "Time", items: ["getCurrentTime"] },
  { name: "Web Search & Content", items: ["webSearch", "cnNews", "webFetch", "tavilySearch", "tavilyExtract", "tavilyCrawl", "tavilyMap", "tavilyResearch", "tavilyResearchGet", "baiduBaike", "wikipedia"] },
  { name: "Academic Research", items: ["arxivSearch", "arxivDownload"] },
  { name: "Code & Repositories", items: ["githubSearch"] }
];
function buildSystemPrompt(toolDefs, settings, notebrainInstructions) {
  const toolMap = new Map(toolDefs.map((t2) => [t2.function.name, t2.function.description]));
  const lines = [];
  lines.push("Use these tools proactively. Fetch information yourself rather than asking the user.");
  lines.push("Take action rather than suggesting it. Call multiple tools in parallel when they are independent.");
  lines.push("");
  for (const cat of TOOL_CATEGORIES) {
    const enabled = cat.items.filter((n) => toolMap.has(n));
    if (enabled.length === 0) continue;
    lines.push(cat.name);
    for (const name of enabled) {
      const desc = toolMap.get(name) || "";
      lines.push(`  ${name} \u2014 ${desc}`);
    }
    lines.push("");
  }
  const capabilities = lines.join("\n");
  const extraRules = [];
  if (!settings.yamlEnabled) {
    extraRules.push("- NEVER create notes with YAML frontmatter (--- ... ---). The createNote tool will strip any frontmatter automatically.");
  }
  extraRules.push(`- When creating notes with createNote, NEVER include YAML frontmatter (--- ... ---) or an H1 title. The note header is injected automatically. Start content from the body text.`);
  const rulesBlock = [
    "- Give direct answers. Take action immediately. Be proactive.",
    "- When asked to search, look up, or find information, ALWAYS use tools \u2014 never simulate results.",
    "- If unsure, use tools first, then answer.",
    "- Keep responses concise. Use wikilinks [[file]] to reference files.",
    "- NEVER use createNote or editNote unless the user explicitly asks you to create or edit a note. Do not create notes just to summarize findings \u2014 answer in the chat instead.",
    "- When the user asks to create/edit a note, confirm the file name and location before proceeding.",
    ...extraRules
  ].join("\n");
  let xml = `<system>
<persona>
You are Notebrain, an AI agent inside the user's Obsidian vault. You autonomously help manage notes, search the vault, research topics, and solve problems. Answer in the same language the user uses.
</persona>

<capabilities>
${capabilities}
</capabilities>

<rules>
${rulesBlock}
</rules>`;
  if (notebrainInstructions) {
    xml += `

<vault_instructions>
The following is the user's NOTEBRAIN.md \u2014 it describes the vault structure, conventions, and preferences. Follow these instructions with highest priority.
${notebrainInstructions}
</vault_instructions>`;
  }
  xml += `
</system>`;
  return xml;
}
var NOTEBRAIN_MD_TEMPLATE = `---
tags:
  - notebrain
---

# NOTEBRAIN.md

This file provides guidance to Notebrain when working in this vault. It is automatically loaded and injected into the system prompt with highest priority.

## Vault Structure
- Describe your folder structure here so the AI knows where things belong.
- Example: Daily/ for daily notes, Projects/ for project plans, Reference/ for knowledge base.

## Note Conventions
- Describe your note-taking conventions: frontmatter fields, tag taxonomy, naming patterns.
- Example: All notes use "date" and "tags" in frontmatter. Meeting notes start with "Meeting -".

## Preferences
- Language: Chinese
- Response style: Concise
- Any other preferences the AI should follow.

## Rules
- Add custom rules for the AI here.
- Example: Never delete notes without confirmation. Always use [[wikilinks]] when referencing other notes.
`;
var NotebrainPlugin = class extends import_obsidian16.Plugin {
  constructor() {
    super(...arguments);
    this.systemPrompt = "You are Notebrain, an AI agent for Obsidian. Use tools when helpful. Answer in the same language as the user's message.";
    this.notebrainInstructions = "";
  }
  async onload() {
    await this.loadSettings();
    (0, import_obsidian16.addIcon)("brain", BRAIN_ICON);
    (0, import_obsidian16.addIcon)("pen", PEN_ICON);
    this.client = new DeepSeekClient(this.getApiConfig());
    registerAllBuiltinTools();
    setArxivVaultApp(this.app);
    setSearchNotesApp(this.app);
    setReadNoteApp(this.app);
    setCreateNoteApp(this.app);
    setEditNoteApp(this.app);
    setGetBacklinksApp(this.app);
    setListFolderApp(this.app);
    this.pushCreateNoteConfig();
    await this.loadNotebrainMd();
    this.refreshPrompt();
    this.addRibbonIcon("brain", "Chat with Notebrain", () => this.runChat());
    this.addRibbonIcon("pen", "FIM Completion", async () => {
      const view = this.app.workspace.getActiveViewOfType(import_obsidian16.MarkdownView);
      if (!view) {
        new import_obsidian16.Notice("Notebrain FIM: Open a note first.");
        return;
      }
      await runFimComplete(this, view.editor);
    });
    this.addCommand({
      id: "notebrain-chat",
      name: "Chat with Notebrain",
      icon: "brain",
      editorCallback: async (editor, ctx) => {
        const view = ctx.app.workspace.getActiveViewOfType(import_obsidian16.MarkdownView);
        if (!view) return;
        await runInlineChat(this, editor, view);
      },
      hotkeys: [{ modifiers: ["Mod", "Shift"], key: "Enter" }]
    });
    this.addCommand({
      id: "notebrain-chat-no-editor",
      name: "Chat with Notebrain",
      icon: "brain",
      callback: () => this.runChat()
    });
    this.addCommand({
      id: "notebrain-fim",
      name: "FIM Completion",
      icon: "pen",
      editorCallback: async (editor) => {
        await runFimComplete(this, editor);
      },
      hotkeys: []
    });
    this.addSettingTab(new NotebrainSettingTab(this.app, this));
  }
  refreshPrompt() {
    this.systemPrompt = buildSystemPrompt(
      getToolDefinitions(),
      this.settings,
      this.notebrainInstructions
    );
    const hasInstructions = this.notebrainInstructions ? this.notebrainInstructions.length : 0;
    console.log(`[Notebrain] refreshPrompt: systemPrompt=${this.systemPrompt.length} chars, notebrainInstructions=${hasInstructions} chars`);
  }
  async loadNotebrainMd() {
    const tag = this.settings.editPermissionTag;
    const bareTag = tag.replace(/^#/, "");
    const hasTag = (text) => {
      if (text.includes(tag) || text.includes(`#${bareTag}`)) return true;
      if (!/^---[\s\S]*?---/.test(text)) return false;
      const fm = text.match(/^---\n([\s\S]*?)---/)?.[1] || "";
      return fm.includes(bareTag);
    };
    const files = this.app.vault.getMarkdownFiles();
    for (const f of files) {
      if (f.basename.toLowerCase() !== "notebrain") continue;
      const cache = this.app.metadataCache.getFileCache(f);
      const inlineTags = (cache?.tags || []).map((t2) => t2.tag.replace(/^#/, ""));
      const fmTags = cache?.frontmatter?.tags?.map((t2) => String(t2)) || [];
      const allTags = [...inlineTags, ...fmTags];
      if (allTags.length > 0 && allTags.some((t2) => t2 === tag || t2 === bareTag || t2 === `#${bareTag}`)) {
        console.log(`[Notebrain] Loaded via API cache: ${f.path}`);
        this.notebrainInstructions = await this.app.vault.read(f);
        return;
      }
    }
    const adapter = this.app.vault.adapter;
    const found = await this.findNotebrainMdAdapter(adapter, "", hasTag);
    if (found) {
      console.log(`[Notebrain] Loaded via adapter: ${found.path} (${found.content.length} chars)`);
      this.notebrainInstructions = found.content;
      return;
    }
    const mdPath = this.settings.notebrainMdPath || "NOTEBRAIN.md";
    console.log(`[Notebrain] Creating default NOTEBRAIN.md at ${mdPath}...`);
    try {
      if (await adapter.exists(mdPath)) {
        this.notebrainInstructions = await adapter.read(mdPath);
        return;
      }
      const slashIdx = mdPath.lastIndexOf("/");
      if (slashIdx !== -1) {
        const folder = mdPath.slice(0, slashIdx);
        if (!await adapter.exists(folder)) {
          await this.app.vault.createFolder(folder);
        }
      }
      await this.app.vault.create(mdPath, NOTEBRAIN_MD_TEMPLATE);
      new import_obsidian16.Notice(`Notebrain: Created ${mdPath}. Edit it to customize AI behavior.`);
    } catch (e) {
      if (e.message?.includes("already exists")) {
        try {
          this.notebrainInstructions = await adapter.read(mdPath);
          return;
        } catch {
        }
      }
      console.error("[Notebrain] Failed to create NOTEBRAIN.md:", e.message);
    }
    if (!this.notebrainInstructions) {
      this.notebrainInstructions = NOTEBRAIN_MD_TEMPLATE;
    }
  }
  async findNotebrainMdAdapter(adapter, dir, hasTag) {
    const prefix = dir ? dir + "/" : "";
    try {
      const list = await adapter.list(dir || "/");
      for (const f of list.files) {
        if (f.toLowerCase() === "notebrain.md") {
          const fp = prefix + f;
          const content = await adapter.read(fp);
          if (hasTag(content)) return { path: fp, content };
          console.log(`[Notebrain] Found ${fp} but missing permission tag, accepting anyway`);
          return { path: fp, content };
        }
      }
      for (const sub of list.folders) {
        if (sub.startsWith(".")) continue;
        const r = await this.findNotebrainMdAdapter(adapter, prefix + sub, hasTag);
        if (r) return r;
      }
    } catch {
    }
    return null;
  }
  pushCreateNoteConfig() {
    setCreateNoteConfig({
      yamlEnabled: this.settings.yamlEnabled,
      noteTemplate: this.settings.noteTemplate
    });
    setEditNoteConfig({
      permissionTag: this.settings.editPermissionTag
    });
    setWebFetchConfig({
      headlessBrowserEndpoint: this.settings.headlessBrowserEndpoint
    });
    setDisabledTools(this.settings.disabledTools);
  }
  async runChat() {
    const view = this.app.workspace.getActiveViewOfType(import_obsidian16.MarkdownView);
    if (!view) {
      new import_obsidian16.Notice("Notebrain: Open a note first.");
      return;
    }
    const editor = view.editor;
    await runInlineChat(this, editor, view);
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    this.refreshPrompt();
    this.updateToolKeys();
    this.pushCreateNoteConfig();
  }
  async saveSettings() {
    await this.saveData(this.settings);
    this.client.updateConfig(this.getApiConfig());
    this.updateToolKeys();
    this.pushCreateNoteConfig();
    await this.loadNotebrainMd();
    this.refreshPrompt();
  }
  updateToolKeys() {
    setToolApiKeys({
      tavilyKey: this.settings.tavilyKey,
      githubKey: this.settings.githubKey,
      baiduKey: this.settings.baiduKey
    });
  }
  getApiConfig() {
    return {
      apiKey: this.settings.apiKey,
      baseUrl: this.settings.baseUrl,
      model: this.settings.model,
      thinkingEnabled: this.settings.thinkingEnabled,
      reasoningEffort: this.settings.reasoningEffort,
      temperature: this.settings.thinkingEnabled ? void 0 : this.settings.temperature
    };
  }
};
