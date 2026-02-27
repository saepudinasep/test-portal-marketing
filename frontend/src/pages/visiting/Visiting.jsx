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
    const [searchKeyword, setSearchKeyword] = useState("");

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
        penawaran_product: "",
        penawaran_product_cust: ""
    });

    const hasilList = ["Bertemu", "Tidak Bertemu"];
    const isInjectManual = form.sumberData === "INJECT MANUAL";

    // Opsi dinamis
    const aktivitasTidakBertemu = [
        "Rumah Kosong",
        "Alamat Pindah",
        "Titip Surat Penawaran",
    ];
    const aktivitasTidakBertemuSyariah = [
        "Rumah kosong",
        "Bertemu keluarga/ART/Satpam",
        "Alamat tidak sesuai"
    ];
    const bertemuDenganList = ["Pemohon", "Pasangan"];
    const hasilBertemuList = ["Prospek", "Interest", "Tidak Berminat"];
    const hasilBertemuListSyariah = [
        "Berminat",
        "Pikir-Pikir",
        "Tidak Berminat",
    ];
    const keteranganTidakBerminat = [
        "Angsuran Mahal",
        "Persyaratan Rumit",
        "Pencairan Tidak Sesuai",
        "Tidak Ingin Mengajukan Kembali",
        "Sedang Tidak Membutuhkan Dana",
        "Sudah Dapat Dana",
    ];
    const keteranganTidakBerminatSyariah = [
        "Pricing",
        "Ada kebutuhan lain",
    ];
    const keteranganPikirSyariah = [
        "Pricing",
        "Diskusi dengan keluarga/pasangan",
    ];
    const keteranganInterest = [
        "Konfirmasi Pasangan/Keluarga",
        "Nego Angsuran",
        "Nego Pencairan",
        "Unit Diluar Kota",
    ];

    const penawaranProductCust = [
        "Bersedia",
        "Tidak Bersedia",
        "Tidak dilakukan penawaran karena tidak bertemu",
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

        const URL_MOTOR_MOBIL =
            "https://script.google.com/macros/s/AKfycbxn3OYbv4SedQKbVlkP1Yn10O2S8nNWtfH7wvCTmtF68op9GWPo5Dwh-16r2eK_MjV2/exec";

        const URL_HAJI_MASK =
            "https://script.google.com/macros/s/AKfycbz8JNLWHBkXo1XNM9RsH3Dlw5OCLWpmsvTuAslZ9XILUNUB6Q5dvoEiGfu1QxW2auJl/exec";

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

        const regionMotorMobil = parsedUser.region;                // asli
        const regionSyariah = mapRegionSyariah(parsedUser.region); // hasil mapping
        const product = parsedUser.product?.toUpperCase();

        setLoading(true);

        let fetchPromises = [];

        // MOTORKU & MOBILKU → region asli
        if (product === "MOTORKU" || product === "MOBILKU") {
            fetchPromises = [
                fetch(
                    `${URL_MOTOR_MOBIL}?region=${regionMotorMobil}&cabang=${parsedUser.cabang}`
                ).then((res) => res.json()),
            ];
        }

        // HAJIKU & MASKU → region hasil mapping
        else if (product === "HAJIKU" || product === "MASKU" ||
            product === "ALL SYARIAH") {
            fetchPromises = [
                fetch(
                    `${URL_HAJI_MASK}?region=${regionSyariah}&cabang=${parsedUser.cabang}`
                ).then((res) => res.json()),
            ];
        }

        // ALL BRAND → gabungkan dua sumber + dua region
        else if (product === "ALL BRAND") {
            fetchPromises = [
                // MOTOR & MOBIL
                fetch(
                    `${URL_MOTOR_MOBIL}?region=${regionMotorMobil}&cabang=${parsedUser.cabang}`
                ).then((res) => res.json()),

                // MASKU & HAJIKU
                fetch(
                    `${URL_HAJI_MASK}?region=${regionSyariah}&cabang=${parsedUser.cabang}`
                ).then((res) => res.json()),
            ];
        }

        Promise.all(fetchPromises)
            .then((results) => {
                const mergedData = results
                    .flatMap((res) => res?.data || [])
                    .map((item) => ({
                        ...item,
                        product: item["PRODUCT"]?.toUpperCase() || "",
                        sumberData: item["SUMBER DATA"]?.toUpperCase() || "",
                    }));

                setDataKontrak(mergedData);
            })
            .catch((err) => {
                console.error("Error fetching kontrak:", err);
            })
            .finally(() => setLoading(false));

    }, [navigate]);

    // 🔍 Filter hasil pencarian No Kontrak
    // const filteredKontrak = dataKontrak.filter((item) => {
    //     const matchNoKontrak = item["NO KONTRAK"]
    //         ?.toUpperCase()
    //         .includes(form.noKontrak.toUpperCase());

    //     const matchSumberData = form.sumberData
    //         ? item.sumberData === form.sumberData.toUpperCase()
    //         : true;

    //     const matchProduct = form.product
    //         ? form.product === "ALL SYARIAH"
    //             ? ["MASKU", "HAJIKU"].includes(item.product)
    //             : item.product === form.product.toUpperCase()
    //         : true;

    //     return matchNoKontrak && matchSumberData && matchProduct;
    // });

    const filteredKontrak = dataKontrak.filter((item) => {
        const keyword = searchKeyword.toUpperCase().trim();

        const matchKeyword =
            item["NO KONTRAK"]?.toUpperCase().includes(keyword) ||
            item["NAMA KONSUMEN"]?.toUpperCase().includes(keyword);

        const matchSumberData = form.sumberData
            ? item.sumberData === form.sumberData.toUpperCase()
            : true;

        const matchProduct = form.product
            ? form.product === "ALL SYARIAH"
                ? ["MASKU", "HAJIKU"].includes(item.product)
                : item.product === form.product.toUpperCase()
            : true;

        return matchKeyword && matchSumberData && matchProduct;
    });

    const sumberDataOptions = {
        "MOTORKU": [
            "MOTOR PRIORITY 1",
            "MOTOR PRIORITY 2",
            "MOTOR PRIORITY 3",
        ],
        "MOBILKU": [
            "MOBIL PRIORITY 1",
            "MOBIL PRIORITY 2",
            "MOBIL PRIORITY 3",
        ],
        "MASKU": [
            "INJECT OLEH HO",
            "INJECT MANUAL",
        ],
        "HAJIKU": [
            "INJECT OLEH HO",
            "INJECT MANUAL",
        ],
        "ALL SYARIAH": [
            "INJECT OLEH HO",
            "INJECT MANUAL",
        ],
    };

    const selectedProduct =
        userData?.product === "ALL BRAND"
            ? form.product                // user pilih product
            : userData?.product;          // product fixed sesuai user

    const activeProduct = form.sumberData !== "" && selectedProduct !== "";

    const isSyariah =
        ["MASKU", "HAJIKU", "ALL SYARIAH"].includes(selectedProduct);
    const isMobilMotor = ["MOBILKU", "MOTORKU", "MOTOR BARU"].includes(selectedProduct);

    // 🔹 Saat memilih kontrak
    // const handleSelectKontrak = (item) => {
    //     setForm((prev) => ({
    //         ...prev,
    //         noKontrak: item["NO KONTRAK"],
    //         namaDebitur: item["NAMA KONSUMEN"] || "",
    //         sumberData: (item["SUMBER DATA"] || "").toUpperCase(),
    //         product: (item["PRODUCT"] || "").toUpperCase(),
    //         ket: item["KETERANGAN"] || "",
    //     }));
    //     setShowDropdown(false);
    // };

    const handleSelectKontrak = (item) => {
        setForm((prev) => ({
            ...prev,
            noKontrak: item["NO KONTRAK"],
            namaDebitur: item["NAMA KONSUMEN"] || "",
            sumberData: (item["SUMBER DATA"] || "").toUpperCase(),
            product: (item["PRODUCT"] || "").toUpperCase(),
            ket: item["KETERANGAN"] || "",
            penawaran_product: item["PENAWARAN PRODUK"] || "",
        }));

        setSearchKeyword(
            `${item["NO KONTRAK"]} - ${item["NAMA KONSUMEN"]}`
        );

        setShowDropdown(false);
    };

    // 🔹 Input berubah
    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => {
            let updated = { ...prev, [name]: value };

            /* =============================
               1️⃣ GANTI PRODUCT (ALL BRAND)
            ============================== */
            if (name === "product" && userData?.product === "ALL BRAND") {
                updated.sumberData = "";
                updated.noKontrak = "";
                updated.namaDebitur = "";
                updated.ket = "";

                // reset field turunan
                updated.hasil = "";
                updated.aktivitas = "";
                updated.keterangan = "";
            }

            /* =============================
               2️⃣ GANTI SUMBER DATA
            ============================== */
            if (name === "sumberData") {
                updated.noKontrak = "";
                updated.namaDebitur = "";
                updated.ket = "";
                updated.penawaran_product = "";

                // ❗ INJECT MANUAL tidak boleh ALL SYARIAH
                if (
                    value === "INJECT MANUAL" &&
                    updated.product === "ALL SYARIAH"
                ) {
                    updated.product = "MASKU"; // default aman
                }

                // reset hasil & aktivitas
                updated.hasil = "";
                updated.aktivitas = "";
                updated.keterangan = "";
            }

            /* =============================
               3️⃣ GANTI HASIL VISIT
            ============================== */
            if (name === "hasil") {
                updated.aktivitas = "";
                updated.keterangan = "";
            }

            /* =============================
               4️⃣ GANTI AKTIVITAS
            ============================== */
            if (name === "aktivitas") {
                updated.keterangan = "";
            }

            return updated;
        });

        // Tutup dropdown pencarian kontrak
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

        if (w < 240) return 14;      // Ultra tiny (feature phone / mini Android ekstrem)
        if (w < 360) return 20;      // Extra small (HP mini)
        if (w < 480) return 24;      // Small mobile
        if (w < 640) return 28;      // Mobile
        if (w < 1024) return 38;     // Tablet
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

        /* =============================
           1️⃣ VALIDASI FIELD WAJIB UMUM
        ============================== */
        const requiredFields = {
            product: "Product",
            sumberData: "Sumber Data",
            noKontrak: "No Kontrak",
            namaDebitur: "Nama Debitur",
            hasil: "Hasil Visit",
            detail: "Notes Visit",
        };

        /* =============================
            VALIDASI SYARIAH ATAU BUKAN
        ============================== */
        // if (!isSyariah) {
        //     Swal.fire({
        //         icon: "warning",
        //         title: "Form Belum Lengkap",
        //         text: `Visit Sudah Di Tutup Silahkan Hubungi Admin!`,
        //     });
        //     return;
        // }

        /* =============================
           2️⃣ VALIDASI BERDASARKAN HASIL
        ============================== */
        if (form.hasil === "Tidak Bertemu") {
            requiredFields.aktivitas = "Aktivitas Visit";
        }

        if (form.hasil === "Bertemu") {

            // ❗ NO HP WAJIB HANYA NON-SYARIAH
            if (!isSyariah) {
                requiredFields.noHp = "No HP Konsumen";
                requiredFields.bertemuDengan = "Bertemu Dengan";
            }

            if (
                ["Interest", "Tidak Berminat", "Pikir-Pikir"].includes(form.aktivitas)
            ) {
                requiredFields.keterangan = "Keterangan";
            }
        }

        /* =============================
           3️⃣ PRIORITY 3
        ============================== */
        if (
            form.sumberData === "MOBIL PRIORITY 3" ||
            form.sumberData === "MOTOR PRIORITY 3"
        ) {
            requiredFields.statusKonsumen = "Status Konsumen";
        }

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

        /* =============================
        5️⃣ VALIDASI NO KONTRAK
        ============================= */
        if (form.sumberData === "INJECT MANUAL") {
            const noKontrak = form.noKontrak?.trim();
            const namaDebitur = form.namaDebitur?.trim();

            // 🔹 Wajib isi
            if (!noKontrak) {
                Swal.fire({
                    icon: "warning",
                    title: "No Kontrak Wajib Diisi",
                    text: "Untuk Inject Manual, No Kontrak tidak boleh kosong.",
                });
                return;
            }

            // 🔹 Harus angka saja
            if (!/^\d+$/.test(noKontrak)) {
                Swal.fire({
                    icon: "warning",
                    title: "No Kontrak Tidak Valid",
                    text: "No Kontrak harus berupa angka saja.",
                });
                return;
            }

            // 🔹 Harus tepat 16 digit
            if (noKontrak.length !== 16) {
                Swal.fire({
                    icon: "warning",
                    title: "Format Tidak Sesuai",
                    text: "No Kontrak harus tepat 16 digit.",
                });
                return;
            }

            // 🔹 Optional: tidak boleh diawali 0
            if (noKontrak.startsWith("0")) {
                Swal.fire({
                    icon: "warning",
                    title: "Format Tidak Valid",
                    text: "No Kontrak tidak boleh diawali angka 0.",
                });
                return;
            }

            // 🔹 Nama wajib isi
            if (!namaDebitur) {
                Swal.fire({
                    icon: "warning",
                    title: "Nama Debitur Wajib Diisi",
                    text: "Nama Debitur tidak boleh kosong untuk Inject Manual.",
                });
                return;
            }

            // 🔹 Minimal 3 karakter
            if (namaDebitur.length < 3) {
                Swal.fire({
                    icon: "warning",
                    title: "Nama Terlalu Pendek",
                    text: "Nama Debitur minimal 3 karakter.",
                });
                return;
            }

        } else {
            const noKontrak = form.noKontrak?.trim();
            const namaDebitur = form.namaDebitur?.trim();

            // 🔹 Pastikan tidak kosong
            if (!noKontrak) {
                Swal.fire({
                    icon: "error",
                    title: "No Kontrak Kosong",
                    text: "Silakan pilih No Kontrak dari daftar.",
                });
                return;
            }

            if (!namaDebitur) {
                Swal.fire({
                    icon: "error",
                    title: "Nama Debitur Kosong",
                    text: "Silakan pilih data kontrak yang valid.",
                });
                return;
            }

            // 🔹 Cari kontrak sesuai kombinasi lengkap
            const selectedKontrak = dataKontrak.find(
                (item) =>
                    item["NO KONTRAK"]?.toUpperCase().trim() === noKontrak.toUpperCase() &&
                    item["NAMA KONSUMEN"]?.toUpperCase().trim() === namaDebitur.toUpperCase() &&
                    item.sumberData === form.sumberData?.toUpperCase() &&
                    item.product === form.product?.toUpperCase()
            );

            if (!selectedKontrak) {
                Swal.fire({
                    icon: "error",
                    title: "Data Tidak Valid",
                    text: "Kontrak tidak ditemukan atau tidak sesuai dengan filter yang dipilih.",
                });
                return;
            }
        }

        /* =============================
           6️⃣ VALIDASI DETAIL VISIT
        ============================== */
        const words = form.detail.trim().split(/\s+/);
        if (words.length < 5) {
            Swal.fire({
                icon: "warning",
                title: "Detail Terlalu Singkat",
                text: "Detail visit minimal 5 kata!",
            });
            return;
        }

        if (!/^[A-Za-z]{5}/.test(form.detail.substring(0, 5))) {
            Swal.fire({
                icon: "warning",
                title: "Format Detail Salah",
                text: "5 karakter awal harus huruf tanpa angka atau simbol!",
            });
            return;
        }

        /* =============================
           7️⃣ VALIDASI NO HP
        ============================== */
        if (!isSyariah && form.noHp) {
            if (form.noHp.length < 11 || form.noHp.length > 13) {
                Swal.fire({
                    icon: "warning",
                    title: "No HP Tidak Valid",
                    text: "No HP harus 11–13 digit!",
                });
                return;
            }
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

        /* =============================
           9️⃣ PREPARE PAYLOAD
        ============================== */
        const statusMap = {
            Pil1: "No HP Konsumen sama dengan data di WISe dan Bersedia Di Lakukan Penawaran",
            Pil2: "No HP Konsumen sama dengan data di WISe dan Tidak Bersedia Di Lakukan Penawaran",
            Pil3: "No HP Konsumen berganti dan CMO melakukan pengkinian data pada Form Perubahan Data Konsumen",
        };

        const payload = {
            ...form,
            sumberData: form.sumberData.toUpperCase(),
            product: selectedProduct,
            statusKonsumen: statusMap[form.statusKonsumen] || "",
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

            const SUBMIT_URL_KONVENSIONAL =
                "https://script.google.com/macros/s/AKfycbxeJKJRfFx4zQwm-7GhMgv62EkqzaCnVnYJ-R3UngHOu3vUQzblVPsq8DTPKLcvcx2v/exec";

            const SUBMIT_URL_SYARIAH =
                "https://script.google.com/macros/s/AKfycbwDEpYs5LODd3OmWRmiiRmTMnoILr4dwPWAj7YRe1TKNrkNTDYTp69RW-QEDtMzUqhg4g/exec";


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
                    title: "Data Visit Berhasil Disimpan",
                    text: result.message,
                    confirmButtonColor: "#16a34a",
                });

                // 🔁 RESET FORM AMAN
                setForm({
                    region: userData?.region || "",
                    cabang: userData?.cabang || "",
                    picVisit: userData?.name || "",
                    nik: userData?.nik || "",
                    jabatan: userData?.position || "",
                    product: userData?.product !== "ALL BRAND"
                        ? userData?.product
                        : "",
                    sumberData: "",
                    noKontrak: "",
                    namaDebitur: "",
                    hasil: "",
                    aktivitas: "",
                    bertemuDengan: "",
                    keterangan: "",
                    noHp: "",
                    detail: "",
                    statusKonsumen: "",
                    ket: "",
                    penawaran_product: "",
                    penawaran_product_cust: ""
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
                                        <option value="MASKU">MASKU</option>
                                        <option value="HAJIKU">HAJIKU</option>
                                        <option value="ALL SYARIAH">ALL SYARIAH</option>
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
                    <div className="grid md:grid-cols-1 gap-4">
                        <div className="relative dropdown-kontrak">
                            <label className="block text-sm font-medium mb-1">
                                Search No Kontrak - Nama Debitur
                            </label>

                            {/* <input
                                type="text"
                                placeholder={
                                    isInjectManual
                                        ? "Masukkan No Kontrak"
                                        : !activeProduct
                                            ? "Pilih Sumber Data atau Product terlebih dahulu"
                                            : "Cari No Kontrak atau Nama Debitur..."
                                }
                                value={form.noKontrak}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        noKontrak: e.target.value,
                                    }))
                                }
                                onFocus={() => {
                                    if (activeProduct && !isInjectManual) setShowDropdown(true);
                                }}
                                className={`w-full border rounded-lg p-2 uppercase transition ${!activeProduct
                                    ? "bg-gray-100 cursor-not-allowed text-gray-500"
                                    : "bg-white"
                                    }`}
                                readOnly={!activeProduct || isInjectManual === false ? false : false}
                            /> */}

                            <input
                                type="text"
                                placeholder={
                                    isInjectManual
                                        ? "Masukkan No Kontrak"
                                        : !activeProduct
                                            ? "Pilih Sumber Data atau Product terlebih dahulu"
                                            : "Cari No Kontrak atau Nama Debitur..."
                                }
                                value={searchKeyword}
                                onChange={(e) => {
                                    setSearchKeyword(e.target.value);
                                    if (!isInjectManual) setShowDropdown(true);
                                }}
                                onFocus={() => {
                                    if (activeProduct && !isInjectManual) setShowDropdown(true);
                                }}
                                className={`w-full border rounded-lg p-2 uppercase transition ${!activeProduct
                                    ? "bg-gray-100 cursor-not-allowed text-gray-500"
                                    : "bg-white"
                                    }`}
                            />

                            {/* Dropdown hanya untuk NON inject manual */}
                            {!isInjectManual && form.sumberData && showDropdown && (
                                <ul className="absolute z-10 bg-white border rounded-lg w-full max-h-48 overflow-y-auto shadow-md mt-1">
                                    {filteredKontrak.length > 0 ? (
                                        filteredKontrak.map((item, idx) => (
                                            <li
                                                key={idx}
                                                onClick={() => handleSelectKontrak(item)}
                                                className="px-3 py-2 hover:bg-indigo-100 cursor-pointer text-sm"
                                            >
                                                {/* {item["NO KONTRAK"]} */}
                                                {item["NO KONTRAK"]} - {item["NAMA KONSUMEN"]}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="px-3 py-2 text-gray-500 text-sm">Tidak ditemukan</li>
                                    )}
                                </ul>
                            )}
                        </div>


                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                No Kontrak
                            </label>
                            <input
                                type="number"
                                name="noKontrak"
                                value={form.noKontrak}
                                onChange={handleChange}
                                className={`w-full border rounded-lg p-2 ${isInjectManual ? "bg-white" : "bg-gray-100"
                                    }`}
                                readOnly={!isInjectManual}
                                required
                            />
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
                                className={`w-full border rounded-lg p-2 ${isInjectManual ? "bg-white" : "bg-gray-100"
                                    }`}
                                readOnly={!isInjectManual}
                                required
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
                            className="w-full border rounded-lg p-2 bg-gray-100 resize-none text-sm"
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
                                {(isSyariah
                                    ? aktivitasTidakBertemuSyariah
                                    : aktivitasTidakBertemu
                                ).map((act, idx) => (
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
                            {isMobilMotor && (
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
                            )}

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
                                    {(isSyariah
                                        ? hasilBertemuListSyariah
                                        : hasilBertemuList
                                    ).map((b, idx) => (
                                        <option key={idx} value={b}>
                                            {b}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Nomor HP */}
                            {isMobilMotor && (
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
                            )}

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
                                        {(isSyariah
                                            ? keteranganTidakBerminatSyariah
                                            : keteranganTidakBerminat
                                        ).map((k, idx) => (
                                            <option key={idx} value={k}>
                                                {k}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {form.aktivitas === "Pikir-Pikir" && isSyariah && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Keterangan Pikir-Pikir
                                    </label>
                                    <select
                                        name="keterangan"
                                        value={form.keterangan}
                                        onChange={handleChange}
                                        className="w-full border rounded-lg p-2"
                                    >
                                        <option value="">Pilih Keterangan</option>
                                        {keteranganPikirSyariah.map((k, idx) => (
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


                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Penawaran Product
                                </label>
                                <textarea
                                    value={form.penawaran_product}
                                    rows={Math.min(estimatedRows, MAX_ROWS)}
                                    className="w-full border rounded-lg p-2 bg-gray-100 resize-none text-sm"
                                    readOnly
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Apakah bersedia di visit Kembali?
                                </label>
                                <select
                                    name="penawaran_product_cust"
                                    value={form.penawaran_product_cust}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg p-2"
                                >
                                    <option value="">Pilih Penawaran</option>
                                    {penawaranProductCust.map((k, idx) => (
                                        <option key={idx} value={k}>
                                            {k}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {form.penawaran_product_cust === "Tidak Bersedia" && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Notes : Jika dilakukan revisit kembali maka field ini diisi sesuai ketersediaan konsumen bersedia dilakukan penawaran atau tidak
                                    </label>
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
