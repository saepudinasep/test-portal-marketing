import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function RekrutMA() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showDropdownSektor, setShowDropdownSektor] = useState(false);
    const [showDropdownJabatan, setShowDropdownJabatan] = useState(false);
    const [customPerusahaan, setCustomPerusahaan] = useState("");
    const [customSektor, setCustomSektor] = useState("");



    const [form, setForm] = useState({
        tipe: "",
        namaMA: "",
        noHP: "",
        sektor: "",
        jabatan: "",
        jenis: "",
        namaPerusahaan: "",
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

    const sektorKerjaSyariah = [
        "KBIH",
        "Pegawai Bank",
        "Lembaga Syariah",
        "Marketing Leasing/Fincoy",
        "Pegawai Swasta",
        "Others"
    ];

    const jabatanMAList = [
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

    const filteredSektor = sektorList.filter((s) =>
        s.toLowerCase().includes(form.sektor.toLowerCase())
    );

    const filteredSektorSyariah = sektorKerjaSyariah.filter((s) =>
        s.toLowerCase().includes(form.sektor.toLowerCase())
    );

    const filteredJabatan = jabatanMAList.filter((j) =>
        j.toLowerCase().includes(form.jabatan.toLowerCase())
    );

    useEffect(() => {
        const closeAll = (e) => {
            if (!e.target.closest(".dropdown-sektor")) setShowDropdownSektor(false);
            if (!e.target.closest(".dropdown-jabatan")) setShowDropdownJabatan(false);
        };
        document.addEventListener("click", closeAll);
        return () => document.removeEventListener("click", closeAll);
    }, []);

    // 📸 Ambil foto dari kamera
    const handleTakePhoto = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const compressed = await compressBase64(reader.result, 900, 0.7);
                setPhoto(compressed);
            };
            reader.readAsDataURL(file);
        }
    };

    function compressBase64(base64Str, maxWidth = 900, quality = 0.7) {
        return new Promise((resolve) => {
            let img = new Image();
            img.src = base64Str;

            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;

                // resize jika terlalu besar
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                const compressed = canvas.toDataURL("image/jpeg", quality);
                resolve(compressed);
            };
        });
    }

    const isMaskuHajiku = ["MASKU", "HAJIKU"].includes(form.tipe);
    const isMobilMotor = ["MOBILKU", "MOTORKU", "MOTOR BARU"].includes(form.tipe);

    // 🔹 Input berubah
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "namaMA" || name === "sektor" || name === "jabatan") {
            setForm({ ...form, [name]: value.toUpperCase() });
            return;
        }

        if (name === "noHP") {
            const numericValue = value.replace(/\D/g, "").slice(0, 13);
            setForm({ ...form, [name]: numericValue });
            return;
        }

        if (name === "customPerusahaan" || name === "customSektor") {
            setForm((prev) => ({
                ...prev,
                [name]: value.toUpperCase(),
            }));
            return;
        }

        setForm({ ...form, [name]: value });
    };

    // 🔹 Submit form ke Apps Script
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        // 1️⃣ Validasi tipe
        if (!form.tipe) {
            Swal.fire("Peringatan", "Pilih tipe Marketing Agent terlebih dahulu", "warning");
            return;
        }

        // 2️⃣ Validasi nama MA
        if (!form.namaMA || form.namaMA.trim().length < 3) {
            Swal.fire("Peringatan", "Nama Marketing Agent minimal 3 karakter", "warning");
            return;
        }

        // 3️⃣ Validasi khusus MOBIL / MOTOR
        if (isMobilMotor) {
            if (!form.noHP) {
                Swal.fire("Peringatan", "No HP wajib diisi", "warning");
                return;
            }

            if (form.noHP.length < 11 || form.noHP.length > 13) {
                Swal.fire("Peringatan", "No HP harus 11–13 digit", "warning");
                return;
            }

            if (!form.jabatan) {
                Swal.fire("Peringatan", "Jabatan Marketing Agent wajib diisi", "warning");
                return;
            }
        }

        // 4️⃣ Validasi sektor
        if (!form.sektor) {
            Swal.fire("Peringatan", "Sektor pekerjaan wajib diisi", "warning");
            return;
        }

        // 5️⃣ Validasi khusus MASKU / HAJIKU
        if (isMaskuHajiku) {
            if (!form.jenis) {
                Swal.fire("Peringatan", "Jenis Marketing Agent wajib dipilih", "warning");
                return;
            }

            if (!form.namaPerusahaan) {
                Swal.fire("Peringatan", "Nama perusahaan wajib dipilih", "warning");
                return;
            }
        }

        // 6️⃣ Validasi foto
        if (!photo) {
            Swal.fire("Peringatan", "Harap upload foto rekrut terlebih dahulu", "warning");
            return;
        }

        // 🟢 Payload
        const payload = {
            ...form,
            namaMA: form.namaMA.toUpperCase(),
            sektor:
                form.sektor === "Others"
                    ? customSektor
                    : form.sektor.toUpperCase(),
            namaPerusahaan:
                form.namaPerusahaan === "Others"
                    ? customPerusahaan
                    : form.namaPerusahaan,
            jabatan: form.jabatan.toUpperCase(),
            photoBase64: photo,
            createdBy: userData?.name || "",
            nik: userData?.nik || "",
            jabatanPIC: userData?.position || "",
            cabang: userData?.cabang || "",
            region: userData?.region || "",
        };

        setLoading(true);

        try {
            const APPSCRIPT_URL = {
                "MASKU": "https://script.google.com/macros/s/AKfycbzhJE2xkZHehj4UyBsEDf85V0VZPf31n0SX1LyBjcHInRpWAGnXkmSnevluYp29r_sp/exec",
                "HAJIKU": "https://script.google.com/macros/s/AKfycbzhJE2xkZHehj4UyBsEDf85V0VZPf31n0SX1LyBjcHInRpWAGnXkmSnevluYp29r_sp/exec",
                "MOBILKU": "https://script.google.com/macros/s/AKfycbx9nkkgCQCPx9tLPc_QNCPnqVIKd5_4nDyJioHZarqzoNgzYW0Yl_dBg5lIOlv3wllb/exec",
                "MOTORKU": "https://script.google.com/macros/s/AKfycbx9nkkgCQCPx9tLPc_QNCPnqVIKd5_4nDyJioHZarqzoNgzYW0Yl_dBg5lIOlv3wllb/exec",
                "MOTOR BARU": "https://script.google.com/macros/s/URL_MOTORKU/exec",
            };

            const url = APPSCRIPT_URL[form.tipe];
            if (!url) {
                Swal.fire("Error", "URL AppScript tidak ditemukan", "error");
                setLoading(false);
                return;
            }

            const response = await fetch(url, {
                method: "POST",
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (result.status === "success" || result.success === true) {
                Swal.fire("Berhasil!", "Agent berhasil direkrut", "success");

                setForm({
                    tipe: "",
                    namaMA: "",
                    noHP: "",
                    sektor: "",
                    jabatan: "",
                    jenis: "",
                    namaPerusahaan: "",
                });

                setPhoto(null);
            } else {
                Swal.fire("Gagal", result.message || "Gagal menyimpan data", "error");
            }
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Terjadi kesalahan koneksi", "error");
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
                        <select
                            name="tipe"
                            value={form.tipe}
                            onChange={handleChange}
                            className={`w-full rounded-lg p-2 border border-gray-300`}
                        >
                            <option value="">Pilih Product</option>
                            <option value="MOTOR BARU">MOTOR BARU</option>
                            <option value="MOTORKU">MOTORKU</option>
                            <option value="MOBILKU">MOBILKU</option>
                            <option value="MASKU">MASKU</option>
                            <option value="HAJIKU">HAJIKU</option>
                        </select>
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
                            className="w-full border rounded-lg p-2 uppercase"
                            placeholder="Masukan Nama Agent"
                            required
                        />
                    </div>

                    {isMaskuHajiku && (
                        <>
                            {/* 🔘 Jenis MA */}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Jenis Marketing Agent
                                </label>
                                <select
                                    name="jenis"
                                    value={form.jenis}
                                    onChange={handleChange}
                                    className={`w-full rounded-lg p-2 border border-gray-300`}
                                >
                                    <option value="">Pilih Jenis Marketing Agent</option>
                                    <option value="Retail">Retail</option>
                                    <option value="Corporate">Corporate</option>
                                </select>
                            </div>

                            {/* 🔘 Nama Perusahaan MA */}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Nama Perusahaan Marketing Agent
                                </label>

                                <select
                                    name="namaPerusahaan"
                                    value={form.namaPerusahaan}
                                    onChange={handleChange}
                                    className="w-full rounded-lg p-2 border border-gray-300"
                                >
                                    <option value="">Pilih Nama Perusahaan</option>
                                    <option value="Maybank Indonesia">Maybank Indonesia</option>
                                    <option value="Bank Mega Syariah">Bank Mega Syariah</option>
                                    <option value="Bank Panin Dubai Syariah">Bank Panin Dubai Syariah</option>
                                    <option value="KB Bank Syariah">KB Bank Syariah</option>
                                    <option value="Bank Jakarta">Bank Jakarta</option>
                                    <option value="Others">Others</option>
                                </select>

                                {/* ⬇️ INPUT JIKA OTHERS */}
                                {form.namaPerusahaan === "Others" && (
                                    <input
                                        type="text"
                                        placeholder="Masukkan nama perusahaan"
                                        value={customPerusahaan}
                                        onChange={(e) => setCustomPerusahaan(e.target.value.toUpperCase())}
                                        className="mt-2 w-full border rounded-lg p-2 uppercase"
                                        required
                                    />
                                )}
                            </div>
                        </>
                    )}

                    {isMobilMotor && (
                        <>
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
                        </>
                    )}

                    {/* 🏢 Sektor & Jabatan */}
                    <div className="grid md:grid-cols-2 gap-4">
                        {/* ⭐ Sektor Pekerjaan */}
                        <div className="relative dropdown-sektor">
                            <label className="block text-sm font-medium mb-1">
                                Sektor Pekerjaan
                            </label>

                            <input
                                type="text"
                                name="sektor"
                                value={form.sektor}
                                placeholder="Cari sektor..."
                                onChange={handleChange}
                                onFocus={() => setShowDropdownSektor(true)}
                                className="w-full border rounded-lg p-2 uppercase"
                                required={!!form.tipe}
                            />

                            {showDropdownSektor && isMobilMotor && (
                                <ul className="absolute z-10 bg-white border rounded-lg w-full max-h-48 overflow-y-auto shadow-md mt-1">
                                    {filteredSektor.length > 0 ? (
                                        filteredSektor.map((s, idx) => (
                                            <li
                                                key={idx}
                                                onClick={(e) => {
                                                    setForm((prev) => ({ ...prev, sektor: s }));
                                                    setShowDropdownSektor(false);
                                                    e.stopPropagation();
                                                }}
                                                className="px-3 py-2 hover:bg-indigo-100 cursor-pointer text-sm"
                                            >
                                                {s}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="px-3 py-2 text-gray-500 text-sm">
                                            Tidak ditemukan
                                        </li>
                                    )}
                                </ul>
                            )}

                            {showDropdownSektor && isMaskuHajiku && (
                                <ul className="absolute z-10 bg-white border rounded-lg w-full max-h-48 overflow-y-auto shadow-md mt-1">
                                    {filteredSektorSyariah.length > 0 ? (
                                        filteredSektorSyariah.map((s, idx) => (
                                            <li
                                                key={idx}
                                                onClick={(e) => {
                                                    setForm((prev) => ({ ...prev, sektor: s }));
                                                    setShowDropdownSektor(false);
                                                    e.stopPropagation();
                                                }}
                                                className="px-3 py-2 hover:bg-indigo-100 cursor-pointer text-sm"
                                            >
                                                {s}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="px-3 py-2 text-gray-500 text-sm">
                                            Tidak ditemukan
                                        </li>
                                    )}
                                </ul>
                            )}
                            {form.sektor === "Others" && (
                                <input
                                    type="text"
                                    placeholder="Masukkan sektor pekerjaan"
                                    value={customSektor}
                                    onChange={(e) => setCustomSektor(e.target.value.toUpperCase())}
                                    className="mt-2 w-full border rounded-lg p-2 uppercase"
                                    required
                                />
                            )}
                        </div>


                        {isMobilMotor && (
                            <>
                                {/* ⭐ Jabatan Marketing Agent */}
                                <div className="relative dropdown-jabatan">
                                    <label className="block text-sm font-medium mb-1">
                                        Jabatan Marketing Agent
                                    </label>

                                    <input
                                        type="text"
                                        name="jabatan"
                                        value={form.jabatan}
                                        placeholder="Cari jabatan..."
                                        onChange={handleChange}
                                        onFocus={() => setShowDropdownJabatan(true)}
                                        className="w-full border rounded-lg p-2 uppercase"
                                        required={isMobilMotor}
                                    />

                                    {showDropdownJabatan && (
                                        <ul className="absolute z-10 bg-white border rounded-lg w-full max-h-48 overflow-y-auto shadow-md mt-1">
                                            {filteredJabatan.length > 0 ? (
                                                filteredJabatan.map((j, idx) => (
                                                    <li
                                                        key={idx}
                                                        onClick={(e) => {
                                                            setForm((prev) => ({ ...prev, jabatan: j }));
                                                            setShowDropdownJabatan(false);
                                                            e.stopPropagation();
                                                        }}
                                                        className="px-3 py-2 hover:bg-indigo-100 cursor-pointer text-sm"
                                                    >
                                                        {j}
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
                            </>
                        )}
                    </div>


                    {/* 📸 Upload Foto */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Upload Foto Rekrut
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            {...(!isMaskuHajiku && { capture: "environment" })}
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
