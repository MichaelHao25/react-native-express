// RootNavigation.js

import * as React from 'react';

export const navigationRef = React.createRef();
import AuthContext from "./AuthContext";

// const {signOut} = React.useContext(AuthContext);

export function navigate(name, params) {
    // signOut()
    navigationRef.current?.navigate(name, params);
}

// add other navigation functions that you need and export them