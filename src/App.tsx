import React from "react";
import { SafeAreaView } from "react-native";
import LayoutEditor from "./layout/Editor";

function App(): JSX.Element {
    const backgroundStyle = {
        backgroundColor: "#ffffff",
        flex: 1
    };

    return (
        <>
            <SafeAreaView style={backgroundStyle}>
                <LayoutEditor />
            </SafeAreaView>
        </>
    );
}

export default App;
