/* globals CodeMirror, $ */
class CMBlock {

	constructor(history, cnsole, txt, sandbox) {
		this.sandbox = sandbox;
    this.cnsole = cnsole;
		this.errorLine = null;
		this.savedText = null;
		this.history = history;
		this.historyIndex = 0;
		this.next = null;
		this.element = document.createElement('div');
		this.result = document.createElement('div');
		this.result.className = 'output';
		this.pointer = this;

		var editorElement = this.element;

		// let editorDiv = document.createElement('div');

		this.editor = CodeMirror(this.element, {
			value: txt,
			mode: 'javascript',
			scrollbarStyle: 'simple',
			lineNumbers: localStorage.getItem('es6-editor-lines') === 'true' || false,
			viewportMargin: Infinity,
			extraKeys: {
				"Ctrl-Enter": this.run.bind(this),
				"Ctrl-Up": this.prevHistory.bind(this),
				"Ctrl-Down": this.nextHistory.bind(this)
					// "Ctrl-Space": "autocomplete"
			}
		});
	
	
		$(window).resize(function () {
			frameResize(true);
		}).scroll(function() {    
    	var scroll = $(window).scrollTop();

    	if (scroll >= 35) {
      	  $(".editor-logo").addClass("show-logo");
    	} else {
        	$(".editor-logo").removeClass("show-logo");
    	}
		});


	  function frameResize(onresize) {
	  	let wh = $(window).height();
	  	let ww = $(window).width();
			let fh = wh - 150;
			if (ww < 769) fh -= 100;
			if (fh < 350) fh = 350;
			$('#framewrap').height(fh + 35);
			if (onresize === true) fh -= 10;
			$('.CodeMirror', editorElement).height(fh - 55);
	  };

	  frameResize();

  }

  getElement() {
		return this.element;
	}

	onAdded() {
		this.editor.refresh();
		this.editor.focus();
		this.editor.setCursor(this.editor.posFromIndex(Number.MAX_VALUE));
	}

	output(element) {
		this.result.appendChild(element);
	};

	onExec() {
		// save everything to localstorage
		var previousHistory = localStorage.getItem('tryES6-history');
		if (this.history) {
			previousHistory = this.history;
		} else if (previousHistory) {
			previousHistory = JSON.parse(previousHistory);
		} else {
			previousHistory = [];
		}
		var val = this.editor.getValue();

		if (val !== null && val.length > 0 && previousHistory[0] !== val) {
			previousHistory.unshift(val);
			this.historyIndex = 0;
			if (previousHistory.length > 20) previousHistory.pop();
			localStorage.setItem('tryES6-history', JSON.stringify(previousHistory));
		}
	}	

	clicknext() {
		this.nextHistory();
	};

	clickprev() {
		this.prevHistory();
	};

	clear() {
		this.result.innerHTML = '';
	}

	run() {
		let js = this.editor.getValue().replace(/[\u200B-\u200D\uFEFF]/g, '');
		if (this.errorLine) {
			this.editor.removeLineClass(this.errorLine, 'background', 'line-error');
			this.errorLine = null;
		}
		this.sandbox.runCode(js, res => {
			if (res.ok) {
			$('.CodeMirror, #buttons, .CodeMirror-gutters').animate({
					backgroundColor: '#89ED55'
				}, 60, function () {
					$(this).animate({
						backgroundColor: '#F1F5ED'
					}, 230);
				});
				this.onExec(res.ok);
			} else if (res.error) {
				if (res.error.line) {
					this.editor.addLineClass(res.error.line - 1, 'background', 'line-error');
					this.errorLine = this.editor.getLineHandle(res.error.line - 1);
    		}

				$('.CodeMirror, #buttons, .CodeMirror-gutters').animate({
					backgroundColor: '#FBC2C4'
				}, 30, function () {
					$(this).animate({
						backgroundColor: '#F1F5ED'
					}, 230);
				});
			};
		});
	}

	prevHistory() {
		if (this.history && this.history.length > 0) {
			let index = this.historyIndex <= 0 ? 0 : this.historyIndex - 1;
			this.editor.setValue(this.history[index]);
			this.historyIndex = index;
		} 
	}

