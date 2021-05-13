import AuthContext from "../../util/AuthContext";
import React, {useEffect} from "react";

export default (props) => {
    const {signOut} = React.useContext(AuthContext);
    useEffect(() => {
        signOut();
    }, [])
    return <></>
}