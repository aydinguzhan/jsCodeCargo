import { app as g, BrowserWindow as V } from "electron";
import { fileURLToPath as x } from "node:url";
import p from "node:path";
import L from "fs";
import U from "path";
import C from "os";
import K from "crypto";
function Y(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var f = { exports: {} };
const N = L, m = U, j = C, k = K, y = [
  "◈ encrypted .env [www.dotenvx.com]",
  "◈ secrets for agents [www.dotenvx.com]",
  "⌁ auth for agents [www.vestauth.com]",
  "⌘ custom filepath { path: '/custom/path/.env' }",
  "⌘ enable debugging { debug: true }",
  "⌘ override existing { override: true }",
  "⌘ suppress logs { quiet: true }",
  "⌘ multiple files { path: ['.env.local', '.env'] }"
];
function B() {
  return y[Math.floor(Math.random() * y.length)];
}
function h(e) {
  return typeof e == "string" ? !["false", "0", "no", "off", ""].includes(e.toLowerCase()) : !!e;
}
function F() {
  return process.stdout.isTTY;
}
function S(e) {
  return F() ? `\x1B[2m${e}\x1B[0m` : e;
}
const M = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
function G(e) {
  const r = {};
  let n = e.toString();
  n = n.replace(/\r\n?/mg, `
`);
  let o;
  for (; (o = M.exec(n)) != null; ) {
    const c = o[1];
    let s = o[2] || "";
    s = s.trim();
    const t = s[0];
    s = s.replace(/^(['"`])([\s\S]*)\1$/mg, "$2"), t === '"' && (s = s.replace(/\\n/g, `
`), s = s.replace(/\\r/g, "\r")), r[c] = s;
  }
  return r;
}
function q(e) {
  e = e || {};
  const r = b(e);
  e.path = r;
  const n = l.configDotenv(e);
  if (!n.parsed) {
    const t = new Error(`MISSING_DATA: Cannot parse ${r} for an unknown reason`);
    throw t.code = "MISSING_DATA", t;
  }
  const o = $(e).split(","), c = o.length;
  let s;
  for (let t = 0; t < c; t++)
    try {
      const a = o[t].trim(), i = Q(n, a);
      s = l.decrypt(i.ciphertext, i.key);
      break;
    } catch (a) {
      if (t + 1 >= c)
        throw a;
    }
  return l.parse(s);
}
function W(e) {
  console.error(`⚠ ${e}`);
}
function _(e) {
  console.log(`┆ ${e}`);
}
function I(e) {
  console.log(`◇ ${e}`);
}
function $(e) {
  return e && e.DOTENV_KEY && e.DOTENV_KEY.length > 0 ? e.DOTENV_KEY : process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0 ? process.env.DOTENV_KEY : "";
}
function Q(e, r) {
  let n;
  try {
    n = new URL(r);
  } catch (a) {
    if (a.code === "ERR_INVALID_URL") {
      const i = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
      throw i.code = "INVALID_DOTENV_KEY", i;
    }
    throw a;
  }
  const o = n.password;
  if (!o) {
    const a = new Error("INVALID_DOTENV_KEY: Missing key part");
    throw a.code = "INVALID_DOTENV_KEY", a;
  }
  const c = n.searchParams.get("environment");
  if (!c) {
    const a = new Error("INVALID_DOTENV_KEY: Missing environment part");
    throw a.code = "INVALID_DOTENV_KEY", a;
  }
  const s = `DOTENV_VAULT_${c.toUpperCase()}`, t = e.parsed[s];
  if (!t) {
    const a = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${s} in your .env.vault file.`);
    throw a.code = "NOT_FOUND_DOTENV_ENVIRONMENT", a;
  }
  return { ciphertext: t, key: o };
}
function b(e) {
  let r = null;
  if (e && e.path && e.path.length > 0)
    if (Array.isArray(e.path))
      for (const n of e.path)
        N.existsSync(n) && (r = n.endsWith(".vault") ? n : `${n}.vault`);
    else
      r = e.path.endsWith(".vault") ? e.path : `${e.path}.vault`;
  else
    r = m.resolve(process.cwd(), ".env.vault");
  return N.existsSync(r) ? r : null;
}
function w(e) {
  return e[0] === "~" ? m.join(j.homedir(), e.slice(1)) : e;
}
function J(e) {
  const r = h(process.env.DOTENV_CONFIG_DEBUG || e && e.debug), n = h(process.env.DOTENV_CONFIG_QUIET || e && e.quiet);
  (r || !n) && I("loading env from encrypted .env.vault");
  const o = l._parseVault(e);
  let c = process.env;
  return e && e.processEnv != null && (c = e.processEnv), l.populate(c, o, e), { parsed: o };
}
function H(e) {
  const r = m.resolve(process.cwd(), ".env");
  let n = "utf8", o = process.env;
  e && e.processEnv != null && (o = e.processEnv);
  let c = h(o.DOTENV_CONFIG_DEBUG || e && e.debug), s = h(o.DOTENV_CONFIG_QUIET || e && e.quiet);
  e && e.encoding ? n = e.encoding : c && _("no encoding is specified (UTF-8 is used by default)");
  let t = [r];
  if (e && e.path)
    if (!Array.isArray(e.path))
      t = [w(e.path)];
    else {
      t = [];
      for (const u of e.path)
        t.push(w(u));
    }
  let a;
  const i = {};
  for (const u of t)
    try {
      const E = l.parse(N.readFileSync(u, { encoding: n }));
      l.populate(i, E, e);
    } catch (E) {
      c && _(`failed to load ${u} ${E.message}`), a = E;
    }
  const D = l.populate(o, i, e);
  if (c = h(o.DOTENV_CONFIG_DEBUG || c), s = h(o.DOTENV_CONFIG_QUIET || s), c || !s) {
    const u = Object.keys(D).length, E = [];
    for (const O of t)
      try {
        const v = m.relative(process.cwd(), O);
        E.push(v);
      } catch (v) {
        c && _(`failed to load ${O} ${v.message}`), a = v;
      }
    I(`injected env (${u}) from ${E.join(",")} ${S(`// tip: ${B()}`)}`);
  }
  return a ? { parsed: i, error: a } : { parsed: i };
}
function z(e) {
  if ($(e).length === 0)
    return l.configDotenv(e);
  const r = b(e);
  return r ? l._configVault(e) : (W(`you set DOTENV_KEY but you are missing a .env.vault file at ${r}`), l.configDotenv(e));
}
function X(e, r) {
  const n = Buffer.from(r.slice(-64), "hex");
  let o = Buffer.from(e, "base64");
  const c = o.subarray(0, 12), s = o.subarray(-16);
  o = o.subarray(12, -16);
  try {
    const t = k.createDecipheriv("aes-256-gcm", n, c);
    return t.setAuthTag(s), `${t.update(o)}${t.final()}`;
  } catch (t) {
    const a = t instanceof RangeError, i = t.message === "Invalid key length", D = t.message === "Unsupported state or unable to authenticate data";
    if (a || i) {
      const u = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
      throw u.code = "INVALID_DOTENV_KEY", u;
    } else if (D) {
      const u = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
      throw u.code = "DECRYPTION_FAILED", u;
    } else
      throw t;
  }
}
function Z(e, r, n = {}) {
  const o = !!(n && n.debug), c = !!(n && n.override), s = {};
  if (typeof r != "object") {
    const t = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
    throw t.code = "OBJECT_REQUIRED", t;
  }
  for (const t of Object.keys(r))
    Object.prototype.hasOwnProperty.call(e, t) ? (c === !0 && (e[t] = r[t], s[t] = r[t]), o && _(c === !0 ? `"${t}" is already defined and WAS overwritten` : `"${t}" is already defined and was NOT overwritten`)) : (e[t] = r[t], s[t] = r[t]);
  return s;
}
const l = {
  configDotenv: H,
  _configVault: J,
  _parseVault: q,
  config: z,
  decrypt: X,
  parse: G,
  populate: Z
};
f.exports.configDotenv = l.configDotenv;
f.exports._configVault = l._configVault;
f.exports._parseVault = l._parseVault;
f.exports.config = l.config;
f.exports.decrypt = l.decrypt;
f.exports.parse = l.parse;
f.exports.populate = l.populate;
f.exports = l;
var ee = f.exports;
const te = /* @__PURE__ */ Y(ee);
te.config();
const R = p.dirname(x(import.meta.url));
process.env.APP_ROOT = p.join(R, "..");
const T = process.env.VITE_DEV_SERVER_URL, ie = p.join(process.env.APP_ROOT, "dist-electron"), A = p.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = T ? p.join(process.env.APP_ROOT, "public") : A;
let d;
function P() {
  d = new V({
    icon: p.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: p.join(R, "preload.mjs")
    }
  }), d.webContents.on("did-finish-load", () => {
    d == null || d.webContents.send("main-process-message", "Merhaba");
  }), T ? d.loadURL(T) : d.loadFile(p.join(A, "index.html"));
}
g.on("window-all-closed", () => {
  process.platform !== "darwin" && (g.quit(), d = null);
});
g.on("activate", () => {
  V.getAllWindows().length === 0 && P();
});
g.whenReady().then(P);
export {
  ie as MAIN_DIST,
  A as RENDERER_DIST,
  T as VITE_DEV_SERVER_URL
};