	nextHistory() {
		if (this.history && this.history.length > 0) {
			let index = this.historyIndex >= 20 ? 20 : this.historyIndex + 1;
			// if (index === 20 && this.savedText)
			this.editor.setValue(this.history[index]);
			this.historyIndex = index;
		}
	}
}

class CMCode {
	
	constructor(container, txt, sandbox) {
		this.sandbox = sandbox;
		this.previousHistory = null;
		var lastCode = '';
		// load from localstorage
		var previousHistory = localStorage.getItem('tryES6-history') || null; 
		if (previousHistory) {
			this.previousHistory = JSON.parse(previousHistory);
			if (this.previousHistory.length > 0) {
				lastCode = this.previousHistory[0];
			}
		}

		this.bottomBlock = null;
		this.outputBlock = null;
		this.container = container || document.body;
		this.log = this.log.bind(this);

		var initialCode = txt || lastCode;
		this.addBlock(this.previousHistory, initialCode);
	}

	renderError(e) {
		var stack = e.stack;
		var element = document.createElement('pre');
		element.className = 'error';
		element.textContent = stack;
		return element;
	}

	renderObject(obj) {

		function renderObjectPart(key, objPart) {
			var element = document.createElement('li');
			if (objPart == null || typeof objPart !== 'object') {
				element.innerText = (key !== null ? (key + ' : ') : '') + objPart;
				if (objPart == null) {
					element.style.color = '#999';
				}
			} else if (typeof objPart === 'object') {
				var children = null;
				var json = JSON.stringify(objPart);
				var display = json.substring(0, 30);
				if (display !== json) display += '...';
				element.innerText = (key !== null ? (key + ' : ') : '') + display;
				element.onclick = function (evt) {
					evt.stopPropagation();
					if (children == null) {
						children = document.createElement('ul');
						for (var key in objPart) {
							children.appendChild(renderObjectPart(key, objPart[key]));
						}
						element.appendChild(children);
					} else {
						element.removeChild(children);
						children = null;
					}
				};
			}
			return element;
		}
		var el = document.createElement('ul');
		el.className = 'objectbrowser';
		el.appendChild(renderObjectPart(null, obj));
		return el;
	}

	render(obj) {
		var element;
		if (obj instanceof Error) {
			return this.renderError(obj);
		} else if (obj instanceof HTMLElement) {
			element = document.createElement('div');
			element.style.margin = '4px';
			element.style.display = 'inline-block';
			element.style.color = '#909';
			var txt = "<" + obj.tagName.toLowerCase();
			if (obj.id) txt += " id='" + obj.id + "'";
			if (obj.className) txt += " class='" + obj.className + '"';
			element.textContent = txt + " >";
			var children = document.createElement('div');
			children.style.fontSize = 'small';
			children.style.paddingLeft = '20px';
			element.appendChild(children);
			var visible = false;
			children.style.display = 'none';
			children.innerText = obj.innerHTML;
			element.onclick = function () {
				visible = !visible;
				children.style.display = visible ? 'block' : 'none';
			};
			return element;
		} else if (obj == null || typeof(obj) !== 'object') {
			element = document.createElement('div');
			element.style.margin = '4px';
			element.style.display = 'inline-block';
			element.textContent = "" + obj;
			if (obj == null) {
				element.style.color = "#999";
			}
			return element;
		} else {
			return this.renderObject(obj);
		}
	}

	log() {
		var line = document.createElement('div');
		line.style.position = 'relative';
		for (var i = 0; i < arguments.length; ++i) {
			line.appendChild(this.render(arguments[i]));
		}
		this.outputBlock.output(line);
	}

	setOutputBlock(block) {
		// this.outputBlock = block;
	};

	addBlock(history, txt) {
		var block = new CMBlock(history, this, txt, this.sandbox);
		this.setOutputBlock(block);
		this.bottomBlock = block;
		this.container.appendChild(block.getElement());
		block.onAdded();
		return block;
	}
}
	
	export { CMCode };