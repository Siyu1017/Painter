"use strict";

import dragger from "./dragger.min.js";
import createHDCanvas from "./hdcanvas.js";
import DouglasPeucker from "./DouglasPeucker.js";
import RamerDouglasPeucker from "./RamerDouglasPeucker.js";
import VisvalingamWhyatt from "./VisvalingamWhyatt.js";
// importScript("./lineWorker.js");

var colors = ['rgb(0, 0, 0)', 'rgb(38, 38, 38)', 'rgb(89, 89, 89)', 'rgb(140, 140, 140)', 'rgb(191, 191, 191)', 'rgb(217, 217, 217)', 'rgb(233, 233, 233)', 'rgb(245, 245, 245)', 'rgb(250, 250, 250)', 'rgb(255, 255, 255)', 'rgb(225, 60, 57)', 'rgb(231, 95, 51)', 'rgb(235, 144, 58)', 'rgb(245, 219, 77)', 'rgb(114, 192, 64)', 'rgb(89, 191, 192)', 'rgb(66, 144, 247)', 'rgb(54, 88, 226)', 'rgb(106, 57, 201)', 'rgb(216, 68, 147)', 'rgb(251, 233, 230)', 'rgb(252, 237, 225)', 'rgb(252, 239, 212)', 'rgb(252, 251, 207)', 'rgb(231, 246, 213)', 'rgb(218, 244, 240)', 'rgb(217, 237, 250)', 'rgb(224, 232, 250)', 'rgb(237, 225, 248)', 'rgb(246, 226, 234)', 'rgb(255, 163, 158)', 'rgb(255, 187, 150)', 'rgb(255, 213, 145)', 'rgb(255, 251, 143)', 'rgb(183, 235, 143)', 'rgb(135, 232, 222)', 'rgb(145, 213, 255)', 'rgb(173, 198, 255)', 'rgb(211, 173, 247)', 'rgb(255, 173, 210)', 'rgb(255, 77, 79)', 'rgb(255, 122, 69)', 'rgb(255, 169, 64)', 'rgb(255, 236, 61)', 'rgb(115, 209, 61)', 'rgb(54, 207, 201)', 'rgb(64, 169, 255)', 'rgb(89, 126, 247)', 'rgb(146, 84, 222)', 'rgb(247, 89, 171)', 'rgb(207, 19, 34)', 'rgb(212, 56, 13)', 'rgb(212, 107, 8)', 'rgb(212, 177, 6)', 'rgb(56, 158, 13)', 'rgb(8, 151, 156)', 'rgb(9, 109, 217)', 'rgb(29, 57, 196)', 'rgb(83, 29, 171)', 'rgb(196, 29, 127)', 'rgb(130, 0, 20)', 'rgb(135, 20, 0)', 'rgb(135, 56, 0)', 'rgb(97, 71, 0)', 'rgb(19, 82, 0)', 'rgb(0, 71, 79)', 'rgb(0, 58, 140)', 'rgb(6, 17, 120)', 'rgb(34, 7, 94)', 'rgb(120, 6, 80)'];

var Datas = {
    CanvasSize: {
        width: 480,
        height: 320
    },
    Objects: [],
    Status: {
        drawing: false,
        mode: "draw",
        selected: false,
        dragging: false
    },
    Style: {
        Stroke: {
            Color: colors[36],
            Size: 8
        },
        Fill: {
            Color: "#000"
        }
    },
    Temp: {
        Mouse: {
            x: 0,
            y: 0
        },
        Points: [],
        Objects: [],
        ExtremeValue: {
            x: [0, 0],
            y: [0, 0]
        },
        DIndex: 0,
        History: []
    },
    Limit: {
        max: 48,
        min: 1
    },
    Algorithm: "DouglasPeucker"
}

/***********************************************************************
Objects
{
    position: {
        x: 0,
        y: 0
    },
    size: {
        width: 0,
        height: 0
    },
    style: {
        strokeColor: "#000",
        strokeWidth: "#000"
    },
    points: [],
    image: "image url",
    rotate: 0,
    scale: 1
}
 ***********************************************************************/

