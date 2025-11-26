import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function Visiting() {
    const navigate = useNavigate();

    const [dataKontrak, setDataKontrak] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);
    const [photo, setPhoto] = useState(null);
    const [userData, setUserData] = useState(null);

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
        }));

        const scriptURL =
            "https://script.google.com/macros/s/AKfycbz6DBTAmjAB7nnrt5PkZZ_CzpwzVb8dMEHBtXvj0-yGkHFUJOB99iRJtXsh6YM1fKqd/exec" +
            `?region=${parsedUser.region}&cabang=${parsedUser.cabang}`;

        setLoading(true);
        fetch(scriptURL)
            .then((res) => res.json())
            .then((data) => {
                if (data && data.data) {
                    setDataKontrak(data.data);
                }
            })
            .catch((err) => console.error("Error fetching kontrak:", err))
            .finally(() => setLoading(false));
    }, [navigate]);

    // 🔍 Filter hasil pencarian No Kontrak
    const filteredKontrak = dataKontrak.filter((item) => {
        const matchNoKontrak = item["NO KONTRAK"]
            ?.toLowerCase()
            .includes(form.noKontrak.toLowerCase());

        const matchSumberData = form.sumberData
            ? item["SUMBER DATA"] === form.sumberData
            : true;

        const matchProduct = form.product
            ? item["PRODUCT"] === form.product
            : true;

        return matchNoKontrak && matchSumberData && matchProduct;
    });

    const sumberDataOptions = {
        MOTORKU: [
            "Motor Priority 1",
            "Motor Priority 2",
            "Motor Priority 3",
        ],
        MOBILKU: [
            "Mobil Priority 1",
            "Mobil Priority 2",
            "Mobil Priority 3",
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
            sumberData: item["SUMBER DATA"] || "",
            ket: item["KETERANGAN"] || "",
        }));
        setShowDropdown(false);
    };

    // 🔹 Input berubah
    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => {
            let updated = { ...prev, [name]: value };

            if (name === "product") {
                updated.sumberData = "";     // reset sumber data
                updated.noKontrak = "";      // reset kontrak
                updated.namaDebitur = "";
                updated.ket = "";
            }

            if (name === "sumberData") {
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

    // 🔹 Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();

        const wordCount = form.detail.trim().split(/\s+/).length;
        if (wordCount < 5) {
            Swal.fire({
                icon: "warning",
                title: "Detail Terlalu Singkat",
                text: "Detail Visiting minimal 5 kata!",
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

        const payload = { ...form, statusKonsumen: statusMap[form.statusKonsumen] || "", photoBase64: photo };

        try {
            Swal.fire({
                title: "Menyimpan data...",
                text: "Mohon tunggu sebentar",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });

            const response = await fetch(
                "https://script.google.com/macros/s/AKfycbztY6QMcnKM3nYpizAomcNWbKQaOE-DtUrPHblOCFKUTh8yt_BXBiROym6GTYqy7D7F/exec",
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
                });
                setPhoto(null);
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
                                    sumberDataOptions[form.product].map((s, idx) => (
                                        <option key={idx} value={s}>{s}</option>
                                    ))
                                }

                                {/* Jika user bukan ALL BRAND → pakai userData.product */}
                                {userData?.product !== "ALL BRAND" &&
                                    sumberDataOptions[userData?.product]?.map((s, idx) => (
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
                            name="ket"
                            value={form.ket}
                            onChange={handleChange}
                            rows="4"
                            className="w-full border rounded-lg p-2 bg-gray-100"
                            readOnly
                        />
                    </div>


                    {/* Status Konsumen hanya muncul jika Sumber Data adalah Mobil Priority 3 atau Motor Priority 3 */}
                    {(form.sumberData === "Mobil Priority 3" || form.sumberData === "Motor Priority 3") && (
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
                            className="w-full border rounded-lg p-2"
                            required
                        />
                    </div>

                    {/* Foto */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Ambil Foto Visiting
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
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
