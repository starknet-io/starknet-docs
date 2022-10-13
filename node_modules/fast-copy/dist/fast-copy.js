(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global["fast-copy"] = factory());
})(this, (function () { 'use strict';

    var toStringFunction = Function.prototype.toString;
    var create = Object.create, defineProperty = Object.defineProperty, getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor, getOwnPropertyNames = Object.getOwnPropertyNames, getOwnPropertySymbols = Object.getOwnPropertySymbols, getPrototypeOf$1 = Object.getPrototypeOf;
    var _a = Object.prototype, hasOwnProperty = _a.hasOwnProperty, propertyIsEnumerable = _a.propertyIsEnumerable;
    var SYMBOL_PROPERTIES = typeof getOwnPropertySymbols === 'function';
    var WEAK_MAP = typeof WeakMap === 'function';
    /**
     * @function createCache
     *
     * @description
     * get a new cache object to prevent circular references
     *
     * @returns the new cache object
     */
    var createCache = (function () {
        if (WEAK_MAP) {
            return function () { return new WeakMap(); };
        }
        var Cache = /** @class */ (function () {
            function Cache() {
                this._keys = [];
                this._values = [];
            }
            Cache.prototype.has = function (key) {
                return !!~this._keys.indexOf(key);
            };
            Cache.prototype.get = function (key) {
                return this._values[this._keys.indexOf(key)];
            };
            Cache.prototype.set = function (key, value) {
                this._keys.push(key);
                this._values.push(value);
            };
            return Cache;
        }());
        return function () { return new Cache(); };
    })();
    /**
     * @function getCleanClone
     *
     * @description
     * get an empty version of the object with the same prototype it has
     *
     * @param object the object to build a clean clone from
     * @param realm the realm the object resides in
     * @returns the empty cloned object
     */
    var getCleanClone = function (object, realm) {
        var prototype = object.__proto__ || getPrototypeOf$1(object);
        if (!prototype) {
            return create(null);
        }
        var Constructor = prototype.constructor;
        if (Constructor === realm.Object) {
            return prototype === realm.Object.prototype ? {} : create(prototype);
        }
        if (~toStringFunction.call(Constructor).indexOf('[native code]')) {
            try {
                return new Constructor();
            }
            catch (_a) { }
        }
        return create(prototype);
    };
    /**
     * @function getObjectCloneLoose
     *
     * @description
     * get a copy of the object based on loose rules, meaning all enumerable keys
     * and symbols are copied, but property descriptors are not considered
     *
     * @param object the object to clone
     * @param realm the realm the object resides in
     * @param handleCopy the function that handles copying the object
     * @returns the copied object
     */
    var getObjectCloneLoose = function (object, realm, handleCopy, cache) {
        var clone = getCleanClone(object, realm);
        // set in the cache immediately to be able to reuse the object recursively
        cache.set(object, clone);
        for (var key in object) {
            if (hasOwnProperty.call(object, key)) {
                clone[key] = handleCopy(object[key], cache);
            }
        }
        if (SYMBOL_PROPERTIES) {
            var symbols = getOwnPropertySymbols(object);
            for (var index = 0, length_1 = symbols.length, symbol = void 0; index < length_1; ++index) {
                symbol = symbols[index];
                if (propertyIsEnumerable.call(object, symbol)) {
                    clone[symbol] = handleCopy(object[symbol], cache);
                }
            }
        }
        return clone;
    };
    /**
     * @function getObjectCloneStrict
     *
     * @description
     * get a copy of the object based on strict rules, meaning all keys and symbols
     * are copied based on the original property descriptors
     *
     * @param object the object to clone
     * @param realm the realm the object resides in
     * @param handleCopy the function that handles copying the object
     * @returns the copied object
     */
    var getObjectCloneStrict = function (object, realm, handleCopy, cache) {
        var clone = getCleanClone(object, realm);
        // set in the cache immediately to be able to reuse the object recursively
        cache.set(object, clone);
        var properties = SYMBOL_PROPERTIES
            ? getOwnPropertyNames(object).concat(getOwnPropertySymbols(object))
            : getOwnPropertyNames(object);
        for (var index = 0, length_2 = properties.length, property = void 0, descriptor = void 0; index < length_2; ++index) {
            property = properties[index];
            if (property !== 'callee' && property !== 'caller') {
                descriptor = getOwnPropertyDescriptor(object, property);
                if (descriptor) {
                    // Only clone the value if actually a value, not a getter / setter.
                    if (!descriptor.get && !descriptor.set) {
                        descriptor.value = handleCopy(object[property], cache);
                    }
                    try {
                        defineProperty(clone, property, descriptor);
                    }
                    catch (error) {
                        // Tee above can fail on node in edge cases, so fall back to the loose assignment.
                        clone[property] = descriptor.value;
                    }
                }
                else {
                    // In extra edge cases where the property descriptor cannot be retrived, fall back to
                    // the loose assignment.
                    clone[property] = handleCopy(object[property], cache);
                }
            }
        }
        return clone;
    };
    /**
     * @function getRegExpFlags
     *
     * @description
     * get the flags to apply to the copied regexp
     *
     * @param regExp the regexp to get the flags of
     * @returns the flags for the regexp
     */
    var getRegExpFlags = function (regExp) {
        var flags = '';
        if (regExp.global) {
            flags += 'g';
        }
        if (regExp.ignoreCase) {
            flags += 'i';
        }
        if (regExp.multiline) {
            flags += 'm';
        }
        if (regExp.unicode) {
            flags += 'u';
        }
        if (regExp.sticky) {
            flags += 'y';
        }
        return flags;
    };

    // utils
    var isArray = Array.isArray;
    var getPrototypeOf = Object.getPrototypeOf;
    var GLOBAL_THIS = (function () {
        if (typeof globalThis !== 'undefined') {
            return globalThis;
        }
        if (typeof self !== 'undefined') {
            return self;
        }
        if (typeof window !== 'undefined') {
            return window;
        }
        if (typeof global !== 'undefined') {
            return global;
        }
        if (console && console.error) {
            console.error('Unable to locate global object, returning "this".');
        }
        return this;
    })();
    /**
     * @function copy
     *
     * @description
     * copy an value deeply as much as possible
     *
     * If `strict` is applied, then all properties (including non-enumerable ones)
     * are copied with their original property descriptors on both objects and arrays.
     *
     * The value is compared to the global constructors in the `realm` provided,
     * and the native constructor is always used to ensure that extensions of native
     * objects (allows in ES2015+) are maintained.
     *
     * @param value the value to copy
     * @param [options] the options for copying with
     * @param [options.isStrict] should the copy be strict
     * @param [options.realm] the realm (this) value the value is copied from
     * @returns the copied value
     */
    function copy(value, options) {
        // manually coalesced instead of default parameters for performance
        var isStrict = !!(options && options.isStrict);
        var realm = (options && options.realm) || GLOBAL_THIS;
        var getObjectClone = isStrict ? getObjectCloneStrict : getObjectCloneLoose;
        /**
         * @function handleCopy
         *
         * @description
         * copy the value recursively based on its type
         *
         * @param value the value to copy
         * @returns the copied value
         */
        var handleCopy = function (value, cache) {
            if (!value || typeof value !== 'object') {
                return value;
            }
            if (cache.has(value)) {
                return cache.get(value);
            }
            var prototype = value.__proto__ || getPrototypeOf(value);
            var Constructor = prototype && prototype.constructor;
            // plain objects
            if (!Constructor || Constructor === realm.Object) {
                return getObjectClone(value, realm, handleCopy, cache);
            }
            var clone;
            // arrays
            if (isArray(value)) {
                // if strict, include non-standard properties
                if (isStrict) {
                    return getObjectCloneStrict(value, realm, handleCopy, cache);
                }
                clone = new Constructor();
                cache.set(value, clone);
                for (var index = 0, length_1 = value.length; index < length_1; ++index) {
                    clone[index] = handleCopy(value[index], cache);
                }
                return clone;
            }
            // dates
            if (value instanceof realm.Date) {
                return new Constructor(value.getTime());
            }
            // regexps
            if (value instanceof realm.RegExp) {
                clone = new Constructor(value.source, value.flags || getRegExpFlags(value));
                clone.lastIndex = value.lastIndex;
                return clone;
            }
            // maps
            if (realm.Map && value instanceof realm.Map) {
                clone = new Constructor();
                cache.set(value, clone);
                value.forEach(function (value, key) {
                    clone.set(key, handleCopy(value, cache));
                });
                return clone;
            }
            // sets
            if (realm.Set && value instanceof realm.Set) {
                clone = new Constructor();
                cache.set(value, clone);
                value.forEach(function (value) {
                    clone.add(handleCopy(value, cache));
                });
                return clone;
            }
            // blobs
            if (realm.Blob && value instanceof realm.Blob) {
                return value.slice(0, value.size, value.type);
            }
            // buffers (node-only)
            if (realm.Buffer && realm.Buffer.isBuffer(value)) {
                clone = realm.Buffer.allocUnsafe
                    ? realm.Buffer.allocUnsafe(value.length)
                    : new Constructor(value.length);
                cache.set(value, clone);
                value.copy(clone);
                return clone;
            }
            // arraybuffers / dataviews
            if (realm.ArrayBuffer) {
                // dataviews
                if (realm.ArrayBuffer.isView(value)) {
                    clone = new Constructor(value.buffer.slice(0));
                    cache.set(value, clone);
                    return clone;
                }
                // arraybuffers
                if (value instanceof realm.ArrayBuffer) {
                    clone = value.slice(0);
                    cache.set(value, clone);
                    return clone;
                }
            }
            // if the value cannot / should not be cloned, don't
            if (
            // promise-like
            typeof value.then === 'function' ||
                // errors
                value instanceof Error ||
                // weakmaps
                (realm.WeakMap && value instanceof realm.WeakMap) ||
                // weaksets
                (realm.WeakSet && value instanceof realm.WeakSet)) {
                return value;
            }
            // assume anything left is a custom constructor
            return getObjectClone(value, realm, handleCopy, cache);
        };
        return handleCopy(value, createCache());
    }
    // Adding reference to allow usage in CommonJS libraries compiled using TSC, which
    // expects there to be a default property on the exported value. See
    // [#37](https://github.com/planttheidea/fast-copy/issues/37) for details.
    copy.default = copy;
    /**
     * @function strictCopy
     *
     * @description
     * copy the value with `strict` option pre-applied
     *
     * @param value the value to copy
     * @param [options] the options for copying with
     * @param [options.realm] the realm (this) value the value is copied from
     * @returns the copied value
     */
    copy.strict = function strictCopy(value, options) {
        return copy(value, {
            isStrict: true,
            realm: options ? options.realm : void 0,
        });
    };

    return copy;

}));
//# sourceMappingURL=fast-copy.js.map
