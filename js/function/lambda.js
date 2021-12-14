const staticFileList = ["/apple-app-site-association"];

const isPageRequest = (uri) => {
  if (staticFileList.indexOf(uri) !== -1) {
    return false;
  }
  const uriParts = uri.split("/");

  return uriParts[uriParts.length - 1].indexOf(".") === -1;
};

const prerender = {
  shouldShowPrerenderedPage(req) {
    let userAgent = req.headers['user-agent'] && req.headers['user-agent'].length ? req.headers['user-agent'][0].value : "";
    let isRequestingPrerenderedPage = false;
    let queryString = req.querystring;
    let url = req.uri;

    if(!userAgent) return false;
    if(req.method != 'GET' && req.method != 'HEAD') return false;
    if(req.headers && req.headers['x-prerender']) return false;

    // 测试
    if (queryString.includes('_escaped_fragment_')) {
      isRequestingPrerenderedPage = true;
    }

    // 静态文件
    if (/\.\w+$/i.test(url) && !/\.html?/i.test(url)) return false;
    
    // prerender
    if (/Prerender/i.test(userAgent)) {
      return false;
    }

    // 爬虫
    if (/googlebot|bingbot|yandex|baiduspider|twitterbot|facebookexternalhit|rogerbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest\/0\.|pinterestbot|slackbot|vkShare|W3C_Validator|whatsapp/i.test(userAgent)) {
      isRequestingPrerenderedPage = true;
    }

    return isRequestingPrerenderedPage;
  }
}

exports.handler = (event, _context, callback) => {
  const request = event.Records[0].cf.request;
  const originalUri = request.uri;
  const headers = request.headers;

  const needPrerender = prerender.shouldShowPrerenderedPage(request);

  if (needPrerender) {
    let domain = 'www.test.site';
    if (/staging\./.test(headers['host'][0].value)) {
      domain = 'staging.test.site';
    }
    let originUrl = `https://${domain}${request.uri.replace("index.html", "")}?${request.querystring}`;
    const domainName = 'prerender.test.site';
    request.origin = {
      custom: {
        domainName: domainName,
        port: 443,
        protocol: 'https',
        readTimeout: 20,
        keepaliveTimeout: 5,
        customHeaders: {},
        sslProtocols: ['TLSv1', 'TLSv1.1'],
      }
    };
    request.headers['host'] = [{key: 'host', value: domainName}];
    request.uri = `/${encodeURIComponent(originUrl)}`;
    callback(null, request);
    return;
  }
  
  console.log(originalUri, "is page request:", isPageRequest(originalUri));

  if (isPageRequest(originalUri)) {
    const parts = originalUri.split("/");

    let uriPrefix = "";

    if (parts.length > 2) {
      switch (parts[1]) {
        case "feature":
        case "hotfix":
        case "release":
          uriPrefix = `/${parts[1]}/${parts[2]}`;
          break;
      }
    }
    
    request.uri = `${uriPrefix}/index.html`;
    
    console.log("in uri:", originalUri);
    console.log("out uri:", request.uri);
  }


  callback(null, request);
};
