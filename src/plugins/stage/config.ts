import { baseFontConfig } from "../../config/font";
import { VIEWPORT_SIZE, VIEWRATIO } from "../../config/stage";
import { IPPTShapeElement, IPPTTableCell, IPPTTableElement, IPPTTextElement } from "../../types/element";
import { IFontConfig, ILineData } from "../../types/font";
import { IPPTAnimation, IPPTTurningAnimation, ISlide } from "../../types/slide";
import { deepClone } from "../../utils";

export const TEXT_MARGIN = 5;

export default class StageConfig {
    public scrollX: number;
    public scrollY: number;
    public zoom: number;
    public canMove: boolean;

    public slides: ISlide[] = [];
    public slideId = "";

    public resetDrawView: (() => void) | null;
    public resetDrawOprate: (() => void) | null;

    private _width = 0;
    private _height = 0;

    public fontConfig: IFontConfig = deepClone(baseFontConfig); // 富文本聚焦后前一个字体配置 或 默认配置
    public textFocus = false; // 富文本框是否聚焦 双击聚焦后才可以编辑
    public textFocusElementId = ""; // 聚焦富文本框元素id
    // [开始字坐标，开始行坐标，结束字坐标，结束行坐标]
    public selectArea: [number, number, number, number] | null = null;
    // 表格编辑状态
    public tableEditElementID = "";
    // 表格选中单元格 [[开始行，开始列], [结束行，结束列]
    public tableSelectCells: [[number, number], [number, number]] | null = null;

    // 动画执行指针
    public animationIndex = -1;
    // 动画元素隐藏集合
    public animationHideElements: string[] = [];
    // 当前执行的动画集合
    public actionAnimations: IPPTAnimation[][] = [];
    // 判断元素动画是否正在执行
    public isElementAnimation = false;
    // 判断切页动画是否正在执行
    public isTurningAnimation = false;
    // 动画执行时间
    public animationTime = 0;
    // 动画执行累计时间
    public animationCountTime = 0;
    // 切页动画
    public turningAni: IPPTTurningAnimation | null = null;


    // 边距
    private _margin = 0;
    constructor(width: number, height: number, margin?: number) {
        this.scrollX = 0;
        this.scrollY = 0;
        this.canMove = false;

        this._width = width;
        this._height = height;
        this._margin = margin || 0;

        this.zoom = this.getFitZoom();

        this.resetDrawView = null;
        this.resetDrawOprate = null;
    }

    public resetCheckDrawView() {
        this.resetDrawView && this.resetDrawView();
    }

    public resetCheckDrawOprate() {
        this.resetDrawOprate && this.resetDrawOprate();
    }

    public setScroll(x: number, y: number) {
        this.scrollX = x;
        this.scrollY = y;

        this.resetCheckDrawView();
        this.resetCheckDrawOprate();
    }

    public setZoom(zoom: number) {
        this.zoom = zoom;

        this.resetCheckDrawView();
        this.resetCheckDrawOprate();

        // this._listener?.onZoomChange(this.zoom);
    }

    public getWidth() {
        return this._width;
    }

    public getHeight() {
        return this._height;
    }

    public getFitZoom() {
        const width = this.getWidth();
        const height = this.getHeight();

        let stageWidth = 0;
        let stageHeight = 0;
        if (height / width > VIEWRATIO) {
            // 以宽度为限制值
            stageWidth = width - this._margin * 2;
        } else {
            stageHeight = height - this._margin * 2;
            stageWidth = stageHeight / VIEWRATIO;
        }

        return stageWidth / VIEWPORT_SIZE;
    }

    public resetBaseZoom() {
        this.zoom = this.getFitZoom();

        this.scrollX = 0;
        this.scrollY = 0;

        this.resetCheckDrawView();
        this.resetCheckDrawOprate();

        // this._listener?.onZoomChange(this.zoom);
    }

    public getStageArea() {
        const width = this.getWidth();
        const height = this.getHeight();

        const stageWidth = VIEWPORT_SIZE * this.zoom;
        const stageHeight = VIEWPORT_SIZE * VIEWRATIO * this.zoom;
        const x = (width - stageWidth) / 2 - this.scrollX;
        const y = (height - stageHeight) / 2 - this.scrollY;

        return { x, y, stageWidth, stageHeight };
    }

    // 获取画布偏移量
    // public getCanvasOffset() {
    //     return {
    //         offsetX: this._container.offsetLeft,
    //         offsetY: this._container.offsetTop
    //     };
    // }

    public getStageOrigin() {
        const { x, y } = this.getStageArea();
        return { x: x / this.zoom, y: y / this.zoom };
    }

    public setSlides(slides: ISlide[]) {
        this.slides = slides;
    }

    public setSlideId(slideId: string) {
        this.slideId = slideId;
    }

    public getCurrentSlide() {
        return this.slides.find((slide) => this.slideId === slide.id);
    }

    /**
     * 旋转坐标点
     */
    public rotate(
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        angle: number
    ): [number, number] {
        // 𝑎′𝑥=(𝑎𝑥−𝑐𝑥)cos𝜃−(𝑎𝑦−𝑐𝑦)sin𝜃+𝑐𝑥
        // 𝑎′𝑦=(𝑎𝑥−𝑐𝑥)sin𝜃+(𝑎𝑦−𝑐𝑦)cos𝜃+𝑐𝑦.
        // https://math.stackexchange.com/questions/2204520/how-do-i-rotate-a-line-segment-in-a-specific-point-on-the-line
        return [
            (x1 - x2) * Math.cos(angle) - (y1 - y2) * Math.sin(angle) + x2,
            (x1 - x2) * Math.sin(angle) + (y1 - y2) * Math.cos(angle) + y2
        ];
    }

