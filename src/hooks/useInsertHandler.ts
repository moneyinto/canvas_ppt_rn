import { launchImageLibrary, launchCamera } from "react-native-image-picker";

interface ITabItem {
    name: string;
    icon: string;
    command: string;
}

export default function useInsertHandler() {
    const actionInsertCommand = (tabItem: ITabItem) => {
        switch (tabItem.command) {
            case "photo":
                try {
                    launchImageLibrary(
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
            case "video":
                try {
                    launchImageLibrary(
                        {
                            mediaType: "video"
                        },
                        (response) => {
                            console.log(response);
                        }
                    );
                } catch (error) {
                    console.error(error);
                }
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

    return {
        actionInsertCommand
    };
}