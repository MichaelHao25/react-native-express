import LogRocket from "@logrocket/react-native";
import { registerRootComponent } from "expo";
import "react-native-reanimated";
import App from "./App";
LogRocket.init("outm8k/express-resjt");

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in the Expo client or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
