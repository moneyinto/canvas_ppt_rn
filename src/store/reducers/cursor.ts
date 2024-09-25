import { UnknownAction } from "redux";
import { ActionType } from "./actionType";


const cursorReducer = (cursor = -1, action: UnknownAction) => {
    switch (action.type) {
        case ActionType.UPDATE_CURSOR:
            return action.cursor
        default:
            return cursor
    }
};

export default cursorReducer;
