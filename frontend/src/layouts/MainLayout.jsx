import { Outlet } from "react-router-dom";
import TopBar from "../components/TopBar";
import Navbar from "../components/Navbar";
import { Toaster } from "react-hot-toast";

export default function MainLayout({ userData, setIsLoggedIn }) {
    return (
        <div className="min-h-screen flex flex-col">

            {/* Toaster Global */}
            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 2500,
                    style: {
                        fontSize: "14px",
                    }
                }}
            />

            {/* Header */}
            <TopBar userData={userData} setIsLoggedIn={setIsLoggedIn} />

            {/* Sidebar / Navbar */}
            <Navbar userData={userData} />

            {/* Konten utama */}
            <main className="flex-1 p-1 bg-gray-100 overflow-auto">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-gray-100">
                <p className="text-center text-xs text-gray-400 pt-2 pb-4">
                    © 2025 - {new Date().getFullYear()} Marketing Development Sub Division V1.10.23.2025
                </p>
            </footer>

        </div>
    );
}
