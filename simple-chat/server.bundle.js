// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.

// This is a specialised implementation of a System module loader.

"use strict";

// @ts-nocheck
/* eslint-disable */
let System, __instantiate;
(() => {
  const r = new Map();

  System = {
    register(id, d, f) {
      r.set(id, { d, f, exp: {} });
    },
  };
  async function dI(mid, src) {
    let id = mid.replace(/\.\w+$/i, "");
    if (id.includes("./")) {
      const [o, ...ia] = id.split("/").reverse(),
        [, ...sa] = src.split("/").reverse(),
        oa = [o];
      let s = 0,
        i;
      while ((i = ia.shift())) {
        if (i === "..") s++;
        else if (i === ".") break;
        else oa.push(i);
      }
      if (s < sa.length) oa.push(...sa.slice(s));
      id = oa.reverse().join("/");
    }
    return r.has(id) ? gExpA(id) : import(mid);
  }

  function gC(id, main) {
    return {
      id,
      import: (m) => dI(m, id),
      meta: { url: id, main },
    };
  }

  function gE(exp) {
    return (id, v) => {
      v = typeof id === "string" ? { [id]: v } : id;
      for (const [id, value] of Object.entries(v)) {
        Object.defineProperty(exp, id, {
          value,
          writable: true,
          enumerable: true,
        });
      }
    };
  }

  function rF(main) {
    for (const [id, m] of r.entries()) {
      const { f, exp } = m;
      const { execute: e, setters: s } = f(gE(exp), gC(id, id === main));
      delete m.f;
      m.e = e;
      m.s = s;
    }
  }

  async function gExpA(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](await gExpA(d[i]));
      const r = e();
      if (r) await r;
    }
    return m.exp;
  }

  function gExp(id) {
    if (!r.has(id)) return;
    const m = r.get(id);
    if (m.s) {
      const { d, e, s } = m;
      delete m.s;
      delete m.e;
      for (let i = 0; i < s.length; i++) s[i](gExp(d[i]));
      e();
    }
    return m.exp;
  }
  __instantiate = (m, a) => {
    System = __instantiate = undefined;
    rF(m);
    return a ? gExpA(m) : gExp(m);
  };
})();

