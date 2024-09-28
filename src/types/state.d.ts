export interface IState {
    cursor: number;
    menu: {
        visible: boolean;
        type: "element" | "canvas",
        styles: {
            left: number;
            top: number;
        }
    }
}
