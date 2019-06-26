$("<style type='text/css'>\
.wcremotesel {outline: 2px solid red;} .wcremotedraw {outline: 2px solid green;} #mdialog p { margin:5px;padding:5px}\
  #jGrowl a{ color: yellow!important;}div.jGrowl{z-index:999999;color:#EAEBF0!important;font-size:14px!important;}div.ie6{position:absolute}div.ie6.top-right{right:auto;bottom:auto;left:expression( ( 0 - jGrowl.offsetWidth + ( document.documentElement.clientWidth ? document.documentElement.clientWidth:document.body.clientWidth ) + ( ignoreMe2 = document.documentElement.scrollLeft ? document.documentElement.scrollLeft:document.body.scrollLeft ) ) + 'px' );top:expression( ( 0 + ( ignoreMe = document.documentElement.scrollTop ? document.documentElement.scrollTop:document.body.scrollTop ) ) + 'px' )}div.ie6.top-left{left:expression( ( 0 + ( ignoreMe2 = document.documentElement.scrollLeft ? document.documentElement.scrollLeft:document.body.scrollLeft ) ) + 'px' );top:expression( ( 0 + ( ignoreMe = document.documentElement.scrollTop ? document.documentElement.scrollTop:document.body.scrollTop ) ) + 'px' )}div.ie6.bottom-right{left:expression( ( 0 - jGrowl.offsetWidth + ( document.documentElement.clientWidth ? document.documentElement.clientWidth:document.body.clientWidth ) + ( ignoreMe2 = document.documentElement.scrollLeft ? document.documentElement.scrollLeft:document.body.scrollLeft ) ) + 'px' );top:expression( ( 0 - jGrowl.offsetHeight + ( document.documentElement.clientHeight ? document.documentElement.clientHeight:document.body.clientHeight ) + ( ignoreMe = document.documentElement.scrollTop ? document.documentElement.scrollTop:document.body.scrollTop ) ) + 'px' )}div.ie6.bottom-left{left:expression( ( 0 + ( ignoreMe2 = document.documentElement.scrollLeft ? document.documentElement.scrollLeft:document.body.scrollLeft ) ) + 'px' );top:expression( ( 0 - jGrowl.offsetHeight + ( document.documentElement.clientHeight ? document.documentElement.clientHeight:document.body.clientHeight ) + ( ignoreMe = document.documentElement.scrollTop ? document.documentElement.scrollTop:document.body.scrollTop ) ) + 'px' )}div.ie6.center{left:expression( ( 0 + ( ignoreMe2 = document.documentElement.scrollLeft ? document.documentElement.scrollLeft:document.body.scrollLeft ) ) + 'px' );top:expression( ( 0 + ( ignoreMe = document.documentElement.scrollTop ? document.documentElement.scrollTop:document.body.scrollTop ) ) + 'px' );width:100%}div.jGrowl{position:absolute}body > div.jGrowl{position:fixed}div.jGrowl.top-left{left:0;top:0}div.jGrowl.top-right{right:5px;top:65px}div.jGrowl.bottom-left{left:0;bottom:0}div.jGrowl.bottom-right{right:0;bottom:0}div.jGrowl.center{top:0;width:50%;left:25%}div.center div.jGrowl-notification,div.center div.jGrowl-closer{margin-left:auto;margin-right:auto}div.jGrowl div.jGrowl-notification,div.jGrowl div.jGrowl-closer{background-color:#404040;opacity:.90;-ms-filter:'progid:DXImageTransform.Microsoft.Alpha(Opacity=90)';filter:progid:DXImageTransform.Microsoft.Alpha(Opacity=90);zoom:1;width:235px;padding:10px;margin-top:5px;margin-bottom:5px;font-family:sans-serif;font-size:14px;text-align:left;display:none;border-radius:5px;-webkit-border-radius:5px;-webkit-box-shadow: 0px 1px 2px rgba(0,0,0,0.6);-moz-box-shadow: 0px 1px 2px rgba(0,0,0,0.6);box-shadow: 0px 1px 2px rgba(0,0,0,0.6);border:1px solid rgba(0,0,0,0.6);background: -webkit-linear-gradient(#333, #2F2E2E);background: -moz-linear-gradient(#333, #2F2E2E);background: -ms-linear-gradient(#333, #2F2E2E);background: -o-linear-gradient(#333, #2F2E2E);background: linear-gradient(#333, #2F2E2E);}div.jGrowl div.jGrowl-notification{min-height:40px}div.jGrowl div.jGrowl-notification,div.jGrowl div.jGrowl-closer{margin:10px}div.jGrowl div.jGrowl-notification div.jGrowl-header{font-weight:bold;font-size:.85em}div.jGrowl div.jGrowl-notification div.jGrowl-close{z-index:99;float:right;font-weight:bold;font-size:15px;cursor:pointer;margin-top:-5px;color:#fff!important;}div.jGrowl div.jGrowl-closer{padding-top:4px;padding-bottom:4px;cursor:pointer;font-size:.9em;font-weight:bold;text-align:center}@media print{div.jGrowl{display:none}}#jGrowl .jGrowl-message{font-family:sans-serif;font-size:14px!important;color:#EAEBF0!important;line-height: 20px;text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);text-overflow: hidden;}div.jGrowl-closer.highlight{font-family:sans-serif;color:#EAEBF0!important} \
  html > body { \
    position: initial;\
    -webkit-backface-visibility:hidden; \
    -ms-backface-visibility:hidden; \
  } \
  [wcelement], [wcelement] * { \
      background: none;\
      text-align: left;\
      color: #fff;\
      margin: 0;\
      padding: 0;\
      border: 0;\
      font-size: 100%;\
      font: inherit;\
      font-family:arial,sans-serif;\
      vertical-align: baseline;\
      line-height: 1;\
  }\
  [wcelement] ol, [wcelement] ul { \
      list-style: none;\
  }\
  [wcelement] pre code { display: block; padding: 0.5em; color: #333; background: #f8f8ff;}\
  #wctoolbar { \
  display:block; \
  z-index:99997; \
  position:fixed; \
  left:-100px; \
  top:200px; \
  width:50px; \
  background-color: rgba(64, 64, 64, 0.9);\
  border-radius: 3px; \
  box-shadow: 0 0 7px #B6B6B6; \
  }\
  [wcelement] *:-ms-input-placeholder{\
   color: #828282;\
  }\
  [wcelement] *::-webkit-input-placeholder{\
    color: #828282;\
  }\
  #wctoolbar .wcthandle { \
  height: 20px; \
  cursor: move;\
  border: 1px solid #000; \
  background-repeat: no-repeat; \
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAKBAMAAAA0tAFjAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAwUExURQAAAA0NDSAgICEhIRoaGgcHByQkJBkZGQAAABcXFzAwMCUlJSwsLBMTEyUlJRkZGd/CqRUAAAAQdFJOUwDMyhNwgEWLCMw6nshcw0fEF+ELAAAAdElEQVQI12NgwAVYA8AU8wIgwWUAFXQUAVMsx4BEjgNErFVQMAJEc+slMLA92gAW46ice3N6A0h7kT7DJ3WIdnOlD/xKxSBW+8y7Mysgujc9Y2DI0wbrCRQUbYAI+iQwMLAdgVglCLWGwQpELIawQ3E6mwEAKNEWUaquWssAAAAASUVORK5CYII=);\
  background-position: center 5px; \
  } \
  #wctoolbar.notactive > .wcthandle, #wctoolbar.notactive > .wctwrap {\
  display: none;\
  }\
  #wctoolbar.notactive > #wcthandlelogo {\
  display: block;\
  }\
  #wcsettings, #wchistory { \
  position:fixed;\
  top: 0; \
  width: 270px;\
  height: 100%;\
  color: #D3D3D3;\
  z-index: 2147483589; \
  } \
  #wcsettings ul, #wchistory ul{list-style: none;}\
  #wcsettings { left: -300px; } \
  #wchistory { right: -300px; } \
  #wcsettings-close, #wchistory-close { \
  opacity:0;\
  cursor: pointer;\
  position:absolute; \
  top:50%; \
  margin-top:-35px;\
  width:60px; \
  height:80px;\
  color:#FFF; \
  background-color:#111; \
  font-size: 5em; \
  background-position: center; \
  background-repeat: no-repeat;\
  -webkit-transition: opacity 1.5s ease-in-out;\
  -moz-transition: opacity 1.5s ease-in-out;\
  -ms-transition: opacity 1.5s ease-in-out;\
  -o-transition: opacity 1.5s ease-in-out;\
  transition: opacity 1.5s ease-in-out;\
  } \
  #wcsettings-close.wcvisible, #wchistory-close.wcvisible { \
  opacity: 1;\
}\
  #wcsettings:hover {z-index:2147483595}\
  #wcsettings-close, .sideopen #wcsettings-close:hover { left: 270px; \
  background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADcAAAAkCAYAAAAtmaJzAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo4NzJFMTQ4ODE0MjA2ODExOEMxNDhFMzFBMzk4MTAxNiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo3QThFOTk4NzA5OUQxMUUzQjY5RERCODkxRkQwMzM2RCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo3QThFOTk4NjA5OUQxMUUzQjY5RERCODkxRkQwMzM2RCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6ODhDQjlDQ0Y4NzIxNjgxMThDMTQ4RTMxQTM5ODEwMTYiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6ODcyRTE0ODgxNDIwNjgxMThDMTQ4RTMxQTM5ODEwMTYiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7UBPpNAAAAlklEQVR42uyZQQrAIAwEteQ97VsEnyn4lvY9gsVbTz0lAXX26iFZdpMFE3vvYVUcYWHI32Mp5RSR27Oh1tqVc37MlfMmpl1zX1t+kVKKlo3UWtU329LKQQ5yMy8U7QVgvaCw5Za29LAVykGOmSMKsCVRgHKQY+aIAmxJFKAc5PadOYsfYZSzIjfOSd4NadaMXFYnxSvAACs6LDv0Sf6eAAAAAElFTkSuQmCC); \
  background-position: center; \
  }\
  #wchistory-close, .sideopen #wchistory-close:hover { right: 270px; \
  background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADcAAAAkCAYAAAAtmaJzAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2hpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo4NzJFMTQ4ODE0MjA2ODExOEMxNDhFMzFBMzk4MTAxNiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo3QThFOTk4RjA5OUQxMUUzQjY5RERCODkxRkQwMzM2RCIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo3QThFOTk4RTA5OUQxMUUzQjY5RERCODkxRkQwMzM2RCIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChNYWNpbnRvc2gpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6ODhDQjlDQ0Y4NzIxNjgxMThDMTQ4RTMxQTM5ODEwMTYiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6ODcyRTE0ODgxNDIwNjgxMThDMTQ4RTMxQTM5ODEwMTYiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7nvuzxAAAD8klEQVR42tyZXUgUURTHd9UMP1asFiqkfLEkCir6eil6MaLCGPAhoyzQfIheCozMgj7owVSieijrQaGMEEQEK4IKpKIwkj5fLA0yJO1DSys0t+x/6EzcTndmN52ZXTzwI2fm3nv2fz/PPflHR0d9E9XifBPYEsbbQFNTU7giaWA92AqWgKns1w9o2oRAH2gDdeCaYRgDTojzj3da2ogjESVgJ0j/jyY/gbOgCiL7YnFa5oF2sN9CGPXoD/5XWjrXa0fH5cWSOGqvAjSAoPjWA2pBPljA32dzR9Tyd9XoewMEVoC4aIujNVQN9or33SxoFigE9aAf5II1tNYw/Qr5ez6XV43aq4ZAfzTFHQPF4h1tEPNYUEh5XwUugBoeNR8EhkA9l68T7RRz+1ERZ4Ay8e44KACDmvIZ6t8Ylcl/GjKMQVDA9VUrQznDa3G0AVSKdzQipTbHT1DUT/2ntwyjlNtRrRIC070UtwNkKc/tfARYWSofE6algIBF2RJuz7Qs9ue+OPRiksbZId4wrCwgRoramKKd64bRz+391Zns1/WRWwWyleenoDGCaZwsfkPQpnwjt2taNvt1XVyO5oeMhKkzDcRrzjSfxeiNaDosxwtxy8VzSwR1ZmjeBcPUaQnj1xVxmcrftOV3irZTeNtfDNaCInBU0842rKMUGz+d4kjJ9OJWEBABL8WKl8Fq3jQSeQrGcwRjZUvBdnDG4vtnJqDx65o4deRDvNjzx9jWfJtvP0WE4/diWg6J8+st38uGbKJ+K3tu8y1JHB9DXoxcL5ip7IKJvNiT+aCezhuISi4Hyard51jTyjLEwd/rhTg6fxYps4Bu2k/AF6ZLU+cw2A028MjSbfc0tvyvYdZknPDrurjbtNMpzxs18aC09+AAQ+dYJH5yNX5dX3M3gZrvWAcWOnn7xRGxjHMwpg2wX3fFoddf87QyLZFTBE4ardNJahQEv11e3QpOgu/K8yawxSllENLMZ6dppyKtm+CA/0e0IYhrzjneTO5YxJY0wh9Fp9jZEUCz5B3EPo447+FQao9Cp1tghVgbNIrXRZWDHI1QQqgIP/aFSxk4x9IMtI1T0vWN8o6SsVf5lp4mytOlcyV4hs4pB2mxLI6sg4PjV6L9En5HOZE5Ioyi6bnP9ztHuXksGS4vpqXc3Wr4WNDFiMMcTumsFezCVG2LtZEzrYejD5qm3Rp/dikCWrMP0WHn1YxYLInzcVh1CczlCOZBpMEuRzCtEdzoPTkK7OwbuMhQEogSrmU8stJoup4A5U79L4/b4lSjTNY9cFcj7grYA1EdTjr0Upy6Q5r2kjeQG244ioa4D6CZL7U0BYfdcvRLgAEA/nkEU67h7B0AAAAASUVORK5CYII=); \
  }\
  ul.wctwrap > li{ \
  margin-top: 6px; \
  margin-left: 6px; \
  width: 36px; \
  height: 36px; \
  cursor: pointer;\
  position: relative;\
  list-style: none;\
  } \
  body ul.wctwrap  { \
  border:1px solid rgba(98, 98, 98, 0.63); \
  background-color: rgba(235, 235, 235, 0.5); \
  list-style: none outside none; \
  margin: 0; \
  -webkit-padding-start: 0; \
  padding: 10px 0; \
  background-color: rgba(235, 235, 235, 0.5); \
  } \
  .wctwrap li.addBox,.wctwrap li.runSpellCheck, .wctwrap li.selectElm {\
    margin-top: 0;\
  } \
  li.addBox .wctbicon{ \
    background-position:  2px 2px;\
    margin-top: 0; \
  }\
  li.tbSelect .wctbicon{ \
    background-position:2px -554px;\
  }\
  li.tbMarkText .wctbicon{ \
    background-position:2px -516px;\
  }\
  li.tbEditText .wctbicon{ \
    background-position:2px -590px;\
  }\
  .wctwrap.editools .active .wctbicon{ \
    /*background-color: #D69712;*/\
  }\
  li.tbSelect.active .wctbicon{ \
    background-position:2px -552px;\
  }\
  li.tbMarkText.active .wctbicon{ \
    background-position:2px -514px;\
  }\
  li.tbEditText.active .wctbicon{ \
    background-position:2px -589px;\
  }\
  li.addDraw .wctbicon{ \
    background-position:  2px -34px;\
  }\
  li.addSticky .wctbicon{ \
    background-position:  2px -70px;\
  }\
  li.addStiker .wctbicon, li.addStiker .ored .wctbicon, li.addStiker.ored .wctbicon{ \
    background-position:  2px -175px;\
  }\
  li.addStiker .ogreen .wctbicon, li.addStiker.ogreen > .wctbicon{ \
    background-position:  2px -212px;\
  }\
  li.addStiker .oyellow .wctbicon, li.addStiker.oyellow > .wctbicon{ \
    background-position:  2px -285px;\
  }\
  li.addStiker .oblue .wctbicon, li.addStiker.oblue > .wctbicon{ \
    background-position:  2px -248px;\
  }\
  li.addStiker .ocyan .wctbicon, li.addStiker.ocyan > .wctbicon{ \
    background-position:  2px -324px;\
  }\
  li.active .wctbicon{ \
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.8) inset;\
    background-color: #878787;\
    border: 1px solid #A8A8A8;\
  }\
  li.runSpellCheck .wctbicon{ \
    background-position:  2px -106px;\
  }\
  li.runSpellCheck.active .wctbicon{ \
    background-position:  2px -140px;\
    /*background-color: #FF4A4A;*/\
  }\
  li.runSpeedTest .wctbicon{ \
    background-position:  2px -363px;\
  }\
  li.runSpeedTest.active .wctbicon{ \
    background-position:  2px -361px;\
    /*background-color: #40BF3F;*/\
  }\
  li.runHTMLValid .wctbicon{ \
    background-position:  2px -440px;\
  }\
  li.runHTMLValid.active .wctbicon{ \
   background-position:  2px -438px;\
   /*background-color: #FF4A4A;*/\
  }\
  li.active .yellow.wctbicon{ \
   background-color: #CD9B5A;\
  }\
 .active .wctbicon > .wcscore{ \
    border:1px solid rgba(0, 0, 0, 0.3);\
    display:none;\
    color: #FFF;\
    font-size: 12px;\
    font-family: arial;\
    text-align: center;\
    text-shadow: 0 0 2px #E1E1E1;\
    border-radius: 50% 50% 50% 50%;\
    height: 20px;\
    width: 22px;\
    padding-top: 2px;\
    position:absolute;\
    top:-7px;\
    left:16px;\
    line-height:18px;\
  }\
  .byellow{ \
    background-color: #A2871D;\
  }\
  .bred{ \
    background-color: red;\
  }\
  .bgreen{ \
    background-color: green;\
  }\
  .bigscore {\
    font-size:17px;\
    text-align: center;\
    padding: 4px 0;\
  }\
  .wcfontbig {\
    font-size:24px;\
  }\
  .cred { \
    color: red;\
  }\
  .cgreen { \
    color: green;\
  }\
 .cyellow { \
    color: #A2871D;\
  }\
  .wctwrap .bgccol { \
  width: 27px;\
  height: 28px; \
  margin-top: 5px; \
  margin-left: 5px; \
  position: absolute; \
} \
.wctwrap .addDraw .bgccol {\
    height: 23px; \
    margin-left: 7px; \
    margin-top: 7px; \
    width: 23px; \
} \
.oblack > .bgccol{ \
   background-color: #000;\
}\
.owhite > .bgccol{ \
   background-color: #9B9B9B;\
}\
.ogrey > .bgccol{ \
  background-color: #D5D5D5;\
} \
.oblue > .bgccol{ \
  background-color: #5298EF;\
} \
.ored > .bgccol{ \
  background-color: red;\
} \
.ogreen > .bgccol{ \
  background-color: green;\
} \
.oyellow > .bgccol{ \
  background-color: #F09F00;\
} \
 .wctwrap li .wctbicon { \
  position: absolute; \
  z-index: 10;\
  width: 36px;\
  height: 36px;\
  margin:0; \
  background-repeat: no-repeat; \
  background-image: url(data:image/png;base64,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); \
 } \
 #wctoolbar #wcthandlelogo { \
  height: 40px; \
  background-position: 8px 4px; \
  background-repeat: no-repeat; \
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAABJZJREFUeNrkV1sorWkYfte/nA9pRxoxCmNQ4xAuqB2RuJtxCoOQq+FiT2NcOESjuFiTBhfGMbGaRso2VzJKiuZi5DBtEXKI2GGwkfNpr3mfb69fv8Va7Mi+mK/esv7v8D7v8z7v+31UOp2O/rcjLi4u+ZM5T01N/bGpqenfZ3fs4OBgmZ+f/2tbW5suIiLi22d17u7u/llxcfGfHR0duvj4+J/wzey5nAcFBYWmp6drmQG/kZGR1729vRr+LN0AYGtr+7mHh0fyex6PdahSqQjHXFxcXLHzF+Hh4T9YWlq+WF1dfaPVar/n76e3GGAAXwUEBPxydXX16IgvLy8FgISEBAoJCaG+vj46ODh419nZ+d3h4eFbYGTT3QDAjlUnJyf0GACI/OzsjKytrSkrK4tiY2NpYWFBHN/T0/NqcXHxb1DP9v5ODQD1YzKAAFxcXCgvL4/8/f3p9PSULCwsaHBw8OfR0dHflc5vAUBXRPQfywCixt7j42MKDAwUzgECv+3s7GhsbOwNp0Ajx6jc+yQMAPD5+TnFxMRQbm6uoB/ObWxsaHZ2llpaWt4xwEPEaLj3FgMQz8cwwGoWDGRmZlJSUpIADw2A9p2dHaqrq6O9vT3J2H4pIyOj2tvb+0v84HydIBI5DfeZHGVhYSGlpKQIMDC1Wi2Cqa+vp/n5eQHG2DBzcnKKyMnJebW0tPTH8vLyEiLY398Xm8zNzY1uhHMvLy/h3MfHh46Ojq7nsLe9vZ2GhoaEBsCIsaGem5sb5AO+cXR0fMnN4iWDEZu2t7dpa2tLRCSnB+AQOdcx8VoqLS0lNzc3AUYe2DswMEANDQ1kZvYhw8zsyubmpvYuDah5cpcn//H09EzgNmkVGRlJwcHBxBcFcVcUZcTzaCLCOQAlJydTQUEBGtd1dACIdMzMzFBlZaX4LkmS+M5/r3AwdwOADlgkK2xvw8LCvvbz85Pg1MrKinx9fSkqKopCQ0OJ26hIDRjKzs4WbECwStoxX15eTmtrayJ9cjUBADOqNVYFWCVxufw2PDzsm5aWViq3UhgUjhwzMOEAFAOg8iUlR1pdXU1TU1NijQwOc6aqSlI2h+7u7r+6uroEtcrSBJ3ocGAFVWL4jEPdQ3To92BKLmXZTPWVG32A0Uq1tbXk7OxM0dHRQmyGDcdwINr+/n5qbm4WtBuuAYPKVBlj4IMguH6h6IqKCpqenhaRmRqYx7qqqirBjP76vWUPScF1GwaI9fV14peLKEOIC5QbGkpsd3eXysrKaGNjQ+TakHqlPQiALD44nZycFIcjArmelaKDIfKJiQmxXhatMXsQAPkugEFwEJVGoxG5lW88ud4bGxshWrHuPuemRCgZu45hUHRrayvxC/a6Muzt7Ynfc1RTU3MtuofYg6pAZkBZZtAEOpurqyslJibS+Pg4lZSUiNKUS+6+t4KpNYYA1HLvVx6AxlNUVCRKDs0GnU7ZbO4bnALLu7og6R+GSmdfsOCSDFMDEACGiBG5oSjvezBxYIsM9jU0bgqASu/4Sn9HPNXQ6TutWn+2cQZMfHsqIHfS80n/Q/5PgAEAq+Ezyno4vVoAAAAASUVORK5CYII=); \
 } \
 #wctoolbar .oOptions {\
    display:none;\
    list-style: none outside none; \
    left: 42px; \
    margin: 0; \
    padding: 0; \
    position: absolute; \
    top: 0; \
    width: 216px; \
    height: 37px;\
    background-color: rgba(204, 203, 203, 0.94); \
    border: 1px solid rgba(98, 98, 98, 0.63); \
  } \
  #wctoolbar .oOptions > li{\
    float: left; \
    width: 35px; \
    height: 35px; \
    margin-top: 0; \
    margin-left: 7px; \
    cursor: pointer;\
    list-style: none;\
  } \
  #wcorchat { \
  display:block; \
  position:fixed; \
  right:20px; \
  bottom:100px; \
  width:308px; \
  height:45px; \
  } \
  #wcorchat, #wctoolbar { \
  z-index: 2147483590; \
  } \
  #chatmessage { \
  background-color: #FFF; \
  margin: 0; \
  padding: 7px 5px; \
  line-height: 18px; \
  font-size: 14px; \
  border: 1px solid #9B9B9B; \
  font-family: arial,sans-serif; \
  border-radius: 3px; \
  outline:0px solid transparent; \
  width: 250px; \
  -moz-user-modify:read-write; \
  -webkit-user-modify:read-write; \
  user-modify:read-write; \
  min-height:20px; \
 -webkit-box-shadow: inset inset 2px 2px 4px rgba(0, 0, 0, 0.075); \
 -moz-box-shadow: inset 2px 2px 4px rgba(0, 0, 0, 0.075); \
  box-shadow: inset 2px 2px 4px rgba(0, 0, 0, 0.1); \
} \
.wcicon.selected { \
display:none;\
background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAY0lEQVR4Xr2T0QqAIAxFb7EPbV9Wf2oPBedhuCEDL4iCnjNjdkgaamZ02FPNbBfc3yC2CF8izg1ChQomllWYwA97008ASOAgcADmABdd8P+gEjgTIMnhuo0e1gsCwB1Puf07v5tzFWpkt96mAAAAAElFTkSuQmCC); \
width: 16px; \
height: 16px; \
position: absolute; \
top: 10px; \
left: 10px; \
opacity: .9; \
cursor: pointer;\
} \
.wcelement.sticky .wcicon.selected { \
top: 7px; \
left: 8px; \
} \
.selected .wcicon.selected { \
display:block;\
} \
.selected .sticky-status { \
display:none;\
} \
#chatmessage.active { \
box-shadow: 0 0 7px #B6B6B6; \
border-color: #5C5C5C; \
} \
.chathandle{ \
z-index:9997; \
cursor:move;\
background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAD/klEQVRYhe2WXWhcRRTHf2c2pGkJbKmtJLEgxe2DSDG7927bpajri6LWDyil9sFSrR9JQx+MH6AgKPhkChZaLMW22opoQXwpWNunUClVc+/sNiH6kBgLpo3UFlsS0812d44PuZFLY0xis0/6hwuXmTPz+8+ZuXcO/NclcwnK5/N1Y2NjGVW9H3gAWAkkgaVRyFXgqogMq+ppETnd2Nhou7u7K7dkIJvNtqpqu6puiYDz0TUROSYi+3t6eorzMpBOp1cYY7qAbbEYC3Sr6hnnXJ+qjjvnxgGMMUtEZIkxZo2IbADyQCYapyLysaq+Hobh5VkN+L6/SVUPALcB14GDqnrQWts757VPLuLeRCLxgqruABqAK6r6orX2yxkNeJ63E9gLGOCLarX6WrFYPD8f8M1au3btqkql0iUim4CqiHQEQXBgmgHP89qA/YBT1VestXviE+VyucUTExOPA/cBGRFpAZKq2m6tPTabEd/3X1bV3YCJMvHhXway2Wyrc+4sk6naHobhkZix5ar6pog8IyKBqp4Avquvrx8YGxvTvr6+3+eajUwm86yIHAZKqrrOWttbBxjn3FGgQUT2BEFwJDZgC7BPRD4F7g6CYNohmo+stR95npcGdonIUSAtmUxmo4gcBy6WSqVV/f395VjKOlR1i7U2vBVwXKlUalEymTwPNInIo0ZEngYQkQ+m4J7nrVPVTmPMgwsJBxgcHJxg8qzhnNtqgFxk4FQs7g0Rebunp+eXhYTHdDJirjfAHQClUmkwFrChXC4frxGc+vr6geh1pQGqUePEVICIdPb29l6qlYG4DHABQFVTU41BEHxSS2i5XF4dvQ4b4AyAiDxSS+hNehhAVb81qvp51Niey+UW15qcSqUWAe0AxpjPjLX2FFAA7rxx48Y7tTaQTCa7gCbgXBAEXxtAI0cVVX01k8lsrxXc9/3ngF1M/oq3AZoAGBkZudDS0nIFeExEnmhubr4+MjJydgHZ4nneW8D7gKjqTmvtCZh+HXcCu6P2r6rVasetXsetra2rE4nEPuAh/uk6jpl4CjgELAPGRaTt33yWsYLkeWARcylIppTNZpucc+8CO4ArYRgujxm8yxizrFwuX6yrq7sEUKlUbjfGNBtj7lFVPyrL0tGQ+ZVkMdBy4DfgWhiGSzdv3pwYGhraB7TNMQm/Akeq1eqhYrE4MFNQ3UwdqrpeRAB+zOfzDUNDQ4eBrcAfwE/AiuiRyOhlEfl5vmX5jAZE5KXIyMDo6Oj3wBpg1Dm3sVAonJ5t4rnqb7fA9/0NqvrNTf2DzrknC4XCDwsFh8nLaJqcc+/F4FUR2VMqldILDYcZtkBEEsAwcNI5t7dQKJxbaPD/mtKfRxHRR5qaVwoAAAAASUVORK5CYII=); \
background-repeat: no-repeat; \
background-position: center; \
width: 38px; \
height: 34px; \
display: block; \
float: right; \
opacity: 0.8; \
} \
.chathandle.notactive { \
    border-radius: 3px; \
    -moz-transform: scaleX(-1); \
    -webkit-transform: scaleX(-1); \
    -o-transform: scaleX(-1); \
    transform: scaleX(-1); \
    -ms-filter: fliph; \
    filter: fliph; \
    background-color: #DADADA; \
    border: 1px solid #9B9B9B; \
    width: 38px; \
    height: 34px; \
    background-position: center; \
    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo1OEE3QUFGRDAwNkYxMUUzQjkyNEQwM0Y1RjUzNzU0NCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo1OEE3QUFGRTAwNkYxMUUzQjkyNEQwM0Y1RjUzNzU0NCI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjU4QTdBQUZCMDA2RjExRTNCOTI0RDAzRjVGNTM3NTQ0IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjU4QTdBQUZDMDA2RjExRTNCOTI0RDAzRjVGNTM3NTQ0Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+IVepCwAAA+9JREFUeNrkl1tIVFEUhj1nRsfLaI42GCYFXR6NRkfMghIiwtSugkVQD0EXQ3oIpIegh3qIIpAswkLoSvViQZDVkxhR4GXGil4yu2AZOeWMMzajc+tbw1GmYlDT0YcG1uy1z9nn/P9ea+9/r6OEw+GEufypCXP8UyYzqLS0VO/xeAqI1lq667A8bB6WqQ1xiimK0seYNto2o9HY1draGpgWgaKiopW88BBWrQFO5eeCyF3sUnt7u31KBCwWi1lV1bO4e6LGvAwGg3a/3987MjIyGAqFgmKRPKqqTsxgMJgSExOX6HS6lVxeoT0XhsRVJlHX2dnpmJCA1WrdweBG3GzMC0jz8PBwh8/nc09l+snJyRmkwQr4duli33nv/q6uruaYBAoLC2toGmRSDG5xuVwPmbF3OouMqKRCpIwIldENQuhwR0dH418EAD9IcwkLAXre6XS+/m27EOK0tLQ8QrwUfzkvyuFyOpG54Ha7P05ExGQy5ev1+lptchKJK+MEZLER6ucSqtHR0dPMvGfsQR5KzMjIKCGv5XRfQc7GmC+0HtZEAs/5JxsN3rOMiBzD9UGiGBIv9cKIl1wXcNob0eDp6emLyWUN11sGBwePBwIB/3TSMTQ01JOdnX2LCO4mgoJpUQoKCiroPKDT73A4TsAsFBWyzez/i16v1zmT4mc2m0/S5oC7SeVvp1wlnPfHwFNTU02AVxGNczMMLr8QWPciTii0S6S4RDrs7d6xERDYQI5vkmtfPOSXhfsusgAVZZUQWCgdZuoZ3xqKUsjK/hAv/ZcFrLl5QiCodcbaBGbeSJj8s3EYCYHP4iQlJaWNi7jL1RtPULTEqLl9QuCZeCkpKUtn6whma0ewWPQvRJXuaIKzWdRuNqKOqG3T1PW2iho9wbdhi9j7JfFGR4iknhAZ7+ZMeCQpkJrsEBaA0V6Ry3iBZ2ZmLhcV1KRYjvpwJOT9/f2fc3Nzv+OWk4rVLMhP7NVvM1l5EV0ri++I+IDXEPkWuTGec0i0Q0LO/I3kqBgxMrJfe1CrwHSQZXcBXs07q0T80JgaCpPLMQsSjuWtNE1YFvYTTaj/l20ZVZDskLJgUgVJVC24gJmfwt2H/RgYGKiLLjBIkwHp9iJWI5Ew6nQGwpvMbOfjL8LyuZz/TyVZVCTm0wyILkHgKItH8rieduckg/AVuwbJJrvd/jbWIH2sGzBeBXNxe5iRCngl/Ur6w5gcJmbNFI2og/vvp1qWxyTASw5oRN5kZWXVaiF1k5oKm83WFtcPEyrjNQA//eO+7IgtgL+J+6cZQGeiwKWSrUcXLDMNHjMFAIo+9GGPIdMAcHfcvg3/+6/jXwIMAGJk3U2gmnF9AAAAAElFTkSuQmCC);  \
} \
.ui-placeholder-wrap { \
  position: relative; \
  display: inline-block; \
} \
div.ui-placeholder { \
  position: absolute; \
  margin-top:0; \
  top: 0; \
  left: 0; \
  display: inline-block; \
  vertical-align: middle; \
  overflow: hidden; \
  color: #BCBCBC; \
  font-family: 'Trebuchet MS',Tahoma; \
    font-size: 0; \
    height: 23px; \
    padding: 10px 0 0 9px; \
    line-height: 14px; \
  -transition: opacity.1s, font-size.1s; \
    -webkit-transition: opacity.1s, font-size.1s;  \
    -moz-transition: opacity.1s, font-size.1s;  \
    -o-transition: opacity.1s,font-size.1s; \
    -moz-user-select: -moz-none; \
  -khtml-user-select: none; \
  -webkit-user-select: none; \
  user-select: none; \
  opacity:0; \
} \
.ui-placeholder.active { \
  opacity: 1; \
  -transition: opacity.1s, font-size.1s; \
    -webkit-transition: opacity.1s, font-size.1s;  \
    -moz-transition: opacity.1s, font-size.1s; \
    -o-transition: opacity.1s,font-size.1s; \
  font-size: 13px; \
} \
.ui-placeholder-hasome .ui-placeholder.active { \
  opacity:0; \
  font-size: 0; \
} \
  .stickeround, .markeround { \
  position: absolute; \
  height: 100px; \
  width: 100px; \
  cursor: move; \
  text-align: center; \
  display: table; \
  padding:0; \
  box-shadow: 0 1px 4px rgba(121, 121, 121, 0.2); \
  z-index: 2147483592; \
  transition: 1s background-color; \
  transition: 0s border; \
  -webkit-border-radius: 400px; \
  -moz-border-radius: 400px; \
  border-radius: 400px; \
  }\
  .stickeround:hover div.sticker-content, .stickeround.draggin  div.sticker-content{ \
    background: rgba(255, 255, 255, 0.26); \
    -ms-transition: background-color 300ms linear; -webkit-transition: background-color 300ms linear; \
     -moz-transition: background-color 300ms linear; \
     -o-transition: background-color 300ms linear; \
     transition: background-color 300ms linear;  \
     transition-delay:50ms; \
    -webkit-border-radius: 400px; \
    -moz-border-radius: 400px; \
    border-radius: 400px; \
  } \
.stickeround .wcicon.selected, .markeround .wcicon.selected{\
  top:0;left:0;\
}\
.stickeround > .close-sticky{\
  display:block;\
  top:0;\
  right:-10px;\
  width:9px;\
  height:15px;\
  opacity: 0;\
}\
.markeround .close-sticky{\
  top:-7px;right:-14px;display:block;\
} \
.stickeround:hover .close-sticky, .markeround:hover .close-sticky {\
  opacity: 1;\
}\
.selected > div.sticker-content, .stickeround.selected:hover div.sticker-content{\
  background-color:rgba(239, 207, 190, 0.74); \
    -webkit-border-radius: 400px; \
    -moz-border-radius: 400px; \
    border-radius: 400px; \
  } \
.sticker-contentwrap { \
    background-color:rgba(241, 241, 241, 0.8); \
    cursor: text; \
    color: #000;\
    display: inline-block; \
    border:1px solid rgba(255, 255, 255, 0.2); \
    font-size: 14px; \
    padding: 3px 6px; \
    text-align: left; \
    border-radius: 4px; \
  }\
  .marker-content{ \
  cursor: move; \
  width:100%; \
  height:100%;\
  }\
  .sticker-content, .marker-content { \
  overflow: hidden; \
  padding:0; \
  display: table-cell; \
  vertical-align: middle; \
  margin: 0 auto; \
  cursor: move; \
  text-align: center; \
  color: #8F212C; \
  width:100%; \
  -webkit-border-radius: 400px; \
  -moz-border-radius: 400px; \
  border-radius: 400px; \
  border: 2px solid rgba(0, 0, 0, 0.3);\
  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.3);\
  } \
  .dragbox { \
  position: absolute; \
  border: 1px solid #89B; \
  height: 150px; \
  width: 250px; \
  cursor: move; \
  text-align: center; \
  display: table; \
  padding:0; \
  box-shadow: 0 1px 4px rgba(121, 121, 121, 0.2); \
  z-index: 2147483502; \
  transition: 1s background-color; \
  transition: 0s border; \
  }\
  .dragbox:hover div.dragbox-content, .dragbox.draggin  div.dragbox-content{ \
    border:1px dashed rgba(9, 9, 9, 0.16); \
    background: rgba(255, 255, 255, 0.26); \
    -ms-transition: background-color 300ms linear; -webkit-transition: background-color 300ms linear; \
     -moz-transition: background-color 300ms linear; \
     -o-transition: background-color 300ms linear; \
     transition: background-color 300ms linear;  \
     transition-delay:50ms; \
  } \
  .dragbox-contentwrap { \
    background-color:rgba(241, 241, 241, 0.8); \
    cursor: text; \
    color: #000;\
    display: inline-block; \
    border:1px solid rgba(255, 255, 255, 0.2); \
    font-size: 14px; \
    padding: 3px 6px; \
    text-align: left; \
    border-radius: 4px; \
  }\
  .dragbox-content { \
  border:1px solid rgba(255, 255, 255, 0.4); \
  overflow: hidden; \
  padding:0; \
  display: table-cell; \
  vertical-align: middle; \
  margin: 0 auto; \
  cursor: move; \
  text-align: center; \
  color: #8F212C; \
  width:100% \
  } \
  .handle { \
  margin-top: 0; \
  position: absolute; \
  height: 6px; \
  width: 6px;  \
  border: 1px solid #89B; \
  background: #9AC; \
  opacity: .5; \
  }\
.NW, .NN, .NE {\
  top: -4px; \
  } \
.NE, .EE, .SE { \
  right: -4px; \
  } \
.SW, .SS, .SE { \
  bottom: -4px; \
  } \
.NW, .WW, .SW { \
  left: -4px; \
  } \
.SE, .NW {   \
  cursor: nw-resize; \
  } \
.SW, .NE { \
  cursor: ne-resize; \
  } \
.NN, .SS { \
  cursor: n-resize; \
  left: 50%; \
  margin-left: -4px; \
  } \
.EE, .WW { \
  cursor: e-resize; \
  top: 50%; \
  margin-top: -4px; \
  }  \
.dragbox.selected {\
  background-color:rgba(239, 207, 190, 0.74); \
  border-color: #B98; \
  } \
.selected .handle {  \
  background-color: #CA9; \
  border-color: #B98; \
  } \
  :focus { \
  outline:0; \
} \
.wcelement.sticky .SE{ \
  bottom: 3px; \
  right: 3px; \
  width: 0; \
  height: 0; \
  border: 0;\
  border-left: 10px solid rgba(0, 0, 0, 0); \
  border-bottom: 10px solid #939393; \
  background: none repeat scroll 0 0 transparent; \
  opacity: .2; \
} \
.wcelement.sticky:hover .SE{ \
  opacity: .5; \
}\
.wcandrag, .handle{\
  -ms-touch-action:none;\
  touch-action:none;\
  -ms-scroll-chaining:none;\
  -ms-scroll-limit:0;\
  -webkit-perspective:1000;\
  perspective: 1000;\
  -webkit-backface-visibility:hidden;\
  backface-visibility:hidden;\
}\
.wcelement.sticky { \
  width:300px; \
  background:#fdfdbe; \
  box-shadow:3px 3px 10px rgba(95, 92, 61, 0.5); \
  z-index: 2147483592; \
} \
.sticky-scroller {\
  min-height:50px; \
  border-left:3px double rgba(238, 150, 122, .75); \
  margin-left:30px; \
  padding: 5px 3px 3px 5px;\
  margin-top: 0;\
}\
.sticky-content { \
  display: inline-block;\
  resize: none;\
  min-height:50px; \
  width: 100%;\
  height: 100%;\
  overflow-x: hidden;\
  overflow-y: auto;\
  line-height: 1.3em;\
  color: #404040;\
} \
.sticky-content * {\
  color: #404040;\
}\
.sticky-header:hover .close-sticky,  .sticky-header:hover .sticky-status,  .close-sticky:hover, .dragbox:hover .close-sticky, dragdraw-header:hover drawdrag-status, dragdraw-header:hover close-sticky{ \
  color:#606060 \
} \
.sticky.selected { \
  box-shadow:3px 3px 10px rgba(191, 133, 17, 0.5);\
  -webkit-box-shadow:3px 3px 10px rgba(191, 133, 17, 0.5);\
  -moz-box-shadow:3px 3px 10px rgba(191, 133, 17, 0.5);\
} \
.sticky.selected .sticky-header, .dragdraw.selected .dragdraw-header {\
  background-color: #F8FBE2;\
} \
.sticky-header { \
  cursor:move;\
  padding:5px; \
  height:18px; \
  background:#f3f3f3; \
  border-bottom:1px solid #fefefe; \
  box-shadow:0 2px 2px rgba(30, 29, 29, 0.2); \
} \
.sticky-status { \
  color:#B7B7B7; \
  padding:5px; \
} \
.close-sticky { \
  cursor:pointer; \
  color:#ADADAD; \
  line-height:15px;\
  font-size: 17px; \
  padding: 2px 6px; \
  font-family: sans-serif; \
  position: absolute; \
  right: 3px; \
  top: 3px; \
} \
.dragdraw-content > canvas {\
  z-index: 99999; \
} \
.dragdraw-content { \
  width:100%; \
  height:100%; \
  position: relative;\
  margin: 0 auto; \
  overflow:hidden; \
} \
.dragdraw-content .captured { \
display:none; \
position: absolute; \
max-width: 100%; \
top: 0; \
left: 0; \
} \
.dragdraw-content .captured:empty { \
  top: 50%; \
  left: 50%; \
  -webkit-transform: translate(-50%, -50%); \
  -moz-transform: translate(-50%, -50%); \
  -ms-transform: translate(-50%, -50%); \
  -o-transform: translate(-50%, -50%); \
  transform: translate(-50%, -50%); \
} \
.dragdraw-content .captured.blured { \
-webkit-filter: blur(3px);  \
-moz-filter: blur(3px); \
-o-filter: blur(3px); \
-ms-filter: blur(3px);  \
filter: blur(3px); \
filter:progid:DXImageTransform.Microsoft.Blur(PixelRadius='3'); \
} \
[wcelement] .drawdrag-label { \
  margin-top: 9px;\
  font-size: 13px;\
  color: #000;\
  padding:0 5px; \
  display: inline-block; \
  text-align: center; \
  cursor: text; \
} \
.drawdrag-status { \
  font-size: 13px;\
  color:#B7B7B7; \
  padding:0 5px; \
  position: absolute; \
  left: 5px;\
  margin-top: 9px;\
} \
.dragdraw { \
  box-shadow: 0 1px 4px rgba(121, 121, 121, 0.2); \
  box-shadow:0 1px 5px rgba(131, 131, 131, 0.6); \
  position:absolute; \
  top:130px;left:300px;\
  background-color:rgba(255, 255, 255, 0.2); \
  background-color:rgba(220, 220, 220, 0.2); \
  width: 400px; \
  height: 550px; \
  z-index: 2147483503; \
} \
.dragdraw .NW, .dragdraw .NN, .dragdraw .NE {\
  top: -6px; \
  } \
.dragdraw .NE, .dragdraw .EE, .dragdraw .SE { \
  right: -6px; \
  } \
.dragdraw .SW, .dragdraw .SS, .dragdraw .SE { \
  bottom: -6px; \
  } \
.dragdraw .NW, .dragdraw .WW, .dragdraw .SW { \
  left: -6px; \
  } \
.dragdraw .NN, .dragdraw .SS { \
  margin-left: -6px; \
  } \
.dragdraw .EE, .dragdraw .WW { \
  margin-top: -6px; \
  }  \
.dragdraw .wcicon.selected { \
top: 7px; \
left: 8px; \
z-index: 2147483504; \
} \
.selected .drawdrag-status { \
display:none;\
} \
.dragdraw-tools {  \
  opacity: 0; \
  position: absolute; \
  top: 30px; \
  right: -40px; \
  width: 30px; \
  padding-bottom: 5px; \
  background-color: rgba(227, 227, 227, 0.49);\
  border: 1px solid #D3D3D3; \
} \
.dragdraw-tools > div { \
  margin-top: 5px; \
  margin-left: 5px; \
  width: 20px; \
  height: 20px; \
  background-color: rgba(160, 160, 160, 0.0);\
  cursor: pointer;\
  background-repeat: no-repeat; \
  position: relative;\
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAEsCAMAAAD94sMxAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAADAUExURQAAABkZGUNDQxwcHF9fXysrK1RUVEpKSigoKA4ODmFhYaenp4uLi3d3d8/Pz3R0dIGBgenp6f39/WxsbCMjI9ra2uLi4nV1db6+vu7u7kZGRh4eHl5eXpSUlJOTkyQkJKCgoGhoaMvLyxAQEN3d3aGhoTQ0NPf39yEhIUFBQUREREhISMXFxbOzs/r6+re3t15eXri4uP///yUlJbCwsNXV1fDw8Lq6ujIyMuDg4D09Pff3987OzsnJycHBwRkZGcSLr7EAAAAzdFJOUwAF+3r8If3+Ow9m/v774sb+/tP9zeLiRSPhhGHF/LCw/Yi3TcHK8b+ZvKbY4eWixOKHSg0cEEMAAAO2SURBVFjD7ZVbk6o4FEYRAkEIBwK0NAiIeNdWuzsgFxX//7+aJKDST/PQVadmqvxeZC1CINtNEIR+Bpr1g4Xp9aeYFmfjB2dnDPqcnHHVE9OIshU8WEPnKjd6rBj51Xnw1BSzCIAnN+cKFMqDteh8PkX1+HF9iM8YV5/P+fRTVVXJ8wIlp9EVuWMVFI2OwFa9DxDFnbgJVOG/kndDMd777FiZAd77rBuGogyfnAAIHSi2Y973lMW6rEENOf+pMKjLkpBSubV8Pl9qQm43SMqOT6drebuJ5Obd+XQqCGfhztWlKBkL1zvnBWIsfFRUYMY6Z0H+yOn5/MHU7PPqcikS77EOea/reo8FYTgcyvIvq/dt06y+H7yy55me5fjQ8cHeJ7EkTff42FbLPkZS6tu2d8RTPuAQBam9SCrs+Yg9jb03x/YCjwOMbDRjAgWqjXz9y0d+K6yxbCcp9r+uc4uLaDY44DiOrv7CZOJwDWhdse+PFlbAxDcOh4JnIoSMYMzu8j7CtAXlsSRJM3lgM1Nh9j7SogwHK9uhx16D+cq+D/bKYkLwogb7bMEL61Nq2zswLRojpPN0VVXZpGzae8fwOdm0vyn0bFIupb6YJFlS9qaU68JCyyerMyUynMmDx6IIDAc+59gBoCiKWN7f7S+klLUIoeh2osCnPHHEsja7AZcTfbWr6pIVLTe0B3nyjIsM48uV5ZLvuYiv9AKm8uuiLU6cFQ09TVvV62ojT+MF7Uw97pVLZvldvf4lA1kdSu4kkOXuLqq7WW/n811oBipXs9De7Fapaceuy0ukblZzd56afqxpvKzyerrapGnom28+E+raDf10Pj/65h8u3Dh0U58lbUe4o5EZj9rMmZjEo7e0E6bEHyN+6zJ3+SY5fhhzzR9sQM0fltS976Jj98iEub7XcDhZcPHct2fHD5rFc9/1TB75L2+3Bfuvi54wICSE3E2RZZxJVBQNZUQghAAh5iCigtQQRk3RFFaZQIWKsoZOExGiF0BXWkEvZsMbAxIuCEFMOI1DuKDHSqOLTpaRhyBW0TSZ0wmDGWjxH4J4b/fyN+s1ULdL+jGZqF2fDiSAHJF+b4jUmsCKwkDTgmVd8ndbdaKQfZm8HS0E+7u3iLMWguWyZE2nGFPOzk5d14QeQqC1rAkaFyKkR6GxY7oVdeC1LGxLJra1+Gl8au19ePPXCoDsdt5GLHmXSRDs1oG2/VRqqXv0Glh0BwaldF+Mul5CuHws7pVXXnnllVdeeeWVV/7P+Qepy4MkDYuM6wAAAABJRU5ErkJggg==); \
} \
.dragdraw-tools > div:hover { \
  background-color: rgba(160, 160, 160, 0.3);\
} \
.dragdraw-brush { \
  background-position:  2px 2px;\
} \
.dragdraw-erase { \
  background-position:  2px -20px;\
} \
.dragdraw-animate { \
  background-position:  2px -40px;\
} \
.dragdraw-clear { \
  background-position:  2px -60px;\
} \
.dragdraw-grab { \
  background-position:  2px -80px;\
} \
.dragdraw-shot { \
  background-position:  2px -100px;\
} \
.dragdraw-clearall { \
  background-position:  2px -120px;\
} \
.dragdraw-tools > div.activetool { \
background-color: rgba(150, 150, 150, 0.8); \
} \
.dragdraw-header {  \
    z-index: 999998; \
    opacity: 0; \
    top: 0; \
    position: absolute; \
    background: none repeat scroll 0 0 #F3F3F3; \
    border-bottom: 1px solid #FEFEFE; \
    box-shadow: 0 2px 2px rgba(30, 29, 29, 0.2);\
    cursor: move; \
    height: 30px; \
    padding: 0; \
    width: 100%; \
    display: table-cell; \
    margin: 0 auto; \
    text-align: center; \
    vertical-align: middle; \
}  \
.wc-tip-black { \
  visibility: hidden; \
  position:absolute; \
  opacity:1; \
  z-index:1000; \
  text-align:left; \
  border-radius:4px; \
  -moz-border-radius:4px; \
  -webkit-border-radius:4px; \
  padding:5px 6px; \
  max-width:200px; \
  color:#DDD; background-color:#4E4E4E; \
  border: 1px solid #1C1C1C; \
  -moz-box-shadow: 0 1px 4px rgba(0,0,0,0.3); \
  -webkit-filter: drop-shadow(0 1px 4px rgba(0,0,0,0.3)); \
  filter: drop-shadow(0 1px 4px rgba(0,0,0,0.3)); \
  font:bold 12px/14px sans-serif; \
} \
.wc-tip-black :after, .wc-tip-black :before { \
  left: 100%; \
  border: solid transparent; \
  content: ' '; height:0; \
  width: 0; \
  position: absolute; \
  pointer-events: none; \
} \
.wc-tip-black :after { \
  border-color: rgba(78, 78 78, 0); \
  border-left-color: #4E4E4E; \
  border-width: 5px; \
  top: 50%; \
  margin-top: -5px; \
} \
.twc-tip-black:before { \
  border-color: rgba(67, 77, 84, 0); \
  border-left-color: #1C1C1C; \
  border-width: 6px; \
  top: 50%; \
  margin-top: -6px; \
} \
.wc-tip-black.tip-left :after, .wc-tip-black.tip-left :before { \
  left: auto; \
  right: 100%; \
} \
.wc-tip-black.tip-left :after { \
  border-color: transparent; \
  border-right-color: #4E4E4E; \
} \
.twc-tip-black.tip-left:before { \
  border-color: transparent; \
  border-right-color: #1C1C1C; \
} \
img.wccanselect, .dragdraw.grab { \
  -webkit-transition: all 0.30s ease-in-out; \
  -moz-transition: all 0.30s ease-in-out; \
  -ms-transition: all 0.30s ease-in-out; \
  -o-transition: all 0.30s ease-in-out; \
  outline: none; \
  box-shadow: 0 0 3px 2px rgba(139, 121, 12, 0.4);\
} \
.dragbox:hover span.wcmagnet { \
  opacity:0.8; \
} \
.dragdraw .wcmagnet { \
  right: -31px; \
  top: 7px; \
  opacity:1; \
} \
.wcmagnet { \
  opacity: 0; \
  display:none; \
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAgxJREFUeNqcU01LG1EUvS+TaONoog1kRqkasxMRVEpsS1fdCH5Ad130B/gHXLhwoXsRBBHjXoMrBRfixqUtpcWFLZFCm8bUkZivEZmvjON4byZRYxIXHri8N/ece959b95jtm0DYYMx4HB0AbQxgCmcjmGEwcFfjH1U7t4AXFn48blc54ZqdNqMLfa8e/2m720kyPvbWyipXMpDiS/f3icPv0+Abc9g6rxSwB500MYYiw5/+vhB6O4R9HShyvmF0AHp1Gn6aGvnAGumsYOrqg6wtanQ6MioPygKF39SN7/icSmRTOaJ6+vtfTnQ39/lfyUK3aj59/UHbXETnC07wH2NdQ4NBjOJ/3B0fCz9jMdjiqqOU9CccsSRxnLOBx4bhJmLa1FVFU5TKVp5GeOsHMuUI4401v3h3htcA3hN03TpKNJ13SwXVnBGOeKKRtFF2noGcK2oYOk6NAJxlqaVtHUNmKpBE67SCMSRpqFBs6IA/4QBcaSpa0CbbtYNaDWMhgbEkcZ8kLu7B9uRSHR8ZW395OQC9pbmYjzPl/I+n680SpK0Prm6Gv0tabBTnInNPjbI5/N3rrIsmxoeVukaY8uEQqFgV3icmzUdZLNZbyAQAJ5XIJfLuTmOcwRuR4K/0SuKInISZDIZd42BYRhyKBRawPfAPB5PDgfnsZRHy7KIn8dvjviax/Rc3AowAJLO/Bu3+ARvAAAAAElFTkSuQmCC); \
  width: 17px; height: 17px;\
  position: absolute; \
  bottom: 7px; \
  right: 7px; \
  cursor: pointer;\
  background-repeat: no-repeat; \
  background-position: center; \
} \
.clearfix{*zoom:1;}.clearfix:before,.clearfix:after{display:table;content:'';line-height:0;}\
.clearfix:after{clear:both;}\
.hide-text{font:0/0 a;color:transparent;text-shadow:none;background-color:transparent;border:0;}\
.popover {\
  position: absolute;\
  top: 0; left: 0;\
  max-height: 240px;\
  width: 220px;\
  display: none;\
  box-shadow: 0 0 3px 0 rgba(88, 88, 88, 0.5);\
  z-index: 2147483595;\
}\
.popover.wider {\
  width: 260px;\
}\
.popover.large {\
  width: 470px;\
  max-height: 350px;\
}\
.popover .arrow, .popover .top-arrow {\
  position: absolute;\
  top: 0; left: 50%;\
  margin: -15px 0 0 -8px;\
  width: 0; height: 0;\
  border-top: 8px solid transparent;\
  border-left: 8px solid transparent;\
  border-right: 8px solid transparent;\
  border-bottom: 8px solid #3A3737;\
}\
.popover .bottom-arrow {\
  top: 100%; left: 50%;\
  margin: 0 0 0 -8px;\
  border-top: 8px solid #3A3737;\
  border-bottom: 8px solid transparent;\
}\
.popover .left-arrow {\
  top: 50%; left: -15px;\
  margin: -8px 0 0;\
  border-right: 8px solid #3A3737;\
  border-bottom: 8px solid transparent;\
}\
.popover .right-arrow {\
  top: 50%; left: 100%;\
  margin: -8px 0 0;\
  border-left: 8px solid #3A3737;\
  border-bottom: 8px solid transparent;\
}\
.popover .wrap {\
  border: 1px solid #3A3737;\
/*  border-radius: 4px;\
  -moz-border-radius: 4px;\
  -webkit-border-radius: 4px;\
*/}\
.popover .wrap > .title {\
  background-color: #3A3737;\
  color: #DCDCDC;\
  font-size: 16px;\
  line-height: 17px;\
  text-align: center;\
  padding: 6px 0;\
}\
.popover .content {\
  background: #FFF;\
  padding: 10px;\
  max-height: 200px;\
  overflow: auto;\
  font-size: 13px;\
  line-height: 19px;\
  box-shadow: 0 0 2px rgba(78, 78, 78, 0.5) inset;\
}\
.popover .content b {\
  font-weight: bold;\
}\
.popover .content p {\
  margin: 0;\
}\
.popover.large .content {\
  max-height: 285px;\
}\
.popover .close-sticky{\
  right:4px;top:6px;\
}\
.popover .close-sticky:hover{\
  color:#fff;\
}\
.spellchecker-suggestbox{text-align: left;position:absolute;display:none;z-index:999999;overflow:none;font:normal 13px arial;box-shadow:0 0 4px #aaa;background:#fff;border:1px solid #bbb;display:none}\
.spelling-label{ \
  width:100%; height:100%; background-position: center;background-repeat: no-repeat; \
  background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwBAMAAAClLOS0AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAwUExURQAAAP///////////////////////////////////////////////////////////ztNBDAAAAAQdFJOUwAUcs61XqMnljVSQoX97AZSv6Z0AAAB00lEQVQ4y2NggIKqY85v75nkLGdABYxrXHqUQkOVTricEkARj2g7uh0owlgdk9GKJMM4yUUTxgYyETJSaYEIVaJpC+EaVNQ/ICT4i5xgWopSC5AtZA9Th2rQWI/qxF9NEC1CWWhuZ1imCNawJB5d4qsXSAtnUgG6BLvaBJBJ6QwYoAxkVkg8psRXV6AVLQKYEoweAgxcTQxYgMYCBp5MbBLTDjCUnAezOgQYJDpaGRgqjMEK/7gzLAkAMbiNAxgmOzkrMDof8gbxWb0YTmwAMZiMGxgmNwg7sBpBjOLuYcgBe4/FzRAswWEJ9eIxBkgYC6taM0zOVFZgMYTFBIMROCqCVxoxTDY2KWA2gEaKMsNTMOOwgAlQR7ADTAdDHMNVMO1sbCwwuYHNEmYHQyxEgt0itHnD5AYOSyZTuATYKC5Ths0KkxMWG3KaTFgONQpsOZMlg3DDZGPjBQzKxqZQy8HOZZ/IwFnAOXMikBW6EOrcnAJsgQj0ICRIkAE/JEjAgViFpI19JSQQwcG+Lns3HEx7Cgl2cESJ3HsHB2+9IREFjlrG3LtwcEceErU4EwPO5IM7weFMojgTNc5sgDvj4MxquDMnzuyMuwDAWWTgLmSwFEsAnDehtjtu9iUAAAAASUVORK5CYII=);\
}\
.spellchecker-suggestbox .spellchecker-loading{padding:3px 6px;font-style:italic;height:200px}\
.spellchecker-suggestbox a{outline:0;cursor:pointer;color:#333;padding:3px 6px;display:block;text-decoration:none}\
.spellchecker-suggestbox a:hover{color:#000;background:#ddd}\
.spellchecker-suggestbox .spellchecker-footer{border-top:1px solid #ddd}\
.spellchecker-word-highlight{color:red;cursor:pointer;border-bottom:1px dotted red; padding: 1px 2px;}\
.wc-words-removed{color:red;cursor:pointer;border-bottom:1px solid red; padding: 1px 2px;-webkit-border-radius: 5px;-moz-border-radius: 5px;border-radius: 5px;}\
.wc-words-added{text-decoration: none;color:green;cursor:pointer;border-bottom:1px solid green; padding: 1px 2px;-webkit-border-radius: 5px;-moz-border-radius: 5px;border-radius: 5px;}\
.spellchecker-incorrectwords{display:none}\
.spellchecker-words > em {padding:2px 4px}\
.spellchecker-incorrectwords a{display:inline-block;margin-right:.5em}\
.spellchecker-button-icon{background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAHtSURBVDjLY/j//z8DJZiBKgY49drM9J3idhLEtu+xjvea4nLNqsVspnWr2S6QmF6+Zol2ltpq5QSlmcpxijMxDABp9pjkuMuu28rIpsMi3rLZFKzIus38mm6OuqRxpf41nC5w7rOJd+i1ngnUXGLTbj7Tsskk3rbL8ppZreEu7Ry1mWpJSvHK8Uoz0TWK5U/nYIg8y8rgPsl+l12P1WqgbTPdJtk/AtoWb1CkBdagnqyyWilawVM/Rw/FBQyx540ZGm/eYIg8P43BdYLdSZiEcYXeTJB/TaoNroH8q5OldVIhXE5SKUqhXSNRfZdKvPKVkOrED+L9d/8wN998w+B4XIL40I48K8FQf/O6+7In/7mbb35hsD2qjBKNDLU3ExjKb7pi1Rx61ke89+6fwBVP/jPXXn/HYHlYGiMdMJTe1JJc/PgHQ/X1xQyplznBYuFnmRiiz062nPfof8DSJ/8ZSq8/ZzA9KIEzIQE1Vvuuf/6fufv2M4bgsz4MxVdPui8Cal4C1Jx/+RGDPqpmTANiz7MAvXI+bO2L/5ZzHvzP2Pjif8DCx/8ZMi/fY9DcL0FUUmbwPKkg3Hr7T+WOV//95j/8z5B6/jaD6l4JkvIC0J9FTtPu/2dIPn+PQXG3BFmZiUFzbweDLH7NVMmNAOGld33BRiNUAAAAAElFTkSuQmCC)!important;background-repeat:no-repeat;background-position:center center}\
.spell-word-error{color:green;cursor:pointer;border-bottom:2px solid green; padding: 1px 2px;-webkit-border-radius: 5px;-moz-border-radius: 5px;border-radius: 5px;text-shadow:0 1px 0 rgba(0, 255, 0, 0.3)}\
.highlight-words{ background-color: #fff34d; border-radius: 5px;  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.7); padding:1px 4px; margin:0 -4px;}\
body ul.wcerrlist { list-style:none; margin:0;padding:0;cursor:pointer;line-height:17px;}\
.wcerrlist .wchide{ display:none; }\
.wcerrlist pre {background-color: #EDEDED;white-space: pre; white-space: -pre-wrap; white-space: -o-pre-wrap; white-space: -moz-pre-wrap; white-space: -hp-pre-wrap; white-space: pre-wrap; word-wrap: break-word; font-size:12px;margin: 3px 0 10px 0}\
.wcerrlist li > b { color:red}\
.popover .content .wcerrlist li > p {color:#785309; font-size: 12px;font-style: italic; padding:0; margin: 5px 0 0 0; line-height: 17px}\
pre .comment, pre .template_comment, pre .diff .header, pre .javadoc { color: #998; font-style: italic }\
pre .keyword, pre .css .rule .keyword, pre .winutils, pre .javascript .title, pre .nginx .title, pre .subst, pre .request, pre .status { color: #333; font-weight: bold }\
pre .number, pre .hexcolor, pre .ruby .constant { color: #099; }\
pre .string, pre .tag .value, pre .phpdoc, pre .tex .formula { color: #d14 }\
pre .title, pre .id { color: #900; font-weight: bold }\
pre .javascript .title, pre .lisp .title, pre .clojure .title, pre .subst { font-weight: normal }\
pre .class .title, pre .haskell .type, pre .vhdl .literal, pre .tex .command { color: #458; font-weight: bold }\
pre .tag, pre .tag .title, pre .tag .keyword { color: #000080; font-weight: normal; background-color:none}\
pre .attribute, pre .variable, pre .lisp .body { color: #008080;background-color:none}\
pre .regexp { color: #009926 }\
pre .class { color: #458; font-weight: bold }\
pre .symbol, pre .ruby .symbol .string, pre .lisp .keyword, pre .tex .special, pre .prompt { color: #990073 }\
pre .built_in { color: #0086b3; background-color:none }\
pre .preprocessor, pre .doctype, pre .shebang, pre .cdata { color: #999; font-weight: bold } \
pre .deletion { background: #fdd }\
pre .addition { background: #dfd }\
pre .diff .change { background: #0086b3 }\
pre .chunk { color: #aaa }\
.hint:before,.hint:after,[data-hint]:before,[data-hint]:after{position:absolute;-webkit-transform:translate3d(0,0,0);-moz-transform:translate3d(0,0,0);transform:translate3d(0,0,0);visibility:hidden;opacity:0;z-index:1000000;pointer-events:none;-webkit-transition:.3s ease;-moz-transition:.3s ease;transition:.3s ease}.hint:hover:before,.hint:hover:after,.hint:focus:before,.hint:focus:after,[data-hint]:hover:before,[data-hint]:hover:after,[data-hint]:focus:before,[data-hint]:focus:after{visibility:visible;opacity:1}.hint:before,[data-hint]:before{content:'';position:absolute;background:transparent;border:6px solid transparent;z-index:1000001}.hint:after,[data-hint]:after{content:attr(data-hint);background:#3A3737;color:#DCDCDC;text-shadow:0 -1px 0 #000;padding:8px 10px;font-size:12px;line-height:12px;font-family:arial,sans-serif;white-space:nowrap;box-shadow:0 0 3px 0 rgba(88, 88, 88, 0.5)}.hint--top:before{border-top-color:#383838}.hint--bottom:before{border-bottom-color:#383838}.hint--left:before{border-left-color:#383838}.hint--right:before{border-right-color:#383838}.hint--top:before{margin-bottom:-12px}.hint--top:after{margin-left:-18px}.hint--top:before,.hint--top:after{bottom:100%;left:50%}.hint--top:hover:after,.hint--top:hover:before,.hint--top:focus:after,.hint--top:focus:before{-webkit-transform:translateY(-8px);-moz-transform:translateY(-8px);transform:translateY(-8px)}.hint--bottom:before{margin-top:-12px}.hint--bottom:after{margin-left:-18px}.hint--bottom:before,.hint--bottom:after{top:100%;left:50%}.hint--bottom:hover:after,.hint--bottom:hover:before,.hint--bottom:focus:after,.hint--bottom:focus:before{-webkit-transform:translateY(8px);-moz-transform:translateY(8px);transform:translateY(8px)}.hint--right:before{margin-left:-12px;margin-bottom:-6px}.hint--right:after{margin-bottom:-14px}.hint--right:before,.hint--right:after{left:100%;bottom:50%}.hint--right:hover:after,.hint--right:hover:before,.hint--right:focus:after,.hint--right:focus:before{-webkit-transform:translateX(8px);-moz-transform:translateX(8px);transform:translateX(8px)}.hint--left:before{margin-right:-12px;margin-bottom:-6px}.hint--left:after{margin-bottom:-14px}.hint--left:before,.hint--left:after{right:100%;bottom:50%}.hint--left:hover:after,.hint--left:hover:before,.hint--left:focus:after,.hint--left:focus:before{-webkit-transform:translateX(-8px);-moz-transform:translateX(-8px);transform:translateX(-8px)}.hint--error:after{background-color:#b34e4d;text-shadow:0 -1px 0 #592726}.hint--error.hint--top:before{border-top-color:#b34e4d}.hint--error.hint--bottom:before{border-bottom-color:#b34e4d}.hint--error.hint--left:before{border-left-color:#b34e4d}.hint--error.hint--right:before{border-right-color:#b34e4d}.hint--warning:after{background-color:#c09854;text-shadow:0 -1px 0 #6c5328}.hint--warning.hint--top:before{border-top-color:#c09854}.hint--warning.hint--bottom:before{border-bottom-color:#c09854}.hint--warning.hint--left:before{border-left-color:#c09854}.hint--warning.hint--right:before{border-right-color:#c09854}.hint--info:after{background-color:#3986ac;text-shadow:0 -1px 0 #193b4d}.hint--info.hint--top:before{border-top-color:#3986ac}.hint--info.hint--bottom:before{border-bottom-color:#3986ac}.hint--info.hint--left:before{border-left-color:#3986ac}.hint--info.hint--right:before{border-right-color:#3986ac}.hint--success:after{background-color:#458746;text-shadow:0 -1px 0 #1a321a}.hint--success.hint--top:before{border-top-color:#458746}.hint--success.hint--bottom:before{border-bottom-color:#458746}.hint--success.hint--left:before{border-left-color:#458746}.hint--success.hint--right:before{border-right-color:#458746}.hint--always:after,.hint--always:before{opacity:1;visibility:visible}.hint--always.hint--top:after,.hint--always.hint--top:before{-webkit-transform:translateY(-8px);-moz-transform:translateY(-8px);transform:translateY(-8px)}.hint--always.hint--bottom:after,.hint--always.hint--bottom:before{-webkit-transform:translateY(8px);-moz-transform:translateY(8px);transform:translateY(8px)}.hint--always.hint--left:after,.hint--always.hint--left:before{-webkit-transform:translateX(-8px);-moz-transform:translateX(-8px);transform:translateX(-8px)}.hint--always.hint--right:after,.hint--always.hint--right:before{-webkit-transform:translateX(8px);-moz-transform:translateX(8px);transform:translateX(8px)}.hint--rounded:after{border-radius:4px}.hint--bounce:before,.hint--bounce:after{-webkit-transition:opacity .3s ease,visibility .3s ease,-webkit-transform .3s cubic-bezier(0.71,1.7,.77,1.24);-moz-transition:opacity .3s ease,visibility .3s ease,-moz-transform .3s cubic-bezier(0.71,1.7,.77,1.24);transition:opacity .3s ease,visibility .3s ease,transform .3s cubic-bezier(0.71,1.7,.77,1.24)}\
.wcsettingwrap, .wchistorywrap {height:100%;\
  // overflow: hidden;\
  padding:0;\
  background-color:#111;\
  color:#D3D3D3;\
  font-family:arial,sans-serif;\
  }\
  .wcsettingwrap div, .wchistorywrap div, .wcsettingwrap p, .wchistorywrap p {\
  color:#D3D3D3;\
  font-family:arial,sans-serif;\
  }\
 .wcsetgroup {\
  border-top: 1px solid #000;\
  border-bottom: 1px solid #000;\
  margin: 0 0 10px;\
  padding: 5px 5px 5px 10px;\
  background-color: #222;\
  font-size: 14px;\
 }\
 .wcsetstitle {text-align: center;margin: 10px 0;\
  background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAYBAMAAAD9m0v1AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAwUExURQAAANLS0tLS0tHR0dLS0tPT087Ozs/Pz9LS0tLS0tLS0tLS0tDQ0NDQ0H9/f9DQ0OxBlOQAAAAQdFJOUwCC11F0+hAikePDYCUZAjvyAu/zAAAAwElEQVQY02NgAAIe1aADDHDA0sDhAGNbXGAUYBTgbYZIKM75JcC4/qQQWHrTha0qCWxO0bzKIF4jA/sDBga+AgYJEK9yA0Q793QQyR7DwLxylgHD0QIQj1+PodMsWZHh0Qcgp1DKgXkaA0OmActCcQYGDZcELgMGBuYFbC5NDAwBDAysCQwMbCAanachCFMpCFRZ4uXArMbAkGTAssQdYoMk3Aaw7UujYLajugzV1ag+QvUtakighRIwBKdGQkIQAGkdNfWR5fDvAAAAAElFTkSuQmCC);\
  background-repeat:no-repeat;background-position:15px 3px; padding:6px;\
  }\
 .wcsclose {position:absolute;top:0;right:5px;padding:8px;font-size:14px;cursor:pointer;font-weight:bold;font-family:sans-serif;z-index:9999}\
 p.wcstitle{\
  padding: 5px 0 0 10px;\
  margin: 0;\
  text-align: left;\
  font-weight: bold;\
  font-size: 11px;\
  text-transform: uppercase;\
 }\
 .wcdd-wrap {\
    position: relative;\
    width: 230px;\
    padding: 8px;\
    color: #fff;\
    outline: none;\
    cursor: pointer;\
    font-weight: bold;\
}\
.wcdd-wrap:after {\
    content: '';\
    width: 0;\
    height: 0;\
    position: absolute;\
    right: 16px;\
    top: 50%;\
    margin-top: -3px;\
    border-width: 6px 6px 6px;\
    border-style: solid;\
    border-color:transparent;\
    border-top-color: #fff;\
}\
.wcdd-wrap.active:after {\
  border-color: transparent;\
  border-width: 6px 6px 6px;\
  margin-top: -8px;\
  border-bottom-color: #3E3E3E;\
}\
.wcdd-wrap .dropdown {\
    display: none;\
    margin: 0;\
    padding: 0;\
    position: absolute;\
    top: 100%;\
    left: 0;\
    right: 0;\
    background: #DFDCDC;\
    font-weight: normal;\
    opacity: 0;\
    pointer-events: none;\
}\
.wcdd-wrap .dropdown li a {\
    display: block;\
    text-decoration: none;\
    color: #3E3E3E;\
    padding: 8px 10px;\
}\
.wcdd-wrap .dropdown li:hover a {\
    background: #FFF;\
    color: #000;\
}\
.wcdd-wrap.active .dropdown {\
    opacity: 1;\
    pointer-events: auto;\
    z-index: 10;\
}\
.wcdd-wrap.active {\
background: #6F6F6F;\
background: linear-gradient(to right, #6F6F6F 0%, #555555 202px, #DFDCDC 202px, #DFDCDC 100%) repeat scroll 0 0 transparent;\
}\
.wcswitch.large {\
  font-size: .75em;\
}\
.wcswitch input {\
display: none;\
cursor: pointer;\
height: 100%;\
position: absolute;\
width: 100%;\
}\
.wcswitch { \
font-size: 10px;\
height: 2.75em; \
position: relative; \
width: 6em;\
line-height: 1em;\
overflow: hidden;\
float:right;\
margin-right: 15px;\
margin-top: 4px;\
cursor: pointer;\
}\
.wcswitch label {\
cursor: pointer;\
background: #000;\
border-radius: 2px;\
display: block;\
height: 100%;\
position: relative;\
width: 100%;\
-moz-transition: background-color .2s;\
-ms-transition: background-color .2s;\
-o-transition: background-color .2s;\
-webkit-transition: background-color .2s;\
transition: background-color .2s;\
}\
.wcswitch label div {\
background: #3A3A3A;\
border-radius: 2px;\
display: block;\
height: 2.25em;\
left: .25em;\
position: absolute;\
top: .25em;\
width: 2.5em;\
z-index: 5;\
-moz-transition: 0.15s cubic-bezier(0.175, 0.285, 0.2, 1.275) all;\
-ms-transition: 0.15s cubic-bezier(0.175, 0.285, 0.2, 1.275) all;\
-o-transition: 0.15s cubic-bezier(0.175, 0.285, 0.2, 1.275) all;\
-webkit-transition: 0.15s cubic-bezier(0.175, 0.285, 0.2, 1.275) all;\
transition : 0.15s cubic-bezier(0.175, 0.285, 0.2, 1.275) all;\
}\
.wcswitch label div:before {\
background: #797979;\
bottom: 0;\
box-shadow: -.33em 0 0 0 #797979, .33em 0 0 0 #797979;\
content: '';\
display: block;\
height: 32%;\
top: 0;\
left: 0;\
margin: auto;\
position: absolute;\
right: 0;\
width: 5%;\
-moz-transition: all .2s;\
-ms-transition: all .2s;\
-o-transition: all .2s;\
-webkit-transition: all .2s;\
transition: all .2s;\
}\
.wcswitch:hover label div:before {\
-moz-transition: all .2s;\
-ms-transition: all .2s;\
-o-transition: all .2s;\
-webkit-transition: all .2s;\
transition: all .2s;\
}\
.wcswitch span {\
font-size: 1.5em;\
position: relative;\
line-height: 1em;\
z-index: 2;\
}\
.wcswitch input:checked+label {\
background: #E8E8E8; transition: background-color .2s;\
}\
.wcswitch input:checked+label div {\
left: 3.25em;\
background: #525252; transition: background-color .2s;\
}\
.wcswitch input:checked+label div:before {\
background: #797979; \
box-shadow: -.33em 0 0 0 #797979, .33em 0 0 0 #797979;\
}\
.wcoptitle {\
float: left;\
font-weight: bold;\
padding: 10px;\
color: #666;\
}\
.wcoptitle.inputinside {\
padding: 4px;\
}\
.wcoptitle.selected .wcinput {\
  color: #FFF;\
}\
.wcinput {\
  font-size: 13px;\
  cursor: text; \
  display: block; \
  max-width: 120px;\
  min-height:15px;\
  text-align: left;\
  color: #696969;\
  margin: 0;\
  padding: 5px;\
  background: #151515;\
  border: 1px solid #000;\
  font-family: arial,sans-serif;\
  border-radius: 3px;\
  text-transform: uppercase;\
  overflow: hidden;\
  outline:0px solid transparent; \
}\
.wcinput.edit {\
  color: #EDEDED;\
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.3) inset, 0 0 3px #CDCFD0;\
  outline-color: -moz-use-text-color;\
  outline-style: none;\
  outline-width: 0;\
}\
.wcoptitle.selected { color: #FFF;}\
.wcswitch .icon-ok, .wcswitch .icon-remove {background-image:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAA8BAMAAACUWIdlAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAwUExURQAAADIyMicnJzExMTIyMi4uLjIyMjExMTExMTIyMjExMTExMTIyMjMzMzIyMi8vL468ehsAAAAQdFJOUwDMDYCmJsBNszMammBzjUAL2QBzAAAAh0lEQVQoz2NgIBlop8JYTI5iClCmiqBgAIguNGAwFBQGsTgFhZkFBQ1ATHZBwUaIIANQFirIwACUFoabJOgEM1VFRAFuwSQGGgOuTwycE+D2ForDHLldUHABmHkQ6F4xuHsFYX5/CPUvAwNrItxDYUAFsjATJBAmFDlKQER50xm0WxlGAX4AAGbxEpdDi4fgAAAAAElFTkSuQmCC);\
background-repeat:no-repeat;\
width:18px;height:18px;\
display: block;\
z-index: 2;\
position: absolute;\
top: 5px;\
}\
.wcswitch .icon-ok {\
  left: 6px;\
}\
.wcswitch .icon-remove {\
  right: 6px;\
  background-position:0 -20px;\
}\
#wcnoedit { \
  display: none;\
  background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4BAMAAADLSivhAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAwUExURQAAAP8AAP8AAOMAAP8AAP8AAOgAAP8AAPwAAKYBAfAAAP8AAKcBAf8AAKcCAr8CAgpu7IAAAAANdFJOUwDyvCvckhNKWpM6c+CQA4NzAAAEa0lEQVRYw+1Zz2sTQRReGpK2UQIVlF4CsdreCkWKeKg9WOxFCm0RFKSy1oJQeuhFK4hQUBEPlZ4ELyGH4kEpeFAEIdccCxtTWgzBQy8GwvYvqJjN7sy8N+/NbsJ4ETog2N358s37/eat45yu/309fLZ4eai9box+u9ojdPXVXEOu2t0PvWAfjzfQqt7pGppdbJA1WuoOO3Cxwaxzm91gH4032FV9koztN2Db6PUkbGqpYVz7EwngL42YdSsee6URuy7FKnouHlyLU7kmsDc0lNfENmOXEcvIvdcbG0+/jqDTjJmwGbDNG30hHl9bBPQ11wCeBDb9Dl98ArafMbiHIj6vhdHqgqJeTyC+Sc6WuR1PrSQ+z8iVWYiVekXKy0ZfVso9y7wVL73PvErOyB+n79LSSOtJxpgnr7akRoZNbiDOdkhCUdnJIw6c+TgBD1fTQ7MPuKD+y5mi778L/lOONhS0DWXowBr1lN9e20HQRX5a106NogdTp/YCcNNVFN4Er2uGukPs+xWwDet7F4MPCbHvt1zlDD9ZD2EUHhGHUi8zftIfYV4y1BLcBLpZp4aqK2tvkmOH1GVqrC3xaDKO+kjRHBKRvZKTjaMOzp3N60JHT4LUuKN5+Jv2v+kI3FIJ1ivpVr4Q/A6mzgaCpsS5A994oFt6BTzAUk93ziqkLikilRGeh0dxcXi1qTN7PqQOmDOhiAdaoYiqwQ6gPhupKZLaJZtllEc+J6Vuu1kxMm9Kalt4clWkwSw2vFL4oMRMi9CQlhbqHsCWVVLfl54V2LrlcrvTWpBKhf9SzjEliIV7zyNLVZl89gdQt1zkjsJW1/XcssNRV3DG+oHMfADclaN2HXZ7mRQwTmrtZR35SIHN4opaC/59pIGC0yV1H9LvOM2I2RjqNAKHG3Fx1BW+rZfLWvRXnuQ0mRIFdZO88iBYq6xrJ4i6AsH5JHDxGFK33F7A7XiC1EdOL+C3vg+pS72As4Gcivq30wu4E/uKupAEhqbKhGn+hK/X2FTESdZCxzjm6zV2EuKexSjV8tRpxrcL0E4aNWqQcGAsmcA8NQ5JkgyKhBpKjZMBSUPx1Hg7SYDx1DgB4tQ7yFMPa53ALJv0c9uQupXXFa4lfVxAck1IfUS6FK3c4EKX8yF1iTRIWqHDJTbnA+qmQxokrcTiep3zAfU26VL04o7aigAsqZsOaZBIWwEbmgAsqSukS6ENDWilQnBEHeU9JDVppUATF4Ij6iO9cm0yTZxqHwU4pC45pEGi7aNqXAW4Q/2eVC5vs88UomFs5GhFVtQHTMvcDy4eOVqRgdRMsy6uCWMK3DTdy+l1clc9zPmx1MwFJW28Y+pSM9tS/F2NaxXopUze1YxTFCh13XARNVJDqQumd/PJ1OQKLC/fVTdR6kPztX/GRF02X/vVddI0cMibBw52ow6rIYvVeKfbwVLp34+07IZpVmM8uwGi3ejSamhqN661GxRbjajthuN2Y3m7DwJ2nyIsP4LYfX45Xab1F1Fxl3B5+1yEAAAAAElFTkSuQmCC);\
  background-position:center;\
  background-repeat:no-repeat;\
  background-size: contain;\
  position: absolute;\
  pointer-events: none;\
}\
.wchighlighted { \
  border: 1px solid rgba(14, 14, 14, .2);\
  border-radius: 3px;\
  box-shadow: 2px 2px 5px -1px rgba(111, 111, 111, 0.4), inset 0 0 1px #FFF;\
  margin: 0 -1px;\
  padding: 0;\
  position: relative;\
  /*background: linear-gradient(to bottom, #FFE9AE 0%,#FFD600 5%,#FFCD03 95%,#FFDE84 100%);*/\
}\
.wchighlighted:hover, .wchighlighted:active{ \
  padding: 1px 0;\
  z-index: 999999;\
  border: 1px solid rgba(122, 122, 122, 0.8);\
}\
.wc-text-edit.wc-original {\
  display: none;\
}\
.wcselected { \
  outline: 2px solid green;\
}\
.wcselected.novisual {\
  outline: none;\
}\
#report_popup {\
  margin-top: 50px;\
  width: 90%; \
  height: 80%; \
  background-color: #F5F5F5;\
  border: 1px solid #E3E3E3;\
  border-radius: 4px;\
  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.05);\
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.05);\
  -webkit-transform: scale(0.8);\
   -moz-transform: scale(0.8);\
    -ms-transform: scale(0.8);\
        transform: scale(0.8);\
} \
.popup_visible #report_popup { \
  -webkit-transform: scale(1); \
     -moz-transform: scale(1); \
      -ms-transform: scale(1); \
          transform: scale(1); \
} \
#report_popup .wcscreeshot {\
  height: 100%;\
  margin: 0 auto;\
  overflow: hidden;\
  position: relative;\
  width: 100%;\
} \
.wcscreeshot .captured { \
display:none; \
position: absolute; \
max-width: 100%; \
top: 0; \
left: 0; \
} \
.wcscreeshot .captured:empty { \
  top: 50%; \
  left: 50%; \
  -webkit-transform: translate(-50%, -50%); \
  -moz-transform: translate(-50%, -50%); \
  -ms-transform: translate(-50%, -50%); \
  -o-transform: translate(-50%, -50%); \
  transform: translate(-50%, -50%); \
} \
/*! Licensed under MIT, https://github.com/sofish/pen */\
.pen, .pen-menu, .pen-input, .pen textarea{font:400 1.16em/1.45 Palatino, Optima, Georgia, serif;color:#331;}\
.pen:focus{outline:none;}\
.pen fieldset, img {border: 0;}\
.pen blockquote{padding-left:10px;margin-left:-14px;border-left:4px solid #1abf89;}\
.pen a{color:#1abf89;}\
.pen del{text-decoration:line-through;}\
.pen sub, .pen sup {font-size:75%;position:relative;vertical-align:text-top\9;}\
:root .pen sub, :root .pen sup{vertical-align:baseline; /* for ie9 and other mordern browsers */}\
.pen sup {top:-0.5em;}\
.pen sub {bottom:-0.25em;}\
.pen hr{border:none;border-bottom:1px solid #cfcfcf;margin-bottom:25px;*color:pink;*filter:chroma(color=pink);height:10px;*margin:-7px 0 15px;}\
.pen small{font-size:0.8em;color:#888;}\
.pen em, .pen b, .pen strong{font-weight:700;}\
.pen pre{white-space:pre-wrap;padding:0.85em;background:#f8f8f8;}\
.pen p, .pen pre, .pen ul, .pen ol, .pen dl, .pen form, .pen table, .pen blockquote{margin-bottom:16px;}\
.pen h1, .pen h2, .pen h3, .pen h4, .pen h5, .pen h6{margin-bottom:16px;font-weight:700;line-height:1.2;}\
.pen h1{font-size:2em;}\
.pen h2{font-size:1.8em;}\
.pen h3{font-size:1.6em;}\
.pen h4{font-size:1.4em;}\
.pen h5, .pen h6{font-size:1.2em;}\
.pen ul, .pen ol{margin-left:1.2em;}\
.pen ul, .pen-ul{list-style:disc;}\
.pen ol, .pen-ol{list-style:decimal;}\
.pen li ul, .pen li ol, .pen-ul ul, .pen-ul ol, .pen-ol ul, .pen-ol ol{margin:0 2em 0 1.2em;}\
.pen li ul, .pen-ul ul, .pen-ol ul{list-style: circle;}\
.pen-menu, .pen-input{font-size:14px;line-height:1;}\
.pen-menu{white-space:nowrap;box-shadow:1px 2px 3px -2px #222;background:#333;background-image:linear-gradient(to bottom, #222, #333);opacity:0.9;position:fixed;height:36px;border:1px solid #333;border-radius:3px;display:none;z-index:2147483593;}\
.pen-menu:after {top:100%;border:solid transparent;content:' ';height:0;width:0;position:absolute;pointer-events:none;}\
.pen-menu:after {border-color:rgba(51, 51, 51, 0);border-top-color:#333;border-width:6px;left:50%;margin-left:-6px;}\
.pen-icon{font:normal 900 16px/40px Georgia serif;min-width:20px;display:inline-block;padding:0 10px;height:36px;overflow:hidden;color:#fff;text-align:center;cursor:pointer;-moz-user-select:none;-webkit-user-select:none;-ms-user-select:none;user-select:none;}\
.pen-icon:first-of-type{border-top-left-radius:3px;border-bottom-left-radius:3px;}\
.pen-icon:last-of-type{border-top-right-radius:3px;border-bottom-right-radius:3px;}\
.pen-icon:hover{background:#000;}\
.pen-icon.active{color:#1abf89;background:#000;box-shadow:inset 2px 2px 4px #000;}\
.pen-input{position:absolute;width:100%;left:0;top:0;height:36px;line-height:20px;background:#333;color:#fff;border:none;text-align:center;display:none;font-family:arial, sans-serif;}\
.pen-input:focus{outline:none;}\
.pen-textarea{display:block;background:#f8f8f8;padding:20px;}\
.pen textarea{font-size:14px;border:none;background:none;width:100%;_height:200px;min-height:200px;resize:none;}\
@font-face { font-family: 'pen'; src: url('font/fontello.eot?370dad08'); src: url('font/fontello.eot?370dad08#iefix') format('embedded-opentype'), url('font/fontello.woff?370dad08') format('woff'), url('font/fontello.ttf?370dad08') format('truetype'), url('font/fontello.svg?370dad08#fontello') format('svg'); font-weight: normal; font-style: normal; }\
.pen-menu [class^='icon-']:before, .pen-menu [class*=' icon-']:before {\
  font-family: 'pen';\
  font-style: normal;\
  font-weight: normal;\
  speak: none;\
  display: inline-block;\
  text-decoration: inherit;\
  width: 1em;\
  margin-right: .2em;\
  text-align: center;\
  font-variant: normal;\
  text-transform: none;\
  line-height: 1em;\
  margin-left: .2em;\
}\
.pen-menu .icon-location:before { content: '\e815'; }\
.pen-menu .icon-fit:before { content: '\e80f'; }\
.pen-menu .icon-bold:before { content: '\e805'; }\
.pen-menu .icon-italic:before { content: '\e806'; }\
.pen-menu .icon-justifyleft:before { content: '\e80a'; }\
.pen-menu .icon-justifycenter:before { content: '\e80b'; }\
.pen-menu .icon-justifyright:before { content: '\e80c'; }\
.pen-menu .icon-justifyfull:before { content: '\e80d'; }\
.pen-menu .icon-outdent:before { content: '\e800'; }\
.pen-menu .icon-indent:before { content: '\e801'; }\
.pen-menu .icon-mode:before { content: '\e813'; }\
.pen-menu .icon-fullscreen:before { content: '\e80e'; }\
.pen-menu .icon-insertunorderedlist:before { content: '\e802'; }\
.pen-menu .icon-insertorderedlist:before { content: '\e803'; }\
.pen-menu .icon-strikethrough:before { content: '\e807'; }\
.pen-menu .icon-underline:before { content: '\e804'; }\
.pen-menu .icon-blockquote:before { content: '\e814'; }\
.pen-menu .icon-undo:before { content: '\e817'; }\
.pen-menu .icon-pre:before { content: '\e816'; }\
.pen-menu .icon-unlink:before { content: '\e811'; }\
.pen-menu .icon-superscript:before { content: '\e808'; }\
.pen-menu .icon-subscript:before { content: '\e809'; }\
.pen-menu .icon-inserthorizontalrule:before { content: '\e818'; }\
.pen-menu .icon-pin:before { content: '\e812'; }\
.pen-menu .icon-createlink:before { content: '\e810'; }\
.pen {  position: relative; }\
.pen.hinted h1:before,\
.pen.hinted h2:before,\
.pen.hinted h3:before,\
.pen.hinted h4:before,\
.pen.hinted h5:before,\
.pen.hinted h6:before,\
.pen.hinted blockquote:before,\
.pen.hinted hr:before {\
  color: #eee;\
  position: absolute;\
  right: 100%;\
  white-space: nowrap;\
  padding-right: 10px;\
}\
.pen.hinted blockquote {  border-left: 0; margin-left: 0; padding-left: 0; }\
.pen.hinted blockquote:before {\
  color: #1abf89;\
  content: '>';\
  font-weight: bold;\
  vertical-align: center;\
}\
.pen.hinted h1:before { content: '#';}\
.pen.hinted h2:before { content: '##';}\
.pen.hinted h3:before { content: '###';}\
.pen.hinted h4:before { content: '####';}\
.pen.hinted h5:before { content: '#####';}\
.pen.hinted h6:before { content: '######';}\
.pen.hinted hr:before { content: '﹘﹘﹘'; line-height: 1.2; vertical-align: bottom; }\
.pen.hinted pre:before, .pen.hinted pre:after {\
  content: '```';\
  display: block;\
  color: #ccc;\
}\
.pen.hinted ul { list-style: none; }\
.pen.hinted ul li:before {\
  content: '*';\
  color: #999;\
  line-height: 1;\
  vertical-align: bottom;\
  margin-left: -1.2em;\
  display: inline-block;\
  width: 1.2em;\
}\
.pen.hinted b:before, .pen.hinted b:after { content: '**'; color: #eee; font-weight: normal; }\
.pen.hinted i:before, .pen.hinted i:after { content: '*'; color: #eee; }\
.pen.hinted a { text-decoration: none; }\
.pen.hinted a:before {content: '['; color: #ddd; }\
.pen.hinted a:after { content: '](' attr(href) ')'; color: #ddd; }\
</style>").appendTo("head");