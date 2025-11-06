import { Outlet } from "react-router-dom";
import TopBar from "../components/TopBar";
import Navbar from "../components/Navbar";

export default function MainLayout({ userData, setIsLoggedIn }) {

    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <TopBar userData={userData} setIsLoggedIn={setIsLoggedIn} />

            {/* Sidebar / Navbar */}
            <Navbar userData={userData} />

            {/* Konten utama */}
            <main className="flex-1 p-6 bg-gray-100 overflow-auto">
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
