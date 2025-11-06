import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import logo from "../../assets/Logo.png";
import { apiFetch } from "../../utils/api";
import { getDefaultPassword } from "../../utils/getDefaultPassword";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const API_URL = "https://script.google.com/macros/s/AKfycbxrUAGgsesLWDluUtrG_yB4-LhBhcllAdtXVGEgsR5WDQe7F7WL93NUnlfj5xA8cl7fwg/exec";

    useEffect(() => {
        if (sessionStorage.getItem("loggedIn") === "true") {
            // const userData = JSON.parse(sessionStorage.getItem("userData"));
            // const akses = userData?.akses;
            // if (akses === "CMO") navigate("/visiting");
            // else if (akses === "MAO") navigate("/maintance");
            navigate("/dashboard");
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await apiFetch(API_URL, {
                method: "POST",
                body: JSON.stringify({ action: "login", username, password }),
            });

            setLoading(false);

            if (!result.success) {
                Swal.fire("Login Gagal", result.message, "error");
                return;
            }

            const user = result.data;
            const defaultPassword = getDefaultPassword(user.NAME_KTP, user.NIK);

            if (user.password?.toLowerCase() === defaultPassword.toLowerCase()) {
                sessionStorage.setItem("pendingReset", JSON.stringify(user));
                Swal.fire("Password Default", "Silakan ubah password Anda.", "info").then(() => navigate("/reset-password"));
                return;
            }

            const userData = {
                username: user.username,
                name: user.NAME_KTP,
                nik: user.NIK,
                region: user.Region,
                cabang: user.Cabang,
                position: user.POSITION_NAME,
                product: user.PRODUCT,
                status: user.EMPLOYEE_STATUS,
                akses: user.AKSES,
            };

            sessionStorage.setItem("loggedIn", "true");
            sessionStorage.setItem("userData", JSON.stringify(userData));

            Swal.fire({
                title: "Login Berhasil!",
                text: `Selamat datang, ${user.NAME_KTP}! 👋`,
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
            });

            // if (user.AKSES === "CMO") {
            //     setTimeout(() => navigate("/visiting"), 1500);
            // } else if (user.AKSES === "MAO") {
            //     setTimeout(() => navigate("/maintance"), 1500);
            // } else {
            //     Swal.fire("Error", "Akses tidak dikenali. Hubungi administrator.", "error");
            //     sessionStorage.clear();
            // }
            setTimeout(() => navigate("/dashboard"), 1500);

        } catch (err) {
            console.error("Error login:", err);
            setLoading(false);
            Swal.fire("Error", "Gagal menghubungi server. Coba lagi.", "error");
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-white px-6 py-12">
            {loading && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-[9999]">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent"></div>
                </div>
            )}

            <div className="w-full max-w-sm bg-white shadow-lg rounded-xl p-8">
                <div className="flex flex-col items-center text-center">
                    <img src={logo} alt="Logo" className="h-16 w-auto mb-3" />
                    <h1 className="text-xl font-semibold text-gray-800">WOM Finance</h1>
                    <p className="text-sm text-gray-500 mb-6">Portal Marketing</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            NIK Karyawan
                        </label>
                        <input
                            id="username"
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-base text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 text-base text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>

                    <button
                        type="submit"
                        className="flex w-full justify-center rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-400"
                    >
                        Sign in
                    </button>

                    <div className="text-right">
                        <a href="/forgot-password" className="text-sm text-indigo-500 hover:underline">
                            Lupa Password?
                        </a>
                    </div>
                </form>

                <p className="text-center text-xs text-gray-400 pt-2">
                    © 2025 - {new Date().getFullYear()} Marketing Development Sub Division V1.0.07.2025
                </p>
            </div>
        </div>
    );
}
