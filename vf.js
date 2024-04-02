/**
 * Code by Wetrain (c) 2023
 * All rights reserved.
 */

"use strict";

const VF = (vals) => {
    if (Array.isArray(vals) == false) return;
    if (vals.length < 3) return false;
    var res = [{ type: "first", value: vals[0], index: 0 }];
    try {
        for (let i = 0; i < vals.length; i++) {
            if (i - 1 >= 0) {
                if (vals[i] < vals[i - 1] && vals[i] < vals[i + 1]) {
                    res.push({ type: "min", value: vals[i], index: i });
                }
                if (vals[i] > vals[i - 1] && vals[i] > vals[i + 1]) {
                    res.push({ type: "max", value: vals[i], index: i });
                }
            }
        }
        res.push({ type: "end", value: vals[vals.length - 1], index: vals.length - 1 });
    } catch (e) {
        console.warn("Error :", e.message, "\nDetails :", e);
    }
    return res;
}