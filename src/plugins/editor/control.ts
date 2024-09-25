import Canvas from "react-native-canvas";
import Stage from "../stage";
import StageConfig from "../stage/config";
import { GestureResponderEvent, PanResponderGestureState } from "react-native";
import Command from "./command";
import DB from "../../utils/db";
import { throttle } from "../../utils";

export default class ControlStage extends Stage {
    private _command: Command;
    private _scaleGustureCenter: { x: number; y: number } | null = null; // 双指缩放中心
    private _originScaleLength: number = 0; // 双指缩放初始距离
    private _canMoveCanvas = true;
    private _startPoint: [number, number] = [0, 0];
    constructor(
        canvas: Canvas,
        stageConfig: StageConfig,
        db: DB,
        command: Command
    ) {
        super(canvas, stageConfig, db);
        this._command = command;

        this._touchTranslate = throttle(this._touchTranslate.bind(this), 30);
        this._touchScale = throttle(this._touchScale.bind(this), 100);
    }

    public touchStart(e: GestureResponderEvent) {
        const { locationX, locationY} = e.nativeEvent
        this._scaleGustureCenter = null;
        this._originScaleLength = 0;
        this._startPoint = [locationX, locationY];
    }

    public touchMove(e: GestureResponderEvent, gestureState: PanResponderGestureState) {
        if (gestureState.numberActiveTouches === 2) {
            this._touchScale(e);
        } else {
            this._touchTranslate(e);
        }
    }

    public touchEnd(e: GestureResponderEvent) {
        console.log("TouchEnd");
    }

    private _touchTranslate(e: GestureResponderEvent) {
        const { locationX, locationY} = e.nativeEvent
        if (this._canMoveCanvas) {
            // 移动画布
            const scrollX = -(locationX - this._startPoint[0]) + this.stageConfig.scrollX;
            const scrollY = -(locationY - this._startPoint[1]) + this.stageConfig.scrollY;
            this._startPoint = [locationX, locationY];
            this.stageConfig.setScroll(scrollX, scrollY);
        }
    }

    private _touchScale(e: GestureResponderEvent) {
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

    public resetDrawOprate() {
        this.clear();
        // const elements = this.stageConfig.operateElements;
        // if (elements.length === 0) return;
        // this._drawOprate(elements);
    }
}
