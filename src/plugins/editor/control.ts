import Canvas from "react-native-canvas";
import Stage from "../stage";
import StageConfig from "../stage/config";
import { GestureResponderEvent } from "react-native";
import Command from "./command";
import DB from "../../utils/db";

export default class ControlStage extends Stage {
    private _command: Command;
    private _scaleGustureCenter: { x: number; y: number } | null = null; // 双指缩放中心
    private _originScaleLength: number = 0; // 双指缩放初始距离
    private _scaleThrottle: null | Date;
    constructor(
        canvas: Canvas,
        stageConfig: StageConfig,
        db: DB,
        command: Command
    ) {
        super(canvas, stageConfig, db);
        this._command = command;
        this._scaleThrottle = null;
    }

    public touchStart(e: GestureResponderEvent) {
        this._scaleGustureCenter = null;
        this._originScaleLength = 0;
        console.log("TouchStart", e.nativeEvent);
    }

    public touchMove(e: GestureResponderEvent) {
        console.log("TouchMove");
    }

    public touchEnd(e: GestureResponderEvent) {
        console.log("TouchEnd");
    }

    private _actionScale(e: GestureResponderEvent) {
        console.log("TouchScale")
        // 节流 降低闪烁
        // TO DO 研究闪缩问题
        const oneGystue = e.nativeEvent.touches[0];
        const twoGystue = e.nativeEvent.touches[1];
        if (!this._scaleGustureCenter) {
            // TO DO 缩放要以该点为中心进行
            this._scaleGustureCenter = {
                x: (oneGystue.locationX + twoGystue.locationX) / 2,
                y: (oneGystue.locationY + twoGystue.locationY) / 2
            };
        }
        const currentLength = Math.hypot(
            oneGystue.locationX - twoGystue.locationX,
            oneGystue.locationY - twoGystue.locationY
        );
        if (this._originScaleLength === 0) {
            this._originScaleLength = currentLength;
        }
        const scaleUnit = (currentLength - this._originScaleLength) / this._originScaleLength;
        this._command.executeZoom(scaleUnit);
        this._originScaleLength = currentLength;
    }

    public touchScale(e: GestureResponderEvent) {
        const currentDate = new Date();
        
        if (this._scaleThrottle) {
            if (
                currentDate.getTime() -
                    this._scaleThrottle.getTime() >=
                100
            ) {
                this._actionScale(e);
                this._scaleThrottle = currentDate;
            }
        } else {
            this._actionScale(e);
            this._scaleThrottle = currentDate;
        }
    }

    public resetDrawOprate() {
        this.clear();
        // const elements = this.stageConfig.operateElements;
        // if (elements.length === 0) return;
        // this._drawOprate(elements);
    }
}
