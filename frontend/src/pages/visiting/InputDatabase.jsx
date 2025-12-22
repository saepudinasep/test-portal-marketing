import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function InputDatabase() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState(null);
    const fileInputRef = useRef(null);
    const [photo, setPhoto] = useState(null);

    const [form, setForm] = useState({
        region: "",
        cabang: "",
        nama: "",
        nik: "",
        position: "",
        namaKonsumen: "",
        noHpKonsumen: "",
        product: "",
        sumberDatabase: "",
        namaEvent: "",
        keterangan: "",
        alamat: "",
        brand: "",
        tipe: "",
        estimasi: "",
        setuju: false,
    });

    // 🔹 Cek session dan tampilkan data
    useEffect(() => {
        const session = sessionStorage.getItem("userData");
        if (!session) {
            navigate("/");
            return;
        }
        const parsed = JSON.parse(session);
        setUserData(parsed);
        setForm((prev) => ({
            ...prev,
            region: parsed.region || "",
            cabang: parsed.cabang || "",
            nama: parsed.name || "",
            nik: parsed.nik || "",
            position: parsed.position || "",
        }));
        setTimeout(() => setLoading(false), 800);
    }, [navigate]);


    // 🔹 Format Rupiah
    const formatRupiah = (value) => {
        const angka = value.replace(/[^\d]/g, "");
        const formatted = new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(angka);
        return formatted.replace("Rp", "Rp ");
    };

    // 🔹 Submit Form
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.setuju) {
            Swal.fire("Peringatan", "Anda harus menyetujui syarat & ketentuan!", "warning");
            return;
        }

        if (form.noHpKonsumen.length < 11 || form.noHpKonsumen.length > 13) {
            Swal.fire("Peringatan", "No HP Konsumen harus 11–13 digit!", "warning");
            return;
        }

        // 🔹 Validasi khusus product
        if (isMaskuHajiku && (!form.sumberDatabase || !form.namaEvent)) {
            Swal.fire("Peringatan", "Sumber Database & Nama Event wajib diisi!", "warning");
            return;
        }

        if (
            isMobilMotor &&
            (!form.alamat || !form.brand || !form.tipe || !form.estimasi)
        ) {
            Swal.fire("Peringatan", "Data kendaraan belum lengkap!", "warning");
            return;
        }

        // 🔹 Payload dinamis
        const payload = {
            region: form.region,
            cabang: form.cabang,
            namaPIC: form.nama,
            nik: form.nik,
            jabatan: form.position,
            keterangan: form.keterangan,
            product: activeProduct,
            namaKonsumen: form.namaKonsumen.toUpperCase(),
            noHpKonsumen: form.noHpKonsumen,
            photoBase64: photo || "",
            createdAt: new Date().toISOString(),
        };

        // Tambahan field berdasarkan product
        if (isMaskuHajiku) {
            payload.sumberDatabase = form.sumberDatabase;
            payload.namaEvent = form.namaEvent.toUpperCase();
        }

        if (isMobilMotor) {
            payload.alamat = form.alamat;
            payload.brand = form.brand;
            payload.tipe = form.tipe.toUpperCase();
            payload.estimasi = form.estimasi;
        }

        setLoading(true);
        try {
            const APPSCRIPT_URL = {
                "MASKU": "https://script.google.com/macros/s/AKfycbwumQZ25mdrpl0VV-LFZizJVd-40g4rb0Pht7JuaRkTxaVfppk9UaBwyPLdobIPADhI/exec",
                "HAJIKU": "https://script.google.com/macros/s/AKfycbwumQZ25mdrpl0VV-LFZizJVd-40g4rb0Pht7JuaRkTxaVfppk9UaBwyPLdobIPADhI/exec",
                "MOBILKU": "https://script.google.com/macros/s/AKfycbyKq9ek8KxSx-1mZimL7oXQ7vi5Hu_Cfx6ERQb-9Qb-pe9Rxrcso9gYjwQBXBnUb5hmGA/exec",
                "MOTORKU": "https://script.google.com/macros/s/AKfycbyKq9ek8KxSx-1mZimL7oXQ7vi5Hu_Cfx6ERQb-9Qb-pe9Rxrcso9gYjwQBXBnUb5hmGA/exec",
                "MOTOR BARU": "https://script.google.com/macros/s/URL_MOTORKU/exec",
            };

            const url = APPSCRIPT_URL[activeProduct];
            if (!url) {
                Swal.fire("Error", "URL AppScript tidak ditemukan", "error");
                setLoading(false);
                return;
            }

            const response = await fetch(url, {
                method: "POST",
                body: JSON.stringify({
                    action: "inputDatabase",
                    product: activeProduct,
                    data: payload,
                }),
            });

            const result = await response.json();

            if (result.status === "success") {
                Swal.fire("Sukses", "Data berhasil dikirim!", "success");

                // Reset sesuai product
                setForm((prev) => ({
                    ...prev,
                    namaKonsumen: "",
                    noHpKonsumen: "",
                    sumberDatabase: isMaskuHajiku ? "" : prev.sumberDatabase,
                    namaEvent: isMaskuHajiku ? "" : prev.namaEvent,
                    alamat: isMobilMotor ? "" : prev.alamat,
                    brand: isMobilMotor ? "" : prev.brand,
                    tipe: isMobilMotor ? "" : prev.tipe,
                    estimasi: isMobilMotor ? "" : prev.estimasi,
                    setuju: false,
                }));
            } else {
                Swal.fire("Gagal", result.message || "Gagal mengirim data", "error");
            }
        } catch (error) {
            Swal.fire("Error", error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const activeProduct =
        userData?.product !== "ALL BRAND"
            ? userData?.product
            : form.product;

    const isMaskuHajiku = ["MASKU", "HAJIKU"].includes(activeProduct);
    const isMobilMotor = ["MOBILKU", "MOTORKU", "MOTOR BARU"].includes(activeProduct);


    // 🔹 Handle input text
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        // 🔹 Jika product berubah
        if (name === "product") {
            const upper = value.toUpperCase();

            setForm((prev) => ({
                ...prev,
                product: upper,

                // reset khusus MASKU / HAJIKU
                alamat: ["MASKU", "HAJIKU"].includes(upper) ? "" : prev.alamat,
                brand: ["MASKU", "HAJIKU"].includes(upper) ? "" : prev.brand,
                tipe: ["MASKU", "HAJIKU"].includes(upper) ? "" : prev.tipe,
                estimasi: ["MASKU", "HAJIKU"].includes(upper) ? "" : prev.estimasi,

                // reset khusus MOBILKU / MOTORKU
                sumberDatabase: ["MOBILKU", "MOTORKU", "MOTOR BARU"].includes(upper)
                    ? ""
                    : prev.sumberDatabase,
                namaEvent: ["MOBILKU", "MOTORKU", "MOTOR BARU"].includes(upper)
                    ? ""
                    : prev.namaEvent,
            }));
            return;
        }

        if (name === "noHpKonsumen") {
            const angka = value.replace(/\D/g, "").slice(0, 13);
            setForm({ ...form, [name]: angka });
        } else if (name === "estimasi") {
            setForm({ ...form, [name]: formatRupiah(value) });
        } else if (type === "checkbox") {
            setForm({ ...form, [name]: checked });
        } else {
            setForm({ ...form, [name]: value });
        }
    };

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

    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-[9999]">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto mt-5 p-6 bg-white shadow-lg rounded-xl">
            <h1 className="text-2xl font-bold text-indigo-700 mb-6 text-center">
                Input Database Konsumen
            </h1>

            {/* Info PIC */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
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
                <div>
                    {/* Product */}
                    <label className="block text-sm font-medium mb-1">
                        Product
                    </label>
                    <select
                        name="product"
                        value={
                            userData.product !== "ALL BRAND"
                                ? userData.product
                                : form.product
                        }
                        onChange={handleChange}
                        disabled={userData.product !== "ALL BRAND"}
                        className={`w-full rounded-lg p-2 border border-gray-300
            ${userData.product !== "ALL BRAND"
                                ? "bg-gray-100 cursor-not-allowed"
                                : ""
                            }`}
                    >
                        <option value="">Pilih Product</option>
                        <option value="MOTOR BARU">MOTOR BARU</option>
                        <option value="MOTORKU">MOTORKU</option>
                        <option value="MOBILKU">MOBILKU</option>
                        <option value="MASKU">MASKU</option>
                        <option value="HAJIKU">HAJIKU</option>
                    </select>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* NAMA KONSUMEN */}
                <div>
                    <label className="text-sm font-semibold">Nama Konsumen</label>
                    <input
                        type="text"
                        name="namaKonsumen"
                        value={form.namaKonsumen}
                        onChange={handleChange}
                        required
                        className="w-full border rounded-lg p-2 uppercase"
                        placeholder="Masukan Nama Konsumen"
                    />
                </div>

                {/* NO HP */}
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

                {isMaskuHajiku && (
                    <>
                        {/* Sumber Database */}
                        <div>
                            <label className="text-sm font-semibold">Sumber Database</label>
                            <select
                                name="sumberDatabase"
                                value={form.sumberDatabase}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg p-2 border"
                            >
                                <option value="">Pilih Sumber Database</option>
                                <option value="Event">Event</option>
                                <option value="Marketing Agent">Marketing Agent</option>
                                <option value="Canvasing">Canvasing</option>
                                <option value="KBIH">KBIH</option>
                                <option value="Instansi">Instansi</option>
                            </select>
                        </div>

                        {/* Nama Event */}
                        <div>
                            <label className="text-sm font-semibold">
                                Nama Event / Instansi / Marketing Agent
                            </label>
                            <input
                                type="text"
                                name="namaEvent"
                                value={form.namaEvent}
                                onChange={handleChange}
                                required
                                className="w-full border rounded-lg p-2 uppercase"
                                placeholder="Masukan Nama Event / Instansi / Marketing Agent"
                            />
                        </div>

                        {/* Keterangan */}
                        <div>
                            <label className="text-sm font-semibold">Keterangan</label>
                            <textarea
                                name="keterangan"
                                value={form.keterangan}
                                onChange={handleChange}
                                required
                                className="w-full border rounded-lg p-2"
                                rows={3}
                                placeholder="Masukan Keterangan"
                            />
                        </div>

                        {/* Foto */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Ambil Foto Selfie
                            </label>
                            <input
                                ref={fileInputRef}
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
                    </>
                )}

                {isMobilMotor && (
                    <>
                        {/* ALAMAT */}
                        <div>
                            <label className="text-sm font-semibold">Alamat Domisili</label>
                            <textarea
                                name="alamat"
                                value={form.alamat}
                                onChange={handleChange}
                                required
                                className="w-full border rounded-lg p-2"
                                rows={3}
                                placeholder="Masukan Alamat Domisili Konsumen"
                            />
                        </div>

                        {/* BRAND */}
                        <div>
                            <label className="text-sm font-semibold">Brand Kendaraan</label>
                            <select
                                name="brand"
                                value={form.brand}
                                onChange={handleChange}
                                required
                                className="w-full border rounded-lg p-2"
                            >
                                <option value="">Pilih Brand</option>
                                <option value="HONDA">Honda</option>
                                <option value="SUZUKI">Suzuki</option>
                                <option value="YAMAHA">Yamaha</option>
                                <option value="KAWASAKI">Kawasaki</option>
                                <option value="KTM">KTM</option>
                                <option value="MINERVA">Minerva</option>
                                <option value="VESPA">Vespa</option>
                                <option value="BAJAJ">Bajaj</option>
                            </select>
                        </div>

                        {/* TIPE */}
                        <div>
                            <label className="text-sm font-semibold">Tipe Unit Kendaraan</label>
                            <input
                                type="text"
                                name="tipe"
                                value={form.tipe}
                                onChange={handleChange}
                                required
                                className="w-full border rounded-lg p-2 uppercase"
                                placeholder="Masukan Tipe Unit"
                            />
                        </div>

                        {/* ESTIMASI */}
                        <div>
                            <label className="text-sm font-semibold">Estimasi Pencairan</label>
                            <input
                                type="text"
                                name="estimasi"
                                value={form.estimasi}
                                onChange={handleChange}
                                required
                                className="w-full border rounded-lg p-2"
                                placeholder="Rp 0"
                            />
                        </div>
                    </>
                )}

                {/* TERMS */}
                <div className="flex items-start space-x-2">
                    <input
                        id="setuju"
                        type="checkbox"
                        name="setuju"
                        checked={form.setuju}
                        onChange={handleChange}
                        className="mt-1 cursor-pointer"
                    />
                    <label
                        htmlFor="setuju"
                        className="text-sm leading-snug cursor-pointer select-none"
                    >
                        Saya setuju memberikan data Nomor Telepon dan Alamat tinggal untuk
                        dilakukan penawaran oleh WOM Finance dan grupnya maupun pihak lain
                        yang ditunjuk WOM Finance.
                    </label>
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
    );
}
