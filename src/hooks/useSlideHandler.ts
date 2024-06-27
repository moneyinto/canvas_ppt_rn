import { useState } from "react";
import { ISlide } from "../types/slide";
export default function useSlideHandler() {
    const [slideIndex, setSlideIndex] = useState(0);
    const [viewSlides, setViewSlides] = useState<ISlide[]>([]);

    const initSlide = () => {
        // 初始化幻灯片
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