import { useEffect, useRef } from "react";
import {
    Text,
    PanResponder,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";
import { useDispatch } from "react-redux";
import Canvas from "react-native-canvas";
import Editor from "../plugins/editor";
import { slides } from "../mock";
import NavHeader from "./NavHeader/index";
import useSlideHandler from "../hooks/useSlideHandler";
import { ActionType } from "../store/reducers/actionType";
import instanceStore from "../store/instanceStore";

function LayoutEditor(): JSX.Element {
    const canvasScreenRef = useRef(null);
    const canvasControlRef = useRef(null);
    const ContainerRef = useRef(null);
    let instance: Editor | null = null;
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
                instance?.controlStage.touchStart(e);
            },
            onPanResponderMove: (e, gestureState) => {
                instance?.controlStage.touchMove(e, gestureState);
            },
            onPanResponderTerminationRequest: (evt, gestureState) => true,
            onPanResponderRelease: (e, gestureState) => {
                instance?.controlStage.touchEnd(e);
            }
        })
    ).current;

    return (
        <View style={styles.LayoutContainerStyle}>
            <NavHeader />
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
