(function(){dust.register("chat",body_0);function body_0(chk,ctx){return chk.write("<div class='wcandrag' id='wcorchat' wcelement><div class='chathandle' title='").helper("t",ctx,{},{"k":"chat.moveupdown"}).write("'></div><div id='chatwrap'><p id='chatmessage' contenteditable='true' placeholder-data='").helper("t",ctx,{},{"k":"chat.typesend"}).write("' class='editNoDrag'>").helper("t",ctx,{},{"k":"chat.chathere"}).write("</p></div></div>");}return body_0;})();

(function(){dust.register("report-popup",body_0);function body_0(chk,ctx){return chk;}return body_0;})();

(function(){dust.register("sidemenu/leftright",body_0);function body_0(chk,ctx){return chk.write("<div class='wcelements' id='wcsettings'><div class=\"wcsettingwrap scroller\"><div class=\"wcsetstitle\">").helper("t",ctx,{},{"k":"sets.title"}).write("<div class=\"wcsclose hint--right\" data-side=\"left\" data-hint='").helper("t",ctx,{},{"k":"sets.titleCl"}).write("'>x</div></div><p class='wcstitle'>").helper("t",ctx,{},{"k":"sets.lang"}).write(":</p><div class='wcsetgroup'><div class=\"wcdd-wrap\" tabindex=\"1\"><span>").helper("t",ctx,{},{"k":ctx.get(["langid"], false)}).write("</span><ul class=\"dropdown\"><li data-sel=\"en_US\"><a href=\"#\">").helper("t",ctx,{},{"k":"en_US"}).write("</a></li><li data-sel=\"ru\"><a href=\"#\">").helper("t",ctx,{},{"k":"ru"}).write("</a></li></ul></div></div><p class='wcstitle'>").helper("t",ctx,{},{"k":"sets.followcode"}).write("</p><div class='wcsetgroup clearfix'><span class=\"wcoptitle ").exists(ctx.get(["followcode"], false),ctx,{"block":body_1},null).write(" inputinside\" data-skey=\"followcode\"><input class=\"wcinput wccode\" placeholder='").helper("t",ctx,{},{"k":"sets.entercode"}).write("' value='").reference(ctx.get(["followcode"], false),ctx,"h").write("' spellcheck=\"false\"/></span> <div class=\"wcswitch\"><input type=\"checkbox\" ").exists(ctx.get(["followcode"], false),ctx,{"block":body_2},null).write(" /><label><span class=\"icon-ok\"></span><span class=\"icon-remove\"></span><div></div></label></div><div class=\"clearfix\" style=\"margin-bottom: 4px\"></div><span class=\"wcoptitle ").exists(ctx.get(["autoscroll"], false),ctx,{"block":body_3},null).write("\" data-skey=\"autoscroll\">").helper("t",ctx,{},{"k":"sets.autoscroll"}).write("</span><div class=\"wcswitch\"><input type=\"checkbox\" ").exists(ctx.get(["autoscroll"], false),ctx,{"block":body_4},null).write("/><label><span class=\"icon-ok\"></span><span class=\"icon-remove\"></span><div></div></label></div><div class=\"clearfix\"></div><span class=\"wcoptitle ").exists(ctx.get(["autoscrollsel"], false),ctx,{"block":body_5},null).write("\" data-skey=\"autoscrollsel\">").helper("t",ctx,{},{"k":"sets.autoscrollsel"}).write("</span><div class=\"wcswitch\"><input type=\"checkbox\" ").exists(ctx.get(["autoscrollsel"], false),ctx,{"block":body_6},null).write("/><label><span class=\"icon-ok\"></span><span class=\"icon-remove\"></span><div></div></label></div></div>\t<p class='wcstitle'>Another Option</p><div class='wcsetgroup clearfix'><span class=\"wcoptitle\">Show Something</span><div class=\"wcswitch\"><input type=\"checkbox\" /><label><span class=\"icon-ok\"></span><span class=\"icon-remove\"></span><div></div></label></div><span class=\"wcoptitle\">Show Something Else</span><div class=\"wcswitch\"><input type=\"checkbox\" /><label><span class=\"icon-ok\"></span><span class=\"icon-remove\"></span><div></div></label></div><span class=\"wcoptitle\">Show More Option</span><div class=\"wcswitch\"><input type=\"checkbox\" checked /><label><span class=\"icon-ok\"></span><span class=\"icon-remove\"></span><div></div></label></div><span class=\"wcoptitle\">Show Something</span><div class=\"wcswitch\"><input type=\"checkbox\" checked/><label><span class=\"icon-ok\"></span><span class=\"icon-remove\"></span><div></div></label></div></div>\t<p class='wcstitle'>Option3 title</p><div class='wcsetgroup'><div>Option3 here</div><div>Option3 here</div>\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div>Option3 here</div><div>Option3 here</div>\t\t\t<div>Option3 here</div><div>Option3 here</div><div>Option3 here</div><div>Option3 here</div><div>Option3 here</div></div>\t\t\t<p class='wcstitle'>Option4 title</p><div class='wcsetgroup'><div>Option4 here</div>\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div>Option4 here</div><div>Option4 here</div>\t\t\t<div>Option4 here</div><div>Option4 here</div><div>Option4 here</div><div>Option4 here</div><div>Option4 here</div><div>Option4 here</div>\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t<div>Option4 here</div><div>Option4 here</div>\t\t\t</div>\t\t\t<p class='wcstitle'>Option5 title</p><div class='wcsetgroup'><div>Option5 here</div><div>Option5 here</div><div>Option5 here</div><div>Option5 here</div><div>Option5 here</div><div>Option5 here</div>\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t</div><div id='wcsettings-close' class='left hint--right' data-side='left' data-hint='").helper("t",ctx,{},{"k":"sets.titleOp"}).write("'></div> </div></div><div class='wcelements' id='wchistory'><div class=\"wchistorywrap scroller\"><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div>\t\t<div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div>\t\t<div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div>\t\t<div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div>\t\t<div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div><div>History here</div>\t\t<div>History here</div><div>History here</div><div>History here</div>\t\t<div>History here</div><div>History here</div><div>History here</div>\t\t<div>History here</div><div>History here</div>\t\t<div id='wchistory-close' class='right hint--left' data-side='right' data-hint='").helper("t",ctx,{},{"k":"hist.titleOp"}).write("'></div></div></div>");}function body_1(chk,ctx){return chk.write(" selected ");}function body_2(chk,ctx){return chk.write(" checked ");}function body_3(chk,ctx){return chk.write(" selected ");}function body_4(chk,ctx){return chk.write(" checked ");}function body_5(chk,ctx){return chk.write(" selected ");}function body_6(chk,ctx){return chk.write(" checked ");}return body_0;})();

