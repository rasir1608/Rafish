var beanTools = {
  getRandInt: function(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  },

  getEventRandInt: function(max, eventNum) {
    var eventNumList = [];
    while (eventNumList.length < eventNum) {
      var num = this.getRandInt(0, max);
      if (!eventNumList.includes(num)) {
        eventNumList.push(num);
      }
    }
    return eventNumList;
  }
};
function Bg(config) {
  this.key = config.key || "bg";
  this.img = config.img;
  this.zIndex = config.zIndex;
  this.render = function(rainbow) {
    var canvas = rainbow.canvas;
    var ctx = rainbow.ctx;
    var w = canvas.width;
    var h = canvas.height;
    ctx.save();
    ctx.drawImage(this.img, 0, 0, w, h);
    ctx.restore();
  };
}

function Cell(config) {
  this.key = config.key;
  this.text = config.text;
  this.isOpen = config.isOpen || false;
  this.type = config.type; // 1 空格 2 文字格 3 事件格
  this.x = config.x;
  this.y = config.y;
  this.width = config.width;
  this.height = config.height;
  this.color = "rgba(0,255,0,1)";
  this.opcityColor = "rgba(50,125,125,0.5)";
  this.isPause = false;
  this.fontSize = 12;
  this.eventType = "宝藏";
  this.pos = config.pos;
  var neighbors = config.neighbors;
  this.zIndex = config.zIndex;

  this.setNeighbors = function(neighborList) {
    neighbors = neighborList;
    if (this.type === 3) return;
    this.text = neighbors.filter(item => item.type === 3).length;
    if (this.text > 0) {
      this.text = this.text + "";
      this.type = 2;
    } else {
      this.text === "";
      this.type = 1;
    }
  };
  this.getNeighbors = function() {
    return neighbors;
  };
  this.render = function(rainbow) {
    var ctx = rainbow.ctx;
    ctx.save();
    // 绘制底色
    if (this.isOpen) ctx.fillStyle = this.opcityColor;
    else ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    // 如果是打开状态 需要绘制相应的提示 比如文字 宝藏 怪兽 事件等；
    if (this.isOpen) {
      if (this.type === 2) {
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(0,0,0,1)";
        ctx.fillText(
          this.text,
          this.x + this.width / 2,
          this.y + this.height / 2
        );
      } else if (this.type === 3) {
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillStyle = "rgba(0,0,0,1)";
        ctx.fillText(
          this.eventType,
          this.x + this.width / 2,
          this.y + this.height / 2
        );
      }
    }
    ctx.restore();
  };
  this.onOpen = function(rainbow) {
    this.isOpen = true;
    if (this.type === 3) {
      this.eventType = ["宝藏", "怪兽", "事件"][beanTools.getRandInt(0, 3)];
    } else if (this.type === 1) {
      neighbors.forEach(item => {
        if (item.isOpen) {
          return;
        }

        item.onOpen(rainbow);
      });
    }
    rainbow.updateItem(this);
  };
}

function Divider(config) {
  this.key = config.key;
  this.color = "#000";
  this.x = config.x;
  this.y = config.y;
  this.width = config.width;
  this.height = config.height;
  this.zIndex = config.zIndex;
  this.render = function() {
    var ctx = rainbow.ctx;
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.restore();
  };
}

function Layout(config) {
  var w = config.width,
    h = config.height,
    hn = config.num,
    sx = config.start.x,
    sy = config.start.y,
    eventNum = config.eventNum || 5,
    vn = 0,
    eventNumList = [],
    dividerList = [],
    cellList = [];
  var dividerW = 2;

  var cellSize = Math.round((w - dividerW) / hn) - dividerW;
  vn = Math.round((h - dividerW) / (cellSize + dividerW));
  var realW = (cellSize + dividerW) * hn + dividerW,
    realH = (cellSize + dividerW) * vn + dividerW;
  eventNumList = beanTools.getEventRandInt(vn * hn, eventNum);
  // 列号
  for (var i = 0; i < hn; i++) {
    // 添加竖线
    dividerList.push(
      new Divider({
        key: `divider_${i}_0`,
        x: sx + i * (cellSize + dividerW),
        y: sy,
        width: dividerW,
        height: realH,
        zIndex: 1
      })
    );
    // 行号
    for (var j = 0; j < vn; j++) {
      if (i === 0) {
        // 添加横线
        dividerList.push(
          new Divider({
            key: `divider_0_${j}`,
            x: sx,
            y: sy + j * (cellSize + dividerW),
            width: realW,
            height: dividerW,
            zIndex: 1
          })
        );
      }
      cellList.push(
        new Cell({
          key: `cell_${i}_${j}`,
          pos: { x: i, y: j },
          type: eventNumList.includes(i + j * hn) ? 3 : null,
          x: sx + dividerW + i * (cellSize + dividerW),
          y: sy + dividerW + j * (cellSize + dividerW),
          width: cellSize,
          height: cellSize,
          isOpen: false,
          zIndex: 3 + i + j * hn
        })
      );
    }
  }
  // 添加最后一根竖线
  dividerList.push(
    new Divider({
      key: `divider_${hn}_0`,
      x: sx + hn * (cellSize + dividerW),
      y: sy,
      width: dividerW,
      height: realH,
      zIndex: 1
    })
  );
  // 添加最后一根横线
  dividerList.push(
    new Divider({
      key: `divider_0_${vn}`,
      x: sx,
      y: sy + vn * (cellSize + dividerW),
      width: realW,
      height: dividerW,
      zIndex: 1
    })
  );
  // 为每一个cell设定neighbors
  cellList.forEach(cell => {
    var posX = cell.pos.x,
      posY = cell.pos.y;
    var topPos = { x: posX, y: posY - 1 },
      leftPos = { x: posX - 1, y: posY },
      rightPos = { x: posX + 1, y: posY },
      bottomPos = { x: posX, y: posY + 1 },
      topLeftPos = { x: posX - 1, y: posY - 1 },
      topRightPos = { x: posX + 1, y: posY - 1 },
      bottomLeftPos = { x: posX - 1, y: posY + 1 },
      bottomRightPos = { x: posX + 1, y: posY + 1 };
    var neighborPosList = [
      topPos,
      leftPos,
      rightPos,
      bottomPos,
      topLeftPos,
      topRightPos,
      bottomLeftPos,
      bottomRightPos
    ];
    var neighbors = cellList.filter(cItem =>
      neighborPosList.some(
        pos => cItem.pos.x === pos.x && cItem.pos.y === pos.y
      )
    );
    cell.setNeighbors(neighbors);
  });
  this.cellList = cellList;
  this.dividerList = dividerList;
  this.x = sx;
  this.y = sy;
  this.width = realW;
  this.height = realH;
  this.cellSize = cellSize;
  this.dividerSize = dividerW;
  this.zIndex = config.zIndex;
  if (!Layout.prototype.getCellByPos) {
    Layout.prototype.getCellByPos = function(x, y) {
      if (
        !(
          x > this.x &&
          x < this.x + this.width &&
          y > this.y &&
          y < this.y + this.height
        )
      ) {
        return null;
      }
      return this.cellList.find(
        cell =>
          x > cell.x &&
          x < cell.x + cell.width &&
          y > cell.y &&
          y < cell.y + cell.height
      );
    };
  }
}
