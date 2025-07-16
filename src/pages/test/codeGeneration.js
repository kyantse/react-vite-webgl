// 验证手机号码
function checkPhone(phone) {
  var myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
  if (!myreg.test(phone)) {
    return false;
  } else {
    return true;
  }
}

// 验证身份证
function checkIdCard(idCard) {
  var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
  if (reg.test(idCard) === false) {
    return false;
  } else {
    return true;
  }
}

// 生成随机数
function randomNum(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// 生成随机字符串
function randomString(len) {
  len = len || 32;
  var $chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
  var maxPos = $chars.length;
  var pwd = "";
  for (i = 0; i < len; i++) {
    pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
}
