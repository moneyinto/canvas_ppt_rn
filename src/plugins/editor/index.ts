import Canvas from "react-native-canvas";
import { ISlide } from "../../types/slide";
import StageConfig from "../stage/config";
import ControlStage from "./control";
import ViewStage from "./view";
import Listener from "./listener";
import History from "./history";
import DB from "../../utils/db";
import Command from "./command";
import Cursor from "./cursor";
import Textarea from "./textarea";

export default class Editor {
    public listener: Listener;
    public command: Command;
    public stageConfig: StageConfig;
    public history: History;

    private _cursor: Cursor;
    private _textarea: Textarea;
    private _viewStage: ViewStage;
    public controlStage: ControlStage;

    constructor(canvasScreen: Canvas, canvasControl: Canvas, width: number, height: number, slides: ISlide[]) {
        // 监听
        this.listener = new Listener();

        // 画板配置
        this.stageConfig = new StageConfig(width, height, this.listener, 20);
        // 防抖，减少渲染叠加
        this.stageConfig.resetDrawView = () => this._viewStage.resetDrawPage();
        this.stageConfig.resetDrawOprate = () => this.controlStage.resetDrawOprate();
        // this.stageConfig.hideCursor = () => this._controlStage.hideCursor();
        // this.stageConfig.getFontSize = (text) => {
        //     return this._controlStage.getFontSize(text);
        // };

        this.stageConfig.setSlides(slides);
        if (slides.length > 0) this.stageConfig.setSlideId(slides[0].id);

        const db = new DB();
        // 历史数据
        this.history = new History(this.stageConfig, this.listener, db);

        this._textarea = new Textarea();
        this._cursor = new Cursor(this._textarea, this.stageConfig);

        // 命令
        this.command = new Command(this.stageConfig, this.listener, this.history, this._cursor);

        // 创建展示画板
        this._viewStage = new ViewStage(canvasScreen, this.stageConfig, db);

        // 创建操作画板
        this.controlStage = new ControlStage(canvasControl, this.stageConfig, db, this.command);

        // this._container = container;
        // this._resizeObserver = new ResizeObserver(throttleRAF(this._reset.bind(this)));
        // this._resizeObserver.observe(container);
        // window.addEventListener("resize", throttleRAF(this._reset.bind(this)));

        // 快捷键
        // eslint-disable-next-line
        // new Shortcut(container, this.stageConfig, this.command);
    }

    private _reset() {
        this.controlStage.resetStage();
        this._viewStage.resetStage();

        this.stageConfig.resetBaseZoom();
    }
}
