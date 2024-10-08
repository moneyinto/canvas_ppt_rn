import Canvas from "react-native-canvas";
import Stage from "../stage";
import StageConfig from "../stage/config";
import DB from "../../utils/db";
// import Background from "../stage/background";

export default class ViewStage extends Stage {
    // private _background: Background;
    constructor(
        canvas: Canvas,
        stageConfig: StageConfig,
        db: DB
    ) {
        super(canvas, stageConfig, db);

        // this._background = new Background(stageConfig, this.ctx, db);
        this._drawPage();
    }

    private _drawPage() {
        const { x, y, stageWidth, stageHeight } = this.stageConfig.getStageArea();
        const currentSlide = this.stageConfig.getCurrentSlide();

        // 设置阴影
        this.ctx.shadowColor = "#eee";
        this.ctx.shadowBlur = 12;

        this.ctx.fillStyle = "#ffffff";
        this.ctx.fillRect(x, y, stageWidth, stageHeight);

        // 绘制背景
    //    this._background.draw(currentSlide?.background);

        // 移除阴影设置
        this.ctx.shadowColor = "";
        this.ctx.shadowBlur = 0;
        
        // 绘制元素
        const elements = currentSlide?.elements || [];
        this.drawElements(elements);
    }

    public async resetDrawPage() {
        const width = this.stageConfig.getWidth();
        const height = this.stageConfig.getHeight();
        this.ctx.clearRect(0, 0, width, height);

        this._drawPage();
    }
}