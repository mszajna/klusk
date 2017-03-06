// OT code borrowed from codr.io
define("OT", ["require", "./helpers/helpers-core", "./apply-delta"], function(e) {
    var t = e("./helpers/helpers-core")
      , n = e("./apply-delta");
    return {
        getTransformedDelta: function(e, n) {
            return n = t.deepCloneObj(n, !0),
            this.transformDelta(e, n),
            n
        },
        getTransformedRange: function(e, n, r) {
            return n = t.deepCloneObj(n, !0),
            this.transformRange(e, n, r),
            n
        },
        transformDelta: function(e, r, i) {
            var s = e.oRange
              , o = r.oRange;
            if (r.sAction == "insert") {
                var u = o.oStart;
                o.oStart = this._getTransformedPoint(e, o.oStart, !0),
                o.oEnd.iRow += o.oStart.iRow - u.iRow,
                o.oStart.iRow == o.oEnd.iRow && (o.oEnd.iCol += o.oStart.iCol - u.iCol)
            } else {
                if (e.sAction == "delete") {
                    var a = t.pointsInOrder(s.oStart, o.oStart) ? o.oStart : s.oStart
                      , f = t.pointsInOrder(s.oEnd, o.oEnd) ? s.oEnd : o.oEnd;
                    t.pointsInOrder(a, f) && n(r.aLines, {
                        sAction: "delete",
                        oRange: {
                            oStart: this._getDecrementedPoint(o.oStart, a),
                            oEnd: this._getDecrementedPoint(o.oStart, f)
                        }
                    }, !0)
                } else if (t.pointsInOrder(o.oStart, s.oStart, i) && t.pointsInOrder(s.oStart, o.oEnd, i)) {
                    n(r.aLines, {
                        sAction: "insert",
                        oRange: {
                            oStart: this._getDecrementedPoint(o.oStart, s.oStart),
                            oEnd: this._getDecrementedPoint(o.oStart, s.oEnd)
                        },
                        aLines: e.aLines
                    }),
                    o.oEnd = this._getTransformedPoint(e, o.oEnd, i);
                    return
                }
                this.transformRange(e, o)
            }
        },
        transformRange: function(e, t, n) {
            var r = t.oStart.iRow == t.oEnd.iRow && t.oStart.iCol == t.oEnd.iCol;
            t.oStart = this._getTransformedPoint(e, t.oStart, n || !r),
            t.oEnd = this._getTransformedPoint(e, t.oEnd, n)
        },
        _getTransformedPoint: function(e, n, r) {
            var i = e.sAction == "insert"
              , s = (i ? 1 : -1) * (e.oRange.oEnd.iRow - e.oRange.oStart.iRow)
              , o = (i ? 1 : -1) * (e.oRange.oEnd.iCol - e.oRange.oStart.iCol)
              , u = e.oRange.oStart
              , a = i ? u : e.oRange.oEnd;
            return t.pointsInOrder(n, u, !r) ? {
                iRow: n.iRow,
                iCol: n.iCol
            } : t.pointsInOrder(a, n, r) ? {
                iRow: n.iRow + s,
                iCol: n.iCol + (n.iRow == a.iRow ? o : 0)
            } : (t.assert(e.sAction == "delete", "Delete action expected."),
            {
                iRow: u.iRow,
                iCol: u.iCol
            })
        },
        _pointsInOrder: function(e, t, n) {
            var r = n ? e.iCol <= t.iCol : e.iCol < t.iCol;
            return e.iRow < t.iRow || e.iRow == t.iRow && r
        },
        _getDecrementedPoint: function(e, n) {
            return n = t.cloneObj(n),
            n.iRow == e.iRow && (n.iCol -= e.iCol),
            n.iRow -= e.iRow,
            n
        }
    }
}),
