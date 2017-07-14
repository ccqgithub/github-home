// 获取百度地图覆盖物
export function getBMapOverlay() {
  if (typeof BMap != 'object') {
    console.log('baidu map is not install');
    return null;
  }

  function BMapOverlay(point, text, link) {
    this._point = point;
    this._text = text;
    this._link = link;
  }

  BMapOverlay.prototype = new BMap.Overlay();
  BMapOverlay.prototype.initialize = function(map) {
    let rotate = Math.round(Math.random() * 90 - 90);
    this._map = map;
    var div = this._div = document.createElement("div");

    div.className = "map-loc" + " " + "map-" + this._name;
    div.innerHTML = this._text;
    div.style.transform = `rotateZ(${rotate}deg)`;

    div.addEventListener('click', () => {
      if (this._link) window.open(this._link);
    });

    div.addEventListener('touchend', () => {
      if (this._link) window.open(this._link);
    });

    map.getPanes().labelPane.appendChild(div);
    return div;
  }

  BMapOverlay.prototype.draw = function() {
    var map = this._map;
    var pixel = map.pointToOverlayPixel(this._point);
    this._div.style.left = pixel.x + "px";
    this._div.style.top = pixel.y - 35 + "px";
  }

  return BMapOverlay;
}
