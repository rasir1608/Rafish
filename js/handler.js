var layout;
var rainbow = new Rainbow("game-plat", {
  width: 600,
  height: 400,
  interval: 100,
  onClick: function getCell(event) {
    event = event || window.event;
    var x = event.offsetX,
      y = event.offsetY;
    var cell = layout.getCellByPos(x, y);
    if (cell && !cell.isOpen) {
      cell.onOpen(rainbow);
      setTimeout(() => {
        aiStep();
      }, 1000);
    }
  },
  beforUpdate: [
    function() {
      console.log("beforUpdate");
    }
  ],
  afterUpdate: [
    function() {
      console.log("afterUpdate");
    }
  ]
});

rainbow.setResourceMap(
  {
    beach_jpg: {
      type: "image",
      path: "./image/beach.jpg"
    },
    hello: {
      type: "text",
      text: "hello world"
    },
    dig: {
      type: "image",
      path: "./image/dig.png"
    }
  },
  function(index, len, isCompelate) {
    if (isCompelate) {
      rainbow.addItem(
        new Bg({
          key: "bg",
          img: rainbow.getResource("beach_jpg")
        })
      );
    }
  }
);

layout = new Layout({
  width: rainbow.canvas.width * 0.8,
  height: rainbow.canvas.height * 0.8,
  start: {
    x: rainbow.canvas.width * 0.1,
    y: rainbow.canvas.height * 0.1
  },
  num: 20,
  eventNum: 20
});

layout.dividerList.forEach(divider => {
  rainbow.addItem(divider);
});
layout.cellList.forEach(cell => {
  rainbow.addItem(cell);
});

rainbow.startRender();

function aiStep() {
  var scoreList = layout.cellList
    .filter(cell => !cell.isOpen)
    .map(cell => {
      return {
        cell,
        score: cell.getNeighbors().filter(nb => nb.isOpen && nb.text).length
      };
    })
    .sort((a, b) => (a.score - b.score > 0 ? 1 : -1));
  var minScore = scoreList.shift();
  var maxScore = scoreList.pop();
  var bestScore;
  if (minScore.score === maxScore.score) {
    bestScore = scoreList[beanTools.getRandInt(0, scoreList.length)];
  } else {
    bestScore = maxScore;
  }
  if (bestScore) {
    bestScore.cell.onOpen(rainbow);
  }
}
