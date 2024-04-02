/**
 * 藉由座標變動取得方向
 * @param {Number} dx 
 * @param {Number} dy 
 * @returns {String}
 */

function getDirection(dx, dy) {
    var res = [];
    if (dx > 0) {
        res[1] = "right";
    } else if (dx < 0) {
        res[1] = "left";
    }
    if (dy > 0) {
        res[0] = "bottom";
    } else if (dy < 0) {
        res[0] = "top";
    }
    return res;
}

function getChunk(vals) {
    var currentX = "";
    var currentY = "";
    var chunks = [];
    var x = [];
    var y = [];
    var VFP = [];
    vals.forEach(v => {
        x.push(v.x);
        y.push(v.y);
    });
    vals.forEach((v, i) => {
        if (i == 0 && i + 1 != vals.length) {
            getDirection(vals[i + 1].x - v.x, vals[i + 1].y - v.y)
        }
    })
}