var webC = {};
webC.compare=function(){var e,t,n,r,i,s,o,u,a,f,l,c,h,p,d,v,m;a=function(e){return e===">"};f=function(e){return e==="<"};c=function(e){return/^\s+$/.test(e)};l=function(e){return/^\s*<[^>]+>\s*$/.test(e)};h=function(e){return!l(e)};e=function(){function e(e,t,n){this.start_in_before=e;this.start_in_after=t;this.length=n;this.end_in_before=this.start_in_before+this.length-1;this.end_in_after=this.start_in_after+this.length-1}return e}();u=function(e){var t,n,r,i,s,o;r="char";n="";i=[];for(s=0,o=e.length;s<o;s++){t=e[s];switch(r){case"tag":if(a(t)){n+=">";i.push(n);n="";if(c(t)){r="whitespace"}else{r="char"}}else{n+=t}break;case"char":if(f(t)){if(n){i.push(n)}n="<";r="tag"}else if(/\s/.test(t)){if(n){i.push(n)}n=t;r="whitespace"}else if(/[_a-zA-Z0-9_\u0410-\u042F\u0430-\u044F\u0401\u0451\#@]+/i.test(t)){n+=t}else{if(n){i.push(n)}n=t}break;case"whitespace":if(f(t)){if(n){i.push(n)}n="<";r="tag"}else if(c(t)){n+=t}else{if(n){i.push(n)}n=t;r="char"}break;default:throw new Error("Unknown mode "+r)}}if(n){i.push(n)}return i};s=function(t,n,r,i,s,o,u){var a,f,l,c,h,p,d,v,m,g,y,b,w,E;f=i;a=o;l=0;m={};for(h=b=i;i<=s?b<s:b>s;h=i<=s?++b:--b){y={};d=t[h];p=r[d];for(w=0,E=p.length;w<E;w++){c=p[w];if(c<o){continue}if(c>=u){break}if(m[c-1]==null){m[c-1]=0}g=m[c-1]+1;y[c]=g;if(g>l){f=h-g+1;a=c-g+1;l=g}}m=y}if(l!==0){v=new e(f,a,l)}return v};d=function(e,t,n,r,i,o,u,a){var f;f=s(e,t,n,r,i,o,u);if(f!=null){if(r<f.start_in_before&&o<f.start_in_after){d(e,t,n,r,f.start_in_before,o,f.start_in_after,a)}a.push(f);if(f.end_in_before<=i&&f.end_in_after<=u){d(e,t,n,f.end_in_before+1,i,f.end_in_after+1,u,a)}}return a};r=function(e){var t,n,r,i,s,o;if(e.find_these==null){throw new Error("params must have find_these key")}if(e.in_these==null){throw new Error("params must have in_these key")}n={};o=e.find_these;for(i=0,s=o.length;i<s;i++){r=o[i];n[r]=[];t=e.in_these.indexOf(r);while(t!==-1){n[r].push(t);t=e.in_these.indexOf(r,t+1)}}return n};o=function(e,t){var n,i;i=[];n=r({find_these:e,in_these:t});return d(e,t,n,0,e.length,0,t.length,i)};t=function(t,n){var r,i,s,u,a,f,l,c,h,p,d,v,m,g,y,b,w,E;if(t==null){throw new Error("before_tokens?")}if(n==null){throw new Error("after_tokens?")}m=v=0;d=[];r={"false,false":"replace","true,false":"insert","false,true":"delete","true,true":"none"};h=o(t,n);h.push(new e(t.length,n.length,0));for(s=y=0,w=h.length;y<w;s=++y){f=h[s];c=m===f.start_in_before;l=v===f.start_in_after;i=r[[c,l].toString()];if(i!=="none"){d.push({action:i,start_in_before:m,end_in_before:i!=="insert"?f.start_in_before-1:void 0,start_in_after:v,end_in_after:i!=="delete"?f.start_in_after-1:void 0})}if(f.length!==0){d.push({action:"equal",start_in_before:f.start_in_before,end_in_before:f.end_in_before,start_in_after:f.start_in_after,end_in_after:f.end_in_after})}m=f.end_in_before+1;v=f.end_in_after+1}g=[];a={action:"none"};u=function(e){if(e.action!=="equal"){return false}if(e.end_in_before-e.start_in_before!==0){return false}return/^\s$/.test(t.slice(e.start_in_before,e.end_in_before+1||9e9))};for(b=0,E=d.length;b<E;b++){p=d[b];if(u(p)&&a.action==="replace"||p.action==="replace"&&a.action==="replace"){a.end_in_before=p.end_in_before;a.end_in_after=p.end_in_after}else{g.push(p);a=p}}return g};n=function(e,t,n){var r,i,s,o,u,a;t=t.slice(e,t.length+1||9e9);s=void 0;for(i=u=0,a=t.length;u<a;i=++u){o=t[i];r=n(o);if(r===true){s=i}if(r===false){break}}if(s!=null){return t.slice(0,s+1||9e9)}return[]};m=function(e,t){var r,i,s,o,u;o="";s=0;r=t.length;while(true){if(s>=r){break}i=n(s,t,h);s+=i.length;if(i.length!==0){o+=" <"+e+">"+i.join("")+"</"+e+"> "}if(s>=r){break}u=n(s,t,l);s+=u.length;o+=u.join("")}return o};p={equal:function(e,t,n){return t.slice(e.start_in_before,e.end_in_before+1||9e9).join("")},insert:function(e,t,n){var r;r=n.slice(e.start_in_after,e.end_in_after+1||9e9);if(r.length==0)return"";if(r[0].replace(/^\s+|\s+$/g,"")==""){r.shift()}if(r[r.length-1]==" "){r.pop()}if(r[0]!==" "){return m("ins",r)}else{return""}},"delete":function(e,t,n){var r;r=t.slice(e.start_in_before,e.end_in_before+1||9e9);if(r.length==0)return"";if(r[0].replace(/^\s+|\s+$/g,"")==""){r.shift()}if(r[r.length-1]==" "){r.pop()}if(r[0]!==" "){return m("del",r)}else{return""}}};p.replace=function(e,t,n){return p["delete"](e,t,n)+p.insert(e,t,n)};v=function(e,t,n){var r,i,s,o;i="";for(s=0,o=n.length;s<o;s++){r=n[s];i+=p[r.action](r,e,t)}return i};return{alert:function(e){alert("hrere")},diff:function(e,n){var r;if(e===n){return e}e=u(e);n=u(n);r=t(e,n);return v(e,n,r)}};i.html_to_tokens=u;i.find_matching_blocks=o;o.find_match=s;o.create_index=r;i.calculate_operations=t;i.render_operations=v}();

/* jQuery Storage API Plugin 1.5.0 https://github.com/julien-maurel/jQuery-Storage-API */
!function(e){function t(t){var r,n,i,o=arguments.length,s=window[t],a=arguments,u=a[1];if(2>o)throw Error("Minimum 2 arguments must be given");if(e.isArray(u)){n={};for(var g in u){r=u[g];try{n[r]=JSON.parse(s.getItem(r))}catch(m){n[r]=s.getItem(r)}}return n}if(2!=o){try{n=JSON.parse(s.getItem(u))}catch(m){throw new ReferenceError(u+" is not defined in this storage")}for(var g=2;o-1>g;g++)if(n=n[a[g]],void 0===n)throw new ReferenceError([].slice.call(a,1,g+1).join(".")+" is not defined in this storage");if(e.isArray(a[g])){i=n,n={};for(var f in a[g])n[a[g][f]]=i[a[g][f]];return n}return n[a[g]]}try{return JSON.parse(s.getItem(u))}catch(m){return s.getItem(u)}}function n(t){var r,n,i=arguments.length,o=window[t],s=arguments,a=s[1],u=s[2],g={};if(2>i||!e.isPlainObject(a)&&3>i)throw Error("Minimum 3 arguments must be given or second parameter must be an object");if(e.isPlainObject(a)){for(var m in a)r=a[m],e.isPlainObject(r)?o.setItem(m,JSON.stringify(r)):o.setItem(m,r);return a}if(3==i)return"object"==typeof u?o.setItem(a,JSON.stringify(u)):o.setItem(a,u),u;try{n=o.getItem(a),null!=n&&(g=JSON.parse(n))}catch(f){}n=g;for(var m=2;i-2>m;m++)r=s[m],n[r]&&e.isPlainObject(n[r])||(n[r]={}),n=n[r];return n[s[m]]=s[m+1],o.setItem(a,JSON.stringify(g)),g}function i(t){var r,n,i=arguments.length,o=window[t],s=arguments,a=s[1];if(2>i)throw Error("Minimum 2 arguments must be given");if(e.isArray(a)){for(var u in a)o.removeItem(a[u]);return!0}if(2==i)return o.removeItem(a),!0;try{r=n=JSON.parse(o.getItem(a))}catch(g){throw new ReferenceError(a+" is not defined in this storage")}for(var u=2;i-1>u;u++)if(n=n[s[u]],void 0===n)throw new ReferenceError([].slice.call(s,1,u).join(".")+" is not defined in this storage");if(e.isArray(s[u]))for(var m in s[u])delete n[s[u][m]];else delete n[s[u]];return o.setItem(a,JSON.stringify(r)),!0}function o(t,r){var n=u(t);for(var o in n)i(t,n[o]);if(r)for(var o in e.namespaceStorages)g(o)}function s(r){var n=arguments.length,i=arguments,o=(window[r],i[1]);if(1==n)return 0==u(r).length;if(e.isArray(o)){for(var a=0;a<o.length;a++)if(!s(r,o[a]))return!1;return!0}try{var g=t.apply(this,arguments);e.isArray(i[n-1])||(g={totest:g});for(var a in g)if(!(e.isPlainObject(g[a])&&e.isEmptyObject(g[a])||e.isArray(g[a])&&!g[a].length)&&g[a])return!1;return!0}catch(m){return!0}}function a(r){var n=arguments.length,i=arguments,o=(window[r],i[1]);if(2>n)throw Error("Minimum 2 arguments must be given");if(e.isArray(o)){for(var s=0;s<o.length;s++)if(!a(r,o[s]))return!1;return!0}try{var u=t.apply(this,arguments);e.isArray(i[n-1])||(u={totest:u});for(var s in u)if(void 0===u[s]||null===u[s])return!1;return!0}catch(g){return!1}}function u(r){var n=arguments.length,i=window[r],o=arguments,s=(o[1],[]),a={};if(a=n>1?t.apply(this,o):i,a._cookie)for(var u in e.cookie())""!=u&&s.push(u.replace(a._prefix,""));else for(var g in a)s.push(g);return s}function g(t){if(!t||"string"!=typeof t)throw Error("First parameter must be a string");window.localStorage.getItem(t)||window.localStorage.setItem(t,"{}"),window.sessionStorage.getItem(t)||window.sessionStorage.setItem(t,"{}");var r={localStorage:e.extend({},e.localStorage,{_ns:t}),sessionStorage:e.extend({},e.sessionStorage,{_ns:t})};return e.cookie&&(window.cookieStorage.getItem(t)||window.cookieStorage.setItem(t,"{}"),r.cookieStorage=e.extend({},e.cookieStorage,{_ns:t})),e.namespaceStorages[t]=r,r}var m="ls_",f="ss_",c={_type:"",_ns:"",_callMethod:function(e,t){var r=[this._type];return this._ns&&r.push(this._ns),[].push.apply(r,t),e.apply(this,r)},get:function(){return this._callMethod(t,arguments)},set:function(){var t=arguments.length,i=arguments,o=i[0];if(1>t||!e.isPlainObject(o)&&2>t)throw Error("Minimum 2 arguments must be given or first parameter must be an object");if(e.isPlainObject(o)&&this._ns){for(var s in o)n(this._type,this._ns,s,o[s]);return o}return r=this._callMethod(n,i),this._ns?r[o]:r},remove:function(){if(arguments.length<1)throw Error("Minimum 1 argument must be given");return this._callMethod(i,arguments)},removeAll:function(e){return this._ns?(n(this._type,this._ns,{}),!0):o(this._type,e)},isEmpty:function(){return this._callMethod(s,arguments)},isSet:function(){if(arguments.length<1)throw Error("Minimum 1 argument must be given");return this._callMethod(a,arguments)},keys:function(){return this._callMethod(u,arguments)}};if(e.cookie){window.name||(window.name=Math.floor(1e8*Math.random()));var l={_cookie:!0,_prefix:"",_expires:null,setItem:function(t,r){e.cookie(this._prefix+t,r,{expires:this._expires})},getItem:function(t){return e.cookie(this._prefix+t)},removeItem:function(t){return e.removeCookie(this._prefix+t)},clear:function(){for(var t in e.cookie())""!=t&&(!this._prefix&&-1===t.indexOf(m)&&-1===t.indexOf(f)||this._prefix&&0===t.indexOf(this._prefix))&&e.removeCookie(t)},setExpires:function(e){return this._expires=e,this}};window.localStorage||(window.localStorage=e.extend({},l,{_prefix:m,_expires:3650}),window.sessionStorage=e.extend({},l,{_prefix:f+window.name+"_"})),window.cookieStorage=e.extend({},l),e.cookieStorage=e.extend({},c,{_type:"cookieStorage",setExpires:function(e){return window.cookieStorage.setExpires(e),this}})}e.initNamespaceStorage=function(e){return g(e)},e.localStorage=e.extend({},c,{_type:"localStorage"}),e.sessionStorage=e.extend({},c,{_type:"sessionStorage"}),e.namespaceStorages={},e.removeAllStorages=function(t){e.localStorage.removeAll(t),e.sessionStorage.removeAll(t),e.cookieStorage&&e.cookieStorage.removeAll(t),t||(e.namespaceStorages={})}}($);
// jquery $.cookie
(function(e){if(typeof define==="function"&&define.amd){define(["jquery"],e)}else{e($)}})(function(e){function n(e){if(i.raw){return e}return decodeURIComponent(e.replace(t," "))}function r(e){if(e.indexOf('"')===0){e=e.slice(1,-1).replace(/\\"/g,'"').replace(/\\\\/g,"\\")}e=n(e);try{return i.json?JSON.parse(e):e}catch(t){}}var t=/\+/g;var i=e.cookie=function(t,s,o){if(s!==undefined){o=e.extend({},i.defaults,o);if(typeof o.expires==="number"){var u=o.expires,a=o.expires=new Date;a.setDate(a.getDate()+u)}s=i.json?JSON.stringify(s):String(s);return document.cookie=[i.raw?t:encodeURIComponent(t),"=",i.raw?s:encodeURIComponent(s),o.expires?"; expires="+o.expires.toUTCString():"",o.path?"; path="+o.path:"",o.domain?"; domain="+o.domain:"",o.secure?"; secure":""].join("")}var f=document.cookie.split("; ");var l=t?undefined:{};for(var c=0,h=f.length;c<h;c++){var p=f[c].split("=");var d=n(p.shift());var v=p.join("=");if(t&&t===d){l=r(v);break}if(!t){l[d]=r(v)}}return l};i.defaults={};e.removeCookie=function(t,n){if(e.cookie(t)!==undefined){e.cookie(t,"",e.extend({},n,{expires:-1}));return true}return false}});

//     Underscore.js 1.5.1
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.
!function(){var n=this,t=n._,r={},e=Array.prototype,u=Object.prototype,i=Function.prototype,a=e.push,o=e.slice,c=e.concat,l=u.toString,f=u.hasOwnProperty,s=e.forEach,p=e.map,v=e.reduce,h=e.reduceRight,d=e.filter,g=e.every,m=e.some,y=e.indexOf,b=e.lastIndexOf,x=Array.isArray,_=Object.keys,w=i.bind,j=function(n){return n instanceof j?n:this instanceof j?(this._wrapped=n,void 0):new j(n)};"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=j),exports._=j):n._=j,j.VERSION="1.5.1";var A=j.each=j.forEach=function(n,t,e){if(null!=n)if(s&&n.forEach===s)n.forEach(t,e);else if(n.length===+n.length){for(var u=0,i=n.length;i>u;u++)if(t.call(e,n[u],u,n)===r)return}else for(var a in n)if(j.has(n,a)&&t.call(e,n[a],a,n)===r)return};j.map=j.collect=function(n,t,r){var e=[];return null==n?e:p&&n.map===p?n.map(t,r):(A(n,function(n,u,i){e.push(t.call(r,n,u,i))}),e)};var E="Reduce of empty array with no initial value";j.reduce=j.foldl=j.inject=function(n,t,r,e){var u=arguments.length>2;if(null==n&&(n=[]),v&&n.reduce===v)return e&&(t=j.bind(t,e)),u?n.reduce(t,r):n.reduce(t);if(A(n,function(n,i,a){u?r=t.call(e,r,n,i,a):(r=n,u=!0)}),!u)throw new TypeError(E);return r},j.reduceRight=j.foldr=function(n,t,r,e){var u=arguments.length>2;if(null==n&&(n=[]),h&&n.reduceRight===h)return e&&(t=j.bind(t,e)),u?n.reduceRight(t,r):n.reduceRight(t);var i=n.length;if(i!==+i){var a=j.keys(n);i=a.length}if(A(n,function(o,c,l){c=a?a[--i]:--i,u?r=t.call(e,r,n[c],c,l):(r=n[c],u=!0)}),!u)throw new TypeError(E);return r},j.find=j.detect=function(n,t,r){var e;return O(n,function(n,u,i){return t.call(r,n,u,i)?(e=n,!0):void 0}),e},j.filter=j.select=function(n,t,r){var e=[];return null==n?e:d&&n.filter===d?n.filter(t,r):(A(n,function(n,u,i){t.call(r,n,u,i)&&e.push(n)}),e)},j.reject=function(n,t,r){return j.filter(n,function(n,e,u){return!t.call(r,n,e,u)},r)},j.every=j.all=function(n,t,e){t||(t=j.identity);var u=!0;return null==n?u:g&&n.every===g?n.every(t,e):(A(n,function(n,i,a){return(u=u&&t.call(e,n,i,a))?void 0:r}),!!u)};var O=j.some=j.any=function(n,t,e){t||(t=j.identity);var u=!1;return null==n?u:m&&n.some===m?n.some(t,e):(A(n,function(n,i,a){return u||(u=t.call(e,n,i,a))?r:void 0}),!!u)};j.contains=j.include=function(n,t){return null==n?!1:y&&n.indexOf===y?n.indexOf(t)!=-1:O(n,function(n){return n===t})},j.invoke=function(n,t){var r=o.call(arguments,2),e=j.isFunction(t);return j.map(n,function(n){return(e?t:n[t]).apply(n,r)})},j.pluck=function(n,t){return j.map(n,function(n){return n[t]})},j.where=function(n,t,r){return j.isEmpty(t)?r?void 0:[]:j[r?"find":"filter"](n,function(n){for(var r in t)if(t[r]!==n[r])return!1;return!0})},j.findWhere=function(n,t){return j.where(n,t,!0)},j.max=function(n,t,r){if(!t&&j.isArray(n)&&n[0]===+n[0]&&n.length<65535)return Math.max.apply(Math,n);if(!t&&j.isEmpty(n))return-1/0;var e={computed:-1/0,value:-1/0};return A(n,function(n,u,i){var a=t?t.call(r,n,u,i):n;a>e.computed&&(e={value:n,computed:a})}),e.value},j.min=function(n,t,r){if(!t&&j.isArray(n)&&n[0]===+n[0]&&n.length<65535)return Math.min.apply(Math,n);if(!t&&j.isEmpty(n))return 1/0;var e={computed:1/0,value:1/0};return A(n,function(n,u,i){var a=t?t.call(r,n,u,i):n;a<e.computed&&(e={value:n,computed:a})}),e.value},j.shuffle=function(n){var t,r=0,e=[];return A(n,function(n){t=j.random(r++),e[r-1]=e[t],e[t]=n}),e};var F=function(n){return j.isFunction(n)?n:function(t){return t[n]}};j.sortBy=function(n,t,r){var e=F(t);return j.pluck(j.map(n,function(n,t,u){return{value:n,index:t,criteria:e.call(r,n,t,u)}}).sort(function(n,t){var r=n.criteria,e=t.criteria;if(r!==e){if(r>e||r===void 0)return 1;if(e>r||e===void 0)return-1}return n.index<t.index?-1:1}),"value")};var k=function(n,t,r,e){var u={},i=F(null==t?j.identity:t);return A(n,function(t,a){var o=i.call(r,t,a,n);e(u,o,t)}),u};j.groupBy=function(n,t,r){return k(n,t,r,function(n,t,r){(j.has(n,t)?n[t]:n[t]=[]).push(r)})},j.countBy=function(n,t,r){return k(n,t,r,function(n,t){j.has(n,t)||(n[t]=0),n[t]++})},j.sortedIndex=function(n,t,r,e){r=null==r?j.identity:F(r);for(var u=r.call(e,t),i=0,a=n.length;a>i;){var o=i+a>>>1;r.call(e,n[o])<u?i=o+1:a=o}return i},j.toArray=function(n){return n?j.isArray(n)?o.call(n):n.length===+n.length?j.map(n,j.identity):j.values(n):[]},j.size=function(n){return null==n?0:n.length===+n.length?n.length:j.keys(n).length},j.first=j.head=j.take=function(n,t,r){return null==n?void 0:null==t||r?n[0]:o.call(n,0,t)},j.initial=function(n,t,r){return o.call(n,0,n.length-(null==t||r?1:t))},j.last=function(n,t,r){return null==n?void 0:null==t||r?n[n.length-1]:o.call(n,Math.max(n.length-t,0))},j.rest=j.tail=j.drop=function(n,t,r){return o.call(n,null==t||r?1:t)},j.compact=function(n){return j.filter(n,j.identity)};var R=function(n,t,r){return t&&j.every(n,j.isArray)?c.apply(r,n):(A(n,function(n){j.isArray(n)||j.isArguments(n)?t?a.apply(r,n):R(n,t,r):r.push(n)}),r)};j.flatten=function(n,t){return R(n,t,[])},j.without=function(n){return j.difference(n,o.call(arguments,1))},j.uniq=j.unique=function(n,t,r,e){j.isFunction(t)&&(e=r,r=t,t=!1);var u=r?j.map(n,r,e):n,i=[],a=[];return A(u,function(r,e){(t?e&&a[a.length-1]===r:j.contains(a,r))||(a.push(r),i.push(n[e]))}),i},j.union=function(){return j.uniq(j.flatten(arguments,!0))},j.intersection=function(n){var t=o.call(arguments,1);return j.filter(j.uniq(n),function(n){return j.every(t,function(t){return j.indexOf(t,n)>=0})})},j.difference=function(n){var t=c.apply(e,o.call(arguments,1));return j.filter(n,function(n){return!j.contains(t,n)})},j.zip=function(){for(var n=j.max(j.pluck(arguments,"length").concat(0)),t=new Array(n),r=0;n>r;r++)t[r]=j.pluck(arguments,""+r);return t},j.object=function(n,t){if(null==n)return{};for(var r={},e=0,u=n.length;u>e;e++)t?r[n[e]]=t[e]:r[n[e][0]]=n[e][1];return r},j.indexOf=function(n,t,r){if(null==n)return-1;var e=0,u=n.length;if(r){if("number"!=typeof r)return e=j.sortedIndex(n,t),n[e]===t?e:-1;e=0>r?Math.max(0,u+r):r}if(y&&n.indexOf===y)return n.indexOf(t,r);for(;u>e;e++)if(n[e]===t)return e;return-1},j.lastIndexOf=function(n,t,r){if(null==n)return-1;var e=null!=r;if(b&&n.lastIndexOf===b)return e?n.lastIndexOf(t,r):n.lastIndexOf(t);for(var u=e?r:n.length;u--;)if(n[u]===t)return u;return-1},j.range=function(n,t,r){arguments.length<=1&&(t=n||0,n=0),r=arguments[2]||1;for(var e=Math.max(Math.ceil((t-n)/r),0),u=0,i=new Array(e);e>u;)i[u++]=n,n+=r;return i};var M=function(){};j.bind=function(n,t){var r,e;if(w&&n.bind===w)return w.apply(n,o.call(arguments,1));if(!j.isFunction(n))throw new TypeError;return r=o.call(arguments,2),e=function(){if(!(this instanceof e))return n.apply(t,r.concat(o.call(arguments)));M.prototype=n.prototype;var u=new M;M.prototype=null;var i=n.apply(u,r.concat(o.call(arguments)));return Object(i)===i?i:u}},j.partial=function(n){var t=o.call(arguments,1);return function(){return n.apply(this,t.concat(o.call(arguments)))}},j.bindAll=function(n){var t=o.call(arguments,1);if(0===t.length)throw new Error("bindAll must be passed function names");return A(t,function(t){n[t]=j.bind(n[t],n)}),n},j.memoize=function(n,t){var r={};return t||(t=j.identity),function(){var e=t.apply(this,arguments);return j.has(r,e)?r[e]:r[e]=n.apply(this,arguments)}},j.delay=function(n,t){var r=o.call(arguments,2);return setTimeout(function(){return n.apply(null,r)},t)},j.defer=function(n){return j.delay.apply(j,[n,1].concat(o.call(arguments,1)))},j.throttle=function(n,t,r){var e,u,i,a=null,o=0;r||(r={});var c=function(){o=r.leading===!1?0:new Date,a=null,i=n.apply(e,u)};return function(){var l=new Date;o||r.leading!==!1||(o=l);var f=t-(l-o);return e=this,u=arguments,0>=f?(clearTimeout(a),a=null,o=l,i=n.apply(e,u)):a||r.trailing===!1||(a=setTimeout(c,f)),i}},j.debounce=function(n,t,r){var e,u=null;return function(){var i=this,a=arguments,o=function(){u=null,r||(e=n.apply(i,a))},c=r&&!u;return clearTimeout(u),u=setTimeout(o,t),c&&(e=n.apply(i,a)),e}},j.once=function(n){var t,r=!1;return function(){return r?t:(r=!0,t=n.apply(this,arguments),n=null,t)}},j.wrap=function(n,t){return function(){var r=[n];return a.apply(r,arguments),t.apply(this,r)}},j.compose=function(){var n=arguments;return function(){for(var t=arguments,r=n.length-1;r>=0;r--)t=[n[r].apply(this,t)];return t[0]}},j.after=function(n,t){return function(){return--n<1?t.apply(this,arguments):void 0}},j.keys=_||function(n){if(n!==Object(n))throw new TypeError("Invalid object");var t=[];for(var r in n)j.has(n,r)&&t.push(r);return t},j.values=function(n){var t=[];for(var r in n)j.has(n,r)&&t.push(n[r]);return t},j.pairs=function(n){var t=[];for(var r in n)j.has(n,r)&&t.push([r,n[r]]);return t},j.invert=function(n){var t={};for(var r in n)j.has(n,r)&&(t[n[r]]=r);return t},j.functions=j.methods=function(n){var t=[];for(var r in n)j.isFunction(n[r])&&t.push(r);return t.sort()},j.extend=function(n){return A(o.call(arguments,1),function(t){if(t)for(var r in t)n[r]=t[r]}),n},j.pick=function(n){var t={},r=c.apply(e,o.call(arguments,1));return A(r,function(r){r in n&&(t[r]=n[r])}),t},j.omit=function(n){var t={},r=c.apply(e,o.call(arguments,1));for(var u in n)j.contains(r,u)||(t[u]=n[u]);return t},j.defaults=function(n){return A(o.call(arguments,1),function(t){if(t)for(var r in t)n[r]===void 0&&(n[r]=t[r])}),n},j.clone=function(n){return j.isObject(n)?j.isArray(n)?n.slice():j.extend({},n):n},j.tap=function(n,t){return t(n),n};var S=function(n,t,r,e){if(n===t)return 0!==n||1/n==1/t;if(null==n||null==t)return n===t;n instanceof j&&(n=n._wrapped),t instanceof j&&(t=t._wrapped);var u=l.call(n);if(u!=l.call(t))return!1;switch(u){case"[object String]":return n==String(t);case"[object Number]":return n!=+n?t!=+t:0==n?1/n==1/t:n==+t;case"[object Date]":case"[object Boolean]":return+n==+t;case"[object RegExp]":return n.source==t.source&&n.global==t.global&&n.multiline==t.multiline&&n.ignoreCase==t.ignoreCase}if("object"!=typeof n||"object"!=typeof t)return!1;for(var i=r.length;i--;)if(r[i]==n)return e[i]==t;var a=n.constructor,o=t.constructor;if(a!==o&&!(j.isFunction(a)&&a instanceof a&&j.isFunction(o)&&o instanceof o))return!1;r.push(n),e.push(t);var c=0,f=!0;if("[object Array]"==u){if(c=n.length,f=c==t.length)for(;c--&&(f=S(n[c],t[c],r,e)););}else{for(var s in n)if(j.has(n,s)&&(c++,!(f=j.has(t,s)&&S(n[s],t[s],r,e))))break;if(f){for(s in t)if(j.has(t,s)&&!c--)break;f=!c}}return r.pop(),e.pop(),f};j.isEqual=function(n,t){return S(n,t,[],[])},j.isEmpty=function(n){if(null==n)return!0;if(j.isArray(n)||j.isString(n))return 0===n.length;for(var t in n)if(j.has(n,t))return!1;return!0},j.isElement=function(n){return!(!n||1!==n.nodeType)},j.isArray=x||function(n){return"[object Array]"==l.call(n)},j.isObject=function(n){return n===Object(n)},A(["Arguments","Function","String","Number","Date","RegExp"],function(n){j["is"+n]=function(t){return l.call(t)=="[object "+n+"]"}}),j.isArguments(arguments)||(j.isArguments=function(n){return!(!n||!j.has(n,"callee"))}),"function"!=typeof/./&&(j.isFunction=function(n){return"function"==typeof n}),j.isFinite=function(n){return isFinite(n)&&!isNaN(parseFloat(n))},j.isNaN=function(n){return j.isNumber(n)&&n!=+n},j.isBoolean=function(n){return n===!0||n===!1||"[object Boolean]"==l.call(n)},j.isNull=function(n){return null===n},j.isUndefined=function(n){return n===void 0},j.has=function(n,t){return f.call(n,t)},j.noConflict=function(){return n._=t,this},j.identity=function(n){return n},j.times=function(n,t,r){for(var e=Array(Math.max(0,n)),u=0;n>u;u++)e[u]=t.call(r,u);return e},j.random=function(n,t){return null==t&&(t=n,n=0),n+Math.floor(Math.random()*(t-n+1))};var I={escape:{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","/":"&#x2F;"}};I.unescape=j.invert(I.escape);var T={escape:new RegExp("["+j.keys(I.escape).join("")+"]","g"),unescape:new RegExp("("+j.keys(I.unescape).join("|")+")","g")};j.each(["escape","unescape"],function(n){j[n]=function(t){return null==t?"":(""+t).replace(T[n],function(t){return I[n][t]})}}),j.result=function(n,t){if(null==n)return void 0;var r=n[t];return j.isFunction(r)?r.call(n):r},j.mixin=function(n){A(j.functions(n),function(t){var r=j[t]=n[t];j.prototype[t]=function(){var n=[this._wrapped];return a.apply(n,arguments),z.call(this,r.apply(j,n))}})};var N=0;j.uniqueId=function(n){var t=++N+"";return n?n+t:t},j.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var q=/(.)^/,B={"'":"'","\\":"\\","\r":"r","\n":"n"," ":"t","\u2028":"u2028","\u2029":"u2029"},D=/\\|'|\r|\n|\t|\u2028|\u2029/g;j.template=function(n,t,r){var e;r=j.defaults({},r,j.templateSettings);var u=new RegExp([(r.escape||q).source,(r.interpolate||q).source,(r.evaluate||q).source].join("|")+"|$","g"),i=0,a="__p+='";n.replace(u,function(t,r,e,u,o){return a+=n.slice(i,o).replace(D,function(n){return"\\"+B[n]}),r&&(a+="'+\n((__t=("+r+"))==null?'':_.escape(__t))+\n'"),e&&(a+="'+\n((__t=("+e+"))==null?'':__t)+\n'"),u&&(a+="';\n"+u+"\n__p+='"),i=o+t.length,t}),a+="';\n",r.variable||(a="with(obj||{}){\n"+a+"}\n"),a="var __t,__p='',__j=Array.prototype.join,"+"print=function(){__p+=__j.call(arguments,'');};\n"+a+"return __p;\n";try{e=new Function(r.variable||"obj","_",a)}catch(o){throw o.source=a,o}if(t)return e(t,j);var c=function(n){return e.call(this,n,j)};return c.source="function("+(r.variable||"obj")+"){\n"+a+"}",c},j.chain=function(n){return j(n).chain()};var z=function(n){return this._chain?j(n).chain():n};j.mixin(j),A(["pop","push","reverse","shift","sort","splice","unshift"],function(n){var t=e[n];j.prototype[n]=function(){var r=this._wrapped;return t.apply(r,arguments),"shift"!=n&&"splice"!=n||0!==r.length||delete r[0],z.call(this,r)}}),A(["concat","join","slice"],function(n){var t=e[n];j.prototype[n]=function(){return z.call(this,t.apply(this._wrapped,arguments))}}),j.extend(j.prototype,{chain:function(){return this._chain=!0,this},value:function(){return this._wrapped}})}.call(this);


(function(a) {  

    // static constructs
    a.tools = a.tools || {version: '@VERSION'};
    
    var tool;

  
    tool = a.tools.expose = {
        
        conf: { 
            maskId: 'wcexposeMask',
            loadSpeed: 'slow',
            closeSpeed: 'fast',
            closeOnClick: true,
            closeOnEsc: true,
            
            // css settings
            zIndex: 9998,
            opacity: .3,
            startOpacity: 0,
            color: '#000',
            
            // callbacks
            onLoad: null,
            onClose: null
        }
    };

    /* one of the greatest headaches in the tool. finally made it */
    function viewport() {
                
        // the horror case
        if (/msie/.test(navigator.userAgent.toLowerCase())) {
            
            // if there are no scrollbars then use window.height
            var d = $(document).height(), w = $(window).height();
            
            return [
                window.innerWidth ||                            // ie7+
                document.documentElement.clientWidth ||     // ie6  
                document.body.clientWidth,                  // ie6 quirks mode
                d - w < 20 ? w : d
            ];
        } 
        
        // other well behaving browsers
        return [$(document).width(), $(document).height()]; 
    } 
    
    function call(fn) {
        if (fn) { return fn.call(a.mask); }
    }
    
    var mask, masks, maskL, maskT, maskR, maskB, outlines, outlineL, outlineT, outlineR, outlineB, outlineRS, outlineBS, outlineLS, outlineTS, exposed, loaded, config, overlayIndex, element;       
   
    a.mask = {
        
        load: function(conf, els) {
            
            // already loaded ?
            if (loaded) { return this; }            
            
            // configuration
            if (typeof conf == 'string') {
                conf = {color: conf};   
            }
            
            // use latest config
            conf = conf || config;
            
            config = conf = a.extend(a.extend({}, tool.conf), conf);

            // get the mask
            mask = $("#" + conf.maskId);
            maskL = $("#" + conf.maskId + 'L');
            maskT = $("#" + conf.maskId + 'T');
            maskR = $("#" + conf.maskId + 'R');
            maskB = $("#" + conf.maskId + 'B');

            outlineL = $("#" + conf.maskId + 'OL');
            outlineR = $("#" + conf.maskId + 'OT');
            outlineT = $("#" + conf.maskId + 'OR');
            outlineB = $("#" + conf.maskId + 'OB');
            outlineRS = $("#" + conf.maskId + 'ORS');
            outlineBS = $("#" + conf.maskId + 'OBS');
            outlineTS = $("#" + conf.maskId + 'OTS');
            outlineLS = $("#" + conf.maskId + 'OLS');

            // or create it
            if (!mask.length) {
                mask = $('<div class="wcemasks"/>').attr("id", conf.maskId);
                $("body").append(mask);
            }

            if (!maskL.length) {
                maskL = $('<div class="wcemasks"/>').attr("id", conf.maskId + 'L');
                $("body").append(maskL);
            }

            if (!maskT.length) {
                maskT = $('<div class="wcemasks"/>').attr("id", conf.maskId + 'T');
                $("body").append(maskT);
            }

            if (!maskR.length) {
                maskR = $('<div class="wcemasks"/>').attr("id", conf.maskId + 'R');
                $("body").append(maskR);
            }


            if (!maskB.length) {
                maskB = $('<div class="wcemasks"/>').attr("id", conf.maskId + 'B');
                $("body").append(maskB);
            }
            
            if (!outlineL.length) {
                outlineL = $('<div class="wceoutline"/>').attr("id", conf.maskId + 'OL');
                $("body").append(outlineL);
            }

            if (!outlineR.length) {
                outlineR = $('<div class="wceoutline"/>').attr("id", conf.maskId + 'OR');
                $("body").append(outlineR);
            }

            if (!outlineT.length) {
                outlineT = $('<div class="wceoutline"/>').attr("id", conf.maskId + 'OT');
                $("body").append(outlineT);
            }

            if (!outlineB.length) {
                outlineB = $('<div class="wceoutline"/>').attr("id", conf.maskId + 'OB');
                $("body").append(outlineB);
            }

            if (!outlineTS.length) {
                outlineTS = $('<div class="wceoutline"/>').attr("id", conf.maskId + 'OTS');
                $("body").append(outlineTS);
            }

            if (!outlineLS.length) {
                outlineLS = $('<div class="wceoutline"/>').attr("id", conf.maskId + 'OLS');
                $("body").append(outlineLS);
            }

            if (!outlineBS.length) {
                outlineBS = $('<div class="wceoutline"/>').attr("id", conf.maskId + 'OBS');
                $("body").append(outlineBS);
            }

            if (!outlineRS.length) {
                outlineRS = $('<div class="wceoutline"/>').attr("id", conf.maskId + 'ORS');
                $("body").append(outlineRS);
            }

// set position and dimensions          
            var size = viewport();

            $('.wcemasks, .wceoutline').css({position:'absolute', top: 0, left: 0, width: 0, height: 0, display: 'none', backgroundColor: conf.color,  opacity: conf.startOpacity, zIndex: conf.zIndex});
            
            masks = $('.wcemasks');
            outlines = $('.wceoutline').css({'backgroundColor':'#FFF','opacity':'1','width':'2','height':'2'});
            
            if (conf.color) {
                mask.css("backgroundColor", conf.color);    
            }           
            
            // onBeforeLoad
            if (call(conf.onBeforeLoad) === false) {
                return this;
            }
            
            // esc button
            if (conf.closeOnEsc) {                      
                $(document).on("keydown.mask", function(e) {                            
                    if (e.keyCode == 27) {
                        a.mask.close(e);
                    } else if (e.keyCode == 13) {
                       a.mask.fit(); 
                    } else {
                       a.mask.fit(); 
                    }    
                });         
            }
            
            // mask click closes

            if (hasTouch) {
            tappable('.wcemasks', {
                onTap: function(e, target){
                    // e.target works too
                       a.mask.close(e); 
                    }
            });

            } else {
            $('body').on("click", ".wcemasks", function(e)  {
                    a.mask.close(e);        
            });                 
  
            }
            
            // resize mask when window is resized
            $(window).on("resize.mask", function() {
                a.mask.fit();
            });

            $(window).on("orientationchange", function() {
                        setTimeout(function(){
                        a.mask.fit();
                    }, 300);
            });
            
            // exposed elements



            if (els && els.length) {
                

                overlayIndex = els.eq(0).css("zIndex");

                // make sure element is positioned absolutely or relatively
                a.each(els, function() {
                    var el = $(this);
                    if (!/relative|absolute|fixed/i.test(el.css("position"))) {
                        el.css("position", "relative");     
                    }                   

                    var size = viewport(); 
                    var box = webC.helper.getElementBox(el[0]);

                    element = el[0];
                                   
                    var top = box.top;
                    var left = box.left;
                    var height = box.height;
                    var width = box.width;
                    var spaceTB = 5; // space around element box
                    var spaceLR = 5; // space around element box
                    var shadow = 3; // shadow size around element box

                    // dimout
                    maskL.css({           
                    opacity: conf.opacity,   
                    top: top - spaceTB,
                    width: left - spaceLR,
                    height: height + spaceLR + spaceLR
                    });
             
                    maskT.css({   
                    opacity: conf.opacity,   
                    width: size[0] - spaceLR,
                    height: top - spaceTB
                    });

                    maskR.css({   
                    opacity: conf.opacity,   
                    top: top  - spaceTB,                    
                    left: left + width + spaceLR, 
                    width: size[0] - left - width - spaceLR - spaceLR,
                    height: height + spaceLR + spaceLR
                    });

                    maskB.css({   
                    opacity: conf.opacity,   
                    top: top + height + spaceTB, 
                    width: size[0] - spaceLR,
                    height: size[1] - height - top - spaceTB
                    });

                    // outlines
                    outlineL.css({   
                    left: left - spaceLR,                  
                    top: top - spaceTB,
                    height: height + spaceLR + spaceLR
                    });
             
                    outlineT.css({   
                    left: left - spaceLR,                  
                    top: top - spaceTB,
                    width: width + spaceLR + spaceLR
                    });

                    outlineR.css({   
                    top: top  - spaceTB,                    
                    left: left + width + spaceLR, 
                    height: height + spaceLR + spaceLR + 2
                    });

                    outlineB.css({   
                    left: left - spaceLR,  
                    top: top + height + spaceTB, 
                    width: width + spaceLR + spaceLR
                    });
                    // outline shadow
                    outlineBS.css({
                    backgroundColor: '#000',
                    opacity: .4,   
                    height: shadow,
                    left: left - spaceLR,  
                    top: top + height + spaceTB + 2, 
                    width: width + spaceLR + spaceLR + 2
                    });

                    outlineRS.css({
                    borderTopRightRadius: 5, 
                    borderBottomRightRadius: 5,     
                    backgroundColor: '#000',
                    opacity: .4,
                    width: shadow,
                    top: top  - spaceTB - shadow,                    
                    left: left + width + spaceLR + 2, 
                    height: height + spaceTB + spaceTB + 2 + shadow + shadow
                    });

                    outlineTS.css({
                    backgroundColor: '#000',
                    opacity: .4,   
                    height: shadow,
                    left: left - spaceLR,                  
                    top: top - spaceTB - shadow,
                    width: width + spaceLR + spaceLR + 2
                    });


                    outlineLS.css({
                    borderTopLeftRadius: 5, 
                    borderBottomLeftRadius: 5,     
                    backgroundColor: '#000',
                    opacity: .4,   
                    width: shadow,
                    left: left - spaceLR - shadow,                  
                    top: top - spaceTB - shadow,
                    height: height + spaceTB + spaceTB + shadow + shadow + 2
                    });

                });

                // make elements sit on top of the mask
                //exposed = els.css({ zIndex: Math.max(conf.zIndex + 1, overlayIndex == 'auto' ? 0 : overlayIndex)});         
            }   

            // reveal mask
            //$('.wcemasks').fadeIn();
            outlines.fadeIn();
            masks.fadeIn(function() {
                //a.mask.fit(); 
                call(conf.onLoad);
                loaded = "full";
            });
            
            loaded = true;  
            return this;                
        },
        
        close: function() {
            if (loaded) {
                loaded = false;
                // onBeforeClose
                if (call(config.onBeforeClose) === false) { return this; }
                    
                mask.fadeOut(config.closeSpeed, function()  {                                       
                    // if (exposed) {
                    //     exposed.css({zIndex: overlayIndex});                        
                    // }               
                    loaded = false;
                    call(config.onClose);
                });             
                
                masks.fadeOut();
                outlines.fadeOut();

                // unbind various event listeners
                $(document).off("keydown.mask");
                masks.off("click");
                $(window).off("resize.mask");  
            }
            
            return this; 
        },
        
        fit: function() {
            if (loaded) {
                    var size = viewport();              
                    var element = $('#wcurrect012220')[0];
                    var box = webC.helper.getElementBox(element);
                    // if (d == 'inline') alert('inline');
                    var top = box.top;
                    var left = box.left;
                    var height = box.height;
                    var width = box.width;
                    var spaceTB = 5; // space around element box
                    var spaceLR = 5; // space around element box
                    var shadow = 3; // shadow size around element box

                    maskL.css({              
                    top: top - spaceTB,
                    width: left - spaceLR,
                    height: height + spaceLR + spaceLR
                    });
             
                    maskT.css({   
                    width: size[0] - spaceLR,
                    height: top - spaceTB
                    });

                    maskR.css({   
                    top: top  - spaceTB,                    
                    left: left + width + spaceLR, 
                    width: size[0] - left - width - spaceLR - spaceLR,
                    height: height + spaceLR + spaceLR
                    });

                    maskB.css({   
                    top: top + height + spaceTB, 
                    width: size[0] - spaceLR,
                    height: size[1] - height - top - spaceTB
                    });

                    // outlines
                    outlineL.css({   
                    left: left - spaceLR,                  
                    top: top - spaceTB,
                    height: height + spaceLR + spaceLR
                    });
             
                    outlineT.css({   
                    left: left - spaceLR,                  
                    top: top - spaceTB,
                    width: width + spaceLR + spaceLR
                    });

                    outlineR.css({   
                    top: top  - spaceTB,                    
                    left: left + width + spaceLR, 
                    height: height + spaceLR + spaceLR + 2
                    });

                    outlineB.css({   
                    left: left - spaceLR,  
                    top: top + height + spaceTB, 
                    width: width + spaceLR + spaceLR
                    });
                    // outline shadow
                    outlineBS.css({
                    backgroundColor: '#000',
                    opacity: .4,   
                    height: shadow,
                    left: left - spaceLR,  
                    top: top + height + spaceTB + 2, 
                    width: width + spaceLR + spaceLR + 2
                    });

                    outlineRS.css({
                    borderTopRightRadius: 5, 
                    borderBottomRightRadius: 5,     
                    backgroundColor: '#000',
                    opacity: .4,
                    width: shadow,
                    top: top  - spaceTB - shadow,                    
                    left: left + width + spaceLR + 2, 
                    height: height + spaceTB + spaceTB + 2 + shadow + shadow
                    });

                    outlineTS.css({
                    backgroundColor: '#000',
                    opacity: .4,   
                    height: shadow,
                    left: left - spaceLR,                  
                    top: top - spaceTB - shadow,
                    width: width + spaceLR + spaceLR + 2
                    });


                    outlineLS.css({
                    borderTopLeftRadius: 5, 
                    borderBottomLeftRadius: 5,     
                    backgroundColor: '#000',
                    opacity: .4,   
                    width: shadow,
                    left: left - spaceLR - shadow,                  
                    top: top - spaceTB - shadow,
                    height: height + spaceTB + spaceTB + shadow + shadow + 2
                    });
            }               
        },
        
        getMask: function() {
            return mask;    
        },
        
        isLoaded: function(fully) {
            return fully ? loaded == 'full' : loaded;   
        }, 
        
        getConf: function() {
            return config;  
        },
        
        getExposed: function() {
            return exposed; 
        }       
    };
    
    a.fn.mask = function(conf) {
        a.mask.load(conf);
        return this;        
    };          
    
    a.fn.expose = function(conf) {
        a.mask.load(conf, this);
        return this;            
    };

})($);


$.fn.postMessage = function(message) {

        var toUrl = this.attr('src');
        var iframe = document.getElementById(this.attr('id')).contentWindow;
        if (window.postMessage) {
            // standard HTML5 support
            iframe.postMessage(JSON.stringify(message), toUrl);
        }

    };

$.fn.onMessageRecived = function(triggeredFunction) {
        if (window.postMessage) {
            // standard HTML5 support
            if (typeof window.addEventListener != 'undefined') {
                window.addEventListener('message', triggeredFunction, false);
            } else if (typeof window.attachEvent != 'undefined') {
                window.attachEvent('onmessage', triggeredFunction);
            }
        }
};


/*
 * jQuery Spellchecker - v0.2.4 - 2012-12-19
 * https://github.com/badsyntax/jquery-spellchecker
 * Copyright (c) 2012 Richard Willis; Licensed MIT
 */

(function(a) {

  /* Config
   *************************/

  var defaultConfig = {
    lang: '',
    webservice: {
      path: '',
      driver: ''
    },
    local: {
      requestError: 'There was an error processing the request.',
      ignoreWord: 'Ignore word',
      ignoreAll: 'Ignore all',
      turnoff: 'SpellCheck Off',      
      ignoreForever: 'Add to dictionary',
      loading: 'Loading...',
      noSuggestions: '(No suggestions)'
    },
    suggestBox: {
      numWords: 5,
      position: 'above',
      offset: 2,
      appendTo: null
    },
    incorrectWords: {
      container: 'body', //selector
      position: null //function
    }
  };

  var pluginName = 'spellchecker';

  /* Util
   *************************/

  if (!Function.prototype.bind) {
    Function.prototype.bind = function(scope) {
      return $.proxy(this, scope);
    };
  }

  var inherits = function(_sub, _super) {
    function F() {}
    F.prototype = _super.prototype;
    _sub.prototype = new F();
    _sub.prototype.constructor = _sub;
  };

  var decode = function(text) {
    return $('<div />').html(text).html();
  };

  RegExp.escape = function(text) {
    return text.replace(/[\-\[\]{}()*+?.,\^$|#\s]/g, "\\$&");
  };

  /* Character sets
   *************************/

  var punctuationChars = '\\u0021-\\u0023\\u0025-\\u002A\\u002C-\\u002F\\u003A\\u003B\\u003F\\u0040\\u005B-\\u005D\\u005F\\u007B\\u007D\\u00A1\\u00A7\\u00AB\\u00B6\\u00B7\\u00BB\\u00BF\\u037E\\u0387\\u055A-\\u055F\\u0589\\u058A\\u05BE\\u05C0\\u05C3\\u05C6\\u05F3\\u05F4\\u0609\\u060A\\u060C\\u060D\\u061B\\u061E\\u061F\\u066A-\\u066D\\u06D4\\u0700-\\u070D\\u07F7-\\u07F9\\u0830-\\u083E\\u085E\\u0964\\u0965\\u0970\\u0AF0\\u0DF4\\u0E4F\\u0E5A\\u0E5B\\u0F04-\\u0F12\\u0F14\\u0F3A-\\u0F3D\\u0F85\\u0FD0-\\u0FD4\\u0FD9\\u0FDA\\u104A-\\u104F\\u10FB\\u1360-\\u1368\\u1400\\u166D\\u166E\\u169B\\u169C\\u16EB-\\u16ED\\u1735\\u1736\\u17D4-\\u17D6\\u17D8-\\u17DA\\u1800-\\u180A\\u1944\\u1945\\u1A1E\\u1A1F\\u1AA0-\\u1AA6\\u1AA8-\\u1AAD\\u1B5A-\\u1B60\\u1BFC-\\u1BFF\\u1C3B-\\u1C3F\\u1C7E\\u1C7F\\u1CC0-\\u1CC7\\u1CD3\\u2010-\\u2027\\u2030-\\u2043\\u2045-\\u2051\\u2053-\\u205E\\u207D\\u207E\\u208D\\u208E\\u2329\\u232A\\u2768-\\u2775\\u27C5\\u27C6\\u27E6-\\u27EF\\u2983-\\u2998\\u29D8-\\u29DB\\u29FC\\u29FD\\u2CF9-\\u2CFC\\u2CFE\\u2CFF\\u2D70\\u2E00-\\u2E2E\\u2E30-\\u2E3B\\u3001-\\u3003\\u3008-\\u3011\\u3014-\\u301F\\u3030\\u303D\\u30A0\\u30FB\\uA4FE\\uA4FF\\uA60D-\\uA60F\\uA673\\uA67E\\uA6F2-\\uA6F7\\uA874-\\uA877\\uA8CE\\uA8CF\\uA8F8-\\uA8FA\\uA92E\\uA92F\\uA95F\\uA9C1-\\uA9CD\\uA9DE\\uA9DF\\uAA5C-\\uAA5F\\uAADE\\uAADF\\uAAF0\\uAAF1\\uABEB\\uFD3E\\uFD3F\\uFE10-\\uFE19\\uFE30-\\uFE52\\uFE54-\\uFE61\\uFE63\\uFE68\\uFE6A\\uFE6B\\uFF01-\\uFF03\\uFF05-\\uFF0A\\uFF0C-\\uFF0F\\uFF1A\\uFF1B\\uFF1F\\uFF20\\uFF3B-\\uFF3D\\uFF3F\\uFF5B\\uFF5D\\uFF5F-\\uFF65';
  var letterChars = '\\u0041-\\u005A\\u0061-\\u007A\\u00AA\\u00B5\\u00BA\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02C1\\u02C6-\\u02D1\\u02E0-\\u02E4\\u02EC\\u02EE\\u0370-\\u0374\\u0376\\u0377\\u037A-\\u037D\\u0386\\u0388-\\u038A\\u038C\\u038E-\\u03A1\\u03A3-\\u03F5\\u03F7-\\u0481\\u048A-\\u0527\\u0531-\\u0556\\u0559\\u0561-\\u0587\\u05D0-\\u05EA\\u05F0-\\u05F2\\u0620-\\u064A\\u066E\\u066F\\u0671-\\u06D3\\u06D5\\u06E5\\u06E6\\u06EE\\u06EF\\u06FA-\\u06FC\\u06FF\\u0710\\u0712-\\u072F\\u074D-\\u07A5\\u07B1\\u07CA-\\u07EA\\u07F4\\u07F5\\u07FA\\u0800-\\u0815\\u081A\\u0824\\u0828\\u0840-\\u0858\\u08A0\\u08A2-\\u08AC\\u0904-\\u0939\\u093D\\u0950\\u0958-\\u0961\\u0971-\\u0977\\u0979-\\u097F\\u0985-\\u098C\\u098F\\u0990\\u0993-\\u09A8\\u09AA-\\u09B0\\u09B2\\u09B6-\\u09B9\\u09BD\\u09CE\\u09DC\\u09DD\\u09DF-\\u09E1\\u09F0\\u09F1\\u0A05-\\u0A0A\\u0A0F\\u0A10\\u0A13-\\u0A28\\u0A2A-\\u0A30\\u0A32\\u0A33\\u0A35\\u0A36\\u0A38\\u0A39\\u0A59-\\u0A5C\\u0A5E\\u0A72-\\u0A74\\u0A85-\\u0A8D\\u0A8F-\\u0A91\\u0A93-\\u0AA8\\u0AAA-\\u0AB0\\u0AB2\\u0AB3\\u0AB5-\\u0AB9\\u0ABD\\u0AD0\\u0AE0\\u0AE1\\u0B05-\\u0B0C\\u0B0F\\u0B10\\u0B13-\\u0B28\\u0B2A-\\u0B30\\u0B32\\u0B33\\u0B35-\\u0B39\\u0B3D\\u0B5C\\u0B5D\\u0B5F-\\u0B61\\u0B71\\u0B83\\u0B85-\\u0B8A\\u0B8E-\\u0B90\\u0B92-\\u0B95\\u0B99\\u0B9A\\u0B9C\\u0B9E\\u0B9F\\u0BA3\\u0BA4\\u0BA8-\\u0BAA\\u0BAE-\\u0BB9\\u0BD0\\u0C05-\\u0C0C\\u0C0E-\\u0C10\\u0C12-\\u0C28\\u0C2A-\\u0C33\\u0C35-\\u0C39\\u0C3D\\u0C58\\u0C59\\u0C60\\u0C61\\u0C85-\\u0C8C\\u0C8E-\\u0C90\\u0C92-\\u0CA8\\u0CAA-\\u0CB3\\u0CB5-\\u0CB9\\u0CBD\\u0CDE\\u0CE0\\u0CE1\\u0CF1\\u0CF2\\u0D05-\\u0D0C\\u0D0E-\\u0D10\\u0D12-\\u0D3A\\u0D3D\\u0D4E\\u0D60\\u0D61\\u0D7A-\\u0D7F\\u0D85-\\u0D96\\u0D9A-\\u0DB1\\u0DB3-\\u0DBB\\u0DBD\\u0DC0-\\u0DC6\\u0E01-\\u0E30\\u0E32\\u0E33\\u0E40-\\u0E46\\u0E81\\u0E82\\u0E84\\u0E87\\u0E88\\u0E8A\\u0E8D\\u0E94-\\u0E97\\u0E99-\\u0E9F\\u0EA1-\\u0EA3\\u0EA5\\u0EA7\\u0EAA\\u0EAB\\u0EAD-\\u0EB0\\u0EB2\\u0EB3\\u0EBD\\u0EC0-\\u0EC4\\u0EC6\\u0EDC-\\u0EDF\\u0F00\\u0F40-\\u0F47\\u0F49-\\u0F6C\\u0F88-\\u0F8C\\u1000-\\u102A\\u103F\\u1050-\\u1055\\u105A-\\u105D\\u1061\\u1065\\u1066\\u106E-\\u1070\\u1075-\\u1081\\u108E\\u10A0-\\u10C5\\u10C7\\u10CD\\u10D0-\\u10FA\\u10FC-\\u1248\\u124A-\\u124D\\u1250-\\u1256\\u1258\\u125A-\\u125D\\u1260-\\u1288\\u128A-\\u128D\\u1290-\\u12B0\\u12B2-\\u12B5\\u12B8-\\u12BE\\u12C0\\u12C2-\\u12C5\\u12C8-\\u12D6\\u12D8-\\u1310\\u1312-\\u1315\\u1318-\\u135A\\u1380-\\u138F\\u13A0-\\u13F4\\u1401-\\u166C\\u166F-\\u167F\\u1681-\\u169A\\u16A0-\\u16EA\\u1700-\\u170C\\u170E-\\u1711\\u1720-\\u1731\\u1740-\\u1751\\u1760-\\u176C\\u176E-\\u1770\\u1780-\\u17B3\\u17D7\\u17DC\\u1820-\\u1877\\u1880-\\u18A8\\u18AA\\u18B0-\\u18F5\\u1900-\\u191C\\u1950-\\u196D\\u1970-\\u1974\\u1980-\\u19AB\\u19C1-\\u19C7\\u1A00-\\u1A16\\u1A20-\\u1A54\\u1AA7\\u1B05-\\u1B33\\u1B45-\\u1B4B\\u1B83-\\u1BA0\\u1BAE\\u1BAF\\u1BBA-\\u1BE5\\u1C00-\\u1C23\\u1C4D-\\u1C4F\\u1C5A-\\u1C7D\\u1CE9-\\u1CEC\\u1CEE-\\u1CF1\\u1CF5\\u1CF6\\u1D00-\\u1DBF\\u1E00-\\u1F15\\u1F18-\\u1F1D\\u1F20-\\u1F45\\u1F48-\\u1F4D\\u1F50-\\u1F57\\u1F59\\u1F5B\\u1F5D\\u1F5F-\\u1F7D\\u1F80-\\u1FB4\\u1FB6-\\u1FBC\\u1FBE\\u1FC2-\\u1FC4\\u1FC6-\\u1FCC\\u1FD0-\\u1FD3\\u1FD6-\\u1FDB\\u1FE0-\\u1FEC\\u1FF2-\\u1FF4\\u1FF6-\\u1FFC\\u2071\\u207F\\u2090-\\u209C\\u2102\\u2107\\u210A-\\u2113\\u2115\\u2119-\\u211D\\u2124\\u2126\\u2128\\u212A-\\u212D\\u212F-\\u2139\\u213C-\\u213F\\u2145-\\u2149\\u214E\\u2183\\u2184\\u2C00-\\u2C2E\\u2C30-\\u2C5E\\u2C60-\\u2CE4\\u2CEB-\\u2CEE\\u2CF2\\u2CF3\\u2D00-\\u2D25\\u2D27\\u2D2D\\u2D30-\\u2D67\\u2D6F\\u2D80-\\u2D96\\u2DA0-\\u2DA6\\u2DA8-\\u2DAE\\u2DB0-\\u2DB6\\u2DB8-\\u2DBE\\u2DC0-\\u2DC6\\u2DC8-\\u2DCE\\u2DD0-\\u2DD6\\u2DD8-\\u2DDE\\u2E2F\\u3005\\u3006\\u3031-\\u3035\\u303B\\u303C\\u3041-\\u3096\\u309D-\\u309F\\u30A1-\\u30FA\\u30FC-\\u30FF\\u3105-\\u312D\\u3131-\\u318E\\u31A0-\\u31BA\\u31F0-\\u31FF\\u3400-\\u4DB5\\u4E00-\\u9FCC\\uA000-\\uA48C\\uA4D0-\\uA4FD\\uA500-\\uA60C\\uA610-\\uA61F\\uA62A\\uA62B\\uA640-\\uA66E\\uA67F-\\uA697\\uA6A0-\\uA6E5\\uA717-\\uA71F\\uA722-\\uA788\\uA78B-\\uA78E\\uA790-\\uA793\\uA7A0-\\uA7AA\\uA7F8-\\uA801\\uA803-\\uA805\\uA807-\\uA80A\\uA80C-\\uA822\\uA840-\\uA873\\uA882-\\uA8B3\\uA8F2-\\uA8F7\\uA8FB\\uA90A-\\uA925\\uA930-\\uA946\\uA960-\\uA97C\\uA984-\\uA9B2\\uA9CF\\uAA00-\\uAA28\\uAA40-\\uAA42\\uAA44-\\uAA4B\\uAA60-\\uAA76\\uAA7A\\uAA80-\\uAAAF\\uAAB1\\uAAB5\\uAAB6\\uAAB9-\\uAABD\\uAAC0\\uAAC2\\uAADB-\\uAADD\\uAAE0-\\uAAEA\\uAAF2-\\uAAF4\\uAB01-\\uAB06\\uAB09-\\uAB0E\\uAB11-\\uAB16\\uAB20-\\uAB26\\uAB28-\\uAB2E\\uABC0-\\uABE2\\uAC00-\\uD7A3\\uD7B0-\\uD7C6\\uD7CB-\\uD7FB\\uF900-\\uFA6D\\uFA70-\\uFAD9\\uFB00-\\uFB06\\uFB13-\\uFB17\\uFB1D\\uFB1F-\\uFB28\\uFB2A-\\uFB36\\uFB38-\\uFB3C\\uFB3E\\uFB40\\uFB41\\uFB43\\uFB44\\uFB46-\\uFBB1\\uFBD3-\\uFD3D\\uFD50-\\uFD8F\\uFD92-\\uFDC7\\uFDF0-\\uFDFB\\uFE70-\\uFE74\\uFE76-\\uFEFC\\uFF21-\\uFF3A\\uFF41-\\uFF5A\\uFF66-\\uFFBE\\uFFC2-\\uFFC7\\uFFCA-\\uFFCF\\uFFD2-\\uFFD7\\uFFDA-\\uFFDC';

  /* Events
   *************************/

  var Events = function(){
    this._handlers = {};
  };

  Events.prototype = {
    on: function(name, handler) {
      if (!this._handlers[name]) {
        this._handlers[name] = $.Callbacks();
      }
      this._handlers[name].add(handler);
    },
    trigger: function(name) {
      var args = Array.prototype.slice.call(arguments, 1);
      if ($.isFunction(name)) {
        return name.apply(this, args);
      }
      if (this._handlers[name]) {
        this._handlers[name].fireWith(this, args);
      }
    },
    handler: function(name) {
      return function(e) {
        this.trigger(name, e);
      }.bind(this);
    }
  };

  /* Handlers 
   *************************/

  var selectWordHandler = function(handlerName) {

    return function(e) {
    
      e.preventDefault();
      e.stopPropagation();

      var element = $(e.currentTarget);
      var word = $.trim(element.data('word') || element.text());

      this.trigger(handlerName, e, word, element, this);

    }.bind(this);
  };  
  
  /* Collections 
   *************************/

  var Collection = function(elements, instanceFactory) {
    this.instances = [];
    for(var i = 0; i < elements.length; i++) {
      this.instances.push( instanceFactory(elements[i]) );
    }
    this.methods([ 'on', 'destroy', 'trigger' ]);
  };

  Collection.prototype.methods = function(methods) {
    $.each(methods, function(i, method) {
      this[method] = function() {
        this.execute(method, arguments);
      }.bind(this);
    }.bind(this));
  };

  Collection.prototype.execute = function(method, args) {
    $.each(this.instances, function(i, instance) {
      instance[method].apply(instance, args);
    });
  };

  Collection.prototype.get = function(i) {
    return this.instances[i];
  };

  /* Base box
   *************************/

  var Box = function(config, parser, element) {
    Events.call(this);
    this.config = config;
    this.parser = parser;
    this.spellCheckerElement = $(element);
    this.createBox();
    this.bindEvents();
  };
  inherits(Box, Events);

  /* Incorrect words box
   *************************/

  var IncorrectWordsBox = function(config, parser, element) {
    Box.apply(this, arguments);
  };
  inherits(IncorrectWordsBox, Box);

  IncorrectWordsBox.prototype.bindEvents = function() {
    // strang but it works without this line
    // this.container.on('click', 'a', selectWordHandler.call(this, 'select.word'));
    this.on('addWords', this.addWords.bind(this));
  };

  IncorrectWordsBox.prototype.createBox = function() {
    
    this.container = $([
      '<div class="' + pluginName + '-incorrectwords">',
      '</div>'
    ].join(''))
    .hide();

    if ($.isFunction(this.config.incorrectWords.position)) {
      this.config.incorrectWords.position.call(this.spellCheckerElement, this.container);
    } else {
      this.container.appendTo(this.config.incorrectWords.container);
    }
  };

  IncorrectWordsBox.prototype.addWords = function(words) {

    // Make array values unique
    words = $.grep(words, function(el, index){
        return index === $.inArray(el, words);
    });

    var html = $.map(words, function(word) {
      return '<a href="#">' + word + '</a>';
    }).join('');

    this.container.html(html).show();
  };

  IncorrectWordsBox.prototype.removeWord = function(elem) {
    if (elem) {
      elem.remove();
    }
    if (this.container.children().length === 0) {
      this.container.hide();
    }
  };

  IncorrectWordsBox.prototype.destroy = function() {
    this.container.empty().remove();
  };

  /* Incorrect words inline
   *************************/

  var IncorrectWordsInline = function(config, parser, element) {
    Events.call(this);
    this.config = config;
    this.parser = parser;
    this.spellCheckerElement = this.element = $(element);
    this.bindEvents();
  };
  inherits(IncorrectWordsInline, Events);

  IncorrectWordsInline.prototype.bindEvents = function() {
    this.element.on('mouseover.' + pluginName, '.' + pluginName + '-word-highlight', function(e) {
      if ($(this).parent().attr('href')) {
            $(this).parent()[0].href = "javascript:void(0)";
      }
      if ($(this).parent().attr('onclick')) {
           $(this).parent()[0].onclick = function(e) {return false;}
      }
      // selectWordHandler.call(that, 'select.word');
    });
    if (!hasTouch) {
    this.element.on('mouseenter.' + pluginName, '.' + pluginName + '-word-highlight', selectWordHandler.call(this, 'select.word'));
    this.element.on('mouseout.' + pluginName, '.' + pluginName + '-word-highlight',  function(e) { 
      timerOutSuggest=setTimeout(function(){
       $('.' + pluginName + '-suggestbox').hide(200); 
      }, 200);
    });
    $('.' + pluginName + '-suggestbox').hover(function(e) {
          clearTimeout(timerOutSuggest);
          $(this).stop().show(200);
        }, function(e) { 
          $(this).stop().hide(200);
    });

    this.element.on('click.' + pluginName, '.' + pluginName + '-word-highlight', function(e) { 
      $('.' + pluginName + '-suggestbox').show(200); 
    });

   } else {
    this.element.on('click.' + pluginName, '.' + pluginName + '-word-highlight', selectWordHandler.call(this, 'select.word'));
   }
  };

  IncorrectWordsInline.prototype.addWords = function(words) {
    var highlighted = this.parser.highlightWords(words, this.element);
    this.element.html(highlighted);
  };

  IncorrectWordsInline.prototype.removeWord = function(elem) {};

  IncorrectWordsInline.prototype.destroy = function() {
    this.element.off('.' + pluginName);
    try {
      window.findAndReplaceDOMText.revert();
    } catch(e) {}
  };

  /* Suggest box
   *************************/

  var SuggestBox = function(config, element) {
    this.element = element;
    if (config.suggestBox.appendTo) {
      this.body = $(config.suggestBox.appendTo);
    } else {
      this.body = (this.element.length && this.element[0].nodeName === 'BODY') ? this.element : 'body';
    }
    this.position = $.isFunction(config.suggestBox.position) ? config.suggestBox.position : this.position;
    Box.apply(this, arguments);
  };
  inherits(SuggestBox, Box);

  SuggestBox.prototype.bindEvents = function() {
    var click = 'click.' + pluginName;
    this.container.on(click, this.onContainerClick.bind(this));
    this.container.on(click, '.ignore-word', selectWordHandler.call(this, 'ignore.word'));
    this.container.on(click, '.ignore-all', this.handler('ignore.all'));
    this.container.on(click, '.ignore-forever', this.handler('ignore.forever'));
    this.container.on(click,  '.'+ pluginName + '-words a', selectWordHandler.call(this, 'select.word'));

    $('.turn-off').on(click, selectWordHandler.call(this, 'turn.off'));

    $body.on(click, this.onWindowClick.bind(this));
    // if (this.element[0].nodeName === 'BODY') {
    //   this.element.parent().on(click, this.onWindowClick.bind(this));
    // }
  };

  SuggestBox.prototype.createBox = function() {

    var local = this.config.local;

    this.container = $([
      '<div class="' + pluginName + '-suggestbox">',
      ' <div class="' + pluginName + '-footer">',
      '   <a href="#" class="ignore-word">' + local.ignoreWord + '</a>',
      '   <a href="#" class="turn-off">' + local.turnoff + '</a>',
      // '   <a href="#" class="ignore-all">' + local.ignoreAll + '</a>',
      // '   <a href="#" class="ignore-forever">' + local.ignoreForever + '</a>',
      ' </div>',
      '</div>'
    ].join('')).appendTo(this.body);

    this.words = $([
      '<div class="' + pluginName + '-words">',
      '</div>'
    ].join('')).prependTo(this.container);

    this.loadingMsg = $([
      '<div class="' + pluginName + '-loading">',
      this.config.local.loading,
      '</div>'
    ].join(''));

    this.footer = this.container.find('.' + pluginName + '-footer').hide();
  };

  SuggestBox.prototype.addWords = function(words) {

    var html;

    if (!words.length) {
      html = '<em>' + this.config.local.noSuggestions + '</em>';
    } else {
      html = $.map(words, function(word) {
        return '<a href="#">' + word + '</a>';
      }).slice(0, this.config.suggestBox.numWords).join('');
    }

    this.words.html(html);
  };

  SuggestBox.prototype.showSuggestedWords = function(getWords, word, wordElement) {
    this.wordElement = $(wordElement);
    // get words is here
    getWords(word, this.onGetWords.bind(this));
  };

  SuggestBox.prototype.loading = function(show) {
    //loading suggest is here
    // this.footer.hide();
    // this.words.html(this.loadingMsg.clone());
    this.position();
    // this.open();
  };

  SuggestBox.prototype.position = function() {

    var win = $(window);
    var element = this.wordElement.data('firstElement') || this.wordElement;
    var offset = element.offset();
    var boxOffset = this.config.suggestBox.offset;
    var containerHeight = this.container.outerHeight();

    var positionAbove = (offset.top - containerHeight - boxOffset);
    var positionBelow = (offset.top + element.outerHeight() + boxOffset);

    var left = offset.left;
    var top;

    if (this.config.suggestBox.position === 'below') {
      top = positionBelow;
      if (win.height() + win.scrollTop() < positionBelow + containerHeight) {
        top = positionAbove;
      }
    } else {
      top = positionAbove;
    }

    this.container.css({ top: top, left: left });
  };

  SuggestBox.prototype.open = function() {
    this.position();
    if (hasTouch) this.container.show(200);
  };

  SuggestBox.prototype.close = function() {
    this.container.hide();
  };

  SuggestBox.prototype.detach = function() {
    this.container = this.container.detach();
  };

  SuggestBox.prototype.reattach = function() {
    this.container.appendTo(this.body);
  };

  SuggestBox.prototype.onContainerClick = function(e) {
    e.stopPropagation();
  };

  SuggestBox.prototype.onWindowClick = function(e) {
    this.close();
  };

  SuggestBox.prototype.onGetWords = function(words) {
    this.addWords(words);
    this.footer.show();
    this.position();
    this.open();
  };

  SuggestBox.prototype.destroy = function() {
    this.container.empty().remove();
  };

  /* Spellchecker web service
   *************************/

  var WebService = function(config) {

    this.config = config;

    this.defaultConfig = {
      url: config.webservice.path,
      type: 'POST',
      dataType: 'json',
      cache: false,
      data: {
        lang: $pagelang,
        driver: config.webservice.driver
      },
      error: function() {
        // alert(config.local.requestError);
      }.bind(this)
    };
  };

  WebService.prototype.makeRequest = function(config) {

    var defaultConfig = $.extend(true, {}, this.defaultConfig);

    return $.ajax($.extend(true, defaultConfig, config));
  };

  WebService.prototype.checkWords = function(text, callback) {
    if (typeof text[0] === 'undefined' || text[0] === null) return;
    return this.makeRequest({
      data: {
        action: 'get_incorrect_words',
        text: text[0]
      },
      success: callback
    });
  };

  WebService.prototype.getSuggestions = function(word, callback) {
    return this.makeRequest({
      data: {
        lang: $pagelang,
        action: 'get_suggestions',
        word: word
      },
      success: callback
    });
  };

  /* Spellchecker base parser
   *************************/

  var Parser = function(elements) {
    this.elements = elements;
  };

  Parser.prototype.clean = function(text) {

    text = '' + text; // Typecast to string
    text = decode(text); // Decode HTML characters
    text = text.replace(/\xA0|\s+|(&nbsp;)/mg, ' '); // Convert whitespace
    text = text.replace(new RegExp('<[^>]+>', 'g'), ''); // Strip HTML tags

    var puncExpr = [
      '(^|\\s+)[' + punctuationChars + ']+',                        // punctuation(s) with leading whitespace(s)
      '[' + punctuationChars + ']+\\s+[' + punctuationChars + ']+', // punctuation(s) with leading and trailing whitespace(s)
      '[' + punctuationChars + ']+(\\s+|$)'                         // puncutation(s) with trailing whitespace(s)
    ].join('|');

    text = text.replace(new RegExp(puncExpr, 'g'), ' '); // strip any punctuation
    text = $.trim(text.replace(/\s{2,}/g, ' '));         // remove extra whitespace

    // Remove numbers
    text = $.map(text.split(' '), function(word) {
      return (/^\d+$/.test(word)) ? null : word;
    }).join(' ');

    return text;
  };

  /* Spellchecker text parser
   *************************/

  var TextParser = function() {
    Parser.apply(this, arguments);
  };
  inherits(TextParser, Parser);

  TextParser.prototype.getText = function(text, textGetter) {
    return $.map(this.elements, function(element) {
      return this.clean(textGetter ? textGetter(element) : $(element).val());
    }.bind(this));
  };

  TextParser.prototype.replaceWordInText = function(oldWord, newWord, text) {
    var regex = new RegExp('(^|[^' + letterChars + '])(' + RegExp.escape(oldWord) + ')(?=[^' + letterChars + ']|$)', 'g');
    return (text + '').replace(regex, '$1' + newWord);
  };

  TextParser.prototype.replaceWord = function(oldWord, replacement, element) {
    element = $(element);
    var newText = this.replaceWordInText(oldWord, replacement, element.val());
    element.val(newText);
  };

  /* Spellchecker html parser
   *************************/

  var HtmlParser = function() {
    Parser.apply(this, arguments);
  };
  inherits(HtmlParser, Parser);

  HtmlParser.prototype.getText = function(text, textGetter) {
    if (text && (text = $(text)).length) {
      return this.clean(text.text());
    }

    return $.map(this.elements, function(element) {

      if (textGetter) {
        text = textGetter(element);
        alert(textGetter);
      } else {
         var html = $(element)
        .clone()
        .find('[class^="spellchecker-"], .wcelements, #wcorchat, #jGrowl, .wcreporterror')
        .remove()
        .end()
        .html();
      }
      
      // return this.clean(text);
      return webC.htmlToText(html);

    }.bind(this));
  };

  HtmlParser.prototype.replaceText = function(regExp, element, replaceText, captureGroup) {
    // replace magic is here
    window.findAndReplaceDOMText(regExp, element, replaceText, captureGroup);
  };

  HtmlParser.prototype.replaceWord = function(oldWord, replacement, element) {
    
    //spellchecker replace action

    try {
      window.findAndReplaceDOMText.revert();
    } catch(e) {}

    var regExp = new RegExp('(^|[^' + letterChars + '])(' + RegExp.escape(oldWord) + ')(?=[^' + letterChars + ']|$)', 'g');

    if (oldWord === replacement) {
      var r = this.replaceTextHandler(oldWord, replacement)
    } else {
      var r = this.replaceTextHandlerWC(oldWord, replacement)
    }

    this.replaceText(regExp, element[0], r, 2);

    // Remove this word from the list of incorrect words
    this.incorrectWords = $.map(this.incorrectWords || [], function(word) {
      return word === oldWord ? null : word;
    });

    this.highlightWords(this.incorrectWords, element);

  };

HtmlParser.prototype.replaceTextHandlerWC = function(oldWord, replacement){

    var r = replacement;
    var replaced;
    var replaceFill;
    var c;

    return function(fill, i) {

  // Replacement node
      var span = $('<span />', {
        'class': 'wcreporterror'
      });

      // Reset the replacement for each match
      if (i !== c) {
        c = i;
        replacement = r;
        replaced = '';
      }

      replaceFill = replacement.substring(0, fill.length);
      replacement = replacement.substr(fill.length);
      replaced += fill;

      // Add remaining text to last node
      if (replaced === oldWord) {
        replaceFill += replacement;
      }

      span
      .html("<del class='wc-words-removed'>"+oldWord +"</del><span class='wc-words-arrow'>&rarr;</span><span class='wc-words-added'>" + r +"</b>")
      .data({
         'errorID': _.size(webC.report.errors) + 1,
         'orgWord': oldWord
      });

      return span[0];
    };
  };
  HtmlParser.prototype.replaceTextHandler = function(oldWord, replacement){

    var r = replacement;
    var replaced;
    var replaceFill;
    var c;

    return function(fill, i) {

      // Reset the replacement for each match
      if (i !== c) {
        c = i;
        replacement = r;
        replaced = '';
      }

      replaceFill = replacement.substring(0, fill.length);
      replacement = replacement.substr(fill.length);
      replaced += fill;

      // Add remaining text to last node
      if (replaced === oldWord) {
        replaceFill += replacement;
      }

      return document.createTextNode(replaceFill);
    };
  };

  HtmlParser.prototype.highlightWords = function(incorrectWords, element) {
    if (!incorrectWords.length) {
      return;
    }

    this.incorrectWords = incorrectWords;
    incorrectWords = $.map(incorrectWords, function(word) {
      return RegExp.escape(word);
    });

    var regExp = '';
    regExp += '([^' + letterChars + '])';
    regExp += '(' + incorrectWords.join('|') + ')';
    regExp += '(?=[^' + letterChars + '])';

    this.replaceText(new RegExp(regExp, 'g'), element[0], this.highlightWordsHandler(incorrectWords), 2);
    // this.trigger('check.complete', incorrectWords);
  };

  HtmlParser.prototype.highlightWordsHandler = function(incorrectWords) {

    var c;
    var replaceElement;

    return function(fill, i, word) {

      // Replacement node
      var span = $('<span />', {
        'class': pluginName + '-word-highlight'
      });

      // If we have a new match
      if (i !== c) {
        c = i;
        replaceElement = span;
      }
      
      span
      .text(fill)
      .data({
        'firstElement': replaceElement,
        'word': word
      });

      return span[0];
    };
  };

  HtmlParser.prototype.ignoreWord = function(oldWord, replacement) {
    this.replaceWord(oldWord, replacement);
  };

  /* Spellchecker
   *************************/

  var SpellChecker = function(elements, config) {

    Events.call(this);

    this.elements = $(elements).attr('spellcheck', 'false');
    this.config = $.extend(true, defaultConfig, config);

    this.setupWebService();
    this.setupParser();

    if (this.elements.length) {
      this.setupSuggestBox();
      this.setupIncorrectWords();
      this.bindEvents();
    }
  };
  inherits(SpellChecker, Events);

  SpellChecker.prototype.setupWebService = function() {
    this.webservice = new WebService(this.config);
  };

  SpellChecker.prototype.setupSuggestBox = function() {
    
    this.suggestBox = new SuggestBox(this.config, this.elements);
    
    this.on('replace.word.before', function() {
      this.suggestBox.close();
      this.suggestBox.detach();
    }.bind(this));

    this.on('replace.word', function() {
      this.suggestBox.reattach();
    }.bind(this));

    this.on('destroy', function() {
        this.suggestBox.destroy();
    }.bind(this));
  };

  SpellChecker.prototype.setupIncorrectWords = function() {

    this.incorrectWords = new Collection(this.elements, function(element) {
      return this.config.parser === 'html' ? 
        new IncorrectWordsInline(this.config, this.parser, element) : 
        new IncorrectWordsBox(this.config, this.parser, element);
    }.bind(this));

    this.on('replace.word', function(index) {
      this.incorrectWords.get(index).removeWord(this.incorrectWordElement);
    }.bind(this));

    this.on('destroy', function() {
      this.incorrectWords.destroy();
    }, this);
  };

  SpellChecker.prototype.setupParser = function() {
    this.parser = this.config.parser === 'html' ? 
      new HtmlParser(this.elements) : 
      new TextParser(this.elements);
  };

  SpellChecker.prototype.bindEvents = function() {
    this.on('check.fail', this.onCheckFail.bind(this));
    this.suggestBox.on('ignore.word', this.onIgnoreWord.bind(this));
    this.suggestBox.on('turn.off', this.turnOff.bind(this));    
    this.suggestBox.on('select.word', this.onSelectWord.bind(this));
    this.incorrectWords.on('select.word', this.onIncorrectWordSelect.bind(this));
  };

  /* Pubic API methods */

  SpellChecker.prototype.check = function(text, callback) {
    this.trigger('check.start');
    text = typeof text === 'string' ? this.parser.clean(text) : this.parser.getText(text || '', this.config.getText);
    //lets check local IgnorWords list and some other clean ups
    if (webC.report.ignoreWords !== null) {
      var regIgnore ='body|nbsp|html|Javascript|';
      webC.report.ignoreWords.forEach (function(w) {
        regIgnore += w + '|';
      });
    var req = new RegExp(regIgnore,"ig");
    text[0] = text[0].replace(req, '');
    }
    this.webservice.checkWords(text, this.onCheckWords(callback));
  };

  SpellChecker.prototype.getSuggestions = function(word, callback) {
    if (this.suggestBox) {
      this.suggestBox.loading(true);
    }
    this.webservice.getSuggestions(word, callback);
  };

  SpellChecker.prototype.replaceWord = function(oldWord, replacement, elementOrText) {
    
    if (typeof elementOrText === 'string') {
      return this.parser.replaceWordInText(oldWord, replacement, elementOrText);
    }

    var element = elementOrText || this.spellCheckerElement;
    var index = this.elements.index(element);

    this.trigger('replace.word.before');
    this.parser.replaceWord(oldWord, replacement, element);
    this.trigger('replace.word', index);
    if (oldWord !== replacement) {
      webC.report.addError({type:'spelling',oldval:oldWord,newval:replacement,element:element});
    }
  };

  SpellChecker.prototype.destroy = function() {
    this.trigger('destroy');
  };

  /* Event handlers */

  SpellChecker.prototype.onCheckWords = function(callback) {
    
    return function(data) {

      var incorrectWords = data.data;
      $pagelang = data.lang;
      var outcome = 'success';

      $.each(incorrectWords, function(i, words) {
        if (words.length) {
          outcome = 'fail';
          return false;
        }
      });

      this.trigger('check.complete', incorrectWords);
      this.trigger('check.' + outcome, incorrectWords);
      this.trigger(callback, incorrectWords);

    }.bind(this);
  };

  SpellChecker.prototype.onCheckFail = function(badWords) {
    this.suggestBox.detach();
    $.each(badWords, function(i, words) {
      if (words.length) {
        // Make array unique
        words = $.grep(words, function(el, index){
          return index === $.inArray(el, words);
        });
        this.incorrectWords.get(i).addWords(words); 
      }
    }.bind(this));
    this.suggestBox.reattach();
  };

  SpellChecker.prototype.onSelectWord = function(e, word, element) {
    e.preventDefault();
    e.stopPropagation();
    this.replaceWord(this.incorrectWord, word);
  };

  SpellChecker.prototype.onIgnoreWord = function(e, word, element) {
    e.preventDefault();
    webC.report.addIgnoreWord(this.incorrectWord);
    this.replaceWord(this.incorrectWord, this.incorrectWord);
  };

  SpellChecker.prototype.turnOff = function(e) {
    e.preventDefault();
    $('.runSpellCheck').data('spellckecked', false).removeClass('active').find('.wcscore').hide();
    this.destroy();
  };

  SpellChecker.prototype.onIncorrectWordSelect = function(e, word, element, incorrectWords) {
    e.preventDefault();
    e.stopPropagation();
    clearTimeout(timerOutSuggest);
    this.incorrectWord = word;
    this.incorrectWordElement = element;
    this.spellCheckerElement = incorrectWords.spellCheckerElement;
    this.spellCheckerIndex = this.elements.index(this.spellCheckerElement);
    this.suggestBox.showSuggestedWords(this.getSuggestions.bind(this), word, element);
    this.trigger('select.word', e);
  };

a.SpellChecker = SpellChecker;

}($));

/**
 * Some small changes were made by Richard Willis to allow this
 * code to pass the project-configured jshint
 *
 * findAndReplaceDOMText v 0.2
 * @author James Padolsey http://james.padolsey.com
 * @license http://unlicense.org/UNLICENSE
 *
 * Matches the text of a DOM node against a regular expression
 * and replaces each match (or node-separated portions of the match)
 * in the specified element.
 *
 * Example: Wrap 'test' in <em>:
 *   <p id="target">This is a test</p>
 *   <script>
 *     findAndReplaceDOMText(
 *       /test/,
 *       document.getElementById('target'),
 *       'em'
 *     );
 *   </script>
 */
window.findAndReplaceDOMText = (function() {

  /** 
   * findAndReplaceDOMText
   * 
   * Locates matches and replaces with replacementNode
   *
   * @param {RegExp} regex The regular expression to match
   * @param {Node} node Element or Text node to search within
   * @param {String|Element|Function} replacementNode A NodeName,
   *  Node to clone, or a function which returns a node to use
   *  as the replacement node.
   * @param {Number} captureGroup A number specifiying which capture
   *  group to use in the match. (optional)
   */
  function findAndReplaceDOMText(regex, node, replacementNode, captureGroup) {

    var m, matches = [], text = _getText(node);
    var replaceFn = _genReplacer(replacementNode);

    if (!text) { return; }

    if (regex.global) {
      while (!!(m = regex.exec(text))) {
        matches.push(_getMatchIndexes(m, captureGroup));
      }
    } else {
      m = text.match(regex);
      matches.push(_getMatchIndexes(m, captureGroup));
    }

    if (matches.length) {
      _stepThroughMatches(node, matches, replaceFn);
    }
  }

  /**
   * Gets the start and end indexes of a match
   */
  function _getMatchIndexes(m, captureGroup) {

    captureGroup = captureGroup || 0;
 
    if (!m[0]) throw 'findAndReplaceDOMText cannot handle zero-length matches';
 
    var index = m.index;

    if (captureGroup > 0) {
      var cg = m[captureGroup];
      if (!cg) throw 'Invalid capture group';
      index += m[0].indexOf(cg);
      m[0] = cg;
    } 

    return [ index, index + m[0].length, [ m[0] ] ];
  }

  /**
   * Gets aggregate text of a node without resorting
   * to broken innerText/textContent
   */
  function _getText(node) {

    if (node.nodeType === 3) {
      return node.data;
    }

    var txt = '';

    if (!!(node = node.firstChild)) do {
      txt += _getText(node);
    } while (!!(node = node.nextSibling));

    return txt;

  }

  /** 
   * Steps through the target node, looking for matches, and
   * calling replaceFn when a match is found.
   */
  function _stepThroughMatches(node, matches, replaceFn) {

    var after, before,
        startNode,
        endNode,
        startNodeIndex,
        endNodeIndex,
        innerNodes = [],
        atIndex = 0,
        curNode = node,
        matchLocation = matches.shift(),
        matchIndex = 0;

    out: while (true) {

      if (curNode.nodeType === 3) {
        if (!endNode && curNode.length + atIndex >= matchLocation[1]) {
          // We've found the ending
          endNode = curNode;
          endNodeIndex = matchLocation[1] - atIndex;
        } else if (startNode) {
          // Intersecting node
          innerNodes.push(curNode);
        }
        if (!startNode && curNode.length + atIndex > matchLocation[0]) {
          // We've found the match start
          startNode = curNode;
          startNodeIndex = matchLocation[0] - atIndex;
        }
        atIndex += curNode.length;
      }

      if (startNode && endNode) {
        curNode = replaceFn({
          startNode: startNode,
          startNodeIndex: startNodeIndex,
          endNode: endNode,
          endNodeIndex: endNodeIndex,
          innerNodes: innerNodes,
          match: matchLocation[2],
          matchIndex: matchIndex
        });
        // replaceFn has to return the node that replaced the endNode
        // and then we step back so we can continue from the end of the 
        // match:
        atIndex -= (endNode.length - endNodeIndex);
        startNode = null;
        endNode = null;
        innerNodes = [];
        matchLocation = matches.shift();
        matchIndex++;
        if (!matchLocation) {
          break; // no more matches
        }
      } else if (curNode.firstChild || curNode.nextSibling) {
        // Move down or forward:
        curNode = curNode.firstChild || curNode.nextSibling;
        continue;
      }

      // Move forward or up:
      while (true) {
        if (curNode.nextSibling) {
          curNode = curNode.nextSibling;
          break;
        } else if (curNode.parentNode !== node) {
          curNode = curNode.parentNode;
        } else {
          break out;
        }
      }

    }

  }

  var reverts;
  /**
   * Reverts the last findAndReplaceDOMText process
   */
  findAndReplaceDOMText.revert = function revert() {
    for (var i = 0, l = reverts.length; i < l; ++i) {
      reverts[i]();
    }
    reverts = [];
  };

  /** 
   * Generates the actual replaceFn which splits up text nodes
   * and inserts the replacement element.
   */
  function _genReplacer(nodeName) {

    reverts = [];

    var makeReplacementNode;

    if (typeof nodeName !== 'function') {
      var stencilNode = nodeName.nodeType ? nodeName : document.createElement(nodeName);
      makeReplacementNode = function(fill) {
        var clone = document.createElement('div'),
            el;
        clone.innerHTML = stencilNode.outerHTML || new window.XMLSerializer().serializeToString(stencilNode);
        el = clone.firstChild;
        if (fill) {
          el.appendChild(document.createTextNode(fill));
        }
        return el;
      };
    } else {
      makeReplacementNode = nodeName;
    }

    return function replace(range) {

      var startNode = range.startNode,
          endNode = range.endNode,
          matchIndex = range.matchIndex,
          before, after;

      if (startNode === endNode) {
        var node = startNode;
        if (range.startNodeIndex > 0) {
          // Add `before` text node (before the match)
          before = document.createTextNode(node.data.substring(0, range.startNodeIndex));
          node.parentNode.insertBefore(before, node);
        }

        // Create the replacement node:
        var el = makeReplacementNode(range.match[0], matchIndex, range.match[0]);
        node.parentNode.insertBefore(el, node);
        if (range.endNodeIndex < node.length) {
          // Add `after` text node (after the match)
          after = document.createTextNode(node.data.substring(range.endNodeIndex));
          node.parentNode.insertBefore(after, node);
        }
        node.parentNode.removeChild(node);
        reverts.push(function() {
          var pnode = el.parentNode;
          pnode.insertBefore(el.firstChild, el);
          pnode.removeChild(el);
          pnode.normalize();
        });
        return el;
      } else {
        // Replace startNode -> [innerNodes...] -> endNode (in that order)
        before = document.createTextNode(startNode.data.substring(0, range.startNodeIndex));
        after = document.createTextNode(endNode.data.substring(range.endNodeIndex));
        var elA = makeReplacementNode(startNode.data.substring(range.startNodeIndex), matchIndex, range.match[0]);
        var innerEls = [];
        for (var i = 0, l = range.innerNodes.length; i < l; ++i) {
          var innerNode = range.innerNodes[i];
          var innerEl = makeReplacementNode(innerNode.data, matchIndex, range.match[0]);
          innerNode.parentNode.replaceChild(innerEl, innerNode);
          innerEls.push(innerEl);
        }
        var elB = makeReplacementNode(endNode.data.substring(0, range.endNodeIndex), matchIndex, range.match[0]);
        startNode.parentNode.insertBefore(before, startNode);
        startNode.parentNode.insertBefore(elA, startNode);
        startNode.parentNode.removeChild(startNode);
        endNode.parentNode.insertBefore(elB, endNode);
        endNode.parentNode.insertBefore(after, endNode);
        endNode.parentNode.removeChild(endNode);
        reverts.push(function() {
          innerEls.unshift(elA);
          innerEls.push(elB);
          for (var i = 0, l = innerEls.length; i < l; ++i) {
            var el = innerEls[i];
            var pnode = el.parentNode;
            pnode.insertBefore(el.firstChild, el);
            pnode.removeChild(el);
            pnode.normalize();
          }
        });
        return elB;
      }
    };

  }

  return findAndReplaceDOMText;

}($));
// smart resize
(function(e,t){var n=function(e,t,n){var r;return function(){function u(){if(!n)e.apply(s,o);r=null}var s=this,o=arguments;if(r)clearTimeout(r);else if(n)e.apply(s,o);r=setTimeout(u,t||400)}};e.fn[t]=function(e){return e?this.bind("resize",n(e)):this.trigger(t)}})($,"smartresize");

/*
$("#el").spin(); // Produces default Spinner using the text color of #el.
$("#el").spin("small"); // Produces a 'small' Spinner using the text color of #el.
$("#el").spin("large", "white"); // Produces a 'large' Spinner in white (or any valid CSS color).
$("#el").spin({ ... }); // Produces a Spinner using your custom settings.
$("#el").spin(false); // Kills the spinner.
*/
(function(e){e.fn.spin=function(e,t){if(e!==false){e=$.extend({lines:11,length:20,width:10,radius:30,corners:1,rotate:0,direction:1,color:"#000",speed:1,trail:60,shadow:true,hwaccel:true,className:"spinner",zIndex:2e9,top:"auto",left:"auto",rtl:$("html").attr("dir")==="rtl"},e)}if(arguments.length==1&&e==false){return this.each(function(){var e=$(this),t=e.data();if(t.spinner){t.spinner.stop();delete t.spinner}})}var n={tiny:{lines:8,length:2,width:2,radius:3},small:{lines:8,length:4,width:3,radius:5},large:{lines:10,length:8,width:4,radius:8}};if(Spinner){return this.each(function(){var r=$(this),i=r.data();if(i.spinner){i.spinner.stop();delete i.spinner}if(e!==false){if(typeof e==="string"){if(e in n){e=n[e]}else{e={}}if(t){e.color=t}}i.spinner=(new Spinner($.extend({color:r.css("color")},e))).spin(this)}})}else{throw"Spinner class not available."}}})($);
// spin.js
(function(t,e){t.Spinner=e()})(this,function(){"use strict";var t=["webkit","Moz","ms","O"],e={},i;function o(t,e){var i=document.createElement(t||"div"),o;for(o in e)i[o]=e[o];return i}function n(t){for(var e=1,i=arguments.length;e<i;e++)t.appendChild(arguments[e]);return t}var r=function(){var t=o("style",{type:"text/css"});n(document.getElementsByTagName("head")[0],t);return t.sheet||t.styleSheet}();function s(t,o,n,s){var a=["opacity",o,~~(t*100),n,s].join("-"),f=.01+n/s*100,l=Math.max(1-(1-t)/o*(100-f),t),u=i.substring(0,i.indexOf("Animation")).toLowerCase(),d=u&&"-"+u+"-"||"";if(!e[a]){r.insertRule("@"+d+"keyframes "+a+"{"+"0%{opacity:"+l+"}"+f+"%{opacity:"+t+"}"+(f+.01)+"%{opacity:1}"+(f+o)%100+"%{opacity:"+t+"}"+"100%{opacity:"+l+"}"+"}",r.cssRules.length);e[a]=1}return a}function a(e,i){var o=e.style,n,r;if(o[i]!==undefined)return i;i=i.charAt(0).toUpperCase()+i.slice(1);for(r=0;r<t.length;r++){n=t[r]+i;if(o[n]!==undefined)return n}}function f(t,e){for(var i in e)t.style[a(t,i)||i]=e[i];return t}function l(t){for(var e=1;e<arguments.length;e++){var i=arguments[e];for(var o in i)if(t[o]===undefined)t[o]=i[o]}return t}function u(t){var e={x:t.offsetLeft,y:t.offsetTop};while(t=t.offsetParent)e.x+=t.offsetLeft,e.y+=t.offsetTop;return e}function d(t,e){return typeof t=="string"?t:t[e%t.length]}var p={lines:12,length:7,width:5,radius:10,rotate:0,corners:1,color:"#000",direction:1,speed:1,trail:100,opacity:1/4,fps:20,zIndex:2e9,className:"spinner",top:"auto",left:"auto",position:"relative"};function c(t){if(typeof this=="undefined")return new c(t);this.opts=l(t||{},c.defaults,p)}c.defaults={};l(c.prototype,{spin:function(t){this.stop();var e=this,n=e.opts,r=e.el=f(o(0,{className:n.className}),{position:n.position,width:0,zIndex:n.zIndex}),s=n.radius+n.length+n.width,a,l;if(t){t.insertBefore(r,t.firstChild||null);l=u(t);a=u(r);f(r,{left:(n.left=="auto"?l.x-a.x+(t.offsetWidth>>1):parseInt(n.left,10)+s)+"px",top:(n.top=="auto"?l.y-a.y+(t.offsetHeight>>1):parseInt(n.top,10)+s)+"px"})}r.setAttribute("role","progressbar");e.lines(r,e.opts);if(!i){var d=0,p=(n.lines-1)*(1-n.direction)/2,c,h=n.fps,m=h/n.speed,y=(1-n.opacity)/(m*n.trail/100),g=m/n.lines;(function v(){d++;for(var t=0;t<n.lines;t++){c=Math.max(1-(d+(n.lines-t)*g)%m*y,n.opacity);e.opacity(r,t*n.direction+p,c,n)}e.timeout=e.el&&setTimeout(v,~~(1e3/h))})()}return e},stop:function(){var t=this.el;if(t){clearTimeout(this.timeout);if(t.parentNode)t.parentNode.removeChild(t);this.el=undefined}return this},lines:function(t,e){var r=0,a=(e.lines-1)*(1-e.direction)/2,l;function u(t,i){return f(o(),{position:"absolute",width:e.length+e.width+"px",height:e.width+"px",background:t,boxShadow:i,transformOrigin:"left",transform:"rotate("+~~(360/e.lines*r+e.rotate)+"deg) translate("+e.radius+"px"+",0)",borderRadius:(e.corners*e.width>>1)+"px"})}for(;r<e.lines;r++){l=f(o(),{position:"absolute",top:1+~(e.width/2)+"px",transform:e.hwaccel?"translate3d(0,0,0)":"",opacity:e.opacity,animation:i&&s(e.opacity,e.trail,a+r*e.direction,e.lines)+" "+1/e.speed+"s linear infinite"});if(e.shadow)n(l,f(u("#000","0 0 4px "+"#000"),{top:2+"px"}));n(t,n(l,u(d(e.color,r),"0 0 1px rgba(0,0,0,.1)")))}return t},opacity:function(t,e,i){if(e<t.childNodes.length)t.childNodes[e].style.opacity=i}});function h(){function t(t,e){return o("<"+t+' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">',e)}r.addRule(".spin-vml","behavior:url(#default#VML)");c.prototype.lines=function(e,i){var o=i.length+i.width,r=2*o;function s(){return f(t("group",{coordsize:r+" "+r,coordorigin:-o+" "+-o}),{width:r,height:r})}var a=-(i.width+i.length)*2+"px",l=f(s(),{position:"absolute",top:a,left:a}),u;function p(e,r,a){n(l,n(f(s(),{rotation:360/i.lines*e+"deg",left:~~r}),n(f(t("roundrect",{arcsize:i.corners}),{width:o,height:i.width,left:i.radius,top:-i.width>>1,filter:a}),t("fill",{color:d(i.color,e),opacity:i.opacity}),t("stroke",{opacity:0}))))}if(i.shadow)for(u=1;u<=i.lines;u++)p(u,-2,"progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)");for(u=1;u<=i.lines;u++)p(u);return n(e,l)};c.prototype.opacity=function(t,e,i,o){var n=t.firstChild;o=o.shadow&&o.lines||0;if(n&&e+o<n.childNodes.length){n=n.childNodes[e+o];n=n&&n.firstChild;n=n&&n.firstChild;if(n)n.opacity=i}}}var m=f(o("group"),{behavior:"url(#default#VML)"});if(!a(m,"transform")&&m.adj)h();else i=a(m,"animation");return c});

/*
 Color animation jQuery-plugin
 http://www.bitstorm.org/jquery/color-animation/
 Copyright 2011 Edwin Martin <edwin@bitstorm.org>
 Released under the MIT and GPL licenses.
*/
(function(d){function i(){var b=d("script:first"),a=b.css("color"),c=false;if(/^rgba/.test(a))c=true;else try{c=a!=b.css("color","rgba(0, 0, 0, 0.5)").css("color");b.css("color",a)}catch(e){}return c}function g(b,a,c){var e="rgb"+(d.support.rgba?"a":"")+"("+parseInt(b[0]+c*(a[0]-b[0]),10)+","+parseInt(b[1]+c*(a[1]-b[1]),10)+","+parseInt(b[2]+c*(a[2]-b[2]),10);if(d.support.rgba)e+=","+(b&&a?parseFloat(b[3]+c*(a[3]-b[3])):1);e+=")";return e}function f(b){var a,c;if(a=/#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})/.exec(b))c=
[parseInt(a[1],16),parseInt(a[2],16),parseInt(a[3],16),1];else if(a=/#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])/.exec(b))c=[parseInt(a[1],16)*17,parseInt(a[2],16)*17,parseInt(a[3],16)*17,1];else if(a=/rgb\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*\)/.exec(b))c=[parseInt(a[1]),parseInt(a[2]),parseInt(a[3]),1];else if(a=/rgba\(\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9]{1,3})\s*,\s*([0-9\.]*)\s*\)/.exec(b))c=[parseInt(a[1],10),parseInt(a[2],10),parseInt(a[3],10),parseFloat(a[4])];return c}
d.extend(true,d,{support:{rgba:i()}});var h=["color","backgroundColor","borderBottomColor","borderLeftColor","borderRightColor","borderTopColor","outlineColor"];d.each(h,function(b,a){d.fx.step[a]=function(c){if(!c.init){c.a=f(d(c.elem).css(a));c.end=f(c.end);c.init=true}c.elem.style[a]=g(c.a,c.end,c.pos)}});d.fx.step.borderColor=function(b){if(!b.init)b.end=f(b.end);var a=h.slice(2,6);d.each(a,function(c,e){b.init||(b[e]={a:f(d(b.elem).css(e))});b.elem.style[e]=g(b[e].a,b.end,b.pos)});b.init=true}})($);
// EventsJS

/*
  ----------------------------------------------------
  Event.js : 1.1.3 : 2013/07/17 : MIT License
  ----------------------------------------------------
  https://github.com/mudcube/Event.js
  ----------------------------------------------------
  1  : click, dblclick, dbltap
  1+ : tap, longpress, drag, swipe
  2+ : pinch, rotate
     : mousewheel, devicemotion, shake
  ----------------------------------------------------
*/
if(typeof Event==="undefined")var Event={};if(typeof eventjs==="undefined")var eventjs=Event;(function(e){"use strict";e.modifyEventListener=true;e.modifySelectors=true;e.add=function(e,t,r,i){return n(e,t,r,i,"add")};e.remove=function(e,t,r,i){return n(e,t,r,i,"remove")};e.stop=function(e){if(!e)return;if(e.stopPropagation)e.stopPropagation();e.cancelBubble=true;e.bubble=0};e.prevent=function(e){if(!e)return;if(e.preventDefault)e.preventDefault();if(e.preventManipulation)e.preventManipulation();e.returnValue=false};e.cancel=function(t){e.stop(t);e.prevent(t)};e.getEventSupport=function(e,t){if(typeof e==="string"){t=e;e=window}t="on"+t;if(t in e)return true;if(!e.setAttribute)e=document.createElement("div");if(e.setAttribute&&e.removeAttribute){e.setAttribute(t,"");var n=typeof e[t]==="function";if(typeof e[t]!=="undefined")e[t]=null;e.removeAttribute(t);return n}};var t=function(e){if(!e||typeof e!=="object")return e;var n=new e.constructor;for(var r in e){if(!e[r]||typeof e[r]!=="object"){n[r]=e[r]}else{n[r]=t(e[r])}}return n};var n=function(s,o,u,l,d,v){l=l||{};if(String(s)==="[object Object]"){var m=s;s=m.target;o=m.type;u=m.listener;delete m.target;delete m.type;delete m.listener;for(var g in m){l[g]=m[g]}}if(!s||!o||!u)return;if(typeof s==="string"&&o==="ready"){var y=(new Date).getTime();var b=l.timeout;var w=l.interval||1e3/60;var E=window.setInterval(function(){if((new Date).getTime()-y>b){window.clearInterval(E)}if(document.querySelector(s)){window.clearInterval(E);setTimeout(u,1)}},w);return}if(typeof s==="string"){s=document.querySelectorAll(s);if(s.length===0)return i("Missing target on listener!",arguments);if(s.length===1){s=s[0]}}var S;var x={};if(s.length>0&&s!==window){for(var T=0,N=s.length;T<N;T++){S=n(s[T],o,u,t(l),d);if(S)x[T]=S}return r(x)}if(o.indexOf&&o.indexOf(" ")!==-1)o=o.split(" ");if(o.indexOf&&o.indexOf(",")!==-1)o=o.split(",");if(typeof o!=="string"){if(typeof o.length==="number"){for(var C=0,k=o.length;C<k;C++){S=n(s,o[C],u,t(l),d);if(S)x[o[C]]=S}}else{for(var g in o){if(typeof o[g]==="function"){S=n(s,g,o[g],t(l),d)}else{S=n(s,g,o[g].listener,t(o[g]),d)}if(S)x[g]=S}}return r(x)}if(typeof s!=="object")return i("Target is not defined!",arguments);if(typeof u!=="function")return i("Listener is not a function!",arguments);var L=l.useCapture||false;var A=c(s)+"."+c(u)+"."+(L?1:0);if(e.Gesture&&e.Gesture._gestureHandlers[o]){A=o+A;if(d==="remove"){if(!f[A])return;f[A].remove();delete f[A]}else if(d==="add"){if(f[A]){f[A].add();return f[A]}if(l.useCall&&!e.modifyEventListener){var O=u;u=function(e,t){for(var n in t)e[n]=t[n];return O.call(s,e)}}l.gesture=o;l.target=s;l.listener=u;l.fromOverwrite=v;f[A]=e.proxy[o](l)}return f[A]}else{var M=a(o);for(var _=0,D;_<M.length;_++){o=M[_];D=o+"."+A;if(d==="remove"){if(!f[D])continue;s[p](o,u,L);delete f[D]}else if(d==="add"){if(f[D])return f[D];s[h](o,u,L);f[D]={id:D,type:o,target:s,listener:u,remove:function(){for(var t=0;t<M.length;t++){e.remove(s,M[t],u,l)}}}}}return f[D]}};var r=function(e){return{remove:function(){for(var t in e){e[t].remove()}},add:function(){for(var t in e){e[t].add()}}}};var i=function(e,t){if(typeof console==="undefined")return;if(typeof console.error==="undefined")return;console.error(e,t)};var s={msPointer:["MSPointerDown","MSPointerMove","MSPointerUp"],touch:["touchstart","touchmove","touchend"],mouse:["mousedown","mousemove","mouseup"]};var o={MSPointerDown:0,MSPointerMove:1,MSPointerUp:2,touchstart:0,touchmove:1,touchend:2,mousedown:0,mousemove:1,mouseup:2};var u=function(){e.supports={};if(window.navigator.msPointerEnabled){e.supports.msPointer=true}if(e.getEventSupport("touchstart")){e.supports.touch=true}if(e.getEventSupport("mousedown")){e.supports.mouse=true}}();var a=function(){return function(t){var n=document.addEventListener?"":"on";var r=o[t];if(isFinite(r)){var i=[];for(var u in e.supports){i.push(n+s[u][r])}return i}else{return[n+t]}}}();var f={};var l=0;var c=function(e){if(e===window)return"#window";if(e===document)return"#document";if(!e.uniqueID)e.uniqueID="e"+l++;return e.uniqueID};var h=document.addEventListener?"addEventListener":"attachEvent";var p=document.removeEventListener?"removeEventListener":"detachEvent";e.createPointerEvent=function(t,n,r){var i=n.gesture;var s=n.target;var o=t.changedTouches||e.proxy.getCoords(t);if(o.length){var u=o[0];n.pointers=r?[]:o;n.pageX=u.pageX;n.pageY=u.pageY;n.x=n.pageX;n.y=n.pageY}var a=document.createEvent("Event");a.initEvent(i,true,true);a.originalEvent=t;for(var f in n){if(f==="target")continue;a[f]=n[f]}var l=a.type;if(e.Gesture&&e.Gesture._gestureHandlers[l]){n.oldListener.call(s,a,n,false)}};if(e.modifyEventListener&&window.HTMLElement)(function(){var t=function(t){var r=function(r){var i=r+"EventListener";var s=t[i];t[i]=function(t,i,o){if(e.Gesture&&e.Gesture._gestureHandlers[t]){var u=o;if(typeof o==="object"){u.useCall=true}else{u={useCall:true,useCapture:o}}n(this,t,i,u,r,true)}else{var f=a(t);for(var l=0;l<f.length;l++){s.call(this,f[l],i,o)}}}};r("add");r("remove")};if(navigator.userAgent.match(/Firefox/)){t(HTMLDivElement.prototype);t(HTMLCanvasElement.prototype)}else{t(HTMLElement.prototype)}t(document);t(window)})();if(e.modifySelectors)(function(){var e=NodeList.prototype;e.removeEventListener=function(e,t,n){for(var r=0,i=this.length;r<i;r++){this[r].removeEventListener(e,t,n)}};e.addEventListener=function(e,t,n){for(var r=0,i=this.length;r<i;r++){this[r].addEventListener(e,t,n)}}})();return e})(Event);if(typeof Event==="undefined")var Event={};if(typeof Event.proxy==="undefined")Event.proxy={};Event.proxy=function(e){"use strict";e.pointerSetup=function(e,t){e.doc=e.target.ownerDocument||e.target;e.minFingers=e.minFingers||e.fingers||1;e.maxFingers=e.maxFingers||e.fingers||Infinity;e.position=e.position||"relative";delete e.fingers;t=t||{};t.enabled=true;t.gesture=e.gesture;t.target=e.target;t.env=e.env;if(Event.modifyEventListener&&e.fromOverwrite){e.oldListener=e.listener;e.listener=Event.createPointerEvent}var n=0;var r=t.gesture.indexOf("pointer")===0&&Event.modifyEventListener?"pointer":"mouse";if(e.oldListener)t.oldListener=e.oldListener;t.listener=e.listener;t.proxy=function(n){t.defaultListener=e.listener;e.listener=n;n(e.event,t)};t.add=function(){if(t.enabled===true)return;if(e.onPointerDown)Event.add(e.target,r+"down",e.onPointerDown);if(e.onPointerMove)Event.add(e.doc,r+"move",e.onPointerMove);if(e.onPointerUp)Event.add(e.doc,r+"up",e.onPointerUp);t.enabled=true};t.remove=function(){if(t.enabled===false)return;if(e.onPointerDown)Event.remove(e.target,r+"down",e.onPointerDown);if(e.onPointerMove)Event.remove(e.doc,r+"move",e.onPointerMove);if(e.onPointerUp)Event.remove(e.doc,r+"up",e.onPointerUp);t.reset();t.enabled=false};t.pause=function(t){if(e.onPointerMove&&(!t||t.move))Event.remove(e.doc,r+"move",e.onPointerMove);if(e.onPointerUp&&(!t||t.up))Event.remove(e.doc,r+"up",e.onPointerUp);n=e.fingers;e.fingers=0};t.resume=function(t){if(e.onPointerMove&&(!t||t.move))Event.add(e.doc,r+"move",e.onPointerMove);if(e.onPointerUp&&(!t||t.up))Event.add(e.doc,r+"up",e.onPointerUp);e.fingers=n};t.reset=function(){e.tracker={};e.fingers=0};return t};var t=Event.supports;Event.pointerType=t.mouse?"mouse":t.touch?"touch":"mspointer";e.pointerStart=function(t,n,r){var i=(t.type||"mousedown").toUpperCase();if(i.indexOf("MOUSE")===0)Event.pointerType="mouse";else if(i.indexOf("TOUCH")===0)Event.pointerType="touch";else if(i.indexOf("MSPOINTER")===0)Event.pointerType="mspointer";var s=function(e,t){var n=r.bbox;var i=u[t]={};switch(r.position){case"absolute":i.offsetX=0;i.offsetY=0;break;case"differenceFromLast":i.offsetX=e.pageX;i.offsetY=e.pageY;break;case"difference":i.offsetX=e.pageX;i.offsetY=e.pageY;break;case"move":i.offsetX=e.pageX-n.x1;i.offsetY=e.pageY-n.y1;break;default:i.offsetX=n.x1;i.offsetY=n.y1;break}if(r.position==="relative"){var s=e.pageX+n.scrollLeft-i.offsetX;var o=e.pageY+n.scrollTop-i.offsetY}else{var s=e.pageX-i.offsetX;var o=e.pageY-i.offsetY}i.rotation=0;i.scale=1;i.startTime=i.moveTime=(new Date).getTime();i.move={x:s,y:o};i.start={x:s,y:o};r.fingers++};r.event=t;if(n.defaultListener){r.listener=n.defaultListener;delete n.defaultListener}var o=!r.fingers;var u=r.tracker;var a=t.changedTouches||e.getCoords(t);var f=a.length;for(var l=0;l<f;l++){var c=a[l];var h=c.identifier||Infinity;if(r.fingers){if(r.fingers>=r.maxFingers){var p=[];for(var h in r.tracker)p.push(h);n.identifier=p.join(",");return o}var d=0;for(var v in u){if(u[v].up){delete u[v];s(c,h);r.cancel=true;break}d++}if(u[h])continue;s(c,h)}else{u=r.tracker={};n.bbox=r.bbox=e.getBoundingBox(r.target);r.fingers=0;r.cancel=false;s(c,h)}}var p=[];for(var h in r.tracker)p.push(h);n.identifier=p.join(",");return o};e.pointerEnd=function(e,t,n,r){var i=e.touches||[];var s=i.length;var o={};for(var u=0;u<s;u++){var a=i[u];var f=a.identifier;o[f||Infinity]=true}for(var f in n.tracker){var l=n.tracker[f];if(o[f]||l.up)continue;if(r){r({pageX:l.pageX,pageY:l.pageY,changedTouches:[{pageX:l.pageX,pageY:l.pageY,identifier:f==="Infinity"?Infinity:f}]},"up")}l.up=true;n.fingers--}if(n.fingers!==0)return false;var c=[];n.gestureFingers=0;for(var f in n.tracker){n.gestureFingers++;c.push(f)}t.identifier=c.join(",");return true};e.getCoords=function(t){if(typeof t.pageX!=="undefined"){e.getCoords=function(e){return Array({type:"mouse",x:e.pageX,y:e.pageY,pageX:e.pageX,pageY:e.pageY,identifier:e.pointerId||Infinity})}}else{e.getCoords=function(e){e=e||window.event;return Array({type:"mouse",x:e.clientX+document.documentElement.scrollLeft,y:e.clientY+document.documentElement.scrollTop,pageX:e.clientX+document.documentElement.scrollLeft,pageY:e.clientY+document.documentElement.scrollTop,identifier:Infinity})}}return e.getCoords(t)};e.getCoord=function(t){if("ontouchstart"in window){var n=0;var r=0;e.getCoord=function(e){var t=e.changedTouches;if(t&&t.length){return{x:n=t[0].pageX,y:r=t[0].pageY}}else{return{x:n,y:r}}}}else if(typeof t.pageX!=="undefined"&&typeof t.pageY!=="undefined"){e.getCoord=function(e){return{x:e.pageX,y:e.pageY}}}else{e.getCoord=function(e){e=e||window.event;return{x:e.clientX+document.documentElement.scrollLeft,y:e.clientY+document.documentElement.scrollTop}}}return e.getCoord(t)};e.getBoundingBox=function(e){if(e===window||e===document)e=document.body;var t={};var n=e.getBoundingClientRect();t.width=n.width;t.height=n.height;t.x1=n.left;t.y1=n.top;t.x2=t.x1+t.width;t.y2=t.y1+t.height;t.scaleX=n.width/e.offsetWidth||1;t.scaleY=n.height/e.offsetHeight||1;t.scrollLeft=0;t.scrollTop=0;var r=e.parentNode;while(r!==null){if(r===document.body)break;if(r.scrollTop===undefined)break;var i=window.getComputedStyle(r);var s=i.getPropertyValue("position");if(s==="absolute"){break}else if(s==="fixed"){t.scrollTop-=r.parentNode.scrollTop;break}else{t.scrollLeft+=r.scrollLeft;t.scrollTop+=r.scrollTop}r=r.parentNode}return t};(function(){var t=navigator.userAgent.toLowerCase();var n=t.indexOf("macintosh")!==-1;if(n&&t.indexOf("khtml")!==-1){var r={91:true,93:true}}else if(n&&t.indexOf("firefox")!==-1){var r={224:true}}else{var r={17:true}}e.metaTrackerReset=function(){e.metaKey=false;e.ctrlKey=false;e.shiftKey=false;e.altKey=false};e.metaTracker=function(t){var n=!!r[t.keyCode];if(n)e.metaKey=t.type==="keydown";e.ctrlKey=t.ctrlKey;e.shiftKey=t.shiftKey;e.altKey=t.altKey;return n}})();return e}(Event.proxy);if(typeof Event==="undefined")var Event={};if(typeof Event.proxy==="undefined")Event.proxy={};Event.proxy=function(e){"use strict";e.dragElement=function(t,n){e.drag({event:n,target:t,position:"move",listener:function(e,n){t.style.left=n.x+"px";t.style.top=n.y+"px";Event.prevent(e)}})};e.drag=function(t){t.gesture="drag";t.onPointerDown=function(r){if(e.pointerStart(r,n,t)){if(!t.monitor){Event.add(t.doc,"mousemove",t.onPointerMove);Event.add(t.doc,"mouseup",t.onPointerUp)}}t.onPointerMove(r,"down")};t.onPointerMove=function(r,i){if(!t.tracker)return t.onPointerDown(r);var s=t.bbox;var o=r.changedTouches||e.getCoords(r);var u=o.length;for(var a=0;a<u;a++){var f=o[a];var l=f.identifier||Infinity;var c=t.tracker[l];if(!c)continue;c.pageX=f.pageX;c.pageY=f.pageY;n.state=i||"move";n.identifier=l;n.start=c.start;n.fingers=t.fingers;if(t.position==="differenceFromLast"){n.x=c.pageX-c.offsetX;n.y=c.pageY-c.offsetY;c.offsetX=c.pageX;c.offsetY=c.pageY}else if(t.position==="relative"){n.x=c.pageX+s.scrollLeft-c.offsetX;n.y=c.pageY+s.scrollTop-c.offsetY}else{n.x=c.pageX-c.offsetX;n.y=c.pageY-c.offsetY}t.listener(r,n)}};t.onPointerUp=function(r){if(e.pointerEnd(r,n,t,t.onPointerMove)){if(!t.monitor){Event.remove(t.doc,"mousemove",t.onPointerMove);Event.remove(t.doc,"mouseup",t.onPointerUp)}}};var n=e.pointerSetup(t);if(t.event){t.onPointerDown(t.event)}else{Event.add(t.target,"mousedown",t.onPointerDown);if(t.monitor){Event.add(t.doc,"mousemove",t.onPointerMove);Event.add(t.doc,"mouseup",t.onPointerUp)}}return n};Event.Gesture=Event.Gesture||{};Event.Gesture._gestureHandlers=Event.Gesture._gestureHandlers||{};Event.Gesture._gestureHandlers.drag=e.drag;return e}(Event.proxy);

/*!
 * jQuery Transit - CSS3 transitions and transformations
 * (c) 2011-2012 Rico Sta. Cruz <rico@ricostacruz.com>
 * MIT Licensed.
 *
 * http://ricostacruz.com/jquery.transit
 * http://github.com/rstacruz/jquery.transit
 */
(function(k){k.transit={version:"0.9.9",propertyMap:{marginLeft:"margin",marginRight:"margin",marginBottom:"margin",marginTop:"margin",paddingLeft:"padding",paddingRight:"padding",paddingBottom:"padding",paddingTop:"padding"},enabled:true,useTransitionEnd:false};var d=document.createElement("div");var q={};function b(v){if(v in d.style){return v}var u=["Moz","Webkit","O","ms"];var r=v.charAt(0).toUpperCase()+v.substr(1);if(v in d.style){return v}for(var t=0;t<u.length;++t){var s=u[t]+r;if(s in d.style){return s}}}function e(){d.style[q.transform]="";d.style[q.transform]="rotateY(90deg)";return d.style[q.transform]!==""}var a=navigator.userAgent.toLowerCase().indexOf("chrome")>-1;q.transition=b("transition");q.transitionDelay=b("transitionDelay");q.transform=b("transform");q.transformOrigin=b("transformOrigin");q.transform3d=e();var i={transition:"transitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd",WebkitTransition:"webkitTransitionEnd",msTransition:"MSTransitionEnd"};var f=q.transitionEnd=i[q.transition]||null;for(var p in q){if(q.hasOwnProperty(p)&&typeof k.support[p]==="undefined"){k.support[p]=q[p]}}d=null;k.cssEase={_default:"ease","in":"ease-in",out:"ease-out","in-out":"ease-in-out",snap:"cubic-bezier(0,1,.5,1)",easeOutCubic:"cubic-bezier(.215,.61,.355,1)",easeInOutCubic:"cubic-bezier(.645,.045,.355,1)",easeInCirc:"cubic-bezier(.6,.04,.98,.335)",easeOutCirc:"cubic-bezier(.075,.82,.165,1)",easeInOutCirc:"cubic-bezier(.785,.135,.15,.86)",easeInExpo:"cubic-bezier(.95,.05,.795,.035)",easeOutExpo:"cubic-bezier(.19,1,.22,1)",easeInOutExpo:"cubic-bezier(1,0,0,1)",easeInQuad:"cubic-bezier(.55,.085,.68,.53)",easeOutQuad:"cubic-bezier(.25,.46,.45,.94)",easeInOutQuad:"cubic-bezier(.455,.03,.515,.955)",easeInQuart:"cubic-bezier(.895,.03,.685,.22)",easeOutQuart:"cubic-bezier(.165,.84,.44,1)",easeInOutQuart:"cubic-bezier(.77,0,.175,1)",easeInQuint:"cubic-bezier(.755,.05,.855,.06)",easeOutQuint:"cubic-bezier(.23,1,.32,1)",easeInOutQuint:"cubic-bezier(.86,0,.07,1)",easeInSine:"cubic-bezier(.47,0,.745,.715)",easeOutSine:"cubic-bezier(.39,.575,.565,1)",easeInOutSine:"cubic-bezier(.445,.05,.55,.95)",easeInBack:"cubic-bezier(.6,-.28,.735,.045)",easeOutBack:"cubic-bezier(.175, .885,.32,1.275)",easeInOutBack:"cubic-bezier(.68,-.55,.265,1.55)"};k.cssHooks["transit:transform"]={get:function(r){return k(r).data("transform")||new j()},set:function(s,r){var t=r;if(!(t instanceof j)){t=new j(t)}if(q.transform==="WebkitTransform"&&!a){s.style[q.transform]=t.toString(true)}else{s.style[q.transform]=t.toString()}k(s).data("transform",t)}};k.cssHooks.transform={set:k.cssHooks["transit:transform"].set};if(k.fn.jquery<"1.8"){k.cssHooks.transformOrigin={get:function(r){return r.style[q.transformOrigin]},set:function(r,s){r.style[q.transformOrigin]=s}};k.cssHooks.transition={get:function(r){return r.style[q.transition]},set:function(r,s){r.style[q.transition]=s}}}n("scale");n("translate");n("rotate");n("rotateX");n("rotateY");n("rotate3d");n("perspective");n("skewX");n("skewY");n("x",true);n("y",true);function j(r){if(typeof r==="string"){this.parse(r)}return this}j.prototype={setFromString:function(t,s){var r=(typeof s==="string")?s.split(","):(s.constructor===Array)?s:[s];r.unshift(t);j.prototype.set.apply(this,r)},set:function(s){var r=Array.prototype.slice.apply(arguments,[1]);if(this.setter[s]){this.setter[s].apply(this,r)}else{this[s]=r.join(",")}},get:function(r){if(this.getter[r]){return this.getter[r].apply(this)}else{return this[r]||0}},setter:{rotate:function(r){this.rotate=o(r,"deg")},rotateX:function(r){this.rotateX=o(r,"deg")},rotateY:function(r){this.rotateY=o(r,"deg")},scale:function(r,s){if(s===undefined){s=r}this.scale=r+","+s},skewX:function(r){this.skewX=o(r,"deg")},skewY:function(r){this.skewY=o(r,"deg")},perspective:function(r){this.perspective=o(r,"px")},x:function(r){this.set("translate",r,null)},y:function(r){this.set("translate",null,r)},translate:function(r,s){if(this._translateX===undefined){this._translateX=0}if(this._translateY===undefined){this._translateY=0}if(r!==null&&r!==undefined){this._translateX=o(r,"px")}if(s!==null&&s!==undefined){this._translateY=o(s,"px")}this.translate=this._translateX+","+this._translateY}},getter:{x:function(){return this._translateX||0},y:function(){return this._translateY||0},scale:function(){var r=(this.scale||"1,1").split(",");if(r[0]){r[0]=parseFloat(r[0])}if(r[1]){r[1]=parseFloat(r[1])}return(r[0]===r[1])?r[0]:r},rotate3d:function(){var t=(this.rotate3d||"0,0,0,0deg").split(",");for(var r=0;r<=3;++r){if(t[r]){t[r]=parseFloat(t[r])}}if(t[3]){t[3]=o(t[3],"deg")}return t}},parse:function(s){var r=this;s.replace(/([a-zA-Z0-9]+)\((.*?)\)/g,function(t,v,u){r.setFromString(v,u)})},toString:function(t){var s=[];for(var r in this){if(this.hasOwnProperty(r)){if((!q.transform3d)&&((r==="rotateX")||(r==="rotateY")||(r==="perspective")||(r==="transformOrigin"))){continue}if(r[0]!=="_"){if(t&&(r==="scale")){s.push(r+"3d("+this[r]+",1)")}else{if(t&&(r==="translate")){s.push(r+"3d("+this[r]+",0)")}else{s.push(r+"("+this[r]+")")}}}}}return s.join(" ")}};function m(s,r,t){if(r===true){s.queue(t)}else{if(r){s.queue(r,t)}else{t()}}}function h(s){var r=[];k.each(s,function(t){t=k.camelCase(t);t=k.transit.propertyMap[t]||k.cssProps[t]||t;t=c(t);if(k.inArray(t,r)===-1){r.push(t)}});return r}function g(s,v,x,r){var t=h(s);if(k.cssEase[x]){x=k.cssEase[x]}var w=""+l(v)+" "+x;if(parseInt(r,10)>0){w+=" "+l(r)}var u=[];k.each(t,function(z,y){u.push(y+" "+w)});return u.join(", ")}k.fn.transition=k.fn.transit=function(z,s,y,C){var D=this;var u=0;var w=true;if(typeof s==="function"){C=s;s=undefined}if(typeof y==="function"){C=y;y=undefined}if(typeof z.easing!=="undefined"){y=z.easing;delete z.easing}if(typeof z.duration!=="undefined"){s=z.duration;delete z.duration}if(typeof z.complete!=="undefined"){C=z.complete;delete z.complete}if(typeof z.queue!=="undefined"){w=z.queue;delete z.queue}if(typeof z.delay!=="undefined"){u=z.delay;delete z.delay}if(typeof s==="undefined"){s=k.fx.speeds._default}if(typeof y==="undefined"){y=k.cssEase._default}s=l(s);var E=g(z,s,y,u);var B=k.transit.enabled&&q.transition;var t=B?(parseInt(s,10)+parseInt(u,10)):0;if(t===0){var A=function(F){D.css(z);if(C){C.apply(D)}if(F){F()}};m(D,w,A);return D}var x={};var r=function(H){var G=false;var F=function(){if(G){D.unbind(f,F)}if(t>0){D.each(function(){this.style[q.transition]=(x[this]||null)})}if(typeof C==="function"){C.apply(D)}if(typeof H==="function"){H()}};if((t>0)&&(f)&&(k.transit.useTransitionEnd)){G=true;D.bind(f,F)}else{window.setTimeout(F,t)}D.each(function(){if(t>0){this.style[q.transition]=E}k(this).css(z)})};var v=function(F){this.offsetWidth;r(F)};m(D,w,v);return this};function n(s,r){if(!r){k.cssNumber[s]=true}k.transit.propertyMap[s]=q.transform;k.cssHooks[s]={get:function(v){var u=k(v).css("transit:transform");return u.get(s)},set:function(v,w){var u=k(v).css("transit:transform");u.setFromString(s,w);k(v).css({"transit:transform":u})}}}function c(r){return r.replace(/([A-Z])/g,function(s){return"-"+s.toLowerCase()})}function o(s,r){if((typeof s==="string")&&(!s.match(/^[\-0-9\.]+$/))){return s}else{return""+s+r}}function l(s){var r=s;if(k.fx.speeds[r]){r=k.fx.speeds[r]}return o(r,"ms")}k.transit.getTransitionValue=g})($);
/*
  ----------------------------------------------------
  Sketch.js : 0.1 : 2012/09/01
  ----------------------------------------------------
  https://github.com/mudcube/Sketch.js
*/

var Sketch = function(config) { "use strict";
  var that = this;
  // Utility for cloning objects.
  var clone = function(obj) {
    if (!obj || typeof(obj) !== 'object') return obj;
    var temp = new obj.constructor();
    for (var key in obj) {
      if (!obj[key] || typeof(obj[key]) !== 'object') {
        temp[key] = obj[key];
      } else { // clone sub-object
        temp[key] = clone(obj[key]);
      }
    }
    return temp;
  };
  // Setting up <canvas> layers.
  var layer = this.layer = {
    0: document.createElement("canvas"), // Background bitmap layer.
    1: document.createElement("canvas"), // Overlay drawing layer.
    2: document.createElement("canvas") // Active drawing layer.
  };
  // Setting up <canvas> contexts.
  var layer2d = this.layer2d = {
    0: this.layer[0].getContext("2d"), // Background ctx.
    1: this.layer[1].getContext("2d"), // Overlay drawing ctx.
    2: this.layer[2].getContext("2d") // Active drawing ctx.
  };
  // Variables for fast access.
  //alert(config.element);
  var elementDraw = config.element || document.body;
  var innerWidth = $(elementDraw).width();
  var innerHeight = $(elementDraw).height();
  layer[0].style.left = 0;
  layer[0].style.top = 0;
  layer[0].style.position = "absolute";
  layer[1].style.left = 0;
  layer[1].style.top = 0;
  layer[1].style.position = "absolute";
  layer[2].style.left = 0;
  layer[2].style.top = 0;
  layer[2].style.position = "absolute";
  var layer0 = layer[0];
  var layer1 = layer[1];
  var layer2 = layer[2];
  var ctx0 = layer2d[0];
  var ctx1 = layer2d[1];
  var ctx2 = layer2d[2];
  // Style object.
  this.zoom = 1;
  this.style = {
    tool: "brush",
    globalAlpha: 1,
    globalCompositeOperation: "source-over",
    strokeStyle: "red",
    lineWidth: 6,
    lineCap: "round",
    lineJoin: "round"
  };
  // Style caching object.
  this.styleCache = undefined;
  this.rendering = false;
  this.path = [];
  this.speed = 200; // fast-forward through the paths.
  this.maxTimeLapse = 500; // maximum time to wait between draw calls (type of fast-forward).
  ///
  this.init = function(config) {
    if (!config) config = this;
    this.resize();    
    this.zoom = config.zoom || 1.0;
    this.style.strokeStyle = config.strokeStyle || 'red';
    this.element = config.element || document.body;
    this.path = config.path || [];
    for (var key in layer) {
      this.element.appendChild(layer[key]);
    }
    ///
    Event.add(this.element, "mousedown", this.record);
  };
  //
  this.destroy = function() {
    this.path = [];
    if (this.element.hasChildNodes()) {
      while (this.element.childNodes.length >= 1) {
        this.element.removeChild(this.element.firstChild);
      }
    }
    ///
    Event.remove(this.element, "mousedown", this.record);
  };
  // Resize the <canvas> elements.
  this.resize = function(width, height) {
    // innerWidth = width;
    // innerHeight = height;
    // Adjust the size of the layers.
    // for (var key in layer) {
    //   layer[key].width = $(elementDraw).width();
    //   layer[key].height = $(elementDraw).height();
    // }
      $(layer0).width($(elementDraw).width());
      $(layer0).height($(elementDraw).height());

      layer[1].width = $(elementDraw).width();
      layer[1].height = $(elementDraw).height();

      layer[2].width = $(elementDraw).width();
      layer[2].height = $(elementDraw).height();

    // Redraw the content.
    that.redrawFast();
  };
  // Record the vector commands from mouse movements.
  this.record = function(event) {
    if (that.rendering) return;
    var timer = new timeCapsule();
    var dstEraser = that.style.globalCompositeOperation === "destination-out";
    var dstDirect = false; // Draw on the layer (true), or the active layer (false).
    var ctx = dstDirect ? ctx1 : ctx2;
    var currentPath = [];
    /// Capture mouse movements for drawing.
    Event.proxy.drag({
      event: event,
      target: layer2,
      listener: function (event, self) {
        Event.cancel(event);
        var coords = {};
        coords.x = (self.x - $(window).scrollLeft()) * 1 / that.zoom;
        coords.y = (self.y - $(window).scrollTop()) * 1 / that.zoom;
        if (self.state === "down") {
          coords.beginPath = true;
          for (var key in that.style) {
            coords[key] = that.style[key];
            ctx[key] = that.style[key];
          }
        }
        // Record ms since last update.
        coords.lapse = timer.getLapse();
        // Push coords to current path.
        currentPath.push(coords);
        // Push coords to global path.
        that.path.push(coords);
        // Reset the composite operation.
        ctx.globalCompositeOperation = "source-over";
        //
        if (!dstDirect) {
          // Clear the path being actively drawn.
          ctx.clearRect(0, 0, innerWidth, innerHeight);
          // Setup for eraser mode.
          if (dstEraser) {
            layer1.style.display = "none";
            ctx.save();
            ctx.globalAlpha = 1;
            ctx.drawImage(layer1, 0, 0);
            ctx.restore();
            ctx.globalCompositeOperation = "destination-out";
          }
        } else if (dstEraser) {
          ctx.globalCompositeOperation = "destination-out";
        }
        // Draw the entire path.
        ctx.save();
        ctx.scale(that.zoom, that.zoom);
        that.catmull({
          path: currentPath,
          ctx: ctx
        });
        ctx.restore();
        // Record active to layer, and cleanup.
        if (self.state === "up" && !dstDirect) {
          if (dstEraser) {
            layer1.style.display = "block";
            ctx1.clearRect(0, 0, innerWidth, innerHeight);
          }
          ctx1.drawImage(layer2, 0, 0);
          ctx.clearRect(0, 0, innerWidth, innerHeight);
        }
      }
    });
  };
  // Redraw the vectors as quickly as possible.
  this.redrawFast = function() {
    // Clearing layers.
    this.layerReset();
    // Setting the properties.
    var nid = -1;
    var path = this.path;
    var length = path.length;
    var batches = [];
    ///
    for (var n = 0; n < length; n ++) {
      if (path[n].beginPath) nid ++;
      if (!batches[nid]) batches[nid] = [];
      batches[nid].push(path[n]);
    }
    // Drawing the batches.
    ctx1.save();
    ctx1.scale(that.zoom, that.zoom);
    for (var n = 0; n < batches.length; n ++) {
      this.setStyle(ctx1, batches[n][0]);
      this.catmull({
        path: batches[n],
        ctx: ctx1
      });
    }
    ctx1.restore();
    //
    this.layerRestore();
  };
  // Redraw the vectors animated as they were drawn.
  this.redrawAnimate = function() {
    // Clearing layers.
    this.layerReset();
    // Setting the properties.
    var nid = 0;
    var path = this.path;
    var startId = 0;
    var dstOut;
    ///
    var animate = function() {
      // Stoping rendering animation.
      if (that.interval) clearInterval(that.interval);
      // Grab the current path.
      var coord = path[nid ++];
      //
      // Drawing is complete.
      if (typeof(coord) === "undefined") {
        ctx1.drawImage(layer2, 0, 0);
        ctx2.clearRect(0, 0, innerWidth, innerHeight);
        that.layerRestore();
        return;
      }
      // Record to the background layer.
      if (coord.beginPath) {
        that.setStyle(ctx2, coord);
        dstOut = ctx2.globalCompositeOperation === "destination-out";
        startId = nid - 1;
      }
      // Loop through current section.
      var currentPath = [];
      for (var n = startId; n < nid; n ++) {
        currentPath.push(path[n]);
      }
      //// Clear the path being actively drawn.
      ctx2.globalCompositeOperation = "source-over";
      ctx2.clearRect(0, 0, innerWidth, innerHeight);
      // Setup for eraser mode.
      if (dstOut) {
        layer1.style.display = "none";
        ctx2.save();
        ctx2.globalAlpha = 1;
        ctx2.drawImage(layer1, 0, 0);
        ctx2.restore();
        ctx2.globalCompositeOperation = "destination-out";
      }
      // Draw the entire path.
      ctx2.save();
      ctx2.scale(that.zoom, that.zoom);
      that.catmull({
        path: currentPath,
        ctx: ctx2
      });
      ctx2.restore();   
      // Record active to layer, and cleanup.
      if (!path[nid] || path[nid].beginPath) {
        if (dstOut) {
          layer1.style.display = "block";
          ctx1.clearRect(0, 0, innerWidth, innerHeight);
        }
        ctx1.drawImage(layer2, 0, 0);
        ctx2.clearRect(0, 0, innerWidth, innerHeight);
      }
      // Replay using timestamps.
      var speed = coord.lapse * (1 / that.speed);
      var timeout = Math.min(that.maxTimeLapse, speed);
      that.interval = setInterval(animate, timeout);
    };
    // Start animation.
    animate();
  };
  // Catmull-Rom spline.
  this.catmull = function (config) {
    var path = clone(config.path);
    var tension = 1 - (config.tension || 0);
    var ctx = config.ctx;
    var length = path.length - 3;
    path.splice(0, 0, path[0]);
    path.push(path[path.length - 1]);
    if (length <= 0) return;
    for (var n = 0; n < length; n ++) {
      var p1 = path[n];
      var p2 = path[n + 1];
      var p3 = path[n + 2];
      var p4 = path[n + 3];
      if (n == 0) {
        ctx.beginPath();
        ctx.moveTo(p2.x, p2.y);
      }
      ctx.bezierCurveTo(
        p2.x + (tension * p3.x - tension * p1.x) / 6, 
        p2.y + (tension * p3.y - tension * p1.y) / 6,
        p3.x + (tension * p2.x - tension * p4.x) / 6, 
        p3.y + (tension * p2.y - tension * p4.y) / 6, 
        p3.x, p3.y
      );
    }
    ctx.stroke();
  };
  // Reset and Restore the settings on the <canvas>.
  this.layerReset = function() {
    if (this.interval) { // Style is cached.
      clearInterval(this.interval);
    } else if (this.rendering === false) { // Cache the style.
      this.styleCache = clone(this.style);
    }
    layer1.style.display = "block";
    ctx1.clearRect(0, 0, innerWidth, innerHeight);
    ctx2.clearRect(0, 0, innerWidth, innerHeight);
    this.rendering = true;
  };
  this.layerRestore = function() {
    this.rendering = false;
    if (typeof(this.styleCache) !== "undefined") {
      this.style = clone(this.styleCache);
      delete this.styleCache;
    }
  };
  // Export to image/png.
  this.toDataURL = function() {
    var canvas = document.createElement("canvas");
    var ctx = canvas.getContext("2d");
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    ctx.drawImage(layer0, 0, 0);
    ctx.drawImage(layer1, 0, 0);
    ctx.drawImage(layer2, 0, 0);
    return canvas.toDataURL("image/png");
  };
  // Export to vector paths.
  this.toString = function() {
    return JSON.stringify(this.path);
  };
  // Clear the recording.
  this.clearRecording = function() {
    this.path = [];
    this.layerReset();
    this.layerRestore();
  };
  // Undo the last command.
  this.undo = function() {
    var length = this.path.length;
    for (var n = length - 1; n >= 0; n --) {
      var coord = this.path[n];
      if (coord.beginPath) {
        this.path.splice(n, length - n);
        this.redrawFast();
        break;
      }
    }
  };
  // Change the current tool.
  this.setTool = function(tool) {
    if ((this.style.tool = tool) === 'eraser') {
      this.style.globalCompositeOperation = 'destination-out';
    } else {
      this.style.globalCompositeOperation = 'source-over';
    }
  };
  // Change the current style of a layer.
  this.setStyle = function(ctx, props) {
    for (var key in props) {
      if (typeof(ctx[key]) !== "undefined" && typeof(that.style[key]) !== "undefined") {
        ctx[key] = props[key];
      }
    }
  };
  // Utility for keeping track of time.
  var timeCapsule = function() {
    var time = 0;
    this.getLapse = function() {
      if (time === 0) time = (new Date()).getTime();
      var newTime = (new Date()).getTime();
      var delay = newTime - time;
      time = newTime;
      return delay;
    };
    return this;
  };
  // Auto-boot.
  if (typeof(config) === "object") {
    this.init(config);
  }
  ///
  return this;
};
// SpellChecker Helpers 
function collectTextNodes(element, texts) {
    for (var child= element.firstChild; child!==null; child= child.nextSibling) {
        if (child.nodeType===3)
            texts.push(child);
        else if (child.nodeType===1)
            collectTextNodes(child, texts);
    }
}
function getTextWithSpaces(element) {
    var texts= [];
    collectTextNodes(element, texts);
    for (var i= texts.length; i-->0;)
        texts[i]= texts[i].data;
    return texts.join(' ');
}
// SpellChecker Helpers toDo: move it in SpellChecker object

/*
Highlights arbitrary terms.
<http://johannburkard.de/blog/programming/javascript/highlight-javascript-text-higlighting-jquery-plugin.html>
MIT license.
*/

$.fn.highlight = function(pat) {
 function innerHighlight(node, pat) {
  var skip = 0;
  if (node.nodeType == 3) {
   var pos = node.data.toUpperCase().indexOf(pat);
   if (pos >= 0) {
    var spannode = document.createElement('span');
    spannode.className = 'spell-word-error';
    var middlebit = node.splitText(pos);
    var endbit = middlebit.splitText(pat.length);
    var middleclone = middlebit.cloneNode(true);
    spannode.appendChild(middleclone);
    middlebit.parentNode.replaceChild(spannode, middlebit);
    skip = 1;
   }
  }
  else if (node.nodeType == 1 && node.childNodes && !/(script|style)/i.test(node.tagName)) {
   for (var i = 0; i < node.childNodes.length; ++i) {
    i += innerHighlight(node.childNodes[i], pat);
   }
  }
  return skip;
 }
 return this.each(function() {
  innerHighlight(this, pat.toUpperCase());
 });
};

$.fn.removeHighlight = function() {
 function newNormalize(node) {
    for (var i = 0, children = node.childNodes, nodeCount = children.length; i < nodeCount; i++) {
        var child = children[i];
        if (child.nodeType == 1) {
            newNormalize(child);
            continue;
        }
        if (child.nodeType != 3) { continue; }
        var next = child.nextSibling;
        if (next == null || next.nodeType != 3) { continue; }
        var combined_text = child.nodeValue + next.nodeValue;
        new_node = node.ownerDocument.createTextNode(combined_text);
        node.insertBefore(new_node, child);
        node.removeChild(child);
        node.removeChild(next);
        i--;
        nodeCount--;
    }
 }

 return this.find("span.spell-word-error").each(function() {
    var thisParent = this.parentNode;
    thisParent.replaceChild(this.firstChild, this);
    newNormalize(thisParent);
 }).end();
};

var hljs=new function(){function l(o){return o.replace(/&/gm,"&amp;").replace(/</gm,"&lt;").replace(/>/gm,"&gt;")}function b(p){for(var o=p.firstChild;o;o=o.nextSibling){if(o.nodeName=="CODE"){return o}if(!(o.nodeType==3&&o.nodeValue.match(/\s+/))){break}}}function h(p,o){return Array.prototype.map.call(p.childNodes,function(q){if(q.nodeType==3){return o?q.nodeValue.replace(/\n/g,""):q.nodeValue}if(q.nodeName=="BR"){return"\n"}return h(q,o)}).join("")}function a(q){var p=(q.className+" "+q.parentNode.className).split(/\s+/);p=p.map(function(r){return r.replace(/^language-/,"")});for(var o=0;o<p.length;o++){if(e[p[o]]||p[o]=="no-highlight"){return p[o]}}}function c(q){var o=[];(function p(r,s){for(var t=r.firstChild;t;t=t.nextSibling){if(t.nodeType==3){s+=t.nodeValue.length}else{if(t.nodeName=="BR"){s+=1}else{if(t.nodeType==1){o.push({event:"start",offset:s,node:t});s=p(t,s);o.push({event:"stop",offset:s,node:t})}}}}return s})(q,0);return o}function j(x,v,w){var p=0;var y="";var r=[];function t(){if(x.length&&v.length){if(x[0].offset!=v[0].offset){return(x[0].offset<v[0].offset)?x:v}else{return v[0].event=="start"?x:v}}else{return x.length?x:v}}function s(A){function z(B){return" "+B.nodeName+'="'+l(B.value)+'"'}return"<"+A.nodeName+Array.prototype.map.call(A.attributes,z).join("")+">"}while(x.length||v.length){var u=t().splice(0,1)[0];y+=l(w.substr(p,u.offset-p));p=u.offset;if(u.event=="start"){y+=s(u.node);r.push(u.node)}else{if(u.event=="stop"){var o,q=r.length;do{q--;o=r[q];y+=("</"+o.nodeName.toLowerCase()+">")}while(o!=u.node);r.splice(q,1);while(q<r.length){y+=s(r[q]);q++}}}}return y+l(w.substr(p))}function f(q){function o(s,r){return RegExp(s,"m"+(q.cI?"i":"")+(r?"g":""))}function p(y,w){if(y.compiled){return}y.compiled=true;var s=[];if(y.k){var r={};function z(A,t){t.split(" ").forEach(function(B){var C=B.split("|");r[C[0]]=[A,C[1]?Number(C[1]):1];s.push(C[0])})}y.lR=o(y.l||hljs.IR,true);if(typeof y.k=="string"){z("keyword",y.k)}else{for(var x in y.k){if(!y.k.hasOwnProperty(x)){continue}z(x,y.k[x])}}y.k=r}if(w){if(y.bWK){y.b="\\b("+s.join("|")+")\\s"}y.bR=o(y.b?y.b:"\\B|\\b");if(!y.e&&!y.eW){y.e="\\B|\\b"}if(y.e){y.eR=o(y.e)}y.tE=y.e||"";if(y.eW&&w.tE){y.tE+=(y.e?"|":"")+w.tE}}if(y.i){y.iR=o(y.i)}if(y.r===undefined){y.r=1}if(!y.c){y.c=[]}for(var v=0;v<y.c.length;v++){if(y.c[v]=="self"){y.c[v]=y}p(y.c[v],y)}if(y.starts){p(y.starts,w)}var u=[];for(var v=0;v<y.c.length;v++){u.push(y.c[v].b)}if(y.tE){u.push(y.tE)}if(y.i){u.push(y.i)}y.t=u.length?o(u.join("|"),true):{exec:function(t){return null}}}p(q)}function d(D,E){function o(r,M){for(var L=0;L<M.c.length;L++){var K=M.c[L].bR.exec(r);if(K&&K.index==0){return M.c[L]}}}function s(K,r){if(K.e&&K.eR.test(r)){return K}if(K.eW){return s(K.parent,r)}}function t(r,K){return K.i&&K.iR.test(r)}function y(L,r){var K=F.cI?r[0].toLowerCase():r[0];return L.k.hasOwnProperty(K)&&L.k[K]}function G(){var K=l(w);if(!A.k){return K}var r="";var N=0;A.lR.lastIndex=0;var L=A.lR.exec(K);while(L){r+=K.substr(N,L.index-N);var M=y(A,L);if(M){v+=M[1];r+='<span class="'+M[0]+'">'+L[0]+"</span>"}else{r+=L[0]}N=A.lR.lastIndex;L=A.lR.exec(K)}return r+K.substr(N)}function z(){if(A.sL&&!e[A.sL]){return l(w)}var r=A.sL?d(A.sL,w):g(w);if(A.r>0){v+=r.keyword_count;B+=r.r}return'<span class="'+r.language+'">'+r.value+"</span>"}function J(){return A.sL!==undefined?z():G()}function I(L,r){var K=L.cN?'<span class="'+L.cN+'">':"";if(L.rB){x+=K;w=""}else{if(L.eB){x+=l(r)+K;w=""}else{x+=K;w=r}}A=Object.create(L,{parent:{value:A}});B+=L.r}function C(K,r){w+=K;if(r===undefined){x+=J();return 0}var L=o(r,A);if(L){x+=J();I(L,r);return L.rB?0:r.length}var M=s(A,r);if(M){if(!(M.rE||M.eE)){w+=r}x+=J();do{if(A.cN){x+="</span>"}A=A.parent}while(A!=M.parent);if(M.eE){x+=l(r)}w="";if(M.starts){I(M.starts,"")}return M.rE?0:r.length}if(t(r,A)){throw"Illegal"}w+=r;return r.length||1}var F=e[D];f(F);var A=F;var w="";var B=0;var v=0;var x="";try{var u,q,p=0;while(true){A.t.lastIndex=p;u=A.t.exec(E);if(!u){break}q=C(E.substr(p,u.index-p),u[0]);p=u.index+q}C(E.substr(p));return{r:B,keyword_count:v,value:x,language:D}}catch(H){if(H=="Illegal"){return{r:0,keyword_count:0,value:l(E)}}else{throw H}}}function g(s){var o={keyword_count:0,r:0,value:l(s)};var q=o;for(var p in e){if(!e.hasOwnProperty(p)){continue}var r=d(p,s);r.language=p;if(r.keyword_count+r.r>q.keyword_count+q.r){q=r}if(r.keyword_count+r.r>o.keyword_count+o.r){q=o;o=r}}if(q.language){o.second_best=q}return o}function i(q,p,o){if(p){q=q.replace(/^((<[^>]+>|\t)+)/gm,function(r,v,u,t){return v.replace(/\t/g,p)})}if(o){q=q.replace(/\n/g,"<br>")}return q}function m(r,u,p){var v=h(r,p);var t=a(r);if(t=="no-highlight"){return}var w=t?d(t,v):g(v);t=w.language;var o=c(r);if(o.length){var q=document.createElement("pre");q.innerHTML=w.value;w.value=j(o,c(q),v)}w.value=i(w.value,u,p);var s=r.className;if(!s.match("(\\s|^)(language-)?"+t+"(\\s|$)")){s=s?(s+" "+t):t}r.innerHTML=w.value;r.className=s;r.result={language:t,kw:w.keyword_count,re:w.r};if(w.second_best){r.second_best={language:w.second_best.language,kw:w.second_best.keyword_count,re:w.second_best.r}}}function n(){if(n.called){return}n.called=true;Array.prototype.map.call(document.getElementsByTagName("pre"),b).filter(Boolean).forEach(function(o){m(o,hljs.tabReplace)})}function k(){window.addEventListener("DOMContentLoaded",n,false);window.addEventListener("load",n,false)}var e={};this.LANGUAGES=e;this.highlight=d;this.highlightAuto=g;this.fixMarkup=i;this.highlightBlock=m;this.initHighlighting=n;this.initHighlightingOnLoad=k;this.IR="[a-zA-Z][a-zA-Z0-9_]*";this.UIR="[a-zA-Z_][a-zA-Z0-9_]*";this.NR="\\b\\d+(\\.\\d+)?";this.CNR="(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)";this.BNR="\\b(0b[01]+)";this.RSR="!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|\\.|-|-=|/|/=|:|;|<|<<|<<=|<=|=|==|===|>|>=|>>|>>=|>>>|>>>=|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~";this.BE={b:"\\\\[\\s\\S]",r:0};this.ASM={cN:"string",b:"'",e:"'",i:"\\n",c:[this.BE],r:0};this.QSM={cN:"string",b:'"',e:'"',i:"\\n",c:[this.BE],r:0};this.CLCM={cN:"comment",b:"//",e:"$"};this.CBLCLM={cN:"comment",b:"/\\*",e:"\\*/"};this.HCM={cN:"comment",b:"#",e:"$"};this.NM={cN:"number",b:this.NR,r:0};this.CNM={cN:"number",b:this.CNR,r:0};this.BNM={cN:"number",b:this.BNR,r:0};this.inherit=function(q,r){var o={};for(var p in q){o[p]=q[p]}if(r){for(var p in r){o[p]=r[p]}}return o}}();hljs.LANGUAGES.javascript=function(a){return{k:{keyword:"in if for while finally var new function do return void else break catch instanceof with throw case default try this switch continue typeof delete let yield const",literal:"true false null undefined NaN Infinity"},c:[a.ASM,a.QSM,a.CLCM,a.CBLCLM,a.CNM,{b:"("+a.RSR+"|\\b(case|return|throw)\\b)\\s*",k:"return throw case",c:[a.CLCM,a.CBLCLM,{cN:"regexp",b:"/",e:"/[gim]*",i:"\\n",c:[{b:"\\\\/"}]},{b:"<",e:">;",sL:"xml"}],r:0},{cN:"function",bWK:true,e:"{",k:"function",c:[{cN:"title",b:"[A-Za-z$_][0-9A-Za-z$_]*"},{cN:"params",b:"\\(",e:"\\)",c:[a.CLCM,a.CBLCLM],i:"[\"'\\(]"}],i:"\\[|%"}]}}(hljs);hljs.LANGUAGES.xml=function(a){var c="[A-Za-z0-9\\._:-]+";var b={eW:true,c:[{cN:"attribute",b:c,r:0},{b:'="',rB:true,e:'"',c:[{cN:"value",b:'"',eW:true}]},{b:"='",rB:true,e:"'",c:[{cN:"value",b:"'",eW:true}]},{b:"=",c:[{cN:"value",b:"[^\\s/>]+"}]}]};return{cI:true,c:[{cN:"pi",b:"<\\?",e:"\\?>",r:10},{cN:"doctype",b:"<!DOCTYPE",e:">",r:10,c:[{b:"\\[",e:"\\]"}]},{cN:"comment",b:"<!--",e:"-->",r:10},{cN:"cdata",b:"<\\!\\[CDATA\\[",e:"\\]\\]>",r:10},{cN:"tag",b:"<style(?=\\s|>|$)",e:">",k:{title:"style"},c:[b],starts:{e:"</style>",rE:true,sL:"css"}},{cN:"tag",b:"<script(?=\\s|>|$)",e:">",k:{title:"script"},c:[b],starts:{e:"<\/script>",rE:true,sL:"javascript"}},{b:"<%",e:"%>",sL:"vbscript"},{cN:"tag",b:"</?",e:"/?>",c:[{cN:"title",b:"[^ />]+"},b]}]}}(hljs);

// bcsocket
(function(){
function e(a){throw a;}var h=void 0,l=!0,m=null,r=!1;function s(){return function(){}}function t(a){return function(b){this[a]=b}}function aa(a){return function(){return this[a]}}function ba(a){return function(){return a}}var u,ca=ca||{},w=this;function da(a){a=a.split(".");for(var b=w,c;c=a.shift();)if(b[c]!=m)b=b[c];else return m;return b}function ea(){}
function fa(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function"}else return"null";
else if("function"==b&&"undefined"==typeof a.call)return"object";return b}function x(a){return"array"==fa(a)}function ga(a){var b=fa(a);return"array"==b||"object"==b&&"number"==typeof a.length}function z(a){return"string"==typeof a}function ha(a){return"function"==fa(a)}function A(a){return a[ia]||(a[ia]=++ja)}var ia="closure_uid_"+(1E9*Math.random()>>>0),ja=0;function ka(a,b,c){return a.call.apply(a.bind,arguments)}
function la(a,b,c){a||e(Error());if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var c=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(c,d);return a.apply(b,c)}}return function(){return a.apply(b,arguments)}}function B(a,b,c){B=Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?ka:la;return B.apply(m,arguments)}var C=Date.now||function(){return+new Date};
function D(a,b){function c(){}c.prototype=b.prototype;a.qa=b.prototype;a.prototype=new c};function ma(a,b){for(var c=1;c<arguments.length;c++){var d=String(arguments[c]).replace(/\$/g,"$$$$");a=a.replace(/\%s/,d)}return a}function na(a){if(!oa.test(a))return a;-1!=a.indexOf("&")&&(a=a.replace(pa,"&amp;"));-1!=a.indexOf("<")&&(a=a.replace(qa,"&lt;"));-1!=a.indexOf(">")&&(a=a.replace(ra,"&gt;"));-1!=a.indexOf('"')&&(a=a.replace(sa,"&quot;"));return a}var pa=/&/g,qa=/</g,ra=/>/g,sa=/\"/g,oa=/[&<>\"]/;var ta,ua,va,wa;function xa(){return w.navigator?w.navigator.userAgent:m}wa=va=ua=ta=r;var ya;if(ya=xa()){var za=w.navigator;ta=0==ya.indexOf("Opera");ua=!ta&&-1!=ya.indexOf("MSIE");va=!ta&&-1!=ya.indexOf("WebKit");wa=!ta&&!va&&"Gecko"==za.product}var Aa=ta,E=ua,Ba=wa,F=va,Ca=w.navigator,Da=-1!=(Ca&&Ca.platform||"").indexOf("Mac");function Ea(){var a=w.document;return a?a.documentMode:h}var Fa;
a:{var Ga="",Ha;if(Aa&&w.opera)var Ia=w.opera.version,Ga="function"==typeof Ia?Ia():Ia;else if(Ba?Ha=/rv\:([^\);]+)(\)|;)/:E?Ha=/MSIE\s+([^\);]+)(\)|;)/:F&&(Ha=/WebKit\/(\S+)/),Ha)var Ja=Ha.exec(xa()),Ga=Ja?Ja[1]:"";if(E){var Ka=Ea();if(Ka>parseFloat(Ga)){Fa=String(Ka);break a}}Fa=Ga}var La={};
function G(a){var b;if(!(b=La[a])){b=0;for(var c=String(Fa).replace(/^[\s\xa0]+|[\s\xa0]+$/g,"").split("."),d=String(a).replace(/^[\s\xa0]+|[\s\xa0]+$/g,"").split("."),f=Math.max(c.length,d.length),g=0;0==b&&g<f;g++){var k=c[g]||"",q=d[g]||"",n=RegExp("(\\d*)(\\D*)","g"),y=RegExp("(\\d*)(\\D*)","g");do{var p=n.exec(k)||["","",""],v=y.exec(q)||["","",""];if(0==p[0].length&&0==v[0].length)break;b=((0==p[1].length?0:parseInt(p[1],10))<(0==v[1].length?0:parseInt(v[1],10))?-1:(0==p[1].length?0:parseInt(p[1],
10))>(0==v[1].length?0:parseInt(v[1],10))?1:0)||((0==p[2].length)<(0==v[2].length)?-1:(0==p[2].length)>(0==v[2].length)?1:0)||(p[2]<v[2]?-1:p[2]>v[2]?1:0)}while(0==b)}b=La[a]=0<=b}return b}var Ma=w.document,Na=!Ma||!E?h:Ea()||("CSS1Compat"==Ma.compatMode?parseInt(Fa,10):5);function Oa(a){Error.captureStackTrace?Error.captureStackTrace(this,Oa):this.stack=Error().stack||"";a&&(this.message=String(a))}D(Oa,Error);Oa.prototype.name="CustomError";function Pa(a,b){b.unshift(a);Oa.call(this,ma.apply(m,b));b.shift();this.Ic=a}D(Pa,Oa);Pa.prototype.name="AssertionError";function Qa(a,b){e(new Pa("Failure"+(a?": "+a:""),Array.prototype.slice.call(arguments,1)))};var Ra=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^/?#]*)@)?([^/#?]*?)(?::([0-9]+))?(?=[/#?]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#(.*))?$");function Sa(a){var b=Ta,c;for(c in b)a.call(h,b[c],c,b)}function Ua(a){var b=[],c=0,d;for(d in a)b[c++]=a[d];return b}function Va(a){var b=[],c=0,d;for(d in a)b[c++]=d;return b}var Wa="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function Xa(a,b){for(var c,d,f=1;f<arguments.length;f++){d=arguments[f];for(c in d)a[c]=d[c];for(var g=0;g<Wa.length;g++)c=Wa[g],Object.prototype.hasOwnProperty.call(d,c)&&(a[c]=d[c])}};var H=Array.prototype,Ya=H.indexOf?function(a,b,c){return H.indexOf.call(a,b,c)}:function(a,b,c){c=c==m?0:0>c?Math.max(0,a.length+c):c;if(z(a))return!z(b)||1!=b.length?-1:a.indexOf(b,c);for(;c<a.length;c++)if(c in a&&a[c]===b)return c;return-1},Za=H.forEach?function(a,b,c){H.forEach.call(a,b,c)}:function(a,b,c){for(var d=a.length,f=z(a)?a.split(""):a,g=0;g<d;g++)g in f&&b.call(c,f[g],g,a)};function $a(a){return H.concat.apply(H,arguments)}
function ab(a){var b=a.length;if(0<b){for(var c=Array(b),d=0;d<b;d++)c[d]=a[d];return c}return[]};function bb(a){if("function"==typeof a.M)return a.M();if(z(a))return a.split("");if(ga(a)){for(var b=[],c=a.length,d=0;d<c;d++)b.push(a[d]);return b}return Ua(a)}function cb(a,b,c){if("function"==typeof a.forEach)a.forEach(b,c);else if(ga(a)||z(a))Za(a,b,c);else{var d;if("function"==typeof a.ja)d=a.ja();else if("function"!=typeof a.M)if(ga(a)||z(a)){d=[];for(var f=a.length,g=0;g<f;g++)d.push(g)}else d=Va(a);else d=h;for(var f=bb(a),g=f.length,k=0;k<g;k++)b.call(c,f[k],d&&d[k],a)}};function db(a,b){this.N={};this.j=[];var c=arguments.length;if(1<c){c%2&&e(Error("Uneven number of arguments"));for(var d=0;d<c;d+=2)this.set(arguments[d],arguments[d+1])}else if(a){a instanceof db?(c=a.ja(),d=a.M()):(c=Va(a),d=Ua(a));for(var f=0;f<c.length;f++)this.set(c[f],d[f])}}u=db.prototype;u.f=0;u.ac=0;u.M=function(){eb(this);for(var a=[],b=0;b<this.j.length;b++)a.push(this.N[this.j[b]]);return a};u.ja=function(){eb(this);return this.j.concat()};u.ha=function(a){return fb(this.N,a)};
u.remove=function(a){return fb(this.N,a)?(delete this.N[a],this.f--,this.ac++,this.j.length>2*this.f&&eb(this),l):r};function eb(a){if(a.f!=a.j.length){for(var b=0,c=0;b<a.j.length;){var d=a.j[b];fb(a.N,d)&&(a.j[c++]=d);b++}a.j.length=c}if(a.f!=a.j.length){for(var f={},c=b=0;b<a.j.length;)d=a.j[b],fb(f,d)||(a.j[c++]=d,f[d]=1),b++;a.j.length=c}}u.get=function(a,b){return fb(this.N,a)?this.N[a]:b};u.set=function(a,b){fb(this.N,a)||(this.f++,this.j.push(a),this.ac++);this.N[a]=b};u.n=function(){return new db(this)};
function fb(a,b){return Object.prototype.hasOwnProperty.call(a,b)};function I(a,b){var c;if(a instanceof I)this.C=b!==h?b:a.C,gb(this,a.pa),c=a.$a,J(this),this.$a=h?c?decodeURIComponent(c):"":c,hb(this,a.ia),ib(this,a.Aa),jb(this,a.G),kb(this,a.Q.n()),c=a.La,J(this),this.La=h?c?decodeURIComponent(c):"":c;else if(a&&(c=String(a).match(Ra))){this.C=!!b;gb(this,c[1]||"",l);var d=c[2]||"";J(this);this.$a=l?d?decodeURIComponent(d):"":d;hb(this,c[3]||"",l);ib(this,c[4]);jb(this,c[5]||"",l);kb(this,c[6]||"",l);c=c[7]||"";J(this);this.La=l?c?decodeURIComponent(c):"":c}else this.C=
!!b,this.Q=new lb(m,0,this.C)}u=I.prototype;u.pa="";u.$a="";u.ia="";u.Aa=m;u.G="";u.La="";u.lc=r;u.C=r;u.toString=function(){var a=[],b=this.pa;b&&a.push(mb(b,nb),":");if(b=this.ia){a.push("//");var c=this.$a;c&&a.push(mb(c,nb),"@");a.push(encodeURIComponent(String(b)));b=this.Aa;b!=m&&a.push(":",String(b))}if(b=this.G)this.ia&&"/"!=b.charAt(0)&&a.push("/"),a.push(mb(b,"/"==b.charAt(0)?ob:pb));(b=this.Q.toString())&&a.push("?",b);(b=this.La)&&a.push("#",mb(b,qb));return a.join("")};u.n=function(){return new I(this)};
function gb(a,b,c){J(a);a.pa=c?b?decodeURIComponent(b):"":b;a.pa&&(a.pa=a.pa.replace(/:$/,""))}function hb(a,b,c){J(a);a.ia=c?b?decodeURIComponent(b):"":b}function ib(a,b){J(a);b?(b=Number(b),(isNaN(b)||0>b)&&e(Error("Bad port number "+b)),a.Aa=b):a.Aa=m}function jb(a,b,c){J(a);a.G=c?b?decodeURIComponent(b):"":b}function kb(a,b,c){J(a);b instanceof lb?(a.Q=b,a.Q.pb(a.C)):(c||(b=mb(b,rb)),a.Q=new lb(b,0,a.C))}function K(a,b,c){J(a);a.Q.set(b,c)}
function sb(a,b,c){J(a);x(c)||(c=[String(c)]);tb(a.Q,b,c)}function M(a){J(a);K(a,"zx",Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^C()).toString(36));return a}function J(a){a.lc&&e(Error("Tried to modify a read-only Uri"))}u.pb=function(a){this.C=a;this.Q&&this.Q.pb(a);return this};function ub(a,b,c,d){var f=new I(m,h);a&&gb(f,a);b&&hb(f,b);c&&ib(f,c);d&&jb(f,d);return f}function mb(a,b){return z(a)?encodeURI(a).replace(b,vb):m}
function vb(a){a=a.charCodeAt(0);return"%"+(a>>4&15).toString(16)+(a&15).toString(16)}var nb=/[#\/\?@]/g,pb=/[\#\?:]/g,ob=/[\#\?]/g,rb=/[\#\?@]/g,qb=/#/g;function lb(a,b,c){this.B=a||m;this.C=!!c}function N(a){if(!a.i&&(a.i=new db,a.f=0,a.B))for(var b=a.B.split("&"),c=0;c<b.length;c++){var d=b[c].indexOf("="),f=m,g=m;0<=d?(f=b[c].substring(0,d),g=b[c].substring(d+1)):f=b[c];f=decodeURIComponent(f.replace(/\+/g," "));f=O(a,f);a.add(f,g?decodeURIComponent(g.replace(/\+/g," ")):"")}}u=lb.prototype;
u.i=m;u.f=m;u.add=function(a,b){N(this);this.B=m;a=O(this,a);var c=this.i.get(a);c||this.i.set(a,c=[]);c.push(b);this.f++;return this};u.remove=function(a){N(this);a=O(this,a);return this.i.ha(a)?(this.B=m,this.f-=this.i.get(a).length,this.i.remove(a)):r};u.ha=function(a){N(this);a=O(this,a);return this.i.ha(a)};u.ja=function(){N(this);for(var a=this.i.M(),b=this.i.ja(),c=[],d=0;d<b.length;d++)for(var f=a[d],g=0;g<f.length;g++)c.push(b[d]);return c};
u.M=function(a){N(this);var b=[];if(a)this.ha(a)&&(b=$a(b,this.i.get(O(this,a))));else{a=this.i.M();for(var c=0;c<a.length;c++)b=$a(b,a[c])}return b};u.set=function(a,b){N(this);this.B=m;a=O(this,a);this.ha(a)&&(this.f-=this.i.get(a).length);this.i.set(a,[b]);this.f++;return this};u.get=function(a,b){var c=a?this.M(a):[];return 0<c.length?String(c[0]):b};function tb(a,b,c){a.remove(b);0<c.length&&(a.B=m,a.i.set(O(a,b),ab(c)),a.f+=c.length)}
u.toString=function(){if(this.B)return this.B;if(!this.i)return"";for(var a=[],b=this.i.ja(),c=0;c<b.length;c++)for(var d=b[c],f=encodeURIComponent(String(d)),d=this.M(d),g=0;g<d.length;g++){var k=f;""!==d[g]&&(k+="="+encodeURIComponent(String(d[g])));a.push(k)}return this.B=a.join("&")};u.n=function(){var a=new lb;a.B=this.B;this.i&&(a.i=this.i.n(),a.f=this.f);return a};function O(a,b){var c=String(b);a.C&&(c=c.toLowerCase());return c}
u.pb=function(a){a&&!this.C&&(N(this),this.B=m,cb(this.i,function(a,c){var d=c.toLowerCase();c!=d&&(this.remove(c),tb(this,d,a))},this));this.C=a};function wb(){}wb.prototype.Fa=m;var xb;function yb(){}D(yb,wb);function zb(a){return(a=Ab(a))?new ActiveXObject(a):new XMLHttpRequest}function Bb(a){var b={};Ab(a)&&(b[0]=l,b[1]=l);return b}
function Ab(a){if(!a.Fb&&"undefined"==typeof XMLHttpRequest&&"undefined"!=typeof ActiveXObject){for(var b=["MSXML2.XMLHTTP.6.0","MSXML2.XMLHTTP.3.0","MSXML2.XMLHTTP","Microsoft.XMLHTTP"],c=0;c<b.length;c++){var d=b[c];try{return new ActiveXObject(d),a.Fb=d}catch(f){}}e(Error("Could not create ActiveXObject. ActiveX might be disabled, or MSXML might not be installed"))}return a.Fb}xb=new yb;function P(){0!=Cb&&(this.Fc=Error().stack,Db[A(this)]=this)}var Cb=0,Db={};P.prototype.xb=r;P.prototype.Ha=function(){if(!this.xb&&(this.xb=l,this.u(),0!=Cb)){var a=A(this);delete Db[a]}};P.prototype.u=function(){if(this.Mb)for(;this.Mb.length;)this.Mb.shift()()};function Q(a,b){this.type=a;this.currentTarget=this.target=b}u=Q.prototype;u.u=s();u.Ha=s();u.ma=r;u.defaultPrevented=r;u.Va=l;u.preventDefault=function(){this.defaultPrevented=l;this.Va=r};var Eb=0;function Fb(){}u=Fb.prototype;u.key=0;u.da=r;u.Ga=r;u.Na=function(a,b,c,d,f,g){ha(a)?this.Hb=l:a&&a.handleEvent&&ha(a.handleEvent)?this.Hb=r:e(Error("Invalid listener argument"));this.V=a;this.Tb=b;this.src=c;this.type=d;this.capture=!!f;this.kb=g;this.Ga=r;this.key=++Eb;this.da=r};u.handleEvent=function(a){return this.Hb?this.V.call(this.kb||this.src,a):this.V.handleEvent.call(this.V,a)};var Gb=!E||E&&9<=Na,Hb=E&&!G("9");!F||G("528");Ba&&G("1.9b")||E&&G("8")||Aa&&G("9.5")||F&&G("528");Ba&&!G("8")||E&&G("9");function Ib(a){Ib[" "](a);return a}Ib[" "]=ea;function Jb(a,b){a&&this.Na(a,b)}D(Jb,Q);u=Jb.prototype;u.target=m;u.relatedTarget=m;u.offsetX=0;u.offsetY=0;u.clientX=0;u.clientY=0;u.screenX=0;u.screenY=0;u.button=0;u.keyCode=0;u.charCode=0;u.ctrlKey=r;u.altKey=r;u.shiftKey=r;u.metaKey=r;u.xc=r;u.yb=m;
u.Na=function(a,b){var c=this.type=a.type;Q.call(this,c);this.target=a.target||a.srcElement;this.currentTarget=b;var d=a.relatedTarget;if(d){if(Ba){var f;a:{try{Ib(d.nodeName);f=l;break a}catch(g){}f=r}f||(d=m)}}else"mouseover"==c?d=a.fromElement:"mouseout"==c&&(d=a.toElement);this.relatedTarget=d;this.offsetX=F||a.offsetX!==h?a.offsetX:a.layerX;this.offsetY=F||a.offsetY!==h?a.offsetY:a.layerY;this.clientX=a.clientX!==h?a.clientX:a.pageX;this.clientY=a.clientY!==h?a.clientY:a.pageY;this.screenX=a.screenX||
0;this.screenY=a.screenY||0;this.button=a.button;this.keyCode=a.keyCode||0;this.charCode=a.charCode||("keypress"==c?a.keyCode:0);this.ctrlKey=a.ctrlKey;this.altKey=a.altKey;this.shiftKey=a.shiftKey;this.metaKey=a.metaKey;this.xc=Da?a.metaKey:a.ctrlKey;this.state=a.state;this.yb=a;a.defaultPrevented&&this.preventDefault();delete this.ma};
u.preventDefault=function(){Jb.qa.preventDefault.call(this);var a=this.yb;if(a.preventDefault)a.preventDefault();else if(a.returnValue=r,Hb)try{if(a.ctrlKey||112<=a.keyCode&&123>=a.keyCode)a.keyCode=-1}catch(b){}};u.u=s();var Ta={},R={},S={},Kb={};
function Lb(a,b,c,d,f){if(x(b)){for(var g=0;g<b.length;g++)Lb(a,b[g],c,d,f);return m}a:{b||e(Error("Invalid event type"));d=!!d;var k=R;b in k||(k[b]={f:0,t:0});k=k[b];d in k||(k[d]={f:0,t:0},k.f++);var k=k[d],g=A(a),q;k.t++;if(k[g]){q=k[g];for(var n=0;n<q.length;n++)if(k=q[n],k.V==c&&k.kb==f){if(k.da)break;q[n].Ga=r;a=q[n];break a}}else q=k[g]=[],k.f++;n=Mb();k=new Fb;k.Na(c,n,a,b,d,f);k.Ga=r;n.src=a;n.V=k;q.push(k);S[g]||(S[g]=[]);S[g].push(k);a.addEventListener?(a==w||!a.vb)&&a.addEventListener(b,
n,d):a.attachEvent(b in Kb?Kb[b]:Kb[b]="on"+b,n);a=k}b=a.key;Ta[b]=a;return b}function Mb(){var a=Nb,b=Gb?function(c){return a.call(b.src,b.V,c)}:function(c){c=a.call(b.src,b.V,c);if(!c)return c};return b}function Ob(a,b,c,d,f){if(x(b))for(var g=0;g<b.length;g++)Ob(a,b[g],c,d,f);else{d=!!d;a:{g=R;if(b in g&&(g=g[b],d in g&&(g=g[d],a=A(a),g[a]))){a=g[a];break a}a=m}if(a)for(g=0;g<a.length;g++)if(a[g].V==c&&a[g].capture==d&&a[g].kb==f){Pb(a[g].key);break}}}
function Pb(a){var b=Ta[a];if(!b||b.da)return r;var c=b.src,d=b.type,f=b.Tb,g=b.capture;c.removeEventListener?(c==w||!c.vb)&&c.removeEventListener(d,f,g):c.detachEvent&&c.detachEvent(d in Kb?Kb[d]:Kb[d]="on"+d,f);c=A(c);if(S[c]){var f=S[c],k=Ya(f,b);0<=k&&H.splice.call(f,k,1);0==f.length&&delete S[c]}b.da=l;if(b=R[d][g][c])b.Lb=l,Qb(d,g,c,b);delete Ta[a];return l}
function Qb(a,b,c,d){if(!d.Pa&&d.Lb){for(var f=0,g=0;f<d.length;f++)d[f].da?d[f].Tb.src=m:(f!=g&&(d[g]=d[f]),g++);d.length=g;d.Lb=r;0==g&&(delete R[a][b][c],R[a][b].f--,0==R[a][b].f&&(delete R[a][b],R[a].f--),0==R[a].f&&delete R[a])}}function Rb(a){var b=0;if(a!=m){if(a=A(a),S[a]){a=S[a];for(var c=a.length-1;0<=c;c--)Pb(a[c].key),b++}}else Sa(function(a,c){Pb(c);b++})}
function Sb(a,b,c,d,f){var g=1;b=A(b);if(a[b]){var k=--a.t,q=a[b];q.Pa?q.Pa++:q.Pa=1;try{for(var n=q.length,y=0;y<n;y++){var p=q[y];p&&!p.da&&(g&=Tb(p,f)!==r)}}finally{a.t=Math.max(k,a.t),q.Pa--,Qb(c,d,b,q)}}return Boolean(g)}function Tb(a,b){a.Ga&&Pb(a.key);return a.handleEvent(b)}
function Nb(a,b){if(a.da)return l;var c=a.type,d=R;if(!(c in d))return l;var d=d[c],f,g;if(!Gb){f=b||da("window.event");var k=l in d,q=r in d;if(k){if(0>f.keyCode||f.returnValue!=h)return l;a:{var n=r;if(0==f.keyCode)try{f.keyCode=-1;break a}catch(y){n=l}if(n||f.returnValue==h)f.returnValue=l}}n=new Jb;n.Na(f,this);f=l;try{if(k){for(var p=[],v=n.currentTarget;v;v=v.parentNode)p.push(v);g=d[l];g.t=g.f;for(var L=p.length-1;!n.ma&&0<=L&&g.t;L--)n.currentTarget=p[L],f&=Sb(g,p[L],c,l,n);if(q){g=d[r];g.t=
g.f;for(L=0;!n.ma&&L<p.length&&g.t;L++)n.currentTarget=p[L],f&=Sb(g,p[L],c,r,n)}}else f=Tb(a,n)}finally{p&&(p.length=0)}return f}c=new Jb(b,this);return f=Tb(a,c)};function Ub(){P.call(this)}D(Ub,P);u=Ub.prototype;u.vb=l;u.ob=m;u.addEventListener=function(a,b,c,d){Lb(this,a,b,c,d)};u.removeEventListener=function(a,b,c,d){Ob(this,a,b,c,d)};
u.dispatchEvent=function(a){var b=a.type||a,c=R;if(b in c){if(z(a))a=new Q(a,this);else if(a instanceof Q)a.target=a.target||this;else{var d=a;a=new Q(b,this);Xa(a,d)}var d=1,f,c=c[b],b=l in c,g;if(b){f=[];for(g=this;g;g=g.ob)f.push(g);g=c[l];g.t=g.f;for(var k=f.length-1;!a.ma&&0<=k&&g.t;k--)a.currentTarget=f[k],d&=Sb(g,f[k],a.type,l,a)&&a.Va!=r}if(r in c)if(g=c[r],g.t=g.f,b)for(k=0;!a.ma&&k<f.length&&g.t;k++)a.currentTarget=f[k],d&=Sb(g,f[k],a.type,r,a)&&a.Va!=r;else for(f=this;!a.ma&&f&&g.t;f=f.ob)a.currentTarget=
f,d&=Sb(g,f,a.type,r,a)&&a.Va!=r;a=Boolean(d)}else a=l;return a};u.u=function(){Ub.qa.u.call(this);Rb(this);this.ob=m};function Vb(a,b){P.call(this);this.ca=a||1;this.Da=b||Wb;this.cb=B(this.Dc,this);this.nb=C()}D(Vb,Ub);Vb.prototype.enabled=r;var Wb=w;u=Vb.prototype;u.r=m;u.setInterval=function(a){this.ca=a;this.r&&this.enabled?(this.stop(),this.start()):this.r&&this.stop()};u.Dc=function(){if(this.enabled){var a=C()-this.nb;0<a&&a<0.8*this.ca?this.r=this.Da.setTimeout(this.cb,this.ca-a):(this.dispatchEvent(Xb),this.enabled&&(this.r=this.Da.setTimeout(this.cb,this.ca),this.nb=C()))}};
u.start=function(){this.enabled=l;this.r||(this.r=this.Da.setTimeout(this.cb,this.ca),this.nb=C())};u.stop=function(){this.enabled=r;this.r&&(this.Da.clearTimeout(this.r),this.r=m)};u.u=function(){Vb.qa.u.call(this);this.stop();delete this.Da};var Xb="tick";function Yb(a){P.call(this);this.e=a;this.j=[]}D(Yb,P);var Zb=[];function $b(a,b,c,d){x(c)||(Zb[0]=c,c=Zb);for(var f=0;f<c.length;f++){var g=Lb(b,c[f],d||a,r,a.e||a);a.j.push(g)}}Yb.prototype.u=function(){Yb.qa.u.call(this);Za(this.j,Pb);this.j.length=0};Yb.prototype.handleEvent=function(){e(Error("EventHandler.handleEvent not implemented"))};function ac(a,b,c){P.call(this);this.mc=a;this.ca=b;this.e=c;this.gc=B(this.sc,this)}D(ac,P);u=ac.prototype;u.Wa=r;u.Sb=0;u.r=m;u.stop=function(){this.r&&(Wb.clearTimeout(this.r),this.r=m,this.Wa=r)};u.u=function(){ac.qa.u.call(this);this.stop()};u.sc=function(){this.r=m;this.Wa&&!this.Sb&&(this.Wa=r,bc(this))};
function bc(a){var b;b=a.gc;var c=a.ca;ha(b)||(b&&"function"==typeof b.handleEvent?b=B(b.handleEvent,b):e(Error("Invalid listener argument")));b=2147483647<c?-1:Wb.setTimeout(b,c||0);a.r=b;a.mc.call(a.e)};function T(a,b,c,d,f){this.b=a;this.a=b;this.Y=c;this.A=d;this.Ba=f||1;this.Ca=cc;this.ib=new Yb(this);this.Ra=new Vb;this.Ra.setInterval(dc)}u=T.prototype;u.v=m;u.I=r;u.ta=m;u.rb=m;u.oa=m;u.ra=m;u.S=m;u.w=m;u.W=m;u.l=m;u.Ea=0;u.J=m;u.sa=m;u.p=m;u.h=-1;u.Wb=l;u.$=r;u.na=0;u.Sa=m;var cc=45E3,dc=250;function ec(a,b){switch(a){case 0:return"Non-200 return code ("+b+")";case 1:return"XMLHTTP failure (no data)";case 2:return"HttpConnection timeout";default:return"Unknown error"}}var fc={},gc={};
function hc(){return!E||E&&10<=Na}u=T.prototype;u.X=t("v");u.setTimeout=t("Ca");u.Zb=t("na");function ic(a,b,c){a.ra=1;a.S=M(b.n());a.W=c;a.wb=l;jc(a,m)}function kc(a,b,c,d,f){a.ra=1;a.S=M(b.n());a.W=m;a.wb=c;f&&(a.Wb=r);jc(a,d)}
function jc(a,b){a.oa=C();lc(a);a.w=a.S.n();sb(a.w,"t",a.Ba);a.Ea=0;a.l=a.b.gb(a.b.Xa()?b:m);0<a.na&&(a.Sa=new ac(B(a.cc,a,a.l),a.na));$b(a.ib,a.l,"readystatechange",a.zc);var c;if(a.v){c=a.v;var d={},f;for(f in c)d[f]=c[f];c=d}else c={};a.W?(a.sa="POST",c["Content-Type"]="application/x-www-form-urlencoded",a.l.send(a.w,a.sa,a.W,c)):(a.sa="GET",a.Wb&&!F&&(c.Connection="close"),a.l.send(a.w,a.sa,m,c));a.b.F(mc);if(d=a.W){c="";d=d.split("&");for(f=0;f<d.length;f++){var g=d[f].split("=");if(1<g.length){var k=
g[0],g=g[1],q=k.split("_");c=2<=q.length&&"type"==q[1]?c+(k+"="+g+"&"):c+(k+"=redacted&")}}}else c=m;a.a.info("XMLHTTP REQ ("+a.A+") [attempt "+a.Ba+"]: "+a.sa+"\n"+a.w+"\n"+c)}u.zc=function(a){a=a.target;var b=this.Sa;b&&3==U(a)?(this.a.debug("Throttling readystatechange."),!b.r&&!b.Sb?bc(b):b.Wa=l):this.cc(a)};
u.cc=function(a){try{if(a==this.l)a:{var b=U(this.l),c=this.l.ka,d=nc(this.l);if(!hc()||F&&!G("420+")){if(4>b)break a}else if(3>b||3==b&&!Aa&&!oc(this.l))break a;!this.$&&(4==b&&c!=pc)&&(c==qc||0>=d?this.b.F(rc):this.b.F(sc));tc(this);var f=nc(this.l);this.h=f;var g=oc(this.l);g||this.a.debug("No response text for uri "+this.w+" status "+f);this.I=200==f;this.a.info("XMLHTTP RESP ("+this.A+") [ attempt "+this.Ba+"]: "+this.sa+"\n"+this.w+"\n"+b+" "+f);this.I?(4==b&&uc(this),this.wb?(vc(this,b,g),
Aa&&3==b&&($b(this.ib,this.Ra,Xb,this.yc),this.Ra.start())):(wc(this.a,this.A,g,m),xc(this,g)),this.I&&!this.$&&(4==b?this.b.la(this):(this.I=r,lc(this)))):(400==f&&0<g.indexOf("Unknown SID")?(this.p=3,V(yc),this.a.Z("XMLHTTP Unknown SID ("+this.A+")")):(this.p=0,V(zc),this.a.Z("XMLHTTP Bad status "+f+" ("+this.A+")")),uc(this),Ac(this))}else this.a.Z("Called back with an unexpected xmlhttp")}catch(k){this.a.debug("Failed call to OnXmlHttpReadyStateChanged_"),this.l&&oc(this.l)?Bc(this.a,k,"ResponseText: "+
oc(this.l)):Bc(this.a,k,"No response text")}finally{}};function vc(a,b,c){for(var d=l;!a.$&&a.Ea<c.length;){var f=Cc(a,c);if(f==gc){4==b&&(a.p=4,V(Dc),d=r);wc(a.a,a.A,m,"[Incomplete Response]");break}else if(f==fc){a.p=4;V(Ec);wc(a.a,a.A,c,"[Invalid Chunk]");d=r;break}else wc(a.a,a.A,f,m),xc(a,f)}4==b&&0==c.length&&(a.p=1,V(Fc),d=r);a.I=a.I&&d;d||(wc(a.a,a.A,c,"[Invalid Chunked Response]"),uc(a),Ac(a))}
u.yc=function(){var a=U(this.l),b=oc(this.l);this.Ea<b.length&&(tc(this),vc(this,a,b),this.I&&4!=a&&lc(this))};function Cc(a,b){var c=a.Ea,d=b.indexOf("\n",c);if(-1==d)return gc;c=Number(b.substring(c,d));if(isNaN(c))return fc;d+=1;if(d+c>b.length)return gc;var f=b.substr(d,c);a.Ea=d+c;return f}
function Gc(a,b){a.oa=C();lc(a);var c=b?window.location.hostname:"";a.w=a.S.n();K(a.w,"DOMAIN",c);K(a.w,"t",a.Ba);try{a.J=new ActiveXObject("htmlfile")}catch(d){a.a.H("ActiveX blocked");uc(a);a.p=7;V(Hc);Ac(a);return}var f="<html><body>";b&&(f+='<script>document.domain="'+c+'"\x3c/script>');f+="</body></html>";a.J.open();a.J.write(f);a.J.close();a.J.parentWindow.m=B(a.vc,a);a.J.parentWindow.d=B(a.Rb,a,l);a.J.parentWindow.rpcClose=B(a.Rb,a,r);c=a.J.createElement("div");a.J.parentWindow.document.body.appendChild(c);
c.innerHTML='<iframe src="'+a.w+'"></iframe>';a.a.info("TRIDENT REQ ("+a.A+") [ attempt "+a.Ba+"]: GET\n"+a.w);a.b.F(mc)}u.vc=function(a){W(B(this.uc,this,a),0)};u.uc=function(a){if(!this.$){var b=this.a;b.info("TRIDENT TEXT ("+this.A+"): "+Ic(b,a));tc(this);xc(this,a);lc(this)}};u.Rb=function(a){W(B(this.tc,this,a),0)};u.tc=function(a){this.$||(this.a.info("TRIDENT TEXT ("+this.A+"): "+a?"success":"failure"),uc(this),this.I=a,this.b.la(this),this.b.F(Jc))};u.kc=function(){tc(this);this.b.la(this)};
u.cancel=function(){this.$=l;uc(this)};function lc(a){a.rb=C()+a.Ca;Kc(a,a.Ca)}function Kc(a,b){a.ta!=m&&e(Error("WatchDog timer not null"));a.ta=W(B(a.wc,a),b)}function tc(a){a.ta&&(w.clearTimeout(a.ta),a.ta=m)}u.wc=function(){this.ta=m;var a=C();0<=a-this.rb?(this.I&&this.a.H("Received watchdog timeout even though request loaded successfully"),this.a.info("TIMEOUT: "+this.w),2!=this.ra&&this.b.F(rc),uc(this),this.p=2,V(Lc),Ac(this)):(this.a.Z("WatchDog timer called too early"),Kc(this,this.rb-a))};
function Ac(a){!a.b.Gb()&&!a.$&&a.b.la(a)}function uc(a){tc(a);var b=a.Sa;b&&"function"==typeof b.Ha&&b.Ha();a.Sa=m;a.Ra.stop();b=a.ib;Za(b.j,Pb);b.j.length=0;a.l&&(b=a.l,a.l=m,b.abort(),b.Ha());a.J&&(a.J=m)}u.Db=aa("p");function xc(a,b){try{a.b.Ob(a,b),a.b.F(Jc)}catch(c){Bc(a.a,c,"Error in httprequest callback")}};function Mc(a){a=String(a);if(/^\s*$/.test(a)?0:/^[\],:{}\s\u2028\u2029]*$/.test(a.replace(/\\["\\\/bfnrtu]/g,"@").replace(/"[^"\\\n\r\u2028\u2029\x00-\x08\x0a-\x1f]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:[\s\u2028\u2029]*\[)+/g,"")))try{return eval("("+a+")")}catch(b){}e(Error("Invalid JSON string: "+a))}function Nc(a){return eval("("+a+")")}function Oc(a){var b=[];Pc(new Qc(h),a,b);return b.join("")}function Qc(a){this.Ua=a}
function Pc(a,b,c){switch(typeof b){case "string":Rc(b,c);break;case "number":c.push(isFinite(b)&&!isNaN(b)?b:"null");break;case "boolean":c.push(b);break;case "undefined":c.push("null");break;case "object":if(b==m){c.push("null");break}if(x(b)){var d=b.length;c.push("[");for(var f="",g=0;g<d;g++)c.push(f),f=b[g],Pc(a,a.Ua?a.Ua.call(b,String(g),f):f,c),f=",";c.push("]");break}c.push("{");d="";for(g in b)Object.prototype.hasOwnProperty.call(b,g)&&(f=b[g],"function"!=typeof f&&(c.push(d),Rc(g,c),c.push(":"),
Pc(a,a.Ua?a.Ua.call(b,g,f):f,c),d=","));c.push("}");break;case "function":break;default:e(Error("Unknown type: "+typeof b))}}var Sc={'"':'\\"',"\\":"\\\\","/":"\\/","\b":"\\b","\f":"\\f","\n":"\\n","\r":"\\r","\t":"\\t","\x0B":"\\u000b"},Tc=/\uffff/.test("\uffff")?/[\\\"\x00-\x1f\x7f-\uffff]/g:/[\\\"\x00-\x1f\x7f-\xff]/g;
function Rc(a,b){b.push('"',a.replace(Tc,function(a){if(a in Sc)return Sc[a];var b=a.charCodeAt(0),f="\\u";16>b?f+="000":256>b?f+="00":4096>b&&(f+="0");return Sc[a]=f+b.toString(16)}),'"')};function Uc(a){return Vc(a||arguments.callee.caller,[])}
function Vc(a,b){var c=[];if(0<=Ya(b,a))c.push("[...circular reference...]");else if(a&&50>b.length){c.push(Wc(a)+"(");for(var d=a.arguments,f=0;f<d.length;f++){0<f&&c.push(", ");var g;g=d[f];switch(typeof g){case "object":g=g?"object":"null";break;case "string":break;case "number":g=String(g);break;case "boolean":g=g?"true":"false";break;case "function":g=(g=Wc(g))?g:"[fn]";break;default:g=typeof g}40<g.length&&(g=g.substr(0,40)+"...");c.push(g)}b.push(a);c.push(")\n");try{c.push(Vc(a.caller,b))}catch(k){c.push("[exception trying to get caller]\n")}}else a?
c.push("[...long stack...]"):c.push("[end]");return c.join("")}function Wc(a){if(Xc[a])return Xc[a];a=String(a);if(!Xc[a]){var b=/function ([^\(]+)/.exec(a);Xc[a]=b?b[1]:"[Anonymous]"}return Xc[a]}var Xc={};function Yc(a,b,c,d,f){this.reset(a,b,c,d,f)}Yc.prototype.Bc=0;Yc.prototype.Ab=m;Yc.prototype.zb=m;var Zc=0;Yc.prototype.reset=function(a,b,c,d,f){this.Bc="number"==typeof f?f:Zc++;this.Pc=d||C();this.ya=a;this.nc=b;this.Hc=c;delete this.Ab;delete this.zb};Yc.prototype.Xb=t("ya");function $c(a){this.oc=a}$c.prototype.Qa=m;$c.prototype.ya=m;$c.prototype.eb=m;$c.prototype.Eb=m;function ad(a,b){this.name=a;this.value=b}ad.prototype.toString=aa("name");var bd=new ad("SEVERE",1E3),cd=new ad("WARNING",900),dd=new ad("INFO",800),ed=new ad("CONFIG",700),fd=new ad("FINE",500);u=$c.prototype;u.getParent=aa("Qa");u.Xb=t("ya");function gd(a){if(a.ya)return a.ya;if(a.Qa)return gd(a.Qa);Qa("Root logger has no level set.");return m}
u.log=function(a,b,c){if(a.value>=gd(this).value){a=this.jc(a,b,c);b="log:"+a.nc;w.msWriteProfilerMark&&w.msWriteProfilerMark(b);for(b=this;b;){c=b;var d=a;if(c.Eb)for(var f=0,g=h;g=c.Eb[f];f++)g(d);b=b.getParent()}}};
u.jc=function(a,b,c){var d=new Yc(a,String(b),this.oc);if(c){d.Ab=c;var f;var g=arguments.callee.caller;try{var k;var q=da("window.location.href");if(z(c))k={message:c,name:"Unknown error",lineNumber:"Not available",fileName:q,stack:"Not available"};else{var n,y,p=r;try{n=c.lineNumber||c.Gc||"Not available"}catch(v){n="Not available",p=l}try{y=c.fileName||c.filename||c.sourceURL||w.$googDebugFname||q}catch(L){y="Not available",p=l}k=p||!c.lineNumber||!c.fileName||!c.stack?{message:c.message,name:c.name,
lineNumber:n,fileName:y,stack:c.stack||"Not available"}:c}f="Message: "+na(k.message)+'\nUrl: <a href="view-source:'+k.fileName+'" target="_new">'+k.fileName+"</a>\nLine: "+k.lineNumber+"\n\nBrowser stack:\n"+na(k.stack+"-> ")+"[end]\n\nJS stack traversal:\n"+na(Uc(g)+"-> ")}catch(Yd){f="Exception trying to expose exception! You win, we lose. "+Yd}d.zb=f}return d};u.H=function(a,b){this.log(bd,a,b)};u.Z=function(a,b){this.log(cd,a,b)};u.info=function(a,b){this.log(dd,a,b)};
function X(a,b){a.log(fd,b,h)}var hd={},id=m;function jd(a){id||(id=new $c(""),hd[""]=id,id.Xb(ed));var b;if(!(b=hd[a])){b=new $c(a);var c=a.lastIndexOf("."),d=a.substr(c+1),c=jd(a.substr(0,c));c.eb||(c.eb={});c.eb[d]=b;b.Qa=c;hd[a]=b}return b};function kd(){this.q=jd("goog.net.BrowserChannel")}function wc(a,b,c,d){a.info("XMLHTTP TEXT ("+b+"): "+Ic(a,c)+(d?" "+d:""))}kd.prototype.debug=function(a){this.info(a)};function Bc(a,b,c){a.H((c||"Exception")+b)}kd.prototype.info=function(a){this.q.info(a)};kd.prototype.Z=function(a){this.q.Z(a)};kd.prototype.H=function(a){this.q.H(a)};
function Ic(a,b){if(!b||b==ld)return b;try{var c=Nc(b);if(c)for(var d=0;d<c.length;d++)if(x(c[d])){var f=c[d];if(!(2>f.length)){var g=f[1];if(x(g)&&!(1>g.length)){var k=g[0];if("noop"!=k&&"stop"!=k)for(var q=1;q<g.length;q++)g[q]=""}}}return Oc(c)}catch(n){return a.debug("Exception parsing expected JS array - probably was not JS"),b}};function md(a,b){this.Nc=new Qc(a);this.O=b?Nc:Mc}md.prototype.parse=function(a){return this.O(a)};var pc=7,qc=8;function nd(a){P.call(this);this.headers=new db;this.ua=a||m}D(nd,Ub);nd.prototype.q=jd("goog.net.XhrIo");var od=/^https?$/i;u=nd.prototype;u.R=r;u.g=m;u.ab=m;u.Oa="";u.Ib="";u.ka=0;u.p="";u.hb=r;u.Ma=r;u.lb=r;u.ba=r;u.Za=0;u.ea=m;u.Vb="";u.bc=r;
u.send=function(a,b,c,d){this.g&&e(Error("[goog.net.XhrIo] Object is active with another request="+this.Oa+"; newUri="+a));b=b?b.toUpperCase():"GET";this.Oa=a;this.p="";this.ka=0;this.Ib=b;this.hb=r;this.R=l;this.g=this.ua?zb(this.ua):zb(xb);this.ab=this.ua?this.ua.Fa||(this.ua.Fa=Bb(this.ua)):xb.Fa||(xb.Fa=Bb(xb));this.g.onreadystatechange=B(this.Nb,this);try{X(this.q,Y(this,"Opening Xhr")),this.lb=l,this.g.open(b,a,l),this.lb=r}catch(f){X(this.q,Y(this,"Error opening Xhr: "+f.message));pd(this,
f);return}a=c||"";var g=this.headers.n();d&&cb(d,function(a,b){g.set(b,a)});d=w.FormData&&a instanceof w.FormData;"POST"==b&&(!g.ha("Content-Type")&&!d)&&g.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");cb(g,function(a,b){this.g.setRequestHeader(b,a)},this);this.Vb&&(this.g.responseType=this.Vb);"withCredentials"in this.g&&(this.g.withCredentials=this.bc);try{this.ea&&(Wb.clearTimeout(this.ea),this.ea=m),0<this.Za&&(X(this.q,Y(this,"Will abort after "+this.Za+"ms if incomplete")),
this.ea=Wb.setTimeout(B(this.Ca,this),this.Za)),X(this.q,Y(this,"Sending request")),this.Ma=l,this.g.send(a),this.Ma=r}catch(k){X(this.q,Y(this,"Send error: "+k.message)),pd(this,k)}};u.Ca=function(){"undefined"!=typeof ca&&this.g&&(this.p="Timed out after "+this.Za+"ms, aborting",this.ka=qc,X(this.q,Y(this,this.p)),this.dispatchEvent("timeout"),this.abort(qc))};function pd(a,b){a.R=r;a.g&&(a.ba=l,a.g.abort(),a.ba=r);a.p=b;a.ka=5;qd(a);rd(a)}
function qd(a){a.hb||(a.hb=l,a.dispatchEvent("complete"),a.dispatchEvent("error"))}u.abort=function(a){this.g&&this.R&&(X(this.q,Y(this,"Aborting")),this.R=r,this.ba=l,this.g.abort(),this.ba=r,this.ka=a||pc,this.dispatchEvent("complete"),this.dispatchEvent("abort"),rd(this))};u.u=function(){this.g&&(this.R&&(this.R=r,this.ba=l,this.g.abort(),this.ba=r),rd(this,l));nd.qa.u.call(this)};u.Nb=function(){!this.lb&&!this.Ma&&!this.ba?this.rc():sd(this)};u.rc=function(){sd(this)};
function sd(a){if(a.R&&"undefined"!=typeof ca)if(a.ab[1]&&4==U(a)&&2==nc(a))X(a.q,Y(a,"Local request error detected and ignored"));else if(a.Ma&&4==U(a))Wb.setTimeout(B(a.Nb,a),0);else if(a.dispatchEvent("readystatechange"),4==U(a)){X(a.q,Y(a,"Request complete"));a.R=r;try{var b=nc(a),c,d;a:switch(b){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:d=l;break a;default:d=r}if(!(c=d)){var f;if(f=0===b){var g=String(a.Oa).match(Ra)[1]||m;if(!g&&self.location)var k=self.location.protocol,
g=k.substr(0,k.length-1);f=!od.test(g?g.toLowerCase():"")}c=f}if(c)a.dispatchEvent("complete"),a.dispatchEvent("success");else{a.ka=6;var q;try{q=2<U(a)?a.g.statusText:""}catch(n){X(a.q,"Can not get status: "+n.message),q=""}a.p=q+" ["+nc(a)+"]";qd(a)}}finally{rd(a)}}}
function rd(a,b){if(a.g){var c=a.g,d=a.ab[0]?ea:m;a.g=m;a.ab=m;a.ea&&(Wb.clearTimeout(a.ea),a.ea=m);b||a.dispatchEvent("ready");try{c.onreadystatechange=d}catch(f){a.q.H("Problem encountered resetting onreadystatechange: "+f.message)}}}u.isActive=function(){return!!this.g};function U(a){return a.g?a.g.readyState:0}function nc(a){try{return 2<U(a)?a.g.status:-1}catch(b){return a.q.Z("Can not get status: "+b.message),-1}}
function oc(a){try{return a.g?a.g.responseText:""}catch(b){return X(a.q,"Can not get responseText: "+b.message),""}}u.Db=function(){return z(this.p)?this.p:String(this.p)};function Y(a,b){return b+" ["+a.Ib+" "+a.Oa+" "+nc(a)+"]"};function td(){this.Ub=C()}new td;td.prototype.set=t("Ub");td.prototype.reset=function(){this.set(C())};td.prototype.get=aa("Ub");function ud(a,b,c,d,f){(new kd).debug("TestLoadImageWithRetries: "+f);if(0==d)c(r);else{var g=f||0;d--;vd(a,b,function(f){f?c(l):w.setTimeout(function(){ud(a,b,c,d,g)},g)})}}
function vd(a,b,c){function d(a,b){return function(){try{f.debug("TestLoadImage: "+b),g.onload=m,g.onerror=m,g.onabort=m,g.ontimeout=m,w.clearTimeout(k),c(a)}catch(d){Bc(f,d)}}}var f=new kd;f.debug("TestLoadImage: loading "+a);var g=new Image,k=m;g.onload=d(l,"loaded");g.onerror=d(r,"error");g.onabort=d(r,"abort");g.ontimeout=d(r,"timeout");k=w.setTimeout(function(){if(g.ontimeout)g.ontimeout()},b);g.src=a};function wd(a,b){this.b=a;this.a=b;this.O=new md(m,l)}u=wd.prototype;u.v=m;u.z=m;u.Ta=r;u.$b=m;u.Ja=m;u.mb=m;u.G=m;u.c=m;u.h=-1;u.K=m;u.va=m;u.X=t("v");u.Yb=t("O");u.fb=function(a){this.G=a;a=xd(this.b,this.G);V(yd);this.$b=C();var b=this.b.Bb;b!=m?(this.K=this.b.correctHostPrefix(b[0]),(this.va=b[1])?(this.c=1,zd(this)):(this.c=2,Ad(this))):(sb(a,"MODE","init"),this.z=new T(this,this.a,h,h,h),this.z.X(this.v),kc(this.z,a,r,m,l),this.c=0)};
function zd(a){var b=Bd(a.b,a.va,"/mail/images/cleardot.gif");M(b);ud(b.toString(),5E3,B(a.hc,a),3,2E3);a.F(mc)}u.hc=function(a){if(a)this.c=2,Ad(this);else{V(Cd);var b=this.b;b.a.debug("Test Connection Blocked");b.h=b.T.h;Z(b,9)}a&&this.F(sc)};function Ad(a){a.a.debug("TestConnection: starting stage 2");a.z=new T(a,a.a,h,h,h);a.z.X(a.v);var b=Dd(a.b,a.K,a.G);V(Ed);if(hc())sb(b,"TYPE","xmlhttp"),kc(a.z,b,r,a.K,r);else{sb(b,"TYPE","html");var c=a.z;a=Boolean(a.K);c.ra=3;c.S=M(b.n());Gc(c,a)}}
u.gb=function(a){return this.b.gb(a)};u.abort=function(){this.z&&(this.z.cancel(),this.z=m);this.h=-1};u.Gb=ba(r);
u.Ob=function(a,b){this.h=a.h;if(0==this.c)if(this.a.debug("TestConnection: Got data for stage 1"),b){try{var c=this.O.parse(b)}catch(d){Bc(this.a,d);Fd(this.b,this);return}this.K=this.b.correctHostPrefix(c[0]);this.va=c[1]}else this.a.debug("TestConnection: Null responseText"),Fd(this.b,this);else if(2==this.c)if(this.Ta)V(Gd),this.mb=C();else if("11111"==b){if(V(Hd),this.Ta=l,this.Ja=C(),c=this.Ja-this.$b,hc()||500>c)this.h=200,this.z.cancel(),this.a.debug("Test connection succeeded; using streaming connection"),
V(Id),Jd(this.b,this,l)}else V(Kd),this.Ja=this.mb=C(),this.Ta=r};
u.la=function(){this.h=this.z.h;if(this.z.I)if(0==this.c)this.a.debug("TestConnection: request complete for initial check"),this.va?(this.c=1,zd(this)):(this.c=2,Ad(this));else{if(2==this.c){this.a.debug("TestConnection: request complete for stage 2");var a=r;(a=hc()?this.Ta:200>this.mb-this.Ja?r:l)?(this.a.debug("Test connection succeeded; using streaming connection"),V(Id),Jd(this.b,this,l)):(this.a.debug("Test connection failed; not using streaming"),V(Ld),Jd(this.b,this,r))}}else this.a.debug("TestConnection: request failed, in state "+
this.c),0==this.c?V(Md):2==this.c&&V(Nd),Fd(this.b,this)};u.Xa=function(){return this.b.Xa()};u.isActive=function(){return this.b.isActive()};u.F=function(a){this.b.F(a)};function Od(a,b){this.ub=a||m;this.c=Pd;this.s=[];this.P=[];this.a=new kd;this.O=new md(m,l);this.Bb=b||m}function Qd(a,b){this.Kb=a;this.map=b;this.Ec=m}u=Od.prototype;u.v=m;u.wa=m;u.o=m;u.k=m;u.G=m;u.Ka=m;u.tb=m;u.K=m;u.ec=l;u.za=0;u.pc=0;u.Ia=r;u.e=m;u.D=m;u.L=m;u.aa=m;u.T=m;u.qb=m;u.dc=l;u.xa=-1;u.Jb=-1;u.h=-1;u.U=0;u.fa=0;u.fc=5E3;u.Ac=1E4;u.jb=2;u.Cb=2E4;u.na=0;u.Ya=r;u.ga=8;var Pd=1,Rd=new Ub;function Sd(a,b){Q.call(this,"statevent",a);this.Oc=b}D(Sd,Q);
function Td(a,b,c,d){Q.call(this,"timingevent",a);this.size=b;this.Mc=c;this.Lc=d}D(Td,Q);var mc=1,sc=2,rc=3,Jc=4;function Ud(a,b){Q.call(this,"serverreachability",a);this.Kc=b}D(Ud,Q);var yd=3,Cd=4,Ed=5,Hd=6,Gd=7,Kd=8,Md=9,Nd=10,Ld=11,Id=12,yc=13,zc=14,Dc=15,Ec=16,Fc=17,Lc=18,Hc=22,ld="y2f%";u=Od.prototype;
u.fb=function(a,b,c,d,f){this.a.debug("connect()");V(0);this.G=b;this.wa=c||{};d&&f!==h&&(this.wa.OSID=d,this.wa.OAID=f);this.a.debug("connectTest_()");Vd(this)&&(this.T=new wd(this,this.a),this.T.X(this.v),this.T.Yb(this.O),this.T.fb(a))};
u.disconnect=function(){this.a.debug("disconnect()");Wd(this);if(3==this.c){var a=this.za++,b=this.Ka.n();K(b,"SID",this.Y);K(b,"RID",a);K(b,"TYPE","terminate");Xd(this,b);a=new T(this,this.a,this.Y,a,h);a.ra=2;a.S=M(b.n());b=new Image;b.src=a.S;b.onload=b.onerror=B(a.kc,a);a.oa=C();lc(a)}Zd(this)};function Wd(a){a.T&&(a.T.abort(),a.T=m);a.k&&(a.k.cancel(),a.k=m);a.L&&(w.clearTimeout(a.L),a.L=m);$d(a);a.o&&(a.o.cancel(),a.o=m);a.D&&(w.clearTimeout(a.D),a.D=m)}u.X=t("v");u.Zb=t("na");
u.Gb=function(){return 0==this.c};u.Yb=t("O");function ae(a){!a.o&&!a.D&&(a.D=W(B(a.Qb,a),0),a.U=0)}
u.Qb=function(a){this.D=m;this.a.debug("startForwardChannel_");if(Vd(this))if(this.c==Pd)if(a)this.a.H("Not supposed to retry the open");else{this.a.debug("open_()");this.za=Math.floor(1E5*Math.random());a=this.za++;var b=new T(this,this.a,"",a,h);b.X(this.v);var c=be(this),d=this.Ka.n();K(d,"RID",a);this.ub&&K(d,"CVER",this.ub);Xd(this,d);ic(b,d,c);this.o=b;this.c=2}else 3==this.c&&(a?ce(this,a):0==this.s.length?this.a.debug("startForwardChannel_ returned: nothing to send"):this.o?this.a.H("startForwardChannel_ returned: connection already in progress"):
(ce(this),this.a.debug("startForwardChannel_ finished, sent request")))};function ce(a,b){var c,d;b?6<a.ga?(a.s=a.P.concat(a.s),a.P.length=0,c=a.za-1,d=be(a)):(c=b.A,d=b.W):(c=a.za++,d=be(a));var f=a.Ka.n();K(f,"SID",a.Y);K(f,"RID",c);K(f,"AID",a.xa);Xd(a,f);c=new T(a,a.a,a.Y,c,a.U+1);c.X(a.v);c.setTimeout(Math.round(0.5*a.Cb)+Math.round(0.5*a.Cb*Math.random()));a.o=c;ic(c,f,d)}function Xd(a,b){if(a.e){var c=a.e.getAdditionalParams(a);c&&cb(c,function(a,c){K(b,c,a)})}}
function be(a){var b=Math.min(a.s.length,1E3),c=["count="+b],d;6<a.ga&&0<b?(d=a.s[0].Kb,c.push("ofs="+d)):d=0;for(var f=0;f<b;f++){var g=a.s[f].Kb,k=a.s[f].map,g=6>=a.ga?f:g-d;try{cb(k,function(a,b){c.push("req"+g+"_"+b+"="+encodeURIComponent(a))})}catch(q){c.push("req"+g+"_type="+encodeURIComponent("_badmap")),a.e&&a.e.badMapError(a,k)}}a.P=a.P.concat(a.s.splice(0,b));return c.join("&")}function de(a){!a.k&&!a.L&&(a.sb=1,a.L=W(B(a.Pb,a),0),a.fa=0)}
function ee(a){if(a.k||a.L)return a.a.H("Request already in progress"),r;if(3<=a.fa)return r;a.a.debug("Going to retry GET");a.sb++;a.L=W(B(a.Pb,a),fe(a,a.fa));a.fa++;return l}
u.Pb=function(){this.L=m;if(Vd(this)){this.a.debug("Creating new HttpRequest");this.k=new T(this,this.a,this.Y,"rpc",this.sb);this.k.X(this.v);this.k.Zb(this.na);var a=this.tb.n();K(a,"RID","rpc");K(a,"SID",this.Y);K(a,"CI",this.qb?"0":"1");K(a,"AID",this.xa);Xd(this,a);if(hc())K(a,"TYPE","xmlhttp"),kc(this.k,a,l,this.K,r);else{K(a,"TYPE","html");var b=this.k,c=Boolean(this.K);b.ra=3;b.S=M(a.n());Gc(b,c)}this.a.debug("New Request created")}};
function Vd(a){if(a.e){var b=a.e.okToMakeRequest(a);if(0!=b)return a.a.debug("Handler returned error code from okToMakeRequest"),Z(a,b),r}return l}function Jd(a,b,c){a.a.debug("Test Connection Finished");a.qb=a.dc&&c;a.h=b.h;a.a.debug("connectChannel_()");a.ic(Pd,0);a.Ka=xd(a,a.G);ae(a)}function Fd(a,b){a.a.debug("Test Connection Failed");a.h=b.h;Z(a,2)}
u.Ob=function(a,b){if(!(0==this.c||this.k!=a&&this.o!=a))if(this.h=a.h,this.o==a&&3==this.c)if(7<this.ga){var c;try{c=this.O.parse(b)}catch(d){c=m}if(x(c)&&3==c.length){var f=c;if(0==f[0])a:if(this.a.debug("Server claims our backchannel is missing."),this.L)this.a.debug("But we are currently starting the request.");else{if(this.k)if(this.k.oa+3E3<this.o.oa)$d(this),this.k.cancel(),this.k=m;else break a;else this.a.Z("We do not have a BackChannel established");ee(this);V(19)}else this.Jb=f[1],c=this.Jb-
this.xa,0<c&&(f=f[2],this.a.debug(f+" bytes (in "+c+" arrays) are outstanding on the BackChannel"),37500>f&&(this.qb&&0==this.fa)&&!this.aa&&(this.aa=W(B(this.qc,this),6E3)))}else this.a.debug("Bad POST response data returned"),Z(this,11)}else b!=ld&&(this.a.debug("Bad data returned - missing/invald magic cookie"),Z(this,11));else if(this.k==a&&$d(this),!/^[\s\xa0]*$/.test(b)){c=this.O.parse(b);for(var f=this.e&&this.e.channelHandleMultipleArrays?[]:m,g=0;g<c.length;g++){var k=c[g];this.xa=k[0];k=
k[1];2==this.c?"c"==k[0]?(this.Y=k[1],this.K=this.correctHostPrefix(k[2]),k=k[3],this.ga=k!=m?k:6,this.c=3,this.e&&this.e.channelOpened(this),this.tb=Dd(this,this.K,this.G),de(this)):"stop"==k[0]&&Z(this,7):3==this.c&&("stop"==k[0]?(f&&f.length&&(this.e.channelHandleMultipleArrays(this,f),f.length=0),Z(this,7)):"noop"!=k[0]&&(f?f.push(k):this.e&&this.e.channelHandleArray(this,k)),this.fa=0)}f&&f.length&&this.e.channelHandleMultipleArrays(this,f)}};
u.correctHostPrefix=function(a){return this.ec?this.e?this.e.correctHostPrefix(a):a:m};u.qc=function(){this.aa!=m&&(this.aa=m,this.k.cancel(),this.k=m,ee(this),V(20))};function $d(a){a.aa!=m&&(w.clearTimeout(a.aa),a.aa=m)}
u.la=function(a){this.a.debug("Request complete");var b;if(this.k==a)$d(this),this.k=m,b=2;else if(this.o==a)this.o=m,b=1;else return;this.h=a.h;if(0!=this.c)if(a.I)1==b?(b=C()-a.oa,Rd.dispatchEvent(new Td(Rd,a.W?a.W.length:0,b,this.U)),ae(this),this.P.length=0):de(this);else{var c=a.Db();if(3==c||7==c||0==c&&0<this.h)this.a.debug("Not retrying due to error type");else{this.a.debug("Maybe retrying, last error: "+ec(c,this.h));var d;if(d=1==b)this.o||this.D?(this.a.H("Request already in progress"),
d=r):this.c==Pd||this.U>=(this.Ia?0:this.jb)?d=r:(this.a.debug("Going to retry POST"),this.D=W(B(this.Qb,this,a),fe(this,this.U)),this.U++,d=l);if(d||2==b&&ee(this))return;this.a.debug("Exceeded max number of retries")}this.a.debug("Error: HTTP request failed");switch(c){case 1:Z(this,5);break;case 4:Z(this,10);break;case 3:Z(this,6);break;case 7:Z(this,12);break;default:Z(this,2)}}};
function fe(a,b){var c=a.fc+Math.floor(Math.random()*a.Ac);a.isActive()||(a.a.debug("Inactive channel"),c*=2);return c*b}u.ic=function(a){0<=Ya(arguments,this.c)||e(Error("Unexpected channel state: "+this.c))};function Z(a,b){a.a.info("Error code "+b);if(2==b||9==b){var c=m;a.e&&(c=a.e.getNetworkTestImageUri(a));var d=B(a.Cc,a);c||(c=new I("//www.google.com/images/cleardot.gif"),M(c));vd(c.toString(),1E4,d)}else V(2);ge(a,b)}
u.Cc=function(a){a?(this.a.info("Successfully pinged google.com"),V(2)):(this.a.info("Failed to ping google.com"),V(1),ge(this,8))};function ge(a,b){a.a.debug("HttpChannel: error - "+b);a.c=0;a.e&&a.e.channelError(a,b);Zd(a);Wd(a)}function Zd(a){a.c=0;a.h=-1;if(a.e)if(0==a.P.length&&0==a.s.length)a.e.channelClosed(a);else{a.a.debug("Number of undelivered maps, pending: "+a.P.length+", outgoing: "+a.s.length);var b=ab(a.P),c=ab(a.s);a.P.length=0;a.s.length=0;a.e.channelClosed(a,b,c)}}
function xd(a,b){var c=Bd(a,m,b);a.a.debug("GetForwardChannelUri: "+c);return c}function Dd(a,b,c){b=Bd(a,a.Xa()?b:m,c);a.a.debug("GetBackChannelUri: "+b);return b}function Bd(a,b,c){var d=c instanceof I?c.n():new I(c,h);if(""!=d.ia)b&&hb(d,b+"."+d.ia),ib(d,d.Aa);else var f=window.location,d=ub(f.protocol,b?b+"."+f.hostname:f.hostname,f.port,c);a.wa&&cb(a.wa,function(a,b){K(d,b,a)});K(d,"VER",a.ga);Xd(a,d);return d}
u.gb=function(a){a&&!this.Ya&&e(Error("Can't create secondary domain capable XhrIo object."));a=new nd;a.bc=this.Ya;return a};u.isActive=function(){return!!this.e&&this.e.isActive(this)};function W(a,b){ha(a)||e(Error("Fn must not be null and must be a function"));return w.setTimeout(function(){a()},b)}u.F=function(a){Rd.dispatchEvent(new Ud(Rd,a))};function V(a){Rd.dispatchEvent(new Sd(Rd,a))}u.Xa=function(){return this.Ya||!hc()};function he(){}u=he.prototype;u.channelHandleMultipleArrays=m;
u.okToMakeRequest=ba(0);u.channelOpened=s();u.channelHandleArray=s();u.channelError=s();u.channelClosed=s();u.getAdditionalParams=function(){return{}};u.getNetworkTestImageUri=ba(m);u.isActive=ba(l);u.badMapError=s();u.correctHostPrefix=function(a){return a};var $,ie,je=[].slice;ie={0:"Ok",4:"User is logging out",6:"Unknown session ID",7:"Stopped by server",8:"General network error",2:"Request failed",9:"Blocked by a network administrator",5:"No data from server",10:"Got bad data from the server",11:"Got a bad response from the server"};
$=function(a,b){var c,d,f,g,k,q,n,y,p,v;y=this;a||(a="channel");a.match(/:\/\//)&&a.replace(/^ws/,"http");b||(b={});if(x(b||"string"===typeof b))b={};q=b.reconnectTime||3E3;v=function(a){y.readyState=y.readyState=a};v(this.CLOSED);p=m;g=b.Jc;c=function(){var a,b;b=arguments[0];a=2<=arguments.length?je.call(arguments,1):[];try{return"function"===typeof y[b]?y[b].apply(y,a):h}catch(c){a=c,e(a)}};d=new he;d.channelOpened=function(){g=
p;v($.OPEN);return c("onopen")};f=m;d.channelError=function(a,b){var d;d=ie[b];f=b;v($.bb);try{return c("onerror",d,b)}catch(g){}};n=m;d.channelClosed=function(a,d,g){if(y.readyState!==$.CLOSED){p=m;a=f?ie[f]:"Closed";v($.CLOSED);try{c("onclose",a,d,g)}catch(ke){}b.reconnect&&(7!==f&&0!==f)&&(d=6===f?0:q,clearTimeout(n),n=setTimeout(k,d));return f=m}};d.channelHandleArray=function(a,b){return c("onmessage",b)};k=function(){p&&e(Error("Reconnect() called from invalid state"));v($.CONNECTING);c("onconnecting");
clearTimeout(n);p=new Od(b.appVersion,g!=m?g.Bb:h);b.crossDomainXhr&&(p.Ya=l);p.e=d;f=m;if(b.failFast){var k=p;k.Ia=l;k.a.info("setFailFast: true");if((k.o||k.D)&&k.U>(k.Ia?0:k.jb))k.a.info("Retry count "+k.U+" > new maxRetries "+(k.Ia?0:k.jb)+". Fail immediately!"),k.o?(k.o.cancel(),k.la(k.o)):(w.clearTimeout(k.D),k.D=m,Z(k,2))}return p.fb(""+a+"/test",""+a+"/bind",m,g!=m?g.Y:h,g!=m?g.xa:h)};this.open=function(){y.readyState!==y.CLOSED&&e(Error("Already open"));return k()};this.close=function(){clearTimeout(n);
f=0;if(y.readyState!==$.CLOSED)return v($.bb),p.disconnect()};this.sendMap=function(a){var b;((b=y.readyState)===$.bb||b===$.CLOSED)&&e(Error("Cannot send to a closed connection"));b=p;0==b.c&&e(Error("Invalid operation: sending map when state is closed"));1E3==b.s.length&&b.a.H("Already have 1000 queued maps upon queueing "+Oc(a));b.s.push(new Qd(b.pc++,a));(2==b.c||3==b.c)&&ae(b)};this.send=function(a){return this.sendMap({JSON:Oc(a)})};k();return this};
$.prototype.CONNECTING=$.CONNECTING=$.CONNECTING=0;$.prototype.OPEN=$.OPEN=$.OPEN=1;$.prototype.CLOSING=$.CLOSING=$.bb=2;$.prototype.CLOSED=$.CLOSED=$.CLOSED=3;("undefined"!==typeof exports&&exports!==m?exports:window).BCSocket=$;
})();

// shareJS
(function(){var e,t,n,r,i,s,o,u,a,f,l,c,h,p,d,v,m,g,y,b,w,E,S=[].slice,x=function(e,t){return function(){return e.apply(t,arguments)}},T=[].indexOf||function(e){for(var t=0,n=this.length;t<n;t++)if(t in this&&this[t]===e)return t;return-1};window.sharejs=c={version:"0.6.3"},v=function(e){return setTimeout(e,0)},r=function(){function e(){}return e.prototype.on=function(e,t){var n;return this._events||(this._events={}),(n=this._events)[e]||(n[e]=[]),this._events[e].push(t),this},e.prototype.removeListener=function(e,t){var n,r,i,s=this;this._events||(this._events={}),r=(i=this._events)[e]||(i[e]=[]),n=0;while(n<r.length)r[n]===t&&(r[n]=void 0),n++;return v(function(){var t;return s._events[e]=function(){var n,r,i=this._events[e],s=[];for(n=0,r=i.length;n<r;n++)t=i[n],t&&s.push(t);return s}.call(s)}),this},e.prototype.emit=function(){var e,t,n,r,i,s=arguments[0],o=2<=arguments.length?S.call(arguments,1):[];if((r=this._events)!=null?!r[s]:!void 0)return this;i=this._events[s];for(t=0,n=i.length;t<n;t++)e=i[t],e&&e.apply(this,o);return this},e.prototype.once=function(e,t){var n,r=this;return this.on(e,n=function(){var i=1<=arguments.length?S.call(arguments,0):[];return r.removeListener(e,n),t.apply(r,i)})},e}(),r.mixin=function(e){var t=e.prototype||e;return t.on=r.prototype.on,t.removeListener=r.prototype.removeListener,t.emit=r.prototype.emit,t.once=r.prototype.once,e},c._bt=a=function(e,t,n,r){var i,s=function(e,n,r,i){return t(r,e,n,"left"),t(i,n,e,"right")};return e.transformX=e.transformX=i=function(e,t){var o,u,a,f,l,c,h,p,d,v,m,g,y,b,w,E,S,x,T;n(e),n(t),l=[];for(v=0,b=t.length;v<b;v++){d=t[v],f=[],o=0;while(o<e.length){c=[],s(e[o],d,f,c),o++;if(c.length!==1){if(c.length===0){x=e.slice(o);for(m=0,w=x.length;m<w;m++)u=x[m],r(f,u);d=null;break}T=i(e.slice(o),c),a=T[0],p=T[1];for(g=0,E=a.length;g<E;g++)u=a[g],r(f,u);for(y=0,S=p.length;y<S;y++)h=p[y],r(l,h);d=null;break}d=c[0]}d!=null&&r(l,d),e=f}return[e,l]},e.transform=e.transform=function(e,n,r){var s,o,u,a,f;if(r!=="left"&&r!=="right")throw new Error("type must be 'left' or 'right'");return n.length===0?e:e.length===1&&n.length===1?t([],e[0],n[0],r):r==="left"?(a=i(e,n),s=a[0],u=a[1],s):(f=i(n,e),u=f[0],o=f[1],o)}},y={},y.name="text",y.create=function(){return""},g=function(e,t,n){return e.slice(0,t)+n+e.slice(t)},f=function(e){var t,n;if(typeof e.p!="number")throw new Error("component missing position field");n=typeof e.i,t=typeof e.d;if(!(n==="string"^t==="string"))throw new Error("component needs an i or d field");if(!(e.p>=0))throw new Error("position cannot be negative")},l=function(e){var t,n,r;for(n=0,r=e.length;n<r;n++)t=e[n],f(t);return!0},y.apply=function(e,t){var n,r,i,s;l(t);for(i=0,s=t.length;i<s;i++){n=t[i];if(n.i!=null)e=g(e,n.p,n.i);else{r=e.slice(n.p,n.p+n.d.length);if(n.d!==r)throw new Error("Delete component '"+n.d+"' does not match deleted text '"+r+"'");e=e.slice(0,n.p)+e.slice(n.p+n.d.length)}}return e},y._append=u=function(e,t){var n,r,i;if(t.i===""||t.d==="")return;return e.length===0?e.push(t):(n=e[e.length-1],n.i!=null&&t.i!=null&&n.p<=(r=t.p)&&r<=n.p+n.i.length?e[e.length-1]={i:g(n.i,t.p-n.p,t.i),p:n.p}:n.d!=null&&t.d!=null&&t.p<=(i=n.p)&&i<=t.p+t.d.length?e[e.length-1]={d:g(t.d,n.p-t.p,n.d),p:t.p}:e.push(t))},y.compose=function(e,t){var n,r,i,s;l(e),l(t),r=e.slice();for(i=0,s=t.length;i<s;i++)n=t[i],u(r,n);return r},y.compress=function(e){return y.compose([],e)},y.normalize=function(e){var t,n,r,i,s=[];if(e.i!=null||e.p!=null)e=[e];for(n=0,r=e.length;n<r;n++)t=e[n],(i=t.p)==null&&(t.p=0),u(s,t);return s},w=function(e,t,n){return t.i!=null?t.p<e||t.p===e&&n?e+t.i.length:e:e<=t.p?e:e<=t.p+t.d.length?t.p:e-t.d.length},y.transformCursor=function(e,t,n){var r,i,s,o=n==="right";for(i=0,s=t.length;i<s;i++)r=t[i],e=w(e,r,o);return e},y._tc=b=function(e,t,n,r){var i,s,o,a,f,c;l([t]),l([n]);if(t.i!=null)u(e,{i:t.i,p:w(t.p,n,r==="right")});else if(n.i!=null)c=t.d,t.p<n.p&&(u(e,{d:c.slice(0,n.p-t.p),p:t.p}),c=c.slice(n.p-t.p)),c!==""&&u(e,{d:c,p:t.p+n.i.length});else if(t.p>=n.p+n.d.length)u(e,{d:t.d,p:t.p-n.d.length});else if(t.p+t.d.length<=n.p)u(e,t);else{a={d:"",p:t.p},t.p<n.p&&(a.d=t.d.slice(0,n.p-t.p)),t.p+t.d.length>n.p+n.d.length&&(a.d+=t.d.slice(n.p+n.d.length-t.p)),o=Math.max(t.p,n.p),s=Math.min(t.p+t.d.length,n.p+n.d.length),i=t.d.slice(o-t.p,s-t.p),f=n.d.slice(o-n.p,s-n.p);if(i!==f)throw new Error("Delete ops delete different text in the same region of the document");a.d!==""&&(a.p=w(a.p,n),u(e,a))}return e},d=function(e){return e.i!=null?{d:e.i,p:e.p}:{i:e.d,p:e.p}},y.invert=function(e){var t,n,r,i=e.slice().reverse(),s=[];for(n=0,r=i.length;n<r;n++)t=i[n],s.push(d(t));return s},c.types||(c.types={}),a(y,b,l,u),c.types.text=y,y.api={provides:{text:!0},getLength:function(){return this.snapshot.length},getText:function(){return this.snapshot},insert:function(e,t,n){var r=[{p:e,i:t}];return this.submitOp(r,n),r},del:function(e,t,n){var r=[{p:e,d:this.snapshot.slice(e,e+t)}];return this.submitOp(r,n),r},_register:function(){return this.on("remoteop",function(e){var t,n,r,i=[];for(n=0,r=e.length;n<r;n++)t=e[n],t.i!==void 0?i.push(this.emit("insert",t.p,t.i)):i.push(this.emit("delete",t.p,t.d));return i})}},c.extendDoc=function(e,t){return n.prototype[e]=t},n=function(){function e(e,t,n){this.connection=e,this.name=t,this.shout=x(this.shout,this),this.flush=x(this.flush,this),n||(n={}),this.version=n.v,this.snapshot=n.snaphot,n.type&&this._setType(n.type),this.state="closed",this.autoOpen=!1,this._create=n.create,this.inflightOp=null,this.inflightCallbacks=[],this.inflightSubmittedIds=[],this.pendingOp=null,this.pendingCallbacks=[],this.serverOps={}}return e.prototype._xf=function(e,t){var n,r;return this.type.transformX?this.type.transformX(e,t):(n=this.type.transform(e,t,"left"),r=this.type.transform(t,e,"right"),[n,r])},e.prototype._otApply=function(e,t){var n=this.snapshot;this.snapshot=this.type.apply(this.snapshot,e),this.emit("change",e,n);if(t)return this.emit("remoteop",e,n)},e.prototype._connectionStateChanged=function(e,t){switch(e){case"disconnected":this.state="closed",this.inflightOp&&this.inflightSubmittedIds.push(this.connection.id),this.emit("closed");break;case"ok":this.autoOpen&&this.open();break;case"stopped":typeof this._openCallback=="function"&&this._openCallback(t)}return this.emit(e,t)},e.prototype._setType=function(e){var t,n,r;if(this.type)return;typeof e=="string"&&(e=E[e]);if(!e||!e.compose)throw new Error("Support for types without compose() is not implemented");this.type=e;if(e.api){r=e.api;for(t in r)n=r[t],this[t]=n;return typeof this._register=="function"?this._register():void 0}return this.provides={}},e.prototype._onMessage=function(e){var t,n,r,i,s,o,u,a,f,l,c,h,p,d,v,m,g,y,b,w;switch(!1){case e.open!==!0:return this.state="open",this._create=!1,this.created==null&&(this.created=!!e.create),e.type&&this._setType(e.type),e.create?(this.created=!0,this.snapshot=this.type.create()):(this.created!==!0&&(this.created=!1),e.snapshot!==void 0&&(this.snapshot=e.snapshot)),e.meta&&(this.meta=e.meta),e.v!=null&&(this.version=e.v),this.inflightOp?(u={doc:this.name,op:this.inflightOp,v:this.version},this.inflightSubmittedIds.length&&(u.dupIfSource=this.inflightSubmittedIds),this.connection.send(u)):this.flush(),this.emit("open"),typeof this._openCallback=="function"?this._openCallback(null):void 0;case e.open!==!1:return e.error&&(typeof console!="undefined"&&console!==null&&console.error("Could not open document: "+e.error),this.emit("error",e.error),typeof this._openCallback=="function"&&this._openCallback(e.error)),this.state="closed",this.emit("closed"),typeof this._closeCallback=="function"&&this._closeCallback(),this._closeCallback=null;case e.op!==null||r!=="Op already submitted":break;case!(e.op===void 0&&e.v!==void 0||e.op&&(d=e.meta.source,T.call(this.inflightSubmittedIds,d)>=0)):i=this.inflightOp,this.inflightOp=null,this.inflightSubmittedIds.length=0,r=e.error;if(r){this.type.invert?(a=this.type.invert(i),this.pendingOp&&(v=this._xf(this.pendingOp,a),this.pendingOp=v[0],a=v[1]),this._otApply(a,!0)):this.emit("error","Op apply failed ("+r+") and the op could not be reverted"),m=this.inflightCallbacks;for(l=0,h=m.length;l<h;l++)t=m[l],t(r)}else{if(e.v!==this.version)throw new Error("Invalid version from server");this.serverOps[this.version]=i,this.version++,this.emit("acknowledge",i),g=this.inflightCallbacks;for(c=0,p=g.length;c<p;c++)t=g[c],t(null,i)}return this.flush();case!e.op:if(e.v<this.version)return;if(e.doc!==this.name)return this.emit("error","Expected docName '"+this.name+"' but got "+e.doc);if(e.v!==this.version)return this.emit("error","Expected version "+this.version+" but got "+e.v);return s=e.op,this.serverOps[this.version]=s,n=s,this.inflightOp!==null&&(y=this._xf(this.inflightOp,n),this.inflightOp=y[0],n=y[1]),this.pendingOp!==null&&(b=this._xf(this.pendingOp,n),this.pendingOp=b[0],n=b[1]),this.version++,this._otApply(n,!0);case!e.meta:w=e.meta,o=w.path,f=w.value;switch(o!=null?o[0]:void 0){case"shout":return this.emit("shout",f);default:return typeof console!="undefined"&&console!==null?console.warn("Unhandled meta op:",e):void 0}break;default:return typeof console!="undefined"&&console!==null?console.warn("Unhandled document message:",e):void 0}},e.prototype.flush=function(){if(this.connection.state!=="ok"||this.inflightOp!==null||this.pendingOp===null)return;return this.inflightOp=this.pendingOp,this.inflightCallbacks=this.pendingCallbacks,this.pendingOp=null,this.pendingCallbacks=[],this.connection.send({doc:this.name,op:this.inflightOp,v:this.version})},e.prototype.submitOp=function(e,t){return this.type.normalize!=null&&(e=this.type.normalize(e)),this.snapshot=this.type.apply(this.snapshot,e),this.pendingOp!==null?this.pendingOp=this.type.compose(this.pendingOp,e):this.pendingOp=e,t&&this.pendingCallbacks.push(t),this.emit("change",e),setTimeout(this.flush,0)},e.prototype.shout=function(e){return this.connection.send({doc:this.name,meta:{path:["shout"],value:e}})},e.prototype.open=function(e){var t,n=this;this.autoOpen=!0;if(this.state!=="closed")return;return t={doc:this.name,open:!0},this.snapshot===void 0&&(t.snapshot=null),this.type&&(t.type=this.type.name),this.version!=null&&(t.v=this.version),this._create&&(t.create=!0),this.connection.send(t),this.state="opening",this._openCallback=function(t){return n._openCallback=null,typeof e=="function"?e(t):void 0}},e.prototype.close=function(e){return this.autoOpen=!1,this.state==="closed"?typeof e=="function"?e():void 0:(this.connection.send({doc:this.name,open:!1}),this.state="closed",this.emit("closing"),this._closeCallback=e)},e}(),r.mixin(n),c.Doc=n,i=function(){function e(e,t,n){var r,i,s=this;t!=null&&typeof t=="function"?(n=t,t=void 0):typeof n!="function"&&(n=o),this.debug=this.debugAll,this.reconnectInterval=1e3,this.timeoutInterval=2e3,this.forcedClose=!1,this.url=e,this.protocols=t,this.readyState=n.CONNECTING,this.URL=e,i=!1,r=function(e){var t;return s.ws=new n(s.url),s.debug&&console.debug("ReconnectingWebSocket","attempt-connect",s.url),t=setTimeout(function(){return s.debug&&console.debug("ReconnectingWebSocket","connection-timeout",s.url),i=!0,s.ws.close(),i=!1},s.timeoutInterval),s.ws.onopen=function(r){return clearTimeout(t),s.debug&&console.debug("ReconnectingWebSocket","onopen",s.url),s.readyState=n.OPEN,e=!1,s.onopen(r)},s.ws.onclose=function(o){return clearTimeout(t),s.ws=null,s.forcedClose?(s.readyState=n.CLOSED,s.onclose(o)):(s.readyState=n.CONNECTING,s.onconnecting(o),!e&&!i&&(s.debug&&console.debug("ReconnectingWebSocket","onclose",s.url),s.onclose(o)),setTimeout(function(){return r(!0)},s.reconnectInterval))},s.ws.onmessage=function(e){return s.debug&&console.debug("ReconnectingWebSocket","onmessage",s.url,e.data),s.onmessage(e)},s.ws.onerror=function(e){return s.debug&&console.debug("ReconnectingWebSocket","onerror",s.url,e),s.onerror(e)}},r(this.url)}return e.prototype.onopen=function(){},e.prototype.onclose=function(){},e.prototype.onconnecting=function(){},e.prototype.onmessage=function(){},e.prototype.onerror=function(){},e.prototype.send=function(e){if(this.ws)return this.debug&&console.debug("ReconnectingWebSocket","send",this.url,e),this.ws.send(e);throw"INVALID_STATE_ERR : Pausing to reconnect websocket"},e.prototype.close=function(){if(this.ws)return this.forcedClose=!0,this.ws.close()},e.prototype.debugAll=!1,e.prototype.refresh=function(){if(this.ws)return this.ws.close()},e}(),E=c.types,e=window.BCSocket,s=window.SockJS,o=window.WebSocket,e?m="channel":s?m="sockjs":m="websocket",t=function(){function t(t,n){var r=this;this.docs={},this.state="connecting",m==null&&t.match(/^ws:/)&&(m="websocket"),this.socket=function(){switch(m){case"channel":return new e(t,{reconnect:!0});case"sockjs":return new i(t,s);case"websocket":return new i(t);default:return new e(t,{reconnect:!0})}}(),this.socket.onmessage=function(e){var t;if(m==="sockjs"||m==="websocket")e=JSON.parse(e.data);if(e.auth===null)return r.lastError=e.error,r.disconnect(),r.emit("connect failed",e.error);if(e.auth){r.id=e.auth,r.setState("ok");return}return t=e.doc,t!==void 0?r.lastReceivedDoc=t:e.doc=t=r.lastReceivedDoc,r.docs[t]?r.docs[t]._onMessage(e):typeof console!="undefined"&&console!==null?console.error("Unhandled message",e):void 0},this.connected=!1,this.socket.onclose=function(e){r.setState("disconnected",e);if(e==="Closed"||e==="Stopped by server")return r.setState("stopped",r.lastError||e)},this.socket.onerror=function(e){return r.emit("error",e)},this.socket.onopen=function(){return r.send({auth:n?n:null}),r.lastError=r.lastReceivedDoc=r.lastSentDoc=null,r.setState("handshaking")},this.socket.onconnecting=function(){return r.setState("connecting")}}return t.prototype.setState=function(e,t){var n,r,i,s;if(this.state===e)return;this.state=e,e==="disconnected"&&delete this.id,this.emit(e,t),i=this.docs,s=[];for(r in i)n=i[r],s.push(n._connectionStateChanged(e,t));return s},t.prototype.send=function(e){var t;e.doc&&(t=e.doc,t===this.lastSentDoc?delete e.doc:this.lastSentDoc=t);if(m==="sockjs"||m==="websocket")e=JSON.stringify(e);return this.socket.send(e)},t.prototype.disconnect=function(){return this.socket.close()},t.prototype.makeDoc=function(e,t,r){var i,s=this;if(this.docs[e])throw new Error("Doc "+e+" already open");return i=new n(this,e,t),this.docs[e]=i,i.open(function(t){return t&&delete s.docs[e],t||i.on("closed",function(){if(!i.autoOpen)return delete s.docs[e]}),r(t,t?void 0:i)})},t.prototype.openExisting=function(e,t){var n;return this.state==="stopped"?t("connection closed"):this.docs[e]?this._ensureOpenState(this.docs[e],t):n=this.makeDoc(e,{},t)},t.prototype.open=function(e,t,n){var r;if(this.state==="stopped")return n("connection closed");if(this.state==="connecting"){this.on("handshaking",function(){return this.open(e,t,n),n=null});return}typeof t=="function"&&(n=t,t="text"),n||(n=function(){}),typeof t=="string"&&(t=E[t]);if(!t)throw new Error("OT code for document type missing");if(e==null)throw new Error("Server-generated random doc names are not currently supported");if(this.docs[e]){r=this.docs[e],r.type===t?this._ensureOpenState(r,n):n("Type mismatch",r);return}return this.makeDoc(e,{create:!0,type:t.name},n)},t.prototype._ensureOpenState=function(e,t){switch(e.state){case"open":t(null,e);break;case"opening":this.on("open",function(){return t(null,e)});break;case"closed":e.open(function(n){return t(n,n?void 0:e)})}},t}(),r.mixin(t),c.Connection=t,h=window.BCSocket!==void 0,p=window.SockJS!==void 0,h?m="channel":p?m="sockjs":m="websocket",c.open=function(){var e={},n=function(n,r){var i,s,o,u;return n==null&&(o=window.location,u=m==="websocket"?"ws:":o.protocol,n=""+u+"//"+o.host+"/"+m),e[n]||(i=new t(n,r),s=function(){return delete e[n]},i.on("disconnected",s),i.on("connect failed",s),e[n]=i),e[n]},r=function(e){var t,n,r=0,i=e.docs;for(n in i)t=i[n],(t.state!=="closed"||t.autoOpen)&&r++;if(r===0)return e.disconnect()};return function(e,t,i,s){var o,u,a;return typeof i=="function"&&(s=i,i={}),typeof i=="string"&&(i={origin:i}),a=i.origin,o=i.authentication,u=n(a,o),u.open(e,t,function(e,t){return e?(s(e),r(u)):(t.on("closed",function(){return r(u)}),s(null,t))}),u.on("connect failed"),u}}()}).call(this);
// json
(function(){var e,t,n,r,i,s,o,u,a,f=!0,l=[].slice,c=window.sharejs;typeof f!="undefined"&&f!==null?u=c.types.text:u=require("./text"),s={},s.name="json",s.create=function(){return null},s.invertComponent=function(e){var t={p:e.p};return e.si!==void 0&&(t.sd=e.si),e.sd!==void 0&&(t.si=e.sd),e.oi!==void 0&&(t.od=e.oi),e.od!==void 0&&(t.oi=e.od),e.li!==void 0&&(t.ld=e.li),e.ld!==void 0&&(t.li=e.ld),e.na!==void 0&&(t.na=-e.na),e.lm!==void 0&&(t.lm=e.p[e.p.length-1],t.p=e.p.slice(0,e.p.length-1).concat([e.lm])),t},s.invert=function(e){var t,n,r,i=e.slice().reverse(),o=[];for(n=0,r=i.length;n<r;n++)t=i[n],o.push(s.invertComponent(t));return o},s.checkValidOp=function(){},i=function(e){return Object.prototype.toString.call(e)==="[object Array]"},s.checkList=function(e){if(!i(e))throw new Error("Referenced element not a list")},s.checkObj=function(e){if(e.constructor!==Object)throw new Error("Referenced element not an object (it was "+JSON.stringify(e)+")")},s.apply=function(e,n){var r,i,o,u,a,f,l,c,h,p,d,v,m,g,y;s.checkValidOp(n),n=t(n),i={data:t(e)};try{for(f=d=0,m=n.length;d<m;f=++d){r=n[f],h=null,p=null,u=i,l="data",y=r.p;for(v=0,g=y.length;v<g;v++){c=y[v],h=u,p=l,u=u[l],l=c;if(h==null)throw new Error("Path invalid")}if(r.na!==void 0){if(typeof u[l]!="number")throw new Error("Referenced element not a number");u[l]+=r.na}else if(r.si!==void 0){if(typeof u!="string")throw new Error("Referenced element not a string (it was "+JSON.stringify(u)+")");h[p]=u.slice(0,l)+r.si+u.slice(l)}else if(r.sd!==void 0){if(typeof u!="string")throw new Error("Referenced element not a string");if(u.slice(l,l+r.sd.length)!==r.sd)throw new Error("Deleted string does not match");h[p]=u.slice(0,l)+u.slice(l+r.sd.length)}else if(r.li!==void 0&&r.ld!==void 0)s.checkList(u),u[l]=r.li;else if(r.li!==void 0)s.checkList(u),u.splice(l,0,r.li);else if(r.ld!==void 0)s.checkList(u),u.splice(l,1);else if(r.lm!==void 0)s.checkList(u),r.lm!==l&&(o=u[l],u.splice(l,1),u.splice(r.lm,0,o));else if(r.oi!==void 0)s.checkObj(u),u[l]=r.oi;else{if(r.od===void 0)throw new Error("invalid / missing instruction in op");s.checkObj(u),delete u[l]}}}catch(b){throw a=b,a}return i.data},s.pathMatches=function(e,t,n){var r,i,s,o;if(e.length!==t.length)return!1;for(r=s=0,o=e.length;s<o;r=++s){i=e[r];if(i!==t[r]&&(!n||r!==e.length-1))return!1}return!0},s.append=function(e,n){var r;return n=t(n),e.length!==0&&s.pathMatches(n.p,(r=e[e.length-1]).p)?r.na!==void 0&&n.na!==void 0?e[e.length-1]={p:r.p,na:r.na+n.na}:r.li!==void 0&&n.li===void 0&&n.ld===r.li?r.ld!==void 0?delete r.li:e.pop():r.od!==void 0&&r.oi===void 0&&n.oi!==void 0&&n.od===void 0?r.oi=n.oi:n.lm!==void 0&&n.p[n.p.length-1]===n.lm?null:e.push(n):e.push(n)},s.compose=function(e,n){var r,i,o,u;s.checkValidOp(e),s.checkValidOp(n),i=t(e);for(o=0,u=n.length;o<u;o++)r=n[o],s.append(i,r);return i},s.normalize=function(e){var t,n,r,o,u=[];i(e)||(e=[e]);for(n=0,r=e.length;n<r;n++)t=e[n],(o=t.p)==null&&(t.p=[]),s.append(u,t);return u},t=function(e){return JSON.parse(JSON.stringify(e))},s.canOpAffectOp=function(e,t){var n,r,i,s;if(e.length===0)return!0;if(t.length===0)return!1;t=t.slice(0,t.length-1),e=e.slice(0,e.length-1);for(n=i=0,s=e.length;i<s;n=++i){r=e[n];if(n>=t.length)return!1;if(r!==t[n])return!1}return!0},s.transformComponent=function(e,n,r,i){var o,a,f,l,c,h,p,d,v,m,g,y,b,w,E,S,x,T,N;n=t(n),n.na!==void 0&&n.p.push(0),r.na!==void 0&&r.p.push(0),s.canOpAffectOp(r.p,n.p)&&(o=r.p.length-1),s.canOpAffectOp(n.p,r.p)&&(a=n.p.length-1),c=n.p.length,v=r.p.length,n.na!==void 0&&n.p.pop(),r.na!==void 0&&r.p.pop();if(r.na)return a!=null&&v>=c&&r.p[a]===n.p[a]&&(n.ld!==void 0?(d=t(r),d.p=d.p.slice(c),n.ld=s.apply(t(n.ld),[d])):n.od!==void 0&&(d=t(r),d.p=d.p.slice(c),n.od=s.apply(t(n.od),[d]))),s.append(e,n),e;a!=null&&v>c&&n.p[a]===r.p[a]&&(n.ld!==void 0?(d=t(r),d.p=d.p.slice(c),n.ld=s.apply(t(n.ld),[d])):n.od!==void 0&&(d=t(r),d.p=d.p.slice(c),n.od=s.apply(t(n.od),[d])));if(o!=null){f=c===v;if(r.na===void 0)if(r.si!==void 0||r.sd!==void 0){if(n.si!==void 0||n.sd!==void 0){if(!f)throw new Error("must be a string?");l=function(e){var t={p:e.p[e.p.length-1]};return e.si!=null?t.i=e.si:t.d=e.sd,t},E=l(n),S=l(r),b=[],u._tc(b,E,S,i);for(T=0,N=b.length;T<N;T++)w=b[T],p={p:n.p.slice(0,o)},p.p.push(w.p),w.i!=null&&(p.si=w.i),w.d!=null&&(p.sd=w.d),s.append(e,p);return e}}else if(r.li!==void 0&&r.ld!==void 0){if(r.p[o]===n.p[o]){if(!f)return e;if(n.ld!==void 0){if(n.li===void 0||i!=="left")return e;n.ld=t(r.li)}}}else if(r.li!==void 0)n.li!==void 0&&n.ld===void 0&&f&&n.p[o]===r.p[o]?i==="right"&&n.p[o]++:r.p[o]<=n.p[o]&&n.p[o]++,n.lm!==void 0&&f&&r.p[o]<=n.lm&&n.lm++;else if(r.ld!==void 0){if(n.lm!==void 0&&f){if(r.p[o]===n.p[o])return e;y=r.p[o],h=n.p[o],x=n.lm,(y<x||y===x&&h<x)&&n.lm--}if(r.p[o]<n.p[o])n.p[o]--;else if(r.p[o]===n.p[o]){if(v<c)return e;if(n.ld!==void 0){if(n.li===void 0)return e;delete n.ld}}}else if(r.lm!==void 0)if(n.lm!==void 0&&c===v){h=n.p[o],x=n.lm,m=r.p[o],g=r.lm;if(m!==g)if(h===m){if(i!=="left")return e;n.p[o]=g,h===x&&(n.lm=g)}else h>m&&n.p[o]--,h>g?n.p[o]++:h===g&&m>g&&(n.p[o]++,h===x&&n.lm++),x>m?n.lm--:x===m&&x>h&&n.lm--,x>g?n.lm++:x===g&&(g>m&&x>h||g<m&&x<h?i==="right"&&n.lm++:x>h?n.lm++:x===m&&n.lm--)}else n.li!==void 0&&n.ld===void 0&&f?(h=r.p[o],x=r.lm,y=n.p[o],y>h&&n.p[o]--,y>x&&n.p[o]++):(h=r.p[o],x=r.lm,y=n.p[o],y===h?n.p[o]=x:(y>h&&n.p[o]--,y>x?n.p[o]++:y===x&&h>x&&n.p[o]++));else if(r.oi!==void 0&&r.od!==void 0){if(n.p[o]===r.p[o]){if(n.oi===void 0||!f)return e;if(i==="right")return e;n.od=r.oi}}else if(r.oi!==void 0){if(n.oi!==void 0&&n.p[o]===r.p[o]){if(i!=="left")return e;s.append(e,{p:n.p,od:r.oi})}}else if(r.od!==void 0&&n.p[o]===r.p[o]){if(!f)return e;if(n.oi===void 0)return e;delete n.od}}return s.append(e,n),e},typeof f!="undefined"&&f!==null?(c.types||(c.types={}),c._bt(s,s.transformComponent,s.checkValidOp,s.append),c.types.json=s):(module.exports=s,require("./helpers").bootstrapTransform(s,s.transformComponent,s.checkValidOp,s.append)),typeof f=="undefined"&&(s=require("./json")),typeof f!="undefined"&&f!==null&&(r=c.extendDoc,c.extendDoc=function(t,n){return e.prototype[t]=n,r(t,n)}),n=function(e){return e.length===1&&e[0].constructor===Array?e[0]:e},e=function(){function e(e,t){this.doc=e,this.path=t}return e.prototype.at=function(){var e=1<=arguments.length?l.call(arguments,0):[];return this.doc.at(this.path.concat(n(e)))},e.prototype.parent=function(){return this.path.length?this.doc.at(this.path.slice(0,this.path.length-1)):void 0},e.prototype.get=function(){return this.doc.getAt(this.path)},e.prototype.set=function(e,t){return this.doc.setAt(this.path,e,t)},e.prototype.insert=function(e,t,n){return this.doc.insertAt(this.path,e,t,n)},e.prototype.del=function(e,t,n){return this.doc.deleteTextAt(this.path,t,e,n)},e.prototype.remove=function(e){return this.doc.removeAt(this.path,e)},e.prototype.push=function(e,t){return this.insert(this.get().length,e,t)},e.prototype.move=function(e,t,n){return this.doc.moveAt(this.path,e,t,n)},e.prototype.add=function(e,t){return this.doc.addAt(this.path,e,t)},e.prototype.on=function(e,t){return this.doc.addListener(this.path,e,t)},e.prototype.removeListener=function(e){return this.doc.removeListener(e)},e.prototype.getLength=function(){return this.get().length},e.prototype.getText=function(){return this.get()},e}(),a=function(e,t){var n,r,i,s={data:e},o="data",u=s;for(r=0,i=t.length;r<i;r++){n=t[r],u=u[o],o=n;if(typeof u=="undefined")throw new Error("bad path")}return{elem:u,key:o}},o=function(e,t){var n,r,i,s;if(e.length!==t.length)return!1;for(r=i=0,s=e.length;i<s;r=++i){n=e[r];if(n!==t[r])return!1}return!0},s.api={provides:{json:!0},at:function(){var t=1<=arguments.length?l.call(arguments,0):[];return new e(this,n(t))},get:function(){return this.snapshot},set:function(e,t){return this.setAt([],e,t)},getAt:function(e){var t=a(this.snapshot,e),n=t.elem,r=t.key;return n[r]},setAt:function(e,t,n){var r=a(this.snapshot,e),i=r.elem,s=r.key,o={p:e};if(i.constructor===Array)o.li=t,typeof i[s]!="undefined"&&(o.ld=i[s]);else{if(typeof i!="object")throw new Error("bad path");o.oi=t,typeof i[s]!="undefined"&&(o.od=i[s])}return this.submitOp([o],n)},removeAt:function(e,t){var n,r=a(this.snapshot,e),i=r.elem,s=r.key;if(typeof i[s]=="undefined")throw new Error("no element at that path");n={p:e};if(i.constructor===Array)n.ld=i[s];else{if(typeof i!="object")throw new Error("bad path");n.od=i[s]}return this.submitOp([n],t)},insertAt:function(e,t,n,r){var i=a(this.snapshot,e),s=i.elem,o=i.key,u={p:e.concat(t)};return s[o].constructor===Array?u.li=n:typeof s[o]=="string"&&(u.si=n),this.submitOp([u],r)},moveAt:function(e,t,n,r){var i=[{p:e.concat(t),lm:n}];return this.submitOp(i,r)},addAt:function(e,t,n){var r=[{p:e,na:t}];return this.submitOp(r,n)},deleteTextAt:function(e,t,n,r){var i=a(this.snapshot,e),s=i.elem,o=i.key,u=[{p:e.concat(n),sd:s[o].slice(n,n+t)}];return this.submitOp(u,r)},addListener:function(e,t,n){var r={path:e,event:t,cb:n};return this._listeners.push(r),r},removeListener:function(e){var t=this._listeners.indexOf(e);return t<0?!1:(this._listeners.splice(t,1),!0)},_register:function(){return this._listeners=[],this.on("change",function(e){var t,n,r,i,s,o,u,a,f,l,c,h=[];for(u=0,f=e.length;u<f;u++){t=e[u];if(t.na!==void 0||t.si!==void 0||t.sd!==void 0)continue;s=[],c=this._listeners;for(r=a=0,l=c.length;a<l;r=++a){i=c[r],n={p:i.path,na:0},o=this.type.transformComponent([],n,t,"left");if(o.length===0)s.push(r);else{if(o.length!==1)throw new Error("Bad assumption in json-api: xforming an 'si' op will always result in 0 or 1 components.");i.path=o[0].p}}s.sort(function(e,t){return t-e}),h.push(function(){var e,t,n=[];for(e=0,t=s.length;e<t;e++)r=s[e],n.push(this._listeners.splice(r,1));return n}.call(this))}return h}),this.on("remoteop",function(e){var t,n,r,i,s,u,a,f,l=[];for(a=0,f=e.length;a<f;a++)t=e[a],s=t.na===void 0?t.p.slice(0,t.p.length-1):t.p,l.push(function(){var e,a,f,l=this._listeners,c=[];for(e=0,a=l.length;e<a;e++){f=l[e],u=f.path,i=f.event,n=f.cb;if(o(u,s))switch(i){case"insert":t.li!==void 0&&t.ld===void 0?c.push(n(t.p[t.p.length-1],t.li)):t.oi!==void 0&&t.od===void 0?c.push(n(t.p[t.p.length-1],t.oi)):t.si!==void 0?c.push(n(t.p[t.p.length-1],t.si)):c.push(void 0);break;case"delete":t.li===void 0&&t.ld!==void 0?c.push(n(t.p[t.p.length-1],t.ld)):t.oi===void 0&&t.od!==void 0?c.push(n(t.p[t.p.length-1],t.od)):t.sd!==void 0?c.push(n(t.p[t.p.length-1],t.sd)):c.push(void 0);break;case"replace":t.li!==void 0&&t.ld!==void 0?c.push(n(t.p[t.p.length-1],t.ld,t.li)):t.oi!==void 0&&t.od!==void 0?c.push(n(t.p[t.p.length-1],t.od,t.oi)):c.push(void 0);break;case"move":t.lm!==void 0?c.push(n(t.p[t.p.length-1],t.lm)):c.push(void 0);break;case"add":t.na!==void 0?c.push(n(t.na)):c.push(void 0);break;default:c.push(void 0)}else this.type.canOpAffectOp(u,s)?i==="child op"?(r=t.p.slice(u.length),c.push(n(r,t))):c.push(void 0):c.push(void 0)}return c}.call(this));return l})}}}).call(this);

// jGlow
(function(e){var t=function(){return!1===e.support.boxModel&&e.support.objectAll&&e.support.leadingWhitespace}();e.jGrowl=function(t,i){0==e("#jGrowl").size()&&e('<div id="jGrowl"></div>').addClass(i&&i.position?i.position:e.jGrowl.defaults.position).appendTo("body"),e("#jGrowl").jGrowl(t,i)},e.fn.jGrowl=function(t,i){if(e.isFunction(this.each)){var o=arguments;return this.each(function(){void 0==e(this).data("jGrowl.instance")&&(e(this).data("jGrowl.instance",e.extend(new e.fn.jGrowl,{notifications:[],element:null,interval:null})),e(this).data("jGrowl.instance").startup(this)),e.isFunction(e(this).data("jGrowl.instance")[t])?e(this).data("jGrowl.instance")[t].apply(e(this).data("jGrowl.instance"),e.makeArray(o).slice(1)):e(this).data("jGrowl.instance").create(t,i)})}},e.extend(e.fn.jGrowl.prototype,{defaults:{pool:0,header:"",group:"",sticky:!1,position:"top-right",glue:"after",theme:"default",themeState:"highlight",corners:"5px",check:250,life:3000,closeDuration:"normal",openDuration:"normal",easing:"swing",closer:!0,closeTemplate:"&times;",closerTemplate:"<div> close all </div>",log:function(){},beforeOpen:function(){},afterOpen:function(){},open:function(){},beforeClose:function(){},close:function(){},animateOpen:{opacity:"show"},animateClose:{opacity:"hide"}},notifications:[],element:null,interval:null,create:function(t,i){var i=e.extend({},this.defaults,i);i.speed!==void 0&&(i.openDuration=i.speed,i.closeDuration=i.speed),this.notifications.push({message:t,options:i}),i.log.apply(this.element,[this.element,t,i])},render:function(t){var i=this,o=t.message,n=t.options;n.themeState=""==n.themeState?"":"ui-state-"+n.themeState;var t=e("<div/>").addClass("jGrowl-notification "+n.themeState+" ui-corner-all"+(void 0!=n.group&&""!=n.group?" "+n.group:"")).append(e("<div/>").addClass("jGrowl-close").html(n.closeTemplate)).append(e("<div/>").addClass("jGrowl-header").html(n.header)).append(e("<div/>").addClass("jGrowl-message").html(o)).data("jGrowl",n).addClass(n.theme).children("div.jGrowl-close").bind("click.jGrowl",function(){e(this).parent().trigger("jGrowl.beforeClose")}).parent();e(t).bind("mouseover.jGrowl",function(){e("div.jGrowl-notification",i.element).data("jGrowl.pause",!0)}).bind("mouseout.jGrowl",function(){e("div.jGrowl-notification",i.element).data("jGrowl.pause",!1)}).bind("jGrowl.beforeOpen",function(){n.beforeOpen.apply(t,[t,o,n,i.element])!==!1&&e(this).trigger("jGrowl.open")}).bind("jGrowl.open",function(){n.open.apply(t,[t,o,n,i.element])!==!1&&("after"==n.glue?e("div.jGrowl-notification:last",i.element).after(t):e("div.jGrowl-notification:first",i.element).before(t),e(this).animate(n.animateOpen,n.openDuration,n.easing,function(){e.support.opacity===!1&&this.style.removeAttribute("filter"),null!==e(this).data("jGrowl")&&(e(this).data("jGrowl").created=new Date),e(this).trigger("jGrowl.afterOpen")}))}).bind("jGrowl.afterOpen",function(){n.afterOpen.apply(t,[t,o,n,i.element])}).bind("jGrowl.beforeClose",function(){n.beforeClose.apply(t,[t,o,n,i.element])!==!1&&e(this).trigger("jGrowl.close")}).bind("jGrowl.close",function(){e(this).data("jGrowl.pause",!0),e(this).animate(n.animateClose,n.closeDuration,n.easing,function(){e.isFunction(n.close)?n.close.apply(t,[t,o,n,i.element])!==!1&&e(this).remove():e(this).remove()})}).trigger("jGrowl.beforeOpen"),""!=n.corners&&void 0!=e.fn.corner&&e(t).corner(n.corners),e("div.jGrowl-notification:parent",i.element).size()>1&&0==e("div.jGrowl-closer",i.element).size()&&this.defaults.closer!==!1&&e(this.defaults.closerTemplate).addClass("jGrowl-closer "+this.defaults.themeState+" ui-corner-all").addClass(this.defaults.theme).appendTo(i.element).animate(this.defaults.animateOpen,this.defaults.speed,this.defaults.easing).bind("click.jGrowl",function(){e(this).siblings().trigger("jGrowl.beforeClose"),e.isFunction(i.defaults.closer)&&i.defaults.closer.apply(e(this).parent()[0],[e(this).parent()[0]])})},update:function(){e(this.element).find("div.jGrowl-notification:parent").each(function(){void 0!=e(this).data("jGrowl")&&void 0!==e(this).data("jGrowl").created&&e(this).data("jGrowl").created.getTime()+parseInt(e(this).data("jGrowl").life)<(new Date).getTime()&&e(this).data("jGrowl").sticky!==!0&&(void 0==e(this).data("jGrowl.pause")||e(this).data("jGrowl.pause")!==!0)&&e(this).trigger("jGrowl.beforeClose")}),this.notifications.length>0&&(0==this.defaults.pool||e(this.element).find("div.jGrowl-notification:parent").size()<this.defaults.pool)&&this.render(this.notifications.shift()),2>e(this.element).find("div.jGrowl-notification:parent").size()&&e(this.element).find("div.jGrowl-closer").animate(this.defaults.animateClose,this.defaults.speed,this.defaults.easing,function(){e(this).remove()})},startup:function(i){this.element=e(i).addClass("jGrowl").append('<div class="jGrowl-notification"></div>'),this.interval=setInterval(function(){e(i).data("jGrowl.instance").update()},parseInt(this.defaults.check)),t&&e(this.element).addClass("ie6")},shutdown:function(){e(this.element).removeClass("jGrowl").find("div.jGrowl-notification").trigger("jGrowl.close").parent().empty(),clearInterval(this.interval)},close:function(){e(this.element).find("div.jGrowl-notification").each(function(){e(this).trigger("jGrowl.beforeClose")})}}),e.jGrowl.defaults=e.fn.jGrowl.prototype.defaults})($);

(function(e){"use strict";var t=function(e,t){var n=e.__observable;if(n.eventlisteners===undefined){n.eventlisteners={change:[]}}if(t===undefined){return n.eventlisteners}if(n.eventlisteners[t]===undefined){n.eventlisteners[t]=[]}return n.eventlisteners[t]};var n=function(e,n,r){var i=t(e,n);var s=i.length;for(var o=0;o<s;++o){var u=i[o];if(u===undefined)continue;if(!u.isRunning){u.isRunning=true;u.fn.apply(e,r);u.isRunning=false}}};var r=function(n,r){if(e.isArray(n)){var i=[];for(var s=0;s<n.length;++s){i.push(this.on(n[s],r))}return i}var o=t(this,n);var i=o.length;o.push({fn:r});return i};var i=function(e,n){var r=t(this,e);if(r[n]!==undefined){r[n]=undefined}};var s=function(e){var n=t(this,e);var r=0;for(var i=0;i<n.length;++i){if(n[i]){++r}}return r};var o=function(t){if(e.isPlainObject(t)){for(var o in t){if(t.hasOwnProperty(o)){t[o]=e.observable(t[o])}}}var u=function(){if(arguments.length===0){return t}else{var i=e.observable.remove(u);t=arguments[0];var s=e.isFunction(t)&&t.__observable!==undefined;if(s){t=t()}if(e.isPlainObject(t)){for(var o in t){if(t.hasOwnProperty(o)){t[o]=e.observable(t[o])}}}n(u,"change",[u,i])}};u.__observable={};u.on=r;u.off=i;u.listenerCount=s;return u};var u=function(t){for(var n=0;n<t.length;++n){t[n]=e.observable(t[n])}return t};var a=function(t){var i=function(){var r,s;switch(arguments.length){case 0:return t;case 1:var o=arguments[0];if(e.isArray(o)){r=e.observable.remove(t);t=u(o);n(i,"change",[t,r])}else{return t[o]}break;case 2:r=e.observable.remove(t[arguments[0]]);t[arguments[0]]=s=e.observable(arguments[1]);n(i,"elemchange",[arguments[0],s,r]);break;default:throw"must be called with 1 or 2 arguments, not "+arguments.length}};t=u(t);i.__observable={};i.on=r;i.push=function(r){r=e.observable(r);t.push(r);n(this,"push",[r])};i.forEach=function(e){for(var n=0;n<t.length;++n){if(e.call(null,n,t[n])===false){break}}};i.size=function(){return t.length};i.pop=function(){var e=t.pop();n(this,"pop",[e]);return e};i.reverse=function(){t.reverse();n(this,"reverse",[])};i.shift=function(){var e=t.shift();n(this,"shift",[e]);return e};i.sort=function(n){if(n){if(!e.isFunction(n)){throw"ArrayWrapper.sort() can only accept function parameter"}}else{n=function(e,t){e=e.toString();t=t.toString();if(e===t){return 0}else if(e<t){return-1}return 1}}var r=function(t,r){return n(e.observable.remove(t),e.observable.remove(r))};return t.sort(r)};i.unshift=function(r){r=e.observable(r);t.unshift(r);n(this,"unshift",[r])};return i};e.observable=function(t){if(e.isArray(t)){return a(t)}if(e.isFunction(t)&&t.__observable){return t}return o(t)};e.observable.remove=function(t){var n=[],r;if(!e.isFunction(t)){if(e.isArray(t)){for(r=0;r<t.length;++r){n[r]=e.observable.remove(t[r])}}return n}var i=t();if(e.isArray(i)){for(r=0;r<i.length;++r){n[r]=e.observable.remove(i[r])}return n}else if(e.isPlainObject(i)){n={};for(var s in i){if(i.hasOwnProperty(s)){n[s]=e.observable.remove(i[s])}}return n}return i}})($);

// jquery.event.drag
//http://threedubmedia.com/code/event/drag

(function(f){f.fn.drag=function(k,e,j){var i=typeof k=="string"?k:"",h=$.isFunction(k)?k:$.isFunction(e)?e:null;if(i.indexOf("drag")!==0){i="drag"+i}j=(k==h?e:j)||{};return h?this.bind(i,j,h):this.trigger(i)};var b=$.event,a=b.special,d=a.drag={defaults:{which:1,distance:5,not:".editNoDrag",handle:null,relative:false,drop:true,click:false},datakey:"dragdata",noBubble:true,add:function(i){var h=$.data(this,d.datakey),e=i.data||{};h.related+=1;$.each(d.defaults,function(j,k){if(e[j]!==undefined){h[j]=e[j]}})},remove:function(){$.data(this,d.datakey).related-=1},setup:function(){if($.data(this,d.datakey)){return}var e=$.extend({related:0},d.defaults);$.data(this,d.datakey,e);b.add(this,"touchstart mousedown",d.init,e);if(this.attachEvent){this.attachEvent("ondragstart",d.dontstart)}},teardown:function(){var e=$.data(this,d.datakey)||{};if(e.related){return}$.removeData(this,d.datakey);b.remove(this,"touchstart mousedown",d.init);d.textselect(true);if(this.detachEvent){this.detachEvent("ondragstart",d.dontstart)}},init:function(i){if(d.touched){return}var e=i.data,h;if(i.which!=0&&e.which>0&&i.which!=e.which){return}if($(i.target).is(e.not)){return}if(e.handle&&!$(i.target).closest(e.handle,i.currentTarget).length){return}d.touched=i.type=="touchstart"?this:null;e.propagates=1;e.mousedown=this;e.interactions=[d.interaction(this,e)];e.target=i.target;e.pageX=i.pageX;e.pageY=i.pageY;e.dragging=null;h=d.hijack(i,"draginit",e);if(!e.propagates){return}h=d.flatten(h);if(h&&h.length){e.interactions=[];$.each(h,function(){e.interactions.push(d.interaction(this,e))})}e.propagates=e.interactions.length;if(e.drop!==false&&a.drop){a.drop.handler(i,e)}d.textselect(false);if(d.touched){b.add(d.touched,"touchmove touchend",d.handler,e)}else{b.add(document,"mousemove mouseup",d.handler,e)}if(!d.touched||e.live){return false}},interaction:function(h,e){var i=$(h)[e.relative?"position":"offset"]()||{top:0,left:0};return{drag:h,callback:new d.callback(),droppable:[],offset:i}},handler:function(h){var e=h.data;switch(h.type){case !e.dragging&&"touchmove":h.preventDefault();case !e.dragging&&"mousemove":if(Math.pow(h.pageX-e.pageX,2)+Math.pow(h.pageY-e.pageY,2)<Math.pow(e.distance,2)){break}h.target=e.target;d.hijack(h,"dragstart",e);if(e.propagates){e.dragging=true}case"touchmove":h.preventDefault();case"mousemove":if(e.dragging){d.hijack(h,"drag",e);if(e.propagates){if(e.drop!==false&&a.drop){a.drop.handler(h,e)}break}h.type="mouseup"}case"touchend":case"mouseup":default:if(d.touched){b.remove(d.touched,"touchmove touchend",d.handler)}else{b.remove(document,"mousemove mouseup",d.handler)}if(e.dragging){if(e.drop!==false&&a.drop){a.drop.handler(h,e)}d.hijack(h,"dragend",e)}d.textselect(true);if(e.click===false&&e.dragging){$.data(e.mousedown,"suppress.click",new Date().getTime()+5)}e.dragging=d.touched=false;break}},hijack:function(h,o,r,p,k){if(!r){return}var q={event:h.originalEvent,type:h.type},m=o.indexOf("drop")?"drag":"drop",t,l=p||0,j,e,s,n=!isNaN(p)?p:r.interactions.length;h.type=o;h.originalEvent=null;r.results=[];do{if(j=r.interactions[l]){if(o!=="dragend"&&j.cancelled){continue}s=d.properties(h,r,j);j.results=[];$(k||j[m]||r.droppable).each(function(u,i){s.target=i;h.isPropagationStopped=function(){return false};t=i?b.dispatch.call(i,h,s):null;if(t===false){if(m=="drag"){j.cancelled=true;r.propagates-=1}if(o=="drop"){j[m][u]=null}}else{if(o=="dropinit"){j.droppable.push(d.element(t)||i)}}if(o=="dragstart"){j.proxy=$(d.element(t)||j.drag)[0]}j.results.push(t);delete h.result;if(o!=="dropinit"){return t}});r.results[l]=d.flatten(j.results);if(o=="dropinit"){j.droppable=d.flatten(j.droppable)}if(o=="dragstart"&&!j.cancelled){s.update()}}}while(++l<n);h.type=q.type;h.originalEvent=q.event;return d.flatten(r.results)},properties:function(i,e,h){var j=h.callback;j.drag=h.drag;j.proxy=h.proxy||h.drag;j.startX=e.pageX;j.startY=e.pageY;j.deltaX=i.pageX-e.pageX;j.deltaY=i.pageY-e.pageY;j.originalX=h.offset.left;j.originalY=h.offset.top;j.offsetX=j.originalX+j.deltaX;j.offsetY=j.originalY+j.deltaY;j.drop=d.flatten((h.drop||[]).slice());j.available=d.flatten((h.droppable||[]).slice());return j},element:function(e){if(e&&(e.jquery||e.nodeType==1)){return e}},flatten:function(e){return $.map(e,function(h){return h&&h.jquery?$.makeArray(h):h&&h.length?d.flatten(h):h})},textselect:function(e){$(document)[e?"unbind":"bind"]("selectstart",d.dontstart).css("MozUserSelect",e?"":"none");document.unselectable=e?"off":"on"},dontstart:function(){return false},callback:function(){}};d.callback.prototype={update:function(){if(a.drop&&this.available.length){$.each(this.available,function(e){a.drop.locate(this,e)})}}};var g=b.dispatch;b.dispatch=function(e){if($.data(this,"suppress."+e.type)-new Date().getTime()>0){$.removeData(this,"suppress."+e.type);return}return g.apply(this,arguments)};var c=b.fixHooks.touchstart=b.fixHooks.touchmove=b.fixHooks.touchend=b.fixHooks.touchcancel={props:"clientX clientY pageX pageY screenX screenY".split(" "),filter:function(h,i){if(i){var e=(i.touches&&i.touches[0])||(i.changedTouches&&i.changedTouches[0])||null;if(e){$.each(c.props,function(j,k){h[k]=e[k]})}}return h}};a.draginit=a.dragstart=a.dragend=d})($);

(function(b){b.fn.toggleCheckbox=function(){if(this.hasClass("remember")&&this.attr("checked")=="checked"){eraseCookie("remember")}else{createCookie("remember","true",356)}this.attr("checked",!this.attr("checked"))};b.fn.placeholder=function(a){var c={hidden:false};if(typeof starting!="undefined"){window.clearInterval(starting.holdingInterval)}return this.each(function(){if(a){$.extend(c,a)}var e=$(this);if(e.parent().hasClass("ui-placeholder-wrap")){return}if($(this).hasClass("small")){var d=$('<div class="ui-placeholder-wrap small" />')}else{var d=$('<div class="ui-placeholder-wrap" />')}var f=$('<div class="ui-placeholder" />').on("click.placeholder",function(){$(this).siblings("p").focus();if(e.text()!=""){d.addClass("ui-placeholder-hasome")}}).html(e.attr("placeholder-data"));e.wrap(d).after(f).on("focus.placeholder focusout.placeholder keydown.placeholder change.placeholder input.placeholder blur.placeholder DOMAutoComplete.placeholder DOMAttrModified.placeholder",function(g){g.stopPropagation();if(e.text()==""){e.parent().removeClass("ui-placeholder-hasome");$(f).addClass("active")}else{e.parent().addClass("ui-placeholder-hasome")}}).on("focusout.placeholder blur.placeholder",function(g){if(c.hidden){$(f).removeClass("active")}});if(e.text()!=""){e.parent().addClass("ui-placeholder-hasome")}else{if(!c.hidden){$(f).fadeIn(1000,function(){$(this).addClass("active")})}}})}})($);

 //hoverIntent r7 // 2013.03.11 // jQuery 1.9.1+
 //http://cherne.net/brian/resources/jquery.hoverIntent.html
 
(function(e){e.fn.hoverIntent=function(t,n,r){var i={interval:250,sensitivity:5,timeout:250};if(typeof t==="object"){i=e.extend(i,t)}else if(e.isFunction(n)){i=e.extend(i,{over:t,out:n,selector:r})}else{i=e.extend(i,{over:t,out:t,selector:n})}var s,o,u,a;var f=function(e){s=e.pageX;o=e.pageY};var l=function(t,n){n.hoverIntent_t=clearTimeout(n.hoverIntent_t);if(Math.abs(u-s)+Math.abs(a-o)<i.sensitivity){e(n).off("mousemove.hoverIntent",f);n.hoverIntent_s=1;return i.over.apply(n,[t])}else{u=s;a=o;n.hoverIntent_t=setTimeout(function(){l(t,n)},i.interval)}};var c=function(e,t){t.hoverIntent_t=clearTimeout(t.hoverIntent_t);t.hoverIntent_s=0;return i.out.apply(t,[e])};var h=function(t){var n=$.extend({},t);var r=this;if(r.hoverIntent_t){r.hoverIntent_t=clearTimeout(r.hoverIntent_t)}if(t.type=="mouseenter"){u=n.pageX;a=n.pageY;e(r).on("mousemove.hoverIntent",f);if(r.hoverIntent_s!=1){r.hoverIntent_t=setTimeout(function(){l(n,r)},i.interval)}}else{e(r).off("mousemove.hoverIntent",f);if(r.hoverIntent_s==1){r.hoverIntent_t=setTimeout(function(){c(n,r)},i.timeout)}}};return this.on({"mouseenter.hoverIntent":h,"mouseleave.hoverIntent":h},i.selector)}})($);

/*
 * Snap.js
 *
 * Copyright 2013, Jacob Kelley - http://jakiestfu.com/
 * Released under the MIT Licence
 * http://opensource.org/licenses/MIT
 *
 * Github:  http://github.com/jakiestfu/Snap.js/
 * Version: 1.9.2
 */
 (function(c,b){var a=a||function(k){var f={element:null,dragger:null,disable:"none",addBodyClasses:true,hyperextensible:true,resistance:0.5,flickThreshold:50,transitionSpeed:0.3,easing:"ease",maxPosition:266,minPosition:-266,tapToClose:true,touchToDrag:true,slideIntent:40,minDragDistance:5},e={simpleStates:{opening:null,towards:null,hyperExtending:null,halfway:null,flick:null,translation:{absolute:0,relative:0,sinceDirectionChange:0,percentage:0}}},h={},d={hasTouch:(b.ontouchstart===null),eventType:function(m){var l={down:(d.hasTouch?"touchstart":"mousedown"),move:(d.hasTouch?"touchmove":"mousemove"),up:(d.hasTouch?"touchend":"mouseup"),out:(d.hasTouch?"touchcancel":"mouseout")};return l[m]},page:function(l,m){return(d.hasTouch&&m.touches.length&&m.touches[0])?m.touches[0]["page"+l]:m["page"+l]},klass:{has:function(m,l){return(m.className).indexOf(l)!==-1},add:function(m,l){if(!d.klass.has(m,l)&&f.addBodyClasses){m.className+=" "+l}},remove:function(m,l){if(f.addBodyClasses){m.className=(m.className).replace(l,"").replace(/^\s+|\s+$/g,"")}}},dispatchEvent:function(l){if(typeof h[l]==="function"){return h[l].call()}},vendor:function(){var m=b.createElement("div"),n="webkit Moz O ms".split(" "),l;for(l in n){if(typeof m.style[n[l]+"Transition"]!=="undefined"){return n[l]}}},transitionCallback:function(){return(e.vendor==="Moz"||e.vendor==="ms")?"transitionend":e.vendor+"TransitionEnd"},canTransform:function(){return typeof f.element.style[e.vendor+"Transform"]!=="undefined"},deepExtend:function(l,n){var m;for(m in n){if(n[m]&&n[m].constructor&&n[m].constructor===Object){l[m]=l[m]||{};d.deepExtend(l[m],n[m])}else{l[m]=n[m]}}return l},angleOfDrag:function(l,o){var n,m;m=Math.atan2(-(e.startDragY-o),(e.startDragX-l));if(m<0){m+=2*Math.PI}n=Math.floor(m*(180/Math.PI)-180);if(n<0&&n>-180){n=360-Math.abs(n)}return Math.abs(n)},events:{addEvent:function g(m,l,n){if(m.addEventListener){return m.addEventListener(l,n,false)}else{if(m.attachEvent){return m.attachEvent("on"+l,n)}}},removeEvent:function g(m,l,n){if(m.addEventListener){return m.removeEventListener(l,n,false)}else{if(m.attachEvent){return m.detachEvent("on"+l,n)}}},prevent:function(l){if(l.preventDefault){l.preventDefault()}else{l.returnValue=false}}},parentUntil:function(n,l){var m=typeof l==="string";while(n.parentNode){if(m&&n.getAttribute&&n.getAttribute(l)){return n}else{if(!m&&n===l){return n}}n=n.parentNode}return null}},i={translate:{get:{matrix:function(n){if(!d.canTransform()){return parseInt(f.element.style.left,10)}else{var m=c.getComputedStyle(f.element)[e.vendor+"Transform"].match(/\((.*)\)/),l=8;if(m){m=m[1].split(",");if(m.length===16){n+=l}return parseInt(m[n],10)}return 0}}},easeCallback:function(){f.element.style[e.vendor+"Transition"]="";e.translation=i.translate.get.matrix(4);e.easing=false;clearInterval(e.animatingInterval);if(e.easingTo===0){d.klass.remove(b.body,"snapjs-right");d.klass.remove(b.body,"snapjs-left")}d.dispatchEvent("animated");d.events.removeEvent(f.element,d.transitionCallback(),i.translate.easeCallback)},easeTo:function(l){if(!d.canTransform()){e.translation=l;i.translate.x(l)}else{e.easing=true;e.easingTo=l;f.element.style[e.vendor+"Transition"]="all "+f.transitionSpeed+"s "+f.easing;e.animatingInterval=setInterval(function(){d.dispatchEvent("animating")},1);d.events.addEvent(f.element,d.transitionCallback(),i.translate.easeCallback);i.translate.x(l)}if(l===0){f.element.style[e.vendor+"Transform"]=""}},x:function(m){if((f.disable==="left"&&m>0)||(f.disable==="right"&&m<0)){return}if(!f.hyperextensible){if(m===f.maxPosition||m>f.maxPosition){m=f.maxPosition}else{if(m===f.minPosition||m<f.minPosition){m=f.minPosition}}}m=parseInt(m,10);if(isNaN(m)){m=0}if(d.canTransform()){var l="translate3d("+m+"px, 0,0)";f.element.style[e.vendor+"Transform"]=l}else{f.element.style.width=(c.innerWidth||b.documentElement.clientWidth)+"px";f.element.style.left=m+"px";f.element.style.right=""}}},drag:{listen:function(){e.translation=0;e.easing=false;d.events.addEvent(f.element,d.eventType("down"),i.drag.startDrag);d.events.addEvent(f.element,d.eventType("move"),i.drag.dragging);d.events.addEvent(f.element,d.eventType("up"),i.drag.endDrag)},stopListening:function(){d.events.removeEvent(f.element,d.eventType("down"),i.drag.startDrag);d.events.removeEvent(f.element,d.eventType("move"),i.drag.dragging);d.events.removeEvent(f.element,d.eventType("up"),i.drag.endDrag)},startDrag:function(n){var m=n.target?n.target:n.srcElement,l=d.parentUntil(m,"data-snap-ignore");if(l){d.dispatchEvent("ignore");return}if(f.dragger){var o=d.parentUntil(m,f.dragger);if(!o&&(e.translation!==f.minPosition&&e.translation!==f.maxPosition)){return}}d.dispatchEvent("start");f.element.style[e.vendor+"Transition"]="";e.isDragging=true;e.hasIntent=null;e.intentChecked=false;e.startDragX=d.page("X",n);e.startDragY=d.page("Y",n);e.dragWatchers={current:0,last:0,hold:0,state:""};e.simpleStates={opening:null,towards:null,hyperExtending:null,halfway:null,flick:null,translation:{absolute:0,relative:0,sinceDirectionChange:0,percentage:0}}},dragging:function(s){if(e.isDragging&&f.touchToDrag){var v=d.page("X",s),u=d.page("Y",s),t=e.translation,o=i.translate.get.matrix(4),n=v-e.startDragX,p=o>0,q=n,w;if((e.intentChecked&&!e.hasIntent)){return}if(f.addBodyClasses){if((o)>0){d.klass.add(b.body,"snapjs-left");d.klass.remove(b.body,"snapjs-right")}else{if((o)<0){d.klass.add(b.body,"snapjs-right");d.klass.remove(b.body,"snapjs-left")}}}if(e.hasIntent===false||e.hasIntent===null){var m=d.angleOfDrag(v,u),l=(m>=0&&m<=f.slideIntent)||(m<=360&&m>(360-f.slideIntent)),r=(m>=180&&m<=(180+f.slideIntent))||(m<=180&&m>=(180-f.slideIntent));if(!r&&!l){e.hasIntent=false}else{e.hasIntent=true}e.intentChecked=true}if((f.minDragDistance>=Math.abs(v-e.startDragX))||(e.hasIntent===false)){return}d.events.prevent(s);d.dispatchEvent("drag");e.dragWatchers.current=v;if(e.dragWatchers.last>v){if(e.dragWatchers.state!=="left"){e.dragWatchers.state="left";e.dragWatchers.hold=v}e.dragWatchers.last=v}else{if(e.dragWatchers.last<v){if(e.dragWatchers.state!=="right"){e.dragWatchers.state="right";e.dragWatchers.hold=v}e.dragWatchers.last=v}}if(p){if(f.maxPosition<o){w=(o-f.maxPosition)*f.resistance;q=n-w}e.simpleStates={opening:"left",towards:e.dragWatchers.state,hyperExtending:f.maxPosition<o,halfway:o>(f.maxPosition/2),flick:Math.abs(e.dragWatchers.current-e.dragWatchers.hold)>f.flickThreshold,translation:{absolute:o,relative:n,sinceDirectionChange:(e.dragWatchers.current-e.dragWatchers.hold),percentage:(o/f.maxPosition)*100}}}else{if(f.minPosition>o){w=(o-f.minPosition)*f.resistance;q=n-w}e.simpleStates={opening:"right",towards:e.dragWatchers.state,hyperExtending:f.minPosition>o,halfway:o<(f.minPosition/2),flick:Math.abs(e.dragWatchers.current-e.dragWatchers.hold)>f.flickThreshold,translation:{absolute:o,relative:n,sinceDirectionChange:(e.dragWatchers.current-e.dragWatchers.hold),percentage:(o/f.minPosition)*100}}}i.translate.x(q+t)}},endDrag:function(m){if(e.isDragging){d.dispatchEvent("end");var l=i.translate.get.matrix(4);if(e.dragWatchers.current===0&&l!==0&&f.tapToClose){d.dispatchEvent("close");d.events.prevent(m);i.translate.easeTo(0);e.isDragging=false;e.startDragX=0;return}if(e.simpleStates.opening==="left"){if((e.simpleStates.halfway||e.simpleStates.hyperExtending||e.simpleStates.flick)){if(e.simpleStates.flick&&e.simpleStates.towards==="left"){i.translate.easeTo(0)}else{if((e.simpleStates.flick&&e.simpleStates.towards==="right")||(e.simpleStates.halfway||e.simpleStates.hyperExtending)){i.translate.easeTo(f.maxPosition)}}}else{i.translate.easeTo(0)}}else{if(e.simpleStates.opening==="right"){if((e.simpleStates.halfway||e.simpleStates.hyperExtending||e.simpleStates.flick)){if(e.simpleStates.flick&&e.simpleStates.towards==="right"){i.translate.easeTo(0)}else{if((e.simpleStates.flick&&e.simpleStates.towards==="left")||(e.simpleStates.halfway||e.simpleStates.hyperExtending)){i.translate.easeTo(f.minPosition)}}}else{i.translate.easeTo(0)}}}e.isDragging=false;e.startDragX=d.page("X",m)}}}},j=function(l){if(l.element){d.deepExtend(f,l);e.vendor=d.vendor();i.drag.listen()}};this.open=function(l){d.dispatchEvent("open");d.klass.remove(b.body,"snapjs-expand-left");d.klass.remove(b.body,"snapjs-expand-right");if(l==="left"){e.simpleStates.opening="left";e.simpleStates.towards="right";d.klass.add(b.body,"snapjs-left");d.klass.remove(b.body,"snapjs-right");i.translate.easeTo(f.maxPosition)}else{if(l==="right"){e.simpleStates.opening="right";e.simpleStates.towards="left";d.klass.remove(b.body,"snapjs-left");d.klass.add(b.body,"snapjs-right");i.translate.easeTo(f.minPosition)}}};this.close=function(){d.dispatchEvent("close");i.translate.easeTo(0)};this.expand=function(l){var m=c.innerWidth||b.documentElement.clientWidth;if(l==="left"){d.dispatchEvent("expandLeft");d.klass.add(b.body,"snapjs-expand-left");d.klass.remove(b.body,"snapjs-expand-right")}else{d.dispatchEvent("expandRight");d.klass.add(b.body,"snapjs-expand-right");d.klass.remove(b.body,"snapjs-expand-left");m*=-1}i.translate.easeTo(m)};this.on=function(l,m){h[l]=m;return this};this.off=function(l){if(h[l]){h[l]=false}};this.enable=function(){d.dispatchEvent("enable");i.drag.listen()};this.disable=function(){d.dispatchEvent("disable");i.drag.stopListening()};this.settings=function(l){d.deepExtend(f,l)};this.state=function(){var l,m=i.translate.get.matrix(4);if(m===f.maxPosition){l="left"}else{if(m===f.minPosition){l="right"}else{l="closed"}}return{state:l,info:e.simpleStates}};j(k)};if((typeof module!=="undefined")&&module.exports){module.exports=a}if(typeof ender==="undefined"){this.Snap=a}if((typeof define==="function")&&define.amd){define("snap",[],function(){return a})}}).call(this,window,document);

/*
 * jQuery throttle / debounce - v1.1 - 3/7/2010
 * http://benalman.com/projects/jquery-throttle-debounce-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function(b,c){var $=b,a;$.throttle=a=function(e,f,j,i){var h,d=0;if(typeof f!=="boolean"){i=j;j=f;f=c}function g(){var o=this,m=+new Date()-d,n=arguments;function l(){d=+new Date();j.apply(o,n)}function k(){h=c}if(i&&!h){l()}h&&clearTimeout(h);if(i===c&&m>e){l()}else{if(f!==true){h=setTimeout(i?k:l,i===c?e-m:e)}}}if($.guid){g.guid=j.guid=j.guid||$.guid++}return g};$.debounce=function(d,e,f){return f===c?a(d,e,false):a(d,f,e!==false)}})($);

/**
 * jQuery.popover plugin v1.1.2
 * By Davey IJzermans
 * See http://wp.me/p12l3P-gT for details
 * http://daveyyzermans.nl/
 * 
 * Released under MIT License.
 */

(function(a) {
  //define some default plugin options
  var defaults = {
    verticalOffset: 10, //offset the popover by y px vertically (movement depends on position of popover. If position == 'bottom', positive numbers are down)
    horizontalOffset: 10, //offset the popover by x px horizontally (movement depends on position of popover. If position == 'right', positive numbers are right)
    title: false, //heading, false for none
    content: false, //content of the popover
    url: false, //set to an url to load content via ajax
    classes: '', //classes to give the popover, i.e. normal, wider or large
    position: 'auto', //where should the popover be placed? Auto, top, right, bottom, left or absolute (i.e. { top: 4 }, { left: 4 })
    fadeSpeed: 160, //how fast to fade out popovers when destroying or hiding
    trigger: 'click', //how to trigger the popover: click, hover or manual
    preventDefault: true, //preventDefault actions on the element on which the popover is called
    stopChildrenPropagation: true, //prevent propagation on popover children
    hideOnHTMLClick: true, //hides the popover when clicked outside of it
    animateChange: true, //animate a popover reposition
    autoReposition: true, //automatically reposition popover on popover change and window resize
    anchor: false //anchor the popover to a different element
  }
  var popovers = [];
  var _ = {
    calc_position: function(popover, position) {
      var data = popover.popover("getData");
      var options = data.options;
      var $anchor = options.anchor ? $(options.anchor) : popover;
      var el = data.popover;
      
      var coordinates = $anchor.offset();
      var y1, x1;
      
      if (position == 'top') {
        y1 = coordinates.top - el.outerHeight();
        x1 = coordinates.left - el.outerWidth() / 2 + $anchor.outerWidth() / 2;
      } else if (position == 'right') {
        y1 = coordinates.top + $anchor.outerHeight() / 2 - el.outerHeight() / 2;
        x1 = coordinates.left + $anchor.outerWidth();
      } else if (position == 'left') {
        y1 = coordinates.top + $anchor.outerHeight() / 2 - el.outerHeight() / 2;
        x1 = coordinates.left - el.outerWidth();
      } else {
        //bottom
        y1 = coordinates.top + $anchor.outerHeight();
        x1 = coordinates.left - el.outerWidth() / 2 + $anchor.outerWidth() / 2;
      }
      
      x2 = x1 + el.outerWidth();
      y2 = y1 + el.outerHeight();
      ret = {
        x1: x1,
        x2: x2,
        y1: y1,
        y2: y2
      };
      
      return ret;
    },
    pop_position_class: function(popover, position) {
      var remove = "popover-top popover-right popover-left";
      var arrow = "top-arrow"
      var arrow_remove = "right-arrow bottom-arrow left-arrow";
      
      if (position == 'top') {
        remove = "popover-right popover-bottom popover-left";
        arrow = 'bottom-arrow';
        arrow_remove = "top-arrow right-arrow left-arrow";
      } else if (position == 'right') {
        remove = "popover-yop popover-bottom popover-left";
        arrow = 'left-arrow';
        arrow_remove = "top-arrow right-arrow bottom-arrow";
      } else if (position == 'left') {
        remove = "popover-top popover-right popover-bottom";
        arrow = 'right-arrow';
        arrow_remove = "top-arrow bottom-arrow left-arrow";
      }
      
      popover
        .removeClass(remove)
        .addClass('popover-' + position)
        .find('.arrow')
          .removeClass(arrow_remove)
          .addClass(arrow);
    }
  };
  var methods = {
    /**
     * Initialization method
     * Merges parameters with defaults, makes the popover and saves data
     * 
     * @param object
     * @return jQuery
     */
    init : function(params) {
      return this.each(function() {
        var options = $.extend({}, defaults, params);
        
        var $this = $(this);
        var data = $this.popover('getData');
        
        if ( ! data) {
          var popover = $('<div class="popover wcelements" />')
            .addClass(options.classes)
            .append('<div class="arrow" />')
            .append('<div class="wrap"><span class="close-sticky">x</span></div>')
            .appendTo('body')
            .hide();
          
          popover.find('.close-sticky').bind('click.popover', function(e) {
              $this.popover('fadeOut');
          });

          if (options.anchor) {
            if ( ! options.anchor instanceof a) {
              options.anchor = $(options.anchor);
            }
          }
          
          var data = {
            target: $this,
            popover: popover,
            options: options
          };
          
          if (options.title) {
            $('<div class="title" />')
              .html(options.title instanceof a ? options.title.html() : options.title)
              .appendTo(popover.find('.wrap')); 
          }
          if (options.content) {
            $('<div class="content" />')
              .html(options.content instanceof a ? options.content.html() : options.content)
              .appendTo(popover.find('.wrap'));
          }

          $this.data('popover', data);
          popovers.push($this);
          
          if (options.url) {
            $this.popover('ajax', options.url);
          }
          
          $this.popover('reposition');
          $this.popover('setTrigger', options.trigger);

          if (options.hideOnHTMLClick) {
            var hideEvent = "click.popover";
            // if ("ontouchstart" in document.documentElement)
            //   hideEvent = 'touchstart.popover';
            $('html').unbind(hideEvent).bind(hideEvent, function(event) {
              if ( $(event.target).parents('.popover') )  
                { return false; } else {
                  $('html').popover('fadeOutAll');
                }
            });
          }
          var repos_function = function() {
              $this.popover('reposition');
          };

          if (options.autoReposition) {
            $(window).scroll($.debounce( 250, true, function(){
                 // on scroll start event
                 $this.popover('hideAll');
          }));

           $(window)
              .unbind('resize.popover').bind('resize.popover', repos_function);
              // .unbind('scroll.popover').bind('scroll.popover', repos_function);
          }
        }
      });
    },
    /**
     * Reposition the popover
     * 
     * @return jQuery
     */
    reposition: function() {
      return $.each(popovers, function() {
        var $this = $(this);
        var data = $this.popover('getData');

        if (data) {
          var popover = data.popover;
          var options = data.options;
          var $anchor = options.anchor ? $(options.anchor) : $this;
          var coordinates = $anchor.offset();
          
          var position = options.position;
          if ( ! (position == 'top' || position == 'right' || position == 'left' || position == 'auto')) {
            position = 'bottom';
          }
          var calc;
          
          if (position == 'auto') {
            var positions = ["bottom", "left", "top", "right"];
            var scrollTop = $(window).scrollTop();
            var scrollLeft = $(window).scrollLeft();
            var windowHeight = $(window).outerHeight();
            var windowWidth = $(window).outerWidth();
            
            $.each (positions, function(i, pos) {
              calc = _.calc_position($this, pos);
              
              var x1 = calc.x1 - scrollLeft;
              var x2 = calc.x2 - scrollLeft + options.horizontalOffset;
              var y1 = calc.y1 - scrollTop;
              var y2 = calc.y2 - scrollTop + options.verticalOffset;
              
              if (x1 < 0 || x2 < 0 || y1 < 0 || y2 < 0)
                //popover is left off of the screen or above it
                return true; //continue
              
              if (y2 > windowHeight)
                //popover is under the window viewport
                return true; //continue
              
              if (x2 > windowWidth)
                //popover is right off of the screen
                return true; //continue
              
              position = pos;
              return false;
            });
            
            if (position == 'auto') {
              //position is still auto
              return;
            }
          }
          
          calc = _.calc_position($this, position);
          var top = calc.top;
          var left = calc.left;
          _.pop_position_class(popover, position);
          
          var marginTop = 0;
          var marginLeft = 0;
          if (position == 'bottom') {
            marginTop = options.verticalOffset;
          }
          if (position == 'top') {
            marginTop = -options.verticalOffset;
          }
          if (position == 'right') {
            marginLeft = options.horizontalOffset;
          }
          if (position == 'left') {
            marginLeft = -options.horizontalOffset;
          }
          
          var css = {
            left: calc.x1,
            top: calc.y1,
            marginTop: marginTop,
            marginLeft: marginLeft
          };
          
          if (data.initd) {
            popover.css(css);
          } else {
            data.initd = true;
            popover.css(css);
          }
          $this.data('popover', data);
        }
      });
    },
    /**
     * Remove a popover from the DOM and clean up data associated with it.
     * 
     * @return jQuery
     */
    destroy: function() {
      return this.each(function() {
        var $this = $(this);
        var data = $this.popover('getData');
        
        $this.unbind('.popover');
        $(window).unbind('.popover');
        data.popover.remove();
        $this.removeData('popover');
      });
    },
    /**
     * Show the popover
     * 
     * @return jQuery
     */
    show: function() {
      return this.each(function() {
        var $this = $(this);
        var data = $this.popover('getData');
        
        if (data) {
          var popover = data.popover;
          $this.popover('reposition');
          popover.clearQueue().show();
        }
      });
    },
    /**
     * Hide the popover
     * 
     * @return jQuery
     */
    hide: function() {
      return this.each(function() {
        var $this = $(this);
        var data = $this.popover('getData');
        
        if (data) {
          data.popover.hide();
        }
      });
    },
    /**
     * Fade out the popover
     * 
     * @return jQuery
     */
    fadeIn: function(ms) {
      return this.each(function() {
        var $this = $(this);
        var data = $this.popover('getData');
        
        if (data) {
          var popover = data.popover;
          var options = data.options;
          $this.popover('reposition');
          popover.delay(100).fadeIn(ms ? ms : options.fadeSpeed);
        }
      });
    },
    /**
     * Fade out the popover
     * 
     * @return jQuery
     */
    fadeOut: function(ms) {
      return this.each(function() {
        var $this = $(this);
        var data = $this.popover('getData');
        
        if (data) {
          var popover = data.popover;
          var options = data.options;
          popover.delay(100).fadeOut(ms ? ms : options.fadeSpeed);
        }
      });
    },
    /**
     * Hide all popovers
     * 
     * @return jQuery
     */
    hideAll: function() {
      return $.each (popovers, function(i, pop) {
        var $this = $(this);
        var data = $this.popover('getData');
        
        if (data) {
          var popover = data.popover;
          popover.hide();
        }
      });
    },
    /**
     * Fade out all popovers
     * 
     * @param int
     * @return jQuery
     */
    fadeOutAll: function(ms) {
      return $.each (popovers, function(i, pop) {
        var $this = $(this);
        var data = $this.popover('getData');
        
        if (data) {
          var popover = data.popover;
          var options = data.options;
          popover.fadeOut(ms ? ms : options.fadeSpeed);
        }
      });
    },
    /**
     * Set the event trigger for the popover. Also cleans the previous binding. 
     * 
     * @param string
     * @return jQuery
     */
    setTrigger: function(trigger) {
      return this.each(function() {
        var $this = $(this);
        var data = $this.popover('getData');
        
        if (data) {
          var popover = data.popover;
          var options = data.options;
          var $anchor = options.anchor ? $(options.anchor) : $this;
          
          if (trigger === 'click') {
            $anchor.unbind('click.popover').bind('click.popover', function(event) {
              if (options.preventDefault) {
                event.preventDefault();
              }
              event.stopPropagation();
              $this.popover('show');
            });
            popover.unbind('click.popover').bind('click.popover', function(event) {
              event.stopPropagation();
            });
          } else {
            $anchor.unbind('click.popover');
            popover.unbind('click.popover')
          }
          
          if (trigger === 'hover') {
            $anchor.add(popover).bind('mouseover.popover', function(event) {
                if ($this.parent().parent().is('.wchatdrag')) {
                  $this.popover('hide');
                  return;
                } 
                $this.popover('show');
            });
            $anchor.add(popover).bind('mouseleave.popover', function(event) {
              $this.popover('fadeOut');
            });
          } else {
            $anchor.add(popover).unbind('mousemove.popover').unbind('mouseleave.popover');
          }
          
          if (trigger === 'focus') {
            $anchor.add(popover).bind('focus.popover', function(event) {
              $this.popover('show');
            });
            $anchor.add(popover).bind('blur.popover', function(event) {
              $this.popover('fadeOut');
            });
            $anchor.bind('click.popover', function(event) {
              event.stopPropagation();
            });
          } else {
            $anchor.add(popover).unbind('focus.popover').unbind('blur.popover').unbind('click.popover');
          }
        }
      });
    },
    /**
     * Rename the popover's title
     * 
     * @param string
     * @return jQuery
     */
    title: function(text) {
      return this.each(function() {
        var $this = $(this);
        var data = $this.popover('getData');
        
        if (data) {
          var title = data.popover.find('.title');
          var wrap = data.popover.find('.wrap');
          if (title.length === 0) {
            title = $('<div class="title" />').appendTo(wrap);
          }
          title.html(text);
        }
      });
    },
    /**
     * Set the popover's content
     * 
     * @param html
     * @return jQuery
     */
    content: function(html) {
      return this.each(function() {
        var $this = $(this);
        var data = $this.popover('getData');
        
        if (data) {
          var content = data.popover.find('.content');
          var wrap = data.popover.find('.wrap');
          if (content.length === 0) {
            content = $('<div class="content" />').appendTo(wrap);
          }
          if (html ==='') { 
            content.remove();
          } else {
          content.html(html);
          }
        }
      });
    },
    /**
     * Read content with AJAX and set popover's content.
     * 
     * @param string
     * @param object
     * @return jQuery
     */
    ajax: function(url, ajax_params) {
      return this.each(function() {
        var $this = $(this);
        var data = $this.popover('getData');
        
        if (data) {
          var ajax_defaults = {
            url: url,
            success: function(ajax_data) {
              var content = data.popover.find('.content');
              var wrap = data.popover.find('.wrap');
              if (content.length === 0) {
                content = $('<div class="content" />').appendTo(wrap);
              }
              content.html(ajax_data);
            }
          }
          var ajax_options = $.extend({}, ajax_defaults, ajax_params);
          $.ajax(ajax_options);
        }
      });
    },
    setOption: function(option, value) {
      return this.each(function() {
        var $this = $(this);
        var data = $this.popover('getData');
        
        if (data) {
          data.options[option] = value;
          $this.data('popover', data);
        }
      });
    },
    getData: function() {
      var ret = [];
      this.each(function() {
        var $this = $(this);
        var data = $this.data('popover');
        
        if (data) ret.push(data);
      });
      
      if (ret.length == 0) {
        return;
      }
      if (ret.length == 1) {
        ret = ret[0];
      }
      return ret;
    }
  };

  a.fn.popover = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if ( typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist on jQuery.popover');
    }
  }
})($);


(function(a){
    var pluginName = 'circleMenu',
        defaults = {
            depth: 0,
            item_diameter: 30,
            circle_radius: 80,
            angle:{
                start: 0,
                end: 90
            },
            speed: 500,
            delay: 1000,
            step_out: 20,
            step_in: -20,
            trigger: 'hover',
            transition_function: 'ease'
        };

    function vendorPrefixes(items,prop,value){
        ['-webkit-','-moz-','-o-','-ms-',''].forEach(function(prefix){
            items.css(prefix+prop,value);
        });
    }

    function CircleMenu(element, options){
        this._timeouts = [];
        this.element = $(element);
        this.options = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
        this.hook();
    }

    CircleMenu.prototype.init = function(){
        var self = this,
            directions = {
                'bottom-left':[180,90],
                'bottom':[135,45],
                'right':[-45,45],
                'left':[225,135],
                'top':[225,315],
                'bottom-half':[180,0],
                'right-half':[-90,90],
                'left-half':[270,90],
                'top-half':[180,360],
                'top-left':[270,180],
                'top-right':[270,360],
                'full':[-90,270-Math.floor(360/(self.element.children('li').length - 1))],
                'bottom-right':[0,90]
            },
            dir;

        self._state = 'closed';
        self.element.addClass(pluginName+'-closed');

        if(typeof self.options.direction === 'string'){
            dir = directions[self.options.direction.toLowerCase()];
            if(dir){
                self.options.angle.start = dir[0];
                self.options.angle.end = dir[1];
            }
        }

        self.menu_items = self.element.children('li:not(:first-child)');
        self.initCss();
        self.item_count = self.menu_items.length;
        self._step = (self.options.angle.end - self.options.angle.start) / (self.item_count-1);
        self.menu_items.each(function(index){
            var $item = $(this),
                angle = (self.options.angle.start + (self._step * index)) * (Math.PI/180),
                x = Math.round(self.options.circle_radius * Math.cos(angle)),
                y = Math.round(self.options.circle_radius * Math.sin(angle));

            $item.data('plugin_'+pluginName+'-pos-x', x);
            $item.data('plugin_'+pluginName+'-pos-y', y);
            $item.on('click', function(){
                self.select(index+2);
            });
        });

        // Initialize event hooks from options
        ['open','close','init','select'].forEach(function(evt){
            var fn;

            if(self.options[evt]){
                fn = self.options[evt];
                self.element.on(pluginName+'-'+evt, function(){
                    return fn.apply(self,arguments);
                });
                delete self.options[evt];
            }
        });

        self.submenus = self.menu_items.children('ul');
        self.submenus.circleMenu($.extend({},self.options,{depth:self.options.depth+1}));

        self.trigger('init');
    };
    CircleMenu.prototype.trigger = function(){
        var args = [],
            i, len;

        for(i = 0, len = arguments.length; i < len; i++){
            args.push(arguments[i]);
        }
        this.element.trigger(pluginName+'-'+args.shift(), args);
    };
    CircleMenu.prototype.hook = function(){
        var self = this;

        if(self.options.trigger === 'hover'){
            self.element.on('mouseenter',function(evt){
                self.open();
            }).on('mouseleave',function(evt){
                self.close();
            });
        }else if(self.options.trigger === 'click'){
            self.element.children('li:first-child').on('click',function(evt){
                evt.preventDefault();
                if(self._state === 'closed' || self._state === 'closing'){
                    self.open();
                }else{
                    self.close(true);
                }
                return false;
            });
        }else if(self.options.trigger === 'none'){
            // Do nothing
        }
    };
    CircleMenu.prototype.open = function(){
        var self = this,
            $self = this.element,
            start = 0,
            set;

        self.clearTimeouts();
        if(self._state === 'open') return self;
        $self.addClass(pluginName+'-open');
        $self.removeClass(pluginName+'-closed');
        if(self.options.step_out >= 0){
            set = self.menu_items;
        }else{
            set = $(self.menu_items.get().reverse());
        }
        set.each(function(index){
            var $item = $(this);

            self._timeouts.push(setTimeout(function(){
                $item.css({
                    left: $item.data('plugin_'+pluginName+'-pos-x')+'px',
                    top: $item.data('plugin_'+pluginName+'-pos-y')+'px'
                });
                vendorPrefixes($item,'transform','scale(1)');
            }, start + Math.abs(self.options.step_out) * index));
        });
        self._timeouts.push(setTimeout(function(){
            if(self._state === 'opening') self.trigger('open');
            self._state = 'open';
        },start+Math.abs(self.options.step_out) * set.length));
        self._state = 'opening';
        return self;
    };
    CircleMenu.prototype.close = function(immediate){
        var self = this,
            $self = this.element,
            do_animation = function do_animation(){
            var start = 0,
                set;

            self.submenus.circleMenu('close');
            self.clearTimeouts();
            if(self._state === 'closed') return self;
            if(self.options.step_in >= 0){
                set = self.menu_items;
            }else{
                set = $(self.menu_items.get().reverse());
            }
            set.each(function(index){
                var $item = $(this);

                self._timeouts.push(setTimeout(function(){
                    $item.css({top:0,left:0});
                    vendorPrefixes($item,'transform','scale(.5)');
                }, start + Math.abs(self.options.step_in) * index));
            });
            self._timeouts.push(setTimeout(function(){
                if(self._state === 'closing') self.trigger('close');
                self._state = 'closed';
            },start+Math.abs(self.options.step_in) * set.length));
            $self.removeClass(pluginName+'-open');
            $self.addClass(pluginName+'-closed');
            self._state = 'closing';
            return self;
        };
        if(immediate){
            do_animation();
        }else{
            self._timeouts.push(setTimeout(do_animation,self.options.delay));
        }
        return this;
    };
    CircleMenu.prototype.select = function(index){
        var self = this,
            selected, set_other;

        if(self._state === 'open' || self._state === 'opening'){
            self.clearTimeouts();
            set_other = self.element.children('li:not(:nth-child('+index+'),:first-child)');
            selected = self.element.children('li:nth-child('+index+')');
            self.trigger('select',selected);
            vendorPrefixes(selected.add(set_other), 'transition', 'all 500ms ease-out');
            vendorPrefixes(selected, 'transform', 'scale(2)');
            vendorPrefixes(set_other, 'transform', 'scale(0)');
            selected.css('opacity','0');
            set_other.css('opacity','0');
            self.element.removeClass(pluginName+'-open');
            setTimeout(function(){self.initCss();},500);
        }
    };
    CircleMenu.prototype.clearTimeouts = function(){
        var timeout;

        while(timeout = this._timeouts.shift()){
            clearTimeout(timeout);
        }
    };
    CircleMenu.prototype.initCss = function(){
        var self = this, 
            $items;

        self._state = 'closed';
        self.element.removeClass(pluginName+'-open');
        self.element.css({
            'list-style': 'none',
            'margin': 0,
            'padding': 0,
            'width': self.options.item_diameter+'px'
        });
        $items = self.element.children('li');
        $items.attr('style','');
        $items.css({
            'display': 'block',
            'width': self.options.item_diameter+'px',
            'height': self.options.item_diameter+'px',
            'text-align': 'center',
            'line-height': self.options.item_diameter+'px',
            'position': 'absolute',
            'z-index': 1,
            'opacity': ''
        });
        self.element.children('li:first-child').css({'z-index': 1000-self.options.depth});
        self.menu_items.css({
            top:0,
            left:0
        });
        vendorPrefixes($items, 'border-radius', self.options.item_diameter+'px');
        vendorPrefixes(self.menu_items, 'transform', 'scale(.5)');
        setTimeout(function(){
            vendorPrefixes($items, 'transition', 'all '+self.options.speed+'ms '+self.options.transition_function);
        },0);
    };

    a.fn[pluginName] = function(options){
        return this.each(function(){
            var obj = $.data(this, 'plugin_'+pluginName),
                commands = {
                'init':function(){obj.init();},
                'open':function(){obj.open();},
                'close':function(){obj.close(true);}
            };
            if(typeof options === 'string' && obj && commands[options]){
                commands[options]();
            }
            if(!obj){
                $.data(this, 'plugin_' + pluginName, new CircleMenu(this, options));
            }
        });
    };
})($);

/**
* Bootstrap.js by @fat & @mdo
* plugins: bootstrap-dropdown.js, bootstrap-tooltip.js, bootstrap-popover.js
* Copyright 2013 Twitter, Inc.
* http://www.apache.org/licenses/LICENSE-2.0.txt
*/
!function(a){function d(){a(".dropdown-backdrop").remove(),a(b).each(function(){e(a(this)).removeClass("open")})}function e(b){var c=b.attr("data-target"),d;c||(c=b.attr("href"),c=c&&/#/.test(c)&&c.replace(/.*(?=#[^\s]*$)/,"")),d=c&&a(c);if(!d||!d.length)d=b.parent();return d}var b="[data-toggle=dropdown]",c=function(b){var c=a(b).on("click.dropdown.data-api",this.toggle);a("html").on("click.dropdown.data-api",function(){c.parent().removeClass("open")})};c.prototype={constructor:c,toggle:function(b){var c=a(this),f,g;if(c.is(".disabled, :disabled"))return;return f=e(c),g=f.hasClass("open"),d(),g||("ontouchstart"in document.documentElement&&a('<div class="dropdown-backdrop"/>').insertBefore(a(this)).on("click",d),f.toggleClass("open")),c.focus(),!1},keydown:function(c){var d,f,g,h,i,j;if(!/(38|40|27)/.test(c.keyCode))return;d=a(this),c.preventDefault(),c.stopPropagation();if(d.is(".disabled, :disabled"))return;h=e(d),i=h.hasClass("open");if(!i||i&&c.keyCode==27)return c.which==27&&h.find(b).focus(),d.click();f=a("[role=menu] li:not(.divider):visible a",h);if(!f.length)return;j=f.index(f.filter(":focus")),c.keyCode==38&&j>0&&j--,c.keyCode==40&&j<f.length-1&&j++,~j||(j=0),f.eq(j).focus()}};var f=a.fn.dropdown;a.fn.dropdown=function(b){return this.each(function(){var d=a(this),e=d.data("dropdown");e||d.data("dropdown",e=new c(this)),typeof b=="string"&&e[b].call(d)})},a.fn.dropdown.Constructor=c,a.fn.dropdown.noConflict=function(){return a.fn.dropdown=f,this},a(document).on("click.dropdown.data-api",d).on("click.dropdown.data-api",".dropdown form",function(a){a.stopPropagation()}).on("click.dropdown.data-api",b,c.prototype.toggle).on("keydown.dropdown.data-api",b+", [role=menu]",c.prototype.keydown)}($),!function(a){var b=function(a,b){this.init("tooltip",a,b)};b.prototype={constructor:b,init:function(b,c,d){var e,f,g,h,i;this.type=b,this.$element=a(c),this.options=this.getOptions(d),this.enabled=!0,g=this.options.trigger.split(" ");for(i=g.length;i--;)h=g[i],h=="click"?this.$element.on("click."+this.type,this.options.selector,a.proxy(this.toggle,this)):h!="manual"&&(e=h=="hover"?"mouseenter":"focus",f=h=="hover"?"mouseleave":"blur",this.$element.on(e+"."+this.type,this.options.selector,a.proxy(this.enter,this)),this.$element.on(f+"."+this.type,this.options.selector,a.proxy(this.leave,this)));this.options.selector?this._options=a.extend({},this.options,{trigger:"manual",selector:""}):this.fixTitle()},getOptions:function(b){return b=a.extend({},a.fn[this.type].defaults,this.$element.data(),b),b.delay&&typeof b.delay=="number"&&(b.delay={show:b.delay,hide:b.delay}),b},enter:function(b){var c=a.fn[this.type].defaults,d={},e;this._options&&a.each(this._options,function(a,b){c[a]!=b&&(d[a]=b)},this),e=a(b.currentTarget)[this.type](d).data(this.type);if(!e.options.delay||!e.options.delay.show)return e.show();clearTimeout(this.timeout),e.hoverState="in",this.timeout=setTimeout(function(){e.hoverState=="in"&&e.show()},e.options.delay.show)},leave:function(b){var c=a(b.currentTarget)[this.type](this._options).data(this.type);this.timeout&&clearTimeout(this.timeout);if(!c.options.delay||!c.options.delay.hide)return c.hide();c.hoverState="out",this.timeout=setTimeout(function(){c.hoverState=="out"&&c.hide()},c.options.delay.hide)},show:function(){var b,c,d,e,f,g,h=a.Event("show");if(this.hasContent()&&this.enabled){this.$element.trigger(h);if(h.isDefaultPrevented())return;b=this.tip(),this.setContent(),this.options.animation&&b.addClass("fade"),f=typeof this.options.placement=="function"?this.options.placement.call(this,b[0],this.$element[0]):this.options.placement,b.detach().css({top:0,left:0,display:"block"}),b.appendTo(document.body),c=this.getPosition(),d=b[0].offsetWidth,e=b[0].offsetHeight;switch(f){case"bottom":g={top:c.top+c.height,left:c.left+c.width/2-d/2};break;case"top":g={top:c.top-e,left:c.left+c.width/2-d/2};break;case"left":g={top:c.top+c.height/2-e/2,left:c.left-d-5};break;case"right":g={top:c.top+c.height/2-e/2,left:c.left+c.width}}this.applyPlacement(g,f),this.$element.trigger("shown")}},applyPlacement:function(a,b){var c=this.tip(),d=c[0].offsetWidth,e=c[0].offsetHeight,f,g,h,i;c.offset(a).addClass(b).addClass("in"),f=c[0].offsetWidth,g=c[0].offsetHeight,b=="top"&&g!=e&&(a.top=a.top+e-g,i=!0),b=="bottom"||b=="top"?(h=0,a.left<0&&(h=a.left*-2,a.left=0,c.offset(a),f=c[0].offsetWidth,g=c[0].offsetHeight),this.replaceArrow(h-d+f,f,"left")):this.replaceArrow(g-e,g,"top"),i&&c.offset(a)},replaceArrow:function(a,b,c){this.arrow().css(c,a?50*(1-a/b)+"%":"")},setContent:function(){var a=this.tip(),b=this.getTitle();a.find(".tooltip-inner")[this.options.html?"html":"text"](b),a.removeClass("fade in top bottom left right")},hide:function(){function e(){var b=setTimeout(function(){c.off(a.support.transition.end).detach()},500);c.one(a.support.transition.end,function(){clearTimeout(b),c.detach()})}var b=this,c=this.tip(),d=a.Event("hide");this.$element.trigger(d);if(d.isDefaultPrevented())return;return c.removeClass("in"),a.support.transition&&this.$tip.hasClass("fade")?e():c.detach(),this.$element.trigger("hidden"),this},fixTitle:function(){var a=this.$element;(a.attr("title")||typeof a.attr("data-original-title")!="string")&&a.attr("data-original-title",a.attr("title")||"").attr("title","")},hasContent:function(){return this.getTitle()},getPosition:function(){var b=this.$element[0];return a.extend({},typeof b.getBoundingClientRect=="function"?b.getBoundingClientRect():{width:b.offsetWidth,height:b.offsetHeight},this.$element.offset())},getTitle:function(){var a,b=this.$element,c=this.options;return a=b.attr("data-original-title")||(typeof c.title=="function"?c.title.call(b[0]):c.title),a},tip:function(){return this.$tip=this.$tip||a(this.options.template)},arrow:function(){return this.$arrow=this.$arrow||this.tip().find(".tooltip-arrow")},validate:function(){this.$element[0].parentNode||(this.hide(),this.$element=null,this.options=null)},enable:function(){this.enabled=!0},disable:function(){this.enabled=!1},toggleEnabled:function(){this.enabled=!this.enabled},toggle:function(b){var c=b?a(b.currentTarget)[this.type](this._options).data(this.type):this;c.tip().hasClass("in")?c.hide():c.show()},destroy:function(){this.hide().$element.off("."+this.type).removeData(this.type)}};var c=a.fn.tooltip;a.fn.tooltip=function(c){return this.each(function(){var d=a(this),e=d.data("tooltip"),f=typeof c=="object"&&c;e||d.data("tooltip",e=new b(this,f)),typeof c=="string"&&e[c]()})},a.fn.tooltip.Constructor=b,a.fn.tooltip.defaults={animation:!0,placement:"right",selector:!1,template:'<div class="tooltip wcelements"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:{ show: 500, hide: 100 },html:!1,container:!1},a.fn.tooltip.noConflict=function(){return a.fn.tooltip=c,this}}($);

// jQuery ArrowMark Ver 1.02 By Akinori Kawai http://lislis.sblo.jp/

// .arrowMark(target, options)
// Create Arrowmark to the target.
//   target : Target jQuery object
//   options : Options
//   options.strokeColor : Border color
//   options.fillColor : Fill color
//   options.lineWidth : Border width
//   options.barWidth : Width of the bar of the ArrowMark
//   options.arrowWidth : Width of the head of the arrow
//   options.arrowLength : Length of the head of the arrow
//   options.clipMargin : Margin from the elements
//   options.zIndex : z-index
//   options.monitor : If true, the Arrowmark chaces after connected elements

// .arrowMarkByLink(options)
// Connect the parent of <a href="#foo"> to the parent of <a name="foo">
//   options : Same as .arrowMark()

// .getArrowMark()
// Return jQuery objects of ArrowMark Canvas element.

// .deleteArrowMark()
// Delete Arrowmark.

(function(a) {
    // Create arrowMark from this to $targetObj.
    a.fn.arrowMark = function($targetObj, options) {
        var f = $.fn.arrowMark;
        var newCanvas = false;
        var draw = true;
        options = $.extend({
            strokeColor: "#ffffff",
            sticker: false,
            fillColor: "#000000",
            lineWidth: 0,
            clipMargin: 4,
            barWidth: 3,
            arrowWidth: 12,
            arrowLength: 16,
            arrow: "target", // Not implemented
            zIndex: 10,
            monitor: false,
            clip: true,
            nocliptarget: false,            
            refresh: false // Internal option
        }, options || {});
        return this.each(function() {
            var $element = $(this);
            $targetObj.each(function(){
                var $target = $(this);

                var $canvas;
                if(options.refresh){
                    $canvas = options.refresh;
                    options = $.extend(options, options.options || {});
                }else{
                    $canvas = $element.getArrowMark($target);
                    if(!$canvas.length){
                        newCanvas = true;
                        delete options.refresh;
                        $canvas = f.createNewCanvas($element, $target, options);
                        $canvas.css("pointer-events", "none"); // ver1.01: Added to through mouse events. (It does't work on IE8 nor Opera10.54.)
                    }
                }

                var position = f.getPosition($element, options.clipMargin);
                var targetPosition = f.getPosition($target, options.clipMargin);
                if(options.clip){
                     f.clip(position, targetPosition);
                     f.clip(targetPosition, position);
                }
                if(!options.nocliptarget){
                f.clip(targetPosition, position);
                }
                if(options.refresh){
                    var oldPosition = $canvas.data("arrowMarkPosition") || {};
                    var oldTargetPosition = $canvas.data("arrowMarkTargetPosition") || {};
                    if(
                        oldPosition.x == position.x &&
                        oldPosition.y == position.y &&
                        oldTargetPosition.x == targetPosition.x &&
                        oldTargetPosition.y == targetPosition.y
                    ){
                        draw = false;
                    }
                }

                if(draw){
                    if(f.checkVisible(position, targetPosition) && $target.is(":visible")){
                        var points = f.createArrowMark(position.x, position.y, targetPosition.x, targetPosition.y, options);
                        var size = f.pack(points, options.lineWidth);
                    }else{
                        points = [];
                        size = {left: 0, top: 0, width: 0, height: 0};
                    }

                    if(size.width != $canvas.attr("width") || size.height != $canvas.attr("height")){
                        $canvas.attr({width: size.width, height: size.height});
                    }

                    $canvas.css({left: size.left, top: size.top, zIndex: options.zIndex});
                    if(window.G_vmlCanvasManager){ // for IE6-8 to work ExplorerCanvas
                        $canvas = $(window.G_vmlCanvasManager.initElement($canvas.get(0)));
                    }
                    if($canvas.get(0).getContext){
                        var ctx = $canvas.get(0).getContext("2d");
                        if(!position.notVisible && !targetPosition.notVisible){
                            f.drawArrow(ctx, points, options);
                        }
                    }
                    
                    $canvas.data("arrowMarkPosition", position);
                    $canvas.data("arrowMarkTargetPosition", targetPosition);

                    if(!f.intervalId && options.monitor){
                        f.intervalId = setInterval(f.refreshArrowMarks, 15);
                    }
                }
            });
        });
    };

    // Create arrowMarka by <a href="#?">. Link between persons of <a>.
    $.fn.arrowMarkByLink = function(options){
        var f = $.fn.arrowMark;
        return this.each(function(){
            var targetname = $(this).attr("href");
            if(targetname){
                targetname = targetname.substr(1);
                $(this).parent().arrowMark($("a[name='" + targetname + "']").parent(), options);
            }
        });
    };

    // Get arrowMark Canvas that the Element owns.
    $.fn.getArrowMark = function($targetObj){
        var f = $.fn.arrowMark;
        if(!$targetObj) return f.getArrowMarks(this);
        var arrowMarkCanvas = "";
        this.each(function(){
            var $element = $(this);
            $targetObj.each(function(){
                var $target = $(this);
                var arrowMark0 = $element.data("arrowMark0");
                var arrowMark1 = $target.data("arrowMark1");
                if(arrowMark0 && arrowMark1){
                    for(var i in arrowMark0){
                        for(var j in arrowMark1){
                            if(arrowMark0[i] == arrowMark1[j]){
                                if(arrowMarkCanvas) arrowMarkCanvas += ",";
                                arrowMarkCanvas += "#" + arrowMark0[i];
                            }
                        }
                    }
                }
            });
        });
        return $(arrowMarkCanvas);
    };

    // Delete arrowMarks Canvas that the Element owns.
    $.fn.deleteArrowMark = function(){
        var f = $.fn.arrowMark;
        this.each(function(){
            var arrowMark0 = $(this).data("arrowMark0");
            if(arrowMark0){
                for(var i in arrowMark0){
                    f.deleteArrowMarkCanvas($("#" + arrowMark0[i]));
                }
            }
        });
    };

    // (Internal) Refresh arrowMarks
    $.fn.arrowMark.refreshArrowMarks = function(){
        var f = $.fn.arrowMark;
        var relatedObj = f.relatedObj;
        for(var i in relatedObj){
            var obj = relatedObj[i];
            var $element = $(obj.arrowMark0);
            var $target = $(obj.arrowMark1);
            if($element.parent().length && $target.parent().length){
                if(obj.options.monitor){
                    $element.arrowMark($target, {refresh: $(obj.canvas), options: obj.options});
                }
            }else{
                $(obj.canvas).remove();
                delete relatedObj[i];
            }
        }
    };
    
    $.fn.arrowMark.intervalId = 0;

    // (Internal) Get arrowMarks of the Element.
    $.fn.arrowMark.getArrowMarks = function($elementObj){
        var arrowMarkCanvas = "";
        $elementObj.each(function(){
            var $element = $(this);
            var arrowMark0 = $element.data("arrowMark0");
            if(arrowMark0){
                for(var i in arrowMark0){
                    if(arrowMarkCanvas) arrowMarkCanvas += ",";
                    arrowMarkCanvas += "#" + arrowMark0[i];
                }
            }
        });
        return $(arrowMarkCanvas);
    };

    $.fn.arrowMark.idCount = 0;

    $.fn.arrowMark.relatedObj = {};

    // (Internal) Create a new Canvas Element of the arrowMark.
    $.fn.arrowMark.createNewCanvas = function($element, $target, options){
        var f = $.fn.arrowMark;
        var $canvas = $("<canvas class='wcelements'></canvas>");
        $("body").append($canvas);
        $canvas.css("position", "absolute");
        var arrowMarkId = "__arrowmark__" + f.idCount;
        $canvas.attr("id", arrowMarkId);
        var arrowMark0 = $element.data("arrowMark0");
        arrowMark0 = arrowMark0 || {};
        arrowMark0[f.idCount] = arrowMarkId;
        $element.data("arrowMark0", arrowMark0);
        var arrowMark1 = $target.data("arrowMark1");
        arrowMark1 = arrowMark1 || {};
        arrowMark1[f.idCount] = arrowMarkId;
        $target.data("arrowMark1", arrowMark1);
        f.relatedObj[arrowMarkId] = {
            canvas: $canvas.get(0),
            arrowMark0: $element.get(0),
            arrowMark1: $target.get(0),
            options: options
        };
        f.idCount++;
        return $canvas;
    };

    // (Internal) Delete the Canvas Element of arrowMark.
    $.fn.arrowMark.deleteArrowMarkCanvas = function($element){
        var f = $.fn.arrowMark;
        var id = $element.attr("id");
        if(id){
            var relatedObj = f.relatedObj[id];
            if(relatedObj && relatedObj.arrowMark0){
                var arrowMark0 = $(relatedObj.arrowMark0).data("arrowMark0");
                if(arrowMark0){
                    for(var i in arrowMark0){
                        if(arrowMark0[i] == id){
                            delete arrowMark0[i]; 
                        }
                    }
                    $(relatedObj.arrowMark0).data("arrowMark0", arrowMark0);
                }
            }
            if(relatedObj && relatedObj.arrowMark1){
                var arrowMark1 = $(relatedObj.arrowMark1).data("arrowMark1");
                if(arrowMark1){
                    for(var i in arrowMark1){
                        if(arrowMark1[i] == id){
                            delete arrowMark1[i]; 
                        }
                    }
                    $(relatedObj.arrowMark1).data("arrowMark1", arrowMark1);
                }
            }
            $element.remove();
            delete f.relatedObj[id];
        }
    };

    // (Internal) Clip the arrowMark length.
    $.fn.arrowMark.clip = function(position, targetPosition){
        var dx = targetPosition.x - position.x;
        var dy = targetPosition.y - position.y;
        if(targetPosition.x > position.x1){
            var dx1 = (position.x1 - position.x) / dx;
            var y = position.y + dy * dx1;
            if(y >= position.y0  && y <= position.y1){
                position.x = position.x1;
                position.y = y;
            }
        }else if(targetPosition.x < position.x0){
            var dx1 = (position.x0 - position.x) / dx;
            var y = position.y + dy * dx1;
            if(y >= position.y0 && y <= position.y1){
                position.x = position.x0;
                position.y = y;
            }
        }
        if(targetPosition.y > position.y1){
            var dy1 = (position.y1 - position.y) / dy;
            var x = position.x + dx * dy1;
            if(x >= position.x0 && x <= position.x1){
                position.y = position.y1;
                position.x = x;
            }
        }else if(targetPosition.y < position.y0){
            var dy1 = (position.y0 - position.y) / dy;
            var x = position.x + dx * dy1;
            if(x >= position.x0 && x <= position.x1){
                position.y = position.y0;
                position.x = x;
            }
        }
    };

    $.fn.arrowMark.checkVisible = function(position, targetPosition){
        if((
            targetPosition.x >= position.x0 &&
            targetPosition.x <= position.x1 &&
            targetPosition.y >= position.y0 &&
            targetPosition.y <= position.y1
        ) || (
            position.x >= targetPosition.x0 &&
            position.x <= targetPosition.x1 &&
            position.y >= targetPosition.y0 &&
            position.y <= targetPosition.y1
        ) || (  targetPosition.x < 2 || targetPosition.y < 2 ) ){
            return false;
        }
        return true;
    };

    // (Internal) Get the position of the Element.
    $.fn.arrowMark.getPosition = function($obj, margin){
        margin = margin ? margin : 0;
        var position = $obj.offset();
        var left = position.left - margin;
        var top = position.top - margin;
        var width = $obj.outerWidth() + margin * 2;
        var height = $obj.outerHeight() + margin * 2;
        return {
            x0: left,
            y0: top,
            x1: left + width,
            y1: top + height,
            x: left + width / 2,
            y: top + height / 2,
            width: width,
            height: height,
            notVisible: false
        };
    };

    // (Internal) Create a line image of arrowMark.
    $.fn.arrowMark.createArrowMark = function(x0, y0, x1, y1, options){
        var barWidth = options.barWidth;
        var arrowWidth = options.arrowWidth;
        var arrowLength = options.arrowLength;
        var dx = x1 - x0;
        var dy = y1 - y0;
        var lineLength = Math.sqrt(dx * dx + dy * dy) - arrowLength;
        if(lineLength <= 0){
            lineLength = 0;
        }

        // create arrow
        if (options.sticker) {
        var points = [
            {x: 0, y: -arrowWidth / 2},
            {x: lineLength + arrowLength, y: 0},
            {x: 0, y: arrowWidth / 2}
        ]
        } else {
        var points = [
            {x: 0, y: -barWidth / 2},
            {x: lineLength, y: -barWidth / 2},
            {x: lineLength, y: -arrowWidth / 2},
            {x: lineLength + arrowLength, y: 0},
            {x: lineLength, y: arrowWidth / 2},
            {x: lineLength, y: barWidth / 2},
            {x: 0, y: barWidth / 2}
        ]
        }

        var rad = Math.atan2(dy, dx);
        if(rad > 0 && dy < 0){
            rad += -Math.PI;
        }else if(rad < 0 && dy > 0){
            rad += Math.PI;
        }
        
        // rotate arrow
        for(var i = 0; i < points.length; i++){
            var x = points[i].x;
            var y = points[i].y;
            points[i].x = x * Math.cos(rad) - y * Math.sin(rad) + x0;
            points[i].y = x * Math.sin(rad) + y * Math.cos(rad) + y0;
        }
        return points;
    };

    // (Internal) Trim the line image of arrowMark.
    $.fn.arrowMark.pack = function(points, margin){
        if(points.length < 2){
            return {
                left: 0,
                top: 0,
                width: 0,
                height: 0
            };
        }
        var minX = points[0].x;
        var maxX = minX;
        var minY = points[0].y;
        var maxY = minY;
        for(var i = 1; i < points.length; i++){
            minX = (minX <= points[i].x) ? minX : points[i].x;
            minY = (minY <= points[i].y) ? minY : points[i].y;
            maxX = (maxX >= points[i].x) ? maxX : points[i].x;
            maxY = (maxY >= points[i].y) ? maxY : points[i].y;
        }
        margin = margin ? margin : 0;
        margin++;
        minX-= margin;
        minY-= margin;
        maxX+= margin;
        maxY+= margin;
        
        for(var i = 0; i < points.length; i++){
            points[i].x -= minX;
            points[i].y -= minY;
        }
        return {
            left: minX,
            top: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    };

    // (Internal) Draw an arrowMark to the Canvas.
    $.fn.arrowMark.drawArrow = function(ctx, points, options){
        if(points.length < 2) return;
        ctx.save();
        ctx.fillStyle = options.fillColor;
        ctx.lineWidth = options.lineWidth;
        ctx.lineJoin = "round";
        ctx.strokeStyle = options.strokeColor;
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for(var i = 1; i < points.length; i++){
            ctx.lineTo(points[i].x, points[i].y);
        }
        if(options.lineWidth){
            ctx.closePath();
            ctx.stroke();
        }
        ctx.fill();
        ctx.restore();
    };

})($);

// Backbone 1.0
(function(){var t=this;var e=t.Backbone;var i=[];var r=i.push;var s=i.slice;var n=i.splice;var a;if(typeof exports!=="undefined"){a=exports}else{a=t.Backbone={}}a.VERSION="1.0.0";var h=t._;if(!h&&typeof require!=="undefined")h=require("underscore");a.$=t.jQuery||t.Zepto||t.ender||t.$;a.noConflict=function(){t.Backbone=e;return this};a.emulateHTTP=false;a.emulateJSON=false;var o=a.Events={on:function(t,e,i){if(!l(this,"on",t,[e,i])||!e)return this;this._events||(this._events={});var r=this._events[t]||(this._events[t]=[]);r.push({callback:e,context:i,ctx:i||this});return this},once:function(t,e,i){if(!l(this,"once",t,[e,i])||!e)return this;var r=this;var s=h.once(function(){r.off(t,s);e.apply(this,arguments)});s._callback=e;return this.on(t,s,i)},off:function(t,e,i){var r,s,n,a,o,u,c,f;if(!this._events||!l(this,"off",t,[e,i]))return this;if(!t&&!e&&!i){this._events={};return this}a=t?[t]:h.keys(this._events);for(o=0,u=a.length;o<u;o++){t=a[o];if(n=this._events[t]){this._events[t]=r=[];if(e||i){for(c=0,f=n.length;c<f;c++){s=n[c];if(e&&e!==s.callback&&e!==s.callback._callback||i&&i!==s.context){r.push(s)}}}if(!r.length)delete this._events[t]}}return this},trigger:function(t){if(!this._events)return this;var e=s.call(arguments,1);if(!l(this,"trigger",t,e))return this;var i=this._events[t];var r=this._events.all;if(i)c(i,e);if(r)c(r,arguments);return this},stopListening:function(t,e,i){var r=this._listeners;if(!r)return this;var s=!e&&!i;if(typeof e==="object")i=this;if(t)(r={})[t._listenerId]=t;for(var n in r){r[n].off(e,i,this);if(s)delete this._listeners[n]}return this}};var u=/\s+/;var l=function(t,e,i,r){if(!i)return true;if(typeof i==="object"){for(var s in i){t[e].apply(t,[s,i[s]].concat(r))}return false}if(u.test(i)){var n=i.split(u);for(var a=0,h=n.length;a<h;a++){t[e].apply(t,[n[a]].concat(r))}return false}return true};var c=function(t,e){var i,r=-1,s=t.length,n=e[0],a=e[1],h=e[2];switch(e.length){case 0:while(++r<s)(i=t[r]).callback.call(i.ctx);return;case 1:while(++r<s)(i=t[r]).callback.call(i.ctx,n);return;case 2:while(++r<s)(i=t[r]).callback.call(i.ctx,n,a);return;case 3:while(++r<s)(i=t[r]).callback.call(i.ctx,n,a,h);return;default:while(++r<s)(i=t[r]).callback.apply(i.ctx,e)}};var f={listenTo:"on",listenToOnce:"once"};h.each(f,function(t,e){o[e]=function(e,i,r){var s=this._listeners||(this._listeners={});var n=e._listenerId||(e._listenerId=h.uniqueId("l"));s[n]=e;if(typeof i==="object")r=this;e[t](i,r,this);return this}});o.bind=o.on;o.unbind=o.off;h.extend(a,o);var d=a.Model=function(t,e){var i;var r=t||{};e||(e={});this.cid=h.uniqueId("c");this.attributes={};h.extend(this,h.pick(e,p));if(e.parse)r=this.parse(r,e)||{};if(i=h.result(this,"defaults")){r=h.defaults({},r,i)}this.set(r,e);this.changed={};this.initialize.apply(this,arguments)};var p=["url","urlRoot","collection"];h.extend(d.prototype,o,{changed:null,validationError:null,idAttribute:"id",initialize:function(){},toJSON:function(t){return h.clone(this.attributes)},sync:function(){return a.sync.apply(this,arguments)},get:function(t){return this.attributes[t]},escape:function(t){return h.escape(this.get(t))},has:function(t){return this.get(t)!=null},set:function(t,e,i){var r,s,n,a,o,u,l,c;if(t==null)return this;if(typeof t==="object"){s=t;i=e}else{(s={})[t]=e}i||(i={});if(!this._validate(s,i))return false;n=i.unset;o=i.silent;a=[];u=this._changing;this._changing=true;if(!u){this._previousAttributes=h.clone(this.attributes);this.changed={}}c=this.attributes,l=this._previousAttributes;if(this.idAttribute in s)this.id=s[this.idAttribute];for(r in s){e=s[r];if(!h.isEqual(c[r],e))a.push(r);if(!h.isEqual(l[r],e)){this.changed[r]=e}else{delete this.changed[r]}n?delete c[r]:c[r]=e}if(!o){if(a.length)this._pending=true;for(var f=0,d=a.length;f<d;f++){this.trigger("change:"+a[f],this,c[a[f]],i)}}if(u)return this;if(!o){while(this._pending){this._pending=false;this.trigger("change",this,i)}}this._pending=false;this._changing=false;return this},unset:function(t,e){return this.set(t,void 0,h.extend({},e,{unset:true}))},clear:function(t){var e={};for(var i in this.attributes)e[i]=void 0;return this.set(e,h.extend({},t,{unset:true}))},hasChanged:function(t){if(t==null)return!h.isEmpty(this.changed);return h.has(this.changed,t)},changedAttributes:function(t){if(!t)return this.hasChanged()?h.clone(this.changed):false;var e,i=false;var r=this._changing?this._previousAttributes:this.attributes;for(var s in t){if(h.isEqual(r[s],e=t[s]))continue;(i||(i={}))[s]=e}return i},previous:function(t){if(t==null||!this._previousAttributes)return null;return this._previousAttributes[t]},previousAttributes:function(){return h.clone(this._previousAttributes)},fetch:function(t){t=t?h.clone(t):{};if(t.parse===void 0)t.parse=true;var e=this;var i=t.success;t.success=function(r){if(!e.set(e.parse(r,t),t))return false;if(i)i(e,r,t);e.trigger("sync",e,r,t)};R(this,t);return this.sync("read",this,t)},save:function(t,e,i){var r,s,n,a=this.attributes;if(t==null||typeof t==="object"){r=t;i=e}else{(r={})[t]=e}if(r&&(!i||!i.wait)&&!this.set(r,i))return false;i=h.extend({validate:true},i);if(!this._validate(r,i))return false;if(r&&i.wait){this.attributes=h.extend({},a,r)}if(i.parse===void 0)i.parse=true;var o=this;var u=i.success;i.success=function(t){o.attributes=a;var e=o.parse(t,i);if(i.wait)e=h.extend(r||{},e);if(h.isObject(e)&&!o.set(e,i)){return false}if(u)u(o,t,i);o.trigger("sync",o,t,i)};R(this,i);s=this.isNew()?"create":i.patch?"patch":"update";if(s==="patch")i.attrs=r;n=this.sync(s,this,i);if(r&&i.wait)this.attributes=a;return n},destroy:function(t){t=t?h.clone(t):{};var e=this;var i=t.success;var r=function(){e.trigger("destroy",e,e.collection,t)};t.success=function(s){if(t.wait||e.isNew())r();if(i)i(e,s,t);if(!e.isNew())e.trigger("sync",e,s,t)};if(this.isNew()){t.success();return false}R(this,t);var s=this.sync("delete",this,t);if(!t.wait)r();return s},url:function(){var t=h.result(this,"urlRoot")||h.result(this.collection,"url")||U();if(this.isNew())return t;return t+(t.charAt(t.length-1)==="/"?"":"/")+encodeURIComponent(this.id)},parse:function(t,e){return t},clone:function(){return new this.constructor(this.attributes)},isNew:function(){return this.id==null},isValid:function(t){return this._validate({},h.extend(t||{},{validate:true}))},_validate:function(t,e){if(!e.validate||!this.validate)return true;t=h.extend({},this.attributes,t);var i=this.validationError=this.validate(t,e)||null;if(!i)return true;this.trigger("invalid",this,i,h.extend(e||{},{validationError:i}));return false}});var v=["keys","values","pairs","invert","pick","omit"];h.each(v,function(t){d.prototype[t]=function(){var e=s.call(arguments);e.unshift(this.attributes);return h[t].apply(h,e)}});var g=a.Collection=function(t,e){e||(e={});if(e.url)this.url=e.url;if(e.model)this.model=e.model;if(e.comparator!==void 0)this.comparator=e.comparator;this._reset();this.initialize.apply(this,arguments);if(t)this.reset(t,h.extend({silent:true},e))};var m={add:true,remove:true,merge:true};var y={add:true,merge:false,remove:false};h.extend(g.prototype,o,{model:d,initialize:function(){},toJSON:function(t){return this.map(function(e){return e.toJSON(t)})},sync:function(){return a.sync.apply(this,arguments)},add:function(t,e){return this.set(t,h.defaults(e||{},y))},remove:function(t,e){t=h.isArray(t)?t.slice():[t];e||(e={});var i,r,s,n;for(i=0,r=t.length;i<r;i++){n=this.get(t[i]);if(!n)continue;delete this._byId[n.id];delete this._byId[n.cid];s=this.indexOf(n);this.models.splice(s,1);this.length--;if(!e.silent){e.index=s;n.trigger("remove",n,this,e)}this._removeReference(n)}return this},set:function(t,e){e=h.defaults(e||{},m);if(e.parse)t=this.parse(t,e);if(!h.isArray(t))t=t?[t]:[];var i,s,a,o,u,l;var c=e.at;var f=this.comparator&&c==null&&e.sort!==false;var d=h.isString(this.comparator)?this.comparator:null;var p=[],v=[],g={};for(i=0,s=t.length;i<s;i++){if(!(a=this._prepareModel(t[i],e)))continue;if(u=this.get(a)){if(e.remove)g[u.cid]=true;if(e.merge){u.set(a.attributes,e);if(f&&!l&&u.hasChanged(d))l=true}}else if(e.add){p.push(a);a.on("all",this._onModelEvent,this);this._byId[a.cid]=a;if(a.id!=null)this._byId[a.id]=a}}if(e.remove){for(i=0,s=this.length;i<s;++i){if(!g[(a=this.models[i]).cid])v.push(a)}if(v.length)this.remove(v,e)}if(p.length){if(f)l=true;this.length+=p.length;if(c!=null){n.apply(this.models,[c,0].concat(p))}else{r.apply(this.models,p)}}if(l)this.sort({silent:true});if(e.silent)return this;for(i=0,s=p.length;i<s;i++){(a=p[i]).trigger("add",a,this,e)}if(l)this.trigger("sort",this,e);return this},reset:function(t,e){e||(e={});for(var i=0,r=this.models.length;i<r;i++){this._removeReference(this.models[i])}e.previousModels=this.models;this._reset();this.add(t,h.extend({silent:true},e));if(!e.silent)this.trigger("reset",this,e);return this},push:function(t,e){t=this._prepareModel(t,e);this.add(t,h.extend({at:this.length},e));return t},pop:function(t){var e=this.at(this.length-1);this.remove(e,t);return e},unshift:function(t,e){t=this._prepareModel(t,e);this.add(t,h.extend({at:0},e));return t},shift:function(t){var e=this.at(0);this.remove(e,t);return e},slice:function(t,e){return this.models.slice(t,e)},get:function(t){if(t==null)return void 0;return this._byId[t.id!=null?t.id:t.cid||t]},at:function(t){return this.models[t]},where:function(t,e){if(h.isEmpty(t))return e?void 0:[];return this[e?"find":"filter"](function(e){for(var i in t){if(t[i]!==e.get(i))return false}return true})},findWhere:function(t){return this.where(t,true)},sort:function(t){if(!this.comparator)throw new Error("Cannot sort a set without a comparator");t||(t={});if(h.isString(this.comparator)||this.comparator.length===1){this.models=this.sortBy(this.comparator,this)}else{this.models.sort(h.bind(this.comparator,this))}if(!t.silent)this.trigger("sort",this,t);return this},sortedIndex:function(t,e,i){e||(e=this.comparator);var r=h.isFunction(e)?e:function(t){return t.get(e)};return h.sortedIndex(this.models,t,r,i)},pluck:function(t){return h.invoke(this.models,"get",t)},fetch:function(t){t=t?h.clone(t):{};if(t.parse===void 0)t.parse=true;var e=t.success;var i=this;t.success=function(r){var s=t.reset?"reset":"set";i[s](r,t);if(e)e(i,r,t);i.trigger("sync",i,r,t)};R(this,t);return this.sync("read",this,t)},create:function(t,e){e=e?h.clone(e):{};if(!(t=this._prepareModel(t,e)))return false;if(!e.wait)this.add(t,e);var i=this;var r=e.success;e.success=function(s){if(e.wait)i.add(t,e);if(r)r(t,s,e)};t.save(null,e);return t},parse:function(t,e){return t},clone:function(){return new this.constructor(this.models)},_reset:function(){this.length=0;this.models=[];this._byId={}},_prepareModel:function(t,e){if(t instanceof d){if(!t.collection)t.collection=this;return t}e||(e={});e.collection=this;var i=new this.model(t,e);if(!i._validate(t,e)){this.trigger("invalid",this,t,e);return false}return i},_removeReference:function(t){if(this===t.collection)delete t.collection;t.off("all",this._onModelEvent,this)},_onModelEvent:function(t,e,i,r){if((t==="add"||t==="remove")&&i!==this)return;if(t==="destroy")this.remove(e,r);if(e&&t==="change:"+e.idAttribute){delete this._byId[e.previous(e.idAttribute)];if(e.id!=null)this._byId[e.id]=e}this.trigger.apply(this,arguments)}});var _=["forEach","each","map","collect","reduce","foldl","inject","reduceRight","foldr","find","detect","filter","select","reject","every","all","some","any","include","contains","invoke","max","min","toArray","size","first","head","take","initial","rest","tail","drop","last","without","indexOf","shuffle","lastIndexOf","isEmpty","chain"];h.each(_,function(t){g.prototype[t]=function(){var e=s.call(arguments);e.unshift(this.models);return h[t].apply(h,e)}});var w=["groupBy","countBy","sortBy"];h.each(w,function(t){g.prototype[t]=function(e,i){var r=h.isFunction(e)?e:function(t){return t.get(e)};return h[t](this.models,r,i)}});var b=a.View=function(t){this.cid=h.uniqueId("view");this._configure(t||{});this._ensureElement();this.initialize.apply(this,arguments);this.delegateEvents()};var x=/^(\S+)\s*(.*)$/;var E=["model","collection","el","id","attributes","className","tagName","events"];h.extend(b.prototype,o,{tagName:"div",$:function(t){return this.$el.find(t)},initialize:function(){},render:function(){return this},remove:function(){this.$el.remove();this.stopListening();return this},setElement:function(t,e){if(this.$el)this.undelegateEvents();this.$el=t instanceof a.$?t:a.$(t);this.el=this.$el[0];if(e!==false)this.delegateEvents();return this},delegateEvents:function(t){if(!(t||(t=h.result(this,"events"))))return this;this.undelegateEvents();for(var e in t){var i=t[e];if(!h.isFunction(i))i=this[t[e]];if(!i)continue;var r=e.match(x);var s=r[1],n=r[2];i=h.bind(i,this);s+=".delegateEvents"+this.cid;if(n===""){this.$el.on(s,i)}else{this.$el.on(s,n,i)}}return this},undelegateEvents:function(){this.$el.off(".delegateEvents"+this.cid);return this},_configure:function(t){if(this.options)t=h.extend({},h.result(this,"options"),t);h.extend(this,h.pick(t,E));this.options=t},_ensureElement:function(){if(!this.el){var t=h.extend({},h.result(this,"attributes"));if(this.id)t.id=h.result(this,"id");if(this.className)t["class"]=h.result(this,"className");var e=a.$("<"+h.result(this,"tagName")+">").attr(t);this.setElement(e,false)}else{this.setElement(h.result(this,"el"),false)}}});a.sync=function(t,e,i){var r=k[t];h.defaults(i||(i={}),{emulateHTTP:a.emulateHTTP,emulateJSON:a.emulateJSON});var s={type:r,dataType:"json"};if(!i.url){s.url=h.result(e,"url")||U()}if(i.data==null&&e&&(t==="create"||t==="update"||t==="patch")){s.contentType="application/json";s.data=JSON.stringify(i.attrs||e.toJSON(i))}if(i.emulateJSON){s.contentType="application/x-www-form-urlencoded";s.data=s.data?{model:s.data}:{}}if(i.emulateHTTP&&(r==="PUT"||r==="DELETE"||r==="PATCH")){s.type="POST";if(i.emulateJSON)s.data._method=r;var n=i.beforeSend;i.beforeSend=function(t){t.setRequestHeader("X-HTTP-Method-Override",r);if(n)return n.apply(this,arguments)}}if(s.type!=="GET"&&!i.emulateJSON){s.processData=false}if(s.type==="PATCH"&&window.ActiveXObject&&!(window.external&&window.external.msActiveXFilteringEnabled)){s.xhr=function(){return new ActiveXObject("Microsoft.XMLHTTP")}}var o=i.xhr=a.ajax(h.extend(s,i));e.trigger("request",e,o,i);return o};var k={create:"POST",update:"PUT",patch:"PATCH","delete":"DELETE",read:"GET"};a.ajax=function(){return a.$.ajax.apply(a.$,arguments)};var S=a.Router=function(t){t||(t={});if(t.routes)this.routes=t.routes;this._bindRoutes();this.initialize.apply(this,arguments)};var $=/\((.*?)\)/g;var T=/(\(\?)?:\w+/g;var H=/\*\w+/g;var A=/[\-{}\[\]+?.,\\\^$|#\s]/g;h.extend(S.prototype,o,{initialize:function(){},route:function(t,e,i){if(!h.isRegExp(t))t=this._routeToRegExp(t);if(h.isFunction(e)){i=e;e=""}if(!i)i=this[e];var r=this;a.history.route(t,function(s){var n=r._extractParameters(t,s);i&&i.apply(r,n);r.trigger.apply(r,["route:"+e].concat(n));r.trigger("route",e,n);a.history.trigger("route",r,e,n)});return this},navigate:function(t,e){a.history.navigate(t,e);return this},_bindRoutes:function(){if(!this.routes)return;this.routes=h.result(this,"routes");var t,e=h.keys(this.routes);while((t=e.pop())!=null){this.route(t,this.routes[t])}},_routeToRegExp:function(t){t=t.replace(A,"\\$&").replace($,"(?:$1)?").replace(T,function(t,e){return e?t:"([^/]+)"}).replace(H,"(.*?)");return new RegExp("^"+t+"$")},_extractParameters:function(t,e){var i=t.exec(e).slice(1);return h.map(i,function(t){return t?decodeURIComponent(t):null})}});var I=a.History=function(){this.handlers=[];h.bindAll(this,"checkUrl");if(typeof window!=="undefined"){this.location=window.location;this.history=window.history}};var N=/^[#\/]|\s+$/g;var P=/^\/+|\/+$/g;var O=/msie [\w.]+/;var C=/\/$/;I.started=false;h.extend(I.prototype,o,{interval:50,getHash:function(t){var e=(t||this).location.href.match(/#(.*)$/);return e?e[1]:""},getFragment:function(t,e){if(t==null){if(this._hasPushState||!this._wantsHashChange||e){t=this.location.pathname;var i=this.root.replace(C,"");if(!t.indexOf(i))t=t.substr(i.length)}else{t=this.getHash()}}return t.replace(N,"")},start:function(t){if(I.started)throw new Error("Backbone.history has already been started");I.started=true;this.options=h.extend({},{root:"/"},this.options,t);this.root=this.options.root;this._wantsHashChange=this.options.hashChange!==false;this._wantsPushState=!!this.options.pushState;this._hasPushState=!!(this.options.pushState&&this.history&&this.history.pushState);var e=this.getFragment();var i=document.documentMode;var r=O.exec(navigator.userAgent.toLowerCase())&&(!i||i<=7);this.root=("/"+this.root+"/").replace(P,"/");if(r&&this._wantsHashChange){this.iframe=a.$('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo("body")[0].contentWindow;this.navigate(e)}if(this._hasPushState){a.$(window).on("popstate",this.checkUrl)}else if(this._wantsHashChange&&"onhashchange"in window&&!r){a.$(window).on("hashchange",this.checkUrl)}else if(this._wantsHashChange){this._checkUrlInterval=setInterval(this.checkUrl,this.interval)}this.fragment=e;var s=this.location;var n=s.pathname.replace(/[^\/]$/,"$&/")===this.root;if(this._wantsHashChange&&this._wantsPushState&&!this._hasPushState&&!n){this.fragment=this.getFragment(null,true);this.location.replace(this.root+this.location.search+"#"+this.fragment);return true}else if(this._wantsPushState&&this._hasPushState&&n&&s.hash){this.fragment=this.getHash().replace(N,"");this.history.replaceState({},document.title,this.root+this.fragment+s.search)}if(!this.options.silent)return this.loadUrl()},stop:function(){a.$(window).off("popstate",this.checkUrl).off("hashchange",this.checkUrl);clearInterval(this._checkUrlInterval);I.started=false},route:function(t,e){this.handlers.unshift({route:t,callback:e})},checkUrl:function(t){var e=this.getFragment();if(e===this.fragment&&this.iframe){e=this.getFragment(this.getHash(this.iframe))}if(e===this.fragment)return false;if(this.iframe)this.navigate(e);this.loadUrl()||this.loadUrl(this.getHash())},loadUrl:function(t){var e=this.fragment=this.getFragment(t);var i=h.any(this.handlers,function(t){if(t.route.test(e)){t.callback(e);return true}});return i},navigate:function(t,e){if(!I.started)return false;if(!e||e===true)e={trigger:e};t=this.getFragment(t||"");if(this.fragment===t)return;this.fragment=t;var i=this.root+t;if(this._hasPushState){this.history[e.replace?"replaceState":"pushState"]({},document.title,i)}else if(this._wantsHashChange){this._updateHash(this.location,t,e.replace);if(this.iframe&&t!==this.getFragment(this.getHash(this.iframe))){if(!e.replace)this.iframe.document.open().close();this._updateHash(this.iframe.location,t,e.replace)}}else{return this.location.assign(i)}if(e.trigger)this.loadUrl(t)},_updateHash:function(t,e,i){if(i){var r=t.href.replace(/(javascript:|#).*$/,"");t.replace(r+"#"+e)}else{t.hash="#"+e}}});a.history=new I;var j=function(t,e){var i=this;var r;if(t&&h.has(t,"constructor")){r=t.constructor}else{r=function(){return i.apply(this,arguments)}}h.extend(r,i,e);var s=function(){this.constructor=r};s.prototype=i.prototype;r.prototype=new s;if(t)h.extend(r.prototype,t);r.__super__=i.prototype;return r};d.extend=g.extend=S.extend=b.extend=I.extend=j;var U=function(){throw new Error('A "url" property or function must be specified')};var R=function(t,e){var i=e.error;e.error=function(r){if(i)i(t,r,e);t.trigger("error",t,r,e)}}}).call(this);

// MarionetteJS (Backbone.Marionette)
// ----------------------------------
// v1.1.0
//
// Copyright (c)2013 Derick Bailey, Muted Solutions, LLC.
// Distributed under MIT license
//
// http://marionettejs.com
/*!
 * Includes BabySitter
 * https://github.com/marionettejs/backbone.babysitter/
 *
 * Includes Wreqr
 * https://github.com/marionettejs/backbone.wreqr/
 */

Backbone.ChildViewContainer=function(e,t){var i=function(e){this._views={},this._indexByModel={},this._indexByCustom={},this._updateLength(),t.each(e,this.add,this)};t.extend(i.prototype,{add:function(e,t){var i=e.cid;this._views[i]=e,e.model&&(this._indexByModel[e.model.cid]=i),t&&(this._indexByCustom[t]=i),this._updateLength()},findByModel:function(e){return this.findByModelCid(e.cid)},findByModelCid:function(e){var t=this._indexByModel[e];return this.findByCid(t)},findByCustom:function(e){var t=this._indexByCustom[e];return this.findByCid(t)},findByIndex:function(e){return t.values(this._views)[e]},findByCid:function(e){return this._views[e]},remove:function(e){var i=e.cid;e.model&&delete this._indexByModel[e.model.cid],t.any(this._indexByCustom,function(e,t){return e===i?(delete this._indexByCustom[t],!0):void 0},this),delete this._views[i],this._updateLength()},call:function(e){this.apply(e,t.tail(arguments))},apply:function(e,i){t.each(this._views,function(n){t.isFunction(n[e])&&n[e].apply(n,i||[])})},_updateLength:function(){this.length=t.size(this._views)}});var n=["forEach","each","map","find","detect","filter","select","reject","every","all","some","any","include","contains","invoke","toArray","first","initial","rest","last","without","isEmpty","pluck"];return t.each(n,function(e){i.prototype[e]=function(){var i=t.values(this._views),n=[i].concat(t.toArray(arguments));return t[e].apply(t,n)}}),i}(Backbone,_),Backbone.Wreqr=function(e,t,i){"use strict";var n={};return n.Handlers=function(e,t){var i=function(e){this.options=e,this._wreqrHandlers={},t.isFunction(this.initialize)&&this.initialize(e)};return i.extend=e.Model.extend,t.extend(i.prototype,e.Events,{setHandlers:function(e){t.each(e,function(e,i){var n=null;t.isObject(e)&&!t.isFunction(e)&&(n=e.context,e=e.callback),this.setHandler(i,e,n)},this)},setHandler:function(e,t,i){var n={callback:t,context:i};this._wreqrHandlers[e]=n,this.trigger("handler:add",e,t,i)},hasHandler:function(e){return!!this._wreqrHandlers[e]},getHandler:function(e){var t=this._wreqrHandlers[e];if(!t)throw Error("Handler not found for '"+e+"'");return function(){var e=Array.prototype.slice.apply(arguments);return t.callback.apply(t.context,e)}},removeHandler:function(e){delete this._wreqrHandlers[e]},removeAllHandlers:function(){this._wreqrHandlers={}}}),i}(e,i),n.CommandStorage=function(){var t=function(e){this.options=e,this._commands={},i.isFunction(this.initialize)&&this.initialize(e)};return i.extend(t.prototype,e.Events,{getCommands:function(e){var t=this._commands[e];return t||(t={command:e,instances:[]},this._commands[e]=t),t},addCommand:function(e,t){var i=this.getCommands(e);i.instances.push(t)},clearCommands:function(e){var t=this.getCommands(e);t.instances=[]}}),t}(),n.Commands=function(e){return e.Handlers.extend({storageType:e.CommandStorage,constructor:function(t){this.options=t||{},this._initializeStorage(this.options),this.on("handler:add",this._executeCommands,this);var i=Array.prototype.slice.call(arguments);e.Handlers.prototype.constructor.apply(this,i)},execute:function(e,t){e=arguments[0],t=Array.prototype.slice.call(arguments,1),this.hasHandler(e)?this.getHandler(e).apply(this,t):this.storage.addCommand(e,t)},_executeCommands:function(e,t,n){var r=this.storage.getCommands(e);i.each(r.instances,function(e){t.apply(n,e)}),this.storage.clearCommands(e)},_initializeStorage:function(e){var t,n=e.storageType||this.storageType;t=i.isFunction(n)?new n:n,this.storage=t}})}(n),n.RequestResponse=function(e){return e.Handlers.extend({request:function(){var e=arguments[0],t=Array.prototype.slice.call(arguments,1);return this.getHandler(e).apply(this,t)}})}(n),n.EventAggregator=function(e,t){var i=function(){};return i.extend=e.Model.extend,t.extend(i.prototype,e.Events),i}(e,i),n}(Backbone,Backbone.Marionette,_);var Marionette=function(e,t,i){"use strict";function n(e){return s.call(e)}function r(e,t){var i=Error(e);throw i.name=t||"Error",i}var o={};t.Marionette=o,o.$=t.$;var s=Array.prototype.slice;return o.extend=t.Model.extend,o.getOption=function(e,t){if(e&&t){var i;return i=e.options&&t in e.options&&void 0!==e.options[t]?e.options[t]:e[t]}},o.triggerMethod=function(){function e(e,t,i){return i.toUpperCase()}var t=/(^|:)(\w)/gi,n=function(n){var r="on"+n.replace(t,e),o=this[r];return i.isFunction(this.trigger)&&this.trigger.apply(this,arguments),i.isFunction(o)?o.apply(this,i.tail(arguments)):void 0};return n}(),o.MonitorDOMRefresh=function(){function e(e){e._isShown=!0,n(e)}function t(e){e._isRendered=!0,n(e)}function n(e){e._isShown&&e._isRendered&&i.isFunction(e.triggerMethod)&&e.triggerMethod("dom:refresh")}return function(i){i.listenTo(i,"show",function(){e(i)}),i.listenTo(i,"render",function(){t(i)})}}(),function(e){function t(e,t,n,o){var s=o.split(/\s+/);i.each(s,function(i){var o=e[i];o||r("Method '"+i+"' was configured as an event handler, but does not exist."),e.listenTo(t,n,o,e)})}function n(e,t,i,n){e.listenTo(t,i,n,e)}function o(e,t,n,r){var o=r.split(/\s+/);i.each(o,function(i){var r=e[i];e.stopListening(t,n,r,e)})}function s(e,t,i,n){e.stopListening(t,i,n,e)}function h(e,t,n,r,o){t&&n&&(i.isFunction(n)&&(n=n.call(e)),i.each(n,function(n,s){i.isFunction(n)?r(e,t,s,n):o(e,t,s,n)}))}e.bindEntityEvents=function(e,i,r){h(e,i,r,n,t)},e.unbindEntityEvents=function(e,t,i){h(e,t,i,s,o)}}(o),o.Callbacks=function(){this._deferred=o.$.Deferred(),this._callbacks=[]},i.extend(o.Callbacks.prototype,{add:function(e,t){this._callbacks.push({cb:e,ctx:t}),this._deferred.done(function(i,n){t&&(i=t),e.call(i,n)})},run:function(e,t){this._deferred.resolve(t,e)},reset:function(){var e=this._callbacks;this._deferred=o.$.Deferred(),this._callbacks=[],i.each(e,function(e){this.add(e.cb,e.ctx)},this)}}),o.Controller=function(e){this.triggerMethod=o.triggerMethod,this.options=e||{},i.isFunction(this.initialize)&&this.initialize(this.options)},o.Controller.extend=o.extend,i.extend(o.Controller.prototype,t.Events,{close:function(){this.stopListening(),this.triggerMethod("close"),this.unbind()}}),o.Region=function(e){if(this.options=e||{},this.el=o.getOption(this,"el"),!this.el){var t=Error("An 'el' must be specified for a region.");throw t.name="NoElError",t}if(this.initialize){var i=Array.prototype.slice.apply(arguments);this.initialize.apply(this,i)}},i.extend(o.Region,{buildRegion:function(e,t){var n="string"==typeof e,r="string"==typeof e.selector,o=e.regionType===void 0,s="function"==typeof e;if(!s&&!n&&!r)throw Error("Region must be specified as a Region type, a selector string or an object with selector property");var h,a;n&&(h=e),e.selector&&(h=e.selector),s&&(a=e),!s&&o&&(a=t),e.regionType&&(a=e.regionType);var l=new a({el:h});return e.parentEl&&(l.getEl=function(t){var n=e.parentEl;return i.isFunction(n)&&(n=n()),n.find(t)}),l}}),i.extend(o.Region.prototype,t.Events,{show:function(e){this.ensureEl();var t=e.isClosed||i.isUndefined(e.$el),n=e!==this.currentView;n&&this.close(),e.render(),(n||t)&&this.open(e),this.currentView=e,o.triggerMethod.call(this,"show",e),o.triggerMethod.call(e,"show")},ensureEl:function(){this.$el&&0!==this.$el.length||(this.$el=this.getEl(this.el))},getEl:function(e){return o.$(e)},open:function(e){this.$el.empty().append(e.el)},close:function(){var e=this.currentView;e&&!e.isClosed&&(e.close?e.close():e.remove&&e.remove(),o.triggerMethod.call(this,"close"),delete this.currentView)},attachView:function(e){this.currentView=e},reset:function(){this.close(),delete this.$el}}),o.Region.extend=o.extend,o.RegionManager=function(e){var t=e.Controller.extend({constructor:function(t){this._regions={},e.Controller.prototype.constructor.call(this,t)},addRegions:function(e,t){var n={};return i.each(e,function(e,r){"string"==typeof e&&(e={selector:e}),e.selector&&(e=i.defaults({},e,t));var o=this.addRegion(r,e);n[r]=o},this),n},addRegion:function(t,n){var r,o=i.isObject(n),s=i.isString(n),h=!!n.selector;return r=s||o&&h?e.Region.buildRegion(n,e.Region):i.isFunction(n)?e.Region.buildRegion(n,e.Region):n,this._store(t,r),this.triggerMethod("region:add",t,r),r},get:function(e){return this._regions[e]},removeRegion:function(e){var t=this._regions[e];this._remove(e,t)},removeRegions:function(){i.each(this._regions,function(e,t){this._remove(t,e)},this)},closeRegions:function(){i.each(this._regions,function(e){e.close()},this)},close:function(){this.removeRegions();var t=Array.prototype.slice.call(arguments);e.Controller.prototype.close.apply(this,t)},_store:function(e,t){this._regions[e]=t,this._setLength()},_remove:function(e,t){t.close(),delete this._regions[e],this._setLength(),this.triggerMethod("region:remove",e,t)},_setLength:function(){this.length=i.size(this._regions)}}),n=["forEach","each","map","find","detect","filter","select","reject","every","all","some","any","include","contains","invoke","toArray","first","initial","rest","last","without","isEmpty","pluck"];return i.each(n,function(e){t.prototype[e]=function(){var t=i.values(this._regions),n=[t].concat(i.toArray(arguments));return i[e].apply(i,n)}}),t}(o),o.TemplateCache=function(e){this.templateId=e},i.extend(o.TemplateCache,{templateCaches:{},get:function(e){var t=this.templateCaches[e];return t||(t=new o.TemplateCache(e),this.templateCaches[e]=t),t.load()},clear:function(){var e,t=n(arguments),i=t.length;if(i>0)for(e=0;i>e;e++)delete this.templateCaches[t[e]];else this.templateCaches={}}}),i.extend(o.TemplateCache.prototype,{load:function(){if(this.compiledTemplate)return this.compiledTemplate;var e=this.loadTemplate(this.templateId);return this.compiledTemplate=this.compileTemplate(e),this.compiledTemplate},loadTemplate:function(e){var t=o.$(e).html();return t&&0!==t.length||r("Could not find template: '"+e+"'","NoTemplateError"),t},compileTemplate:function(e){return i.template(e)}}),o.Renderer={render:function(e,t){if(!e){var i=Error("Cannot render the template since it's false, null or undefined.");throw i.name="TemplateNotFoundError",i}var n;return n="function"==typeof e?e:o.TemplateCache.get(e),n(t)}},o.View=t.View.extend({constructor:function(){i.bindAll(this,"render");var e=Array.prototype.slice.apply(arguments);t.View.prototype.constructor.apply(this,e),o.MonitorDOMRefresh(this),this.listenTo(this,"show",this.onShowCalled,this)},triggerMethod:o.triggerMethod,getTemplate:function(){return o.getOption(this,"template")},mixinTemplateHelpers:function(e){e=e||{};var t=o.getOption(this,"templateHelpers");return i.isFunction(t)&&(t=t.call(this)),i.extend(e,t)},configureTriggers:function(){if(this.triggers){var e={},t=i.result(this,"triggers");return i.each(t,function(t,i){e[i]=function(e){e&&e.preventDefault&&e.preventDefault(),e&&e.stopPropagation&&e.stopPropagation();var i={view:this,model:this.model,collection:this.collection};this.triggerMethod(t,i)}},this),e}},delegateEvents:function(e){this._delegateDOMEvents(e),o.bindEntityEvents(this,this.model,o.getOption(this,"modelEvents")),o.bindEntityEvents(this,this.collection,o.getOption(this,"collectionEvents"))},_delegateDOMEvents:function(e){e=e||this.events,i.isFunction(e)&&(e=e.call(this));var n={},r=this.configureTriggers();i.extend(n,e,r),t.View.prototype.delegateEvents.call(this,n)},undelegateEvents:function(){var e=Array.prototype.slice.call(arguments);t.View.prototype.undelegateEvents.apply(this,e),o.unbindEntityEvents(this,this.model,o.getOption(this,"modelEvents")),o.unbindEntityEvents(this,this.collection,o.getOption(this,"collectionEvents"))},onShowCalled:function(){},close:function(){if(!this.isClosed){var e=this.triggerMethod("before:close");e!==!1&&(this.isClosed=!0,this.triggerMethod("close"),this.unbindUIElements(),this.remove())}},bindUIElements:function(){if(this.ui){this._uiBindings||(this._uiBindings=this.ui);var e=i.result(this,"_uiBindings");this.ui={},i.each(i.keys(e),function(t){var i=e[t];this.ui[t]=this.$(i)},this)}},unbindUIElements:function(){this.ui&&this._uiBindings&&(i.each(this.ui,function(e,t){delete this.ui[t]},this),this.ui=this._uiBindings,delete this._uiBindings)}}),o.ItemView=o.View.extend({constructor:function(){o.View.prototype.constructor.apply(this,n(arguments))},serializeData:function(){var e={};return this.model?e=this.model.toJSON():this.collection&&(e={items:this.collection.toJSON()}),e},render:function(){this.isClosed=!1,this.triggerMethod("before:render",this),this.triggerMethod("item:before:render",this);var e=this.serializeData();e=this.mixinTemplateHelpers(e);var t=this.getTemplate(),i=o.Renderer.render(t,e);return this.$el.html(i),this.bindUIElements(),this.triggerMethod("render",this),this.triggerMethod("item:rendered",this),this},close:function(){this.isClosed||(this.triggerMethod("item:before:close"),o.View.prototype.close.apply(this,n(arguments)),this.triggerMethod("item:closed"))}}),o.CollectionView=o.View.extend({itemViewEventPrefix:"itemview",constructor:function(){this._initChildViewStorage(),o.View.prototype.constructor.apply(this,n(arguments)),this._initialEvents()},_initialEvents:function(){this.collection&&(this.listenTo(this.collection,"add",this.addChildView,this),this.listenTo(this.collection,"remove",this.removeItemView,this),this.listenTo(this.collection,"reset",this.render,this))},addChildView:function(e){this.closeEmptyView();var t=this.getItemView(e),i=this.collection.indexOf(e);this.addItemView(e,t,i)},onShowCalled:function(){this.children.each(function(e){o.triggerMethod.call(e,"show")})},triggerBeforeRender:function(){this.triggerMethod("before:render",this),this.triggerMethod("collection:before:render",this)},triggerRendered:function(){this.triggerMethod("render",this),this.triggerMethod("collection:rendered",this)},render:function(){return this.isClosed=!1,this.triggerBeforeRender(),this._renderChildren(),this.triggerRendered(),this},_renderChildren:function(){this.closeEmptyView(),this.closeChildren(),this.collection&&this.collection.length>0?this.showCollection():this.showEmptyView()},showCollection:function(){var e;this.collection.each(function(t,i){e=this.getItemView(t),this.addItemView(t,e,i)},this)},showEmptyView:function(){var e=o.getOption(this,"emptyView");if(e&&!this._showingEmptyView){this._showingEmptyView=!0;var i=new t.Model;this.addItemView(i,e,0)}},closeEmptyView:function(){this._showingEmptyView&&(this.closeChildren(),delete this._showingEmptyView)},getItemView:function(){var e=o.getOption(this,"itemView");return e||r("An `itemView` must be specified","NoItemViewError"),e},addItemView:function(e,t,n){var r=o.getOption(this,"itemViewOptions");i.isFunction(r)&&(r=r.call(this,e,n));var s=this.buildItemView(e,t,r);this.addChildViewEventForwarding(s),this.triggerMethod("before:item:added",s),this.children.add(s),this.renderItemView(s,n),this._isShown&&o.triggerMethod.call(s,"show"),this.triggerMethod("after:item:added",s)},addChildViewEventForwarding:function(e){var t=o.getOption(this,"itemViewEventPrefix");this.listenTo(e,"all",function(){var i=n(arguments);i[0]=t+":"+i[0],i.splice(1,0,e),o.triggerMethod.apply(this,i)},this)},renderItemView:function(e,t){e.render(),this.appendHtml(this,e,t)},buildItemView:function(e,t,n){var r=i.extend({model:e},n);return new t(r)},removeItemView:function(e){var t=this.children.findByModel(e);this.removeChildView(t),this.checkEmpty()},removeChildView:function(e){e&&(this.stopListening(e),e.close?e.close():e.remove&&e.remove(),this.children.remove(e)),this.triggerMethod("item:removed",e)},checkEmpty:function(){this.collection&&0!==this.collection.length||this.showEmptyView()},appendHtml:function(e,t){e.$el.append(t.el)},_initChildViewStorage:function(){this.children=new t.ChildViewContainer},close:function(){this.isClosed||(this.triggerMethod("collection:before:close"),this.closeChildren(),this.triggerMethod("collection:closed"),o.View.prototype.close.apply(this,n(arguments)))},closeChildren:function(){this.children.each(function(e){this.removeChildView(e)},this),this.checkEmpty()}}),o.CompositeView=o.CollectionView.extend({constructor:function(){o.CollectionView.prototype.constructor.apply(this,n(arguments))},_initialEvents:function(){this.collection&&(this.listenTo(this.collection,"add",this.addChildView,this),this.listenTo(this.collection,"remove",this.removeItemView,this),this.listenTo(this.collection,"reset",this._renderChildren,this))},getItemView:function(){var e=o.getOption(this,"itemView")||this.constructor;return e||r("An `itemView` must be specified","NoItemViewError"),e},serializeData:function(){var e={};return this.model&&(e=this.model.toJSON()),e},render:function(){this.isRendered=!0,this.isClosed=!1,this.resetItemViewContainer(),this.triggerBeforeRender();var e=this.renderModel();return this.$el.html(e),this.bindUIElements(),this.triggerMethod("composite:model:rendered"),this._renderChildren(),this.triggerMethod("composite:rendered"),this.triggerRendered(),this},_renderChildren:function(){this.isRendered&&(o.CollectionView.prototype._renderChildren.call(this),this.triggerMethod("composite:collection:rendered"))},renderModel:function(){var e={};e=this.serializeData(),e=this.mixinTemplateHelpers(e);var t=this.getTemplate();return o.Renderer.render(t,e)},appendHtml:function(e,t){var i=this.getItemViewContainer(e);i.append(t.el)},getItemViewContainer:function(e){if("$itemViewContainer"in e)return e.$itemViewContainer;var t,n=o.getOption(e,"itemViewContainer");if(n){var s=i.isFunction(n)?n():n;t=e.$(s),0>=t.length&&r("The specified `itemViewContainer` was not found: "+e.itemViewContainer,"ItemViewContainerMissingError")}else t=e.$el;return e.$itemViewContainer=t,t},resetItemViewContainer:function(){this.$itemViewContainer&&delete this.$itemViewContainer}}),o.Layout=o.ItemView.extend({regionType:o.Region,constructor:function(e){e=e||{},this._firstRender=!0,this._initializeRegions(e),o.ItemView.prototype.constructor.call(this,e)},render:function(){this.isClosed&&this._initializeRegions(),this._firstRender?this._firstRender=!1:this.isClosed||this._reInitializeRegions();var e=Array.prototype.slice.apply(arguments),t=o.ItemView.prototype.render.apply(this,e);return t},close:function(){if(!this.isClosed){this.regionManager.close();var e=Array.prototype.slice.apply(arguments);o.ItemView.prototype.close.apply(this,e)}},addRegion:function(e,t){var i={};return i[e]=t,this._buildRegions(i)[e]},addRegions:function(e){return this.regions=i.extend({},this.regions,e),this._buildRegions(e)},removeRegion:function(e){return delete this.regions[e],this.regionManager.removeRegion(e)},_buildRegions:function(e){var t=this,i={regionType:o.getOption(this,"regionType"),parentEl:function(){return t.$el}};return this.regionManager.addRegions(e,i)},_initializeRegions:function(e){var t;this._initRegionManager(),t=i.isFunction(this.regions)?this.regions(e):this.regions||{},this.addRegions(t)},_reInitializeRegions:function(){this.regionManager.closeRegions(),this.regionManager.each(function(e){e.reset()})},_initRegionManager:function(){this.regionManager=new o.RegionManager,this.listenTo(this.regionManager,"region:add",function(e,t){this[e]=t,this.trigger("region:add",e,t)}),this.listenTo(this.regionManager,"region:remove",function(e,t){delete this[e],this.trigger("region:remove",e,t)})}}),o.AppRouter=t.Router.extend({constructor:function(e){t.Router.prototype.constructor.apply(this,n(arguments)),this.options=e||{};var i=o.getOption(this,"appRoutes"),r=this._getController();this.processAppRoutes(r,i)},appRoute:function(e,t){var i=this._getController();this._addAppRoute(i,e,t)},processAppRoutes:function(e,t){if(t){var n=i.keys(t).reverse();i.each(n,function(i){this._addAppRoute(e,i,t[i])},this)}},_getController:function(){return o.getOption(this,"controller")},_addAppRoute:function(e,t,n){var r=e[n];if(!r)throw Error("Method '"+n+"' was not found on the controller");this.route(t,n,i.bind(r,e))}}),o.Application=function(e){this._initRegionManager(),this._initCallbacks=new o.Callbacks,this.vent=new t.Wreqr.EventAggregator,this.commands=new t.Wreqr.Commands,this.reqres=new t.Wreqr.RequestResponse,this.submodules={},i.extend(this,e),this.triggerMethod=o.triggerMethod},i.extend(o.Application.prototype,t.Events,{execute:function(){var e=Array.prototype.slice.apply(arguments);this.commands.execute.apply(this.commands,e)},request:function(){var e=Array.prototype.slice.apply(arguments);return this.reqres.request.apply(this.reqres,e)},addInitializer:function(e){this._initCallbacks.add(e)},start:function(e){this.triggerMethod("initialize:before",e),this._initCallbacks.run(e,this),this.triggerMethod("initialize:after",e),this.triggerMethod("start",e)},addRegions:function(e){return this._regionManager.addRegions(e)},closeRegions:function(){this._regionManager.closeRegions()},removeRegion:function(e){this._regionManager.removeRegion(e)},getRegion:function(e){return this._regionManager.get(e)},module:function(){var e=n(arguments);return e.unshift(this),o.Module.create.apply(o.Module,e)},_initRegionManager:function(){this._regionManager=new o.RegionManager,this.listenTo(this._regionManager,"region:add",function(e,t){this[e]=t}),this.listenTo(this._regionManager,"region:remove",function(e){delete this[e]})}}),o.Application.extend=o.extend,o.Module=function(e,t){this.moduleName=e,this.submodules={},this._setupInitializersAndFinalizers(),this.app=t,this.startWithParent=!0,this.triggerMethod=o.triggerMethod},i.extend(o.Module.prototype,t.Events,{addInitializer:function(e){this._initializerCallbacks.add(e)},addFinalizer:function(e){this._finalizerCallbacks.add(e)},start:function(e){this._isInitialized||(i.each(this.submodules,function(t){t.startWithParent&&t.start(e)}),this.triggerMethod("before:start",e),this._initializerCallbacks.run(e,this),this._isInitialized=!0,this.triggerMethod("start",e))},stop:function(){this._isInitialized&&(this._isInitialized=!1,o.triggerMethod.call(this,"before:stop"),i.each(this.submodules,function(e){e.stop()}),this._finalizerCallbacks.run(void 0,this),this._initializerCallbacks.reset(),this._finalizerCallbacks.reset(),o.triggerMethod.call(this,"stop"))},addDefinition:function(e,t){this._runModuleDefinition(e,t)},_runModuleDefinition:function(e,n){if(e){var r=i.flatten([this,this.app,t,o,o.$,i,n]);e.apply(this,r)}},_setupInitializersAndFinalizers:function(){this._initializerCallbacks=new o.Callbacks,this._finalizerCallbacks=new o.Callbacks}}),i.extend(o.Module,{create:function(e,t,r){var o=e,s=n(arguments);s.splice(0,3),t=t.split(".");var h=t.length,a=[];return a[h-1]=r,i.each(t,function(t,i){var n=o;o=this._getModule(n,t,e),this._addModuleDefinition(n,o,a[i],s)},this),o},_getModule:function(e,t,i){var n=e[t];return n||(n=new o.Module(t,i),e[t]=n,e.submodules[t]=n),n},_addModuleDefinition:function(e,t,n,r){var o,s;i.isFunction(n)?(o=n,s=!0):i.isObject(n)?(o=n.define,s=n.startWithParent):s=!0,o&&t.addDefinition(o,r),t.startWithParent=t.startWithParent&&s,t.startWithParent&&!t.startWithParentIsConfigured&&(t.startWithParentIsConfigured=!0,e.addInitializer(function(e){t.startWithParent&&t.start(e)}))}}),o}(this,Backbone,_);
// Libs ends Here