var $ = (s, a) => { return a == true ? document.querySelectorAll(s) : document.querySelector(s); };

var showActionPopup = false;
var focused_obj = null;

$('[data-mode="select"]').addEventListener("click", () => {
    Datas.Status.mode = "select";
})

$('[data-mode="draw"]').addEventListener("click", () => {
    Datas.Status.mode = "draw";
    focused_obj = null;
    createHDCanvas(mp, Datas.CanvasSize.width, Datas.CanvasSize.height);
    createHDCanvas(select, Datas.CanvasSize.width, Datas.CanvasSize.height);
})

document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
})

var moving_selected_obj = false;
var selected_obj = null;
var selected_index = 0;

window.addEventListener("keydown", (e) => {
    if (e.ctrlKey) {
        e.preventDefault();
        if (moving_selected_obj == true) {
            return;
        }
        if (e.key == "z") {
            return draw.undo();
        } else if (e.key == "y") {
            return draw.redo();
        } else if (e.shiftKey && e.key == "S") {
            return download();
        }
    }
})

$(".action", true).forEach(e => {
    e.addEventListener("click", () => {
        showActionPopup = true;
        $(".action-popup.active", true).forEach(p => {
            p.classList.remove("active");
        })
        $(`[action-popup="${e.getAttribute("data-action")}"]`).classList.add("active");
    });

    e.addEventListener("mousemove", () => {
        if (showActionPopup == true) {
            $(".action-popup.active", true).forEach(p => {
                p.classList.remove("active");
            })
            $(".action.active", true).forEach(p => {
                p.classList.remove("active");
            })
            e.classList.add("active");
            $(`[action-popup="${e.getAttribute("data-action")}"]`).classList.add("active");
        }
    });
});

document.addEventListener("mousedown", (e) => {
    var t = false;
    $(".action", true).forEach(a => {
        if (a.contains(e.target)) {
            t = true;
        }
    })
    if (t == true) return;
    var has = false;
    $(".action.popup", true).forEach(p => {
        if (p.contains(e.target)) {
            has = true;
        }
    })
    if (has == false && showActionPopup == true) {
        showActionPopup = false;
        $(".action.active", true).forEach(p => {
            p.classList.remove("active");
        })
        $(".action-popup.active", true).forEach(a => {
            a.classList.remove("active");
        })
    }
})


$(".mode", true).forEach(mode => {
    mode.addEventListener("click", () => {
        $(".mode.active", true).forEach(active => {
            active.classList.remove("active");
        })
        $(".mode-popup.active", true).forEach(popup => {
            popup.classList.remove("active");
        })
        mode.classList.add("active");
        mode.querySelector(".mode-popup") ? mode.querySelector(".mode-popup").classList.add("active") : null;
    })

    /*e.addEventListener("click", (evt) => {
        if (e.getAttribute("data-popup")) {
            if (!$(`[popup-name="${e.getAttribute("data-popup")}"]`).contains(evt.target)) {
                $(`[popup-name="${e.getAttribute("data-popup")}"]`).classList.toggle("active");
            }
        }
    });*/
});

document.addEventListener("mousedown", (e) => {
    var popup = false;
    var trigger = false;
    $("[popup-name]", true).forEach(p => {
        if (p.contains(e.target)) {
            popup = true;
        }
    })
    $(".mode", true).forEach(m => {
        if (m.contains(e.target)) {
            trigger = true;
        }
    })
    if (popup == false) {
        if (trigger == true) return;
        $(".mode-popup.active", true).forEach(p => {
            p.classList.remove("active");
        })
    }
});

$("#size").value = Datas.Style.Stroke.Size;

$("#size").addEventListener("change", () => {
    if ($("#size").value < Datas.Limit.min) {
        $("#size").value = Datas.Limit.min;
    }
    if ($("#size").value > Datas.Limit.max) {
        $("#size").value = Datas.Limit.max;
    }
    Datas.Style.Stroke.Size = $("#size").value;
});

