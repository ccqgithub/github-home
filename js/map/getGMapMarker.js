// 获取谷歌地图覆盖物
export function getGMapMarker() {
  if (typeof google != 'object' || !google.maps) {
    console.log('google map is not install');
    return null;
  }

  //I am adding a custom map marker !!!!
  function CustomMarker(latlng, map, args) {
    this.latlng = latlng;
    this.args = {
      text: '',
      link: '',
      ...args
    };
    this.setMap(map);
  }

  CustomMarker.prototype = new google.maps.OverlayView();

  CustomMarker.prototype.setArg = function(arg, val) {
    this.args[arg] = val;
  }

  CustomMarker.prototype.draw = function() {

    let self = this;

    let div = this._div;

    if (!div) {
      let rotate = Math.round(Math.random() * 90 - 90);
      div = this._div = document.createElement("div");

      div.className = "marker map-loc" + " " + "map-" + this._name;
      div.innerHTML = this.args.text;
      div.style.transform = `rotateZ(${rotate}deg)`;

      div.addEventListener('click', () => {
        if (this.args.link) window.open(this.args.link);
      });

      div.addEventListener('touchend', () => {
        if (this.args.link) window.open(this.args.link);
      });

      let panes = this.getPanes();
      panes.overlayImage.appendChild(div);
    }

    let point = this.getProjection().fromLatLngToDivPixel(this.latlng);

    if (point) {
      div.style.left = (point.x - 0) + 'px';
      div.style.top = (point.y - 35) + 'px';
    }
  };

  CustomMarker.prototype.remove = function() {
    if (this._div) {
      this._div.parentNode.removeChild(this._div);
      this._div = null;
    }
  };

  CustomMarker.prototype.getPosition = function() {
    return this.latlng;
  };

  return CustomMarker;
}
