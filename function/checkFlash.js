// 检查浏览器flash安装情况
module.exports = function checkFlash() {
  var hasFlash = 0; //是否安装了flash
  var flashVersion = 0; //flash版本

  if (document.all) {
    try {
      var swf = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
      if (swf) {
        hasFlash = 1;
        VSwf = swf.GetVariable("$version");
        flashVersion = parseFloat(VSwf.split(" ")[1].split(",")[0]);
      }
    } catch (e) {
      //
    }
  } else {
    try {
      if (navigator.plugins && navigator.plugins.length > 0) {
        var swf = navigator.plugins["Shockwave Flash"];
        if (swf) {
          hasFlash = 1;
          var words = swf
            .description
            .split(" ");
          for (var i = 0; i < words.length; ++i) {
            if (isNaN(parseFloat(words[i])))
              continue;
            flashVersion = parseFloat(words[i]);
          }
        }
      }
    } catch (e) {
      //
    }
  }
  return {f: hasFlash, v: flashVersion,};
}
