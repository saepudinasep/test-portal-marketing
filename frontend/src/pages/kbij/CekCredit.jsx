import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function CekCredit() {
    const navigate = useNavigate();
    const isInit = useRef(true);

    const [userData, setUserData] = useState(null);
    const [isDirty, setIsDirty] = useState(false);
    const [results, setResults] = useState([]);
    const [loadingResult, setLoadingResult] = useState(false);

    const [form, setForm] = useState({
        brand: "",
        region: "",
        cabang: "",
        nikKaryawan: "",
        namaKaryawan: "",
        nikKtp: "",
        namaCustomer: "",
        tanggalLahir: "",
        searchNik: "",
    });

    /* ================= AUTH & PREFILL ================= */
    useEffect(() => {
        const user = sessionStorage.getItem("userData");
        const loggedIn = sessionStorage.getItem("loggedIn");

        if (!loggedIn || !user) {
            navigate("/dashboard");
            return;
        }

        const parsed = JSON.parse(user);
        setUserData(parsed);

        setForm((prev) => ({
            ...prev,
            brand: parsed.product || "",
            region: parsed.region || "",
            cabang: parsed.cabang || "",
            nikKaryawan: parsed.nik || "",
            namaKaryawan: parsed.name || "",
        }));

        setTimeout(() => (isInit.current = false), 0);
    }, [navigate]);

    /* ================= DIRTY CHECK ================= */
    useEffect(() => {
        if (isInit.current) return;

        const hasValue = Object.entries(form).some(
            ([key, value]) => key !== "searchNik" && value !== ""
        );

        setIsDirty(hasValue);
    }, [form]);

    /* ================= BEFORE UNLOAD ================= */
    useEffect(() => {
        const handler = (e) => {
            if (!isDirty) return;
            e.preventDefault();
            e.returnValue = "";
        };

        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [isDirty]);

    /* ================= SAFE NAVIGATE ================= */
    const safeNavigate = (path) => {
        if (!isDirty) return navigate(path);

        Swal.fire({
            title: "Form belum selesai",
            text: "Data belum disimpan. Yakin ingin meninggalkan halaman?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Ya, tinggalkan",
            cancelButtonText: "Batal",
        }).then((res) => {
            if (res.isConfirmed) navigate(path);
        });
    };

    /* ================= HANDLE CHANGE ================= */
    const handleChange = (e) => {
        const { name, value } = e.target;

        let newValue = value;

        // 🔒 Khusus NIK KTP → hanya angka, max 16 digit
        if (name === "nikKtp") {
            newValue = value.replace(/\D/g, "").slice(0, 16);
        }

        // 🔠 Uppercase field tertentu
        const upperFields = [
            "brand",
            "region",
            "cabang",
            "namaKaryawan",
            "namaCustomer",
        ];

        if (upperFields.includes(name)) {
            newValue = newValue.toUpperCase();
        }

        setForm((prev) => ({
            ...prev,
            [name]: newValue,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Siapkan payload
        const payload = {
            ...form,
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

            const regionURL = {
                "JABODEBEK": "https://script.google.com/macros/s/AKfycbycQrTHQAIfN4R8pSaQpTgFBGKgKrdKMjXBLld699mLIAK17pqvBFkO0RuuENSYwkXZEQ/exec",
                "JABODEBEK 1": "https://script.google.com/macros/s/AKfycbycQrTHQAIfN4R8pSaQpTgFBGKgKrdKMjXBLld699mLIAK17pqvBFkO0RuuENSYwkXZEQ/exec",
                "JABODEBEK 2": "https://script.google.com/macros/s/AKfycbycQrTHQAIfN4R8pSaQpTgFBGKgKrdKMjXBLld699mLIAK17pqvBFkO0RuuENSYwkXZEQ/exec",
                "JABODEBEK 3": "https://script.google.com/macros/s/AKfycbycQrTHQAIfN4R8pSaQpTgFBGKgKrdKMjXBLld699mLIAK17pqvBFkO0RuuENSYwkXZEQ/exec",

                "BANTEN": "https://script.google.com/macros/s/AKfycbynRphc4T6QZ-WGAi7pKkl7DmY5EWUOs3qbMuUvXr9UMdfgcUsSzxf0Y5HtInK42oIv/exec",
                "BANTEN 1": "https://script.google.com/macros/s/AKfycbynRphc4T6QZ-WGAi7pKkl7DmY5EWUOs3qbMuUvXr9UMdfgcUsSzxf0Y5HtInK42oIv/exec",
                "BANTEN 2": "https://script.google.com/macros/s/AKfycbynRphc4T6QZ-WGAi7pKkl7DmY5EWUOs3qbMuUvXr9UMdfgcUsSzxf0Y5HtInK42oIv/exec",

                "JABAR": "https://script.google.com/macros/s/AKfycbwG898tPY2Yr0u1bfQSn_TDyAM3RkFG4ijMJs6gWOm4aSYDaHl2st9FQJtx1O_2ej1SrQ/exec",
                "JABAR 1": "https://script.google.com/macros/s/AKfycbwG898tPY2Yr0u1bfQSn_TDyAM3RkFG4ijMJs6gWOm4aSYDaHl2st9FQJtx1O_2ej1SrQ/exec",
                "JABAR 2": "https://script.google.com/macros/s/AKfycbwG898tPY2Yr0u1bfQSn_TDyAM3RkFG4ijMJs6gWOm4aSYDaHl2st9FQJtx1O_2ej1SrQ/exec",

                "JATIM": "https://script.google.com/macros/s/AKfycbw1f834CJXuMdjwXgsAAmm8WlH6bCA3H-_udgAN7eCSZHIwt7D_lWv8Qs0KLAETD3ak/exec",
                "JATIM 1": "https://script.google.com/macros/s/AKfycbw1f834CJXuMdjwXgsAAmm8WlH6bCA3H-_udgAN7eCSZHIwt7D_lWv8Qs0KLAETD3ak/exec",
                "JATIM 2": "https://script.google.com/macros/s/AKfycbw1f834CJXuMdjwXgsAAmm8WlH6bCA3H-_udgAN7eCSZHIwt7D_lWv8Qs0KLAETD3ak/exec",
                "JATIM 3": "https://script.google.com/macros/s/AKfycbw1f834CJXuMdjwXgsAAmm8WlH6bCA3H-_udgAN7eCSZHIwt7D_lWv8Qs0KLAETD3ak/exec",
                "JATIM 5": "https://script.google.com/macros/s/AKfycbw1f834CJXuMdjwXgsAAmm8WlH6bCA3H-_udgAN7eCSZHIwt7D_lWv8Qs0KLAETD3ak/exec",

                "SULAWESI": "https://script.google.com/macros/s/AKfycbxvKzpr190HEg6H6k_rzZ92JNOeERRV9Oci2o-ojIf3b8WXx2CRCkZYXwInPqgwNQHb8w/exec",
                "SULAWESI 1": "https://script.google.com/macros/s/AKfycbxvKzpr190HEg6H6k_rzZ92JNOeERRV9Oci2o-ojIf3b8WXx2CRCkZYXwInPqgwNQHb8w/exec",
                "SULAWESI 2": "https://script.google.com/macros/s/AKfycbxvKzpr190HEg6H6k_rzZ92JNOeERRV9Oci2o-ojIf3b8WXx2CRCkZYXwInPqgwNQHb8w/exec",

                "JATENGUT": "https://script.google.com/macros/s/AKfycbzVLYGoiXg8BSlf1tObcIs5R8QH-ct99eFEMJpm9rO4KREiSpmrtV2rFpnqlYysLG37Yg/exec",
                "JATENGUT 1": "https://script.google.com/macros/s/AKfycbzVLYGoiXg8BSlf1tObcIs5R8QH-ct99eFEMJpm9rO4KREiSpmrtV2rFpnqlYysLG37Yg/exec",
                "JATENGUT 2": "https://script.google.com/macros/s/AKfycbzVLYGoiXg8BSlf1tObcIs5R8QH-ct99eFEMJpm9rO4KREiSpmrtV2rFpnqlYysLG37Yg/exec",

                "JATENGSEL": "https://script.google.com/macros/s/AKfycbyFnCWF-whERgwLTxDFJ97a7r5qbkGSh_y7X3R1ra9py6KrmYPeJxjglMvL5ZTcMH4S/exec",
                "JATENGSEL 1": "https://script.google.com/macros/s/AKfycbyFnCWF-whERgwLTxDFJ97a7r5qbkGSh_y7X3R1ra9py6KrmYPeJxjglMvL5ZTcMH4S/exec",
                "JATENGSEL 2": "https://script.google.com/macros/s/AKfycbyFnCWF-whERgwLTxDFJ97a7r5qbkGSh_y7X3R1ra9py6KrmYPeJxjglMvL5ZTcMH4S/exec",

                "SUMBAGUT": "https://script.google.com/macros/s/AKfycbxtVq8U8wV15CX4nUV-y2s_9shsS1O98B-fihD8-ar2XYMc4U9K3j12S5gbO5AvlEzaDg/exec",
                "SUMBAGUT 1": "https://script.google.com/macros/s/AKfycbxtVq8U8wV15CX4nUV-y2s_9shsS1O98B-fihD8-ar2XYMc4U9K3j12S5gbO5AvlEzaDg/exec",
                "SUMBAGUT 2": "https://script.google.com/macros/s/AKfycbxtVq8U8wV15CX4nUV-y2s_9shsS1O98B-fihD8-ar2XYMc4U9K3j12S5gbO5AvlEzaDg/exec",

                "SUMBAGSEL": "https://script.google.com/macros/s/AKfycbxnRMj6KK8JDw_bjavOhHntWoKeYadvFDz8xGhH3yOQvxY5YiBds1Ib9a5QPHnv8CaW8g/exec",
                "SUMBAGSEL 1": "https://script.google.com/macros/s/AKfycbxnRMj6KK8JDw_bjavOhHntWoKeYadvFDz8xGhH3yOQvxY5YiBds1Ib9a5QPHnv8CaW8g/exec",
                "SUMBAGSEL 2": "https://script.google.com/macros/s/AKfycbxnRMj6KK8JDw_bjavOhHntWoKeYadvFDz8xGhH3yOQvxY5YiBds1Ib9a5QPHnv8CaW8g/exec",

                "KALIMANTAN": "https://script.google.com/macros/s/AKfycbynZgUx1XqpE3DqC878UY-Ju8O9KB8xlWDHQpoJyCoPtzIH2_P5bGtrvjB-a5SggPi-kA/exec",
            };

            const baseURL = regionURL[userData.region] || "";

            const response = await fetch(
                baseURL,
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
                    brand: userData.product || "",
                    region: userData.region || "",
                    cabang: userData.cabang || "",
                    nikKaryawan: userData.nik || "",
                    namaKaryawan: userData.name || "",

                    nikKtp: "",
                    namaCustomer: "",
                    tanggalLahir: "",
                    searchNik: "",
                });
            } else {
                // 🔴 DUPLIKASI NIK
                if (
                    result.message &&
                    result.message.toLowerCase().includes("nik")
                ) {
                    Swal.fire({
                        icon: "error",
                        title: "NIK Sudah Pernah Diajukan",
                        text: result.message,
                        confirmButtonColor: "#dc2626",
                    });
                    return;
                }

                // 🟡 ERROR LAIN (limit MA, dsb)
                Swal.fire({
                    icon: "warning",
                    title: "Tidak Bisa Disimpan",
                    text: result.message || "Permintaan tidak dapat diproses.",
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

    /* ================= SEARCH ================= */
    const handleSearch = async () => {
        if (!form.searchNik) {
            Swal.fire("Oops", "Masukkan NIK KTP terlebih dahulu", "warning");
            return;
        }

        if (form.searchNik.length !== 16) {
            Swal.fire("Oops", "NIK harus 16 digit", "warning");
            return;
        }

        try {
            const regionURL = {
                "JABODEBEK": "https://script.google.com/macros/s/AKfycbwFHvOJCHZ9AC9cSx0Tq32bqtpA-J-QvjqE9hZcsRckll0fb7naMuZWudQPv1D0nkiSyw/exec",
                "JABODEBEK 1": "https://script.google.com/macros/s/AKfycbwFHvOJCHZ9AC9cSx0Tq32bqtpA-J-QvjqE9hZcsRckll0fb7naMuZWudQPv1D0nkiSyw/exec",
                "JABODEBEK 2": "https://script.google.com/macros/s/AKfycbwFHvOJCHZ9AC9cSx0Tq32bqtpA-J-QvjqE9hZcsRckll0fb7naMuZWudQPv1D0nkiSyw/exec",
                "JABODEBEK 3": "https://script.google.com/macros/s/AKfycbwFHvOJCHZ9AC9cSx0Tq32bqtpA-J-QvjqE9hZcsRckll0fb7naMuZWudQPv1D0nkiSyw/exec",

                "BANTEN": "https://script.google.com/macros/s/AKfycbyVS69gSJ6gMItsV-LRRQFvc3kQx_bAsXvFZbgjHSQXRJkcmhly42SN78OQ7yOr3FF-9g/exec",
                "BANTEN 1": "https://script.google.com/macros/s/AKfycbyVS69gSJ6gMItsV-LRRQFvc3kQx_bAsXvFZbgjHSQXRJkcmhly42SN78OQ7yOr3FF-9g/exec",
                "BANTEN 2": "https://script.google.com/macros/s/AKfycbyVS69gSJ6gMItsV-LRRQFvc3kQx_bAsXvFZbgjHSQXRJkcmhly42SN78OQ7yOr3FF-9g/exec",

                "JABAR": "https://script.google.com/macros/s/AKfycbxvzSo4ry1KqijsoMaK2fIPj81pf8lH0iSAjek7V0g5lpWcYAPQZ8rxitFuqUpcu0qU/exec",
                "JABAR 1": "https://script.google.com/macros/s/AKfycbxvzSo4ry1KqijsoMaK2fIPj81pf8lH0iSAjek7V0g5lpWcYAPQZ8rxitFuqUpcu0qU/exec",
                "JABAR 2": "https://script.google.com/macros/s/AKfycbxvzSo4ry1KqijsoMaK2fIPj81pf8lH0iSAjek7V0g5lpWcYAPQZ8rxitFuqUpcu0qU/exec",

                "JATIM": "https://script.google.com/macros/s/AKfycbxthAhXauP8Ts7qcdqWDzGCPRDuqtJMW6yxFCjSHT6wfE8j2bEW6ot6XUmAXDsosHv-/exec",
                "JATIM 1": "https://script.google.com/macros/s/AKfycbxthAhXauP8Ts7qcdqWDzGCPRDuqtJMW6yxFCjSHT6wfE8j2bEW6ot6XUmAXDsosHv-/exec",
                "JATIM 2": "https://script.google.com/macros/s/AKfycbxthAhXauP8Ts7qcdqWDzGCPRDuqtJMW6yxFCjSHT6wfE8j2bEW6ot6XUmAXDsosHv-/exec",
                "JATIM 3": "https://script.google.com/macros/s/AKfycbxthAhXauP8Ts7qcdqWDzGCPRDuqtJMW6yxFCjSHT6wfE8j2bEW6ot6XUmAXDsosHv-/exec",
                "JATIM 5": "https://script.google.com/macros/s/AKfycbxthAhXauP8Ts7qcdqWDzGCPRDuqtJMW6yxFCjSHT6wfE8j2bEW6ot6XUmAXDsosHv-/exec",

                "SULAWESI": "https://script.google.com/macros/s/AKfycbwhx7XqTKoC0lQnM2g-yqcO31KgSdhbl4gdcSXrNZK5d-AHJmByfv4h55y0_3qpgkKz/exec",
                "SULAWESI 1": "https://script.google.com/macros/s/AKfycbwhx7XqTKoC0lQnM2g-yqcO31KgSdhbl4gdcSXrNZK5d-AHJmByfv4h55y0_3qpgkKz/exec",
                "SULAWESI 2": "https://script.google.com/macros/s/AKfycbwhx7XqTKoC0lQnM2g-yqcO31KgSdhbl4gdcSXrNZK5d-AHJmByfv4h55y0_3qpgkKz/exec",

                "JATENGUT": "https://script.google.com/macros/s/AKfycbz-0-S1dB5dplUZLriYgws3lyzzmetu5CCIUvtKXnWL2MM5AEIPO7TnrAF1Z6WWZ10F/exec",
                "JATENGUT 1": "https://script.google.com/macros/s/AKfycbz-0-S1dB5dplUZLriYgws3lyzzmetu5CCIUvtKXnWL2MM5AEIPO7TnrAF1Z6WWZ10F/exec",
                "JATENGUT 2": "https://script.google.com/macros/s/AKfycbz-0-S1dB5dplUZLriYgws3lyzzmetu5CCIUvtKXnWL2MM5AEIPO7TnrAF1Z6WWZ10F/exec",

                "JATENGSEL": "https://script.google.com/macros/s/AKfycbyJXX3wDvtFpfuzPu0BpvwbHzTylHs9Y61dThLjCInTaoqDcvVXOtEeyI-sWmtTYUQY/exec",
                "JATENGSEL 1": "https://script.google.com/macros/s/AKfycbyJXX3wDvtFpfuzPu0BpvwbHzTylHs9Y61dThLjCInTaoqDcvVXOtEeyI-sWmtTYUQY/exec",
                "JATENGSEL 2": "https://script.google.com/macros/s/AKfycbyJXX3wDvtFpfuzPu0BpvwbHzTylHs9Y61dThLjCInTaoqDcvVXOtEeyI-sWmtTYUQY/exec",

                "SUMBAGUT": "https://script.google.com/macros/s/AKfycbwMvlW4eMfwkWYJEniquYvNS94r9YMcSOX7yzviSEyscrhS5FFUs5X3LIT_UTgDai6LcA/exec",
                "SUMBAGUT 1": "https://script.google.com/macros/s/AKfycbwMvlW4eMfwkWYJEniquYvNS94r9YMcSOX7yzviSEyscrhS5FFUs5X3LIT_UTgDai6LcA/exec",
                "SUMBAGUT 2": "https://script.google.com/macros/s/AKfycbwMvlW4eMfwkWYJEniquYvNS94r9YMcSOX7yzviSEyscrhS5FFUs5X3LIT_UTgDai6LcA/exec",

                "SUMBAGSEL": "https://script.google.com/macros/s/AKfycbzpwjhYS-TD73pqWhj6S8rfCVZGADivBpulVrpEVuNIHw6qo1oaCAwYH5KAZhprYlW7pQ/exec",
                "SUMBAGSEL 1": "https://script.google.com/macros/s/AKfycbzpwjhYS-TD73pqWhj6S8rfCVZGADivBpulVrpEVuNIHw6qo1oaCAwYH5KAZhprYlW7pQ/exec",
                "SUMBAGSEL 2": "https://script.google.com/macros/s/AKfycbzpwjhYS-TD73pqWhj6S8rfCVZGADivBpulVrpEVuNIHw6qo1oaCAwYH5KAZhprYlW7pQ/exec",

                "KALIMANTAN": "https://script.google.com/macros/s/AKfycbyP2dikM_roVchctXSIznZ_q7Qg44sRxQVOae3A_k1o-OUAN6zyImRNpdxU8AMP1oCq/exec",
            };

            const baseURL = regionURL[userData.region] || "";

            setLoadingResult(true);
            setResults([]);

            const res = await fetch(
                `${baseURL}?nik=${encodeURIComponent(form.searchNik)}`
            );

            const json = await res.json();

            if (!json.data || json.data.length === 0) {
                Swal.fire("Info", "Data tidak ditemukan", "info");
                return;
            }

            // Mapping sesuai table
            const mapped = json.data.map((item) => ({
                nama: item["Nama Customer"],
                result: item["Result KBIJ"],
                kol: item["KOL"],
            }));

            setResults(mapped);

        } catch (err) {
            Swal.fire("Error", "Gagal mengambil data", "error");
            console.error(err);
        } finally {
            setLoadingResult(false);
        }
    };

    return (
        <>
            {/* LOADING OVERLAY */}
            {loadingResult && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-[9999]">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent"></div>
                </div>
            )}
            <div className="min-h-screen bg-slate-100 p-4">
                <div className="max-w-6xl mx-auto space-y-8">

                    {/* ================= FORM ================= */}
                    <div className="bg-white rounded-xl shadow border">
                        <div className="bg-blue-600 text-white text-center py-3 rounded-t-xl">
                            FORM PERMINTAAN CEK BIRO KREDIT
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="p-6 space-y-6">
                                <SectionTitle title="Request By" />



                                <div className="grid md:grid-cols-3 gap-4">
                                    {userData?.product === "ALL BRAND" && (
                                        <FormSelect
                                            label="Brand"
                                            name="brand"
                                            value={form.brand}
                                            onChange={handleChange}
                                        >
                                            <option value="">Pilih Brand</option>
                                            <option value="REGULER">REGULER</option>
                                            <option value="MOTORKU">MOTORKU</option>
                                            <option value="MOBILKU">MOBILKU</option>
                                        </FormSelect>
                                    )}

                                    <FormInput label="Region" value={form.region} readOnly />
                                    <FormInput label="Cabang" value={form.cabang} readOnly />
                                    <FormInput label="NIK Karyawan" value={form.nikKaryawan} readOnly />
                                    <FormInput label="Nama Karyawan" value={form.namaKaryawan} readOnly />
                                </div>

                                <SectionTitle title="Data Pemohon" />

                                <div className="grid md:grid-cols-3 gap-4">
                                    {/* NIK KTP */}
                                    <div className="flex flex-col gap-1">
                                        <FormInput
                                            label="NIK KTP"
                                            name="nikKtp"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={form.nikKtp}
                                            onChange={handleChange}
                                            placeholder="16 digit NIK"
                                        />

                                        {form.nikKtp.length > 0 && form.nikKtp.length < 16 && (
                                            <p className="text-xs text-red-500">
                                                NIK harus 16 digit
                                            </p>
                                        )}
                                    </div>

                                    {/* Nama Customer */}
                                    <FormInput
                                        label="Nama Customer"
                                        name="namaCustomer"
                                        type="text"
                                        value={form.namaCustomer}
                                        onChange={handleChange}
                                        placeholder="Sesuai KTP"
                                    />

                                    {/* Tanggal Lahir */}
                                    <FormInput
                                        label="Tanggal Lahir"
                                        type="date"
                                        name="tanggalLahir"
                                        value={form.tanggalLahir}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <button
                                        onClick={() => safeNavigate("/dashboard")}
                                        className="px-4 py-2 border rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button className="px-5 py-2 bg-blue-600 text-white rounded-lg">
                                        Submit
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* ================= RESULT CARD ================= */}
                    <div className="bg-white rounded-xl shadow border p-6 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <h2 className="text-lg font-semibold text-slate-700">
                                Result Biro Kredit
                            </h2>

                            <div className="flex gap-2 w-full md:w-auto">
                                <input
                                    name="searchNik"
                                    value={form.searchNik}
                                    onChange={handleChange}
                                    placeholder="Cari NIK KTP"
                                    className="border rounded-lg px-3 py-2 text-sm w-full md:w-56"
                                />
                                <button
                                    onClick={handleSearch}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
                                >
                                    Cari
                                </button>
                                <button
                                    onClick={() => {
                                        setForm((p) => ({ ...p, searchNik: "" }));
                                        setResults([]);
                                    }}
                                    className="px-4 py-2 border rounded-lg text-sm"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>

                        {/* TABLE */}
                        <div className="relative overflow-x-auto border rounded-xl shadow-sm bg-white">
                            <table className="min-w-[720px] w-full text-sm">
                                {/* TABLE HEAD */}
                                <thead className="bg-slate-100 text-slate-600 uppercase text-xs sticky top-0 z-10">
                                    <tr>
                                        <th className="px-4 py-3 text-center font-semibold w-12 whitespace-nowrap">
                                            No
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold w-72 whitespace-nowrap">
                                            Nama Customer
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold w-48 whitespace-nowrap">
                                            Result KBIJ
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold w-96 whitespace-nowrap">
                                            KOL
                                        </th>
                                    </tr>
                                </thead>

                                {/* TABLE BODY */}
                                <tbody className="divide-y">
                                    {loadingResult ? (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="text-center py-12 text-slate-400"
                                            >
                                                Mengambil data...
                                            </td>
                                        </tr>
                                    ) : results.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="text-center py-12"
                                            >
                                                <div className="flex flex-col items-center gap-2 text-slate-500">
                                                    <span className="text-sm">
                                                        Belum ada data
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        results.map((r, i) => (
                                            <tr
                                                key={i}
                                                className="hover:bg-blue-50 transition-colors"
                                            >
                                                <td className="px-4 py-3 text-center whitespace-nowrap">
                                                    {i + 1}
                                                </td>

                                                <td className="px-4 py-3 whitespace-nowrap max-w-xs truncate">
                                                    {r.nama}
                                                </td>

                                                <td className="px-4 py-3 font-semibold whitespace-nowrap">
                                                    {r.result}
                                                </td>

                                                <td className="px-4 py-3 font-semibold whitespace-nowrap">
                                                    {r.kol}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

/* ================= COMPONENTS ================= */

function SectionTitle({ title }) {
    return (
        <h3 className="text-sm font-semibold text-slate-600 uppercase">
            {title}
        </h3>
    );
}

function FormInput({ label, ...props }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">{label}</label>
            <input {...props} className="border rounded-lg px-3 py-2 text-sm" />
        </div>
    );
}

function FormSelect({ label, children, ...props }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">{label}</label>
            <select {...props} className="border rounded-lg px-3 py-2 text-sm bg-white">
                {children}
            </select>
        </div>
    );
}
