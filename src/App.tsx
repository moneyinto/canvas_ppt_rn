import React from "react";
import { SafeAreaView } from "react-native";

import { Colors } from "react-native/Libraries/NewAppScreen";

import LayoutEditor from "./layout/Editor";

function App(): JSX.Element {
    const backgroundStyle = {
        backgroundColor: Colors.lighter,
        flex: 1
    };

    return (
        <SafeAreaView style={backgroundStyle}>
            <LayoutEditor />
        </SafeAreaView>
    );
}

export default App;
