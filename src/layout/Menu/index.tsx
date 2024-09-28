import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { IState } from "../../types/state";

export default function Menu({ width }: { width: number }) {
    const menu = useSelector((state: IState) => state.menu);
    const menuList = [
        ...(menu.type === "element"
            ? [
                  {
                      text: "复制",
                      action: () => {}
                  },
                  {
                      text: "剪切",
                      action: () => {}
                  },
                  {
                      text: "删除",
                      action: () => {}
                  }
              ]
            : [
                  {
                      text: "粘贴",
                      action: () => {}
                  }
              ])
    ];

    return (
        <View
            style={{
                ...styles.MenuContainer,
                left: menu.styles.left - 90 < 10 ? 100 : (menu.styles.left - 90) > (width - 100) ? width - 100 : menu.styles.left,
                top: menu.styles.top,
                transform: [{ translateX: menu.type === "element" ? -90 : -30 }, { translateY: -20 }]
            }}
        >
            {menuList.map((item) => {
                return (
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => item.action()}
                        key={item.text}
                    >
                        <Text style={styles.menuText}>{item.text}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    MenuContainer: {
        borderRadius: 6,
        backgroundColor: "rgba(0, 0, 0, .8)",
        flexDirection: "row",
        position: "absolute",
        zIndex: 10,
        overflow: "hidden"
    },

    menuItem: {
        width: 60,
        height: 60,
        alignItems: "center",
        justifyContent: "center"
    },

    menuText: {
        color: "#ffffff"
    }
});
