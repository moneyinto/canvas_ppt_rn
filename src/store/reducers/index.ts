import { combineReducers } from "redux";
import cursor from "./cursor";
import menu from "./menu";

const rootReducer = combineReducers({
    cursor,
    menu
});

export default rootReducer;
