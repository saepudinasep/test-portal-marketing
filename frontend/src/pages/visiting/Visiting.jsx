import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function Visiting() {
    const navigate = useNavigate();

    const [dataKontrak, setDataKontrak] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);
    const [photo, setPhoto] = useState(null);
    const [userData, setUserData] = useState(null);
    const [isMobile, setIsMobile] = useState(true);
    const fileInputRef = useRef(null);

    const [form, setForm] = useState({
        region: "",
        cabang: "",
        noKontrak: "",
        namaDebitur: "",
        sumberData: "",
        picVisit: "",
        nik: "",
        jabatan: "",
        hasil: "",
        aktivitas: "",
        bertemuDengan: "",
        keterangan: "",
        noHp: "",
        detail: "",
        product: "",
        statusKonsumen: "",
        ket: "",
    });

    const hasilList = ["Bertemu", "Tidak Bertemu"];

    // Opsi dinamis
    const aktivitasTidakBertemu = [
        "Rumah Kosong",
        "Alamat Pindah",
        "Titip Surat Penawaran",
    ];
    const bertemuDenganList = ["Pemohon", "Pasangan"];
    const hasilBertemuList = ["Prospek", "Interest", "Tidak Berminat"];
    const keteranganTidakBerminat = [
        "Angsuran Mahal",
        "Persyaratan Rumit",
        "Pencairan Tidak Sesuai",
        "Tidak Ingin Mengajukan Kembali",
        "Sedang Tidak Membutuhkan Dana",
        "Sudah Dapat Dana",
    ];
    const keteranganInterest = [
        "Konfirmasi Pasangan/Keluarga",
        "Nego Angsuran",
        "Nego Pencairan",
        "Unit Diluar Kota",
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
            nik: parsedUser.nik || "",
            jabatan: parsedUser.position || "",
            product: parsedUser.product !== "ALL BRAND" ? parsedUser.product.toUpperCase() : "" // ⬅ FIX PENTING
        }));

        const scriptURL =
            "https://script.google.com/macros/s/AKfycbw8k0pA5XZX1SkdoWeaOCOrf9tBZu3fDPqGaM1H3fS-dyD1sdJAQjCloJP4_c7wRmvs/exec" +
            `?region=${parsedUser.region}&cabang=${parsedUser.cabang}`;

        setLoading(true);
        fetch(scriptURL)
            .then((res) => res.json())
            .then((data) => {
                if (data && data.data) {
                    const fixed = data.data.map((item) => ({
                        ...item,
                        product: item["PRODUCT"]?.toUpperCase() || "",
                        sumberData: item["SUMBER DATA"]?.toUpperCase() || "",
                    }));
                    setDataKontrak(fixed);
                }
            })
            .catch((err) => console.error("Error fetching kontrak:", err))
            .finally(() => setLoading(false));
    }, [navigate]);

    // 🔍 Filter hasil pencarian No Kontrak
    const filteredKontrak = dataKontrak.filter((item) => {
        const matchNoKontrak = item["NO KONTRAK"]
            ?.toUpperCase()
            .includes(form.noKontrak.toUpperCase());

        const matchSumberData = form.sumberData
            ? item.sumberData === form.sumberData.toUpperCase()
            : true;

        const matchProduct = form.product
            ? item.product === form.product.toUpperCase()
            : true;

        return matchNoKontrak && matchSumberData && matchProduct;
    });

    const sumberDataOptions = {
        MOTORKU: [
            "MOTOR PRIORITY 1",
            "MOTOR PRIORITY 2",
            "MOTOR PRIORITY 3",
        ],
        MOBILKU: [
            "MOBIL PRIORITY 1",
            "MOBIL PRIORITY 2",
            "MOBIL PRIORITY 3",
        ],
    };

    const selectedProduct =
        userData?.product === "ALL BRAND"
            ? form.product                // user pilih product
            : userData?.product;          // product fixed sesuai user

    const activeProduct = form.sumberData !== "" && selectedProduct !== "";

    // 🔹 Saat memilih kontrak
    const handleSelectKontrak = (item) => {
        setForm((prev) => ({
            ...prev,
            noKontrak: item["NO KONTRAK"],
            namaDebitur: item["NAMA KONSUMEN"] || "",
            sumberData: (item["SUMBER DATA"] || "").toUpperCase(),
            product: (item["PRODUCT"] || "").toUpperCase(),
            ket: item["KETERANGAN"] || "",
        }));
        setShowDropdown(false);
    };

    // 🔹 Input berubah
    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => {
            let updated = { ...prev, [name]: value };

            if (name === "product" && userData?.product === "ALL BRAND") {
                // updated.product = value.toUpperCase();
                updated.sumberData = "";     // reset sumber data
                updated.noKontrak = "";      // reset kontrak
                updated.namaDebitur = "";
                updated.ket = "";
            }

            if (name === "sumberData") {
                // updated.product = value.toUpperCase();
                updated.noKontrak = "";
                updated.namaDebitur = "";
                updated.ket = "";
            }

            return updated;
        });

        // Tutup dropdown jika filter berubah
        if (name === "sumberData" || name === "product") {
            setShowDropdown(false);
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

    const getCharsPerRow = () => {
        const w = window.innerWidth;

        if (w < 640) return 28;      // Mobile
        if (w < 1024) return 38;    // Tablet
        return 50;                  // Desktop
    };

    const MAX_ROWS = 80;

    const [charsPerRow, setCharsPerRow] = useState(getCharsPerRow());

    useEffect(() => {
        const handleResize = () => {
            setCharsPerRow(getCharsPerRow());
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const estimatedRows = Math.ceil(form.ket.length / charsPerRow);

    // 🔹 Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Daftar field wajib (umum)
        const requiredFields = {
            product: "Product",
            sumberData: "Sumber Data",
            noKontrak: "No Kontrak",
            namaDebitur: "Nama Debitur",
        };

        // 2. Aturan berdasarkan HASIL & bertemuDengan
        if (form.hasil === "Tidak Bertemu") {
            requiredFields.aktivitas = "Aktivitas";
            requiredFields.detail = "Detail Visit";
        }

        if (form.hasil === "Bertemu") {
            // Wajib isi No HP untuk semua yang bertemu
            requiredFields.noHp = "No HP Konsumen";
            requiredFields.detail = "Detail Visit";
            requiredFields.bertemuDengan = "Bertemu Dengan";

            if (form.aktivitas === "Interest" || form.aktivitas === "Tidak Berminat") {
                requiredFields.keterangan = "Keterangan";
            }

            // Prospek → keterangan tidak wajib
            if (form.aktivitas === "Prospek") {
                // tidak menambah keterangan
            }
        }

        if (form.sumberData === "MOBIL PRIORITY 3" || form.sumberData === "MOTOR PRIORITY 3") {
            requiredFields.statusKonsumen = "Status Konsumen";
        }

        // Cek field kosong
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

        // ❗ Validasi No Kontrak harus ada di database
        const kontrakAda = dataKontrak.some(
            (item) => item["NO KONTRAK"] === form.noKontrak
        );

        if (!kontrakAda) {
            Swal.fire({
                icon: "error",
                title: "No Kontrak Tidak Ditemukan",
                text: "Pastikan No Kontrak sesuai dengan data yang tersedia.",
            });
            return; // ❌ hentikan submit
        }

        // 1) Validasi minimal 5 kata
        const wordCount = form.detail.trim().split(/\s+/).length;
        if (wordCount < 5) {
            Swal.fire({
                icon: "warning",
                title: "Detail Terlalu Singkat",
                text: "Detail Maintain minimal 5 kata!",
                confirmButtonColor: "#3085d6",
            });
            return;
        }

        // 2) Validasi 5 karakter awal wajib huruf A-Z
        const firstFive = form.detail.substring(0, 5);

        if (!/^[A-Za-z]{5}$/.test(firstFive)) {
            Swal.fire({
                icon: "warning",
                title: "Format Detail Salah",
                text: "5 karakter awal harus huruf tanpa angka, simbol, atau spasi!",
                confirmButtonColor: "#3085d6",
            });
            return;
        }
        if (form.noHp && (form.noHp.length < 11 || form.noHp.length > 13)) {
            Swal.fire({
                icon: "warning",
                title: "No HP Tidak Valid",
                text: "No HP Konsumen harus antara 11-13 digit!",
            });
            return;
        }

        if (!photo) {
            Swal.fire({
                icon: "warning",
                title: "Foto Belum Diambil",
                text: "Harap ambil foto terlebih dahulu!",
            });
            return;
        }

        const statusMap = {
            Pil1: "No HP Konsumen sama dengan data di WISe dan Bersedia Di Lakukan Penawaran",
            Pil2: "No HP Konsumen sama dengan data di WISe dan Tidak Bersedia Di Lakukan Penawaran",
            Pil3: "No HP Konsumen berganti dan CMO melakukan pengkinian data pada Form Perubahan Data Konsumen",
        };

        const payload = { ...form, sumberData: form.sumberData.toUpperCase(), statusKonsumen: statusMap[form.statusKonsumen] || "", photoBase64: photo };

        try {
            Swal.fire({
                title: "Menyimpan data...",
                text: "Mohon tunggu sebentar",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });

            const response = await fetch(
                "https://script.google.com/macros/s/AKfycbxf2dJP1xBTuMwSnvyadrH5j0xfnPItE0p7qZu34d7ooK5WnixKyU-jlxNBqnBt4G3k/exec",
                {
                    method: "POST",
                    body: JSON.stringify(payload),
                }
            );

            const result = await response.json();
            Swal.close();

            if (result.success) {
                Swal.fire({
                    icon: "success",
                    title: "Data visit Berhasil disimpan!",
                    text: result.message,
                    confirmButtonColor: "#16a34a",
                });

                setForm({
                    ...form,
                    noKontrak: "",
                    namaDebitur: "",
                    hasil: "",
                    aktivitas: "",
                    bertemuDengan: "",
                    keterangan: "",
                    noHp: "",
                    detail: "",
                    region: userData?.region || "",
                    cabang: userData?.cabang || "",
                    sumberData: "",
                    picVisit: userData?.name || "",
                    nik: userData?.nik || "",
                    jabatan: userData?.position || "",
                    product: userData?.product !== "ALL BRAND" ? userData.product : "",
                    statusKonsumen: "",
                    ket: "",
                });
                setPhoto(null);
                // kosongkan kembali input file
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            } else if (result.limitReached) {
                Swal.fire({
                    icon: "warning",
                    title: "Batas Input Tercapai",
                    text: result.message,
                    confirmButtonColor: "#f59e0b",
                });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Gagal",
                    text: result.message || "Gagal menyimpan data.",
                });
                console.log("Error response:", result);
            }
        } catch (error) {
            Swal.close();
            Swal.fire({
                icon: "error",
                title: "Koneksi Gagal",
                text: "Periksa jaringan Anda!",
            });
            console.log(error);
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
                    {/* Sumber Data & Brand */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div hidden={userData.product !== "ALL BRAND"}>
                            <label className="block text-sm font-medium mb-1">
                                Product
                            </label>
                            <select
                                name="product"
                                value={
                                    userData?.product === "ALL BRAND"
                                        ? form.product
                                        : userData?.product || ""
                                }
                                onChange={handleChange}
                                className="w-full rounded-lg p-2 border border-gray-300"
                                disabled={userData?.product !== "ALL BRAND"} // ⛔ Dikunci jika bukan ALL BRAND
                            >
                                <option value="">
                                    {userData?.product === "ALL BRAND"
                                        ? "Pilih Product"
                                        : `Product: ${userData?.product}`}
                                </option>

                                {userData?.product === "ALL BRAND" && (
                                    <>
                                        <option value="MOTORKU">MOTORKU</option>
                                        <option value="MOBILKU">MOBILKU</option>
                                    </>
                                )}
                            </select>
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
                                disabled={
                                    !(
                                        userData?.product === "ALL BRAND"
                                            ? form.product
                                            : userData?.product
                                    )
                                } // ⛔ Disable kalau product belum terpilih
                            >
                                <option value="">
                                    {userData?.product === "ALL BRAND"
                                        ? form.product
                                            ? "Pilih Sumber Data"
                                            : "Pilih Sumber Data"
                                        : `Pilih Sumber Data`}
                                </option>

                                {/* Jika user ALL BRAND → pakai form.product */}
                                {userData?.product === "ALL BRAND" && form.product &&
                                    sumberDataOptions[form.product?.toUpperCase()]?.map((s, idx) => (
                                        <option key={idx} value={s}>{s}</option>
                                    ))
                                }

                                {/* Jika user bukan ALL BRAND → pakai userData.product */}
                                {userData?.product !== "ALL BRAND" &&
                                    sumberDataOptions[userData?.product?.toUpperCase()]?.map((s, idx) => (
                                        <option key={idx} value={s}>{s}</option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>
                    {/* 🔹 No Kontrak & Nama Debitur */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="relative dropdown-kontrak">
                            <label className="block text-sm font-medium mb-1">
                                No Kontrak
                            </label>

                            <input
                                type="text"
                                placeholder={
                                    !activeProduct
                                        ? "Pilih Sumber Data atau Product terlebih dahulu"
                                        : "Cari No Kontrak..."
                                }
                                value={form.noKontrak}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        noKontrak: e.target.value,
                                    }))
                                }
                                onFocus={() => {
                                    if (activeProduct) setShowDropdown(true); // dropdown aktif jika sumber data sudah dipilih
                                }}
                                readOnly={!activeProduct} // ⛔ dikunci sebelum pilih sumber data
                                className={`w-full border rounded-lg p-2 transition ${!activeProduct
                                    ? "bg-gray-100 cursor-not-allowed text-gray-500"
                                    : "bg-white"
                                    }`}
                                required
                            />

                            {/* Dropdown muncul hanya jika sumber data sudah dipilih */}
                            {form.sumberData && showDropdown && (
                                <ul className="absolute z-10 bg-white border rounded-lg w-full max-h-48 overflow-y-auto shadow-md mt-1">
                                    {filteredKontrak.length > 0 ? (
                                        filteredKontrak.map((item, idx) => (
                                            <li
                                                key={idx}
                                                onClick={() => handleSelectKontrak(item)}
                                                className="px-3 py-2 hover:bg-indigo-100 cursor-pointer text-sm"
                                            >
                                                {item["NO KONTRAK"]}
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
                                className="w-full border rounded-lg p-2 bg-gray-100"
                                required
                                readOnly
                            />
                        </div>
                    </div>

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

                    {/* Keterangan akan terisi berdasarkan no kontrak */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Keterangan
                        </label>
                        <textarea
                            value={form.ket}
                            rows={Math.min(estimatedRows, MAX_ROWS)}
                            className="w-full border rounded-lg p-2 bg-gray-100 resize-none"
                            readOnly
                        />
                    </div>


                    {/* Status Konsumen hanya muncul jika Sumber Data adalah Mobil Priority 3 atau Motor Priority 3 */}
                    {(form.sumberData === "MOBIL PRIORITY 3" || form.sumberData === "MOTOR PRIORITY 3") && (
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Status Konsumen
                            </label>
                            <select
                                name="statusKonsumen"
                                value={form.statusKonsumen}
                                onChange={handleChange}
                                className="w-full rounded-lg p-2 border border-gray-300"
                            >
                                <option value="">Pilih Status Konsumen</option>
                                <option value="Pil1">
                                    No HP Konsumen sama dengan data di WISe dan Bersedia Di Lakukan Penawaran
                                </option>
                                <option value="Pil2">
                                    No HP Konsumen sama dengan data di WISe dan Tidak Bersedia Di Lakukan Penawaran
                                </option>
                                <option value="Pil3">
                                    No HP Konsumen berganti dan CMO melakukan pengkinian data pada Form Perubahan Data Konsumen
                                </option>
                            </select>
                        </div>
                    )}

                    {/* 🔹 Hasil Visit */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Hasil Visit
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

                    {/* 🔹 Aktivitas dinamis berdasarkan hasil */}
                    {form.hasil === "Tidak Bertemu" && (
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Aktivitas Visit
                            </label>
                            <select
                                name="aktivitas"
                                value={form.aktivitas}
                                onChange={handleChange}
                                className="w-full border rounded-lg p-2"
                            >
                                <option value="">Pilih Aktivitas</option>
                                {aktivitasTidakBertemu.map((act, idx) => (
                                    <option key={idx} value={act}>
                                        {act}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {form.hasil === "Bertemu" && (
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

                            {/* Hasil Bertemu */}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Hasil Bertemu
                                </label>
                                <select
                                    name="aktivitas"
                                    value={form.aktivitas}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg p-2"
                                >
                                    <option value="">Pilih Hasil Bertemu</option>
                                    {hasilBertemuList.map((b, idx) => (
                                        <option key={idx} value={b}>
                                            {b}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Nomor HP */}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Nomor HP Konsumen
                                </label>
                                <input
                                    type="text"
                                    name="noHp"
                                    value={form.noHp}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, "").slice(0, 13);
                                        setForm({ ...form, noHp: value });
                                    }}
                                    placeholder="Masukkan nomor HP"
                                    className="w-full border rounded-lg p-2"
                                    inputMode="numeric"
                                />
                            </div>

                            {/* Keterangan tambahan */}
                            {form.aktivitas === "Tidak Berminat" && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Keterangan Tidak Berminat
                                    </label>
                                    <select
                                        name="keterangan"
                                        value={form.keterangan}
                                        onChange={handleChange}
                                        className="w-full border rounded-lg p-2"
                                    >
                                        <option value="">Pilih Keterangan</option>
                                        {keteranganTidakBerminat.map((k, idx) => (
                                            <option key={idx} value={k}>
                                                {k}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {form.aktivitas === "Interest" && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Keterangan Interest
                                    </label>
                                    <select
                                        name="keterangan"
                                        value={form.keterangan}
                                        onChange={handleChange}
                                        className="w-full border rounded-lg p-2"
                                    >
                                        <option value="">Pilih Keterangan</option>
                                        {keteranganInterest.map((k, idx) => (
                                            <option key={idx} value={k}>
                                                {k}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </>
                    )}

                    {/* Detail Visit */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Notes Visit
                        </label>
                        <textarea
                            name="detail"
                            value={form.detail}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Tuliskan detail minimal 5 kata..."
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
                            disabled={!isMobile}    // ⛔ Tidak bisa di laptop
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
