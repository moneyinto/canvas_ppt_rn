import { hash, readFile } from "react-native-fs";
import { launchImageLibrary, launchCamera } from "react-native-image-picker";
import { createImageElement } from "../utils/create";
import instanceStore from "../store/instanceStore";

interface ITabItem {
    name: string;
    icon: string;
    command: string;
}

export default function useInsertHandler() {
    // 打开相册
    const openAlbum = (mediaType: "photo" | "video", end: () => void) => {
        try {
            launchImageLibrary(
                {
                    mediaType
                },
                async (response) => {
                    if (!response.didCancel && !response.errorCode) {
                        const { assets } = response
                        if (assets?.length) {
                            // TO DO 限定最大分辨率 超过限制进行等比缩放
                            const { uri, width = 100, height = 100, type } = assets[0]
                            if (uri) {
                                const md5 = await hash(uri, "md5")
                                const base64 = await readFile(uri, "base64")
                                await instanceStore.editor?.history.saveFile(
                                    md5,
                                    `data:${type};base64,` + base64
                                );
                                const element = createImageElement(
                                    width,
                                    height,
                                    md5
                                );
                                instanceStore.editor?.command.executeAddRender([element]);
                                end();
                            }
                        }
                    }
                }
            );
        } catch (error) {
            console.error(error);
        }
    }
    // 打开相机
    const actionInsertCommand = (tabItem: ITabItem, end: () => void) => {
        switch (tabItem.command) {
            case "photo":
            case "video":
                openAlbum(tabItem.command, end)
                break;
            case "camera":
                try {
                    launchCamera(
                        {
                            mediaType: "photo"
                        },
                        (response) => {
                            console.log(response);
                        }
                    );
                } catch (error) {
                    console.error(error);
                }
                break;
            default:
                break;
        }
    }

    const insertImageElement = (uri: string) => {

    }

    return {
        actionInsertCommand
    };
}