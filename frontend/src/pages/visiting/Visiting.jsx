import { useNavigate } from "react-router-dom";

export default function Visiting() {
    const navigate = useNavigate();
    const userData = JSON.parse(sessionStorage.getItem("userData"));

    const handleLogout = () => {
        sessionStorage.clear();
        navigate("/");
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <h1 className="text-2xl font-bold mb-4">Selamat datang, {userData?.name}</h1>
            <p className="mb-8 text-gray-600">Cabang: {userData?.cabang}</p>
            <p className="mb-8 text-gray-600">Role: {userData?.akses}</p>
            <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-400"
            >
                Logout
            </button>
        </div>
    );
}
