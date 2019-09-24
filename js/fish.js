// 所有需要在canvas上绘制的元素都需要遵循rafishpond里面Fish的结构规则

/**
 *
 * @param {string} key  唯一标识，必须
 * @param {Function} update fish在更新时的一些数据处理 （fishConfig） 非必须
 * @param {Function} render fish在渲染时的动作 （fishConfig） fishConfig.rafishpond 中有 ctx 和 convas 用于绘画 必须
 * @param {Array} children  fish的子元素，所有子元素也必须遵循Fish结构
 *
 * fishConfig.preConfig 是指fish的父元素配置
 * fishConfig.rafishpond 是 rafishpond 的配置
 * fishConfig.rafishpond 中最重要的属性是 ctx和canvas,可以用于绘制图像
 */

function Bg(config) {
  this.key = config.key || "bg";
  this.color = config.color;
  this.render = function(bgConfig) {
    var canvas = bgConfig.rafishpond.canvas;
    var ctx = bgConfig.rafishpond.ctx;
    var w = canvas.width;
    var h = canvas.height;
    ctx.fillStyle = bgConfig.color;
    ctx.fillRect(0, 0, w, h);
  };
}
