import { useEffect, useRef, useState } from "react";
import {
    Text,
    PanResponder,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Canvas from "react-native-canvas";
import Editor from "../plugins/editor";
import { slides } from "../mock";
import NavHeader from "./NavHeader";
import Menu from "./Menu";
import useSlideHandler from "../hooks/useSlideHandler";
import { ActionType } from "../store/reducers/actionType";
import instanceStore from "../store/instanceStore";
import { IState } from "../types/state";

function LayoutEditor(): JSX.Element {
    const canvasScreenRef = useRef(null);
    const canvasControlRef = useRef(null);
    const ContainerRef = useRef(null);
    let instance: Editor | null = null;
    const menu = useSelector((state: IState) => state.menu);
    let cacheMenuVisible = menu.visible;
    const [screenWidth, setScreenWidth] = useState(320);
    const dispatch = useDispatch();

    const { initSlide } = useSlideHandler();

    useEffect(() => {
        const canvasScreen = canvasScreenRef.current as Canvas | null;
        const canvasControl = canvasControlRef.current as Canvas | null;
        const container = ContainerRef.current as View | null;
        if (canvasScreen && canvasControl && container) {
            setTimeout(() => {
                container.measure((x, y, width, height, left, top) => {
                    console.log(x, y, width, height, left, top);
                    setScreenWidth(width)
                    instance = new Editor(
                        canvasScreen,
                        canvasControl,
                        width,
                        height,
                        slides
                    );

                    instanceStore.editor = instance;

                    instance.listener.onEditChange = (cursor, length, slideId) => {
                        console.log("============cursor", cursor, length, slideId);
                        dispatch({
                            type: ActionType.UPDATE_CURSOR,
                            cursor
                        })
                        // historyLength.value = length;
                    }

                    // 菜单
                    instance.listener.onMenuVisibleChange = (visible, type, position) => {
                        // 减少dispatch
                        if (cacheMenuVisible === false && visible === false) return;
                        // ！！！注意，只执行一遍，这里的menu值一直是第一次加载的值，虽然dispatch改变了menu的值，也不起作用
                        cacheMenuVisible = visible;
                        dispatch({
                            type: ActionType.UPDATE_MENU,
                            menu: {
                                visible,
                                type,
                                styles: {
                                    left: position[0],
                                    top: position[1]
                                }
                            }
                        });
                    }

                    initSlide(instance);
                });
            }, 300);
        }
    }, []);

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: () => true,
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponderCapture: (e, gestureState) => true,
            onStartShouldSetPanResponderCapture: () => true,
            onPanResponderGrant: (e, gestureState) => {
                instance?.controlStage.touchStart(e, gestureState);
            },
            onPanResponderMove: (e, gestureState) => {
                instance?.controlStage.touchMove(e, gestureState);
            },
            onPanResponderTerminationRequest: (evt, gestureState) => true,
            onPanResponderRelease: (e, gestureState) => {
                instance?.controlStage.touchEnd(e, gestureState);
            }
        })
    ).current;

    return (
        <View style={styles.LayoutContainerStyle}>
            <NavHeader />
            {
                menu.visible && <Menu width={screenWidth} />
            }
            <View
                {...panResponder.panHandlers}
                style={styles.CanvasContainerStyle}
                ref={ContainerRef}
            >
                <Canvas
                    style={styles.CanvasViewStyle}
                    ref={canvasScreenRef}
                />
                <Canvas
                    style={styles.canvasControlStyle}
                    ref={canvasControlRef}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    LayoutContainerStyle: {
        flex: 1
    },
    CanvasContainerStyle: {
        flex: 1,
        position: "relative",
        backgroundColor: "#f2f2f7"
    },
    CanvasViewStyle: {
        flex: 1
    },
    canvasControlStyle: {
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%"
    }
});

export default LayoutEditor;
