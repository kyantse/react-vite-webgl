const Executor = require("./marscode");
const { describe, test, expect, beforeEach } = require("@jest/globals");
describe("isPhone 函数测试", () => {
  beforeEach(() => {
    // 导入待测函数
    this.isPhone = Executor;
  });

  test("手机号码验证", () => {
    expect(this.isPhone("13812345678")).toBe(true);
    expect(this.isPhone("15678901234")).toBe(true);
  });

  test("座机号码验证", () => {
    expect(this.isPhone("(010)12345678")).toBe(true);
    expect(this.isPhone("021-12345678")).toBe(true);
    expect(this.isPhone("0571 12345678")).toBe(true);
  });

  test("无效号码验证", () => {
    expect(this.isPhone("12345678")).toBe(false);
    expect(this.isPhone("12345678901")).toBe(false);
    expect(this.isPhone("abcdefghij")).toBe(false);
  });
});
