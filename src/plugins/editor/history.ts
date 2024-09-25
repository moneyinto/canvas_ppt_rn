import Listener from "./listener";
import StageConfig from "../stage/config";
import DB from "../../utils/db";
import { ISlide } from "../../types/slide";
import { OPTION_TYPE } from "../../config/options";

export default class History {
    public cursor = -1; // 快照指针
    private _db: DB;
    private _stageConfig: StageConfig;
    private _listener: Listener;
    private _snapshotKeys: number[];
    constructor(stageConfig: StageConfig, listener: Listener, db: DB) {
        this._stageConfig = stageConfig;
        this._listener = listener;
        this._db = db;
        this._snapshotKeys = [];
    }

    public async getHistorySnapshot() {
        this._snapshotKeys = await this._db.getAllKeys() as number[];
        if (!this._snapshotKeys || this._snapshotKeys.length === 0) {
            await this.add(OPTION_TYPE.INIT_DB_SLIDE);
        }
        const history = await this._db.getData(this._snapshotKeys[this._snapshotKeys.length - 1] as number);
        this.cursor = this._snapshotKeys.length - 1;
        return history.slides;
    }

    public async add(optionType?: OPTION_TYPE) {
        const data = this._stageConfig.slides;
        const history = await this._db.getData(this._snapshotKeys.length === 0 ? -1 : this._snapshotKeys[this.cursor]);
        // 存储值与当前操作变化值相等，则没变化，阻断操作
        if (history && JSON.stringify(data) === JSON.stringify(history.slides)) return;

        if (this.cursor > -1 && this.cursor < this.length - 1) {
            // 移除指针后面的数据
            await this._db.delete(this._snapshotKeys.slice(this.cursor + 1));
        }

        // 获取当前编辑页，存储历史记录时，存入变化的页ID
        const currentSlide = this._stageConfig.getCurrentSlide();

        await this._db.setData(currentSlide!.id, data, optionType);

        this._snapshotKeys = (await this._db.getAllKeys() || []) as number[];
        this.cursor++;
        this._listener.onEditChange(this.cursor, this.length, currentSlide!.id);
    }

    get length() {
        return this._snapshotKeys.length;
    }

    // 清理
    public async clear(ignoreFile?: boolean) {
        if (!ignoreFile) await this._db.deleteFiles();
        await this._db.delete(this._snapshotKeys);
        this._snapshotKeys = [];
        this.cursor = -1;

        // 清空图片暂存
        // this._stageConfig.clearCacheImages();
    }

    public async updateThumbnailSlide(cursor: number) {
        const history = await this._db.getData(this._snapshotKeys[cursor]);
        // 更新缩略图 （由于缩略图不一定要更新所有的页面，但是存在需要更新所有的情况，这里为了降低操作性能消耗，后面history中记录当前具体操作类型，根据类型来判断是否要更新所有缩略图）
        if (history.optionType === OPTION_TYPE.APPLY_BACKGROUND_ALL) {
            this._stageConfig.slides.forEach(slide => {
                this._listener.onUpdateThumbnailSlide(slide);
            });
        }
    }

    // 获取文件
    public getFile(fileId: string) {
        return this._db.getFile(fileId);
    }

    // 存储文件
    public async saveFile(fileId: string, file: string) {
        await this._db.saveFile(fileId, file);
    }

    // 恢复
    public async redo() {
        if (this.cursor < this.length - 1) {
            this.cursor++;
            this._setSlides();

            this.updateThumbnailSlide(this.cursor);
        }
    }

    // 撤销
    public async undo() {
        console.log("撤销xxx", this.cursor)
        if (this.cursor > 0) {
            this.cursor--;
            this._setSlides();

            this.updateThumbnailSlide(this.cursor + 1);
        }
    }

    // 展示数据
    private async _setSlides() {
        const history = await this._db.getData(this._snapshotKeys[this.cursor]);
        const slides = history.slides as ISlide[];
        const isSlidesChange = this._stageConfig.slides.length !== slides.length;
        this._stageConfig.setSlides(slides);
        // 当页出现增减变化 不执行该方法 处理页面渲染重叠现象
        if (!isSlidesChange) this._stageConfig.resetCheckDrawView();
        // oprateElements存在时，这里需要验证一下oprateElements是否还在slides中
        const operateElements = this._stageConfig.operateElements;
        if (operateElements.length > 0) {
            const currentSlide = this._stageConfig.getCurrentSlide();
            const elements = currentSlide?.elements.filter(element => operateElements.findIndex(ele => element.id === ele.id) !== -1);
            this._stageConfig.updateOperateElements(elements?.length === operateElements.length ? elements : []);
            this._stageConfig.resetCheckDrawOprate();
        }
        // this._stageConfig.hideCursor();
        this._listener.onEditChange(this.cursor, this.length, history.slideId as string);
        // 撤销通知动画变更
        this._listener.onAnimationsChange();
    }
}