    // 获取表格对应单元格数据
    public getTableCellData(element: IPPTTableElement, row: number, col: number) {
        const tableCell = element.data[row][col];
        const rowHeights = element.rowHeights.map(item => item * element.height);
        const colWidths = element.colWidths.map(item => item * element.width);
        const tableCellLeft = colWidths.slice(0, col).reduce((a, b) => a + b, 0);
        const tableCellTop = rowHeights.slice(0, row).reduce((a, b) => a + b, 0);
        const tableCellWidth = colWidths.slice(col, col + tableCell.colspan).reduce((a, b) => a + b, 0);
        const tableCellHeight = rowHeights.slice(row, row + tableCell.rowspan).reduce((a, b) => a + b, 0);
        return { tableCellLeft, tableCellTop, tableCellWidth, tableCellHeight };
    }

    // 获取文本变更后文本框高度
    public getTextHeight(operateElement: IPPTTextElement | IPPTShapeElement | IPPTTableElement, tableCellPosition?: [number, number]) {
        const renderContent = this.getRenderContent(operateElement, tableCellPosition);
        let height = TEXT_MARGIN * 2;
        let textElement: IPPTTextElement | IPPTShapeElement | IPPTTableCell | null = null;
        if (
            operateElement.type === "table" &&
            ((this.tableSelectCells && this.tableSelectCells.length > 0) || tableCellPosition)
        ) {
            const row = tableCellPosition ? tableCellPosition[0] : this.tableSelectCells![0][0];
            const col = tableCellPosition ? tableCellPosition[1] : this.tableSelectCells![0][1];
            const tableCell = operateElement.data[row][col];
            textElement = tableCell;
        } else {
            textElement = operateElement as IPPTTextElement | IPPTShapeElement;
        }
        renderContent.forEach((line) => {
            height += line.height * textElement!.lineHeight;
        });
        return height;
    }

    public getRenderContent(element: IPPTTextElement | IPPTShapeElement | IPPTTableElement, tableCellPosition?: [number, number]) {
        // ！！！文本可能由于TEXT_MARGIN的原因，导致宽度不够，需要换行, 但是没有边距，又会有点贴边，后面进行调整
        let width = element.width - TEXT_MARGIN * 2;

        let textElement: IPPTTextElement | IPPTShapeElement | IPPTTableCell | null = null;

        if (
            element.type === "table" &&
            ((this.tableSelectCells && this.tableSelectCells.length > 0) || tableCellPosition)
        ) {
            const row = tableCellPosition ? tableCellPosition[0] : this.tableSelectCells![0][0];
            const col = tableCellPosition ? tableCellPosition[1] : this.tableSelectCells![0][1];
            const tableCell = element.data[row][col];
            const { tableCellWidth } = this.getTableCellData(element, row, col);
            width = tableCellWidth - TEXT_MARGIN * 2;

            textElement = tableCell;
        } else {
            textElement = element as IPPTTextElement | IPPTShapeElement;
        }

        const renderContent: ILineData[] = [];
        let lineData: ILineData = {
            height: 0,
            width: 0,
            texts: []
        };
        let countWidth = 0;
        textElement.content.forEach((text) => {
            if (lineData.height === 0) lineData.height = text.fontSize;
            if (text.value === "\n") {
                lineData.texts.push(text);
                renderContent.push(lineData);
                lineData = {
                    height: 0,
                    width: 0,
                    texts: []
                };
                countWidth = 0;
            } else if (countWidth + text.width < width) {
                // 一行数据可以摆得下
                lineData.texts.push(text);
                if (lineData.height < text.fontSize) lineData.height = text.fontSize;
                countWidth = countWidth + text.width + textElement!.wordSpace;
                lineData.width = countWidth;
            } else {
                renderContent.push(lineData);
                lineData = {
                    height: text.fontSize,
                    width: text.width,
                    texts: [text]
                };
                countWidth = text.width + textElement!.wordSpace;
            }
        });

        if (lineData.texts.length > 0) {
            renderContent.push(lineData);
        }

        return renderContent;
    }

    public getAlignOffsetX(line: ILineData, element: IPPTTextElement | IPPTShapeElement | IPPTTableElement, tableCellPosition?: [number, number]) {
        let align: "left" | "center" | "right" = "center";
        let width = 0;
        if (element.type === "table") {
            let row = 0;
            let col = 0;
            if (tableCellPosition) {
                row = tableCellPosition[0];
                col = tableCellPosition[1];
            } else if (this.tableSelectCells && this.tableSelectCells.length > 0) {
                row = this.tableSelectCells[0][0];
                col = this.tableSelectCells[0][1];
            }
            const tableCell = element.data[row][col];
            const { tableCellWidth } = this.getTableCellData(element, row, col);
            align = tableCell.align || "center";
            width = tableCellWidth;
        } else {
            align = element.align || "center";
            width = element.width;
        }

        return {
            left: 0,
            center: (width - TEXT_MARGIN * 2 - line.width) / 2,
            right: width - TEXT_MARGIN * 2 - line.width
        }[align];
    }
}