// 合并重叠区间
// input: [ [1, 3], [2, 4], [6, 8], [9, 10], [11, 12], [9, 13] ]
// output: [ [1, 4], [6, 8], [9, 13] ]
export default function mergeIntervals(intervals=[]) {
  let sortedArr = intervals.sort((a, b) => {
    return a[0] == b[0]
      ? (a[1] - a[0]) - (b[1] - b[0])
      : a[0] - b[0];
  });

  let output = [];
  let last = null;
  sortedArr.forEach((item, index) => {
    if (last && last[1] >= item[0]) {
      last[1] = Math.max(last[1], item[1]);
    } else {
      if (last) output.push(last);
      last = item;
    }
  });
  if (last) output.push(last);

  return output;
}
