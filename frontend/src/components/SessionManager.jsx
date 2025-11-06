import { useEffect } from "react";
import useSessionTimeout from "../hooks/useSessionTimeout";

/**
 * Komponen ini menjaga session tetap aktif jika user masih melakukan fetch API atau interaksi.
 */
export default function SessionManager() {
    const { resetTimer } = useSessionTimeout();

    useEffect(() => {
        // Intercept semua fetch API agar reset timer
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            resetTimer();
            const response = await originalFetch(...args);
            return response;
        };

        return () => {
            window.fetch = originalFetch;
        };
    }, [resetTimer]);

    return null;
}
