import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function VisitNC() {
    const navigate = useNavigate();

    const [dataKodeUnik, setDataKodeUnik] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);
    const [photo, setPhoto] = useState(null);
    const [userData, setUserData] = useState(null);
    const [isMobile, setIsMobile] = useState(true);
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        region: "",
        cabang: "",
        picVisit: "",
        nikPIC: "",
        jabatanPIC: "",
        sumberData: "MOBIL UNCONTACED MIF",
        kodeUnik: "",
        namaDebitur: "",
        alamat: "",
        unit: "",
        tahun: "",
        hasilVisit: "Bertemu",
        tidakBertemu: "",
        bertemuDengan: "",
        noHpKonsumen: "",
        notesVisit: "",
    });

    const hasilList = ["Bertemu", "Tidak Bertemu"];
    const bertemuDenganList = ["Konsumen", "Pasangan"];

    // Opsi dinamis
    const hasilTidakBertemu = [
        "Rumah Kosong",
        "Alamat Pindah",
        "Alamat tidak sesuai",
        "Titip Surat Penawaran",
    ];

    // ✅ Proteksi & ambil data kontrak berdasarkan region dan cabang user
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
            picVisit: parsedUser.name || "",
            nikPIC: parsedUser.nik || "",
            jabatanPIC: parsedUser.position || "",
        }));

        const fetchKodeUnik = async () => {
            try {
                setLoading(true);

                const url =
                    "https://script.google.com/macros/s/AKfycbwJzKfG1uqG0tdE4HPusUB1uM1LsA0vKpFOhU5anmaT62ErT0oJce4JQfk4vFZ4lr2xqg/exec" +
                    `?region=${encodeURIComponent(parsedUser.region)}` +
                    `&cabang=${encodeURIComponent(parsedUser.cabang)}`;

                const res = await fetch(url);
                const json = await res.json();

                const mergedData = (json?.data || []).map((item) => ({
                    ...item,
                    namaDebitur: item["NAMA KONSUMEN"]?.toUpperCase() || "",
                    alamat: item["ALAMAT"] || "",
                    unit: item["UNIT"] || "",
                    tahun: item["TAHUN UNIT"] || "",
                }));

                setDataKodeUnik(mergedData);
                // console.log("Kode unik:", mergedData);
            } catch (err) {
                console.error("Error fetching kode unik:", err);
                setDataKodeUnik([]);
            } finally {
                setLoading(false);
            }
        };

        fetchKodeUnik();
    }, [navigate]);

    // 🔍 Filter hasil pencarian Kode Unik
    const filteredKodeUnik = dataKodeUnik.filter((item) => {
        const matchKodeUnik = item["KODE UNIQUE"]
            ?.toUpperCase()
            .includes(form.kodeUnik);

        return matchKodeUnik;
    });

    // 🔹 Saat memilih Kode Unik
    const handleSelectKodeUnik = (item) => {
        setForm((prev) => ({
            ...prev,
            kodeUnik: item["KODE UNIQUE"],
            namaDebitur: item["NAMA KONSUMEN"] || "",
            alamat: item["ALAMAT"] || "",
            unit: item["UNIT"] || "",
            tahun: item["TAHUN UNIT"] || "",
        }));
        setShowDropdown(false);
    };

    // 🔹 Input berubah
    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => {
            let updated = { ...prev, [name]: value };

            /* =============================
               1️⃣ GANTI HASIL VISIT
            ============================== */
            if (name === "hasilVisit") {
                updated.tidakBertemu = "";
                updated.bertemuDengan = "";
            }

            /* =============================
               2️⃣ GANTI TIDAK BERTEMU
            ============================== */
            if (name === "tidakBertemu") {
                updated.bertemuDengan = "";
            }

            /* =============================
               3️⃣ NORMALISASI NO HP (NUMBER ONLY)
            ============================== */
            if (name === "noHpKonsumen") {
                const angka = value.replace(/\D/g, "").slice(0, 13);
                setForm({ ...form, [name]: angka });
            }

            /* =============================
               4️⃣ KODE UNIK → UPPERCASE
            ============================== */
            if (name === "kodeUnik") {
                updated.kodeUnik = value.toUpperCase();
            }

            return updated;
        });

        // Tutup dropdown saat user mengetik
        if (name === "kodeUnik") {
            setShowDropdown(true);
        }
    };

    // 🔹 Tutup dropdown saat klik di luar
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest(".dropdown-kontrak")) {
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
            reader.onloadend = async () => {
                const compressed = await compressBase64(reader.result, 900, 0.7);
                setPhoto(compressed);

                // 👉 kosongkan input file setelah foto diambil
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
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

    useEffect(() => {
        const ua = navigator.userAgent.toLowerCase();

        const mobileCheck =
            /android|iphone|ipad|ipod|windows phone/i.test(ua) ||
            navigator.maxTouchPoints > 1;

        setIsMobile(mobileCheck);
    }, []);


    // 🔹 Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        /* =============================
           1️⃣ VALIDASI FIELD WAJIB UMUM
        ============================== */
        const requiredFields = {
            sumberData: "Sumber Data",
            kodeUnik: "Kode Unik",
            namaDebitur: "Nama Debitur",
            hasilVisit: "Hasil Visit",
            notesVisit: "Notes Visit",
        };

        /* =============================
           4️⃣ CEK FIELD KOSONG
        ============================== */
        for (const key in requiredFields) {
            if (!form[key] || form[key].toString().trim() === "") {
                Swal.fire({
                    icon: "warning",
                    title: "Form Belum Lengkap",
                    text: `${requiredFields[key]} tidak boleh kosong!`,
                });
                return;
            }
        }

        if (form.hasilVisit === "Bertemu" && !form.bertemuDengan) {
            Swal.fire({
                icon: "warning",
                title: "Data Belum Lengkap",
                text: "Field Bertemu Dengan wajib diisi",
            });
            return;
        }

        if (form.hasilVisit === "Tidak Bertemu" && !form.tidakBertemu) {
            Swal.fire({
                icon: "warning",
                title: "Data Belum Lengkap",
                text: "Field Hasil Tidak Bertemu wajib diisi",
            });
            return;
        }

        if (form.noHpKonsumen && !/^\d{9,13}$/.test(form.noHpKonsumen)) {
            Swal.fire({
                icon: "warning",
                title: "No HP Tidak Valid",
                text: "No HP harus angka 9–13 digit",
            });
            return;
        }

        /* =============================
           6️⃣ VALIDASI Notes VISIT
        ============================== */
        const words = form.notesVisit.trim().split(/\s+/);
        if (words.length < 5) {
            Swal.fire({
                icon: "warning",
                title: "Notes Terlalu Singkat",
                text: "Notes visit minimal 5 kata!",
            });
            return;
        }

        if (!/^[A-Za-z]{5}/.test(form.notesVisit.substring(0, 5))) {
            Swal.fire({
                icon: "warning",
                title: "Format Notes Salah",
                text: "5 karakter awal harus huruf tanpa angka atau simbol!",
            });
            return;
        }

        /* =============================
           8️⃣ FOTO WAJIB
        ============================== */
        if (!photo) {
            Swal.fire({
                icon: "warning",
                title: "Foto Belum Diambil",
                text: "Harap ambil foto visit terlebih dahulu!",
            });
            return;
        }


        const payload = {
            region: form.region,
            cabang: form.cabang,

            picVisit: form.picVisit,
            nikPIC: form.nikPIC,
            jabatanPIC: form.jabatanPIC,

            sumberData: form.sumberData.toUpperCase(),

            kodeUnik: form.kodeUnik.toUpperCase(),
            namaDebitur: form.namaDebitur.toUpperCase(),
            alamat: form.alamat,
            unit: form.unit,
            tahun: form.tahun,

            hasilVisit: form.hasilVisit,

            bertemuDengan:
                form.hasilVisit === "Bertemu"
                    ? form.bertemuDengan
                    : "",

            tidakBertemu:
                form.hasilVisit === "Tidak Bertemu"
                    ? form.tidakBertemu
                    : "",

            noHpKonsumen: form.noHpKonsumen || "",
            notesVisit: form.notesVisit || "",

            photoBase64: photo,
        };

        /* =============================
           🔟 SUBMIT
        ============================== */
        try {
            Swal.fire({
                title: "Menyimpan data...",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });

            const URL_SUBMIT =
                "https://script.google.com/macros/s/AKfycbzfPkkpKZAdqHzIsc6WBA2N6HMBd7Dlv2jrLDxWYKd60mEjHWEHDpsgSjYtSZ4ExuKjPQ/exec";

            const response = await fetch(URL_SUBMIT, {
                method: "POST",
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            Swal.close();

            if (result.success) {
                Swal.fire({
                    icon: "success",
                    title: "Data Visit Berhasil Disimpan",
                    text: result.message,
                    confirmButtonColor: "#16a34a",
                });

                // 🔁 RESET FORM AMAN
                setForm({
                    region: userData?.region || "",
                    cabang: userData?.cabang || "",
                    jabatanPIC: userData?.position || "",
                    nikPIC: userData?.nik || "",
                    picVisit: userData?.name || "",
                    sumberData: "MOBIL UNCONTACED MIF",
                    kodeUnik: "",
                    namaDebitur: "",
                    alamat: "",
                    unit: "",
                    tahun: "",
                    hasilVisit: "Bertemu",
                    tidakBertemu: "",
                    bertemuDengan: "",
                    noHpKonsumen: "",
                    notesVisit: "",
                });

                setPhoto(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
            } else {
                Swal.fire({
                    icon: result.limitReached ? "warning" : "error",
                    title: result.limitReached ? "Batas Input Tercapai" : "Gagal",
                    text: result.message || "Gagal menyimpan data.",
                });
            }
        } catch (err) {
            Swal.close();
            Swal.fire({
                icon: "error",
                title: "Koneksi Gagal",
                text: "Periksa jaringan Anda!",
            });
            console.error(err);
        }
    };

    // ⏳ Loading fullscreen
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
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Region & Cabang */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Region
                            </label>
                            <input
                                type="text"
                                value={form.region}
                                className="w-full border rounded-lg p-2 bg-gray-100"
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Cabang
                            </label>
                            <input
                                type="text"
                                value={form.cabang}
                                className="w-full border rounded-lg p-2 bg-gray-100"
                                required
                                readOnly
                            />
                        </div>
                    </div>

                    {/* Jabatan PIC & PIC Visit */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Jabatan PIC
                            </label>
                            <input
                                type="text"
                                value={form.jabatanPIC}
                                className="w-full border rounded-lg p-2 bg-gray-100"
                                required
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                PIC Visit
                            </label>
                            <input
                                type="text"
                                value={form.picVisit}
                                className="w-full border rounded-lg p-2 bg-gray-100"
                                readOnly
                            />
                        </div>
                    </div>

                    {/* NIK PIC Visit & Sumber Data */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                NIK PIC Visit
                            </label>
                            <input
                                type="text"
                                value={form.nikPIC}
                                className="w-full border rounded-lg p-2 bg-gray-100"
                                readOnly
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Sumber Data
                            </label>

                            <select
                                name="sumberData"
                                value={form.sumberData}
                                onChange={handleChange}
                                className="w-full rounded-lg p-2 border border-gray-300"
                                disabled // ⛔ Disable kalau product belum terpilih
                            >
                                <option value="MOBIL UNCONTACED MIF">MOBIL UNCONTACED MIF</option>
                            </select>
                        </div>
                    </div>

                    {/* 🔹 Kode Unik & Nama Debitur */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="relative dropdown-kontrak">
                            <label className="block text-sm font-medium mb-1">
                                Kode Unik
                            </label>

                            <input
                                type="text"
                                placeholder="Cari Kode Unik..."
                                value={form.kodeUnik}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        kodeUnik: e.target.value,
                                    }))
                                }
                                onFocus={() => {
                                    setShowDropdown(true);
                                }}
                                className="w-full border rounded-lg p-2 uppercase transition"
                            />

                            {/* Dropdown hanya untuk NON inject manual */}
                            {showDropdown && (
                                <ul className="absolute z-10 bg-white border rounded-lg w-full max-h-48 overflow-y-auto shadow-md mt-1">
                                    {filteredKodeUnik.length > 0 ? (
                                        filteredKodeUnik.map((item, idx) => (
                                            <li
                                                key={idx}
                                                onClick={() => handleSelectKodeUnik(item)}
                                                className="px-3 py-2 hover:bg-indigo-100 cursor-pointer text-sm"
                                            >
                                                {item["KODE UNIQUE"]}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="px-3 py-2 text-gray-500 text-sm">Tidak ditemukan</li>
                                    )}
                                </ul>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Nama Debitur
                            </label>
                            <input
                                type="text"
                                name="namaDebitur"
                                value={form.namaDebitur}
                                onChange={handleChange}
                                className="w-full border rounded-lg p-2 bg-gray-100"
                                readOnly
                                required
                            />
                        </div>
                    </div>

                    {/* 🔹 Aamat & Unit */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Alamat Debitur
                            </label>
                            <textarea
                                name="alamat"
                                value={form.alamat}
                                onChange={handleChange}
                                rows="4"
                                className="w-full border rounded-lg p-2 resize-none bg-gray-100"
                                readOnly
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Unit Debitur
                            </label>
                            <input
                                type="text"
                                name="unit"
                                value={form.unit}
                                onChange={handleChange}
                                className="w-full border rounded-lg p-2 bg-gray-100"
                                readOnly
                                required
                            />
                        </div>
                    </div>

                    {/* 🔹 Tahun & Hasil Visit */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Tahun Unit
                            </label>
                            <input
                                type="text"
                                name="tahun"
                                value={form.tahun}
                                onChange={handleChange}
                                className="w-full border rounded-lg p-2 bg-gray-100"
                                readOnly
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Hasil Visit
                            </label>
                            <select
                                name="hasilVisit"
                                value={form.hasilVisit}
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


                    {/* 🔹 Tahun & Hasil Visit */}
                    <div className="grid md:grid-cols-2 gap-4">
                        {/* 🔹 Aktivitas dinamis berdasarkan hasil */}
                        {form.hasilVisit === "Tidak Bertemu" && (
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Hasil Tidak Bertemu
                                </label>
                                <select
                                    name="tidakBertemu"
                                    value={form.tidakBertemu}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg p-2"
                                >
                                    <option value="">Pilih Hasil Tidak Bertemu</option>
                                    {(hasilTidakBertemu
                                    ).map((act, idx) => (
                                        <option key={idx} value={act}>
                                            {act}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {form.hasilVisit === "Bertemu" && (
                            <>
                                {/* Bertemu dengan */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Bertemu Dengan
                                    </label>
                                    <select
                                        name="bertemuDengan"
                                        value={form.bertemuDengan}
                                        onChange={handleChange}
                                        className="w-full border rounded-lg p-2"
                                    >
                                        <option value="">Pilih</option>
                                        {bertemuDenganList.map((b, idx) => (
                                            <option key={idx} value={b}>
                                                {b}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}
                        <div>
                            <label className="text-sm font-semibold">No HP Konsumen</label>
                            <input
                                type="text"
                                name="noHpKonsumen"
                                value={form.noHpKonsumen}
                                onChange={handleChange}
                                required
                                className="w-full border rounded-lg p-2"
                                inputMode="numeric"
                                placeholder="Masukan No HP Konsumen"
                            />
                        </div>
                    </div>

                    {/* Notes Visit */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Notes Visit
                        </label>
                        <textarea
                            name="notesVisit"
                            value={form.notesVisit}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Tuliskan notes minimal 5 kata..."
                            className="w-full border rounded-lg p-2 resize-none"
                            required
                        />
                    </div>

                    {/* Foto */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Ambil Foto Visit
                        </label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleTakePhoto}
                            id="cameraInput"
                            className="hidden"
                            disabled={!isMobile}
                        />

                        {/* tombol custom */}
                        <button
                            type="button"
                            onClick={() => isMobile && document.getElementById("cameraInput").click()}
                            className={`w-full p-2 rounded-lg text-white ${isMobile ? "bg-blue-600" : "bg-gray-400 cursor-not-allowed"
                                }`}
                        >
                            {photo ? "Ulangi Foto" : "Ambil Foto"}
                        </button>

                        {!isMobile && (
                            <p className="text-red-600 text-sm mt-1">
                                Fitur foto hanya bisa digunakan di perangkat mobile.
                            </p>
                        )}

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
