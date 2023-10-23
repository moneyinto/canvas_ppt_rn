import { OPTION_TYPE } from "../config/options";
import { ISlide } from "./slide";

export type IBoundsCoords = [number, number, number, number];

export type IRectParameter = IBoundsCoords;

export type IRects = Record<string, IRectParameter>;

export type IElementOptions = Record<string, string>;

export interface IRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface ICacheImage {
    id: string;
    image: HTMLImageElement;
}

export interface IMouseClick {
    x: number;
    y: number;
    textX: number;
    textY: number;
}

export interface IHistory {
    id: number;
    optionType?: OPTION_TYPE;
    slideId: string;
    slides: ISlide[];
}

export type IElementAlignType =
    | "alignLeft"
    | "alignCenter"
    | "alignRight"
    | "center"
    | "oneAlignCenter"
    | "oneVerticalCenter"
    | "verticalTop"
    | "verticalCenter"
    | "verticalBottom";

export interface IFileStore {
    [key: string]: string;
}

export interface IGradientColor {
    offset: number;
    value: string;
}

export interface IKeyframe {
    range: [number, number];
    translatePercentage?: boolean;
    originTranslate?: [number, number];
    translate: [number, number];
    originScale?: [number, number];
    scale: [number, number];
    originOpacity?: number;
    opacity: number;
    originRotate?: number;
    rotate: number;
    originSkew?: [number, number];
    skew: [number, number];
    change?: boolean;
}

export interface IAnimationStatus {
    [key: string]: IKeyframe[];
}