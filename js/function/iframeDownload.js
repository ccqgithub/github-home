export function iframeDownload(url, data, options={}) {
  const opts = {
    iframeName: '__iframe_downloader__',
    method: 'get',
    ...options,
  };

  // create iframe if not exist
  if (!document.querySelector(`iframe[name="${opts.iframeName}"]`)) {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.name = opts.iframeName;
    document.body.appendChild(iframe);
  }

  // create form
  const form = document.createElement("form");
  form.style.display = "none";
  form.target = opts.iframeName;
  form.method = opts.method;
  form.acceptCharset = "utf-8";
  form.action = url;

  // 通过form发送json数据请参考  https://darobin.github.io/formic/specs/json/
  const traverse = (obj, key) => {
    key = key || "";
    const result = [];
    for (let prop in obj) {
      const value = obj[prop];
      typeof value === "object"
        ? result.push.apply(result, traverse(value, key + "[" + prop + "]"))
        : result.push({ name: key ? key + "[" + prop + "]" : prop, value: value });
    }
    return result;
  };

  const inputs = document.createDocumentFragment();
  const fields = traverse(data);
  fields.forEach(field => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = field.name;
    input.value = field.value;
    inputs.appendChild(input);
  });

  form.appendChild(inputs);
  document.body.appendChild(form);
  form.submit();
  // document.body.removeChild(form);
};