$("#preview-color").style.background = Datas.Style.Stroke.Color;

$("[data-select-group-parent]", true).forEach(g => {
    $(`[data-select-group="${g.getAttribute("data-select-group-parent")}"]`, true).forEach(s => {
        s.addEventListener("click", () => {
            $(`[data-select-group="${s.getAttribute("data-select-group")}"].selected`, true).forEach(sed => {
                sed.classList.remove("selected");
            })
            s.classList.add("selected");
            Datas.Algorithm = s.getAttribute("data-select-value");
        })
    })
})

colors.forEach((c, i) => {
    var li = document.createElement("li");
    li.setAttribute("data-value", c);
    li.className = "color-block";
    li.innerHTML = `<div class="color-block-inner" style="background-color: ${c}"></div>`;
    li.addEventListener("click", () => {
        $("#preview-color").style.background = c;
        Datas.Style.Stroke.Color = c;
    })
    $("#colors").appendChild(li);
})

function drawPoints(el, value, reserve, useCurrent) {
    var canvas = el;
    var data = value;
    if (reserve != true) {
        createHDCanvas(canvas, Datas.CanvasSize.width, Datas.CanvasSize.height);
    }
    const ctx = canvas.getContext("2d");
    if (useCurrent == 1) {
        ctx.lineWidth = Datas.Style.Stroke.Size;
        ctx.strokeStyle = Datas.Style.Stroke.Color;
        ctx.fillStyle = Datas.Style.Stroke.Color;
        var temp = data;
        data = {};
        data.points = temp;
        data.algorithm = Datas.Algorithm;
    } else {
        ctx.lineWidth = data.style.strokeWidth;
        ctx.strokeStyle = data.style.strokeColor;
        ctx.fillStyle = Datas.Style.Stroke.Color;
    }
    ctx.imageSmoothingEnabled = true;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    if (data.points.length == 0) return;
    if (data.points.length == 1) {
        ctx.beginPath();
        ctx.arc(data.points[0].x, data.points[0].y, Datas.Style.Stroke.Size / 2, 0, 2 * Math.PI, true);
        ctx.fill();
        return;
    }
    if (data.points.length == 2) {
        ctx.beginPath();
        ctx.moveTo(data.points[0].x, data.points[0].y);
        ctx.lineTo(data.points[1].x, data.points[1].y);
        ctx.stroke();
        return;
    } 
    if (reserve == true) {
        if (data.algorithm == "RamerDouglasPeucker") {
            return RamerDouglasPeucker(data.points, ctx);
        } else if (data.algorithm == "DouglasPeucker") {
            return DouglasPeucker(data.points, ctx)
        } else if (data.algorithm == "VisvalingamWhyatt") {
            return VisvalingamWhyatt(data.points, ctx)
        } 
    }
    try {
        for (let i = 0; i < data.points.length - 1; i++) {
            ctx.beginPath();
            if (i == 0) {
                ctx.moveTo(data.points[i].x, data.points[i].y)
                ctx.quadraticCurveTo(data.points[i + 1].x, data.points[i + 1].y, data.points[i + 1].x + (data.points[i + 2].x - data.points[i + 1].x) / 2, data.points[i + 1].y + (data.points[i + 2].y - data.points[i + 1].y) / 2);
            } else if (i == data.points.length - 2) {
                ctx.moveTo(data.points[i].x + (data.points[i + 1].x - data.points[i].x) / 2, data.points[i].y + (data.points[i + 1].y - data.points[i].y) / 2)
                ctx.quadraticCurveTo(data.points[i + 1].x, data.points[i + 1].y, data.points[i].x + (data.points[i + 1].x - data.points[i].x) * 0.75, data.points[i].y + (data.points[i + 1].y - data.points[i].y) * 0.75);
            } else {
                ctx.moveTo(data.points[i].x + (data.points[i + 1].x - data.points[i].x) / 2, data.points[i].y + (data.points[i + 1].y - data.points[i].y) / 2)
                ctx.quadraticCurveTo(data.points[i + 1].x, data.points[i + 1].y, data.points[i + 1].x + (data.points[i + 2].x - data.points[i + 1].x) / 2, data.points[i + 1].y + (data.points[i + 2].y - data.points[i + 1].y) / 2);
            }
            ctx.stroke();
        }
    } catch (e) {
        console.log("Error :", e)
    }
}

