import { useEffect, useRef } from "react";
import {
    Text,
    PanResponder,
    StyleSheet,
    TouchableOpacity,
    View
} from "react-native";
import Canvas from "react-native-canvas";
import Editor from "../plugins/editor";
import { slides } from "../mock";
import NavHeader from "./NavHeader/index";
import useSlideHandler from "../hooks/useSlideHandler";
import store from "../store";

function LayoutEditor(): JSX.Element {
    const canvasScreenRef = useRef(null);
    const canvasControlRef = useRef(null);
    const ContainerRef = useRef(null);
    let instance: Editor | null = null;

    const { initSlide } = useSlideHandler()

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

                    store.editor = instance;

                    initSlide(instance)
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
                if (gestureState.numberActiveTouches === 2) {
                    instance?.controlStage.touchScale(e);
                } else {
                    instance?.controlStage.touchMove(e);
                }
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
