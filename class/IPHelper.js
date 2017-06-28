var request = require('request');

module.exports = class IPHelper {
  constructor(params) {
    //
  }

  request(url, json=true) {
    console.log(url);
    return new Promise((resolve, reject) => {
      request({
        url: url,
        method: 'GET',
        qs: {},
        json: json,
        strictSSL: false,
        headers: {},
      }, function(error, response, result) {

        if (error || !result) {
          console.log('接口请求错误: ' + url);
          console.log(error);
          return reject(error);
        }

        if (response.statusCode != 200) {
          console.log('接口请求错误: ' + url);
          console.log(response.statusCode);
          return reject(error);
        }

        resolve(result);
      });
    });
  }

  // 新浪ip地址库
  // 限制：未知
  fromSina(ip) {
    var  url = `https://int.dpool.sina.com.cn/iplookup/iplookup.php?ip=${ip}&format=json`;
    return this.request(url).then(result => {
      // ret: 1, 0
      // {
      //   "ret": 1,
      //   "start": -1,
      //   "end": -1,
      //   "country": "美国",
      //   "province": "",
      //   "city": "",
      //   "district": "",
      //   "isp": "",
      //   "type": "",
      //   "desc": ""
      // }

      if (result.ret != 1) {
        return Promise.reject();
      }

      var rst = {
        country: 'Other',
        province: 'Other',
        city: 'Other',
        district: 'Other',
        ext: result,
      };

      if (result.country.indexOf('中国') != -1) {
        rst.country = 'China';

        if (result.province.indexOf('香港') != -1) {
          rst.province = 'Hong Kong';
        }
      }

      return rst;
    });
  }

  // 淘宝ip地址库
  // 限制：每秒10次
  fromTaobao(ip) {
    var  url = `http://ip.taobao.com/service/getIpInfo.php?ip=${ip}`;
    return this.request(url).then(result => {
      // code: 0, 1
      // {
      //   "code": 0,
      //   "data": {
      //     "ip": "210.75.225.254",
      //     "country": "中国",
      //     "area": "华北",
      //     "region": "北京市",
      //     "city": "北京市",
      //     "county": "",
      //     "isp": "电信",
      //     "country_id": "86",
      //     "area_id": "100000",
      //     "region_id": "110000",
      //     "city_id": "110000",
      //     "county_id": "-1",
      //     "isp_id": "100017"
      //   }
      // }

      if (result.code != 0) {
        return Promise.reject();
      }

      var rst = {
        country: 'Other',
        province: 'Other',
        city: 'Other',
        district: 'Other',
        ext: result.data,
      };

      if (['CN', 'HK'].indexOf(result.data.country_id) != -1) {
        rst.country = 'China';

        if (result.data.country_id == 'HK') {
          rst.province = 'Hong Kong';
        }
      }

      return rst;
    });
  }

  // http://ip-api.com/
  // 限制： 未知
  fromIpApi(ip) {
    var  url = `http://ip-api.com/json/${ip}`;
    return this.request(url).then(result => {
      // status: success, fail
      // {
      //   "status": "success",
      //   "country": "COUNTRY",
      //   "countryCode": "COUNTRY CODE",
      //   "region": "REGION CODE",
      //   "regionName": "REGION NAME",
      //   "city": "CITY",
      //   "zip": "ZIP CODE",
      //   "lat": LATITUDE,
      //   "lon": LONGITUDE,
      //   "timezone": "TIME ZONE",
      //   "isp": "ISP NAME",
      //   "org": "ORGANIZATION NAME",
      //   "as": "AS NUMBER / NAME",
      //   "query": "IP ADDRESS USED FOR QUERY"
      // }

      if (result.status != 'success') {
        return Promise.reject();
      }

      var rst = {
        country: 'Other',
        province: 'Other',
        city: 'Other',
        district: 'Other',
        ext: result,
      };

      if (['CN', 'HK'].indexOf(result.countryCode) != -1) {
        rst.country = 'China';

        if (result.countryCode == 'HK') {
          rst.province = 'Hong Kong';
        }
      }

      return rst;
    });
  }

  // www.ipip.net
  // 限制：每秒5次
  fromIpIp(ip) {
    var  url = `http://freeapi.ipip.net/${ip}`;
    return this.request(url).then(result => {
      // ["法国","法国","","","orange.com"]

      if (!result[0]) {
        return Promise.reject();
      }

      var rst = {
        country: 'Other',
        province: 'Other',
        city: 'Other',
        district: 'Other',
        ext: result,
      };

      if (result[0].indexOf('中国') != -1) {
        rst.country = 'China';

        if (result[0].indexOf('香港') != -1) {
          rst.province = 'Hong Kong';
        }
      }

      return rst;
    });
  }

  // freegeoip.net
  // 限制：15,000 次每小时, 每秒4次
  fromFreeGeoIp(ip) {
    var  url = `http://freegeoip.net/json/${ip}`;
    return this.request(url).then(result => {
      // {
      //   "ip": "118.28.8.8",
      //   "country_code": "CN",
      //   "country_name": "China",
      //   "region_code": "12",
      //   "region_name": "Tianjin",
      //   "city": "Tianjin",
      //   "zip_code": "",
      //   "time_zone": "Asia/Shanghai",
      //   "latitude": 39.1422,
      //   "longitude": 117.1767,
      //   "metro_code": 0
      // }

      if (!result[0]) {
        return Promise.reject();
      }

      var rst = {
        country: 'Other',
        province: 'Other',
        city: 'Other',
        district: 'Other',
        ext: result,
      };

      if (['CN', 'HK'].indexOf(result.country_code) != -1) {
        rst.country = 'China';

        if (result.country_code == 'HK') {
          rst.province = 'Hong Kong';
        }
      }

      return rst;
    });
  }

  get(ip) {
    let rst;

    // sina
    rst = this.fromSina(ip);

    // taobao
    rst = rst.catch(() => {
      return this.fromTaobao(ip);
    });

    // ip-api
    rst = rst.catch(() => {
      return this.fromIpApi(ip);
    });

    // fromFreeGeoIp
    rst = rst.catch(() => {
      return this.fromFreeGeoIp(ip);
    });

    // ipip-net
    rst = rst.catch(() => {
      return this.fromIpIp(ip);
    });

    // not find
    rst = rst.catch(() => {
      return Promise.resolve({
        country: 'Other',
        province: 'Other',
        city: 'Other',
        district: 'Other',
        ext: null,
      });
    });

    return rst;
  }
}