function getPosition(element) {
    function offset(el) {
        var rect = el.getBoundingClientRect(),
            scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
            scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
    }
    return { x: offset(element).left, y: offset(element).top };
}

function findMaxArea() {
    var points = Datas.Objects;
    if (points.length < 1) return {
        sx: 0,
        sy: 0,
        ex: 0,
        ey: 0
    };
    var values = {
        minX: points[0]["ExtremeValue"].x[0],
        minY: points[0]["ExtremeValue"].y[0],
        maxX: points[0]["ExtremeValue"].x[1],
        maxY: points[0]["ExtremeValue"].y[1]
    }
    points.forEach(point => {
        if (point["ExtremeValue"].x[0] <= values.minX) {
            values.minX = point["ExtremeValue"].x[0]
        }
        if (point["ExtremeValue"].x[1] >= values.maxX) {
            values.maxX = point["ExtremeValue"].x[1]
        }
        if (point["ExtremeValue"].y[0] <= values.minY) {
            values.minY = point["ExtremeValue"].y[0]
        }
        if (point["ExtremeValue"].y[1] >= values.maxY) {
            values.maxY = point["ExtremeValue"].y[1]
        }
    })
    return {
        sx: values.minX,
        ex: values.maxX,
        sy: values.minY,
        ey: values.maxY
    };
}

function drawObjectBorder(element, ExtremeValue, focused = false, clear = true) {
    if (clear == true) {
        createHDCanvas(element, Datas.CanvasSize.width, Datas.CanvasSize.height);
    }
    var ctx = element.getContext("2d");
    ctx.beginPath();

    /*
    if (focused == true) {
        ctx.shadowColor = "rgb(67 149 239)";
        ctx.shadowBlur = 2;
    } else {
        ctx.shadowColor = "";
        ctx.shadowBlur = 0;
    }
    */

    ctx.fillStyle = "rgb(178,204,255)";        // rgb(178,204,255)
    ctx.lineWidth = focused == true ? 1 : 1.5;
    ctx.strokeStyle = "rgb(178,204,255)";      // rgb(178,204,255)
    ctx.moveTo(ExtremeValue.x[0], ExtremeValue.y[0]);
    ctx.lineTo(ExtremeValue.x[1], ExtremeValue.y[0]);
    ctx.lineTo(ExtremeValue.x[1], ExtremeValue.y[1]);
    ctx.lineTo(ExtremeValue.x[0], ExtremeValue.y[1]);
    ctx.lineTo(ExtremeValue.x[0], ExtremeValue.y[0]);
    ctx.stroke();

    var completed = false;

    if (focused == true && completed == true) {
        // Resize blocks
        ctx.fillRect(ExtremeValue.x[0] - 5, ExtremeValue.y[0] - 5, 10, 10);
        ctx.fillRect(ExtremeValue.x[0] - 5, ExtremeValue.y[1] - 5, 10, 10);
        ctx.fillRect(ExtremeValue.x[0] + (ExtremeValue.x[1] - ExtremeValue.x[0]) / 2 - 5, ExtremeValue.y[0] - 5, 10, 10);
        ctx.fillRect(ExtremeValue.x[0] + (ExtremeValue.x[1] - ExtremeValue.x[0]) / 2 - 5, ExtremeValue.y[1] - 5, 10, 10);
        ctx.fillRect(ExtremeValue.x[0] - 5, ExtremeValue.y[0] + (ExtremeValue.y[1] - ExtremeValue.y[0]) / 2 - 5, 10, 10);
        ctx.fillRect(ExtremeValue.x[1] - 5, ExtremeValue.y[0] + (ExtremeValue.y[1] - ExtremeValue.y[0]) / 2 - 5, 10, 10);
        ctx.fillRect(ExtremeValue.x[1] - 5, ExtremeValue.y[0] - 5, 10, 10);
        ctx.fillRect(ExtremeValue.x[1] - 5, ExtremeValue.y[1] - 5, 10, 10);
    }

    ctx.closePath();
}

