/**
 * 通过百度地图api，批量转换经纬度
 * 每一批转换完调用一次callback
 * http://lbsyun.baidu.com/index.php?title=webapi/guide/changeposition
 * @param  {[type]} latlngs   [description]
 * @param  {[type]} cllback   [description]
 * @param  {Object} [args={}] [description]
 * @return {[type]}           [description]
 */
export function convertBMapLatLng(latlngs, callback, args={}) {
  let opts = {
    sliceLenth: 5, // 5个一批进行转换
    from: 1, // GPS设备获取的角度坐标，wgs84坐标;
    to: 5, // bd09ll(百度经纬度坐标),
    ...args
  }

  // 加载地图API js
  loadBMap(() => {
    let convertor = new BMap.Convertor()

    // translate
    function translate(points, offset) {
      let pointsArr = points.map(item => {
        return new BMap.Point(item.lng, item.lat);
      });

      convertor.translate(pointsArr, opts.from, opts.to, (data) => {
        if (data.status != 0) {
          console.log('坐标转换失败');
          return;
        }
        callback(data.points, offset);
      });
    }

    let arr = [];
    let findLength = 0;
    while (findLength < latlngs.length) {
      arr = latlngs.slice(findLength, findLength + opts.sliceLenth);
      translate(arr, findLength);
      findLength += opts.sliceLenth;
    }
  });
}
