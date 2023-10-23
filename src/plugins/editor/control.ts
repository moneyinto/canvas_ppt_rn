import Canvas from "react-native-canvas";
import Stage from "../stage";
import StageConfig from "../stage/config";

export default class ControlStage extends Stage {
    constructor(
        canvas: Canvas,
        stageConfig: StageConfig
    ) {
        super(canvas, stageConfig);
    }

    public resetDrawOprate() {
        this.clear();
        // const elements = this.stageConfig.operateElements;
        // if (elements.length === 0) return;
        // this._drawOprate(elements);
    }
}
