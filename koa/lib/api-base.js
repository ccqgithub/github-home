const request = require('request');
const PassThrough = require('stream').PassThrough;

class API {
  constructor(config) {
    this.config = config;
  }

  request(config) {
    let conf = Object.assign({}, this.config, config);
    return new Promise((resolve, reject) => {
      let res = PassThrough();

      if (conf.responseType == 'stream') {
        request(conf)
        .on('response', function(response) {
          response.data = res;
          resolve(response)
        })
        .on('error', (error) => {
          reject({
            response: response,
            message: error,
          });
        })
        .pipe(res);

        return;
      }

      request(conf, (error, response, result) => {
        response.data = result;

        if (error) {
          return reject({
            response: response,
            message: error,
          });
        }

        resolve(response);
      });
    });
  }

  get(url, config) {
    return this.request(Object.assign({
      url: url,
      qs: config.params,
      json: true
    }, config));
  }

  post(url, data, config) {
    return this.request(Object.assign({
      url: url,
      qs: config.params,
      json: true,
      body: data
    }, config));
  }

  form(url, data, config) {
    return this.request(Object.assign({
      url: url,
      qs: config.params,
      json: true,
      form: data
    }, config));
  }

  formData(url, data, config) {
    return this.request(Object.assign({
      url: url,
      qs: config.params,
      json: true,
      formData: data
    }, config));
  }

  download(url, config) {
    return this.request(Object.assign({
      url: url,
      qs: config.params,
      json: false
    }, config));
  }

  downloadStream(url, config) {
    return this.request(Object.assign({
      url: url,
      qs: config.params,
      json: false,
      responseType: 'stream'
    }, config));
  }
}

module.exports = API;
