import Canvas from "react-native-canvas";
import Stage from "../stage";
import StageConfig from "../stage/config";
import { GestureResponderEvent } from "react-native";

export default class ControlStage extends Stage {
    constructor(
        canvas: Canvas,
        stageConfig: StageConfig
    ) {
        super(canvas, stageConfig);
    }

    public touchStart(e: GestureResponderEvent) {
        console.log("TouchStart", e.nativeEvent)
    }

    public touchMove(e: GestureResponderEvent) {
        console.log("TouchMove")
    }

    public touchEnd(e: GestureResponderEvent) {
        console.log("TouchEnd")
    }

    public resetDrawOprate() {
        this.clear();
        // const elements = this.stageConfig.operateElements;
        // if (elements.length === 0) return;
        // this._drawOprate(elements);
    }
}
