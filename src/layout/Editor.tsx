import { useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import Canvas from "react-native-canvas";
import Editor from "../plugins/editor";

function LayoutEditor(): JSX.Element {
    const canvasScreenRef = useRef(null);
    const canvasControlRef = useRef(null);
    const ContainerRef = useRef(null);
    useEffect(() => {
        const canvasScreen = canvasScreenRef.current as Canvas | null;
        const canvasControl = canvasControlRef.current as Canvas | null;
        const container = ContainerRef.current as View | null;
        if (canvasScreen && canvasControl && container) {
            container.measure((x, y, width, height, left, top) => {
                new Editor(canvasScreen, canvasControl, width, height, []);
            });
        }
    }, []);

    return (
        <View style={styles.ContainerStyle} ref={ContainerRef}>
            <Canvas ref={canvasScreenRef} />
            <Canvas style={styles.canvasControlStyle} ref={canvasControlRef} />
        </View>
    );
}

const styles = StyleSheet.create({
    ContainerStyle: {
        flex: 1,
        position: "relative"
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
