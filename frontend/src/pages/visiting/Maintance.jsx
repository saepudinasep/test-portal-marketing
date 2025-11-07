import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function Maintance() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [dataMA, setDataMA] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);
    const [photo, setPhoto] = useState(null); // 📸 simpan foto

    const [form, setForm] = useState({
        region: "",
        cabang: "",
        namaMA: "",
        noRef: "",
        occupation: "",
        namaPIC: "",
        nik: "",
        jabatan: "",
        aktivitas: "",
        hasil: "",
        detail: "",
    });

    const aktivitasList = [
        "Membangun Ikatan Emosional",
        "Refreshment SK Berlaku",
    ];

    const hasilList = ["Dapat Prospect", "Tidak Dapat Prospect"];

    // ✅ Proteksi route & ambil data dari Apps Script
    useEffect(() => {
        const user = sessionStorage.getItem("userData");
        const loggedIn = sessionStorage.getItem("loggedIn");

        if (!loggedIn || !user) {
            navigate("/");
            return;
        }

        const parsedUser = JSON.parse(user);
        setUserData(parsedUser);

        setForm((prev) => ({
            ...prev,
            region: parsedUser.region || "",
            cabang: parsedUser.cabang || "",
            namaPIC: parsedUser.name || "",
            nik: parsedUser.nik || "",
            jabatan: parsedUser.position || "",
        }));

        const nik = parsedUser.nik;
        const scriptURL =
            "https://script.google.com/macros/s/AKfycbzzaiDDLH_7ymXLzP617kDaV7aRHFlSfOVdMknkOJg2-qN2-seYeM-B-Kx9OBGEfs7zQw/exec?nik=" +
            nik;

        setLoading(true);

        fetch(scriptURL)
            .then((res) => res.json())
            .then((data) => {
                if (data && data.data) {
                    setDataMA(data.data);
                }
            })
            .catch((err) => console.error("Error fetching data:", err))
            .finally(() => setLoading(false));
    }, [navigate]);

    // 🔍 Filter hasil pencarian Nama MA
    const filteredMA = dataMA.filter((item) =>
        item["NAMA MA (ISI HURUF BESAR)"]
            ?.toLowerCase()
            .includes(form.namaMA.toLowerCase())
    );

    // 🔹 Saat memilih MA
    const handleSelectMA = (item) => {
        setForm((prev) => ({
            ...prev,
            namaMA: item["NAMA MA (ISI HURUF BESAR)"],
            noRef: item["NO REF MA"] || "",
            occupation: item["OCCUPATION WISE"] || "",
        }));
        setShowDropdown(false);
    };

    // 🔹 Input berubah
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    // 🔹 Tutup dropdown saat klik di luar
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest(".dropdown-ma")) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    // 📸 Ambil foto dari kamera
    const handleTakePhoto = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhoto(reader.result); // simpan base64
            };
            reader.readAsDataURL(file);
        }
    };

    // 🔹 Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validasi jumlah kata
        const wordCount = form.detail.trim().split(/\s+/).length;
        if (wordCount < 5) {
            Swal.fire({
                icon: "warning",
                title: "Detail Terlalu Singkat",
                text: "Detail Maintenance minimal 5 kata!",
                confirmButtonColor: "#3085d6",
            });
            return;
        }

        // Validasi foto
        if (!photo) {
            Swal.fire({
                icon: "warning",
                title: "Foto Belum Diambil",
                text: "Harap ambil foto terlebih dahulu!",
                confirmButtonColor: "#3085d6",
            });
            return;
        }

        // Siapkan payload
        const payload = {
            ...form,
            photoBase64: photo,
        };

        try {
            // Tampilkan loading SweetAlert
            Swal.fire({
                title: "Menyimpan data...",
                text: "Mohon tunggu sebentar",
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                },
            });

            const response = await fetch(
                "https://script.google.com/macros/s/AKfycbxtAk5bPLduvDZ5N2VAolIDPYVE6Dt2LQfPBc2G39FJrJZ2E5wi0sYIe23OEanbhqLI/exec",
                {
                    method: "POST",
                    // headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            const result = await response.json();
            Swal.close();

            if (result.success) {
                Swal.fire({
                    icon: "success",
                    title: "Berhasil!",
                    text: "Data berhasil disimpan.",
                    confirmButtonColor: "#16a34a",
                });

                setForm({
                    namaMA: "",
                    noRef: "",
                    occupation: "",
                    namaPIC: userData?.name || "",
                    nik: userData?.nik || "",
                    jabatan: userData?.position || "",
                    aktivitas: "",
                    hasil: "",
                    detail: "",
                });
                setPhoto(null);
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Gagal Menyimpan",
                    text: result.message || "Terjadi kesalahan saat menyimpan data.",
                    confirmButtonColor: "#d33",
                });
            }
        } catch (error) {
            Swal.close();
            console.error(error);
            Swal.fire({
                icon: "error",
                title: "Koneksi Gagal",
                text: "Terjadi kesalahan koneksi, periksa jaringan Anda!" + error,
                confirmButtonColor: "#d33",
            });
        }
    };

    // ⏳ Loading Fullscreen
    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-[9999]">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent"></div>
            </div>
        );
    }

    // ✅ Tampilan utama
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
            <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-3xl">
                {/* 🧑‍💼 Info User
                <div className="mb-6 text-center border-b pb-4">
                    <h1 className="text-2xl font-bold text-indigo-700 mb-2">
                        Maintenance MA
                    </h1>
                    <p className="text-gray-700 font-medium">
                        Selamat datang,{" "}
                        <span className="text-indigo-600">{userData?.name}</span>
                    </p>
                    <p className="text-gray-500 text-sm">
                        Cabang: {userData?.cabang} | Role: {userData?.akses}
                    </p>
                </div> */}

                {/* 🧾 Form Maintenance */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Nama MA & No Ref */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="relative dropdown-ma">
                            <label className="block text-sm font-medium mb-1">
                                Nama MA
                            </label>
                            <input
                                type="text"
                                placeholder="Cari Nama MA..."
                                value={form.namaMA}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        namaMA: e.target.value,
                                    }))
                                }
                                onFocus={() => setShowDropdown(true)}
                                className="w-full border rounded-lg p-2"
                                required
                            />

                            {showDropdown && (
                                <ul className="absolute z-10 bg-white border rounded-lg w-full max-h-48 overflow-y-auto shadow-md mt-1">
                                    {filteredMA.length > 0 ? (
                                        filteredMA.map((item, idx) => (
                                            <li
                                                key={idx}
                                                onClick={() =>
                                                    handleSelectMA(item)
                                                }
                                                className="px-3 py-2 hover:bg-indigo-100 cursor-pointer text-sm"
                                            >
                                                {
                                                    item[
                                                    "NAMA MA (ISI HURUF BESAR)"
                                                    ]
                                                }
                                            </li>
                                        ))
                                    ) : (
                                        <li className="px-3 py-2 text-gray-500 text-sm">
                                            Tidak ditemukan
                                        </li>
                                    )}
                                </ul>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                No Ref
                            </label>
                            <input
                                type="text"
                                name="noRef"
                                value={form.noRef}
                                onChange={handleChange}
                                className="w-full border rounded-lg p-2 bg-gray-100"
                                readOnly
                            />
                        </div>
                    </div>

                    {/* Occupation & Nama PIC */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Occupation
                            </label>
                            <input
                                type="text"
                                name="occupation"
                                value={form.occupation}
                                onChange={handleChange}
                                className="w-full border rounded-lg p-2 bg-gray-100"
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Nama PIC
                            </label>
                            <input
                                type="text"
                                name="namaPIC"
                                value={form.namaPIC}
                                className="w-full border rounded-lg p-2 bg-gray-100"
                                readOnly
                            />
                        </div>
                    </div>

                    {/* NIK & Jabatan */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                NIK
                            </label>
                            <input
                                type="text"
                                name="nik"
                                value={form.nik}
                                className="w-full border rounded-lg p-2 bg-gray-100"
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Jabatan
                            </label>
                            <input
                                type="text"
                                name="jabatan"
                                value={form.jabatan}
                                className="w-full border rounded-lg p-2 bg-gray-100"
                                readOnly
                            />
                        </div>
                    </div>

                    {/* Aktivitas & Hasil */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Aktivitas Maintenance
                            </label>
                            <select
                                name="aktivitas"
                                value={form.aktivitas}
                                onChange={handleChange}
                                className="w-full border rounded-lg p-2"
                                required
                            >
                                <option value="">Pilih Aktivitas</option>
                                {aktivitasList.map((act, idx) => (
                                    <option key={idx} value={act}>
                                        {act}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Hasil Maintenance
                            </label>
                            <select
                                name="hasil"
                                value={form.hasil}
                                onChange={handleChange}
                                className="w-full border rounded-lg p-2"
                                required
                            >
                                <option value="">Pilih Hasil</option>
                                {hasilList.map((hasil, idx) => (
                                    <option key={idx} value={hasil}>
                                        {hasil}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Detail Maintenance */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Detail Maintenance
                        </label>
                        <textarea
                            name="detail"
                            value={form.detail}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Tuliskan detail maintenance minimal 5 kata..."
                            className="w-full border rounded-lg p-2"
                            required
                        />
                    </div>

                    {/* 📸 Ambil Foto */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Ambil Foto Maintenance
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment" // 👉 langsung buka kamera belakang
                            onChange={handleTakePhoto}
                            className="w-full border rounded-lg p-2"
                        />

                        {photo && (
                            <div className="mt-3">
                                <p className="text-sm text-gray-600 mb-1">
                                    Preview Foto:
                                </p>
                                <img
                                    src={photo}
                                    alt="Preview"
                                    className="rounded-lg border w-full max-h-64 object-contain"
                                />
                            </div>
                        )}
                    </div>

                    {/* Tombol Submit & Logout */}
                    <div className="flex justify-end gap-4 pt-4">
                        <button
                            type="submit"
                            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
