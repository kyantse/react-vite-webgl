/**
 * 验证手机号包括手机和座机两种情况
 *
 * @param {string} phone - 需要验证的手机号码或座机号码
 * @returns {boolean} - 如果号码格式正确，返回true；否则返回false
 */
function isPhone(phone) {
  // 正则表达式，用于验证手机号码，格式为1开头，第二位是3、4、5、7、8中的一个，后面跟着9位数字
  var reg = /^1[3|4|5|7|8]\d{9}$/;
  // 正则表达式，用于验证座机号码，格式为(区号)、区号-、空格中的一种，后面跟着7到14位数字
  var reg2 = /^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/;
  // 使用正则表达式验证手机号码和座机号码，如果匹配成功，返回true；否则返回false
  if (reg.test(phone) || reg2.test(phone)) {
    return true;
  } else {
    return false;
  }
}

module.exports = isPhone;
