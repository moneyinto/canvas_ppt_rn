import Canvas, { CanvasRenderingContext2D } from "react-native-canvas";
import { IPPTElement } from "../../types/element";
import StageConfig from "./config";
import Shape from "./shape";

export default class Stage {
    public canvas: Canvas;
    public ctx: CanvasRenderingContext2D;
    public stageConfig: StageConfig;

    // private _db: DB;
    // private _line: Line | null;
    // private _richText: RichText | null;
    private _shape: Shape | null;
    // private _picture: Picture | null;
    // private _video: Video | null;
    // private _music: Music | null;
    // private _table: Table | null;
    constructor(
        canvas: Canvas,
        stageConfig: StageConfig
    ) {
        this.stageConfig = stageConfig;
        // this._db = db;

        this.canvas = canvas;
        const { ctx } = this._createStage();
        this.ctx = ctx;

        // this._line = null;
        // this._richText = null;
        this._shape = null;
        // this._picture = null;
        // this._video = null;
        // this._music = null;
        // this._table = null;
    }

    public resetStage() {
        const width = this.stageConfig.getWidth();
        const height = this.stageConfig.getHeight();

        this.canvas.width = width;
        this.canvas.height = height;
    }

    private _createStage() {
        const width = this.stageConfig.getWidth();
        const height = this.stageConfig.getHeight();

        this.canvas.width = width;
        this.canvas.height = height;

        const ctx = this.canvas.getContext("2d");

        return { ctx };
    }

    public clear() {
        const canvasWidth = this.stageConfig.getWidth();
        const canvasHeight = this.stageConfig.getHeight();
        this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    }

    public drawElement(element: IPPTElement, isThumbnail?: boolean) {
        switch (element.type) {
            case "shape": {
                if (!this._shape) this._shape = new Shape(this.stageConfig, this.canvas, this.ctx);
                this._shape.draw(element);
                break;
            }
            // case "line": {
            //     if (!this._line) this._line = new Line(this.stageConfig, this.ctx);
            //     this._line.draw(element);
            //     break;
            // }
            // case "image": {
            //     if (!this._picture) this._picture = new Picture(this.stageConfig, this.ctx, this._db);
            //     this._picture?.draw(element);
            //     break;
            // }
            // case "text": {
            //     if (!this._richText) this._richText = new RichText(this.stageConfig, this.ctx);
            //     this._richText!.draw(element);
            //     break;
            // }
            // case "video": {
            //     if (!this._video) this._video = new Video(this.stageConfig, this.ctx, this._db);
            //     this._video?.draw(element, !!isThumbnail);
            //     break;
            // }
            // case "latex": {
            //     if (!this._picture) this._picture = new Picture(this.stageConfig, this.ctx, this._db);
            //     this._picture?.draw(element);
            //     break;
            // }
            // case "audio": {
            //     if (!this._music) this._music = new Music(this.stageConfig, this.ctx, this._db);
            //     this._music?.draw(element);
            //     break;
            // }
            // case "chart": {
            //     if (!this._picture) this._picture = new Picture(this.stageConfig, this.ctx, this._db);
            //     this._picture?.draw(element);
            //     break;
            // }
            // case "table": {
            //     if (!this._table) this._table = new Table(this.stageConfig, this.ctx);
            //     this._table?.draw(element);
            //     break;
            // }
        }
    }

    public drawElements(elements: IPPTElement[], isThumbnail?: boolean) {
        console.log("xxx", elements);
        for (const element of elements) {
            // if (this.stageConfig.animationHideElements.indexOf(element.id) !== -1) continue;
            this.drawElement(element, isThumbnail);
        }
    }
}