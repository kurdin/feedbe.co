var $ = require('jquery');

/* Dust i18n Helper Definition */
dust.helpers.t = function(chunk, context, bodies, params) {
    var options = {};
    var key = params.k;
    if(params.o){
        options = JSON.parse(params.o.replace(/\'/g, "\""));
    }
    if (key === 'getSettings') {
    	return chunk.write($.i18n.t(wcApp.settings.get(params.v)));
    } else {
        if (key) { 
        return chunk.write($.i18n.t(key, options)); 
        } else {
        console.error('Dust i18n Helper, `k` key is missing');
        }
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