var draw = {
    currentIndex: -1,
    canvas: $("#canvas"),
    image: $("#image"),
    select: $("#select"),
    mp: $("#mp"),
    mask: $("#mask"),
    init: async () => {
        $("#painter").classList.remove("unloaded");
        mask.style = `width: ${Datas.CanvasSize.width}px; min-width: calc(4rem + ${Datas.CanvasSize.width}px); min-height: calc(4rem + ${Datas.CanvasSize.height}px)`;
        canvas.hidden = false;
        image.hidden = false;
        mp.hidden = false;
        select.hidden = false;
        createHDCanvas(canvas, Datas.CanvasSize.width, Datas.CanvasSize.height);
        createHDCanvas(image, Datas.CanvasSize.width, Datas.CanvasSize.height);

        var selectEvent = dragger("#canvas");

        var select_mouse = {
            x: 0,
            y: 0
        }

        selectEvent.On("dragstart", (e) => {
            if (Datas.Status.mode == "select") {
                var points = Datas.Objects;
                if (points.length < 1) return;
                createHDCanvas(mp, Datas.CanvasSize.width, Datas.CanvasSize.height);
                var mouse = { x: e.clientX - getPosition(select).x, y: e.clientY - getPosition(select).y };
                select_mouse = {
                    x: e.clientX,
                    y: e.clientY
                }
                var v = false;
                var sp = findMaxArea();
                selected_obj = points[0];
                selected_index = 0;
                points.forEach((p, i) => {
                    if (i > draw.currentIndex) return;
                    if (p["ExtremeValue"].x[0] < mouse.x && mouse.x < p["ExtremeValue"].x[1] && p["ExtremeValue"].y[0] < mouse.y && mouse.y < p["ExtremeValue"].y[1]) {
                        v = true;
                        if ((sp.ex - sp.sx) * (sp.ey - sp.sy) >= (p["ExtremeValue"].x[1] - p["ExtremeValue"].x[0]) * (p["ExtremeValue"].y[1] - p["ExtremeValue"].y[0])) {
                            selected_obj = p;
                            selected_index = i;
                            sp = {
                                sx: p["ExtremeValue"].x[0],
                                sy: p["ExtremeValue"].y[0],
                                ex: p["ExtremeValue"].x[1],
                                ey: p["ExtremeValue"].y[1]
                            }
                            /*
                            if (p["ExtremeValue"].x[0] < sp.sx) {
                                sp.sx = p["ExtremeValue"].x[0];
                            }
                            if (p["ExtremeValue"].x[1] > sp.ex) {
                                sp.ex = p["ExtremeValue"].x[1];
                            }
                            if (p["ExtremeValue"].y[0] < sp.sy) {
                                sp.sy = p["ExtremeValue"].y[0];
                            }
                            if (p["ExtremeValue"].y[1] > sp.ey) {
                                sp.ey = p["ExtremeValue"].y[1];
                            }
                            */
                        } else {
                            /*
                            sp = {
                                sx: p["ExtremeValue"].x[0],
                                sy: p["ExtremeValue"].y[0],
                                ex: p["ExtremeValue"].x[1],
                                ey: p["ExtremeValue"].y[1]
                            }
                            */
                        }
                    }

                })
                if (v == false) {
                    focused_obj = null;
                    createHDCanvas(select, Datas.CanvasSize.width, Datas.CanvasSize.height);
                    return
                };
                focused_obj = selected_obj;
                moving_selected_obj = true;
                var temp_objs = [...Datas.Objects];
                createHDCanvas(mp, Datas.CanvasSize.width, Datas.CanvasSize.height);
                createHDCanvas(image, Datas.CanvasSize.width, Datas.CanvasSize.height);
                temp_objs.splice(selected_index, 1);
                temp_objs.forEach((points, i) => {
                    if (i > draw.currentIndex - 1) return;
                    drawPoints(image, points, true);
                });
                drawPoints(mp, Datas.Objects[selected_index], true);
                drawObjectBorder(select, Datas.Objects[selected_index].ExtremeValue, true);
            }
        })

        selectEvent.On("dragmove", (e) => { selectMove(e); });

        selectEvent.On("dragend", (e) => { selectEnd(e); });
        selectEvent.On("dragout", (e) => { selectEnd(e); });

        function selectEnd(e) {
            if (moving_selected_obj == true) {
                Datas.Objects[selected_index] = selected_obj;
                createHDCanvas(mp, Datas.CanvasSize.width, Datas.CanvasSize.height);
                createHDCanvas(image, Datas.CanvasSize.width, Datas.CanvasSize.height);
                Datas.Objects.forEach((points, i) => {
                    if (i > draw.currentIndex) return;
                    drawPoints(image, points, true);
                });
                Datas.Status.drawing = false;
            }
            selected_obj = null;
            moving_selected_obj = false;
        }

        function selectMove(e) {
            if (moving_selected_obj == true) {
                createHDCanvas(mp, Datas.CanvasSize.width, Datas.CanvasSize.height);
                selected_obj.points.forEach((point, i) => {
                    selected_obj.points[i] = {
                        x: point.x + e.clientX - select_mouse.x,
                        y: point.y + e.clientY - select_mouse.y
                    }
                })
                selected_obj.ExtremeValue.x[0] += e.clientX - select_mouse.x;
                selected_obj.ExtremeValue.x[1] += e.clientX - select_mouse.x;
                selected_obj.ExtremeValue.y[0] += e.clientY - select_mouse.y;
                selected_obj.ExtremeValue.y[1] += e.clientY - select_mouse.y;

                drawPoints(mp, selected_obj, true);
                drawObjectBorder(select, selected_obj.ExtremeValue, true);

                // console.log(selected_obj.algorithm)

                select_mouse = {
                    x: e.clientX,
                    y: e.clientY
                }
            }
        }

        canvas.addEventListener("mousemove", (e) => {
            if (Datas.Status.mode == "select" && moving_selected_obj == false) {
                var points = [...Datas.Objects];
                if (points.length < 1) return;
                createHDCanvas(select, Datas.CanvasSize.width, Datas.CanvasSize.height);
                var mouse = { x: e.clientX - getPosition(select).x, y: e.clientY - getPosition(select).y };
                var v = false;
                var sp = findMaxArea();
                var overed = points[0];
                points.forEach((p, i) => {
                    if (i > draw.currentIndex) return;
                    if (p["ExtremeValue"].x[0] < mouse.x && mouse.x < p["ExtremeValue"].x[1] && p["ExtremeValue"].y[0] < mouse.y && mouse.y < p["ExtremeValue"].y[1]) {
                        v = true;
                        if ((sp.ex - sp.sx) * (sp.ey - sp.sy) > (p["ExtremeValue"].x[1] - p["ExtremeValue"].x[0]) * (p["ExtremeValue"].y[1] - p["ExtremeValue"].y[0])) {
                            overed = p;
                            sp = {
                                sx: p["ExtremeValue"].x[0],
                                sy: p["ExtremeValue"].y[0],
                                ex: p["ExtremeValue"].x[1],
                                ey: p["ExtremeValue"].y[1]
                            }
                            /*
                            if (p["ExtremeValue"].x[0] < sp.sx) {
                                sp.sx = p["ExtremeValue"].x[0];
                            }
                            if (p["ExtremeValue"].x[1] > sp.ex) {
                                sp.ex = p["ExtremeValue"].x[1];
                            }
                            if (p["ExtremeValue"].y[0] < sp.sy) {
                                sp.sy = p["ExtremeValue"].y[0];
                            }
                            if (p["ExtremeValue"].y[1] > sp.ey) {
                                sp.ey = p["ExtremeValue"].y[1];
                            }
                            */
                        } else {
                            /*
                            sp = {
                                sx: p["ExtremeValue"].x[0],
                                sy: p["ExtremeValue"].y[0],
                                ex: p["ExtremeValue"].x[1],
                                ey: p["ExtremeValue"].y[1]
                            }
                            */
                        }
                    }

                })
                if (focused_obj != null) {
                    drawObjectBorder(select, focused_obj.ExtremeValue, true);
                }
                if (v == false) return;
                var ExtremeValue = {
                    x: [sp.sx, sp.ex],
                    y: [sp.sy, sp.ey]
                }
                if (focused_obj != overed) {
                    drawObjectBorder(select, ExtremeValue, false, false);
                }
            } else {
                return;
            }
        })

        function move(e) {
            if (e.type == "touchmove") {
                e.preventDefault();
            }
            if (Datas.Status.drawing == true && Datas.Status.mode == "draw") {
                if (e.clientX - getPosition(canvas).x < Datas.Temp.ExtremeValue.x[0]) {
                    Datas.Temp.ExtremeValue.x[0] = e.clientX - getPosition(canvas).x;
                }
                if (e.clientX - getPosition(canvas).x > Datas.Temp.ExtremeValue.x[1]) {
                    Datas.Temp.ExtremeValue.x[1] = e.clientX - getPosition(canvas).x;
                }
                if (e.clientY - getPosition(canvas).y < Datas.Temp.ExtremeValue.y[0]) {
                    Datas.Temp.ExtremeValue.y[0] = e.clientY - getPosition(canvas).y;
                }
                if (e.clientY - getPosition(canvas).y > Datas.Temp.ExtremeValue.y[1]) {
                    Datas.Temp.ExtremeValue.y[1] = e.clientY - getPosition(canvas).y;
                };

                Datas.Temp.Points.push({ x: e.clientX - getPosition(canvas).x, y: e.clientY - getPosition(canvas).y });

                Datas.Temp.Mouse = {
                    x: [e.clientX - getPosition(canvas).x],
                    y: [e.clientY - getPosition(canvas).y]
                };

                $("#undo").removeAttribute("disabled");

                drawPoints(canvas, Datas.Temp.Points, false, 1);
            }
        }

        function leave(e) {
            if (e.type == "touchend") {
                // e.preventDefault();
            }
            if (Datas.Status.drawing == true && Datas.Status.mode == "draw") {
                createHDCanvas(canvas, Datas.CanvasSize.width, Datas.CanvasSize.height);

                if (Datas.Temp.DIndex != 0) {
                    Datas.Objects = Datas.Temp.History;

                    createHDCanvas(image, Datas.CanvasSize.width, Datas.CanvasSize.height);

                    Datas.Objects.forEach(o => {
                        drawPoints(image, o, true);
                    });

                    Datas.Temp.DIndex = 0;

                    Datas.Temp.History = [];
                }

                draw.currentIndex++;

                var padding = 4;

                Datas.Temp.ExtremeValue.x[0] -= Datas.Style.Stroke.Size / 2 + padding;
                Datas.Temp.ExtremeValue.x[1] += Datas.Style.Stroke.Size / 2 + padding;
                Datas.Temp.ExtremeValue.y[0] -= Datas.Style.Stroke.Size / 2 + padding;
                Datas.Temp.ExtremeValue.y[1] += Datas.Style.Stroke.Size / 2 + padding;

                Datas.Status.drawing = false;
                Datas.Objects.push({
                    position: {
                        x: Datas.Temp.ExtremeValue.x[0],
                        y: Datas.Temp.ExtremeValue.y[0]
                    },
                    size: {
                        width: Datas.Temp.ExtremeValue.x[1] - Datas.Temp.ExtremeValue.x[0],
                        height: Datas.Temp.ExtremeValue.y[1] - Datas.Temp.ExtremeValue.y[0]
                    },
                    style: {
                        strokeColor: Datas.Style.Stroke.Color,
                        strokeWidth: Datas.Style.Stroke.Size
                    },
                    algorithm: Datas.Algorithm,
                    points: Datas.Temp.Points,
                    image: "image url",
                    rotate: 0,
                    scale: 1,
                    ExtremeValue: Datas.Temp.ExtremeValue
                });
                drawPoints(image, Datas.Temp.Points, true, 1);
                $("#redo").setAttribute("disabled", "");
            }
        }

        var drawingEvent = dragger("#canvas");

        drawingEvent.On("dragstart", (e) => {
            if (e.type == "touchstart") {
                e.preventDefault();
            }
            if (Datas.Status.mode == "draw") {
                Datas.Status.drawing = true;
                Datas.Temp.Points = [{ x: e.clientX - getPosition(canvas).x, y: e.clientY - getPosition(canvas).y }];
                Datas.Temp.Mouse = {
                    x: [e.clientX - getPosition(canvas).x],
                    y: [e.clientY - getPosition(canvas).y]
                };
                Datas.Temp.ExtremeValue = {
                    x: [e.clientX - getPosition(canvas).x, e.clientX - getPosition(canvas).x],
                    y: [e.clientY - getPosition(canvas).y, e.clientY - getPosition(canvas).y]
                };
                drawPoints(canvas, Datas.Temp.Points, false, 1);
            }
        });

        drawingEvent.On("dragmove", (e) => { move(e); });

        drawingEvent.On("dragend", (e) => { leave(e); });
        drawingEvent.On("dragout", (e) => { leave(e); });
    },
    undo: () => {
        if (draw.currentIndex == -1) return $("#undo").setAttribute("disabled", "");
        draw.currentIndex--;
        Datas.Temp.DIndex--;
        createHDCanvas(image, Datas.CanvasSize.width, Datas.CanvasSize.height);
        Datas.Temp.History = [];
        Datas.Objects.forEach((o, i) => {
            if (i > draw.currentIndex) return;
            drawPoints(image, o, true);
            Datas.Temp.History.push(o);
        });
        if (draw.currentIndex == -1) {
            $("#undo").setAttribute("disabled", "")
        } else {
            $("#undo").removeAttribute("disabled");
        }
        $("#redo").removeAttribute("disabled");
    },
    redo: () => {
        if (draw.currentIndex == Datas.Objects.length - 1) return $("#redo").setAttribute("disabled", "");
        draw.currentIndex++;
        Datas.Temp.DIndex++;
        createHDCanvas(image, Datas.CanvasSize.width, Datas.CanvasSize.height);
        Datas.Temp.History = [];
        Datas.Objects.forEach((o, i) => {
            if (i > draw.currentIndex) return;
            drawPoints(image, o, true);
            Datas.Temp.History.push(o);
        });
        $("#undo").removeAttribute("disabled");
        if (draw.currentIndex == Datas.Objects.length - 1) {
            $("#redo").setAttribute("disabled", "")
        } else {
            $("#redo").removeAttribute("disabled");
        }
    }
}

function download(name) {
    var image = draw.image.toDataURL('image/jpeg');
    var link = document.createElement('a');
    link.download = name ? name + ".jpg" : 'Untitled.jpg';
    link.href = image;
    link.click();
}

$("#download").addEventListener("click", () => { download(); });

var delay = (d) => { return new Promise(r => setTimeout(r, d)); };

window.mobileAndTabletCheck = function () {
    let check = false;
    (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
};

window.onload = async () => {
    /*
    if (mobileAndTabletCheck() == true) {
        var info = document.createElement("div");
        info.className = "--info";
        info.innerHTML = "<div>請使用電腦瀏覽此頁面</div>";
        document.body.appendChild(info);
        return;
    }
    */

    await delay(Math.random() * 500);

    draw.init();

    $("#undo").onclick = draw.undo;
    $("#redo").onclick = draw.redo;

    setTimeout(() => $(".unloaded", true).forEach(e => {
        e.classList.remove("unloaded");
    }), 300);
}