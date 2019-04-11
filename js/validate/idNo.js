// 二代身份证
export function isIdCard(g) {
  let f = 0;
  let a = g;
  let e = {
      11: "北京",
      12: "天津",
      13: "河北",
      14: "山西",
      15: "内蒙",
      21: "辽宁",
      22: "吉林",
      23: "黑龙",
      31: "上海",
      32: "江苏",
      33: "浙江",
      34: "安徽",
      35: "福建",
      36: "江西",
      37: "山东",
      41: "河南",
      42: "湖北",
      43: "湖南",
      44: "广东",
      45: "广西",
      46: "海南",
      50: "重庆",
      51: "四川",
      52: "贵州",
      53: "云南",
      54: "西藏",
      61: "陕西",
      62: "甘肃",
      63: "青海",
      64: "宁夏",
      65: "新疆",
      71: "台湾",
      81: "香港",
      82: "澳门",
      83: "台湾",
      91: "国外"
  };

  // 18 位
  if (!/^\d{17}(\d|x)$/i.test(a)) {
    return false;
  }

  // 省
  a = a.replace(/x$/i, "a");
  if (e[parseInt(a.substr(0, 2))] === null) {
    return false;
  }

  // 日期校验
  let c = a.substr(6, 4) + "-" + Number(a.substr(10, 2)) + "-" + Number(a.substr(12, 2));
  let h = new Date(c.replace(/-/g, "/"));
  if (c !== (h.getFullYear() + "-" + (h.getMonth() + 1) + "-" + h.getDate())) {
    return false;
  }

  // 校验码
  for (var b = 17; b >= 0; b--) {
    f += (Math.pow(2, b) % 11) * parseInt(a.charAt(17 - b), 11);
  }
  if (f % 11 !== 1) {
    return false;
  }

  return true;
}

// 港澳通行证
export function isHkongMacaoPass(str) {
  // old
  let a = /^[HMhm]{1}([0-9]{10}|[0-9]{8})$/;
  // new
  let b = /^[HMhm]{1}([0-9]{8})$/;

  return a.test(str) || b.test(str);
}

// 台湾通行证
export function isTaiwanPass(str) {
  let a = /^[0-9]{8}$/;
  let b = /^[0-9]{10}$/;

  return a.test(str) || b.test(str);
}

// 护照
export function isPassport(str) {
  let a = /^[a-zA-Z]{5,17}$/;
  let b = /^[a-zA-Z0-9]{5,17}$/;

  return a.test(str) || b.test(str);
}
