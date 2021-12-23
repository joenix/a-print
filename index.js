// Printer Classic
/* eslint-disable */
const Printer = function (dom, options) {
    if (!(this instanceof Printer)) return new Printer(dom, options);

    this.options = this.extend({
        'noPrint': '.no-print'
    }, options);

    if ((typeof dom) === "string") {
        this.dom = document.querySelector(dom);
    } else {
        this.isDOM(dom)
        this.dom = this.isDOM(dom) ? dom : dom.$el;
    }

    this.init();
};

Printer.prototype = {
    init: function () {
        var content = this.getStyle() + this.getHtml();
        this.writeIframe(content);
    },
    extend: function (obj, obj2) {
        for (var k in obj2) {
            obj[k] = obj2[k];
        }
        return obj;
    },

    getStyle: function () {
        var str = "",
            styles = document.querySelectorAll('style,link');
        for (var i = 0; i < styles.length; i++) {
            str += styles[i].outerHTML;
        }
        str += "<style>" + (this.options.noPrint ? this.options.noPrint : '.no-print') + "{display:none;}</style>";

        return str;
    },

    getHtml: function () {
        var inputs = document.querySelectorAll('input');
        var textareas = document.querySelectorAll('textarea');
        var selects = document.querySelectorAll('select');

        for (var k = 0; k < inputs.length; k++) {
            if (inputs[k].type == "checkbox" || inputs[k].type == "radio") {
                if (inputs[k].checked == true) {
                    inputs[k].setAttribute('checked', "checked")
                } else {
                    inputs[k].removeAttribute('checked')
                }
            } else if (inputs[k].type == "text") {
                inputs[k].setAttribute('value', inputs[k].value)
            } else {
                inputs[k].setAttribute('value', inputs[k].value)
            }
        }

        for (var k2 = 0; k2 < textareas.length; k2++) {
            if (textareas[k2].type == 'textarea') {
                textareas[k2].innerHTML = textareas[k2].value
            }
        }

        for (var k3 = 0; k3 < selects.length; k3++) {
            if (selects[k3].type == 'select-one') {
                var child = selects[k3].children;
                for (var i in child) {
                    if (child[i].tagName == 'OPTION') {
                        if (child[i].selected == true) {
                            child[i].setAttribute('selected', "selected")
                        } else {
                            child[i].removeAttribute('selected')
                        }
                    }
                }
            }
        }
        // Wrapper Dom when needs to Printer
        let outerHTML = this.wrapperRefDom(this.dom).outerHTML
        return outerHTML;
    },
    // Wrapper Red Dom when Needs Printer
    // Prevent Selector Failed of Root
    wrapperRefDom: function (refDom) {
        let prevDom = null
        let currDom = refDom
        // 判断当前元素是否在 body 中，不在文档中则直接返回该节点
        if (!this.isInBody(currDom)) return currDom

        while (currDom) {
            if (prevDom) {
                let element = currDom.cloneNode(false)
                element.appendChild(prevDom)
                prevDom = element
            } else {
                prevDom = currDom.cloneNode(true)
            }
            currDom = currDom.parentElement
        }
        return prevDom
    },

    writeIframe: function (content) {
        var w, doc, iframe = document.createElement('iframe'),
            f = document.body.appendChild(iframe);
        iframe.id = "printerFrame";
        iframe.setAttribute('style', 'position:absolute;width:0;height:0;top:-10px;left:-10px;');
        w = f.contentWindow || f.contentDocument;
        doc = f.contentDocument || f.contentWindow.document;
        doc.open();
        // Add Style Modifier
        doc.write(content + "<style>.print{transform: scale(2) !important;margin-top:250px;}@page {margin-top: 1mm;margin-bottom: 1mm;}</style>");
        doc.close();
        var _this = this
        iframe.onload = function () {
            _this.toPrint(w);
            setTimeout(function () {
                document.body.removeChild(iframe)
            }, 100)
        }
    },

    toPrint: function (frameWindow) {
        try {
            setTimeout(function () {
                frameWindow.focus();
                try {
                    if (!frameWindow.document.execCommand('print', false, null)) {
                        frameWindow.print();
                    }
                } catch (e) {
                    frameWindow.print();
                }
                frameWindow.close();
            }, 10);
        } catch (err) {
            console.log('err', err);
        }
    },
    // Check Node is in Body, and Not the Body Element Self
    isInBody: function (node) {
        return (node === document.body) ? false : document.body.contains(node);
    },
    isDOM: (typeof HTMLElement === 'object') ?
        function (obj) {
            return obj instanceof HTMLElement;
        } : function (obj) {
            return obj && typeof obj === 'object' && obj.nodeType === 1 && typeof obj.nodeName === 'string';
        }
};

export default Printer
