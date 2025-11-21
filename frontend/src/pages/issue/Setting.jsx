import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

export default function Setting({ userData, setIsLoggedIn }) {
    const [user, setUser] = useState(userData || {
        nik: "-",
        name: "-",
        region: "-",
        cabang: "-",
        position: "-",
        username: "",
    });

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const storedUser = JSON.parse(sessionStorage.getItem("userData"));
        if (storedUser) setUser(storedUser);
    }, []);

    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            Swal.fire("Peringatan", "Isi kedua kolom password!", "warning");
            return;
        }
        if (newPassword !== confirmPassword) {
            Swal.fire("Peringatan", "Password tidak cocok!", "warning");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(
                "https://script.google.com/macros/s/AKfycbwnCTjndSExZUsv1rNqwdaQE0QagkzbdFupYdP62_wP9AtifrIoMn8wUcjK0Fwce-wv5A/exec",
                {
                    method: "POST",
                    body: JSON.stringify({
                        action: "resetPassword",
                        nik: user.nik,
                        newPassword,
                    }),
                }
            );

            const data = await res.json();
            if (data.success) {
                console.log(data.success);
                console.log(data.message);
                Swal.fire({
                    title: "Berhasil!",
                    text: "Password berhasil diperbarui. Silakan login kembali.",
                    icon: "success",
                    confirmButtonText: "OK",
                }).then(() => {
                    // Hapus sesi & logout
                    sessionStorage.removeItem("loggedIn");
                    sessionStorage.removeItem("userData");
                    setIsLoggedIn(false);
                    window.location.href = "/login";
                });

                setNewPassword("");
                setConfirmPassword("");
            } else {
                Swal.fire("Gagal", "Gagal memperbarui password!", "error");
            }
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Terjadi kesalahan koneksi!", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative w-full max-w-3xl mx-auto mt-10 px-4">
            {/* Overlay Loading Spinner */}
            {loading && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-[9999]">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent"></div>
                </div>
            )}

            <h3 className="text-2xl font-bold mb-6 text-gray-800">Pengaturan Akun</h3>

            {/* Data User */}
            <div className="bg-white shadow rounded-lg mb-6 border border-gray-200">
                <div className="bg-blue-600 text-white px-4 py-2 rounded-t-lg font-semibold">
                    Data Pengguna
                </div>
                <div className="p-4">
                    <div className="grid grid-cols-2 gap-y-2">
                        <div className="font-semibold text-gray-700">NIK</div>
                        <div>{user.nik}</div>

                        <div className="font-semibold text-gray-700">Nama</div>
                        <div>{user.name}</div>

                        <div className="font-semibold text-gray-700">Region</div>
                        <div>{user.region}</div>

                        <div className="font-semibold text-gray-700">Cabang</div>
                        <div>{user.cabang}</div>

                        <div className="font-semibold text-gray-700">Posisi</div>
                        <div>{user.position}</div>
                    </div>
                </div>
            </div>

            {/* Reset Password */}
            <div className="bg-white shadow rounded-lg border border-gray-200 mb-10">
                <div className="bg-yellow-400 px-4 py-2 rounded-t-lg font-semibold text-gray-800">
                    Reset Password
                </div>
                <div className="p-4">
                    <div className="mb-4">
                        <label className="block font-medium text-gray-700 mb-1">
                            Password Baru
                        </label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-200"
                            placeholder="Masukkan password baru"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block font-medium text-gray-700 mb-1">
                            Konfirmasi Password
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-200"
                            placeholder="Ulangi password baru"
                        />
                    </div>
                    <button
                        onClick={handleResetPassword}
                        disabled={loading}
                        className={`px-4 py-2 rounded text-white ${loading
                            ? "bg-gray-400"
                            : "bg-green-600 hover:bg-green-700"
                            }`}
                    >
                        {loading ? "Memperbarui..." : "Update Password"}
                    </button>
                </div>
            </div>
        </div>
    );
}
