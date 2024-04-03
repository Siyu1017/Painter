function getTriangleArea(p1, p2, p3) {
    return Math.abs((p1.x * (p2.y - p3.y) + p2.x * (p3.y - p1.y) + p3.x * (p1.y - p2.y)) / 2);
}

function simplifyVW(points, threshold) {
    var areas = [];

    // 计算每个点的三角形面积
    for (var i = 1; i < points.length - 1; i++) {
        var area = getTriangleArea(points[i - 1], points[i], points[i + 1]);
        areas.push(area);
    }

    // 根据面积排序，并删除面积最小的点
    while (areas.length > 0 && Math.min(...areas) < threshold) {
        var minIndex = areas.indexOf(Math.min(...areas));
        points.splice(minIndex + 1, 1);
        areas.splice(minIndex, 1);
    }

    return points;
}

export default function VisvalingamWhyatt(points, ctx) {
    var simplifiedPoints = simplifyVW(points, 1); // 调整阈值的值以控制简化程度

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