function getDistance(pt, lineStart, lineEnd) {
    var dx = lineEnd.x - lineStart.x;
    var dy = lineEnd.y - lineStart.y;
    var normalLength = Math.sqrt(dx * dx + dy * dy);
    var distance = (dy * pt.x - dx * pt.y + lineEnd.x * lineStart.y - lineEnd.y * lineStart.x) / normalLength;
    return Math.abs(distance);
}

function simplify(points, epsilon) {
    var dmax = 0;
    var index = 0;

    for (var i = 1; i < points.length - 1; i++) {
        var d = getDistance(points[i], points[0], points[points.length - 1]);
        if (d > dmax) {
            dmax = d;
            index = i;
        }
    }

    if (dmax > epsilon) {
        var left = points.slice(0, index + 1);
        var right = points.slice(index);
        var simplifiedLeft = simplify(left, epsilon);
        var simplifiedRight = simplify(right, epsilon);

        return simplifiedLeft.slice(0, simplifiedLeft.length - 1).concat(simplifiedRight);
    }

    return [points[0], points[points.length - 1]];
}

export default function RamerDouglasPeucker(points, ctx) {
    var simplifiedPoints = simplify(points, 5);

    ctx.beginPath();
    ctx.moveTo(simplifiedPoints[0].x, simplifiedPoints[0].y);

    for (var i = 1; i < simplifiedPoints.length - 1; i++) {
        var xc = (simplifiedPoints[i].x + simplifiedPoints[i + 1].x) / 2;
        var yc = (simplifiedPoints[i].y + simplifiedPoints[i + 1].y) / 2;
        ctx.quadraticCurveTo(simplifiedPoints[i].x, simplifiedPoints[i].y, xc, yc);
    }

    ctx.lineTo(simplifiedPoints[simplifiedPoints.length - 1].x, simplifiedPoints[simplifiedPoints.length - 1].y);
    ctx.stroke();
}