var webC = {};

webC.util = {

 // var browser=(navigator.appName.indexOf("Microsoft")!=-1)? "IE" : (navigator.appName.indexOf("Netscape")? "NS" : "Not IE nor NS"
 isIEALL: function () {
      return 0 <= navigator.userAgent.search(/MSIE/) || 0 <= navigator.userAgent.search(/Trident/)
 }, 
 isIE : function () { 
      return 0 <= (window.attachEvent && !window.addEventListener)
 },
 isIE8: function () {
      return 0 <= navigator.userAgent.search(/MSIE 8/)
 }
}

webC.compare_full = (function() {
 
var Match, calculate_operations, consecutive_where, create_index, diff, find_match, find_matching_blocks, html_to_tokens, is_end_of_tag, is_start_of_tag, is_tag, is_whitespace, isnt_tag, op_map, recursively_find_matching_blocks, render_operations, wrap;

is_end_of_tag = function(char) {
  return char === '>';
};

is_start_of_tag = function(char) {
  return char === '<';
};

is_whitespace = function(char) {
  return /^\s+$/.test(char);
};

is_tag = function(token) {
  return /^\s*<[^>]+>\s*$/.test(token);
};

isnt_tag = function(token) {
  return !is_tag(token);
};

Match = (function() {

  function Match(start_in_before, start_in_after, length) {
    this.start_in_before = start_in_before;
    this.start_in_after = start_in_after;
    this.length = length;
    this.end_in_before = (this.start_in_before + this.length) - 1;
    this.end_in_after = (this.start_in_after + this.length) - 1;
  }

  return Match;

})();

html_to_tokens = function(html) {
  var char, current_word, mode, words, _i, _len;
  mode = 'char';
  current_word = '';
  words = [];
  for (_i = 0, _len = html.length; _i < _len; _i++) {
    char = html[_i];
    switch (mode) {
      case 'tag':
        if (is_end_of_tag(char)) {
          current_word += '>';
          words.push(current_word);
          current_word = '';
          if (is_whitespace(char)) {
            mode = 'whitespace';
          } else {
            mode = 'char';
          }
        } else {
          current_word += char;
        }
        break;
      case 'char':
        if (is_start_of_tag(char)) {
          if (current_word) {
            words.push(current_word);
          }
          current_word = '<';
          mode = 'tag';
        } else if (/\s/.test(char)) {
          if (current_word) {
            words.push(current_word);
          }
          current_word = char;
          mode = 'whitespace';
        } else if(/[_a-zA-Z0-9_\u0410-\u042F\u0430-\u044F\u0401\u0451\#@]+/i.test(char)) {
          current_word += char;
        } else {
          if (current_word) {
            words.push(current_word);
          }
          current_word = char;
        }
        break;
      case 'whitespace':
        if (is_start_of_tag(char)) {
          if (current_word) {
            words.push(current_word);
          }
          current_word = '<';
          mode = 'tag';
        } else if (is_whitespace(char)) {
          current_word += char;
        } else {
          if (current_word) {
            words.push(current_word);
          }
          current_word = char;
          mode = 'char';
        }
        break;
      default:
        throw new Error("Unknown mode " + mode);
    }
  }
  if (current_word) {
    words.push(current_word);
  }
  return words;
};

find_match = function(before_tokens, after_tokens, index_of_before_locations_in_after_tokens, start_in_before, end_in_before, start_in_after, end_in_after) {
  var best_match_in_after, best_match_in_before, best_match_length, index_in_after, index_in_before, locations_in_after, looking_for, match, match_length_at, new_match_length, new_match_length_at, _i, _j, _len;
  best_match_in_before = start_in_before;
  best_match_in_after = start_in_after;
  best_match_length = 0;
  match_length_at = {};
  for (index_in_before = _i = start_in_before; start_in_before <= end_in_before ? _i < end_in_before : _i > end_in_before; index_in_before = start_in_before <= end_in_before ? ++_i : --_i) {
    new_match_length_at = {};
    looking_for = before_tokens[index_in_before];
    locations_in_after = index_of_before_locations_in_after_tokens[looking_for];
    for (_j = 0, _len = locations_in_after.length; _j < _len; _j++) {
      index_in_after = locations_in_after[_j];
      if (index_in_after < start_in_after) {
        continue;
      }
      if (index_in_after >= end_in_after) {
        break;
      }
      if (match_length_at[index_in_after - 1] == null) {
        match_length_at[index_in_after - 1] = 0;
      }
      new_match_length = match_length_at[index_in_after - 1] + 1;
      new_match_length_at[index_in_after] = new_match_length;
      if (new_match_length > best_match_length) {
        best_match_in_before = index_in_before - new_match_length + 1;
        best_match_in_after = index_in_after - new_match_length + 1;
        best_match_length = new_match_length;
      }
    }
    match_length_at = new_match_length_at;
  }
  if (best_match_length !== 0) {
    match = new Match(best_match_in_before, best_match_in_after, best_match_length);
  }
  return match;
};

recursively_find_matching_blocks = function(before_tokens, after_tokens, index_of_before_locations_in_after_tokens, start_in_before, end_in_before, start_in_after, end_in_after, matching_blocks) {
  var match;
  match = find_match(before_tokens, after_tokens, index_of_before_locations_in_after_tokens, start_in_before, end_in_before, start_in_after, end_in_after);
  if (match != null) {
    if (start_in_before < match.start_in_before && start_in_after < match.start_in_after) {
      recursively_find_matching_blocks(before_tokens, after_tokens, index_of_before_locations_in_after_tokens, start_in_before, match.start_in_before, start_in_after, match.start_in_after, matching_blocks);
    }
    matching_blocks.push(match);
    if (match.end_in_before <= end_in_before && match.end_in_after <= end_in_after) {
      recursively_find_matching_blocks(before_tokens, after_tokens, index_of_before_locations_in_after_tokens, match.end_in_before + 1, end_in_before, match.end_in_after + 1, end_in_after, matching_blocks);
    }
  }
  return matching_blocks;
};

create_index = function(p) {
  var idx, index, token, _i, _len, _ref, _inthose;
  if (p.find_these == null) {
    throw new Error('params must have find_these key');
  }
  if (p.in_these == null) {
    throw new Error('params must have in_these key');
  }
  index = {};
  _ref = p.find_these;
  _inthose = p.in_these;
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    token = _ref[_i];
    index[token] = [];
    idx = _inthose.indexOf(token);
    while (idx !== -1) {
      index[token].push(idx);
      var s1 = p.in_these;
      idx = _inthose.indexOf(token, idx + 1);
    }
  }
  return index;
};

find_matching_blocks = function(before_tokens, after_tokens) {
  var index_of_before_locations_in_after_tokens, matching_blocks;
  matching_blocks = [];
  index_of_before_locations_in_after_tokens = create_index({
    find_these: before_tokens,
    in_these: after_tokens
  });
  return recursively_find_matching_blocks(before_tokens, after_tokens, index_of_before_locations_in_after_tokens, 0, before_tokens.length, 0, after_tokens.length, matching_blocks);
};

calculate_operations = function(before_tokens, after_tokens) {
  var action_map, action_up_to_match_positions, index, is_single_whitespace, last_op, match, match_starts_at_current_position_in_after, match_starts_at_current_position_in_before, matches, op, operations, position_in_after, position_in_before, post_processed, _i, _j, _len, _len1;
  if (before_tokens == null) {
    throw new Error('before_tokens?');
  }
  if (after_tokens == null) {
    throw new Error('after_tokens?');
  }
  position_in_before = position_in_after = 0;
  operations = [];
  action_map = {
    'false,false': 'replace',
    'true,false': 'insert',
    'false,true': 'delete',
    'true,true': 'none'
  };
  matches = find_matching_blocks(before_tokens, after_tokens);
  matches.push(new Match(before_tokens.length, after_tokens.length, 0));
  for (index = _i = 0, _len = matches.length; _i < _len; index = ++_i) {
    match = matches[index];
    match_starts_at_current_position_in_before = position_in_before === match.start_in_before;
    match_starts_at_current_position_in_after = position_in_after === match.start_in_after;
    action_up_to_match_positions = action_map[[match_starts_at_current_position_in_before, match_starts_at_current_position_in_after].toString()];
    if (action_up_to_match_positions !== 'none') {
      operations.push({
        action: action_up_to_match_positions,
        start_in_before: position_in_before,
        end_in_before: (action_up_to_match_positions !== 'insert' ? match.start_in_before - 1 : void 0),
        start_in_after: position_in_after,
        end_in_after: (action_up_to_match_positions !== 'delete' ? match.start_in_after - 1 : void 0)
      });
    }
    if (match.length !== 0) {
      operations.push({
        action: 'equal',
        start_in_before: match.start_in_before,
        end_in_before: match.end_in_before,
        start_in_after: match.start_in_after,
        end_in_after: match.end_in_after
      });
    }
    position_in_before = match.end_in_before + 1;
    position_in_after = match.end_in_after + 1;
  }
  post_processed = [];
  last_op = {
    action: 'none'
  };
  is_single_whitespace = function(op) {
    if (op.action !== 'equal') {
      return false;
    }
    if (op.end_in_before - op.start_in_before !== 0) {
      return false;
    }
    return /^\s$/.test(before_tokens.slice(op.start_in_before, op.end_in_before + 1 || 9e9));
  };
  for (_j = 0, _len1 = operations.length; _j < _len1; _j++) {
    op = operations[_j];
    if (((is_single_whitespace(op)) && last_op.action === 'replace') || (op.action === 'replace' && last_op.action === 'replace')) {
      last_op.end_in_before = op.end_in_before;
      last_op.end_in_after = op.end_in_after;
    } else {
      post_processed.push(op);
      last_op = op;
    }
  }
  return post_processed;
};

consecutive_where = function(start, content, predicate) {
  var answer, index, last_matching_index, token, _i, _len;
  content = content.slice(start, content.length + 1 || 9e9);
  last_matching_index = void 0;
  for (index = _i = 0, _len = content.length; _i < _len; index = ++_i) {
    token = content[index];
    answer = predicate(token);
    if (answer === true) {
      last_matching_index = index;
    }
    if (answer === false) {
      break;
    }
  }
  if (last_matching_index != null) {
    return content.slice(0, last_matching_index + 1 || 9e9);
  }
  return [];
};


wrap = function(tag, content) {
  var length, non_tags, position, rendering, tags;
  rendering = '';
  position = 0;
  length = content.length;
  while (true) {
    if (position >= length) {
      break;
    }
    non_tags = consecutive_where(position, content, isnt_tag);
    position += non_tags.length;
    if (non_tags.length !== 0) {
      rendering += " <" + tag + ">" + (non_tags.join('')) + "</" + tag + "> ";
    }
    if (position >= length) {
      break;
    }
    tags = consecutive_where(position, content, is_tag);
    position += tags.length;
    rendering += tags.join('');
  }
  return rendering;
};

op_map = {
  equal: function(op, before_tokens, after_tokens) {
    return before_tokens.slice(op.start_in_before, op.end_in_before + 1 || 9e9).join('');
  },
  insert: function(op, before_tokens, after_tokens) {
    var val;
    val = after_tokens.slice(op.start_in_after, op.end_in_after + 1 || 9e9);
    if (val.length == 0) return '';
    if(val[0].replace(/^\s+|\s+$/g, '') == '') { 
        val.shift();
    }
    if(val[val.length - 1] == ' ') { 
        val.pop();
    }
    if(val[0] !== ' ') { 
      return wrap('ins', val);
    } else {
      return '';
    }
    
  },
  "delete": function(op, before_tokens, after_tokens) {
    var val;
    val = before_tokens.slice(op.start_in_before, op.end_in_before + 1 || 9e9);
    if (val.length == 0) return '';
    if(val[0].replace(/^\s+|\s+$/g, '') == '') { 
        val.shift();
    }
    if(val[val.length - 1] == ' ') { 
        val.pop();
    }
    if(val[0] !== ' ') { 
      return wrap('del', val);
    } else {
      return '';
    }
  }
};

op_map.replace = function(op, before_tokens, after_tokens) {
  return (op_map["delete"](op, before_tokens, after_tokens)) + (op_map.insert(op, before_tokens, after_tokens));
};

render_operations = function(before_tokens, after_tokens, operations) {
  var op, rendering, _i, _len;
  rendering = '';
  for (_i = 0, _len = operations.length; _i < _len; _i++) {
    op = operations[_i];
    var out = op_map[op.action](op, before_tokens, after_tokens);
    if (op.action != 'equal') {
    	rendering += '<span class="wc-edited-content">'+out+'</span>';
    } else {
    	rendering += out;
    }
    
  }
  return rendering;
};


return {

  diff : function(before, after) {
  var ops;
  if (before === after) {
    return before;
  }
  before = html_to_tokens(before);
  after = html_to_tokens(after);
  ops = calculate_operations(before, after);
  return render_operations(before, after, ops);
  }
};

diff.html_to_tokens = html_to_tokens;

diff.find_matching_blocks = find_matching_blocks;

find_matching_blocks.find_match = find_match;

find_matching_blocks.create_index = create_index;

diff.calculate_operations = calculate_operations;

diff.render_operations = render_operations;

})();

webC.compare=function(){var e,t,n,r,i,s,o,u,a,f,l,c,h,p,d,v,m;a=function(e){return e===">"};f=function(e){return e==="<"};c=function(e){return/^\s+$/.test(e)};l=function(e){return/^\s*<[^>]+>\s*$/.test(e)};h=function(e){return!l(e)};e=function(){function e(e,t,n){this.start_in_before=e;this.start_in_after=t;this.length=n;this.end_in_before=this.start_in_before+this.length-1;this.end_in_after=this.start_in_after+this.length-1}return e}();u=function(e){var t,n,r,i,s,o;r="char";n="";i=[];for(s=0,o=e.length;s<o;s++){t=e[s];switch(r){case"tag":if(a(t)){n+=">";i.push(n);n="";if(c(t)){r="whitespace"}else{r="char"}}else{n+=t}break;case"char":if(f(t)){if(n){i.push(n)}n="<";r="tag"}else if(/\s/.test(t)){if(n){i.push(n)}n=t;r="whitespace"}else if(/[_a-zA-Z0-9_\u0410-\u042F\u0430-\u044F\u0401\u0451\#@]+/i.test(t)){n+=t}else{if(n){i.push(n)}n=t}break;case"whitespace":if(f(t)){if(n){i.push(n)}n="<";r="tag"}else if(c(t)){n+=t}else{if(n){i.push(n)}n=t;r="char"}break;default:throw new Error("Unknown mode "+r)}}if(n){i.push(n)}return i};s=function(t,n,r,i,s,o,u){var a,f,l,c,h,p,d,v,m,g,y,b,w,E;f=i;a=o;l=0;m={};for(h=b=i;i<=s?b<s:b>s;h=i<=s?++b:--b){y={};d=t[h];p=r[d];for(w=0,E=p.length;w<E;w++){c=p[w];if(c<o){continue}if(c>=u){break}if(m[c-1]==null){m[c-1]=0}g=m[c-1]+1;y[c]=g;if(g>l){f=h-g+1;a=c-g+1;l=g}}m=y}if(l!==0){v=new e(f,a,l)}return v};d=function(e,t,n,r,i,o,u,a){var f;f=s(e,t,n,r,i,o,u);if(f!=null){if(r<f.start_in_before&&o<f.start_in_after){d(e,t,n,r,f.start_in_before,o,f.start_in_after,a)}a.push(f);if(f.end_in_before<=i&&f.end_in_after<=u){d(e,t,n,f.end_in_before+1,i,f.end_in_after+1,u,a)}}return a};r=function(e){var t,n,r,i,s,o;if(e.find_these==null){throw new Error("params must have find_these key")}if(e.in_these==null){throw new Error("params must have in_these key")}n={};o=e.find_these;for(i=0,s=o.length;i<s;i++){r=o[i];n[r]=[];t=e.in_these.indexOf(r);while(t!==-1){n[r].push(t);t=e.in_these.indexOf(r,t+1)}}return n};o=function(e,t){var n,i;i=[];n=r({find_these:e,in_these:t});return d(e,t,n,0,e.length,0,t.length,i)};t=function(t,n){var r,i,s,u,a,f,l,c,h,p,d,v,m,g,y,b,w,E;if(t==null){throw new Error("before_tokens?")}if(n==null){throw new Error("after_tokens?")}m=v=0;d=[];r={"false,false":"replace","true,false":"insert","false,true":"delete","true,true":"none"};h=o(t,n);h.push(new e(t.length,n.length,0));for(s=y=0,w=h.length;y<w;s=++y){f=h[s];c=m===f.start_in_before;l=v===f.start_in_after;i=r[[c,l].toString()];if(i!=="none"){d.push({action:i,start_in_before:m,end_in_before:i!=="insert"?f.start_in_before-1:void 0,start_in_after:v,end_in_after:i!=="delete"?f.start_in_after-1:void 0})}if(f.length!==0){d.push({action:"equal",start_in_before:f.start_in_before,end_in_before:f.end_in_before,start_in_after:f.start_in_after,end_in_after:f.end_in_after})}m=f.end_in_before+1;v=f.end_in_after+1}g=[];a={action:"none"};u=function(e){if(e.action!=="equal"){return false}if(e.end_in_before-e.start_in_before!==0){return false}return/^\s$/.test(t.slice(e.start_in_before,e.end_in_before+1||9e9))};for(b=0,E=d.length;b<E;b++){p=d[b];if(u(p)&&a.action==="replace"||p.action==="replace"&&a.action==="replace"){a.end_in_before=p.end_in_before;a.end_in_after=p.end_in_after}else{g.push(p);a=p}}return g};n=function(e,t,n){var r,i,s,o,u,a;t=t.slice(e,t.length+1||9e9);s=void 0;for(i=u=0,a=t.length;u<a;i=++u){o=t[i];r=n(o);if(r===true){s=i}if(r===false){break}}if(s!=null){return t.slice(0,s+1||9e9)}return[]};m=function(e,t){var r,i,s,o,u;o="";s=0;r=t.length;while(true){if(s>=r){break}i=n(s,t,h);s+=i.length;if(i.length!==0){o+=" <"+e+">"+i.join("")+"</"+e+"> "}if(s>=r){break}u=n(s,t,l);s+=u.length;o+=u.join("")}return o};p={equal:function(e,t,n){return t.slice(e.start_in_before,e.end_in_before+1||9e9).join("")},insert:function(e,t,n){var r;r=n.slice(e.start_in_after,e.end_in_after+1||9e9);if(r.length==0)return"";if(r[0].replace(/^\s+|\s+$/g,"")==""){r.shift()}if(r[r.length-1]==" "){r.pop()}if(r[0]!==" "){return m("ins",r)}else{return""}},"delete":function(e,t,n){var r;r=t.slice(e.start_in_before,e.end_in_before+1||9e9);if(r.length==0)return"";if(r[0].replace(/^\s+|\s+$/g,"")==""){r.shift()}if(r[r.length-1]==" "){r.pop()}if(r[0]!==" "){return m("del",r)}else{return""}}};p.replace=function(e,t,n){return p["delete"](e,t,n)+p.insert(e,t,n)};v=function(e,t,n){var r,i,s,o;i="";for(s=0,o=n.length;s<o;s++){r=n[s];i+=p[r.action](r,e,t)}return i};return{alert:function(e){alert("hrere")},diff:function(e,n){var r;if(e===n){return e}e=u(e);n=u(n);r=t(e,n);return v(e,n,r)}};i.html_to_tokens=u;i.find_matching_blocks=o;o.find_match=s;o.create_index=r;i.calculate_operations=t;i.render_operations=v}();

/* jQuery Storage API Plugin 1.5.0 https://github.com/julien-maurel/jQuery-Storage-API */
!function(e){function t(t){var r,n,i,o=arguments.length,s=window[t],a=arguments,u=a[1];if(2>o)throw Error("Minimum 2 arguments must be given");if(e.isArray(u)){n={};for(var g in u){r=u[g];try{n[r]=JSON.parse(s.getItem(r))}catch(m){n[r]=s.getItem(r)}}return n}if(2!=o){try{n=JSON.parse(s.getItem(u))}catch(m){throw new ReferenceError(u+" is not defined in this storage")}for(var g=2;o-1>g;g++)if(n=n[a[g]],void 0===n)throw new ReferenceError([].slice.call(a,1,g+1).join(".")+" is not defined in this storage");if(e.isArray(a[g])){i=n,n={};for(var f in a[g])n[a[g][f]]=i[a[g][f]];return n}return n[a[g]]}try{return JSON.parse(s.getItem(u))}catch(m){return s.getItem(u)}}function n(t){var r,n,i=arguments.length,o=window[t],s=arguments,a=s[1],u=s[2],g={};if(2>i||!e.isPlainObject(a)&&3>i)throw Error("Minimum 3 arguments must be given or second parameter must be an object");if(e.isPlainObject(a)){for(var m in a)r=a[m],e.isPlainObject(r)?o.setItem(m,JSON.stringify(r)):o.setItem(m,r);return a}if(3==i)return"object"==typeof u?o.setItem(a,JSON.stringify(u)):o.setItem(a,u),u;try{n=o.getItem(a),null!=n&&(g=JSON.parse(n))}catch(f){}n=g;for(var m=2;i-2>m;m++)r=s[m],n[r]&&e.isPlainObject(n[r])||(n[r]={}),n=n[r];return n[s[m]]=s[m+1],o.setItem(a,JSON.stringify(g)),g}function i(t){var r,n,i=arguments.length,o=window[t],s=arguments,a=s[1];if(2>i)throw Error("Minimum 2 arguments must be given");if(e.isArray(a)){for(var u in a)o.removeItem(a[u]);return!0}if(2==i)return o.removeItem(a),!0;try{r=n=JSON.parse(o.getItem(a))}catch(g){throw new ReferenceError(a+" is not defined in this storage")}for(var u=2;i-1>u;u++)if(n=n[s[u]],void 0===n)throw new ReferenceError([].slice.call(s,1,u).join(".")+" is not defined in this storage");if(e.isArray(s[u]))for(var m in s[u])delete n[s[u][m]];else delete n[s[u]];return o.setItem(a,JSON.stringify(r)),!0}function o(t,r){var n=u(t);for(var o in n)i(t,n[o]);if(r)for(var o in e.namespaceStorages)g(o)}function s(r){var n=arguments.length,i=arguments,o=(window[r],i[1]);if(1==n)return 0==u(r).length;if(e.isArray(o)){for(var a=0;a<o.length;a++)if(!s(r,o[a]))return!1;return!0}try{var g=t.apply(this,arguments);e.isArray(i[n-1])||(g={totest:g});for(var a in g)if(!(e.isPlainObject(g[a])&&e.isEmptyObject(g[a])||e.isArray(g[a])&&!g[a].length)&&g[a])return!1;return!0}catch(m){return!0}}function a(r){var n=arguments.length,i=arguments,o=(window[r],i[1]);if(2>n)throw Error("Minimum 2 arguments must be given");if(e.isArray(o)){for(var s=0;s<o.length;s++)if(!a(r,o[s]))return!1;return!0}try{var u=t.apply(this,arguments);e.isArray(i[n-1])||(u={totest:u});for(var s in u)if(void 0===u[s]||null===u[s])return!1;return!0}catch(g){return!1}}function u(r){var n=arguments.length,i=window[r],o=arguments,s=(o[1],[]),a={};if(a=n>1?t.apply(this,o):i,a._cookie)for(var u in e.cookie())""!=u&&s.push(u.replace(a._prefix,""));else for(var g in a)s.push(g);return s}function g(t){if(!t||"string"!=typeof t)throw Error("First parameter must be a string");window.localStorage.getItem(t)||window.localStorage.setItem(t,"{}"),window.sessionStorage.getItem(t)||window.sessionStorage.setItem(t,"{}");var r={localStorage:e.extend({},e.localStorage,{_ns:t}),sessionStorage:e.extend({},e.sessionStorage,{_ns:t})};return e.cookie&&(window.cookieStorage.getItem(t)||window.cookieStorage.setItem(t,"{}"),r.cookieStorage=e.extend({},e.cookieStorage,{_ns:t})),e.namespaceStorages[t]=r,r}var m="ls_",f="ss_",c={_type:"",_ns:"",_callMethod:function(e,t){var r=[this._type];return this._ns&&r.push(this._ns),[].push.apply(r,t),e.apply(this,r)},get:function(){return this._callMethod(t,arguments)},set:function(){var t=arguments.length,i=arguments,o=i[0];if(1>t||!e.isPlainObject(o)&&2>t)throw Error("Minimum 2 arguments must be given or first parameter must be an object");if(e.isPlainObject(o)&&this._ns){for(var s in o)n(this._type,this._ns,s,o[s]);return o}return r=this._callMethod(n,i),this._ns?r[o]:r},remove:function(){if(arguments.length<1)throw Error("Minimum 1 argument must be given");return this._callMethod(i,arguments)},removeAll:function(e){return this._ns?(n(this._type,this._ns,{}),!0):o(this._type,e)},isEmpty:function(){return this._callMethod(s,arguments)},isSet:function(){if(arguments.length<1)throw Error("Minimum 1 argument must be given");return this._callMethod(a,arguments)},keys:function(){return this._callMethod(u,arguments)}};if(e.cookie){window.name||(window.name=Math.floor(1e8*Math.random()));var l={_cookie:!0,_prefix:"",_expires:null,setItem:function(t,r){e.cookie(this._prefix+t,r,{expires:this._expires})},getItem:function(t){return e.cookie(this._prefix+t)},removeItem:function(t){return e.removeCookie(this._prefix+t)},clear:function(){for(var t in e.cookie())""!=t&&(!this._prefix&&-1===t.indexOf(m)&&-1===t.indexOf(f)||this._prefix&&0===t.indexOf(this._prefix))&&e.removeCookie(t)},setExpires:function(e){return this._expires=e,this}};window.localStorage||(window.localStorage=e.extend({},l,{_prefix:m,_expires:3650}),window.sessionStorage=e.extend({},l,{_prefix:f+window.name+"_"})),window.cookieStorage=e.extend({},l),e.cookieStorage=e.extend({},c,{_type:"cookieStorage",setExpires:function(e){return window.cookieStorage.setExpires(e),this}})}e.initNamespaceStorage=function(e){return g(e)},e.localStorage=e.extend({},c,{_type:"localStorage"}),e.sessionStorage=e.extend({},c,{_type:"sessionStorage"}),e.namespaceStorages={},e.removeAllStorages=function(t){e.localStorage.removeAll(t),e.sessionStorage.removeAll(t),e.cookieStorage&&e.cookieStorage.removeAll(t),t||(e.namespaceStorages={})}}($);

//     Underscore.js 1.5.1
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.
!function(){var n=this,t=n._,r={},e=Array.prototype,u=Object.prototype,i=Function.prototype,a=e.push,o=e.slice,c=e.concat,l=u.toString,f=u.hasOwnProperty,s=e.forEach,p=e.map,v=e.reduce,h=e.reduceRight,d=e.filter,g=e.every,m=e.some,y=e.indexOf,b=e.lastIndexOf,x=Array.isArray,_=Object.keys,w=i.bind,j=function(n){return n instanceof j?n:this instanceof j?(this._wrapped=n,void 0):new j(n)};"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=j),exports._=j):n._=j,j.VERSION="1.5.1";var A=j.each=j.forEach=function(n,t,e){if(null!=n)if(s&&n.forEach===s)n.forEach(t,e);else if(n.length===+n.length){for(var u=0,i=n.length;i>u;u++)if(t.call(e,n[u],u,n)===r)return}else for(var a in n)if(j.has(n,a)&&t.call(e,n[a],a,n)===r)return};j.map=j.collect=function(n,t,r){var e=[];return null==n?e:p&&n.map===p?n.map(t,r):(A(n,function(n,u,i){e.push(t.call(r,n,u,i))}),e)};var E="Reduce of empty array with no initial value";j.reduce=j.foldl=j.inject=function(n,t,r,e){var u=arguments.length>2;if(null==n&&(n=[]),v&&n.reduce===v)return e&&(t=j.bind(t,e)),u?n.reduce(t,r):n.reduce(t);if(A(n,function(n,i,a){u?r=t.call(e,r,n,i,a):(r=n,u=!0)}),!u)throw new TypeError(E);return r},j.reduceRight=j.foldr=function(n,t,r,e){var u=arguments.length>2;if(null==n&&(n=[]),h&&n.reduceRight===h)return e&&(t=j.bind(t,e)),u?n.reduceRight(t,r):n.reduceRight(t);var i=n.length;if(i!==+i){var a=j.keys(n);i=a.length}if(A(n,function(o,c,l){c=a?a[--i]:--i,u?r=t.call(e,r,n[c],c,l):(r=n[c],u=!0)}),!u)throw new TypeError(E);return r},j.find=j.detect=function(n,t,r){var e;return O(n,function(n,u,i){return t.call(r,n,u,i)?(e=n,!0):void 0}),e},j.filter=j.select=function(n,t,r){var e=[];return null==n?e:d&&n.filter===d?n.filter(t,r):(A(n,function(n,u,i){t.call(r,n,u,i)&&e.push(n)}),e)},j.reject=function(n,t,r){return j.filter(n,function(n,e,u){return!t.call(r,n,e,u)},r)},j.every=j.all=function(n,t,e){t||(t=j.identity);var u=!0;return null==n?u:g&&n.every===g?n.every(t,e):(A(n,function(n,i,a){return(u=u&&t.call(e,n,i,a))?void 0:r}),!!u)};var O=j.some=j.any=function(n,t,e){t||(t=j.identity);var u=!1;return null==n?u:m&&n.some===m?n.some(t,e):(A(n,function(n,i,a){return u||(u=t.call(e,n,i,a))?r:void 0}),!!u)};j.contains=j.include=function(n,t){return null==n?!1:y&&n.indexOf===y?n.indexOf(t)!=-1:O(n,function(n){return n===t})},j.invoke=function(n,t){var r=o.call(arguments,2),e=j.isFunction(t);return j.map(n,function(n){return(e?t:n[t]).apply(n,r)})},j.pluck=function(n,t){return j.map(n,function(n){return n[t]})},j.where=function(n,t,r){return j.isEmpty(t)?r?void 0:[]:j[r?"find":"filter"](n,function(n){for(var r in t)if(t[r]!==n[r])return!1;return!0})},j.findWhere=function(n,t){return j.where(n,t,!0)},j.max=function(n,t,r){if(!t&&j.isArray(n)&&n[0]===+n[0]&&n.length<65535)return Math.max.apply(Math,n);if(!t&&j.isEmpty(n))return-1/0;var e={computed:-1/0,value:-1/0};return A(n,function(n,u,i){var a=t?t.call(r,n,u,i):n;a>e.computed&&(e={value:n,computed:a})}),e.value},j.min=function(n,t,r){if(!t&&j.isArray(n)&&n[0]===+n[0]&&n.length<65535)return Math.min.apply(Math,n);if(!t&&j.isEmpty(n))return 1/0;var e={computed:1/0,value:1/0};return A(n,function(n,u,i){var a=t?t.call(r,n,u,i):n;a<e.computed&&(e={value:n,computed:a})}),e.value},j.shuffle=function(n){var t,r=0,e=[];return A(n,function(n){t=j.random(r++),e[r-1]=e[t],e[t]=n}),e};var F=function(n){return j.isFunction(n)?n:function(t){return t[n]}};j.sortBy=function(n,t,r){var e=F(t);return j.pluck(j.map(n,function(n,t,u){return{value:n,index:t,criteria:e.call(r,n,t,u)}}).sort(function(n,t){var r=n.criteria,e=t.criteria;if(r!==e){if(r>e||r===void 0)return 1;if(e>r||e===void 0)return-1}return n.index<t.index?-1:1}),"value")};var k=function(n,t,r,e){var u={},i=F(null==t?j.identity:t);return A(n,function(t,a){var o=i.call(r,t,a,n);e(u,o,t)}),u};j.groupBy=function(n,t,r){return k(n,t,r,function(n,t,r){(j.has(n,t)?n[t]:n[t]=[]).push(r)})},j.countBy=function(n,t,r){return k(n,t,r,function(n,t){j.has(n,t)||(n[t]=0),n[t]++})},j.sortedIndex=function(n,t,r,e){r=null==r?j.identity:F(r);for(var u=r.call(e,t),i=0,a=n.length;a>i;){var o=i+a>>>1;r.call(e,n[o])<u?i=o+1:a=o}return i},j.toArray=function(n){return n?j.isArray(n)?o.call(n):n.length===+n.length?j.map(n,j.identity):j.values(n):[]},j.size=function(n){return null==n?0:n.length===+n.length?n.length:j.keys(n).length},j.first=j.head=j.take=function(n,t,r){return null==n?void 0:null==t||r?n[0]:o.call(n,0,t)},j.initial=function(n,t,r){return o.call(n,0,n.length-(null==t||r?1:t))},j.last=function(n,t,r){return null==n?void 0:null==t||r?n[n.length-1]:o.call(n,Math.max(n.length-t,0))},j.rest=j.tail=j.drop=function(n,t,r){return o.call(n,null==t||r?1:t)},j.compact=function(n){return j.filter(n,j.identity)};var R=function(n,t,r){return t&&j.every(n,j.isArray)?c.apply(r,n):(A(n,function(n){j.isArray(n)||j.isArguments(n)?t?a.apply(r,n):R(n,t,r):r.push(n)}),r)};j.flatten=function(n,t){return R(n,t,[])},j.without=function(n){return j.difference(n,o.call(arguments,1))},j.uniq=j.unique=function(n,t,r,e){j.isFunction(t)&&(e=r,r=t,t=!1);var u=r?j.map(n,r,e):n,i=[],a=[];return A(u,function(r,e){(t?e&&a[a.length-1]===r:j.contains(a,r))||(a.push(r),i.push(n[e]))}),i},j.union=function(){return j.uniq(j.flatten(arguments,!0))},j.intersection=function(n){var t=o.call(arguments,1);return j.filter(j.uniq(n),function(n){return j.every(t,function(t){return j.indexOf(t,n)>=0})})},j.difference=function(n){var t=c.apply(e,o.call(arguments,1));return j.filter(n,function(n){return!j.contains(t,n)})},j.zip=function(){for(var n=j.max(j.pluck(arguments,"length").concat(0)),t=new Array(n),r=0;n>r;r++)t[r]=j.pluck(arguments,""+r);return t},j.object=function(n,t){if(null==n)return{};for(var r={},e=0,u=n.length;u>e;e++)t?r[n[e]]=t[e]:r[n[e][0]]=n[e][1];return r},j.indexOf=function(n,t,r){if(null==n)return-1;var e=0,u=n.length;if(r){if("number"!=typeof r)return e=j.sortedIndex(n,t),n[e]===t?e:-1;e=0>r?Math.max(0,u+r):r}if(y&&n.indexOf===y)return n.indexOf(t,r);for(;u>e;e++)if(n[e]===t)return e;return-1},j.lastIndexOf=function(n,t,r){if(null==n)return-1;var e=null!=r;if(b&&n.lastIndexOf===b)return e?n.lastIndexOf(t,r):n.lastIndexOf(t);for(var u=e?r:n.length;u--;)if(n[u]===t)return u;return-1},j.range=function(n,t,r){arguments.length<=1&&(t=n||0,n=0),r=arguments[2]||1;for(var e=Math.max(Math.ceil((t-n)/r),0),u=0,i=new Array(e);e>u;)i[u++]=n,n+=r;return i};var M=function(){};j.bind=function(n,t){var r,e;if(w&&n.bind===w)return w.apply(n,o.call(arguments,1));if(!j.isFunction(n))throw new TypeError;return r=o.call(arguments,2),e=function(){if(!(this instanceof e))return n.apply(t,r.concat(o.call(arguments)));M.prototype=n.prototype;var u=new M;M.prototype=null;var i=n.apply(u,r.concat(o.call(arguments)));return Object(i)===i?i:u}},j.partial=function(n){var t=o.call(arguments,1);return function(){return n.apply(this,t.concat(o.call(arguments)))}},j.bindAll=function(n){var t=o.call(arguments,1);if(0===t.length)throw new Error("bindAll must be passed function names");return A(t,function(t){n[t]=j.bind(n[t],n)}),n},j.memoize=function(n,t){var r={};return t||(t=j.identity),function(){var e=t.apply(this,arguments);return j.has(r,e)?r[e]:r[e]=n.apply(this,arguments)}},j.delay=function(n,t){var r=o.call(arguments,2);return setTimeout(function(){return n.apply(null,r)},t)},j.defer=function(n){return j.delay.apply(j,[n,1].concat(o.call(arguments,1)))},j.throttle=function(n,t,r){var e,u,i,a=null,o=0;r||(r={});var c=function(){o=r.leading===!1?0:new Date,a=null,i=n.apply(e,u)};return function(){var l=new Date;o||r.leading!==!1||(o=l);var f=t-(l-o);return e=this,u=arguments,0>=f?(clearTimeout(a),a=null,o=l,i=n.apply(e,u)):a||r.trailing===!1||(a=setTimeout(c,f)),i}},j.debounce=function(n,t,r){var e,u=null;return function(){var i=this,a=arguments,o=function(){u=null,r||(e=n.apply(i,a))},c=r&&!u;return clearTimeout(u),u=setTimeout(o,t),c&&(e=n.apply(i,a)),e}},j.once=function(n){var t,r=!1;return function(){return r?t:(r=!0,t=n.apply(this,arguments),n=null,t)}},j.wrap=function(n,t){return function(){var r=[n];return a.apply(r,arguments),t.apply(this,r)}},j.compose=function(){var n=arguments;return function(){for(var t=arguments,r=n.length-1;r>=0;r--)t=[n[r].apply(this,t)];return t[0]}},j.after=function(n,t){return function(){return--n<1?t.apply(this,arguments):void 0}},j.keys=_||function(n){if(n!==Object(n))throw new TypeError("Invalid object");var t=[];for(var r in n)j.has(n,r)&&t.push(r);return t},j.values=function(n){var t=[];for(var r in n)j.has(n,r)&&t.push(n[r]);return t},j.pairs=function(n){var t=[];for(var r in n)j.has(n,r)&&t.push([r,n[r]]);return t},j.invert=function(n){var t={};for(var r in n)j.has(n,r)&&(t[n[r]]=r);return t},j.functions=j.methods=function(n){var t=[];for(var r in n)j.isFunction(n[r])&&t.push(r);return t.sort()},j.extend=function(n){return A(o.call(arguments,1),function(t){if(t)for(var r in t)n[r]=t[r]}),n},j.pick=function(n){var t={},r=c.apply(e,o.call(arguments,1));return A(r,function(r){r in n&&(t[r]=n[r])}),t},j.omit=function(n){var t={},r=c.apply(e,o.call(arguments,1));for(var u in n)j.contains(r,u)||(t[u]=n[u]);return t},j.defaults=function(n){return A(o.call(arguments,1),function(t){if(t)for(var r in t)n[r]===void 0&&(n[r]=t[r])}),n},j.clone=function(n){return j.isObject(n)?j.isArray(n)?n.slice():j.extend({},n):n},j.tap=function(n,t){return t(n),n};var S=function(n,t,r,e){if(n===t)return 0!==n||1/n==1/t;if(null==n||null==t)return n===t;n instanceof j&&(n=n._wrapped),t instanceof j&&(t=t._wrapped);var u=l.call(n);if(u!=l.call(t))return!1;switch(u){case"[object String]":return n==String(t);case"[object Number]":return n!=+n?t!=+t:0==n?1/n==1/t:n==+t;case"[object Date]":case"[object Boolean]":return+n==+t;case"[object RegExp]":return n.source==t.source&&n.global==t.global&&n.multiline==t.multiline&&n.ignoreCase==t.ignoreCase}if("object"!=typeof n||"object"!=typeof t)return!1;for(var i=r.length;i--;)if(r[i]==n)return e[i]==t;var a=n.constructor,o=t.constructor;if(a!==o&&!(j.isFunction(a)&&a instanceof a&&j.isFunction(o)&&o instanceof o))return!1;r.push(n),e.push(t);var c=0,f=!0;if("[object Array]"==u){if(c=n.length,f=c==t.length)for(;c--&&(f=S(n[c],t[c],r,e)););}else{for(var s in n)if(j.has(n,s)&&(c++,!(f=j.has(t,s)&&S(n[s],t[s],r,e))))break;if(f){for(s in t)if(j.has(t,s)&&!c--)break;f=!c}}return r.pop(),e.pop(),f};j.isEqual=function(n,t){return S(n,t,[],[])},j.isEmpty=function(n){if(null==n)return!0;if(j.isArray(n)||j.isString(n))return 0===n.length;for(var t in n)if(j.has(n,t))return!1;return!0},j.isElement=function(n){return!(!n||1!==n.nodeType)},j.isArray=x||function(n){return"[object Array]"==l.call(n)},j.isObject=function(n){return n===Object(n)},A(["Arguments","Function","String","Number","Date","RegExp"],function(n){j["is"+n]=function(t){return l.call(t)=="[object "+n+"]"}}),j.isArguments(arguments)||(j.isArguments=function(n){return!(!n||!j.has(n,"callee"))}),"function"!=typeof/./&&(j.isFunction=function(n){return"function"==typeof n}),j.isFinite=function(n){return isFinite(n)&&!isNaN(parseFloat(n))},j.isNaN=function(n){return j.isNumber(n)&&n!=+n},j.isBoolean=function(n){return n===!0||n===!1||"[object Boolean]"==l.call(n)},j.isNull=function(n){return null===n},j.isUndefined=function(n){return n===void 0},j.has=function(n,t){return f.call(n,t)},j.noConflict=function(){return n._=t,this},j.identity=function(n){return n},j.times=function(n,t,r){for(var e=Array(Math.max(0,n)),u=0;n>u;u++)e[u]=t.call(r,u);return e},j.random=function(n,t){return null==t&&(t=n,n=0),n+Math.floor(Math.random()*(t-n+1))};var I={escape:{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","/":"&#x2F;"}};I.unescape=j.invert(I.escape);var T={escape:new RegExp("["+j.keys(I.escape).join("")+"]","g"),unescape:new RegExp("("+j.keys(I.unescape).join("|")+")","g")};j.each(["escape","unescape"],function(n){j[n]=function(t){return null==t?"":(""+t).replace(T[n],function(t){return I[n][t]})}}),j.result=function(n,t){if(null==n)return void 0;var r=n[t];return j.isFunction(r)?r.call(n):r},j.mixin=function(n){A(j.functions(n),function(t){var r=j[t]=n[t];j.prototype[t]=function(){var n=[this._wrapped];return a.apply(n,arguments),z.call(this,r.apply(j,n))}})};var N=0;j.uniqueId=function(n){var t=++N+"";return n?n+t:t},j.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var q=/(.)^/,B={"'":"'","\\":"\\","\r":"r","\n":"n"," ":"t","\u2028":"u2028","\u2029":"u2029"},D=/\\|'|\r|\n|\t|\u2028|\u2029/g;j.template=function(n,t,r){var e;r=j.defaults({},r,j.templateSettings);var u=new RegExp([(r.escape||q).source,(r.interpolate||q).source,(r.evaluate||q).source].join("|")+"|$","g"),i=0,a="__p+='";n.replace(u,function(t,r,e,u,o){return a+=n.slice(i,o).replace(D,function(n){return"\\"+B[n]}),r&&(a+="'+\n((__t=("+r+"))==null?'':_.escape(__t))+\n'"),e&&(a+="'+\n((__t=("+e+"))==null?'':__t)+\n'"),u&&(a+="';\n"+u+"\n__p+='"),i=o+t.length,t}),a+="';\n",r.variable||(a="with(obj||{}){\n"+a+"}\n"),a="var __t,__p='',__j=Array.prototype.join,"+"print=function(){__p+=__j.call(arguments,'');};\n"+a+"return __p;\n";try{e=new Function(r.variable||"obj","_",a)}catch(o){throw o.source=a,o}if(t)return e(t,j);var c=function(n){return e.call(this,n,j)};return c.source="function("+(r.variable||"obj")+"){\n"+a+"}",c},j.chain=function(n){return j(n).chain()};var z=function(n){return this._chain?j(n).chain():n};j.mixin(j),A(["pop","push","reverse","shift","sort","splice","unshift"],function(n){var t=e[n];j.prototype[n]=function(){var r=this._wrapped;return t.apply(r,arguments),"shift"!=n&&"splice"!=n||0!==r.length||delete r[0],z.call(this,r)}}),A(["concat","join","slice"],function(n){var t=e[n];j.prototype[n]=function(){return z.call(this,t.apply(this._wrapped,arguments))}}),j.extend(j.prototype,{chain:function(){return this._chain=!0,this},value:function(){return this._wrapped}})}.call(this);

 // _.templateSettings = {
 //     evaluate:    /\{\{=(.+?)\}\}/g,
 //     interpolate: /\{\{(.+?)\}\}/g,
 //     escape:      /\{\{-(.+?)\}\}/g
 // };

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
                        a.mask.close('esc');
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
        
        close: function(e) {
            if (loaded) {
                loaded = false;
                // onBeforeClose
                if (call(config.onBeforeClose(e)) === false) { return this; }
                    
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
        .find('[class^="spellchecker-"], [wcelement], #wcorchat, #jGrowl, .wcreporterror')
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
      .html("<del class='wc-words-removed'>"+oldWord +"</del><span class='wc-words-arrow'>&rarr;</span><ins class='wc-words-added'>" + r +"</ins>")
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
(function(e,t){var n=function(e,t,n){var r;return function(){function u(){if(!n)e.apply(s,o);r=null}var s=this,o=arguments;if(r)clearTimeout(r);else if(n)e.apply(s,o);r=setTimeout(u,t||400)}};e.fn[t]=function(e){return e?this.on("resize",n(e)):this.trigger(t)}})($,"smartresize");

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


/* Modernizr 2.6.2 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-fontface-backgroundsize-borderimage-borderradius-boxshadow-flexbox-hsla-multiplebgs-opacity-rgba-textshadow-cssanimations-csscolumns-generatedcontent-cssgradients-cssreflections-csstransforms-csstransforms3d-csstransitions-applicationcache-canvas-canvastext-draganddrop-hashchange-history-audio-video-indexeddb-input-inputtypes-localstorage-postmessage-sessionstorage-websockets-websqldatabase-webworkers-geolocation-inlinesvg-smil-svg-svgclippaths-touch-webgl-shiv-mq-cssclasses-addtest-prefixed-teststyles-testprop-testallprops-hasevent-prefixes-domprefixes-load
 */
;window.Modernizr=function(a,b,c){function D(a){j.cssText=a}function E(a,b){return D(n.join(a+";")+(b||""))}function F(a,b){return typeof a===b}function G(a,b){return!!~(""+a).indexOf(b)}function H(a,b){for(var d in a){var e=a[d];if(!G(e,"-")&&j[e]!==c)return b=="pfx"?e:!0}return!1}function I(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:F(f,"function")?f.bind(d||b):f}return!1}function J(a,b,c){var d=a.charAt(0).toUpperCase()+a.slice(1),e=(a+" "+p.join(d+" ")+d).split(" ");return F(b,"string")||F(b,"undefined")?H(e,b):(e=(a+" "+q.join(d+" ")+d).split(" "),I(e,b,c))}function K(){e.input=function(c){for(var d=0,e=c.length;d<e;d++)u[c[d]]=c[d]in k;return u.list&&(u.list=!!b.createElement("datalist")&&!!a.HTMLDataListElement),u}("autocomplete autofocus list placeholder max min multiple pattern required step".split(" ")),e.inputtypes=function(a){for(var d=0,e,f,h,i=a.length;d<i;d++)k.setAttribute("type",f=a[d]),e=k.type!=="text",e&&(k.value=l,k.style.cssText="position:absolute;visibility:hidden;",/^range$/.test(f)&&k.style.WebkitAppearance!==c?(g.appendChild(k),h=b.defaultView,e=h.getComputedStyle&&h.getComputedStyle(k,null).WebkitAppearance!=="textfield"&&k.offsetHeight!==0,g.removeChild(k)):/^(search|tel)$/.test(f)||(/^(url|email)$/.test(f)?e=k.checkValidity&&k.checkValidity()===!1:e=k.value!=l)),t[a[d]]=!!e;return t}("search tel url email datetime date month week time datetime-local number range color".split(" "))}var d="2.6.2",e={},f=!0,g=b.documentElement,h="modernizr",i=b.createElement(h),j=i.style,k=b.createElement("input"),l=":)",m={}.toString,n=" -webkit- -moz- -o- -ms- ".split(" "),o="Webkit Moz O ms",p=o.split(" "),q=o.toLowerCase().split(" "),r={svg:"http://www.w3.org/2000/svg"},s={},t={},u={},v=[],w=v.slice,x,y=function(a,c,d,e){var f,i,j,k,l=b.createElement("div"),m=b.body,n=m||b.createElement("body");if(parseInt(d,10))while(d--)j=b.createElement("div"),j.id=e?e[d]:h+(d+1),l.appendChild(j);return f=["&#173;",'<style id="s',h,'">',a,"</style>"].join(""),l.id=h,(m?l:n).innerHTML+=f,n.appendChild(l),m||(n.style.background="",n.style.overflow="hidden",k=g.style.overflow,g.style.overflow="hidden",g.appendChild(n)),i=c(l,a),m?l.parentNode.removeChild(l):(n.parentNode.removeChild(n),g.style.overflow=k),!!i},z=function(b){var c=a.matchMedia||a.msMatchMedia;if(c)return c(b).matches;var d;return y("@media "+b+" { #"+h+" { position: absolute; } }",function(b){d=(a.getComputedStyle?getComputedStyle(b,null):b.currentStyle)["position"]=="absolute"}),d},A=function(){function d(d,e){e=e||b.createElement(a[d]||"div"),d="on"+d;var f=d in e;return f||(e.setAttribute||(e=b.createElement("div")),e.setAttribute&&e.removeAttribute&&(e.setAttribute(d,""),f=F(e[d],"function"),F(e[d],"undefined")||(e[d]=c),e.removeAttribute(d))),e=null,f}var a={select:"input",change:"input",submit:"form",reset:"form",error:"img",load:"img",abort:"img"};return d}(),B={}.hasOwnProperty,C;!F(B,"undefined")&&!F(B.call,"undefined")?C=function(a,b){return B.call(a,b)}:C=function(a,b){return b in a&&F(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=w.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(w.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(w.call(arguments)))};return e}),s.flexbox=function(){return J("flexWrap")},s.canvas=function(){var a=b.createElement("canvas");return!!a.getContext&&!!a.getContext("2d")},s.canvastext=function(){return!!e.canvas&&!!F(b.createElement("canvas").getContext("2d").fillText,"function")},s.webgl=function(){return!!a.WebGLRenderingContext},s.touch=function(){var c;return"ontouchstart"in a||a.DocumentTouch&&b instanceof DocumentTouch?c=!0:y(["@media (",n.join("touch-enabled),("),h,")","{#modernizr{top:9px;position:absolute}}"].join(""),function(a){c=a.offsetTop===9}),c},s.geolocation=function(){return"geolocation"in navigator},s.postmessage=function(){return!!a.postMessage},s.websqldatabase=function(){return!!a.openDatabase},s.indexedDB=function(){return!!J("indexedDB",a)},s.hashchange=function(){return A("hashchange",a)&&(b.documentMode===c||b.documentMode>7)},s.history=function(){return!!a.history&&!!history.pushState},s.draganddrop=function(){var a=b.createElement("div");return"draggable"in a||"ondragstart"in a&&"ondrop"in a},s.websockets=function(){return"WebSocket"in a||"MozWebSocket"in a},s.rgba=function(){return D("background-color:rgba(150,255,150,.5)"),G(j.backgroundColor,"rgba")},s.hsla=function(){return D("background-color:hsla(120,40%,100%,.5)"),G(j.backgroundColor,"rgba")||G(j.backgroundColor,"hsla")},s.multiplebgs=function(){return D("background:url(https://),url(https://),red url(https://)"),/(url\s*\(.*?){3}/.test(j.background)},s.backgroundsize=function(){return J("backgroundSize")},s.borderimage=function(){return J("borderImage")},s.borderradius=function(){return J("borderRadius")},s.boxshadow=function(){return J("boxShadow")},s.textshadow=function(){return b.createElement("div").style.textShadow===""},s.opacity=function(){return E("opacity:.55"),/^0.55$/.test(j.opacity)},s.cssanimations=function(){return J("animationName")},s.csscolumns=function(){return J("columnCount")},s.cssgradients=function(){var a="background-image:",b="gradient(linear,left top,right bottom,from(#9f9),to(white));",c="linear-gradient(left top,#9f9, white);";return D((a+"-webkit- ".split(" ").join(b+a)+n.join(c+a)).slice(0,-a.length)),G(j.backgroundImage,"gradient")},s.cssreflections=function(){return J("boxReflect")},s.csstransforms=function(){return!!J("transform")},s.csstransforms3d=function(){var a=!!J("perspective");return a&&"webkitPerspective"in g.style&&y("@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}",function(b,c){a=b.offsetLeft===9&&b.offsetHeight===3}),a},s.csstransitions=function(){return J("transition")},s.fontface=function(){var a;return y('@font-face {font-family:"font";src:url("https://")}',function(c,d){var e=b.getElementById("smodernizr"),f=e.sheet||e.styleSheet,g=f?f.cssRules&&f.cssRules[0]?f.cssRules[0].cssText:f.cssText||"":"";a=/src/i.test(g)&&g.indexOf(d.split(" ")[0])===0}),a},s.generatedcontent=function(){var a;return y(["#",h,"{font:0/0 a}#",h,':after{content:"',l,'";visibility:hidden;font:3px/1 a}'].join(""),function(b){a=b.offsetHeight>=3}),a},s.video=function(){var a=b.createElement("video"),c=!1;try{if(c=!!a.canPlayType)c=new Boolean(c),c.ogg=a.canPlayType('video/ogg; codecs="theora"').replace(/^no$/,""),c.h264=a.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/,""),c.webm=a.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/,"")}catch(d){}return c},s.audio=function(){var a=b.createElement("audio"),c=!1;try{if(c=!!a.canPlayType)c=new Boolean(c),c.ogg=a.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,""),c.mp3=a.canPlayType("audio/mpeg;").replace(/^no$/,""),c.wav=a.canPlayType('audio/wav; codecs="1"').replace(/^no$/,""),c.m4a=(a.canPlayType("audio/x-m4a;")||a.canPlayType("audio/aac;")).replace(/^no$/,"")}catch(d){}return c},s.localstorage=function(){try{return localStorage.setItem(h,h),localStorage.removeItem(h),!0}catch(a){return!1}},s.sessionstorage=function(){try{return sessionStorage.setItem(h,h),sessionStorage.removeItem(h),!0}catch(a){return!1}},s.webworkers=function(){return!!a.Worker},s.applicationcache=function(){return!!a.applicationCache},s.svg=function(){return!!b.createElementNS&&!!b.createElementNS(r.svg,"svg").createSVGRect},s.inlinesvg=function(){var a=b.createElement("div");return a.innerHTML="<svg/>",(a.firstChild&&a.firstChild.namespaceURI)==r.svg},s.smil=function(){return!!b.createElementNS&&/SVGAnimate/.test(m.call(b.createElementNS(r.svg,"animate")))},s.svgclippaths=function(){return!!b.createElementNS&&/SVGClipPath/.test(m.call(b.createElementNS(r.svg,"clipPath")))};for(var L in s)C(s,L)&&(x=L.toLowerCase(),e[x]=s[L](),v.push((e[x]?"":"no-")+x));return e.input||K(),e.addTest=function(a,b){if(typeof a=="object")for(var d in a)C(a,d)&&e.addTest(d,a[d]);else{a=a.toLowerCase();if(e[a]!==c)return e;b=typeof b=="function"?b():b,typeof f!="undefined"&&f&&(g.className+=" "+(b?"":"no-")+a),e[a]=b}return e},D(""),i=k=null,function(a,b){function k(a,b){var c=a.createElement("p"),d=a.getElementsByTagName("head")[0]||a.documentElement;return c.innerHTML="x<style>"+b+"</style>",d.insertBefore(c.lastChild,d.firstChild)}function l(){var a=r.elements;return typeof a=="string"?a.split(" "):a}function m(a){var b=i[a[g]];return b||(b={},h++,a[g]=h,i[h]=b),b}function n(a,c,f){c||(c=b);if(j)return c.createElement(a);f||(f=m(c));var g;return f.cache[a]?g=f.cache[a].cloneNode():e.test(a)?g=(f.cache[a]=f.createElem(a)).cloneNode():g=f.createElem(a),g.canHaveChildren&&!d.test(a)?f.frag.appendChild(g):g}function o(a,c){a||(a=b);if(j)return a.createDocumentFragment();c=c||m(a);var d=c.frag.cloneNode(),e=0,f=l(),g=f.length;for(;e<g;e++)d.createElement(f[e]);return d}function p(a,b){b.cache||(b.cache={},b.createElem=a.createElement,b.createFrag=a.createDocumentFragment,b.frag=b.createFrag()),a.createElement=function(c){return r.shivMethods?n(c,a,b):b.createElem(c)},a.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+l().join().replace(/\w+/g,function(a){return b.createElem(a),b.frag.createElement(a),'c("'+a+'")'})+");return n}")(r,b.frag)}function q(a){a||(a=b);var c=m(a);return r.shivCSS&&!f&&!c.hasCSS&&(c.hasCSS=!!k(a,"article,aside,figcaption,figure,footer,header,hgroup,nav,section{display:block}mark{background:#FF0;color:#000}")),j||p(a,c),a}var c=a.html5||{},d=/^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,e=/^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,f,g="_html5shiv",h=0,i={},j;(function(){try{var a=b.createElement("a");a.innerHTML="<xyz></xyz>",f="hidden"in a,j=a.childNodes.length==1||function(){b.createElement("a");var a=b.createDocumentFragment();return typeof a.cloneNode=="undefined"||typeof a.createDocumentFragment=="undefined"||typeof a.createElement=="undefined"}()}catch(c){f=!0,j=!0}})();var r={elements:c.elements||"abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video",shivCSS:c.shivCSS!==!1,supportsUnknownElements:j,shivMethods:c.shivMethods!==!1,type:"default",shivDocument:q,createElement:n,createDocumentFragment:o};a.html5=r,q(b)}(this,b),e._version=d,e._prefixes=n,e._domPrefixes=q,e._cssomPrefixes=p,e.mq=z,e.hasEvent=A,e.testProp=function(a){return H([a])},e.testAllProps=J,e.testStyles=y,e.prefixed=function(a,b,c){return b?J(a,b,c):J(a,"pfx")},g.className=g.className.replace(/(^|\s)no-js(\s|$)/,"$1$2")+(f?" js "+v.join(" "):""),e}(this,this.document),function(a,b,c){function d(a){return"[object Function]"==o.call(a)}function e(a){return"string"==typeof a}function f(){}function g(a){return!a||"loaded"==a||"complete"==a||"uninitialized"==a}function h(){var a=p.shift();q=1,a?a.t?m(function(){("c"==a.t?B.injectCss:B.injectJs)(a.s,0,a.a,a.x,a.e,1)},0):(a(),h()):q=0}function i(a,c,d,e,f,i,j){function k(b){if(!o&&g(l.readyState)&&(u.r=o=1,!q&&h(),l.onload=l.onreadystatechange=null,b)){"img"!=a&&m(function(){t.removeChild(l)},50);for(var d in y[c])y[c].hasOwnProperty(d)&&y[c][d].onload()}}var j=j||B.errorTimeout,l=b.createElement(a),o=0,r=0,u={t:d,s:c,e:f,a:i,x:j};1===y[c]&&(r=1,y[c]=[]),"object"==a?l.data=c:(l.src=c,l.type=a),l.width=l.height="0",l.onerror=l.onload=l.onreadystatechange=function(){k.call(this,r)},p.splice(e,0,u),"img"!=a&&(r||2===y[c]?(t.insertBefore(l,s?null:n),m(k,j)):y[c].push(l))}function j(a,b,c,d,f){return q=0,b=b||"j",e(a)?i("c"==b?v:u,a,b,this.i++,c,d,f):(p.splice(this.i++,0,a),1==p.length&&h()),this}function k(){var a=B;return a.loader={load:j,i:0},a}var l=b.documentElement,m=a.setTimeout,n=b.getElementsByTagName("script")[0],o={}.toString,p=[],q=0,r="MozAppearance"in l.style,s=r&&!!b.createRange().compareNode,t=s?l:n.parentNode,l=a.opera&&"[object Opera]"==o.call(a.opera),l=!!b.attachEvent&&!l,u=r?"object":l?"script":"img",v=l?"script":u,w=Array.isArray||function(a){return"[object Array]"==o.call(a)},x=[],y={},z={timeout:function(a,b){return b.length&&(a.timeout=b[0]),a}},A,B;B=function(a){function b(a){var a=a.split("!"),b=x.length,c=a.pop(),d=a.length,c={url:c,origUrl:c,prefixes:a},e,f,g;for(f=0;f<d;f++)g=a[f].split("="),(e=z[g.shift()])&&(c=e(c,g));for(f=0;f<b;f++)c=x[f](c);return c}function g(a,e,f,g,h){var i=b(a),j=i.autoCallback;i.url.split(".").pop().split("?").shift(),i.bypass||(e&&(e=d(e)?e:e[a]||e[g]||e[a.split("/").pop().split("?")[0]]),i.instead?i.instead(a,e,f,g,h):(y[i.url]?i.noexec=!0:y[i.url]=1,f.load(i.url,i.forceCSS||!i.forceJS&&"css"==i.url.split(".").pop().split("?").shift()?"c":c,i.noexec,i.attrs,i.timeout),(d(e)||d(j))&&f.load(function(){k(),e&&e(i.origUrl,h,g),j&&j(i.origUrl,h,g),y[i.url]=2})))}function h(a,b){function c(a,c){if(a){if(e(a))c||(j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}),g(a,j,b,0,h);else if(Object(a)===a)for(n in m=function(){var b=0,c;for(c in a)a.hasOwnProperty(c)&&b++;return b}(),a)a.hasOwnProperty(n)&&(!c&&!--m&&(d(j)?j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}:j[n]=function(a){return function(){var b=[].slice.call(arguments);a&&a.apply(this,b),l()}}(k[n])),g(a[n],j,b,n,h))}else!c&&l()}var h=!!a.test,i=a.load||a.both,j=a.callback||f,k=j,l=a.complete||f,m,n;c(h?a.yep:a.nope,!!i),i&&c(i)}var i,j,l=this.yepnope.loader;if(e(a))g(a,0,l,0);else if(w(a))for(i=0;i<a.length;i++)j=a[i],e(j)?g(j,0,l,0):w(j)?B(j):Object(j)===j&&h(j,l);else Object(a)===a&&h(a,l)},B.addPrefix=function(a,b){z[a]=b},B.addFilter=function(a){x.push(a)},B.errorTimeout=1e4,null==b.readyState&&b.addEventListener&&(b.readyState="loading",b.addEventListener("DOMContentLoaded",A=function(){b.removeEventListener("DOMContentLoaded",A,0),b.readyState="complete"},0)),a.yepnope=k(),a.yepnope.executeStack=h,a.yepnope.injectJs=function(a,c,d,e,i,j){var k=b.createElement("script"),l,o,e=e||B.errorTimeout;k.src=a;for(o in d)k.setAttribute(o,d[o]);c=j?h:c||f,k.onreadystatechange=k.onload=function(){!l&&g(k.readyState)&&(l=1,c(),k.onload=k.onreadystatechange=null)},m(function(){l||(l=1,c(1))},e),i?k.onload():n.parentNode.insertBefore(k,n)},a.yepnope.injectCss=function(a,c,d,e,g,i){var e=b.createElement("link"),j,c=i?h:c||f;e.href=a,e.rel="stylesheet",e.type="text/css";for(j in d)e.setAttribute(j,d[j]);g||(n.parentNode.insertBefore(e,n),m(c,0))}}(this,document),Modernizr.load=function(){yepnope.apply(window,[].slice.call(arguments,0))};

/*:
  ----------------------------------------------------
  event.js : 1.1.5 : 2014/02/12 : MIT License
  ----------------------------------------------------
  https://github.com/mudcube/Event.js
  ----------------------------------------------------
  1  : click, dblclick, dbltap
  1+ : tap, longpress, drag, swipe
  2+ : pinch, rotate
     : mousewheel, devicemotion, shake
  ----------------------------------------------------  
*/


if(eventjs===void 0)var eventjs={};if(function(e){"use strict";e.modifyEventListener=!1,e.modifySelectors=!1,e.add=function(e,t,r,o){return n(e,t,r,o,"add")},e.remove=function(e,t,r,o){return n(e,t,r,o,"remove")},e.returnFalse=function(){return!1},e.stop=function(e){e&&(e.stopPropagation&&e.stopPropagation(),e.cancelBubble=!0,e.cancelBubbleCount=0)},e.prevent=function(e){e&&(e.preventDefault?e.preventDefault():e.preventManipulation?e.preventManipulation():e.returnValue=!1)},e.cancel=function(t){e.stop(t),e.prevent(t)},e.blur=function(){var e=document.activeElement;if(e){var t=document.activeElement.nodeName;("INPUT"===t||"TEXTAREA"===t||"true"===e.contentEditable)&&e.blur&&e.blur()}},e.getEventSupport=function(e,t){if("string"==typeof e&&(t=e,e=window),t="on"+t,t in e)return!0;if(e.setAttribute||(e=document.createElement("div")),e.setAttribute&&e.removeAttribute){e.setAttribute(t,"");var n="function"==typeof e[t];return e[t]!==void 0&&(e[t]=null),e.removeAttribute(t),n}};var t=function(e){if(!e||"object"!=typeof e)return e;var n=new e.constructor;for(var r in e)n[r]=e[r]&&"object"==typeof e[r]?t(e[r]):e[r];return n},n=function(i,s,v,l,p,g){if(l=l||{},"[object Object]"==i+""){var m=i;if(i=m.target,delete m.target,!m.type||!m.listener){for(var j in m){var y=m[j];"function"!=typeof y&&(l[j]=y)}var h={};for(var w in m){var j=w.split(","),x=m[w],P={};for(var b in l)P[b]=l[b];if("function"==typeof x)var v=x;else{if("function"!=typeof x.listener)continue;var v=x.listener;for(var b in x)"function"!=typeof x[b]&&(P[b]=x[b])}for(var M=0;j.length>M;M++)h[w]=eventjs.add(i,j[M],v,P,p)}return h}s=m.type,delete m.type,v=m.listener,delete m.listener;for(var w in m)l[w]=m[w]}if(i&&s&&v){if("string"==typeof i&&"ready"===s){if(!window.eventjs_stallOnReady){var E=(new Date).getTime(),T=l.timeout,G=l.interval||1e3/60,D=window.setInterval(function(){(new Date).getTime()-E>T&&window.clearInterval(D),document.querySelector(i)&&(window.clearInterval(D),setTimeout(v,1))},G);return}s="load",i=window}if("string"==typeof i){if(i=document.querySelectorAll(i),0===i.length)return o("Missing target on listener!",arguments);1===i.length&&(i=i[0])}var L,k={};if(i.length>0&&i!==window){for(var X=0,Y=i.length;Y>X;X++)L=n(i[X],s,v,t(l),p),L&&(k[X]=L);return r(k)}if("string"==typeof s&&(s=s.toLowerCase(),-1!==s.indexOf(" ")?s=s.split(" "):-1!==s.indexOf(",")&&(s=s.split(","))),"string"!=typeof s){if("number"==typeof s.length)for(var H=0,S=s.length;S>H;H++)L=n(i,s[H],v,t(l),p),L&&(k[s[H]]=L);else for(var w in s)L="function"==typeof s[w]?n(i,w,s[w],t(l),p):n(i,w,s[w].listener,t(s[w]),p),L&&(k[w]=L);return r(k)}if(0===s.indexOf("on")&&(s=s.substr(2)),"object"!=typeof i)return o("Target is not defined!",arguments);if("function"!=typeof v)return o("Listener is not a function!",arguments);var U=l.useCapture||!1,_=d(i)+"."+d(v)+"."+(U?1:0);if(e.Gesture&&e.Gesture._gestureHandlers[s]){if(_=s+_,"remove"===p){if(!u[_])return;u[_].remove(),delete u[_]}else if("add"===p){if(u[_])return u[_].add(),u[_];if(l.useCall&&!e.modifyEventListener){var C=v;v=function(e,t){for(var n in t)e[n]=t[n];return C.call(i,e)}}l.gesture=s,l.target=i,l.listener=v,l.fromOverwrite=g,u[_]=e.proxy[s](l)}return u[_]}for(var F,O=a(s),M=0;O.length>M;M++)if(s=O[M],F=s+"."+_,"remove"===p){if(!u[F])continue;i[f](s,v,U),delete u[F]}else if("add"===p){if(u[F])return u[F];i[c](s,v,U),u[F]={id:F,type:s,target:i,listener:v,remove:function(){for(var t=0;O.length>t;t++)e.remove(i,O[t],v,l)}}}return u[F]}},r=function(e){return{remove:function(){for(var t in e)e[t].remove()},add:function(){for(var t in e)e[t].add()}}},o=function(e,t){"undefined"!=typeof console&&void 0!==console.error&&console.error(e,t)},i={msPointer:["MSPointerDown","MSPointerMove","MSPointerUp"],touch:["touchstart","touchmove","touchend"],mouse:["mousedown","mousemove","mouseup"]},s={MSPointerDown:0,MSPointerMove:1,MSPointerUp:2,touchstart:0,touchmove:1,touchend:2,mousedown:0,mousemove:1,mouseup:2};(function(){e.supports={},window.navigator.msPointerEnabled&&(e.supports.msPointer=!0),e.getEventSupport("touchstart")&&(e.supports.touch=!0),e.getEventSupport("mousedown")&&(e.supports.mouse=!0)})();var a=function(){return function(t){var n=document.addEventListener?"":"on",r=s[t];if(isFinite(r)){var o=[];for(var a in e.supports)o.push(n+i[a][r]);return o}return[n+t]}}(),u={},v=0,d=function(e){return e===window?"#window":e===document?"#document":(e.uniqueID||(e.uniqueID="e"+v++),e.uniqueID)},c=document.addEventListener?"addEventListener":"attachEvent",f=document.removeEventListener?"removeEventListener":"detachEvent";return e.createPointerEvent=function(t,n,r){var o=n.gesture,i=n.target,s=t.changedTouches||e.proxy.getCoords(t);if(s.length){var a=s[0];n.pointers=r?[]:s,n.pageX=a.pageX,n.pageY=a.pageY,n.x=n.pageX,n.y=n.pageY}var u=document.createEvent("Event");u.initEvent(o,!0,!0),u.originalEvent=t;for(var v in n)"target"!==v&&(u[v]=n[v]);var d=u.type;e.Gesture&&e.Gesture._gestureHandlers[d]&&n.oldListener.call(i,u,n,!1)},e.modifyEventListener&&window.HTMLElement&&function(){var t=function(t){var r=function(r){var o=r+"EventListener",i=t[o];t[o]=function(t,o,s){if(e.Gesture&&e.Gesture._gestureHandlers[t]){var u=s;"object"==typeof s?u.useCall=!0:u={useCall:!0,useCapture:s},n(this,t,o,u,r,!0)}else for(var v=a(t),d=0;v.length>d;d++)i.call(this,v[d],o,s)}};r("add"),r("remove")};navigator.userAgent.match(/Firefox/)?(t(HTMLDivElement.prototype),t(HTMLCanvasElement.prototype)):t(HTMLElement.prototype),t(document),t(window)}(),e.modifySelectors&&function(){var e=NodeList.prototype;e.removeEventListener=function(e,t,n){for(var r=0,o=this.length;o>r;r++)this[r].removeEventListener(e,t,n)},e.addEventListener=function(e,t,n){for(var r=0,o=this.length;o>r;r++)this[r].addEventListener(e,t,n)}}(),e}(eventjs),eventjs===void 0)var eventjs={};if(eventjs.proxy===void 0&&(eventjs.proxy={}),eventjs.proxy=function(e){"use strict";e.pointerSetup=function(e,t){e.target=e.target||window,e.doc=e.target.ownerDocument||e.target,e.minFingers=e.minFingers||e.fingers||1,e.maxFingers=e.maxFingers||e.fingers||1/0,e.position=e.position||"relative",delete e.fingers,t=t||{},t.enabled=!0,t.gesture=e.gesture,t.target=e.target,t.env=e.env,eventjs.modifyEventListener&&e.fromOverwrite&&(e.oldListener=e.listener,e.listener=eventjs.createPointerEvent);var n=0,r=0===t.gesture.indexOf("pointer")&&eventjs.modifyEventListener?"pointer":"mouse";return e.oldListener&&(t.oldListener=e.oldListener),t.listener=e.listener,t.proxy=function(n){t.defaultListener=e.listener,e.listener=n,n(e.event,t)},t.add=function(){t.enabled!==!0&&(e.onPointerDown&&eventjs.add(e.target,r+"down",e.onPointerDown),e.onPointerMove&&eventjs.add(e.doc,r+"move",e.onPointerMove),e.onPointerUp&&eventjs.add(e.doc,r+"up",e.onPointerUp),t.enabled=!0)},t.remove=function(){t.enabled!==!1&&(e.onPointerDown&&eventjs.remove(e.target,r+"down",e.onPointerDown),e.onPointerMove&&eventjs.remove(e.doc,r+"move",e.onPointerMove),e.onPointerUp&&eventjs.remove(e.doc,r+"up",e.onPointerUp),t.reset(),t.enabled=!1)},t.pause=function(t){!e.onPointerMove||t&&!t.move||eventjs.remove(e.doc,r+"move",e.onPointerMove),!e.onPointerUp||t&&!t.up||eventjs.remove(e.doc,r+"up",e.onPointerUp),n=e.fingers,e.fingers=0},t.resume=function(t){!e.onPointerMove||t&&!t.move||eventjs.add(e.doc,r+"move",e.onPointerMove),!e.onPointerUp||t&&!t.up||eventjs.add(e.doc,r+"up",e.onPointerUp),e.fingers=n},t.reset=function(){e.tracker={},e.fingers=0},t};var t=eventjs.supports;eventjs.isMouse=!!t.mouse,eventjs.isMSPointer=!!t.touch,eventjs.isTouch=!!t.msPointer,e.pointerStart=function(t,n,r){var o=(t.type||"mousedown").toUpperCase();0===o.indexOf("MOUSE")?(eventjs.isMouse=!0,eventjs.isTouch=!1,eventjs.isMSPointer=!1):0===o.indexOf("TOUCH")?(eventjs.isMouse=!1,eventjs.isTouch=!0,eventjs.isMSPointer=!1):0===o.indexOf("MSPOINTER")&&(eventjs.isMouse=!1,eventjs.isTouch=!1,eventjs.isMSPointer=!0);var i=function(e,t){var n=r.bbox,o=a[t]={};switch(r.position){case"absolute":o.offsetX=0,o.offsetY=0;break;case"differenceFromLast":o.offsetX=e.pageX,o.offsetY=e.pageY;break;case"difference":o.offsetX=e.pageX,o.offsetY=e.pageY;break;case"move":o.offsetX=e.pageX-n.x1,o.offsetY=e.pageY-n.y1;break;default:o.offsetX=n.x1-n.scrollLeft,o.offsetY=n.y1-n.scrollTop}var i=e.pageX-o.offsetX,s=e.pageY-o.offsetY;o.rotation=0,o.scale=1,o.startTime=o.moveTime=(new Date).getTime(),o.move={x:i,y:s},o.start={x:i,y:s},r.fingers++};r.event=t,n.defaultListener&&(r.listener=n.defaultListener,delete n.defaultListener);for(var s=!r.fingers,a=r.tracker,u=t.changedTouches||e.getCoords(t),v=u.length,d=0;v>d;d++){var c=u[d],f=c.identifier||1/0;if(r.fingers){if(r.fingers>=r.maxFingers){var l=[];for(var f in r.tracker)l.push(f);return n.identifier=l.join(","),s}var p=0;for(var g in a){if(a[g].up){delete a[g],i(c,f),r.cancel=!0;break}p++}if(a[f])continue;i(c,f)}else a=r.tracker={},n.bbox=r.bbox=e.getBoundingBox(r.target),r.fingers=0,r.cancel=!1,i(c,f)}var l=[];for(var f in r.tracker)l.push(f);return n.identifier=l.join(","),s},e.pointerEnd=function(e,t,n,r){for(var o=e.touches||[],i=o.length,s={},a=0;i>a;a++){var u=o[a],v=u.identifier;s[v||1/0]=!0}for(var v in n.tracker){var d=n.tracker[v];s[v]||d.up||(r&&r({pageX:d.pageX,pageY:d.pageY,changedTouches:[{pageX:d.pageX,pageY:d.pageY,identifier:"Infinity"===v?1/0:v}]},"up"),d.up=!0,n.fingers--)}if(0!==n.fingers)return!1;var c=[];n.gestureFingers=0;for(var v in n.tracker)n.gestureFingers++,c.push(v);return t.identifier=c.join(","),!0},e.getCoords=function(t){return e.getCoords=t.pageX!==void 0?function(e){return Array({type:"mouse",x:e.pageX,y:e.pageY,pageX:e.pageX,pageY:e.pageY,identifier:e.pointerId||1/0})}:function(e){var t=document.documentElement;return e=e||window.event,Array({type:"mouse",x:e.clientX+t.scrollLeft,y:e.clientY+t.scrollTop,pageX:e.clientX+t.scrollLeft,pageY:e.clientY+t.scrollTop,identifier:1/0})},e.getCoords(t)},e.getCoord=function(t){if("ontouchstart"in window){var n=0,r=0;e.getCoord=function(e){var t=e.changedTouches;return t&&t.length?{x:n=t[0].pageX,y:r=t[0].pageY}:{x:n,y:r}}}else e.getCoord=t.pageX!==void 0&&t.pageY!==void 0?function(e){return{x:e.pageX,y:e.pageY}}:function(e){var t=document.documentElement;return e=e||window.event,{x:e.clientX+t.scrollLeft,y:e.clientY+t.scrollTop}};return e.getCoord(t)};var n=function(e,t){var n=parseFloat(e.getPropertyValue(t),10);return isFinite(n)?n:0};return e.getBoundingBox=function(e){(e===window||e===document)&&(e=document.body);var t={},r=e.getBoundingClientRect();t.width=r.width,t.height=r.height,t.x1=r.left,t.y1=r.top,t.scaleX=r.width/e.offsetWidth||1,t.scaleY=r.height/e.offsetHeight||1,t.scrollLeft=0,t.scrollTop=0;var o=window.getComputedStyle(e),i="border-box"===o.getPropertyValue("box-sizing");if(i===!1){var s=n(o,"border-left-width"),a=n(o,"border-right-width"),u=n(o,"border-bottom-width"),v=n(o,"border-top-width");t.border=[s,a,v,u],t.x1+=s,t.y1+=v,t.width-=a+s,t.height-=u+v}t.x2=t.x1+t.width,t.y2=t.y1+t.height;for(var d=o.getPropertyValue("position"),c="fixed"===d?e:e.parentNode;null!==c&&c!==document.body&&void 0!==c.scrollTop;){var o=window.getComputedStyle(c),d=o.getPropertyValue("position");if("absolute"===d);else{if("fixed"===d){t.scrollTop-=c.parentNode.scrollTop,t.scrollLeft-=c.parentNode.scrollLeft;break}t.scrollLeft+=c.scrollLeft,t.scrollTop+=c.scrollTop}c=c.parentNode}return t.scrollBodyLeft=void 0!==window.pageXOffset?window.pageXOffset:(document.documentElement||document.body.parentNode||document.body).scrollLeft,t.scrollBodyTop=void 0!==window.pageYOffset?window.pageYOffset:(document.documentElement||document.body.parentNode||document.body).scrollTop,t.scrollLeft-=t.scrollBodyLeft,t.scrollTop-=t.scrollBodyTop,t},function(){var t,n=navigator.userAgent.toLowerCase(),r=-1!==n.indexOf("macintosh");t=r&&-1!==n.indexOf("khtml")?{91:!0,93:!0}:r&&-1!==n.indexOf("firefox")?{224:!0}:{17:!0},(e.metaTrackerReset=function(){eventjs.fnKey=e.fnKey=!1,eventjs.metaKey=e.metaKey=!1,eventjs.escKey=e.escKey=!1,eventjs.ctrlKey=e.ctrlKey=!1,eventjs.shiftKey=e.shiftKey=!1,eventjs.altKey=e.altKey=!1})(),e.metaTracker=function(n){var r="keydown"===n.type;27===n.keyCode&&(eventjs.escKey=e.escKey=r),t[n.keyCode]&&(eventjs.metaKey=e.metaKey=r),eventjs.ctrlKey=e.ctrlKey=n.ctrlKey,eventjs.shiftKey=e.shiftKey=n.shiftKey,eventjs.altKey=e.altKey=n.altKey}}(),e}(eventjs.proxy),eventjs===void 0)var eventjs={};if(eventjs.MutationObserver=function(){var e=window.MutationObserver||window.WebKitMutationObserver||window.MozMutationObserver,t=!e&&function(){var e=document.createElement("p"),t=!1,n=function(){t=!0};if(e.addEventListener)e.addEventListener("DOMAttrModified",n,!1);else{if(!e.attachEvent)return!1;e.attachEvent("onDOMAttrModified",n)}return e.setAttribute("id","target"),t}();return function(n,r){if(e){var o={subtree:!1,attributes:!0},i=new e(function(e){e.forEach(function(e){r.call(e.target,e.attributeName)})});i.observe(n,o)}else t?eventjs.add(n,"DOMAttrModified",function(e){r.call(n,e.attrName)}):"onpropertychange"in document.body&&eventjs.add(n,"propertychange",function(){r.call(n,window.event.propertyName)})}}(),eventjs===void 0)var eventjs={};if(eventjs.proxy===void 0&&(eventjs.proxy={}),eventjs.proxy=function(e){"use strict";return e.click=function(t){t.gesture=t.gesture||"click",t.maxFingers=t.maxFingers||t.fingers||1,t.onPointerDown=function(r){e.pointerStart(r,n,t)&&eventjs.add(t.target,"mouseup",t.onPointerUp)},t.onPointerUp=function(r){if(e.pointerEnd(r,n,t)){eventjs.remove(t.target,"mouseup",t.onPointerUp);var o=r.changedTouches||e.getCoords(r),i=o[0],s=t.bbox,a=e.getBoundingBox(t.target),u=i.pageY-a.scrollBodyTop,v=i.pageX-a.scrollBodyLeft;if(v>s.x1&&u>s.y1&&s.x2>v&&s.y2>u&&s.scrollTop===a.scrollTop){for(var d in t.tracker)break;var c=t.tracker[d];n.x=c.start.x,n.y=c.start.y,t.listener(r,n)}}};var n=e.pointerSetup(t);return n.state="click",eventjs.add(t.target,"mousedown",t.onPointerDown),n},eventjs.Gesture=eventjs.Gesture||{},eventjs.Gesture._gestureHandlers=eventjs.Gesture._gestureHandlers||{},eventjs.Gesture._gestureHandlers.click=e.click,e}(eventjs.proxy),eventjs===void 0)var eventjs={};if(eventjs.proxy===void 0&&(eventjs.proxy={}),eventjs.proxy=function(e){"use strict";return e.dbltap=e.dblclick=function(t){t.gesture=t.gesture||"dbltap",t.maxFingers=t.maxFingers||t.fingers||1;var n,r,o,i,s,a=700;t.onPointerDown=function(v){var d=v.changedTouches||e.getCoords(v);n&&!r?(s=d[0],r=(new Date).getTime()-n):(i=d[0],n=(new Date).getTime(),r=0,clearTimeout(o),o=setTimeout(function(){n=0},a)),e.pointerStart(v,u,t)&&(eventjs.add(t.target,"mousemove",t.onPointerMove).listener(v),eventjs.add(t.target,"mouseup",t.onPointerUp))},t.onPointerMove=function(a){if(n&&!r){var u=a.changedTouches||e.getCoords(a);s=u[0]}var v=t.bbox,d=s.pageX-v.x1,c=s.pageY-v.y1;d>0&&v.width>d&&c>0&&v.height>c&&25>=Math.abs(s.pageX-i.pageX)&&25>=Math.abs(s.pageY-i.pageY)||(eventjs.remove(t.target,"mousemove",t.onPointerMove),clearTimeout(o),n=r=0)},t.onPointerUp=function(i){if(e.pointerEnd(i,u,t)&&(eventjs.remove(t.target,"mousemove",t.onPointerMove),eventjs.remove(t.target,"mouseup",t.onPointerUp)),n&&r){if(a>=r){u.state=t.gesture;for(var s in t.tracker)break;var v=t.tracker[s];u.x=v.start.x,u.y=v.start.y,t.listener(i,u)}clearTimeout(o),n=r=0}};var u=e.pointerSetup(t);return u.state="dblclick",eventjs.add(t.target,"mousedown",t.onPointerDown),u},eventjs.Gesture=eventjs.Gesture||{},eventjs.Gesture._gestureHandlers=eventjs.Gesture._gestureHandlers||{},eventjs.Gesture._gestureHandlers.dbltap=e.dbltap,eventjs.Gesture._gestureHandlers.dblclick=e.dblclick,e}(eventjs.proxy),eventjs===void 0)var eventjs={};if(eventjs.proxy===void 0&&(eventjs.proxy={}),eventjs.proxy=function(e){"use strict";return e.dragElement=function(t,n){e.drag({event:n,target:t,position:"move",listener:function(e,n){t.style.left=n.x+"px",t.style.top=n.y+"px",eventjs.prevent(e)}})},e.drag=function(t){t.gesture="drag",t.onPointerDown=function(r){e.pointerStart(r,n,t)&&(t.monitor||(eventjs.add(t.doc,"mousemove",t.onPointerMove),eventjs.add(t.doc,"mouseup",t.onPointerUp))),t.onPointerMove(r,"down")},t.onPointerMove=function(r,o){if(!t.tracker)return t.onPointerDown(r);t.bbox;for(var i=r.changedTouches||e.getCoords(r),s=i.length,a=0;s>a;a++){var u=i[a],v=u.identifier||1/0,d=t.tracker[v];d&&(d.pageX=u.pageX,d.pageY=u.pageY,n.state=o||"move",n.identifier=v,n.start=d.start,n.fingers=t.fingers,"differenceFromLast"===t.position?(n.x=d.pageX-d.offsetX,n.y=d.pageY-d.offsetY,d.offsetX=d.pageX,d.offsetY=d.pageY):(n.x=d.pageX-d.offsetX,n.y=d.pageY-d.offsetY),t.listener(r,n))}},t.onPointerUp=function(r){e.pointerEnd(r,n,t,t.onPointerMove)&&(t.monitor||(eventjs.remove(t.doc,"mousemove",t.onPointerMove),eventjs.remove(t.doc,"mouseup",t.onPointerUp)))};var n=e.pointerSetup(t);return t.event?t.onPointerDown(t.event):(eventjs.add(t.target,"mousedown",t.onPointerDown),t.monitor&&(eventjs.add(t.doc,"mousemove",t.onPointerMove),eventjs.add(t.doc,"mouseup",t.onPointerUp))),n},eventjs.Gesture=eventjs.Gesture||{},eventjs.Gesture._gestureHandlers=eventjs.Gesture._gestureHandlers||{},eventjs.Gesture._gestureHandlers.drag=e.drag,e}(eventjs.proxy),eventjs===void 0)var eventjs={};if(eventjs.proxy===void 0&&(eventjs.proxy={}),eventjs.proxy=function(e){"use strict";var t=Math.PI/180,n=function(e,t){var n=0,r=0,o=0;for(var i in t){var s=t[i];s.up||(n+=s.move.x,r+=s.move.y,o++)}return e.x=n/=o,e.y=r/=o,e};return e.gesture=function(r){r.gesture=r.gesture||"gesture",r.minFingers=r.minFingers||r.fingers||2,r.onPointerDown=function(t){var i=r.fingers;if(e.pointerStart(t,o,r)&&(eventjs.add(r.doc,"mousemove",r.onPointerMove),eventjs.add(r.doc,"mouseup",r.onPointerUp)),r.fingers===r.minFingers&&i!==r.fingers){o.fingers=r.minFingers,o.scale=1,o.rotation=0,o.state="start";var s="";for(var a in r.tracker)s+=a;o.identifier=parseInt(s),n(o,r.tracker),r.listener(t,o)}},r.onPointerMove=function(i){for(var s=r.bbox,a=r.tracker,u=i.changedTouches||e.getCoords(i),v=u.length,d=0;v>d;d++){var c=u[d],f=c.identifier||1/0,l=a[f];l&&(l.move.x=c.pageX-s.x1,l.move.y=c.pageY-s.y1)}if(!(r.fingers<r.minFingers)){var u=[],p=0,g=0;n(o,a);for(var f in a){var c=a[f];if(!c.up){var m=c.start;if(!m.distance){var j=m.x-o.x,y=m.y-o.y;m.distance=Math.sqrt(j*j+y*y),m.angle=Math.atan2(j,y)/t}var j=c.move.x-o.x,y=c.move.y-o.y,h=Math.sqrt(j*j+y*y);p+=h/m.distance;var w=Math.atan2(j,y)/t,x=(m.angle-w+360)%360-180;c.DEG2=c.DEG1,c.DEG1=x>0?x:-x,c.DEG2!==void 0&&(x>0?c.rotation+=c.DEG1-c.DEG2:c.rotation-=c.DEG1-c.DEG2,g+=c.rotation),u.push(c.move)}}o.touches=u,o.fingers=r.fingers,o.scale=p/r.fingers,o.rotation=g/r.fingers,o.state="change",r.listener(i,o)}},r.onPointerUp=function(t){var n=r.fingers;e.pointerEnd(t,o,r)&&(eventjs.remove(r.doc,"mousemove",r.onPointerMove),eventjs.remove(r.doc,"mouseup",r.onPointerUp)),n===r.minFingers&&r.fingers<r.minFingers&&(o.fingers=r.fingers,o.state="end",r.listener(t,o))};var o=e.pointerSetup(r);return eventjs.add(r.target,"mousedown",r.onPointerDown),o},eventjs.Gesture=eventjs.Gesture||{},eventjs.Gesture._gestureHandlers=eventjs.Gesture._gestureHandlers||{},eventjs.Gesture._gestureHandlers.gesture=e.gesture,e}(eventjs.proxy),eventjs===void 0)var eventjs={};if(eventjs.proxy===void 0&&(eventjs.proxy={}),eventjs.proxy=function(e){"use strict";return e.pointerdown=e.pointermove=e.pointerup=function(t){if(t.gesture=t.gesture||"pointer",!t.target.isPointerEmitter){var n=!0;t.onPointerDown=function(e){n=!1,r.gesture="pointerdown",t.listener(e,r)},t.onPointerMove=function(e){r.gesture="pointermove",t.listener(e,r,n)},t.onPointerUp=function(e){n=!0,r.gesture="pointerup",t.listener(e,r,!0)};var r=e.pointerSetup(t);return eventjs.add(t.target,"mousedown",t.onPointerDown),eventjs.add(t.target,"mousemove",t.onPointerMove),eventjs.add(t.doc,"mouseup",t.onPointerUp),t.target.isPointerEmitter=!0,r}},eventjs.Gesture=eventjs.Gesture||{},eventjs.Gesture._gestureHandlers=eventjs.Gesture._gestureHandlers||{},eventjs.Gesture._gestureHandlers.pointerdown=e.pointerdown,eventjs.Gesture._gestureHandlers.pointermove=e.pointermove,eventjs.Gesture._gestureHandlers.pointerup=e.pointerup,e}(eventjs.proxy),eventjs===void 0)var eventjs={};if(eventjs.proxy===void 0&&(eventjs.proxy={}),eventjs.proxy=function(e){"use strict";return e.shake=function(e){var t={gesture:"devicemotion",acceleration:{},accelerationIncludingGravity:{},target:e.target,listener:e.listener,remove:function(){window.removeEventListener("devicemotion",v,!1)}},n=4,r=1e3,o=200,i=3,s=(new Date).getTime(),a={x:0,y:0,z:0},u={x:{count:0,value:0},y:{count:0,value:0},z:{count:0,value:0}},v=function(v){var d=.8,c=v.accelerationIncludingGravity;if(a.x=d*a.x+(1-d)*c.x,a.y=d*a.y+(1-d)*c.y,a.z=d*a.z+(1-d)*c.z,t.accelerationIncludingGravity=a,t.acceleration.x=c.x-a.x,t.acceleration.y=c.y-a.y,t.acceleration.z=c.z-a.z,"devicemotion"===e.gesture)return e.listener(v,t),void 0;for(var f="xyz",l=(new Date).getTime(),p=0,g=f.length;g>p;p++){var m=f[p],j=t.acceleration[m],y=u[m],h=Math.abs(j);if(!(r>l-s)&&h>n){var w=l*j/h,x=Math.abs(w+y.value);y.value&&o>x?(y.value=w,y.count++,y.count===i&&(e.listener(v,t),s=l,y.value=0,y.count=0)):(y.value=w,y.count=1)}}};return window.addEventListener?(window.addEventListener("devicemotion",v,!1),t):void 0},eventjs.Gesture=eventjs.Gesture||{},eventjs.Gesture._gestureHandlers=eventjs.Gesture._gestureHandlers||{},eventjs.Gesture._gestureHandlers.shake=e.shake,e}(eventjs.proxy),eventjs===void 0)var eventjs={};if(eventjs.proxy===void 0&&(eventjs.proxy={}),eventjs.proxy=function(e){"use strict";var t=Math.PI/180;return e.swipe=function(n){n.snap=n.snap||90,n.threshold=n.threshold||1,n.gesture=n.gesture||"swipe",n.onPointerDown=function(t){e.pointerStart(t,r,n)&&(eventjs.add(n.doc,"mousemove",n.onPointerMove).listener(t),eventjs.add(n.doc,"mouseup",n.onPointerUp))},n.onPointerMove=function(t){for(var r=t.changedTouches||e.getCoords(t),o=r.length,i=0;o>i;i++){var s=r[i],a=s.identifier||1/0,u=n.tracker[a];u&&(u.move.x=s.pageX,u.move.y=s.pageY,u.moveTime=(new Date).getTime())}},n.onPointerUp=function(o){if(e.pointerEnd(o,r,n)){eventjs.remove(n.doc,"mousemove",n.onPointerMove),eventjs.remove(n.doc,"mouseup",n.onPointerUp);var i,s,a,u,v={x:0,y:0},d=0,c=0,f=0;for(var l in n.tracker){var p=n.tracker[l],g=p.move.x-p.start.x,m=p.move.y-p.start.y;d+=p.move.x,c+=p.move.y,v.x+=p.start.x,v.y+=p.start.y,f++;var j=Math.sqrt(g*g+m*m),y=p.moveTime-p.startTime,u=Math.atan2(g,m)/t+180,s=y?j/y:0;if(a===void 0)a=u,i=s;else{if(!(20>=Math.abs(u-a)))return;a=(a+u)/2,i=(i+s)/2}}var h=n.gestureFingers;h>=n.minFingers&&n.maxFingers>=h&&i>n.threshold&&(v.x/=f,v.y/=f,r.start=v,r.x=d/f,r.y=c/f,r.angle=-(((a/n.snap+.5>>0)*n.snap||360)-360),r.velocity=i,r.fingers=h,r.state="swipe",n.listener(o,r))}};var r=e.pointerSetup(n);return eventjs.add(n.target,"mousedown",n.onPointerDown),r},eventjs.Gesture=eventjs.Gesture||{},eventjs.Gesture._gestureHandlers=eventjs.Gesture._gestureHandlers||{},eventjs.Gesture._gestureHandlers.swipe=e.swipe,e}(eventjs.proxy),eventjs===void 0)var eventjs={};if(eventjs.proxy===void 0&&(eventjs.proxy={}),eventjs.proxy=function(e){"use strict";return e.longpress=function(t){return t.gesture="longpress",e.tap(t)},e.tap=function(t){t.delay=t.delay||500,t.timeout=t.timeout||250,t.driftDeviance=t.driftDeviance||10,t.gesture=t.gesture||"tap";var n,r;t.onPointerDown=function(i){if(e.pointerStart(i,o,t)){if(n=(new Date).getTime(),eventjs.add(t.doc,"mousemove",t.onPointerMove).listener(i),eventjs.add(t.doc,"mouseup",t.onPointerUp),"longpress"!==t.gesture)return;r=setTimeout(function(){if(!(i.cancelBubble&&++i.cancelBubbleCount>1)){var e=0;for(var n in t.tracker){var r=t.tracker[n];if(r.end===!0)return;if(t.cancel)return;e++}e>=t.minFingers&&t.maxFingers>=e&&(o.state="start",o.fingers=e,o.x=r.start.x,o.y=r.start.y,t.listener(i,o))}},t.delay)}},t.onPointerMove=function(n){for(var r=t.bbox,o=n.changedTouches||e.getCoords(n),i=o.length,s=0;i>s;s++){var a=o[s],u=a.identifier||1/0,v=t.tracker[u];if(v){var d=a.pageX-r.x1,c=a.pageY-r.y1,f=d-v.start.x,l=c-v.start.y,p=Math.sqrt(f*f+l*l);if(!(d>0&&r.width>d&&c>0&&r.height>c&&t.driftDeviance>=p))return eventjs.remove(t.doc,"mousemove",t.onPointerMove),t.cancel=!0,void 0}}},t.onPointerUp=function(i){if(e.pointerEnd(i,o,t)){if(clearTimeout(r),eventjs.remove(t.doc,"mousemove",t.onPointerMove),eventjs.remove(t.doc,"mouseup",t.onPointerUp),i.cancelBubble&&++i.cancelBubbleCount>1)return;if("longpress"===t.gesture)return"start"===o.state&&(o.state="end",t.listener(i,o)),void 0;if(t.cancel)return;if((new Date).getTime()-n>t.timeout)return;var s=t.gestureFingers;s>=t.minFingers&&t.maxFingers>=s&&(o.state="tap",o.fingers=t.gestureFingers,t.listener(i,o))}};var o=e.pointerSetup(t);return eventjs.add(t.target,"mousedown",t.onPointerDown),o},eventjs.Gesture=eventjs.Gesture||{},eventjs.Gesture._gestureHandlers=eventjs.Gesture._gestureHandlers||{},eventjs.Gesture._gestureHandlers.tap=e.tap,eventjs.Gesture._gestureHandlers.longpress=e.longpress,e}(eventjs.proxy),eventjs===void 0)var eventjs={};eventjs.proxy===void 0&&(eventjs.proxy={}),eventjs.proxy=function(e){"use strict";return e.wheelPreventElasticBounce=function(e){e&&("string"==typeof e&&(e=document.querySelector(e)),eventjs.add(e,"wheel",function(e,t){t.preventElasticBounce(),eventjs.stop(e)}))},e.wheel=function(e){var t,n=e.timeout||150,r=0,o={gesture:"wheel",state:"start",wheelDelta:0,target:e.target,listener:e.listener,preventElasticBounce:function(e){var t=this.target,n=t.scrollTop,r=n+t.offsetHeight,o=t.scrollHeight;r===o&&0>=this.wheelDelta?eventjs.cancel(e):0===n&&this.wheelDelta>=0&&eventjs.cancel(e),eventjs.stop(e)},add:function(){e.target[s](u,i,!1)},remove:function(){e.target[a](u,i,!1)}},i=function(i){i=i||window.event,o.state=r++?"change":"start",o.wheelDelta=i.detail?-20*i.detail:i.wheelDelta,e.listener(i,o),clearTimeout(t),t=setTimeout(function(){r=0,o.state="end",o.wheelDelta=0,e.listener(i,o)},n)},s=document.addEventListener?"addEventListener":"attachEvent",a=document.removeEventListener?"removeEventListener":"detachEvent",u=eventjs.getEventSupport("mousewheel")?"mousewheel":"DOMMouseScroll";return e.target[s](u,i,!1),o},eventjs.Gesture=eventjs.Gesture||{},eventjs.Gesture._gestureHandlers=eventjs.Gesture._gestureHandlers||{},eventjs.Gesture._gestureHandlers.wheel=e.wheel,e}(eventjs.proxy);

/*!
 * jQuery Transit - CSS3 transitions and transformations
 * (c) 2011-2012 Rico Sta. Cruz <rico@ricostacruz.com>
 * MIT Licensed.
 *
 * http://ricostacruz.com/jquery.transit
 * http://github.com/rstacruz/jquery.transit
 */
(function(k){k.transit={version:"0.9.9",propertyMap:{marginLeft:"margin",marginRight:"margin",marginBottom:"margin",marginTop:"margin",paddingLeft:"padding",paddingRight:"padding",paddingBottom:"padding",paddingTop:"padding"},enabled:true,useTransitionEnd:false};var d=document.createElement("div");var q={};function b(v){if(v in d.style){return v}var u=["Moz","Webkit","O","ms"];var r=v.charAt(0).toUpperCase()+v.substr(1);if(v in d.style){return v}for(var t=0;t<u.length;++t){var s=u[t]+r;if(s in d.style){return s}}}function e(){d.style[q.transform]="";d.style[q.transform]="rotateY(90deg)";return d.style[q.transform]!==""}var a=navigator.userAgent.toLowerCase().indexOf("chrome")>-1;q.transition=b("transition");q.transitionDelay=b("transitionDelay");q.transform=b("transform");q.transformOrigin=b("transformOrigin");q.transform3d=e();var i={transition:"transitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd",WebkitTransition:"webkitTransitionEnd",msTransition:"MSTransitionEnd"};var f=q.transitionEnd=i[q.transition]||null;for(var p in q){if(q.hasOwnProperty(p)&&typeof k.support[p]==="undefined"){k.support[p]=q[p]}}d=null;k.cssEase={_default:"ease","in":"ease-in",out:"ease-out","in-out":"ease-in-out",snap:"cubic-bezier(0,1,.5,1)",easeOutCubic:"cubic-bezier(.215,.61,.355,1)",easeInOutCubic:"cubic-bezier(.645,.045,.355,1)",easeInCirc:"cubic-bezier(.6,.04,.98,.335)",easeOutCirc:"cubic-bezier(.075,.82,.165,1)",easeInOutCirc:"cubic-bezier(.785,.135,.15,.86)",easeInExpo:"cubic-bezier(.95,.05,.795,.035)",easeOutExpo:"cubic-bezier(.19,1,.22,1)",easeInOutExpo:"cubic-bezier(1,0,0,1)",easeInQuad:"cubic-bezier(.55,.085,.68,.53)",easeOutQuad:"cubic-bezier(.25,.46,.45,.94)",easeInOutQuad:"cubic-bezier(.455,.03,.515,.955)",easeInQuart:"cubic-bezier(.895,.03,.685,.22)",easeOutQuart:"cubic-bezier(.165,.84,.44,1)",easeInOutQuart:"cubic-bezier(.77,0,.175,1)",easeInQuint:"cubic-bezier(.755,.05,.855,.06)",easeOutQuint:"cubic-bezier(.23,1,.32,1)",easeInOutQuint:"cubic-bezier(.86,0,.07,1)",easeInSine:"cubic-bezier(.47,0,.745,.715)",easeOutSine:"cubic-bezier(.39,.575,.565,1)",easeInOutSine:"cubic-bezier(.445,.05,.55,.95)",easeInBack:"cubic-bezier(.6,-.28,.735,.045)",easeOutBack:"cubic-bezier(.175, .885,.32,1.275)",easeInOutBack:"cubic-bezier(.68,-.55,.265,1.55)"};k.cssHooks["transit:transform"]={get:function(r){return k(r).data("transform")||new j()},set:function(s,r){var t=r;if(!(t instanceof j)){t=new j(t)}if(q.transform==="WebkitTransform"&&!a){s.style[q.transform]=t.toString(true)}else{s.style[q.transform]=t.toString()}k(s).data("transform",t)}};k.cssHooks.transform={set:k.cssHooks["transit:transform"].set};if(k.fn.jquery<"1.8"){k.cssHooks.transformOrigin={get:function(r){return r.style[q.transformOrigin]},set:function(r,s){r.style[q.transformOrigin]=s}};k.cssHooks.transition={get:function(r){return r.style[q.transition]},set:function(r,s){r.style[q.transition]=s}}}n("scale");n("translate");n("rotate");n("rotateX");n("rotateY");n("rotate3d");n("perspective");n("skewX");n("skewY");n("x",true);n("y",true);function j(r){if(typeof r==="string"){this.parse(r)}return this}j.prototype={setFromString:function(t,s){var r=(typeof s==="string")?s.split(","):(s.constructor===Array)?s:[s];r.unshift(t);j.prototype.set.apply(this,r)},set:function(s){var r=Array.prototype.slice.apply(arguments,[1]);if(this.setter[s]){this.setter[s].apply(this,r)}else{this[s]=r.join(",")}},get:function(r){if(this.getter[r]){return this.getter[r].apply(this)}else{return this[r]||0}},setter:{rotate:function(r){this.rotate=o(r,"deg")},rotateX:function(r){this.rotateX=o(r,"deg")},rotateY:function(r){this.rotateY=o(r,"deg")},scale:function(r,s){if(s===undefined){s=r}this.scale=r+","+s},skewX:function(r){this.skewX=o(r,"deg")},skewY:function(r){this.skewY=o(r,"deg")},perspective:function(r){this.perspective=o(r,"px")},x:function(r){this.set("translate",r,null)},y:function(r){this.set("translate",null,r)},translate:function(r,s){if(this._translateX===undefined){this._translateX=0}if(this._translateY===undefined){this._translateY=0}if(r!==null&&r!==undefined){this._translateX=o(r,"px")}if(s!==null&&s!==undefined){this._translateY=o(s,"px")}this.translate=this._translateX+","+this._translateY}},getter:{x:function(){return this._translateX||0},y:function(){return this._translateY||0},scale:function(){var r=(this.scale||"1,1").split(",");if(r[0]){r[0]=parseFloat(r[0])}if(r[1]){r[1]=parseFloat(r[1])}return(r[0]===r[1])?r[0]:r},rotate3d:function(){var t=(this.rotate3d||"0,0,0,0deg").split(",");for(var r=0;r<=3;++r){if(t[r]){t[r]=parseFloat(t[r])}}if(t[3]){t[3]=o(t[3],"deg")}return t}},parse:function(s){var r=this;s.replace(/([a-zA-Z0-9]+)\((.*?)\)/g,function(t,v,u){r.setFromString(v,u)})},toString:function(t){var s=[];for(var r in this){if(this.hasOwnProperty(r)){if((!q.transform3d)&&((r==="rotateX")||(r==="rotateY")||(r==="perspective")||(r==="transformOrigin"))){continue}if(r[0]!=="_"){if(t&&(r==="scale")){s.push(r+"3d("+this[r]+",1)")}else{if(t&&(r==="translate")){s.push(r+"3d("+this[r]+",0)")}else{s.push(r+"("+this[r]+")")}}}}}return s.join(" ")}};function m(s,r,t){if(r===true){s.queue(t)}else{if(r){s.queue(r,t)}else{t()}}}function h(s){var r=[];k.each(s,function(t){t=k.camelCase(t);t=k.transit.propertyMap[t]||k.cssProps[t]||t;t=c(t);if(k.inArray(t,r)===-1){r.push(t)}});return r}function g(s,v,x,r){var t=h(s);if(k.cssEase[x]){x=k.cssEase[x]}var w=""+l(v)+" "+x;if(parseInt(r,10)>0){w+=" "+l(r)}var u=[];k.each(t,function(z,y){u.push(y+" "+w)});return u.join(", ")}k.fn.transition=k.fn.transit=function(z,s,y,C){var D=this;var u=0;var w=true;if(typeof s==="function"){C=s;s=undefined}if(typeof y==="function"){C=y;y=undefined}if(typeof z.easing!=="undefined"){y=z.easing;delete z.easing}if(typeof z.duration!=="undefined"){s=z.duration;delete z.duration}if(typeof z.complete!=="undefined"){C=z.complete;delete z.complete}if(typeof z.queue!=="undefined"){w=z.queue;delete z.queue}if(typeof z.delay!=="undefined"){u=z.delay;delete z.delay}if(typeof s==="undefined"){s=k.fx.speeds._default}if(typeof y==="undefined"){y=k.cssEase._default}s=l(s);var E=g(z,s,y,u);var B=k.transit.enabled&&q.transition;var t=B?(parseInt(s,10)+parseInt(u,10)):0;if(t===0){var A=function(F){D.css(z);if(C){C.apply(D)}if(F){F()}};m(D,w,A);return D}var x={};var r=function(H){var G=false;var F=function(){if(G){D.unbind(f,F)}if(t>0){D.each(function(){this.style[q.transition]=(x[this]||null)})}if(typeof C==="function"){C.apply(D)}if(typeof H==="function"){H()}};if((t>0)&&(f)&&(k.transit.useTransitionEnd)){G=true;D.bind(f,F)}else{window.setTimeout(F,t)}D.each(function(){if(t>0){this.style[q.transition]=E}k(this).css(z)})};var v=function(F){this.offsetWidth;r(F)};m(D,w,v);return this};function n(s,r){if(!r){k.cssNumber[s]=true}k.transit.propertyMap[s]=q.transform;k.cssHooks[s]={get:function(v){var u=k(v).css("transit:transform");return u.get(s)},set:function(v,w){var u=k(v).css("transit:transform");u.setFromString(s,w);k(v).css({"transit:transform":u})}}}function c(r){return r.replace(/([A-Z])/g,function(s){return"-"+s.toLowerCase()})}function o(s,r){if((typeof s==="string")&&(!s.match(/^[\-0-9\.]+$/))){return s}else{return""+s+r}}function l(s){var r=s;if(k.fx.speeds[r]){r=k.fx.speeds[r]}return o(r,"ms")}k.transit.getTransitionValue=g})($);

// if (!$.support.transition) $.fn.transition = $.fn.animate;
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
    eventjs.add(this.element, "mousedown", this.record);
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
    eventjs.remove(this.element, "mousedown", this.record);
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
    eventjs.proxy.drag({
      event: event,
      target: layer2,
      listener: function (event, self) {
        eventjs.cancel(event);
        var coords = {};
        coords.x = (self.x) * 1 / that.zoom;
        coords.y = (self.y) * 1 / that.zoom;
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

// jGlow
(function(e){var t=function(){return!1===e.support.boxModel&&e.support.objectAll&&e.support.leadingWhitespace}();e.jGrowl=function(t,i){0==e("#jGrowl").size()&&e('<div id="jGrowl"></div>').addClass(i&&i.position?i.position:e.jGrowl.defaults.position).appendTo("body"),e("#jGrowl").jGrowl(t,i)},e.fn.jGrowl=function(t,i){if(e.isFunction(this.each)){var o=arguments;return this.each(function(){void 0==e(this).data("jGrowl.instance")&&(e(this).data("jGrowl.instance",e.extend(new e.fn.jGrowl,{notifications:[],element:null,interval:null})),e(this).data("jGrowl.instance").startup(this)),e.isFunction(e(this).data("jGrowl.instance")[t])?e(this).data("jGrowl.instance")[t].apply(e(this).data("jGrowl.instance"),e.makeArray(o).slice(1)):e(this).data("jGrowl.instance").create(t,i)})}},e.extend(e.fn.jGrowl.prototype,{defaults:{pool:0,header:"",group:"",sticky:!1,position:"top-right",glue:"after",theme:"default",themeState:"highlight",corners:"5px",check:250,life:3000,closeDuration:"normal",openDuration:"normal",easing:"swing",closer:!0,closeTemplate:"&times;",closerTemplate:"<div> close all </div>",log:function(){},beforeOpen:function(){},afterOpen:function(){},open:function(){},beforeClose:function(){},close:function(){},animateOpen:{opacity:"show"},animateClose:{opacity:"hide"}},notifications:[],element:null,interval:null,create:function(t,i){var i=e.extend({},this.defaults,i);i.speed!==void 0&&(i.openDuration=i.speed,i.closeDuration=i.speed),this.notifications.push({message:t,options:i}),i.log.apply(this.element,[this.element,t,i])},render:function(t){var i=this,o=t.message,n=t.options;n.themeState=""==n.themeState?"":"ui-state-"+n.themeState;var t=e("<div/>").addClass("jGrowl-notification "+n.themeState+" ui-corner-all"+(void 0!=n.group&&""!=n.group?" "+n.group:"")).append(e("<div/>").addClass("jGrowl-close").html(n.closeTemplate)).append(e("<div/>").addClass("jGrowl-header").html(n.header)).append(e("<div/>").addClass("jGrowl-message").html(o)).data("jGrowl",n).addClass(n.theme).children("div.jGrowl-close").bind("click.jGrowl",function(){e(this).parent().trigger("jGrowl.beforeClose")}).parent();e(t).bind("mouseover.jGrowl",function(){e("div.jGrowl-notification",i.element).data("jGrowl.pause",!0)}).bind("mouseout.jGrowl",function(){e("div.jGrowl-notification",i.element).data("jGrowl.pause",!1)}).bind("jGrowl.beforeOpen",function(){n.beforeOpen.apply(t,[t,o,n,i.element])!==!1&&e(this).trigger("jGrowl.open")}).bind("jGrowl.open",function(){n.open.apply(t,[t,o,n,i.element])!==!1&&("after"==n.glue?e("div.jGrowl-notification:last",i.element).after(t):e("div.jGrowl-notification:first",i.element).before(t),e(this).animate(n.animateOpen,n.openDuration,n.easing,function(){e.support.opacity===!1&&this.style.removeAttribute("filter"),null!==e(this).data("jGrowl")&&(e(this).data("jGrowl").created=new Date),e(this).trigger("jGrowl.afterOpen")}))}).bind("jGrowl.afterOpen",function(){n.afterOpen.apply(t,[t,o,n,i.element])}).bind("jGrowl.beforeClose",function(){n.beforeClose.apply(t,[t,o,n,i.element])!==!1&&e(this).trigger("jGrowl.close")}).bind("jGrowl.close",function(){e(this).data("jGrowl.pause",!0),e(this).animate(n.animateClose,n.closeDuration,n.easing,function(){e.isFunction(n.close)?n.close.apply(t,[t,o,n,i.element])!==!1&&e(this).remove():e(this).remove()})}).trigger("jGrowl.beforeOpen"),""!=n.corners&&void 0!=e.fn.corner&&e(t).corner(n.corners),e("div.jGrowl-notification:parent",i.element).size()>1&&0==e("div.jGrowl-closer",i.element).size()&&this.defaults.closer!==!1&&e(this.defaults.closerTemplate).addClass("jGrowl-closer "+this.defaults.themeState+" ui-corner-all").addClass(this.defaults.theme).appendTo(i.element).animate(this.defaults.animateOpen,this.defaults.speed,this.defaults.easing).bind("click.jGrowl",function(){e(this).siblings().trigger("jGrowl.beforeClose"),e.isFunction(i.defaults.closer)&&i.defaults.closer.apply(e(this).parent()[0],[e(this).parent()[0]])})},update:function(){e(this.element).find("div.jGrowl-notification:parent").each(function(){void 0!=e(this).data("jGrowl")&&void 0!==e(this).data("jGrowl").created&&e(this).data("jGrowl").created.getTime()+parseInt(e(this).data("jGrowl").life)<(new Date).getTime()&&e(this).data("jGrowl").sticky!==!0&&(void 0==e(this).data("jGrowl.pause")||e(this).data("jGrowl.pause")!==!0)&&e(this).trigger("jGrowl.beforeClose")}),this.notifications.length>0&&(0==this.defaults.pool||e(this.element).find("div.jGrowl-notification:parent").size()<this.defaults.pool)&&this.render(this.notifications.shift()),2>e(this.element).find("div.jGrowl-notification:parent").size()&&e(this.element).find("div.jGrowl-closer").animate(this.defaults.animateClose,this.defaults.speed,this.defaults.easing,function(){e(this).remove()})},startup:function(i){this.element=e(i).addClass("jGrowl").append('<div class="jGrowl-notification"></div>'),this.interval=setInterval(function(){e(i).data("jGrowl.instance").update()},parseInt(this.defaults.check)),t&&e(this.element).addClass("ie6")},shutdown:function(){e(this.element).removeClass("jGrowl").find("div.jGrowl-notification").trigger("jGrowl.close").parent().empty(),clearInterval(this.interval)},close:function(){e(this.element).find("div.jGrowl-notification").each(function(){e(this).trigger("jGrowl.beforeClose")})}}),e.jGrowl.defaults=e.fn.jGrowl.prototype.defaults})($);

// jquery.event.drag
//http://threedubmedia.com/code/event/drag

(function (f) {
    f.fn.drag = function (k, e, j) {
        var i = typeof k == "string" ? k : "",
            h = $.isFunction(k) ? k : $.isFunction(e) ? e : null;
        if (i.indexOf("drag") !== 0) {
            i = "drag" + i
        }
        j = (k == h ? e : j) || {};
        return h ? this.bind(i, j, h) : this.trigger(i)
    };
    var b = $.event,
        a = b.special,
        d = a.drag = {
            defaults: {
                which: 1,
                distance: 5,
                not: ".editNoDrag",
                handle: null,
                relative: false,
                drop: true,
                click: false
            },
            datakey: "dragdata",
            noBubble: true,
            add: function (i) {
                var h = $.data(this, d.datakey),
                    e = i.data || {};
                h.related += 1;
                $.each(d.defaults, function (j, k) {
                    if (e[j] !== undefined) {
                        h[j] = e[j]
                    }
                })
            },
            remove: function () {
                $.data(this, d.datakey).related -= 1
            },
            setup: function () {
                if ($.data(this, d.datakey)) {
                    return
                }
                var e = $.extend({
                    related: 0
                }, d.defaults);
                $.data(this, d.datakey, e);
                b.add(this, "touchstart mousedown pointerdown", d.init, e);
                if (this.attachEvent) {
                    this.attachEvent("ondragstart", d.dontstart)
                }
            },
            teardown: function () {
                var e = $.data(this, d.datakey) || {};
                if (e.related) {
                    return
                }
                $.removeData(this, d.datakey);
                b.remove(this, "touchstart mousedown pointerdown", d.init);
                d.textselect(true);
                if (this.detachEvent) {
                    this.detachEvent("ondragstart", d.dontstart)
                }
            },
            init: function (i) {
                if (d.touched) {
                    return
                }
                var e = i.data,
                    h;
                if (i.which != 0 && e.which > 0 && i.which != e.which) {
                    return
                }
                if ($(i.target).is(e.not)) {
                    return
                }
                if (e.handle && !$(i.target).closest(e.handle, i.currentTarget).length) {
                    return
                }
                d.touched = (i.type == 'touchstart' || i.type == 'pointerdown') ? this : null;
                d.touchedpointer = i.type == 'pointerdown';
                e.propagates = 1;
                e.mousedown = this;
                e.interactions = [d.interaction(this, e)];
                e.target = i.target;
                e.pageX = i.pageX;
                e.pageY = i.pageY;
                e.dragging = null;
                h = d.hijack(i, "draginit", e);
                if (!e.propagates) {
                    return
                }
                h = d.flatten(h);
                if (h && h.length) {
                    e.interactions = [];
                    $.each(h, function () {
                        e.interactions.push(d.interaction(this, e))
                    })
                }
                e.propagates = e.interactions.length;
                if (e.drop !== false && a.drop) {
                    a.drop.handler(i, e)
                }
                d.textselect(false);
               if ( d.touchedpointer ) {
                  b.add( document, "pointermove pointerup pointercancel", d.handler, e);
               } else if (d.touched) {
                  b.add(d.touched, "touchmove touchend", d.handler, e);
               } else {
                  b.add(document, "mousemove mouseup", d.handler, e)
                }  if (!d.touched || e.live) {
                              return false
                }
            },
            interaction: function (h, e) {
                var i = $(h)[e.relative ? "position" : "offset"]() || {
                    top: 0,
                    left: 0
                };
                return {
                    drag: h,
                    callback: new d.callback(),
                    droppable: [],
                    offset: i
                }
            },
            handler: function (h) {
                var e = h.data;
                switch (h.type) {
                case !e.dragging && "touchmove":
                case !e.dragging && "pointermove":
                    h.preventDefault();
                case !e.dragging && "mousemove":
                    if (Math.pow(h.pageX - e.pageX, 2) + Math.pow(h.pageY - e.pageY, 2) < Math.pow(e.distance, 2)) {
                        break
                    }
                    h.target = e.target;
                    d.hijack(h, "dragstart", e);
                    if (e.propagates) {
                        e.dragging = true
                    }
                case "touchmove":
                case "pointermove":
                    h.preventDefault();
                case "mousemove":
                    if (e.dragging) {
                        d.hijack(h, "drag", e);
                        if (e.propagates) {
                            if (e.drop !== false && a.drop) {
                                a.drop.handler(h, e)
                            }
                            break
                        }
                        h.type = "mouseup"
                    }
                case "pointercancel":
                case "pointerup":                
                case "touchend":
                case "mouseup":
                default:

        if ( d.touchedpointer ) {
            b.remove( document, "pointermove pointerup pointercancel", d.handler ); // remove touch events
          } else if ( d.touched && !d.touchedpointer ) {
            b.remove( d.touched, "touchmove touchend", d.handler ); // remove touch events
         } else {
            b.remove( document, "mousemove mouseup", d.handler ); // remove page events 
         } if (e.dragging) {
                        if (e.drop !== false && a.drop) {
                            a.drop.handler(h, e)
                        }
                        d.hijack(h, "dragend", e)
                    }
                    d.textselect(true);
                    if (e.click === false && e.dragging) {
                        $.data(e.mousedown, "suppress.click", new Date().getTime() + 5)
                    }
                    e.dragging = d.touched = d.touchedpointer = false; // deactivate element
                    break
                }
            },
            hijack: function (h, o, r, p, k) {
                if (!r) {
                    return
                }
                var q = {
                        event: h.originalEvent,
                        type: h.type
                    },
                    m = o.indexOf("drop") ? "drag" : "drop",
                    t, l = p || 0,
                    j, e, s, n = !isNaN(p) ? p : r.interactions.length;
                h.type = o;
                h.originalEvent = null;
                r.results = [];
                do {
                    if (j = r.interactions[l]) {
                        if (o !== "dragend" && j.cancelled) {
                            continue
                        }
                        s = d.properties(h, r, j);
                        j.results = [];
                        $(k || j[m] || r.droppable).each(function (u, i) {
                            s.target = i;
                            h.isPropagationStopped = function () {
                                return false
                            };
                            t = i ? b.dispatch.call(i, h, s) : null;
                            if (t === false) {
                                if (m == "drag") {
                                    j.cancelled = true;
                                    r.propagates -= 1
                                }
                                if (o == "drop") {
                                    j[m][u] = null
                                }
                            } else {
                                if (o == "dropinit") {
                                    j.droppable.push(d.element(t) || i)
                                }
                            } if (o == "dragstart") {
                                j.proxy = $(d.element(t) || j.drag)[0]
                            }
                            j.results.push(t);
                            delete h.result;
                            if (o !== "dropinit") {
                                return t
                            }
                        });
                        r.results[l] = d.flatten(j.results);
                        if (o == "dropinit") {
                            j.droppable = d.flatten(j.droppable)
                        }
                        if (o == "dragstart" && !j.cancelled) {
                            s.update()
                        }
                    }
                } while (++l < n);
                h.type = q.type;
                h.originalEvent = q.event;
                return d.flatten(r.results)
            },
            properties: function (i, e, h) {
                var j = h.callback;
                j.drag = h.drag;
                j.proxy = h.proxy || h.drag;
                j.startX = e.pageX;
                j.startY = e.pageY;
                j.deltaX = i.pageX - e.pageX;
                j.deltaY = i.pageY - e.pageY;
                j.originalX = h.offset.left;
                j.originalY = h.offset.top;
                j.offsetX = j.originalX + j.deltaX;
                j.offsetY = j.originalY + j.deltaY;
                j.drop = d.flatten((h.drop || []).slice());
                j.available = d.flatten((h.droppable || []).slice());
                return j
            },
            element: function (e) {
                if (e && (e.jquery || e.nodeType == 1)) {
                    return e
                }
            },
            flatten: function (e) {
                return $.map(e, function (h) {
                    return h && h.jquery ? $.makeArray(h) : h && h.length ? d.flatten(h) : h
                })
            },
            textselect: function (e) {
                $(document)[e ? "unbind" : "bind"]("selectstart", d.dontstart).css("MozUserSelect", e ? "" : "none");
                document.unselectable = e ? "off" : "on"
            },
            dontstart: function () {
                return false
            },
            callback: function () {}
        };
    d.callback.prototype = {
        update: function () {
            if (a.drop && this.available.length) {
                $.each(this.available, function (e) {
                    a.drop.locate(this, e)
                })
            }
        }
    };
    var g = b.dispatch;
    b.dispatch = function (e) {
        if ($.data(this, "suppress." + e.type) - new Date().getTime() > 0) {
            $.removeData(this, "suppress." + e.type);
            return
        }
        return g.apply(this, arguments)
    };
    var pointerHooks = b.fixHooks.pointermove = b.fixHooks.pointerup = b.fixHooks.pointerdown = {
      props: "clientX clientY pageX pageY screenX screenY".split( " " ),
      filter: function( event, orig ) {
        if ( orig ){
          $.each( pointerHooks.props, function( i, prop ){
            event[ prop ] = orig[ prop ];
          });
        }
        return event;
      }
    };
    var c = b.fixHooks.touchstart = b.fixHooks.touchmove = b.fixHooks.touchend = b.fixHooks.touchcancel = {
        props: "clientX clientY pageX pageY screenX screenY".split(" "),
        filter: function (h, i) {
            if (i) {
                var e = (i.touches && i.touches[0]) || (i.changedTouches && i.changedTouches[0]) || null;
                if (e) {
                    $.each(c.props, function (j, k) {
                        h[k] = e[k]
                    })
                }
            }
            return h
        }
    };
    a.draginit = a.dragstart = a.dragend = d
})($);

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
 (function(c,b,q){var a=a||function(k){var f={element:null,dragger:null,disable:"none",addBodyClasses:true,hyperextensible:true,resistance:0.5,flickThreshold:50,transitionSpeed:0.3,easing:"ease",maxPosition:266,minPosition:-266,tapToClose:true,touchToDrag:true,slideIntent:40,minDragDistance:5},e={simpleStates:{opening:null,towards:null,hyperExtending:null,halfway:null,flick:null,translation:{absolute:0,relative:0,sinceDirectionChange:0,percentage:0}}},h={},d={hasTouch:(b.ontouchstart===null),eventType:function(m){var l={down:(d.hasTouch?"touchstart":"mousedown"),move:(d.hasTouch?"touchmove":"mousemove"),up:(d.hasTouch?"touchend":"mouseup"),out:(d.hasTouch?"touchcancel":"mouseout")};return l[m]},page:function(l,m){return(d.hasTouch&&m.touches.length&&m.touches[0])?m.touches[0]["page"+l]:m["page"+l]},klass:{has:function(m,l){return(m.className).indexOf(l)!==-1},add:function(m,l){if(!d.klass.has(m,l)&&f.addBodyClasses){m.className+=" "+l}},remove:function(m,l){if(f.addBodyClasses){m.className=(m.className).replace(l,"").replace(/^\s+|\s+$/g,"")}}},dispatchEvent:function(l){if(typeof h[l]==="function"){return h[l].call()}},vendor:function(){var m=b.createElement("div"),n="webkit Moz O ms".split(" "),l;for(l in n){if(typeof m.style[n[l]+"Transition"]!=="undefined"){return n[l]}}},transitionCallback:function(){return(e.vendor==="Moz"||e.vendor==="ms")?"transitionend":e.vendor+"TransitionEnd"},canTransform:function(){return typeof f.element.style[e.vendor+"Transform"]!=="undefined"},deepExtend:function(l,n){var m;for(m in n){if(n[m]&&n[m].constructor&&n[m].constructor===Object){l[m]=l[m]||{};d.deepExtend(l[m],n[m])}else{l[m]=n[m]}}return l},angleOfDrag:function(l,o){var n,m;m=Math.atan2(-(e.startDragY-o),(e.startDragX-l));if(m<0){m+=2*Math.PI}n=Math.floor(m*(180/Math.PI)-180);if(n<0&&n>-180){n=360-Math.abs(n)}return Math.abs(n)},events:{addEvent:function g(m,l,n){if(m.addEventListener){return m.addEventListener(l,n,false)}else{if(m.attachEvent){return m.attachEvent("on"+l,n)}}},removeEvent:function g(m,l,n){if(m.addEventListener){return m.removeEventListener(l,n,false)}else{if(m.attachEvent){return m.detachEvent("on"+l,n)}}},prevent:function(l){if(l.preventDefault){l.preventDefault()}else{l.returnValue=false}}},parentUntil:function(n,l){var m=typeof l==="string";while(n.parentNode){if(m&&n.getAttribute&&n.getAttribute(l)){return n}else{if(!m&&n===l){return n}}n=n.parentNode}return null}},i={translate:{get:{matrix:function(n){if(!d.canTransform()){return parseInt(f.element.style.left,10)}else{var m=c.getComputedStyle(f.element)[e.vendor+"Transform"].match(/\((.*)\)/),l=8;if(m){m=m[1].split(",");if(m.length===16){n+=l}return parseInt(m[n],10)}return 0}}},easeCallback:function(){f.element.style[e.vendor+"Transition"]="";e.translation=i.translate.get.matrix(4);e.easing=false;clearInterval(e.animatingInterval);if(e.easingTo===0){d.klass.remove(b.body,"snapjs-right");d.klass.remove(b.body,"snapjs-left")}d.dispatchEvent("animated");d.events.removeEvent(f.element,d.transitionCallback(),i.translate.easeCallback)},easeTo:function(l){if(!d.canTransform()){e.translation=l;i.translate.x(l)}else{e.easing=true;e.easingTo=l;f.element.style[e.vendor+"Transition"]="all "+f.transitionSpeed+"s "+f.easing;e.animatingInterval=setInterval(function(){d.dispatchEvent("animating")},1);d.events.addEvent(f.element,d.transitionCallback(),i.translate.easeCallback);i.translate.x(l)}if(l===0){f.element.style[e.vendor+"Transform"]=""}},x:function(m){if((f.disable==="left"&&m>0)||(f.disable==="right"&&m<0)){return}if(!f.hyperextensible){if(m===f.maxPosition||m>f.maxPosition){m=f.maxPosition}else{if(m===f.minPosition||m<f.minPosition){m=f.minPosition}}}m=parseInt(m,10);if(isNaN(m)){m=0}if(d.canTransform()){var l="translate3d("+m+"px, 0,0)";f.element.style[e.vendor+"Transform"]=l}else{f.element.style.width=(c.innerWidth||b.documentElement.clientWidth)+"px";f.element.style.left=m+"px";f.element.style.right=""}}},drag:{listen:function(){e.translation=0;e.easing=false;d.events.addEvent(f.element,d.eventType("down"),i.drag.startDrag);d.events.addEvent(f.element,d.eventType("move"),i.drag.dragging);d.events.addEvent(f.element,d.eventType("up"),i.drag.endDrag)},stopListening:function(){d.events.removeEvent(f.element,d.eventType("down"),i.drag.startDrag);d.events.removeEvent(f.element,d.eventType("move"),i.drag.dragging);d.events.removeEvent(f.element,d.eventType("up"),i.drag.endDrag)},startDrag:function(n){var m=n.target?n.target:n.srcElement,l=d.parentUntil(m,"data-snap-ignore");if(l){d.dispatchEvent("ignore");return}if(f.dragger){var o=d.parentUntil(m,f.dragger);if(!o&&(e.translation!==f.minPosition&&e.translation!==f.maxPosition)){return}}d.dispatchEvent("start");f.element.style[e.vendor+"Transition"]="";e.isDragging=true;e.hasIntent=null;e.intentChecked=false;e.startDragX=d.page("X",n);e.startDragY=d.page("Y",n);e.dragWatchers={current:0,last:0,hold:0,state:""};e.simpleStates={opening:null,towards:null,hyperExtending:null,halfway:null,flick:null,translation:{absolute:0,relative:0,sinceDirectionChange:0,percentage:0}}},dragging:function(s){if(e.isDragging&&f.touchToDrag){var v=d.page("X",s),u=d.page("Y",s),t=e.translation,o=i.translate.get.matrix(4),n=v-e.startDragX,p=o>0,q=n,w;if((e.intentChecked&&!e.hasIntent)){return}if(f.addBodyClasses){if((o)>0){d.klass.add(b.body,"snapjs-left");d.klass.remove(b.body,"snapjs-right")}else{if((o)<0){d.klass.add(b.body,"snapjs-right");d.klass.remove(b.body,"snapjs-left")}}}if(e.hasIntent===false||e.hasIntent===null){var m=d.angleOfDrag(v,u),l=(m>=0&&m<=f.slideIntent)||(m<=360&&m>(360-f.slideIntent)),r=(m>=180&&m<=(180+f.slideIntent))||(m<=180&&m>=(180-f.slideIntent));if(!r&&!l){e.hasIntent=false}else{e.hasIntent=true}e.intentChecked=true}if((f.minDragDistance>=Math.abs(v-e.startDragX))||(e.hasIntent===false)){return}d.events.prevent(s);d.dispatchEvent("drag");e.dragWatchers.current=v;if(e.dragWatchers.last>v){if(e.dragWatchers.state!=="left"){e.dragWatchers.state="left";e.dragWatchers.hold=v}e.dragWatchers.last=v}else{if(e.dragWatchers.last<v){if(e.dragWatchers.state!=="right"){e.dragWatchers.state="right";e.dragWatchers.hold=v}e.dragWatchers.last=v}}if(p){if(f.maxPosition<o){w=(o-f.maxPosition)*f.resistance;q=n-w}e.simpleStates={opening:"left",towards:e.dragWatchers.state,hyperExtending:f.maxPosition<o,halfway:o>(f.maxPosition/2),flick:Math.abs(e.dragWatchers.current-e.dragWatchers.hold)>f.flickThreshold,translation:{absolute:o,relative:n,sinceDirectionChange:(e.dragWatchers.current-e.dragWatchers.hold),percentage:(o/f.maxPosition)*100}}}else{if(f.minPosition>o){w=(o-f.minPosition)*f.resistance;q=n-w}e.simpleStates={opening:"right",towards:e.dragWatchers.state,hyperExtending:f.minPosition>o,halfway:o<(f.minPosition/2),flick:Math.abs(e.dragWatchers.current-e.dragWatchers.hold)>f.flickThreshold,translation:{absolute:o,relative:n,sinceDirectionChange:(e.dragWatchers.current-e.dragWatchers.hold),percentage:(o/f.minPosition)*100}}}i.translate.x(q+t)}},endDrag:function(m){if(e.isDragging){d.dispatchEvent("end");var l=i.translate.get.matrix(4);if(e.dragWatchers.current===0&&l!==0&&f.tapToClose){d.dispatchEvent("close");d.events.prevent(m);i.translate.easeTo(0);e.isDragging=false;e.startDragX=0;return}if(e.simpleStates.opening==="left"){if((e.simpleStates.halfway||e.simpleStates.hyperExtending||e.simpleStates.flick)){if(e.simpleStates.flick&&e.simpleStates.towards==="left"){i.translate.easeTo(0)}else{if((e.simpleStates.flick&&e.simpleStates.towards==="right")||(e.simpleStates.halfway||e.simpleStates.hyperExtending)){i.translate.easeTo(f.maxPosition)}}}else{i.translate.easeTo(0)}}else{if(e.simpleStates.opening==="right"){if((e.simpleStates.halfway||e.simpleStates.hyperExtending||e.simpleStates.flick)){if(e.simpleStates.flick&&e.simpleStates.towards==="right"){i.translate.easeTo(0)}else{if((e.simpleStates.flick&&e.simpleStates.towards==="left")||(e.simpleStates.halfway||e.simpleStates.hyperExtending)){i.translate.easeTo(f.minPosition)}}}else{i.translate.easeTo(0)}}}e.isDragging=false;e.startDragX=d.page("X",m)}}}},j=function(l){if(l.element){d.deepExtend(f,l);e.vendor=d.vendor();i.drag.listen()}};this.open=function(l){d.dispatchEvent("open");d.klass.remove(b.body,"snapjs-expand-left");d.klass.remove(b.body,"snapjs-expand-right");if(l==="left"){e.simpleStates.opening="left";e.simpleStates.towards="right";d.klass.add(b.body,"snapjs-left");d.klass.remove(b.body,"snapjs-right");i.translate.easeTo(f.maxPosition)}else{if(l==="right"){e.simpleStates.opening="right";e.simpleStates.towards="left";d.klass.remove(b.body,"snapjs-left");d.klass.add(b.body,"snapjs-right");i.translate.easeTo(f.minPosition)}}};this.close=function(){d.dispatchEvent("close");i.translate.easeTo(0)};this.expand=function(l){var m=c.innerWidth||b.documentElement.clientWidth;if(l==="left"){d.dispatchEvent("expandLeft");d.klass.add(b.body,"snapjs-expand-left");d.klass.remove(b.body,"snapjs-expand-right")}else{d.dispatchEvent("expandRight");d.klass.add(b.body,"snapjs-expand-right");d.klass.remove(b.body,"snapjs-expand-left");m*=-1}i.translate.easeTo(m)};this.on=function(l,m){h[l]=m;return this};this.off=function(l){if(h[l]){h[l]=false}};this.enable=function(){d.dispatchEvent("enable");i.drag.listen()};this.disable=function(){d.dispatchEvent("disable");i.drag.stopListening()};this.settings=function(l){d.deepExtend(f,l)};this.state=function(){var l,m=i.translate.get.matrix(4);if(m===f.maxPosition){l="left"}else{if(m===f.minPosition){l="right"}else{l="closed"}}return{state:l,info:e.simpleStates}};j(k)};if((typeof module!=="undefined")&&module.exports){module.exports=a}if(typeof ender==="undefined"){q.SnapMenu=a}}).call(this,window,document,$);

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
          var popover = $('<div class="popover" wcelement />')
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
            // $(window).scroll($.debounce( 250, true, function(){
                 // on scroll start event
                 // $this.popover('reposition');
          // }));

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


/*
 * @license jQuery Text Highlighter
 * Copyright (C) 2011 - 2013 by mirz
*/

(function(a, window, document, undefined) {
    var nodeTypes = {
        ELEMENT_NODE: 1,
        TEXT_NODE: 3
    };

    var plugin = {
        name: 'textHighlighter'
    };

    function TextHighlighter(element, options) {
        this.context = element;
        this.$context = $(element);
        this.options = $.extend({}, $[plugin.name].defaults, options);
        this.init();
    }

    TextHighlighter.prototype = {
        init: function() {
            this.$context.addClass(this.options.contextClass);
            this.bindEvents();
        },

        destroy: function() {
            this.unbindEvents();
            this.$context.removeClass(this.options.contextClass);
            this.$context.removeData(plugin.name);
        },

        bindEvents: function() {
            this.$context.bind('mouseup', {self: this}, this.highlightHandler);
        },

        unbindEvents: function() {
            this.$context.unbind('mouseup', this.highlightHandler);
        },

        highlightHandler: function(event) {
            var self = event.data.self;
            if (wcApp.settings.get('tbMarkText')) self.doHighlight();
        },

        /**
         * Highlights currently selected text.
         */
        doHighlight: function() {
            var range = this.getCurrentRange();
            if (!range || range.collapsed) return;
            var rangeText = range.toString();

            if (this.options.onBeforeHighlight(range) == true) {
                var $wrapper = $.textHighlighter.createWrapper(this.options);

                var createdHighlights = this.highlightRange(range, $wrapper);
                var normalizedHighlights = this.normalizeHighlights(createdHighlights);

                this.options.onAfterHighlight(normalizedHighlights, rangeText);
                var sfn = webC.helper.textElement();
                sfn.send('highlights');
            }

            this.removeAllRanges();
        },

        /**
         * Returns first range of current selection object.
         */
        getCurrentRange: function() {
            var selection = this.getCurrentSelection();

            var range;
            if (selection.rangeCount > 0) {
                range = selection.getRangeAt(0);
            }
            return range;
        },

        removeAllRanges: function() {
            var selection = this.getCurrentSelection();
            selection.removeAllRanges();
        },

        /**
         * Returns current selection object.
         */
        getCurrentSelection: function() {
            var currentWindow = this.getCurrentWindow();
            var selection;

            if (currentWindow.getSelection) {
                selection = currentWindow.getSelection();
            } else if ($('iframe').length) {
                $('iframe', top.document).each(function() {
                    if (this.contentWindow === currentWindow) {
                        selection = rangy.getIframeSelection(this);
                        return false;
                    }
                });
            } else {
                selection = rangy.getSelection();
            }

            return selection;
        },

        /**
         * Returns owner window of this.context.
         */
        getCurrentWindow: function() {
            var currentDoc = this.getCurrentDocument();
            if (currentDoc.defaultView) {
                return currentDoc.defaultView; // Non-IE
            } else {
                return currentDoc.parentWindow; // IE
            }
        },

        /**
         * Returns owner document of this.context.
         */
        getCurrentDocument: function() {
            // if ownerDocument is null then context is document
            return this.context.ownerDocument ? this.context.ownerDocument : this.context;
        },

        /**
         * Wraps given range (highlights it) object in the given wrapper.
         */
        highlightRange: function(range, $wrapper) {
            if (range.collapsed) return;

            // Don't highlight content of these tags
            var ignoreTags = ['SCRIPT', 'STYLE', 'SELECT', 'BUTTON', 'OBJECT', 'APPLET'];
            var startContainer = range.startContainer;
            var endContainer = range.endContainer;
            var ancestor = range.commonAncestorContainer;
            var goDeeper = true;

            if (range.endOffset == 0) {
                while (!endContainer.previousSibling && endContainer.parentNode != ancestor) {
                    endContainer = endContainer.parentNode;
                }
                endContainer = endContainer.previousSibling;
            } else if (endContainer.nodeType == nodeTypes.TEXT_NODE) {
                if (range.endOffset < endContainer.nodeValue.length) {
                    endContainer.splitText(range.endOffset);
                }
            } else if (range.endOffset > 0) {
                endContainer = endContainer.childNodes.item(range.endOffset - 1);
            }

            if (startContainer.nodeType == nodeTypes.TEXT_NODE) {
                if (range.startOffset == startContainer.nodeValue.length) {
                    goDeeper = false;
                } else if (range.startOffset > 0) {
                    startContainer = startContainer.splitText(range.startOffset);
                    if (endContainer == startContainer.previousSibling) endContainer = startContainer;
                }
            } else if (range.startOffset < startContainer.childNodes.length) {
                startContainer = startContainer.childNodes.item(range.startOffset);
            } else {
                startContainer = startContainer.nextSibling;
            }

            var done = false;
            var node = startContainer;
            var highlights = [];

            do {
                if (goDeeper && node.nodeType == nodeTypes.TEXT_NODE) {
                    if (/\S/.test(node.nodeValue)) {
                        var wrapper = $wrapper.clone(true).get(0);
                        var nodeParent = node.parentNode;

                        // highlight if node is inside the context
                        if ($.contains(this.context, nodeParent) || nodeParent === this.context) {
                            var highlight = $(node).wrap(wrapper).parent().get(0);
                            highlights.push(highlight);
                        }
                    }

                    goDeeper = false;
                }
                if (node == endContainer && (!endContainer.hasChildNodes() || !goDeeper)) {
                    done = true;
                }

                if ($.inArray(node.tagName, ignoreTags) != -1) {
                    goDeeper = false;
                }
                if (goDeeper && node.hasChildNodes()) {
                    node = node.firstChild;
                } else if (node.nextSibling != null) {
                    node = node.nextSibling;
                    goDeeper = true;
                } else {
                    node = node.parentNode;
                    goDeeper = false;
                }
            } while (!done);

            return highlights;
        },

        /**
         * Normalizes highlights - nested highlights are flattened and sibling higlights are merged.
         */
        normalizeHighlights: function(highlights) {
            this.flattenNestedHighlights(highlights);
            this.mergeSiblingHighlights(highlights);

            // omit removed nodes
            var normalizedHighlights = $.map(highlights, function(hl) {
                if (typeof hl.parentElement != 'undefined') { // IE
                    return hl.parentElement != null ? hl : null;
                } else {
                    return hl.parentNode != null ? hl : null;
                }
            });

            return normalizedHighlights;
        },

        flattenNestedHighlights: function(highlights) {
            var self = this;

            $.each(highlights, function(i) {
                var $highlight = $(this);
                var $parent = $highlight.parent();
                var $parentPrev = $parent.prev();
                var $parentNext = $parent.next();

                if (self.isHighlight($parent)) {
                    if ($parent.css('background-color') != $highlight.css('background-color')) {
                        if (self.isHighlight($parentPrev) && !$highlight.get(0).previousSibling
                            && $parentPrev.css('background-color') != $parent.css('background-color')
                            && $parentPrev.css('background-color') == $highlight.css('background-color')) {

                            $highlight.insertAfter($parentPrev);
                        }

                        if (self.isHighlight($parentNext) && !$highlight.get(0).nextSibling
                            && $parentNext.css('background-color') != $parent.css('background-color')
                            && $parentNext.css('background-color') == $highlight.css('background-color')) {

                            $highlight.insertBefore($parentNext);
                        }

                        if ($parent.is(':empty')) {
                            $parent.remove();
                        }
                    } else {
                        var newNode = document.createTextNode($parent.text());

                        $parent.empty();
                        $parent.append(newNode);
                        $(highlights[i]).remove();
                    }
                }
            });
        },

        mergeSiblingHighlights: function(highlights) {
            var self = this;

            function shouldMerge(current, node) {
                return node && node.nodeType == nodeTypes.ELEMENT_NODE
                    && $(current).css('background-color') == $(node).css('background-color')
                    && $(node).hasClass(self.options.highlightedClass)
                    ? true : false;
            }

            $.each(highlights, function() {
                var highlight = this;

                var prev = highlight.previousSibling;
                var next = highlight.nextSibling;

                if (shouldMerge(highlight, prev)) {
                    var mergedTxt = $(prev).text() + $(highlight).text();
                    $(highlight).text(mergedTxt);
                    $(prev).remove();
                }
                if (shouldMerge(highlight, next)) {
                    var mergedTxt = $(highlight).text() + $(next).text();
                    $(highlight).text(mergedTxt);
                    $(next).remove();
                }
            });
        },

        /**
         * Sets color of future highlights.
         */
        setColor: function(color) {
            this.options.color = color;
        },

        /**
         * Returns current highlights color.
         */
        getColor: function() {
            return this.options.color;
        },

        /**
         * Removes all highlights in given element or in context if no element given.
         */
        removeHighlights: function(element) {
            var container = (element !== undefined ? element : this.context);

            var unwrapHighlight = function(highlight) {
                return $(highlight).contents().unwrap().get(0);
            };

            var mergeSiblingTextNodes = function(textNode) {
                var prev = textNode.previousSibling;
                var next = textNode.nextSibling;

                if (prev && prev.nodeType == nodeTypes.TEXT_NODE) {
                    textNode.nodeValue = prev.nodeValue + textNode.nodeValue;
                    prev.parentNode.removeChild(prev);
                }
                if (next && next.nodeType == nodeTypes.TEXT_NODE) {
                    textNode.nodeValue = textNode.nodeValue + next.nodeValue;
                    next.parentNode.removeChild(next);
                }
            };
            var self = this;
            var $highlights = this.getAllHighlights(container, true);
            $highlights.each(function() {
                if (self.options.onRemoveHighlight(this) == true) {
                    var textNode = unwrapHighlight(this);
                    mergeSiblingTextNodes(textNode);
                }
            });
            return container;
        },

        /**
         * Returns all highlights in given container. If container is a highlight itself and
         * andSelf is true, container will be also returned
         */
        getAllHighlights: function(container, andSelf) {
            var classSelectorStr = '.' + this.options.highlightedClass;
            var $highlights = $(container).find(classSelectorStr);
            if (andSelf == true && $(container).hasClass(this.options.highlightedClass)) {
                $highlights = $highlights.add(container);
            }
            return $highlights;
        },

        /**
         * Returns true if element is highlight, ie. has proper class.
         */
        isHighlight: function($el) {
            return $el.hasClass(this.options.highlightedClass);
        },

        getParentNodeFromSelection: function() {
        	var range = this.getCurrentRange();
            if (!range || range.collapsed) return;
            var rangeText = range.toString();
            var node = range.commonAncestorContainer ? range.commonAncestorContainer : range.parentElement ? range.parentElement() : range.item(0);
			
			if (node) {
    			return (node.nodeName == "#text" ? node.parentNode : node);
  			}
        },

        /**
         * Serializes all highlights to stringified JSON object.
         */
        serializeHighlights: function() {
            var $highlights = this.getAllHighlights(this.context);
            var refEl = this.context;
            var hlDescriptors = [];
            var self = this;

            var getElementPath = function (el, refElement) {
                var path = [];

                do {
                    var elIndex = $.inArray(el, el.parentNode.childNodes);
                    path.unshift(elIndex);
                    el = el.parentNode;
                } while (el !== refElement);

                return path;
            };
            
            $highlights.each(function(i, highlight) {
                var offset = 0; // Hl offset from previous sibling within parent node.
                var length = highlight.firstChild.length;
                var hlPath = getElementPath(highlight, refEl);
                var wrapper = $(highlight).clone().empty().get(0).outerHTML;
                var $highlight = $(highlight);

                var $parent = $highlight.parent();
            	
            	// $parent.css('border','1px solid red');

                // lets send highlights
	            var elpath = $parent.getPathOriginal();
	            // var node = $parent.contents().filter(function () { return this.nodeName=="#text" }),
	            text = $parent.text().trim(),
	            first = text.split(" ",2).join(" ");
	            if (first == '') first = '_empty_';

                if (highlight.previousSibling && highlight.previousSibling.nodeType === nodeTypes.TEXT_NODE) {
                    offset = highlight.previousSibling.length;
                }

                // rcl.log("highlight.innerText N %s :", i, $(highlight).text());

                hlDescriptors.push([
                    wrapper,
                    $(highlight).text(),
                    hlPath.join(':'),
                    offset,
                    length,
                    {
                    	'path': elpath,
                    	'startext': first
                    }
                ]);
            });

            return JSON.stringify(hlDescriptors);
        }

    };

    /**
     * Returns TextHighlighter instance.
     */
    a.fn.getHighlighter = function() {
        return this.data(plugin.name);
    };

    a.fn[plugin.name] = function(options) {
        return this.each(function() {
            if (!$.data(this, plugin.name)) {
                $.data(this, plugin.name, new TextHighlighter(this, options));
            }
        });
    };

    a.textHighlighter = {
        /**
         * Returns HTML element to wrap selected text in.
         */
        createWrapper: function(options) {
            return $('<span></span>')
                .css('backgroundColor', options.color)
                .addClass(options.highlightedClass)
                .on('click.wcevents', function(e) { 
                	if (e.altKey) {
  					$('body').getHighlighter().removeHighlights(this);
  					var sfn = webC.helper.textElement();
                	sfn.send('highlights');
                	}
				});
        },
        defaults: {
            // color: '#ffff7b',
            color: '#FEC100',
            highlightedClass: 'wchighlighted',
            contextClass: 'wchighlighted-inside',
            onRemoveHighlight: function() { return true; },
            onBeforeHighlight: function() { return true; },
            onAfterHighlight: function() { }
         }
    };

})($, window, document);
// text rangy 1.2.3
window.rangy=function(){function a(c,a){var q=typeof c[a];return"function"==q||!("object"!=q||!c[a])||"unknown"==q}function y(c,a){return!("object"!=typeof c[a]||!c[a])}function v(c,a){return"undefined"!=typeof c[a]}function u(c){return function(a,q){for(var d=q.length;d--;)if(!c(a,q[d]))return!1;return!0}}function s(c){return c&&r(c,n)&&p(c,e)}function t(a){window.alert("Rangy not supported in your browser. Reason: "+a);c.initialized=!0;c.supported=!1}function w(){if(!c.initialized){var e,n=!1,g=
!1;a(document,"createRange")&&(e=document.createRange(),r(e,f)&&p(e,d)&&(n=!0),e.detach());(e=y(document,"body")?document.body:document.getElementsByTagName("body")[0])&&a(e,"createTextRange")&&(e=e.createTextRange(),s(e)&&(g=!0));n||g||t("Neither Range nor TextRange are implemented");c.initialized=!0;c.features={implementsDomRange:n,implementsTextRange:g};n=D.concat(q);g=0;for(e=n.length;g<e;++g)try{n[g](c)}catch(l){y(window,"console")&&a(window.console,"log")&&window.console.log("Init listener threw an exception. Continuing.",
l)}}}function g(c){this.name=c;this.supported=this.initialized=!1}var d="startContainer startOffset endContainer endOffset collapsed commonAncestorContainer START_TO_START START_TO_END END_TO_START END_TO_END".split(" "),f="setStart setStartBefore setStartAfter setEnd setEndBefore setEndAfter collapse selectNode selectNodeContents compareBoundaryPoints deleteContents extractContents cloneContents insertNode surroundContents cloneRange toString detach".split(" "),e="boundingHeight boundingLeft boundingTop boundingWidth htmlText text".split(" "),
n="collapse compareEndPoints duplicate getBookmark moveToBookmark moveToElementText parentElement pasteHTML select setEndPoint getBoundingClientRect".split(" "),r=u(a),l=u(y),p=u(v),c={version:"1.2.3",initialized:!1,supported:!0,util:{isHostMethod:a,isHostObject:y,isHostProperty:v,areHostMethods:r,areHostObjects:l,areHostProperties:p,isTextRange:s},features:{},modules:{},config:{alertOnWarn:!1,preferTextRange:!1}};c.fail=t;c.warn=function(a){a="Rangy warning: "+a;c.config.alertOnWarn?window.alert(a):
"undefined"!=typeof window.console&&"undefined"!=typeof window.console.log&&window.console.log(a)};({}).hasOwnProperty?c.util.extend=function(c,a){for(var q in a)a.hasOwnProperty(q)&&(c[q]=a[q])}:t("hasOwnProperty not supported");var q=[],D=[];c.init=w;c.addInitListener=function(a){c.initialized?a(c):q.push(a)};var x=[];c.addCreateMissingNativeApiListener=function(c){x.push(c)};c.createMissingNativeApi=function(c){c=c||window;w();for(var a=0,q=x.length;a<q;++a)x[a](c)};g.prototype.fail=function(c){this.initialized=
!0;this.supported=!1;throw Error("Module '"+this.name+"' failed to load: "+c);};g.prototype.warn=function(a){c.warn("Module "+this.name+": "+a)};g.prototype.createError=function(c){return Error("Error in Rangy "+this.name+" module: "+c)};c.createModule=function(a,q){var d=new g(a);c.modules[a]=d;D.push(function(c){q(c,d);d.initialized=!0;d.supported=!0})};c.requireModules=function(a){for(var q=0,d=a.length,e,f;q<d;++q){f=a[q];e=c.modules[f];if(!(e&&e instanceof g))throw Error("Module '"+f+"' not found");
if(!e.supported)throw Error("Module '"+f+"' not supported");}};var F=!1,l=function(){F||(F=!0,c.initialized||w())};if("undefined"==typeof window)t("No window found");else if("undefined"==typeof document)t("No document found");else return a(document,"addEventListener")&&document.addEventListener("DOMContentLoaded",l,!1),a(window,"addEventListener")?window.addEventListener("load",l,!1):a(window,"attachEvent")?window.attachEvent("onload",l):t("Window does not have required addEventListener or attachEvent method"),
c}();rangy.createModule("DomUtil",function(a,y){function v(c){for(var a=0;c=c.previousSibling;)a++;return a}function u(c,a){var d=[],e;for(e=c;e;e=e.parentNode)d.push(e);for(e=a;e;e=e.parentNode)if(p(d,e))return e;return null}function s(c,a,d){for(d=d?c:c.parentNode;d;){c=d.parentNode;if(c===a)return d;d=c}return null}function t(c){c=c.nodeType;return 3==c||4==c||8==c}function w(c,a){var d=a.nextSibling,e=a.parentNode;d?e.insertBefore(c,d):e.appendChild(c);return c}function g(c){if(9==c.nodeType)return c;if("undefined"!=
typeof c.ownerDocument)return c.ownerDocument;if("undefined"!=typeof c.document)return c.document;if(c.parentNode)return g(c.parentNode);throw Error("getDocument: no document found for node");}function d(c){return c?t(c)?'"'+c.data+'"':1==c.nodeType?"<"+c.nodeName+(c.id?' id="'+c.id+'"':"")+">["+c.childNodes.length+"]":c.nodeName:"[No node]"}function f(c){this._next=this.root=c}function e(c,a){this.node=c;this.offset=a}function n(c){this.code=this[c];this.codeName=c;this.message="DOMException: "+
this.codeName}var r=a.util;r.areHostMethods(document,["createDocumentFragment","createElement","createTextNode"])||y.fail("document missing a Node creation method");r.isHostMethod(document,"getElementsByTagName")||y.fail("document missing getElementsByTagName method");var l=document.createElement("div");r.areHostMethods(l,["insertBefore","appendChild","cloneNode"])||y.fail("Incomplete Element implementation");r.isHostProperty(l,"innerHTML")||y.fail("Element is missing innerHTML property");l=document.createTextNode("test");
r.areHostMethods(l,["splitText","deleteData","insertData","appendData","cloneNode"])||y.fail("Incomplete Text Node implementation");var p=function(c,a){for(var d=c.length;d--;)if(c[d]===a)return!0;return!1};f.prototype={_current:null,hasNext:function(){return!!this._next},next:function(){var c=this._current=this._next,a;if(this._current){if(!(a=c.firstChild))for(a=null;c!==this.root&&!(a=c.nextSibling);)c=c.parentNode;this._next=a}return this._current},detach:function(){this._current=this._next=this.root=
null}};e.prototype={equals:function(c){return this.node===c.node&this.offset==c.offset},inspect:function(){return"[DomPosition("+d(this.node)+":"+this.offset+")]"}};n.prototype={INDEX_SIZE_ERR:1,HIERARCHY_REQUEST_ERR:3,WRONG_DOCUMENT_ERR:4,NO_MODIFICATION_ALLOWED_ERR:7,NOT_FOUND_ERR:8,NOT_SUPPORTED_ERR:9,INVALID_STATE_ERR:11};n.prototype.toString=function(){return this.message};a.dom={arrayContains:p,isHtmlNamespace:function(c){var a;return"undefined"==typeof c.namespaceURI||null===(a=c.namespaceURI)||
"http://www.w3.org/1999/xhtml"==a},parentElement:function(c){c=c.parentNode;return 1==c.nodeType?c:null},getNodeIndex:v,getNodeLength:function(c){var a;return t(c)?c.length:(a=c.childNodes)?a.length:0},getCommonAncestor:u,isAncestorOf:function(c,a,d){for(a=d?a:a.parentNode;a;){if(a===c)return!0;a=a.parentNode}return!1},getClosestAncestorIn:s,isCharacterDataNode:t,insertAfter:w,splitDataNode:function(c,a){var d=c.cloneNode(!1);d.deleteData(0,a);c.deleteData(a,c.length-a);w(d,c);return d},getDocument:g,
getWindow:function(c){c=g(c);if("undefined"!=typeof c.defaultView)return c.defaultView;if("undefined"!=typeof c.parentWindow)return c.parentWindow;throw Error("Cannot get a window object for node");},getIframeWindow:function(c){if("undefined"!=typeof c.contentWindow)return c.contentWindow;if("undefined"!=typeof c.contentDocument)return c.contentDocument.defaultView;throw Error("getIframeWindow: No Window object found for iframe element");},getIframeDocument:function(c){if("undefined"!=typeof c.contentDocument)return c.contentDocument;
if("undefined"!=typeof c.contentWindow)return c.contentWindow.document;throw Error("getIframeWindow: No Document object found for iframe element");},getBody:function(c){return r.isHostObject(c,"body")?c.body:c.getElementsByTagName("body")[0]},getRootContainer:function(c){for(var a;a=c.parentNode;)c=a;return c},comparePoints:function(c,a,d,e){var f;if(c==d)return a===e?0:a<e?-1:1;if(f=s(d,c,!0))return a<=v(f)?-1:1;if(f=s(c,d,!0))return v(f)<e?-1:1;a=u(c,d);c=c===a?a:s(c,a,!0);d=d===a?a:s(d,a,!0);if(c===
d)throw Error("comparePoints got to case 4 and childA and childB are the same!");for(a=a.firstChild;a;){if(a===c)return-1;if(a===d)return 1;a=a.nextSibling}throw Error("Should not be here!");},inspectNode:d,fragmentFromNodeChildren:function(a){for(var d=g(a).createDocumentFragment(),e;e=a.firstChild;)d.appendChild(e);return d},createIterator:function(a){return new f(a)},DomPosition:e};a.DOMException=n});
rangy.createModule("DomRange",function(a){function y(h,b){return 3!=h.nodeType&&(k.isAncestorOf(h,b.startContainer,!0)||k.isAncestorOf(h,b.endContainer,!0))}function v(h){return k.getDocument(h.startContainer)}function u(h,b,a){if(b=h._listeners[b])for(var c=0,d=b.length;c<d;++c)b[c].call(h,{target:h,args:a})}function s(h){return new L(h.parentNode,k.getNodeIndex(h))}function t(h){return new L(h.parentNode,k.getNodeIndex(h)+1)}function w(h,b,a){var c=11==h.nodeType?h.firstChild:h;k.isCharacterDataNode(b)?
a==b.length?k.insertAfter(h,b):b.parentNode.insertBefore(h,0==a?b:k.splitDataNode(b,a)):a>=b.childNodes.length?b.appendChild(h):b.insertBefore(h,b.childNodes[a]);return c}function g(h){for(var b,a,c=v(h.range).createDocumentFragment();a=h.next();){b=h.isPartiallySelectedSubtree();a=a.cloneNode(!b);b&&(b=h.getSubtreeIterator(),a.appendChild(g(b)),b.detach(!0));if(10==a.nodeType)throw new E("HIERARCHY_REQUEST_ERR");c.appendChild(a)}return c}function d(h,b,a){var c,m;for(a=a||{stop:!1};c=h.next();)if(h.isPartiallySelectedSubtree())if(!1===
b(c)){a.stop=!0;break}else{if(c=h.getSubtreeIterator(),d(c,b,a),c.detach(!0),a.stop)break}else for(c=k.createIterator(c);m=c.next();)if(!1===b(m)){a.stop=!0;return}}function f(h){for(var b;h.next();)h.isPartiallySelectedSubtree()?(b=h.getSubtreeIterator(),f(b),b.detach(!0)):h.remove()}function e(h){for(var b,a=v(h.range).createDocumentFragment(),c;b=h.next();){h.isPartiallySelectedSubtree()?(b=b.cloneNode(!1),c=h.getSubtreeIterator(),b.appendChild(e(c)),c.detach(!0)):h.remove();if(10==b.nodeType)throw new E("HIERARCHY_REQUEST_ERR");
a.appendChild(b)}return a}function n(h,b,a){var c=!(!b||!b.length),m,e=!!a;c&&(m=RegExp("^("+b.join("|")+")$"));var f=[];d(new l(h,!1),function(h){c&&!m.test(h.nodeType)||e&&!a(h)||f.push(h)});return f}function r(h){return"["+("undefined"==typeof h.getName?"Range":h.getName())+"("+k.inspectNode(h.startContainer)+":"+h.startOffset+", "+k.inspectNode(h.endContainer)+":"+h.endOffset+")]"}function l(h,b){this.range=h;this.clonePartiallySelectedTextNodes=b;if(!h.collapsed){this.sc=h.startContainer;this.so=
h.startOffset;this.ec=h.endContainer;this.eo=h.endOffset;var a=h.commonAncestorContainer;this.sc===this.ec&&k.isCharacterDataNode(this.sc)?(this.isSingleCharacterDataNode=!0,this._first=this._last=this._next=this.sc):(this._first=this._next=this.sc!==a||k.isCharacterDataNode(this.sc)?k.getClosestAncestorIn(this.sc,a,!0):this.sc.childNodes[this.so],this._last=this.ec!==a||k.isCharacterDataNode(this.ec)?k.getClosestAncestorIn(this.ec,a,!0):this.ec.childNodes[this.eo-1])}}function p(h){this.code=this[h];
this.codeName=h;this.message="RangeException: "+this.codeName}function c(h,b,a){this.nodes=n(h,b,a);this._next=this.nodes[0];this._position=0}function q(h){return function(b,a){for(var c,m=a?b:b.parentNode;m;){c=m.nodeType;if(k.arrayContains(h,c))return m;m=m.parentNode}return null}}function D(h,b){if(ea(h,b))throw new p("INVALID_NODE_TYPE_ERR");}function x(h){if(!h.startContainer)throw new E("INVALID_STATE_ERR");}function F(h,b){if(!k.arrayContains(b,h.nodeType))throw new p("INVALID_NODE_TYPE_ERR");
}function H(h,b){if(0>b||b>(k.isCharacterDataNode(h)?h.length:h.childNodes.length))throw new E("INDEX_SIZE_ERR");}function B(b,a){if(U(b,!0)!==U(a,!0))throw new E("WRONG_DOCUMENT_ERR");}function G(b){if(fa(b,!0))throw new E("NO_MODIFICATION_ALLOWED_ERR");}function C(b,a){if(!b)throw new E(a);}function J(b){return!!b.startContainer&&!!b.endContainer&&!(!k.arrayContains(O,b.startContainer.nodeType)&&!U(b.startContainer,!0))&&!(!k.arrayContains(O,b.endContainer.nodeType)&&!U(b.endContainer,!0))&&b.startOffset<=
(k.isCharacterDataNode(b.startContainer)?b.startContainer.length:b.startContainer.childNodes.length)&&b.endOffset<=(k.isCharacterDataNode(b.endContainer)?b.endContainer.length:b.endContainer.childNodes.length)}function z(b){x(b);if(!J(b))throw Error("Range error: Range is no longer valid after DOM mutation ("+b.inspect()+")");}function P(){}function K(b){b.START_TO_START=V;b.START_TO_END=Z;b.END_TO_END=ga;b.END_TO_START=$;b.NODE_BEFORE=aa;b.NODE_AFTER=ba;b.NODE_BEFORE_AND_AFTER=ca;b.NODE_INSIDE=W}
function I(b){K(b);K(b.prototype)}function Q(b,a){return function(){z(this);var c=this.startContainer,m=this.startOffset,e=this.commonAncestorContainer,f=new l(this,!0);c!==e&&(c=k.getClosestAncestorIn(c,e,!0),m=t(c),c=m.node,m=m.offset);d(f,G);f.reset();e=b(f);f.detach();a(this,c,m,c,m);return e}}function S(b,c,d){function q(b,a){return function(h){x(this);F(h,M);F(m(h),O);h=(b?s:t)(h);(a?g:n)(this,h.node,h.offset)}}function g(b,a,h){var d=b.endContainer,e=b.endOffset;if(a!==b.startContainer||h!==
b.startOffset){if(m(a)!=m(d)||1==k.comparePoints(a,h,d,e))d=a,e=h;c(b,a,h,d,e)}}function n(b,a,h){var d=b.startContainer,e=b.startOffset;if(a!==b.endContainer||h!==b.endOffset){if(m(a)!=m(d)||-1==k.comparePoints(a,h,d,e))d=a,e=h;c(b,d,e,a,h)}}b.prototype=new P;a.util.extend(b.prototype,{setStart:function(b,a){x(this);D(b,!0);H(b,a);g(this,b,a)},setEnd:function(b,a){x(this);D(b,!0);H(b,a);n(this,b,a)},setStartBefore:q(!0,!0),setStartAfter:q(!1,!0),setEndBefore:q(!0,!1),setEndAfter:q(!1,!1),collapse:function(b){z(this);
b?c(this,this.startContainer,this.startOffset,this.startContainer,this.startOffset):c(this,this.endContainer,this.endOffset,this.endContainer,this.endOffset)},selectNodeContents:function(b){x(this);D(b,!0);c(this,b,0,b,k.getNodeLength(b))},selectNode:function(b){x(this);D(b,!1);F(b,M);var a=s(b);b=t(b);c(this,a.node,a.offset,b.node,b.offset)},extractContents:Q(e,c),deleteContents:Q(f,c),canSurroundContents:function(){z(this);G(this.startContainer);G(this.endContainer);var b=new l(this,!0),a=b._first&&
y(b._first,this)||b._last&&y(b._last,this);b.detach();return!a},detach:function(){d(this)},splitBoundaries:function(){z(this);var b=this.startContainer,a=this.startOffset,h=this.endContainer,m=this.endOffset,d=b===h;k.isCharacterDataNode(h)&&0<m&&m<h.length&&k.splitDataNode(h,m);k.isCharacterDataNode(b)&&(0<a&&a<b.length)&&(b=k.splitDataNode(b,a),d?(m-=a,h=b):h==b.parentNode&&m>=k.getNodeIndex(b)&&m++,a=0);c(this,b,a,h,m)},normalizeBoundaries:function(){z(this);var b=this.startContainer,a=this.startOffset,
h=this.endContainer,m=this.endOffset,d=function(b){var a=b.nextSibling;a&&a.nodeType==b.nodeType&&(h=b,m=b.length,b.appendData(a.data),a.parentNode.removeChild(a))},e=function(c){var d=c.previousSibling;if(d&&d.nodeType==c.nodeType){b=c;var e=c.length;a=d.length;c.insertData(0,d.data);d.parentNode.removeChild(d);b==h?(m+=a,h=b):h==c.parentNode&&(d=k.getNodeIndex(c),m==d?(h=c,m=e):m>d&&m--)}},f=!0;k.isCharacterDataNode(h)?h.length==m&&d(h):(0<m&&(f=h.childNodes[m-1])&&k.isCharacterDataNode(f)&&d(f),
f=!this.collapsed);f?k.isCharacterDataNode(b)?0==a&&e(b):a<b.childNodes.length&&(d=b.childNodes[a])&&k.isCharacterDataNode(d)&&e(d):(b=h,a=m);c(this,b,a,h,m)},collapseToPoint:function(b,a){x(this);D(b,!0);H(b,a);b===this.startContainer&&a===this.startOffset&&b===this.endContainer&&a===this.endOffset||c(this,b,a,b,a)}});I(b)}function R(b){b.collapsed=b.startContainer===b.endContainer&&b.startOffset===b.endOffset;b.commonAncestorContainer=b.collapsed?b.startContainer:k.getCommonAncestor(b.startContainer,
b.endContainer)}function T(b,a,c,m,d){var e=b.startContainer!==a||b.startOffset!==c,f=b.endContainer!==m||b.endOffset!==d;b.startContainer=a;b.startOffset=c;b.endContainer=m;b.endOffset=d;R(b);u(b,"boundarychange",{startMoved:e,endMoved:f})}function A(b){this.startContainer=b;this.startOffset=0;this.endContainer=b;this.endOffset=0;this._listeners={boundarychange:[],detach:[]};R(this)}a.requireModules(["DomUtil"]);var k=a.dom,L=k.DomPosition,E=a.DOMException;l.prototype={_current:null,_next:null,_first:null,
_last:null,isSingleCharacterDataNode:!1,reset:function(){this._current=null;this._next=this._first},hasNext:function(){return!!this._next},next:function(){var b=this._current=this._next;b&&(this._next=b!==this._last?b.nextSibling:null,k.isCharacterDataNode(b)&&this.clonePartiallySelectedTextNodes&&(b===this.ec&&(b=b.cloneNode(!0)).deleteData(this.eo,b.length-this.eo),this._current===this.sc&&(b=b.cloneNode(!0)).deleteData(0,this.so)));return b},remove:function(){var b=this._current,a,c;!k.isCharacterDataNode(b)||
b!==this.sc&&b!==this.ec?b.parentNode&&b.parentNode.removeChild(b):(a=b===this.sc?this.so:0,c=b===this.ec?this.eo:b.length,a!=c&&b.deleteData(a,c-a))},isPartiallySelectedSubtree:function(){return y(this._current,this.range)},getSubtreeIterator:function(){var b;if(this.isSingleCharacterDataNode)b=this.range.cloneRange(),b.collapse();else{b=new A(v(this.range));var a=this._current,c=a,m=0,d=a,e=k.getNodeLength(a);k.isAncestorOf(a,this.sc,!0)&&(c=this.sc,m=this.so);k.isAncestorOf(a,this.ec,!0)&&(d=this.ec,
e=this.eo);T(b,c,m,d,e)}return new l(b,this.clonePartiallySelectedTextNodes)},detach:function(b){b&&this.range.detach();this.range=this._current=this._next=this._first=this._last=this.sc=this.so=this.ec=this.eo=null}};p.prototype={BAD_BOUNDARYPOINTS_ERR:1,INVALID_NODE_TYPE_ERR:2};p.prototype.toString=function(){return this.message};c.prototype={_current:null,hasNext:function(){return!!this._next},next:function(){this._current=this._next;this._next=this.nodes[++this._position];return this._current},
detach:function(){this._current=this._next=this.nodes=null}};var M=[1,3,4,5,7,8,10],O=[2,9,11],N=[1,3,4,5,7,8,10,11],b=[1,3,4,5,7,8],m=k.getRootContainer,U=q([9,11]),fa=q([5,6,10,12]),ea=q([6,10,12]),da=document.createElement("style"),X=!1;try{da.innerHTML="<b>x</b>",X=3==da.firstChild.nodeType}catch(ha){}a.features.htmlParsingConforms=X;var Y="startContainer startOffset endContainer endOffset collapsed commonAncestorContainer".split(" "),V=0,Z=1,ga=2,$=3,aa=0,ba=1,ca=2,W=3;P.prototype={attachListener:function(b,
a){this._listeners[b].push(a)},compareBoundaryPoints:function(b,a){z(this);B(this.startContainer,a.startContainer);var c=b==$||b==V?"start":"end",m=b==Z||b==V?"start":"end";return k.comparePoints(this[c+"Container"],this[c+"Offset"],a[m+"Container"],a[m+"Offset"])},insertNode:function(b){z(this);F(b,N);G(this.startContainer);if(k.isAncestorOf(b,this.startContainer,!0))throw new E("HIERARCHY_REQUEST_ERR");this.setStartBefore(w(b,this.startContainer,this.startOffset))},cloneContents:function(){z(this);
var b,a;if(this.collapsed)return v(this).createDocumentFragment();if(this.startContainer===this.endContainer&&k.isCharacterDataNode(this.startContainer))return b=this.startContainer.cloneNode(!0),b.data=b.data.slice(this.startOffset,this.endOffset),a=v(this).createDocumentFragment(),a.appendChild(b),a;a=new l(this,!0);b=g(a);a.detach();return b},canSurroundContents:function(){z(this);G(this.startContainer);G(this.endContainer);var b=new l(this,!0),a=b._first&&y(b._first,this)||b._last&&y(b._last,
this);b.detach();return!a},surroundContents:function(a){F(a,b);if(!this.canSurroundContents())throw new p("BAD_BOUNDARYPOINTS_ERR");var c=this.extractContents();if(a.hasChildNodes())for(;a.lastChild;)a.removeChild(a.lastChild);w(a,this.startContainer,this.startOffset);a.appendChild(c);this.selectNode(a)},cloneRange:function(){z(this);for(var b=new A(v(this)),a=Y.length,c;a--;)c=Y[a],b[c]=this[c];return b},toString:function(){z(this);var b=this.startContainer;if(b===this.endContainer&&k.isCharacterDataNode(b))return 3==
b.nodeType||4==b.nodeType?b.data.slice(this.startOffset,this.endOffset):"";var a=[],b=new l(this,!0);d(b,function(b){3!=b.nodeType&&4!=b.nodeType||a.push(b.data)});b.detach();return a.join("")},compareNode:function(b){z(this);var a=b.parentNode,c=k.getNodeIndex(b);if(!a)throw new E("NOT_FOUND_ERR");b=this.comparePoint(a,c);a=this.comparePoint(a,c+1);return 0>b?0<a?ca:aa:0<a?ba:W},comparePoint:function(b,a){z(this);C(b,"HIERARCHY_REQUEST_ERR");B(b,this.startContainer);return 0>k.comparePoints(b,a,
this.startContainer,this.startOffset)?-1:0<k.comparePoints(b,a,this.endContainer,this.endOffset)?1:0},createContextualFragment:X?function(b){var a=this.startContainer,c=k.getDocument(a);if(!a)throw new E("INVALID_STATE_ERR");var m=null;1==a.nodeType?m=a:k.isCharacterDataNode(a)&&(m=k.parentElement(a));m=null===m||"HTML"==m.nodeName&&k.isHtmlNamespace(k.getDocument(m).documentElement)&&k.isHtmlNamespace(m)?c.createElement("body"):m.cloneNode(!1);m.innerHTML=b;return k.fragmentFromNodeChildren(m)}:
function(b){x(this);var a=v(this).createElement("body");a.innerHTML=b;return k.fragmentFromNodeChildren(a)},toHtml:function(){z(this);var b=v(this).createElement("div");b.appendChild(this.cloneContents());return b.innerHTML},intersectsNode:function(b,a){z(this);C(b,"NOT_FOUND_ERR");if(k.getDocument(b)!==v(this))return!1;var c=b.parentNode,m=k.getNodeIndex(b);C(c,"NOT_FOUND_ERR");var d=k.comparePoints(c,m,this.endContainer,this.endOffset),c=k.comparePoints(c,m+1,this.startContainer,this.startOffset);
return a?0>=d&&0<=c:0>d&&0<c},isPointInRange:function(b,a){z(this);C(b,"HIERARCHY_REQUEST_ERR");B(b,this.startContainer);return 0<=k.comparePoints(b,a,this.startContainer,this.startOffset)&&0>=k.comparePoints(b,a,this.endContainer,this.endOffset)},intersectsRange:function(b,a){z(this);if(v(b)!=v(this))throw new E("WRONG_DOCUMENT_ERR");var c=k.comparePoints(this.startContainer,this.startOffset,b.endContainer,b.endOffset),m=k.comparePoints(this.endContainer,this.endOffset,b.startContainer,b.startOffset);
return a?0>=c&&0<=m:0>c&&0<m},intersection:function(b){if(this.intersectsRange(b)){var a=k.comparePoints(this.startContainer,this.startOffset,b.startContainer,b.startOffset),c=k.comparePoints(this.endContainer,this.endOffset,b.endContainer,b.endOffset),m=this.cloneRange();-1==a&&m.setStart(b.startContainer,b.startOffset);1==c&&m.setEnd(b.endContainer,b.endOffset);return m}return null},union:function(b){if(this.intersectsRange(b,!0)){var a=this.cloneRange();-1==k.comparePoints(b.startContainer,b.startOffset,
this.startContainer,this.startOffset)&&a.setStart(b.startContainer,b.startOffset);1==k.comparePoints(b.endContainer,b.endOffset,this.endContainer,this.endOffset)&&a.setEnd(b.endContainer,b.endOffset);return a}throw new p("Ranges do not intersect");},containsNode:function(b,a){return a?this.intersectsNode(b,!1):this.compareNode(b)==W},containsNodeContents:function(b){return 0<=this.comparePoint(b,0)&&0>=this.comparePoint(b,k.getNodeLength(b))},containsRange:function(b){return this.intersection(b).equals(b)},
containsNodeText:function(b){var a=this.cloneRange();a.selectNode(b);var c=a.getNodes([3]);return 0<c.length?(a.setStart(c[0],0),b=c.pop(),a.setEnd(b,b.length),b=this.containsRange(a),a.detach(),b):this.containsNodeContents(b)},createNodeIterator:function(b,a){z(this);return new c(this,b,a)},getNodes:function(b,a){z(this);return n(this,b,a)},getDocument:function(){return v(this)},collapseBefore:function(b){x(this);this.setEndBefore(b);this.collapse(!1)},collapseAfter:function(b){x(this);this.setStartAfter(b);
this.collapse(!0)},getName:function(){return"DomRange"},equals:function(b){return A.rangesEqual(this,b)},isValid:function(){return J(this)},inspect:function(){return r(this)}};S(A,T,function(b){x(b);b.startContainer=b.startOffset=b.endContainer=b.endOffset=null;b.collapsed=b.commonAncestorContainer=null;u(b,"detach",null);b._listeners=null});a.rangePrototype=P.prototype;A.rangeProperties=Y;A.RangeIterator=l;A.copyComparisonConstants=I;A.createPrototypeRange=S;A.inspect=r;A.getRangeDocument=v;A.rangesEqual=
function(b,a){return b.startContainer===a.startContainer&&b.startOffset===a.startOffset&&b.endContainer===a.endContainer&&b.endOffset===a.endOffset};a.DomRange=A;a.RangeException=p});
rangy.createModule("WrappedRange",function(a){function y(a,f,e,g){var r=a.duplicate();r.collapse(e);var l=r.parentElement();s.isAncestorOf(f,l,!0)||(l=f);if(!l.canHaveHTML)return new t(l.parentNode,s.getNodeIndex(l));f=s.getDocument(l).createElement("span");var p,c=e?"StartToStart":"StartToEnd";do l.insertBefore(f,f.previousSibling),r.moveToElementText(f);while(0<(p=r.compareEndPoints(c,a))&&f.previousSibling);c=f.nextSibling;if(-1==p&&c&&s.isCharacterDataNode(c)){r.setEndPoint(e?"EndToStart":"EndToEnd",
a);if(/[\r\n]/.test(c.data))for(l=r.duplicate(),e=l.text.replace(/\r\n/g,"\r").length,e=l.moveStart("character",e);-1==l.compareEndPoints("StartToEnd",l);)e++,l.moveStart("character",1);else e=r.text.length;l=new t(c,e)}else c=(g||!e)&&f.previousSibling,l=(e=(g||e)&&f.nextSibling)&&s.isCharacterDataNode(e)?new t(e,0):c&&s.isCharacterDataNode(c)?new t(c,c.length):new t(l,s.getNodeIndex(f));f.parentNode.removeChild(f);return l}function v(a,f){var e,g,r=a.offset,l=s.getDocument(a.node),p=l.body.createTextRange(),
c=s.isCharacterDataNode(a.node);c?(e=a.node,g=e.parentNode):(e=a.node.childNodes,e=r<e.length?e[r]:null,g=a.node);l=l.createElement("span");l.innerHTML="&#feff;";e?g.insertBefore(l,e):g.appendChild(l);p.moveToElementText(l);p.collapse(!f);g.removeChild(l);if(c)p[f?"moveStart":"moveEnd"]("character",r);return p}a.requireModules(["DomUtil","DomRange"]);var u,s=a.dom,t=s.DomPosition,w=a.DomRange;if(a.features.implementsDomRange&&(!a.features.implementsTextRange||!a.config.preferTextRange))(function(){function d(a){for(var c=
e.length,d;c--;)d=e[c],a[d]=a.nativeRange[d]}var f,e=w.rangeProperties,g,r;u=function(a){if(!a)throw Error("Range must be specified");this.nativeRange=a;d(this)};w.createPrototypeRange(u,function(a,c,d,e,f){var g=a.endContainer!==e||a.endOffset!=f;if(a.startContainer!==c||a.startOffset!=d||g)a.setEnd(e,f),a.setStart(c,d)},function(a){a.nativeRange.detach();a.detached=!0;for(var c=e.length,d;c--;)d=e[c],a[d]=null});f=u.prototype;f.selectNode=function(a){this.nativeRange.selectNode(a);d(this)};f.deleteContents=
function(){this.nativeRange.deleteContents();d(this)};f.extractContents=function(){var a=this.nativeRange.extractContents();d(this);return a};f.cloneContents=function(){return this.nativeRange.cloneContents()};f.surroundContents=function(a){this.nativeRange.surroundContents(a);d(this)};f.collapse=function(a){this.nativeRange.collapse(a);d(this)};f.cloneRange=function(){return new u(this.nativeRange.cloneRange())};f.refresh=function(){d(this)};f.toString=function(){return this.nativeRange.toString()};
var l=document.createTextNode("test");s.getBody(document).appendChild(l);var p=document.createRange();p.setStart(l,0);p.setEnd(l,0);try{p.setStart(l,1),g=!0,f.setStart=function(a,c){this.nativeRange.setStart(a,c);d(this)},f.setEnd=function(a,c){this.nativeRange.setEnd(a,c);d(this)},r=function(a){return function(c){this.nativeRange[a](c);d(this)}}}catch(c){g=!1,f.setStart=function(a,c){try{this.nativeRange.setStart(a,c)}catch(e){this.nativeRange.setEnd(a,c),this.nativeRange.setStart(a,c)}d(this)},
f.setEnd=function(a,c){try{this.nativeRange.setEnd(a,c)}catch(e){this.nativeRange.setStart(a,c),this.nativeRange.setEnd(a,c)}d(this)},r=function(a,c){return function(e){try{this.nativeRange[a](e)}catch(f){this.nativeRange[c](e),this.nativeRange[a](e)}d(this)}}}f.setStartBefore=r("setStartBefore","setEndBefore");f.setStartAfter=r("setStartAfter","setEndAfter");f.setEndBefore=r("setEndBefore","setStartBefore");f.setEndAfter=r("setEndAfter","setStartAfter");p.selectNodeContents(l);f.selectNodeContents=
p.startContainer==l&&p.endContainer==l&&0==p.startOffset&&p.endOffset==l.length?function(a){this.nativeRange.selectNodeContents(a);d(this)}:function(a){this.setStart(a,0);this.setEnd(a,w.getEndOffset(a))};p.selectNodeContents(l);p.setEnd(l,3);g=document.createRange();g.selectNodeContents(l);g.setEnd(l,4);g.setStart(l,2);f.compareBoundaryPoints=-1==p.compareBoundaryPoints(p.START_TO_END,g)&1==p.compareBoundaryPoints(p.END_TO_START,g)?function(a,c){c=c.nativeRange||c;a==c.START_TO_END?a=c.END_TO_START:
a==c.END_TO_START&&(a=c.START_TO_END);return this.nativeRange.compareBoundaryPoints(a,c)}:function(a,c){return this.nativeRange.compareBoundaryPoints(a,c.nativeRange||c)};a.util.isHostMethod(p,"createContextualFragment")&&(f.createContextualFragment=function(a){return this.nativeRange.createContextualFragment(a)});s.getBody(document).removeChild(l);p.detach();g.detach()})(),a.createNativeRange=function(a){a=a||document;return a.createRange()};else if(a.features.implementsTextRange){u=function(a){this.textRange=
a;this.refresh()};u.prototype=new w(document);u.prototype.refresh=function(){var a,f,e=this.textRange;a=e.parentElement();var g=e.duplicate();g.collapse(!0);f=g.parentElement();g=e.duplicate();g.collapse(!1);e=g.parentElement();f=f==e?f:s.getCommonAncestor(f,e);f=f==a?f:s.getCommonAncestor(a,f);0==this.textRange.compareEndPoints("StartToEnd",this.textRange)?f=a=y(this.textRange,f,!0,!0):(a=y(this.textRange,f,!0,!1),f=y(this.textRange,f,!1,!1));this.setStart(a.node,a.offset);this.setEnd(f.node,f.offset)};
w.copyComparisonConstants(u);var g=function(){return this}();"undefined"==typeof g.Range&&(g.Range=u);a.createNativeRange=function(a){a=a||document;return a.body.createTextRange()}}a.features.implementsTextRange&&(u.rangeToTextRange=function(a){if(a.collapsed)return v(new t(a.startContainer,a.startOffset),!0);var f=v(new t(a.startContainer,a.startOffset),!0),e=v(new t(a.endContainer,a.endOffset),!1);a=s.getDocument(a.startContainer).body.createTextRange();a.setEndPoint("StartToStart",f);a.setEndPoint("EndToEnd",
e);return a});u.prototype.getName=function(){return"WrappedRange"};a.WrappedRange=u;a.createRange=function(d){d=d||document;return new u(a.createNativeRange(d))};a.createRangyRange=function(a){a=a||document;return new w(a)};a.createIframeRange=function(d){return a.createRange(s.getIframeDocument(d))};a.createIframeRangyRange=function(d){return a.createRangyRange(s.getIframeDocument(d))};a.addCreateMissingNativeApiListener(function(d){d=d.document;"undefined"==typeof d.createRange&&(d.createRange=
function(){return a.createRange(this)});d=d=null})});
rangy.createModule("WrappedSelection",function(a,y){function v(b){return(b||window).getSelection()}function u(b){return(b||window).document.selection}function s(b,a,c){var d=c?"end":"start";c=c?"start":"end";b.anchorNode=a[d+"Container"];b.anchorOffset=a[d+"Offset"];b.focusNode=a[c+"Container"];b.focusOffset=a[c+"Offset"]}function t(b){b.anchorNode=b.focusNode=null;b.anchorOffset=b.focusOffset=0;b.rangeCount=0;b.isCollapsed=!0;b._ranges.length=0}function w(b){var m;b instanceof D?(m=b._selectionNativeRange,
m||(m=a.createNativeRange(c.getDocument(b.startContainer)),m.setEnd(b.endContainer,b.endOffset),m.setStart(b.startContainer,b.startOffset),b._selectionNativeRange=m,b.attachListener("detach",function(){this._selectionNativeRange=null}))):b instanceof x?m=b.nativeRange:a.features.implementsDomRange&&b instanceof c.getWindow(b.startContainer).Range&&(m=b);return m}function g(b){var a=b.getNodes(),d;a:if(a.length&&1==a[0].nodeType){d=1;for(var e=a.length;d<e;++d)if(!c.isAncestorOf(a[0],a[d])){d=!1;break a}d=
!0}else d=!1;if(!d)throw Error("getSingleElementFromRange: range "+b.inspect()+" did not consist of a single element");return a[0]}function d(b,a){var c=new x(a);b._ranges=[c];s(b,c,!1);b.rangeCount=1;b.isCollapsed=c.collapsed}function f(b){b._ranges.length=0;if("None"==b.docSelection.type)t(b);else{var m=b.docSelection.createRange();if(m&&"undefined"!=typeof m.text)d(b,m);else{b.rangeCount=m.length;for(var e,f=c.getDocument(m.item(0)),g=0;g<b.rangeCount;++g)e=a.createRange(f),e.selectNode(m.item(g)),
b._ranges.push(e);b.isCollapsed=1==b.rangeCount&&b._ranges[0].collapsed;s(b,b._ranges[b.rangeCount-1],!1)}}}function e(b,a){for(var d=b.docSelection.createRange(),e=g(a),k=c.getDocument(d.item(0)),k=c.getBody(k).createControlRange(),l=0,n=d.length;l<n;++l)k.add(d.item(l));try{k.add(e)}catch(p){throw Error("addRange(): Element within the specified Range could not be added to control selection (does it have layout?)");}k.select();f(b)}function n(b,a,c){this.nativeSelection=b;this.docSelection=a;this._ranges=
[];this.win=c;this.refresh()}function r(b,a){for(var d=c.getDocument(a[0].startContainer),d=c.getBody(d).createControlRange(),e=0,k;e<rangeCount;++e){k=g(a[e]);try{d.add(k)}catch(l){throw Error("setRanges(): Element within the one of the specified Ranges could not be added to control selection (does it have layout?)");}}d.select();f(b)}function l(b,a){if(b.anchorNode&&c.getDocument(b.anchorNode)!==c.getDocument(a))throw new F("WRONG_DOCUMENT_ERR");}function p(b){var a=[],c=new H(b.anchorNode,b.anchorOffset),
d=new H(b.focusNode,b.focusOffset),e="function"==typeof b.getName?b.getName():"Selection";if("undefined"!=typeof b.rangeCount)for(var f=0,g=b.rangeCount;f<g;++f)a[f]=D.inspect(b.getRangeAt(f));return"["+e+"(Ranges: "+a.join(", ")+")(anchor: "+c.inspect()+", focus: "+d.inspect()+"]"}a.requireModules(["DomUtil","DomRange","WrappedRange"]);a.config.checkSelectionRanges=!0;var c=a.dom,q=a.util,D=a.DomRange,x=a.WrappedRange,F=a.DOMException,H=c.DomPosition,B,G,C=a.util.isHostMethod(window,"getSelection"),
J=a.util.isHostObject(document,"selection"),z=J&&(!C||a.config.preferTextRange);z?(B=u,a.isSelectionValid=function(b){b=(b||window).document;var a=b.selection;return"None"!=a.type||c.getDocument(a.createRange().parentElement())==b}):C?(B=v,a.isSelectionValid=function(){return!0}):y.fail("Neither document.selection or window.getSelection() detected.");a.getNativeSelection=B;var C=B(),P=a.createNativeRange(document),K=c.getBody(document),I=q.areHostObjects(C,q.areHostProperties(C,["anchorOffset","focusOffset"]));
a.features.selectionHasAnchorAndFocus=I;var Q=q.isHostMethod(C,"extend");a.features.selectionHasExtend=Q;var S="number"==typeof C.rangeCount;a.features.selectionHasRangeCount=S;var R=!1,T=!0;q.areHostMethods(C,["addRange","getRangeAt","removeAllRanges"])&&"number"==typeof C.rangeCount&&a.features.implementsDomRange&&function(){var b=document.createElement("iframe");b.frameBorder=0;b.style.position="absolute";b.style.left="-10000px";K.appendChild(b);var a=c.getIframeDocument(b);a.open();a.write("<html><head></head><body>12</body></html>");
a.close();var d=c.getIframeWindow(b).getSelection(),e=a.documentElement.lastChild.firstChild,a=a.createRange();a.setStart(e,1);a.collapse(!0);d.addRange(a);T=1==d.rangeCount;d.removeAllRanges();var f=a.cloneRange();a.setStart(e,0);f.setEnd(e,2);d.addRange(a);d.addRange(f);R=2==d.rangeCount;a.detach();f.detach();K.removeChild(b)}();a.features.selectionSupportsMultipleRanges=R;a.features.collapsedNonEditableSelectionsSupported=T;var A=!1,k;K&&q.isHostMethod(K,"createControlRange")&&(k=K.createControlRange(),
q.areHostProperties(k,["item","add"])&&(A=!0));a.features.implementsControlRange=A;G=I?function(b){return b.anchorNode===b.focusNode&&b.anchorOffset===b.focusOffset}:function(b){return b.rangeCount?b.getRangeAt(b.rangeCount-1).collapsed:!1};var L;q.isHostMethod(C,"getRangeAt")?L=function(b,a){try{return b.getRangeAt(a)}catch(c){return null}}:I&&(L=function(b){var d=c.getDocument(b.anchorNode),d=a.createRange(d);d.setStart(b.anchorNode,b.anchorOffset);d.setEnd(b.focusNode,b.focusOffset);d.collapsed!==
this.isCollapsed&&(d.setStart(b.focusNode,b.focusOffset),d.setEnd(b.anchorNode,b.anchorOffset));return d});a.getSelection=function(b){b=b||window;var a=b._rangySelection,c=B(b),d=J?u(b):null;a?(a.nativeSelection=c,a.docSelection=d,a.refresh(b)):(a=new n(c,d,b),b._rangySelection=a);return a};a.getIframeSelection=function(b){return a.getSelection(c.getIframeWindow(b))};k=n.prototype;if(!z&&I&&q.areHostMethods(C,["removeAllRanges","addRange"])){k.removeAllRanges=function(){this.nativeSelection.removeAllRanges();
t(this)};var E=function(b,c){var d=D.getRangeDocument(c),d=a.createRange(d);d.collapseToPoint(c.endContainer,c.endOffset);b.nativeSelection.addRange(w(d));b.nativeSelection.extend(c.startContainer,c.startOffset);b.refresh()};k.addRange=S?function(b,c){if(A&&J&&"Control"==this.docSelection.type)e(this,b);else if(c&&Q)E(this,b);else{var d;R?d=this.rangeCount:(this.removeAllRanges(),d=0);this.nativeSelection.addRange(w(b));this.rangeCount=this.nativeSelection.rangeCount;this.rangeCount==d+1?(a.config.checkSelectionRanges&&
(d=L(this.nativeSelection,this.rangeCount-1))&&!D.rangesEqual(d,b)&&(b=new x(d)),this._ranges[this.rangeCount-1]=b,s(this,b,N(this.nativeSelection)),this.isCollapsed=G(this)):this.refresh()}}:function(b,a){a&&Q?E(this,b):(this.nativeSelection.addRange(w(b)),this.refresh())};k.setRanges=function(b){if(A&&1<b.length)r(this,b);else{this.removeAllRanges();for(var a=0,c=b.length;a<c;++a)this.addRange(b[a])}}}else if(q.isHostMethod(C,"empty")&&q.isHostMethod(P,"select")&&A&&z)k.removeAllRanges=function(){try{if(this.docSelection.empty(),
"None"!=this.docSelection.type){var b;if(this.anchorNode)b=c.getDocument(this.anchorNode);else if("Control"==this.docSelection.type){var a=this.docSelection.createRange();a.length&&(b=c.getDocument(a.item(0)).body.createTextRange())}b&&(b.body.createTextRange().select(),this.docSelection.empty())}}catch(d){}t(this)},k.addRange=function(b){"Control"==this.docSelection.type?e(this,b):(x.rangeToTextRange(b).select(),this._ranges[0]=b,this.rangeCount=1,this.isCollapsed=this._ranges[0].collapsed,s(this,
b,!1))},k.setRanges=function(b){this.removeAllRanges();var a=b.length;1<a?r(this,b):a&&this.addRange(b[0])};else return y.fail("No means of selecting a Range or TextRange was found"),!1;k.getRangeAt=function(b){if(0>b||b>=this.rangeCount)throw new F("INDEX_SIZE_ERR");return this._ranges[b]};var M;if(z)M=function(b){var e;a.isSelectionValid(b.win)?e=b.docSelection.createRange():(e=c.getBody(b.win.document).createTextRange(),e.collapse(!0));"Control"==b.docSelection.type?f(b):e&&"undefined"!=typeof e.text?
d(b,e):t(b)};else if(q.isHostMethod(C,"getRangeAt")&&"number"==typeof C.rangeCount)M=function(b){if(A&&J&&"Control"==b.docSelection.type)f(b);else if(b._ranges.length=b.rangeCount=b.nativeSelection.rangeCount,b.rangeCount){for(var c=0,d=b.rangeCount;c<d;++c)b._ranges[c]=new a.WrappedRange(b.nativeSelection.getRangeAt(c));s(b,b._ranges[b.rangeCount-1],N(b.nativeSelection));b.isCollapsed=G(b)}else t(b)};else if(I&&"boolean"==typeof C.isCollapsed&&"boolean"==typeof P.collapsed&&a.features.implementsDomRange)M=
function(b){var a;a=b.nativeSelection;a.anchorNode?(a=L(a,0),b._ranges=[a],b.rangeCount=1,a=b.nativeSelection,b.anchorNode=a.anchorNode,b.anchorOffset=a.anchorOffset,b.focusNode=a.focusNode,b.focusOffset=a.focusOffset,b.isCollapsed=G(b)):t(b)};else return y.fail("No means of obtaining a Range or TextRange from the user's selection was found"),!1;k.refresh=function(b){var a=b?this._ranges.slice(0):null;M(this);if(b){b=a.length;if(b!=this._ranges.length)return!1;for(;b--;)if(!D.rangesEqual(a[b],this._ranges[b]))return!1;
return!0}};var O=function(b,a){var c=b.getAllRanges(),d=!1;b.removeAllRanges();for(var e=0,f=c.length;e<f;++e)d||a!==c[e]?b.addRange(c[e]):d=!0;b.rangeCount||t(b)};k.removeRange=A?function(b){if("Control"==this.docSelection.type){var a=this.docSelection.createRange();b=g(b);for(var d=c.getDocument(a.item(0)),d=c.getBody(d).createControlRange(),e,k=!1,l=0,n=a.length;l<n;++l)e=a.item(l),e!==b||k?d.add(a.item(l)):k=!0;d.select();f(this)}else O(this,b)}:function(b){O(this,b)};var N;!z&&I&&a.features.implementsDomRange?
(N=function(b){var a=!1;b.anchorNode&&(a=1==c.comparePoints(b.anchorNode,b.anchorOffset,b.focusNode,b.focusOffset));return a},k.isBackwards=function(){return N(this)}):N=k.isBackwards=function(){return!1};k.toString=function(){for(var b=[],a=0,c=this.rangeCount;a<c;++a)b[a]=""+this._ranges[a];return b.join("")};k.collapse=function(b,d){l(this,b);var e=a.createRange(c.getDocument(b));e.collapseToPoint(b,d);this.removeAllRanges();this.addRange(e);this.isCollapsed=!0};k.collapseToStart=function(){if(this.rangeCount){var b=
this._ranges[0];this.collapse(b.startContainer,b.startOffset)}else throw new F("INVALID_STATE_ERR");};k.collapseToEnd=function(){if(this.rangeCount){var b=this._ranges[this.rangeCount-1];this.collapse(b.endContainer,b.endOffset)}else throw new F("INVALID_STATE_ERR");};k.selectAllChildren=function(b){l(this,b);var d=a.createRange(c.getDocument(b));d.selectNodeContents(b);this.removeAllRanges();this.addRange(d)};k.deleteFromDocument=function(){if(A&&J&&"Control"==this.docSelection.type){for(var b=this.docSelection.createRange(),
a;b.length;)a=b.item(0),b.remove(a),a.parentNode.removeChild(a);this.refresh()}else if(this.rangeCount){b=this.getAllRanges();this.removeAllRanges();a=0;for(var c=b.length;a<c;++a)b[a].deleteContents();this.addRange(b[c-1])}};k.getAllRanges=function(){return this._ranges.slice(0)};k.setSingleRange=function(a){this.setRanges([a])};k.containsNode=function(a,c){for(var d=0,e=this._ranges.length;d<e;++d)if(this._ranges[d].containsNode(a,c))return!0;return!1};k.toHtml=function(){var a="";if(this.rangeCount){for(var a=
D.getRangeDocument(this._ranges[0]).createElement("div"),c=0,d=this._ranges.length;c<d;++c)a.appendChild(this._ranges[c].cloneContents());a=a.innerHTML}return a};k.getName=function(){return"WrappedSelection"};k.inspect=function(){return p(this)};k.detach=function(){this.win=this.anchorNode=this.focusNode=this.win._rangySelection=null};n.inspect=p;a.Selection=n;a.selectionPrototype=k;a.addCreateMissingNativeApiListener(function(b){"undefined"==typeof b.getSelection&&(b.getSelection=function(){return a.getSelection(this)});
b=null})});


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
        var $canvas = $("<canvas wcelement='arrows'></canvas>");
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

/// tappable starts

(function(root, factory){
  // Set up Tappable appropriately for the environment.
    // Browser global scope
    factory(root, window.document);
}(this, function(w, d){

  var abs = Math.abs,
    noop = function(){},
    defaults = {
      noScroll: false,
      activeClass: 'tappable-active',
      onTap: noop,
      onStart: noop,
      onMove: noop,
      onMoveOut: noop,
      onMoveIn: noop,
      onEnd: noop,
      onCancel: noop,
      allowClick: false,
      boundMargin: 50,
      noScrollDelay: 0,
      activeClassDelay: 0,
      inactiveClassDelay: 0
    },
    supportTouch = 'ontouchend' in document,
    events = {
      start: supportTouch ? 'touchstart' : 'mousedown',
      move: supportTouch ? 'touchmove' : 'mousemove',
      end: supportTouch ? 'touchend' : 'mouseup'
    },
    getTargetByCoords = function(x, y){
      var el = d.elementFromPoint(x, y);
      if (el.nodeType == 3) el = el.parentNode;
      return el;
    },
    getTarget = function(e){
      var el = e.target;
      if (el) {
        if (el.nodeType == 3) el = el.parentNode;
        return el;
      }
      var touch = e.targetTouches[0];
      return getTargetByCoords(touch.clientX, touch.clientY);
    },
    clean = function(str){
      return str.replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
    },
    addClass = function(el, className){
      if (!className) return;
      if (el.classList){
        el.classList.add(className);
        return;
      }
      if (clean(el.className).indexOf(className) > -1) return;
      el.className = clean(el.className + ' ' + className);
    },
    removeClass = function(el, className){
      if (!className) return;
      if (el.classList){
        el.classList.remove(className);
        return;
      }
      el.className = el.className.replace(new RegExp('(^|\\s)' + className + '(?:\\s|$)'), '$1');
    },
    matchesSelector = function(node, selector){
     if (webC.util.isIE()) {
        var hits = node.parentNode.querySelectorAll(selector),
        l = hits.length,
        i=0;

        for (;i<l;i++) {
            if (hits[i] == node) {
                return true;
            }
        }
        return false;

     } else {
     var root = d.documentElement,
      matches = root.matchesSelector || root.mozMatchesSelector || root.webkitMatchesSelector || root.oMatchesSelector || root.msMatchesSelector;
      return matches.call(node, selector);
     }
    },
    closest = function(node, selector){
      var matches = false;
      do {
        matches = matchesSelector(node, selector);
      } while (!matches && (node = node.parentNode) && node.ownerDocument);
      return matches ? node : false;
    };

  w.tappable = function(selector, opts){
    if (typeof opts == 'function') opts = { onTap: opts };
    var options = {};
    for (var key in defaults) options[key] = opts[key] || defaults[key];

    var el = options.containerElement || d.body,
      startTarget,
      prevTarget,
      startX,
      startY,
      elBound,
      cancel = false,
      moveOut = false,
      activeClass = options.activeClass,
      activeClassDelay = options.activeClassDelay,
      activeClassTimeout,
      inactiveClassDelay = options.inactiveClassDelay,
      inactiveClassTimeout,
      noScroll = options.noScroll,
      noScrollDelay = options.noScrollDelay,
      noScrollTimeout,
      boundMargin = options.boundMargin;

    var onStart = function(e){
      var target = closest(getTarget(e), selector);
      if (!target) return;

      // exclude list for touch devices
      if ( $(target).is("#wcfControl,#jGrowl,#jGrowl *,[wcelement],[wcelement] *")) return;

      if (activeClassDelay){
        clearTimeout(activeClassTimeout);
        activeClassTimeout = setTimeout(function(){
          addClass(target, activeClass);
        }, activeClassDelay);
      } else {
        addClass(target, activeClass);
      }
      if (inactiveClassDelay && target == prevTarget) clearTimeout(inactiveClassTimeout);

      startX = e.clientX;
      startY = e.clientY;
      if (!startX || !startY){
        var touch = e.targetTouches[0];
        startX = touch.clientX;
        startY = touch.clientY;
      }
      startTarget = target;
      cancel = false;
      moveOut = false;
      elBound = noScroll ? target.getBoundingClientRect() : null;

      if (noScrollDelay){
        clearTimeout(noScrollTimeout);
        noScroll = false; // set false first, then true after a delay
        noScrollTimeout = setTimeout(function(){
          noScroll = true;
        }, noScrollDelay);
      }
      options.onStart.call(el, e, target);
    };

    var onMove = function(e){
      if (!startTarget) return;

      if (noScroll){
        e.preventDefault();
      } else {
        clearTimeout(activeClassTimeout);
      }

      var target = e.target,
        x = e.clientX,
        y = e.clientY;
      if (!target || !x || !y){ // The event might have a target but no clientX/Y
        var touch = e.changedTouches[0];
        if (!x) x = touch.clientX;
        if (!y) y = touch.clientY;
        if (!target) target = getTargetByCoords(x, y);
      }

      if (noScroll){
        if (x>elBound.left-boundMargin && x<elBound.right+boundMargin && y>elBound.top-boundMargin && y<elBound.bottom+boundMargin){ // within element's boundary
          moveOut = false;
          addClass(startTarget, activeClass);
          options.onMoveIn.call(el, e, target);
        } else {
          moveOut = true;
          removeClass(startTarget, activeClass);
          options.onMoveOut.call(el, e, target);
        }
      } else if (!cancel && abs(y - startY) > 10){
        cancel = true;
        removeClass(startTarget, activeClass);
        options.onCancel.call(target, e);
      }

      options.onMove.call(el, e, target);
    };

    var onEnd = function(e){
      if (!startTarget) return;

      clearTimeout(activeClassTimeout);
      if (inactiveClassDelay){
        if (activeClassDelay && !cancel) addClass(startTarget, activeClass);
        var activeTarget = startTarget;
        inactiveClassTimeout = setTimeout(function(){
          removeClass(activeTarget, activeClass);
        }, inactiveClassDelay);
      } else {
        removeClass(startTarget, activeClass);
      }

      options.onEnd.call(el, e, startTarget);

      var rightClick = e.which == 3 || e.button == 2;
      if (!cancel && !moveOut && !rightClick){
        options.onTap.call(el, e, startTarget);
      }

      prevTarget = startTarget;
      startTarget = null;
      setTimeout(function(){
        startX = startY = null;
      }, 400);
    };

    var onCancel = function(e){
      if (!startTarget) return;
      removeClass(startTarget, activeClass);
      startTarget = startX = startY = null;
      options.onCancel.call(el, e);
    };

    var onClick = function(e){
      var target = closest(e.target, selector);

      if (target){
        e.preventDefault();
      } else if (startX && startY && abs(e.clientX - startX) < 25 && abs(e.clientY - startY) < 25){
        e.stopPropagation();
        e.preventDefault();
      }
    };

    var onClickIE8 = function(e){
        e.cancelBubble=true;
        e.returnValue = false;
        options.onTap.call(el, e);        
    };
    
    if (!webC.util.isIE()) {

    el.addEventListener(events.start, onStart, false);

    el.addEventListener(events.move, onMove, false);

    el.addEventListener(events.end, onEnd, false);

    el.addEventListener('touchcancel', onCancel, false);

    if (!options.allowClick) el.addEventListener('click', onClick, false);
    } else {
      el.attachEvent("onclick",onClickIE8);
    }

    return {
      el : el,
      destroy : function () {
        el.removeEventListener(events.start, onStart, false);
        el.removeEventListener(events.move, onMove, false);
        el.removeEventListener(events.end, onEnd, false);
        el.removeEventListener('touchcancel', onCancel, false);
        if (!options.allowClick) el.removeEventListener('click', onClick, false);

        return this;
      }
    };

  };

}));


$.fn.getParentBg = function() {
    // Is current element's background color set?
    var color = $(this).css("background-color");
    if (color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent' ) {
        // if so then return that color
         // console.info(color);
        return color;
    }

    // if not: are you at the body element?
    if ($(this).is("body")) {
        // return known 'false' value
        return false;
    } else {
        // call getBackground with parent item
        return $(this).parent().getParentBg();
    }
}

$.fn.center = function () {
//    this.css("position","absolute");
//    this.css("top", Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) + $(window).scrollTop()) + "px");
//    this.css("left", Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + $(window).scrollLeft()) + "px");

  var params = {
    top : Math.max(0, (($(window).height() - $(this).outerHeight()) / 2) + $(window).scrollTop()) + "px",
    left : Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + $(window).scrollLeft()) + "px",
    opacity : 1,
    padding:'10px'
  };
  
  
  $(this).animate(params, 800, false, function () {});
                                                  
    return this;
};

/*
  jQuery-GetPath v0.2, by Francois-Guillaume Ribreau.

  http://blog.geekfg.net/2010/06/trouver-le-selecteur-jquery-dun-element.html

  Copyright (c)2010 Francois-Guillaume Ribreau. All rights reserved.
  Released under the Creative Commons BY-SA Conditions.
    http://creativecommons.org/licenses/by-sa/3.0/

  Usage:
  var path = $('#foo').getPath();
*/
(function(a) {
a.fn.getPath2 = function() {
  var el = this;
  if (!el) return false;
  if(el.jquery) el = el[0];

  if(el.nodeName && el.nodeName.toLowerCase() == '#document')
    return 'jQueryPath_document';// == window.document

  if(el.location)
    return 'jQueryPath_window';// == window

  var path = findBestSelector(el, true);

  while ( el.parentNode && el.parentNode.nodeName !== '#document'
      && (!(el.id && el.id.indexOf('.') == -1))) {
    el = el.parentNode;
    path = findBestSelector(el) + '>' + path;
  }
  return path;
}

/*
 * Helpers
 */
 
   //Helper (we use jQuery as less as possible)
var next = (function() {
   var t = $('<div><p></p><p></p></div>')[0].childNodes[1];

   if (t.previousElementSibling && typeof(t.previousElementSibling) === 'object') {
     return function(el) {
     return el.previousElementSibling;
     };
   } else {
     return function(el) {
       return $(el).prev()[0]
     };
   }
   })();

 //Retreive the index of an element
var getIndex = function(el) {
 if (el.previousElementSibling === null)
   return 0;

 var _el = el,
     i = 0,
     elT = el.nodeName;

 while (_el = next(_el)) {
   if (_el.nodeName == elT)
     i++;
 }
 return i;
};

var findBestSelector = function(el, firstEl) {
 var first = firstEl || false,
     sel = '',
     id_uniq = true,
     index = false;
 //if (el.id && $('[id="'+el.id+'"]').length>1) id_uniq = false;
 
 if (el.id && el.id.indexOf('.') == -1 && $('[id="'+el.id+'"]').length==1) {
   //because $('#my.id') didn't work width jQuery
   sel += '#' + el.id;
 } else {
   sel += el.nodeName.toLowerCase();

   var indexEl = getIndex(el);
   if (indexEl || first) {
     sel += ':eq(' + indexEl + ')';
   }
 }

 return sel;
}

})($);

$.fn.getPathOriginal = function () {
    if (this.length != 1) throw 'Requires one element.';

    var path, node = this;
    while (node.length) {
        var realNode = node[0], name = realNode.localName;
        if (!name) break;

        name = name.toLowerCase();
        if (realNode.id && $('[id="'+realNode.id+'"]').length==1) {
            // As soon as an id is found, there's no need to specify more.
            return name + '#' + realNode.id + (path ? '>' + path : '');
        } else if (realNode.className) {
            //console.info(realNode.className.replace(/\:/g, "\\\\\$&"));
            // console.info(realNode.className);
            var c = $.trim(realNode.className).split(/\s+/);
            $.each(c, function(i, val) {
                if (!val.search(/:/))
                name += '.' + val;        
            });
            //name += '.' + $.trim(realNode.className).split(/\s+/).join('.');
        }
        var parent = node.parent(), siblings = parent.children(name);
        if (siblings.length > 1) name += ':eq(' + siblings.index(node) + ')';
        path = name + (path ? '>' + path : '');

        node = parent;
    }
    return path;
};

$.fn.exists = function(){return this.length>0;}

/*
$.fn.getXpath = function(){
 if (this.length != 1) throw 'Requires one element.';
 var xpath = '',
 element = this[0];
    for ( ; element && element.nodeType == 1; element = element.parentNode )
    {
        var id = $(element.parentNode).children(element.tagName).index(element) + 1;
        id > 1 ? (id = '[' + id + ']') : (id = '');
        xpath = '/' + element.tagName.toLowerCase() + id + xpath;
    }
    return xpath;

 };
 */

$.fn.copyCSS = function(source){
    var dom = $(source).get(0);
    var style;
    var dest = {};
    if(window.getComputedStyle){
        var camelize = function(a,b){
            return b.toUpperCase();
        };
        style = window.getComputedStyle(dom, null);
        for(var i = 0, l = style.length; i < l; i++){
            var prop = style[i];
            var camel = prop.replace(/\-([a-z])/g, camelize);
            var val = style.getPropertyValue(prop);
            dest[camel] = val;
        };
        return this.css(dest);
    };
    if(style = dom.currentStyle){
        for(var prop in style){
            dest[prop] = style[prop];
        };
        return this.css(dest);
   };
   if(style = dom.style){
      for(var prop in style){
        if(typeof style[prop] != 'function'){
          dest[prop] = style[prop];
        };
      };
    };
    return this.css(dest);
};

// Backbone 1.1.2
(function(jqlocal){var t=this;var e=t.Backbone;var i=[];var r=i.push;var s=i.slice;var n=i.splice;var a;if(typeof exports!=="undefined"){a=exports}else{a=t.Backbone={}}a.VERSION="1.0.0";var h=t._;if(!h&&typeof require!=="undefined")h=require("underscore");a.$=jqlocal;a.noConflict=function(){t.Backbone=e;return this};a.emulateHTTP=false;a.emulateJSON=false;var o=a.Events={on:function(t,e,i){if(!l(this,"on",t,[e,i])||!e)return this;this._events||(this._events={});var r=this._events[t]||(this._events[t]=[]);r.push({callback:e,context:i,ctx:i||this});return this},once:function(t,e,i){if(!l(this,"once",t,[e,i])||!e)return this;var r=this;var s=h.once(function(){r.off(t,s);e.apply(this,arguments)});s._callback=e;return this.on(t,s,i)},off:function(t,e,i){var r,s,n,a,o,u,c,f;if(!this._events||!l(this,"off",t,[e,i]))return this;if(!t&&!e&&!i){this._events={};return this}a=t?[t]:h.keys(this._events);for(o=0,u=a.length;o<u;o++){t=a[o];if(n=this._events[t]){this._events[t]=r=[];if(e||i){for(c=0,f=n.length;c<f;c++){s=n[c];if(e&&e!==s.callback&&e!==s.callback._callback||i&&i!==s.context){r.push(s)}}}if(!r.length)delete this._events[t]}}return this},trigger:function(t){if(!this._events)return this;var e=s.call(arguments,1);if(!l(this,"trigger",t,e))return this;var i=this._events[t];var r=this._events.all;if(i)c(i,e);if(r)c(r,arguments);return this},stopListening:function(t,e,i){var r=this._listeners;if(!r)return this;var s=!e&&!i;if(typeof e==="object")i=this;if(t)(r={})[t._listenerId]=t;for(var n in r){r[n].off(e,i,this);if(s)delete this._listeners[n]}return this}};var u=/\s+/;var l=function(t,e,i,r){if(!i)return true;if(typeof i==="object"){for(var s in i){t[e].apply(t,[s,i[s]].concat(r))}return false}if(u.test(i)){var n=i.split(u);for(var a=0,h=n.length;a<h;a++){t[e].apply(t,[n[a]].concat(r))}return false}return true};var c=function(t,e){var i,r=-1,s=t.length,n=e[0],a=e[1],h=e[2];switch(e.length){case 0:while(++r<s)(i=t[r]).callback.call(i.ctx);return;case 1:while(++r<s)(i=t[r]).callback.call(i.ctx,n);return;case 2:while(++r<s)(i=t[r]).callback.call(i.ctx,n,a);return;case 3:while(++r<s)(i=t[r]).callback.call(i.ctx,n,a,h);return;default:while(++r<s)(i=t[r]).callback.apply(i.ctx,e)}};var f={listenTo:"on",listenToOnce:"once"};h.each(f,function(t,e){o[e]=function(e,i,r){var s=this._listeners||(this._listeners={});var n=e._listenerId||(e._listenerId=h.uniqueId("l"));s[n]=e;if(typeof i==="object")r=this;e[t](i,r,this);return this}});o.bind=o.on;o.unbind=o.off;h.extend(a,o);var d=a.Model=function(t,e){var i;var r=t||{};e||(e={});this.cid=h.uniqueId("c");this.attributes={};h.extend(this,h.pick(e,p));if(e.parse)r=this.parse(r,e)||{};if(i=h.result(this,"defaults")){r=h.defaults({},r,i)}this.set(r,e);this.changed={};this.initialize.apply(this,arguments)};var p=["url","urlRoot","collection"];h.extend(d.prototype,o,{changed:null,validationError:null,idAttribute:"id",initialize:function(){},toJSON:function(t){return h.clone(this.attributes)},sync:function(){return a.sync.apply(this,arguments)},get:function(t){return this.attributes[t]},escape:function(t){return h.escape(this.get(t))},has:function(t){return this.get(t)!=null},set:function(t,e,i){var r,s,n,a,o,u,l,c;if(t==null)return this;if(typeof t==="object"){s=t;i=e}else{(s={})[t]=e}i||(i={});if(!this._validate(s,i))return false;n=i.unset;o=i.silent;a=[];u=this._changing;this._changing=true;if(!u){this._previousAttributes=h.clone(this.attributes);this.changed={}}c=this.attributes,l=this._previousAttributes;if(this.idAttribute in s)this.id=s[this.idAttribute];for(r in s){e=s[r];if(!h.isEqual(c[r],e))a.push(r);if(!h.isEqual(l[r],e)){this.changed[r]=e}else{delete this.changed[r]}n?delete c[r]:c[r]=e}if(!o){if(a.length)this._pending=true;for(var f=0,d=a.length;f<d;f++){this.trigger("change:"+a[f],this,c[a[f]],i)}}if(u)return this;if(!o){while(this._pending){this._pending=false;this.trigger("change",this,i)}}this._pending=false;this._changing=false;return this},unset:function(t,e){return this.set(t,void 0,h.extend({},e,{unset:true}))},clear:function(t){var e={};for(var i in this.attributes)e[i]=void 0;return this.set(e,h.extend({},t,{unset:true}))},hasChanged:function(t){if(t==null)return!h.isEmpty(this.changed);return h.has(this.changed,t)},changedAttributes:function(t){if(!t)return this.hasChanged()?h.clone(this.changed):false;var e,i=false;var r=this._changing?this._previousAttributes:this.attributes;for(var s in t){if(h.isEqual(r[s],e=t[s]))continue;(i||(i={}))[s]=e}return i},previous:function(t){if(t==null||!this._previousAttributes)return null;return this._previousAttributes[t]},previousAttributes:function(){return h.clone(this._previousAttributes)},fetch:function(t){t=t?h.clone(t):{};if(t.parse===void 0)t.parse=true;var e=this;var i=t.success;t.success=function(r){if(!e.set(e.parse(r,t),t))return false;if(i)i(e,r,t);e.trigger("sync",e,r,t)};R(this,t);return this.sync("read",this,t)},save:function(t,e,i){var r,s,n,a=this.attributes;if(t==null||typeof t==="object"){r=t;i=e}else{(r={})[t]=e}if(r&&(!i||!i.wait)&&!this.set(r,i))return false;i=h.extend({validate:true},i);if(!this._validate(r,i))return false;if(r&&i.wait){this.attributes=h.extend({},a,r)}if(i.parse===void 0)i.parse=true;var o=this;var u=i.success;i.success=function(t){o.attributes=a;var e=o.parse(t,i);if(i.wait)e=h.extend(r||{},e);if(h.isObject(e)&&!o.set(e,i)){return false}if(u)u(o,t,i);o.trigger("sync",o,t,i)};R(this,i);s=this.isNew()?"create":i.patch?"patch":"update";if(s==="patch")i.attrs=r;n=this.sync(s,this,i);if(r&&i.wait)this.attributes=a;return n},destroy:function(t){t=t?h.clone(t):{};var e=this;var i=t.success;var r=function(){e.trigger("destroy",e,e.collection,t)};t.success=function(s){if(t.wait||e.isNew())r();if(i)i(e,s,t);if(!e.isNew())e.trigger("sync",e,s,t)};if(this.isNew()){t.success();return false}R(this,t);var s=this.sync("delete",this,t);if(!t.wait)r();return s},url:function(){var t=h.result(this,"urlRoot")||h.result(this.collection,"url")||U();if(this.isNew())return t;return t+(t.charAt(t.length-1)==="/"?"":"/")+encodeURIComponent(this.id)},parse:function(t,e){return t},clone:function(){return new this.constructor(this.attributes)},isNew:function(){return this.id==null},isValid:function(t){return this._validate({},h.extend(t||{},{validate:true}))},_validate:function(t,e){if(!e.validate||!this.validate)return true;t=h.extend({},this.attributes,t);var i=this.validationError=this.validate(t,e)||null;if(!i)return true;this.trigger("invalid",this,i,h.extend(e||{},{validationError:i}));return false}});var v=["keys","values","pairs","invert","pick","omit"];h.each(v,function(t){d.prototype[t]=function(){var e=s.call(arguments);e.unshift(this.attributes);return h[t].apply(h,e)}});var g=a.Collection=function(t,e){e||(e={});if(e.url)this.url=e.url;if(e.model)this.model=e.model;if(e.comparator!==void 0)this.comparator=e.comparator;this._reset();this.initialize.apply(this,arguments);if(t)this.reset(t,h.extend({silent:true},e))};var m={add:true,remove:true,merge:true};var y={add:true,merge:false,remove:false};h.extend(g.prototype,o,{model:d,initialize:function(){},toJSON:function(t){return this.map(function(e){return e.toJSON(t)})},sync:function(){return a.sync.apply(this,arguments)},add:function(t,e){return this.set(t,h.defaults(e||{},y))},remove:function(t,e){t=h.isArray(t)?t.slice():[t];e||(e={});var i,r,s,n;for(i=0,r=t.length;i<r;i++){n=this.get(t[i]);if(!n)continue;delete this._byId[n.id];delete this._byId[n.cid];s=this.indexOf(n);this.models.splice(s,1);this.length--;if(!e.silent){e.index=s;n.trigger("remove",n,this,e)}this._removeReference(n)}return this},set:function(t,e){e=h.defaults(e||{},m);if(e.parse)t=this.parse(t,e);if(!h.isArray(t))t=t?[t]:[];var i,s,a,o,u,l;var c=e.at;var f=this.comparator&&c==null&&e.sort!==false;var d=h.isString(this.comparator)?this.comparator:null;var p=[],v=[],g={};for(i=0,s=t.length;i<s;i++){if(!(a=this._prepareModel(t[i],e)))continue;if(u=this.get(a)){if(e.remove)g[u.cid]=true;if(e.merge){u.set(a.attributes,e);if(f&&!l&&u.hasChanged(d))l=true}}else if(e.add){p.push(a);a.on("all",this._onModelEvent,this);this._byId[a.cid]=a;if(a.id!=null)this._byId[a.id]=a}}if(e.remove){for(i=0,s=this.length;i<s;++i){if(!g[(a=this.models[i]).cid])v.push(a)}if(v.length)this.remove(v,e)}if(p.length){if(f)l=true;this.length+=p.length;if(c!=null){n.apply(this.models,[c,0].concat(p))}else{r.apply(this.models,p)}}if(l)this.sort({silent:true});if(e.silent)return this;for(i=0,s=p.length;i<s;i++){(a=p[i]).trigger("add",a,this,e)}if(l)this.trigger("sort",this,e);return this},reset:function(t,e){e||(e={});for(var i=0,r=this.models.length;i<r;i++){this._removeReference(this.models[i])}e.previousModels=this.models;this._reset();this.add(t,h.extend({silent:true},e));if(!e.silent)this.trigger("reset",this,e);return this},push:function(t,e){t=this._prepareModel(t,e);this.add(t,h.extend({at:this.length},e));return t},pop:function(t){var e=this.at(this.length-1);this.remove(e,t);return e},unshift:function(t,e){t=this._prepareModel(t,e);this.add(t,h.extend({at:0},e));return t},shift:function(t){var e=this.at(0);this.remove(e,t);return e},slice:function(t,e){return this.models.slice(t,e)},get:function(t){if(t==null)return void 0;return this._byId[t.id!=null?t.id:t.cid||t]},at:function(t){return this.models[t]},where:function(t,e){if(h.isEmpty(t))return e?void 0:[];return this[e?"find":"filter"](function(e){for(var i in t){if(t[i]!==e.get(i))return false}return true})},findWhere:function(t){return this.where(t,true)},sort:function(t){if(!this.comparator)throw new Error("Cannot sort a set without a comparator");t||(t={});if(h.isString(this.comparator)||this.comparator.length===1){this.models=this.sortBy(this.comparator,this)}else{this.models.sort(h.bind(this.comparator,this))}if(!t.silent)this.trigger("sort",this,t);return this},sortedIndex:function(t,e,i){e||(e=this.comparator);var r=h.isFunction(e)?e:function(t){return t.get(e)};return h.sortedIndex(this.models,t,r,i)},pluck:function(t){return h.invoke(this.models,"get",t)},fetch:function(t){t=t?h.clone(t):{};if(t.parse===void 0)t.parse=true;var e=t.success;var i=this;t.success=function(r){var s=t.reset?"reset":"set";i[s](r,t);if(e)e(i,r,t);i.trigger("sync",i,r,t)};R(this,t);return this.sync("read",this,t)},create:function(t,e){e=e?h.clone(e):{};if(!(t=this._prepareModel(t,e)))return false;if(!e.wait)this.add(t,e);var i=this;var r=e.success;e.success=function(s){if(e.wait)i.add(t,e);if(r)r(t,s,e)};t.save(null,e);return t},parse:function(t,e){return t},clone:function(){return new this.constructor(this.models)},_reset:function(){this.length=0;this.models=[];this._byId={}},_prepareModel:function(t,e){if(t instanceof d){if(!t.collection)t.collection=this;return t}e||(e={});e.collection=this;var i=new this.model(t,e);if(!i._validate(t,e)){this.trigger("invalid",this,t,e);return false}return i},_removeReference:function(t){if(this===t.collection)delete t.collection;t.off("all",this._onModelEvent,this)},_onModelEvent:function(t,e,i,r){if((t==="add"||t==="remove")&&i!==this)return;if(t==="destroy")this.remove(e,r);if(e&&t==="change:"+e.idAttribute){delete this._byId[e.previous(e.idAttribute)];if(e.id!=null)this._byId[e.id]=e}this.trigger.apply(this,arguments)}});var _=["forEach","each","map","collect","reduce","foldl","inject","reduceRight","foldr","find","detect","filter","select","reject","every","all","some","any","include","contains","invoke","max","min","toArray","size","first","head","take","initial","rest","tail","drop","last","without","indexOf","shuffle","lastIndexOf","isEmpty","chain"];h.each(_,function(t){g.prototype[t]=function(){var e=s.call(arguments);e.unshift(this.models);return h[t].apply(h,e)}});var w=["groupBy","countBy","sortBy"];h.each(w,function(t){g.prototype[t]=function(e,i){var r=h.isFunction(e)?e:function(t){return t.get(e)};return h[t](this.models,r,i)}});var b=a.View=function(t){this.cid=h.uniqueId("view");this._configure(t||{});this._ensureElement();this.initialize.apply(this,arguments);this.delegateEvents()};var x=/^(\S+)\s*(.*)$/;var E=["model","collection","el","id","attributes","className","tagName","events"];h.extend(b.prototype,o,{tagName:"div",$:function(t){return this.$el.find(t)},initialize:function(){},render:function(){return this},remove:function(){this.$el.remove();this.stopListening();return this},setElement:function(t,e){if(this.$el)this.undelegateEvents();this.$el=t instanceof a.$?t:a.$(t);this.el=this.$el[0];if(e!==false)this.delegateEvents();return this},delegateEvents:function(t){if(!(t||(t=h.result(this,"events"))))return this;this.undelegateEvents();for(var e in t){var i=t[e];if(!h.isFunction(i))i=this[t[e]];if(!i)continue;var r=e.match(x);var s=r[1],n=r[2];i=h.bind(i,this);s+=".delegateEvents"+this.cid;if(n===""){this.$el.on(s,i)}else{this.$el.on(s,n,i)}}return this},undelegateEvents:function(){this.$el.off(".delegateEvents"+this.cid);return this},_configure:function(t){if(this.options)t=h.extend({},h.result(this,"options"),t);h.extend(this,h.pick(t,E));this.options=t},_ensureElement:function(){if(!this.el){var t=h.extend({},h.result(this,"attributes"));if(this.id)t.id=h.result(this,"id");if(this.className)t["class"]=h.result(this,"className");var e=a.$("<"+h.result(this,"tagName")+">").attr(t);this.setElement(e,false)}else{this.setElement(h.result(this,"el"),false)}}});a.sync=function(t,e,i){var r=k[t];h.defaults(i||(i={}),{emulateHTTP:a.emulateHTTP,emulateJSON:a.emulateJSON});var s={type:r,dataType:"json"};if(!i.url){s.url=h.result(e,"url")||U()}if(i.data==null&&e&&(t==="create"||t==="update"||t==="patch")){s.contentType="application/json";s.data=JSON.stringify(i.attrs||e.toJSON(i))}if(i.emulateJSON){s.contentType="application/x-www-form-urlencoded";s.data=s.data?{model:s.data}:{}}if(i.emulateHTTP&&(r==="PUT"||r==="DELETE"||r==="PATCH")){s.type="POST";if(i.emulateJSON)s.data._method=r;var n=i.beforeSend;i.beforeSend=function(t){t.setRequestHeader("X-HTTP-Method-Override",r);if(n)return n.apply(this,arguments)}}if(s.type!=="GET"&&!i.emulateJSON){s.processData=false}if(s.type==="PATCH"&&window.ActiveXObject&&!(window.external&&window.external.msActiveXFilteringEnabled)){s.xhr=function(){return new ActiveXObject("Microsoft.XMLHTTP")}}var o=i.xhr=a.ajax(h.extend(s,i));e.trigger("request",e,o,i);return o};var k={create:"POST",update:"PUT",patch:"PATCH","delete":"DELETE",read:"GET"};a.ajax=function(){return a.$.ajax.apply(a.$,arguments)};var S=a.Router=function(t){t||(t={});if(t.routes)this.routes=t.routes;this._bindRoutes();this.initialize.apply(this,arguments)};var $=/\((.*?)\)/g;var T=/(\(\?)?:\w+/g;var H=/\*\w+/g;var A=/[\-{}\[\]+?.,\\\^$|#\s]/g;h.extend(S.prototype,o,{initialize:function(){},route:function(t,e,i){if(!h.isRegExp(t))t=this._routeToRegExp(t);if(h.isFunction(e)){i=e;e=""}if(!i)i=this[e];var r=this;a.history.route(t,function(s){var n=r._extractParameters(t,s);i&&i.apply(r,n);r.trigger.apply(r,["route:"+e].concat(n));r.trigger("route",e,n);a.history.trigger("route",r,e,n)});return this},navigate:function(t,e){a.history.navigate(t,e);return this},_bindRoutes:function(){if(!this.routes)return;this.routes=h.result(this,"routes");var t,e=h.keys(this.routes);while((t=e.pop())!=null){this.route(t,this.routes[t])}},_routeToRegExp:function(t){t=t.replace(A,"\\$&").replace($,"(?:$1)?").replace(T,function(t,e){return e?t:"([^/]+)"}).replace(H,"(.*?)");return new RegExp("^"+t+"$")},_extractParameters:function(t,e){var i=t.exec(e).slice(1);return h.map(i,function(t){return t?decodeURIComponent(t):null})}});var I=a.History=function(){this.handlers=[];h.bindAll(this,"checkUrl");if(typeof window!=="undefined"){this.location=window.location;this.history=window.history}};var N=/^[#\/]|\s+$/g;var P=/^\/+|\/+$/g;var O=/msie [\w.]+/;var C=/\/$/;I.started=false;h.extend(I.prototype,o,{interval:50,getHash:function(t){var e=(t||this).location.href.match(/#(.*)$/);return e?e[1]:""},getFragment:function(t,e){if(t==null){if(this._hasPushState||!this._wantsHashChange||e){t=this.location.pathname;var i=this.root.replace(C,"");if(!t.indexOf(i))t=t.substr(i.length)}else{t=this.getHash()}}return t.replace(N,"")},start:function(t){if(I.started)throw new Error("Backbone.history has already been started");I.started=true;this.options=h.extend({},{root:"/"},this.options,t);this.root=this.options.root;this._wantsHashChange=this.options.hashChange!==false;this._wantsPushState=!!this.options.pushState;this._hasPushState=!!(this.options.pushState&&this.history&&this.history.pushState);var e=this.getFragment();var i=document.documentMode;var r=O.exec(navigator.userAgent.toLowerCase())&&(!i||i<=7);this.root=("/"+this.root+"/").replace(P,"/");if(r&&this._wantsHashChange){this.iframe=a.$('<iframe src="javascript:0" tabindex="-1" />').hide().appendTo("body")[0].contentWindow;this.navigate(e)}if(this._hasPushState){a.$(window).on("popstate",this.checkUrl)}else if(this._wantsHashChange&&"onhashchange"in window&&!r){a.$(window).on("hashchange",this.checkUrl)}else if(this._wantsHashChange){this._checkUrlInterval=setInterval(this.checkUrl,this.interval)}this.fragment=e;var s=this.location;var n=s.pathname.replace(/[^\/]$/,"$&/")===this.root;if(this._wantsHashChange&&this._wantsPushState&&!this._hasPushState&&!n){this.fragment=this.getFragment(null,true);this.location.replace(this.root+this.location.search+"#"+this.fragment);return true}else if(this._wantsPushState&&this._hasPushState&&n&&s.hash){this.fragment=this.getHash().replace(N,"");this.history.replaceState({},document.title,this.root+this.fragment+s.search)}if(!this.options.silent)return this.loadUrl()},stop:function(){a.$(window).off("popstate",this.checkUrl).off("hashchange",this.checkUrl);clearInterval(this._checkUrlInterval);I.started=false},route:function(t,e){this.handlers.unshift({route:t,callback:e})},checkUrl:function(t){var e=this.getFragment();if(e===this.fragment&&this.iframe){e=this.getFragment(this.getHash(this.iframe))}if(e===this.fragment)return false;if(this.iframe)this.navigate(e);this.loadUrl()||this.loadUrl(this.getHash())},loadUrl:function(t){var e=this.fragment=this.getFragment(t);var i=h.any(this.handlers,function(t){if(t.route.test(e)){t.callback(e);return true}});return i},navigate:function(t,e){if(!I.started)return false;if(!e||e===true)e={trigger:e};t=this.getFragment(t||"");if(this.fragment===t)return;this.fragment=t;var i=this.root+t;if(this._hasPushState){this.history[e.replace?"replaceState":"pushState"]({},document.title,i)}else if(this._wantsHashChange){this._updateHash(this.location,t,e.replace);if(this.iframe&&t!==this.getFragment(this.getHash(this.iframe))){if(!e.replace)this.iframe.document.open().close();this._updateHash(this.iframe.location,t,e.replace)}}else{return this.location.assign(i)}if(e.trigger)this.loadUrl(t)},_updateHash:function(t,e,i){if(i){var r=t.href.replace(/(javascript:|#).*$/,"");t.replace(r+"#"+e)}else{t.hash="#"+e}}});a.history=new I;var j=function(t,e){var i=this;var r;if(t&&h.has(t,"constructor")){r=t.constructor}else{r=function(){return i.apply(this,arguments)}}h.extend(r,i,e);var s=function(){this.constructor=r};s.prototype=i.prototype;r.prototype=new s;if(t)h.extend(r.prototype,t);r.__super__=i.prototype;return r};d.extend=g.extend=S.extend=b.extend=I.extend=j;var U=function(){throw new Error('A "url" property or function must be specified')};var R=function(t,e){var i=e.error;e.error=function(r){if(i)i(t,r,e);t.trigger("error",t,r,e)}}}).call(this,$);


//(function(t,e){if(typeof define==="function"&&define.amd){define(["underscore","jquery","exports"],function(i,r,s){t.Backbone=e(t,s,i,r)})}else if(typeof exports!=="undefined"){var i=require("underscore");e(t,exports,i)}else{t.Backbone=e(t,{},t._,t.Zepto||t.ender||$)}})(this,function(t,e,i,r){var s=t.Backbone;var n=[];var a=n.push;var o=n.slice;var h=n.splice;e.VERSION="1.1.2";e.$=r;e.noConflict=function(){t.Backbone=s;return this};e.emulateHTTP=false;e.emulateJSON=false;var u=e.Events={on:function(t,e,i){if(!c(this,"on",t,[e,i])||!e)return this;this._events||(this._events={});var r=this._events[t]||(this._events[t]=[]);r.push({callback:e,context:i,ctx:i||this});return this},once:function(t,e,r){if(!c(this,"once",t,[e,r])||!e)return this;var s=this;var n=i.once(function(){s.off(t,n);e.apply(this,arguments)});n._callback=e;return this.on(t,n,r)},off:function(t,e,r){var s,n,a,o,h,u,l,f;if(!this._events||!c(this,"off",t,[e,r]))return this;if(!t&&!e&&!r){this._events=void 0;return this}o=t?[t]:i.keys(this._events);for(h=0,u=o.length;h<u;h++){t=o[h];if(a=this._events[t]){this._events[t]=s=[];if(e||r){for(l=0,f=a.length;l<f;l++){n=a[l];if(e&&e!==n.callback&&e!==n.callback._callback||r&&r!==n.context){s.push(n)}}}if(!s.length)delete this._events[t]}}return this},trigger:function(t){if(!this._events)return this;var e=o.call(arguments,1);if(!c(this,"trigger",t,e))return this;var i=this._events[t];var r=this._events.all;if(i)f(i,e);if(r)f(r,arguments);return this},stopListening:function(t,e,r){var s=this._listeningTo;if(!s)return this;var n=!e&&!r;if(!r&&typeof e==="object")r=this;if(t)(s={})[t._listenId]=t;for(var a in s){t=s[a];t.off(e,r,this);if(n||i.isEmpty(t._events))delete this._listeningTo[a]}return this}};var l=/\s+/;var c=function(t,e,i,r){if(!i)return true;if(typeof i==="object"){for(var s in i){t[e].apply(t,[s,i[s]].concat(r))}return false}if(l.test(i)){var n=i.split(l);for(var a=0,o=n.length;a<o;a++){t[e].apply(t,[n[a]].concat(r))}return false}return true};var f=function(t,e){var i,r=-1,s=t.length,n=e[0],a=e[1],o=e[2];switch(e.length){case 0:while(++r<s)(i=t[r]).callback.call(i.ctx);return;case 1:while(++r<s)(i=t[r]).callback.call(i.ctx,n);return;case 2:while(++r<s)(i=t[r]).callback.call(i.ctx,n,a);return;case 3:while(++r<s)(i=t[r]).callback.call(i.ctx,n,a,o);return;default:while(++r<s)(i=t[r]).callback.apply(i.ctx,e);return}};var d={listenTo:"on",listenToOnce:"once"};i.each(d,function(t,e){u[e]=function(e,r,s){var n=this._listeningTo||(this._listeningTo={});var a=e._listenId||(e._listenId=i.uniqueId("l"));n[a]=e;if(!s&&typeof r==="object")s=this;e[t](r,s,this);return this}});u.bind=u.on;u.unbind=u.off;i.extend(e,u);var p=e.Model=function(t,e){var r=t||{};e||(e={});this.cid=i.uniqueId("c");this.attributes={};if(e.collection)this.collection=e.collection;if(e.parse)r=this.parse(r,e)||{};r=i.defaults({},r,i.result(this,"defaults"));this.set(r,e);this.changed={};this.initialize.apply(this,arguments)};i.extend(p.prototype,u,{changed:null,validationError:null,idAttribute:"id",initialize:function(){},toJSON:function(t){return i.clone(this.attributes)},sync:function(){return e.sync.apply(this,arguments)},get:function(t){return this.attributes[t]},escape:function(t){return i.escape(this.get(t))},has:function(t){return this.get(t)!=null},set:function(t,e,r){var s,n,a,o,h,u,l,c;if(t==null)return this;if(typeof t==="object"){n=t;r=e}else{(n={})[t]=e}r||(r={});if(!this._validate(n,r))return false;a=r.unset;h=r.silent;o=[];u=this._changing;this._changing=true;if(!u){this._previousAttributes=i.clone(this.attributes);this.changed={}}c=this.attributes,l=this._previousAttributes;if(this.idAttribute in n)this.id=n[this.idAttribute];for(s in n){e=n[s];if(!i.isEqual(c[s],e))o.push(s);if(!i.isEqual(l[s],e)){this.changed[s]=e}else{delete this.changed[s]}a?delete c[s]:c[s]=e}if(!h){if(o.length)this._pending=r;for(var f=0,d=o.length;f<d;f++){this.trigger("change:"+o[f],this,c[o[f]],r)}}if(u)return this;if(!h){while(this._pending){r=this._pending;this._pending=false;this.trigger("change",this,r)}}this._pending=false;this._changing=false;return this},unset:function(t,e){return this.set(t,void 0,i.extend({},e,{unset:true}))},clear:function(t){var e={};for(var r in this.attributes)e[r]=void 0;return this.set(e,i.extend({},t,{unset:true}))},hasChanged:function(t){if(t==null)return!i.isEmpty(this.changed);return i.has(this.changed,t)},changedAttributes:function(t){if(!t)return this.hasChanged()?i.clone(this.changed):false;var e,r=false;var s=this._changing?this._previousAttributes:this.attributes;for(var n in t){if(i.isEqual(s[n],e=t[n]))continue;(r||(r={}))[n]=e}return r},previous:function(t){if(t==null||!this._previousAttributes)return null;return this._previousAttributes[t]},previousAttributes:function(){return i.clone(this._previousAttributes)},fetch:function(t){t=t?i.clone(t):{};if(t.parse===void 0)t.parse=true;var e=this;var r=t.success;t.success=function(i){if(!e.set(e.parse(i,t),t))return false;if(r)r(e,i,t);e.trigger("sync",e,i,t)};q(this,t);return this.sync("read",this,t)},save:function(t,e,r){var s,n,a,o=this.attributes;if(t==null||typeof t==="object"){s=t;r=e}else{(s={})[t]=e}r=i.extend({validate:true},r);if(s&&!r.wait){if(!this.set(s,r))return false}else{if(!this._validate(s,r))return false}if(s&&r.wait){this.attributes=i.extend({},o,s)}if(r.parse===void 0)r.parse=true;var h=this;var u=r.success;r.success=function(t){h.attributes=o;var e=h.parse(t,r);if(r.wait)e=i.extend(s||{},e);if(i.isObject(e)&&!h.set(e,r)){return false}if(u)u(h,t,r);h.trigger("sync",h,t,r)};q(this,r);n=this.isNew()?"create":r.patch?"patch":"update";if(n==="patch")r.attrs=s;a=this.sync(n,this,r);if(s&&r.wait)this.attributes=o;return a},destroy:function(t){t=t?i.clone(t):{};var e=this;var r=t.success;var s=function(){e.trigger("destroy",e,e.collection,t)};t.success=function(i){if(t.wait||e.isNew())s();if(r)r(e,i,t);if(!e.isNew())e.trigger("sync",e,i,t)};if(this.isNew()){t.success();return false}q(this,t);var n=this.sync("delete",this,t);if(!t.wait)s();return n},url:function(){var t=i.result(this,"urlRoot")||i.result(this.collection,"url")||M();if(this.isNew())return t;return t.replace(/([^\/])$/,"$1/")+encodeURIComponent(this.id)},parse:function(t,e){return t},clone:function(){return new this.constructor(this.attributes)},isNew:function(){return!this.has(this.idAttribute)},isValid:function(t){return this._validate({},i.extend(t||{},{validate:true}))},_validate:function(t,e){if(!e.validate||!this.validate)return true;t=i.extend({},this.attributes,t);var r=this.validationError=this.validate(t,e)||null;if(!r)return true;this.trigger("invalid",this,r,i.extend(e,{validationError:r}));return false}});var v=["keys","values","pairs","invert","pick","omit"];i.each(v,function(t){p.prototype[t]=function(){var e=o.call(arguments);e.unshift(this.attributes);return i[t].apply(i,e)}});var g=e.Collection=function(t,e){e||(e={});if(e.model)this.model=e.model;if(e.comparator!==void 0)this.comparator=e.comparator;this._reset();this.initialize.apply(this,arguments);if(t)this.reset(t,i.extend({silent:true},e))};var m={add:true,remove:true,merge:true};var y={add:true,remove:false};i.extend(g.prototype,u,{model:p,initialize:function(){},toJSON:function(t){return this.map(function(e){return e.toJSON(t)})},sync:function(){return e.sync.apply(this,arguments)},add:function(t,e){return this.set(t,i.extend({merge:false},e,y))},remove:function(t,e){var r=!i.isArray(t);t=r?[t]:i.clone(t);e||(e={});var s,n,a,o;for(s=0,n=t.length;s<n;s++){o=t[s]=this.get(t[s]);if(!o)continue;delete this._byId[o.id];delete this._byId[o.cid];a=this.indexOf(o);this.models.splice(a,1);this.length--;if(!e.silent){e.index=a;o.trigger("remove",o,this,e)}this._removeReference(o,e)}return r?t[0]:t},set:function(t,e){e=i.defaults({},e,m);if(e.parse)t=this.parse(t,e);var r=!i.isArray(t);t=r?t?[t]:[]:i.clone(t);var s,n,a,o,h,u,l;var c=e.at;var f=this.model;var d=this.comparator&&c==null&&e.sort!==false;var v=i.isString(this.comparator)?this.comparator:null;var g=[],y=[],_={};var b=e.add,w=e.merge,x=e.remove;var E=!d&&b&&x?[]:false;for(s=0,n=t.length;s<n;s++){h=t[s]||{};if(h instanceof p){a=o=h}else{a=h[f.prototype.idAttribute||"id"]}if(u=this.get(a)){if(x)_[u.cid]=true;if(w){h=h===o?o.attributes:h;if(e.parse)h=u.parse(h,e);u.set(h,e);if(d&&!l&&u.hasChanged(v))l=true}t[s]=u}else if(b){o=t[s]=this._prepareModel(h,e);if(!o)continue;g.push(o);this._addReference(o,e)}o=u||o;if(E&&(o.isNew()||!_[o.id]))E.push(o);_[o.id]=true}if(x){for(s=0,n=this.length;s<n;++s){if(!_[(o=this.models[s]).cid])y.push(o)}if(y.length)this.remove(y,e)}if(g.length||E&&E.length){if(d)l=true;this.length+=g.length;if(c!=null){for(s=0,n=g.length;s<n;s++){this.models.splice(c+s,0,g[s])}}else{if(E)this.models.length=0;var k=E||g;for(s=0,n=k.length;s<n;s++){this.models.push(k[s])}}}if(l)this.sort({silent:true});if(!e.silent){for(s=0,n=g.length;s<n;s++){(o=g[s]).trigger("add",o,this,e)}if(l||E&&E.length)this.trigger("sort",this,e)}return r?t[0]:t},reset:function(t,e){e||(e={});for(var r=0,s=this.models.length;r<s;r++){this._removeReference(this.models[r],e)}e.previousModels=this.models;this._reset();t=this.add(t,i.extend({silent:true},e));if(!e.silent)this.trigger("reset",this,e);return t},push:function(t,e){return this.add(t,i.extend({at:this.length},e))},pop:function(t){var e=this.at(this.length-1);this.remove(e,t);return e},unshift:function(t,e){return this.add(t,i.extend({at:0},e))},shift:function(t){var e=this.at(0);this.remove(e,t);return e},slice:function(){return o.apply(this.models,arguments)},get:function(t){if(t==null)return void 0;return this._byId[t]||this._byId[t.id]||this._byId[t.cid]},at:function(t){return this.models[t]},where:function(t,e){if(i.isEmpty(t))return e?void 0:[];return this[e?"find":"filter"](function(e){for(var i in t){if(t[i]!==e.get(i))return false}return true})},findWhere:function(t){return this.where(t,true)},sort:function(t){if(!this.comparator)throw new Error("Cannot sort a set without a comparator");t||(t={});if(i.isString(this.comparator)||this.comparator.length===1){this.models=this.sortBy(this.comparator,this)}else{this.models.sort(i.bind(this.comparator,this))}if(!t.silent)this.trigger("sort",this,t);return this},pluck:function(t){return i.invoke(this.models,"get",t)},fetch:function(t){t=t?i.clone(t):{};if(t.parse===void 0)t.parse=true;var e=t.success;var r=this;t.success=function(i){var s=t.reset?"reset":"set";r[s](i,t);if(e)e(r,i,t);r.trigger("sync",r,i,t)};q(this,t);return this.sync("read",this,t)},create:function(t,e){e=e?i.clone(e):{};if(!(t=this._prepareModel(t,e)))return false;if(!e.wait)this.add(t,e);var r=this;var s=e.success;e.success=function(t,i){if(e.wait)r.add(t,e);if(s)s(t,i,e)};t.save(null,e);return t},parse:function(t,e){return t},clone:function(){return new this.constructor(this.models)},_reset:function(){this.length=0;this.models=[];this._byId={}},_prepareModel:function(t,e){if(t instanceof p)return t;e=e?i.clone(e):{};e.collection=this;var r=new this.model(t,e);if(!r.validationError)return r;this.trigger("invalid",this,r.validationError,e);return false},_addReference:function(t,e){this._byId[t.cid]=t;if(t.id!=null)this._byId[t.id]=t;if(!t.collection)t.collection=this;t.on("all",this._onModelEvent,this)},_removeReference:function(t,e){if(this===t.collection)delete t.collection;t.off("all",this._onModelEvent,this)},_onModelEvent:function(t,e,i,r){if((t==="add"||t==="remove")&&i!==this)return;if(t==="destroy")this.remove(e,r);if(e&&t==="change:"+e.idAttribute){delete this._byId[e.previous(e.idAttribute)];if(e.id!=null)this._byId[e.id]=e}this.trigger.apply(this,arguments)}});var _=["forEach","each","map","collect","reduce","foldl","inject","reduceRight","foldr","find","detect","filter","select","reject","every","all","some","any","include","contains","invoke","max","min","toArray","size","first","head","take","initial","rest","tail","drop","last","without","difference","indexOf","shuffle","lastIndexOf","isEmpty","chain","sample"];i.each(_,function(t){g.prototype[t]=function(){var e=o.call(arguments);e.unshift(this.models);return i[t].apply(i,e)}});var b=["groupBy","countBy","sortBy","indexBy"];i.each(b,function(t){g.prototype[t]=function(e,r){var s=i.isFunction(e)?e:function(t){return t.get(e)};return i[t](this.models,s,r)}});var w=e.View=function(t){this.cid=i.uniqueId("view");t||(t={});i.extend(this,i.pick(t,E));this._ensureElement();this.initialize.apply(this,arguments);this.delegateEvents()};var x=/^(\S+)\s*(.*)$/;var E=["model","collection","el","id","attributes","className","tagName","events"];i.extend(w.prototype,u,{tagName:"div",$:function(t){return this.$el.find(t)},initialize:function(){},render:function(){return this},remove:function(){this.$el.remove();this.stopListening();return this},setElement:function(t,i){if(this.$el)this.undelegateEvents();this.$el=t instanceof e.$?t:e.$(t);this.el=this.$el[0];if(i!==false)this.delegateEvents();return this},delegateEvents:function(t){if(!(t||(t=i.result(this,"events"))))return this;this.undelegateEvents();for(var e in t){var r=t[e];if(!i.isFunction(r))r=this[t[e]];if(!r)continue;var s=e.match(x);var n=s[1],a=s[2];r=i.bind(r,this);n+=".delegateEvents"+this.cid;if(a===""){this.$el.on(n,r)}else{this.$el.on(n,a,r)}}return this},undelegateEvents:function(){this.$el.off(".delegateEvents"+this.cid);return this},_ensureElement:function(){if(!this.el){var t=i.extend({},i.result(this,"attributes"));if(this.id)t.id=i.result(this,"id");if(this.className)t["class"]=i.result(this,"className");var r=e.$("<"+i.result(this,"tagName")+">").attr(t);this.setElement(r,false)}else{this.setElement(i.result(this,"el"),false)}}});e.sync=function(t,r,s){var n=T[t];i.defaults(s||(s={}),{emulateHTTP:e.emulateHTTP,emulateJSON:e.emulateJSON});var a={type:n,dataType:"json"};if(!s.url){a.url=i.result(r,"url")||M()}if(s.data==null&&r&&(t==="create"||t==="update"||t==="patch")){a.contentType="application/json";a.data=JSON.stringify(s.attrs||r.toJSON(s))}if(s.emulateJSON){a.contentType="application/x-www-form-urlencoded";a.data=a.data?{model:a.data}:{}}if(s.emulateHTTP&&(n==="PUT"||n==="DELETE"||n==="PATCH")){a.type="POST";if(s.emulateJSON)a.data._method=n;var o=s.beforeSend;s.beforeSend=function(t){t.setRequestHeader("X-HTTP-Method-Override",n);if(o)return o.apply(this,arguments)}}if(a.type!=="GET"&&!s.emulateJSON){a.processData=false}if(a.type==="PATCH"&&k){a.xhr=function(){return new ActiveXObject("Microsoft.XMLHTTP")}}var h=s.xhr=e.ajax(i.extend(a,s));r.trigger("request",r,h,s);return h};var k=typeof window!=="undefined"&&!!window.ActiveXObject&&!(window.XMLHttpRequest&&(new XMLHttpRequest).dispatchEvent);var T={create:"POST",update:"PUT",patch:"PATCH","delete":"DELETE",read:"GET"};e.ajax=function(){return e.$.ajax.apply(e.$,arguments)};var $=e.Router=function(t){t||(t={});if(t.routes)this.routes=t.routes;this._bindRoutes();this.initialize.apply(this,arguments)};var S=/\((.*?)\)/g;var H=/(\(\?)?:\w+/g;var A=/\*\w+/g;var I=/[\-{}\[\]+?.,\\\^$|#\s]/g;i.extend($.prototype,u,{initialize:function(){},route:function(t,r,s){if(!i.isRegExp(t))t=this._routeToRegExp(t);if(i.isFunction(r)){s=r;r=""}if(!s)s=this[r];var n=this;e.history.route(t,function(i){var a=n._extractParameters(t,i);n.execute(s,a);n.trigger.apply(n,["route:"+r].concat(a));n.trigger("route",r,a);e.history.trigger("route",n,r,a)});return this},execute:function(t,e){if(t)t.apply(this,e)},navigate:function(t,i){e.history.navigate(t,i);return this},_bindRoutes:function(){if(!this.routes)return;this.routes=i.result(this,"routes");var t,e=i.keys(this.routes);while((t=e.pop())!=null){this.route(t,this.routes[t])}},_routeToRegExp:function(t){t=t.replace(I,"\\$&").replace(S,"(?:$1)?").replace(H,function(t,e){return e?t:"([^/?]+)"}).replace(A,"([^?]*?)");return new RegExp("^"+t+"(?:\\?([\\s\\S]*))?$")},_extractParameters:function(t,e){var r=t.exec(e).slice(1);return i.map(r,function(t,e){if(e===r.length-1)return t||null;return t?decodeURIComponent(t):null})}});var N=e.History=function(){this.handlers=[];i.bindAll(this,"checkUrl");if(typeof window!=="undefined"){this.location=window.location;this.history=window.history}};var R=/^[#\/]|\s+$/g;var O=/^\/+|\/+$/g;var P=/msie [\w.]+/;var C=/\/$/;var j=/#.*$/;N.started=false;i.extend(N.prototype,u,{interval:50,atRoot:function(){return this.location.pathname.replace(/[^\/]$/,"$&/")===this.root},getHash:function(t){var e=(t||this).location.href.match(/#(.*)$/);return e?e[1]:""},getFragment:function(t,e){if(t==null){if(this._hasPushState||!this._wantsHashChange||e){t=decodeURI(this.location.pathname+this.location.search);var i=this.root.replace(C,"");if(!t.indexOf(i))t=t.slice(i.length)}else{t=this.getHash()}}return t.replace(R,"")},start:function(t){if(N.started)throw new Error("Backbone.history has already been started");N.started=true;this.options=i.extend({root:"/"},this.options,t);this.root=this.options.root;this._wantsHashChange=this.options.hashChange!==false;this._wantsPushState=!!this.options.pushState;this._hasPushState=!!(this.options.pushState&&this.history&&this.history.pushState);var r=this.getFragment();var s=document.documentMode;var n=P.exec(navigator.userAgent.toLowerCase())&&(!s||s<=7);this.root=("/"+this.root+"/").replace(O,"/");if(n&&this._wantsHashChange){var a=e.$('<iframe src="javascript:0" tabindex="-1">');this.iframe=a.hide().appendTo("body")[0].contentWindow;this.navigate(r)}if(this._hasPushState){e.$(window).on("popstate",this.checkUrl)}else if(this._wantsHashChange&&"onhashchange"in window&&!n){e.$(window).on("hashchange",this.checkUrl)}else if(this._wantsHashChange){this._checkUrlInterval=setInterval(this.checkUrl,this.interval)}this.fragment=r;var o=this.location;if(this._wantsHashChange&&this._wantsPushState){if(!this._hasPushState&&!this.atRoot()){this.fragment=this.getFragment(null,true);this.location.replace(this.root+"#"+this.fragment);return true}else if(this._hasPushState&&this.atRoot()&&o.hash){this.fragment=this.getHash().replace(R,"");this.history.replaceState({},document.title,this.root+this.fragment)}}if(!this.options.silent)return this.loadUrl()},stop:function(){e.$(window).off("popstate",this.checkUrl).off("hashchange",this.checkUrl);if(this._checkUrlInterval)clearInterval(this._checkUrlInterval);N.started=false},route:function(t,e){this.handlers.unshift({route:t,callback:e})},checkUrl:function(t){var e=this.getFragment();if(e===this.fragment&&this.iframe){e=this.getFragment(this.getHash(this.iframe))}if(e===this.fragment)return false;if(this.iframe)this.navigate(e);this.loadUrl()},loadUrl:function(t){t=this.fragment=this.getFragment(t);return i.any(this.handlers,function(e){if(e.route.test(t)){e.callback(t);return true}})},navigate:function(t,e){if(!N.started)return false;if(!e||e===true)e={trigger:!!e};var i=this.root+(t=this.getFragment(t||""));t=t.replace(j,"");if(this.fragment===t)return;this.fragment=t;if(t===""&&i!=="/")i=i.slice(0,-1);if(this._hasPushState){this.history[e.replace?"replaceState":"pushState"]({},document.title,i)}else if(this._wantsHashChange){this._updateHash(this.location,t,e.replace);if(this.iframe&&t!==this.getFragment(this.getHash(this.iframe))){if(!e.replace)this.iframe.document.open().close();this._updateHash(this.iframe.location,t,e.replace)}}else{return this.location.assign(i)}if(e.trigger)return this.loadUrl(t)},_updateHash:function(t,e,i){if(i){var r=t.href.replace(/(javascript:|#).*$/,"");t.replace(r+"#"+e)}else{t.hash="#"+e}}});e.history=new N;var U=function(t,e){var r=this;var s;if(t&&i.has(t,"constructor")){s=t.constructor}else{s=function(){return r.apply(this,arguments)}}i.extend(s,r,e);var n=function(){this.constructor=s};n.prototype=r.prototype;s.prototype=new n;if(t)i.extend(s.prototype,t);s.__super__=r.prototype;return s};p.extend=g.extend=$.extend=w.extend=N.extend=U;var M=function(){throw new Error('A "url" property or function must be specified')};var q=function(t,e){var i=e.error;e.error=function(r){if(i)i(t,r,e);t.trigger("error",t,r,e)}};return e});

// console.log(Backbone);
// alert(Backbone.$.fn.jquery);

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

//  Dustjs-linkedin package v1.1.1
function getGlobal(){return function(){return this.dust}.call(null)}var dust={};(function(dust){function Context(e,t,n){this.stack=e,this.global=t,this.blocks=n}function Stack(e,t,n,r){this.tail=t,this.isObject=!dust.isArray(e)&&e&&typeof e=="object",this.head=e,this.index=n,this.of=r}function Stub(e){this.head=new Chunk(this),this.callback=e,this.out=""}function Stream(){this.head=new Chunk(this)}function Chunk(e,t,n){this.root=e,this.next=t,this.data=[],this.flushable=!1,this.taps=n}function Tap(e,t){this.head=e,this.tail=t}dust.helpers={},dust.cache={},dust.register=function(e,t){if(!e)return;dust.cache[e]=t},dust.render=function(e,t,n){var r=(new Stub(n)).head;dust.load(e,r,Context.wrap(t,e)).end()},dust.stream=function(e,t){var n=new Stream;return dust.nextTick(function(){dust.load(e,n.head,Context.wrap(t,e)).end()}),n},dust.renderSource=function(e,t,n){return dust.compileFn(e)(t,n)},dust.compileFn=function(e,t){var n=dust.loadSource(dust.compile(e,t));return function(e,r){var i=r?new Stub(r):new Stream;return dust.nextTick(function(){n(i.head,Context.wrap(e,t)).end()}),i}},dust.load=function(e,t,n){var r=dust.cache[e];return r?r(t,n):dust.onLoad?t.map(function(t){dust.onLoad(e,function(r,i){if(r)return t.setError(r);dust.cache[e]||dust.loadSource(dust.compile(i,e)),dust.cache[e](t,n).end()})}):t.setError(new Error("Template Not Found: "+e))},dust.loadSource=function(source,path){return eval(source)},Array.isArray?dust.isArray=Array.isArray:dust.isArray=function(e){return Object.prototype.toString.call(e)=="[object Array]"},dust.nextTick=function(){return typeof process!="undefined"?process.nextTick:function(e){setTimeout(e,0)}}(),dust.isEmpty=function(e){return dust.isArray(e)&&!e.length?!0:e===0?!1:!e},dust.filter=function(e,t,n){if(n)for(var r=0,i=n.length;r<i;r++){var s=n[r];s==="s"?t=null:typeof dust.filters[s]=="function"&&(e=dust.filters[s](e))}return t&&(e=dust.filters[t](e)),e},dust.filters={h:function(e){return dust.escapeHtml(e)},j:function(e){return dust.escapeJs(e)},u:encodeURI,uc:encodeURIComponent,js:function(e){return JSON?JSON.stringify(e):e},jp:function(e){return JSON?JSON.parse(e):e}},dust.makeBase=function(e){return new Context(new Stack,e)},Context.wrap=function(e,t){if(e instanceof Context)return e;var n={};return n.__templates__=[],n.__templates__.push(t),new Context(new Stack(e),n)},Context.prototype.get=function(e){var t=this.stack,n;while(t){if(t.isObject){n=t.head[e];if(n!==undefined)return n}t=t.tail}return this.global?this.global[e]:undefined},Context.prototype.getPath=function(e,t){var n=this.stack,r,i=t.length,s=e?undefined:this.stack.tail;if(e&&i===0)return n.head;n=n.head;var o=0;while(n&&o<i){r=n,n=n[t[o]],o++;while(!n&&!e){if(o>1)return undefined;s?(n=s.head,s=s.tail,o=0):e||(n=this.global,e=!0,o=0)}}return typeof n=="function"?function(){return n.apply(r,arguments)}:n},Context.prototype.push=function(e,t,n){return new Context(new Stack(e,this.stack,t,n),this.global,this.blocks)},Context.prototype.rebase=function(e){return new Context(new Stack(e),this.global,this.blocks)},Context.prototype.current=function(){return this.stack.head},Context.prototype.getBlock=function(e,t,n){typeof e=="function"&&(e=e(t,n).data.join(""),t.data=[]);var r=this.blocks;if(!r)return;var i=r.length,s;while(i--){s=r[i][e];if(s)return s}},Context.prototype.shiftBlocks=function(e){var t=this.blocks,n;return e?(t?n=t.concat([e]):n=[e],new Context(this.stack,this.global,n)):this},Stub.prototype.flush=function(){var e=this.head;while(e){if(!e.flushable){if(e.error){this.callback(e.error),this.flush=function(){};return}return}this.out+=e.data.join(""),e=e.next,this.head=e}this.callback(null,this.out)},Stream.prototype.flush=function(){var e=this.head;while(e){if(!e.flushable){if(e.error){this.emit("error",e.error),this.flush=function(){};return}return}this.emit("data",e.data.join("")),e=e.next,this.head=e}this.emit("end")},Stream.prototype.emit=function(e,t){if(!this.events)return!1;var n=this.events[e];if(!n)return!1;if(typeof n=="function")n(t);else{var r=n.slice(0);for(var i=0,s=r.length;i<s;i++)r[i](t)}},Stream.prototype.on=function(e,t){return this.events||(this.events={}),this.events[e]?typeof this.events[e]=="function"?this.events[e]=[this.events[e],t]:this.events[e].push(t):this.events[e]=t,this},Stream.prototype.pipe=function(e){return this.on("data",function(t){e.write(t,"utf8")}).on("end",function(){e.end()}).on("error",function(t){e.error(t)}),this},Chunk.prototype.write=function(e){var t=this.taps;return t&&(e=t.go(e)),this.data.push(e),this},Chunk.prototype.end=function(e){return e&&this.write(e),this.flushable=!0,this.root.flush(),this},Chunk.prototype.map=function(e){var t=new Chunk(this.root,this.next,this.taps),n=new Chunk(this.root,t,this.taps);return this.next=n,this.flushable=!0,e(n),t},Chunk.prototype.tap=function(e){var t=this.taps;return t?this.taps=t.push(e):this.taps=new Tap(e),this},Chunk.prototype.untap=function(){return this.taps=this.taps.tail,this},Chunk.prototype.render=function(e,t){return e(this,t)},Chunk.prototype.reference=function(e,t,n,r){if(typeof e=="function"){e.isFunction=!0,e=e.apply(t.current(),[this,t,null,{auto:n,filters:r}]);if(e instanceof Chunk)return e}return dust.isEmpty(e)?this:this.write(dust.filter(e,n,r))},Chunk.prototype.section=function(e,t,n,r){if(typeof e=="function"){e=e.apply(t.current(),[this,t,n,r]);if(e instanceof Chunk)return e}var i=n.block,s=n["else"];r&&(t=t.push(r));if(dust.isArray(e)){if(i){var o=e.length,u=this;if(o>0){t.stack.head&&(t.stack.head.$len=o);for(var a=0;a<o;a++)t.stack.head&&(t.stack.head.$idx=a),u=i(u,t.push(e[a],a,o));return t.stack.head&&(t.stack.head.$idx=undefined,t.stack.head.$len=undefined),u}if(s)return s(this,t)}}else if(e===!0){if(i)return i(this,t)}else if(e||e===0){if(i)return i(this,t.push(e))}else if(s)return s(this,t);return this},Chunk.prototype.exists=function(e,t,n){var r=n.block,i=n["else"];if(!dust.isEmpty(e)){if(r)return r(this,t)}else if(i)return i(this,t);return this},Chunk.prototype.notexists=function(e,t,n){var r=n.block,i=n["else"];if(dust.isEmpty(e)){if(r)return r(this,t)}else if(i)return i(this,t);return this},Chunk.prototype.block=function(e,t,n){var r=n.block;return e&&(r=e),r?r(this,t):this},Chunk.prototype.partial=function(e,t,n){var r;t.global&&t.global.__templates__&&t.global.__templates__.push(e),n?(r=dust.makeBase(t.global),r.blocks=t.blocks,t.stack&&t.stack.tail&&(r.stack=t.stack.tail),r=r.push(n),r=r.push(t.stack.head)):r=t;var i;return typeof e=="function"?i=this.capture(e,r,function(e,t){dust.load(e,t,r).end()}):i=dust.load(e,this,r),t.global&&t.global.__templates__&&t.global.__templates__.pop(),i},Chunk.prototype.helper=function(e,t,n,r){return dust.helpers[e]?dust.helpers[e](this,t,n,r):this},Chunk.prototype.capture=function(e,t,n){return this.map(function(r){var i=new Stub(function(e,t){e?r.setError(e):n(t,r)});e(i.head,t).end()})},Chunk.prototype.setError=function(e){return this.error=e,this.root.flush(),this},Tap.prototype.push=function(e){return new Tap(e,this)},Tap.prototype.go=function(e){var t=this;while(t)e=t.head(e),t=t.tail;return e};var HCHARS=new RegExp(/[&<>\"\']/),AMP=/&/g,LT=/</g,GT=/>/g,QUOT=/\"/g,SQUOT=/\'/g;dust.escapeHtml=function(e){return typeof e=="string"?HCHARS.test(e)?e.replace(AMP,"&amp;").replace(LT,"&lt;").replace(GT,"&gt;").replace(QUOT,"&quot;").replace(SQUOT,"&#39;"):e:e};var BS=/\\/g,FS=/\//g,CR=/\r/g,LS=/\u2028/g,PS=/\u2029/g,NL=/\n/g,LF=/\f/g,SQ=/'/g,DQ=/"/g,TB=/\t/g;dust.escapeJs=function(e){return typeof e=="string"?e.replace(BS,"\\\\").replace(FS,"\\/").replace(DQ,'\\"').replace(SQ,"\\'").replace(CR,"\\r").replace(LS,"\\u2028").replace(PS,"\\u2029").replace(NL,"\\n").replace(LF,"\\f").replace(TB,"\\t"):e}})(dust),typeof exports!="undefined"&&(typeof process!="undefined"&&require("./server")(dust),module.exports=dust);
//Dust-helpers - Additional functionality for dustjs-linkedin package v1.1.1
(function(dust){function isSelect(e){var t=e.current();return typeof t==="object"&&t.isSelect===true}function jsonFilter(e,t){if(typeof t==="function"){return t.toString()}return t}function filter(e,t,n,r,i){r=r||{};var s=n.block,o,u,a=r.filterOpType||"";if(typeof r.key!=="undefined"){o=dust.helpers.tap(r.key,e,t)}else if(isSelect(t)){o=t.current().selectKey;if(t.current().isResolved){i=function(){return false}}}else{_console.log("No key specified for filter in:"+a+" helper ");return e}u=dust.helpers.tap(r.value,e,t);if(i(coerce(u,r.type,t),coerce(o,r.type,t))){if(isSelect(t)){t.current().isResolved=true}if(s){return e.render(s,t)}else{_console.log("Missing body block in the "+a+" helper ");return e}}else if(n["else"]){return e.render(n["else"],t)}return e}function coerce(e,t,n){if(e){switch(t||typeof e){case"number":return+e;case"string":return String(e);case"boolean":{e=e==="false"?false:e;return Boolean(e)};case"date":return new Date(e);case"context":return n.get(e)}}return e}var _console=typeof console!=="undefined"?console:{log:function(){}};var helpers={tap:function(e,t,n){var r=e;if(typeof e==="function"){if(e.isFunction===true){r=e()}else{r="";t.tap(function(e){r+=e;return""}).render(e,n).untap();if(r===""){r=false}}}return r},sep:function(e,t,n){var r=n.block;if(t.stack.index===t.stack.of-1){return e}if(r){return n.block(e,t)}else{return e}},idx:function(e,t,n){var r=n.block;if(r){return n.block(e,t.push(t.stack.index))}else{return e}},contextDump:function(e,t,n,r){var i=r||{},s=i.to||"output",o=i.key||"current",u;s=dust.helpers.tap(s,e,t),o=dust.helpers.tap(o,e,t);if(o==="full"){u=JSON.stringify(t.stack,jsonFilter,2)}else{u=JSON.stringify(t.stack.head,jsonFilter,2)}if(s==="console"){_console.log(u);return e}else{return e.write(u)}},"if":function(chunk,context,bodies,params){var body=bodies.block,skip=bodies["else"];if(params&&params.cond){var cond=params.cond;cond=dust.helpers.tap(cond,chunk,context);if(eval(cond)){if(body){return chunk.render(bodies.block,context)}else{_console.log("Missing body block in the if helper!");return chunk}}if(skip){return chunk.render(bodies["else"],context)}}else{_console.log("No condition given in the if helper!")}return chunk},math:function(e,t,n,r){if(r&&typeof r.key!=="undefined"&&r.method){var i=r.key,s=r.method,o=r.operand,u=r.round,a=null,f=function(){_console.log("operand is required for this math method");return null};i=dust.helpers.tap(i,e,t);o=dust.helpers.tap(o,e,t);switch(s){case"mod":if(o===0||o===-0){_console.log("operand for divide operation is 0/-0: expect Nan!")}a=parseFloat(i)%parseFloat(o);break;case"add":a=parseFloat(i)+parseFloat(o);break;case"subtract":a=parseFloat(i)-parseFloat(o);break;case"multiply":a=parseFloat(i)*parseFloat(o);break;case"divide":if(o===0||o===-0){_console.log("operand for divide operation is 0/-0: expect Nan/Infinity!")}a=parseFloat(i)/parseFloat(o);break;case"ceil":a=Math.ceil(parseFloat(i));break;case"floor":a=Math.floor(parseFloat(i));break;case"round":a=Math.round(parseFloat(i));break;case"abs":a=Math.abs(parseFloat(i));break;default:_console.log("method passed is not supported")}if(a!==null){if(u){a=Math.round(a)}if(n&&n.block){return e.render(n.block,t.push({isSelect:true,isResolved:false,selectKey:a}))}else{return e.write(a)}}else{return e}}else{_console.log("Key is a required parameter for math helper along with method/operand!")}return e},select:function(e,t,n,r){var i=n.block;if(r&&typeof r.key!=="undefined"){var s=dust.helpers.tap(r.key,e,t);if(i){return e.render(n.block,t.push({isSelect:true,isResolved:false,selectKey:s}))}else{_console.log("Missing body block in the select helper ");return e}}else{_console.log("No key given in the select helper!")}return e},eq:function(e,t,n,r){if(r){r.filterOpType="eq"}return filter(e,t,n,r,function(e,t){return t===e})},ne:function(e,t,n,r){if(r){r.filterOpType="ne";return filter(e,t,n,r,function(e,t){return t!==e})}return e},lt:function(e,t,n,r){if(r){r.filterOpType="lt";return filter(e,t,n,r,function(e,t){return t<e})}},lte:function(e,t,n,r){if(r){r.filterOpType="lte";return filter(e,t,n,r,function(e,t){return t<=e})}return e},gt:function(e,t,n,r){if(r){r.filterOpType="gt";return filter(e,t,n,r,function(e,t){return t>e})}return e},gte:function(e,t,n,r){if(r){r.filterOpType="gte";return filter(e,t,n,r,function(e,t){return t>=e})}return e},"default":function(e,t,n,r){if(r){r.filterOpType="default"}return filter(e,t,n,r,function(e,t){return true})},size:function(e,t,n,r){var i,s=0,o,u;r=r||{};i=r.key;if(!i||i===true){s=0}else if(dust.isArray(i)){s=i.length}else if(!isNaN(parseFloat(i))&&isFinite(i)){s=i}else if(typeof i==="object"){o=0;for(u in i){if(Object.hasOwnProperty.call(i,u)){o++}}s=o}else{s=(i+"").length}return e.write(s)}};dust.helpers=helpers})(typeof exports!=="undefined"?module.exports=require("dustjs-linkedin"):dust);

// i18n.js
(function(e){function s(e,t){if(!t){t=""}var n={};for(var r in e){var i=e[r];r=t+r;if($.type(i)=="string"||$.type(i)=="function"){n[r]=i}else{$.extend(n,s(i,r+"."))}}return n}function a(e){return e.replace(/[-/\\^$*+?.()|[\]{}]/g,"\\$&")}var t;var n;var r={};var i=[];e.extend({i18n:{translations:{},missing:function(e,t){throw new this.error('Translation data missing for locale "'+e+'": '+t)},error:function(e){return new Error(e)},add:function(e,n,i){if(i===undefined&&typeof n==="object"){i=n}if(!this.translations[e]){var o={};o.merge=function(e){e=s(e);for(var t in e){this[t]=e[t]}};this.translations[e]=$.extend(o,n?this.translations[n]:{},s($.i18n.defaults.translation))}this.translations[e].merge(i);for(var u in r){this.translations[e][u]=this.translations[e][r[u]]}if(e==t){this.setLocale(t)}},deprecate:function(e){e=s(e);for(var t in e){r[t]=e[t]}},setLocale:function(e){newTranslation=this.translations[e];if(!newTranslation){throw new $.i18n.error('Translation for locale "'+e+'" not defined')}t=e;n=newTranslation;for(var r=0;r<i.length;r++){i[r](t)}},localeChange:function(e){i.push(e)},translate:function(e,r){if(!r){r={}}if("count"in r){if(r.count==0&&n[e+".none"]){e=e+".none"}else if(n[e+"."+n.plural(r.count)]){e=e+"."+n.plural(r.count)}}var i=n[e]||r.defaultText&&"{{defaultText}}";if(i==null){i=$.i18n.missing(t,e)}var s=$.extend({},r);for(var o in s){s[o]=$.i18n.localize(s[o])}i=$.interpolate(i,s,{prefix:"{{",suffix:"}}"}).text;return i},localize:function(e,t){if(e){if($.type(e)=="date"){t=$.extend({},$.i18n.defaults.localize,t);format=n[t.type+".formats."+t.format]||t.format;format=format.replace(/%a/,$.i18n.translate("date.abbrDayNames."+e.getDay()));format=format.replace(/%A/,$.i18n.translate("date.dayNames."+e.getDay()));format=format.replace(/%b/,$.i18n.translate("date.abbrMonthNames."+e.getMonth()));format=format.replace(/%B/,$.i18n.translate("date.monthNames."+e.getMonth()));format=format.replace(/%p/,$.i18n.translate("time."+(e.getHours()<12?"am":"pm")));e=$.strftime(e,format)}else if($.type(e)=="number"){e=$.withDelimiter(e,$.i18n.translate("number.delimiter"));if(t&&t.currency){e=$.i18n.translate("number.currency")+e}}else if(e.jquery){var r=e.appendTo("body");e=$("<div />").append(r.clone()).html();r.remove()}else if($.type(e)!="string"){e=e.toString()}}return e},defaults:{translation:{plural:function(e){return e==1?"one":"many"},date:{dayNames:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],abbrDayNames:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],monthNames:["January","February","March","April","May","June","July","August","September","October","November","December"],abbrMonthNames:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],formats:{"default":"%Y-%m-%d","short":"%b %d","long":"%B %d, %Y"}},time:{am:"am",pm:"pm",formats:{"default":"%a, %d %b %Y %H:%M:%S %z","short":"%d %b %H:%M","long":"%B %d, %Y %H:%M"}},number:{delimiter:",",currency:"$"}},localize:{format:"default",type:"time"},locale:"en-US"}}});e.extend($.i18n,{t:$.i18n.translate,l:$.i18n.localize});$.i18n.add($.i18n.defaults.locale,{});$.i18n.setLocale($.i18n.defaults.locale);var o={zeropad:function(e){return e>9?e:"0"+e},a:function(e){return["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][e.getDay()]},A:function(e){return["Sunday","Monday","Tuedsay","Wednesday","Thursday","Friday","Saturday"][e.getDay()]},b:function(e){return["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][e.getMonth()]},B:function(e){return["January","February","March","April","May","June","July","August","September","October","November","December"][e.getMonth()]},c:function(e){return e.toString()},d:function(e){return this.zeropad(e.getDate())},H:function(e){return this.zeropad(e.getHours())},I:function(e){return this.zeropad((e.getHours()+12)%12)},m:function(e){return this.zeropad(e.getMonth()+1)},M:function(e){return this.zeropad(e.getMinutes())},p:function(e){return this.H(e)<12?"AM":"PM"},S:function(e){return this.zeropad(e.getSeconds())},w:function(e){return e.getDay()},y:function(e){return this.zeropad(this.Y(e)%100)},Y:function(e){return e.getFullYear()},z:function(e){var t=e.getTimezoneOffset();return(t>0?"-":"+")+this.zeropad(parseInt(Math.abs(t/60),10))+this.zeropad(t%60)},Z:function(e){return e.toString().replace(/^.*\(([^)]+)\)$/,"$1")},"%":function(e){return"%"}};e.extend({strftime:function(e,t,n){if(n){var r=e;var i={toString:function(){return r.toString()},getTimezoneOffset:function(){return r.getTimezoneOffset()}};var s=["Date","Day","FullYear","Hours","Milliseconds","Minutes","Month","Seconds","String"];for(var u=0;u<s.length;u++){i["get"+s[u]]=function(e){return function(){return r["getUTC"+e]()}}(s[u])}e=i}for(var a in o){if(a.length==1){t=t.replace("%"+a,o[a](e))}}return t}});e.extend({inflector:{inflections:{plurals:[],singulars:[],uncountables:[]},plural:function(e,t){$.inflector.inflections.plurals.unshift([e,t]);return this},singular:function(e,t){$.inflector.inflections.singulars.unshift([e,t]);return this},irregular:function(e,t){if(e.charAt(0).toUpperCase()==t.charAt(0).toUpperCase()){this.plural(new RegExp("("+e.charAt(0)+")"+e.substring(1)+"$","i"),"$1"+t.substring(1));this.singular(new RegExp("("+t.charAt(0)+")"+t.substring(1)+"$","i"),"$1"+e.substring(1))}else{this.plural(new RegExp(e.charAt(0).toUpperCase()+e.substring(1)+"$"),t.charAt(0).toUpperCase()+t.substring(1));this.plural(new RegExp(e.charAt(0).toLowerCase()+e.substring(1)+"$"),t.charAt(0).toLowerCase()+t.substring(1));this.singular(new RegExp(t.charAt(0).toUpperCase()+t.substring(1)+"$"),e.charAt(0).toUpperCase()+e.substring(1));this.singular(new RegExp(t.charAt(0).toLowerCase()+t.substring(1)+"$"),e.charAt(0).toLowerCase()+e.substring(1))}this.singular(new RegExp("("+e.charAt(0)+")"+e.substring(1)+"$","i"),"$1"+e.substring(1));this.plural(new RegExp("("+t.charAt(0)+")"+t.substring(1)+"$","i"),"$1"+t.substring(1));return this},uncountable:function(){for(var e=0;e<arguments.length;e++){$.inflector.inflections.uncountables.unshift(new RegExp(arguments[e]+"$","i"))}return this}}});var u=function(e,t){var n=e.toLowerCase();if(n==""){return e}else{for(var r=0;r<$.inflector.inflections.uncountables.length;r++){var i=$.inflector.inflections.uncountables[r];if(i.test(e)){return e}}for(var r=0;r<t.length;r++){var s=t[r];var i=s[0];var o=s[1];if(i.test(e)){return e.replace(i,o)}}}return e};e.extend({pluralize:function(e,t){if(e==null){e=""}var n;if(t==1){n=e}else{n=u(e,$.inflector.inflections.plurals)}if(t!=null){n=t+" "+n}return n},singularize:function(e){if(e==null){return""}return u(e,$.inflector.inflections.singulars)},constantize:function(e){var t=window;var n=e.split(".");for(var r=0;r<n.length;r++){t=t[n[r]];if(!t)throw""+e+" is not a valid constant name!"}return t},camelize:function(e,t){if(e==null){e=""}if(t!=false){return e.toString().replace(/(?:^|_)(.)/g,function(e,t){return t.toUpperCase()})}else{return e.charAt(0)+this.camelize(e).slice(1)}},titleize:function(e){if(e==null){e=""}var t=e.replace("_"," ");var n=t.split(" ");for(var r=0;r<n.length;r++){n[r]=n[r].substr(0,1).toUpperCase()+n[r].substr(1)}return n.join(" ")}});e.inflector.plural(/$/,"s").plural(/s$/i,"s").plural(/(ax|test)is$/i,"$1es").plural(/(octop|vir)us$/i,"$1i").plural(/(alias|status)$/i,"$1es").plural(/(bu)s$/i,"$1ses").plural(/(buffal|tomat)o$/i,"$1oes").plural(/([ti])um$/i,"$1a").plural(/sis$/i,"ses").plural(/(?:([^f])fe|([lr])f)$/i,"$1$2ves").plural(/(hive)$/i,"$1s").plural(/([^aeiouy]|qu)y$/i,"$1ies").plural(/(x|ch|ss|sh)$/i,"$1es").plural(/(matr|vert|ind)ix|ex$/i,"$1ices").plural(/([m|l])ouse$/i,"$1ice").plural(/^(ox)$/i,"$1en").plural(/(quiz)$/i,"$1zes").singular(/s$/i,"").singular(/(n)ews$/i,"$1ews").singular(/([ti])a$/i,"$1um").singular(/((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$/i,"$1$2sis").singular(/(^analy)ses$/i,"$1sis").singular(/([^f])ves$/i,"$1fe").singular(/(hive)s$/i,"$1").singular(/(tive)s$/i,"$1").singular(/([lr])ves$/i,"$1f").singular(/([^aeiouy]|qu)ies$/i,"$1y").singular(/(s)eries$/i,"$1eries").singular(/(m)ovies$/i,"$1ovie").singular(/(x|ch|ss|sh)es$/i,"$1").singular(/([m|l])ice$/i,"$1ouse").singular(/(bus)es$/i,"$1").singular(/(o)es$/i,"$1").singular(/(shoe)s$/i,"$1").singular(/(cris|ax|test)es$/i,"$1is").singular(/(octop|vir)i$/i,"$1us").singular(/(alias|status)es$/i,"$1").singular(/^(ox)en/i,"$1").singular(/(vert|ind)ices$/i,"$1ex").singular(/(matr)ices$/i,"$1ix").singular(/(quiz)zes$/i,"$1").irregular("person","people").irregular("man","men").irregular("child","children").irregular("sex","sexes").irregular("move","moves").irregular("cow","kine").uncountable("equipment","information","rice","money","species","series","fish","sheep");e.extend({interpolate:function(t,n,r){r=e.extend({},$.interpolate.defaults,r);var i={};var s=[];for(var o in n){s.push(a(o))}t=t.replace(new RegExp("(?:(\\\\)?"+a(r.prefix)+"("+s.join("|")+")"+a(r.suffix)+")","g"),function(e,t,s){if(t){return r.prefix+s+r.suffix}else{var o=n[s];if($.type(o)=="function"){o=o()}return i[s]=r.encode?encodeURIComponent(o):o}});var u={};for(var o in n){if(!(o in i)){u[o]=n[o]}}return{text:t,skipped:u,replaced:i}}});e.extend(e.interpolate,{defaults:{prefix:"%",suffix:"%",encode:false}});e.extend({withDelimiter:function(e,t){if(!t)t=",";var n=e.toString().split(".");var r=n[0];var i=/(\d+)(\d{3})/;while(i.test(r)){r=r.replace(i,"$1,$2")}var s=n.length>1?"."+n[1]:"";return r+s}})})($);

/*! Licensed under MIT, https://github.com/sofish/pen */
(function(doc) {

  var Pen, FakePen, utils = {};

  // type detect
  utils.is = function(obj, type) {
    return Object.prototype.toString.call(obj).slice(8, -1) === type;
  };

  // copy props from a obj
  utils.copy = function(defaults, source) {
    for(var p in source) {
      if(source.hasOwnProperty(p)) {
        var val = source[p];
        defaults[p] = this.is(val, 'Object') ? this.copy({}, val) :
          this.is(val, 'Array') ? this.copy([], val) : val;
      }
    }
    return defaults;
  };

  // log
  utils.log = function(message, force) {
    if(window._pen_debug_mode_on || force) console.log('%cPEN DEBUGGER: %c' + message, 'font-family:arial,sans-serif;color:#1abf89;line-height:2em;', 'font-family:cursor,monospace;color:#333;');
  };

  // shift a function
  utils.shift = function(key, fn, time) {
    time = time || 50;
    var queue = this['_shift_fn' + key], timeout = 'shift_timeout' + key, current;
    if ( queue ) {
      queue.concat([fn, time]);
    }
    else {
      queue = [[fn, time]];
    }
    current = queue.pop();
    clearTimeout(this[timeout]);
    this[timeout] = setTimeout(function() {
      current[0]();
    }, time);
  };

  // merge: make it easy to have a fallback
  utils.merge = function(config) {

    // default settings
    var defaults = {
      class: 'pen',
      debug: false,
      stay: config.stay || !config.debug,
      textarea: '<textarea name="content"></textarea>',
      list: [
        'blockquote', 'h2', 'h3', 'p', 'insertorderedlist', 'insertunorderedlist', 'inserthorizontalrule',
        'indent', 'outdent', 'bold', 'italic', 'underline', 'createlink'
      ]
    };

    // user-friendly config
    if(config.nodeType === 1) {
      defaults.editor = config;
    } else if(config.match && config.match(/^#[\S]+$/)) {
      defaults.editor = doc.getElementById(config.slice(1));
    } else {
      defaults = utils.copy(defaults, config);
    }

    return defaults;
  };

  Pen = function(config) {

    if(!config) return utils.log('can\'t find config', true);

    // merge user config
    var defaults = utils.merge(config);

    if(defaults.editor.nodeType !== 1) return utils.log('can\'t find editor');
    if(defaults.debug) window._pen_debug_mode_on = true;

    var editor = defaults.editor;

    // set default class
    editor.classList.add(defaults.class);

    // set contenteditable
    var editable = editor.getAttribute('contenteditable');
    if(!editable) editor.setAttribute('contenteditable', 'true');

    // assign config
    this.config = defaults;

    // save the selection obj
    this._sel = doc.getSelection();

    // map actions
    this.actions();

    // enable toolbar
    this.toolbar();

    // enable markdown covert
    if (this.markdown) {
      this.markdown.init(this);
    }

    // stay on the page
    if (this.config.stay) {
      this.stay();
    }
  };

  // node effects
  Pen.prototype._effectNode = function(el, returnAsNodeName) {
    var nodes = [];
    while(el !== this.config.editor) {
      if(el.nodeName.match(/(?:[pubia]|h[1-6]|blockquote|[uo]l|li)/i)) {
        nodes.push(returnAsNodeName ? el.nodeName.toLowerCase() : el);
      }
      el = el.parentNode;
    }
    return nodes;
  };

  // remove style attr
  Pen.prototype.nostyle = function() {
    var els = this.config.editor.querySelectorAll('[style]');
    [].slice.call(els).forEach(function(item) {
      item.removeAttribute('style');
    });
    return this;
  };

  Pen.prototype.toolbar = function() {

    var that = this, icons = '';

    for(var i = 0, list = this.config.list; i < list.length; i++) {
      var name = list[i], klass = 'pen-icon icon-' + name;
      icons += '<i class="' + klass + '" data-action="' + name + '">' + (name.match(/^h[1-6]|p$/i) ? name.toUpperCase() : '') + '</i>';
      if((name === 'createlink')) icons += '<input class="pen-input" placeholder="http://" />';
    }

    var menu = doc.createElement('div');
    menu.setAttribute('class', this.config.class + '-menu pen-menu');
    menu.innerHTML = icons;
    menu.style.display = 'none';

    doc.body.appendChild((this._menu = menu));

    var setpos = function() {
      if(menu.style.display === 'block') that.menu();
    };

    // change menu offset when window resize / scroll
    window.addEventListener('resize', setpos);
    window.addEventListener('scroll', setpos);

    var editor = this.config.editor;
    var toggle = function() {

      if(that._isDestroyed) return;

      utils.shift('toggle_menu', function() {
        var range = that._sel;
        if(!range.isCollapsed) {
          //show menu
          that._range = range.getRangeAt(0);
          that.menu().highlight();
        } else {
          //hide menu
          that._menu.style.display = 'none';
        }
      }, 200);
    };

    // toggle toolbar on mouse select
    editor.addEventListener('mouseup', toggle);

    // toggle toolbar on key select
    editor.addEventListener('keyup', toggle);

    // toggle toolbar on key select
    menu.addEventListener('click', function(e) {
      var action = e.target.getAttribute('data-action');

      if(!action) return;

      var apply = function(value) {
        that._sel.removeAllRanges();
        that._sel.addRange(that._range);
        that._actions(action, value);
        that._range = that._sel.getRangeAt(0);
        that.highlight().nostyle().menu();
      };

      // create link
      if(action === 'createlink') {
        var input = menu.getElementsByTagName('input')[0], createlink;

        input.style.display = 'block';
        input.focus();

        createlink = function(input) {
          input.style.display = 'none';
          if(input.value) return apply(input.value.replace(/(^\s+)|(\s+$)/g, '').replace(/^(?!http:\/\/|https:\/\/)(.*)$/, 'http://$1'));
          action = 'unlink';
          apply();
        };

        input.onkeypress = function(e) {
          if(e.which === 13) return createlink(e.target);
        };

        return input.onkeypress;
      }

      apply();
    });

    return this;
  };

  // highlight menu
  Pen.prototype.highlight = function() {
    var node = this._sel.focusNode
      , effects = this._effectNode(node)
      , menu = this._menu
      , linkInput = menu.querySelector('input')
      , highlight;

    // remove all highlights
    [].slice.call(menu.querySelectorAll('.active')).forEach(function(el) {
      el.classList.remove('active');
    });

    // display link input if createlink enabled
    if (linkInput) linkInput.style.display = 'none';

    highlight = function(str) {
      var selector = '.icon-' + str
        , el = menu.querySelector(selector);
      return el && el.classList.add('active');
    };

    effects.forEach(function(item) {
      var tag = item.nodeName.toLowerCase();
      switch(tag) {
        case 'a':
          return (menu.querySelector('input').value = item.href), highlight('createlink');
        case 'i':
          return highlight('italic');
        case 'u':
          return highlight('underline');
        case 'b':
          return highlight('bold');
        case 'ul':
          return highlight('insertunorderedlist');
        case 'ol':
          return highlight('insertorderedlist');
        case 'ol':
          return highlight('insertorderedlist');
        case 'li':
          return highlight('indent');
        default :
          highlight(tag);
      }
    });

    return this;
  };

  Pen.prototype.actions = function() {
    var that = this, reg, block, overall, insert;

    // allow command list
    reg = {
      block: /^(?:p|h[1-6]|blockquote|pre)$/,
      inline: /^(?:bold|italic|underline|insertorderedlist|insertunorderedlist|indent|outdent)$/,
      source: /^(?:insertimage|createlink|unlink)$/,
      insert: /^(?:inserthorizontalrule|insert)$/
    };

    overall = function(cmd, val) {
      var message = ' to exec 「' + cmd + '」 command' + (val ? (' with value: ' + val) : '');
      if(document.execCommand(cmd, false, val) && that.config.debug) {
        utils.log('success' + message);
      } else {
        utils.log('fail' + message);
      }
    };

    insert = function(name) {
      var range = that._sel.getRangeAt(0)
        , node = range.startContainer;

      while(node.nodeType !== 1) {
        node = node.parentNode;
      }

      range.selectNode(node);
      range.collapse(false);
      return overall(name);
    };

    block = function(name) {
      if(that._effectNode(that._sel.getRangeAt(0).startContainer, true).indexOf(name) !== -1) {
        if(name === 'blockquote') return document.execCommand('outdent', false, null);
        name = 'p';
      }
      return overall('formatblock', name);
    };

    this._actions = function(name, value) {
      if(name.match(reg.block)) {
        block(name);
      } else if(name.match(reg.inline) || name.match(reg.source)) {
        overall(name, value);
      } else if(name.match(reg.insert)) {
        insert(name);
      } else {
        if(this.config.debug) utils.log('can not find command function for name: ' + name + (value ? (', value: ' + value) : ''));
      }
    };

    return this;
  };

  // show menu
  Pen.prototype.menu = function() {

    var offset = this._range.getBoundingClientRect()
      , top = offset.top - 10
      , left = offset.left + (offset.width / 2)
      , menu = this._menu;

    // display block to caculate it's width & height
    menu.style.display = 'block';
    menu.style.top = top - menu.clientHeight + 'px';
    menu.style.left = left - (menu.clientWidth/2) + 'px';

    return this;
  };

  Pen.prototype.stay = function() {
    var that = this;
    if (!window.onbeforeunload) {
      window.onbeforeunload = function() {
        if(!that._isDestroyed) return 'Are you going to leave here?';
      };
    }
  };

  Pen.prototype.destroy = function(isAJoke) {
    var destroy = isAJoke ? false : true
      , attr = isAJoke ? 'setAttribute' : 'removeAttribute';

    if(!isAJoke) {
      this._sel.removeAllRanges();
      this._menu.style.display = 'none';
    }
    this._isDestroyed = destroy;
    this.config.editor[attr]('contenteditable', '');

    return this;
  };

  Pen.prototype.rebuild = function() {
    return this.destroy('it\'s a joke');
  };

  // a fallback for old browers
  FakePen = function(config) {
    if(!config) return utils.log('can\'t find config', true);

    var defaults = utils.merge(config)
      , klass = defaults.editor.getAttribute('class');

    klass = klass ? klass.replace(/\bpen\b/g, '') + ' pen-textarea ' + defaults.class : 'pen pen-textarea';
    defaults.editor.setAttribute('class', klass);
    defaults.editor.innerHTML = defaults.textarea;
    return defaults.editor;
  };

  // make it accessible
  this.Pen = doc.getSelection ? Pen : FakePen;

}(document));

/*! Licensed under MIT, https://github.com/sofish/pen, markdown support */
(function() {

  // only works with Pen
  if(!this.Pen) return;

  // markdown covertor obj
  var covertor = {
    keymap: { '96': '`', '62': '>', '49': '1', '46': '.', '45': '-', '42': '*', '35': '#'},
    stack : []
  };

  // return valid markdown syntax
  covertor.valid = function(str) {
    var len = str.length;

    if(str.match(/[#]{1,6}/)) {
      return ['h' + len, len];
    } else if(str === '```') {
      return ['pre', len];
    } else if(str === '>') {
      return ['blockquote', len];
    } else if(str === '1.') {
      return ['insertorderedlist', len];
    } else if(str === '-' || str === '*') {
      return ['insertunorderedlist', len];
    } else if(str.match(/(?:\.|\*|\-){3,}/)) {
      return ['inserthorizontalrule', len];
    }
  };

  // parse command
  covertor.parse = function(e) {
    var code = e.keyCode || e.which;

    // when `space` is pressed
    if(code === 32) {
      var cmd = this.stack.join('');
      this.stack.length = 0;
      return this.valid(cmd);
    }

    // make cmd
    if(this.keymap[code]) this.stack.push(this.keymap[code]);

    return false;
  };

  // exec command
  covertor.action = function(pen, cmd) {

    // only apply effect at line start
    if(pen._sel.focusOffset > cmd[1]) return;

    var node = pen._sel.focusNode;
    node.textContent = node.textContent.slice(cmd[1]);
    pen._actions(cmd[0]);
    pen.nostyle();
  };

  // init covertor
  covertor.init = function(pen) {
    pen.config.editor.addEventListener('keypress', function(e) {
      var cmd = covertor.parse(e);
      if(cmd) return covertor.action(pen, cmd);
    });
  };

  // append to Pen
  window.Pen.prototype.markdown = covertor;

}());

/*global module, console*/

function MediumEditor(elements, options) {
    'use strict';
    return this.init(elements, options);
}

if (typeof module === 'object') {
    module.exports = MediumEditor;
}

(function (window, document) {
    'use strict';

    function extend(b, a) {
        var prop;
        if (b === undefined) {
            return a;
        }
        for (prop in a) {
            if (a.hasOwnProperty(prop) && b.hasOwnProperty(prop) === false) {
                b[prop] = a[prop];
            }
        }
        return b;
    }

    // http://stackoverflow.com/questions/5605401/insert-link-in-contenteditable-element
    // by Tim Down
    function saveSelection() {
        var i,
            len,
            ranges,
            sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            ranges = [];
            for (i = 0, len = sel.rangeCount; i < len; i += 1) {
                ranges.push(sel.getRangeAt(i));
            }
            return ranges;
        }
        return null;
    }

    function restoreSelection(savedSel) {
        var i,
            len,
            sel = window.getSelection();
        if (savedSel) {
            sel.removeAllRanges();
            for (i = 0, len = savedSel.length; i < len; i += 1) {
                sel.addRange(savedSel[i]);
            }
        }
    }

    // http://stackoverflow.com/questions/1197401/how-can-i-get-the-element-the-caret-is-in-with-javascript-when-using-contentedi
    // by You
    function getSelectionStart() {
        var node = document.getSelection().anchorNode,
            startNode = (node && node.nodeType === 3 ? node.parentNode : node);
        return startNode;
    }

    // http://stackoverflow.com/questions/4176923/html-of-selected-text
    // by Tim Down
    function getSelectionHtml() {
        var i,
            html = '',
            sel,
            len,
            container;
        if (window.getSelection !== undefined) {
            sel = window.getSelection();
            if (sel.rangeCount) {
                container = document.createElement('div');
                for (i = 0, len = sel.rangeCount; i < len; i += 1) {
                    container.appendChild(sel.getRangeAt(i).cloneContents());
                }
                html = container.innerHTML;
            }
        } else if (document.selection !== undefined) {
            if (document.selection.type === 'Text') {
                html = document.selection.createRange().htmlText;
            }
        }
        return html;
    }

    // https://github.com/jashkenas/underscore
    function isElement(obj) {
        return !!(obj && obj.nodeType === 1);
    }

    MediumEditor.prototype = {
        defaults: {
            allowMultiParagraphSelection: true,
            anchorInputPlaceholder: 'Paste or type a link',
            anchorPreviewHideDelay: 500,
            buttons: ['bold', 'italic', 'underline', 'anchor', 'header1', 'header2', 'quote'],
            buttonLabels: false,
            checkLinkFormat: false,
            cleanPastedHTML: false,
            delay: 0,
            diffLeft: 0,
            diffTop: -10,
            disableReturn: false,
            disableDoubleReturn: false,
            disableToolbar: false,
            disableEditing: false,
            elementsContainer: false,
            firstHeader: 'h3',
            forcePlainText: true,
            placeholder: 'Type your text',
            secondHeader: 'h4',
            targetBlank: false,
            extensions: {},
            activeButtonClass: 'medium-editor-button-active',
            firstButtonClass: 'medium-editor-button-first',
            lastButtonClass: 'medium-editor-button-last'
        },

        // http://stackoverflow.com/questions/17907445/how-to-detect-ie11#comment30165888_17907562
        // by rg89
        isIE: ((navigator.appName === 'Microsoft Internet Explorer') || ((navigator.appName === 'Netscape') && (new RegExp('Trident/.*rv:([0-9]{1,}[.0-9]{0,})').exec(navigator.userAgent) !== null))),

        init: function (elements, options) {
            this.setElementSelection(elements);
            if (this.elements.length === 0) {
                return;
            }
            this.parentElements = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre'];
            this.id = document.querySelectorAll('.medium-editor-toolbar').length + 1;
            this.options = extend(options, this.defaults);
            return this.setup();
        },

        setup: function () {
            this.isActive = true;
            this.initElements()
                .bindSelect()
                .bindPaste()
                .setPlaceholders()
                .bindWindowActions()
                .passInstance();
        },

        initElements: function () {
            this.updateElementList();
            var i,
                addToolbar = false;
            for (i = 0; i < this.elements.length; i += 1) {
                if (!this.options.disableEditing && !this.elements[i].getAttribute('data-disable-editing')) {
                    this.elements[i].setAttribute('contentEditable', true);
                }
                if (!this.elements[i].getAttribute('data-placeholder')) {
                    this.elements[i].setAttribute('data-placeholder', this.options.placeholder);
                }
                this.elements[i].setAttribute('data-medium-element', true);
                this.bindParagraphCreation(i).bindReturn(i).bindTab(i);
                if (!this.options.disableToolbar && !this.elements[i].getAttribute('data-disable-toolbar')) {
                    addToolbar = true;
                }
            }
            // Init toolbar
            if (addToolbar) {
                if (!this.options.elementsContainer) {
                    this.options.elementsContainer = document.body;
                }
                this.initToolbar()
                    .bindButtons()
                    .bindAnchorForm()
                    .bindAnchorPreview();
            }
            return this;
        },

        setElementSelection: function (selector) {
            this.elementSelection = selector;
            this.updateElementList();
        },

        updateElementList: function () {
            this.elements = typeof this.elementSelection === 'string' ? document.querySelectorAll(this.elementSelection) : this.elementSelection;
            if (this.elements.nodeType === 1) {
                this.elements = [this.elements];
            }
        },

        serialize: function () {
            var i,
                elementid,
                content = {};
            for (i = 0; i < this.elements.length; i += 1) {
                elementid = (this.elements[i].id !== '') ? this.elements[i].id : 'element-' + i;
                content[elementid] = {
                    value: this.elements[i].innerHTML.trim()
                };
            }
            return content;
        },

        /**
         * Helper function to call a method with a number of parameters on all registered extensions.
         * The function assures that the function exists before calling.
         *
         * @param {string} funcName name of the function to call
         * @param [args] arguments passed into funcName
         */
        callExtensions: function (funcName) {
            if (arguments.length < 1) {
                return;
            }

            var args = Array.prototype.slice.call(arguments, 1),
                ext,
                name;

            for (name in this.options.extensions) {
                if (this.options.extensions.hasOwnProperty(name)) {
                    ext = this.options.extensions[name];
                    if (ext[funcName] !== undefined) {
                        ext[funcName].apply(ext, args);
                    }
                }
            }
        },

        /**
         * Pass current Medium Editor instance to all extensions
         * if extension constructor has 'parent' attribute set to 'true'
         *
         */
        passInstance: function () {
            var self = this,
                ext,
                name;

            for (name in self.options.extensions) {
                if (self.options.extensions.hasOwnProperty(name)) {
                    ext = self.options.extensions[name];

                    if (ext.parent) {
                        ext.base = self;
                    }
                }
            }

            return self;
        },

        bindParagraphCreation: function (index) {
            var self = this;
            this.elements[index].addEventListener('keypress', function (e) {
                var node = getSelectionStart(),
                    tagName;
                if (e.which === 32) {
                    tagName = node.tagName.toLowerCase();
                    if (tagName === 'a') {
                        document.execCommand('unlink', false, null);
                    }
                }
            });

            this.elements[index].addEventListener('keyup', function (e) {
                var node = getSelectionStart(),
                    tagName;
                if (node && node.getAttribute('data-medium-element') && node.children.length === 0 && !(self.options.disableReturn || node.getAttribute('data-disable-return'))) {
                    document.execCommand('formatBlock', false, 'p');
                }
                if (e.which === 13) {
                    node = getSelectionStart();
                    tagName = node.tagName.toLowerCase();
                    if (!(self.options.disableReturn || this.getAttribute('data-disable-return')) &&
                        tagName !== 'li' && !self.isListItemChild(node)) {
                        if (!e.shiftKey) {
                            document.execCommand('formatBlock', false, 'p');
                        }
                        if (tagName === 'a') {
                            document.execCommand('unlink', false, null);
                        }
                    }
                }
            });
            return this;
        },

        isListItemChild: function (node) {
            var parentNode = node.parentNode,
                tagName = parentNode.tagName.toLowerCase();
            while (this.parentElements.indexOf(tagName) === -1 && tagName !== 'div') {
                if (tagName === 'li') {
                    return true;
                }
                parentNode = parentNode.parentNode;
                if (parentNode && parentNode.tagName) {
                    tagName = parentNode.tagName.toLowerCase();
                } else {
                    return false;
                }
            }
            return false;
        },

        bindReturn: function (index) {
            var self = this;
            this.elements[index].addEventListener('keypress', function (e) {
                if (e.which === 13) {
                    if (self.options.disableReturn || this.getAttribute('data-disable-return')) {
                        e.preventDefault();
                    } else if (self.options.disableDoubleReturn || this.getAttribute('data-disable-double-return')) {
                        var node = getSelectionStart();
                        if (node && node.innerText === '\n') {
                            e.preventDefault();
                        }
                    }
                }
            });
            return this;
        },

        bindTab: function (index) {
            this.elements[index].addEventListener('keydown', function (e) {
                if (e.which === 9) {
                    // Override tab only for pre nodes
                    var tag = getSelectionStart().tagName.toLowerCase();
                    if (tag === 'pre') {
                        e.preventDefault();
                        document.execCommand('insertHtml', null, '    ');
                    }
                }
            });
            return this;
        },

        buttonTemplate: function (btnType) {
            var buttonLabels = this.getButtonLabels(this.options.buttonLabels),
                buttonTemplates = {
                    'bold': '<button class="medium-editor-action medium-editor-action-bold" data-action="bold" data-element="b">' + buttonLabels.bold + '</button>',
                    'italic': '<button class="medium-editor-action medium-editor-action-italic" data-action="italic" data-element="i">' + buttonLabels.italic + '</button>',
                    'underline': '<button class="medium-editor-action medium-editor-action-underline" data-action="underline" data-element="u">' + buttonLabels.underline + '</button>',
                    'strikethrough': '<button class="medium-editor-action medium-editor-action-strikethrough" data-action="strikethrough" data-element="strike"><strike>A</strike></button>',
                    'superscript': '<button class="medium-editor-action medium-editor-action-superscript" data-action="superscript" data-element="sup">' + buttonLabels.superscript + '</button>',
                    'subscript': '<button class="medium-editor-action medium-editor-action-subscript" data-action="subscript" data-element="sub">' + buttonLabels.subscript + '</button>',
                    'anchor': '<button class="medium-editor-action medium-editor-action-anchor" data-action="anchor" data-element="a">' + buttonLabels.anchor + '</button>',
                    'image': '<button class="medium-editor-action medium-editor-action-image" data-action="image" data-element="img">' + buttonLabels.image + '</button>',
                    'header1': '<button class="medium-editor-action medium-editor-action-header1" data-action="append-' + this.options.firstHeader + '" data-element="' + this.options.firstHeader + '">' + buttonLabels.header1 + '</button>',
                    'header2': '<button class="medium-editor-action medium-editor-action-header2" data-action="append-' + this.options.secondHeader + '" data-element="' + this.options.secondHeader + '">' + buttonLabels.header2 + '</button>',
                    'quote': '<button class="medium-editor-action medium-editor-action-quote" data-action="append-blockquote" data-element="blockquote">' + buttonLabels.quote + '</button>',
                    'orderedlist': '<button class="medium-editor-action medium-editor-action-orderedlist" data-action="insertorderedlist" data-element="ol">' + buttonLabels.orderedlist + '</button>',
                    'unorderedlist': '<button class="medium-editor-action medium-editor-action-unorderedlist" data-action="insertunorderedlist" data-element="ul">' + buttonLabels.unorderedlist + '</button>',
                    'pre': '<button class="medium-editor-action medium-editor-action-pre" data-action="append-pre" data-element="pre">' + buttonLabels.pre + '</button>',
                    'indent': '<button class="medium-editor-action medium-editor-action-indent" data-action="indent" data-element="ul">' + buttonLabels.indent + '</button>',
                    'outdent': '<button class="medium-editor-action medium-editor-action-outdent" data-action="outdent" data-element="ul">' + buttonLabels.outdent + '</button>'
                };
            return buttonTemplates[btnType] || false;
        },

        // TODO: break method
        getButtonLabels: function (buttonLabelType) {
            var customButtonLabels,
                attrname,
                buttonLabels = {
                    'bold': '<b>B</b>',
                    'italic': '<b><i>I</i></b>',
                    'underline': '<b><u>U</u></b>',
                    'superscript': '<b>x<sup>1</sup></b>',
                    'subscript': '<b>x<sub>1</sub></b>',
                    'anchor': '<b>#</b>',
                    'image': '<b>image</b>',
                    'header1': '<b>H1</b>',
                    'header2': '<b>H2</b>',
                    'quote': '<b>&ldquo;</b>',
                    'orderedlist': '<b>1.</b>',
                    'unorderedlist': '<b>&bull;</b>',
                    'pre': '<b>0101</b>',
                    'indent': '<b>&rarr;</b>',
                    'outdent': '<b>&larr;</b>'
                };
            if (buttonLabelType === 'fontawesome') {
                customButtonLabels = {
                    'bold': '<i class="fa fa-bold"></i>',
                    'italic': '<i class="fa fa-italic"></i>',
                    'underline': '<i class="fa fa-underline"></i>',
                    'superscript': '<i class="fa fa-superscript"></i>',
                    'subscript': '<i class="fa fa-subscript"></i>',
                    'anchor': '<i class="fa fa-link"></i>',
                    'image': '<i class="fa fa-picture-o"></i>',
                    'quote': '<i class="fa fa-quote-right"></i>',
                    'orderedlist': '<i class="fa fa-list-ol"></i>',
                    'unorderedlist': '<i class="fa fa-list-ul"></i>',
                    'pre': '<i class="fa fa-code fa-lg"></i>',
                    'indent': '<i class="fa fa-indent"></i>',
                    'outdent': '<i class="fa fa-outdent"></i>'
                };
            } else if (typeof buttonLabelType === 'object') {
                customButtonLabels = buttonLabelType;
            }
            if (typeof customButtonLabels === 'object') {
                for (attrname in customButtonLabels) {
                    if (customButtonLabels.hasOwnProperty(attrname)) {
                        buttonLabels[attrname] = customButtonLabels[attrname];
                    }
                }
            }
            return buttonLabels;
        },

        initToolbar: function () {
            if (this.toolbar) {
                return this;
            }
            this.toolbar = this.createToolbar();
            this.keepToolbarAlive = false;
            this.anchorForm = this.toolbar.querySelector('.medium-editor-toolbar-form-anchor');
            this.anchorInput = this.anchorForm.querySelector('input');
            this.toolbarActions = this.toolbar.querySelector('.medium-editor-toolbar-actions');
            this.anchorPreview = this.createAnchorPreview();

            return this;
        },

        createToolbar: function () {
            var toolbar = document.createElement('div');
            toolbar.id = 'medium-editor-toolbar-' + this.id;
            toolbar.className = 'medium-editor-toolbar';
            toolbar.appendChild(this.toolbarButtons());
            toolbar.appendChild(this.toolbarFormAnchor());
            this.options.elementsContainer.appendChild(toolbar);
            return toolbar;
        },

        //TODO: actionTemplate
        toolbarButtons: function () {
            var btns = this.options.buttons,
                ul = document.createElement('ul'),
                li,
                i,
                btn,
                ext;

            ul.id = 'medium-editor-toolbar-actions';
            ul.className = 'medium-editor-toolbar-actions clearfix';

            for (i = 0; i < btns.length; i += 1) {
                if (this.options.extensions.hasOwnProperty(btns[i])) {
                    ext = this.options.extensions[btns[i]];
                    btn = ext.getButton !== undefined ? ext.getButton() : null;
                } else {
                    btn = this.buttonTemplate(btns[i]);
                }

                if (btn) {
                    li = document.createElement('li');
                    if (isElement(btn)) {
                        li.appendChild(btn);
                    } else {
                        li.innerHTML = btn;
                    }
                    ul.appendChild(li);
                }
            }

            return ul;
        },

        toolbarFormAnchor: function () {
            var anchor = document.createElement('div'),
                input = document.createElement('input'),
                a = document.createElement('a');

            a.setAttribute('href', '#');
            a.innerHTML = '&times;';

            input.setAttribute('type', 'text');
            input.setAttribute('placeholder', this.options.anchorInputPlaceholder);

            anchor.className = 'medium-editor-toolbar-form-anchor';
            anchor.id = 'medium-editor-toolbar-form-anchor';
            anchor.appendChild(input);
            anchor.appendChild(a);

            return anchor;
        },

        bindSelect: function () {
            var self = this,
                timer = '',
                i;

            this.checkSelectionWrapper = function (e) {

                // Do not close the toolbar when bluring the editable area and clicking into the anchor form
                if (e && self.clickingIntoArchorForm(e)) {
                    return false;
                }

                clearTimeout(timer);
                timer = setTimeout(function () {
                    self.checkSelection();
                }, self.options.delay);
            };

            document.documentElement.addEventListener('mouseup', this.checkSelectionWrapper);

            for (i = 0; i < this.elements.length; i += 1) {
                this.elements[i].addEventListener('keyup', this.checkSelectionWrapper);
                this.elements[i].addEventListener('blur', this.checkSelectionWrapper);
            }
            return this;
        },

        checkSelection: function () {
            var newSelection,
                selectionElement;

            if (this.keepToolbarAlive !== true && !this.options.disableToolbar) {
                newSelection = window.getSelection();
                if (newSelection.toString().trim() === '' ||
                    (this.options.allowMultiParagraphSelection === false && this.hasMultiParagraphs())) {
                    this.hideToolbarActions();
                } else {
                    selectionElement = this.getSelectionElement();
                    if (!selectionElement || selectionElement.getAttribute('data-disable-toolbar')) {
                        this.hideToolbarActions();
                    } else {
                        this.checkSelectionElement(newSelection, selectionElement);
                    }
                }
            }
            return this;
        },

        clickingIntoArchorForm: function (e) {
            var self = this;
            if (e.type && e.type.toLowerCase() === 'blur' && e.relatedTarget && e.relatedTarget === self.anchorInput) {
                return true;
            }
            return false;
        },

        hasMultiParagraphs: function () {
            var selectionHtml = getSelectionHtml().replace(/<[\S]+><\/[\S]+>/gim, ''),
                hasMultiParagraphs = selectionHtml.match(/<(p|h[0-6]|blockquote)>([\s\S]*?)<\/(p|h[0-6]|blockquote)>/g);

            return (hasMultiParagraphs ? hasMultiParagraphs.length : 0);
        },

        checkSelectionElement: function (newSelection, selectionElement) {
            var i;
            this.selection = newSelection;
            this.selectionRange = this.selection.getRangeAt(0);
            for (i = 0; i < this.elements.length; i += 1) {
                if (this.elements[i] === selectionElement) {
                    this.setToolbarButtonStates()
                        .setToolbarPosition()
                        .showToolbarActions();
                    return;
                }
            }
            this.hideToolbarActions();
        },

        getSelectionElement: function () {
            var selection = window.getSelection(),
                range, current, parent,
                result,
                getMediumElement = function (e) {
                    var localParent = e;
                    try {
                        while (!localParent.getAttribute('data-medium-element')) {
                            localParent = localParent.parentNode;
                        }
                    } catch (errb) {
                        return false;
                    }
                    return localParent;
                };
            // First try on current node
            try {
                range = selection.getRangeAt(0);
                current = range.commonAncestorContainer;
                parent = current.parentNode;

                if (current.getAttribute('data-medium-element')) {
                    result = current;
                } else {
                    result = getMediumElement(parent);
                }
                // If not search in the parent nodes.
            } catch (err) {
                result = getMediumElement(parent);
            }
            return result;
        },

        setToolbarPosition: function () {
            var buttonHeight = 50,
                selection = window.getSelection(),
                range = selection.getRangeAt(0),
                boundary = range.getBoundingClientRect(),
                defaultLeft = (this.options.diffLeft) - (this.toolbar.offsetWidth / 2),
                middleBoundary = (boundary.left + boundary.right) / 2,
                halfOffsetWidth = this.toolbar.offsetWidth / 2;
            if (boundary.top < buttonHeight) {
                this.toolbar.classList.add('medium-toolbar-arrow-over');
                this.toolbar.classList.remove('medium-toolbar-arrow-under');
                this.toolbar.style.top = buttonHeight + boundary.bottom - this.options.diffTop + window.pageYOffset - this.toolbar.offsetHeight + 'px';
            } else {
                this.toolbar.classList.add('medium-toolbar-arrow-under');
                this.toolbar.classList.remove('medium-toolbar-arrow-over');
                this.toolbar.style.top = boundary.top + this.options.diffTop + window.pageYOffset - this.toolbar.offsetHeight + 'px';
            }
            if (middleBoundary < halfOffsetWidth) {
                this.toolbar.style.left = defaultLeft + halfOffsetWidth + 'px';
            } else if ((window.innerWidth - middleBoundary) < halfOffsetWidth) {
                this.toolbar.style.left = window.innerWidth + defaultLeft - halfOffsetWidth + 'px';
            } else {
                this.toolbar.style.left = defaultLeft + middleBoundary + 'px';
            }

            this.hideAnchorPreview();

            return this;
        },

        setToolbarButtonStates: function () {
            var buttons = this.toolbarActions.querySelectorAll('button'),
                i;
            for (i = 0; i < buttons.length; i += 1) {
                buttons[i].classList.remove(this.options.activeButtonClass);
            }
            this.checkActiveButtons();
            return this;
        },

        checkActiveButtons: function () {
            var elements = Array.prototype.slice.call(this.elements),
                parentNode = this.getSelectedParentElement();
            while (parentNode.tagName !== undefined && this.parentElements.indexOf(parentNode.tagName.toLowerCase) === -1) {
                this.activateButton(parentNode.tagName.toLowerCase());
                this.callExtensions('checkState', parentNode);

                // we can abort the search upwards if we leave the contentEditable element
                if (elements.indexOf(parentNode) !== -1) {
                    break;
                }
                parentNode = parentNode.parentNode;
            }
        },

        activateButton: function (tag) {
            var el = this.toolbar.querySelector('[data-element="' + tag + '"]');
            if (el !== null && el.className.indexOf(this.options.activeButtonClass) === -1) {
                el.className += ' ' + this.options.activeButtonClass;
            }
        },

        bindButtons: function () {
            var buttons = this.toolbar.querySelectorAll('button'),
                i,
                self = this,
                triggerAction = function (e) {
                    e.preventDefault();
                    e.stopPropagation();
                    if (self.selection === undefined) {
                        self.checkSelection();
                    }
                    if (this.className.indexOf(self.options.activeButtonClass) > -1) {
                        this.classList.remove(self.options.activeButtonClass);
                    } else {
                        this.className += ' ' + self.options.activeButtonClass;
                    }
                    if (this.hasAttribute('data-action')) {
                        self.execAction(this.getAttribute('data-action'), e);
                    }
                };
            for (i = 0; i < buttons.length; i += 1) {
                buttons[i].addEventListener('click', triggerAction);
            }
            this.setFirstAndLastItems(buttons);
            return this;
        },

        setFirstAndLastItems: function (buttons) {
            if (buttons.length > 0) {
                buttons[0].className += ' ' + this.options.firstButtonClass;
                buttons[buttons.length - 1].className += ' ' + this.options.lastButtonClass;
            }
            return this;
        },

        execAction: function (action, e) {
            if (action.indexOf('append-') > -1) {
                this.execFormatBlock(action.replace('append-', ''));
                this.setToolbarPosition();
                this.setToolbarButtonStates();
            } else if (action === 'anchor') {
                this.triggerAnchorAction(e);
            } else if (action === 'image') {
                document.execCommand('insertImage', false, window.getSelection());
            } else {
                document.execCommand(action, false, null);
                this.setToolbarPosition();
            }
        },

        // http://stackoverflow.com/questions/15867542/range-object-get-selection-parent-node-chrome-vs-firefox
        rangeSelectsSingleNode: function (range) {
            var startNode = range.startContainer;
            return startNode === range.endContainer &&
                startNode.hasChildNodes() &&
                range.endOffset === range.startOffset + 1;
        },

        getSelectedParentElement: function () {
            var selectedParentElement = null,
                range = this.selectionRange;
            if (this.rangeSelectsSingleNode(range)) {
                selectedParentElement = range.startContainer.childNodes[range.startOffset];
            } else if (range.startContainer.nodeType === 3) {
                selectedParentElement = range.startContainer.parentNode;
            } else {
                selectedParentElement = range.startContainer;
            }
            return selectedParentElement;
        },

        triggerAnchorAction: function () {
            var selectedParentElement = this.getSelectedParentElement();
            if (selectedParentElement.tagName &&
                    selectedParentElement.tagName.toLowerCase() === 'a') {
                document.execCommand('unlink', false, null);
            } else {
                if (this.anchorForm.style.display === 'block') {
                    this.showToolbarActions();
                } else {
                    this.showAnchorForm();
                }
            }
            return this;
        },

        execFormatBlock: function (el) {
            var selectionData = this.getSelectionData(this.selection.anchorNode);
            // FF handles blockquote differently on formatBlock
            // allowing nesting, we need to use outdent
            // https://developer.mozilla.org/en-US/docs/Rich-Text_Editing_in_Mozilla
            if (el === 'blockquote' && selectionData.el &&
                selectionData.el.parentNode.tagName.toLowerCase() === 'blockquote') {
                return document.execCommand('outdent', false, null);
            }
            if (selectionData.tagName === el) {
                el = 'p';
            }
            // When IE we need to add <> to heading elements and
            //  blockquote needs to be called as indent
            // http://stackoverflow.com/questions/10741831/execcommand-formatblock-headings-in-ie
            // http://stackoverflow.com/questions/1816223/rich-text-editor-with-blockquote-function/1821777#1821777
            if (this.isIE) {
                if (el === 'blockquote') {
                    return document.execCommand('indent', false, el);
                }
                el = '<' + el + '>';
            }
            return document.execCommand('formatBlock', false, el);
        },

        getSelectionData: function (el) {
            var tagName;

            if (el && el.tagName) {
                tagName = el.tagName.toLowerCase();
            }

            while (el && this.parentElements.indexOf(tagName) === -1) {
                el = el.parentNode;
                if (el && el.tagName) {
                    tagName = el.tagName.toLowerCase();
                }
            }

            return {
                el: el,
                tagName: tagName
            };
        },

        getFirstChild: function (el) {
            var firstChild = el.firstChild;
            while (firstChild !== null && firstChild.nodeType !== 1) {
                firstChild = firstChild.nextSibling;
            }
            return firstChild;
        },

        hideToolbarActions: function () {
            this.keepToolbarAlive = false;
            if (this.toolbar !== undefined) {
                this.toolbar.classList.remove('medium-editor-toolbar-active');
            }
        },

        showToolbarActions: function () {
            var self = this,
                timer;
            this.anchorForm.style.display = 'none';
            this.toolbarActions.style.display = 'block';
            this.keepToolbarAlive = false;
            clearTimeout(timer);
            timer = setTimeout(function () {
                if (self.toolbar && !self.toolbar.classList.contains('medium-editor-toolbar-active')) {
                    self.toolbar.classList.add('medium-editor-toolbar-active');
                }
            }, 100);
        },

        saveSelection: function() {
            this.savedSelection = saveSelection();
        },

        restoreSelection: function() {
            restoreSelection(this.savedSelection);
        },

        showAnchorForm: function (link_value) {
            this.toolbarActions.style.display = 'none';
            this.saveSelection();
            this.anchorForm.style.display = 'block';
            this.keepToolbarAlive = true;
            this.anchorInput.focus();
            this.anchorInput.value = link_value || '';
        },

        bindAnchorForm: function () {
            var linkCancel = this.anchorForm.querySelector('a'),
                self = this;
            this.anchorForm.addEventListener('click', function (e) {
                e.stopPropagation();
            });
            this.anchorInput.addEventListener('keyup', function (e) {
                if (e.keyCode === 13) {
                    e.preventDefault();
                    self.createLink(this);
                }
            });
            this.anchorInput.addEventListener('click', function (e) {
                // make sure not to hide form when cliking into the input
                e.stopPropagation();
                self.keepToolbarAlive = true;
            });
            this.anchorInput.addEventListener('blur', function () {
                self.keepToolbarAlive = false;
                self.checkSelection();
            });
            linkCancel.addEventListener('click', function (e) {
                e.preventDefault();
                self.showToolbarActions();
                restoreSelection(self.savedSelection);
            });
            return this;
        },


        hideAnchorPreview: function () {
            this.anchorPreview.classList.remove('medium-editor-anchor-preview-active');
        },

        // TODO: break method
        showAnchorPreview: function (anchorEl) {
            if (this.anchorPreview.classList.contains('medium-editor-anchor-preview-active')) {
                return true;
            }

            var self = this,
                buttonHeight = 40,
                boundary = anchorEl.getBoundingClientRect(),
                middleBoundary = (boundary.left + boundary.right) / 2,
                halfOffsetWidth,
                defaultLeft,
                timer;

            self.anchorPreview.querySelector('i').textContent = anchorEl.href;
            halfOffsetWidth = self.anchorPreview.offsetWidth / 2;
            defaultLeft = self.options.diffLeft - halfOffsetWidth;

            clearTimeout(timer);
            timer = setTimeout(function () {
                if (self.anchorPreview && !self.anchorPreview.classList.contains('medium-editor-anchor-preview-active')) {
                    self.anchorPreview.classList.add('medium-editor-anchor-preview-active');
                }
            }, 100);

            self.observeAnchorPreview(anchorEl);

            self.anchorPreview.classList.add('medium-toolbar-arrow-over');
            self.anchorPreview.classList.remove('medium-toolbar-arrow-under');
            self.anchorPreview.style.top = Math.round(buttonHeight + boundary.bottom - self.options.diffTop + window.pageYOffset - self.anchorPreview.offsetHeight) + 'px';
            if (middleBoundary < halfOffsetWidth) {
                self.anchorPreview.style.left = defaultLeft + halfOffsetWidth + 'px';
            } else if ((window.innerWidth - middleBoundary) < halfOffsetWidth) {
                self.anchorPreview.style.left = window.innerWidth + defaultLeft - halfOffsetWidth + 'px';
            } else {
                self.anchorPreview.style.left = defaultLeft + middleBoundary + 'px';
            }

            return this;
        },

        // TODO: break method
        observeAnchorPreview: function (anchorEl) {
            var self = this,
                lastOver = (new Date()).getTime(),
                over = true,
                stamp = function () {
                    lastOver = (new Date()).getTime();
                    over = true;
                },
                unstamp = function (e) {
                    if (!e.relatedTarget || !/anchor-preview/.test(e.relatedTarget.className)) {
                        over = false;
                    }
                },
                interval_timer = setInterval(function () {
                    if (over) {
                        return true;
                    }
                    var durr = (new Date()).getTime() - lastOver;
                    if (durr > self.options.anchorPreviewHideDelay) {
                        // hide the preview 1/2 second after mouse leaves the link
                        self.hideAnchorPreview();

                        // cleanup
                        clearInterval(interval_timer);
                        self.anchorPreview.removeEventListener('mouseover', stamp);
                        self.anchorPreview.removeEventListener('mouseout', unstamp);
                        anchorEl.removeEventListener('mouseover', stamp);
                        anchorEl.removeEventListener('mouseout', unstamp);

                    }
                }, 200);

            self.anchorPreview.addEventListener('mouseover', stamp);
            self.anchorPreview.addEventListener('mouseout', unstamp);
            anchorEl.addEventListener('mouseover', stamp);
            anchorEl.addEventListener('mouseout', unstamp);
        },

        createAnchorPreview: function () {
            var self = this,
                anchorPreview = document.createElement('div');

            anchorPreview.id = 'medium-editor-anchor-preview-' + this.id;
            anchorPreview.className = 'medium-editor-anchor-preview';
            anchorPreview.innerHTML = this.anchorPreviewTemplate();
            this.options.elementsContainer.appendChild(anchorPreview);

            anchorPreview.addEventListener('click', function () {
                self.anchorPreviewClickHandler();
            });

            return anchorPreview;
        },

        anchorPreviewTemplate: function () {
            return '<div class="medium-editor-toolbar-anchor-preview" id="medium-editor-toolbar-anchor-preview">' +
                '    <i class="medium-editor-toolbar-anchor-preview-inner"></i>' +
                '</div>';
        },

        anchorPreviewClickHandler: function (e) {
            if (this.activeAnchor) {

                var self = this,
                    range = document.createRange(),
                    sel = window.getSelection();

                range.selectNodeContents(self.activeAnchor);
                sel.removeAllRanges();
                sel.addRange(range);
                setTimeout(function () {
                    if (self.activeAnchor) {
                        self.showAnchorForm(self.activeAnchor.href);
                    }
                    self.keepToolbarAlive = false;
                }, 100 + self.options.delay);

            }

            this.hideAnchorPreview();
        },

        editorAnchorObserver: function (e) {
            var self = this,
                overAnchor = true,
                leaveAnchor = function () {
                    // mark the anchor as no longer hovered, and stop listening
                    overAnchor = false;
                    self.activeAnchor.removeEventListener('mouseout', leaveAnchor);
                };

            if (e.target && e.target.tagName.toLowerCase() === 'a') {

                // Detect empty href attributes
                // The browser will make href="" or href="#top"
                // into absolute urls when accessed as e.targed.href, so check the html
                if (!/href=["']\S+["']/.test(e.target.outerHTML) || /href=["']#\S+["']/.test(e.target.outerHTML)) {
                    return true;
                }

                // only show when hovering on anchors
                if (this.toolbar.classList.contains('medium-editor-toolbar-active')) {
                    // only show when toolbar is not present
                    return true;
                }
                this.activeAnchor = e.target;
                this.activeAnchor.addEventListener('mouseout', leaveAnchor);
                // show the anchor preview according to the configured delay
                // if the mouse has not left the anchor tag in that time
                setTimeout(function () {
                    if (overAnchor) {
                        self.showAnchorPreview(e.target);
                    }
                }, self.options.delay);


            }
        },

        bindAnchorPreview: function (index) {
            var i, self = this;
            this.editorAnchorObserverWrapper = function (e) {
                self.editorAnchorObserver(e);
            };
            for (i = 0; i < this.elements.length; i += 1) {
                this.elements[i].addEventListener('mouseover', this.editorAnchorObserverWrapper);
            }
            return this;
        },

        checkLinkFormat: function (value) {
            var re = /^(https?|ftps?|rtmpt?):\/\/|mailto:/;
            return (re.test(value) ? '' : 'http://') + value;
        },

        setTargetBlank: function () {
            var el = getSelectionStart(),
                i;
            if (el.tagName.toLowerCase() === 'a') {
                el.target = '_blank';
            } else {
                el = el.getElementsByTagName('a');
                for (i = 0; i < el.length; i += 1) {
                    el[i].target = '_blank';
                }
            }
        },

        createLink: function (input) {
            if (input.value.trim().length === 0) {
                this.hideToolbarActions();
                return;
            }
            restoreSelection(this.savedSelection);
            if (this.options.checkLinkFormat) {
                input.value = this.checkLinkFormat(input.value);
            }
            document.execCommand('createLink', false, input.value);
            if (this.options.targetBlank) {
                this.setTargetBlank();
            }
            this.checkSelection();
            this.showToolbarActions();
            input.value = '';
        },

        bindWindowActions: function () {
            var timerResize,
                self = this;
            this.windowResizeHandler = function () {
                clearTimeout(timerResize);
                timerResize = setTimeout(function () {
                    if (self.toolbar && self.toolbar.classList.contains('medium-editor-toolbar-active')) {
                        self.setToolbarPosition();
                    }
                }, 100);
            };
            window.addEventListener('resize', this.windowResizeHandler);
            return this;
        },

        activate: function () {
            if (this.isActive) {
                return;
            }

            this.setup();
        },

        // TODO: break method
        deactivate: function () {
            var i;
            if (!this.isActive) {
                return;
            }
            this.isActive = false;

            if (this.toolbar !== undefined) {
                this.options.elementsContainer.removeChild(this.anchorPreview);
                this.options.elementsContainer.removeChild(this.toolbar);
                delete this.toolbar;
                delete this.anchorPreview;
            }

            document.documentElement.removeEventListener('mouseup', this.checkSelectionWrapper);
            window.removeEventListener('resize', this.windowResizeHandler);

            for (i = 0; i < this.elements.length; i += 1) {
                this.elements[i].removeEventListener('mouseover', this.editorAnchorObserverWrapper);
                this.elements[i].removeEventListener('keyup', this.checkSelectionWrapper);
                this.elements[i].removeEventListener('blur', this.checkSelectionWrapper);
                this.elements[i].removeEventListener('paste', this.pasteWrapper);
                this.elements[i].removeAttribute('contentEditable');
                this.elements[i].removeAttribute('data-medium-element');
            }

        },

        htmlEntities: function (str) {
            // converts special characters (like <) into their escaped/encoded values (like &lt;).
            // This allows you to show to display the string without the browser reading it as HTML.
            return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        },

        bindPaste: function () {
            var i, self = this;
            this.pasteWrapper = function (e) {
                var paragraphs,
                    html = '',
                    p;

                this.classList.remove('medium-editor-placeholder');
                if (!self.options.forcePlainText && !self.options.cleanPastedHTML) {
                    return this;
                }

                if (e.clipboardData && e.clipboardData.getData && !e.defaultPrevented) {
                    e.preventDefault();

                    if (self.options.cleanPastedHTML && e.clipboardData.getData('text/html')) {
                        return self.cleanPaste(e.clipboardData.getData('text/html'));
                    }
                    if (!(self.options.disableReturn || this.getAttribute('data-disable-return'))) {
                        paragraphs = e.clipboardData.getData('text/plain').split(/[\r\n]/g);
                        for (p = 0; p < paragraphs.length; p += 1) {
                            if (paragraphs[p] !== '') {
                                if (navigator.userAgent.match(/firefox/i) && p === 0) {
                                    html += self.htmlEntities(paragraphs[p]);
                                } else {
                                    html += '<p>' + self.htmlEntities(paragraphs[p]) + '</p>';
                                }
                            }
                        }
                        document.execCommand('insertHTML', false, html);
                    } else {
                        document.execCommand('insertHTML', false, e.clipboardData.getData('text/plain'));
                    }
                }
            };
            for (i = 0; i < this.elements.length; i += 1) {
                this.elements[i].addEventListener('paste', this.pasteWrapper);
            }
            return this;
        },

        setPlaceholders: function () {
            var i,
                activatePlaceholder = function (el) {
                    if (!(el.querySelector('img')) &&
                            !(el.querySelector('blockquote')) &&
                            el.textContent.replace(/^\s+|\s+$/g, '') === '') {
                        el.classList.add('medium-editor-placeholder');
                    }
                },
                placeholderWrapper = function (e) {
                    this.classList.remove('medium-editor-placeholder');
                    if (e.type !== 'keypress') {
                        activatePlaceholder(this);
                    }
                };
            for (i = 0; i < this.elements.length; i += 1) {
                activatePlaceholder(this.elements[i]);
                this.elements[i].addEventListener('blur', placeholderWrapper);
                this.elements[i].addEventListener('keypress', placeholderWrapper);
            }
            return this;
        },

        cleanPaste: function (text) {

            /*jslint regexp: true*/
            /*
                jslint does not allow character negation, because the negation
                will not match any unicode characters. In the regexes in this
                block, negation is used specifically to match the end of an html
                tag, and in fact unicode characters *should* be allowed.
            */
            var i, elList, workEl,
                el = this.getSelectionElement(),
                multiline = /<p|<br|<div/.test(text),
                replacements = [

                    // replace two bogus tags that begin pastes from google docs
                    [new RegExp(/<[^>]*docs-internal-guid[^>]*>/gi), ""],
                    [new RegExp(/<\/b>(<br[^>]*>)?$/gi), ""],

                     // un-html spaces and newlines inserted by OS X
                    [new RegExp(/<span class="Apple-converted-space">\s+<\/span>/g), ' '],
                    [new RegExp(/<br class="Apple-interchange-newline">/g), '<br>'],

                    // replace google docs italics+bold with a span to be replaced once the html is inserted
                    [new RegExp(/<span[^>]*(font-style:italic;font-weight:bold|font-weight:bold;font-style:italic)[^>]*>/gi), '<span class="replace-with italic bold">'],

                    // replace google docs italics with a span to be replaced once the html is inserted
                    [new RegExp(/<span[^>]*font-style:italic[^>]*>/gi), '<span class="replace-with italic">'],

                    //[replace google docs bolds with a span to be replaced once the html is inserted
                    [new RegExp(/<span[^>]*font-weight:bold[^>]*>/gi), '<span class="replace-with bold">'],

                     // replace manually entered b/i/a tags with real ones
                    [new RegExp(/&lt;(\/?)(i|b|a)&gt;/gi), '<$1$2>'],

                     // replace manually a tags with real ones, converting smart-quotes from google docs
                    [new RegExp(/&lt;a\s+href=(&quot;|&rdquo;|&ldquo;|“|”)([^&]+)(&quot;|&rdquo;|&ldquo;|“|”)&gt;/gi), '<a href="$2">']

                ];
            /*jslint regexp: false*/

            for (i = 0; i < replacements.length; i += 1) {
                text = text.replace(replacements[i][0], replacements[i][1]);
            }

            if (multiline) {

                // double br's aren't converted to p tags, but we want paragraphs.
                elList = text.split('<br><br>');

                this.pasteHTML('<p>' + elList.join('</p><p>') + '</p>');
                document.execCommand('insertText', false, "\n");

                // block element cleanup
                elList = el.querySelectorAll('p,div,br');
                for (i = 0; i < elList.length; i += 1) {

                    workEl = elList[i];

                    switch (workEl.tagName.toLowerCase()) {
                    case 'p':
                    case 'div':
                        this.filterCommonBlocks(workEl);
                        break;
                    case 'br':
                        this.filterLineBreak(workEl);
                        break;
                    }

                }


            } else {

                this.pasteHTML(text);

            }

        },

        pasteHTML: function (html) {
            var elList, workEl, i, fragmentBody, pasteBlock = document.createDocumentFragment();

            pasteBlock.appendChild(document.createElement('body'));

            fragmentBody = pasteBlock.querySelector('body');
            fragmentBody.innerHTML = html;

            this.cleanupSpans(fragmentBody);

            elList = fragmentBody.querySelectorAll('*');
            for (i = 0; i < elList.length; i += 1) {

                workEl = elList[i];

                // delete ugly attributes
                workEl.removeAttribute('class');
                workEl.removeAttribute('style');
                workEl.removeAttribute('dir');

                if (workEl.tagName.toLowerCase() === 'meta') {
                    workEl.parentNode.removeChild(workEl);
                }

            }
            document.execCommand('insertHTML', false, fragmentBody.innerHTML.replace(/&nbsp;/g, ' '));
        },
        isCommonBlock: function (el) {
            return (el && (el.tagName.toLowerCase() === 'p' || el.tagName.toLowerCase() === 'div'));
        },
        filterCommonBlocks: function (el) {
            if (/^\s*$/.test(el.innerText)) {
                el.parentNode.removeChild(el);
            }
        },
        filterLineBreak: function (el) {
            if (this.isCommonBlock(el.previousElementSibling)) {

                // remove stray br's following common block elements
                el.parentNode.removeChild(el);

            } else if (this.isCommonBlock(el.parentNode) && (el.parentNode.firstChild === el || el.parentNode.lastChild === el)) {

                // remove br's just inside open or close tags of a div/p
                el.parentNode.removeChild(el);

            } else if (el.parentNode.childElementCount === 1) {

                // and br's that are the only child of a div/p
                this.removeWithParent(el);

            }

        },

        // remove an element, including its parent, if it is the only element within its parent
        removeWithParent: function (el) {
            if (el && el.parentNode) {
                if (el.parentNode.parentNode && el.parentNode.childElementCount === 1) {
                    el.parentNode.parentNode.removeChild(el.parentNode);
                } else {
                    el.parentNode.removeChild(el.parentNode);
                }
            }
        },

        cleanupSpans: function (container_el) {

            var i,
                el,
                new_el,
                spans = container_el.querySelectorAll('.replace-with');

            for (i = 0; i < spans.length; i += 1) {

                el = spans[i];
                new_el = document.createElement(el.classList.contains('bold') ? 'b' : 'i');

                if (el.classList.contains('bold') && el.classList.contains('italic')) {

                    // add an i tag as well if this has both italics and bold
                    new_el.innerHTML = '<i>' + el.innerHTML + '</i>';

                } else {

                    new_el.innerHTML = el.innerHTML;

                }
                el.parentNode.replaceChild(new_el, el);

            }

            spans = container_el.querySelectorAll('span');
            for (i = 0; i < spans.length; i += 1) {

                el = spans[i];

                // remove empty spans, replace others with their contents
                if (/^\s*$/.test()) {
                    el.parentNode.removeChild(el);
                } else {
                    el.parentNode.replaceChild(document.createTextNode(el.innerText), el);
                }

            }

        }

    };

}(window, document));

/**
* @name             Elastic
* @descripton           Elastic is jQuery plugin that grow and shrink your textareas automatically
* @version            1.6.11
* @requires           jQuery 1.2.6+
*
* @author             Jan Jarfalk
* @author-email         jan.jarfalk@unwrongest.com
* @author-website         http://www.unwrongest.com
*
* @licence            MIT License - http://www.opensource.org/licenses/mit-license.php
*/

(function($){ 
  $.fn.extend({  
    elastic: function(action) {
    
      //  We will create a div clone of the textarea
      //  by copying these attributes from the textarea to the div.
      var mimics = [
        'paddingTop',
        'paddingRight',
        'paddingBottom',
        'paddingLeft',
        'fontSize',
        'lineHeight',
        'fontFamily',
        'width',
        'fontWeight',
        'border-top-width',
        'border-right-width',
        'border-bottom-width',
        'border-left-width',
        'borderTopStyle',
        'borderTopColor',
        'borderRightStyle',
        'borderRightColor',
        'borderBottomStyle',
        'borderBottomColor',
        'borderLeftStyle',
        'borderLeftColor'
        ];
      
      return this.each( function() {

        // Elastic only works on textareas
        if ( this.type !== 'textarea' ) {
          return false;
        }

        if (action == 'fix') {
          $(this).css({'height':'100%','overflow':'auto'});
          return;
        }

      var $textarea = $(this);

      if ($(this).parent().find('.wc-twin').length == 0) {

      var $twin = $('<div class="wc-twin" />').css({
          'position'    : 'absolute',
          'display'   : 'none',
          'word-wrap'   : 'break-word',
          'white-space' :'pre-wrap'
        }).insertAfter($textarea);

        // Copy the essential styles (mimics) from the textarea to the twin
        var i = mimics.length;
        while(i--){
          $twin.css(mimics[i].toString(),$textarea.css(mimics[i].toString()));
        }

      } else {
        var $twin = $(this).parent().find('.wc-twin');
      }

      var lineHeight  = parseInt($textarea.css('line-height'),10) || parseInt($textarea.css('font-size'),'10'),
        minheight = parseInt($textarea.css('height'),10) || lineHeight*3,
        maxheight = parseInt($textarea.css('max-height'),10) || Number.MAX_VALUE,
        goalheight  = 0;
        
        // Opera returns max-height of -1 if not set
        if (maxheight < 0) { maxheight = Number.MAX_VALUE; }

      if (action == 'destroy') {
        // set width here if you dont want to scroll Note content
        // setTwinWidth();
        if( this.offsetHeight < this.scrollHeight){
          $textarea.unbind('keyup change cut paste update blur input paste').css({'height':'100%','overflow':'auto'});
          return;
        } else {
          setTwinWidth();
          bindEvents();
          return;
        }         
      }
       
        // Updates the width of the twin. (solution for textareas with widths in percent)
        function setTwinWidth(){
          var curatedWidth = Math.floor(parseInt($textarea.width(),10));
          if($twin.width() !== curatedWidth){
            $twin.css({'width': curatedWidth + 'px'});
            // Update height of textarea
            update(true);
          }
        }
        
        // Sets a given height and overflow state on the textarea
        function setHeightAndOverflow(height, overflow){
          var curratedHeight = Math.floor(parseInt(height,10));
          if($textarea.height() !== curratedHeight){
            $textarea.css({'height': curratedHeight + 'px','overflow':overflow});
            if ($textarea.height() > $textarea.parent().height()) $textarea.parent().css({'height': curratedHeight + 'px'});
          }
        }
        
        // This function will update the height of the textarea if necessary 
        function update(forced) {
          
          // Get curated content from the textarea.
          var textareaContent = $textarea.val().replace(/&/g,'&amp;').replace(/ {2}/g, '&nbsp;').replace(/<|>/g, '&gt;').replace(/\n/g, '<br />');
          
          // Compare curated content with curated twin.
          var twinContent = $twin.html().replace(/<br>/ig,'<br />');
          
          if(forced || textareaContent+'&nbsp;' !== twinContent){

            // Add an extra white space so new rows are added when you are at the end of a row.
            $twin.html(textareaContent+'&nbsp;');
            // Change textarea height if twin plus the height of one line differs more than 3 pixel from textarea height
            if(Math.abs($twin.height() + lineHeight - $textarea.height()) > 3){
                            
              var goalheight = $twin.height()+3;
              if(goalheight >= maxheight) {
                setHeightAndOverflow(maxheight,'auto');
              } else if(goalheight <= minheight) {
                setHeightAndOverflow(minheight,'hidden');
              } else {
                setHeightAndOverflow(goalheight,'hidden');
              }
              
            }
            
          }
          
        }
        
        function bindEvents()  {
              // Hide scrollbars
        $textarea.css({'overflow':'hidden'});
       
        // Update textarea size on keyup, change, cut and paste
        $textarea.bind('keyup change cut paste', function(){
          update(); 
        });
        
        // Update width of twin if browser or textarea is resized (solution for textareas with widths in percent)
        // $(window).bind('resize', setTwinWidth);
        // $textarea.bind('resize', setTwinWidth);
        $textarea.bind('update', update);
        
        // Compact textarea on blur
        $textarea.bind('blur',function(){
          if($twin.height() < maxheight){
            if($twin.height() > minheight) {
              $textarea.height($twin.height());
            } else {
              $textarea.height(minheight);
            }
          }
        });
        
        // And this line is to catch the browser paste event
        $textarea.bind('input paste',function(e){ setTimeout( update, 250); });  
        }
        
        // Run update once when elastic is initialized
        bindEvents();
        update();
        
      });
      
      } 
    }); 
})($);

/*!
 * Miniscroll small plugin of scrollbar desktop and mobile
 *
 * @author Roger Luiz <http://rogerluizm.com.br/>
 *					  <http://miniscroll.rogerluizm.com.br>
 */
(function(e,t,n){var r={touchEvents:"ontouchstart"in t.documentElement},i=function(e,t){this.type="";this.is="static";this.target=this.getElement(e);this.container;this.tracker;this.thumb;this.thumb_delta=new s(0,0);this.thumb_pos=new s(0,0);this.touch=new s(0,0);this.settings=t;this.percent;this.keypos_thumb=new s(0,0);this.scrolling=false;this.preventScrolling=false;this.turnOffWheel=true;this.initializing()},s=function(e,t){this.x=e!=null?e:0;this.y=t!=null?t:0;return{x:this.x,y:this.y}};i[n].initializing=function(){this.buildScrollbar();this.buildScrollbarTracker();this.buildScrolbarThumb();this.settings.isKeyEvent=typeof this.settings.isKeyEvent==="undefined"?true:this.settings.isKeyEvent;this.turnOffWheel=typeof this.settings.turnOffWheel==="undefined"?this.turnOffWheel:this.settings.turnOffWheel;if(this.settings.isKeyEvent)this.addKeyBoardEvent();!r.touchEvents?this.setupEventHandler():this.setupTouchEvent();var t=this;e.setInterval(function(){t.update()},10)};i[n].buildScrollbar=function(){var e=this.target.id?this.target.id:this.target.className;this.container=this.create(this.target,"div",{"class":"miniscroll-container",id:"miniscroll-"+e});var t=this.settings.scrollbarSize?this.settings.scrollbarSize:this.offset(this.target).height;var n=this.settings.scrollbarSize?this.settings.scrollbarSize:this.offset(this.target).width;var r=this.offset(this.target).left+(this.offset(this.target).width-this.settings.size);var i=this.offset(this.target).top+(this.offset(this.target).height-this.settings.size);this.css(this.container,{position:"absolute",visibility:"hidden",width:(this.settings.axis==="x"?n:this.settings.size)+"px",height:(this.settings.axis==="y"?t:this.settings.size)+"px",top:(this.settings.axis==="y"?this.offset(this.target).top:i)+"px",left:(this.settings.axis==="x"?this.offset(this.target).left:r)+"px",zIndex:999})};i[n].buildScrollbarTracker=function(){this.tracker=this.create(this.container,"div",{"class":"miniscroll-tracker"});var e=this.settings.axis==="x"?this.offset(this.container).width:this.settings.size;var t=this.settings.axis==="y"?this.offset(this.container).height:this.settings.size;this.css(this.tracker,{width:e+"px",height:t+"px",backgroundColor:this.settings.trackerColor?this.settings.trackerColor:"#067f41"})};i[n].buildScrolbarThumb=function(){this.thumb=this.create(this.container,"div",{"class":"miniscroll-thumb"});var e=new s(this.offset(this.container).width*this.offset(this.tracker).width/this.target.scrollWidth,this.offset(this.container).height*this.offset(this.tracker).height/this.target.scrollHeight);var e=new s(this.offset(this.container).width*this.offset(this.tracker).width/this.target.scrollWidth,this.offset(this.container).height*this.offset(this.tracker).height/this.target.scrollHeight);var t=new s(this.settings.sizethumb===undefined||this.settings.sizethumb==="auto"?e.x:this.settings.sizethumb,this.settings.sizethumb===undefined||this.settings.sizethumb==="auto"?e.y:this.settings.sizethumb);this.css(this.thumb,{position:"absolute",top:0+"px",left:0+"px",width:(this.settings.axis==="x"?t.x:this.settings.size)+"px",height:(this.settings.axis==="y"?t.y:this.settings.size)+"px",backgroundColor:this.settings.thumbColor?this.settings.thumbColor:"#2AD47D"})};i[n].setupEventHandler=function(){this.bind(this.thumb,"mousedown",this.onScrollThumbPress);this.bind(this.tracker,"mousedown",this.onScrollTrackerPress);if(this.turnOffWheel){this.bind(this.target,"mousewheel",this.onScrollThumbWheel)}};i[n].setupTouchEvent=function(){this.bind(this.target,"touchstart",this.onScrollTouchStart);this.bind(this.target,"touchmove",this.onScrollTouchMove)};i[n].updateContainerPosition=function(){this.is=this.getCss(this.target,"position");if(this.is==="relative"||this.is==="absolute"){if(this.settings.axis==="y"){this.container.style.top="0px"}else{this.container.style.left="0px"}}else{if(this.settings.axis==="y"){this.container.style.top=this.offset(this.target).top+"px"}else{this.container.style.left=this.offset(this.target).left+"px"}}};i[n].setScrubPosition=function(e){var t=this.offset(this.container).width,n=this.offset(this.container).height;var r=this.offset(this.thumb).width,i=this.offset(this.thumb).height;this.thumb_pos=new s(Math.round((t-r)*e),Math.round((n-i)*e));if(this.settings.axis==="y"){this.thumb.style.top=Math.round(this.thumb_pos.y)+"px"}else{this.thumb.style.left=Math.round(this.thumb_pos.x)+"px"}};i[n].addKeyBoardEvent=function(){this.target.setAttribute("tabindex","-1");this.css(this.target,{outline:"none"});this.bind(this.target,"focus",function(e,t){this.bind(t,"keydown",function(e){var t=e.keyCode||e.which,n={left:37,up:38,right:39,down:40};switch(t){case n.up:if(this.percent!==0)this.keypos_thumb.y-=10;break;case n.down:if(this.percent!==1)this.keypos_thumb.y+=10;break;case n.left:if(this.percent!==0)this.keypos_thumb.x-=10;break;case n.right:if(this.percent!==1)this.keypos_thumb.x+=10;break}if(this.settings.axis==="y"){this.percent=this.target.scrollTop/(this.target.scrollHeight-this.target.offsetHeight);this.setScrubPosition(this.percent);this.target.scrollTop=this.keypos_thumb.y}else{this.percent=this.target.scrollLeft/(this.target.scrollWidth-this.target.offsetWidth);this.setScrubPosition(this.percent);this.target.scrollLeft=this.keypos_thumb.x}if(this.percent>=1||this.percent<=0){this.preventScrolling=true}else{this.preventScrolling=false}this.updateContainerPosition()})});this.bind(this.target,"click",function(e,n){t.activeElement=n;n.focus()})};i[n].onScrollTouchStart=function(e){var t=e.touches[0];this.scrolling=true;this.touch=new s(t.pageX,t.pageY);this.bind(this.target,"touchend",this.onScrollTouchEnd)};i[n].onScrollTouchMove=function(e){var t=e.touches[0];e.preventDefault();var n=new s(this.touch.x-t.pageX,this.touch.y-t.pageY);this.touch=new s(t.pageX,t.pageY);if(this.settings.axis==="y"){this.percent=this.target.scrollTop/(this.target.scrollHeight-this.target.offsetHeight);this.setScrubPosition(this.percent);this.target.scrollTop=this.target.scrollTop+n.y}else{this.percent=this.target.scrollLeft/(this.target.scrollWidth-this.target.offsetWidth);this.setScrubPosition(this.percent);this.target.scrollLeft=this.target.scrollLeft+n.x}this.updateContainerPosition()};i[n].onScrollTouchEnd=function(e){this.scrolling=false;this.unbind(this.target,"touchend",this.onScrollTouchEnd)};i[n].onScrollThumbPress=function(n){n=n?n:e.event;this.stopEvent(n);this.scrolling=true;this.thumb_delta=new s(this.thumb_pos.x-this.mouse(n).x,this.thumb_pos.y-this.mouse(n).y);this.bind(t,"mousemove",this.onScrollThumbUpdate);this.bind(t,"mouseup",this.onScrollThumbRelease);this.updateContainerPosition()};i[n].onScrollThumbUpdate=function(t){t=t?t:e.event;this.stopEvent(t);if(!this.scrolling)return false;this.thumb_pos=new s(this.mouse(t).x+this.thumb_delta.x,this.mouse(t).y+this.thumb_delta.y);this.thumb_pos=new s(Math.max(0,Math.min(this.container.offsetWidth-this.thumb.offsetWidth,this.thumb_pos.x)),Math.max(0,Math.min(this.container.offsetHeight-this.thumb.offsetHeight,this.thumb_pos.y)));this.percent=new s(this.thumb_pos.x/(this.container.offsetWidth-this.thumb.offsetWidth),this.thumb_pos.y/(this.container.offsetHeight-this.thumb.offsetHeight));this.percent=new s(Math.max(0,Math.min(1,this.percent.x)),Math.max(0,Math.min(1,this.percent.y)));if(this.settings.axis==="y"){this.thumb.style.top=Math.round(this.thumb_pos.y)+"px";this.target.scrollTop=Math.round((this.target.scrollHeight-this.target.offsetHeight)*this.percent.y)}else{this.thumb.style.left=Math.round(this.thumb_pos.x)+"px";this.target.scrollLeft=Math.round((this.target.scrollWidth-this.target.offsetWidth)*this.percent.x)}this.keypos_thumb=new s(this.target.scrollLeft,this.target.scrollTop);this.updateContainerPosition()};i[n].onScrollThumbWheel=function(t){t=t?t:e.event;if(!this.preventScrolling)this.stopEvent(t);var n=t||e.event,r=[].slice.call(arguments,1),i=0,o=true,u=0,a=0;if(n.wheelDelta){i=n.wheelDelta/120}if(n.detail){i=-n.detail/3}a=i;if(n.axis!==undefined&&n.axis===n.HORIZONTAL_AXIS){a=0;u=-1*i}if(n.wheelDeltaY!==undefined){a=n.wheelDeltaY/120}if(n.wheelDeltaX!==undefined){u=-1*n.wheelDeltaX/120}if(this.settings.axis==="y"){this.percent=this.target.scrollTop/(this.target.scrollHeight-this.target.offsetHeight);this.setScrubPosition(this.percent);this.target.scrollTop=Math.round(this.target.scrollTop-i*10)}else{this.percent=this.target.scrollLeft/(this.target.scrollWidth-this.target.offsetWidth);this.setScrubPosition(this.percent);this.target.scrollLeft=Math.round(this.target.scrollLeft-i*10)}if(this.percent>=1||this.percent<=0){this.preventScrolling=true}else{this.preventScrolling=false}this.keypos_thumb=new s(this.target.scrollLeft,this.target.scrollTop);this.updateContainerPosition()};i[n].onScrollThumbRelease=function(n){n=n?n:e.event;this.stopEvent(n);this.scrolling=false;this.unbind(t,"mousemove",this.onScrollThumbUpdate);this.unbind(t,"mouseup",this.onScrollThumbRelease)};i[n].onScrollTrackerPress=function(e){var t=this.mouse(e).y-this.offset(this.container).top;this.scrolling=true;this.scrollTo(t)};i[n].scrollTo=function(e){var t=Math.max(0,Math.min(this.offset(this.target).height-this.offset(this.thumb).height,e));if(this.settings.axis==="y"){this.thumb_pos.y=t;this.thumb.style.top=Math.round(this.thumb_pos.y)+"px";this.target.scrollTop=t;this.scrolling=false}};i[n].update=function(){if(this.target.scrollHeight===this.offset(this.target).height){this.css(this.container,{visibility:"hidden"})}else{this.css(this.container,{visibility:"visible"})}var e=this.settings.scrollbarSize?this.settings.scrollbarSize:this.offset(this.target).height;var t=this.settings.scrollbarSize?this.settings.scrollbarSize:this.offset(this.target).width;var n=this.offset(this.target).left+(this.offset(this.target).width-this.settings.size);var r=this.offset(this.target).top+(this.offset(this.target).height-this.settings.size);this.css(this.container,{width:(this.settings.axis==="x"?t:this.settings.size)+"px",height:(this.settings.axis==="y"?e:this.settings.size)+"px",top:(this.settings.axis==="y"?this.offset(this.target).top:r)+"px",left:(this.settings.axis==="x"?this.offset(this.target).left:n)+"px"});var i=this.settings.axis==="x"?this.offset(this.container).width:this.settings.size;var o=this.settings.axis==="y"?this.offset(this.container).height:this.settings.size;this.css(this.tracker,{width:i+"px",height:o+"px"});var u=new s(this.offset(this.container).width*this.offset(this.tracker).width/this.target.scrollWidth,this.offset(this.container).height*this.offset(this.tracker).height/this.target.scrollHeight);var a=new s(this.settings.sizethumb===undefined||this.settings.sizethumb==="auto"?u.x:this.settings.sizethumb,this.settings.sizethumb===undefined||this.settings.sizethumb==="auto"?u.y:this.settings.sizethumb);this.css(this.thumb,{width:(this.settings.axis==="x"?a.x:this.settings.size)+"px",height:(this.settings.axis==="y"?a.y:this.settings.size)+"px"});if(this.settings.axis==="y"){this.percent=this.target.scrollTop/(this.target.scrollHeight-this.target.offsetHeight);if(!this.scrolling){this.setScrubPosition(this.percent)}}else{this.percent=this.target.scrollLeft/(this.target.scrollWidth-this.target.offsetWidth);if(!this.scrolling){this.setScrubPosition(this.percent)}}this.updateContainerPosition()};i[n].getElement=function(n){var r,i=this;if(n===e||n===t||n==="body"||n==="body, html"){return t.body}if(typeof n==="string"||n instanceof String){var s=n.replace(/^\s+/,"").replace(/\s+$/,""),r;if(s.indexOf("#")>-1){this.type="id";var o=s.split("#");r=t.getElementById(o[1])}if(s.indexOf(".")>-1){this.type="class";var o=s.split("."),u=t.getElementsByTagName("*"),a=u.length,f=[],l=0;for(var c=0;c<a;c++){if(u[c].className&&u[c].className.match(new RegExp("(^|\\s)"+o[1]+"(\\s|$)"))){r=u[c]}}}return r}else{return n}};i[n].create=function(e,n,r){var i=t.createElement(n);if(r){for(var s in r){if(r.hasOwnProperty(s)){i.setAttribute(s,r[s])}}e.appendChild(i)}return i};i[n].css=function(e,t){for(var n in t){if(n==="opacity"){e.style.filter="alpha(opacity="+t[n]*100+")";e.style.KhtmlOpacity=t[n];e.style.MozOpacity=t[n];e.style.opacity=t[n]}else{e.style[n]=t[n]}}};i[n].getCss=function(n,r){var i;if(!e.getComputedStyle){if(t.defaultView&&t.defaultView.getComputedStyle){i=t.defaultView.getComputedStyle.getPropertyValue(r)}else{if(n.currentStyle){i=n.currentStyle[r]}else{i=n.style[r]}}}else{i=e.getComputedStyle(n).getPropertyValue(r)}return i};i[n].offset=function(e){var t=e.offsetTop,n=e.offsetLeft;var r=e.offsetHeight;if(typeof e.offsetHeight==="undefined"){r=parseInt(this.getCss(e,"height"))}var i=e.offsetWidth;if(typeof e.offsetWidth==="undefined"){i=parseInt(this.getCss(e,"width"))}return{top:t,left:n,width:i,height:r}};i[n].mouse=function(e){var n=0,r=0;if(e.pageX||e.pageY){n=e.pageX;r=e.pageY}else if(e.clientX||e.clientY){n=e.clientX+t.body.scrollLeft+t.documentElement.scrollLeft;r=e.clientY+t.body.scrollTop+t.documentElement.scrollTop}return{x:n,y:r}};i[n].bind=function(e,t,n){var r=/Firefox/i.test(navigator.userAgent)?"DOMMouseScroll":"mousewheel";var i=this;if(e.addEventListener){if(t==="mousewheel"){e.addEventListener(r,function(e){n.call(i,e,this)},false)}else{e.addEventListener(t,function(e){n.call(i,e,this)},false)}}else if(e.attachEvent){e.attachEvent("on"+t,function(e){n.call(i,e,this)})}else{e["on"+t]=function(e){n.call(i,e,this)}}};i[n].unbind=function(e,t,n){var r=/Firefox/i.test(navigator.userAgent)?"DOMMouseScroll":"mousewheel";if(e.addEventListener){if(t==="mousewheel"){e.removeEventListener(r,function(e){n.call(_this,e,this)},false)}else{e.removeEventListener(t,function(e){n.call(_this,e,this)},false)}}else if(e.attachEvent){e.detachEvent("on"+t,function(e){n.call(_this,e,this)})}else{e["on"+t]=null}};i[n].stopEvent=function(e){if(e.stopPropagation){e.stopPropagation()}else{e.cancelBubble=true}if(e.preventDefault){e.preventDefault()}else{e.returnValue=false}};e.Miniscroll=i})(window,document,"prototype");

/* Detect-zoom
 * -----------
 * Cross Browser Zoom and Pixel Ratio Detector 
 * Version 1.0.5 | Jan 19 2014 modified by Kris
 * dual-licensed under the WTFPL and MIT license
 * Maintained by https://github/tombigel
 * Original developer https://github.com/yonran
 */

//AMD and CommonJS initialization copied from https://github.com/zohararad/audio5js
(function (root, ns, factory) {
    "use strict";

    if (typeof (module) !== 'undefined' && module.exports) { // CommonJS
        module.exports = factory(ns, root);
    } else if (typeof (define) === 'function' && define.amd) { // AMD
        define("detect-zoom", function () {
            return factory(ns, root);
        });
    } else {
        root[ns] = factory(ns, root);
    }

}(window, 'detectZoom', function () {

    /**
     * Use devicePixelRatio if supported by the browser
     * @return {Number}
     * @private
     */
    var devicePixelRatio = function () {
        return window.devicePixelRatio || 1;
    };

    /**
     * Fallback function to set default values
     * @return {Object}
     * @private
     */
    var fallback = function () {
        return {
            zoom: 1,
            devicePxPerCssPx: 1
        };
    };
    /**
     * IE 8 and 9: no trick needed!
     * TODO: Test on IE10 and Windows 8 RT
     * @return {Object}
     * @private
     **/
    var ie8 = function () {
        var zoom = Math.round((screen.deviceXDPI / screen.logicalXDPI) * 100) / 100;
        return {
            zoom: zoom,
            devicePxPerCssPx: zoom * devicePixelRatio()
        };
    };

    /**
     * For IE10 we need to change our technique again...
     * thanks https://github.com/stefanvanburen
     * @return {Object}
     * @private
     */
    var ie10 = function () {
        var zoom = Math.round((document.documentElement.offsetHeight / window.innerHeight) * 100) / 100;
        return {
            zoom: zoom,
            devicePxPerCssPx: zoom * devicePixelRatio()
        };
    };

    /**
     * Mobile WebKit
     * the trick: window.innerWIdth is in CSS pixels, while
     * screen.width and screen.height are in system pixels.
     * And there are no scrollbars to mess up the measurement.
     * @return {Object}
     * @private
     */
    var webkitMobile = function () {
        var deviceWidth = (Math.abs(window.orientation) == 90) ? screen.height : screen.width;
        var zoom = deviceWidth / window.innerWidth;
        return {
            zoom: zoom,
            devicePxPerCssPx: zoom * devicePixelRatio()
        };
    };

    /**
     * Desktop Webkit
     * Difficult to get values you can rely on.
     * But it should work the way Opera does. 
     * @return {Object}
     * @private
     */
    var webkit = function () {
        return{
            zoom: opera11().zoom,
            devicePxPerCssPx: opera11().devicePxPerCssPx
        };
    };

    /**
     * no real trick; device-pixel-ratio is the ratio of device dpi / css dpi.
     * (Note that this is a different interpretation than Webkit's device
     * pixel ratio, which is the ratio device dpi / system dpi).
     *
     * Also, for Mozilla, there is no difference between the zoom factor and the device ratio.
     *
     * @return {Object}
     * @private
     */
    var firefox4 = function () {
        var zoom = mediaQueryBinarySearch('min--moz-device-pixel-ratio', '', 0, 10, 20, 0.0001);
        zoom = Math.round(zoom * 100) / 100;
        return {
            zoom: zoom,
            devicePxPerCssPx: zoom
        };
    };

    /**
     * Firefox 18.x
     * Mozilla added support for devicePixelRatio to Firefox 18,
     * but it is affected by the zoom level, so, like in older
     * Firefox we can't tell if we are in zoom mode or in a device
     * with a different pixel ratio
     * @return {Object}
     * @private
     */
    var firefox18 = function () {
        return {
            zoom: firefox4().zoom,
            devicePxPerCssPx: devicePixelRatio()
        };
    };

    /**
     * works starting Opera 11.11
     * the trick: outerWidth is the viewport width including scrollbars in
     * system px, while innerWidth is the viewport width including scrollbars
     * in CSS px
     * @return {Object}
     * @private
     */
    var opera11 = function () {
        var zoom = window.top.outerWidth / window.top.innerWidth;
        zoom = Math.round(zoom * 100) / 100;
        return {
            zoom: zoom,
            devicePxPerCssPx: zoom * devicePixelRatio()
        };
    };

    /**
     * Use a binary search through media queries to find zoom level in Firefox
     * @param property
     * @param unit
     * @param a
     * @param b
     * @param maxIter
     * @param epsilon
     * @return {Number}
     * @private
     */
    var mediaQueryBinarySearch = function (property, unit, a, b, maxIter, epsilon) {
        var matchMedia;
        var head, style, div;
        if (window.matchMedia) {
            matchMedia = window.matchMedia;
        } else {
            head = document.getElementsByTagName('head')[0];
            style = document.createElement('style');
            head.appendChild(style);

            div = document.createElement('div');
            div.className = 'mediaQueryBinarySearch';
            div.style.display = 'none';
            document.body.appendChild(div);

            matchMedia = function (query) {
                style.sheet.insertRule('@media ' + query + '{.mediaQueryBinarySearch ' + '{text-decoration: underline} }', 0);
                var matched = getComputedStyle(div, null).textDecoration == 'underline';
                style.sheet.deleteRule(0);
                return {matches: matched};
            };
        }
        var ratio = binarySearch(a, b, maxIter);
        if (div) {
            head.removeChild(style);
            document.body.removeChild(div);
        }
        return ratio;

        function binarySearch(a, b, maxIter) {
            var mid = (a + b) / 2;
            if (maxIter <= 0 || b - a < epsilon) {
                return mid;
            }
            var query = "(" + property + ":" + mid + unit + ")";
            if (matchMedia(query).matches) {
                return binarySearch(mid, b, maxIter - 1);
            } else {
                return binarySearch(a, mid, maxIter - 1);
            }
        }
    };

    /**
     * Generate detection function
     * @return {Function}
     * @private
     */
    var detectFunction = function () {
        var func = fallback;
        //IE8+
        if (!isNaN(screen.logicalXDPI) && !isNaN(screen.systemXDPI)) {
            func = ie8;
        }
        // IE10+ / Touch
        else if (window.navigator.msMaxTouchPoints) {
            func = ie10;
        }
        //Mobile Webkit
        else if ('orientation' in window && 'webkitRequestAnimationFrame' in window) {
            func = webkitMobile;
        }
        //WebKit
        else if ('webkitRequestAnimationFrame' in window) {
            func = webkit;
        }
        //Opera
        else if (navigator.userAgent.indexOf('Opera') >= 0) {
            func = opera11;
        }
        //Last one is Firefox
        //FF 18.x
        else if (window.devicePixelRatio) {
            func = firefox18;
        }
        //FF 4.0 - 17.x
        else if (firefox4().zoom > 0.001) {
            func = firefox4;
        }

        return func;
    };

    /**
     * Cached detectFunction to prevent double calls
     */
    var cachedDetectFunction;

    /**
     * Script tag for detect-zoom.js can now be included in head
     * or before the closing body tag.
     * @return {Function}
     * @private
     */
    var detect = (function () {
        return document.body ? detectFunction() : function () {
            if (typeof cachedDetectFunction === 'undefined') {
                cachedDetectFunction = detectFunction();
            }
            return cachedDetectFunction();
        }
    }());


    return ({

        /**
         * Ratios.zoom shorthand
         * @return {Number} Zoom level
         */
        zoom: function () {
            return detect().zoom;
        },

        /**
         * Ratios.devicePxPerCssPx shorthand
         * @return {Number} devicePxPerCssPx level
         */
        device: function () {
            return detect().devicePxPerCssPx;
        }
    });
}));

/*!
 * jQuery Popup Overlay
 *
 * @version 1.6.0
 * @requires jQuery v1.7.1+
 * @link http://vast-engineering.github.com/jquery-popup-overlay/
 */
(function ($) {

    var $window = $(window);
    var options = {};
    var zindexvalues = [];
    var lastclicked = [];
    var onevisible = false;
    var oneormorevisible = false;
    var scrollbarwidth;
    var focushandler = null;
    var blurhandler = null;
    var escapehandler = null;
    var bodymarginright = null;
    var opensuffix = '_open';
    var closesuffix = '_close';
    var focusedelementbeforepopup = null;

    var methods = {

        _init: function (el) {
            var $el = $(el);
            var options = $el.data('popupoptions');
            lastclicked[el.id] = false;
            zindexvalues[el.id] = 0;

            if (!$el.data('popup-initialized')) {
                $el.attr('data-popup-initialized', 'true');
                methods._initonce(el);
            }

            if (options.autoopen) {
                setTimeout(function() {
                    methods.show(el, 0);
                }, 0);
            }
        },

        _initonce: function (el) {
            var $body = $('body');
            var $wrapper;
            var options = $el.data('popupoptions');
            bodymarginright = parseInt($body.css('margin-right'), 10);

            if (options.type == 'tooltip') {
                options.background = false;
                options.scrolllock = false;
            }

            if (options.scrolllock) {
                // Calculate the browser's scrollbar width dynamically
                var parent;
                var child;
                if (typeof scrollbarwidth === 'undefined') {
                    parent = $('<div style="width:50px;height:50px;overflow:auto"><div/></div>').appendTo('body');
                    child = parent.children();
                    scrollbarwidth = child.innerWidth() - child.height(99).innerWidth();
                    parent.remove();
                }
            }

            if (!$el.attr('id')) {
                $el.attr('id', 'j-popup-' + parseInt(Math.random() * 100000000));
            }

            $el.addClass('popup_content');

            $body.prepend(el);

            $el.wrap('<div id="' + el.id + '_wrapper" class="popup_wrapper" />');

            $wrapper = $('#' + el.id + '_wrapper');

            $wrapper.css({
                opacity: 0,
                visibility: 'hidden',
                position: 'absolute',
                overflow: 'auto'
            });

            $el.css({
                opacity: 0,
                visibility: 'hidden',
                display: 'inline-block'
            });

            if (options.setzindex && !options.autozindex) {
                $wrapper.css('z-index', '2001');
            }

            if (!options.outline) {
                $el.css('outline', 'none');
            }

            if (options.transition) {
                $el.css('transition', options.transition);
                $wrapper.css('transition', options.transition);
            }

            // Hide popup content from screen readers initially
            $(el).attr('aria-hidden', true);

            if ((options.background) && (!$('#' + el.id + '_background').length)) {

                var popupbackground = '<div id="' + el.id + '_background" class="popup_background"></div>';

                $body.prepend(popupbackground);

                var $background = $('#' + el.id + '_background');

                $background.css({
                    opacity: 0,
                    visibility: 'hidden',
                    backgroundColor: options.color,
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                });

                if (options.setzindex && !options.autozindex) {
                    $background.css('z-index', '2000');
                }

                if (options.transition) {
                    $background.css('transition', options.transition);
                }
            }

            if (options.type == 'overlay') {
                $el.css({
                    textAlign: 'left',
                    position: 'relative',
                    verticalAlign: 'middle'
                });

                $wrapper.css({
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    left: 0,
                    bottom: 0,
                    textAlign: 'center'
                });

                // CSS vertical align helper
                $wrapper.append('<div class="popup_align" />');

                $('.popup_align').css({
                    display: 'inline-block',
                    verticalAlign: 'middle',
                    height: '100%'
                });
            }

            // Add WAI ARIA role to announce dialog to screen readers
            $el.attr('role', 'dialog');

            var openelement =  (options.openelement) ? options.openelement : ('.' + el.id + opensuffix);

            $(openelement).each(function (i, item) {
                $(item).attr('data-popup-ordinal', i);

                if (!$(item).attr('id')) {
                    $(item).attr('id', 'open_' + parseInt((Math.random() * 100000000), 10));
                }
            });

            // Set aria-labelledby (if aria-label or aria-labelledby is not set in html)
            if (!($el.attr('aria-labelledby') || $el.attr('aria-label'))) {
                $el.attr('aria-labelledby', $(openelement).attr('id'));
            }

            $(document).on('click', openelement, function (e) {
                if (!($el.data('popup-visible'))) {
                    var ord = $(this).data('popup-ordinal');

                    // Show element when clicked on `open` link.
                    // setTimeout is to allow `close` method to finish (for issues with multiple tooltips)
                    setTimeout(function() {
                        methods.show(el, ord);
                    }, 0);

                    e.preventDefault();
                }
            });

            // Handler: `close` element
            var closeelement = (options.closeelement) ? options.closeelement : ('.' + el.id + closesuffix);
            $(document).on('click', closeelement, function (e) {
                methods.hide(el);
                e.preventDefault();
            });

            if (options.detach) {
                $el.hide().detach();
            } else {
                $wrapper.hide();
            }
        },

        /**
         * Show method
         *
         * @param {object} el - popup instance DOM node
         * @param {number} ordinal - order number of an `open` element
         */
        show: function (el, ordinal) {
            var $el = $(el);

            if ($el.data('popup-visible')) return;

            // Initialize if not initialized. Required for: $('#popup').popup('show')
            if (!$el.data('popup-initialized')) {
                methods._init(el);
            }
            $el.attr('data-popup-initialized', 'true');

            var $body = $('body');
            var options = $el.data('popupoptions');
            var $wrapper = $('#' + el.id + '_wrapper');
            var $background = $('#' + el.id + '_background');

            // `beforeopen` callback event
            callback(el, ordinal, options.beforeopen);

            // Remember last clicked place
            lastclicked[el.id] = ordinal;

            if (options.detach) {
                $wrapper.prepend(el);
                $el.show();
            } else {
                $wrapper.show();
            }

            setTimeout(function() {
                $wrapper.css({
                    visibility: 'visible',
                    opacity: 1
                });

                $('html').addClass('popup_visible').addClass('popup_visible_' + el.id);
                $el.addClass('popup_content_visible');
            }, 20);


            $el.css({
                'visibility': 'visible',
                'opacity': 1
            });

            // Disable background layer scrolling when popup is opened
            if (options.scrolllock) {
                $body.css('overflow', 'hidden');
                if ($body.height() > $window.height()) {
                    $body.css('margin-right', bodymarginright + scrollbarwidth);
                }
            }

            setTimeout(function () {
                // Set event handlers
                if(!onevisible) {
                    if (options.keepfocus) {
                        $(document).on('focusin', focushandler)
                    };

                    if (options.blur) {
                        $(document).on('click', blurhandler);
                    }

                    if (options.escape) {
                        $(document).on('keydown', escapehandler);
                    }
                }

                // Set plugin state
                if (!onevisible) {
                    onevisible = true;
                } else {
                    oneormorevisible = true;
                }
            }, 0);

            $el.data('popup-visible', true);

            // Position popup
            methods.reposition(el, ordinal);

            // Show background
            if (options.background) {
                $background.css({
                    'visibility': 'visible',
                    'opacity': options.opacity
                });

                // Fix IE8 issue with background not appearing
                setTimeout(function() {
                    $background.css({
                        'opacity': options.opacity
                    });
                }, 0);
            }

            // Remember which element had focus before opening a popup
            focusedelementbeforepopup = document.activeElement;

            // Handler: Keep focus inside dialog box
            if (options.keepfocus) {

                // Make holder div focusable
                $el.attr('tabindex', -1);

                // Focus popup or user specified element.
                // Initial timeout of 50ms is set to give some time to popup to show after clicking on
                // `open` element, and after animation is complete to prevent background scrolling.
                setTimeout(function() {
                    if (options.focuselement) {
                        $(options.focuselement).focus();
                    } else {
                        $el.focus();
                    }
                }, options.focusdelay);

                // Handler for keyboard focus
                focushandler = function(event) {
                    var dialog = document.getElementById(el.id);
                    if (!dialog.contains(event.target)) {
                        event.stopPropagation();
                        dialog.focus();
                    }
                };
            }

            // Calculating maximum z-index
            if (options.autozindex) {

                var elements = document.getElementsByTagName('*');
                var len = elements.length;
                var maxzindex = 0;

                for(var i=0; i<len; i++){

                    var elementzindex = $(elements[i]).css('z-index');

                    if(elementzindex !== 'auto'){

                      elementzindex = parseInt(elementzindex);

                      if(maxzindex < elementzindex){
                        maxzindex = elementzindex;
                      }
                    }
                }

                zindexvalues[el.id] = maxzindex;

                // Add z-index to the wrapper
                if (zindexvalues[el.id] > 0) {
                    $wrapper.css({
                        zIndex: (zindexvalues[el.id] + 2)
                    });
                }

                // Add z-index to the background
                if (options.background) {
                    if (zindexvalues[el.id] > 0) {
                        $('#' + el.id + '_background').css({
                            zIndex: (zindexvalues[el.id] + 1)
                        });
                    }
                }
            }

            // Handler: Hide popup if clicked outside of it
            if (options.blur) {
                blurhandler = function (e) {
                    if (!$(e.target).parents().andSelf().is('#' + el.id)) {
                        methods.hide(el);
                    }
                };
            }

            // Handler: Close popup on ESC key
            if (options.escape) {
                escapehandler = function (e) {
                    if (e.keyCode == 27 && $el.data('popup-visible')) {
                        methods.hide(el);
                    }
                };
            }

            // Hide main content from screen readers
            $(options.pagecontainer).attr('aria-hidden', true);

            // Reveal popup content to screen readers
            $el.attr('aria-hidden', false);

            $wrapper.one('transitionend', function() {
                callback(el, ordinal, options.opentransitionend);
            });

            callback(el, ordinal, options.onopen);
        },

        /**
         * Hide method
         *
         * @param {object} el - popup instance DOM node
         */
        hide: function (el) {

            var $body = $('body');
            var $el = $(el);
            var options = $el.data('popupoptions');
            var $wrapper = $('#' + el.id + '_wrapper');
            var $background = $('#' + el.id + '_background');

            $el.data('popup-visible', false);

            if (oneormorevisible) {
                $('html').removeClass('popup_visible_' + el.id);
                oneormorevisible = false;
            } else {
                $('html').removeClass('popup_visible').removeClass('popup_visible_' + el.id);
                onevisible = false;
            }

            $el.removeClass('popup_content_visible');

            // Re-enable scrolling of background layer
            if (options.scrolllock) {
                setTimeout(function() {
                    $body.css({
                        overflow: 'visible',
                        'margin-right': bodymarginright
                    });
                }, 10); // 10ms added for CSS transition in Firefox which doesn't like overflow:auto
            }

            // Unbind blur handler
            if (options.blur) {
                $(document).off('click', blurhandler);
            }

            if (options.keepfocus) {

                // Unbind focus handler
                $(document).off('focusin', focushandler);

                // Focus back on saved element
                setTimeout(function() {
                    if ($(focusedelementbeforepopup).is(':visible')) {
                        focusedelementbeforepopup.focus();
                    }
                }, 0);
            }

            // Unbind ESC key handler
            if (options.escape) {
                $(document).off('keydown', escapehandler);
            }

            // Hide popup
            $wrapper.css({
                'visibility': 'hidden',
                'opacity': 0
            });
            $el.css({
                'visibility': 'hidden',
                'opacity': 0
            });

            // Hide background
            if (options.background) {
                $background.css({
                    'visibility': 'hidden',
                    'opacity': 0
                });
            }

            // After closing CSS transition is over... (if transition is set and supported)
            $el.one('transitionend', function(e) {

                if (!($el.data('popup-visible'))) {
                    if (options.detach) {
                        $el.hide().detach();
                    } else {
                        $wrapper.hide();
                    }
                }

                if (!options.notransitiondetach) {
                    callback(el, lastclicked[el.id], options.closetransitionend);
                }
            });

            if (options.notransitiondetach) {
                if (options.detach) {
                    $el.hide().detach();
                } else {
                    $wrapper.hide();
                }
            }

            // Reveal main content to screen readers
            $(options.pagecontainer).attr('aria-hidden', false);

            // Hide popup content from screen readers
            $el.attr('aria-hidden', true);

            // `onclose` callback event
            callback(el, lastclicked[el.id], options.onclose);
        },

        /**
         * Toggle method
         *
         * @param {object} el - popup instance DOM node
         * @param {number} ordinal - order number of an `open` element
         */
        toggle: function (el, ordinal) {
            if ($el.data('popup-visible')) {
                methods.hide(el);
            } else {
                setTimeout(function() {
                    methods.show(el, ordinal);
                }, 0);
            }
        },

        /**
         * Reposition method
         *
         * @param {object} el - popup instance DOM node
         * @param {number} ordinal - order number of an `open` element
         */
        reposition: function (el, ordinal) {
            var $el = $(el);
            var options = $el.data('popupoptions');
            var $wrapper = $('#' + el.id + '_wrapper');
            var $background = $('#' + el.id + '_background');

            ordinal = ordinal || 0;

            // Tooltip type
            if (options.type == 'tooltip') {
                $wrapper.css({
                    'position': 'absolute'
                });
                var openelement =  (options.openelement) ? options.openelement : ('.' + el.id + opensuffix);
                var $elementclicked = $(openelement + '[data-popup-ordinal="' + ordinal + '"]');
                var linkOffset = $elementclicked.offset();

                // Horizontal position for tooltip
                if (options.horizontal == 'right') {
                    $wrapper.css('left', linkOffset.left + $elementclicked.outerWidth() + options.offsetleft);
                } else if (options.horizontal == 'leftedge') {
                    $wrapper.css('left', linkOffset.left + $elementclicked.outerWidth() - $elementclicked.outerWidth() +  options.offsetleft);
                } else if (options.horizontal == 'left') {
                    $wrapper.css('right', $(window).width() - linkOffset.left  - options.offsetleft);
                } else if (options.horizontal == 'rightedge') {
                    $wrapper.css('right', $(window).width()  - linkOffset.left - $elementclicked.outerWidth() - options.offsetleft);
                } else {
                    $wrapper.css('left', linkOffset.left + ($elementclicked.outerWidth() / 2) - ($el.outerWidth() / 2) - parseFloat($el.css('marginLeft')) + options.offsetleft);
                }

                // Vertical position for tooltip
                if (options.vertical == 'bottom') {
                    $wrapper.css('top', linkOffset.top + $elementclicked.outerHeight() + options.offsettop);
                } else if (options.vertical == 'bottomedge') {
                    $wrapper.css('top', linkOffset.top + $elementclicked.outerHeight() - $el.outerHeight() + options.offsettop);
                } else if (options.vertical == 'top') {
                    $wrapper.css('bottom', $(window).height() - linkOffset.top - options.offsettop);
                } else if (options.vertical == 'topedge') {
                    $wrapper.css('bottom', $(window).height() - linkOffset.top - $el.outerHeight() - options.offsettop);
                } else {
                    $wrapper.css('top', linkOffset.top + ($elementclicked.outerHeight() / 2) - ($el.outerHeight() / 2) - parseFloat($el.css('marginTop')) + options.offsettop);
                }

            // Overlay type
            } else if (options.type == 'overlay') {

                // Horizontal position for overlay
                if (options.horizontal) {
                    $wrapper.css('text-align', options.horizontal);
                } else {
                    $wrapper.css('text-align', 'center');
                }

                // Vertical position for overlay
                if (options.vertical) {
                    $el.css('vertical-align', options.vertical);
                } else {
                    $el.css('vertical-align', 'middle');
                }
            }
        }

    };

    /**
     * Callback event calls
     *
     * @param {object} el - popup instance DOM node
     * @param {number} ordinal - order number of an `open` element
     * @param {function} func - callback function
     */
    var callback = function (el, ordinal, func) {
        var openelement =  (options.openelement) ? options.openelement : ('.' + el.id + opensuffix);
        var elementclicked = $(openelement + '[data-popup-ordinal="' + ordinal + '"]');
        if (typeof func == 'function') {
            func(elementclicked);
        }
    };

    /**
     * Plugin API
     */
    $.fn.popup = function (customoptions) {
        return this.each(function () {

            $el = $(this);

            if (typeof customoptions === 'object') {  // e.g. $('#popup').popup({'color':'blue'})
                var opt = $.extend({}, $.fn.popup.defaults, customoptions);
                $el.data('popupoptions', opt);
                options = $el.data('popupoptions');

                methods._init(this);

            } else if (typeof customoptions === 'string') { // e.g. $('#popup').popup('hide')
                if (!($el.data('popupoptions'))) {
                    $el.data('popupoptions', $.fn.popup.defaults);
                    options = $el.data('popupoptions');
                }

                methods[customoptions].call(this, this);

            } else { // e.g. $('#popup').popup()
                if (!($el.data('popupoptions'))) {
                    $el.data('popupoptions', $.fn.popup.defaults);
                    options = $el.data('popupoptions');
                }

                methods._init(this);

            }

        });
    };

    $.fn.popup.defaults = {
        type: 'overlay',
        autoopen: false,
        background: true,
        color: 'black',
        opacity: '0.5',
        horizontal: 'center',
        vertical: 'middle',
        offsettop: 0,
        offsetleft: 0,
        escape: true,
        blur: true,
        setzindex: true,
        autozindex: false,
        scrolllock: false,
        keepfocus: true,
        focuselement: null,
        focusdelay: 50,
        outline: false,
        pagecontainer: null,
        detach: false,
        openelement: null,
        closeelement: null,
        transition: null,
        notransitiondetach: false,
        beforeopen: function(){},
        onclose: function(){},
        onopen: function(){},
        opentransitionend: function(){},
        closetransitionend: function(){}
    };

})($);

/*!
 * jQuery.ScrollTo
 * Copyright (c) 2007-2013 Ariel Flesler - aflesler<a>gmail<d>com | http://flesler.blogspot.com
 * Dual licensed under MIT and GPL.
 *
 * @projectDescription Easy element scrolling using jQuery.
 * http://flesler.blogspot.com/2007/10/jqueryscrollto.html
 * @author Ariel Flesler
 * @version 1.4.6
 *
 * @id jQuery.scrollTo
 * @id jQuery.fn.scrollTo
 * @param {String, Number, DOMElement, jQuery, Object} target Where to scroll the matched elements.
 *	  The different options for target are:
 *		- A number position (will be applied to all axes).
 *		- A string position ('44', '100px', '+=90', etc ) will be applied to all axes
 *		- A jQuery/DOM element ( logically, child of the element to scroll )
 *		- A string selector, that will be relative to the element to scroll ( 'li:eq(2)', etc )
 *		- A hash { top:x, left:y }, x and y can be any kind of number/string like above.
 *		- A percentage of the container's dimension/s, for example: 50% to go to the middle.
 *		- The string 'max' for go-to-end. 
 * @param {Number, Function} duration The OVERALL length of the animation, this argument can be the settings object instead.
 * @param {Object,Function} settings Optional set of settings or the onAfter callback.
 *	 @option {String} axis Which axis must be scrolled, use 'x', 'y', 'xy' or 'yx'.
 *	 @option {Number, Function} duration The OVERALL length of the animation.
 *	 @option {String} easing The easing method for the animation.
 *	 @option {Boolean} margin If true, the margin of the target element will be deducted from the final position.
 *	 @option {Object, Number} offset Add/deduct from the end position. One number for both axes or { top:x, left:y }.
 *	 @option {Object, Number} over Add/deduct the height/width multiplied by 'over', can be { top:x, left:y } when using both axes.
 *	 @option {Boolean} queue If true, and both axis are given, the 2nd axis will only be animated after the first one ends.
 *	 @option {Function} onAfter Function to be called after the scrolling ends. 
 *	 @option {Function} onAfterFirst If queuing is activated, this function will be called after the first scrolling ends.
 * @return {jQuery} Returns the same jQuery object, for chaining.
 *
 * @desc Scroll to a fixed position
 * @example $('div').scrollTo( 340 );
 *
 * @desc Scroll relatively to the actual position
 * @example $('div').scrollTo( '+=340px', { axis:'y' } );
 *
 * @desc Scroll using a selector (relative to the scrolled element)
 * @example $('div').scrollTo( 'p.paragraph:eq(2)', 500, { easing:'swing', queue:true, axis:'xy' } );
 *
 * @desc Scroll to a DOM element (same for jQuery object)
 * @example var second_child = document.getElementById('container').firstChild.nextSibling;
 *			$('#container').scrollTo( second_child, { duration:500, axis:'x', onAfter:function(){
 *				alert('scrolled!!');																   
 *			}});
 *
 * @desc Scroll on both axes, to different values
 * @example $('div').scrollTo( { top: 300, left:'+=200' }, { axis:'xy', offset:-20 } );
 */

(function(a){
	
	var $scrollTo = $.scrollTo = function( target, duration, settings ){
		$(window).scrollTo( target, duration, settings );
	};

	$scrollTo.defaults = {
		axis:'xy',
		duration: parseFloat($.fn.jquery) >= 1.3 ? 0 : 1,
		limit:true
	};

	// Returns the element that needs to be animated to scroll the window.
	// Kept for backwards compatibility (specially for localScroll & serialScroll)
	$scrollTo.window = function( scope ){
		return $(window)._scrollable();
	};

	// Hack, hack, hack :)
	// Returns the real elements to scroll (supports window/iframes, documents and regular nodes)
	a.fn._scrollable = function(){
		return this.map(function(){
			var elem = this,
				isWin = !elem.nodeName || $.inArray( elem.nodeName.toLowerCase(), ['iframe','#document','html','body'] ) != -1;

				if( !isWin )
					return elem;

			var doc = (elem.contentWindow || elem).document || elem.ownerDocument || elem;
			
			return /webkit/i.test(navigator.userAgent) || doc.compatMode == 'BackCompat' ?
				doc.body : 
				doc.documentElement;
		});
	};

	a.fn.scrollTo = function( target, duration, settings ){
		if( typeof duration == 'object' ){
			settings = duration;
			duration = 0;
		}
		if( typeof settings == 'function' )
			settings = { onAfter:settings };
			
		if( target == 'max' )
			target = 9e9;
			
		settings = $.extend( {}, $scrollTo.defaults, settings );
		// Speed is still recognized for backwards compatibility
		duration = duration || settings.duration;
		// Make sure the settings are given right
		settings.queue = settings.queue && settings.axis.length > 1;
		
		if( settings.queue )
			// Let's keep the overall duration
			duration /= 2;
		settings.offset = both( settings.offset );
		settings.over = both( settings.over );

		return this._scrollable().each(function(){
			// Null target yields nothing, just like jQuery does
			if (target == null) return;

			var elem = this,
				$elem = $(elem),
				targ = target, toff, attr = {},
				win = $elem.is('html,body');

			switch( typeof targ ){
				// A number will pass the regex
				case 'number':
				case 'string':
					if( /^([+-]=?)?\d+(\.\d+)?(px|%)?$/.test(targ) ){
						targ = both( targ );
						// We are done
						break;
					}
					// Relative selector, no break!
					targ = $(targ,this);
					if (!targ.length) return;
				case 'object':
					// DOMElement / jQuery
					if( targ.is || targ.style )
						// Get the real position of the target 
						toff = (targ = $(targ)).offset();
			}
			$.each( settings.axis.split(''), function( i, axis ){
				var Pos	= axis == 'x' ? 'Left' : 'Top',
					pos = Pos.toLowerCase(),
					key = 'scroll' + Pos,
					old = elem[key],
					max = $scrollTo.max(elem, axis);

				if( toff ){// jQuery / DOMElement
					attr[key] = toff[pos] + ( win ? 0 : old - $elem.offset()[pos] );

					// If it's a dom element, reduce the margin
					if( settings.margin ){
						attr[key] -= parseInt(targ.css('margin'+Pos)) || 0;
						attr[key] -= parseInt(targ.css('border'+Pos+'Width')) || 0;
					}
					
					attr[key] += settings.offset[pos] || 0;
					
					if( settings.over[pos] )
						// Scroll to a fraction of its width/height
						attr[key] += targ[axis=='x'?'width':'height']() * settings.over[pos];
				}else{ 
					var val = targ[pos];
					// Handle percentage values
					attr[key] = val.slice && val.slice(-1) == '%' ? 
						parseFloat(val) / 100 * max
						: val;
				}

				// Number or 'number'
				if( settings.limit && /^\d+$/.test(attr[key]) )
					// Check the limits
					attr[key] = attr[key] <= 0 ? 0 : Math.min( attr[key], max );

				// Queueing axes
				if( !i && settings.queue ){
					// Don't waste time animating, if there's no need.
					if( old != attr[key] )
						// Intermediate animation
						animate( settings.onAfterFirst );
					// Don't animate this axis again in the next iteration.
					delete attr[key];
				}
			});

			animate( settings.onAfter );			

			function animate( callback ){
				$elem.animate( attr, duration, settings.easing, callback && function(){
					callback.call(this, targ, settings);
				});
			};

		}).end();
	};
	
	// Max scrolling position, works on quirks mode
	// It only fails (not too badly) on IE, quirks mode.
	a.scrollTo.max = function( elem, axis ){
		var Dim = axis == 'x' ? 'Width' : 'Height',
			scroll = 'scroll'+Dim;
		
		if( !$(elem).is('html,body') )
			return elem[scroll] - $(elem)[Dim.toLowerCase()]();
		
		var size = 'client' + Dim,
			html = elem.ownerDocument.documentElement,
			body = elem.ownerDocument.body;

		return Math.max( html[scroll], body[scroll] ) 
			 - Math.min( html[size]  , body[size]   );
	};

	function both( val ){
		return typeof val == 'object' ? val : { top:val, left:val };
	};

})($);

$.fn.getAttributes = function() {
        var a = ' '; 

        if(this.length) {
            $.each( this[0].attributes, function(index, attr) {
                a = a + attr.name + '="' + attr.value + '" ';
            }); 
        }
        return a;
};

$.fn.generateUUID = function() {
    var d = new Date().getTime();
    var uuid = 'xxxx-xxxx-xxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
 };

$.fn.selectText = function(){
   var doc = document;
   var element = this[0];
   if (doc.body.createTextRange) {
       var range = document.body.createTextRange();
       range.moveToElementText(element);
       range.select();
   } else if (window.getSelection) {
       var selection = window.getSelection();        
       var range = document.createRange();
       range.selectNodeContents(element);
       selection.removeAllRanges();
       selection.addRange(range);
   }
};

// WebCorrector DropDown with Callback. Use: var lang = new wcDropDown(element, callback(val,id))
  function wcDropDown(el, callback) {
        var dd = el,
        placeholder = dd.children('span'),
        opts = dd.find('ul.dropdown > li'),
        val = '',
        data = '',
        index = -1;

        function initEvents() {
          dd.on('click', function(event){
            $(this).toggleClass('active');
            $('.dropdown', this).slideToggle('fast');
            return false;
          });
          opts.on('click',function(){
            var opt = $(this);
            val = opt.text();
            data = opt.data('sel');
            index = opt.index();
            placeholder.text(val);
            if (callback && typeof(callback) === "function") {  
                callback(val, data);  
            }  
          });
        };
        function getValue() {
          return val;
        }
        function getIndex() {
          return index;
        }
        initEvents();
      };

/* Dust i18n Helper Definition */
dust.helpers.t = function(chunk, context, bodies, params) {
    var options = {};
    if(params.o){
        options = JSON.parse(params.o.replace(/\'/g, "\""));
    }
    if (params.k === 'getSettings') {
    	return chunk.write($.i18n.t(wcApp.settings.get(params.v)));
    } else {
		return chunk.write($.i18n.t(params.k, options));
    }
};
/*{t k="tbar.pgs.test" o="{'name':'Kurdin'}" }*/
// bytes to KB helper
dust.helpers.kb = function(chunk, context, bodies, params) {
    return chunk.write(Math.round(parseFloat(params.k)/1024));
};
// good/bad helper with max value
dust.helpers.gb = function(chunk, context, bodies, params) {
	if(params.tokb) params.k = Math.round(parseFloat(params.k)/1024);
    return chunk.write(Math.round(params.k) > params.max ? "cred" : "cgreen");
};
