import { Platform, type ScrollViewProps } from "react-native";

const MAX_SCREEN_WIDTH = 390;

export const centeredShell =
  Platform.OS === "web"
    ? ({
        alignSelf: "center",
        boxSizing: "border-box",
        flex: 1,
        marginLeft: "auto",
        marginRight: "auto",
        maxWidth: MAX_SCREEN_WIDTH,
        overflowX: "hidden",
        width: "100vw",
      } as const)
    : ({
        alignSelf: "center",
        flex: 1,
        maxWidth: MAX_SCREEN_WIDTH,
        width: "100%",
      } as const);

export const screenShellStyle = centeredShell as object;

export const screenRootStyle = {
  flex: 1,
  backgroundColor: "#F9FAFB",
} as const;

export const scrollViewStyle = { flex: 1 } as const;

export const paddedContentStyle = {
  flexGrow: 1,
  paddingBottom: 32,
  paddingHorizontal: 20,
} as const satisfies ScrollViewProps["contentContainerStyle"];

export const unpaddedContentStyle = {
  flexGrow: 1,
  paddingBottom: 32,
} as const satisfies ScrollViewProps["contentContainerStyle"];

export const fullScreenShellStyle = {
  ...centeredShell,
  ...(Platform.OS === "web" ? { minHeight: "100%" } : null),
} as object;