System.register(
  "https://deno.land/std/encoding/utf8",
  [],
  function (exports_1, context_1) {
    "use strict";
    var encoder, decoder;
    var __moduleName = context_1 && context_1.id;
    /** Shorthand for new TextEncoder().encode() */
    function encode(input) {
      return encoder.encode(input);
    }
    exports_1("encode", encode);
    /** Shorthand for new TextDecoder().decode() */
    function decode(input) {
      return decoder.decode(input);
    }
    exports_1("decode", decode);
    return {
      setters: [],
      execute: function () {
        /** A default TextEncoder instance */
        exports_1("encoder", encoder = new TextEncoder());
        /** A default TextDecoder instance */
        exports_1("decoder", decoder = new TextDecoder());
      },
    };
  },
);
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
System.register(
  "https://deno.land/std/bytes/mod",
  [],
  function (exports_2, context_2) {
    "use strict";
    var __moduleName = context_2 && context_2.id;
    /** Find first index of binary pattern from a. If not found, then return -1
     * @param source source array
     * @param pat pattern to find in source array
     */
    function findIndex(source, pat) {
      const s = pat[0];
      for (let i = 0; i < source.length; i++) {
        if (source[i] !== s) {
          continue;
        }
        const pin = i;
        let matched = 1;
        let j = i;
        while (matched < pat.length) {
          j++;
          if (source[j] !== pat[j - pin]) {
            break;
          }
          matched++;
        }
        if (matched === pat.length) {
          return pin;
        }
      }
      return -1;
    }
    exports_2("findIndex", findIndex);
    /** Find last index of binary pattern from a. If not found, then return -1.
     * @param source source array
     * @param pat pattern to find in source array
     */
    function findLastIndex(source, pat) {
      const e = pat[pat.length - 1];
      for (let i = source.length - 1; i >= 0; i--) {
        if (source[i] !== e) {
          continue;
        }
        const pin = i;
        let matched = 1;
        let j = i;
        while (matched < pat.length) {
          j--;
          if (source[j] !== pat[pat.length - 1 - (pin - j)]) {
            break;
          }
          matched++;
        }
        if (matched === pat.length) {
          return pin - pat.length + 1;
        }
      }
      return -1;
    }
    exports_2("findLastIndex", findLastIndex);
    /** Check whether binary arrays are equal to each other.
     * @param source first array to check equality
     * @param match second array to check equality
     */
    function equal(source, match) {
      if (source.length !== match.length) {
        return false;
      }
      for (let i = 0; i < match.length; i++) {
        if (source[i] !== match[i]) {
          return false;
        }
      }
      return true;
    }
    exports_2("equal", equal);
    /** Check whether binary array starts with prefix.
     * @param source srouce array
     * @param prefix prefix array to check in source
     */
    function hasPrefix(source, prefix) {
      for (let i = 0, max = prefix.length; i < max; i++) {
        if (source[i] !== prefix[i]) {
          return false;
        }
      }
      return true;
    }
    exports_2("hasPrefix", hasPrefix);
    /** Check whether binary array ends with suffix.
     * @param source source array
     * @param suffix suffix array to check in source
     */
    function hasSuffix(source, suffix) {
      for (
        let srci = source.length - 1, sfxi = suffix.length - 1;
        sfxi >= 0;
        srci--, sfxi--
      ) {
        if (source[srci] !== suffix[sfxi]) {
          return false;
        }
      }
      return true;
    }
    exports_2("hasSuffix", hasSuffix);
    /** Repeat bytes. returns a new byte slice consisting of `count` copies of `b`.
     * @param origin The origin bytes
     * @param count The count you want to repeat.
     */
    function repeat(origin, count) {
      if (count === 0) {
        return new Uint8Array();
      }
      if (count < 0) {
        throw new Error("bytes: negative repeat count");
      } else if ((origin.length * count) / count !== origin.length) {
        throw new Error("bytes: repeat count causes overflow");
      }
      const int = Math.floor(count);
      if (int !== count) {
        throw new Error("bytes: repeat count must be an integer");
      }
      const nb = new Uint8Array(origin.length * count);
      let bp = copyBytes(origin, nb);
      for (; bp < nb.length; bp *= 2) {
        copyBytes(nb.slice(0, bp), nb, bp);
      }
      return nb;
    }
    exports_2("repeat", repeat);
    /** Concatenate two binary arrays and return new one.
     * @param origin origin array to concatenate
     * @param b array to concatenate with origin
     */
    function concat(origin, b) {
      const output = new Uint8Array(origin.length + b.length);
      output.set(origin, 0);
      output.set(b, origin.length);
      return output;
    }
    exports_2("concat", concat);
    /** Check source array contains pattern array.
     * @param source source array
     * @param pat patter array
     */
    function contains(source, pat) {
      return findIndex(source, pat) != -1;
    }
    exports_2("contains", contains);
    /**
     * Copy bytes from one Uint8Array to another.  Bytes from `src` which don't fit
     * into `dst` will not be copied.
     *
     * @param src Source byte array
     * @param dst Destination byte array
     * @param off Offset into `dst` at which to begin writing values from `src`.
     * @return number of bytes copied
     */
    function copyBytes(src, dst, off = 0) {
      off = Math.max(0, Math.min(off, dst.byteLength));
      const dstBytesAvailable = dst.byteLength - off;
      if (src.byteLength > dstBytesAvailable) {
        src = src.subarray(0, dstBytesAvailable);
      }
      dst.set(src, off);
      return src.byteLength;
    }
    exports_2("copyBytes", copyBytes);
    return {
      setters: [],
      execute: function () {
      },
    };
  },
);
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
System.register(
  "https://deno.land/std/_util/assert",
  [],
  function (exports_3, context_3) {
    "use strict";
    var DenoStdInternalError;
    var __moduleName = context_3 && context_3.id;
    /** Make an assertion, if not `true`, then throw. */
    function assert(expr, msg = "") {
      if (!expr) {
        throw new DenoStdInternalError(msg);
      }
    }
    exports_3("assert", assert);
    return {
      setters: [],
      execute: function () {
        DenoStdInternalError = class DenoStdInternalError extends Error {
          constructor(message) {
            super(message);
            this.name = "DenoStdInternalError";
          }
        };
        exports_3("DenoStdInternalError", DenoStdInternalError);
      },
    };
  },
);
// Based on https://github.com/golang/go/blob/891682/src/bufio/bufio.go
// Copyright 2009 The Go Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
System.register(
  "https://deno.land/std/io/bufio",
  ["https://deno.land/std/bytes/mod", "https://deno.land/std/_util/assert"],
  function (exports_4, context_4) {
    "use strict";
    var mod_ts_1,
      assert_ts_1,
      DEFAULT_BUF_SIZE,
      MIN_BUF_SIZE,
      MAX_CONSECUTIVE_EMPTY_READS,
      CR,
      LF,
      BufferFullError,
      PartialReadError,
      BufReader,
      AbstractBufBase,
      BufWriter,
      BufWriterSync;
    var __moduleName = context_4 && context_4.id;
    /** Generate longest proper prefix which is also suffix array. */
    function createLPS(pat) {
      const lps = new Uint8Array(pat.length);
      lps[0] = 0;
      let prefixEnd = 0;
      let i = 1;
      while (i < lps.length) {
        if (pat[i] == pat[prefixEnd]) {
          prefixEnd++;
          lps[i] = prefixEnd;
          i++;
        } else if (prefixEnd === 0) {
          lps[i] = 0;
          i++;
        } else {
          prefixEnd = pat[prefixEnd - 1];
        }
      }
      return lps;
    }
    /** Read delimited bytes from a Reader. */
    async function* readDelim(reader, delim) {
      // Avoid unicode problems
      const delimLen = delim.length;
      const delimLPS = createLPS(delim);
      let inputBuffer = new Deno.Buffer();
      const inspectArr = new Uint8Array(Math.max(1024, delimLen + 1));
      // Modified KMP
      let inspectIndex = 0;
      let matchIndex = 0;
      while (true) {
        const result = await reader.read(inspectArr);
        if (result === null) {
          // Yield last chunk.
          yield inputBuffer.bytes();
          return;
        }
        if (result < 0) {
          // Discard all remaining and silently fail.
          return;
        }
        const sliceRead = inspectArr.subarray(0, result);
        await Deno.writeAll(inputBuffer, sliceRead);
        let sliceToProcess = inputBuffer.bytes();
        while (inspectIndex < sliceToProcess.length) {
          if (sliceToProcess[inspectIndex] === delim[matchIndex]) {
            inspectIndex++;
            matchIndex++;
            if (matchIndex === delimLen) {
              // Full match
              const matchEnd = inspectIndex - delimLen;
              const readyBytes = sliceToProcess.subarray(0, matchEnd);
              // Copy
              const pendingBytes = sliceToProcess.slice(inspectIndex);
              yield readyBytes;
              // Reset match, different from KMP.
              sliceToProcess = pendingBytes;
              inspectIndex = 0;
              matchIndex = 0;
            }
          } else {
            if (matchIndex === 0) {
              inspectIndex++;
            } else {
              matchIndex = delimLPS[matchIndex - 1];
            }
          }
        }
        // Keep inspectIndex and matchIndex.
        inputBuffer = new Deno.Buffer(sliceToProcess);
      }
    }
    exports_4("readDelim", readDelim);
    /** Read delimited strings from a Reader. */
    async function* readStringDelim(reader, delim) {
      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      for await (const chunk of readDelim(reader, encoder.encode(delim))) {
        yield decoder.decode(chunk);
      }
    }
    exports_4("readStringDelim", readStringDelim);
    /** Read strings line-by-line from a Reader. */
    // eslint-disable-next-line require-await
    async function* readLines(reader) {
      yield* readStringDelim(reader, "\n");
    }
    exports_4("readLines", readLines);
    return {
      setters: [
        function (mod_ts_1_1) {
          mod_ts_1 = mod_ts_1_1;
        },
        function (assert_ts_1_1) {
          assert_ts_1 = assert_ts_1_1;
        },
      ],
      execute: function () {
        DEFAULT_BUF_SIZE = 4096;
        MIN_BUF_SIZE = 16;
        MAX_CONSECUTIVE_EMPTY_READS = 100;
        CR = "\r".charCodeAt(0);
        LF = "\n".charCodeAt(0);
        BufferFullError = class BufferFullError extends Error {
          constructor(partial) {
            super("Buffer full");
            this.partial = partial;
            this.name = "BufferFullError";
          }
        };
        exports_4("BufferFullError", BufferFullError);
        PartialReadError = class PartialReadError
          extends Deno.errors.UnexpectedEof {
          constructor() {
            super("Encountered UnexpectedEof, data only partially read");
            this.name = "PartialReadError";
          }
        };
        exports_4("PartialReadError", PartialReadError);
        /** BufReader implements buffering for a Reader object. */
        BufReader = class BufReader {
          constructor(rd, size = DEFAULT_BUF_SIZE) {
            this.r = 0; // buf read position.
            this.w = 0; // buf write position.
            this.eof = false;
            if (size < MIN_BUF_SIZE) {
              size = MIN_BUF_SIZE;
            }
            this._reset(new Uint8Array(size), rd);
          }
          // private lastByte: number;
          // private lastCharSize: number;
          /** return new BufReader unless r is BufReader */
          static create(r, size = DEFAULT_BUF_SIZE) {
            return r instanceof BufReader ? r : new BufReader(r, size);
          }
          /** Returns the size of the underlying buffer in bytes. */
          size() {
            return this.buf.byteLength;
          }
          buffered() {
            return this.w - this.r;
          }
          // Reads a new chunk into the buffer.
          async _fill() {
            // Slide existing data to beginning.
            if (this.r > 0) {
              this.buf.copyWithin(0, this.r, this.w);
              this.w -= this.r;
              this.r = 0;
            }
            if (this.w >= this.buf.byteLength) {
              throw Error("bufio: tried to fill full buffer");
            }
            // Read new data: try a limited number of times.
            for (let i = MAX_CONSECUTIVE_EMPTY_READS; i > 0; i--) {
              const rr = await this.rd.read(this.buf.subarray(this.w));
              if (rr === null) {
                this.eof = true;
                return;
              }
              assert_ts_1.assert(rr >= 0, "negative read");
              this.w += rr;
              if (rr > 0) {
                return;
              }
            }
            throw new Error(
              `No progress after ${MAX_CONSECUTIVE_EMPTY_READS} read() calls`,
            );
          }
          /** Discards any buffered data, resets all state, and switches
                 * the buffered reader to read from r.
                 */
          reset(r) {
            this._reset(this.buf, r);
          }
          _reset(buf, rd) {
            this.buf = buf;
            this.rd = rd;
            this.eof = false;
            // this.lastByte = -1;
            // this.lastCharSize = -1;
          }
          /** reads data into p.
                 * It returns the number of bytes read into p.
                 * The bytes are taken from at most one Read on the underlying Reader,
                 * hence n may be less than len(p).
                 * To read exactly len(p) bytes, use io.ReadFull(b, p).
                 */
          async read(p) {
            let rr = p.byteLength;
            if (p.byteLength === 0) {
              return rr;
            }
            if (this.r === this.w) {
              if (p.byteLength >= this.buf.byteLength) {
                // Large read, empty buffer.
                // Read directly into p to avoid copy.
                const rr = await this.rd.read(p);
                const nread = rr ?? 0;
                assert_ts_1.assert(nread >= 0, "negative read");
                // if (rr.nread > 0) {
                //   this.lastByte = p[rr.nread - 1];
                //   this.lastCharSize = -1;
                // }
                return rr;
              }
              // One read.
              // Do not use this.fill, which will loop.
              this.r = 0;
              this.w = 0;
              rr = await this.rd.read(this.buf);
              if (rr === 0 || rr === null) {
                return rr;
              }
              assert_ts_1.assert(rr >= 0, "negative read");
              this.w += rr;
            }
            // copy as much as we can
            const copied = mod_ts_1.copyBytes(
              this.buf.subarray(this.r, this.w),
              p,
              0,
            );
            this.r += copied;
            // this.lastByte = this.buf[this.r - 1];
            // this.lastCharSize = -1;
            return copied;
          }
          /** reads exactly `p.length` bytes into `p`.
                 *
                 * If successful, `p` is returned.
                 *
                 * If the end of the underlying stream has been reached, and there are no more
                 * bytes available in the buffer, `readFull()` returns `null` instead.
                 *
                 * An error is thrown if some bytes could be read, but not enough to fill `p`
                 * entirely before the underlying stream reported an error or EOF. Any error
                 * thrown will have a `partial` property that indicates the slice of the
                 * buffer that has been successfully filled with data.
                 *
                 * Ported from https://golang.org/pkg/io/#ReadFull
                 */
          async readFull(p) {
            let bytesRead = 0;
            while (bytesRead < p.length) {
              try {
                const rr = await this.read(p.subarray(bytesRead));
                if (rr === null) {
                  if (bytesRead === 0) {
                    return null;
                  } else {
                    throw new PartialReadError();
                  }
                }
                bytesRead += rr;
              } catch (err) {
                err.partial = p.subarray(0, bytesRead);
                throw err;
              }
            }
            return p;
          }
          /** Returns the next byte [0, 255] or `null`. */
          async readByte() {
            while (this.r === this.w) {
              if (this.eof) {
                return null;
              }
              await this._fill(); // buffer is empty.
            }
            const c = this.buf[this.r];
            this.r++;
            // this.lastByte = c;
            return c;
          }
          /** readString() reads until the first occurrence of delim in the input,
                 * returning a string containing the data up to and including the delimiter.
                 * If ReadString encounters an error before finding a delimiter,
                 * it returns the data read before the error and the error itself
                 * (often `null`).
                 * ReadString returns err != nil if and only if the returned data does not end
                 * in delim.
                 * For simple uses, a Scanner may be more convenient.
                 */
          async readString(delim) {
            if (delim.length !== 1) {
              throw new Error("Delimiter should be a single character");
            }
            const buffer = await this.readSlice(delim.charCodeAt(0));
            if (buffer === null) {
              return null;
            }
            return new TextDecoder().decode(buffer);
          }
          /** `readLine()` is a low-level line-reading primitive. Most callers should
                 * use `readString('\n')` instead or use a Scanner.
                 *
                 * `readLine()` tries to return a single line, not including the end-of-line
                 * bytes. If the line was too long for the buffer then `more` is set and the
                 * beginning of the line is returned. The rest of the line will be returned
                 * from future calls. `more` will be false when returning the last fragment
                 * of the line. The returned buffer is only valid until the next call to
                 * `readLine()`.
                 *
                 * The text returned from ReadLine does not include the line end ("\r\n" or
                 * "\n").
                 *
                 * When the end of the underlying stream is reached, the final bytes in the
                 * stream are returned. No indication or error is given if the input ends
                 * without a final line end. When there are no more trailing bytes to read,
                 * `readLine()` returns `null`.
                 *
                 * Calling `unreadByte()` after `readLine()` will always unread the last byte
                 * read (possibly a character belonging to the line end) even if that byte is
                 * not part of the line returned by `readLine()`.
                 */
          async readLine() {
            let line;
            try {
              line = await this.readSlice(LF);
            } catch (err) {
              let { partial } = err;
              assert_ts_1.assert(
                partial instanceof Uint8Array,
                "bufio: caught error from `readSlice()` without `partial` property",
              );
              // Don't throw if `readSlice()` failed with `BufferFullError`, instead we
              // just return whatever is available and set the `more` flag.
              if (!(err instanceof BufferFullError)) {
                throw err;
              }
              // Handle the case where "\r\n" straddles the buffer.
              if (
                !this.eof &&
                partial.byteLength > 0 &&
                partial[partial.byteLength - 1] === CR
              ) {
                // Put the '\r' back on buf and drop it from line.
                // Let the next call to ReadLine check for "\r\n".
                assert_ts_1.assert(
                  this.r > 0,
                  "bufio: tried to rewind past start of buffer",
                );
                this.r--;
                partial = partial.subarray(0, partial.byteLength - 1);
              }
              return { line: partial, more: !this.eof };
            }
            if (line === null) {
              return null;
            }
            if (line.byteLength === 0) {
              return { line, more: false };
            }
            if (line[line.byteLength - 1] == LF) {
              let drop = 1;
              if (line.byteLength > 1 && line[line.byteLength - 2] === CR) {
                drop = 2;
              }
              line = line.subarray(0, line.byteLength - drop);
            }
            return { line, more: false };
          }
          /** `readSlice()` reads until the first occurrence of `delim` in the input,
                 * returning a slice pointing at the bytes in the buffer. The bytes stop
                 * being valid at the next read.
                 *
                 * If `readSlice()` encounters an error before finding a delimiter, or the
                 * buffer fills without finding a delimiter, it throws an error with a
                 * `partial` property that contains the entire buffer.
                 *
                 * If `readSlice()` encounters the end of the underlying stream and there are
                 * any bytes left in the buffer, the rest of the buffer is returned. In other
                 * words, EOF is always treated as a delimiter. Once the buffer is empty,
                 * it returns `null`.
                 *
                 * Because the data returned from `readSlice()` will be overwritten by the
                 * next I/O operation, most clients should use `readString()` instead.
                 */
          async readSlice(delim) {
            let s = 0; // search start index
            let slice;
            while (true) {
              // Search buffer.
              let i = this.buf.subarray(this.r + s, this.w).indexOf(delim);
              if (i >= 0) {
                i += s;
                slice = this.buf.subarray(this.r, this.r + i + 1);
                this.r += i + 1;
                break;
              }
              // EOF?
              if (this.eof) {
                if (this.r === this.w) {
                  return null;
                }
                slice = this.buf.subarray(this.r, this.w);
                this.r = this.w;
                break;
              }
              // Buffer full?
              if (this.buffered() >= this.buf.byteLength) {
                this.r = this.w;
                // #4521 The internal buffer should not be reused across reads because it causes corruption of data.
                const oldbuf = this.buf;
                const newbuf = this.buf.slice(0);
                this.buf = newbuf;
                throw new BufferFullError(oldbuf);
              }
              s = this.w - this.r; // do not rescan area we scanned before
              // Buffer is not full.
              try {
                await this._fill();
              } catch (err) {
                err.partial = slice;
                throw err;
              }
            }
            // Handle last byte, if any.
            // const i = slice.byteLength - 1;
            // if (i >= 0) {
            //   this.lastByte = slice[i];
            //   this.lastCharSize = -1
            // }
            return slice;
          }
          /** `peek()` returns the next `n` bytes without advancing the reader. The
                 * bytes stop being valid at the next read call.
                 *
                 * When the end of the underlying stream is reached, but there are unread
                 * bytes left in the buffer, those bytes are returned. If there are no bytes
                 * left in the buffer, it returns `null`.
                 *
                 * If an error is encountered before `n` bytes are available, `peek()` throws
                 * an error with the `partial` property set to a slice of the buffer that
                 * contains the bytes that were available before the error occurred.
                 */
          async peek(n) {
            if (n < 0) {
              throw Error("negative count");
            }
            let avail = this.w - this.r;
            while (avail < n && avail < this.buf.byteLength && !this.eof) {
              try {
                await this._fill();
              } catch (err) {
                err.partial = this.buf.subarray(this.r, this.w);
                throw err;
              }
              avail = this.w - this.r;
            }
            if (avail === 0 && this.eof) {
              return null;
            } else if (avail < n && this.eof) {
              return this.buf.subarray(this.r, this.r + avail);
            } else if (avail < n) {
              throw new BufferFullError(this.buf.subarray(this.r, this.w));
            }
            return this.buf.subarray(this.r, this.r + n);
          }
        };
        exports_4("BufReader", BufReader);
        AbstractBufBase = class AbstractBufBase {
          constructor() {
            this.usedBufferBytes = 0;
            this.err = null;
          }
          /** Size returns the size of the underlying buffer in bytes. */
          size() {
            return this.buf.byteLength;
          }
          /** Returns how many bytes are unused in the buffer. */
          available() {
            return this.buf.byteLength - this.usedBufferBytes;
          }
          /** buffered returns the number of bytes that have been written into the
                 * current buffer.
                 */
          buffered() {
            return this.usedBufferBytes;
          }
        };
        /** BufWriter implements buffering for an deno.Writer object.
             * If an error occurs writing to a Writer, no more data will be
             * accepted and all subsequent writes, and flush(), will return the error.
             * After all data has been written, the client should call the
             * flush() method to guarantee all data has been forwarded to
             * the underlying deno.Writer.
             */
        BufWriter = class BufWriter extends AbstractBufBase {
          constructor(writer, size = DEFAULT_BUF_SIZE) {
            super();
            this.writer = writer;
            if (size <= 0) {
              size = DEFAULT_BUF_SIZE;
            }
            this.buf = new Uint8Array(size);
          }
          /** return new BufWriter unless writer is BufWriter */
          static create(writer, size = DEFAULT_BUF_SIZE) {
            return writer instanceof BufWriter
              ? writer
              : new BufWriter(writer, size);
          }
          /** Discards any unflushed buffered data, clears any error, and
                 * resets buffer to write its output to w.
                 */
          reset(w) {
            this.err = null;
            this.usedBufferBytes = 0;
            this.writer = w;
          }
          /** Flush writes any buffered data to the underlying io.Writer. */
          async flush() {
            if (this.err !== null) {
              throw this.err;
            }
            if (this.usedBufferBytes === 0) {
              return;
            }
            try {
              await Deno.writeAll(
                this.writer,
                this.buf.subarray(0, this.usedBufferBytes),
              );
            } catch (e) {
              this.err = e;
              throw e;
            }
            this.buf = new Uint8Array(this.buf.length);
            this.usedBufferBytes = 0;
          }
          /** Writes the contents of `data` into the buffer.  If the contents won't fully
                 * fit into the buffer, those bytes that can are copied into the buffer, the
                 * buffer is the flushed to the writer and the remaining bytes are copied into
                 * the now empty buffer.
                 *
                 * @return the number of bytes written to the buffer.
                 */
          async write(data) {
            if (this.err !== null) {
              throw this.err;
            }
            if (data.length === 0) {
              return 0;
            }
            let totalBytesWritten = 0;
            let numBytesWritten = 0;
            while (data.byteLength > this.available()) {
              if (this.buffered() === 0) {
                // Large write, empty buffer.
                // Write directly from data to avoid copy.
                try {
                  numBytesWritten = await this.writer.write(data);
                } catch (e) {
                  this.err = e;
                  throw e;
                }
              } else {
                numBytesWritten = mod_ts_1.copyBytes(
                  data,
                  this.buf,
                  this.usedBufferBytes,
                );
                this.usedBufferBytes += numBytesWritten;
                await this.flush();
              }
              totalBytesWritten += numBytesWritten;
              data = data.subarray(numBytesWritten);
            }
            numBytesWritten = mod_ts_1.copyBytes(
              data,
              this.buf,
              this.usedBufferBytes,
            );
            this.usedBufferBytes += numBytesWritten;
            totalBytesWritten += numBytesWritten;
            return totalBytesWritten;
          }
        };
        exports_4("BufWriter", BufWriter);
        /** BufWriterSync implements buffering for a deno.WriterSync object.
             * If an error occurs writing to a WriterSync, no more data will be
             * accepted and all subsequent writes, and flush(), will return the error.
             * After all data has been written, the client should call the
             * flush() method to guarantee all data has been forwarded to
             * the underlying deno.WriterSync.
             */
        BufWriterSync = class BufWriterSync extends AbstractBufBase {
          constructor(writer, size = DEFAULT_BUF_SIZE) {
            super();
            this.writer = writer;
            if (size <= 0) {
              size = DEFAULT_BUF_SIZE;
            }
            this.buf = new Uint8Array(size);
          }
          /** return new BufWriterSync unless writer is BufWriterSync */
          static create(writer, size = DEFAULT_BUF_SIZE) {
            return writer instanceof BufWriterSync
              ? writer
              : new BufWriterSync(writer, size);
          }
          /** Discards any unflushed buffered data, clears any error, and
                 * resets buffer to write its output to w.
                 */
          reset(w) {
            this.err = null;
            this.usedBufferBytes = 0;
            this.writer = w;
          }
          /** Flush writes any buffered data to the underlying io.WriterSync. */
          flush() {
            if (this.err !== null) {
              throw this.err;
            }
            if (this.usedBufferBytes === 0) {
              return;
            }
            try {
              Deno.writeAllSync(
                this.writer,
                this.buf.subarray(0, this.usedBufferBytes),
              );
            } catch (e) {
              this.err = e;
              throw e;
            }
            this.buf = new Uint8Array(this.buf.length);
            this.usedBufferBytes = 0;
          }
          /** Writes the contents of `data` into the buffer.  If the contents won't fully
                 * fit into the buffer, those bytes that can are copied into the buffer, the
                 * buffer is the flushed to the writer and the remaining bytes are copied into
                 * the now empty buffer.
                 *
                 * @return the number of bytes written to the buffer.
                 */
          writeSync(data) {
            if (this.err !== null) {
              throw this.err;
            }
            if (data.length === 0) {
              return 0;
            }
            let totalBytesWritten = 0;
            let numBytesWritten = 0;
            while (data.byteLength > this.available()) {
              if (this.buffered() === 0) {
                // Large write, empty buffer.
                // Write directly from data to avoid copy.
                try {
                  numBytesWritten = this.writer.writeSync(data);
                } catch (e) {
                  this.err = e;
                  throw e;
                }
              } else {
                numBytesWritten = mod_ts_1.copyBytes(
                  data,
                  this.buf,
                  this.usedBufferBytes,
                );
                this.usedBufferBytes += numBytesWritten;
                this.flush();
              }
              totalBytesWritten += numBytesWritten;
              data = data.subarray(numBytesWritten);
            }
            numBytesWritten = mod_ts_1.copyBytes(
              data,
              this.buf,
              this.usedBufferBytes,
            );
            this.usedBufferBytes += numBytesWritten;
            totalBytesWritten += numBytesWritten;
            return totalBytesWritten;
          }
        };
        exports_4("BufWriterSync", BufWriterSync);
      },
    };
  },
);
System.register(
  "https://deno.land/std/async/deferred",
  [],
  function (exports_5, context_5) {
    "use strict";
    var __moduleName = context_5 && context_5.id;
    /** Creates a Promise with the `reject` and `resolve` functions
     * placed as methods on the promise object itself. It allows you to do:
     *
     *     const p = deferred<number>();
     *     // ...
     *     p.resolve(42);
     */
    function deferred() {
      let methods;
      const promise = new Promise((resolve, reject) => {
        methods = { resolve, reject };
      });
      return Object.assign(promise, methods);
    }
    exports_5("deferred", deferred);
    return {
      setters: [],
      execute: function () {
      },
    };
  },
);
System.register(
  "https://deno.land/std/async/delay",
  [],
  function (exports_6, context_6) {
    "use strict";
    var __moduleName = context_6 && context_6.id;
    // Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
    /* Resolves after the given number of milliseconds. */
    function delay(ms) {
      return new Promise((res) =>
        setTimeout(() => {
          res();
        }, ms)
      );
    }
    exports_6("delay", delay);
    return {
      setters: [],
      execute: function () {
      },
    };
  },
);
System.register(
  "https://deno.land/std/async/mux_async_iterator",
  ["https://deno.land/std/async/deferred"],
  function (exports_7, context_7) {
    "use strict";
    var deferred_ts_1, MuxAsyncIterator;
    var __moduleName = context_7 && context_7.id;
    return {
      setters: [
        function (deferred_ts_1_1) {
          deferred_ts_1 = deferred_ts_1_1;
        },
      ],
      execute: function () {
        /** The MuxAsyncIterator class multiplexes multiple async iterators into a
             * single stream. It currently makes an assumption:
             * - The final result (the value returned and not yielded from the iterator)
             *   does not matter; if there is any, it is discarded.
             */
        MuxAsyncIterator = class MuxAsyncIterator {
          constructor() {
            this.iteratorCount = 0;
            this.yields = [];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.throws = [];
            this.signal = deferred_ts_1.deferred();
          }
          add(iterator) {
            ++this.iteratorCount;
            this.callIteratorNext(iterator);
          }
          async callIteratorNext(iterator) {
            try {
              const { value, done } = await iterator.next();
              if (done) {
                --this.iteratorCount;
              } else {
                this.yields.push({ iterator, value });
              }
            } catch (e) {
              this.throws.push(e);
            }
            this.signal.resolve();
          }
          async *iterate() {
            while (this.iteratorCount > 0) {
              // Sleep until any of the wrapped iterators yields.
              await this.signal;
              // Note that while we're looping over `yields`, new items may be added.
              for (let i = 0; i < this.yields.length; i++) {
                const { iterator, value } = this.yields[i];
                yield value;
                this.callIteratorNext(iterator);
              }
              if (this.throws.length) {
                for (const e of this.throws) {
                  throw e;
                }
                this.throws.length = 0;
              }
              // Clear the `yields` list and reset the `signal` promise.
              this.yields.length = 0;
              this.signal = deferred_ts_1.deferred();
            }
          }
          [Symbol.asyncIterator]() {
            return this.iterate();
          }
        };
        exports_7("MuxAsyncIterator", MuxAsyncIterator);
      },
    };
  },
);
System.register(
  "https://deno.land/std/async/mod",
  [
    "https://deno.land/std/async/deferred",
    "https://deno.land/std/async/delay",
    "https://deno.land/std/async/mux_async_iterator",
  ],
  function (exports_8, context_8) {
    "use strict";
    var __moduleName = context_8 && context_8.id;
    function exportStar_1(m) {
      var exports = {};
      for (var n in m) {
        if (n !== "default") exports[n] = m[n];
      }
      exports_8(exports);
    }
    return {
      setters: [
        function (deferred_ts_2_1) {
          exportStar_1(deferred_ts_2_1);
        },
        function (delay_ts_1_1) {
          exportStar_1(delay_ts_1_1);
        },
        function (mux_async_iterator_ts_1_1) {
          exportStar_1(mux_async_iterator_ts_1_1);
        },
      ],
      execute: function () {
      },
    };
  },
);
// Based on https://github.com/golang/go/tree/master/src/net/textproto
// Copyright 2009 The Go Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
System.register(
  "https://deno.land/std/textproto/mod",
  ["https://deno.land/std/bytes/mod", "https://deno.land/std/encoding/utf8"],
  function (exports_9, context_9) {
    "use strict";
    var mod_ts_2, utf8_ts_1, invalidHeaderCharRegex, TextProtoReader;
    var __moduleName = context_9 && context_9.id;
    function str(buf) {
      if (buf == null) {
        return "";
      } else {
        return utf8_ts_1.decode(buf);
      }
    }
    function charCode(s) {
      return s.charCodeAt(0);
    }
    return {
      setters: [
        function (mod_ts_2_1) {
          mod_ts_2 = mod_ts_2_1;
        },
        function (utf8_ts_1_1) {
          utf8_ts_1 = utf8_ts_1_1;
        },
      ],
      execute: function () {
        // FROM https://github.com/denoland/deno/blob/b34628a26ab0187a827aa4ebe256e23178e25d39/cli/js/web/headers.ts#L9
        invalidHeaderCharRegex = /[^\t\x20-\x7e\x80-\xff]/g;
        TextProtoReader = class TextProtoReader {
          constructor(r) {
            this.r = r;
          }
          /** readLine() reads a single line from the TextProtoReader,
                 * eliding the final \n or \r\n from the returned string.
                 */
          async readLine() {
            const s = await this.readLineSlice();
            if (s === null) {
              return null;
            }
            return str(s);
          }
          /** ReadMIMEHeader reads a MIME-style header from r.
                 * The header is a sequence of possibly continued Key: Value lines
                 * ending in a blank line.
                 * The returned map m maps CanonicalMIMEHeaderKey(key) to a
                 * sequence of values in the same order encountered in the input.
                 *
                 * For example, consider this input:
                 *
                 *	My-Key: Value 1
                 *	Long-Key: Even
                 *	       Longer Value
                 *	My-Key: Value 2
                 *
                 * Given that input, ReadMIMEHeader returns the map:
                 *
                 *	map[string][]string{
                 *		"My-Key": {"Value 1", "Value 2"},
                 *		"Long-Key": {"Even Longer Value"},
                 *	}
                 */
          async readMIMEHeader() {
            const m = new Headers();
            let line;
            // The first line cannot start with a leading space.
            let buf = await this.r.peek(1);
            if (buf === null) {
              return null;
            } else if (buf[0] == charCode(" ") || buf[0] == charCode("\t")) {
              line = (await this.readLineSlice());
            }
            buf = await this.r.peek(1);
            if (buf === null) {
              throw new Deno.errors.UnexpectedEof();
            } else if (buf[0] == charCode(" ") || buf[0] == charCode("\t")) {
              throw new Deno.errors.InvalidData(
                `malformed MIME header initial line: ${str(line)}`,
              );
            }
            while (true) {
              const kv = await this.readLineSlice(); // readContinuedLineSlice
              if (kv === null) {
                throw new Deno.errors.UnexpectedEof();
              }
              if (kv.byteLength === 0) {
                return m;
              }
              // Key ends at first colon
              let i = kv.indexOf(charCode(":"));
              if (i < 0) {
                throw new Deno.errors.InvalidData(
                  `malformed MIME header line: ${str(kv)}`,
                );
              }
              //let key = canonicalMIMEHeaderKey(kv.subarray(0, endKey));
              const key = str(kv.subarray(0, i));
              // As per RFC 7230 field-name is a token,
              // tokens consist of one or more chars.
              // We could throw `Deno.errors.InvalidData` here,
              // but better to be liberal in what we
              // accept, so if we get an empty key, skip it.
              if (key == "") {
                continue;
              }
              // Skip initial spaces in value.
              i++; // skip colon
              while (
                i < kv.byteLength &&
                (kv[i] == charCode(" ") || kv[i] == charCode("\t"))
              ) {
                i++;
              }
              const value = str(kv.subarray(i)).replace(
                invalidHeaderCharRegex,
                encodeURI,
              );
              // In case of invalid header we swallow the error
              // example: "Audio Mode" => invalid due to space in the key
              try {
                m.append(key, value);
              } catch {
                // Pass
              }
            }
          }
          async readLineSlice() {
            // this.closeDot();
            let line;
            while (true) {
              const r = await this.r.readLine();
              if (r === null) {
                return null;
              }
              const { line: l, more } = r;
              // Avoid the copy if the first call produced a full line.
              if (!line && !more) {
                // TODO(ry):
                // This skipSpace() is definitely misplaced, but I don't know where it
                // comes from nor how to fix it.
                if (this.skipSpace(l) === 0) {
                  return new Uint8Array(0);
                }
                return l;
              }
              line = line ? mod_ts_2.concat(line, l) : l;
              if (!more) {
                break;
              }
            }
            return line;
          }
          skipSpace(l) {
            let n = 0;
            for (let i = 0; i < l.length; i++) {
              if (l[i] === charCode(" ") || l[i] === charCode("\t")) {
                continue;
              }
              n++;
            }
            return n;
          }
        };
        exports_9("TextProtoReader", TextProtoReader);
      },
    };
  },
);
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
System.register(
  "https://deno.land/std/http/http_status",
  [],
  function (exports_10, context_10) {
    "use strict";
    var Status, STATUS_TEXT;
    var __moduleName = context_10 && context_10.id;
    return {
      setters: [],
      execute: function () {
        /** HTTP status codes */
        (function (Status) {
          /** RFC 7231, 6.2.1 */
          Status[Status["Continue"] = 100] = "Continue";
          /** RFC 7231, 6.2.2 */
          Status[Status["SwitchingProtocols"] = 101] = "SwitchingProtocols";
          /** RFC 2518, 10.1 */
          Status[Status["Processing"] = 102] = "Processing";
          /** RFC 8297 **/
          Status[Status["EarlyHints"] = 103] = "EarlyHints";
          /** RFC 7231, 6.3.1 */
          Status[Status["OK"] = 200] = "OK";
          /** RFC 7231, 6.3.2 */
          Status[Status["Created"] = 201] = "Created";
          /** RFC 7231, 6.3.3 */
          Status[Status["Accepted"] = 202] = "Accepted";
          /** RFC 7231, 6.3.4 */
          Status[Status["NonAuthoritativeInfo"] = 203] = "NonAuthoritativeInfo";
          /** RFC 7231, 6.3.5 */
          Status[Status["NoContent"] = 204] = "NoContent";
          /** RFC 7231, 6.3.6 */
          Status[Status["ResetContent"] = 205] = "ResetContent";
          /** RFC 7233, 4.1 */
          Status[Status["PartialContent"] = 206] = "PartialContent";
          /** RFC 4918, 11.1 */
          Status[Status["MultiStatus"] = 207] = "MultiStatus";
          /** RFC 5842, 7.1 */
          Status[Status["AlreadyReported"] = 208] = "AlreadyReported";
          /** RFC 3229, 10.4.1 */
          Status[Status["IMUsed"] = 226] = "IMUsed";
          /** RFC 7231, 6.4.1 */
          Status[Status["MultipleChoices"] = 300] = "MultipleChoices";
          /** RFC 7231, 6.4.2 */
          Status[Status["MovedPermanently"] = 301] = "MovedPermanently";
          /** RFC 7231, 6.4.3 */
          Status[Status["Found"] = 302] = "Found";
          /** RFC 7231, 6.4.4 */
          Status[Status["SeeOther"] = 303] = "SeeOther";
          /** RFC 7232, 4.1 */
          Status[Status["NotModified"] = 304] = "NotModified";
          /** RFC 7231, 6.4.5 */
          Status[Status["UseProxy"] = 305] = "UseProxy";
          /** RFC 7231, 6.4.7 */
          Status[Status["TemporaryRedirect"] = 307] = "TemporaryRedirect";
          /** RFC 7538, 3 */
          Status[Status["PermanentRedirect"] = 308] = "PermanentRedirect";
          /** RFC 7231, 6.5.1 */
          Status[Status["BadRequest"] = 400] = "BadRequest";
          /** RFC 7235, 3.1 */
          Status[Status["Unauthorized"] = 401] = "Unauthorized";
          /** RFC 7231, 6.5.2 */
          Status[Status["PaymentRequired"] = 402] = "PaymentRequired";
          /** RFC 7231, 6.5.3 */
          Status[Status["Forbidden"] = 403] = "Forbidden";
          /** RFC 7231, 6.5.4 */
          Status[Status["NotFound"] = 404] = "NotFound";
          /** RFC 7231, 6.5.5 */
          Status[Status["MethodNotAllowed"] = 405] = "MethodNotAllowed";
          /** RFC 7231, 6.5.6 */
          Status[Status["NotAcceptable"] = 406] = "NotAcceptable";
          /** RFC 7235, 3.2 */
          Status[Status["ProxyAuthRequired"] = 407] = "ProxyAuthRequired";
          /** RFC 7231, 6.5.7 */
          Status[Status["RequestTimeout"] = 408] = "RequestTimeout";
          /** RFC 7231, 6.5.8 */
          Status[Status["Conflict"] = 409] = "Conflict";
          /** RFC 7231, 6.5.9 */
          Status[Status["Gone"] = 410] = "Gone";
          /** RFC 7231, 6.5.10 */
          Status[Status["LengthRequired"] = 411] = "LengthRequired";
          /** RFC 7232, 4.2 */
          Status[Status["PreconditionFailed"] = 412] = "PreconditionFailed";
          /** RFC 7231, 6.5.11 */
          Status[Status["RequestEntityTooLarge"] = 413] =
            "RequestEntityTooLarge";
          /** RFC 7231, 6.5.12 */
          Status[Status["RequestURITooLong"] = 414] = "RequestURITooLong";
          /** RFC 7231, 6.5.13 */
          Status[Status["UnsupportedMediaType"] = 415] = "UnsupportedMediaType";
          /** RFC 7233, 4.4 */
          Status[Status["RequestedRangeNotSatisfiable"] = 416] =
            "RequestedRangeNotSatisfiable";
          /** RFC 7231, 6.5.14 */
          Status[Status["ExpectationFailed"] = 417] = "ExpectationFailed";
          /** RFC 7168, 2.3.3 */
          Status[Status["Teapot"] = 418] = "Teapot";
          /** RFC 7540, 9.1.2 */
          Status[Status["MisdirectedRequest"] = 421] = "MisdirectedRequest";
          /** RFC 4918, 11.2 */
          Status[Status["UnprocessableEntity"] = 422] = "UnprocessableEntity";
          /** RFC 4918, 11.3 */
          Status[Status["Locked"] = 423] = "Locked";
          /** RFC 4918, 11.4 */
          Status[Status["FailedDependency"] = 424] = "FailedDependency";
          /** RFC 8470, 5.2 */
          Status[Status["TooEarly"] = 425] = "TooEarly";
          /** RFC 7231, 6.5.15 */
          Status[Status["UpgradeRequired"] = 426] = "UpgradeRequired";
          /** RFC 6585, 3 */
          Status[Status["PreconditionRequired"] = 428] = "PreconditionRequired";
          /** RFC 6585, 4 */
          Status[Status["TooManyRequests"] = 429] = "TooManyRequests";
          /** RFC 6585, 5 */
          Status[Status["RequestHeaderFieldsTooLarge"] = 431] =
            "RequestHeaderFieldsTooLarge";
          /** RFC 7725, 3 */
          Status[Status["UnavailableForLegalReasons"] = 451] =
            "UnavailableForLegalReasons";
          /** RFC 7231, 6.6.1 */
          Status[Status["InternalServerError"] = 500] = "InternalServerError";
          /** RFC 7231, 6.6.2 */
          Status[Status["NotImplemented"] = 501] = "NotImplemented";
          /** RFC 7231, 6.6.3 */
          Status[Status["BadGateway"] = 502] = "BadGateway";
          /** RFC 7231, 6.6.4 */
          Status[Status["ServiceUnavailable"] = 503] = "ServiceUnavailable";
          /** RFC 7231, 6.6.5 */
          Status[Status["GatewayTimeout"] = 504] = "GatewayTimeout";
          /** RFC 7231, 6.6.6 */
          Status[Status["HTTPVersionNotSupported"] = 505] =
            "HTTPVersionNotSupported";
          /** RFC 2295, 8.1 */
          Status[Status["VariantAlsoNegotiates"] = 506] =
            "VariantAlsoNegotiates";
          /** RFC 4918, 11.5 */
          Status[Status["InsufficientStorage"] = 507] = "InsufficientStorage";
          /** RFC 5842, 7.2 */
          Status[Status["LoopDetected"] = 508] = "LoopDetected";
          /** RFC 2774, 7 */
          Status[Status["NotExtended"] = 510] = "NotExtended";
          /** RFC 6585, 6 */
          Status[Status["NetworkAuthenticationRequired"] = 511] =
            "NetworkAuthenticationRequired";
        })(Status || (Status = {}));
        exports_10("Status", Status);
        exports_10(
          "STATUS_TEXT",
          STATUS_TEXT = new Map([
            [Status.Continue, "Continue"],
            [Status.SwitchingProtocols, "Switching Protocols"],
            [Status.Processing, "Processing"],
            [Status.EarlyHints, "Early Hints"],
            [Status.OK, "OK"],
            [Status.Created, "Created"],
            [Status.Accepted, "Accepted"],
            [Status.NonAuthoritativeInfo, "Non-Authoritative Information"],
            [Status.NoContent, "No Content"],
            [Status.ResetContent, "Reset Content"],
            [Status.PartialContent, "Partial Content"],
            [Status.MultiStatus, "Multi-Status"],
            [Status.AlreadyReported, "Already Reported"],
            [Status.IMUsed, "IM Used"],
            [Status.MultipleChoices, "Multiple Choices"],
            [Status.MovedPermanently, "Moved Permanently"],
            [Status.Found, "Found"],
            [Status.SeeOther, "See Other"],
            [Status.NotModified, "Not Modified"],
            [Status.UseProxy, "Use Proxy"],
            [Status.TemporaryRedirect, "Temporary Redirect"],
            [Status.PermanentRedirect, "Permanent Redirect"],
            [Status.BadRequest, "Bad Request"],
            [Status.Unauthorized, "Unauthorized"],
            [Status.PaymentRequired, "Payment Required"],
            [Status.Forbidden, "Forbidden"],
            [Status.NotFound, "Not Found"],
            [Status.MethodNotAllowed, "Method Not Allowed"],
            [Status.NotAcceptable, "Not Acceptable"],
            [Status.ProxyAuthRequired, "Proxy Authentication Required"],
            [Status.RequestTimeout, "Request Timeout"],
            [Status.Conflict, "Conflict"],
            [Status.Gone, "Gone"],
            [Status.LengthRequired, "Length Required"],
            [Status.PreconditionFailed, "Precondition Failed"],
            [Status.RequestEntityTooLarge, "Request Entity Too Large"],
            [Status.RequestURITooLong, "Request URI Too Long"],
            [Status.UnsupportedMediaType, "Unsupported Media Type"],
            [
              Status.RequestedRangeNotSatisfiable,
              "Requested Range Not Satisfiable",
            ],
            [Status.ExpectationFailed, "Expectation Failed"],
            [Status.Teapot, "I'm a teapot"],
            [Status.MisdirectedRequest, "Misdirected Request"],
            [Status.UnprocessableEntity, "Unprocessable Entity"],
            [Status.Locked, "Locked"],
            [Status.FailedDependency, "Failed Dependency"],
            [Status.TooEarly, "Too Early"],
            [Status.UpgradeRequired, "Upgrade Required"],
            [Status.PreconditionRequired, "Precondition Required"],
            [Status.TooManyRequests, "Too Many Requests"],
            [
              Status.RequestHeaderFieldsTooLarge,
              "Request Header Fields Too Large",
            ],
            [
              Status.UnavailableForLegalReasons,
              "Unavailable For Legal Reasons",
            ],
            [Status.InternalServerError, "Internal Server Error"],
            [Status.NotImplemented, "Not Implemented"],
            [Status.BadGateway, "Bad Gateway"],
            [Status.ServiceUnavailable, "Service Unavailable"],
            [Status.GatewayTimeout, "Gateway Timeout"],
            [Status.HTTPVersionNotSupported, "HTTP Version Not Supported"],
            [Status.VariantAlsoNegotiates, "Variant Also Negotiates"],
            [Status.InsufficientStorage, "Insufficient Storage"],
            [Status.LoopDetected, "Loop Detected"],
            [Status.NotExtended, "Not Extended"],
            [
              Status.NetworkAuthenticationRequired,
              "Network Authentication Required",
            ],
          ]),
        );
      },
    };
  },
);
System.register(
  "https://deno.land/std/http/_io",
  [
    "https://deno.land/std/io/bufio",
    "https://deno.land/std/textproto/mod",
    "https://deno.land/std/_util/assert",
    "https://deno.land/std/encoding/utf8",
    "https://deno.land/std/http/server",
    "https://deno.land/std/http/http_status",
  ],
  function (exports_11, context_11) {
    "use strict";
    var bufio_ts_1,
      mod_ts_3,
      assert_ts_2,
      utf8_ts_2,
      server_ts_1,
      http_status_ts_1;
    var __moduleName = context_11 && context_11.id;
    function emptyReader() {
      return {
        read(_) {
          return Promise.resolve(null);
        },
      };
    }
    exports_11("emptyReader", emptyReader);
    function bodyReader(contentLength, r) {
      let totalRead = 0;
      let finished = false;
      async function read(buf) {
        if (finished) {
          return null;
        }
        let result;
        const remaining = contentLength - totalRead;
        if (remaining >= buf.byteLength) {
          result = await r.read(buf);
        } else {
          const readBuf = buf.subarray(0, remaining);
          result = await r.read(readBuf);
        }
        if (result !== null) {
          totalRead += result;
        }
        finished = totalRead === contentLength;
        return result;
      }
      return { read };
    }
    exports_11("bodyReader", bodyReader);
    function chunkedBodyReader(h, r) {
      // Based on https://tools.ietf.org/html/rfc2616#section-19.4.6
      const tp = new mod_ts_3.TextProtoReader(r);
      let finished = false;
      const chunks = [];
      async function read(buf) {
        if (finished) {
          return null;
        }
        const [chunk] = chunks;
        if (chunk) {
          const chunkRemaining = chunk.data.byteLength - chunk.offset;
          const readLength = Math.min(chunkRemaining, buf.byteLength);
          for (let i = 0; i < readLength; i++) {
            buf[i] = chunk.data[chunk.offset + i];
          }
          chunk.offset += readLength;
          if (chunk.offset === chunk.data.byteLength) {
            chunks.shift();
            // Consume \r\n;
            if ((await tp.readLine()) === null) {
              throw new Deno.errors.UnexpectedEof();
            }
          }
          return readLength;
        }
        const line = await tp.readLine();
        if (line === null) {
          throw new Deno.errors.UnexpectedEof();
        }
        // TODO: handle chunk extension
        const [chunkSizeString] = line.split(";");
        const chunkSize = parseInt(chunkSizeString, 16);
        if (Number.isNaN(chunkSize) || chunkSize < 0) {
          throw new Error("Invalid chunk size");
        }
        if (chunkSize > 0) {
          if (chunkSize > buf.byteLength) {
            let eof = await r.readFull(buf);
            if (eof === null) {
              throw new Deno.errors.UnexpectedEof();
            }
            const restChunk = new Uint8Array(chunkSize - buf.byteLength);
            eof = await r.readFull(restChunk);
            if (eof === null) {
              throw new Deno.errors.UnexpectedEof();
            } else {
              chunks.push({
                offset: 0,
                data: restChunk,
              });
            }
            return buf.byteLength;
          } else {
            const bufToFill = buf.subarray(0, chunkSize);
            const eof = await r.readFull(bufToFill);
            if (eof === null) {
              throw new Deno.errors.UnexpectedEof();
            }
            // Consume \r\n
            if ((await tp.readLine()) === null) {
              throw new Deno.errors.UnexpectedEof();
            }
            return chunkSize;
          }
        } else {
          assert_ts_2.assert(chunkSize === 0);
          // Consume \r\n
          if ((await r.readLine()) === null) {
            throw new Deno.errors.UnexpectedEof();
          }
          await readTrailers(h, r);
          finished = true;
          return null;
        }
      }
      return { read };
    }
    exports_11("chunkedBodyReader", chunkedBodyReader);
    function isProhibidedForTrailer(key) {
      const s = new Set(["transfer-encoding", "content-length", "trailer"]);
      return s.has(key.toLowerCase());
    }
    /** Read trailer headers from reader and append values to headers. "trailer"
     * field will be deleted. */
    async function readTrailers(headers, r) {
      const trailers = parseTrailer(headers.get("trailer"));
      if (trailers == null) {
        return;
      }
      const trailerNames = [...trailers.keys()];
      const tp = new mod_ts_3.TextProtoReader(r);
      const result = await tp.readMIMEHeader();
      if (result == null) {
        throw new Deno.errors.InvalidData("Missing trailer header.");
      }
      const undeclared = [...result.keys()].filter((k) =>
        !trailerNames.includes(k)
      );
      if (undeclared.length > 0) {
        throw new Deno.errors.InvalidData(
          `Undeclared trailers: ${Deno.inspect(undeclared)}.`,
        );
      }
      for (const [k, v] of result) {
        headers.append(k, v);
      }
      const missingTrailers = trailerNames.filter((k) => !result.has(k));
      if (missingTrailers.length > 0) {
        throw new Deno.errors.InvalidData(
          `Missing trailers: ${Deno.inspect(missingTrailers)}.`,
        );
      }
      headers.delete("trailer");
    }
    exports_11("readTrailers", readTrailers);
    function parseTrailer(field) {
      if (field == null) {
        return undefined;
      }
      const trailerNames = field.split(",").map((v) => v.trim().toLowerCase());
      if (trailerNames.length === 0) {
        throw new Deno.errors.InvalidData("Empty trailer header.");
      }
      const prohibited = trailerNames.filter((k) => isProhibidedForTrailer(k));
      if (prohibited.length > 0) {
        throw new Deno.errors.InvalidData(
          `Prohibited trailer names: ${Deno.inspect(prohibited)}.`,
        );
      }
      return new Headers(trailerNames.map((key) => [key, ""]));
    }
    async function writeChunkedBody(w, r) {
      const writer = bufio_ts_1.BufWriter.create(w);
      for await (const chunk of Deno.iter(r)) {
        if (chunk.byteLength <= 0) {
          continue;
        }
        const start = utf8_ts_2.encoder.encode(
          `${chunk.byteLength.toString(16)}\r\n`,
        );
        const end = utf8_ts_2.encoder.encode("\r\n");
        await writer.write(start);
        await writer.write(chunk);
        await writer.write(end);
      }
      const endChunk = utf8_ts_2.encoder.encode("0\r\n\r\n");
      await writer.write(endChunk);
    }
    exports_11("writeChunkedBody", writeChunkedBody);
    /** Write trailer headers to writer. It should mostly should be called after
     * `writeResponse()`. */
    async function writeTrailers(w, headers, trailers) {
      const trailer = headers.get("trailer");
      if (trailer === null) {
        throw new TypeError("Missing trailer header.");
      }
      const transferEncoding = headers.get("transfer-encoding");
      if (transferEncoding === null || !transferEncoding.match(/^chunked/)) {
        throw new TypeError(
          `Trailers are only allowed for "transfer-encoding: chunked", got "transfer-encoding: ${transferEncoding}".`,
        );
      }
      const writer = bufio_ts_1.BufWriter.create(w);
      const trailerNames = trailer.split(",").map((s) =>
        s.trim().toLowerCase()
      );
      const prohibitedTrailers = trailerNames.filter((k) =>
        isProhibidedForTrailer(k)
      );
      if (prohibitedTrailers.length > 0) {
        throw new TypeError(
          `Prohibited trailer names: ${Deno.inspect(prohibitedTrailers)}.`,
        );
      }
      const undeclared = [...trailers.keys()].filter((k) =>
        !trailerNames.includes(k)
      );
      if (undeclared.length > 0) {
        throw new TypeError(
          `Undeclared trailers: ${Deno.inspect(undeclared)}.`,
        );
      }
      for (const [key, value] of trailers) {
        await writer.write(utf8_ts_2.encoder.encode(`${key}: ${value}\r\n`));
      }
      await writer.write(utf8_ts_2.encoder.encode("\r\n"));
      await writer.flush();
    }
    exports_11("writeTrailers", writeTrailers);
    async function writeResponse(w, r) {
      const protoMajor = 1;
      const protoMinor = 1;
      const statusCode = r.status || 200;
      const statusText = http_status_ts_1.STATUS_TEXT.get(statusCode);
      const writer = bufio_ts_1.BufWriter.create(w);
      if (!statusText) {
        throw new Deno.errors.InvalidData("Bad status code");
      }
      if (!r.body) {
        r.body = new Uint8Array();
      }
      if (typeof r.body === "string") {
        r.body = utf8_ts_2.encoder.encode(r.body);
      }
      let out =
        `HTTP/${protoMajor}.${protoMinor} ${statusCode} ${statusText}\r\n`;
      const headers = r.headers ?? new Headers();
      if (r.body && !headers.get("content-length")) {
        if (r.body instanceof Uint8Array) {
          out += `content-length: ${r.body.byteLength}\r\n`;
        } else if (!headers.get("transfer-encoding")) {
          out += "transfer-encoding: chunked\r\n";
        }
      }
      for (const [key, value] of headers) {
        out += `${key}: ${value}\r\n`;
      }
      out += `\r\n`;
      const header = utf8_ts_2.encoder.encode(out);
      const n = await writer.write(header);
      assert_ts_2.assert(n === header.byteLength);
      if (r.body instanceof Uint8Array) {
        const n = await writer.write(r.body);
        assert_ts_2.assert(n === r.body.byteLength);
      } else if (headers.has("content-length")) {
        const contentLength = headers.get("content-length");
        assert_ts_2.assert(contentLength != null);
        const bodyLength = parseInt(contentLength);
        const n = await Deno.copy(r.body, writer);
        assert_ts_2.assert(n === bodyLength);
      } else {
        await writeChunkedBody(writer, r.body);
      }
      if (r.trailers) {
        const t = await r.trailers();
        await writeTrailers(writer, headers, t);
      }
      await writer.flush();
    }
    exports_11("writeResponse", writeResponse);
    /**
     * ParseHTTPVersion parses a HTTP version string.
     * "HTTP/1.0" returns (1, 0).
     * Ported from https://github.com/golang/go/blob/f5c43b9/src/net/http/request.go#L766-L792
     */
    function parseHTTPVersion(vers) {
      switch (vers) {
        case "HTTP/1.1":
          return [1, 1];
        case "HTTP/1.0":
          return [1, 0];
        default: {
          const Big = 1000000; // arbitrary upper bound
          if (!vers.startsWith("HTTP/")) {
            break;
          }
          const dot = vers.indexOf(".");
          if (dot < 0) {
            break;
          }
          const majorStr = vers.substring(vers.indexOf("/") + 1, dot);
          const major = Number(majorStr);
          if (!Number.isInteger(major) || major < 0 || major > Big) {
            break;
          }
          const minorStr = vers.substring(dot + 1);
          const minor = Number(minorStr);
          if (!Number.isInteger(minor) || minor < 0 || minor > Big) {
            break;
          }
          return [major, minor];
        }
      }
      throw new Error(`malformed HTTP version ${vers}`);
    }
    exports_11("parseHTTPVersion", parseHTTPVersion);
    async function readRequest(conn, bufr) {
      const tp = new mod_ts_3.TextProtoReader(bufr);
      const firstLine = await tp.readLine(); // e.g. GET /index.html HTTP/1.0
      if (firstLine === null) {
        return null;
      }
      const headers = await tp.readMIMEHeader();
      if (headers === null) {
        throw new Deno.errors.UnexpectedEof();
      }
      const req = new server_ts_1.ServerRequest();
      req.conn = conn;
      req.r = bufr;
      [req.method, req.url, req.proto] = firstLine.split(" ", 3);
      [req.protoMinor, req.protoMajor] = parseHTTPVersion(req.proto);
      req.headers = headers;
      fixLength(req);
      return req;
    }
    exports_11("readRequest", readRequest);
    function fixLength(req) {
      const contentLength = req.headers.get("Content-Length");
      if (contentLength) {
        const arrClen = contentLength.split(",");
        if (arrClen.length > 1) {
          const distinct = [...new Set(arrClen.map((e) => e.trim()))];
          if (distinct.length > 1) {
            throw Error("cannot contain multiple Content-Length headers");
          } else {
            req.headers.set("Content-Length", distinct[0]);
          }
        }
        const c = req.headers.get("Content-Length");
        if (req.method === "HEAD" && c && c !== "0") {
          throw Error("http: method cannot contain a Content-Length");
        }
        if (c && req.headers.has("transfer-encoding")) {
          // A sender MUST NOT send a Content-Length header field in any message
          // that contains a Transfer-Encoding header field.
          // rfc: https://tools.ietf.org/html/rfc7230#section-3.3.2
          throw new Error(
            "http: Transfer-Encoding and Content-Length cannot be send together",
          );
        }
      }
    }
    return {
      setters: [
        function (bufio_ts_1_1) {
          bufio_ts_1 = bufio_ts_1_1;
        },
        function (mod_ts_3_1) {
          mod_ts_3 = mod_ts_3_1;
        },
        function (assert_ts_2_1) {
          assert_ts_2 = assert_ts_2_1;
        },
        function (utf8_ts_2_1) {
          utf8_ts_2 = utf8_ts_2_1;
        },
        function (server_ts_1_1) {
          server_ts_1 = server_ts_1_1;
        },
        function (http_status_ts_1_1) {
          http_status_ts_1 = http_status_ts_1_1;
        },
      ],
      execute: function () {
      },
    };
  },
);
System.register(
  "https://deno.land/std/http/server",
  [
    "https://deno.land/std/encoding/utf8",
    "https://deno.land/std/io/bufio",
    "https://deno.land/std/_util/assert",
    "https://deno.land/std/async/mod",
    "https://deno.land/std/http/_io",
  ],
  function (exports_12, context_12) {
    "use strict";
    var utf8_ts_3,
      bufio_ts_2,
      assert_ts_3,
      mod_ts_4,
      _io_ts_1,
      ServerRequest,
      Server;
    var __moduleName = context_12 && context_12.id;
    /**
     * Parse addr from string
     *
     *     const addr = "::1:8000";
     *     parseAddrFromString(addr);
     *
     * @param addr Address string
     */
    function _parseAddrFromStr(addr) {
      let url;
      try {
        url = new URL(`http://${addr}`);
      } catch {
        throw new TypeError("Invalid address.");
      }
      if (
        url.username ||
        url.password ||
        url.pathname != "/" ||
        url.search ||
        url.hash
      ) {
        throw new TypeError("Invalid address.");
      }
      return { hostname: url.hostname, port: Number(url.port) };
    }
    exports_12("_parseAddrFromStr", _parseAddrFromStr);
    /**
     * Create a HTTP server
     *
     *     import { serve } from "https://deno.land/std/http/server.ts";
     *     const body = "Hello World\n";
     *     const server = serve({ port: 8000 });
     *     for await (const req of server) {
     *       req.respond({ body });
     *     }
     */
    function serve(addr) {
      if (typeof addr === "string") {
        addr = _parseAddrFromStr(addr);
      }
      const listener = Deno.listen(addr);
      return new Server(listener);
    }
    exports_12("serve", serve);
    /**
     * Start an HTTP server with given options and request handler
     *
     *     const body = "Hello World\n";
     *     const options = { port: 8000 };
     *     listenAndServe(options, (req) => {
     *       req.respond({ body });
     *     });
     *
     * @param options Server configuration
     * @param handler Request handler
     */
    async function listenAndServe(addr, handler) {
      const server = serve(addr);
      for await (const request of server) {
        handler(request);
      }
    }
    exports_12("listenAndServe", listenAndServe);
    /**
     * Create an HTTPS server with given options
     *
     *     const body = "Hello HTTPS";
     *     const options = {
     *       hostname: "localhost",
     *       port: 443,
     *       certFile: "./path/to/localhost.crt",
     *       keyFile: "./path/to/localhost.key",
     *     };
     *     for await (const req of serveTLS(options)) {
     *       req.respond({ body });
     *     }
     *
     * @param options Server configuration
     * @return Async iterable server instance for incoming requests
     */
    function serveTLS(options) {
      const tlsOptions = {
        ...options,
        transport: "tcp",
      };
      const listener = Deno.listenTls(tlsOptions);
      return new Server(listener);
    }
    exports_12("serveTLS", serveTLS);
    /**
     * Start an HTTPS server with given options and request handler
     *
     *     const body = "Hello HTTPS";
     *     const options = {
     *       hostname: "localhost",
     *       port: 443,
     *       certFile: "./path/to/localhost.crt",
     *       keyFile: "./path/to/localhost.key",
     *     };
     *     listenAndServeTLS(options, (req) => {
     *       req.respond({ body });
     *     });
     *
     * @param options Server configuration
     * @param handler Request handler
     */
    async function listenAndServeTLS(options, handler) {
      const server = serveTLS(options);
      for await (const request of server) {
        handler(request);
      }
    }
    exports_12("listenAndServeTLS", listenAndServeTLS);
    return {
      setters: [
        function (utf8_ts_3_1) {
          utf8_ts_3 = utf8_ts_3_1;
        },
        function (bufio_ts_2_1) {
          bufio_ts_2 = bufio_ts_2_1;
        },
        function (assert_ts_3_1) {
          assert_ts_3 = assert_ts_3_1;
        },
        function (mod_ts_4_1) {
          mod_ts_4 = mod_ts_4_1;
        },
        function (_io_ts_1_1) {
          _io_ts_1 = _io_ts_1_1;
        },
      ],
      execute: function () {
        ServerRequest = class ServerRequest {
          constructor() {
            this.done = mod_ts_4.deferred();
            this._contentLength = undefined;
            this._body = null;
            this.finalized = false;
          }
          /**
                 * Value of Content-Length header.
                 * If null, then content length is invalid or not given (e.g. chunked encoding).
                 */
          get contentLength() {
            // undefined means not cached.
            // null means invalid or not provided.
            if (this._contentLength === undefined) {
              const cl = this.headers.get("content-length");
              if (cl) {
                this._contentLength = parseInt(cl);
                // Convert NaN to null (as NaN harder to test)
                if (Number.isNaN(this._contentLength)) {
                  this._contentLength = null;
                }
              } else {
                this._contentLength = null;
              }
            }
            return this._contentLength;
          }
          /**
                 * Body of the request.  The easiest way to consume the body is:
                 *
                 *     const buf: Uint8Array = await Deno.readAll(req.body);
                 */
          get body() {
            if (!this._body) {
              if (this.contentLength != null) {
                this._body = _io_ts_1.bodyReader(this.contentLength, this.r);
              } else {
                const transferEncoding = this.headers.get("transfer-encoding");
                if (transferEncoding != null) {
                  const parts = transferEncoding
                    .split(",")
                    .map((e) => e.trim().toLowerCase());
                  assert_ts_3.assert(
                    parts.includes("chunked"),
                    'transfer-encoding must include "chunked" if content-length is not set',
                  );
                  this._body = _io_ts_1.chunkedBodyReader(this.headers, this.r);
                } else {
                  // Neither content-length nor transfer-encoding: chunked
                  this._body = _io_ts_1.emptyReader();
                }
              }
            }
            return this._body;
          }
          async respond(r) {
            let err;
            try {
              // Write our response!
              await _io_ts_1.writeResponse(this.w, r);
            } catch (e) {
              try {
                // Eagerly close on error.
                this.conn.close();
              } catch {
                // Pass
              }
              err = e;
            }
            // Signal that this request has been processed and the next pipelined
            // request on the same connection can be accepted.
            this.done.resolve(err);
            if (err) {
              // Error during responding, rethrow.
              throw err;
            }
          }
          async finalize() {
            if (this.finalized) {
              return;
            }
            // Consume unread body
            const body = this.body;
            const buf = new Uint8Array(1024);
            while ((await body.read(buf)) !== null) {
              // Pass
            }
            this.finalized = true;
          }
        };
        exports_12("ServerRequest", ServerRequest);
        Server = class Server {
          constructor(listener) {
            this.listener = listener;
            this.closing = false;
            this.connections = [];
          }
          close() {
            this.closing = true;
            this.listener.close();
            for (const conn of this.connections) {
              try {
                conn.close();
              } catch (e) {
                // Connection might have been already closed
                if (!(e instanceof Deno.errors.BadResource)) {
                  throw e;
                }
              }
            }
          }
          // Yields all HTTP requests on a single TCP connection.
          async *iterateHttpRequests(conn) {
            const reader = new bufio_ts_2.BufReader(conn);
            const writer = new bufio_ts_2.BufWriter(conn);
            while (!this.closing) {
              let request;
              try {
                request = await _io_ts_1.readRequest(conn, reader);
              } catch (error) {
                if (
                  error instanceof Deno.errors.InvalidData ||
                  error instanceof Deno.errors.UnexpectedEof
                ) {
                  // An error was thrown while parsing request headers.
                  await _io_ts_1.writeResponse(writer, {
                    status: 400,
                    body: utf8_ts_3.encode(`${error.message}\r\n\r\n`),
                  });
                }
                break;
              }
              if (request === null) {
                break;
              }
              request.w = writer;
              yield request;
              // Wait for the request to be processed before we accept a new request on
              // this connection.
              const responseError = await request.done;
              if (responseError) {
                // Something bad happened during response.
                // (likely other side closed during pipelined req)
                // req.done implies this connection already closed, so we can just return.
                this.untrackConnection(request.conn);
                return;
              }
              // Consume unread body and trailers if receiver didn't consume those data
              await request.finalize();
            }
            this.untrackConnection(conn);
            try {
              conn.close();
            } catch (e) {
              // might have been already closed
            }
          }
          trackConnection(conn) {
            this.connections.push(conn);
          }
          untrackConnection(conn) {
            const index = this.connections.indexOf(conn);
            if (index !== -1) {
              this.connections.splice(index, 1);
            }
          }
          // Accepts a new TCP connection and yields all HTTP requests that arrive on
          // it. When a connection is accepted, it also creates a new iterator of the
          // same kind and adds it to the request multiplexer so that another TCP
          // connection can be accepted.
          async *acceptConnAndIterateHttpRequests(mux) {
            if (this.closing) {
              return;
            }
            // Wait for a new connection.
            let conn;
            try {
              conn = await this.listener.accept();
            } catch (error) {
              if (
                error instanceof Deno.errors.BadResource ||
                error instanceof Deno.errors.InvalidData ||
                error instanceof Deno.errors.UnexpectedEof
              ) {
                return mux.add(this.acceptConnAndIterateHttpRequests(mux));
              }
              throw error;
            }
            this.trackConnection(conn);
            // Try to accept another connection and add it to the multiplexer.
            mux.add(this.acceptConnAndIterateHttpRequests(mux));
            // Yield the requests that arrive on the just-accepted connection.
            yield* this.iterateHttpRequests(conn);
          }
          [Symbol.asyncIterator]() {
            const mux = new mod_ts_4.MuxAsyncIterator();
            mux.add(this.acceptConnAndIterateHttpRequests(mux));
            return mux.iterate();
          }
        };
        exports_12("Server", Server);
      },
    };
  },
);
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
System.register(
  "https://deno.land/std/_util/has_own_property",
  [],
  function (exports_13, context_13) {
    "use strict";
    var __moduleName = context_13 && context_13.id;
    /**
     * Determines whether an object has a property with the specified name.
     * Avoid calling prototype builtin `hasOwnProperty` for two reasons:
     *
     * 1. `hasOwnProperty` is defined on the object as something else:
     *
     *      const options = {
     *        ending: 'utf8',
     *        hasOwnProperty: 'foo'
     *      };
     *      options.hasOwnProperty('ending') // throws a TypeError
     *
     * 2. The object doesn't inherit from `Object.prototype`:
     *
     *       const options = Object.create(null);
     *       options.ending = 'utf8';
     *       options.hasOwnProperty('ending'); // throws a TypeError
     *
     * @param obj A Object.
     * @param v A property name.
     * @see https://eslint.org/docs/rules/no-prototype-builtins
     */
    function hasOwnProperty(obj, v) {
      if (obj == null) {
        return false;
      }
      return Object.prototype.hasOwnProperty.call(obj, v);
    }
    exports_13("hasOwnProperty", hasOwnProperty);
    return {
      setters: [],
      execute: function () {
      },
    };
  },
);
System.register(
  "https://deno.land/std/io/ioutil",
  ["https://deno.land/std/_util/assert"],
  function (exports_14, context_14) {
    "use strict";
    var assert_ts_4, DEFAULT_BUFFER_SIZE, MAX_SAFE_INTEGER;
    var __moduleName = context_14 && context_14.id;
    /** copy N size at the most.
     *  If read size is lesser than N, then returns nread
     * */
    async function copyN(r, dest, size) {
      let bytesRead = 0;
      let buf = new Uint8Array(DEFAULT_BUFFER_SIZE);
      while (bytesRead < size) {
        if (size - bytesRead < DEFAULT_BUFFER_SIZE) {
          buf = new Uint8Array(size - bytesRead);
        }
        const result = await r.read(buf);
        const nread = result ?? 0;
        bytesRead += nread;
        if (nread > 0) {
          let n = 0;
          while (n < nread) {
            n += await dest.write(buf.slice(n, nread));
          }
          assert_ts_4.assert(n === nread, "could not write");
        }
        if (result === null) {
          break;
        }
      }
      return bytesRead;
    }
    exports_14("copyN", copyN);
    /** Read big endian 16bit short from BufReader */
    async function readShort(buf) {
      const high = await buf.readByte();
      if (high === null) {
        return null;
      }
      const low = await buf.readByte();
      if (low === null) {
        throw new Deno.errors.UnexpectedEof();
      }
      return (high << 8) | low;
    }
    exports_14("readShort", readShort);
    /** Read big endian 32bit integer from BufReader */
    async function readInt(buf) {
      const high = await readShort(buf);
      if (high === null) {
        return null;
      }
      const low = await readShort(buf);
      if (low === null) {
        throw new Deno.errors.UnexpectedEof();
      }
      return (high << 16) | low;
    }
    exports_14("readInt", readInt);
    /** Read big endian 64bit long from BufReader */
    async function readLong(buf) {
      const high = await readInt(buf);
      if (high === null) {
        return null;
      }
      const low = await readInt(buf);
      if (low === null) {
        throw new Deno.errors.UnexpectedEof();
      }
      const big = (BigInt(high) << 32n) | BigInt(low);
      // We probably should provide a similar API that returns BigInt values.
      if (big > MAX_SAFE_INTEGER) {
        throw new RangeError(
          "Long value too big to be represented as a JavaScript number.",
        );
      }
      return Number(big);
    }
    exports_14("readLong", readLong);
    /** Slice number into 64bit big endian byte array */
    function sliceLongToBytes(d, dest = new Array(8)) {
      let big = BigInt(d);
      for (let i = 0; i < 8; i++) {
        dest[7 - i] = Number(big & 0xffn);
        big >>= 8n;
      }
      return dest;
    }
    exports_14("sliceLongToBytes", sliceLongToBytes);
    return {
      setters: [
        function (assert_ts_4_1) {
          assert_ts_4 = assert_ts_4_1;
        },
      ],
      execute: function () {
        DEFAULT_BUFFER_SIZE = 32 * 1024;
        MAX_SAFE_INTEGER = BigInt(Number.MAX_SAFE_INTEGER);
      },
    };
  },
);
/*
 * [js-sha1]{@link https://github.com/emn178/js-sha1}
 *
 * @version 0.6.0
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2014-2017
 * @license MIT
 */
