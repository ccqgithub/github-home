export function toFixed(num: number, precision: number) {
  // 修复js toFixed精度bug, 原理：先转换成整数，round后再转换成小数
  // bug: 1.335.toFixed(2) = 1.33，应该是 1.34
  const mul = Math.pow(10, precision);
  return (Math.round(num * mul) / mul).toFixed(precision);
}
