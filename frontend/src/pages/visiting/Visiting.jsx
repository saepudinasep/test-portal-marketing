import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function Visiting() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [dataKontrak, setDataKontrak] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);
    const [photo, setPhoto] = useState(null);

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
            "https://script.google.com/macros/s/AKfycbyAy_2hf4dPvhvRGOhFBbD3q8dMjDfYHR8gF9jN6eVqa9RAfcHZnLbOpEV3Nyn0qda8gg/exec" +
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
    const filteredKontrak = dataKontrak.filter((item) =>
        item["NO KONTRAK"]
            ?.toLowerCase()
            .includes(form.noKontrak.toLowerCase())
    );

    // 🔹 Saat memilih kontrak
    const handleSelectKontrak = (item) => {
        setForm((prev) => ({
            ...prev,
            noKontrak: item["NO KONTRAK"],
            namaDebitur: item["NAMA KONSUMEN"] || "",
            sumberData: item["SUMBER DATA"] || "",
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
            if (!e.target.closest(".dropdown-kontrak")) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    // 📸 Ambil foto
    const handleTakePhoto = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhoto(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

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

        if (!photo) {
            Swal.fire({
                icon: "warning",
                title: "Foto Belum Diambil",
                text: "Harap ambil foto terlebih dahulu!",
            });
            return;
        }

        const payload = { ...form, photoBase64: photo };

        try {
            Swal.fire({
                title: "Menyimpan data...",
                text: "Mohon tunggu sebentar",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
            });

            const response = await fetch(
                "https://script.google.com/macros/s/AKfycbyqfIctQZimHt8JiFRrYGfYaw1D0OPZYyTYhbMXAHaywImw7eX4IfPTM_SJx8EoBERN3g/exec",
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
                    title: "Berhasil!",
                    text: "Data visiting berhasil disimpan.",
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
                    {/* 🔹 No Kontrak & Nama Debitur */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="relative dropdown-kontrak">
                            <label className="block text-sm font-medium mb-1">
                                No Kontrak
                            </label>
                            <input
                                type="text"
                                placeholder="Cari No Kontrak..."
                                value={form.noKontrak}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        noKontrak: e.target.value,
                                    }))
                                }
                                onFocus={() => setShowDropdown(true)}
                                className="w-full border rounded-lg p-2"
                                required
                            />
                            {showDropdown && (
                                <ul className="absolute z-10 bg-white border rounded-lg w-full max-h-48 overflow-y-auto shadow-md mt-1">
                                    {filteredKontrak.length > 0 ? (
                                        filteredKontrak.map((item, idx) => (
                                            <li
                                                key={idx}
                                                onClick={() =>
                                                    handleSelectKontrak(item)
                                                }
                                                className="px-3 py-2 hover:bg-indigo-100 cursor-pointer text-sm"
                                            >
                                                {item["NO KONTRAK"]}
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

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Sumber Data
                            </label>
                            <input
                                type="text"
                                name="sumberData"
                                value={form.sumberData}
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
                                    onChange={handleChange}
                                    placeholder="Masukkan nomor HP"
                                    className="w-full border rounded-lg p-2"
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
                            Detail Visiting
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
