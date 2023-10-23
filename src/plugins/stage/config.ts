import { VIEWPORT_SIZE, VIEWRATIO } from "../../config/stage";
import { ISlide } from "../../types/slide";

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
}