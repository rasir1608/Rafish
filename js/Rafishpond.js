// canvas 微型引擎 Rafishpond
var Rafishpond = (function() {
  return function(canvas, config = {}) {
    this.config = undefined;
    var renderTimer;
    var fishList = [];
    let can = canvas;
    this.config = config;
    if (typeof canvas === "string") {
      can = document.getElementById(canvas);
    }
    for (key in config) {
      if (["width", "height"].includes(key)) {
        can[key] = config[key];
      }
    }
    this.canvas = can;
    this.ctx = can.getContext("2d");
    function Fish(itemConfig) {
      this.key = itemConfig.key;
      this.update = itemConfig.update;
      this.config = itemConfig;
      this.render = itemConfig.render;
    }

    if (!Rafishpond.prototype.initPlat) {
      Rafishpond.prototype.setConfig = function(config = {}) {
        this.config = Object.assign(this.config, config);
        for (key in config) {
          if (["width", "height"].includes(key)) {
            this.canvas[key] = this.config[key];
          }
        }
        this.startRender();
      };
      Rafishpond.prototype.startRender = function() {
        if (renderTimer) clearTimeout(renderTimer);
        if (!this.ctx) {
          throw new Error("请先初始化！");
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        var config = this.config || {};
        if (config.beforUpdate) {
          if (Array.isArray(config.beforUpdate)) {
            config.beforUpdate.forEach(update => {
              update(this);
            });
          } else {
            config.beforUpdate(this);
          }
        }
        renderAllFish(fishList, this);
        if (config.afterUpdate) {
          if (Array.isArray(config.afterUpdate)) {
            config.afterUpdate.forEach(update => {
              update(this, config);
            });
          } else {
            config.afterUpdate(this, config);
          }
        }
        renderTimer = setTimeout(() => {
          this.startRender();
        }, config.interval || 100);
      };
      Rafishpond.prototype.pause = function() {
        if (renderTimer) clearTimeout(renderTimer);
      };
      Rafishpond.prototype.addItem = function(itemConfig, immediately) {
        if (!itemConfig || !itemConfig.key || !itemConfig.render) {
          throw new Error("缺少关键信息！");
        }
        fishList.push(new Fish(itemConfig));
        if (immediately) this.startRender();
      };
      Rafishpond.prototype.removeItem = function(key, immediately) {
        fishList = fishList.filter(item => item.key !== key);
        if (immediately) this.startRender();
      };
      Rafishpond.prototype.updateItem = function(config, immediately) {
        const index = fishList.findIndex(item => item.key === config.key);
        fishList.splice(index, 1, new Fish(config));
        if (immediately) this.startRender();
      };
    }
  };
})();

function renderAllFish(list, context, pre) {
  list.forEach(item => {
    item.config.rafishpond = context;
    item.config.preConfig = pre;
    if (!(item.config || {}).pause && item.update) item.update(item.config);
    item.render(item.config);
    var children = item.children;
    if (children && Array.isArray(children) && children.length > 0) {
      renderAllFish(children, context, item.config);
    }
  });
}
