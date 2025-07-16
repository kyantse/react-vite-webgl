/**
 * 合并两个对象
 * @param {Object} obj1 - 第一个对象
 * @param {Object} obj2 - 第二个对象
 * @returns {Object} 合并后的对象
 */
function mergeObject(obj1, obj2) {
  // 使用扩展运算符合并对象
  return { ...obj1, ...obj2 };
}
