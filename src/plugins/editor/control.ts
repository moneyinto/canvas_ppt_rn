import Canvas from "react-native-canvas";
import Stage from "../stage";
import StageConfig from "../stage/config";
import { GestureResponderEvent, PanResponderGestureState } from "react-native";
import Command from "./command";
import DB from "../../utils/db";
import { debounce, throttle } from "../../utils";

export default class ControlStage extends Stage {
    private _command: Command;
    private _scaleGustureCenter: { x: number; y: number } | null = null; // 双指缩放中心
    private _originScaleLength: number = 0; // 双指缩放初始距离
    private _canMoveCanvas = true;
    private _activeTouchCount = 0;
    private _isTouchMove = false;
    private _touchEndTime = 0;
    private _isDoubleTap = false;
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
        // 单击生效延迟300，移除双击的可能
        this._singleTap = debounce(this._singleTap.bind(this), 300);
        // 双击生效延迟300，移除超多两次点击引起多次触发问题
        this._doubleTap = debounce(this._doubleTap.bind(this), 300);
    }

    public touchStart(e: GestureResponderEvent, gestureState: PanResponderGestureState) {
        const { locationX, locationY} = e.nativeEvent
        this._scaleGustureCenter = null;
        this._originScaleLength = 0;
        this._startPoint = [locationX, locationY];
        this._activeTouchCount = gestureState.numberActiveTouches;
    }

    public touchMove(e: GestureResponderEvent, gestureState: PanResponderGestureState) {
        if (gestureState.numberActiveTouches === 2) {
            this._touchScale(e);
        } else {
            this._isTouchMove = true;
            this._touchTranslate(e);
        }
    }

    public touchEnd(e: GestureResponderEvent, gestureState: PanResponderGestureState) {
        console.log("TouchEnd", gestureState);
        if (this._activeTouchCount === 1 && !this._isTouchMove) {
            // 单指且没有触发移动 视为点击
            const touchEndTime = Date.now();
            if (touchEndTime - this._touchEndTime < 250) {
                // Double tap detected
                this._isDoubleTap = true;
                this._doubleTap();
            } else {
                // Single tap detected
                this._singleTap();
                this._touchEndTime = touchEndTime;
            }
        }
    }

    private _doubleTap() {
        console.log("Double Tap")
    }

    private _singleTap() {
        if (!this._isDoubleTap) {
            console.log("Single Tap")
        } else {
            this._isDoubleTap = false;
        }
    }

    private _touchTranslate(e: GestureResponderEvent) {
        const { locationX, locationY} = e.nativeEvent
        if (this._canMoveCanvas) {
            // 初始状态禁止移动画布
            const baseZoom = this.stageConfig.getFitZoom();
            const currentZoom = this.stageConfig.zoom;
            if (currentZoom === baseZoom && this.stageConfig.scrollX === 0 && this.stageConfig.scrollY === 0) return;
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
