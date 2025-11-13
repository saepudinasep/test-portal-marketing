import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function RekrutMA() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        tipe: "",
        namaMA: "",
        noHP: "",
        sektor: "",
        jabatan: "",
    });

    const sektorList = [
        "AGENT / BROKER / FREELANCE",
        "AGENT LAKU PANDAI",
        "BIDAN / PERAWAT / DOKTER",
        "COLLECTOR BANK",
        "COLLECTOR KOPERASI",
        "COLLECTOR LAIN-LAIN",
        "COLLECTOR LEASING / FINCOY",
        "CUSTOMER SERVICE / TELLER / KASIR ASURANSI",
        "CUSTOMER SERVICE / TELLER / KASIR BANK",
        "CUSTOMER SERVICE / TELLER / KASIR DEALER / SHOWROOM",
        "CUSTOMER SERVICE / TELLER / KASIR KOPERASI",
        "CUSTOMER SERVICE / TELLER / KASIR LAIN-LAIN",
        "CUSTOMER SERVICE / TELLER / KASIR LEASING / FINCOY",
        "DRIVER / OJEK ONLINE",
        "GURU / DOSEN / HONORER / TENAGA PENGAJAR LAINNYA",
        "IBU RUMAH TANGGA",
        "MAHASISWA / PELAJAR",
        "MARKETING ASURANSI",
        "MARKETING BANK",
        "MARKETING DEALER / SHOWROOM",
        "MARKETING ELEKTRONIK / FURNITURE",
        "MARKETING KOPERASI",
        "MARKETING LAIN-LAIN",
        "MARKETING LEASING / FINCOY",
        "PEGAWAI ASURANSI",
        "PEGAWAI BANK",
        "PEGAWAI DEALER / SHOWROOM",
        "PEGAWAI KOPERASI",
        "PEGAWAI LEASING / FINCOY",
        "PEGAWAI NEGERI",
        "PEGAWAI SWASTA",
        "PETANI / PETERNAK / NELAYAN",
        "SECURITY ASURANSI",
        "SECURITY BANK",
        "SECURITY DEALER / SHOWROOM",
        "SECURITY KOPERASI",
        "SECURITY LAIN-LAIN",
        "SECURITY LEASING / FINCOY",
        "SUPIR / PEMBANTU RUMAH TANGGA",
        "TNI / POLRI",
        "TOKOH MASYARAKAT / ORMAS",
        "WIRASWASTA - BENGKEL / STEAM MOTOR - MOBIL",
        "WIRASWASTA - LAIN-LAIN",
        "WIRASWASTA - RUMAH MAKAN / WARUNG / LAIN-LAIN",
        "WIRASWASTA - TOKO / GROSIR",
        "YAKULT LADY",
    ];

    const jabatanList = [
        "AREA MANAGER",
        "BENDAHARA ORGANISASI",
        "BRANCH MANAGER",
        "CUSTOMER SERVICE",
        "CREDIT STAFF",
        "HEAD CREDIT",
        "HEAD MARKETING",
        "KETUA ORGANISASI",
        "MARKETING FREELANCE",
        "MARKETING STAFF",
        "OWNER LAKU PANDAI",
        "SALES COUNTER",
        "SALES OFFICER",
        "SALES PERORANGAN",
        "SECRETARIS",
        "SECURITY",
        "SPV SALES OFFICER",
        "TELLER",
        "LAIN-LAIN",
    ];

    // 🧩 Ambil data user dari session
    useEffect(() => {
        const user = sessionStorage.getItem("userData");
        const loggedIn = sessionStorage.getItem("loggedIn");

        if (!loggedIn || !user) {
            navigate("/");
            return;
        }

        setUserData(JSON.parse(user));
    }, [navigate]);

    // 📸 Ambil foto dari kamera
    const handleTakePhoto = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPhoto(reader.result);
            reader.readAsDataURL(file);
        }
    };

    // 🔹 Input berubah
    const handleChange = (e) => {
        const { name, value } = e.target;

        // Nama MA: huruf besar semua
        if (name === "namaMA") {
            setForm({ ...form, [name]: value.toUpperCase() });
        }
        // No HP: hanya angka, max 13 digit
        else if (name === "noHP") {
            const numericValue = value.replace(/\D/g, "").slice(0, 13); // hapus huruf, max 13 digit
            setForm({ ...form, [name]: numericValue });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

    // 🔹 Submit form ke Apps Script
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.tipe || !form.namaMA || !form.noHP || !form.sektor || !form.jabatan) {
            Swal.fire("Peringatan", "Harap lengkapi semua field!", "warning");
            return;
        }
        if (form.noHP && (form.noHP.length < 11 || form.noHP.length > 13)) {
            Swal.fire("Peringatan", "No HP harus antara 11-13 digit!", "warning");
            return;
        }

        if (!photo) {
            Swal.fire("Peringatan", "Harap ambil foto rekrut terlebih dahulu!", "warning");
            return;
        }

        const payload = {
            ...form,
            photoBase64: photo,
            createdBy: userData?.name || "",
            nik: userData?.nik || "",
            jabatanPIC: userData?.position || "",
            cabang: userData?.cabang || "",
            region: userData?.region || "",
        };

        setLoading(true);
        try {
            const response = await fetch(
                "https://script.google.com/macros/s/AKfycbwgu74cLCAvFOv_udojPOTPztLkYZjzeWX9NXHVo-AXV7Jtpb7K-aEhIwBowJ3Gd3gV/exec",
                {
                    method: "POST",
                    // headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            const result = await response.json();
            if (result.success) {
                Swal.fire("Berhasil!", "Agent Berhasil di Rekrut.", "success");
                setForm({
                    tipe: "",
                    namaMA: "",
                    noHP: "",
                    sektor: "",
                    jabatan: "",
                });
                setPhoto(null);
            } else {
                Swal.fire("Gagal!", result.message || "Gagal menyimpan data.", "error");
            }
        } catch (err) {
            Swal.fire("Error", "Terjadi kesalahan koneksi.", "error");
            console.error(err);
        } finally {
            setLoading(false);
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

    // Jika userData belum siap, tampilkan loading dulu
    if (!userData) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
                <div className="text-indigo-600 text-xl font-semibold animate-pulse">
                    Memuat data pengguna...
                </div>
            </div>
        );
    }

    // ✅ Tampilan utama
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
            <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-3xl">
                <h1 className="text-2xl font-bold text-indigo-700 mb-6 text-center">
                    Rekrut Marketing Agent
                </h1>

                {/* Info PIC */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium mb-1">Nama PIC</label>
                        <input
                            type="text"
                            value={userData?.name || ""}
                            readOnly
                            className="w-full border rounded-lg p-2 bg-gray-100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">NIK</label>
                        <input
                            type="text"
                            value={userData?.nik || ""}
                            readOnly
                            className="w-full border rounded-lg p-2 bg-gray-100"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Jabatan</label>
                        <input
                            type="text"
                            value={userData?.position || ""}
                            readOnly
                            className="w-full border rounded-lg p-2 bg-gray-100"
                        />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 🔘 Tipe MA */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Tipe Marketing Agent
                        </label>
                        <div className="flex flex-wrap gap-4">
                            {["Motorku", "Mobilku", "Reguler", "All Brand"].map((tipe) => (
                                <label key={tipe} className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="tipe"
                                        value={tipe}
                                        checked={form.tipe === tipe}
                                        onChange={handleChange}
                                    />
                                    {tipe}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* 🧑‍💼 Nama MA */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Nama Marketing Agent
                        </label>
                        <input
                            type="text"
                            name="namaMA"
                            value={form.namaMA}
                            onChange={handleChange}
                            className="w-full border rounded-lg p-2"
                            placeholder="Masukan Nama Agent"
                            required
                        />
                    </div>

                    {/* ☎️ No HP */}
                    <div>
                        <label className="block text-sm font-medium mb-1">No HP</label>
                        <input
                            type="text"
                            name="noHP"
                            value={form.noHP}
                            onChange={handleChange}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className="w-full border rounded-lg p-2"
                            placeholder="Masukkan No HP"
                            required
                        />
                    </div>

                    {/* 🏢 Sektor & Jabatan */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Sektor Pekerjaan
                            </label>
                            <select
                                name="sektor"
                                value={form.sektor}
                                onChange={handleChange}
                                className="w-full border rounded-lg p-2"
                                required
                            >
                                <option value="">Pilih Sektor</option>
                                {sektorList.map((s, i) => (
                                    <option key={i} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Jabatan Marketing Agent
                            </label>
                            <select
                                name="jabatan"
                                value={form.jabatan}
                                onChange={handleChange}
                                className="w-full border rounded-lg p-2"
                                required
                            >
                                <option value="">Pilih Jabatan</option>
                                {jabatanList.map((j, i) => (
                                    <option key={i} value={j}>
                                        {j}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* 📸 Upload Foto */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Upload Foto Rekrut
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleTakePhoto}
                            className="w-full border rounded-lg p-2"
                            required
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

                    {/* Tombol Submit */}
                    <div className="flex justify-end pt-4">
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
