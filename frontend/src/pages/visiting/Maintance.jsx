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

    const aktivitasListSyariah = [
        "Membangun Ikatan",
        "Informasi SK",
        "Sosialisasi Program",
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

    const activeProduct =
        userData?.product === "ALL BRAND"
            ? form.product
            : userData?.product || "";

    const isSyariah =
        ["MASKU", "HAJIKU"].includes(activeProduct?.toUpperCase());
    // const isMobilMotor = ["MOBILKU", "MOTORKU", "MOTOR BARU"].includes(activeProduct);

    const maField = isSyariah
        ? {
            nama: "NAMA MA",
            noRef: "NO REF",
        }
        : {
            nama: "TRIM NAMA",
            noRef: "TRIM NO REF",
        };

    const mapRegionSyariah = (region) => {
        const r = region?.toUpperCase();

        const mapping = {
            "JABODEBEK": "JABODEBEK",
            "JABODEBEK 1": "JABODEBEK",
            "JABODEBEK 2": "JABODEBEK",
            "JABODEBEK 3": "JABODEBEK",

            "BANTEN": "BANTEN",
            "BANTEN 1": "BANTEN",
            "BANTEN 2": "BANTEN",

            "JABAR": "JABAR",
            "JABAR 1": "JABAR",
            "JABAR 2": "JABAR",

            "JATENGUT": "JATENGUT",
            "JATENGUT 1": "JATENGUT",
            "JATENGUT 2": "JATENGUT",

            "JATENGSEL": "JATENGSEL",
            "JATENGSEL 1": "JATENGSEL",
            "JATENGSEL 2": "JATENGSEL",

            "JATIM": "JATIM BALI",
            "JATIM 1": "JATIM BALI",
            "JATIM 2": "JATIM BALI",
            "JATIM 3": "JATIM BALI",
            "JATIM 5": "JATIM BALI",

            "SUMBAGUT": "SUMBAGUT",
            "SUMBAGUT 1": "SUMBAGUT",
            "SUMBAGUT 2": "SUMBAGUT",

            "SUMBAGSEL": "SUMBAGSEL",
            "SUMBAGSEL 1": "SUMBAGSEL",
            "SUMBAGSEL 2": "SUMBAGSEL",

            "KALIMANTAN": "KALIMANTAN",
            "KALIMANTAN 1": "KALIMANTAN",
            "KALIMANTAN 2": "KALIMANTAN",

            "SULAWESI": "SULAWESI",
            "SULAWESI 1": "SULAWESI",
            "SULAWESI 2": "SULAWESI",
        };

        return mapping[r] || r; // fallback jika tidak ada di mapping
    };

    const SYARIAH_URL =
        "https://script.google.com/macros/s/AKfycbwjSSisE6KcTnu-RzAx_JtDc-mzafAo3Wl6fbsavVN2Rhc8Xu6ax_-xrdGhjkFSxGTVKQ/exec";

    const regionURL = {
        "JABODEBEK 1": "https://script.google.com/macros/s/AKfycbx2HzaNUQWL5HWPFgnjWNI0FXXouiBywnva_ETScQO86P1x_jBucwlkzGp5CCOlZa1S0w/exec",
        "JABODEBEK 2": "https://script.google.com/macros/s/AKfycbw38CD6092epGsBp7uBzIXx9j_obDQbDzSQplxYSHBGf3FhM242B6_4V1qbPprOYKrWIg/exec",
        "JABODEBEK 3": "https://script.google.com/macros/s/AKfycby5LZjwtsU8IvllSo0nCWSfTFvkb2tSVK8oXKpXHtohbywFDiepJ42-HniuV_RDm9HR/exec",
        "BANTEN 1": "https://script.google.com/macros/s/AKfycbxz8Mqsknwlaq7QprxGuhfyqculk8mBMYLTMeBsyEqExawjFpNviIV0jHEygDXfVRae/exec",
        "BANTEN 2": "https://script.google.com/macros/s/AKfycbzVX0usKydMHVTOIf6zov1xpm1uYqFefI7LxAM4IGKhloptc5Dzg3PWoFeQa9HskKVS_w/exec",
        "JABAR 1": "https://script.google.com/macros/s/AKfycbyWKzQbSyccX71Epy3K8B20ZSXxGcvulHHGS6Rr6NkE0JXThc00EoksdUT-lOQvqeXZ/exec",
        "JABAR 2": "https://script.google.com/macros/s/AKfycbzOFSD0NrDqDGNeUMVaOuHt4G2cuHnT7PVLua8EQY5pvsZdbCeqQI5QkTTdOZPFXGE/exec",
        "JATENGUT 1": "https://script.google.com/macros/s/AKfycbzXdANB18q9z-j5XuI6l68AzQC_-QZt931weOz-S6PAnSzGmbESKK5ZVbPZNgPn974R/exec",
        "JATENGUT 2": "https://script.google.com/macros/s/AKfycbxcLPFV-oa8xM_HgQVie63LIrXalu9Ds82uZF_md2mB2dErvQgs7IG_nwrOig-D0vWf/exec",
        "JATENGSEL 1": "https://script.google.com/macros/s/AKfycbx5p911jEBe1_1XjV_c91auKgTWm1UcsdyzgIx_reiCEai9tz02lm9TEoInooOtdYiF/exec",
        "JATENGSEL 2": "https://script.google.com/macros/s/AKfycbwDo8ahB4ZoQATzO0ha7sWIBkgleS-P_TjeNRck6VHJzWg5viynZ6KBhSjCxDdauYT5Ww/exec",
        "JATIM 1": "https://script.google.com/macros/s/AKfycbw9wwlNqz4naeu7W9ZFrvjKmw18i6UK_zuB1E8yrjucoFnsA7sF0NwCuZxSB4lm8fIhFA/exec",
        "JATIM 2": "https://script.google.com/macros/s/AKfycbxuMhyYtoMk0bZeHNyJEpROQXQTjYXbUt60DY0RJTU9dR5wJwYbYrF-_vb5Vd6s2Nde/exec",
        "JATIM 3": "https://script.google.com/macros/s/AKfycbwAYer7eAcwygWZYS64Y75sVgQsIglBgpUoGmzGg5VRLypcF-ALL5oc-daVegKbWJuX/exec",
        "JATIM 5": "https://script.google.com/macros/s/AKfycbw2VlwMWV6HENkhYY7vCucEgty1urBmPUBuUCymOhivNEjGAbCl7bxTANqAJMmMZRrA0Q/exec",
        "SUMBAGUT 1": "https://script.google.com/macros/s/AKfycbyBAxppLl4bmJCU5u6u8lYVGKewTZqclykLJ9mHy0WqMuDIJMFr9X4fgd6ggu7yVLjQ_Q/exec",
        "SUMBAGUT 2": "https://script.google.com/macros/s/AKfycbwrWzoM64tUmw_7l8iBMcO2Tz5h20mWsf7WnziXYOoxAMwquJLYcQmbWWrTt5FL9wBAbQ/exec",
        "SUMBAGSEL 1": "https://script.google.com/macros/s/AKfycby1Zr-SeUv48k6Jw5twT6oKMKZyGcRdc3dhZ4R4Y_KmEqt126Ct0BOC7qq91zg1GSCJ/exec",
        "SUMBAGSEL 2": "https://script.google.com/macros/s/AKfycbzVqDSPobHghZ1-V-hVYFhkMM1hbKQz_4uvr9k6GfxLJbnSrFHmqxyueJrw6fV2RU8mIA/exec",
        "KALIMANTAN 1": "https://script.google.com/macros/s/AKfycbzRKpaZmch4C7AT-Hs7hEdZ_X9-GEGnHXK7-m3J73PwElhIcQrh_PEZ4XgPixMhp97IOA/exec",
        "KALIMANTAN 2": "https://script.google.com/macros/s/AKfycbzxN_WZswGQ9c0mvwYlctOQ6H-C_bEq5NUN9SJpHsaqt5moIa6IuuYkxlWKtiKaepaV_g/exec",
        "SULAWESI 1": "https://script.google.com/macros/s/AKfycbzQMK6fKEE82Rg-ku18Qow5xzaMQwqJiPASpIMLbFKZIWTVegbuPkXDaTnwZ9lMlHakFQ/exec",
        "SULAWESI 2": "https://script.google.com/macros/s/AKfycbzsZDPeAqwv_iOKhmiN_LYaqFBrtcTR_AVNvPTiP0H5fx_asK4LKvFAta2VRd03cSM0WA/exec"
    };

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


        const fetchAllMA = async () => {
            try {
                setLoading(true);

                const regionSyariah = mapRegionSyariah(parsedUser.region);

                /* =============================
                   1️⃣ FETCH SYARIAH
                ============================== */
                const syariahURL =
                    SYARIAH_URL +
                    `?nik=${parsedUser.nik}` +
                    `&akses=${encodeURIComponent(parsedUser.akses || "")}` +
                    `&region=${encodeURIComponent(regionSyariah || "")}` +
                    `&cabang=${encodeURIComponent(parsedUser.cabang || "")}`;

                /* =============================
                   2️⃣ FETCH KONVENSIONAL
                ============================== */
                const konvenBase = regionURL[parsedUser.region];

                const konvenURL = konvenBase
                    ? konvenBase +
                    `?nik=${parsedUser.nik}` +
                    `&akses=${encodeURIComponent(parsedUser.akses || "")}` +
                    `&region=${encodeURIComponent(parsedUser.region || "")}` +
                    `&cabang=${encodeURIComponent(parsedUser.cabang || "")}`
                    : null;

                /* =============================
                   3️⃣ EXECUTE PARALEL
                ============================== */
                const requests = [
                    fetch(syariahURL).then((r) => r.json()),
                ];

                if (konvenURL) {
                    requests.push(fetch(konvenURL).then((r) => r.json()));
                }

                const results = await Promise.all(requests);

                /* =============================
                   4️⃣ GABUNGKAN DATA
                ============================== */
                const mergedData = results
                    .flatMap((res) => res?.data || [])
                    .filter(Boolean);

                setDataMA(mergedData);
            } catch (err) {
                console.error("Fetch MA error:", err);
                setDataMA([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAllMA();
    }, [isDirty, navigate]);

    // 🔍 Filter hasil pencarian Nama MA + PRODUCT + ROLE
    const filteredMA = dataMA.filter((item) => {
        /* =============================
           1️⃣ FILTER PRODUCT
        ============================== */
        const productMatch =
            !activeProduct ||
            item["PRODUCT"]?.toUpperCase() === activeProduct.toUpperCase();

        /* =============================
           2️⃣ FILTER NAMA MA
        ============================== */
        const namaMatch = item[maField.nama]
            ?.toLowerCase()
            .includes(form.namaMA.toLowerCase());

        /* =============================
           3️⃣ NORMALISASI REGION
        ============================== */
        const itemRegion = isSyariah
            ? mapRegionSyariah(item["REGION"])
            : item["REGION"]?.toUpperCase();

        const userRegion = isSyariah
            ? mapRegionSyariah(userData?.region)
            : userData?.region?.toUpperCase();

        /* =============================
           4️⃣ ROLE-BASED FILTER
        ============================== */
        if (userData?.akses === "MAO") {
            // MAO → NIK + PRODUCT + Nama
            const nikMatch =
                item["NIK (PIC)"]?.toUpperCase() === userData.nik?.toUpperCase();

            return productMatch && namaMatch && nikMatch;
        }

        if (userData?.akses === "SURVEYOR") {
            // SURVEYOR → PRODUCT + REGION + CABANG + Nama
            const regionMatch = itemRegion === userRegion;

            const cabangMatch =
                item["CABANG"]?.toUpperCase() === userData.cabang?.toUpperCase();

            return productMatch && namaMatch && regionMatch && cabangMatch;
        }

        /* =============================
           5️⃣ DEFAULT
        ============================== */
        return productMatch && namaMatch;
    });


    // console.log("product aktif" + activeProduct);
    // console.log(dataMA);
    // console.log(filteredMA);


    // 🔹 Saat memilih MA
    const handleSelectMA = (item) => {
        setForm((prev) => ({
            ...prev,
            namaMA: item[maField.nama] || "",
            noRef: item[maField.noRef] || "",
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
            (item) => item[maField.nama] === form.namaMA
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

            const SUBMIT_URL_KONVENSIONAL =
                "https://script.google.com/macros/s/AKfycbzQ4KweETqcsp1t0TGy-qbCiUWQHjs3yYgnZZvL2F8YQ8zMovyC9vJulb5QlEhlG_g_/exec";

            const SUBMIT_URL_SYARIAH =
                "https://script.google.com/macros/s/AKfycbx2XTPLSP5MKJoj3Aq-sFp-_HyDBUpUS8EU1IbSCahR65TlKnyKPP-8Rla2UL6irsY/exec";


            const submitURL = isSyariah
                ? SUBMIT_URL_SYARIAH
                : SUBMIT_URL_KONVENSIONAL;

            const response = await fetch(submitURL, {
                method: "POST",
                body: JSON.stringify(payload),
            });

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
                                <option value="MASKU">MASKU</option>
                                <option value="HAJIKU">HAJIKU</option>
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
                                                {item[maField.nama]}
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
                                {(isSyariah
                                    ? aktivitasListSyariah
                                    : aktivitasList
                                ).map((act, idx) => (
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
                            {...(!isSyariah && { capture: "environment" })}
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
