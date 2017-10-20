const compiler = require('vue-template-compiler');

class Plugin {

  onHandleCode(ev) {
    const fileName = ev.data.filePath;

    if (/\.vue$/.test(fileName)) {
      let output = compiler.parseComponent(ev.data.code);
      let vueCode = output.script
        ? output.script.content
        : '';

      ev.data.code = vueCode;
    }

  }

}

module.exports = new Plugin();
