// 是否是ie8
module.exports = function isIe8() {
  if (navigator.appName == "Microsoft Internet Explorer" && navigator.appVersion.split(";")[1].replace(/[ ]/g, "") == "MSIE8.0") {
    return true;
  }
  return false;
}
