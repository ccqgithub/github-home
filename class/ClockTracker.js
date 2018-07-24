export class ClockTracker {
  constructor(opts={}) {
     // 鼠标事件绑定的元素
    this.el = opts.el;
    // 用来确定圆心的元素
    this.centerEl = opts.centerEl || opts.el;
    // 区域个数
    this.count = opts.count || 10;
    // 防抖动
    this.debounce = opts.debounce || 200;
    // 选区更改事件
    this.onMove = opts.onMove || function() {};
    // 选区移除
    this.onOut = opts.onOut || function() {};
    // 选区移入
    this.onIn = opts.onIn || function() {};
    // 内径圆，数组或者百分比
    this.innerRadius = opts.innerRadius || 0;

    this.isActive = true;
    this.isEnter = false;
    this.lastState = null;
  
    this.init();
  }

  init() {
    this.el.addEventListener('mouseenter', (e) => {
      this.calcPosition({x: e.pageX, y: e.pageY});
    });

    this.el.addEventListener('mousemove', debounce((e) => {
      this.calcPosition({x: e.pageX, y: e.pageY});
    }, this.debounce));

    this.el.addEventListener('mouseleave', (e) => {
      if (!this.isEnter) return;
      if (!this.isActive) return;
      this.onOut();
    });
  }

  getInnerRadius(r) {
    let innerRadius = this.innerRadius + '';
    if (innerRadius.charAt(innerRadius.length - 1) == '%') {
      return Number(innerRadius.substring(0, -1)) / 100 * r;
    }
    return Number(innerRadius);
  }

  calcPosition(point) {
    let centerReact = this.centerEl.getBoundingClientRect();
    let center = {
      x: centerReact.left + centerReact.width / 2,
      y: centerReact.top + centerReact.height / 2
    };
    let centerRadius = centerReact.width / 2;
    let innerRadius = this.getInnerRadius(centerRadius);

    let pX = point.x - center.x;
    let pY = -(point.y - center.y);
    let deg = Math.atan2(pY, pX) * (180 / Math.PI);
    let radius = Math.sqrt(pX * pX + pY * pY);
    let isInCircle = radius <= centerRadius;
    let isInner = radius < innerRadius;
    let unitDeg = 360 / this.count;
    let index = Math.floor((deg + unitDeg / 2) / unitDeg);

    if (index < 0) index = this.count + index;

    this.lastState = {
      deg: deg,
      index: index,
      isInCircle: isInCircle,
      isInner: isInner
    };

    if (!this.isActive) return;

    if (isInCircle) {
      this.isEnter = true;
      this.onIn(this.lastState);
    }

    this.onMove(this.lastState);
    
    if (!isInCircle) {
      if (!this.isEnter) return;
      this.isEnter = false;
      this.onOut(this.lastState);
    }
  }

  pause() {
    this.isActive = false;
  }

  play() {
    this.isActive = true;
  }
}

// 防抖动
export function debounce(fn, delay, prepose) {
  let timer, last_exec = 0;
  return function() {
    let that = this,
      args = arguments,
      diff,
      exec = function() {
        last_exec = +new Date();
        fn.apply(that, args);
      };
    timer && clearTimeout(timer);
    if (prepose) {
      diff = delay - (+new Date() - last_exec);
      diff <= 0 && exec();
    } else {
      timer = setTimeout(exec, delay);
    }
  }
};

// =========== demo: ============ //

// const Clock = {
//   init() {
//     let self = this;

//     this.status = 'small';
//     this.$clock = $('#clock');
//     this.tracker = new ClockTracker({
//       el: this.$clock[0],
//       radius: 200,
//       count: 8,
//       onMove(data) {
//         self.$clock.find('div').html(data.index);
//       },
//       onOut() {
//         console.log('onOut')
//         if (self.status == 'small') return;
//         self.status = 'small';
//         self.tracker.pause();
//         self.$clock.removeClass('big');
//         self.$clock.on('transitionend', self.transitionEnd);
//       },
//       onIn(data) {
//         if (self.status == 'big') return;
//         self.status = 'big';
//         self.tracker.pause();
//         self.$clock.addClass('big');
//         self.$clock.on('transitionend', self.transitionEnd);
//       }
//     });

//     this.transitionEnd = function() {
//       console.log('transitionend')
//       self.$clock.off('transitionend');
//       self.tracker.play();
//     }
//   }
// }

// Clock.init();
