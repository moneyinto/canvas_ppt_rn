import { useState } from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import instanceStore from "../../store/instanceStore";
import { IState } from "../../types/state";
import InsertEdit from "./insertEdit";

export default function NavHeader() {
    const [modalVisible, setModalVisible] = useState(false);
    const cursor = useSelector((state: IState) => state.cursor);

    return (
        <>
            <View style={styles.HeaderStyle}>
                <TouchableOpacity
                    onPress={() => {
                        setModalVisible(true);
                    }}
                >
                    <Image
                        source={require("./images/add.png")}
                        style={styles.HeaderIconStyle}
                    />
                </TouchableOpacity>

                <TouchableOpacity
                    disabled={cursor <= 0}
                    onPress={() => {
                        instanceStore.editor?.history.undo();
                    }}
                >
                    <Image
                        source={require("./images/revoke.png")}
                        style={[
                            styles.HeaderIconStyle,
                            { opacity: cursor <= 0 ? 0.3 : 1 }
                        ]}
                    />
                </TouchableOpacity>
            </View>

            <InsertEdit
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
            />
        </>
    );
}

const styles = StyleSheet.create({
    HeaderStyle: {
        height: 50,
        backgroundColor: "#ffffff",
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end"
    },
    HeaderIconStyle: {
        width: 30,
        height: 30,
        marginLeft: 15
    }
});
