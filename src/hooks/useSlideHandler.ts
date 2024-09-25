import { useState } from "react";
import { ISlide } from "../types/slide";
import Editor from "../plugins/editor";
export default function useSlideHandler() {
    const [slideIndex, setSlideIndex] = useState(0);
    const [viewSlides, setViewSlides] = useState<ISlide[]>([]);

    const initSlide = async (instance: Editor) => {
        // 初始化幻灯片
        const slides = await instance.history.getHistorySnapshot();
        instance.stageConfig.setSlides(slides);
        // historyCursor.value = instance.value.history.cursor;
        // historyLength.value = historyCursor.value + 1;
        if (slides.length > 0) {
            // 设置当前幻灯片
            const selectedSlideId = slides[slideIndex].id;
            instance.stageConfig.setSlideId(selectedSlideId);
            // 进行渲染
            instance.command.executeRender();
            // 初始化时增加历史记录
            // instance.value?.history.add();
        }
    };

    const deleteSide = () => {
        // 删除幻灯片
    };

    return {
        slideIndex,
        setSlideIndex,
        viewSlides,
        setViewSlides,
        initSlide,
        deleteSide
    };
}