(function(){dust.register("toolbar/htmlvalidate",body_0);function body_0(chk,ctx){return chk.write(" <p style=\"text-align:center\">").helper("t",ctx,{},{"k":"tbar.vld.totalText"}).write("<p class=\"bigscore\"><b class=\"wcfontbig ").reference(ctx.get(["color"], false),ctx,"h").write("\">").reference(ctx.get(["score"], false),ctx,"h").write("</b></p></p><p style=\"text-align:center\">").helper("t",ctx,{},{"k":"tbar.vld.repText"}).write(":</p><ul class=\"wcerrlist\">").section(ctx.get(["errors"], false),ctx,{"block":body_1},null).write("</ul>");}function body_1(chk,ctx){return chk.write("<li><b>").helper("t",ctx,{},{"k":"tbar.vld.error"}).write(" ").helper("math",ctx,{},{"key":body_2,"method":"add","operand":"1"}).write("</b> ").helper("t",ctx,{},{"k":"tbar.vld.column"}).write(" ").reference(ctx.get(["lastColumn"], false),ctx,"h").write(": <p class=\"wchide\">").reference(ctx.get(["message"], false),ctx,"h").write("</p><pre class=\"html wchide\">").reference(ctx.get(["extract"], false),ctx,"h").write("...</pre></li>");}function body_2(chk,ctx){return chk.reference(ctx.get(["$idx"], false),ctx,"h");}return body_0;})();

