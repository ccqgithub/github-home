// 动态加载谷歌地图
export function loadGMap(callback){
  let callbacks = [];

  // 已经加载
  if (typeof google == 'object' && google.maps) {
    return callback();
  }

  callbacks.push(callback);

  // 正则加载
  if (callbacks.length > 1) return;

  let script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "http://maps.google.cn/maps/api/js?key=GOOGLE_MAP_AK";
  document.body.appendChild(script);
  
  script.onload = script.onreadystatechange = function() {
   if (
     !this.readyState ||
     this.readyState === "loaded" ||
     this.readyState === "complete"
   ) {
      // callbacks
      while(callbacks.length) {
        callbacks.shift()();
      }

      // unbind
      script.onload = script.onreadystatechange = null;
   }
  };
}
