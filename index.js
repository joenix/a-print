/* eslint-disable */

// Noop
async function noop() {}

// Printer Classic as ES4
function Printer(dom, options) {
  // Check Initial
  if (!(this instanceof Printer)) {
    return new Printer(dom, options);
  }

  // Options Extension
  this.options = this.extend(this.preset, options);

  // Set Dom as check
  this.dom = typeof dom === 'string' ? document.querySelector(dom) : this.isDOM(dom) ? dom : dom.$el;

  // Init
  this.init();
}

Printer.prototype = {
  // Preset for Options
  preset: {
    noPrint: '.no-print',

    time: 720,

    onPrintProcessReady: noop,
    onPrintProcessOpen: noop,
    onPrintProcessClose: noop,
  },

  // Init
  init() {
    // Write Iframe
    this.writeFrame(this.getStyle() + this.getHtml());
  },

  // Check Node is in Body, and Not the Body Element Self
  isInBody(node) {
    return node === document.body ? false : document.body.contains(node);
  },

  // Check is Dom
  isDom() {
    return typeof HTMLElement === 'object' ? () => obj instanceof HTMLElement : obj => obj && typeof obj === 'object' && obj.nodeType === 1 && typeof obj.nodeName === 'string';
  },

  // Wait
  wait(time = 100) {
    // Use Promise
    return new Promise(resolve => {
      // Set Timeout
      let outer = setTimeout(() => {
        // Clear First
        clearTimeout(outer);

        // Then
        resolve();
      }, time);
    });
  },

  // Each
  each(target, callback = () => {}, increase = false) {
    if ([undefined, null].includes(target)) {
      return;
    }

    if (target.constructor === NodeList) {
      for (let i = 0; i < target.length; i++) {
        callback(target[i], i);
      }
      return;
    }

    if (target.constructor === Array) {
      target.forEach(callback);
      return;
    }

    for (const key in target) {
      callback(target[key], key);
    }
  },

  // Extension
  extend(origin, target) {
    this.each(target, (item, key) => {
      origin[key] = item;
    });

    return origin;
  },

  // Get Style
  getStyle(sheet = '') {
    // Get Style Links
    const links = document.querySelectorAll('style,link');

    // Super Position
    this.each(links, node => {
      sheet += node.outerHTML;
    });

    // Set Sheet
    sheet += '<style>' + (this.options.noPrint ? this.options.noPrint : '.no-print') + '{display:none;}' + (this.options.css || '') + '</style>';

    // Exports
    return sheet;
  },

  // Get HTML
  getHtml() {
    // All Inputs
    var inputs = document.querySelectorAll('input');

    // All Textareas
    var textareas = document.querySelectorAll('textarea');

    // All Selects
    var selects = document.querySelectorAll('select');

    // Loop Inputs
    this.each(inputs, ele => {
      if (['checkbox', 'radio'].includes(ele.type)) {
        return ele.checked == true ? ele.setAttribute('checked', 'checked') : ele.removeAttribute('checked');
      }
      ele.setAttribute('value', ele.value);
    });

    // Loop Textareas
    this.each(textareas, ele => {
      if (ele.type == 'textarea') {
        ele.innerHTML = ele.value;
      }
    });

    // Loop Selects
    this.each(selects, ele => {
      // Just `select-one` No `select-multiple`
      if (ele.type == 'select-one') {
        // Loop Options
        this.each(ele.children, opt => {
          // Just OPTION
          if (opt.tagName == 'OPTION') {
            opt.selected == true ? opt.setAttribute('selected', 'selected') : opt.removeAttribute('selected');
          }
        });
      }
    });

    // Wrapper Dom when needs to Printer
    const { outerHTML } = this.wrapperRefer(this.dom);

    // Exports for Printer
    return outerHTML;
  },
  // Wrapper Red Dom when Needs Printer
  // Prevent Selector Failed of Root
  wrapperRefer(ref) {
    // Prev Dom
    let prevent = null;

    // Current Dom as Ref
    let current = ref;

    // Check Current in `body` First
    if (!this.isInBody(current)) {
      return current;
    }

    // Deep Current
    while (current) {
      // Preset Cloner
      let cloner;

      // Check True
      if (prevent) {
        // Set Cloner as Current
        cloner = current.cloneNode(false);

        // Append Prevent into Cloner
        cloner.appendChild(prevent);
      } else {
        // Set Cloner as Current
        cloner = current.cloneNode(true);
      }

      // Reset Prevent
      prevent = cloner;

      // Reset Current as Parent Node
      current = current.parentElement;
    }

    // Exports Prevent
    return prevent;
  },

  // Create Frame
  createFrame(id, attrs) {
    // Set Frame
    const iframe = document.createElement('iframe');

    // Set ID
    iframe.id = id;

    // Set Attrs
    this.each(attrs, (value, key) => iframe.setAttribute(key, value));

    // Exports
    return iframe;
  },

  // Write Frame - Style + HTML
  writeFrame(content) {
    // Set Frame Origin
    const origin = this.createFrame('printerFrame', { style: `position:absolute;width:0;height:0;top:-10px;left:-10px;` });

    // Get Frame after Append
    const frame = document.body.appendChild(origin);

    // Preset Glob
    const glob = frame.contentWindow || frame.contentDocument;

    // Preset Doc
    const doc = frame.contentDocument || frame.contentWindow.document;

    // Operation of Doc
    doc.open();

    // Add Style Modifier
    doc.write(`${content}<style>.print{transform: scale(2) !important;margin-top:250px;}@page {margin-top: 1mm; margin-bottom: 1mm;}</style>`);

    // Close ?
    doc.close();

    // As Scope
    const that = this;

    // Frame Onload
    origin.onload = () => {
      // To Print
      that.toPrint(glob);

      // Cleaner
      that.wait(that.options.time).then(() => document.body.removeChild(origin));
    };
  },

  // To Print ( Core )
  toPrint(frameWindow) {
    // Get Options in Scope
    const { options } = this;

    try {
      this.wait(10).then(() => {
        // Focus First
        frameWindow.focus();

        // Catch Any Error
        try {
          if (!frameWindow.document.execCommand('print', false, null)) {
            // Open Callback
            options.onPrintProcessOpen();

            // Trigger Print
            frameWindow.print();
          }
        } catch (e) {
          // Hard Trigger
          frameWindow.print();
        }

        // Close Callback
        options.onPrintProcessClose();

        // Endness of Printer
        frameWindow.close();
      });
    } catch (e) {
      console.error(e);
    }
  },
};

export default Printer;