(function(){dust.register("toolbar/main",body_0);function body_0(chk,ctx){return chk.write("<div id='wctoolbar' class='wcandrag' wcelement><div class='wcthandle hint--top' id='wcthandlelogo' data-hint='").helper("t",ctx,{},{"k":"tbar.main.openClose"}).write("'></div><ul class='wctwrap editools'><li class='tbSelect'><div class='wctbicon hint--right' data-hint='").helper("t",ctx,{},{"k":"tbar.main.selectElm"}).write("'></div></li><li class='tbEditText'><div class='wctbicon hint--right' data-hint='").helper("t",ctx,{},{"k":"tbar.main.editTextElm"}).write("'></div></li><li class='tbMarkText'><div class='wctbicon hint--right' data-hint='").helper("t",ctx,{},{"k":"tbar.main.markText"}).write("'></div></li></ul><div class='wcthandle' title='").helper("t",ctx,{},{"k":"tbar.main.moveUpDown"}).write("'></div><ul class='wctwrap'><li class='addBox ored hint--top' data-hint='").helper("t",ctx,{},{"k":"tbar.main.addOverlay"}).write("'><div class='wctbicon'></div><div class='bgccol'></div><ul class='oOptions hint--bottom' data-hint='").helper("t",ctx,{},{"k":"tbar.main.overlayColor"}).write("'><li class='ogrey'><div class='wctbicon'></div><div class='bgccol'></div></li><li class='oblue'><div class='wctbicon'></div><div class='bgccol'></div></li><li class='ogreen'><div class='wctbicon'></div><div class='bgccol'></div></li><li class='ored'><div class='wctbicon'></div><div class='bgccol'></div></li><li class='oyellow'><div class='wctbicon'></div><div class='bgccol'></div></li></ul></li><li class='addDraw ored hint--top' data-hint='").helper("t",ctx,{},{"k":"tbar.main.addDrawingBox"}).write("'><div class='wctbicon'></div><div class='bgccol'></div><ul class='oOptions hint--bottom' data-hint='").helper("t",ctx,{},{"k":"tbar.main.brushColor"}).write("'><li class='oblack'><div class='wctbicon'></div><div class='bgccol'></div></li><li class='owhite'><div class='wctbicon'></div><div class='bgccol'></div></li><li class='ogreen'><div class='wctbicon'></div><div class='bgccol'></div></li><li class='ored'><div class='wctbicon'></div><div class='bgccol'></div></li><li class='oyellow'><div class='wctbicon'></div><div class='bgccol'></div></li><ul class='wctsize' style='display:none'><li></li><li></li><li></li></ul></ul></li><li class='addStiker ored hint--top' data-hint='").helper("t",ctx,{},{"k":"tbar.main.addSticker"}).write("'><div class='wctbicon'></div><ul class='oOptions hint--bottom' data-hint='").helper("t",ctx,{},{"k":"tbar.main.selectColor"}).write("'><li class='ocyan'><div class='wctbicon'></div></li><li class='oblue'><div class='wctbicon'></div></li><li class='ogreen'><div class='wctbicon'></div></li><li class='ored'><div class='wctbicon'></div></li><li class='oyellow'><div class='wctbicon'></div></li></ul></li><li class='addSticky hint--right' data-hint='").helper("t",ctx,{},{"k":"tbar.main.addNote"}).write("'><div class='wctbicon'></div></li></ul><div class='wcthandle' title='").helper("t",ctx,{},{"k":"tbar.main.moveUpDown"}).write("'></div><ul class='wctwrap'><li class='runSpellCheck'><div class='wctbicon'><span class='wcscore bred'></span></div></li><li class='runSpeedTest'><div class='wctbicon'><span class='wcscore'></span></div></li><li class='runHTMLValid'><div class='wctbicon'><span class='wcscore'></span></div></li></ul></div>");}return body_0;})();

