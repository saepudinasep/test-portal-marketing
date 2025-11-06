import React, { useState } from "react";
import Swal from "sweetalert2";

export default function ForgotPassword() {
    const [nikOrUsername, setNikOrUsername] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const APP_SCRIPT_URL =
        "https://script.google.com/macros/s/AKfycbxYMJzNMPQIu7e607kh9tD46xTP27-HsUZ_YUjnJGyAQ-pT8M4vNSTcrScC8eFk7I66cw/exec";

    const handleResetPassword = async () => {
        if (!nikOrUsername || !newPassword || !confirmPassword) {
            Swal.fire("Peringatan", "Semua kolom wajib diisi!", "warning");
            return;
        }
        if (newPassword !== confirmPassword) {
            Swal.fire("Gagal", "Password tidak cocok!", "error");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(APP_SCRIPT_URL, {
                method: "POST",
                body: JSON.stringify({
                    action: "forgotPassword",
                    nikOrUsername,
                    newPassword,
                }),
            });

            const data = await res.json();
            if (data.success) {
                Swal.fire({
                    title: "Berhasil!",
                    text: data.message || "Password berhasil diperbarui. Silakan login kembali.",
                    icon: "success",
                    confirmButtonText: "OK",
                    confirmButtonColor: "#4F46E5",
                }).then(() => {
                    window.location.href = "/login";
                });
                setNikOrUsername("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                Swal.fire("Gagal", data.message || "Akun tidak ditemukan.", "error");
            }
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Terjadi kesalahan koneksi!", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
                </div>
            )}

            <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8">
                <h2 className="text-2xl font-bold text-center text-indigo-600 mb-6">
                    Lupa Password
                </h2>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        NIK Karyawan
                    </label>
                    <input
                        type="text"
                        value={nikOrUsername}
                        onChange={(e) => setNikOrUsername(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-indigo-200"
                        placeholder="Masukkan NIK Karyawan"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password Baru
                    </label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-indigo-200"
                        placeholder="Masukkan password baru"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Konfirmasi Password
                    </label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-indigo-200"
                        placeholder="Ulangi password baru"
                    />
                </div>

                <button
                    onClick={handleResetPassword}
                    disabled={loading}
                    className={`w-full py-2 rounded text-white font-semibold ${loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700"
                        }`}
                >
                    {loading ? "Memproses..." : "Reset Password"}
                </button>

                <p className="text-center text-sm text-gray-500 mt-6">
                    Sudah ingat password?{" "}
                    <a href="/login" className="text-indigo-600 hover:underline">
                        Login di sini
                    </a>
                </p>
            </div>
        </div>
    );
}
