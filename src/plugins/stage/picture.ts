import { IPPTChartElement, IPPTImageElement, IPPTLatexElement } from "../../types/element";
import StageConfig from "./config";
import Shadow from "./shadow";
import Fill from "./fill";
import OutLine from "./outline";
import { getShapePath } from "../../utils/shape";
import { SHAPE_TYPE } from "../../config/shapes";
import { defaultImage } from "../../config";
import { ActionAnimation } from "./animation";
import DB from "../../utils/db";
import Canvas, { CanvasRenderingContext2D, Image, Path2D } from "react-native-canvas";

export default class Picture {
    private _stageConfig: StageConfig;
    private _canvas: Canvas;
    private _ctx: CanvasRenderingContext2D;
    private _db: DB;
    private _shadow: Shadow;
    private _fill: Fill;
    private _outline: OutLine;
    private _actionAnimation: ActionAnimation;
    private _cacheImage = new Map<string, Image>();
    constructor(
        stageConfig: StageConfig,
        canvas: Canvas,
        ctx: CanvasRenderingContext2D,
        db: DB
    ) {
        this._stageConfig = stageConfig;
        this._canvas = canvas;
        this._ctx = ctx;
        this._db = db;
        this._shadow = new Shadow(this._ctx);
        this._fill = new Fill(this._ctx);
        this._outline = new OutLine(this._ctx);
        this._actionAnimation = new ActionAnimation(stageConfig, ctx);
    }

    public async draw(element: IPPTImageElement | IPPTLatexElement | IPPTChartElement) {
        let cacheImage = this._cacheImage.get(element.src);
        if (!cacheImage) {
            const imageFile = await this._db.getFile(element.src) || defaultImage;
            cacheImage = await new Promise<Image>((resolve) => {
                const image = new Image(this._canvas);
            
                image.addEventListener("load", () => {
                    resolve(image);
                });

                image.src = imageFile;
            })

            this._cacheImage.set(element.src, cacheImage);
        }

        const zoom = this._stageConfig.zoom;
        const { x, y } = this._stageConfig.getStageOrigin();

        this._ctx.save();

        // 缩放画布
        this._ctx.scale(zoom, zoom);

        const ox = x + element.left + element.width / 2;
        const oy = y + element.top + element.height / 2;

        // 平移坐标原点
        this._ctx.translate(ox, oy);
        // 旋转画布
        this._ctx.rotate((element.rotate / 180) * Math.PI);
        // 水平垂直翻转
        this._ctx.scale(element.flipH || 1, element.flipV || 1);

        // 动画
        this._actionAnimation.setElementStatus(element);

        const path = getShapePath(SHAPE_TYPE.RECT, element.width, element.height, this._canvas) as Path2D;
        if (element.fill) {
            this._fill.draw(element.fill, path);
        }

        if (element.outline) {
            this._outline.draw(element.outline, path);
        }

        if (element.shadow) {
            this._shadow.draw(element.shadow, zoom);
        }

        // 设置透明度
        this._ctx.globalAlpha = (100 - (element.opacity || 0)) / 100;

        if (element.streach === 1) {
            // 拉伸
            this._ctx.drawImage(cacheImage, -element.width / 2, -element.height / 2, element.width, element.height);
        } else {
            // 缩放
            let viewWidth = element.width;
            let viewHeight = cacheImage.height / cacheImage.width * viewWidth;
            if (viewHeight > element.height) {
                viewHeight = element.height;
                viewWidth = cacheImage.width / cacheImage.height * viewHeight;
            }
            this._ctx.drawImage(cacheImage, -viewWidth / 2, -viewHeight / 2, viewWidth, viewHeight);
        }

        this._ctx.restore();
    }
}
