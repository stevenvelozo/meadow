(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f();}else if(typeof define==="function"&&define.amd){define([],f);}else{var g;if(typeof window!=="undefined"){g=window;}else if(typeof global!=="undefined"){g=global;}else if(typeof self!=="undefined"){g=self;}else{g=this;}g.Meadow=f();}})(function(){var define,module,exports;return function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a;}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r);},p,p.exports,r,e,n,t);}return n[i].exports;}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o;}return r;}()({1:[function(require,module,exports){'use strict';Object.defineProperty(exports,"__esModule",{value:true});exports.default=asyncify;var _initialParams=require('./internal/initialParams.js');var _initialParams2=_interopRequireDefault(_initialParams);var _setImmediate=require('./internal/setImmediate.js');var _setImmediate2=_interopRequireDefault(_setImmediate);var _wrapAsync=require('./internal/wrapAsync.js');function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}/**
 * Take a sync function and make it async, passing its return value to a
 * callback. This is useful for plugging sync functions into a waterfall,
 * series, or other async functions. Any arguments passed to the generated
 * function will be passed to the wrapped function (except for the final
 * callback argument). Errors thrown will be passed to the callback.
 *
 * If the function passed to `asyncify` returns a Promise, that promises's
 * resolved/rejected state will be used to call the callback, rather than simply
 * the synchronous return value.
 *
 * This also means you can asyncify ES2017 `async` functions.
 *
 * @name asyncify
 * @static
 * @memberOf module:Utils
 * @method
 * @alias wrapSync
 * @category Util
 * @param {Function} func - The synchronous function, or Promise-returning
 * function to convert to an {@link AsyncFunction}.
 * @returns {AsyncFunction} An asynchronous wrapper of the `func`. To be
 * invoked with `(args..., callback)`.
 * @example
 *
 * // passing a regular synchronous function
 * async.waterfall([
 *     async.apply(fs.readFile, filename, "utf8"),
 *     async.asyncify(JSON.parse),
 *     function (data, next) {
 *         // data is the result of parsing the text.
 *         // If there was a parsing error, it would have been caught.
 *     }
 * ], callback);
 *
 * // passing a function returning a promise
 * async.waterfall([
 *     async.apply(fs.readFile, filename, "utf8"),
 *     async.asyncify(function (contents) {
 *         return db.model.create(contents);
 *     }),
 *     function (model, next) {
 *         // `model` is the instantiated model object.
 *         // If there was an error, this function would be skipped.
 *     }
 * ], callback);
 *
 * // es2017 example, though `asyncify` is not needed if your JS environment
 * // supports async functions out of the box
 * var q = async.queue(async.asyncify(async function(file) {
 *     var intermediateStep = await processFile(file);
 *     return await somePromise(intermediateStep)
 * }));
 *
 * q.push(files);
 */function asyncify(func){if((0,_wrapAsync.isAsync)(func)){return function(...args/*, callback*/){const callback=args.pop();const promise=func.apply(this,args);return handlePromise(promise,callback);};}return(0,_initialParams2.default)(function(args,callback){var result;try{result=func.apply(this,args);}catch(e){return callback(e);}// if result is Promise object
if(result&&typeof result.then==='function'){return handlePromise(result,callback);}else{callback(null,result);}});}function handlePromise(promise,callback){return promise.then(value=>{invokeCallback(callback,null,value);},err=>{invokeCallback(callback,err&&err.message?err:new Error(err));});}function invokeCallback(callback,error,value){try{callback(error,value);}catch(err){(0,_setImmediate2.default)(e=>{throw e;},err);}}module.exports=exports['default'];},{"./internal/initialParams.js":9,"./internal/setImmediate.js":14,"./internal/wrapAsync.js":16}],2:[function(require,module,exports){'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _eachOfLimit=require('./internal/eachOfLimit.js');var _eachOfLimit2=_interopRequireDefault(_eachOfLimit);var _withoutIndex=require('./internal/withoutIndex.js');var _withoutIndex2=_interopRequireDefault(_withoutIndex);var _wrapAsync=require('./internal/wrapAsync.js');var _wrapAsync2=_interopRequireDefault(_wrapAsync);var _awaitify=require('./internal/awaitify.js');var _awaitify2=_interopRequireDefault(_awaitify);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}/**
 * The same as [`each`]{@link module:Collections.each} but runs a maximum of `limit` async operations at a time.
 *
 * @name eachLimit
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.each]{@link module:Collections.each}
 * @alias forEachLimit
 * @category Collection
 * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
 * @param {number} limit - The maximum number of async operations at a time.
 * @param {AsyncFunction} iteratee - An async function to apply to each item in
 * `coll`.
 * The array index is not passed to the iteratee.
 * If you need the index, use `eachOfLimit`.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called when all
 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
 * @returns {Promise} a promise, if a callback is omitted
 */function eachLimit(coll,limit,iteratee,callback){return(0,_eachOfLimit2.default)(limit)(coll,(0,_withoutIndex2.default)((0,_wrapAsync2.default)(iteratee)),callback);}exports.default=(0,_awaitify2.default)(eachLimit,4);module.exports=exports['default'];},{"./internal/awaitify.js":5,"./internal/eachOfLimit.js":7,"./internal/withoutIndex.js":15,"./internal/wrapAsync.js":16}],3:[function(require,module,exports){'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _eachLimit=require('./eachLimit.js');var _eachLimit2=_interopRequireDefault(_eachLimit);var _awaitify=require('./internal/awaitify.js');var _awaitify2=_interopRequireDefault(_awaitify);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}/**
 * The same as [`each`]{@link module:Collections.each} but runs only a single async operation at a time.
 *
 * Note, that unlike [`each`]{@link module:Collections.each}, this function applies iteratee to each item
 * in series and therefore the iteratee functions will complete in order.

 * @name eachSeries
 * @static
 * @memberOf module:Collections
 * @method
 * @see [async.each]{@link module:Collections.each}
 * @alias forEachSeries
 * @category Collection
 * @param {Array|Iterable|AsyncIterable|Object} coll - A collection to iterate over.
 * @param {AsyncFunction} iteratee - An async function to apply to each
 * item in `coll`.
 * The array index is not passed to the iteratee.
 * If you need the index, use `eachOfSeries`.
 * Invoked with (item, callback).
 * @param {Function} [callback] - A callback which is called when all
 * `iteratee` functions have finished, or an error occurs. Invoked with (err).
 * @returns {Promise} a promise, if a callback is omitted
 */function eachSeries(coll,iteratee,callback){return(0,_eachLimit2.default)(coll,1,iteratee,callback);}exports.default=(0,_awaitify2.default)(eachSeries,3);module.exports=exports['default'];},{"./eachLimit.js":2,"./internal/awaitify.js":5}],4:[function(require,module,exports){'use strict';Object.defineProperty(exports,"__esModule",{value:true});exports.default=asyncEachOfLimit;var _breakLoop=require('./breakLoop.js');var _breakLoop2=_interopRequireDefault(_breakLoop);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}// for async generators
function asyncEachOfLimit(generator,limit,iteratee,callback){let done=false;let canceled=false;let awaiting=false;let running=0;let idx=0;function replenish(){//console.log('replenish')
if(running>=limit||awaiting||done)return;//console.log('replenish awaiting')
awaiting=true;generator.next().then(({value,done:iterDone})=>{//console.log('got value', value)
if(canceled||done)return;awaiting=false;if(iterDone){done=true;if(running<=0){//console.log('done nextCb')
callback(null);}return;}running++;iteratee(value,idx,iterateeCallback);idx++;replenish();}).catch(handleError);}function iterateeCallback(err,result){//console.log('iterateeCallback')
running-=1;if(canceled)return;if(err)return handleError(err);if(err===false){done=true;canceled=true;return;}if(result===_breakLoop2.default||done&&running<=0){done=true;//console.log('done iterCb')
return callback(null);}replenish();}function handleError(err){if(canceled)return;awaiting=false;done=true;callback(err);}replenish();}module.exports=exports['default'];},{"./breakLoop.js":6}],5:[function(require,module,exports){'use strict';Object.defineProperty(exports,"__esModule",{value:true});exports.default=awaitify;// conditionally promisify a function.
// only return a promise if a callback is omitted
function awaitify(asyncFn,arity=asyncFn.length){if(!arity)throw new Error('arity is undefined');function awaitable(...args){if(typeof args[arity-1]==='function'){return asyncFn.apply(this,args);}return new Promise((resolve,reject)=>{args[arity-1]=(err,...cbArgs)=>{if(err)return reject(err);resolve(cbArgs.length>1?cbArgs:cbArgs[0]);};asyncFn.apply(this,args);});}return awaitable;}module.exports=exports['default'];},{}],6:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});// A temporary value used to identify if the loop should be broken.
// See #1064, #1293
const breakLoop={};exports.default=breakLoop;module.exports=exports["default"];},{}],7:[function(require,module,exports){'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _once=require('./once.js');var _once2=_interopRequireDefault(_once);var _iterator=require('./iterator.js');var _iterator2=_interopRequireDefault(_iterator);var _onlyOnce=require('./onlyOnce.js');var _onlyOnce2=_interopRequireDefault(_onlyOnce);var _wrapAsync=require('./wrapAsync.js');var _asyncEachOfLimit=require('./asyncEachOfLimit.js');var _asyncEachOfLimit2=_interopRequireDefault(_asyncEachOfLimit);var _breakLoop=require('./breakLoop.js');var _breakLoop2=_interopRequireDefault(_breakLoop);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}exports.default=limit=>{return(obj,iteratee,callback)=>{callback=(0,_once2.default)(callback);if(limit<=0){throw new RangeError('concurrency limit cannot be less than 1');}if(!obj){return callback(null);}if((0,_wrapAsync.isAsyncGenerator)(obj)){return(0,_asyncEachOfLimit2.default)(obj,limit,iteratee,callback);}if((0,_wrapAsync.isAsyncIterable)(obj)){return(0,_asyncEachOfLimit2.default)(obj[Symbol.asyncIterator](),limit,iteratee,callback);}var nextElem=(0,_iterator2.default)(obj);var done=false;var canceled=false;var running=0;var looping=false;function iterateeCallback(err,value){if(canceled)return;running-=1;if(err){done=true;callback(err);}else if(err===false){done=true;canceled=true;}else if(value===_breakLoop2.default||done&&running<=0){done=true;return callback(null);}else if(!looping){replenish();}}function replenish(){looping=true;while(running<limit&&!done){var elem=nextElem();if(elem===null){done=true;if(running<=0){callback(null);}return;}running+=1;iteratee(elem.value,elem.key,(0,_onlyOnce2.default)(iterateeCallback));}looping=false;}replenish();};};module.exports=exports['default'];},{"./asyncEachOfLimit.js":4,"./breakLoop.js":6,"./iterator.js":11,"./once.js":12,"./onlyOnce.js":13,"./wrapAsync.js":16}],8:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});exports.default=function(coll){return coll[Symbol.iterator]&&coll[Symbol.iterator]();};module.exports=exports["default"];},{}],9:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});exports.default=function(fn){return function(...args/*, callback*/){var callback=args.pop();return fn.call(this,args,callback);};};module.exports=exports["default"];},{}],10:[function(require,module,exports){'use strict';Object.defineProperty(exports,"__esModule",{value:true});exports.default=isArrayLike;function isArrayLike(value){return value&&typeof value.length==='number'&&value.length>=0&&value.length%1===0;}module.exports=exports['default'];},{}],11:[function(require,module,exports){'use strict';Object.defineProperty(exports,"__esModule",{value:true});exports.default=createIterator;var _isArrayLike=require('./isArrayLike.js');var _isArrayLike2=_interopRequireDefault(_isArrayLike);var _getIterator=require('./getIterator.js');var _getIterator2=_interopRequireDefault(_getIterator);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function createArrayIterator(coll){var i=-1;var len=coll.length;return function next(){return++i<len?{value:coll[i],key:i}:null;};}function createES2015Iterator(iterator){var i=-1;return function next(){var item=iterator.next();if(item.done)return null;i++;return{value:item.value,key:i};};}function createObjectIterator(obj){var okeys=obj?Object.keys(obj):[];var i=-1;var len=okeys.length;return function next(){var key=okeys[++i];if(key==='__proto__'){return next();}return i<len?{value:obj[key],key}:null;};}function createIterator(coll){if((0,_isArrayLike2.default)(coll)){return createArrayIterator(coll);}var iterator=(0,_getIterator2.default)(coll);return iterator?createES2015Iterator(iterator):createObjectIterator(coll);}module.exports=exports['default'];},{"./getIterator.js":8,"./isArrayLike.js":10}],12:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});exports.default=once;function once(fn){function wrapper(...args){if(fn===null)return;var callFn=fn;fn=null;callFn.apply(this,args);}Object.assign(wrapper,fn);return wrapper;}module.exports=exports["default"];},{}],13:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});exports.default=onlyOnce;function onlyOnce(fn){return function(...args){if(fn===null)throw new Error("Callback was already called.");var callFn=fn;fn=null;callFn.apply(this,args);};}module.exports=exports["default"];},{}],14:[function(require,module,exports){(function(process,setImmediate){(function(){'use strict';Object.defineProperty(exports,"__esModule",{value:true});exports.fallback=fallback;exports.wrap=wrap;/* istanbul ignore file */var hasQueueMicrotask=exports.hasQueueMicrotask=typeof queueMicrotask==='function'&&queueMicrotask;var hasSetImmediate=exports.hasSetImmediate=typeof setImmediate==='function'&&setImmediate;var hasNextTick=exports.hasNextTick=typeof process==='object'&&typeof process.nextTick==='function';function fallback(fn){setTimeout(fn,0);}function wrap(defer){return(fn,...args)=>defer(()=>fn(...args));}var _defer;if(hasQueueMicrotask){_defer=queueMicrotask;}else if(hasSetImmediate){_defer=setImmediate;}else if(hasNextTick){_defer=process.nextTick;}else{_defer=fallback;}exports.default=wrap(_defer);}).call(this);}).call(this,require('_process'),require("timers").setImmediate);},{"_process":50,"timers":51}],15:[function(require,module,exports){"use strict";Object.defineProperty(exports,"__esModule",{value:true});exports.default=_withoutIndex;function _withoutIndex(iteratee){return(value,index,callback)=>iteratee(value,callback);}module.exports=exports["default"];},{}],16:[function(require,module,exports){'use strict';Object.defineProperty(exports,"__esModule",{value:true});exports.isAsyncIterable=exports.isAsyncGenerator=exports.isAsync=undefined;var _asyncify=require('../asyncify.js');var _asyncify2=_interopRequireDefault(_asyncify);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}function isAsync(fn){return fn[Symbol.toStringTag]==='AsyncFunction';}function isAsyncGenerator(fn){return fn[Symbol.toStringTag]==='AsyncGenerator';}function isAsyncIterable(obj){return typeof obj[Symbol.asyncIterator]==='function';}function wrapAsync(asyncFn){if(typeof asyncFn!=='function')throw new Error('expected a function');return isAsync(asyncFn)?(0,_asyncify2.default)(asyncFn):asyncFn;}exports.default=wrapAsync;exports.isAsync=isAsync;exports.isAsyncGenerator=isAsyncGenerator;exports.isAsyncIterable=isAsyncIterable;},{"../asyncify.js":1}],17:[function(require,module,exports){'use strict';Object.defineProperty(exports,"__esModule",{value:true});var _once=require('./internal/once.js');var _once2=_interopRequireDefault(_once);var _onlyOnce=require('./internal/onlyOnce.js');var _onlyOnce2=_interopRequireDefault(_onlyOnce);var _wrapAsync=require('./internal/wrapAsync.js');var _wrapAsync2=_interopRequireDefault(_wrapAsync);var _awaitify=require('./internal/awaitify.js');var _awaitify2=_interopRequireDefault(_awaitify);function _interopRequireDefault(obj){return obj&&obj.__esModule?obj:{default:obj};}/**
 * Runs the `tasks` array of functions in series, each passing their results to
 * the next in the array. However, if any of the `tasks` pass an error to their
 * own callback, the next function is not executed, and the main `callback` is
 * immediately called with the error.
 *
 * @name waterfall
 * @static
 * @memberOf module:ControlFlow
 * @method
 * @category Control Flow
 * @param {Array} tasks - An array of [async functions]{@link AsyncFunction}
 * to run.
 * Each function should complete with any number of `result` values.
 * The `result` values will be passed as arguments, in order, to the next task.
 * @param {Function} [callback] - An optional callback to run once all the
 * functions have completed. This will be passed the results of the last task's
 * callback. Invoked with (err, [results]).
 * @returns {Promise} a promise, if a callback is omitted
 * @example
 *
 * async.waterfall([
 *     function(callback) {
 *         callback(null, 'one', 'two');
 *     },
 *     function(arg1, arg2, callback) {
 *         // arg1 now equals 'one' and arg2 now equals 'two'
 *         callback(null, 'three');
 *     },
 *     function(arg1, callback) {
 *         // arg1 now equals 'three'
 *         callback(null, 'done');
 *     }
 * ], function (err, result) {
 *     // result now equals 'done'
 * });
 *
 * // Or, with named functions:
 * async.waterfall([
 *     myFirstFunction,
 *     mySecondFunction,
 *     myLastFunction,
 * ], function (err, result) {
 *     // result now equals 'done'
 * });
 * function myFirstFunction(callback) {
 *     callback(null, 'one', 'two');
 * }
 * function mySecondFunction(arg1, arg2, callback) {
 *     // arg1 now equals 'one' and arg2 now equals 'two'
 *     callback(null, 'three');
 * }
 * function myLastFunction(arg1, callback) {
 *     // arg1 now equals 'three'
 *     callback(null, 'done');
 * }
 */function waterfall(tasks,callback){callback=(0,_once2.default)(callback);if(!Array.isArray(tasks))return callback(new Error('First argument to waterfall must be an array of functions'));if(!tasks.length)return callback();var taskIndex=0;function nextTask(args){var task=(0,_wrapAsync2.default)(tasks[taskIndex++]);task(...args,(0,_onlyOnce2.default)(next));}function next(err,...args){if(err===false)return;if(err||taskIndex===tasks.length){return callback(err,...args);}nextTask(args);}nextTask([]);}exports.default=(0,_awaitify2.default)(waterfall);module.exports=exports['default'];},{"./internal/awaitify.js":5,"./internal/once.js":12,"./internal/onlyOnce.js":13,"./internal/wrapAsync.js":16}],18:[function(require,module,exports){(function(global){(function(){'use strict';var possibleNames=['BigInt64Array','BigUint64Array','Float32Array','Float64Array','Int16Array','Int32Array','Int8Array','Uint16Array','Uint32Array','Uint8Array','Uint8ClampedArray'];var g=typeof globalThis==='undefined'?global:globalThis;module.exports=function availableTypedArrays(){var out=[];for(var i=0;i<possibleNames.length;i++){if(typeof g[possibleNames[i]]==='function'){out[out.length]=possibleNames[i];}}return out;};}).call(this);}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{});},{}],19:[function(require,module,exports){},{}],20:[function(require,module,exports){'use strict';var GetIntrinsic=require('get-intrinsic');var callBind=require('./');var $indexOf=callBind(GetIntrinsic('String.prototype.indexOf'));module.exports=function callBoundIntrinsic(name,allowMissing){var intrinsic=GetIntrinsic(name,!!allowMissing);if(typeof intrinsic==='function'&&$indexOf(name,'.prototype.')>-1){return callBind(intrinsic);}return intrinsic;};},{"./":21,"get-intrinsic":34}],21:[function(require,module,exports){'use strict';var bind=require('function-bind');var GetIntrinsic=require('get-intrinsic');var $apply=GetIntrinsic('%Function.prototype.apply%');var $call=GetIntrinsic('%Function.prototype.call%');var $reflectApply=GetIntrinsic('%Reflect.apply%',true)||bind.call($call,$apply);var $gOPD=GetIntrinsic('%Object.getOwnPropertyDescriptor%',true);var $defineProperty=GetIntrinsic('%Object.defineProperty%',true);var $max=GetIntrinsic('%Math.max%');if($defineProperty){try{$defineProperty({},'a',{value:1});}catch(e){// IE 8 has a broken defineProperty
$defineProperty=null;}}module.exports=function callBind(originalFunction){var func=$reflectApply(bind,$call,arguments);if($gOPD&&$defineProperty){var desc=$gOPD(func,'length');if(desc.configurable){// original length, plus the receiver, minus any additional arguments (after the receiver)
$defineProperty(func,'length',{value:1+$max(0,originalFunction.length-(arguments.length-1))});}}return func;};var applyBind=function applyBind(){return $reflectApply(bind,$apply,arguments);};if($defineProperty){$defineProperty(module.exports,'apply',{value:applyBind});}else{module.exports.apply=applyBind;}},{"function-bind":31,"get-intrinsic":34}],22:[function(require,module,exports){'use strict';var isCallable=require('is-callable');var toStr=Object.prototype.toString;var hasOwnProperty=Object.prototype.hasOwnProperty;var forEachArray=function forEachArray(array,iterator,receiver){for(var i=0,len=array.length;i<len;i++){if(hasOwnProperty.call(array,i)){if(receiver==null){iterator(array[i],i,array);}else{iterator.call(receiver,array[i],i,array);}}}};var forEachString=function forEachString(string,iterator,receiver){for(var i=0,len=string.length;i<len;i++){// no such thing as a sparse string.
if(receiver==null){iterator(string.charAt(i),i,string);}else{iterator.call(receiver,string.charAt(i),i,string);}}};var forEachObject=function forEachObject(object,iterator,receiver){for(var k in object){if(hasOwnProperty.call(object,k)){if(receiver==null){iterator(object[k],k,object);}else{iterator.call(receiver,object[k],k,object);}}}};var forEach=function forEach(list,iterator,thisArg){if(!isCallable(iterator)){throw new TypeError('iterator must be a function');}var receiver;if(arguments.length>=3){receiver=thisArg;}if(toStr.call(list)==='[object Array]'){forEachArray(list,iterator,receiver);}else if(typeof list==='string'){forEachString(list,iterator,receiver);}else{forEachObject(list,iterator,receiver);}};module.exports=forEach;},{"is-callable":42}],23:[function(require,module,exports){/**
* FoxHound Query Generation Library
* @license MIT
* @author Steven Velozo <steven@velozo.com>
*/ // Load our base parameters skeleton object
const baseParameters=require('./Parameters.js');var FoxHound=function(){function createNew(pFable,pFromParameters){// If a valid Fable object isn't passed in, return a constructor
if(typeof pFable!=='object'||!('fable'in pFable)){return{new:createNew};}var _Fable=pFable;// The default parameters config object, used as a template for all new
// queries created from this query.
var _DefaultParameters=typeof pFromParameters==='undefined'?{}:pFromParameters;// The parameters config object for the current query.  This is the only
// piece of internal state that is important to operation.
var _Parameters=false;var _Dialects=require('./Foxhound-Dialects.js');// The unique identifier for a query
var _UUID=_Fable.getUUID();// The log level, for debugging chattiness.
var _LogLevel=0;// The dialect to use when generating queries
var _Dialect=false;/**
		* Clone the current FoxHound Query into a new Query object, copying all
		* parameters as the new default.  Clone also copies the log level.
		*
		* @method clone
		* @return {Object} Returns a cloned Query.  This is still chainable.
		*/var clone=function(){var tmpFoxHound=createNew(_Fable,baseParameters).setScope(_Parameters.scope).setBegin(_Parameters.begin).setCap(_Parameters.cap);// Schema is the only part of a query that carries forward.
tmpFoxHound.query.schema=_Parameters.query.schema;if(_Parameters.dataElements){tmpFoxHound.parameters.dataElements=_Parameters.dataElements.slice();// Copy the array of dataElements
}if(_Parameters.sort){tmpFoxHound.parameters.sort=_Parameters.sort.slice();// Copy the sort array.
// TODO: Fix the side affect nature of these being objects in the array .. they are technically clones of the previous.
}if(_Parameters.filter){tmpFoxHound.parameters.filter=_Parameters.filter.slice();// Copy the filter array.
// TODO: Fix the side affect nature of these being objects in the array .. they are technically clones of the previous.
}return tmpFoxHound;};/**
		* Reset the parameters of the FoxHound Query to the Default.  Default
		* parameters were set during object construction.
		*
		* @method resetParameters
		* @return {Object} Returns the current Query for chaining.
		*/var resetParameters=function(){_Parameters=_Fable.Utility.extend({},baseParameters,_DefaultParameters);_Parameters.query={disableAutoIdentity:false,disableAutoDateStamp:false,disableAutoUserStamp:false,disableDeleteTracking:false,body:false,schema:false,// The schema to intersect with our records
IDUser:0,// The user to stamp into records
UUID:_Fable.getUUID(),// A UUID for this record
records:false,// The records to be created or changed
parameters:{}};_Parameters.result={executed:false,// True once we've run a query.
value:false,// The return value of the last query run
// Updated below due to changes in how Async.js responds to a false value here
error:undefined// The error message of the last run query
};return this;};resetParameters();/**
		* Reset the parameters of the FoxHound Query to the Default.  Default
		* parameters were set during object construction.
		*
		* @method mergeParameters
		* @param {Object} pFromParameters A Parameters Object to merge from
		* @return {Object} Returns the current Query for chaining.
		*/var mergeParameters=function(pFromParameters){_Parameters=_Fable.Utility.extend({},_Parameters,pFromParameters);return this;};/**
		* Set the the Logging level.
		*
		* The log levels are:
		*    0  -  Don't log anything
		*    1  -  Log queries
		*    2  -  Log queries and non-parameterized queries
		*    3  -  Log everything
		*
		* @method setLogLevel
		* @param {Number} pLogLevel The log level for our object
		* @return {Object} Returns the current Query for chaining.
		*/var setLogLevel=function(pLogLevel){var tmpLogLevel=0;if(typeof pLogLevel==='number'&&pLogLevel%1===0){tmpLogLevel=pLogLevel;}_LogLevel=tmpLogLevel;return this;};/**
		* Set the Scope for the Query.  *Scope* is the source for the data being
		* pulled.  In TSQL this would be the _table_, whereas in MongoDB this
		* would be the _collection_.
		*
		* A scope can be either a string, or an array (for JOINs and such).
		*
		* @method setScope
		* @param {String} pScope A Scope for the Query.
		* @return {Object} Returns the current Query for chaining.
		*/var setScope=function(pScope){var tmpScope=false;if(typeof pScope==='string'){tmpScope=pScope;}else if(pScope!==false){_Fable.log.error('Scope set failed.  You must pass in a string or array.',{queryUUID:_UUID,parameters:_Parameters,invalidScope:pScope});}_Parameters.scope=tmpScope;if(_LogLevel>2){_Fable.log.info('Scope set: '+tmpScope,{queryUUID:_UUID,parameters:_Parameters});}return this;};/**
		* Set whether the query returns DISTINCT results.
		* For count queries, returns the distinct for the selected fields, or all fields in the base table by default.
		*
		* @method setDistinct
		* @param {Boolean} pDistinct True if the query should be distinct.
		* @return {Object} Returns the current Query for chaining.
		*/var setDistinct=function(pDistinct){_Parameters.distinct=!!pDistinct;if(_LogLevel>2){_Fable.log.info('Distinct set: '+_Parameters.distinct,{queryUUID:_UUID,parameters:_Parameters});}return this;};/**
		* Set the Data Elements for the Query.  *Data Elements* are the fields
		* being pulled by the query.  In TSQL this would be the _columns_,
		* whereas in MongoDB this would be the _fields_.
		*
		* The passed values can be either a string, or an array.
		*
		* @method setDataElements
		* @param {String} pDataElements The Data Element(s) for the Query.
		* @return {Object} Returns the current Query for chaining.
		*/var setDataElements=function(pDataElements){var tmpDataElements=false;if(Array.isArray(pDataElements)){// TODO: Check each entry of the array are all strings
tmpDataElements=pDataElements;}if(typeof pDataElements==='string'){tmpDataElements=[pDataElements];}_Parameters.dataElements=tmpDataElements;if(_LogLevel>2){_Fable.log.info('Data Elements set',{queryUUID:_UUID,parameters:_Parameters});}return this;};/**
		* Set the sort data element
		*
		* The passed values can be either a string, an object or an array of objects.
		*
		* The Sort object has two values:
		* {Column:'Birthday', Direction:'Ascending'}
		*
		* @method setSort
		* @param {String} pSort The sort criteria(s) for the Query.
		* @return {Object} Returns the current Query for chaining.
		*/var setSort=function(pSort){var tmpSort=false;if(Array.isArray(pSort)){// TODO: Check each entry of the array are all conformant sort objects
tmpSort=pSort;}else if(typeof pSort==='string'){// Default to ascending
tmpSort=[{Column:pSort,Direction:'Ascending'}];}else if(typeof pSort==='object'){// TODO: Check that this sort entry conforms to a sort entry
tmpSort=[pSort];}_Parameters.sort=tmpSort;if(_LogLevel>2){_Fable.log.info('Sort set',{queryUUID:_UUID,parameters:_Parameters});}return this;};/**
		* Set the join data element
		*
		* The passed values can be either an object or an array of objects.
		*
		* The join object has four values:
		* {Type:'INNER JOIN', Table:'Test', From:'Test.ID', To:'Scope.IDItem'}
		*
		* @method setJoin
		* @param {Object} pJoin The join criteria(s) for the Query.
		* @return {Object} Returns the current Query for chaining.
		*/var setJoin=function(pJoin){_Parameters.join=[];if(Array.isArray(pJoin)){pJoin.forEach(function(join){addJoin(join.Table,join.From,join.To,join.Type);});}else if(typeof pJoin==='object'){addJoin(pJoin.Table,pJoin.From,pJoin.To,pJoin.Type);}return this;};/**
		* Add a sort data element
		*
		* The passed values can be either a string, an object or an array of objects.
		*
		* The Sort object has two values:
		* {Column:'Birthday', Direction:'Ascending'}
		*
		* @method setSort
		* @param {String} pSort The sort criteria to add to the Query.
		* @return {Object} Returns the current Query for chaining.
		*/var addSort=function(pSort){var tmpSort=false;if(typeof pSort==='string'){// Default to ascending
tmpSort={Column:pSort,Direction:'Ascending'};}if(typeof pSort==='object'){// TODO: Check that this sort entry conforms to a sort entry
tmpSort=pSort;}if(!_Parameters.sort){_Parameters.sort=[];}_Parameters.sort.push(tmpSort);if(_LogLevel>2){_Fable.log.info('Sort set',{queryUUID:_UUID,parameters:_Parameters});}return this;};/**
		* Set the the Begin index for the Query.  *Begin* is the index at which
		* a query should start returning rows.  In TSQL this would be the n
		* parameter of ```LIMIT 1,n```, whereas in MongoDB this would be the
		* n in ```skip(n)```.
		*
		* The passed value must be an Integer >= 0.
		*
		* @method setBegin
		* @param {Number} pBeginAmount The index to begin returning Query data.
		* @return {Object} Returns the current Query for chaining.
		*/var setBegin=function(pBeginAmount){var tmpBegin=false;// Test if it is an integer > -1
// http://jsperf.com/numbers-and-integers
if(typeof pBeginAmount==='number'&&pBeginAmount%1===0&&pBeginAmount>=0){tmpBegin=pBeginAmount;}else if(pBeginAmount!==false){_Fable.log.error('Begin set failed; non-positive or non-numeric argument.',{queryUUID:_UUID,parameters:_Parameters,invalidBeginAmount:pBeginAmount});}_Parameters.begin=tmpBegin;if(_LogLevel>2){_Fable.log.info('Begin set: '+pBeginAmount,{queryUUID:_UUID,parameters:_Parameters});}return this;};/**
		* Set the the Cap for the Query.  *Cap* is the maximum number of records
		* a Query should return in a set.  In TSQL this would be the n
		* parameter of ```LIMIT n```, whereas in MongoDB this would be the
		* n in ```limit(n)```.
		*
		* The passed value must be an Integer >= 0.
		*
		* @method setCap
		* @param {Number} pCapAmount The maximum records for the Query set.
		* @return {Object} Returns the current Query for chaining.
		*/var setCap=function(pCapAmount){var tmpCapAmount=false;if(typeof pCapAmount==='number'&&pCapAmount%1===0&&pCapAmount>=0){tmpCapAmount=pCapAmount;}else if(pCapAmount!==false){_Fable.log.error('Cap set failed; non-positive or non-numeric argument.',{queryUUID:_UUID,parameters:_Parameters,invalidCapAmount:pCapAmount});}_Parameters.cap=tmpCapAmount;if(_LogLevel>2){_Fable.log.info('Cap set to: '+tmpCapAmount,{queryUUID:_UUID,parameters:_Parameters});}return this;};/**
		* Set the filter expression
		*
		* The passed values can be either an object or an array of objects.
		*
		* The Filter object has a minimum of two values (which expands to the following):
		* {Column:'Name', Value:'John'}
		* {Column:'Name', Operator:'EQ', Value:'John', Connector:'And', Parameter:'Name'}
		*
		* @method setFilter
		* @param {String} pFilter The filter(s) for the Query.
		* @return {Object} Returns the current Query for chaining.
		*/var setFilter=function(pFilter){var tmpFilter=false;if(Array.isArray(pFilter)){// TODO: Check each entry of the array are all conformant Filter objects
tmpFilter=pFilter;}else if(typeof pFilter==='object'){// TODO: Check that this Filter entry conforms to a Filter entry
tmpFilter=[pFilter];}_Parameters.filter=tmpFilter;if(_LogLevel>2){_Fable.log.info('Filter set',{queryUUID:_UUID,parameters:_Parameters});}return this;};/**
		* Add a filter expression
		*
		* {Column:'Name', Operator:'EQ', Value:'John', Connector:'And', Parameter:'Name'}
		*
		* @method addFilter
		* @return {Object} Returns the current Query for chaining.
		*/var addFilter=function(pColumn,pValue,pOperator,pConnector,pParameter){if(typeof pColumn!=='string'){_Fable.log.warn('Tried to add an invalid query filter column',{queryUUID:_UUID,parameters:_Parameters});return this;}if(typeof pValue==='undefined'){_Fable.log.warn('Tried to add an invalid query filter value',{queryUUID:_UUID,parameters:_Parameters,invalidColumn:pColumn});return this;}var tmpOperator=typeof pOperator==='undefined'?'=':pOperator;var tmpConnector=typeof pConnector==='undefined'?'AND':pConnector;var tmpParameter=typeof pParameter==='undefined'?pColumn:pParameter;//support table.field notation (mysql2 requires this)
tmpParameter=tmpParameter.replace('.','_');var tmpFilter={Column:pColumn,Operator:tmpOperator,Value:pValue,Connector:tmpConnector,Parameter:tmpParameter};if(!Array.isArray(_Parameters.filter)){_Parameters.filter=[tmpFilter];}else{_Parameters.filter.push(tmpFilter);}if(_LogLevel>2){_Fable.log.info('Added a filter',{queryUUID:_UUID,parameters:_Parameters,newFilter:tmpFilter});}return this;};/**
		* Add a join expression
		*
		* {Type:'INNER JOIN', Table:'Test', From:'Test.ID', To:'Scope.IDItem'}
		*
		* @method addJoin
		* @return {Object} Returns the current Query for chaining.
		*/var addJoin=function(pTable,pFrom,pTo,pType){if(typeof pTable!=='string'){_Fable.log.warn('Tried to add an invalid query join table',{queryUUID:_UUID,parameters:_Parameters});return this;}if(typeof pFrom==='undefined'||typeof pTo==='undefined'){_Fable.log.warn('Tried to add an invalid query join field',{queryUUID:_UUID,parameters:_Parameters});return this;}//sanity check the join fields
if(pFrom.indexOf(pTable)!=0){_Fable.log.warn('Tried to add an invalid query join field, join must come FROM the join table!',{queryUUID:_UUID,parameters:_Parameters,invalidField:pFrom});return this;}if(pTo.indexOf('.')<=0){_Fable.log.warn('Tried to add an invalid query join field, join must go TO a field on another table ([table].[field])!',{queryUUID:_UUID,parameters:_Parameters,invalidField:pTo});return this;}var tmpType=typeof pType==='undefined'?'INNER JOIN':pType;var tmpJoin={Type:tmpType,Table:pTable,From:pFrom,To:pTo};if(!Array.isArray(_Parameters.join)){_Parameters.join=[tmpJoin];}else{_Parameters.join.push(tmpJoin);}if(_LogLevel>2){_Fable.log.info('Added a join',{queryUUID:_UUID,parameters:_Parameters});}return this;};/**
		* Add a record (for UPDATE and INSERT)
		*
		*
		* @method addRecord
		* @param {Object} pRecord The record to add.
		* @return {Object} Returns the current Query for chaining.
		*/var addRecord=function(pRecord){if(typeof pRecord!=='object'){_Fable.log.warn('Tried to add an invalid record to the query -- records must be an object',{queryUUID:_UUID,parameters:_Parameters});return this;}if(!Array.isArray(_Parameters.query.records)){_Parameters.query.records=[pRecord];}else{_Parameters.query.records.push(pRecord);}if(_LogLevel>2){_Fable.log.info('Added a record to the query',{queryUUID:_UUID,parameters:_Parameters,newRecord:pRecord});}return this;};/**
		* Set the Dialect for Query generation.
		*
		* This function expects a string, case sensitive, which matches both the
		* folder and filename
		*
		* @method setDialect
		* @param {String} pDialectName The dialect for query generation.
		* @return {Object} Returns the current Query for chaining.
		*/var setDialect=function(pDialectName){if(typeof pDialectName!=='string'){_Fable.log.warn('Dialect set to English - invalid name',{queryUUID:_UUID,parameters:_Parameters,invalidDialect:pDialectName});return setDialect('English');}if(_Dialects.hasOwnProperty(pDialectName)){_Dialect=_Dialects[pDialectName](_Fable);if(_LogLevel>2){_Fable.log.info('Dialog set to: '+pDialectName,{queryUUID:_UUID,parameters:_Parameters});}}else{_Fable.log.error('Dialect not set - unknown dialect "'+pDialectName+"'",{queryUUID:_UUID,parameters:_Parameters,invalidDialect:pDialectName});setDialect('English');}return this;};/**
		* User to use for this query
		*
		* @method setIDUser
		*/var setIDUser=function(pIDUser){var tmpUserID=0;if(typeof pIDUser==='number'&&pIDUser%1===0&&pIDUser>=0){tmpUserID=pIDUser;}else if(pIDUser!==false){_Fable.log.error('User set failed; non-positive or non-numeric argument.',{queryUUID:_UUID,parameters:_Parameters,invalidIDUser:pIDUser});}_Parameters.userID=tmpUserID;_Parameters.query.IDUser=tmpUserID;if(_LogLevel>2){_Fable.log.info('IDUser set to: '+tmpUserID,{queryUUID:_UUID,parameters:_Parameters});}return this;};/**
		* Flag to disable auto identity
		*
		* @method setDisableAutoIdentity
		*/var setDisableAutoIdentity=function(pFlag){_Parameters.query.disableAutoIdentity=pFlag;return this;//chainable
};/**
		* Flag to disable auto datestamp
		*
		* @method setDisableAutoDateStamp
		*/var setDisableAutoDateStamp=function(pFlag){_Parameters.query.disableAutoDateStamp=pFlag;return this;//chainable
};/**
		* Flag to disable auto userstamp
		*
		* @method setDisableAutoUserStamp
		*/var setDisableAutoUserStamp=function(pFlag){_Parameters.query.disableAutoUserStamp=pFlag;return this;//chainable
};/**
		* Flag to disable delete tracking
		*
		* @method setDisableDeleteTracking
		*/var setDisableDeleteTracking=function(pFlag){_Parameters.query.disableDeleteTracking=pFlag;return this;//chainable
};/**
		* Check that a valid Dialect has been set
		*
		* If there has not been a dialect set, it defaults to English.
		* TODO: Have the json configuration define a "default" dialect.
		*
		* @method checkDialect
		*/var checkDialect=function(){if(_Dialect===false){setDialect('English');}};var buildCreateQuery=function(){checkDialect();_Parameters.query.body=_Dialect.Create(_Parameters);return this;};var buildReadQuery=function(){checkDialect();_Parameters.query.body=_Dialect.Read(_Parameters);return this;};var buildUpdateQuery=function(){checkDialect();_Parameters.query.body=_Dialect.Update(_Parameters);return this;};var buildDeleteQuery=function(){checkDialect();_Parameters.query.body=_Dialect.Delete(_Parameters);return this;};var buildUndeleteQuery=function(){checkDialect();_Parameters.query.body=_Dialect.Undelete(_Parameters);return this;};var buildCountQuery=function(){checkDialect();_Parameters.query.body=_Dialect.Count(_Parameters);return this;};/**
		* Container Object for our Factory Pattern
		*/var tmpNewFoxHoundObject={resetParameters:resetParameters,mergeParameters:mergeParameters,setLogLevel:setLogLevel,setScope:setScope,setDistinct:setDistinct,setIDUser:setIDUser,setDataElements:setDataElements,setBegin:setBegin,setCap:setCap,setFilter:setFilter,addFilter:addFilter,setSort:setSort,addSort:addSort,setJoin:setJoin,addJoin:addJoin,addRecord:addRecord,setDisableAutoIdentity:setDisableAutoIdentity,setDisableAutoDateStamp:setDisableAutoDateStamp,setDisableAutoUserStamp:setDisableAutoUserStamp,setDisableDeleteTracking:setDisableDeleteTracking,setDialect:setDialect,buildCreateQuery:buildCreateQuery,buildReadQuery:buildReadQuery,buildUpdateQuery:buildUpdateQuery,buildDeleteQuery:buildDeleteQuery,buildUndeleteQuery:buildUndeleteQuery,buildCountQuery:buildCountQuery,clone:clone,new:createNew};/**
		 * Query
		 *
		 * @property query
		 * @type Object
		 */Object.defineProperty(tmpNewFoxHoundObject,'query',{get:function(){return _Parameters.query;},set:function(pQuery){_Parameters.query=pQuery;},enumerable:true});/**
		 * Result
		 *
		 * @property result
		 * @type Object
		 */Object.defineProperty(tmpNewFoxHoundObject,'result',{get:function(){return _Parameters.result;},set:function(pResult){_Parameters.result=pResult;},enumerable:true});/**
		 * Query Parameters
		 *
		 * @property parameters
		 * @type Object
		 */Object.defineProperty(tmpNewFoxHoundObject,'parameters',{get:function(){return _Parameters;},set:function(pParameters){_Parameters=pParameters;},enumerable:true});/**
		 * Dialect
		 *
		 * @property dialect
		 * @type Object
		 */Object.defineProperty(tmpNewFoxHoundObject,'dialect',{get:function(){return _Dialect;},enumerable:true});/**
		 * Universally Unique Identifier
		 *
		 * @property uuid
		 * @type String
		 */Object.defineProperty(tmpNewFoxHoundObject,'uuid',{get:function(){return _UUID;},enumerable:true});/**
		 * Log Level
		 *
		 * @property logLevel
		 * @type Integer
		 */Object.defineProperty(tmpNewFoxHoundObject,'logLevel',{get:function(){return _LogLevel;},enumerable:true});return tmpNewFoxHoundObject;}return createNew();};module.exports=FoxHound();},{"./Foxhound-Dialects.js":24,"./Parameters.js":25}],24:[function(require,module,exports){getDialects=()=>{let tmpDialects={};tmpDialects.ALASQL=require('./dialects/ALASQL/FoxHound-Dialect-ALASQL.js');tmpDialects.English=require('./dialects/English/FoxHound-Dialect-English.js');tmpDialects.MeadowEndpoints=require('./dialects/MeadowEndpoints/FoxHound-Dialect-MeadowEndpoints.js');tmpDialects.MySQL=require('./dialects/MySQL/FoxHound-Dialect-MySQL.js');tmpDialects.default=tmpDialects.English;return tmpDialects;};module.exports=getDialects();},{"./dialects/ALASQL/FoxHound-Dialect-ALASQL.js":26,"./dialects/English/FoxHound-Dialect-English.js":27,"./dialects/MeadowEndpoints/FoxHound-Dialect-MeadowEndpoints.js":28,"./dialects/MySQL/FoxHound-Dialect-MySQL.js":29}],25:[function(require,module,exports){/**
* Query Parameters Object
*
* @class FoxHoundQueryParameters
* @constructor
*/var FoxHoundQueryParameters={scope:false,// STR: The scope of the data
// TSQL: the "Table" or "View"
// MongoDB: the "Collection"
dataElements:false,// ARR of STR: The data elements to return
// TSQL: the "Columns"
// MongoDB: the "Fields"
begin:false,// INT: Record index to start at
// TSQL: n in LIMIT 1,n
// MongoDB: n in Skip(n)
cap:false,// INT: Maximum number of records to return
// TSQL: n in LIMIT n
// MongoDB: n in limit(n)
// Serialization example for a query:
// Take the filter and return an array of filter instructions
// Basic instruction anatomy:
//       INSTRUCTION~FIELD~OPERATOR~VALUE
// FOP - Filter Open Paren
//       FOP~~(~
// FCP - Filter Close Paren
//       FCP~~)~
// FBV - Filter By Value
//       FBV~Category~EQ~Books
//       Possible comparisons:
//       * EQ - Equals To (=)
//       * NE - Not Equals To (!=)
//       * GT - Greater Than (>)
//       * GE - Greater Than or Equals To (>=)
//       * LT - Less Than (<)
//       * LE - Less Than or Equals To (<=)
//       * LK - Like (Like)
// FBL - Filter By List (value list, separated by commas)
//       FBL~Category~EQ~Books,Movies
// FSF - Filter Sort Field
//       FSF~Category~ASC~0
//       FSF~Category~DESC~0
// FCC - Filter Constraint Cap (the limit of what is returned)
//       FCC~~10~
// FCB - Filter Constraint Begin (the zero-based start index of what is returned)
//       FCB~~10~
//
// This means: FBV~Category~EQ~Books~FBV~PublishedYear~GT~2000~FSF~PublishedYear~DESC~0
//             Filters down to ALL BOOKS PUBLISHED AFTER 2000 IN DESCENDING ORDER
filter:false,// ARR of OBJ: Data filter expression list {Column:'Name', Operator:'EQ', Value:'John', Connector:'And', Parameter:'Name'}
// TSQL: the WHERE clause
// MongoDB: a find() expression
sort:false,// ARR of OBJ: The sort order    {Column:'Birthday', Direction:'Ascending'}
// TSQL: ORDER BY
// MongoDB: sort()
join:false,// ARR of OBJ: The join tables    {Type:'INNER JOIN', Table:'test', From: 'Test.ID', To: 'Scope.IDItem' }
// TSQL: JOIN
// Force a specific query to run regardless of above ... this is used to override the query generator.
queryOverride:false,// Where the generated query goes
query:false,/*
			{
				body: false,
				schema: false,   // The schema to intersect with our records
				IDUser: 0,       // The User ID to stamp into records
				UUID: A_UUID,    // Some globally unique record id, different per cloned query.
				records: false,  // The records to be created or changed
				parameters: {}
			}
		*/ // Who is making the query
userID:0,// Where the query results are stuck
result:false/*
			{
				executed: false, // True once we've run a query.
				value: false,    // The return value of the last query run
				error: false     // The error message of the last run query
			}
		*/};module.exports=FoxHoundQueryParameters;},{}],26:[function(require,module,exports){/**
* FoxHound ALASQL Dialect
*
* @license MIT
*
* For an ALASQL query override:
// An underscore template with the following values:
//      <%= DataElements %> = Field1, Field2, Field3, Field4
//      <%= Begin %>        = 0
//      <%= Cap %>          = 10
//      <%= Filter %>       = WHERE StartDate > :MyStartDate
//      <%= Sort %>         = ORDER BY Field1
// The values are empty strings if they aren't set.
*
* @author Steven Velozo <steven@velozo.com>
* @class FoxHoundDialectALASQL
*/var FoxHoundDialectALASQL=function(pFable){//Request time from SQL server with microseconds resolution
const SQL_NOW="NOW(3)";_Fable=pFable;/**
	* Generate a table name from the scope.
	*
	* Because ALASQL is all in-memory, and can be run in two modes (anonymous
	* working on arrays or table-based) we are going to make this a programmable
	* value.  Then we can share the code across both providers.
	*
	* @method: generateTableName
	* @param: {Object} pParameters SQL Query Parameters
	* @return: {String} Returns the table name clause
	*/var generateTableName=function(pParameters){return' '+pParameters.scope;};/**
	* Escape columns, because ALASQL has more reserved KWs than most SQL dialects
	*/var escapeColumn=(pColumn,pParameters)=>{if(pColumn.indexOf('.')<0){return'`'+pColumn+'`';}else{// This could suck if the scope is not the same
var tmpTableName=pParameters.scope;if(pColumn.indexOf(tmpTableName+'.')>-1){return'`'+pColumn.replace(tmpTableName+'.','')+'`';}else{// This doesn't work well but we'll try it.
return'`'+pColumn+'`';}}};/**
	* Generate a field list from the array of dataElements
	*
	* Each entry in the dataElements is a simple string
	*
	* @method: generateFieldList
	* @param: {Object} pParameters SQL Query Parameters
	* @param {Boolean} pIsForCountClause (optional) If true, generate fields for use within a count clause.
	* @return: {String} Returns the field list clause, or empty string if explicit fields are requested but cannot be fulfilled
	*          due to missing schema.
	*/var generateFieldList=function(pParameters,pIsForCountClause){var tmpDataElements=pParameters.dataElements;if(!Array.isArray(tmpDataElements)||tmpDataElements.length<1){if(!pIsForCountClause){return' *';}// we need to list all of the table fields explicitly; get them from the schema
const tmpSchema=Array.isArray(pParameters.query.schema)?pParameters.query.schema:[];if(tmpSchema.length<1){// this means we have no schema; returning an empty string here signals the calling code to handle this case
return'';}const idColumn=tmpSchema.find(entry=>entry.Type==='AutoIdentity');if(!idColumn){// this means there is no autoincrementing unique ID column; treat as above
return'';}return` ${idColumn.Column}`;}var tmpFieldList=' ';for(var i=0;i<tmpDataElements.length;i++){if(i>0){tmpFieldList+=', ';}tmpFieldList+=escapeColumn(tmpDataElements[i],pParameters);}return tmpFieldList;};/**
	* Generate a query from the array of where clauses
	*
	* Each clause is an object like:
		{
			Column:'Name',
			Operator:'EQ',
			Value:'John',
			Connector:'And',
			Parameter:'Name'
		}
	*
	* @method: generateWhere
	* @param: {Object} pParameters SQL Query Parameters
	* @return: {String} Returns the WHERE clause prefixed with WHERE, or an empty string if unnecessary
	*/var generateWhere=function(pParameters){var tmpFilter=Array.isArray(pParameters.filter)?pParameters.filter:[];var tmpTableName=generateTableName(pParameters).trim();if(!pParameters.query.disableDeleteTracking){// Check if there is a Deleted column on the Schema. If so, we add this to the filters automatically (if not already present)
var tmpSchema=Array.isArray(pParameters.query.schema)?pParameters.query.schema:[];for(var i=0;i<tmpSchema.length;i++){// There is a schema entry for it.  Process it accordingly.
var tmpSchemaEntry=tmpSchema[i];if(tmpSchemaEntry.Type==='Deleted'){var tmpHasDeletedParameter=false;//first, check to see if filters are already looking for Deleted column
if(tmpFilter.length>0){for(var x=0;x<tmpFilter.length;x++){if(tmpFilter[x].Column===tmpSchemaEntry.Column){tmpHasDeletedParameter=true;break;}}}if(!tmpHasDeletedParameter){//if not, we need to add it
tmpFilter.push({Column:tmpTableName+'.'+tmpSchemaEntry.Column,Operator:'=',Value:0,Connector:'AND',Parameter:'Deleted'});}break;}}}if(tmpFilter.length<1){return'';}var tmpWhere=' WHERE';// This is used to disable the connectors for subsequent queries.
// Only the open parenthesis operator uses this, currently.
var tmpLastOperatorNoConnector=false;for(var i=0;i<tmpFilter.length;i++){if(tmpFilter[i].Connector!='NONE'&&tmpFilter[i].Operator!=')'&&tmpWhere!=' WHERE'&&tmpLastOperatorNoConnector==false){tmpWhere+=' '+tmpFilter[i].Connector;}tmpLastOperatorNoConnector=false;var tmpColumnParameter;if(tmpFilter[i].Operator==='('){// Open a logical grouping
tmpWhere+=' (';tmpLastOperatorNoConnector=true;}else if(tmpFilter[i].Operator===')'){// Close a logical grouping
tmpWhere+=' )';}else if(tmpFilter[i].Operator==='IN'){tmpColumnParameter=tmpFilter[i].Parameter+'_w'+i;// Add the column name, operator and parameter name to the list of where value parenthetical
tmpWhere+=' '+escapeColumn(tmpFilter[i].Column,pParameters)+' '+tmpFilter[i].Operator+' ( :'+tmpColumnParameter+' )';pParameters.query.parameters[tmpColumnParameter]=tmpFilter[i].Value;}else if(tmpFilter[i].Operator==='IS NOT NULL'){// IS NOT NULL is a special operator which doesn't require a value, or parameter
tmpWhere+=' '+escapeColumn(tmpFilter[i].Column,pParameters)+' '+tmpFilter[i].Operator;}else{tmpColumnParameter=tmpFilter[i].Parameter+'_w'+i;// Add the column name, operator and parameter name to the list of where value parenthetical
tmpWhere+=' '+escapeColumn(tmpFilter[i].Column,pParameters)+' '+tmpFilter[i].Operator+' :'+tmpColumnParameter;pParameters.query.parameters[tmpColumnParameter]=tmpFilter[i].Value;}}return tmpWhere;};/**
	* Generate an ORDER BY clause from the sort array
	*
	* Each entry in the sort is an object like:
	* {Column:'Color',Direction:'Descending'}
	*
	* @method: generateOrderBy
	* @param: {Object} pParameters SQL Query Parameters
	* @return: {String} Returns the field list clause
	*/var generateOrderBy=function(pParameters){var tmpOrderBy=pParameters.sort;if(!Array.isArray(tmpOrderBy)||tmpOrderBy.length<1){return'';}var tmpOrderClause=' ORDER BY';for(var i=0;i<tmpOrderBy.length;i++){if(i>0){tmpOrderClause+=',';}tmpOrderClause+=' '+escapeColumn(tmpOrderBy[i].Column,pParameters);if(tmpOrderBy[i].Direction=='Descending'){tmpOrderClause+=' DESC';}}return tmpOrderClause;};/**
	* Generate the limit clause
	*
	* @method: generateLimit
	* @param: {Object} pParameters SQL Query Parameters
	* @return: {String} Returns the table name clause
	*/var generateLimit=function(pParameters){if(!pParameters.cap){return'';}var tmpLimit=' LIMIT';// Cap is required for a limit clause.
tmpLimit+=' '+pParameters.cap;// If there is a begin record, we'll pass that in as well.
if(pParameters.begin!==false){tmpLimit+=' FETCH '+pParameters.begin;}return tmpLimit;};/**
	* Generate the update SET clause
	*
	* @method: generateUpdateSetters
	* @param: {Object} pParameters SQL Query Parameters
	* @return: {String} Returns the table name clause
	*/var generateUpdateSetters=function(pParameters){var tmpRecords=pParameters.query.records;// We need to tell the query not to generate improperly if there are no values to set.
if(!Array.isArray(tmpRecords)||tmpRecords.length<1){return false;}// Check if there is a schema.  If so, we will use it to decide if these are parameterized or not.
var tmpSchema=Array.isArray(pParameters.query.schema)?pParameters.query.schema:[];var tmpUpdate='';// If there is more than one record in records, we are going to ignore them for now.
var tmpCurrentColumn=0;for(var tmpColumn in tmpRecords[0]){// No hash table yet, so, we will just linear search it for now.
// This uses the schema to decide if we want to treat a column differently on insert
var tmpSchemaEntry={Column:tmpColumn,Type:'Default'};for(var i=0;i<tmpSchema.length;i++){if(tmpColumn==tmpSchema[i].Column){// There is a schema entry for it.  Process it accordingly.
tmpSchemaEntry=tmpSchema[i];break;}}if(pParameters.query.disableAutoDateStamp&&tmpSchemaEntry.Type==='UpdateDate'){// This is ignored if flag is set
continue;}if(pParameters.query.disableAutoUserStamp&&tmpSchemaEntry.Type==='UpdateIDUser'){// This is ignored if flag is set
continue;}switch(tmpSchemaEntry.Type){case'AutoIdentity':case'CreateDate':case'CreateIDUser':case'DeleteDate':case'DeleteIDUser':// These are all ignored on update
continue;}if(tmpCurrentColumn>0){tmpUpdate+=',';}switch(tmpSchemaEntry.Type){case'UpdateDate':// This is an autoidentity, so we don't parameterize it and just pass in NULL
tmpUpdate+=' '+escapeColumn(tmpColumn,pParameters)+' = NOW()';break;case'UpdateIDUser':// This is the user ID, which we hope is in the query.
// This is how to deal with a normal column
var tmpColumnParameter=tmpColumn+'_'+tmpCurrentColumn;tmpUpdate+=' '+escapeColumn(tmpColumn,pParameters)+' = :'+tmpColumnParameter;// Set the query parameter
pParameters.query.parameters[tmpColumnParameter]=pParameters.query.IDUser;break;default:var tmpColumnDefaultParameter=tmpColumn+'_'+tmpCurrentColumn;tmpUpdate+=' '+escapeColumn(tmpColumn,pParameters)+' = :'+tmpColumnDefaultParameter;// Set the query parameter
pParameters.query.parameters[tmpColumnDefaultParameter]=tmpRecords[0][tmpColumn];break;}// We use a number to make sure parameters are unique.
tmpCurrentColumn++;}// We need to tell the query not to generate improperly if there are no values set.
if(tmpUpdate===''){return false;}return tmpUpdate;};/**
	* Generate the update-delete SET clause
	*
	* @method: generateUpdateDeleteSetters
	* @param: {Object} pParameters SQL Query Parameters
	* @return: {String} Returns the table name clause
	*/var generateUpdateDeleteSetters=function(pParameters){if(pParameters.query.disableDeleteTracking){//Don't generate an UPDATE query if Delete tracking is disabled
return false;}// Check if there is a schema.  If so, we will use it to decide if these are parameterized or not.
var tmpSchema=Array.isArray(pParameters.query.schema)?pParameters.query.schema:[];var tmpCurrentColumn=0;var tmpHasDeletedField=false;var tmpUpdate='';// No hash table yet, so, we will just linear search it for now.
// This uses the schema to decide if we want to treat a column differently on insert
var tmpSchemaEntry={Type:'Default'};for(var i=0;i<tmpSchema.length;i++){// There is a schema entry for it.  Process it accordingly.
tmpSchemaEntry=tmpSchema[i];var tmpUpdateSql=null;switch(tmpSchemaEntry.Type){case'Deleted':tmpUpdateSql=' '+escapeColumn(tmpSchemaEntry.Column,pParameters)+' = 1';tmpHasDeletedField=true;//this field is required in order for query to be built
break;case'DeleteDate':tmpUpdateSql=' '+escapeColumn(tmpSchemaEntry.Column,pParameters)+' = NOW()';break;case'UpdateDate':// Delete operation is an Update, so we should stamp the update time
tmpUpdateSql=' '+escapeColumn(tmpSchemaEntry.Column,pParameters)+' = NOW()';break;case'DeleteIDUser':// This is the user ID, which we hope is in the query.
// This is how to deal with a normal column
var tmpColumnParameter=tmpSchemaEntry.Column+'_'+tmpCurrentColumn;tmpUpdateSql=' '+escapeColumn(tmpSchemaEntry.Column,pParameters)+' = :'+tmpColumnParameter;// Set the query parameter
pParameters.query.parameters[tmpColumnParameter]=pParameters.query.IDUser;break;default://DON'T allow update of other fields in this query
continue;}if(tmpCurrentColumn>0){tmpUpdate+=',';}tmpUpdate+=tmpUpdateSql;// We use a number to make sure parameters are unique.
tmpCurrentColumn++;}// We need to tell the query not to generate improperly if there are no values set.
if(!tmpHasDeletedField||tmpUpdate===''){return false;}return tmpUpdate;};/**
	* Generate the update-delete SET clause
	*
	* @method: generateUpdateDeleteSetters
	* @param: {Object} pParameters SQL Query Parameters
	* @return: {String} Returns the table name clause
	*/var generateUpdateUndeleteSetters=function(pParameters){// Check if there is a schema.  If so, we will use it to decide if these are parameterized or not.
var tmpSchema=Array.isArray(pParameters.query.schema)?pParameters.query.schema:[];var tmpCurrentColumn=0;var tmpHasDeletedField=false;var tmpUpdate='';// No hash table yet, so, we will just linear search it for now.
// This uses the schema to decide if we want to treat a column differently on insert
var tmpSchemaEntry={Type:'Default'};for(var i=0;i<tmpSchema.length;i++){// There is a schema entry for it.  Process it accordingly.
tmpSchemaEntry=tmpSchema[i];var tmpUpdateSql=null;switch(tmpSchemaEntry.Type){case'Deleted':tmpUpdateSql=' '+escapeColumn(tmpSchemaEntry.Column,pParameters)+' = 0';tmpHasDeletedField=true;//this field is required in order for query to be built
break;case'UpdateDate':// Delete operation is an Update, so we should stamp the update time
tmpUpdateSql=' '+escapeColumn(tmpSchemaEntry.Column,pParameters)+' = NOW()';break;case'UpdateIDUser':// This is the user ID, which we hope is in the query.
// This is how to deal with a normal column
var tmpColumnParameter=tmpSchemaEntry.Column+'_'+tmpCurrentColumn;tmpUpdateSql=' '+escapeColumn(tmpSchemaEntry.Column,pParameters)+' = :'+tmpColumnParameter;// Set the query parameter
pParameters.query.parameters[tmpColumnParameter]=pParameters.query.IDUser;break;default://DON'T allow update of other fields in this query
continue;}if(tmpCurrentColumn>0){tmpUpdate+=',';}tmpUpdate+=tmpUpdateSql;// We use a number to make sure parameters are unique.
tmpCurrentColumn++;}// We need to tell the query not to generate improperly if there are no values set.
if(!tmpHasDeletedField||tmpUpdate===''){return false;}return tmpUpdate;};/**
	* Generate the create SET clause
	*
	* @method: generateCreateSetList
	* @param: {Object} pParameters SQL Query Parameters
	* @return: {String} Returns the table name clause
	*/var generateCreateSetValues=function(pParameters){var tmpRecords=pParameters.query.records;// We need to tell the query not to generate improperly if there are no values to set.
if(!Array.isArray(tmpRecords)||tmpRecords.length<1){return false;}// Check if there is a schema.  If so, we will use it to decide if these are parameterized or not.
var tmpSchema=Array.isArray(pParameters.query.schema)?pParameters.query.schema:[];var tmpCreateSet='';// If there is more than one record in records, we are going to ignore them for now.
var tmpCurrentColumn=0;for(var tmpColumn in tmpRecords[0]){// No hash table yet, so, we will just linear search it for now.
// This uses the schema to decide if we want to treat a column differently on insert
var tmpSchemaEntry={Column:tmpColumn,Type:'Default'};for(var i=0;i<tmpSchema.length;i++){if(tmpColumn==tmpSchema[i].Column){// There is a schema entry for it.  Process it accordingly.
tmpSchemaEntry=tmpSchema[i];break;}}if(!pParameters.query.disableDeleteTracking){if(tmpSchemaEntry.Type==='DeleteDate'||tmpSchemaEntry.Type==='DeleteIDUser'){// These are all ignored on insert (if delete tracking is enabled as normal)
continue;}}if(tmpCurrentColumn>0){tmpCreateSet+=',';}//define a re-usable method for setting up field definitions in a default pattern
var buildDefaultDefinition=function(){var tmpColumnParameter=tmpColumn+'_'+tmpCurrentColumn;tmpCreateSet+=' :'+tmpColumnParameter;// Set the query parameter
pParameters.query.parameters[tmpColumnParameter]=tmpRecords[0][tmpColumn];};var tmpColumnParameter;switch(tmpSchemaEntry.Type){case'AutoIdentity':if(pParameters.query.disableAutoIdentity){buildDefaultDefinition();}else{// This is an autoidentity, so we don't parameterize it and just pass in NULL
tmpCreateSet+=' NULL';}break;case'AutoGUID':if(pParameters.query.disableAutoIdentity){buildDefaultDefinition();}else if(tmpRecords[0][tmpColumn]&&tmpRecords[0][tmpColumn].length>=5&&tmpRecords[0][tmpColumn]!=='0x0000000000000000')//stricture default
{// Allow consumer to override AutoGUID
buildDefaultDefinition();}else{// This is an autoidentity, so we don't parameterize it and just pass in NULL
tmpColumnParameter=tmpColumn+'_'+tmpCurrentColumn;tmpCreateSet+=' :'+tmpColumnParameter;// Set the query parameter
pParameters.query.parameters[tmpColumnParameter]=pParameters.query.UUID;}break;case'UpdateDate':case'CreateDate':case'DeleteDate':if(pParameters.query.disableAutoDateStamp){buildDefaultDefinition();}else{// This is an autoidentity, so we don't parameterize it and just pass in NULL
tmpCreateSet+=' NOW()';}break;case'UpdateIDUser':case'CreateIDUser':case'DeleteIDUser':if(pParameters.query.disableAutoUserStamp){buildDefaultDefinition();}else{// This is the user ID, which we hope is in the query.
// This is how to deal with a normal column
tmpColumnParameter=tmpColumn+'_'+tmpCurrentColumn;tmpCreateSet+=' :'+tmpColumnParameter;// Set the query parameter
pParameters.query.parameters[tmpColumnParameter]=pParameters.query.IDUser;}break;default:buildDefaultDefinition();break;}// We use an appended number to make sure parameters are unique.
tmpCurrentColumn++;}// We need to tell the query not to generate improperly if there are no values set.
if(tmpCreateSet===''){return false;}return tmpCreateSet;};/**
	* Generate the create SET clause
	*
	* @method: generateCreateSetList
	* @param: {Object} pParameters SQL Query Parameters
	* @return: {String} Returns the table name clause
	*/var generateCreateSetList=function(pParameters){// The records were already validated by generateCreateSetValues
var tmpRecords=pParameters.query.records;// Check if there is a schema.  If so, we will use it to decide if these are parameterized or not.
var tmpSchema=Array.isArray(pParameters.query.schema)?pParameters.query.schema:[];var tmpCreateSet='';// If there is more than one record in records, we are going to ignore them for now.
for(var tmpColumn in tmpRecords[0]){// No hash table yet, so, we will just linear search it for now.
// This uses the schema to decide if we want to treat a column differently on insert
var tmpSchemaEntry={Column:tmpColumn,Type:'Default'};for(var i=0;i<tmpSchema.length;i++){if(tmpColumn==tmpSchema[i].Column){// There is a schema entry for it.  Process it accordingly.
tmpSchemaEntry=tmpSchema[i];break;}}if(!pParameters.query.disableDeleteTracking){if(tmpSchemaEntry.Type==='DeleteDate'||tmpSchemaEntry.Type==='DeleteIDUser'){// These are all ignored on insert (if delete tracking is enabled as normal)
continue;}}switch(tmpSchemaEntry.Type){default:if(tmpCreateSet!=''){tmpCreateSet+=',';}tmpCreateSet+=' '+escapeColumn(tmpColumn,pParameters);break;}}return tmpCreateSet;};var Create=function(pParameters){var tmpTableName=generateTableName(pParameters);var tmpCreateSetList=generateCreateSetList(pParameters);var tmpCreateSetValues=generateCreateSetValues(pParameters);if(!tmpCreateSetValues){return false;}return'INSERT INTO'+tmpTableName+' ('+tmpCreateSetList+') VALUES ('+tmpCreateSetValues+');';};/**
	* Read one or many records
	*
	* Some examples:
	* SELECT * FROM WIDGETS;
	* SELECT * FROM WIDGETS LIMIT 0, 20;
	* SELECT * FROM WIDGETS LIMIT 5, 20;
	* SELECT ID, Name, Cost FROM WIDGETS LIMIT 5, 20;
	* SELECT ID, Name, Cost FROM WIDGETS LIMIT 5, 20 WHERE LastName = 'Smith';
	*
	* @method Read
	* @param {Object} pParameters SQL Query parameters
	* @return {String} Returns the current Query for chaining.
	*/var Read=function(pParameters){var tmpFieldList=generateFieldList(pParameters);var tmpTableName=generateTableName(pParameters);var tmpWhere=generateWhere(pParameters);var tmpOrderBy=generateOrderBy(pParameters);var tmpLimit=generateLimit(pParameters);const tmpOptDistinct=pParameters.distinct?' DISTINCT':'';if(pParameters.queryOverride){try{var tmpQueryTemplate=_Fable.Utility.template(pParameters.queryOverride);return tmpQueryTemplate({FieldList:tmpFieldList,TableName:tmpTableName,Where:tmpWhere,OrderBy:tmpOrderBy,Limit:tmpLimit,Distinct:tmpOptDistinct,_Params:pParameters});}catch(pError){// This pokemon is here to give us a convenient way of not throwing up totally if the query fails.
console.log('Error with custom Read Query ['+pParameters.queryOverride+']: '+pError);return false;}}return`SELECT${tmpOptDistinct}${tmpFieldList} FROM${tmpTableName}${tmpWhere}${tmpOrderBy}${tmpLimit};`;};var Update=function(pParameters){var tmpTableName=generateTableName(pParameters);var tmpWhere=generateWhere(pParameters);var tmpUpdateSetters=generateUpdateSetters(pParameters);if(!tmpUpdateSetters){return false;}return'UPDATE'+tmpTableName+' SET'+tmpUpdateSetters+tmpWhere+';';};var Delete=function(pParameters){var tmpTableName=generateTableName(pParameters);var tmpWhere=generateWhere(pParameters);var tmpUpdateDeleteSetters=generateUpdateDeleteSetters(pParameters);if(tmpUpdateDeleteSetters){//If it has a deleted bit, update it instead of actually deleting the record
return'UPDATE'+tmpTableName+' SET'+tmpUpdateDeleteSetters+tmpWhere+';';}else{return'DELETE FROM'+tmpTableName+tmpWhere+';';}};var Undelete=function(pParameters){var tmpTableName=generateTableName(pParameters);let tmpDeleteTrackingState=pParameters.query.disableDeleteTracking;pParameters.query.disableDeleteTracking=true;var tmpWhere=generateWhere(pParameters);var tmpUpdateUndeleteSetters=generateUpdateUndeleteSetters(pParameters);pParameters.query.disableDeleteTracking=tmpDeleteTrackingState;if(tmpUpdateUndeleteSetters){//If it has a deleted bit, update it instead of actually deleting the record
return'UPDATE'+tmpTableName+' SET'+tmpUpdateUndeleteSetters+tmpWhere+';';}else{return'SELECT NULL;';}};var Count=function(pParameters){var tmpTableName=generateTableName(pParameters);var tmpWhere=generateWhere(pParameters);const tmpFieldList=pParameters.distinct?generateFieldList(pParameters,true):'*';// here, we ignore the distinct keyword if no fields have been specified and
if(pParameters.distinct&&tmpFieldList.length<1){console.warn('Distinct requested but no field list or schema are available, so not honoring distinct for count query.');}const tmpOptDistinct=pParameters.distinct&&tmpFieldList.length>0?'DISTINCT':'';if(pParameters.queryOverride){try{var tmpQueryTemplate=_Fable.Utility.template(pParameters.queryOverride);return tmpQueryTemplate({FieldList:[],TableName:tmpTableName,Where:tmpWhere,OrderBy:'',Limit:'',Distinct:tmpOptDistinct,_Params:pParameters});}catch(pError){// This pokemon is here to give us a convenient way of not throwing up totally if the query fails.
console.log('Error with custom Count Query ['+pParameters.queryOverride+']: '+pError);return false;}}return`SELECT COUNT(${tmpOptDistinct}${tmpFieldList||'*'}) AS RowCount FROM${tmpTableName}${tmpWhere};`;};var tmpDialect={Create:Create,Read:Read,Update:Update,Delete:Delete,Undelete:Undelete,Count:Count};/**
	* Dialect Name
	*
	* @property name
	* @type string
	*/Object.defineProperty(tmpDialect,'name',{get:function(){return'ALASQL';},enumerable:true});return tmpDialect;};module.exports=FoxHoundDialectALASQL;},{}],27:[function(require,module,exports){/**
* FoxHound English Dialect
*
* Because if I can't ask for it in my native tongue, how am I going to ask a
* complicated server for it?
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @class FoxHoundDialectEnglish
*/var FoxHoundDialectEnglish=function(){var Create=function(pParameters){var tmpScope=pParameters.scope;return'Here is a '+tmpScope+'.';};/**
	* Read one or many records
	*
	* Some examples:
	* Please give me all your Widget records.  Thanks.
	* Please give me 20 Widget records.  Thanks.
	* Please give me 20 Widget records starting with record 5.  Thanks.
	* Please give me the ID, Name and Cost of 20 Widget records starting with record 5.  Thanks.
	* Please give me the ID and Name of 20 Widget records starting with record 5, when LastName equals "Smith".  Thanks.
	*
	* @method Read
	* @param {Number} pLogLevel The log level for our object
	* @return {String} Returns the current Query for chaining.
	*/var Read=function(pParameters){var tmpScope=pParameters.scope;const tmpDistinct=pParameters.distinct?'unique ':'';return`Please give me all your ${tmpDistinct}${tmpScope} records.  Thanks.`;};var Update=function(pParameters){var tmpScope=pParameters.scope;return'I am changing your '+tmpScope+'.';};var Delete=function(pParameters){var tmpScope=pParameters.scope;return'I am deleting your '+tmpScope+'.';};var Undelete=function(pParameters){var tmpScope=pParameters.scope;return'I am undeleting your '+tmpScope+'.';};var Count=function(pParameters){var tmpScope=pParameters.scope;const tmpDistinct=pParameters.distinct?'unique ':'';return`Count your ${tmpDistinct}${tmpScope}.`;};var tmpDialect={Create:Create,Read:Read,Update:Update,Delete:Delete,Undelete:Undelete,Count:Count};/**
	 * Dialect Name
	 *
	 * @property name
	 * @type string
	 */Object.defineProperty(tmpDialect,'name',{get:function(){return'English';},enumerable:true});return tmpDialect;};module.exports=FoxHoundDialectEnglish;},{}],28:[function(require,module,exports){/**
* FoxHound Meadow Endpoints Dialect
*
* @license MIT
*
* @author Steven Velozo <steven@velozo.com>
* @class FoxHoundDialectMeadowEndpoints
*/var FoxHoundDialectMeadowEndpoints=function(){/**
	 * Generate a table name from the scope
	 *
	 * @method: generateTableName
	 * @param: {Object} pParameters SQL Query Parameters
	 * @return: {String} Returns the table name clause
	 */var generateTableName=function(pParameters){return pParameters.scope;};/**
	 * Generate the Identity column from the schema or scope
	 * 
	 * @method: generateIdentityColumnName
	 * @param: {Object} pParameters SQL Query Parameters
	 * @return: {String} Returns the table name clause
	 */var generateIdentityColumnName=function(pParameters){// TODO: See about using the Schema or the Schemata for this
return`ID${pParameters.scope}`;};/**
	 * Generate a field list from the array of dataElements
	 *
	 * Each entry in the dataElements is a simple string
	 *
	 * @method: generateFieldList
	 * @param: {Object} pParameters SQL Query Parameters
	 * @return: {String} Returns the field list clause
	 */var generateFieldList=function(pParameters){var tmpDataElements=pParameters.dataElements;if(!Array.isArray(tmpDataElements)||tmpDataElements.length<1){return'';}var tmpFieldList='';for(var i=0;i<tmpDataElements.length;i++){if(i>0){tmpFieldList+=',';}tmpFieldList+=tmpDataElements[i];}return tmpFieldList;};/**
	 * Generate a query from the array of where clauses
	 *
	 * Each clause is an object like:
		{
			Column:'Name', 
			Operator:'EQ', 
			Value:'John', 
			Connector:'And', 
			Parameter:'Name'
		}
	 *
	 * @method: generateWhere
	 * @param: {Object} pParameters SQL Query Parameters
	 * @return: {String} Returns the WHERE clause prefixed with WHERE, or an empty string if unnecessary
	 */var generateWhere=function(pParameters){var tmpFilter=Array.isArray(pParameters.filter)?pParameters.filter:[];var tmpTableName=generateTableName(pParameters);var tmpURL='';let tmpfAddFilter=(pFilterCommand,pFilterParameters)=>{if(tmpURL.length>0){tmpURL+='~';}tmpURL+=`${pFilterCommand}~${pFilterParameters[0]}~${pFilterParameters[1]}~${pFilterParameters[2]}`;};let tmpfTranslateOperator=pOperator=>{tmpNewOperator='EQ';switch(pOperator.toUpperCase()){case'!=':tmpNewOperator='NE';break;case'>':tmpNewOperator='GT';break;case'>=':tmpNewOperator='GE';break;case'<=':tmpNewOperator='LE';break;case'<':tmpNewOperator='LT';break;case'LIKE':tmpNewOperator='LK';break;case'IN':tmpNewOperator='INN';break;case'NOT IN':tmpNewOperator='NI';break;}return tmpNewOperator;};// Translating Delete Tracking bit on query to a query with automagic
// This will eventually deprecate this as part of the necessary query
if(pParameters.query.disableDeleteTracking){tmpfAddFilter('FBV',['Deleted','GE','0']);}for(var i=0;i<tmpFilter.length;i++){if(tmpFilter[i].Operator==='('){tmpfAddFilter('FOP',['0','(','0']);}else if(tmpFilter[i].Operator===')'){// Close a logical grouping
tmpfAddFilter('FCP',['0',')','0']);}else if(tmpFilter[i].Operator==='IN'||tmpFilter[i].Operator==="NOT IN"){let tmpFilterCommand='FBV';if(tmpFilter[i].Connector=='OR'){tmpFilterCommand='FBVOR';}// Add the column name, operator and parameter name to the list of where value parenthetical
tmpfAddFilter(tmpFilterCommand,[tmpFilter[i].Column,tmpfTranslateOperator(tmpFilter[i].Operator),tmpFilter[i].Value.map(encodeURIComponent).join(',')]);}else if(tmpFilter[i].Operator==='IS NULL'){// IS NULL is a special operator which doesn't require a value, or parameter
tmpfAddFilter('FBV',[tmpFilter[i].Column,'IN','0']);}else if(tmpFilter[i].Operator==='IS NOT NULL'){// IS NOT NULL is a special operator which doesn't require a value, or parameter
tmpfAddFilter('FBV',[tmpFilter[i].Column,'NN','0']);}else{let tmpFilterCommand='FBV';if(tmpFilter[i].Connector=='OR'){tmpFilterCommand='FBVOR';}// Add the column name, operator and parameter name to the list of where value parenthetical
tmpfAddFilter(tmpFilterCommand,[tmpFilter[i].Column,tmpfTranslateOperator(tmpFilter[i].Operator),encodeURIComponent(tmpFilter[i].Value)]);}}let tmpOrderBy=generateOrderBy(pParameters);if(tmpOrderBy){if(tmpURL){tmpURL+='~';}tmpURL+=tmpOrderBy;}return tmpURL;};/**
	 * Get the flags for the request
     * 
     * These are usually passed in for Update and Create when extra tracking is disabled.
	 *
	 * @method: generateFlags
	 * @param: {Object} pParameters SQL Query Parameters
	 * @return: {String} Flags to be sent, if any.
	 */function generateFlags(pParameters){let tmpDisableAutoDateStamp=pParameters.query.disableAutoDateStamp;let tmpDisableDeleteTracking=pParameters.query.disableDeleteTracking;let tmpDisableAutoIdentity=pParameters.query.disableAutoIdentity;let tmpDisableAutoUserStamp=pParameters.query.disableAutoUserStamp;let tmpFlags='';let fAddFlag=(pFlagSet,pFlag)=>{if(pFlagSet){if(tmpFlags.length>0){tmpFlags+=',';}tmpFlags+=pFlag;}};fAddFlag(tmpDisableAutoDateStamp,'DisableAutoDateStamp');fAddFlag(tmpDisableDeleteTracking,'DisableDeleteTracking');fAddFlag(tmpDisableAutoIdentity,'DisableAutoIdentity');fAddFlag(tmpDisableAutoUserStamp,'DisableAutoUserStamp');return tmpFlags;};/**
	 * Get the ID for the record, to be used in URIs
	 *
	 * @method: getIDRecord
	 * @param: {Object} pParameters SQL Query Parameters
	 * @return: {String} ID of the record in string form for the URI
	 */var getIDRecord=function(pParameters){var tmpFilter=Array.isArray(pParameters.filter)?pParameters.filter:[];var tmpIDRecord=false;if(tmpFilter.length<1){return tmpIDRecord;}for(var i=0;i<tmpFilter.length;i++){// Check Schema Entry Type
var tmpSchema=Array.isArray(pParameters.query.schema)?pParameters.query.schema:[];var tmpSchemaEntry={Column:tmpFilter[i].Column,Type:'Default'};for(var j=0;j<tmpSchema.length;j++){// If this column is the AutoIdentity, set it.
if(tmpFilter[i].Column==tmpSchema[j].Column&&tmpSchema[j].Type=='AutoIdentity'){tmpIDRecord=tmpFilter[i].Value;break;}}}return tmpIDRecord;};/**
	 * Generate an ORDER BY clause from the sort array
	 *
	 * Each entry in the sort is an object like:
	 * {Column:'Color',Direction:'Descending'}
	 *
	 * @method: generateOrderBy
	 * @param: {Object} pParameters SQL Query Parameters
	 * @return: {String} Returns the field list clause
	 */var generateOrderBy=function(pParameters){var tmpOrderBy=pParameters.sort;var tmpOrderClause=false;if(!Array.isArray(tmpOrderBy)||tmpOrderBy.length<1){return tmpOrderClause;}tmpOrderClause='';for(var i=0;i<tmpOrderBy.length;i++){if(i>0){tmpOrderClause+='~';}tmpOrderClause+=`FSF~${tmpOrderBy[i].Column}~`;if(tmpOrderBy[i].Direction=='Descending'){tmpOrderClause+='DESC~0';}else{tmpOrderClause+='ASC~0';}}return tmpOrderClause;};/**
	 * Generate the limit clause
	 *
	 * @method: generateLimit
	 * @param: {Object} pParameters SQL Query Parameters
	 * @return: {String} Returns the table name clause
	 */var generateLimit=function(pParameters){if(!pParameters.cap){return'';}let tmpBegin=pParameters.begin!==false?pParameters.begin:0;return`${tmpBegin}/${pParameters.cap}`;};var Create=function(pParameters){var tmpTableName=generateTableName(pParameters);var tmpFlags=generateFlags(pParameters);if(tmpTableName){let tmpURL=tmpTableName;if(tmpFlags){tmpURL=`${tmpURL}/WithFlags/${tmpFlags}`;}return tmpURL;}else{return false;}};/**
	* Read one or many records
	*
	* @method Read
	* @param {Object} pParameters SQL Query parameters
	* @return {String} Returns the current Query for chaining.
	*/var Read=function(pParameters){var tmpTableName=generateTableName(pParameters);var tmpFieldList=generateFieldList(pParameters);var tmpWhere=generateWhere(pParameters);var tmpLimit=generateLimit(pParameters);var tmpURL=`${tmpTableName}`;// In the case that there is only a single query parameter, and the parameter is a single identity, 
// we will cast it to the READ endpoint rather than READS.
if(pParameters.filter&&pParameters.filter.length==1// If there is exactly one query filter parameter
&&pParameters.filter[0].Column===generateIdentityColumnName(pParameters)// AND It is the Identity column
&&pParameters.filter[0].Operator==='='// AND The comparators is a simple equals 
&&tmpLimit==''&&tmpFieldList==''// AND There is no limit or field list set
&&!pParameters.sort)// AND There is no sort clause
{// THEN This is a SINGLE READ by presumption.
// There are some bad side affects this could cause with chaining and overridden behaviors, if 
// we are requesting a filtered list of 1 record.
tmpURL=`${tmpURL}/${pParameters.filter[0].Value}`;}else{tmpURL=`${tmpURL}s`;if(tmpFieldList){tmpURL=`${tmpURL}/LiteExtended/${tmpFieldList}`;}if(tmpWhere){tmpURL=`${tmpURL}/FilteredTo/${tmpWhere}`;}if(tmpLimit){tmpURL=`${tmpURL}/${tmpLimit}`;}}return tmpURL;};var Update=function(pParameters){var tmpTableName=generateTableName(pParameters);var tmpFlags=generateFlags(pParameters);if(tmpTableName){let tmpURL=tmpTableName;if(tmpFlags){tmpURL=`${tmpURL}/WithFlags/${tmpFlags}`;}return tmpURL;}else{return false;}};var Delete=function(pParameters){var tmpTableName=generateTableName(pParameters);var tmpIDRecord=getIDRecord(pParameters);if(!tmpIDRecord){return false;}return`${tmpTableName}/${tmpIDRecord}`;};var Count=function(pParameters){var tmpTableName=generateTableName(pParameters);var tmpWhere=generateWhere(pParameters);let tmpCountQuery=`${tmpTableName}s/Count`;if(tmpWhere){return`${tmpTableName}s/Count/FilteredTo/${tmpWhere}`;}return tmpCountQuery;};var tmpDialect={Create:Create,Read:Read,Update:Update,Delete:Delete,Count:Count};/**
	 * Dialect Name
	 *
	 * @property name
	 * @type string
	 */Object.defineProperty(tmpDialect,'name',{get:function(){return'MeadowEndpoints';},enumerable:true});return tmpDialect;};module.exports=FoxHoundDialectMeadowEndpoints;},{}],29:[function(require,module,exports){/**
* FoxHound MySQL Dialect
*
* @license MIT
*
* For a MySQL query override:
// An underscore template with the following values:
//      <%= DataElements %> = Field1, Field2, Field3, Field4
//      <%= Begin %>        = 0
//      <%= Cap %>          = 10
//      <%= Filter %>       = WHERE StartDate > :MyStartDate
//      <%= Sort %>         = ORDER BY Field1
// The values are empty strings if they aren't set.
*
* @author Steven Velozo <steven@velozo.com>
* @class FoxHoundDialectMySQL
*/var FoxHoundDialectMySQL=function(pFable){//Request time from SQL server with microseconds resolution
const SQL_NOW="NOW(3)";_Fable=pFable;/**
	* Generate a table name from the scope
	*
	* @method: generateTableName
	* @param: {Object} pParameters SQL Query Parameters
	* @return: {String} Returns the table name clause
	*/var generateTableName=function(pParameters){if(pParameters.scope&&pParameters.scope.indexOf('`')>=0)return' '+pParameters.scope+'';else return' `'+pParameters.scope+'`';};/**
	* Generate a field list from the array of dataElements
	*
	* Each entry in the dataElements is a simple string
	*
	* @method: generateFieldList
	* @param: {Object} pParameters SQL Query Parameters
	* @param {Boolean} pIsForCountClause (optional) If true, generate fields for use within a count clause.
	* @return: {String} Returns the field list clause, or empty string if explicit fields are requested but cannot be fulfilled
	*          due to missing schema.
	*/var generateFieldList=function(pParameters,pIsForCountClause){var tmpDataElements=pParameters.dataElements;if(!Array.isArray(tmpDataElements)||tmpDataElements.length<1){const tmpTableName=generateTableName(pParameters);if(!pIsForCountClause){return tmpTableName+'.*';}// we need to list all of the table fields explicitly; get them from the schema
const tmpSchema=Array.isArray(pParameters.query.schema)?pParameters.query.schema:[];if(tmpSchema.length<1){// this means we have no schema; returning an empty string here signals the calling code to handle this case
return'';}const idColumn=tmpSchema.find(entry=>entry.Type==='AutoIdentity');if(!idColumn){// this means there is no autoincrementing unique ID column; treat as above
return'';}const qualifiedIDColumn=`${tmpTableName}.${idColumn.Column}`;return` ${generateSafeFieldName(qualifiedIDColumn)}`;}var tmpFieldList=' ';for(var i=0;i<tmpDataElements.length;i++){if(i>0){tmpFieldList+=', ';}if(Array.isArray(tmpDataElements[i])){tmpFieldList+=generateSafeFieldName(tmpDataElements[i][0]);if(tmpDataElements[i].length>1&&tmpDataElements[i][1]){tmpFieldList+=" AS "+generateSafeFieldName(tmpDataElements[i][1]);}}else{tmpFieldList+=generateSafeFieldName(tmpDataElements[i]);}}return tmpFieldList;};const SURROUNDING_QUOTES_AND_WHITESPACE_REGEX=/^[` ]+|[` ]+$/g;const cleanseQuoting=str=>{return str.replace(SURROUNDING_QUOTES_AND_WHITESPACE_REGEX,'');};/**
	* Ensure a field name is properly escaped.
	*/var generateSafeFieldName=function(pFieldName){let pFieldNames=pFieldName.split('.');if(pFieldNames.length>1){const cleansedFieldName=cleanseQuoting(pFieldNames[1]);if(cleansedFieldName==='*'){// do not put * as `*`
return"`"+cleanseQuoting(pFieldNames[0])+"`.*";}return"`"+cleanseQuoting(pFieldNames[0])+"`.`"+cleansedFieldName+"`";}const cleansedFieldName=cleanseQuoting(pFieldNames[0]);if(cleansedFieldName==='*'){// do not put * as `*`
return'*';}return"`"+cleanseQuoting(pFieldNames[0])+"`";};/**
	* Generate a query from the array of where clauses
	*
	* Each clause is an object like:
		{
			Column:'Name',
			Operator:'EQ',
			Value:'John',
			Connector:'And',
			Parameter:'Name'
		}
	*
	* @method: generateWhere
	* @param: {Object} pParameters SQL Query Parameters
	* @return: {String} Returns the WHERE clause prefixed with WHERE, or an empty string if unnecessary
	*/var generateWhere=function(pParameters){var tmpFilter=Array.isArray(pParameters.filter)?pParameters.filter:[];var tmpTableName=generateTableName(pParameters);if(!pParameters.query.disableDeleteTracking){// Check if there is a Deleted column on the Schema. If so, we add this to the filters automatically (if not already present)
var tmpSchema=Array.isArray(pParameters.query.schema)?pParameters.query.schema:[];for(var i=0;i<tmpSchema.length;i++){// There is a schema entry for it.  Process it accordingly.
var tmpSchemaEntry=tmpSchema[i];if(tmpSchemaEntry.Type==='Deleted'){var tmpHasDeletedParameter=false;//first, check to see if filters are already looking for Deleted column
if(tmpFilter.length>0){for(var x=0;x<tmpFilter.length;x++){if(tmpFilter[x].Column===tmpSchemaEntry.Column){tmpHasDeletedParameter=true;break;}}}if(!tmpHasDeletedParameter){//if not, we need to add it
tmpFilter.push({Column:tmpTableName+'.'+tmpSchemaEntry.Column,Operator:'=',Value:0,Connector:'AND',Parameter:'Deleted'});}break;}}}if(tmpFilter.length<1){return'';}var tmpWhere=' WHERE';// This is used to disable the connectors for subsequent queries.
// Only the open parenthesis operator uses this, currently.
var tmpLastOperatorNoConnector=false;for(var i=0;i<tmpFilter.length;i++){if(tmpFilter[i].Connector!='NONE'&&tmpFilter[i].Operator!=')'&&tmpWhere!=' WHERE'&&tmpLastOperatorNoConnector==false){tmpWhere+=' '+tmpFilter[i].Connector;}tmpLastOperatorNoConnector=false;var tmpColumnParameter;if(tmpFilter[i].Operator==='('){// Open a logical grouping
tmpWhere+=' (';tmpLastOperatorNoConnector=true;}else if(tmpFilter[i].Operator===')'){// Close a logical grouping
tmpWhere+=' )';}else if(tmpFilter[i].Operator==='IN'||tmpFilter[i].Operator==="NOT IN"){tmpColumnParameter=tmpFilter[i].Parameter+'_w'+i;// Add the column name, operator and parameter name to the list of where value parenthetical
tmpWhere+=' '+tmpFilter[i].Column+' '+tmpFilter[i].Operator+' ( :'+tmpColumnParameter+' )';pParameters.query.parameters[tmpColumnParameter]=tmpFilter[i].Value;}else if(tmpFilter[i].Operator==='IS NULL'){// IS NULL is a special operator which doesn't require a value, or parameter
tmpWhere+=' '+tmpFilter[i].Column+' '+tmpFilter[i].Operator;}else if(tmpFilter[i].Operator==='IS NOT NULL'){// IS NOT NULL is a special operator which doesn't require a value, or parameter
tmpWhere+=' '+tmpFilter[i].Column+' '+tmpFilter[i].Operator;}else{tmpColumnParameter=tmpFilter[i].Parameter+'_w'+i;// Add the column name, operator and parameter name to the list of where value parenthetical
tmpWhere+=' '+tmpFilter[i].Column+' '+tmpFilter[i].Operator+' :'+tmpColumnParameter;pParameters.query.parameters[tmpColumnParameter]=tmpFilter[i].Value;}}return tmpWhere;};/**
	* Generate an ORDER BY clause from the sort array
	*
	* Each entry in the sort is an object like:
	* {Column:'Color',Direction:'Descending'}
	*
	* @method: generateOrderBy
	* @param: {Object} pParameters SQL Query Parameters
	* @return: {String} Returns the field list clause
	*/var generateOrderBy=function(pParameters){var tmpOrderBy=pParameters.sort;if(!Array.isArray(tmpOrderBy)||tmpOrderBy.length<1){return'';}var tmpOrderClause=' ORDER BY';for(var i=0;i<tmpOrderBy.length;i++){if(i>0){tmpOrderClause+=',';}tmpOrderClause+=' '+tmpOrderBy[i].Column;if(tmpOrderBy[i].Direction=='Descending'){tmpOrderClause+=' DESC';}}return tmpOrderClause;};/**
	* Generate the limit clause
	*
	* @method: generateLimit
	* @param: {Object} pParameters SQL Query Parameters
	* @return: {String} Returns the table name clause
	*/var generateLimit=function(pParameters){if(!pParameters.cap){return'';}var tmpLimit=' LIMIT';// If there is a begin record, we'll pass that in as well.
if(pParameters.begin!==false){tmpLimit+=' '+pParameters.begin+',';}// Cap is required for a limit clause.
tmpLimit+=' '+pParameters.cap;return tmpLimit;};/**
	* Generate the join clause
	*
	* @method: generateJoins
	* @param: {Object} pParameters SQL Query Parameters
	* @return: {String} Returns the join clause
	*/var generateJoins=function(pParameters){var tmpJoins=pParameters.join;if(!Array.isArray(tmpJoins)||tmpJoins.length<1){return'';}var tmpJoinClause='';//ex. ' INNER JOIN';
for(var i=0;i<tmpJoins.length;i++){var join=tmpJoins[i];//verify that all required fields are valid
if(join.Type&&join.Table&&join.From&&join.To){tmpJoinClause+=` ${join.Type} ${join.Table} ON ${join.From} = ${join.To}`;}}return tmpJoinClause;};/**
	* Generate the update SET clause
	*
	* @method: generateUpdateSetters
	* @param: {Object} pParameters SQL Query Parameters
	* @return: {String} Returns the table name clause
	*/var generateUpdateSetters=function(pParameters){var tmpRecords=pParameters.query.records;// We need to tell the query not to generate improperly if there are no values to set.
if(!Array.isArray(tmpRecords)||tmpRecords.length<1){return false;}// Check if there is a schema.  If so, we will use it to decide if these are parameterized or not.
var tmpSchema=Array.isArray(pParameters.query.schema)?pParameters.query.schema:[];var tmpUpdate='';// If there is more than one record in records, we are going to ignore them for now.
var tmpCurrentColumn=0;for(var tmpColumn in tmpRecords[0]){// No hash table yet, so, we will just linear search it for now.
// This uses the schema to decide if we want to treat a column differently on insert
var tmpSchemaEntry={Column:tmpColumn,Type:'Default'};for(var i=0;i<tmpSchema.length;i++){if(tmpColumn==tmpSchema[i].Column){// There is a schema entry for it.  Process it accordingly.
tmpSchemaEntry=tmpSchema[i];break;}}if(pParameters.query.disableAutoDateStamp&&tmpSchemaEntry.Type==='UpdateDate'){// This is ignored if flag is set
continue;}if(pParameters.query.disableAutoUserStamp&&tmpSchemaEntry.Type==='UpdateIDUser'){// This is ignored if flag is set
continue;}switch(tmpSchemaEntry.Type){case'AutoIdentity':case'CreateDate':case'CreateIDUser':case'DeleteDate':case'DeleteIDUser':// These are all ignored on update
continue;}if(tmpCurrentColumn>0){tmpUpdate+=',';}switch(tmpSchemaEntry.Type){case'UpdateDate':// This is an autoidentity, so we don't parameterize it and just pass in NULL
tmpUpdate+=' '+tmpColumn+' = '+SQL_NOW;break;case'UpdateIDUser':// This is the user ID, which we hope is in the query.
// This is how to deal with a normal column
var tmpColumnParameter=tmpColumn+'_'+tmpCurrentColumn;tmpUpdate+=' '+tmpColumn+' = :'+tmpColumnParameter;// Set the query parameter
pParameters.query.parameters[tmpColumnParameter]=pParameters.query.IDUser;break;default:var tmpColumnDefaultParameter=tmpColumn+'_'+tmpCurrentColumn;tmpUpdate+=' '+tmpColumn+' = :'+tmpColumnDefaultParameter;// Set the query parameter
pParameters.query.parameters[tmpColumnDefaultParameter]=tmpRecords[0][tmpColumn];break;}// We use a number to make sure parameters are unique.
tmpCurrentColumn++;}// We need to tell the query not to generate improperly if there are no values set.
if(tmpUpdate===''){return false;}return tmpUpdate;};/**
	* Generate the update-delete SET clause
	*
	* @method: generateUpdateDeleteSetters
	* @param: {Object} pParameters SQL Query Parameters
	* @return: {String} Returns the table name clause
	*/var generateUpdateDeleteSetters=function(pParameters){if(pParameters.query.disableDeleteTracking){//Don't generate an UPDATE query if Delete tracking is disabled
return false;}// Check if there is a schema.  If so, we will use it to decide if these are parameterized or not.
var tmpSchema=Array.isArray(pParameters.query.schema)?pParameters.query.schema:[];var tmpCurrentColumn=0;var tmpHasDeletedField=false;var tmpUpdate='';// No hash table yet, so, we will just linear search it for now.
// This uses the schema to decide if we want to treat a column differently on insert
var tmpSchemaEntry={Type:'Default'};for(var i=0;i<tmpSchema.length;i++){// There is a schema entry for it.  Process it accordingly.
tmpSchemaEntry=tmpSchema[i];var tmpUpdateSql=null;switch(tmpSchemaEntry.Type){case'Deleted':tmpUpdateSql=' '+tmpSchemaEntry.Column+' = 1';tmpHasDeletedField=true;//this field is required in order for query to be built
break;case'DeleteDate':tmpUpdateSql=' '+tmpSchemaEntry.Column+' = '+SQL_NOW;break;case'UpdateDate':// Delete operation is an Update, so we should stamp the update time
tmpUpdateSql=' '+tmpSchemaEntry.Column+' = '+SQL_NOW;break;case'DeleteIDUser':// This is the user ID, which we hope is in the query.
// This is how to deal with a normal column
var tmpColumnParameter=tmpSchemaEntry.Column+'_'+tmpCurrentColumn;tmpUpdateSql=' '+tmpSchemaEntry.Column+' = :'+tmpColumnParameter;// Set the query parameter
pParameters.query.parameters[tmpColumnParameter]=pParameters.query.IDUser;break;default://DON'T allow update of other fields in this query
continue;}if(tmpCurrentColumn>0){tmpUpdate+=',';}tmpUpdate+=tmpUpdateSql;// We use a number to make sure parameters are unique.
tmpCurrentColumn++;}// We need to tell the query not to generate improperly if there are no values set.
if(!tmpHasDeletedField||tmpUpdate===''){return false;}return tmpUpdate;};/**
	* Generate the update-undelete SET clause
	*
	* @method: generateUpdateUndeleteSetters
	* @param: {Object} pParameters SQL Query Parameters
	* @return: {String} Returns the table name clause
	*/var generateUpdateUndeleteSetters=function(pParameters){// Check if there is a schema.  If so, we will use it to decide if these are parameterized or not.
var tmpSchema=Array.isArray(pParameters.query.schema)?pParameters.query.schema:[];var tmpCurrentColumn=0;var tmpHasDeletedField=false;var tmpUpdate='';// No hash table yet, so, we will just linear search it for now.
// This uses the schema to decide if we want to treat a column differently on insert
var tmpSchemaEntry={Type:'Default'};for(var i=0;i<tmpSchema.length;i++){// There is a schema entry for it.  Process it accordingly.
tmpSchemaEntry=tmpSchema[i];var tmpUpdateSql=null;switch(tmpSchemaEntry.Type){case'Deleted':tmpUpdateSql=' '+tmpSchemaEntry.Column+' = 0';tmpHasDeletedField=true;//this field is required in order for query to be built
break;case'UpdateDate':// The undelete operation is an Update, so we should stamp the update time
tmpUpdateSql=' '+tmpSchemaEntry.Column+' = '+SQL_NOW;break;case'UpdateIDUser':var tmpColumnParameter=tmpSchemaEntry.Column+'_'+tmpCurrentColumn;tmpUpdateSql=' '+tmpSchemaEntry.Column+' = :'+tmpColumnParameter;pParameters.query.parameters[tmpColumnParameter]=pParameters.query.IDUser;break;default://DON'T allow update of other fields in this query
continue;}if(tmpCurrentColumn>0){tmpUpdate+=',';}tmpUpdate+=tmpUpdateSql;// We use a number to make sure parameters are unique.
tmpCurrentColumn++;}// We need to tell the query not to generate improperly if there are no values set.
if(!tmpHasDeletedField||tmpUpdate===''){return false;}return tmpUpdate;};/**
	* Generate the create SET clause
	*
	* @method: generateCreateSetList
	* @param: {Object} pParameters SQL Query Parameters
	* @return: {String} Returns the table name clause
	*/var generateCreateSetValues=function(pParameters){var tmpRecords=pParameters.query.records;// We need to tell the query not to generate improperly if there are no values to set.
if(!Array.isArray(tmpRecords)||tmpRecords.length<1){return false;}// Check if there is a schema.  If so, we will use it to decide if these are parameterized or not.
var tmpSchema=Array.isArray(pParameters.query.schema)?pParameters.query.schema:[];var tmpCreateSet='';// If there is more than one record in records, we are going to ignore them for now.
var tmpCurrentColumn=0;for(var tmpColumn in tmpRecords[0]){// No hash table yet, so, we will just linear search it for now.
// This uses the schema to decide if we want to treat a column differently on insert
var tmpSchemaEntry={Column:tmpColumn,Type:'Default'};for(var i=0;i<tmpSchema.length;i++){if(tmpColumn==tmpSchema[i].Column){// There is a schema entry for it.  Process it accordingly.
tmpSchemaEntry=tmpSchema[i];break;}}if(!pParameters.query.disableDeleteTracking){if(tmpSchemaEntry.Type==='DeleteDate'||tmpSchemaEntry.Type==='DeleteIDUser'){// These are all ignored on insert (if delete tracking is enabled as normal)
continue;}}if(tmpCurrentColumn>0){tmpCreateSet+=',';}//define a re-usable method for setting up field definitions in a default pattern
var buildDefaultDefinition=function(){var tmpColumnParameter=tmpColumn+'_'+tmpCurrentColumn;tmpCreateSet+=' :'+tmpColumnParameter;// Set the query parameter
pParameters.query.parameters[tmpColumnParameter]=tmpRecords[0][tmpColumn];};var tmpColumnParameter;switch(tmpSchemaEntry.Type){case'AutoIdentity':if(pParameters.query.disableAutoIdentity){buildDefaultDefinition();}else{// This is an autoidentity, so we don't parameterize it and just pass in NULL
tmpCreateSet+=' NULL';}break;case'AutoGUID':if(pParameters.query.disableAutoIdentity){buildDefaultDefinition();}else if(tmpRecords[0][tmpColumn]&&tmpRecords[0][tmpColumn].length>=5&&tmpRecords[0][tmpColumn]!=='0x0000000000000000')//stricture default
{// Allow consumer to override AutoGUID
buildDefaultDefinition();}else{// This is an autoidentity, so we don't parameterize it and just pass in NULL
tmpColumnParameter=tmpColumn+'_'+tmpCurrentColumn;tmpCreateSet+=' :'+tmpColumnParameter;// Set the query parameter
pParameters.query.parameters[tmpColumnParameter]=pParameters.query.UUID;}break;case'UpdateDate':case'CreateDate':case'DeleteDate':if(pParameters.query.disableAutoDateStamp){buildDefaultDefinition();}else{// This is an autoidentity, so we don't parameterize it and just pass in NULL
tmpCreateSet+=' '+SQL_NOW;}break;case'DeleteIDUser':case'UpdateIDUser':case'CreateIDUser':if(pParameters.query.disableAutoUserStamp){buildDefaultDefinition();}else{// This is the user ID, which we hope is in the query.
// This is how to deal with a normal column
tmpColumnParameter=tmpColumn+'_'+tmpCurrentColumn;tmpCreateSet+=' :'+tmpColumnParameter;// Set the query parameter
pParameters.query.parameters[tmpColumnParameter]=pParameters.query.IDUser;}break;default:buildDefaultDefinition();break;}// We use an appended number to make sure parameters are unique.
tmpCurrentColumn++;}// We need to tell the query not to generate improperly if there are no values set.
if(tmpCreateSet===''){return false;}return tmpCreateSet;};/**
	* Generate the create SET clause
	*
	* @method: generateCreateSetList
	* @param: {Object} pParameters SQL Query Parameters
	* @return: {String} Returns the table name clause
	*/var generateCreateSetList=function(pParameters){// The records were already validated by generateCreateSetValues
var tmpRecords=pParameters.query.records;// Check if there is a schema.  If so, we will use it to decide if these are parameterized or not.
var tmpSchema=Array.isArray(pParameters.query.schema)?pParameters.query.schema:[];var tmpCreateSet='';// If there is more than one record in records, we are going to ignore them for now.
for(var tmpColumn in tmpRecords[0]){// No hash table yet, so, we will just linear search it for now.
// This uses the schema to decide if we want to treat a column differently on insert
var tmpSchemaEntry={Column:tmpColumn,Type:'Default'};for(var i=0;i<tmpSchema.length;i++){if(tmpColumn==tmpSchema[i].Column){// There is a schema entry for it.  Process it accordingly.
tmpSchemaEntry=tmpSchema[i];break;}}if(!pParameters.query.disableDeleteTracking){if(tmpSchemaEntry.Type==='DeleteDate'||tmpSchemaEntry.Type==='DeleteIDUser'){// These are all ignored on insert (if delete tracking is enabled as normal)
continue;}}switch(tmpSchemaEntry.Type){default:if(tmpCreateSet!=''){tmpCreateSet+=',';}tmpCreateSet+=' '+tmpColumn;break;}}return tmpCreateSet;};var Create=function(pParameters){var tmpTableName=generateTableName(pParameters);var tmpCreateSetList=generateCreateSetList(pParameters);var tmpCreateSetValues=generateCreateSetValues(pParameters);if(!tmpCreateSetValues){return false;}return'INSERT INTO'+tmpTableName+' ('+tmpCreateSetList+') VALUES ('+tmpCreateSetValues+');';};/**
	* Read one or many records
	*
	* Some examples:
	* SELECT * FROM WIDGETS;
	* SELECT * FROM WIDGETS LIMIT 0, 20;
	* SELECT * FROM WIDGETS LIMIT 5, 20;
	* SELECT ID, Name, Cost FROM WIDGETS LIMIT 5, 20;
	* SELECT ID, Name, Cost FROM WIDGETS LIMIT 5, 20 WHERE LastName = 'Smith';
	*
	* @method Read
	* @param {Object} pParameters SQL Query parameters
	* @return {String} Returns the current Query for chaining.
	*/var Read=function(pParameters){var tmpFieldList=generateFieldList(pParameters);var tmpTableName=generateTableName(pParameters);var tmpWhere=generateWhere(pParameters);var tmpJoin=generateJoins(pParameters);var tmpOrderBy=generateOrderBy(pParameters);var tmpLimit=generateLimit(pParameters);const tmpOptDistinct=pParameters.distinct?' DISTINCT':'';if(pParameters.queryOverride){try{var tmpQueryTemplate=_Fable.Utility.template(pParameters.queryOverride);return tmpQueryTemplate({FieldList:tmpFieldList,TableName:tmpTableName,Where:tmpWhere,Join:tmpJoin,OrderBy:tmpOrderBy,Limit:tmpLimit,Distinct:tmpOptDistinct,_Params:pParameters});}catch(pError){// This pokemon is here to give us a convenient way of not throwing up totally if the query fails.
console.log('Error with custom Read Query ['+pParameters.queryOverride+']: '+pError);return false;}}return`SELECT${tmpOptDistinct}${tmpFieldList} FROM${tmpTableName}${tmpJoin}${tmpWhere}${tmpOrderBy}${tmpLimit};`;};var Update=function(pParameters){var tmpTableName=generateTableName(pParameters);var tmpWhere=generateWhere(pParameters);var tmpUpdateSetters=generateUpdateSetters(pParameters);if(!tmpUpdateSetters){return false;}return'UPDATE'+tmpTableName+' SET'+tmpUpdateSetters+tmpWhere+';';};var Delete=function(pParameters){var tmpTableName=generateTableName(pParameters);var tmpWhere=generateWhere(pParameters);var tmpUpdateDeleteSetters=generateUpdateDeleteSetters(pParameters);if(tmpUpdateDeleteSetters){//If it has a deleted bit, update it instead of actually deleting the record
return'UPDATE'+tmpTableName+' SET'+tmpUpdateDeleteSetters+tmpWhere+';';}else{return'DELETE FROM'+tmpTableName+tmpWhere+';';}};var Undelete=function(pParameters){var tmpTableName=generateTableName(pParameters);// TODO: Fix these
let tmpDeleteTrackingState=pParameters.query.disableDeleteTracking;pParameters.query.disableDeleteTracking=true;var tmpWhere=generateWhere(pParameters);var tmpUpdateUndeleteSetters=generateUpdateUndeleteSetters(pParameters);pParameters.query.disableDeleteTracking=tmpDeleteTrackingState;if(tmpUpdateUndeleteSetters){//If the table has a deleted bit, go forward with the update to change things.
return'UPDATE'+tmpTableName+' SET'+tmpUpdateUndeleteSetters+tmpWhere+';';}else{// This is a no-op because the record can't be undeleted.
// TODO: Should it throw instead?
return'SELECT NULL;';}};var Count=function(pParameters){var tmpFieldList=pParameters.distinct?generateFieldList(pParameters,true):'*';var tmpTableName=generateTableName(pParameters);var tmpJoin=generateJoins(pParameters);var tmpWhere=generateWhere(pParameters);// here, we ignore the distinct keyword if no fields have been specified and
if(pParameters.distinct&&tmpFieldList.length<1){console.warn('Distinct requested but no field list or schema are available, so not honoring distinct for count query.');}const tmpOptDistinct=pParameters.distinct&&tmpFieldList.length>0?'DISTINCT':'';if(pParameters.queryOverride){try{var tmpQueryTemplate=_Fable.Utility.template(pParameters.queryOverride);return tmpQueryTemplate({FieldList:[],TableName:tmpTableName,Where:tmpWhere,OrderBy:'',Limit:'',Distinct:tmpOptDistinct,_Params:pParameters});}catch(pError){// This pokemon is here to give us a convenient way of not throwing up totally if the query fails.
console.log('Error with custom Count Query ['+pParameters.queryOverride+']: '+pError);return false;}}return`SELECT COUNT(${tmpOptDistinct}${tmpFieldList||'*'}) AS RowCount FROM${tmpTableName}${tmpJoin}${tmpWhere};`;};var tmpDialect={Create:Create,Read:Read,Update:Update,Delete:Delete,Undelete:Undelete,Count:Count};/**
	* Dialect Name
	*
	* @property name
	* @type string
	*/Object.defineProperty(tmpDialect,'name',{get:function(){return'MySQL';},enumerable:true});return tmpDialect;};module.exports=FoxHoundDialectMySQL;},{}],30:[function(require,module,exports){'use strict';/* eslint no-invalid-this: 1 */var ERROR_MESSAGE='Function.prototype.bind called on incompatible ';var slice=Array.prototype.slice;var toStr=Object.prototype.toString;var funcType='[object Function]';module.exports=function bind(that){var target=this;if(typeof target!=='function'||toStr.call(target)!==funcType){throw new TypeError(ERROR_MESSAGE+target);}var args=slice.call(arguments,1);var bound;var binder=function(){if(this instanceof bound){var result=target.apply(this,args.concat(slice.call(arguments)));if(Object(result)===result){return result;}return this;}else{return target.apply(that,args.concat(slice.call(arguments)));}};var boundLength=Math.max(0,target.length-args.length);var boundArgs=[];for(var i=0;i<boundLength;i++){boundArgs.push('$'+i);}bound=Function('binder','return function ('+boundArgs.join(',')+'){ return binder.apply(this,arguments); }')(binder);if(target.prototype){var Empty=function Empty(){};Empty.prototype=target.prototype;bound.prototype=new Empty();Empty.prototype=null;}return bound;};},{}],31:[function(require,module,exports){'use strict';var implementation=require('./implementation');module.exports=Function.prototype.bind||implementation;},{"./implementation":30}],32:[function(require,module,exports){var util=require('util');var isProperty=require('is-property');var INDENT_START=/[\{\[]/;var INDENT_END=/[\}\]]/;// from https://mathiasbynens.be/notes/reserved-keywords
var RESERVED=['do','if','in','for','let','new','try','var','case','else','enum','eval','null','this','true','void','with','await','break','catch','class','const','false','super','throw','while','yield','delete','export','import','public','return','static','switch','typeof','default','extends','finally','package','private','continue','debugger','function','arguments','interface','protected','implements','instanceof','NaN','undefined'];var RESERVED_MAP={};for(var i=0;i<RESERVED.length;i++){RESERVED_MAP[RESERVED[i]]=true;}var isVariable=function(name){return isProperty(name)&&!RESERVED_MAP.hasOwnProperty(name);};var formats={s:function(s){return''+s;},d:function(d){return''+Number(d);},o:function(o){return JSON.stringify(o);}};var genfun=function(){var lines=[];var indent=0;var vars={};var push=function(str){var spaces='';while(spaces.length<indent*2)spaces+='  ';lines.push(spaces+str);};var pushLine=function(line){if(INDENT_END.test(line.trim()[0])&&INDENT_START.test(line[line.length-1])){indent--;push(line);indent++;return;}if(INDENT_START.test(line[line.length-1])){push(line);indent++;return;}if(INDENT_END.test(line.trim()[0])){indent--;push(line);return;}push(line);};var line=function(fmt){if(!fmt)return line;if(arguments.length===1&&fmt.indexOf('\n')>-1){var lines=fmt.trim().split('\n');for(var i=0;i<lines.length;i++){pushLine(lines[i].trim());}}else{pushLine(util.format.apply(util,arguments));}return line;};line.scope={};line.formats=formats;line.sym=function(name){if(!name||!isVariable(name))name='tmp';if(!vars[name])vars[name]=0;return name+(vars[name]++||'');};line.property=function(obj,name){if(arguments.length===1){name=obj;obj='';}name=name+'';if(isProperty(name))return obj?obj+'.'+name:name;return obj?obj+'['+JSON.stringify(name)+']':JSON.stringify(name);};line.toString=function(){return lines.join('\n');};line.toFunction=function(scope){if(!scope)scope={};var src='return ('+line.toString()+')';Object.keys(line.scope).forEach(function(key){if(!scope[key])scope[key]=line.scope[key];});var keys=Object.keys(scope).map(function(key){return key;});var vals=keys.map(function(key){return scope[key];});return Function.apply(null,keys.concat(src)).apply(null,vals);};if(arguments.length)line.apply(null,arguments);return line;};genfun.formats=formats;module.exports=genfun;},{"is-property":47,"util":54}],33:[function(require,module,exports){var isProperty=require('is-property');var gen=function(obj,prop){return isProperty(prop)?obj+'.'+prop:obj+'['+JSON.stringify(prop)+']';};gen.valid=isProperty;gen.property=function(prop){return isProperty(prop)?prop:JSON.stringify(prop);};module.exports=gen;},{"is-property":47}],34:[function(require,module,exports){'use strict';var undefined;var $SyntaxError=SyntaxError;var $Function=Function;var $TypeError=TypeError;// eslint-disable-next-line consistent-return
var getEvalledConstructor=function(expressionSyntax){try{return $Function('"use strict"; return ('+expressionSyntax+').constructor;')();}catch(e){}};var $gOPD=Object.getOwnPropertyDescriptor;if($gOPD){try{$gOPD({},'');}catch(e){$gOPD=null;// this is IE 8, which has a broken gOPD
}}var throwTypeError=function(){throw new $TypeError();};var ThrowTypeError=$gOPD?function(){try{// eslint-disable-next-line no-unused-expressions, no-caller, no-restricted-properties
arguments.callee;// IE 8 does not throw here
return throwTypeError;}catch(calleeThrows){try{// IE 8 throws on Object.getOwnPropertyDescriptor(arguments, '')
return $gOPD(arguments,'callee').get;}catch(gOPDthrows){return throwTypeError;}}}():throwTypeError;var hasSymbols=require('has-symbols')();var getProto=Object.getPrototypeOf||function(x){return x.__proto__;};// eslint-disable-line no-proto
var needsEval={};var TypedArray=typeof Uint8Array==='undefined'?undefined:getProto(Uint8Array);var INTRINSICS={'%AggregateError%':typeof AggregateError==='undefined'?undefined:AggregateError,'%Array%':Array,'%ArrayBuffer%':typeof ArrayBuffer==='undefined'?undefined:ArrayBuffer,'%ArrayIteratorPrototype%':hasSymbols?getProto([][Symbol.iterator]()):undefined,'%AsyncFromSyncIteratorPrototype%':undefined,'%AsyncFunction%':needsEval,'%AsyncGenerator%':needsEval,'%AsyncGeneratorFunction%':needsEval,'%AsyncIteratorPrototype%':needsEval,'%Atomics%':typeof Atomics==='undefined'?undefined:Atomics,'%BigInt%':typeof BigInt==='undefined'?undefined:BigInt,'%BigInt64Array%':typeof BigInt64Array==='undefined'?undefined:BigInt64Array,'%BigUint64Array%':typeof BigUint64Array==='undefined'?undefined:BigUint64Array,'%Boolean%':Boolean,'%DataView%':typeof DataView==='undefined'?undefined:DataView,'%Date%':Date,'%decodeURI%':decodeURI,'%decodeURIComponent%':decodeURIComponent,'%encodeURI%':encodeURI,'%encodeURIComponent%':encodeURIComponent,'%Error%':Error,'%eval%':eval,// eslint-disable-line no-eval
'%EvalError%':EvalError,'%Float32Array%':typeof Float32Array==='undefined'?undefined:Float32Array,'%Float64Array%':typeof Float64Array==='undefined'?undefined:Float64Array,'%FinalizationRegistry%':typeof FinalizationRegistry==='undefined'?undefined:FinalizationRegistry,'%Function%':$Function,'%GeneratorFunction%':needsEval,'%Int8Array%':typeof Int8Array==='undefined'?undefined:Int8Array,'%Int16Array%':typeof Int16Array==='undefined'?undefined:Int16Array,'%Int32Array%':typeof Int32Array==='undefined'?undefined:Int32Array,'%isFinite%':isFinite,'%isNaN%':isNaN,'%IteratorPrototype%':hasSymbols?getProto(getProto([][Symbol.iterator]())):undefined,'%JSON%':typeof JSON==='object'?JSON:undefined,'%Map%':typeof Map==='undefined'?undefined:Map,'%MapIteratorPrototype%':typeof Map==='undefined'||!hasSymbols?undefined:getProto(new Map()[Symbol.iterator]()),'%Math%':Math,'%Number%':Number,'%Object%':Object,'%parseFloat%':parseFloat,'%parseInt%':parseInt,'%Promise%':typeof Promise==='undefined'?undefined:Promise,'%Proxy%':typeof Proxy==='undefined'?undefined:Proxy,'%RangeError%':RangeError,'%ReferenceError%':ReferenceError,'%Reflect%':typeof Reflect==='undefined'?undefined:Reflect,'%RegExp%':RegExp,'%Set%':typeof Set==='undefined'?undefined:Set,'%SetIteratorPrototype%':typeof Set==='undefined'||!hasSymbols?undefined:getProto(new Set()[Symbol.iterator]()),'%SharedArrayBuffer%':typeof SharedArrayBuffer==='undefined'?undefined:SharedArrayBuffer,'%String%':String,'%StringIteratorPrototype%':hasSymbols?getProto(''[Symbol.iterator]()):undefined,'%Symbol%':hasSymbols?Symbol:undefined,'%SyntaxError%':$SyntaxError,'%ThrowTypeError%':ThrowTypeError,'%TypedArray%':TypedArray,'%TypeError%':$TypeError,'%Uint8Array%':typeof Uint8Array==='undefined'?undefined:Uint8Array,'%Uint8ClampedArray%':typeof Uint8ClampedArray==='undefined'?undefined:Uint8ClampedArray,'%Uint16Array%':typeof Uint16Array==='undefined'?undefined:Uint16Array,'%Uint32Array%':typeof Uint32Array==='undefined'?undefined:Uint32Array,'%URIError%':URIError,'%WeakMap%':typeof WeakMap==='undefined'?undefined:WeakMap,'%WeakRef%':typeof WeakRef==='undefined'?undefined:WeakRef,'%WeakSet%':typeof WeakSet==='undefined'?undefined:WeakSet};try{null.error;// eslint-disable-line no-unused-expressions
}catch(e){// https://github.com/tc39/proposal-shadowrealm/pull/384#issuecomment-1364264229
var errorProto=getProto(getProto(e));INTRINSICS['%Error.prototype%']=errorProto;}var doEval=function doEval(name){var value;if(name==='%AsyncFunction%'){value=getEvalledConstructor('async function () {}');}else if(name==='%GeneratorFunction%'){value=getEvalledConstructor('function* () {}');}else if(name==='%AsyncGeneratorFunction%'){value=getEvalledConstructor('async function* () {}');}else if(name==='%AsyncGenerator%'){var fn=doEval('%AsyncGeneratorFunction%');if(fn){value=fn.prototype;}}else if(name==='%AsyncIteratorPrototype%'){var gen=doEval('%AsyncGenerator%');if(gen){value=getProto(gen.prototype);}}INTRINSICS[name]=value;return value;};var LEGACY_ALIASES={'%ArrayBufferPrototype%':['ArrayBuffer','prototype'],'%ArrayPrototype%':['Array','prototype'],'%ArrayProto_entries%':['Array','prototype','entries'],'%ArrayProto_forEach%':['Array','prototype','forEach'],'%ArrayProto_keys%':['Array','prototype','keys'],'%ArrayProto_values%':['Array','prototype','values'],'%AsyncFunctionPrototype%':['AsyncFunction','prototype'],'%AsyncGenerator%':['AsyncGeneratorFunction','prototype'],'%AsyncGeneratorPrototype%':['AsyncGeneratorFunction','prototype','prototype'],'%BooleanPrototype%':['Boolean','prototype'],'%DataViewPrototype%':['DataView','prototype'],'%DatePrototype%':['Date','prototype'],'%ErrorPrototype%':['Error','prototype'],'%EvalErrorPrototype%':['EvalError','prototype'],'%Float32ArrayPrototype%':['Float32Array','prototype'],'%Float64ArrayPrototype%':['Float64Array','prototype'],'%FunctionPrototype%':['Function','prototype'],'%Generator%':['GeneratorFunction','prototype'],'%GeneratorPrototype%':['GeneratorFunction','prototype','prototype'],'%Int8ArrayPrototype%':['Int8Array','prototype'],'%Int16ArrayPrototype%':['Int16Array','prototype'],'%Int32ArrayPrototype%':['Int32Array','prototype'],'%JSONParse%':['JSON','parse'],'%JSONStringify%':['JSON','stringify'],'%MapPrototype%':['Map','prototype'],'%NumberPrototype%':['Number','prototype'],'%ObjectPrototype%':['Object','prototype'],'%ObjProto_toString%':['Object','prototype','toString'],'%ObjProto_valueOf%':['Object','prototype','valueOf'],'%PromisePrototype%':['Promise','prototype'],'%PromiseProto_then%':['Promise','prototype','then'],'%Promise_all%':['Promise','all'],'%Promise_reject%':['Promise','reject'],'%Promise_resolve%':['Promise','resolve'],'%RangeErrorPrototype%':['RangeError','prototype'],'%ReferenceErrorPrototype%':['ReferenceError','prototype'],'%RegExpPrototype%':['RegExp','prototype'],'%SetPrototype%':['Set','prototype'],'%SharedArrayBufferPrototype%':['SharedArrayBuffer','prototype'],'%StringPrototype%':['String','prototype'],'%SymbolPrototype%':['Symbol','prototype'],'%SyntaxErrorPrototype%':['SyntaxError','prototype'],'%TypedArrayPrototype%':['TypedArray','prototype'],'%TypeErrorPrototype%':['TypeError','prototype'],'%Uint8ArrayPrototype%':['Uint8Array','prototype'],'%Uint8ClampedArrayPrototype%':['Uint8ClampedArray','prototype'],'%Uint16ArrayPrototype%':['Uint16Array','prototype'],'%Uint32ArrayPrototype%':['Uint32Array','prototype'],'%URIErrorPrototype%':['URIError','prototype'],'%WeakMapPrototype%':['WeakMap','prototype'],'%WeakSetPrototype%':['WeakSet','prototype']};var bind=require('function-bind');var hasOwn=require('has');var $concat=bind.call(Function.call,Array.prototype.concat);var $spliceApply=bind.call(Function.apply,Array.prototype.splice);var $replace=bind.call(Function.call,String.prototype.replace);var $strSlice=bind.call(Function.call,String.prototype.slice);var $exec=bind.call(Function.call,RegExp.prototype.exec);/* adapted from https://github.com/lodash/lodash/blob/4.17.15/dist/lodash.js#L6735-L6744 */var rePropName=/[^%.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|%$))/g;var reEscapeChar=/\\(\\)?/g;/** Used to match backslashes in property paths. */var stringToPath=function stringToPath(string){var first=$strSlice(string,0,1);var last=$strSlice(string,-1);if(first==='%'&&last!=='%'){throw new $SyntaxError('invalid intrinsic syntax, expected closing `%`');}else if(last==='%'&&first!=='%'){throw new $SyntaxError('invalid intrinsic syntax, expected opening `%`');}var result=[];$replace(string,rePropName,function(match,number,quote,subString){result[result.length]=quote?$replace(subString,reEscapeChar,'$1'):number||match;});return result;};/* end adaptation */var getBaseIntrinsic=function getBaseIntrinsic(name,allowMissing){var intrinsicName=name;var alias;if(hasOwn(LEGACY_ALIASES,intrinsicName)){alias=LEGACY_ALIASES[intrinsicName];intrinsicName='%'+alias[0]+'%';}if(hasOwn(INTRINSICS,intrinsicName)){var value=INTRINSICS[intrinsicName];if(value===needsEval){value=doEval(intrinsicName);}if(typeof value==='undefined'&&!allowMissing){throw new $TypeError('intrinsic '+name+' exists, but is not available. Please file an issue!');}return{alias:alias,name:intrinsicName,value:value};}throw new $SyntaxError('intrinsic '+name+' does not exist!');};module.exports=function GetIntrinsic(name,allowMissing){if(typeof name!=='string'||name.length===0){throw new $TypeError('intrinsic name must be a non-empty string');}if(arguments.length>1&&typeof allowMissing!=='boolean'){throw new $TypeError('"allowMissing" argument must be a boolean');}if($exec(/^%?[^%]*%?$/,name)===null){throw new $SyntaxError('`%` may not be present anywhere but at the beginning and end of the intrinsic name');}var parts=stringToPath(name);var intrinsicBaseName=parts.length>0?parts[0]:'';var intrinsic=getBaseIntrinsic('%'+intrinsicBaseName+'%',allowMissing);var intrinsicRealName=intrinsic.name;var value=intrinsic.value;var skipFurtherCaching=false;var alias=intrinsic.alias;if(alias){intrinsicBaseName=alias[0];$spliceApply(parts,$concat([0,1],alias));}for(var i=1,isOwn=true;i<parts.length;i+=1){var part=parts[i];var first=$strSlice(part,0,1);var last=$strSlice(part,-1);if((first==='"'||first==="'"||first==='`'||last==='"'||last==="'"||last==='`')&&first!==last){throw new $SyntaxError('property names with quotes must have matching quotes');}if(part==='constructor'||!isOwn){skipFurtherCaching=true;}intrinsicBaseName+='.'+part;intrinsicRealName='%'+intrinsicBaseName+'%';if(hasOwn(INTRINSICS,intrinsicRealName)){value=INTRINSICS[intrinsicRealName];}else if(value!=null){if(!(part in value)){if(!allowMissing){throw new $TypeError('base intrinsic for '+name+' exists, but the property is not available.');}return void undefined;}if($gOPD&&i+1>=parts.length){var desc=$gOPD(value,part);isOwn=!!desc;// By convention, when a data property is converted to an accessor
// property to emulate a data property that does not suffer from
// the override mistake, that accessor's getter is marked with
// an `originalValue` property. Here, when we detect this, we
// uphold the illusion by pretending to see that original data
// property, i.e., returning the value rather than the getter
// itself.
if(isOwn&&'get'in desc&&!('originalValue'in desc.get)){value=desc.get;}else{value=value[part];}}else{isOwn=hasOwn(value,part);value=value[part];}if(isOwn&&!skipFurtherCaching){INTRINSICS[intrinsicRealName]=value;}}}return value;};},{"function-bind":31,"has":39,"has-symbols":36}],35:[function(require,module,exports){'use strict';var GetIntrinsic=require('get-intrinsic');var $gOPD=GetIntrinsic('%Object.getOwnPropertyDescriptor%',true);if($gOPD){try{$gOPD([],'length');}catch(e){// IE 8 has a broken gOPD
$gOPD=null;}}module.exports=$gOPD;},{"get-intrinsic":34}],36:[function(require,module,exports){'use strict';var origSymbol=typeof Symbol!=='undefined'&&Symbol;var hasSymbolSham=require('./shams');module.exports=function hasNativeSymbols(){if(typeof origSymbol!=='function'){return false;}if(typeof Symbol!=='function'){return false;}if(typeof origSymbol('foo')!=='symbol'){return false;}if(typeof Symbol('bar')!=='symbol'){return false;}return hasSymbolSham();};},{"./shams":37}],37:[function(require,module,exports){'use strict';/* eslint complexity: [2, 18], max-statements: [2, 33] */module.exports=function hasSymbols(){if(typeof Symbol!=='function'||typeof Object.getOwnPropertySymbols!=='function'){return false;}if(typeof Symbol.iterator==='symbol'){return true;}var obj={};var sym=Symbol('test');var symObj=Object(sym);if(typeof sym==='string'){return false;}if(Object.prototype.toString.call(sym)!=='[object Symbol]'){return false;}if(Object.prototype.toString.call(symObj)!=='[object Symbol]'){return false;}// temp disabled per https://github.com/ljharb/object.assign/issues/17
// if (sym instanceof Symbol) { return false; }
// temp disabled per https://github.com/WebReflection/get-own-property-symbols/issues/4
// if (!(symObj instanceof Symbol)) { return false; }
// if (typeof Symbol.prototype.toString !== 'function') { return false; }
// if (String(sym) !== Symbol.prototype.toString.call(sym)) { return false; }
var symVal=42;obj[sym]=symVal;for(sym in obj){return false;}// eslint-disable-line no-restricted-syntax, no-unreachable-loop
if(typeof Object.keys==='function'&&Object.keys(obj).length!==0){return false;}if(typeof Object.getOwnPropertyNames==='function'&&Object.getOwnPropertyNames(obj).length!==0){return false;}var syms=Object.getOwnPropertySymbols(obj);if(syms.length!==1||syms[0]!==sym){return false;}if(!Object.prototype.propertyIsEnumerable.call(obj,sym)){return false;}if(typeof Object.getOwnPropertyDescriptor==='function'){var descriptor=Object.getOwnPropertyDescriptor(obj,sym);if(descriptor.value!==symVal||descriptor.enumerable!==true){return false;}}return true;};},{}],38:[function(require,module,exports){'use strict';var hasSymbols=require('has-symbols/shams');module.exports=function hasToStringTagShams(){return hasSymbols()&&!!Symbol.toStringTag;};},{"has-symbols/shams":37}],39:[function(require,module,exports){'use strict';var bind=require('function-bind');module.exports=bind.call(Function.call,Object.prototype.hasOwnProperty);},{"function-bind":31}],40:[function(require,module,exports){if(typeof Object.create==='function'){// implementation from standard node.js 'util' module
module.exports=function inherits(ctor,superCtor){if(superCtor){ctor.super_=superCtor;ctor.prototype=Object.create(superCtor.prototype,{constructor:{value:ctor,enumerable:false,writable:true,configurable:true}});}};}else{// old school shim for old browsers
module.exports=function inherits(ctor,superCtor){if(superCtor){ctor.super_=superCtor;var TempCtor=function(){};TempCtor.prototype=superCtor.prototype;ctor.prototype=new TempCtor();ctor.prototype.constructor=ctor;}};}},{}],41:[function(require,module,exports){'use strict';var hasToStringTag=require('has-tostringtag/shams')();var callBound=require('call-bind/callBound');var $toString=callBound('Object.prototype.toString');var isStandardArguments=function isArguments(value){if(hasToStringTag&&value&&typeof value==='object'&&Symbol.toStringTag in value){return false;}return $toString(value)==='[object Arguments]';};var isLegacyArguments=function isArguments(value){if(isStandardArguments(value)){return true;}return value!==null&&typeof value==='object'&&typeof value.length==='number'&&value.length>=0&&$toString(value)!=='[object Array]'&&$toString(value.callee)==='[object Function]';};var supportsStandardArguments=function(){return isStandardArguments(arguments);}();isStandardArguments.isLegacyArguments=isLegacyArguments;// for tests
module.exports=supportsStandardArguments?isStandardArguments:isLegacyArguments;},{"call-bind/callBound":20,"has-tostringtag/shams":38}],42:[function(require,module,exports){'use strict';var fnToStr=Function.prototype.toString;var reflectApply=typeof Reflect==='object'&&Reflect!==null&&Reflect.apply;var badArrayLike;var isCallableMarker;if(typeof reflectApply==='function'&&typeof Object.defineProperty==='function'){try{badArrayLike=Object.defineProperty({},'length',{get:function(){throw isCallableMarker;}});isCallableMarker={};// eslint-disable-next-line no-throw-literal
reflectApply(function(){throw 42;},null,badArrayLike);}catch(_){if(_!==isCallableMarker){reflectApply=null;}}}else{reflectApply=null;}var constructorRegex=/^\s*class\b/;var isES6ClassFn=function isES6ClassFunction(value){try{var fnStr=fnToStr.call(value);return constructorRegex.test(fnStr);}catch(e){return false;// not a function
}};var tryFunctionObject=function tryFunctionToStr(value){try{if(isES6ClassFn(value)){return false;}fnToStr.call(value);return true;}catch(e){return false;}};var toStr=Object.prototype.toString;var objectClass='[object Object]';var fnClass='[object Function]';var genClass='[object GeneratorFunction]';var ddaClass='[object HTMLAllCollection]';// IE 11
var ddaClass2='[object HTML document.all class]';var ddaClass3='[object HTMLCollection]';// IE 9-10
var hasToStringTag=typeof Symbol==='function'&&!!Symbol.toStringTag;// better: use `has-tostringtag`
var isIE68=!(0 in[,]);// eslint-disable-line no-sparse-arrays, comma-spacing
var isDDA=function isDocumentDotAll(){return false;};if(typeof document==='object'){// Firefox 3 canonicalizes DDA to undefined when it's not accessed directly
var all=document.all;if(toStr.call(all)===toStr.call(document.all)){isDDA=function isDocumentDotAll(value){/* globals document: false */ // in IE 6-8, typeof document.all is "object" and it's truthy
if((isIE68||!value)&&(typeof value==='undefined'||typeof value==='object')){try{var str=toStr.call(value);return(str===ddaClass||str===ddaClass2||str===ddaClass3// opera 12.16
||str===objectClass// IE 6-8
)&&value('')==null;// eslint-disable-line eqeqeq
}catch(e){/**/}}return false;};}}module.exports=reflectApply?function isCallable(value){if(isDDA(value)){return true;}if(!value){return false;}if(typeof value!=='function'&&typeof value!=='object'){return false;}try{reflectApply(value,null,badArrayLike);}catch(e){if(e!==isCallableMarker){return false;}}return!isES6ClassFn(value)&&tryFunctionObject(value);}:function isCallable(value){if(isDDA(value)){return true;}if(!value){return false;}if(typeof value!=='function'&&typeof value!=='object'){return false;}if(hasToStringTag){return tryFunctionObject(value);}if(isES6ClassFn(value)){return false;}var strClass=toStr.call(value);if(strClass!==fnClass&&strClass!==genClass&&!/^\[object HTML/.test(strClass)){return false;}return tryFunctionObject(value);};},{}],43:[function(require,module,exports){'use strict';var toStr=Object.prototype.toString;var fnToStr=Function.prototype.toString;var isFnRegex=/^\s*(?:function)?\*/;var hasToStringTag=require('has-tostringtag/shams')();var getProto=Object.getPrototypeOf;var getGeneratorFunc=function(){// eslint-disable-line consistent-return
if(!hasToStringTag){return false;}try{return Function('return function*() {}')();}catch(e){}};var GeneratorFunction;module.exports=function isGeneratorFunction(fn){if(typeof fn!=='function'){return false;}if(isFnRegex.test(fnToStr.call(fn))){return true;}if(!hasToStringTag){var str=toStr.call(fn);return str==='[object GeneratorFunction]';}if(!getProto){return false;}if(typeof GeneratorFunction==='undefined'){var generatorFunc=getGeneratorFunc();GeneratorFunction=generatorFunc?getProto(generatorFunc):false;}return getProto(fn)===GeneratorFunction;};},{"has-tostringtag/shams":38}],44:[function(require,module,exports){var reIpv4FirstPass=/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;var reSubnetString=/\/\d{1,3}(?=%|$)/;var reForwardSlash=/\//;var reZone=/%.*$/;var reBadCharacters=/([^0-9a-f:/%])/i;var reBadAddress=/([0-9a-f]{5,}|:{3,}|[^:]:$|^:[^:]|\/$)/i;function validate4(input){if(!reIpv4FirstPass.test(input))return false;var parts=input.split('.');if(parts.length!==4)return false;if(parts[0][0]==='0'&&parts[0].length>1)return false;if(parts[1][0]==='0'&&parts[1].length>1)return false;if(parts[2][0]==='0'&&parts[2].length>1)return false;if(parts[3][0]==='0'&&parts[3].length>1)return false;var n0=Number(parts[0]);var n1=Number(parts[1]);var n2=Number(parts[2]);var n3=Number(parts[3]);return n0>=0&&n0<256&&n1>=0&&n1<256&&n2>=0&&n2<256&&n3>=0&&n3<256;}function validate6(input){var withoutSubnet=input.replace(reSubnetString,'');var hasSubnet=input.length!==withoutSubnet.length;// FIXME: this should probably be an option in the future
if(hasSubnet)return false;if(!hasSubnet){if(reForwardSlash.test(input))return false;}var withoutZone=withoutSubnet.replace(reZone,'');var lastPartSeparator=withoutZone.lastIndexOf(':');if(lastPartSeparator===-1)return false;var lastPart=withoutZone.substring(lastPartSeparator+1);var hasV4Part=validate4(lastPart);var address=hasV4Part?withoutZone.substring(0,lastPartSeparator+1)+'1234:5678':withoutZone;if(reBadCharacters.test(address))return false;if(reBadAddress.test(address))return false;var halves=address.split('::');if(halves.length>2)return false;if(halves.length===2){var first=halves[0]===''?[]:halves[0].split(':');var last=halves[1]===''?[]:halves[1].split(':');var remainingLength=8-(first.length+last.length);if(remainingLength<=0)return false;}else{if(address.split(':').length!==8)return false;}return true;}function validate(input){return validate4(input)||validate6(input);}module.exports=function validator(options){if(!options)options={};if(options.version===4)return validate4;if(options.version===6)return validate6;if(options.version==null)return validate;throw new Error('Unknown version: '+options.version);};module.exports['__all_regexes__']=[reIpv4FirstPass,reSubnetString,reForwardSlash,reZone,reBadCharacters,reBadAddress];},{}],45:[function(require,module,exports){var createIpValidator=require('is-my-ip-valid');var reEmailWhitespace=/\s/;var reHostnameFirstPass=/^[a-zA-Z0-9.-]+$/;var reHostnamePart=/^([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])$/;var rePhoneFirstPass=/^\+[0-9][0-9 ]{5,27}[0-9]$/;var rePhoneDoubleSpace=/ {2}/;var rePhoneGlobalSpace=/ /g;exports['date-time']=/^\d{4}-(?:0[0-9]{1}|1[0-2]{1})-[0-9]{2}[tT ]\d{2}:\d{2}:\d{2}(?:\.\d+|)([zZ]|[+-]\d{2}:\d{2})$/;exports['date']=/^\d{4}-(?:0[0-9]{1}|1[0-2]{1})-[0-9]{2}$/;exports['time']=/^\d{2}:\d{2}:\d{2}$/;exports['email']=function(input){return input.indexOf('@')!==-1&&!reEmailWhitespace.test(input);};exports['ip-address']=exports['ipv4']=createIpValidator({version:4});exports['ipv6']=createIpValidator({version:6});exports['uri']=/^[a-zA-Z][a-zA-Z0-9+\-.]*:[^\s]*$/;exports['color']=/(#?([0-9A-Fa-f]{3,6})\b)|(aqua)|(black)|(blue)|(fuchsia)|(gray)|(green)|(lime)|(maroon)|(navy)|(olive)|(orange)|(purple)|(red)|(silver)|(teal)|(white)|(yellow)|(rgb\(\s*\b([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b\s*,\s*\b([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b\s*,\s*\b([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b\s*\))|(rgb\(\s*(\d?\d%|100%)+\s*,\s*(\d?\d%|100%)+\s*,\s*(\d?\d%|100%)+\s*\))/;exports['hostname']=function(input){if(!reHostnameFirstPass.test(input))return false;var parts=input.split('.');for(var i=0;i<parts.length;i++){if(!reHostnamePart.test(parts[i]))return false;}return true;};exports['alpha']=/^[a-zA-Z]+$/;exports['alphanumeric']=/^[a-zA-Z0-9]+$/;exports['style']=/.:\s*[^;]/g;exports['phone']=function(input){if(!rePhoneFirstPass.test(input))return false;if(rePhoneDoubleSpace.test(input))return false;var digits=input.substring(1).replace(rePhoneGlobalSpace,'').length;return digits>=7&&digits<=15;};exports['utc-millisec']=/^[0-9]{1,15}\.?[0-9]{0,15}$/;},{"is-my-ip-valid":44}],46:[function(require,module,exports){var genobj=require('generate-object-property');var genfun=require('generate-function');var jsonpointer=require('jsonpointer');var xtend=require('xtend');var formats=require('./formats');var get=function(obj,additionalSchemas,ptr){var visit=function(sub){if(sub&&sub.id===ptr)return sub;if(typeof sub!=='object'||!sub)return null;return Object.keys(sub).reduce(function(res,k){return res||visit(sub[k]);},null);};var res=visit(obj);if(res)return res;ptr=ptr.replace(/^#/,'');ptr=ptr.replace(/\/$/,'');try{return jsonpointer.get(obj,decodeURI(ptr));}catch(err){var end=ptr.indexOf('#');var other;// external reference
if(end!==0){// fragment doesn't exist.
if(end===-1){other=additionalSchemas[ptr];}else{var ext=ptr.slice(0,end);other=additionalSchemas[ext];var fragment=ptr.slice(end).replace(/^#/,'');try{return jsonpointer.get(other,fragment);}catch(err){}}}else{other=additionalSchemas[ptr];}return other||null;}};var types={};types.any=function(){return'true';};types.null=function(name){return name+' === null';};types.boolean=function(name){return'typeof '+name+' === "boolean"';};types.array=function(name){return'Array.isArray('+name+')';};types.object=function(name){return'typeof '+name+' === "object" && '+name+' && !Array.isArray('+name+')';};types.number=function(name){return'typeof '+name+' === "number" && isFinite('+name+')';};types.integer=function(name){return'typeof '+name+' === "number" && (Math.floor('+name+') === '+name+' || '+name+' > 9007199254740992 || '+name+' < -9007199254740992)';};types.string=function(name){return'typeof '+name+' === "string"';};var unique=function(array,len){len=Math.min(len===-1?array.length:len,array.length);var list=[];for(var i=0;i<len;i++){list.push(typeof array[i]==='object'?JSON.stringify(array[i]):array[i]);}for(var i=1;i<list.length;i++){if(list.indexOf(list[i])!==i)return false;}return true;};var isMultipleOf=function(name,multipleOf){var res;var factor=(multipleOf|0)!==multipleOf?Math.pow(10,multipleOf.toString().split('.').pop().length):1;if(factor>1){var factorName=(name|0)!==name?Math.pow(10,name.toString().split('.').pop().length):1;if(factorName>factor)res=true;else res=Math.round(factor*name)%(factor*multipleOf);}else res=name%multipleOf;return!res;};var testLimitedRegex=function(r,s,maxLength){if(maxLength>-1&&s.length>maxLength)return true;return r.test(s);};var compile=function(schema,cache,root,reporter,opts){var fmts=opts?xtend(formats,opts.formats):formats;var scope={unique:unique,formats:fmts,isMultipleOf:isMultipleOf,testLimitedRegex:testLimitedRegex};var verbose=opts?!!opts.verbose:false;var greedy=opts&&opts.greedy!==undefined?opts.greedy:false;var syms={};var allocated=[];var gensym=function(name){var res=name+(syms[name]=(syms[name]||0)+1);allocated.push(res);return res;};var formatName=function(field){var s=JSON.stringify(field);try{var pattern=/\[([^\[\]"]+)\]/;while(pattern.test(s))s=s.replace(pattern,replacer);return s;}catch(_){return JSON.stringify(field);}function replacer(match,v){if(allocated.indexOf(v)===-1)throw new Error('Unreplaceable');return'." + '+v+' + "';}};var reversePatterns={};var patterns=function(p){if(reversePatterns[p])return reversePatterns[p];var n=gensym('pattern');scope[n]=new RegExp(p);reversePatterns[p]=n;return n;};var vars=['i','j','k','l','m','n','o','p','q','r','s','t','u','v','x','y','z'];var genloop=function(){var v=vars.shift();vars.push(v+v[0]);allocated.push(v);return v;};var visit=function(name,node,reporter,filter,schemaPath){var properties=node.properties;var type=node.type;var tuple=false;if(Array.isArray(node.items)){// tuple type
properties={};node.items.forEach(function(item,i){properties[i]=item;});type='array';tuple=true;}var indent=0;var error=function(msg,prop,value){validate('errors++');if(reporter===true){validate('if (validate.errors === null) validate.errors = []');if(verbose){validate('validate.errors.push({field:%s,message:%s,value:%s,type:%s,schemaPath:%s})',formatName(prop||name),JSON.stringify(msg),value||name,JSON.stringify(type),JSON.stringify(schemaPath));}else{validate('validate.errors.push({field:%s,message:%s})',formatName(prop||name),JSON.stringify(msg));}}};if(node.required===true){indent++;validate('if (%s === undefined) {',name);error('is required');validate('} else {');}else{indent++;validate('if (%s !== undefined) {',name);}var valid=[].concat(type).map(function(t){if(t&&!types.hasOwnProperty(t)){throw new Error('Unknown type: '+t);}return types[t||'any'](name);}).join(' || ')||'true';if(valid!=='true'){indent++;validate('if (!(%s)) {',valid);error('is the wrong type');validate('} else {');}if(tuple){if(node.additionalItems===false){validate('if (%s.length > %d) {',name,node.items.length);error('has additional items');validate('}');}else if(node.additionalItems){var i=genloop();validate('for (var %s = %d; %s < %s.length; %s++) {',i,node.items.length,i,name,i);visit(name+'['+i+']',node.additionalItems,reporter,filter,schemaPath.concat('additionalItems'));validate('}');}}if(node.format&&fmts[node.format]){if(type!=='string'&&formats[node.format])validate('if (%s) {',types.string(name));var n=gensym('format');scope[n]=fmts[node.format];if(typeof scope[n]==='function')validate('if (!%s(%s)) {',n,name);else validate('if (!testLimitedRegex(%s, %s, %d)) {',n,name,typeof node.maxLength==='undefined'?-1:node.maxLength);error('must be '+node.format+' format');validate('}');if(type!=='string'&&formats[node.format])validate('}');}if(Array.isArray(node.required)){var n=gensym('missing');validate('var %s = 0',n);var checkRequired=function(req){var prop=genobj(name,req);validate('if (%s === undefined) {',prop);error('is required',prop);validate('%s++',n);validate('}');};validate('if ((%s)) {',type!=='object'?types.object(name):'true');node.required.map(checkRequired);validate('}');if(!greedy){validate('if (%s === 0) {',n);indent++;}}if(node.uniqueItems){if(type!=='array')validate('if (%s) {',types.array(name));validate('if (!(unique(%s, %d))) {',name,node.maxItems||-1);error('must be unique');validate('}');if(type!=='array')validate('}');}if(node.enum){var complex=node.enum.some(function(e){return typeof e==='object';});var compare=complex?function(e){return'JSON.stringify('+name+')'+' !== JSON.stringify('+JSON.stringify(e)+')';}:function(e){return name+' !== '+JSON.stringify(e);};validate('if (%s) {',node.enum.map(compare).join(' && ')||'false');error('must be an enum value');validate('}');}if(node.dependencies){if(type!=='object')validate('if (%s) {',types.object(name));Object.keys(node.dependencies).forEach(function(key){var deps=node.dependencies[key];if(typeof deps==='string')deps=[deps];var exists=function(k){return genobj(name,k)+' !== undefined';};if(Array.isArray(deps)){validate('if (%s !== undefined && !(%s)) {',genobj(name,key),deps.map(exists).join(' && ')||'true');error('dependencies not set');validate('}');}if(typeof deps==='object'){validate('if (%s !== undefined) {',genobj(name,key));visit(name,deps,reporter,filter,schemaPath.concat(['dependencies',key]));validate('}');}});if(type!=='object')validate('}');}if(node.additionalProperties||node.additionalProperties===false){if(type!=='object')validate('if (%s) {',types.object(name));var i=genloop();var keys=gensym('keys');var toCompare=function(p){return keys+'['+i+'] !== '+JSON.stringify(p);};var toTest=function(p){return'!'+patterns(p)+'.test('+keys+'['+i+'])';};var additionalProp=Object.keys(properties||{}).map(toCompare).concat(Object.keys(node.patternProperties||{}).map(toTest)).join(' && ')||'true';validate('var %s = Object.keys(%s)',keys,name)('for (var %s = 0; %s < %s.length; %s++) {',i,i,keys,i)('if (%s) {',additionalProp);if(node.additionalProperties===false){if(filter)validate('delete %s',name+'['+keys+'['+i+']]');error('has additional properties',null,JSON.stringify(name+'.')+' + '+keys+'['+i+']');}else{visit(name+'['+keys+'['+i+']]',node.additionalProperties,reporter,filter,schemaPath.concat(['additionalProperties']));}validate('}')('}');if(type!=='object')validate('}');}if(node.$ref){var sub=get(root,opts&&opts.schemas||{},node.$ref);if(sub){var fn=cache[node.$ref];if(!fn){cache[node.$ref]=function proxy(data){return fn(data);};fn=compile(sub,cache,root,false,opts);}var n=gensym('ref');scope[n]=fn;validate('if (!(%s(%s))) {',n,name);error('referenced schema does not match');validate('}');}}if(node.not){var prev=gensym('prev');validate('var %s = errors',prev);visit(name,node.not,false,filter,schemaPath.concat('not'));validate('if (%s === errors) {',prev);error('negative schema matches');validate('} else {')('errors = %s',prev)('}');}if(node.items&&!tuple){if(type!=='array')validate('if (%s) {',types.array(name));var i=genloop();validate('for (var %s = 0; %s < %s.length; %s++) {',i,i,name,i);visit(name+'['+i+']',node.items,reporter,filter,schemaPath.concat('items'));validate('}');if(type!=='array')validate('}');}if(node.patternProperties){if(type!=='object')validate('if (%s) {',types.object(name));var keys=gensym('keys');var i=genloop();validate('var %s = Object.keys(%s)',keys,name)('for (var %s = 0; %s < %s.length; %s++) {',i,i,keys,i);Object.keys(node.patternProperties).forEach(function(key){var p=patterns(key);validate('if (%s.test(%s)) {',p,keys+'['+i+']');visit(name+'['+keys+'['+i+']]',node.patternProperties[key],reporter,filter,schemaPath.concat(['patternProperties',key]));validate('}');});validate('}');if(type!=='object')validate('}');}if(node.pattern){var p=patterns(node.pattern);if(type!=='string')validate('if (%s) {',types.string(name));validate('if (!(testLimitedRegex(%s, %s, %d))) {',p,name,typeof node.maxLength==='undefined'?-1:node.maxLength);error('pattern mismatch');validate('}');if(type!=='string')validate('}');}if(node.allOf){node.allOf.forEach(function(sch,key){visit(name,sch,reporter,filter,schemaPath.concat(['allOf',key]));});}if(node.anyOf&&node.anyOf.length){var prev=gensym('prev');node.anyOf.forEach(function(sch,i){if(i===0){validate('var %s = errors',prev);}else{validate('if (errors !== %s) {',prev)('errors = %s',prev);}visit(name,sch,false,false,schemaPath);});node.anyOf.forEach(function(sch,i){if(i)validate('}');});validate('if (%s !== errors) {',prev);error('no schemas match');validate('}');}if(node.oneOf&&node.oneOf.length){var prev=gensym('prev');var passes=gensym('passes');validate('var %s = errors',prev)('var %s = 0',passes);node.oneOf.forEach(function(sch,i){visit(name,sch,false,false,schemaPath);validate('if (%s === errors) {',prev)('%s++',passes)('} else {')('errors = %s',prev)('}');});validate('if (%s !== 1) {',passes);error('no (or more than one) schemas match');validate('}');}if(node.multipleOf!==undefined){if(type!=='number'&&type!=='integer')validate('if (%s) {',types.number(name));validate('if (!isMultipleOf(%s, %d)) {',name,node.multipleOf);error('has a remainder');validate('}');if(type!=='number'&&type!=='integer')validate('}');}if(node.maxProperties!==undefined){if(type!=='object')validate('if (%s) {',types.object(name));validate('if (Object.keys(%s).length > %d) {',name,node.maxProperties);error('has more properties than allowed');validate('}');if(type!=='object')validate('}');}if(node.minProperties!==undefined){if(type!=='object')validate('if (%s) {',types.object(name));validate('if (Object.keys(%s).length < %d) {',name,node.minProperties);error('has less properties than allowed');validate('}');if(type!=='object')validate('}');}if(node.maxItems!==undefined){if(type!=='array')validate('if (%s) {',types.array(name));validate('if (%s.length > %d) {',name,node.maxItems);error('has more items than allowed');validate('}');if(type!=='array')validate('}');}if(node.minItems!==undefined){if(type!=='array')validate('if (%s) {',types.array(name));validate('if (%s.length < %d) {',name,node.minItems);error('has less items than allowed');validate('}');if(type!=='array')validate('}');}if(node.maxLength!==undefined){if(type!=='string')validate('if (%s) {',types.string(name));validate('if (%s.length > %d) {',name,node.maxLength);error('has longer length than allowed');validate('}');if(type!=='string')validate('}');}if(node.minLength!==undefined){if(type!=='string')validate('if (%s) {',types.string(name));validate('if (%s.length < %d) {',name,node.minLength);error('has less length than allowed');validate('}');if(type!=='string')validate('}');}if(node.minimum!==undefined){if(type!=='number'&&type!=='integer')validate('if (%s) {',types.number(name));validate('if (%s %s %d) {',name,node.exclusiveMinimum?'<=':'<',node.minimum);error('is less than minimum');validate('}');if(type!=='number'&&type!=='integer')validate('}');}if(node.maximum!==undefined){if(type!=='number'&&type!=='integer')validate('if (%s) {',types.number(name));validate('if (%s %s %d) {',name,node.exclusiveMaximum?'>=':'>',node.maximum);error('is more than maximum');validate('}');if(type!=='number'&&type!=='integer')validate('}');}if(properties){Object.keys(properties).forEach(function(p){if(Array.isArray(type)&&type.indexOf('null')!==-1)validate('if (%s !== null) {',name);visit(genobj(name,p),properties[p],reporter,filter,schemaPath.concat(tuple?p:['properties',p]));if(Array.isArray(type)&&type.indexOf('null')!==-1)validate('}');});}while(indent--)validate('}');};var validate=genfun('function validate(data) {')// Since undefined is not a valid JSON value, we coerce to null and other checks will catch this
('if (data === undefined) data = null')('validate.errors = null')('var errors = 0');visit('data',schema,reporter,opts&&opts.filter,[]);validate('return errors === 0')('}');validate=validate.toFunction(scope);validate.errors=null;if(Object.defineProperty){Object.defineProperty(validate,'error',{get:function(){if(!validate.errors)return'';return validate.errors.map(function(err){return err.field+' '+err.message;}).join('\n');}});}validate.toJSON=function(){return schema;};return validate;};module.exports=function(schema,opts){if(typeof schema==='string')schema=JSON.parse(schema);return compile(schema,{},schema,true,opts);};module.exports.filter=function(schema,opts){var validate=module.exports(schema,xtend(opts,{filter:true}));return function(sch){validate(sch);return sch;};};},{"./formats":45,"generate-function":32,"generate-object-property":33,"jsonpointer":49,"xtend":56}],47:[function(require,module,exports){"use strict";function isProperty(str){return /^[$A-Z\_a-z\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc][$A-Z\_a-z\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc0-9\u0300-\u036f\u0483-\u0487\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u064b-\u0669\u0670\u06d6-\u06dc\u06df-\u06e4\u06e7\u06e8\u06ea-\u06ed\u06f0-\u06f9\u0711\u0730-\u074a\u07a6-\u07b0\u07c0-\u07c9\u07eb-\u07f3\u0816-\u0819\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0859-\u085b\u08e4-\u08fe\u0900-\u0903\u093a-\u093c\u093e-\u094f\u0951-\u0957\u0962\u0963\u0966-\u096f\u0981-\u0983\u09bc\u09be-\u09c4\u09c7\u09c8\u09cb-\u09cd\u09d7\u09e2\u09e3\u09e6-\u09ef\u0a01-\u0a03\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a66-\u0a71\u0a75\u0a81-\u0a83\u0abc\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ae2\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b3c\u0b3e-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b62\u0b63\u0b66-\u0b6f\u0b82\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c3e-\u0c44\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0cbc\u0cbe-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0ce2\u0ce3\u0ce6-\u0cef\u0d02\u0d03\u0d3e-\u0d44\u0d46-\u0d48\u0d4a-\u0d4d\u0d57\u0d62\u0d63\u0d66-\u0d6f\u0d82\u0d83\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e31\u0e34-\u0e3a\u0e47-\u0e4e\u0e50-\u0e59\u0eb1\u0eb4-\u0eb9\u0ebb\u0ebc\u0ec8-\u0ecd\u0ed0-\u0ed9\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f3e\u0f3f\u0f71-\u0f84\u0f86\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u102b-\u103e\u1040-\u1049\u1056-\u1059\u105e-\u1060\u1062-\u1064\u1067-\u106d\u1071-\u1074\u1082-\u108d\u108f-\u109d\u135d-\u135f\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17b4-\u17d3\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u18a9\u1920-\u192b\u1930-\u193b\u1946-\u194f\u19b0-\u19c0\u19c8\u19c9\u19d0-\u19d9\u1a17-\u1a1b\u1a55-\u1a5e\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1b00-\u1b04\u1b34-\u1b44\u1b50-\u1b59\u1b6b-\u1b73\u1b80-\u1b82\u1ba1-\u1bad\u1bb0-\u1bb9\u1be6-\u1bf3\u1c24-\u1c37\u1c40-\u1c49\u1c50-\u1c59\u1cd0-\u1cd2\u1cd4-\u1ce8\u1ced\u1cf2-\u1cf4\u1dc0-\u1de6\u1dfc-\u1dff\u200c\u200d\u203f\u2040\u2054\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2cef-\u2cf1\u2d7f\u2de0-\u2dff\u302a-\u302f\u3099\u309a\ua620-\ua629\ua66f\ua674-\ua67d\ua69f\ua6f0\ua6f1\ua802\ua806\ua80b\ua823-\ua827\ua880\ua881\ua8b4-\ua8c4\ua8d0-\ua8d9\ua8e0-\ua8f1\ua900-\ua909\ua926-\ua92d\ua947-\ua953\ua980-\ua983\ua9b3-\ua9c0\ua9d0-\ua9d9\uaa29-\uaa36\uaa43\uaa4c\uaa4d\uaa50-\uaa59\uaa7b\uaab0\uaab2-\uaab4\uaab7\uaab8\uaabe\uaabf\uaac1\uaaeb-\uaaef\uaaf5\uaaf6\uabe3-\uabea\uabec\uabed\uabf0-\uabf9\ufb1e\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\uff10-\uff19\uff3f]*$/.test(str);}module.exports=isProperty;},{}],48:[function(require,module,exports){(function(global){(function(){'use strict';var forEach=require('for-each');var availableTypedArrays=require('available-typed-arrays');var callBound=require('call-bind/callBound');var $toString=callBound('Object.prototype.toString');var hasToStringTag=require('has-tostringtag/shams')();var gOPD=require('gopd');var g=typeof globalThis==='undefined'?global:globalThis;var typedArrays=availableTypedArrays();var $indexOf=callBound('Array.prototype.indexOf',true)||function indexOf(array,value){for(var i=0;i<array.length;i+=1){if(array[i]===value){return i;}}return-1;};var $slice=callBound('String.prototype.slice');var toStrTags={};var getPrototypeOf=Object.getPrototypeOf;// require('getprototypeof');
if(hasToStringTag&&gOPD&&getPrototypeOf){forEach(typedArrays,function(typedArray){var arr=new g[typedArray]();if(Symbol.toStringTag in arr){var proto=getPrototypeOf(arr);var descriptor=gOPD(proto,Symbol.toStringTag);if(!descriptor){var superProto=getPrototypeOf(proto);descriptor=gOPD(superProto,Symbol.toStringTag);}toStrTags[typedArray]=descriptor.get;}});}var tryTypedArrays=function tryAllTypedArrays(value){var anyTrue=false;forEach(toStrTags,function(getter,typedArray){if(!anyTrue){try{anyTrue=getter.call(value)===typedArray;}catch(e){/**/}}});return anyTrue;};module.exports=function isTypedArray(value){if(!value||typeof value!=='object'){return false;}if(!hasToStringTag||!(Symbol.toStringTag in value)){var tag=$slice($toString(value),8,-1);return $indexOf(typedArrays,tag)>-1;}if(!gOPD){return false;}return tryTypedArrays(value);};}).call(this);}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{});},{"available-typed-arrays":18,"call-bind/callBound":20,"for-each":22,"gopd":35,"has-tostringtag/shams":38}],49:[function(require,module,exports){var hasExcape=/~/;var escapeMatcher=/~[01]/g;function escapeReplacer(m){switch(m){case'~1':return'/';case'~0':return'~';}throw new Error('Invalid tilde escape: '+m);}function untilde(str){if(!hasExcape.test(str))return str;return str.replace(escapeMatcher,escapeReplacer);}function setter(obj,pointer,value){var part;var hasNextPart;for(var p=1,len=pointer.length;p<len;){if(pointer[p]==='constructor'||pointer[p]==='prototype'||pointer[p]==='__proto__')return obj;part=untilde(pointer[p++]);hasNextPart=len>p;if(typeof obj[part]==='undefined'){// support setting of /-
if(Array.isArray(obj)&&part==='-'){part=obj.length;}// support nested objects/array when setting values
if(hasNextPart){if(pointer[p]!==''&&pointer[p]<Infinity||pointer[p]==='-')obj[part]=[];else obj[part]={};}}if(!hasNextPart)break;obj=obj[part];}var oldValue=obj[part];if(value===undefined)delete obj[part];else obj[part]=value;return oldValue;}function compilePointer(pointer){if(typeof pointer==='string'){pointer=pointer.split('/');if(pointer[0]==='')return pointer;throw new Error('Invalid JSON pointer.');}else if(Array.isArray(pointer)){for(const part of pointer){if(typeof part!=='string'&&typeof part!=='number'){throw new Error('Invalid JSON pointer. Must be of type string or number.');}}return pointer;}throw new Error('Invalid JSON pointer.');}function get(obj,pointer){if(typeof obj!=='object')throw new Error('Invalid input object.');pointer=compilePointer(pointer);var len=pointer.length;if(len===1)return obj;for(var p=1;p<len;){obj=obj[untilde(pointer[p++])];if(len===p)return obj;if(typeof obj!=='object'||obj===null)return undefined;}}function set(obj,pointer,value){if(typeof obj!=='object')throw new Error('Invalid input object.');pointer=compilePointer(pointer);if(pointer.length===0)throw new Error('Invalid JSON pointer for set.');return setter(obj,pointer,value);}function compile(pointer){var compiled=compilePointer(pointer);return{get:function(object){return get(object,compiled);},set:function(object,value){return set(object,compiled,value);}};}exports.get=get;exports.set=set;exports.compile=compile;},{}],50:[function(require,module,exports){// shim for using process in browser
var process=module.exports={};// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.
var cachedSetTimeout;var cachedClearTimeout;function defaultSetTimout(){throw new Error('setTimeout has not been defined');}function defaultClearTimeout(){throw new Error('clearTimeout has not been defined');}(function(){try{if(typeof setTimeout==='function'){cachedSetTimeout=setTimeout;}else{cachedSetTimeout=defaultSetTimout;}}catch(e){cachedSetTimeout=defaultSetTimout;}try{if(typeof clearTimeout==='function'){cachedClearTimeout=clearTimeout;}else{cachedClearTimeout=defaultClearTimeout;}}catch(e){cachedClearTimeout=defaultClearTimeout;}})();function runTimeout(fun){if(cachedSetTimeout===setTimeout){//normal enviroments in sane situations
return setTimeout(fun,0);}// if setTimeout wasn't available but was latter defined
if((cachedSetTimeout===defaultSetTimout||!cachedSetTimeout)&&setTimeout){cachedSetTimeout=setTimeout;return setTimeout(fun,0);}try{// when when somebody has screwed with setTimeout but no I.E. maddness
return cachedSetTimeout(fun,0);}catch(e){try{// When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
return cachedSetTimeout.call(null,fun,0);}catch(e){// same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
return cachedSetTimeout.call(this,fun,0);}}}function runClearTimeout(marker){if(cachedClearTimeout===clearTimeout){//normal enviroments in sane situations
return clearTimeout(marker);}// if clearTimeout wasn't available but was latter defined
if((cachedClearTimeout===defaultClearTimeout||!cachedClearTimeout)&&clearTimeout){cachedClearTimeout=clearTimeout;return clearTimeout(marker);}try{// when when somebody has screwed with setTimeout but no I.E. maddness
return cachedClearTimeout(marker);}catch(e){try{// When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
return cachedClearTimeout.call(null,marker);}catch(e){// same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
// Some versions of I.E. have different rules for clearTimeout vs setTimeout
return cachedClearTimeout.call(this,marker);}}}var queue=[];var draining=false;var currentQueue;var queueIndex=-1;function cleanUpNextTick(){if(!draining||!currentQueue){return;}draining=false;if(currentQueue.length){queue=currentQueue.concat(queue);}else{queueIndex=-1;}if(queue.length){drainQueue();}}function drainQueue(){if(draining){return;}var timeout=runTimeout(cleanUpNextTick);draining=true;var len=queue.length;while(len){currentQueue=queue;queue=[];while(++queueIndex<len){if(currentQueue){currentQueue[queueIndex].run();}}queueIndex=-1;len=queue.length;}currentQueue=null;draining=false;runClearTimeout(timeout);}process.nextTick=function(fun){var args=new Array(arguments.length-1);if(arguments.length>1){for(var i=1;i<arguments.length;i++){args[i-1]=arguments[i];}}queue.push(new Item(fun,args));if(queue.length===1&&!draining){runTimeout(drainQueue);}};// v8 likes predictible objects
function Item(fun,array){this.fun=fun;this.array=array;}Item.prototype.run=function(){this.fun.apply(null,this.array);};process.title='browser';process.browser=true;process.env={};process.argv=[];process.version='';// empty string to avoid regexp issues
process.versions={};function noop(){}process.on=noop;process.addListener=noop;process.once=noop;process.off=noop;process.removeListener=noop;process.removeAllListeners=noop;process.emit=noop;process.prependListener=noop;process.prependOnceListener=noop;process.listeners=function(name){return[];};process.binding=function(name){throw new Error('process.binding is not supported');};process.cwd=function(){return'/';};process.chdir=function(dir){throw new Error('process.chdir is not supported');};process.umask=function(){return 0;};},{}],51:[function(require,module,exports){(function(setImmediate,clearImmediate){(function(){var nextTick=require('process/browser.js').nextTick;var apply=Function.prototype.apply;var slice=Array.prototype.slice;var immediateIds={};var nextImmediateId=0;// DOM APIs, for completeness
exports.setTimeout=function(){return new Timeout(apply.call(setTimeout,window,arguments),clearTimeout);};exports.setInterval=function(){return new Timeout(apply.call(setInterval,window,arguments),clearInterval);};exports.clearTimeout=exports.clearInterval=function(timeout){timeout.close();};function Timeout(id,clearFn){this._id=id;this._clearFn=clearFn;}Timeout.prototype.unref=Timeout.prototype.ref=function(){};Timeout.prototype.close=function(){this._clearFn.call(window,this._id);};// Does not start the time, just sets up the members needed.
exports.enroll=function(item,msecs){clearTimeout(item._idleTimeoutId);item._idleTimeout=msecs;};exports.unenroll=function(item){clearTimeout(item._idleTimeoutId);item._idleTimeout=-1;};exports._unrefActive=exports.active=function(item){clearTimeout(item._idleTimeoutId);var msecs=item._idleTimeout;if(msecs>=0){item._idleTimeoutId=setTimeout(function onTimeout(){if(item._onTimeout)item._onTimeout();},msecs);}};// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate=typeof setImmediate==="function"?setImmediate:function(fn){var id=nextImmediateId++;var args=arguments.length<2?false:slice.call(arguments,1);immediateIds[id]=true;nextTick(function onNextTick(){if(immediateIds[id]){// fn.call() is faster so we optimize for the common use-case
// @see http://jsperf.com/call-apply-segu
if(args){fn.apply(null,args);}else{fn.call(null);}// Prevent ids from leaking
exports.clearImmediate(id);}});return id;};exports.clearImmediate=typeof clearImmediate==="function"?clearImmediate:function(id){delete immediateIds[id];};}).call(this);}).call(this,require("timers").setImmediate,require("timers").clearImmediate);},{"process/browser.js":50,"timers":51}],52:[function(require,module,exports){module.exports=function isBuffer(arg){return arg&&typeof arg==='object'&&typeof arg.copy==='function'&&typeof arg.fill==='function'&&typeof arg.readUInt8==='function';};},{}],53:[function(require,module,exports){// Currently in sync with Node.js lib/internal/util/types.js
// https://github.com/nodejs/node/commit/112cc7c27551254aa2b17098fb774867f05ed0d9
'use strict';var isArgumentsObject=require('is-arguments');var isGeneratorFunction=require('is-generator-function');var whichTypedArray=require('which-typed-array');var isTypedArray=require('is-typed-array');function uncurryThis(f){return f.call.bind(f);}var BigIntSupported=typeof BigInt!=='undefined';var SymbolSupported=typeof Symbol!=='undefined';var ObjectToString=uncurryThis(Object.prototype.toString);var numberValue=uncurryThis(Number.prototype.valueOf);var stringValue=uncurryThis(String.prototype.valueOf);var booleanValue=uncurryThis(Boolean.prototype.valueOf);if(BigIntSupported){var bigIntValue=uncurryThis(BigInt.prototype.valueOf);}if(SymbolSupported){var symbolValue=uncurryThis(Symbol.prototype.valueOf);}function checkBoxedPrimitive(value,prototypeValueOf){if(typeof value!=='object'){return false;}try{prototypeValueOf(value);return true;}catch(e){return false;}}exports.isArgumentsObject=isArgumentsObject;exports.isGeneratorFunction=isGeneratorFunction;exports.isTypedArray=isTypedArray;// Taken from here and modified for better browser support
// https://github.com/sindresorhus/p-is-promise/blob/cda35a513bda03f977ad5cde3a079d237e82d7ef/index.js
function isPromise(input){return typeof Promise!=='undefined'&&input instanceof Promise||input!==null&&typeof input==='object'&&typeof input.then==='function'&&typeof input.catch==='function';}exports.isPromise=isPromise;function isArrayBufferView(value){if(typeof ArrayBuffer!=='undefined'&&ArrayBuffer.isView){return ArrayBuffer.isView(value);}return isTypedArray(value)||isDataView(value);}exports.isArrayBufferView=isArrayBufferView;function isUint8Array(value){return whichTypedArray(value)==='Uint8Array';}exports.isUint8Array=isUint8Array;function isUint8ClampedArray(value){return whichTypedArray(value)==='Uint8ClampedArray';}exports.isUint8ClampedArray=isUint8ClampedArray;function isUint16Array(value){return whichTypedArray(value)==='Uint16Array';}exports.isUint16Array=isUint16Array;function isUint32Array(value){return whichTypedArray(value)==='Uint32Array';}exports.isUint32Array=isUint32Array;function isInt8Array(value){return whichTypedArray(value)==='Int8Array';}exports.isInt8Array=isInt8Array;function isInt16Array(value){return whichTypedArray(value)==='Int16Array';}exports.isInt16Array=isInt16Array;function isInt32Array(value){return whichTypedArray(value)==='Int32Array';}exports.isInt32Array=isInt32Array;function isFloat32Array(value){return whichTypedArray(value)==='Float32Array';}exports.isFloat32Array=isFloat32Array;function isFloat64Array(value){return whichTypedArray(value)==='Float64Array';}exports.isFloat64Array=isFloat64Array;function isBigInt64Array(value){return whichTypedArray(value)==='BigInt64Array';}exports.isBigInt64Array=isBigInt64Array;function isBigUint64Array(value){return whichTypedArray(value)==='BigUint64Array';}exports.isBigUint64Array=isBigUint64Array;function isMapToString(value){return ObjectToString(value)==='[object Map]';}isMapToString.working=typeof Map!=='undefined'&&isMapToString(new Map());function isMap(value){if(typeof Map==='undefined'){return false;}return isMapToString.working?isMapToString(value):value instanceof Map;}exports.isMap=isMap;function isSetToString(value){return ObjectToString(value)==='[object Set]';}isSetToString.working=typeof Set!=='undefined'&&isSetToString(new Set());function isSet(value){if(typeof Set==='undefined'){return false;}return isSetToString.working?isSetToString(value):value instanceof Set;}exports.isSet=isSet;function isWeakMapToString(value){return ObjectToString(value)==='[object WeakMap]';}isWeakMapToString.working=typeof WeakMap!=='undefined'&&isWeakMapToString(new WeakMap());function isWeakMap(value){if(typeof WeakMap==='undefined'){return false;}return isWeakMapToString.working?isWeakMapToString(value):value instanceof WeakMap;}exports.isWeakMap=isWeakMap;function isWeakSetToString(value){return ObjectToString(value)==='[object WeakSet]';}isWeakSetToString.working=typeof WeakSet!=='undefined'&&isWeakSetToString(new WeakSet());function isWeakSet(value){return isWeakSetToString(value);}exports.isWeakSet=isWeakSet;function isArrayBufferToString(value){return ObjectToString(value)==='[object ArrayBuffer]';}isArrayBufferToString.working=typeof ArrayBuffer!=='undefined'&&isArrayBufferToString(new ArrayBuffer());function isArrayBuffer(value){if(typeof ArrayBuffer==='undefined'){return false;}return isArrayBufferToString.working?isArrayBufferToString(value):value instanceof ArrayBuffer;}exports.isArrayBuffer=isArrayBuffer;function isDataViewToString(value){return ObjectToString(value)==='[object DataView]';}isDataViewToString.working=typeof ArrayBuffer!=='undefined'&&typeof DataView!=='undefined'&&isDataViewToString(new DataView(new ArrayBuffer(1),0,1));function isDataView(value){if(typeof DataView==='undefined'){return false;}return isDataViewToString.working?isDataViewToString(value):value instanceof DataView;}exports.isDataView=isDataView;// Store a copy of SharedArrayBuffer in case it's deleted elsewhere
var SharedArrayBufferCopy=typeof SharedArrayBuffer!=='undefined'?SharedArrayBuffer:undefined;function isSharedArrayBufferToString(value){return ObjectToString(value)==='[object SharedArrayBuffer]';}function isSharedArrayBuffer(value){if(typeof SharedArrayBufferCopy==='undefined'){return false;}if(typeof isSharedArrayBufferToString.working==='undefined'){isSharedArrayBufferToString.working=isSharedArrayBufferToString(new SharedArrayBufferCopy());}return isSharedArrayBufferToString.working?isSharedArrayBufferToString(value):value instanceof SharedArrayBufferCopy;}exports.isSharedArrayBuffer=isSharedArrayBuffer;function isAsyncFunction(value){return ObjectToString(value)==='[object AsyncFunction]';}exports.isAsyncFunction=isAsyncFunction;function isMapIterator(value){return ObjectToString(value)==='[object Map Iterator]';}exports.isMapIterator=isMapIterator;function isSetIterator(value){return ObjectToString(value)==='[object Set Iterator]';}exports.isSetIterator=isSetIterator;function isGeneratorObject(value){return ObjectToString(value)==='[object Generator]';}exports.isGeneratorObject=isGeneratorObject;function isWebAssemblyCompiledModule(value){return ObjectToString(value)==='[object WebAssembly.Module]';}exports.isWebAssemblyCompiledModule=isWebAssemblyCompiledModule;function isNumberObject(value){return checkBoxedPrimitive(value,numberValue);}exports.isNumberObject=isNumberObject;function isStringObject(value){return checkBoxedPrimitive(value,stringValue);}exports.isStringObject=isStringObject;function isBooleanObject(value){return checkBoxedPrimitive(value,booleanValue);}exports.isBooleanObject=isBooleanObject;function isBigIntObject(value){return BigIntSupported&&checkBoxedPrimitive(value,bigIntValue);}exports.isBigIntObject=isBigIntObject;function isSymbolObject(value){return SymbolSupported&&checkBoxedPrimitive(value,symbolValue);}exports.isSymbolObject=isSymbolObject;function isBoxedPrimitive(value){return isNumberObject(value)||isStringObject(value)||isBooleanObject(value)||isBigIntObject(value)||isSymbolObject(value);}exports.isBoxedPrimitive=isBoxedPrimitive;function isAnyArrayBuffer(value){return typeof Uint8Array!=='undefined'&&(isArrayBuffer(value)||isSharedArrayBuffer(value));}exports.isAnyArrayBuffer=isAnyArrayBuffer;['isProxy','isExternal','isModuleNamespaceObject'].forEach(function(method){Object.defineProperty(exports,method,{enumerable:false,value:function(){throw new Error(method+' is not supported in userland');}});});},{"is-arguments":41,"is-generator-function":43,"is-typed-array":48,"which-typed-array":55}],54:[function(require,module,exports){(function(process){(function(){// Copyright Joyent, Inc. and other Node contributors.
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
var getOwnPropertyDescriptors=Object.getOwnPropertyDescriptors||function getOwnPropertyDescriptors(obj){var keys=Object.keys(obj);var descriptors={};for(var i=0;i<keys.length;i++){descriptors[keys[i]]=Object.getOwnPropertyDescriptor(obj,keys[i]);}return descriptors;};var formatRegExp=/%[sdj%]/g;exports.format=function(f){if(!isString(f)){var objects=[];for(var i=0;i<arguments.length;i++){objects.push(inspect(arguments[i]));}return objects.join(' ');}var i=1;var args=arguments;var len=args.length;var str=String(f).replace(formatRegExp,function(x){if(x==='%%')return'%';if(i>=len)return x;switch(x){case'%s':return String(args[i++]);case'%d':return Number(args[i++]);case'%j':try{return JSON.stringify(args[i++]);}catch(_){return'[Circular]';}default:return x;}});for(var x=args[i];i<len;x=args[++i]){if(isNull(x)||!isObject(x)){str+=' '+x;}else{str+=' '+inspect(x);}}return str;};// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate=function(fn,msg){if(typeof process!=='undefined'&&process.noDeprecation===true){return fn;}// Allow for deprecating things in the process of starting up.
if(typeof process==='undefined'){return function(){return exports.deprecate(fn,msg).apply(this,arguments);};}var warned=false;function deprecated(){if(!warned){if(process.throwDeprecation){throw new Error(msg);}else if(process.traceDeprecation){console.trace(msg);}else{console.error(msg);}warned=true;}return fn.apply(this,arguments);}return deprecated;};var debugs={};var debugEnvRegex=/^$/;if(process.env.NODE_DEBUG){var debugEnv=process.env.NODE_DEBUG;debugEnv=debugEnv.replace(/[|\\{}()[\]^$+?.]/g,'\\$&').replace(/\*/g,'.*').replace(/,/g,'$|^').toUpperCase();debugEnvRegex=new RegExp('^'+debugEnv+'$','i');}exports.debuglog=function(set){set=set.toUpperCase();if(!debugs[set]){if(debugEnvRegex.test(set)){var pid=process.pid;debugs[set]=function(){var msg=exports.format.apply(exports,arguments);console.error('%s %d: %s',set,pid,msg);};}else{debugs[set]=function(){};}}return debugs[set];};/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */ /* legacy: obj, showHidden, depth, colors*/function inspect(obj,opts){// default options
var ctx={seen:[],stylize:stylizeNoColor};// legacy...
if(arguments.length>=3)ctx.depth=arguments[2];if(arguments.length>=4)ctx.colors=arguments[3];if(isBoolean(opts)){// legacy...
ctx.showHidden=opts;}else if(opts){// got an "options" object
exports._extend(ctx,opts);}// set default options
if(isUndefined(ctx.showHidden))ctx.showHidden=false;if(isUndefined(ctx.depth))ctx.depth=2;if(isUndefined(ctx.colors))ctx.colors=false;if(isUndefined(ctx.customInspect))ctx.customInspect=true;if(ctx.colors)ctx.stylize=stylizeWithColor;return formatValue(ctx,obj,ctx.depth);}exports.inspect=inspect;// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors={'bold':[1,22],'italic':[3,23],'underline':[4,24],'inverse':[7,27],'white':[37,39],'grey':[90,39],'black':[30,39],'blue':[34,39],'cyan':[36,39],'green':[32,39],'magenta':[35,39],'red':[31,39],'yellow':[33,39]};// Don't use 'blue' not visible on cmd.exe
inspect.styles={'special':'cyan','number':'yellow','boolean':'yellow','undefined':'grey','null':'bold','string':'green','date':'magenta',// "name": intentionally not styling
'regexp':'red'};function stylizeWithColor(str,styleType){var style=inspect.styles[styleType];if(style){return'\u001b['+inspect.colors[style][0]+'m'+str+'\u001b['+inspect.colors[style][1]+'m';}else{return str;}}function stylizeNoColor(str,styleType){return str;}function arrayToHash(array){var hash={};array.forEach(function(val,idx){hash[val]=true;});return hash;}function formatValue(ctx,value,recurseTimes){// Provide a hook for user-specified inspect functions.
// Check that value is an object with an inspect function on it
if(ctx.customInspect&&value&&isFunction(value.inspect)&&// Filter out the util module, it's inspect function is special
value.inspect!==exports.inspect&&// Also filter out any prototype objects using the circular check.
!(value.constructor&&value.constructor.prototype===value)){var ret=value.inspect(recurseTimes,ctx);if(!isString(ret)){ret=formatValue(ctx,ret,recurseTimes);}return ret;}// Primitive types cannot have properties
var primitive=formatPrimitive(ctx,value);if(primitive){return primitive;}// Look up the keys of the object.
var keys=Object.keys(value);var visibleKeys=arrayToHash(keys);if(ctx.showHidden){keys=Object.getOwnPropertyNames(value);}// IE doesn't make error fields non-enumerable
// http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
if(isError(value)&&(keys.indexOf('message')>=0||keys.indexOf('description')>=0)){return formatError(value);}// Some type of object without properties can be shortcutted.
if(keys.length===0){if(isFunction(value)){var name=value.name?': '+value.name:'';return ctx.stylize('[Function'+name+']','special');}if(isRegExp(value)){return ctx.stylize(RegExp.prototype.toString.call(value),'regexp');}if(isDate(value)){return ctx.stylize(Date.prototype.toString.call(value),'date');}if(isError(value)){return formatError(value);}}var base='',array=false,braces=['{','}'];// Make Array say that they are Array
if(isArray(value)){array=true;braces=['[',']'];}// Make functions say that they are functions
if(isFunction(value)){var n=value.name?': '+value.name:'';base=' [Function'+n+']';}// Make RegExps say that they are RegExps
if(isRegExp(value)){base=' '+RegExp.prototype.toString.call(value);}// Make dates with properties first say the date
if(isDate(value)){base=' '+Date.prototype.toUTCString.call(value);}// Make error with message first say the error
if(isError(value)){base=' '+formatError(value);}if(keys.length===0&&(!array||value.length==0)){return braces[0]+base+braces[1];}if(recurseTimes<0){if(isRegExp(value)){return ctx.stylize(RegExp.prototype.toString.call(value),'regexp');}else{return ctx.stylize('[Object]','special');}}ctx.seen.push(value);var output;if(array){output=formatArray(ctx,value,recurseTimes,visibleKeys,keys);}else{output=keys.map(function(key){return formatProperty(ctx,value,recurseTimes,visibleKeys,key,array);});}ctx.seen.pop();return reduceToSingleString(output,base,braces);}function formatPrimitive(ctx,value){if(isUndefined(value))return ctx.stylize('undefined','undefined');if(isString(value)){var simple='\''+JSON.stringify(value).replace(/^"|"$/g,'').replace(/'/g,"\\'").replace(/\\"/g,'"')+'\'';return ctx.stylize(simple,'string');}if(isNumber(value))return ctx.stylize(''+value,'number');if(isBoolean(value))return ctx.stylize(''+value,'boolean');// For some reason typeof null is "object", so special case here.
if(isNull(value))return ctx.stylize('null','null');}function formatError(value){return'['+Error.prototype.toString.call(value)+']';}function formatArray(ctx,value,recurseTimes,visibleKeys,keys){var output=[];for(var i=0,l=value.length;i<l;++i){if(hasOwnProperty(value,String(i))){output.push(formatProperty(ctx,value,recurseTimes,visibleKeys,String(i),true));}else{output.push('');}}keys.forEach(function(key){if(!key.match(/^\d+$/)){output.push(formatProperty(ctx,value,recurseTimes,visibleKeys,key,true));}});return output;}function formatProperty(ctx,value,recurseTimes,visibleKeys,key,array){var name,str,desc;desc=Object.getOwnPropertyDescriptor(value,key)||{value:value[key]};if(desc.get){if(desc.set){str=ctx.stylize('[Getter/Setter]','special');}else{str=ctx.stylize('[Getter]','special');}}else{if(desc.set){str=ctx.stylize('[Setter]','special');}}if(!hasOwnProperty(visibleKeys,key)){name='['+key+']';}if(!str){if(ctx.seen.indexOf(desc.value)<0){if(isNull(recurseTimes)){str=formatValue(ctx,desc.value,null);}else{str=formatValue(ctx,desc.value,recurseTimes-1);}if(str.indexOf('\n')>-1){if(array){str=str.split('\n').map(function(line){return'  '+line;}).join('\n').slice(2);}else{str='\n'+str.split('\n').map(function(line){return'   '+line;}).join('\n');}}}else{str=ctx.stylize('[Circular]','special');}}if(isUndefined(name)){if(array&&key.match(/^\d+$/)){return str;}name=JSON.stringify(''+key);if(name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)){name=name.slice(1,-1);name=ctx.stylize(name,'name');}else{name=name.replace(/'/g,"\\'").replace(/\\"/g,'"').replace(/(^"|"$)/g,"'");name=ctx.stylize(name,'string');}}return name+': '+str;}function reduceToSingleString(output,base,braces){var numLinesEst=0;var length=output.reduce(function(prev,cur){numLinesEst++;if(cur.indexOf('\n')>=0)numLinesEst++;return prev+cur.replace(/\u001b\[\d\d?m/g,'').length+1;},0);if(length>60){return braces[0]+(base===''?'':base+'\n ')+' '+output.join(',\n  ')+' '+braces[1];}return braces[0]+base+' '+output.join(', ')+' '+braces[1];}// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
exports.types=require('./support/types');function isArray(ar){return Array.isArray(ar);}exports.isArray=isArray;function isBoolean(arg){return typeof arg==='boolean';}exports.isBoolean=isBoolean;function isNull(arg){return arg===null;}exports.isNull=isNull;function isNullOrUndefined(arg){return arg==null;}exports.isNullOrUndefined=isNullOrUndefined;function isNumber(arg){return typeof arg==='number';}exports.isNumber=isNumber;function isString(arg){return typeof arg==='string';}exports.isString=isString;function isSymbol(arg){return typeof arg==='symbol';}exports.isSymbol=isSymbol;function isUndefined(arg){return arg===void 0;}exports.isUndefined=isUndefined;function isRegExp(re){return isObject(re)&&objectToString(re)==='[object RegExp]';}exports.isRegExp=isRegExp;exports.types.isRegExp=isRegExp;function isObject(arg){return typeof arg==='object'&&arg!==null;}exports.isObject=isObject;function isDate(d){return isObject(d)&&objectToString(d)==='[object Date]';}exports.isDate=isDate;exports.types.isDate=isDate;function isError(e){return isObject(e)&&(objectToString(e)==='[object Error]'||e instanceof Error);}exports.isError=isError;exports.types.isNativeError=isError;function isFunction(arg){return typeof arg==='function';}exports.isFunction=isFunction;function isPrimitive(arg){return arg===null||typeof arg==='boolean'||typeof arg==='number'||typeof arg==='string'||typeof arg==='symbol'||// ES6 symbol
typeof arg==='undefined';}exports.isPrimitive=isPrimitive;exports.isBuffer=require('./support/isBuffer');function objectToString(o){return Object.prototype.toString.call(o);}function pad(n){return n<10?'0'+n.toString(10):n.toString(10);}var months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];// 26 Feb 16:19:34
function timestamp(){var d=new Date();var time=[pad(d.getHours()),pad(d.getMinutes()),pad(d.getSeconds())].join(':');return[d.getDate(),months[d.getMonth()],time].join(' ');}// log is just a thin wrapper to console.log that prepends a timestamp
exports.log=function(){console.log('%s - %s',timestamp(),exports.format.apply(exports,arguments));};/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */exports.inherits=require('inherits');exports._extend=function(origin,add){// Don't do anything if add isn't an object
if(!add||!isObject(add))return origin;var keys=Object.keys(add);var i=keys.length;while(i--){origin[keys[i]]=add[keys[i]];}return origin;};function hasOwnProperty(obj,prop){return Object.prototype.hasOwnProperty.call(obj,prop);}var kCustomPromisifiedSymbol=typeof Symbol!=='undefined'?Symbol('util.promisify.custom'):undefined;exports.promisify=function promisify(original){if(typeof original!=='function')throw new TypeError('The "original" argument must be of type Function');if(kCustomPromisifiedSymbol&&original[kCustomPromisifiedSymbol]){var fn=original[kCustomPromisifiedSymbol];if(typeof fn!=='function'){throw new TypeError('The "util.promisify.custom" argument must be of type Function');}Object.defineProperty(fn,kCustomPromisifiedSymbol,{value:fn,enumerable:false,writable:false,configurable:true});return fn;}function fn(){var promiseResolve,promiseReject;var promise=new Promise(function(resolve,reject){promiseResolve=resolve;promiseReject=reject;});var args=[];for(var i=0;i<arguments.length;i++){args.push(arguments[i]);}args.push(function(err,value){if(err){promiseReject(err);}else{promiseResolve(value);}});try{original.apply(this,args);}catch(err){promiseReject(err);}return promise;}Object.setPrototypeOf(fn,Object.getPrototypeOf(original));if(kCustomPromisifiedSymbol)Object.defineProperty(fn,kCustomPromisifiedSymbol,{value:fn,enumerable:false,writable:false,configurable:true});return Object.defineProperties(fn,getOwnPropertyDescriptors(original));};exports.promisify.custom=kCustomPromisifiedSymbol;function callbackifyOnRejected(reason,cb){// `!reason` guard inspired by bluebird (Ref: https://goo.gl/t5IS6M).
// Because `null` is a special error value in callbacks which means "no error
// occurred", we error-wrap so the callback consumer can distinguish between
// "the promise rejected with null" or "the promise fulfilled with undefined".
if(!reason){var newReason=new Error('Promise was rejected with a falsy value');newReason.reason=reason;reason=newReason;}return cb(reason);}function callbackify(original){if(typeof original!=='function'){throw new TypeError('The "original" argument must be of type Function');}// We DO NOT return the promise as it gives the user a false sense that
// the promise is actually somehow related to the callback's execution
// and that the callback throwing will reject the promise.
function callbackified(){var args=[];for(var i=0;i<arguments.length;i++){args.push(arguments[i]);}var maybeCb=args.pop();if(typeof maybeCb!=='function'){throw new TypeError('The last argument must be of type Function');}var self=this;var cb=function(){return maybeCb.apply(self,arguments);};// In true node style we process the callback on `nextTick` with all the
// implications (stack, `uncaughtException`, `async_hooks`)
original.apply(this,args).then(function(ret){process.nextTick(cb.bind(null,null,ret));},function(rej){process.nextTick(callbackifyOnRejected.bind(null,rej,cb));});}Object.setPrototypeOf(callbackified,Object.getPrototypeOf(original));Object.defineProperties(callbackified,getOwnPropertyDescriptors(original));return callbackified;}exports.callbackify=callbackify;}).call(this);}).call(this,require('_process'));},{"./support/isBuffer":52,"./support/types":53,"_process":50,"inherits":40}],55:[function(require,module,exports){(function(global){(function(){'use strict';var forEach=require('for-each');var availableTypedArrays=require('available-typed-arrays');var callBound=require('call-bind/callBound');var gOPD=require('gopd');var $toString=callBound('Object.prototype.toString');var hasToStringTag=require('has-tostringtag/shams')();var g=typeof globalThis==='undefined'?global:globalThis;var typedArrays=availableTypedArrays();var $slice=callBound('String.prototype.slice');var toStrTags={};var getPrototypeOf=Object.getPrototypeOf;// require('getprototypeof');
if(hasToStringTag&&gOPD&&getPrototypeOf){forEach(typedArrays,function(typedArray){if(typeof g[typedArray]==='function'){var arr=new g[typedArray]();if(Symbol.toStringTag in arr){var proto=getPrototypeOf(arr);var descriptor=gOPD(proto,Symbol.toStringTag);if(!descriptor){var superProto=getPrototypeOf(proto);descriptor=gOPD(superProto,Symbol.toStringTag);}toStrTags[typedArray]=descriptor.get;}}});}var tryTypedArrays=function tryAllTypedArrays(value){var foundName=false;forEach(toStrTags,function(getter,typedArray){if(!foundName){try{var name=getter.call(value);if(name===typedArray){foundName=name;}}catch(e){}}});return foundName;};var isTypedArray=require('is-typed-array');module.exports=function whichTypedArray(value){if(!isTypedArray(value)){return false;}if(!hasToStringTag||!(Symbol.toStringTag in value)){return $slice($toString(value),8,-1);}return tryTypedArrays(value);};}).call(this);}).call(this,typeof global!=="undefined"?global:typeof self!=="undefined"?self:typeof window!=="undefined"?window:{});},{"available-typed-arrays":18,"call-bind/callBound":20,"for-each":22,"gopd":35,"has-tostringtag/shams":38,"is-typed-array":48}],56:[function(require,module,exports){module.exports=extend;var hasOwnProperty=Object.prototype.hasOwnProperty;function extend(){var target={};for(var i=0;i<arguments.length;i++){var source=arguments[i];for(var key in source){if(hasOwnProperty.call(source,key)){target[key]=source[key];}}}return target;}},{}],57:[function(require,module,exports){/**
* Simple browser shim loader - assign the npm module to a window global automatically
*
* @license MIT
* @author <steven@velozo.com>
*/var libNPMModuleWrapper=require('./Meadow.js');if(typeof window==='object'&&!window.hasOwnProperty('Meadow')){window.Meadow=libNPMModuleWrapper;}module.exports=libNPMModuleWrapper;},{"./Meadow.js":62}],58:[function(require,module,exports){// ##### Part of the **[retold](https://stevenvelozo.github.io/retold/)** system
/**
* @license MIT
* @author <steven@velozo.com>
*/ /**
* Load the schema and metadata from a package file
*
* @method loadFromPackageFile
* @return {Object} Returns a new Meadow, or false if it failed
*/var loadFromPackageFile=function(pMeadow,pPackage){// Use the package loader to grab the configuration objects and clone a new Meadow.
var tmpPackage=false;try{tmpPackage=require(pPackage);}catch(pError){pMeadow.fable.log.error('Error loading Fable package',{Package:pPackage});return false;}// Spool up a new Meadow object
var tmpNewMeadow=pMeadow.new(pMeadow.fable);// Safely set the parameters
if(typeof tmpPackage.Scope==='string'){tmpNewMeadow.setScope(tmpPackage.Scope);}if(typeof tmpPackage.Domain==='string'){tmpNewMeadow.setDomain(tmpPackage.Domain);}if(typeof tmpPackage.DefaultIdentifier==='string'){tmpNewMeadow.setDefaultIdentifier(tmpPackage.DefaultIdentifier);}if(Array.isArray(tmpPackage.Schema)){tmpNewMeadow.setSchema(tmpPackage.Schema);}if(typeof tmpPackage.JsonSchema==='object'){tmpNewMeadow.setJsonSchema(tmpPackage.JsonSchema);}if(typeof tmpPackage.DefaultObject==='object'){tmpNewMeadow.setDefault(tmpPackage.DefaultObject);}if(typeof tmpPackage.Authorization==='object'){tmpNewMeadow.setAuthorizer(tmpPackage.Authorization);}return tmpNewMeadow;};module.exports=loadFromPackageFile;},{}],59:[function(require,module,exports){// ##### Part of the **[retold](https://stevenvelozo.github.io/retold/)** system
/**
* @license MIT
* @author <steven@velozo.com>
*/ /**
* Load the schema and metadata from a package object
*
* @method loadFromPackageObject
* @return {Object} Returns a new Meadow, or false if it failed
*/var loadFromPackageObject=function(pMeadow,pPackage){// Use the package loader to grab the configuration objects and clone a new Meadow.
var tmpPackage=typeof pPackage=='object'?pPackage:{};if(!pPackage.hasOwnProperty('Scope')){pMeadow.fable.log.error('Error loading Fable package -- scope not defined.',{Package:pPackage});}// Spool up a new Meadow object
var tmpNewMeadow=pMeadow.new(pMeadow.fable);// Safely set the parameters
if(typeof tmpPackage.Scope==='string'){tmpNewMeadow.setScope(tmpPackage.Scope);}if(typeof tmpPackage.Domain==='string'){tmpNewMeadow.setDomain(tmpPackage.Domain);}if(typeof tmpPackage.DefaultIdentifier==='string'){tmpNewMeadow.setDefaultIdentifier(tmpPackage.DefaultIdentifier);}if(Array.isArray(tmpPackage.Schema)){tmpNewMeadow.setSchema(tmpPackage.Schema);}if(typeof tmpPackage.JsonSchema==='object'){tmpNewMeadow.setJsonSchema(tmpPackage.JsonSchema);}if(typeof tmpPackage.DefaultObject==='object'){tmpNewMeadow.setDefault(tmpPackage.DefaultObject);}if(typeof tmpPackage.Authorization==='object'){tmpNewMeadow.setAuthorizer(tmpPackage.Authorization);}return tmpNewMeadow;};module.exports=loadFromPackageObject;},{}],60:[function(require,module,exports){// ##### Part of the **[retold](https://stevenvelozo.github.io/retold/)** system
/**
* @license MIT
* @author <steven@velozo.com>
*/var libFS=require('fs');/**
* ### Meadow Raw Query Library
*
* This library loads and stores raw queries for FoxHound to use.
* You can overload the default query that is built for each of
* the following query archetypes:
*
* `Create`, `Read`, `Reads`, `Update`, `Delete`, `Count`
*
* You can also load other custom queries and give them an
* arbitrary name.
*
* @class MeadowRawQuery
*/var MeadowRawQuery=function(){function createNew(pMeadow){// If a valid Fable object isn't passed in, return a constructor
if(typeof pMeadow!=='object'||!('fable'in pMeadow)){return{new:createNew};}var _Meadow=pMeadow;var _Queries={};/**
		* Load a Custom Query from a File
		*
		* @method doLoadQuery
		*/function doLoadQuery(pQueryTag,pFileName,fCallBack){var tmpCallBack=typeof fCallBack==='function'?fCallBack:function(){};libFS.readFile(pFileName,'utf8',function(pError,pData){if(pError){_Meadow.fable.log.error('Problem loading custom query file.',{QueryTag:pQueryTag,FileName:pFileName,Error:pError});// There is some debate whether we should leave the queries entry unset or set it to empty so nothing happens.
// If this were to set the query to `false` instead of `''`, FoxHound would be used to generate a query.
doSetQuery(pQueryTag,'');tmpCallBack(false);}else{_Meadow.fable.log.trace('Loaded custom query file.',{QueryTag:pQueryTag,FileName:pFileName});doSetQuery(pQueryTag,pData);tmpCallBack(true);}});return _Meadow;}/**
		* Sets a Custom Query from a String
		*
		* @method doSetQuery
		*/function doSetQuery(pQueryTag,pQueryString){_Queries[pQueryTag]=pQueryString;return _Meadow;}/**
		* Returns a Custom Query if one has been set for this tag
		*
		* @method doGetQuery
		*/function doGetQuery(pQueryTag){if(_Queries.hasOwnProperty(pQueryTag)){return _Queries[pQueryTag];}return false;}/**
		* Check if a Custom Query exists
		*
		* @method doCheckQuery
		*/function doCheckQuery(pQueryTag){return _Queries.hasOwnProperty(pQueryTag);}var tmpNewMeadowRawQuery={loadQuery:doLoadQuery,setQuery:doSetQuery,checkQuery:doCheckQuery,getQuery:doGetQuery,new:createNew};return tmpNewMeadowRawQuery;}return createNew();};module.exports=new MeadowRawQuery();},{"fs":19}],61:[function(require,module,exports){// ##### Part of the **[retold](https://stevenvelozo.github.io/retold/)** system
/**
* @license MIT
* @author <steven@velozo.com>
*/var libValidator=require('is-my-json-valid');/**
* @class MeadowSchema
*/var MeadowSchema=function(){function createNew(pOriginalJsonSchema,pOriginalSchema){/* ^ An Example Meadow Schema Object
		    [
		    	{ "Column": "IDAnimal", "Type":"AutoIdentity" },
		    	{ "Column": "GUIDAnimal", "Type":"AutoGUID" },
		    	{ "Column": "Created", "Type":"CreateDate" },
		    	{ "Column": "CreatingIDUser", "Type":"CreateIDUser" },
		    	{ "Column": "Modified", "Type":"UpdateDate" },
		    	{ "Column": "ModifyingIDUser", "Type":"UpdateIDUser" },
		    	{ "Column": "Deleted", "Type":"Deleted" },
		    	{ "Column": "DeletingIDUser", "Type":"DeleteIDUser" },
		    	{ "Column": "DeleteDate", "Type":"DeleteDate" }
		    ]
		*/ /* #### The Meadow Schema
		 *
		 * Meadow uses this description object to create queries, broker data and generate interfaces.
		 */var _Schema=false;/* ^ An Example JSONSchema Object:
		    	{
		    		"$schema": "http://json-schema.org/draft-04/schema#",
		    		"title": "Product",
		    		"description": "A product from Acme's catalog",
		    		"type": "object",
		    		"properties": {
		    			"id": {
		    				"description": "The unique identifier for a product",
		    				"type": "integer"
		    			},
		    			"name": {
		    				"description": "Name of the product",
		    				"type": "string"
		    			},
		    			"price": {
		    				"type": "number",
		    				"minimum": 0,
		    				"exclusiveMinimum": true
		    			},
		    			"tags": {
		    				"type": "array",
		    				"items": {
		    					"type": "string"
		    				},
		    				"minItems": 1,
		    				"uniqueItems": true
		    			}
		    		},
		    		"required": ["id", "name", "price"]
		    	}
		*/ /* #### A JSONSchema Description
		 *
		 * http://json-schema.org/examples.html
		 *
		 * http://json-schema.org/latest/json-schema-core.html
		 */var _JsonSchema=false;/* #### An "empty" ORM object
		 * This is the basis for being filled out by the marshalling code.
		 */var _Default=false;// The cached validator, which uses the JSONSchema
var _Validate=false;// The authorizers available to this meadow object
var _Authorizers={};/**
		* Set the Meadow schema
		*
		* Our schemas are really instructions for *what* to do *when*.  We track:
		*   - Column
		*   - Type _(e.g. AutoIdentity, AutoGUID, CreateDate, CreateIDUser, UpdateDate, UpdateIDUser, DeleteDate, Deleted, DeleteIDUser)_
		*   - Optionally Special Instractions
		*
		* @method setSchema
		*/var setSchema=function(pSchema){_Schema=typeof pSchema==='object'?pSchema:{title:'Unknown',type:'object',required:[]};};setSchema(pOriginalSchema);/**
		* Set the JSONSchema
		*
		* @method setJsonSchema
		*/var setJsonSchema=function(pJsonSchema){_JsonSchema=typeof pJsonSchema==='object'?pJsonSchema:{title:'Unknown',type:'object',required:[]};_Validate=libValidator(_JsonSchema,{greedy:true,verbose:true});};setJsonSchema(pOriginalJsonSchema);/**
		* Set the Default ORM object
		*
		* @method setDefault
		*/var setDefault=function(pDefault){_Default=typeof pDefault==='object'?pDefault:{};};setDefault();/**
		* Set the authorizer set
		*
		* @method setAuthorizer
		* @return {Object} This is chainable.
		*/var setAuthorizer=function(pAuthorizer){_Authorizers=typeof pAuthorizer==='object'?pAuthorizer:{};};/**
		* Validate an object against the current schema
		*
		* @method validateObject
		*/var validateObject=function(pObject){var tmpValidation={Valid:_Validate(pObject)};// Stuff the errors in if it is invalid
if(!tmpValidation.Valid){tmpValidation.Errors=_Validate.errors;}return tmpValidation;};var tmpNewMeadowSchemaObject={setSchema:setSchema,setJsonSchema:setJsonSchema,setDefault:setDefault,setAuthorizer:setAuthorizer,validateObject:validateObject,new:createNew};/**
		 * The Meadow Schema
		 *
		 * @property schema
		 * @type object
		 */Object.defineProperty(tmpNewMeadowSchemaObject,'schema',{get:function(){return _Schema;},enumerable:true});/**
		 * The JsonSchema
		 *
		 * @property jsonSchema
		 * @type object
		 */Object.defineProperty(tmpNewMeadowSchemaObject,'jsonSchema',{get:function(){return _JsonSchema;},enumerable:true});/**
		 * Default Object
		 *
		 * @property defaultObject
		 * @type object
		 */Object.defineProperty(tmpNewMeadowSchemaObject,'defaultObject',{get:function(){return _Default;},enumerable:true});/**
		 * Authorizer
		 *
		 * @property defaultObject
		 * @type object
		 */Object.defineProperty(tmpNewMeadowSchemaObject,'authorizer',{get:function(){return _Authorizers;},enumerable:true});return tmpNewMeadowSchemaObject;}return createNew();};module.exports=new MeadowSchema();},{"is-my-json-valid":46}],62:[function(require,module,exports){// ##### Part of the **[retold](https://stevenvelozo.github.io/retold/)** system
/**
* @license MIT
* @author <steven@velozo.com>
*/var libFoxHound=require('foxhound');/**
* Meadow Data Broker Library
*
* @class Meadow
*/var Meadow=function(){function createNew(pFable,pScope,pJsonSchema,pSchema){// If a valid Fable object isn't passed in, return a constructor
if(typeof pFable!=='object'||!('fable'in pFable)){return{new:createNew};}var _Fable=pFable;// Make sure there is a valid data broker set
_Fable.settingsManager.fill({MeadowProvider:'None'});var _IDUser=0;// The scope of this broker.
var _Scope=typeof pScope==='string'?pScope:'Unknown';var _Domain='Default';// The schema for this broker
var _Schema=require('./Meadow-Schema.js').new(pJsonSchema,pSchema);// The query for this broker
var _Query=libFoxHound.new(_Fable).setScope(_Scope);// The custom query loader
var _RawQueries=require('./Meadow-RawQuery.js').new(_Fable);// The core behaviors.. abstracted into their own modules to encapsulate complexity
var _CreateBehavior=require('./behaviors/Meadow-Create.js');var _ReadBehavior=require('./behaviors/Meadow-Read.js');var _ReadsBehavior=require('./behaviors/Meadow-Reads.js');var _UpdateBehavior=require('./behaviors/Meadow-Update.js');var _DeleteBehavior=require('./behaviors/Meadow-Delete.js');var _UndeleteBehavior=require('./behaviors/Meadow-Undelete.js');var _CountBehavior=require('./behaviors/Meadow-Count.js');// The data provider
var _Provider=false;var _ProviderName=false;// The default identifier for this broker.
// This is what is used for the automated endpoint queries
// For example the 198 in GET http://myapi.com/Widget/198
//
// Our development model prefers IDWidget as the column name for the default identifier.
var _DefaultIdentifier='ID'+_Scope;var _DefaultGUIdentifier='GUID'+_Scope;/**
		 * Load a Meadow Package JSON, create a Meadow object from it.
		 */var _MeadowPackageLoader=require('./Meadow-PackageFileLoader.js');var loadFromPackage=function(pPackage){return _MeadowPackageLoader(this,pPackage);};/**
		 * Load a Meadow Package JSON from file, create a Meadow object from it.
		 */var _MeadowPackageObjectLoader=require('./Meadow-PackageObjectLoader.js');var loadFromPackageObject=function(pPackage){return _MeadowPackageObjectLoader(this,pPackage);};/**
		* Pass relevant state into the provider
		*
		* @method updateProviderState
		* @return {Object} Returns the current Meadow for chaining.
		*/var updateProviderState=()=>{if(typeof _Provider.setSchema==='function'){_Provider.setSchema(_Scope,_Schema.schema,_DefaultIdentifier,_DefaultGUIdentifier);}return this;};/**
		* Set the scope
		*
		* @method setScope
		* @return {Object} Returns the current Meadow for chaining.
		*/var setScope=function(pScope){_Scope=pScope;_Query.setScope(pScope);updateProviderState();return this;};/**
		* Set the user ID for inserts and updates
		*
		* @method setIDUser
		* @return {Object} Returns the current Meadow for chaining.
		*/var setIDUser=function(pIDUser){_IDUser=pIDUser;return this;};/**
		* Set the Provider for Query execution.
		*
		* This function expects a string, case sensitive, which matches the
		* provider filename
		*
		* @method setProvider
		* @param {String} pProviderName The provider for query generation.
		* @return {Object} Returns the current Meadow for chaining.
		*/var setProvider=function(pProviderName){if(typeof pProviderName!=='string'){pProviderName='None';}var tmpProviderModuleFile='./providers/Meadow-Provider-'+pProviderName+'.js';try{var tmpProviderModule=require(tmpProviderModuleFile).new(_Fable);_Provider=tmpProviderModule;// Give the provider access to the schema object
updateProviderState();_ProviderName=pProviderName;}catch(pError){_Fable.log.error('Provider not set - require load problem',{ProviderModuleFile:tmpProviderModuleFile,InvalidProvider:pProviderName,error:pError});//setProvider('None');
}return this;};setProvider(_Fable.settings.MeadowProvider);/**
		* Set the schema to be something else
		*
		* @method setSchema
		* @return {Object} This is chainable.
		*/var setSchema=function(pSchema){_Schema.setSchema(pSchema);updateProviderState();return this;};/**
		* Set the Jsonschema to be something else
		*
		* @method setJsonSchema
		* @return {Object} This is chainable.
		*/var setJsonSchema=function(pJsonSchema){_Schema.setJsonSchema(pJsonSchema);return this;};/**
		* Set the default object to be something else
		*
		* @method setDefault
		* @return {Object} This is chainable.
		*/var setDefault=function(pDefault){_Schema.setDefault(pDefault);return this;};/**
		* Set the authorizer set
		*
		* @method setAuthorizer
		* @return {Object} This is chainable.
		*/var setAuthorizer=function(pAuthorizer){_Schema.setAuthorizer(pAuthorizer);return this;};/**
		* Set the domain
		*
		* @method setDomain
		* @return {Object} This is chainable.
		*/var setDomain=function(pDomain){_Domain=pDomain;return this;};/**
		* Set the default identifier
		*
		* @method setDefaultIdentifier
		* @return {Object} This is chainable.
		*/var setDefaultIdentifier=function(pDefaultIdentifier){_DefaultIdentifier=pDefaultIdentifier;_DefaultGUIdentifier='GU'+pDefaultIdentifier;updateProviderState();return this;};/**
		 * Create a record
		 */var doCreate=function(pQuery,fCallBack){return _CreateBehavior(this,pQuery,fCallBack);};/**
		 * Read a record
		 */var doRead=function(pQuery,fCallBack){return _ReadBehavior(this,pQuery,fCallBack);};/**
		 * Read multiple records
		 */var doReads=function(pQuery,fCallBack){return _ReadsBehavior(this,pQuery,fCallBack);};/**
		 * Update a record
		 */var doUpdate=function(pQuery,fCallBack){return _UpdateBehavior(this,pQuery,fCallBack);};/**
		 * Delete a record
		 */var doDelete=function(pQuery,fCallBack){return _DeleteBehavior(this,pQuery,fCallBack);};/**
		 * Undelete a record
		 */var doUndelete=function(pQuery,fCallBack){return _UndeleteBehavior(this,pQuery,fCallBack);};/**
		 * Count multiple records
		 */var doCount=function(pQuery,fCallBack){return _CountBehavior(this,pQuery,fCallBack);};/**
		 * Get the role name for an index
		 */let _RoleNames;if(Array.isArray(_Fable.settings.MeadowRoleNames)){_RoleNames=_Fable.settings.MeadowRoleNames;}else{_RoleNames=['Unauthenticated','User','Manager','Director','Executive','Administrator'];}var getRoleName=function(pRoleIndex){if(pRoleIndex<0||pRoleIndex>=_RoleNames.length){return'Unauthenticated';}return _RoleNames[pRoleIndex];};/**
		 * Take the stored representation of our object and stuff the proper values
		 * into our record, translating where necessary.
		 */var marshalRecordFromSourceToObject=function(pRecord){// Create an object from the default schema object
var tmpNewObject=_Fable.Utility.extend({},_Schema.defaultObject);// Now marshal the values from pRecord into tmpNewObject, based on schema
_Provider.marshalRecordFromSourceToObject(tmpNewObject,pRecord,_Schema.schema);// This turns on magical validation
//_Fable.log.trace('Validation', {Value:tmpNewObject, Validation:_Schema.validateObject(tmpNewObject)})
return tmpNewObject;};/**
		 * Method to log slow queries in a consistent pattern
		 */var logSlowQuery=function(pProfileTime,pQuery){var tmpQuery=pQuery.query||{body:'',parameters:{}};var tmpFullQuery=tmpQuery.body;if(tmpQuery.parameters.length){for(var tmpKey in tmpQuery.parameters){tmpFullQuery=tmpFullQuery.replace(':'+tmpKey,tmpQuery.parameters[tmpKey]);}}_Fable.log.warn('Slow Read query took '+pProfileTime+'ms',{Provider:_ProviderName,Query:{Body:tmpQuery.body,Parameters:tmpQuery.parameters,FullQuery:tmpFullQuery}});};/**
		* Container Object for our Factory Pattern
		*/var tmpNewMeadowObject={doCreate:doCreate,doRead:doRead,doReads:doReads,doUpdate:doUpdate,doDelete:doDelete,doUndelete:doUndelete,doCount:doCount,validateObject:_Schema.validateObject,marshalRecordFromSourceToObject:marshalRecordFromSourceToObject,setProvider:setProvider,setIDUser:setIDUser,loadFromPackage:loadFromPackage,loadFromPackageObject:loadFromPackageObject,setScope:setScope,setDomain:setDomain,setSchema:setSchema,setJsonSchema:setJsonSchema,setDefault:setDefault,setDefaultIdentifier:setDefaultIdentifier,setAuthorizer:setAuthorizer,getRoleName:getRoleName,logSlowQuery:logSlowQuery,// Factory
new:createNew};/**
		 * Entity Scope -- usually the name of the entity it represents
		 *
		 * @property scope
		 * @type string
		 */Object.defineProperty(tmpNewMeadowObject,'scope',{get:function(){return _Scope;},enumerable:true});/**
		 * Entity Schema
		 *
		 * @property schema
		 * @type object
		 */Object.defineProperty(tmpNewMeadowObject,'schema',{get:function(){return _Schema.schema;},enumerable:true});/**
		 * Entity Schema
		 *
		 * @property schema
		 * @type object
		 */Object.defineProperty(tmpNewMeadowObject,'schemaFull',{get:function(){return _Schema;},enumerable:true});/**
		 * Default Identifier
		 *
		 * @property schema
		 * @type object
		 */Object.defineProperty(tmpNewMeadowObject,'defaultIdentifier',{get:function(){return _DefaultIdentifier;},enumerable:true});/**
		 * Default GUIdentifier
		 *
		 * @property schema
		 * @type object
		 */Object.defineProperty(tmpNewMeadowObject,'defaultGUIdentifier',{get:function(){return _DefaultGUIdentifier;},enumerable:true});/**
		 * Json Schema
		 *
		 * @property schema
		 * @type object
		 */Object.defineProperty(tmpNewMeadowObject,'jsonSchema',{get:function(){return _Schema.jsonSchema;},enumerable:true});/**
		 * User Identifier
		 *
		 * Used to stamp user identity into Create/Update operations.
		 *
		 * @property userIdentifier
		 * @type string
		 */Object.defineProperty(tmpNewMeadowObject,'userIdentifier',{get:function(){return _IDUser;},enumerable:true});/**
		 * Query (FoxHound) object
		 *
		 * This always returns a cloned query, so it's safe to get queries with a simple:
		 *   var tmpQuery = libSomeFableObject.query;
		 *
		 * and not expect leakage of basic (cap, begin, filter, dataelements) cloned values.
		 *
		 * @property query
		 * @type object
		 */Object.defineProperty(tmpNewMeadowObject,'query',{get:function(){var tmpQuery=_Query.clone();// Set the default schema
tmpQuery.query.schema=_Schema.schema;return tmpQuery;},enumerable:true});/**
		 * Raw Queries
		 *
		 * @property rawQueries
		 * @type object
		 */Object.defineProperty(tmpNewMeadowObject,'rawQueries',{get:function(){return _RawQueries;},enumerable:true});/**
		 * Provider
		 *
		 * @property provider
		 * @type object
		 */Object.defineProperty(tmpNewMeadowObject,'provider',{get:function(){return _Provider;},enumerable:true});/**
		 * Provider Name
		 *
		 * @property providerName
		 * @type object
		 */Object.defineProperty(tmpNewMeadowObject,'providerName',{get:function(){return _ProviderName;},enumerable:true});// addServices removed in fable 2.x
if(typeof _Fable.addServices==='function'){_Fable.addServices(tmpNewMeadowObject);}else{// bring over addServices implementation from Fable 1.x for backward compatibility
Object.defineProperty(tmpNewMeadowObject,'fable',{get:function(){return _Fable;},enumerable:false});Object.defineProperty(tmpNewMeadowObject,'settings',{get:function(){return _Fable.settings;},enumerable:false});Object.defineProperty(tmpNewMeadowObject,'log',{get:function(){return _Fable.log;},enumerable:false});}return tmpNewMeadowObject;}return createNew();};module.exports=new Meadow();},{"./Meadow-PackageFileLoader.js":58,"./Meadow-PackageObjectLoader.js":59,"./Meadow-RawQuery.js":60,"./Meadow-Schema.js":61,"./behaviors/Meadow-Count.js":63,"./behaviors/Meadow-Create.js":64,"./behaviors/Meadow-Delete.js":65,"./behaviors/Meadow-Read.js":66,"./behaviors/Meadow-Reads.js":67,"./behaviors/Meadow-Undelete.js":68,"./behaviors/Meadow-Update.js":69,"foxhound":23}],63:[function(require,module,exports){// ##### Part of the **[retold](https://stevenvelozo.github.io/retold/)** system
/**
* @license MIT
* @author <steven@velozo.com>
*/var libAsyncWaterfall=require('async/waterfall');/**
* Meadow Behavior - Count multiple records
*
* @function meadowBehaviorCount
*/var meadowBehaviorCount=function(pMeadow,pQuery,fCallBack){var tmpProfileStart=new Date();//for profiling query time
// Count the record(s) from the source
libAsyncWaterfall([// Step 1: Get the record countfrom the data source
function(fStageComplete){if(pMeadow.rawQueries.checkQuery('Count')){pQuery.parameters.queryOverride=pMeadow.rawQueries.getQuery('Count');}pMeadow.provider.Count(pQuery,function(){fStageComplete(pQuery.result.error,pQuery);});},// Step 2: Validate the resulting value
function(pQuery,fStageComplete){// Check if query time exceeded threshold in settings. Log if slow.
var tmpProfileTime=new Date().getTime()-tmpProfileStart.getTime();if(tmpProfileTime>(pMeadow.fable.settings['QueryThresholdWarnTime']||200)){pMeadow.logSlowQuery(tmpProfileTime,pQuery);}if(typeof pQuery.parameters.result.value!=='number'){// The return value is a number.. something is wrong.
return fStageComplete('Count did not return valid results.',pQuery,false);}fStageComplete(pQuery.result.error,pQuery,pQuery.result.value);}],function(pError,pQuery,pCount){if(pError){pMeadow.fable.log.warn('Error during the count waterfall',{Error:pError,Message:pError.message,Query:pQuery.query});}fCallBack(pError,pQuery,pCount);});return pMeadow;};module.exports=meadowBehaviorCount;},{"async/waterfall":17}],64:[function(require,module,exports){// ##### Part of the **[retold](https://stevenvelozo.github.io/retold/)** system
/**
* @license MIT
* @author <steven@velozo.com>
*/var libAsyncWaterfall=require('async/waterfall');/**
* Meadow Behavior - Create
*
* @function meadowBehaviorCreate
*/var meadowBehaviorCreate=function(pMeadow,pQuery,fCallBack){libAsyncWaterfall([// Step 0: If GUID is specified, make sure the record does not already exist
function(fStageComplete){// Make sure the user submitted a record
if(!pQuery.query.records){return fStageComplete('No record submitted',pQuery,false);}if(pQuery.query.records[0][pMeadow.defaultGUIdentifier]&&pQuery.query.records[0][pMeadow.defaultGUIdentifier].length>=5)//see Foxhound mysql build create query: GUID min len must be 5
{var tmpGUIDRecord=pQuery.query.records[0][pMeadow.defaultGUIdentifier];var tmpQueryRead=pQuery.clone().addFilter(pMeadow.defaultGUIdentifier,tmpGUIDRecord).setDisableDeleteTracking(true);//this check is to guarantee uniqueness across the entire table, so always do this
if(pMeadow.rawQueries.checkQuery('Read')){tmpQueryRead.parameters.queryOverride=pMeadow.rawQueries.getQuery('Read');}pMeadow.provider.Read(tmpQueryRead,function(){var tmpError=tmpQueryRead.error;if(!tmpError&&tmpQueryRead.result.value.length>0){tmpError='Record with GUID '+tmpGUIDRecord+' already exists!';}if(tmpError){return fStageComplete(tmpError,tmpQueryRead,tmpQueryRead,null);}else{return fStageComplete();}});}else{return fStageComplete();}},// Step 1: Create the record in the data source
function(fStageComplete){if(!pQuery.query.IDUser){// The user ID is not already set, set it magically.
if(typeof pQuery.userID==='number'&&pQuery.userID%1===0&&pQuery.userID>=0){pQuery.query.IDUser=pQuery.userID;}else{pQuery.query.IDUser=pMeadow.userIdentifier;}}// Merge in the default record with the passed-in record for completeness
pQuery.query.records[0]=pMeadow.fable.Utility.extend({},pMeadow.schemaFull.defaultObject,pQuery.query.records[0]);// Create override is too complex ... punting for now
// if (pMeadow.rawQueries.checkQuery('Create'))
//	pQuery.parameters.queryOverride = pMeadow.rawQueries.getQuery('Create');
pMeadow.provider.Create(pQuery,function(){fStageComplete(pQuery.result.error,pQuery);});},// Step 2: Setup a read operation
function(pQuery,fStageComplete){// The value is not set (it should be set to the value for our DefaultIdentifier)
if(pQuery.parameters.result.value===false){return fStageComplete('Creation failed',pQuery,false);}var tmpIDRecord=pQuery.result.value;fStageComplete(pQuery.result.error,pQuery,tmpIDRecord);},// Step 3: Read the record
function(pQuery,pIDRecord,fStageComplete){var tmpQueryRead=pQuery.clone().addFilter(pMeadow.defaultIdentifier,pIDRecord).setDisableDeleteTracking(pQuery.parameters.query.disableDeleteTracking);//if delete tracking is disabled, we need to disable it on this Read operation
if(pMeadow.rawQueries.checkQuery('Read')){tmpQueryRead.parameters.queryOverride=pMeadow.rawQueries.getQuery('Read');}pMeadow.provider.Read(tmpQueryRead,function(){fStageComplete(tmpQueryRead.result.error,pQuery,tmpQueryRead);});},// Step 4: Marshal the record into a POJO
function(pQuery,pQueryRead,fStageComplete){// Ensure there is not at least one record returned
if(pQueryRead.parameters.result.value.length<1){return fStageComplete('No record found after create.',pQuery,pQueryRead,false);}var tmpRecord=pMeadow.marshalRecordFromSourceToObject(pQueryRead.result.value[0]);fStageComplete(pQuery.result.error,pQuery,pQueryRead,tmpRecord);}],function(pError,pQuery,pQueryRead,pRecord){if(pError){pMeadow.fable.log.warn('Error during the create waterfall',{Error:pError,Message:pError.message,Query:pQuery.query,Stack:pError.stack});}fCallBack(pError,pQuery,pQueryRead,pRecord);});return pMeadow;};module.exports=meadowBehaviorCreate;},{"async/waterfall":17}],65:[function(require,module,exports){// ##### Part of the **[retold](https://stevenvelozo.github.io/retold/)** system
/**
* @license MIT
* @author <steven@velozo.com>
*/var libAsyncWaterfall=require('async/waterfall');/**
* Meadow Behavior - Delete a single record
*
* @function meadowBehaviorDelete
*/var meadowBehaviorDelete=function(pMeadow,pQuery,fCallBack){// TODO: Check if this recordset has implicit delete tracking, branch in this module.
// Delete the record(s) from the source
libAsyncWaterfall([// Step 1: Delete the record
function(fStageComplete){if(pMeadow.rawQueries.checkQuery('Delete')){pQuery.parameters.queryOverride=pMeadow.rawQueries.getQuery('Delete');}pMeadow.provider.Delete(pQuery,function(){fStageComplete(pQuery.result.error,pQuery,pQuery.result.value);});}],function(pError,pQuery,pRecord){if(pError){pMeadow.fable.log.warn('Error during the delete waterfall',{Error:pError,Message:pError.message,Query:pQuery.query});}fCallBack(pError,pQuery,pRecord);});return pMeadow;};module.exports=meadowBehaviorDelete;},{"async/waterfall":17}],66:[function(require,module,exports){// ##### Part of the **[retold](https://stevenvelozo.github.io/retold/)** system
/**
* @license MIT
* @author <steven@velozo.com>
*/var libAsyncWaterfall=require('async/waterfall');/**
* Meadow Behavior - Read a single record
*
* @function meadowBehaviorRead
*/var meadowBehaviorRead=function(pMeadow,pQuery,fCallBack){// Read the record from the source
libAsyncWaterfall([// Step 1: Get the record from the data source
function(fStageComplete){// If there is a Read override query, use it!
if(pMeadow.rawQueries.checkQuery('Read')){pQuery.parameters.queryOverride=pMeadow.rawQueries.getQuery('Read');}pMeadow.provider.Read(pQuery,function(){fStageComplete(pQuery.result.error,pQuery);});},// Step 2: Marshal the record into a POJO
function(pQuery,fStageComplete){// Check that a record was returned
if(pQuery.parameters.result.value.length<1){return fStageComplete(undefined,pQuery,false);}var tmpRecord=pMeadow.marshalRecordFromSourceToObject(pQuery.result.value[0]);fStageComplete(pQuery.result.error,pQuery,tmpRecord);}],(pError,pQuery,pRecord)=>{console.log('b');if(pError){pMeadow.fable.log.warn('Error during the read waterfall',{Error:pError,Message:pError.message,Query:pQuery.query});}fCallBack(pError,pQuery,pRecord);});return pMeadow;};module.exports=meadowBehaviorRead;},{"async/waterfall":17}],67:[function(require,module,exports){// ##### Part of the **[retold](https://stevenvelozo.github.io/retold/)** system
/**
* @license MIT
* @author <steven@velozo.com>
*/var libAsyncWaterfall=require('async/waterfall');var libAsyncEach=require('async/eachSeries');/**
* Meadow Behavior - Read multiple records
*
* @function meadowBehaviorReads
*/var meadowBehaviorReads=function(pMeadow,pQuery,fCallBack){var tmpProfileStart=new Date();//for profiling query time
// Read the record(s) from the source
libAsyncWaterfall([// Step 1: Get the record(s) from the data source
function(fStageComplete){if(pMeadow.rawQueries.checkQuery('Reads')){pQuery.parameters.queryOverride=pMeadow.rawQueries.getQuery('Reads');}pMeadow.provider.Read(pQuery,function(){fStageComplete(pQuery.result.error,pQuery);});},// Step 2: Marshal all the records into an array of POJOs
function(pQuery,fStageComplete){// Check if query time exceeded threshold in settings. Log if slow.
var tmpProfileTime=new Date().getTime()-tmpProfileStart.getTime();if(tmpProfileTime>(pMeadow.fable.settings['QueryThresholdWarnTime']||200)){pMeadow.logSlowQuery(tmpProfileTime,pQuery);}var tmpRecords=[];libAsyncEach(pQuery.parameters.result.value,function(pRow,pQueueCallback){tmpRecords.push(pMeadow.marshalRecordFromSourceToObject(pRow));pQueueCallback();},function(){// After we've pushed every record into the array in order, complete the waterfall
fStageComplete(pQuery.result.error,pQuery,tmpRecords);});}],function(pError,pQuery,pRecords){if(pError){pMeadow.fable.log.warn('Error during the read multiple waterfall',{Error:pError,Message:pError.message,Query:pQuery.query});}fCallBack(pError,pQuery,pRecords);});return pMeadow;};module.exports=meadowBehaviorReads;},{"async/eachSeries":3,"async/waterfall":17}],68:[function(require,module,exports){// ##### Part of the **[retold](https://stevenvelozo.github.io/retold/)** system
/**
* @license MIT
* @author <steven@velozo.com>
*/var libAsyncWaterfall=require('async/waterfall');/**
* Meadow Behavior - Undelete a single record
*
* @function meadowBehaviorUndelete
*/var meadowBehaviorUndelete=function(pMeadow,pQuery,fCallBack){// TODO: Check if this recordset has implicit delete tracking, branch in this module?
// Undelete the record(s) if they were deleted with a bit
libAsyncWaterfall([// Step 1: Undelete the record
function(fStageComplete){if(pMeadow.rawQueries.checkQuery('Undelete')){pQuery.parameters.queryOverride=pMeadow.rawQueries.getQuery('Undelete');}pMeadow.provider.Undelete(pQuery,function(){fStageComplete(pQuery.result.error,pQuery,pQuery.result.value);});}],function(pError,pQuery,pRecord){if(pError){pMeadow.fable.log.warn('Error during the undelete waterfall',{Error:pError,Message:pError.message,Query:pQuery.query});}fCallBack(pError,pQuery,pRecord);});return pMeadow;};module.exports=meadowBehaviorUndelete;},{"async/waterfall":17}],69:[function(require,module,exports){// ##### Part of the **[retold](https://stevenvelozo.github.io/retold/)** system
/**
* @license MIT
* @author <steven@velozo.com>
*/var libAsyncWaterfall=require('async/waterfall');/**
* Meadow Behavior - Update a single record
*
* @function meadowBehaviorUpdate
*/var meadowBehaviorUpdate=function(pMeadow,pQuery,fCallBack){// Update the record(s) from the source
libAsyncWaterfall([// Step 1: Update the record
function(fStageComplete){if(!pQuery.query.IDUser){// The user ID is not already set, set it magically.
if(typeof pQuery.userID==='number'&&pQuery.userID%1===0&&pQuery.userID>=0){pQuery.query.IDUser=pQuery.userID;}else{pQuery.query.IDUser=pMeadow.userIdentifier;}}// Make sure the developer submitted a record
if(!pQuery.query.records){return fStageComplete('No record submitted',pQuery,false);}// Make sure there is a default identifier
if(!pQuery.query.records[0].hasOwnProperty(pMeadow.defaultIdentifier)){return fStageComplete('Automated update missing default identifier',pQuery,false);}// Now see if there is anything in the schema that is an Update action that isn't in this query
for(var i=0;i<pMeadow.schema.length;i++){switch(pMeadow.schema[i].Type){case'UpdateIDUser':case'UpdateDate':pQuery.query.records[0][pMeadow.schema[i].Column]=false;break;}}// Set the update filter
pQuery.addFilter(pMeadow.defaultIdentifier,pQuery.query.records[0][pMeadow.defaultIdentifier]);// Sanity check on update to make sure we don't update EVERY record.
if(pQuery.parameters.filter===false||pQuery.parameters.filter.length<1){return fStageComplete('Automated update missing filters... aborting!',pQuery,false);}// Updates are too complex to override for now, punting on this feature.
//if (pMeadow.rawQueries.checkQuery('Update'))
//	pQuery.parameters.queryOverride = pMeadow.rawQueries.getQuery('Update');
pMeadow.provider.Update(pQuery,function(){fStageComplete(pQuery.result.error,pQuery);});},// Step 2: Check that the record was updated
function(pQuery,fStageComplete){if(typeof pQuery.parameters.result.value!=='object'){// The value is not an object
return fStageComplete('No record updated.',pQuery,false);}fStageComplete(pQuery.result.error,pQuery);},// Step 3: Read the record
function(pQuery,fStageComplete){// We can clone the query, since it has the criteria for the update in it already (filters survive a clone)
var tmpQueryRead=pQuery.clone();// Make sure to load the record with the custom query if necessary.
if(pMeadow.rawQueries.checkQuery('Read')){tmpQueryRead.parameters.queryOverride=pMeadow.rawQueries.getQuery('Read');}pMeadow.provider.Read(tmpQueryRead,function(){fStageComplete(tmpQueryRead.result.error,pQuery,tmpQueryRead);});},// Step 4: Marshal the record into a POJO
function(pQuery,pQueryRead,fStageComplete){if(pQueryRead.result.value.length===0){//No record found to update
return fStageComplete('No record found to update!',pQueryRead.result,false);}var tmpRecord=pMeadow.marshalRecordFromSourceToObject(pQueryRead.result.value[0]);fStageComplete(pQuery.result.error,pQuery,pQueryRead,tmpRecord);}],function(pError,pQuery,pQueryRead,pRecord){if(pError){pMeadow.fable.log.warn('Error during Update waterfall',{Error:pError,Message:pError.message,Query:pQuery.query});}fCallBack(pError,pQuery,pQueryRead,pRecord);});return pMeadow;};module.exports=meadowBehaviorUpdate;},{"async/waterfall":17}]},{},[57])(57);});