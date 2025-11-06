import Swal from "sweetalert2";

export default function TopBar({ userData, setIsLoggedIn }) {
    const handleLogout = () => {
        Swal.fire({
            title: "Konfirmasi Logout",
            text: "Apakah Anda yakin ingin logout?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#EF4444",
            cancelButtonColor: "#6366F1",
            confirmButtonText: "Ya, logout",
            cancelButtonText: "Batal",
        }).then((result) => {
            if (result.isConfirmed) {
                sessionStorage.removeItem("loggedIn");
                sessionStorage.removeItem("userData");
                setIsLoggedIn(false);
                window.location.href = "/login";
            }
        });
    };

    // Ambil nama user dari props atau sessionStorage fallback
    const storedUser = JSON.parse(sessionStorage.getItem("userData"));
    const userName = userData?.name || storedUser?.name || "User Name";

    return (
        <div className="w-full bg-blue-600 text-white flex justify-between items-center px-6 py-3 shadow-md">
            {/* Kiri: Judul dan subjudul */}
            <div className="flex flex-col leading-tight">
                <h1 className="font-bold text-lg">WOM Finance</h1>
                <p className="text-sm opacity-90">Portal Marketing</p>
            </div>

            {/* Kanan: Info user dan tombol logout */}
            <div className="flex items-center gap-3">
                <span id="userInfo" className="font-semibold text-sm md:text-base">
                    {userName}
                </span>
                <span className="text-white">|</span>
                <button
                    onClick={handleLogout}
                    className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-100 text-sm md:text-base"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}
