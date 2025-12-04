import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function Maintance() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [dataMA, setDataMA] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);
    const [photo, setPhoto] = useState(null); // 📸 simpan foto
    const [isMobile, setIsMobile] = useState(true);
    const fileInputRef = useRef(null);
    const [isDirty, setIsDirty] = useState(false);

    const [form, setForm] = useState({
        region: "",
        cabang: "",
        product: "",
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
        "Mengembangkan Ikatan Emosional",
        "Informasi SK",
        "Sosialisasi Program",
        "SLA Order In",
    ];

    const hasilList = ["Dapat Prospect", "Tidak Dapat Prospect"];

    useEffect(() => {
        const check = Object.keys(form).some((key) => form[key] !== "");
        setIsDirty(check);
    }, [form]);

    useEffect(() => {
        const handler = (e) => {
            if (!isDirty) return;
            e.preventDefault();
            e.returnValue = ""; // wajib ada
        };

        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [isDirty]);

    // ✅ Proteksi route & ambil data dari Apps Script
    useEffect(() => {
        const safeNavigate = (path) => {
            if (!isDirty) {
                navigate(path);
                return;
            }

            Swal.fire({
                title: "Form belum selesai",
                text: "Anda memiliki data yang belum disimpan. Yakin ingin meninggalkan halaman?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Ya, tinggalkan",
                cancelButtonText: "Batal",
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate(path);
                }
            });
        };

        const user = sessionStorage.getItem("userData");
        const loggedIn = sessionStorage.getItem("loggedIn");

        if (!loggedIn || !user) {
            // navigate("/");
            safeNavigate("/dashboard");
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
            product: parsedUser.product !== "ALL BRAND" ? parsedUser.product : "" // ⬅ FIX PENTING
        }));

        const regionURL = {
            "JABODEBEK 1": "https://script.google.com/macros/s/AKfycbynrKPxbiqtQ4kRiTjrSEE2TXOhJDvLjSk2ycVSf6CHePG_Wg6WwOAV-NhAa-0KxKskjQ/exec",
            "JABODEBEK 2": "https://script.google.com/macros/s/AKfycbw38CD6092epGsBp7uBzIXx9j_obDQbDzSQplxYSHBGf3FhM242B6_4V1qbPprOYKrWIg/exec",
            "JABODEBEK 3": "https://script.google.com/macros/s/AKfycbyUhlF8-IvuH9oXr8GfNcQsLGrEcKQ76w8F-lp8GU7xujeurpN4cw1boCza-U2QaLw6/exec",
            "BANTEN 1": "https://script.google.com/macros/s/AKfycbxz8Mqsknwlaq7QprxGuhfyqculk8mBMYLTMeBsyEqExawjFpNviIV0jHEygDXfVRae/exec",
            "BANTEN 2": "https://script.google.com/macros/s/AKfycbyBa4H-nTjWomVOJT-SiCdNQpXOXJjIWNOYeqjjREiANcyK9ybzkGi4NeWzK57xS37BJg/exec",
            "JABAR 1": "https://script.google.com/macros/s/AKfycbyWKzQbSyccX71Epy3K8B20ZSXxGcvulHHGS6Rr6NkE0JXThc00EoksdUT-lOQvqeXZ/exec",
            "JABAR 2": "https://script.google.com/macros/s/AKfycbzKoWJpMqaiwpBYirwtCVZbTHwnTBZ0WtZqnRWocrFn17NXAD-mO8lynqWJdBpJAAc/exec",
            "JATENGUT 1": "https://script.google.com/macros/s/AKfycbzXdANB18q9z-j5XuI6l68AzQC_-QZt931weOz-S6PAnSzGmbESKK5ZVbPZNgPn974R/exec",
            "JATENGUT 2": "https://script.google.com/macros/s/AKfycbxcLPFV-oa8xM_HgQVie63LIrXalu9Ds82uZF_md2mB2dErvQgs7IG_nwrOig-D0vWf/exec",
            "JATENGSEL 1": "https://script.google.com/macros/s/AKfycbwVYyJlhHccAI7p0zqIhivbsM1sQiM78jSR_lSLrKFknvpdMbR7xuFtVwgLrGsu6VoG/exec",
            "JATENGSEL 2": "https://script.google.com/macros/s/AKfycbwDo8ahB4ZoQATzO0ha7sWIBkgleS-P_TjeNRck6VHJzWg5viynZ6KBhSjCxDdauYT5Ww/exec",
            "JATIM 1": "https://script.google.com/macros/s/AKfycbyoZhEEyiH22ZX0kV8WBqv2KUnDBH9hr5e5pH42HdJ1SSpQZ3s2UWv4w1q1OFtsCyf1Qg/exec",
            "JATIM 2": "https://script.google.com/macros/s/AKfycbyZPfObJcTMSSALrEzDG9DuWbg8kouBfAZtCypCeAXlAGWrxkCnc14sT324kyZm2D9Y/exec",
            "JATIM 3": "https://script.google.com/macros/s/AKfycbyJYwx-dLlE_IY8iH-4JVZGeixOAEZ_2KZwBTmXP6OnALKUDv8GhX-lRFpEDes61aiP/exec",
            "JATIM 5": "https://script.google.com/macros/s/AKfycbww4jVML5P7ar3GtSWb9dV0_hgQqmn0-iuxT4RbIn_C3lVmaaNeF4hcIOWoRJlY88CPJw/exec",
            "SUMBAGUT 1": "https://script.google.com/macros/s/AKfycbyBAxppLl4bmJCU5u6u8lYVGKewTZqclykLJ9mHy0WqMuDIJMFr9X4fgd6ggu7yVLjQ_Q/exec",
            "SUMBAGUT 2": "https://script.google.com/macros/s/AKfycbxpKGHc7PpxIUH-4ppYSGuq6ESYMRTqZ1ZaldTHGHAtXrw5vGlWY1AG5Zcp6FpgTzifmw/exec",
            "SUMBAGSEL 1": "https://script.google.com/macros/s/AKfycbxdOr86PGyP5NbA7kvwimz4-JoorlNr5TdXyeWHv_0iTic68TBJoLtJH83KBVMRc_Um/exec",
            "SUMBAGSEL 2": "https://script.google.com/macros/s/AKfycbzVqDSPobHghZ1-V-hVYFhkMM1hbKQz_4uvr9k6GfxLJbnSrFHmqxyueJrw6fV2RU8mIA/exec",
            "KALIMANTAN": "https://script.google.com/macros/s/AKfycbzRKpaZmch4C7AT-Hs7hEdZ_X9-GEGnHXK7-m3J73PwElhIcQrh_PEZ4XgPixMhp97IOA/exec",
            "SULAWESI 1": "https://script.google.com/macros/s/AKfycbzQMK6fKEE82Rg-ku18Qow5xzaMQwqJiPASpIMLbFKZIWTVegbuPkXDaTnwZ9lMlHakFQ/exec",
            "SULAWESI 2": "https://script.google.com/macros/s/AKfycbyMHKohIU8ceKmLH9W6YccTGNdPT4_sYoots03_iJwp5rBlLtsyq25D-TS8Ba6xd7taig/exec"
        };

        const baseURL = regionURL[parsedUser.region] || "";

        const scriptURL =
            baseURL +
            "?nik=" + parsedUser.nik +
            "&akses=" + encodeURIComponent(parsedUser.akses || "") +
            "&region=" + encodeURIComponent(parsedUser.region || "") +
            "&cabang=" + encodeURIComponent(parsedUser.cabang || "");


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
    }, [isDirty, navigate]);

    const activeProduct =
        userData?.product === "ALL BRAND"
            ? form.product
            : userData?.product || "";

    // 🔍 Filter hasil pencarian Nama MA + PRODUCT + ROLE
    const filteredMA = dataMA.filter((item) => {
        const productMatch =
            !activeProduct ||
            item["PRODUCT"]?.toUpperCase() === activeProduct.toUpperCase();

        const namaMatch = item["TRIM NAMA"]
            ?.toLowerCase()
            .includes(form.namaMA.toLowerCase());

        // --- FILTER BERDASARKAN ROLE ---
        if (userData?.akses === "MAO") {
            // MAO → NIK + PRODUCT + Nama
            const nikMatch =
                item["NIK (PIC)"]?.toUpperCase() === userData.nik?.toUpperCase();

            return productMatch && namaMatch && nikMatch;
        } else if (userData?.akses === "SURVEYOR") {
            // SURVEYOR → PRODUCT + REGION + CABANG + Nama
            const regionMatch =
                item["REGION"]?.toUpperCase() === userData.region?.toUpperCase();

            const cabangMatch =
                item["CABANG"]?.toUpperCase() === userData.cabang?.toUpperCase();

            return productMatch && namaMatch && regionMatch && cabangMatch;
        }

        // Default: jika role tidak dikenal → hanya filter PRODUCT + Nama MA
        return productMatch && namaMatch;
    });

    // console.log("product aktif" + activeProduct);
    // console.log(dataMA);
    // console.log(filteredMA);


    // 🔹 Saat memilih MA
    const handleSelectMA = (item) => {
        setForm((prev) => ({
            ...prev,
            namaMA: item["TRIM NAMA"],
            noRef: item["TRIM NO REF"] || "",
            occupation: item["OCCUPATION WISE"] || "",
        }));
        setShowDropdown(false);
    };

    // 🔹 Input berubah
    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "product") {
            setForm({
                ...form,
                product: value,
                namaMA: "",
                noRef: "",
                occupation: ""
            });
            return;
        }

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

        // ❗ Validasi TRIM NAMA harus ada di database
        const kontrakAda = dataMA.some(
            (item) => item["TRIM NAMA"] === form.namaMA
        );

        if (!kontrakAda) {
            Swal.fire({
                icon: "error",
                title: "Nama MA Tidak Ditemukan",
                text: "Pastikan Nama MA sesuai dengan data yang tersedia.",
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
                "https://script.google.com/macros/s/AKfycbzY3uviXoa84cE3hKXadrXgyEpJZN2o1OnFId_vYHhornZpXqIk5ALu9m2AqcO7KSYa/exec",
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
                    title: "Data berhasil disimpan!",
                    text: result.message || "Data berhasil disimpan.",
                    confirmButtonColor: "#16a34a",
                });


                setForm({
                    region: userData?.region || "",
                    cabang: userData?.cabang || "",
                    product: userData?.product || "",
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

                // kosongkan kembali input file
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            } else {
                Swal.fire({
                    icon: "warning",
                    title: "Batas Input Tercapai",
                    text: result.message || "MA ini sudah mencapai batas input bulan ini.",
                    confirmButtonColor: "#f59e0b",
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

                {/* 🧾 Form Maintain */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        {/* Product */}
                        <div hidden={userData.product !== "ALL BRAND"}>
                            <label className="block text-sm font-medium mb-1">
                                Product
                            </label>
                            <select
                                name="product"
                                value={form.product}
                                onChange={handleChange}
                                className="w-full rounded-lg p-2 border border-gray-300"
                            >
                                <option value="">Pilih Product</option>
                                <option value="MOTORKU">MOTORKU</option>
                                <option value="MOBILKU">MOBILKU</option>
                            </select>
                        </div>
                    </div>
                    {/* Nama MA & No Ref */}
                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Nama MA hanya muncul jika product sudah dipilih */}
                        <div className="relative dropdown-ma">
                            <label className="block text-sm font-medium mb-1">
                                Nama MA
                            </label>

                            <input
                                type="text"
                                placeholder={
                                    !activeProduct
                                        ? "Pilih PRODUCT terlebih dahulu"
                                        : "Cari Nama MA..."
                                }
                                value={form.namaMA}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        namaMA: e.target.value,
                                    }))
                                }
                                onFocus={() => {
                                    if (activeProduct) setShowDropdown(true);
                                }}
                                readOnly={!activeProduct}  // ❗ hanya disable jika ALL BRAND & belum pilih product
                                className={`w-full border rounded-lg p-2 uppercase transition ${!activeProduct
                                    ? "bg-gray-100 cursor-not-allowed text-gray-500"
                                    : "bg-white"
                                    }`}
                                required
                            />

                            {activeProduct && showDropdown && (
                                <ul className="absolute z-10 bg-white border rounded-lg w-full max-h-48 overflow-y-auto shadow-md mt-1">
                                    {filteredMA.length > 0 ? (
                                        filteredMA.map((item, idx) => (
                                            <li
                                                key={idx}
                                                onClick={() => handleSelectMA(item)}
                                                className="px-3 py-2 hover:bg-indigo-100 cursor-pointer text-sm"
                                            >
                                                {item["TRIM NAMA"]}
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
                                Aktivitas Maintain
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
                                Hasil Maintain
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

                    {/* Detail Maintain */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Detail Maintain
                        </label>
                        <textarea
                            name="detail"
                            value={form.detail}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Tuliskan detail Maintain minimal 5 kata..."
                            className="w-full border rounded-lg p-2 resize-none"
                            required
                        />
                    </div>

                    {/* 📸 Ambil Foto */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Ambil Foto Maintain
                        </label>

                        {/* input file disembunyikan */}
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

                        {/* warning jika bukan mobile */}
                        {!isMobile && (
                            <p className="text-red-600 text-sm mt-1">
                                Fitur foto hanya bisa digunakan di perangkat mobile.
                            </p>
                        )}

                        {/* preview foto */}
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
