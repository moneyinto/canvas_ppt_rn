import Canvas from "react-native-canvas";
import Stage from "../stage";
import StageConfig, { TEXT_MARGIN } from "../stage/config";
import { GestureResponderEvent, PanResponderGestureState } from "react-native";
import Command from "./command";
import DB from "../../utils/db";
import { debounce, deepClone, throttle } from "../../utils";
import { IPPTElement } from "../../types/element";
import { THEME_COLOR } from "../../config/stage";
import { IRectParameter, IRects } from "../../types";

export default class ControlStage extends Stage {
    private _command: Command;
    private _scaleGustureCenter: { x: number; y: number } | null = null; // 双指缩放中心
    private _originScaleLength: number = 0; // 双指缩放初始距离
    private _canMoveCanvas = false; // 是否可以移动画布
    private _canMoveElements = false; // 是否可以移动元素
    private _needAddHistory = false; // 是否需要添加历史记录
    private _activeTouchCount = 0;
    private _isTouchMove = false;
    private _isLongPress = false; // 是否长按
    private _longPressTimer: NodeJS.Timeout | number = 0;
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

        this._checkTouchMove();

        // 长按
        this._longPressTimer = setTimeout(() => {
            this._longPress()
        }, 500)
    }

    public touchMove(e: GestureResponderEvent, gestureState: PanResponderGestureState) {
        if (gestureState.numberActiveTouches === 2) {
            this._touchScale(e);
        } else {
            this._isTouchMove = true;
            this._touchTranslate(e);
        }
        clearTimeout(this._longPressTimer);
    }

    public touchEnd(e: GestureResponderEvent, gestureState: PanResponderGestureState) {
        if (this._activeTouchCount === 1 && !this._isTouchMove && !this._isLongPress) {
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

        if (this._needAddHistory && this._activeTouchCount === 1) {
            const operateElements = this.stageConfig.operateElements;
            // 更改silde中对应的元素数据
            this._command.executeUpdateRender(
                deepClone(operateElements),
                true
            );
        }

        clearTimeout(this._longPressTimer);
        this._isTouchMove = false;
        this._canMoveCanvas = false;
        this._canMoveElements = false;
        this._needAddHistory = false;
    }

    private _checkTouchMove() {
        // 判断是移动画布还是移动元素
        if (this.stageConfig.operateElements.length) {
            const { left, top } = this.stageConfig.getTouchPosition(this._startPoint);
            const currentSlide = this.stageConfig.getCurrentSlide();
            const operateElement = this.stageConfig.getTouchElement(
                left,
                top,
                this.ctx,
                currentSlide?.elements || []
            );

            this._canMoveElements = !!this.stageConfig.operateElements.find((element) => element.id === operateElement?.id);
        }

        // 不可以移动元素就是可以移动画布
        this._canMoveCanvas = !this._canMoveElements;
    }

    private _longPress() {
        console.log("Long Press")
        // 触发单击效果 no debounce
        this._singleTapAction();
        // 判断是否可以移动元素
        this._checkTouchMove();
    }

    private _doubleTap() {
        console.log("Double Tap")
    }

    private _singleTapAction() {
        if (!this._isDoubleTap) {
            const { left, top } = this.stageConfig.getTouchPosition(this._startPoint);
            const currentSlide = this.stageConfig.getCurrentSlide();
            const operateElement = this.stageConfig.getTouchElement(
                left,
                top,
                this.ctx,
                currentSlide?.elements || []
            );
            this.stageConfig.setOperateElement(operateElement, false);
            this.stageConfig.resetCheckDrawView();
            this.stageConfig.tableEditElementID = "";
            this.stageConfig.tableSelectCells = null;
            if (operateElement) {
                // this._cursor.hideCursor();
                this.stageConfig.textFocus = false;
                this.stageConfig.textFocusElementId = "";
                this.resetDrawOprate();
            } else {
                this.clear();
            }
            console.log("Single Tap", left, top)
        } else {
            this._isDoubleTap = false;
        }
    }

    private _singleTap() {
        // debounce
        this._singleTapAction();
    }

    private _moveCanvas(locationX: number, locationY: number) {
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

    private _moveElements(locationX: number, locationY: number) {
        const operateElements = this.stageConfig.operateElements;
        const zoom = this.stageConfig.zoom;
        const moveX = (locationX - this._startPoint[0]) / zoom;
        const moveY = (locationY - this._startPoint[1]) / zoom;

        const elements: IPPTElement[] = [];
        for (const operateElement of operateElements) {
            const newElement = {
                ...operateElement,
                left: operateElement.left + moveX,
                top: operateElement.top + moveY
            };

            elements.push(newElement);
        }

        this._command.executeUpdateRender(elements);
        this._startPoint = [locationX, locationY];
    }

    private _touchTranslate(e: GestureResponderEvent) {
        const { locationX, locationY} = e.nativeEvent
        if (this._canMoveCanvas) {
            this._moveCanvas(locationX, locationY);
        } else if (this._canMoveElements) {
            // 移动元素
            this._moveElements(locationX, locationY);
            this._needAddHistory = true;
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

    private _getElementLinePoints(
        x: number,
        y: number,
        end: [number, number],
        rectWidth: number
    ) {
        const START: IRectParameter = [
            x - rectWidth,
            y - rectWidth / 2,
            rectWidth,
            rectWidth
        ];

        const END: IRectParameter = [
            x + end[0],
            y + end[1] - rectWidth / 2,
            rectWidth,
            rectWidth
        ];

        return {
            START,
            END
        };
    }

    /**
     * 考虑要不要做个map的换成 ？？？？？？？？？？？？？？？？？？？？？
     * @param param0 获取选中区域的九点区域坐标
     * @returns
     */
    private _getElementResizePoints(
        x: number,
        y: number,
        elementWidth: number,
        elementHeight: number,
        dashedLinePadding: number,
        resizeRectWidth: number
    ) {
        const LEFT_X = x - dashedLinePadding - resizeRectWidth;
        const RIGH_X = x + elementWidth + dashedLinePadding;
        const CENTER_X = (RIGH_X + LEFT_X) / 2;
        const TOP_Y = y - dashedLinePadding - resizeRectWidth;
        const BOTTOM_Y = y + elementHeight + dashedLinePadding;
        const CENTER_Y = (BOTTOM_Y + TOP_Y) / 2;

        const LEFT_TOP: IRectParameter = [
            LEFT_X,
            TOP_Y,
            resizeRectWidth,
            resizeRectWidth
        ];
        const LEFT: IRectParameter = [
            LEFT_X,
            CENTER_Y,
            resizeRectWidth,
            resizeRectWidth
        ];
        const LEFT_BOTTOM: IRectParameter = [
            LEFT_X,
            BOTTOM_Y,
            resizeRectWidth,
            resizeRectWidth
        ];
        const TOP: IRectParameter = [
            CENTER_X,
            TOP_Y,
            resizeRectWidth,
            resizeRectWidth
        ];
        const BOTTOM: IRectParameter = [
            CENTER_X,
            BOTTOM_Y,
            resizeRectWidth,
            resizeRectWidth
        ];
        const RIGHT_TOP: IRectParameter = [
            RIGH_X,
            TOP_Y,
            resizeRectWidth,
            resizeRectWidth
        ];
        const RIGHT: IRectParameter = [
            RIGH_X,
            CENTER_Y,
            resizeRectWidth,
            resizeRectWidth
        ];
        const RIGHT_BOTTOM: IRectParameter = [
            RIGH_X,
            BOTTOM_Y,
            resizeRectWidth,
            resizeRectWidth
        ];
        const ANGLE: IRectParameter = [
            CENTER_X,
            TOP_Y - resizeRectWidth * 2,
            resizeRectWidth,
            resizeRectWidth
        ];
        return {
            LEFT_TOP,
            LEFT,
            LEFT_BOTTOM,
            TOP,
            BOTTOM,
            RIGHT_TOP,
            RIGHT,
            RIGHT_BOTTOM,
            ANGLE
        };
    }

    private _renderRange({ x, y, width, height }: any) {
        this.ctx.save();
        this.ctx.globalAlpha = 0.5;
        this.ctx.fillStyle = "#AECBFA";
        this.ctx.fillRect(x, y, width, height);
        this.ctx.restore();
    }

    private _drawOprate(elements: IPPTElement[]) {
        const zoom = this.stageConfig.zoom;
        if (elements.length === 0) return;
        const { x, y } = this.stageConfig.getStageOrigin();

        for (const element of elements) {
            this.ctx.save();
            // 缩放画布
            this.ctx.scale(zoom, zoom);

            if (element.type === "line") {
                this.ctx.translate(x, y);

                this.ctx.fillStyle = "#ffffff";
                this.ctx.strokeStyle = THEME_COLOR;
                this.ctx.lineWidth = 1 / zoom;
                const dashWidth = 8 / zoom;
                const rects: IRects = this._getElementLinePoints(
                    element.left,
                    element.top,
                    element.end,
                    dashWidth
                );
                this.ctx.fillStyle = "#ffffff";
                this.ctx.strokeStyle = THEME_COLOR;
                this.ctx.lineWidth = 1 / zoom;
                for (const key in rects) {
                    this.ctx.fillRect(...rects[key]);
                    this.ctx.strokeRect(...rects[key]);
                }
            } else {
                const sx = x + element.left;
                const sy = y + element.top;

                // 平移原点到元素起始点
                this.ctx.translate(sx, sy);
                const selectArea = this.stageConfig.selectArea;
                if (
                    selectArea &&
                    this.stageConfig.textFocus &&
                    (element.type === "text" || element.type === "shape" || element.type === "table")
                ) {
                    // 存在文本选中状态
                    const tableSelectCells = this.stageConfig.tableSelectCells;
                    let tableCellPosition: [number, number] | undefined;
                    if (tableSelectCells) {
                        const startRow = Math.min(tableSelectCells[0][0], tableSelectCells[1][0]);
                        const startCol = Math.min(tableSelectCells[0][1], tableSelectCells[1][1]);
                        const endRow = Math.max(tableSelectCells[0][0], tableSelectCells[1][0]);
                        const endCol = Math.max(tableSelectCells[0][1], tableSelectCells[1][1]);
                        if (startRow === endRow && startCol === endCol) {
                            tableCellPosition = [startRow, startCol];
                        }
                    }
                    const lineTexts = this.stageConfig.getRenderContent(element, tableCellPosition);
                    const x = TEXT_MARGIN;
                    let y = TEXT_MARGIN;
                    let textLineHeight = 2;
                    if (element.type === "table") {
                        if (tableCellPosition) {
                            textLineHeight = element.data[tableCellPosition[0]][tableCellPosition[1]].lineHeight;
                        }
                    } else {
                        textLineHeight = element.lineHeight;
                    }

                    lineTexts.forEach((lineData, index) => {
                        const lineHeight = lineData.height * textLineHeight;
                        const rangeRecord = this.stageConfig.getRenderSelect(
                            x,
                            y,
                            lineData,
                            index,
                            selectArea,
                            element,
                            tableCellPosition
                        );
                        if (rangeRecord) this._renderRange(rangeRecord);
                        y = y + lineHeight;
                    });
                }

                // 平移坐标原点到元素中心
                this.ctx.translate(element.width / 2, element.height / 2);
                // 水平垂直翻转
                const isText = element.type === "text";
                // 旋转画布
                this.ctx.rotate((element.rotate / 180) * Math.PI);

                this.ctx.strokeStyle = THEME_COLOR;
                this.ctx.lineWidth = 1 / zoom;
                // 增加选中框与元素的间隙距离
                const margin = 1;
                const offsetX = -element.width / 2 - margin;
                const offsetY = -element.height / 2 - margin;
                this.ctx.strokeRect(
                    offsetX,
                    offsetY,
                    element.width + margin * 2,
                    element.height + margin * 2
                );

                const dashedLinePadding = 0 + margin / zoom;
                const dashWidth = 8 / zoom;

                const rects: IRects = this._getElementResizePoints(
                    offsetX,
                    offsetY,
                    element.width + margin * 2,
                    element.height + margin * 2,
                    dashedLinePadding,
                    dashWidth
                );
                this.ctx.fillStyle = "#ffffff";
                this.ctx.strokeStyle = THEME_COLOR;
                this.ctx.lineWidth = 1 / zoom;
                for (const key in rects) {
                    if (
                        isText &&
                        key !== "LEFT" &&
                        key !== "RIGHT" &&
                        key !== "ANGLE"
                    ) continue;
                    this.ctx.fillRect(...rects[key]);
                    this.ctx.strokeRect(...rects[key]);
                }
            }
            this.ctx.restore();
        }
    }

    public resetDrawOprate() {
        this.clear();
        const elements = this.stageConfig.operateElements;
        if (elements.length === 0) return;
        this._drawOprate(elements);
    }
}
