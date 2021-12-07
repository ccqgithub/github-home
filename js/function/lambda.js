const staticFileList = ["/apple-app-site-association"];

const isPageRequest = (uri) => {
  if (staticFileList.indexOf(uri) !== -1) {
    return false;
  }
  const uriParts = uri.split("/");

  return uriParts[uriParts.length - 1].indexOf(".") === -1;
};

exports.handler = (event, _context, callback) => {
  const request = event.Records[0].cf.request;
  const originalUri = request.uri;

  // prerender check
  if (prerender.shouldShowPrerenderedPage(request)) {
    let originUrl = `${request.protocol}://${request.domainName}${request.uri}`;
    console.log('prerender full url:', originUrl);
    request.uri = `https://prerender.switch.site/${originUrl}`;
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

const prerender = {
  shouldShowPrerenderedPage(req) {
    let userAgent = req.headers['user-agent'] && req.headers['user-agent'].length ? req.headers['user-agent'][0].value : "";
    let isRequestingPrerenderedPage = false;
    let url = req.uri;

    if(!userAgent) return false;
    if(req.method != 'GET' && req.method != 'HEAD') return false;
    if(req.headers && req.headers['x-prerender']) return false;

    // 测试
    if (url.includes('_escaped_fragment_')) {
      isRequestingPrerenderedPage = true;
    }

    // 静态文件
    if (/\.\w+$/i.test(url)) return false;

    // 爬虫
    if (/"googlebot|bingbot|yandex|baiduspider|twitterbot|facebookexternalhit|rogerbot|linkedinbot|embedly|quora link preview|showyoubot|outbrain|pinterest\/0\.|pinterestbot|slackbot|vkShare|W3C_Validator|whatsapp"/i.test(userAgent)) {
      isRequestingPrerenderedPage = true;
    }

    return isRequestingPrerenderedPage;
  }
}
