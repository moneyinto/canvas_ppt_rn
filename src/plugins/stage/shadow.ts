import { CanvasRenderingContext2D } from "react-native-canvas";
import { IPPTElementShadow } from "../../types/element";

export default class Shadow {
    private _ctx: CanvasRenderingContext2D;
    constructor(ctx: CanvasRenderingContext2D) {
        this._ctx = ctx;
    }

    public draw(shadow: IPPTElementShadow, zoom: number) {
        this._ctx.shadowOffsetX = shadow.h * zoom;
        this._ctx.shadowOffsetY = shadow.v * zoom;
        this._ctx.shadowBlur = shadow.blur * zoom;
        this._ctx.shadowColor = shadow.color;
    }
}
