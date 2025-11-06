import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function ResetPassword() {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const pending = sessionStorage.getItem("pendingReset");
        if (!pending) navigate("/login");
    }, [navigate]);

    const handleReset = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            Swal.fire({
                title: "Gagal!",
                text: "Password konfirmasi tidak cocok.",
                icon: "error",
                confirmButtonColor: "#EF4444",
            });
            return;
        }

        const pending = JSON.parse(sessionStorage.getItem("pendingReset"));
        if (!pending) return navigate("/login");

        setLoading(true);

        try {
            // Gunakan pola insert sebelumnya: fetch dengan no-cors, respon langsung Swal
            await fetch(
                "https://script.google.com/macros/s/AKfycbwD1G4_c5i2-NgiDGjRKlyZfQ7_SSwvC0Uf4Ax65SpdK1uO1T-trTbfuaEUUKQgaJQDzw/exec",
                {
                    method: "POST",
                    mode: "no-cors", // ✅ supaya bisa jalan walau CORS
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        action: "updatePassword",
                        username: pending.username,
                        password: newPassword,
                        NIK: pending.NIK,
                    }),
                }
            );

            Swal.fire({
                title: "Berhasil!",
                text: "Password berhasil diubah. Silakan login kembali.",
                icon: "success",
                confirmButtonColor: "#6366F1",
            }).then(() => {
                sessionStorage.removeItem("pendingReset");
                navigate("/login");
            });

        } catch (err) {
            console.error("❌ Error:", err);
            Swal.fire({
                title: "Terjadi Kesalahan",
                text: "Gagal mengubah password.",
                icon: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
                </div>
            )}

            <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
            <form
                onSubmit={handleReset}
                className="bg-white p-6 rounded shadow-md w-80 space-y-4"
            >
                <input
                    type="password"
                    placeholder="Password baru"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="border w-full px-3 py-2 rounded"
                    required
                />
                <input
                    type="password"
                    placeholder="Konfirmasi password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="border w-full px-3 py-2 rounded"
                    required
                />
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 rounded-md font-semibold transition ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
                >
                    {loading ? "Memproses..." : "Simpan Password"}
                </button>
            </form>
        </div>
    );
}
