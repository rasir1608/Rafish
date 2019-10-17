var Rainbow = (function() {
  return function(canvas, config = {}) {
    var renderTimer;
    var preRenderTime = 0;
    var RainItemList = [];
    var resourceMap = {};
    let can = canvas;
    if (typeof canvas === "string") {
      can = document.getElementById(canvas);
    }

    for (var key in config) {
      if (config.hasOwnProperty(key)) {
        if (["width", "height"].includes(key)) {
          can[key] = config[key];
        } else if (/^on/.test(key)) {
          can.addEventListener(
            key.replace(/^on/i, "").toLowerCase(),
            config[key]
          );
        } else if (
          ![
            "canvas",
            "key",
            "ctx",
            "setConfig",
            "startRender",
            "pause",
            "addItem",
            "removeItem",
            "updateItem"
          ].includes(key)
        ) {
          this[key] = config[key];
        }
      }
    }

    this.canvas = can;
    this.isPause = true;
    this.ctx = can.getContext("2d");
    function Rain(itemConfig) {
      this.key = itemConfig.key;
      this.update = itemConfig.update;
      this.render = itemConfig.render;
      this.interval = itemConfig.interval || 200;
      for (var key in itemConfig) {
        if (itemConfig.hasOwnProperty(key)) {
          if (!["key", "update", "render"].includes(key)) {
            this[key] = itemConfig[key];
          }
        }
      }
    }

    if (!Rainbow.prototype.setConfig) {
      Rainbow.prototype.setConfig = function(config = {}) {
        for (var key in config) {
          if (["width", "height"].includes(key)) {
            this.canvas[key] = this.config[key];
          } else if (
            ![
              "canvas",
              "key",
              "ctx",
              "setConfig",
              "startRender",
              "pause",
              "addItem",
              "removeItem",
              "updateItem"
            ].includes(key)
          ) {
            this[key] = config[key];
          }
        }
        this.update();
      };
      Rainbow.prototype.setResourceMap = function(resMap, callback) {
        var index = 0;
        var resArray = [];
        for (var key in resMap) {
          if (resMap.hasOwnProperty(key)) {
            resMap[key]._rowkey = key;
            resArray.push(resMap[key]);
          }
        }
        var len = resArray.length;
        function initResource() {
          var res = resArray[index];
          if (res.type === "image") {
            var img = new Image();
            img.src = res.path;
            res.img = img;
            resourceMap[res._rowkey] = res.img;
            img.onload = function() {
              index++;
              callback(index, len, index === len);
              if (index < len) {
                initResource(resArray[index]);
              }
            };
          } else if (res.type === "text") {
            resourceMap[res._rowkey] = res.text;
            index++;
            callback(index, len, index === len);
            if (index < len) {
              initResource();
            }
          }
        }
        initResource();
      };
      Rainbow.prototype.getResource = function(key) {
        return resourceMap[key];
      };
      Rainbow.prototype.startRender = function() {
        this.isPause = false;
        this.update();
      };
      Rainbow.prototype.update = function() {
        // if (renderTimer) clearTimeout(renderTimer);
        if (this.isPause) return;
        // 300ms内的所有update会一次执行
        if (Date.now() - preRenderTime >= this.interval) {
          preRenderTime = Date.now();
          // renderTimer =
          setTimeout(() => {
            if (!this.ctx) {
              throw new Error("请先初始化！");
            }
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            if (this.beforUpdate) {
              if (Array.isArray(this.beforUpdate)) {
                this.beforUpdate.forEach(update => {
                  update(this);
                });
              } else {
                this.beforUpdate(this);
              }
            }
            RainItemList.sort((a, b) =>
              (a.zIndex || 0) - (b.zIndex || 0) > 0 ? 1 : -1
            ).forEach(item => {
              if (!item.pause && item.update) item.update(this, item);
              item.render(this, item);
            });
            if (this.afterUpdate) {
              if (Array.isArray(this.afterUpdate)) {
                this.afterUpdate.forEach(update => {
                  update(this);
                });
              } else {
                this.afterUpdate(this);
              }
            }
          }, this.interval);
          return;
        }
      };
      Rainbow.prototype.pause = function() {
        if (renderTimer) clearTimeout(renderTimer);
        this.isPause = true;
      };
      Rainbow.prototype.addItem = function(itemConfig) {
        if (!itemConfig || !itemConfig.key || !itemConfig.render) {
          throw new Error("缺少关键信息！");
        }
        RainItemList.push(new Rain(itemConfig));
        this.update();
      };
      Rainbow.prototype.removeItem = function(key) {
        RainItemList = RainItemList.filter(item => item.key !== key);
        this.update();
      };
      Rainbow.prototype.updateItem = function(config) {
        var item = RainItemList.find(item => item.key === config.key);
        for (var key in config) {
          if (config.hasOwnProperty(key)) {
            item[key] = config[key];
          }
        }
        this.update();
      };
      Rainbow.prototype.changeItem = function(config) {
        var index = RainItemList.findIndex(item => item.key === config.key);
        RainItemList.splice(index, 1, new Rain(config));
        this.update();
      };
      Rainbow.prototype.getItemList = function() {
        return deepColonObj(RainItemList);
      };
      Rainbow.prototype.destroy = function() {
        for (var key in config) {
          if (config.hasOwnProperty(key) && /^on/.test(key)) {
            this.canvas.removeEventListener(
              key.replace(/^on/i, "").toLowerCase(),
              config[key]
            );
          }
        }
        // this = null;
      };
    }
  };
})();

function deepColonObj(obj) {
  var colon = obj;
  if (Object.prototype.toString.apply(obj) === "[object Object]") {
    colon = {};
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        colon[key] = deepColonObj(obj[key]);
      }
    }
  } else if (Object.prototype.toString.apply(obj) === "[object Array]") {
    colon = [];
    obj.forEach(element => {
      colon.push(deepColonObj(element));
    });
  }
  return colon;
}