System.register(
  "https://deno.land/std/hash/sha1",
  [],
  function (exports_15, context_15) {
    "use strict";
    var HEX_CHARS, EXTRA, SHIFT, blocks, Sha1;
    var __moduleName = context_15 && context_15.id;
    return {
      setters: [],
      execute: function () {
        HEX_CHARS = "0123456789abcdef".split("");
        EXTRA = [-2147483648, 8388608, 32768, 128];
        SHIFT = [24, 16, 8, 0];
        blocks = [];
        Sha1 = class Sha1 {
          constructor(sharedMemory = false) {
            this.#h0 = 0x67452301;
            this.#h1 = 0xefcdab89;
            this.#h2 = 0x98badcfe;
            this.#h3 = 0x10325476;
            this.#h4 = 0xc3d2e1f0;
            this.#lastByteIndex = 0;
            if (sharedMemory) {
              blocks[0] = blocks[16] = blocks[1] = blocks[2] = blocks[3] =
                blocks[4] = blocks[5] = blocks[6] = blocks[7] = blocks[8] =
                  blocks[9] = blocks[10] = blocks[11] = blocks[12] =
                    blocks[13] = blocks[14] = blocks[15] = 0;
              this.#blocks = blocks;
            } else {
              this.#blocks = [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
              ];
            }
            this.#h0 = 0x67452301;
            this.#h1 = 0xefcdab89;
            this.#h2 = 0x98badcfe;
            this.#h3 = 0x10325476;
            this.#h4 = 0xc3d2e1f0;
            this.#block = this.#start = this.#bytes = this.#hBytes = 0;
            this.#finalized = this.#hashed = false;
          }
          #blocks;
          #block;
          #start;
          #bytes;
          #hBytes;
          #finalized;
          #hashed;
          #h0;
          #h1;
          #h2;
          #h3;
          #h4;
          #lastByteIndex;
          update(message) {
            if (this.#finalized) {
              return this;
            }
            let msg;
            if (message instanceof ArrayBuffer) {
              msg = new Uint8Array(message);
            } else {
              msg = message;
            }
            let index = 0;
            const length = msg.length;
            const blocks = this.#blocks;
            while (index < length) {
              let i;
              if (this.#hashed) {
                this.#hashed = false;
                blocks[0] = this.#block;
                blocks[16] = blocks[1] = blocks[2] = blocks[3] = blocks[4] =
                  blocks[5] = blocks[6] = blocks[7] = blocks[8] = blocks[9] =
                    blocks[10] = blocks[11] = blocks[12] = blocks[13] =
                      blocks[14] = blocks[15] = 0;
              }
              if (typeof msg !== "string") {
                for (i = this.#start; index < length && i < 64; ++index) {
                  blocks[i >> 2] |= msg[index] << SHIFT[i++ & 3];
                }
              } else {
                for (i = this.#start; index < length && i < 64; ++index) {
                  let code = msg.charCodeAt(index);
                  if (code < 0x80) {
                    blocks[i >> 2] |= code << SHIFT[i++ & 3];
                  } else if (code < 0x800) {
                    blocks[i >> 2] |= (0xc0 | (code >> 6)) << SHIFT[i++ & 3];
                    blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
                  } else if (code < 0xd800 || code >= 0xe000) {
                    blocks[i >> 2] |= (0xe0 | (code >> 12)) << SHIFT[i++ & 3];
                    blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) <<
                      SHIFT[i++ & 3];
                    blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
                  } else {
                    code = 0x10000 +
                      (((code & 0x3ff) << 10) |
                        (msg.charCodeAt(++index) & 0x3ff));
                    blocks[i >> 2] |= (0xf0 | (code >> 18)) << SHIFT[i++ & 3];
                    blocks[i >> 2] |= (0x80 | ((code >> 12) & 0x3f)) <<
                      SHIFT[i++ & 3];
                    blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) <<
                      SHIFT[i++ & 3];
                    blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
                  }
                }
              }
              this.#lastByteIndex = i;
              this.#bytes += i - this.#start;
              if (i >= 64) {
                this.#block = blocks[16];
                this.#start = i - 64;
                this.hash();
                this.#hashed = true;
              } else {
                this.#start = i;
              }
            }
            if (this.#bytes > 4294967295) {
              this.#hBytes += (this.#bytes / 4294967296) >>> 0;
              this.#bytes = this.#bytes >>> 0;
            }
            return this;
          }
          finalize() {
            if (this.#finalized) {
              return;
            }
            this.#finalized = true;
            const blocks = this.#blocks;
            const i = this.#lastByteIndex;
            blocks[16] = this.#block;
            blocks[i >> 2] |= EXTRA[i & 3];
            this.#block = blocks[16];
            if (i >= 56) {
              if (!this.#hashed) {
                this.hash();
              }
              blocks[0] = this.#block;
              blocks[16] = blocks[1] = blocks[2] = blocks[3] = blocks[4] =
                blocks[5] = blocks[6] = blocks[7] = blocks[8] = blocks[9] =
                  blocks[10] = blocks[11] = blocks[12] = blocks[13] =
                    blocks[14] = blocks[15] = 0;
            }
            blocks[14] = (this.#hBytes << 3) | (this.#bytes >>> 29);
            blocks[15] = this.#bytes << 3;
            this.hash();
          }
          hash() {
            let a = this.#h0;
            let b = this.#h1;
            let c = this.#h2;
            let d = this.#h3;
            let e = this.#h4;
            let f;
            let j;
            let t;
            const blocks = this.#blocks;
            for (j = 16; j < 80; ++j) {
              t = blocks[j - 3] ^ blocks[j - 8] ^ blocks[j - 14] ^
                blocks[j - 16];
              blocks[j] = (t << 1) | (t >>> 31);
            }
            for (j = 0; j < 20; j += 5) {
              f = (b & c) | (~b & d);
              t = (a << 5) | (a >>> 27);
              e = (t + f + e + 1518500249 + blocks[j]) >>> 0;
              b = (b << 30) | (b >>> 2);
              f = (a & b) | (~a & c);
              t = (e << 5) | (e >>> 27);
              d = (t + f + d + 1518500249 + blocks[j + 1]) >>> 0;
              a = (a << 30) | (a >>> 2);
              f = (e & a) | (~e & b);
              t = (d << 5) | (d >>> 27);
              c = (t + f + c + 1518500249 + blocks[j + 2]) >>> 0;
              e = (e << 30) | (e >>> 2);
              f = (d & e) | (~d & a);
              t = (c << 5) | (c >>> 27);
              b = (t + f + b + 1518500249 + blocks[j + 3]) >>> 0;
              d = (d << 30) | (d >>> 2);
              f = (c & d) | (~c & e);
              t = (b << 5) | (b >>> 27);
              a = (t + f + a + 1518500249 + blocks[j + 4]) >>> 0;
              c = (c << 30) | (c >>> 2);
            }
            for (; j < 40; j += 5) {
              f = b ^ c ^ d;
              t = (a << 5) | (a >>> 27);
              e = (t + f + e + 1859775393 + blocks[j]) >>> 0;
              b = (b << 30) | (b >>> 2);
              f = a ^ b ^ c;
              t = (e << 5) | (e >>> 27);
              d = (t + f + d + 1859775393 + blocks[j + 1]) >>> 0;
              a = (a << 30) | (a >>> 2);
              f = e ^ a ^ b;
              t = (d << 5) | (d >>> 27);
              c = (t + f + c + 1859775393 + blocks[j + 2]) >>> 0;
              e = (e << 30) | (e >>> 2);
              f = d ^ e ^ a;
              t = (c << 5) | (c >>> 27);
              b = (t + f + b + 1859775393 + blocks[j + 3]) >>> 0;
              d = (d << 30) | (d >>> 2);
              f = c ^ d ^ e;
              t = (b << 5) | (b >>> 27);
              a = (t + f + a + 1859775393 + blocks[j + 4]) >>> 0;
              c = (c << 30) | (c >>> 2);
            }
            for (; j < 60; j += 5) {
              f = (b & c) | (b & d) | (c & d);
              t = (a << 5) | (a >>> 27);
              e = (t + f + e - 1894007588 + blocks[j]) >>> 0;
              b = (b << 30) | (b >>> 2);
              f = (a & b) | (a & c) | (b & c);
              t = (e << 5) | (e >>> 27);
              d = (t + f + d - 1894007588 + blocks[j + 1]) >>> 0;
              a = (a << 30) | (a >>> 2);
              f = (e & a) | (e & b) | (a & b);
              t = (d << 5) | (d >>> 27);
              c = (t + f + c - 1894007588 + blocks[j + 2]) >>> 0;
              e = (e << 30) | (e >>> 2);
              f = (d & e) | (d & a) | (e & a);
              t = (c << 5) | (c >>> 27);
              b = (t + f + b - 1894007588 + blocks[j + 3]) >>> 0;
              d = (d << 30) | (d >>> 2);
              f = (c & d) | (c & e) | (d & e);
              t = (b << 5) | (b >>> 27);
              a = (t + f + a - 1894007588 + blocks[j + 4]) >>> 0;
              c = (c << 30) | (c >>> 2);
            }
            for (; j < 80; j += 5) {
              f = b ^ c ^ d;
              t = (a << 5) | (a >>> 27);
              e = (t + f + e - 899497514 + blocks[j]) >>> 0;
              b = (b << 30) | (b >>> 2);
              f = a ^ b ^ c;
              t = (e << 5) | (e >>> 27);
              d = (t + f + d - 899497514 + blocks[j + 1]) >>> 0;
              a = (a << 30) | (a >>> 2);
              f = e ^ a ^ b;
              t = (d << 5) | (d >>> 27);
              c = (t + f + c - 899497514 + blocks[j + 2]) >>> 0;
              e = (e << 30) | (e >>> 2);
              f = d ^ e ^ a;
              t = (c << 5) | (c >>> 27);
              b = (t + f + b - 899497514 + blocks[j + 3]) >>> 0;
              d = (d << 30) | (d >>> 2);
              f = c ^ d ^ e;
              t = (b << 5) | (b >>> 27);
              a = (t + f + a - 899497514 + blocks[j + 4]) >>> 0;
              c = (c << 30) | (c >>> 2);
            }
            this.#h0 = (this.#h0 + a) >>> 0;
            this.#h1 = (this.#h1 + b) >>> 0;
            this.#h2 = (this.#h2 + c) >>> 0;
            this.#h3 = (this.#h3 + d) >>> 0;
            this.#h4 = (this.#h4 + e) >>> 0;
          }
          hex() {
            this.finalize();
            const h0 = this.#h0;
            const h1 = this.#h1;
            const h2 = this.#h2;
            const h3 = this.#h3;
            const h4 = this.#h4;
            return (HEX_CHARS[(h0 >> 28) & 0x0f] +
              HEX_CHARS[(h0 >> 24) & 0x0f] +
              HEX_CHARS[(h0 >> 20) & 0x0f] +
              HEX_CHARS[(h0 >> 16) & 0x0f] +
              HEX_CHARS[(h0 >> 12) & 0x0f] +
              HEX_CHARS[(h0 >> 8) & 0x0f] +
              HEX_CHARS[(h0 >> 4) & 0x0f] +
              HEX_CHARS[h0 & 0x0f] +
              HEX_CHARS[(h1 >> 28) & 0x0f] +
              HEX_CHARS[(h1 >> 24) & 0x0f] +
              HEX_CHARS[(h1 >> 20) & 0x0f] +
              HEX_CHARS[(h1 >> 16) & 0x0f] +
              HEX_CHARS[(h1 >> 12) & 0x0f] +
              HEX_CHARS[(h1 >> 8) & 0x0f] +
              HEX_CHARS[(h1 >> 4) & 0x0f] +
              HEX_CHARS[h1 & 0x0f] +
              HEX_CHARS[(h2 >> 28) & 0x0f] +
              HEX_CHARS[(h2 >> 24) & 0x0f] +
              HEX_CHARS[(h2 >> 20) & 0x0f] +
              HEX_CHARS[(h2 >> 16) & 0x0f] +
              HEX_CHARS[(h2 >> 12) & 0x0f] +
              HEX_CHARS[(h2 >> 8) & 0x0f] +
              HEX_CHARS[(h2 >> 4) & 0x0f] +
              HEX_CHARS[h2 & 0x0f] +
              HEX_CHARS[(h3 >> 28) & 0x0f] +
              HEX_CHARS[(h3 >> 24) & 0x0f] +
              HEX_CHARS[(h3 >> 20) & 0x0f] +
              HEX_CHARS[(h3 >> 16) & 0x0f] +
              HEX_CHARS[(h3 >> 12) & 0x0f] +
              HEX_CHARS[(h3 >> 8) & 0x0f] +
              HEX_CHARS[(h3 >> 4) & 0x0f] +
              HEX_CHARS[h3 & 0x0f] +
              HEX_CHARS[(h4 >> 28) & 0x0f] +
              HEX_CHARS[(h4 >> 24) & 0x0f] +
              HEX_CHARS[(h4 >> 20) & 0x0f] +
              HEX_CHARS[(h4 >> 16) & 0x0f] +
              HEX_CHARS[(h4 >> 12) & 0x0f] +
              HEX_CHARS[(h4 >> 8) & 0x0f] +
              HEX_CHARS[(h4 >> 4) & 0x0f] +
              HEX_CHARS[h4 & 0x0f]);
          }
          toString() {
            return this.hex();
          }
          digest() {
            this.finalize();
            const h0 = this.#h0;
            const h1 = this.#h1;
            const h2 = this.#h2;
            const h3 = this.#h3;
            const h4 = this.#h4;
            return [
              (h0 >> 24) & 0xff,
              (h0 >> 16) & 0xff,
              (h0 >> 8) & 0xff,
              h0 & 0xff,
              (h1 >> 24) & 0xff,
              (h1 >> 16) & 0xff,
              (h1 >> 8) & 0xff,
              h1 & 0xff,
              (h2 >> 24) & 0xff,
              (h2 >> 16) & 0xff,
              (h2 >> 8) & 0xff,
              h2 & 0xff,
              (h3 >> 24) & 0xff,
              (h3 >> 16) & 0xff,
              (h3 >> 8) & 0xff,
              h3 & 0xff,
              (h4 >> 24) & 0xff,
              (h4 >> 16) & 0xff,
              (h4 >> 8) & 0xff,
              h4 & 0xff,
            ];
          }
          array() {
            return this.digest();
          }
          arrayBuffer() {
            this.finalize();
            const buffer = new ArrayBuffer(20);
            const dataView = new DataView(buffer);
            dataView.setUint32(0, this.#h0);
            dataView.setUint32(4, this.#h1);
            dataView.setUint32(8, this.#h2);
            dataView.setUint32(12, this.#h3);
            dataView.setUint32(16, this.#h4);
            return buffer;
          }
        };
        exports_15("Sha1", Sha1);
      },
    };
  },
);
System.register(
  "https://deno.land/std/ws/mod",
  [
    "https://deno.land/std/encoding/utf8",
    "https://deno.land/std/_util/has_own_property",
    "https://deno.land/std/io/bufio",
    "https://deno.land/std/io/ioutil",
    "https://deno.land/std/hash/sha1",
    "https://deno.land/std/http/_io",
    "https://deno.land/std/textproto/mod",
    "https://deno.land/std/async/deferred",
    "https://deno.land/std/_util/assert",
    "https://deno.land/std/bytes/mod",
  ],
  function (exports_16, context_16) {
    "use strict";
    var utf8_ts_4,
      has_own_property_ts_1,
      bufio_ts_3,
      ioutil_ts_1,
      sha1_ts_1,
      _io_ts_2,
      mod_ts_5,
      deferred_ts_3,
      assert_ts_5,
      mod_ts_6,
      OpCode,
      WebSocketImpl,
      kGUID,
      kSecChars;
    var __moduleName = context_16 && context_16.id;
    function isWebSocketCloseEvent(a) {
      return has_own_property_ts_1.hasOwnProperty(a, "code");
    }
    exports_16("isWebSocketCloseEvent", isWebSocketCloseEvent);
    function isWebSocketPingEvent(a) {
      return Array.isArray(a) && a[0] === "ping" && a[1] instanceof Uint8Array;
    }
    exports_16("isWebSocketPingEvent", isWebSocketPingEvent);
    function isWebSocketPongEvent(a) {
      return Array.isArray(a) && a[0] === "pong" && a[1] instanceof Uint8Array;
    }
    exports_16("isWebSocketPongEvent", isWebSocketPongEvent);
    /** Unmask masked websocket payload */
    function unmask(payload, mask) {
      if (mask) {
        for (let i = 0, len = payload.length; i < len; i++) {
          payload[i] ^= mask[i & 3];
        }
      }
    }
    exports_16("unmask", unmask);
    /** Write websocket frame to given writer */
    async function writeFrame(frame, writer) {
      const payloadLength = frame.payload.byteLength;
      let header;
      const hasMask = frame.mask ? 0x80 : 0;
      if (frame.mask && frame.mask.byteLength !== 4) {
        throw new Error(
          "invalid mask. mask must be 4 bytes: length=" + frame.mask.byteLength,
        );
      }
      if (payloadLength < 126) {
        header = new Uint8Array([0x80 | frame.opcode, hasMask | payloadLength]);
      } else if (payloadLength < 0xffff) {
        header = new Uint8Array([
          0x80 | frame.opcode,
          hasMask | 0b01111110,
          payloadLength >>> 8,
          payloadLength & 0x00ff,
        ]);
      } else {
        header = new Uint8Array([
          0x80 | frame.opcode,
          hasMask | 0b01111111,
          ...ioutil_ts_1.sliceLongToBytes(payloadLength),
        ]);
      }
      if (frame.mask) {
        header = mod_ts_6.concat(header, frame.mask);
      }
      unmask(frame.payload, frame.mask);
      header = mod_ts_6.concat(header, frame.payload);
      const w = bufio_ts_3.BufWriter.create(writer);
      await w.write(header);
      await w.flush();
    }
    exports_16("writeFrame", writeFrame);
    /** Read websocket frame from given BufReader
     * @throws `Deno.errors.UnexpectedEof` When peer closed connection without close frame
     * @throws `Error` Frame is invalid
     */
    async function readFrame(buf) {
      let b = await buf.readByte();
      assert_ts_5.assert(b !== null);
      let isLastFrame = false;
      switch (b >>> 4) {
        case 0b1000:
          isLastFrame = true;
          break;
        case 0b0000:
          isLastFrame = false;
          break;
        default:
          throw new Error("invalid signature");
      }
      const opcode = b & 0x0f;
      // has_mask & payload
      b = await buf.readByte();
      assert_ts_5.assert(b !== null);
      const hasMask = b >>> 7;
      let payloadLength = b & 0b01111111;
      if (payloadLength === 126) {
        const l = await ioutil_ts_1.readShort(buf);
        assert_ts_5.assert(l !== null);
        payloadLength = l;
      } else if (payloadLength === 127) {
        const l = await ioutil_ts_1.readLong(buf);
        assert_ts_5.assert(l !== null);
        payloadLength = Number(l);
      }
      // mask
      let mask;
      if (hasMask) {
        mask = new Uint8Array(4);
        assert_ts_5.assert((await buf.readFull(mask)) !== null);
      }
      // payload
      const payload = new Uint8Array(payloadLength);
      assert_ts_5.assert((await buf.readFull(payload)) !== null);
      return {
        isLastFrame,
        opcode,
        mask,
        payload,
      };
    }
    exports_16("readFrame", readFrame);
    // Create client-to-server mask, random 32bit number
    function createMask() {
      return crypto.getRandomValues(new Uint8Array(4));
    }
    /** Return whether given headers is acceptable for websocket  */
    function acceptable(req) {
      const upgrade = req.headers.get("upgrade");
      if (!upgrade || upgrade.toLowerCase() !== "websocket") {
        return false;
      }
      const secKey = req.headers.get("sec-websocket-key");
      return (req.headers.has("sec-websocket-key") &&
        typeof secKey === "string" &&
        secKey.length > 0);
    }
    exports_16("acceptable", acceptable);
    /** Create sec-websocket-accept header value with given nonce */
    function createSecAccept(nonce) {
      const sha1 = new sha1_ts_1.Sha1();
      sha1.update(nonce + kGUID);
      const bytes = sha1.digest();
      return btoa(String.fromCharCode(...bytes));
    }
    exports_16("createSecAccept", createSecAccept);
    /** Upgrade given TCP connection into websocket connection */
    async function acceptWebSocket(req) {
      const { conn, headers, bufReader, bufWriter } = req;
      if (acceptable(req)) {
        const sock = new WebSocketImpl({ conn, bufReader, bufWriter });
        const secKey = headers.get("sec-websocket-key");
        if (typeof secKey !== "string") {
          throw new Error("sec-websocket-key is not provided");
        }
        const secAccept = createSecAccept(secKey);
        await _io_ts_2.writeResponse(bufWriter, {
          status: 101,
          headers: new Headers({
            Upgrade: "websocket",
            Connection: "Upgrade",
            "Sec-WebSocket-Accept": secAccept,
          }),
        });
        return sock;
      }
      throw new Error("request is not acceptable");
    }
    exports_16("acceptWebSocket", acceptWebSocket);
    /** Create WebSocket-Sec-Key. Base64 encoded 16 bytes string */
    function createSecKey() {
      let key = "";
      for (let i = 0; i < 16; i++) {
        const j = Math.floor(Math.random() * kSecChars.length);
        key += kSecChars[j];
      }
      return btoa(key);
    }
    exports_16("createSecKey", createSecKey);
    async function handshake(url, headers, bufReader, bufWriter) {
      const { hostname, pathname, search } = url;
      const key = createSecKey();
      if (!headers.has("host")) {
        headers.set("host", hostname);
      }
      headers.set("upgrade", "websocket");
      headers.set("connection", "upgrade");
      headers.set("sec-websocket-key", key);
      headers.set("sec-websocket-version", "13");
      let headerStr = `GET ${pathname}${search} HTTP/1.1\r\n`;
      for (const [key, value] of headers) {
        headerStr += `${key}: ${value}\r\n`;
      }
      headerStr += "\r\n";
      await bufWriter.write(utf8_ts_4.encode(headerStr));
      await bufWriter.flush();
      const tpReader = new mod_ts_5.TextProtoReader(bufReader);
      const statusLine = await tpReader.readLine();
      if (statusLine === null) {
        throw new Deno.errors.UnexpectedEof();
      }
      const m = statusLine.match(/^(?<version>\S+) (?<statusCode>\S+) /);
      if (!m) {
        throw new Error("ws: invalid status line: " + statusLine);
      }
      assert_ts_5.assert(m.groups);
      const { version, statusCode } = m.groups;
      if (version !== "HTTP/1.1" || statusCode !== "101") {
        throw new Error(
          `ws: server didn't accept handshake: ` +
            `version=${version}, statusCode=${statusCode}`,
        );
      }
      const responseHeaders = await tpReader.readMIMEHeader();
      if (responseHeaders === null) {
        throw new Deno.errors.UnexpectedEof();
      }
      const expectedSecAccept = createSecAccept(key);
      const secAccept = responseHeaders.get("sec-websocket-accept");
      if (secAccept !== expectedSecAccept) {
        throw new Error(
          `ws: unexpected sec-websocket-accept header: ` +
            `expected=${expectedSecAccept}, actual=${secAccept}`,
        );
      }
    }
    exports_16("handshake", handshake);
    /**
     * Connect to given websocket endpoint url.
     * Endpoint must be acceptable for URL.
     */
    async function connectWebSocket(endpoint, headers = new Headers()) {
      const url = new URL(endpoint);
      const { hostname } = url;
      let conn;
      if (url.protocol === "http:" || url.protocol === "ws:") {
        const port = parseInt(url.port || "80");
        conn = await Deno.connect({ hostname, port });
      } else if (url.protocol === "https:" || url.protocol === "wss:") {
        const port = parseInt(url.port || "443");
        conn = await Deno.connectTls({ hostname, port });
      } else {
        throw new Error("ws: unsupported protocol: " + url.protocol);
      }
      const bufWriter = new bufio_ts_3.BufWriter(conn);
      const bufReader = new bufio_ts_3.BufReader(conn);
      try {
        await handshake(url, headers, bufReader, bufWriter);
      } catch (err) {
        conn.close();
        throw err;
      }
      return new WebSocketImpl({
        conn,
        bufWriter,
        bufReader,
        mask: createMask(),
      });
    }
    exports_16("connectWebSocket", connectWebSocket);
    function createWebSocket(params) {
      return new WebSocketImpl(params);
    }
    exports_16("createWebSocket", createWebSocket);
    return {
      setters: [
        function (utf8_ts_4_1) {
          utf8_ts_4 = utf8_ts_4_1;
        },
        function (has_own_property_ts_1_1) {
          has_own_property_ts_1 = has_own_property_ts_1_1;
        },
        function (bufio_ts_3_1) {
          bufio_ts_3 = bufio_ts_3_1;
        },
        function (ioutil_ts_1_1) {
          ioutil_ts_1 = ioutil_ts_1_1;
        },
        function (sha1_ts_1_1) {
          sha1_ts_1 = sha1_ts_1_1;
        },
        function (_io_ts_2_1) {
          _io_ts_2 = _io_ts_2_1;
        },
        function (mod_ts_5_1) {
          mod_ts_5 = mod_ts_5_1;
        },
        function (deferred_ts_3_1) {
          deferred_ts_3 = deferred_ts_3_1;
        },
        function (assert_ts_5_1) {
          assert_ts_5 = assert_ts_5_1;
        },
        function (mod_ts_6_1) {
          mod_ts_6 = mod_ts_6_1;
        },
      ],
      execute: function () {
        (function (OpCode) {
          OpCode[OpCode["Continue"] = 0] = "Continue";
          OpCode[OpCode["TextFrame"] = 1] = "TextFrame";
          OpCode[OpCode["BinaryFrame"] = 2] = "BinaryFrame";
          OpCode[OpCode["Close"] = 8] = "Close";
          OpCode[OpCode["Ping"] = 9] = "Ping";
          OpCode[OpCode["Pong"] = 10] = "Pong";
        })(OpCode || (OpCode = {}));
        exports_16("OpCode", OpCode);
        WebSocketImpl = class WebSocketImpl {
          constructor({ conn, bufReader, bufWriter, mask }) {
            this.sendQueue = [];
            this._isClosed = false;
            this.conn = conn;
            this.mask = mask;
            this.bufReader = bufReader || new bufio_ts_3.BufReader(conn);
            this.bufWriter = bufWriter || new bufio_ts_3.BufWriter(conn);
          }
          async *[Symbol.asyncIterator]() {
            let frames = [];
            let payloadsLength = 0;
            while (!this._isClosed) {
              let frame;
              try {
                frame = await readFrame(this.bufReader);
              } catch (e) {
                this.ensureSocketClosed();
                break;
              }
              unmask(frame.payload, frame.mask);
              switch (frame.opcode) {
                case OpCode.TextFrame:
                case OpCode.BinaryFrame:
                case OpCode.Continue:
                  frames.push(frame);
                  payloadsLength += frame.payload.length;
                  if (frame.isLastFrame) {
                    const concat = new Uint8Array(payloadsLength);
                    let offs = 0;
                    for (const frame of frames) {
                      concat.set(frame.payload, offs);
                      offs += frame.payload.length;
                    }
                    if (frames[0].opcode === OpCode.TextFrame) {
                      // text
                      yield utf8_ts_4.decode(concat);
                    } else {
                      // binary
                      yield concat;
                    }
                    frames = [];
                    payloadsLength = 0;
                  }
                  break;
                case OpCode.Close: {
                  // [0x12, 0x34] -> 0x1234
                  const code = (frame.payload[0] << 8) | frame.payload[1];
                  const reason = utf8_ts_4.decode(
                    frame.payload.subarray(2, frame.payload.length),
                  );
                  await this.close(code, reason);
                  yield { code, reason };
                  return;
                }
                case OpCode.Ping:
                  await this.enqueue({
                    opcode: OpCode.Pong,
                    payload: frame.payload,
                    isLastFrame: true,
                  });
                  yield ["ping", frame.payload];
                  break;
                case OpCode.Pong:
                  yield ["pong", frame.payload];
                  break;
                default:
              }
            }
          }
          dequeue() {
            const [entry] = this.sendQueue;
            if (!entry) {
              return;
            }
            if (this._isClosed) {
              return;
            }
            const { d, frame } = entry;
            writeFrame(frame, this.bufWriter)
              .then(() => d.resolve())
              .catch((e) => d.reject(e))
              .finally(() => {
                this.sendQueue.shift();
                this.dequeue();
              });
          }
          enqueue(frame) {
            if (this._isClosed) {
              throw new Deno.errors.ConnectionReset(
                "Socket has already been closed",
              );
            }
            const d = deferred_ts_3.deferred();
            this.sendQueue.push({ d, frame });
            if (this.sendQueue.length === 1) {
              this.dequeue();
            }
            return d;
          }
          send(data) {
            const opcode = typeof data === "string" ? OpCode.TextFrame
            : OpCode.BinaryFrame;
            const payload = typeof data === "string"
              ? utf8_ts_4.encode(data)
              : data;
            const isLastFrame = true;
            const frame = {
              isLastFrame,
              opcode,
              payload,
              mask: this.mask,
            };
            return this.enqueue(frame);
          }
          ping(data = "") {
            const payload = typeof data === "string"
              ? utf8_ts_4.encode(data)
              : data;
            const frame = {
              isLastFrame: true,
              opcode: OpCode.Ping,
              mask: this.mask,
              payload,
            };
            return this.enqueue(frame);
          }
          get isClosed() {
            return this._isClosed;
          }
          async close(code = 1000, reason) {
            try {
              const header = [code >>> 8, code & 0x00ff];
              let payload;
              if (reason) {
                const reasonBytes = utf8_ts_4.encode(reason);
                payload = new Uint8Array(2 + reasonBytes.byteLength);
                payload.set(header);
                payload.set(reasonBytes, 2);
              } else {
                payload = new Uint8Array(header);
              }
              await this.enqueue({
                isLastFrame: true,
                opcode: OpCode.Close,
                mask: this.mask,
                payload,
              });
            } catch (e) {
              throw e;
            } finally {
              this.ensureSocketClosed();
            }
          }
          closeForce() {
            this.ensureSocketClosed();
          }
          ensureSocketClosed() {
            if (this.isClosed) {
              return;
            }
            try {
              this.conn.close();
            } catch (e) {
              console.error(e);
            } finally {
              this._isClosed = true;
              const rest = this.sendQueue;
              this.sendQueue = [];
              rest.forEach((e) =>
                e.d.reject(
                  new Deno.errors.ConnectionReset(
                    "Socket has already been closed",
                  ),
                )
              );
            }
          }
        };
        kGUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
        kSecChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-.~_";
      },
    };
  },
);
System.register(
  "https://deno.land/std/uuid/_common",
  [],
  function (exports_17, context_17) {
    "use strict";
    var __moduleName = context_17 && context_17.id;
    // Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
    function bytesToUuid(bytes) {
      const bits = [...bytes].map((bit) => {
        const s = bit.toString(16);
        return bit < 0x10 ? "0" + s : s;
      });
      return [
        ...bits.slice(0, 4),
        "-",
        ...bits.slice(4, 6),
        "-",
        ...bits.slice(6, 8),
        "-",
        ...bits.slice(8, 10),
        "-",
        ...bits.slice(10, 16),
      ].join("");
    }
    exports_17("bytesToUuid", bytesToUuid);
    function uuidToBytes(uuid) {
      const bytes = [];
      uuid.replace(/[a-fA-F0-9]{2}/g, (hex) => {
        bytes.push(parseInt(hex, 16));
        return "";
      });
      return bytes;
    }
    exports_17("uuidToBytes", uuidToBytes);
    function stringToBytes(str) {
      str = unescape(encodeURIComponent(str));
      const bytes = new Array(str.length);
      for (let i = 0; i < str.length; i++) {
        bytes[i] = str.charCodeAt(i);
      }
      return bytes;
    }
    exports_17("stringToBytes", stringToBytes);
    function createBuffer(content) {
      const arrayBuffer = new ArrayBuffer(content.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      for (let i = 0; i < content.length; i++) {
        uint8Array[i] = content[i];
      }
      return arrayBuffer;
    }
    exports_17("createBuffer", createBuffer);
    return {
      setters: [],
      execute: function () {
      },
    };
  },
);
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
System.register(
  "https://deno.land/std/uuid/v1",
  ["https://deno.land/std/uuid/_common"],
  function (exports_18, context_18) {
    "use strict";
    var _common_ts_1, UUID_RE, _nodeId, _clockseq, _lastMSecs, _lastNSecs;
    var __moduleName = context_18 && context_18.id;
    function validate(id) {
      return UUID_RE.test(id);
    }
    exports_18("validate", validate);
    function generate(options, buf, offset) {
      let i = (buf && offset) || 0;
      const b = buf || [];
      options = options || {};
      let node = options.node || _nodeId;
      let clockseq = options.clockseq !== undefined ? options.clockseq
      : _clockseq;
      if (node == null || clockseq == null) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const seedBytes = options.random ||
          options.rng ||
          crypto.getRandomValues(new Uint8Array(16));
        if (node == null) {
          node = _nodeId = [
            seedBytes[0] | 0x01,
            seedBytes[1],
            seedBytes[2],
            seedBytes[3],
            seedBytes[4],
            seedBytes[5],
          ];
        }
        if (clockseq == null) {
          clockseq = _clockseq = ((seedBytes[6] << 8) | seedBytes[7]) & 0x3fff;
        }
      }
      let msecs = options.msecs !== undefined
        ? options.msecs
        : new Date().getTime();
      let nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;
      const dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 10000;
      if (dt < 0 && options.clockseq === undefined) {
        clockseq = (clockseq + 1) & 0x3fff;
      }
      if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
        nsecs = 0;
      }
      if (nsecs >= 10000) {
        throw new Error("Can't create more than 10M uuids/sec");
      }
      _lastMSecs = msecs;
      _lastNSecs = nsecs;
      _clockseq = clockseq;
      msecs += 12219292800000;
      const tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
      b[i++] = (tl >>> 24) & 0xff;
      b[i++] = (tl >>> 16) & 0xff;
      b[i++] = (tl >>> 8) & 0xff;
      b[i++] = tl & 0xff;
      const tmh = ((msecs / 0x100000000) * 10000) & 0xfffffff;
      b[i++] = (tmh >>> 8) & 0xff;
      b[i++] = tmh & 0xff;
      b[i++] = ((tmh >>> 24) & 0xf) | 0x10;
      b[i++] = (tmh >>> 16) & 0xff;
      b[i++] = (clockseq >>> 8) | 0x80;
      b[i++] = clockseq & 0xff;
      for (let n = 0; n < 6; ++n) {
        b[i + n] = node[n];
      }
      return buf ? buf : _common_ts_1.bytesToUuid(b);
    }
    exports_18("generate", generate);
    return {
      setters: [
        function (_common_ts_1_1) {
          _common_ts_1 = _common_ts_1_1;
        },
      ],
      execute: function () {
        UUID_RE = new RegExp(
          "^[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
          "i",
        );
        _lastMSecs = 0;
        _lastNSecs = 0;
      },
    };
  },
);
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
System.register(
  "https://deno.land/std/uuid/v4",
  ["https://deno.land/std/uuid/_common"],
  function (exports_19, context_19) {
    "use strict";
    var _common_ts_2, UUID_RE;
    var __moduleName = context_19 && context_19.id;
    function validate(id) {
      return UUID_RE.test(id);
    }
    exports_19("validate", validate);
    function generate() {
      const rnds = crypto.getRandomValues(new Uint8Array(16));
      rnds[6] = (rnds[6] & 0x0f) | 0x40; // Version 4
      rnds[8] = (rnds[8] & 0x3f) | 0x80; // Variant 10
      return _common_ts_2.bytesToUuid(rnds);
    }
    exports_19("generate", generate);
    return {
      setters: [
        function (_common_ts_2_1) {
          _common_ts_2 = _common_ts_2_1;
        },
      ],
      execute: function () {
        UUID_RE = new RegExp(
          "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
          "i",
        );
      },
    };
  },
);
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
//
// Adapted from Node.js. Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
System.register(
  "https://deno.land/std/node/_util/_util_promisify",
  [],
  function (exports_20, context_20) {
    "use strict";
    var kCustomPromisifiedSymbol,
      kCustomPromisifyArgsSymbol,
      NodeInvalidArgTypeError;
    var __moduleName = context_20 && context_20.id;
    function promisify(original) {
      if (typeof original !== "function") {
        throw new NodeInvalidArgTypeError("original", "Function", original);
      }
      // @ts-ignore TypeScript (as of 3.7) does not support indexing namespaces by symbol
      if (original[kCustomPromisifiedSymbol]) {
        // @ts-ignore TypeScript (as of 3.7) does not support indexing namespaces by symbol
        const fn = original[kCustomPromisifiedSymbol];
        if (typeof fn !== "function") {
          throw new NodeInvalidArgTypeError(
            "util.promisify.custom",
            "Function",
            fn,
          );
        }
        return Object.defineProperty(fn, kCustomPromisifiedSymbol, {
          value: fn,
          enumerable: false,
          writable: false,
          configurable: true,
        });
      }
      // Names to create an object from in case the callback receives multiple
      // arguments, e.g. ['bytesRead', 'buffer'] for fs.read.
      // @ts-ignore TypeScript (as of 3.7) does not support indexing namespaces by symbol
      const argumentNames = original[kCustomPromisifyArgsSymbol];
      function fn(...args) {
        return new Promise((resolve, reject) => {
          // @ts-ignore: 'this' implicitly has type 'any' because it does not have a type annotation
          original.call(this, ...args, (err, ...values) => {
            if (err) {
              return reject(err);
            }
            if (argumentNames !== undefined && values.length > 1) {
              const obj = {};
              for (let i = 0; i < argumentNames.length; i++) {
                // @ts-ignore TypeScript
                obj[argumentNames[i]] = values[i];
              }
              resolve(obj);
            } else {
              resolve(values[0]);
            }
          });
        });
      }
      Object.setPrototypeOf(fn, Object.getPrototypeOf(original));
      Object.defineProperty(fn, kCustomPromisifiedSymbol, {
        value: fn,
        enumerable: false,
        writable: false,
        configurable: true,
      });
      return Object.defineProperties(
        fn,
        Object.getOwnPropertyDescriptors(original),
      );
    }
    exports_20("promisify", promisify);
    return {
      setters: [],
      execute: function () {
        // End hack.
        // In addition to being accessible through util.promisify.custom,
        // this symbol is registered globally and can be accessed in any environment as
        // Symbol.for('nodejs.util.promisify.custom').
        kCustomPromisifiedSymbol = Symbol.for("nodejs.util.promisify.custom");
        // This is an internal Node symbol used by functions returning multiple
        // arguments, e.g. ['bytesRead', 'buffer'] for fs.read().
        kCustomPromisifyArgsSymbol = Symbol.for(
          "nodejs.util.promisify.customArgs",
        );
        NodeInvalidArgTypeError = class NodeInvalidArgTypeError
          extends TypeError {
          constructor(argumentName, type, received) {
            super(
              `The "${argumentName}" argument must be of type ${type}. Received ${typeof received}`,
            );
            this.code = "ERR_INVALID_ARG_TYPE";
          }
        };
        promisify.custom = kCustomPromisifiedSymbol;
      },
    };
  },
);
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
//
// Adapted from Node.js. Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
System.register(
  "https://deno.land/std/node/_util/_util_callbackify",
  [],
  function (exports_21, context_21) {
    "use strict";
    var NodeFalsyValueRejectionError, NodeInvalidArgTypeError;
    var __moduleName = context_21 && context_21.id;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function callbackify(original) {
      if (typeof original !== "function") {
        throw new NodeInvalidArgTypeError('"original"');
      }
      const callbackified = function (...args) {
        const maybeCb = args.pop();
        if (typeof maybeCb !== "function") {
          throw new NodeInvalidArgTypeError("last");
        }
        const cb = (...args) => {
          maybeCb.apply(this, args);
        };
        original.apply(this, args).then((ret) => {
          queueMicrotask(cb.bind(this, null, ret));
        }, (rej) => {
          rej = rej || new NodeFalsyValueRejectionError(rej);
          queueMicrotask(cb.bind(this, rej));
        });
      };
      const descriptors = Object.getOwnPropertyDescriptors(original);
      // It is possible to manipulate a functions `length` or `name` property. This
      // guards against the manipulation.
      if (typeof descriptors.length.value === "number") {
        descriptors.length.value++;
      }
      if (typeof descriptors.name.value === "string") {
        descriptors.name.value += "Callbackified";
      }
      Object.defineProperties(callbackified, descriptors);
      return callbackified;
    }
    exports_21("callbackify", callbackify);
    return {
      setters: [],
      execute: function () {
        // These are simplified versions of the "real" errors in Node.
        NodeFalsyValueRejectionError = class NodeFalsyValueRejectionError
          extends Error {
          constructor(reason) {
            super("Promise was rejected with falsy value");
            this.code = "ERR_FALSY_VALUE_REJECTION";
            this.reason = reason;
          }
        };
        NodeInvalidArgTypeError = class NodeInvalidArgTypeError
          extends TypeError {
          constructor(argumentName) {
            super(`The ${argumentName} argument must be of type function.`);
            this.code = "ERR_INVALID_ARG_TYPE";
          }
        };
      },
    };
  },
);
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
//
// Adapted from Node.js. Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
System.register(
  "https://deno.land/std/node/_util/_util_types",
  [],
  function (exports_22, context_22) {
    "use strict";
    var _toString, _isObjectLike, _isFunctionLike;
    var __moduleName = context_22 && context_22.id;
    function isAnyArrayBuffer(value) {
      return (_isObjectLike(value) &&
        (_toString.call(value) === "[object ArrayBuffer]" ||
          _toString.call(value) === "[object SharedArrayBuffer]"));
    }
    exports_22("isAnyArrayBuffer", isAnyArrayBuffer);
    function isArrayBufferView(value) {
      return ArrayBuffer.isView(value);
    }
    exports_22("isArrayBufferView", isArrayBufferView);
    function isArgumentsObject(value) {
      return _isObjectLike(value) &&
        _toString.call(value) === "[object Arguments]";
    }
    exports_22("isArgumentsObject", isArgumentsObject);
    function isArrayBuffer(value) {
      return (_isObjectLike(value) &&
        _toString.call(value) === "[object ArrayBuffer]");
    }
    exports_22("isArrayBuffer", isArrayBuffer);
    function isAsyncFunction(value) {
      return (_isFunctionLike(value) &&
        _toString.call(value) === "[object AsyncFunction]");
    }
    exports_22("isAsyncFunction", isAsyncFunction);
    function isBigInt64Array(value) {
      return (_isObjectLike(value) &&
        _toString.call(value) === "[object BigInt64Array]");
    }
    exports_22("isBigInt64Array", isBigInt64Array);
    function isBigUint64Array(value) {
      return (_isObjectLike(value) &&
        _toString.call(value) === "[object BigUint64Array]");
    }
    exports_22("isBigUint64Array", isBigUint64Array);
    function isBooleanObject(value) {
      return _isObjectLike(value) &&
        _toString.call(value) === "[object Boolean]";
    }
    exports_22("isBooleanObject", isBooleanObject);
    function isBoxedPrimitive(value) {
      return (isBooleanObject(value) ||
        isStringObject(value) ||
        isNumberObject(value) ||
        isSymbolObject(value) ||
        isBigIntObject(value));
    }
    exports_22("isBoxedPrimitive", isBoxedPrimitive);
    function isDataView(value) {
      return _isObjectLike(value) &&
        _toString.call(value) === "[object DataView]";
    }
    exports_22("isDataView", isDataView);
    function isDate(value) {
      return _isObjectLike(value) && _toString.call(value) === "[object Date]";
    }
    exports_22("isDate", isDate);
    // isExternal: Not implemented
    function isFloat32Array(value) {
      return (_isObjectLike(value) &&
        _toString.call(value) === "[object Float32Array]");
    }
    exports_22("isFloat32Array", isFloat32Array);
    function isFloat64Array(value) {
      return (_isObjectLike(value) &&
        _toString.call(value) === "[object Float64Array]");
    }
    exports_22("isFloat64Array", isFloat64Array);
    function isGeneratorFunction(value) {
      return (_isFunctionLike(value) &&
        _toString.call(value) === "[object GeneratorFunction]");
    }
    exports_22("isGeneratorFunction", isGeneratorFunction);
    function isGeneratorObject(value) {
      return _isObjectLike(value) &&
        _toString.call(value) === "[object Generator]";
    }
    exports_22("isGeneratorObject", isGeneratorObject);
    function isInt8Array(value) {
      return _isObjectLike(value) &&
        _toString.call(value) === "[object Int8Array]";
    }
    exports_22("isInt8Array", isInt8Array);
    function isInt16Array(value) {
      return (_isObjectLike(value) &&
        _toString.call(value) === "[object Int16Array]");
    }
    exports_22("isInt16Array", isInt16Array);
    function isInt32Array(value) {
      return (_isObjectLike(value) &&
        _toString.call(value) === "[object Int32Array]");
    }
    exports_22("isInt32Array", isInt32Array);
    function isMap(value) {
      return _isObjectLike(value) && _toString.call(value) === "[object Map]";
    }
    exports_22("isMap", isMap);
    function isMapIterator(value) {
      return (_isObjectLike(value) &&
        _toString.call(value) === "[object Map Iterator]");
    }
    exports_22("isMapIterator", isMapIterator);
    function isModuleNamespaceObject(value) {
      return _isObjectLike(value) &&
        _toString.call(value) === "[object Module]";
    }
    exports_22("isModuleNamespaceObject", isModuleNamespaceObject);
    function isNativeError(value) {
      return _isObjectLike(value) && _toString.call(value) === "[object Error]";
    }
    exports_22("isNativeError", isNativeError);
    function isNumberObject(value) {
      return _isObjectLike(value) &&
        _toString.call(value) === "[object Number]";
    }
    exports_22("isNumberObject", isNumberObject);
    function isBigIntObject(value) {
      return _isObjectLike(value) &&
        _toString.call(value) === "[object BigInt]";
    }
    exports_22("isBigIntObject", isBigIntObject);
    function isPromise(value) {
      return _isObjectLike(value) &&
        _toString.call(value) === "[object Promise]";
    }
    exports_22("isPromise", isPromise);
    function isRegExp(value) {
      return _isObjectLike(value) &&
        _toString.call(value) === "[object RegExp]";
    }
    exports_22("isRegExp", isRegExp);
    function isSet(value) {
      return _isObjectLike(value) && _toString.call(value) === "[object Set]";
    }
    exports_22("isSet", isSet);
    function isSetIterator(value) {
      return (_isObjectLike(value) &&
        _toString.call(value) === "[object Set Iterator]");
    }
    exports_22("isSetIterator", isSetIterator);
    function isSharedArrayBuffer(value) {
      return (_isObjectLike(value) &&
        _toString.call(value) === "[object SharedArrayBuffer]");
    }
    exports_22("isSharedArrayBuffer", isSharedArrayBuffer);
    function isStringObject(value) {
      return _isObjectLike(value) &&
        _toString.call(value) === "[object String]";
    }
    exports_22("isStringObject", isStringObject);
    function isSymbolObject(value) {
      return _isObjectLike(value) &&
        _toString.call(value) === "[object Symbol]";
    }
    exports_22("isSymbolObject", isSymbolObject);
    // Adapted from Lodash
    function isTypedArray(value) {
      /** Used to match `toStringTag` values of typed arrays. */
      const reTypedTag =
        /^\[object (?:Float(?:32|64)|(?:Int|Uint)(?:8|16|32)|Uint8Clamped)Array\]$/;
      return _isObjectLike(value) && reTypedTag.test(_toString.call(value));
    }
    exports_22("isTypedArray", isTypedArray);
    function isUint8Array(value) {
      return (_isObjectLike(value) &&
        _toString.call(value) === "[object Uint8Array]");
    }
    exports_22("isUint8Array", isUint8Array);
    function isUint8ClampedArray(value) {
      return (_isObjectLike(value) &&
        _toString.call(value) === "[object Uint8ClampedArray]");
    }
    exports_22("isUint8ClampedArray", isUint8ClampedArray);
    function isUint16Array(value) {
      return (_isObjectLike(value) &&
        _toString.call(value) === "[object Uint16Array]");
    }
    exports_22("isUint16Array", isUint16Array);
    function isUint32Array(value) {
      return (_isObjectLike(value) &&
        _toString.call(value) === "[object Uint32Array]");
    }
    exports_22("isUint32Array", isUint32Array);
    function isWeakMap(value) {
      return _isObjectLike(value) &&
        _toString.call(value) === "[object WeakMap]";
    }
    exports_22("isWeakMap", isWeakMap);
    function isWeakSet(value) {
      return _isObjectLike(value) &&
        _toString.call(value) === "[object WeakSet]";
    }
    exports_22("isWeakSet", isWeakSet);
    return {
      setters: [],
      execute: function () {
        _toString = Object.prototype.toString;
        _isObjectLike = (value) => value !== null && typeof value === "object";
        _isFunctionLike = (value) =>
          value !== null && typeof value === "function";
      },
    };
  },
);
System.register(
  "https://deno.land/std/node/_utils",
  [],
  function (exports_23, context_23) {
    "use strict";
    var _TextDecoder, _TextEncoder;
    var __moduleName = context_23 && context_23.id;
    function notImplemented(msg) {
      const message = msg ? `Not implemented: ${msg}` : "Not implemented";
      throw new Error(message);
    }
    exports_23("notImplemented", notImplemented);
    function intoCallbackAPI(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      func,
      cb,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...args
    ) {
      func(...args)
        .then((value) => cb && cb(null, value))
        .catch((err) => cb && cb(err, null));
    }
    exports_23("intoCallbackAPI", intoCallbackAPI);
    function intoCallbackAPIWithIntercept(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      func,
      interceptor,
      cb,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...args
    ) {
      func(...args)
        .then((value) => cb && cb(null, interceptor(value)))
        .catch((err) => cb && cb(err, null));
    }
    exports_23("intoCallbackAPIWithIntercept", intoCallbackAPIWithIntercept);
    function spliceOne(list, index) {
      for (; index + 1 < list.length; index++) {
        list[index] = list[index + 1];
      }
      list.pop();
    }
    exports_23("spliceOne", spliceOne);
    // Taken from: https://github.com/nodejs/node/blob/ba684805b6c0eded76e5cd89ee00328ac7a59365/lib/internal/util.js#L125
    // Return undefined if there is no match.
    // Move the "slow cases" to a separate function to make sure this function gets
    // inlined properly. That prioritizes the common case.
    function normalizeEncoding(enc) {
      if (enc == null || enc === "utf8" || enc === "utf-8") {
        return "utf8";
      }
      return slowCases(enc);
    }
    exports_23("normalizeEncoding", normalizeEncoding);
    // https://github.com/nodejs/node/blob/ba684805b6c0eded76e5cd89ee00328ac7a59365/lib/internal/util.js#L130
    function slowCases(enc) {
      switch (enc.length) {
        case 4:
          if (enc === "UTF8") {
            return "utf8";
          }
          if (enc === "ucs2" || enc === "UCS2") {
            return "utf16le";
          }
          enc = `${enc}`.toLowerCase();
          if (enc === "utf8") {
            return "utf8";
          }
          if (enc === "ucs2") {
            return "utf16le";
          }
          break;
        case 3:
          if (
            enc === "hex" || enc === "HEX" || `${enc}`.toLowerCase() === "hex"
          ) {
            return "hex";
          }
          break;
        case 5:
          if (enc === "ascii") {
            return "ascii";
          }
          if (enc === "ucs-2") {
            return "utf16le";
          }
          if (enc === "UTF-8") {
            return "utf8";
          }
          if (enc === "ASCII") {
            return "ascii";
          }
          if (enc === "UCS-2") {
            return "utf16le";
          }
          enc = `${enc}`.toLowerCase();
          if (enc === "utf-8") {
            return "utf8";
          }
          if (enc === "ascii") {
            return "ascii";
          }
          if (enc === "ucs-2") {
            return "utf16le";
          }
          break;
        case 6:
          if (enc === "base64") {
            return "base64";
          }
          if (enc === "latin1" || enc === "binary") {
            return "latin1";
          }
          if (enc === "BASE64") {
            return "base64";
          }
          if (enc === "LATIN1" || enc === "BINARY") {
            return "latin1";
          }
          enc = `${enc}`.toLowerCase();
          if (enc === "base64") {
            return "base64";
          }
          if (enc === "latin1" || enc === "binary") {
            return "latin1";
          }
          break;
        case 7:
          if (
            enc === "utf16le" ||
            enc === "UTF16LE" ||
            `${enc}`.toLowerCase() === "utf16le"
          ) {
            return "utf16le";
          }
          break;
        case 8:
          if (
            enc === "utf-16le" ||
            enc === "UTF-16LE" ||
            `${enc}`.toLowerCase() === "utf-16le"
          ) {
            return "utf16le";
          }
          break;
        default:
          if (enc === "") {
            return "utf8";
          }
      }
    }
    return {
      setters: [],
      execute: function () {
        exports_23("_TextDecoder", _TextDecoder = TextDecoder);
        exports_23("_TextEncoder", _TextEncoder = TextEncoder);
      },
    };
  },
);
System.register(
  "https://deno.land/std/node/util",
  [
    "https://deno.land/std/node/_util/_util_promisify",
    "https://deno.land/std/node/_util/_util_callbackify",
    "https://deno.land/std/node/_util/_util_types",
    "https://deno.land/std/node/_utils",
  ],
  function (exports_24, context_24) {
    "use strict";
    var types, _utils_ts_1, TextDecoder, TextEncoder;
    var __moduleName = context_24 && context_24.id;
    function isArray(value) {
      return Array.isArray(value);
    }
    exports_24("isArray", isArray);
    function isBoolean(value) {
      return typeof value === "boolean" || value instanceof Boolean;
    }
    exports_24("isBoolean", isBoolean);
    function isNull(value) {
      return value === null;
    }
    exports_24("isNull", isNull);
    function isNullOrUndefined(value) {
      return value === null || value === undefined;
    }
    exports_24("isNullOrUndefined", isNullOrUndefined);
    function isNumber(value) {
      return typeof value === "number" || value instanceof Number;
    }
    exports_24("isNumber", isNumber);
    function isString(value) {
      return typeof value === "string" || value instanceof String;
    }
    exports_24("isString", isString);
    function isSymbol(value) {
      return typeof value === "symbol";
    }
    exports_24("isSymbol", isSymbol);
    function isUndefined(value) {
      return value === undefined;
    }
    exports_24("isUndefined", isUndefined);
    function isObject(value) {
      return value !== null && typeof value === "object";
    }
    exports_24("isObject", isObject);
    function isError(e) {
      return e instanceof Error;
    }
    exports_24("isError", isError);
    function isFunction(value) {
      return typeof value === "function";
    }
    exports_24("isFunction", isFunction);
    function isRegExp(value) {
      return value instanceof RegExp;
    }
    exports_24("isRegExp", isRegExp);
    function isPrimitive(value) {
      return (value === null ||
        (typeof value !== "object" && typeof value !== "function"));
    }
    exports_24("isPrimitive", isPrimitive);
    function validateIntegerRange(
      value,
      name,
      min = -2147483648,
      max = 2147483647,
    ) {
      // The defaults for min and max correspond to the limits of 32-bit integers.
      if (!Number.isInteger(value)) {
        throw new Error(`${name} must be 'an integer' but was ${value}`);
      }
      if (value < min || value > max) {
        throw new Error(
          `${name} must be >= ${min} && <= ${max}.  Value was ${value}`,
        );
      }
    }
    exports_24("validateIntegerRange", validateIntegerRange);
    return {
      setters: [
        function (_util_promisify_ts_1_1) {
          exports_24({
            "promisify": _util_promisify_ts_1_1["promisify"],
          });
        },
        function (_util_callbackify_ts_1_1) {
          exports_24({
            "callbackify": _util_callbackify_ts_1_1["callbackify"],
          });
        },
        function (types_1) {
          types = types_1;
        },
        function (_utils_ts_1_1) {
          _utils_ts_1 = _utils_ts_1_1;
        },
      ],
      execute: function () {
        exports_24("types", types);
        exports_24("TextDecoder", TextDecoder = _utils_ts_1._TextDecoder);
        exports_24("TextEncoder", TextEncoder = _utils_ts_1._TextEncoder);
      },
    };
  },
);
// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
System.register(
  "https://deno.land/std/uuid/v5",
  [
    "https://deno.land/std/uuid/_common",
    "https://deno.land/std/hash/sha1",
    "https://deno.land/std/node/util",
    "https://deno.land/std/_util/assert",
  ],
  function (exports_25, context_25) {
    "use strict";
    var _common_ts_3, sha1_ts_2, util_ts_1, assert_ts_6, UUID_RE;
    var __moduleName = context_25 && context_25.id;
    function validate(id) {
      return UUID_RE.test(id);
    }
    exports_25("validate", validate);
    function generate(options, buf, offset) {
      const i = (buf && offset) || 0;
      let { value, namespace } = options;
      if (util_ts_1.isString(value)) {
        value = _common_ts_3.stringToBytes(value);
      }
      if (util_ts_1.isString(namespace)) {
        namespace = _common_ts_3.uuidToBytes(namespace);
      }
      assert_ts_6.assert(
        namespace.length === 16,
        "namespace must be uuid string or an Array of 16 byte values",
      );
      const content = namespace.concat(value);
      const bytes = new sha1_ts_2.Sha1().update(
        _common_ts_3.createBuffer(content),
      ).digest();
      bytes[6] = (bytes[6] & 0x0f) | 0x50;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      if (buf) {
        for (let idx = 0; idx < 16; ++idx) {
          buf[i + idx] = bytes[idx];
        }
      }
      return buf || _common_ts_3.bytesToUuid(bytes);
    }
    exports_25("generate", generate);
    return {
      setters: [
        function (_common_ts_3_1) {
          _common_ts_3 = _common_ts_3_1;
        },
        function (sha1_ts_2_1) {
          sha1_ts_2 = sha1_ts_2_1;
        },
        function (util_ts_1_1) {
          util_ts_1 = util_ts_1_1;
        },
        function (assert_ts_6_1) {
          assert_ts_6 = assert_ts_6_1;
        },
      ],
      execute: function () {
        UUID_RE =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      },
    };
  },
);
System.register(
  "https://deno.land/std/uuid/mod",
  [
    "https://deno.land/std/uuid/v1",
    "https://deno.land/std/uuid/v4",
    "https://deno.land/std/uuid/v5",
  ],
  function (exports_26, context_26) {
    "use strict";
    var v1, v4, v5, NIL_UUID, NOT_IMPLEMENTED, v3;
    var __moduleName = context_26 && context_26.id;
    function isNil(val) {
      return val === NIL_UUID;
    }
    exports_26("isNil", isNil);
    return {
      setters: [
        function (v1_1) {
          v1 = v1_1;
        },
        function (v4_1) {
          v4 = v4_1;
        },
        function (v5_1) {
          v5 = v5_1;
        },
      ],
      execute: function () {
        exports_26("v1", v1);
        exports_26("v4", v4);
        exports_26("v5", v5);
        exports_26(
          "NIL_UUID",
          NIL_UUID = "00000000-0000-0000-0000-000000000000",
        );
        NOT_IMPLEMENTED = {
          generate() {
            throw new Error("Not implemented");
          },
          validate() {
            throw new Error("Not implemented");
          },
        };
        // TODO Implement
        exports_26("v3", v3 = NOT_IMPLEMENTED);
      },
    };
  },
);
System.register(
  "file:///Users/romuquan/Documents/devserver/temp/deno-playgroung/simple-chat/chat",
  ["https://deno.land/std/ws/mod", "https://deno.land/std/uuid/mod"],
  function (exports_27, context_27) {
    "use strict";
    var mod_ts_7, mod_ts_8, users;
    var __moduleName = context_27 && context_27.id;
    function broadcast(message, senderId) {
      if (!message) {
        return;
      }
      for (const user of users.values()) {
        user.send(senderId ? `[${senderId}]: ${message}` : message);
      }
    }
    async function chat(ws) {
      const userId = mod_ts_8.v4.generate();
      // Register user connection
      users.set(userId, ws);
      broadcast(`> User with the id ${userId} is connected`);
      // Wait for new messages
      for await (const event of ws) {
        const message = typeof event === "string" ? event : "";
        broadcast(message, userId);
        // Unregister user conection
        if (!message && mod_ts_7.isWebSocketCloseEvent(event)) {
          users.delete(userId);
          broadcast(`> User with the id ${userId} is disconnected`);
          break;
        }
      }
    }
    exports_27("chat", chat);
    return {
      setters: [
        function (mod_ts_7_1) {
          mod_ts_7 = mod_ts_7_1;
        },
        function (mod_ts_8_1) {
          mod_ts_8 = mod_ts_8_1;
        },
      ],
      execute: function () {
        users = new Map();
      },
    };
  },
);
System.register(
  "file:///Users/romuquan/Documents/devserver/temp/deno-playgroung/simple-chat/server",
  [
    "https://deno.land/std/http/server",
    "https://deno.land/std/ws/mod",
    "file:///Users/romuquan/Documents/devserver/temp/deno-playgroung/simple-chat/chat",
  ],
  function (exports_28, context_28) {
    "use strict";
    var server_ts_2, mod_ts_9, chat_ts_1;
    var __moduleName = context_28 && context_28.id;
    return {
      setters: [
        function (server_ts_2_1) {
          server_ts_2 = server_ts_2_1;
        },
        function (mod_ts_9_1) {
          mod_ts_9 = mod_ts_9_1;
        },
        function (chat_ts_1_1) {
          chat_ts_1 = chat_ts_1_1;
        },
      ],
      execute: function () {
        server_ts_2.listenAndServe({ port: 3000 }, async (req) => {
          if (req.method === "GET" && req.url === "/") {
            req.respond({
              status: 200,
              headers: new Headers({
                "content-type": "text/html",
              }),
              body: await Deno.open("./index.html"),
            });
          }
          // WebSockets Chat
          if (req.method === "GET" && req.url === "/ws") {
            if (mod_ts_9.acceptable(req)) {
              mod_ts_9.acceptWebSocket({
                conn: req.conn,
                bufReader: req.r,
                bufWriter: req.w,
                headers: req.headers,
              }).then(chat_ts_1.chat);
            }
          }
        });
        console.log("Server running on localhost:3000");
      },
    };
  },
);

__instantiate(
  "file:///Users/romuquan/Documents/devserver/temp/deno-playgroung/simple-chat/server",
  false,
);
