import { Navigate } from "react-router-dom";
import SessionManager from "./SessionManager";

export default function ProtectedRoute({ children }) {
    const loggedIn = sessionStorage.getItem("loggedIn") === "true";

    if (!loggedIn) return <Navigate to="/" replace />;

    return (
        <>
            <SessionManager />
            {children}
        </>
    );
}
