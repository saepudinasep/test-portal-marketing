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
            "JABODEBEK 1": "https://script.google.com/macros/s/AKfycbyfh91UBBjnHJnRDVAVgR_mgGezTOpI8BW5Ou9st2ZDXHQ5Pqmo0doeqKrPPbTeiVUcEg/exec",
            "JABODEBEK 2": "https://script.google.com/macros/s/AKfycbzrmcFw-r1Lc_NVN2SmsyYBRx8kfqPqRLFqOduYxBXxi9C2xH-dhEjijgS9jOck9NU-zw/exec",
            "JABODEBEK 3": "https://script.google.com/macros/s/AKfycbxQH51vYxz1YcbtLhHdoCoMDW8Uf6GN8XoSFusd8shi7H7FFWMumR4Bb-c5Os6mzNoT/exec",
            "BANTEN 1": "https://script.google.com/macros/s/AKfycbzOEgm_crgtR9H46uxQdZSvwYuMDLlkjNiXBiSHNSUztDYvTsxttAJJnxqSCo4OKXhD/exec",
            "BANTEN 2": "https://script.google.com/macros/s/AKfycbzowgLuYMzTDiX8ZOsT9X3Uo_J6lBlt_CKKo2gu4FsmGdLCIaDfHvawSaHzzojgSoATAA/exec",
            "JABAR 1": "https://script.google.com/macros/s/AKfycbwcbj322zZQYJbi_NnfNRf6Te0seOuaBAOS-XhBPEZdTrvGxd7wChwY3NiPGp_36E86/exec",
            "JABAR 2": "https://script.google.com/macros/s/AKfycbwre9gtL4XfcDopS5pBPHPVL7frH6FWYAnvFpUbTMtT6ODZ-SALyX5XM9QmwjVbr6w/exec",
            "JATENGUT 1": "https://script.google.com/macros/s/AKfycbxPUg17iNUAX1Joy6_b5a-l2JDgKMQ4HN0uU3Fei50omjxLUEoLV1-emE-8Z5Zm57U/exec",
            "JATENGUT 2": "https://script.google.com/macros/s/AKfycbxxDm4Pj9ZIlXaIwwLorRCqHHBZOhGijD0cOoLqeJ1WfGF-ISlmydwEVQ1lVHiwtg7B/exec",
            "JATENGSEL 1": "https://script.google.com/macros/s/AKfycbxHEgnbgVWrv2Gv_ETzk4mtSB1CxDjSWOnOil41qfjC_FyP9n_1WBOYTcwhGs8YLhmf/exec",
            "JATENGSEL 2": "https://script.google.com/macros/s/AKfycbzoJR0oiInN0suz437KOKu2ta1TtrTjSpVWVp8fkDBOzrTtrPSu-DZbjlvxWgjRt3O56A/exec",
            "JATIM 1": "https://script.google.com/macros/s/AKfycbyRfBIPhUhoDK7dzVQ7zK00zHxdHLIXBK7GdEdeS4rTQWZUi1ZigLTCgOOi-xEt35DEng/exec",
            "JATIM 2": "https://script.google.com/macros/s/AKfycby9bYBrBRimN6zYgQPJx869aKT8IHYPfBF_DJaRKoqiOPfCswbg9GYfhmzlqPhiv3h9/exec",
            "JATIM 3": "https://script.google.com/macros/s/AKfycbyNSW7F-_sYDbgQmXYLHIAogPXYPp5TuB2loxWIxJ2Z_QN6ev_mIF2gZ3F0c8znht6P/exec",
            "JATIM 5": "https://script.google.com/macros/s/AKfycbz8XFlxW7x_xsHVQ4XRqITDz3f3uYjHusdIsPz3zFIIV0bBxZduBW3Y1_rhWg_NJQyLtw/exec",
            "SUMBAGUT 1": "https://script.google.com/macros/s/AKfycbzccJVFZfT_GdnivihM0D4WX2qNzz6igs9VCpFS5YkMDJasrrh9HCTg6Q-CpkYBNlfAgw/exec",
            "SUMBAGUT 2": "https://script.google.com/macros/s/AKfycbyZ83Qd4OMMfPZ1h-Prf6x0EOSlBK7th1Ha2TRS5z4603bRI0vE6xc3miUA1GMiH_i7dw/exec",
            "SUMBAGSEL 1": "https://script.google.com/macros/s/AKfycbwOK57XHb-kMM5DJ6kBXM7o_Cx6exhzfGFAb6buh-xuodAghyAmbrLJugw7o-9SqRvh/exec",
            "SUMBAGSEL 2": "https://script.google.com/macros/s/AKfycbyZNUjdtRKXhpY16K4CVSN0KPOAsWJ5W7-PUbutQVSvpGQ6-EB8Q6uV53bPq_18_NEWKA/exec",
            "KALIMANTAN": "https://script.google.com/macros/s/AKfycbypmCP6OVH7rglvV2HD20gYFRgc7_18gdW6gWdqJNFCqolrYBzjbUJFDiLizzxGmJXKqA/exec",
            "SULAWESI 1": "https://script.google.com/macros/s/AKfycbwyNPO9IDqfnR1G2d2ZSp-ZcGWfkRc6M3VNyF5AqUsJ36SmYEr49u68M8hk37ShxI8dbQ/exec",
            "SULAWESI 2": "https://script.google.com/macros/s/AKfycbxzxQX-fQh0dz6Vo_f25XsHwQNYpSdzqRZJBlFS3eC4wDqbNoO7vGmpaFYa8s8jNyGBVw/exec"
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

    // 🔍 Filter hasil pencarian Nama MA + PRODUCT
    const filteredMA = dataMA.filter((item) => {
        const productMatch =
            !activeProduct ||
            item["PRODUCT"]?.toUpperCase() === activeProduct.toUpperCase();

        const namaMatch = item["TRIM NAMA"]
            ?.toLowerCase()
            .includes(form.namaMA.toLowerCase());

        return productMatch && namaMatch;
    });

    console.log("product aktif" + activeProduct);
    console.log(dataMA);
    console.log(filteredMA);


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
