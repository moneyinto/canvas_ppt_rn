import { UnknownAction } from "redux";
import { ActionType } from "./actionType";

const menuReducer = (
    menu = { visible: false, type: "element", styles: { left: 0, top: 0 } },
    action: UnknownAction
) => {
    switch (action.type) {
        case ActionType.UPDATE_MENU:
            return action.menu;
        default:
            return menu;
    }
};

export default menuReducer;