(function(){dust.register("toolbar/pagespeed",body_0);function body_0(chk,ctx){return chk.write(" <p style=\"text-align:center\">").helper("t",ctx,{},{"k":"tbar.psd.scoreText"}).write("<p class=\"bigscore\"><b class=\"wcfontbig ").reference(ctx.get(["color"], false),ctx,"h").write("\">").reference(ctx.get(["score"], false),ctx,"h").write("</b>/100 (<b class=\"").reference(ctx.get(["color"], false),ctx,"h").write("\">").helper("t",ctx,{},{"k":ctx.get(["speed"], false)}).write("</b>)</p></p><p style=\"text-align:center\">").helper("t",ctx,{},{"k":"tbar.psd.statText"}).write(":</p><p class='").helper("gb",ctx,{},{"k":ctx.get(["numberResources"], false),"max":40}).write("'>").helper("t",ctx,{},{"k":"tbar.psd.ldText"}).write(": ").reference(ctx.get(["numberResources"], false),ctx,"h").write("</p><p class='").helper("gb",ctx,{},{"k":ctx.get(["numberStaticResources"], false),"max":40}).write("'>").helper("t",ctx,{},{"k":"tbar.psd.stText"}).write(": ").reference(ctx.get(["numberStaticResources"], false),ctx,"h").write("</p><p class='").helper("gb",ctx,{},{"k":ctx.get(["javascriptResponseBytes"], false),"max":500,"tokb":1}).write("'>").helper("t",ctx,{},{"k":"tbar.psd.jsText"}).write(": <span class='").helper("gb",ctx,{},{"k":ctx.get(["numberJsResources"], false),"max":10}).write("'>").reference(ctx.get(["numberJsResources"], false),ctx,"h").write("</span> (").helper("kb",ctx,{},{"k":ctx.get(["javascriptResponseBytes"], false)}).helper("t",ctx,{},{"k":"kb"}).write(")</p><p class='").helper("gb",ctx,{},{"k":ctx.get(["cssResponseBytes"], false),"max":300,"tokb":1}).write("'>").helper("t",ctx,{},{"k":"tbar.psd.cssText"}).write(": <span class='").helper("gb",ctx,{},{"k":ctx.get(["numberCssResources"], false),"max":10}).write("'>").reference(ctx.get(["numberCssResources"], false),ctx,"h").write("</span> (").helper("kb",ctx,{},{"k":ctx.get(["cssResponseBytes"], false)}).helper("t",ctx,{},{"k":"kb"}).write(")</p>   \t<p class='").helper("gb",ctx,{},{"k":ctx.get(["htmlResponseBytes"], false),"max":200,"tokb":1}).write("'>").helper("t",ctx,{},{"k":"tbar.psd.htmlText"}).write(": ").helper("kb",ctx,{},{"k":ctx.get(["htmlResponseBytes"], false)}).helper("t",ctx,{},{"k":"kb"}).write("</p><p class='").helper("gb",ctx,{},{"k":ctx.get(["imageResponseBytes"], false),"max":600,"tokb":1}).write("'>").helper("t",ctx,{},{"k":"tbar.psd.imgText"}).write(": ").helper("kb",ctx,{},{"k":ctx.get(["imageResponseBytes"], false)}).helper("t",ctx,{},{"k":"kb"}).write("</p><!-- <p>").helper("t",ctx,{},{"k":"tbar.psd.test","o":"{'name':'Kurdin'}"}).write(": ").reference(ctx.get(["numberResources"], false),ctx,"h").write("</p> -->");}return body_0;})();

(function(){dust.register("toolbar/spellchecker",body_0);function body_0(chk,ctx){return chk.exists(ctx.get(["errors"], false),ctx,{"else":body_1,"block":body_2},null);}function body_1(chk,ctx){return chk.write("<p>").helper("t",ctx,{},{"k":"tbar.spl.noErrors"}).write("<p>");}function body_2(chk,ctx){return chk.write("<p>").helper("t",ctx,{},{"k":"tbar.spl.wasFound"}).write(" <b style=\"font-size:120%;color:red\">").reference(ctx.get(["errors"], false),ctx,"h").write("</b> ").helper("t",ctx,{},{"k":"tbar.spl.errorsFound"}).write("</p>");}return body_0;})();
