// 单词首字母大写
module.exports = function strCapitalize(string) {
  return string.replace(/(^|[^a-zA-Z\u00C0-\u017F'])([a-zA-Z\u00C0-\u017F])/g, function(m) {
    return m.toUpperCase()
  })
}
