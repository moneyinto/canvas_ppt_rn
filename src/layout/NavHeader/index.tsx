import { useState } from "react";
import {
    Animated,
    Image,
    Modal,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Editor from "../../plugins/editor";
import { tabList } from "./config";
import useInsertHandler from "../../hooks/useInsertHandler";

export default function NavHeader({ editor }: { editor: Editor | null }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [translateX] = useState(new Animated.Value(4));
    const [tabIndex, setTabIndex] = useState(0);

    function switchTab(index: number) {
        setTabIndex(index);
        Animated.timing(translateX, {
            toValue: index * 50 + 4,
            duration: 300,
            useNativeDriver: true
        }).start();
    }

    const { actionInsertCommand } = useInsertHandler()

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

                <TouchableOpacity>
                    <Image
                        source={require("./images/revoke.png")}
                        style={styles.HeaderIconStyle}
                    />
                </TouchableOpacity>
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
            >
                <SafeAreaView style={styles.ModalBgStyle}>
                    <View style={styles.ModalContainerStyle}>
                        <View style={styles.SwitchTabStyle}>
                            <View style={styles.SwitchBoxStyle}>
                                <Animated.View
                                    style={[
                                        styles.SwitchSlideBgStyle,
                                        {
                                            transform: [{ translateX }]
                                        }
                                    ]}
                                ></Animated.View>
                                {tabList.map((item, index) => {
                                    return (
                                        <TouchableOpacity
                                            style={styles.SwitchTabItemStyle}
                                            onPress={() => switchTab(index)}
                                            key={`${item.name}_${index}`}
                                        >
                                            <Text>{item.name}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                            <TouchableOpacity
                                style={styles.HeaderCloseStyle}
                                onPress={() => {
                                    setModalVisible(false);
                                }}
                            >
                                <Image
                                    source={require("./images/close.png")}
                                    style={styles.HeaderIconStyle}
                                />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.TabContentStyle}>
                            <View style={styles.TabBlockStyle}>
                                {tabList[tabIndex].children.map(
                                    (tabItem, index) => {
                                        return (
                                            <View
                                                style={styles.TabLineStyle}
                                                key={`${tabItem.name}_${index}`}
                                            >
                                                <TouchableOpacity
                                                    style={[
                                                        styles.TabItemStyle,
                                                        index ===
                                                        tabList[tabIndex]
                                                            .children.length -
                                                            1
                                                            ? {
                                                                  borderBottomWidth: 0
                                                              }
                                                            : {}
                                                    ]}
                                                    onPress={() =>
                                                        actionInsertCommand(tabItem)
                                                    }
                                                >
                                                    <Text
                                                        style={{ fontSize: 16 }}
                                                    >
                                                        {tabItem.name}
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        );
                                    }
                                )}
                            </View>
                        </View>
                    </View>
                </SafeAreaView>
            </Modal>
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
    },
    SwitchTabStyle: {
        height: 80,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        position: "relative"
    },
    HeaderCloseStyle: {
        position: "absolute",
        right: 20
    },
    SwitchBoxStyle: {
        padding: 4,
        borderRadius: 5,
        backgroundColor: "#e2e2e7",
        position: "relative",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    SwitchSlideBgStyle: {
        position: "absolute",
        left: 0,
        height: 30,
        width: 50,
        borderRadius: 5,
        backgroundColor: "#ffffff"
    },
    SwitchTabItemStyle: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 30,
        width: 50
    },
    ModalBgStyle: {
        flex: 1,
        backgroundColor: "#00000020"
    },
    ModalContainerStyle: {
        flex: 1,
        backgroundColor: "#f2f2f7",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
    },
    TabContentStyle: {
        flex: 1,
        padding: 20
    },
    TabBlockStyle: {
        borderRadius: 10,
        backgroundColor: "#ffffff"
    },
    TabLineStyle: {
        paddingLeft: 15
    },
    TabItemStyle: {
        height: 50,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottomWidth: 1,
        borderBottomColor: "#e2e2e7"
    }
});
