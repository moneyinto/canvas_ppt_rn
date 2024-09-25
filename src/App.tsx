import React from "react";
import { SafeAreaView } from "react-native";
import LayoutEditor from "./layout/Editor";
import { Provider } from "react-redux";
import store from "./store";

function App(): JSX.Element {
    const backgroundStyle = {
        backgroundColor: "#ffffff",
        flex: 1
    };

    return (
        <Provider store={store}>
            <SafeAreaView style={backgroundStyle}>
                <LayoutEditor />
            </SafeAreaView>
        </Provider>
    );
}

export default App;
