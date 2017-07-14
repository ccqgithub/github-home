// 动态加载百度地图
export function loadBMap(callback){
  let callbacks = [];

  // 已经加载
  if (typeof BMap == 'object') {
    return callback();
  }

  callbacks.push(callback);

  // 正则加载
  if (callbacks.length > 1) return;

  window.baidu_map_load_back = () => {
    while(callbacks.length) {
      callbacks.shift()();
    }
  }

  let script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "https://api.map.baidu.com/api?v=2.0&s=1&ak=BAIDU_MAP_AK&callback=baidu_map_load_back";
  document.body.appendChild(script);
}
