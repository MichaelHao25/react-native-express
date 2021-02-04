import usePdaScan from "react-native-pda-scan";
usePdaScan({
    onEvent(e) {
        console.log(333);
        console.log(e);
    },
    onError(e) {
        console.log(666);
        console.log(e);
    },
    trigger: "always",
  });
