import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

export default function NewTicket() {
    const user = JSON.parse(sessionStorage.getItem("userData")) || {};
    const [form, setForm] = useState({
        product: "",
        kendalaSystem: "",
        subKendala: "",
        namaCustomer: "",
        custId: "",
        noKawanInternal: "KWN",
        taskIdPolo: "POL",
        dukcapil: "",
        negativeStatus: "",
        biometric: "",
        noOdr: "ODRNO",
        noApp: "APP",
        issueSummary: "",
        detailError: "",
        file: null,
    });

    const [errors, setErrors] = useState({});
    const [kendalaList, setKendalaList] = useState([]);
    const [subList, setSubList] = useState([]);
    const [loading, setLoading] = useState(false);

    // Ambil kendala dari apps script
    useEffect(() => {
        async function fetchKendala() {
            try {
                setLoading(true);
                const res = await fetch(
                    "https://script.google.com/macros/s/AKfycbyXGQZxpPWuNMR661Rev36OEiz5anP_jabIlcWdPr8j4K6WLpMIyFK4ysXGzJtXfUq_/exec"
                );
                const json = await res.json();
                if (json.data) setKendalaList(json.data);
            } catch (err) {
                console.error("Gagal mengambil data kendala:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchKendala();
    }, []);

    // update subList saat kendalaSystem berubah
    useEffect(() => {
        if (form.kendalaSystem) {
            const filtered = kendalaList.filter(
                (item) => item["Kendala System"] === form.kendalaSystem
            );
            setSubList(filtered.map((f) => f["Sub Kendala"]));
            setForm((prev) => ({ ...prev, subKendala: "" }));
        } else {
            setSubList([]);
        }
        // reset errors related to dynamic fields
        setErrors((prev) => ({
            ...prev,
            namaCustomer: false,
            custId: false,
            noKawanInternal: false,
            taskIdPolo: false,
            dukcapil: false,
            negativeStatus: false,
            biometric: false,
            noOdr: false,
            noApp: false,
        }));
    }, [form.kendalaSystem, kendalaList]);

    // helper: apakah kendalaSystem termasuk grup tertentu
    const isKI = (k) => String(k || "").toUpperCase() === "KI";
    const isAllEditableGroup = (k) =>
        ["MSS", "WISE", "POLO"].includes(String(k || "").toUpperCase());

    // helper: field editable logic
    const isEditable = (field) => {
        // always editable
        if (["product", "kendalaSystem", "subKendala", "issueSummary", "detailError", "file"].includes(field)) return true;

        // kendala dependent
        if (isKI(form.kendalaSystem)) {
            return ["namaCustomer", "custId", "noKawanInternal"].includes(field);
        }
        if (isAllEditableGroup(form.kendalaSystem)) {
            // all fields editable for MSS/WISE/POLO
            return true;
        }
        // default: disabled
        return false;
    };

    // required fields depending on kendalaSystem
    const baseRequired = ["issueSummary", "detailError", "kendalaSystem", "subKendala", "file"];
    const dynamicRequired = () => {
        if (isKI(form.kendalaSystem)) {
            return ["namaCustomer"]; // only namaCustomer required
        }
        if (isAllEditableGroup(form.kendalaSystem)) {
            // all editable except custId and noApp are NOT required
            return [
                "namaCustomer",
                // "noKawanInternal",
                "taskIdPolo",
                "dukcapil",
                "negativeStatus",
                "biometric",
                "noOdr",
            ];
        }
        // default: no extra required
        return [];
    };

    // validate a single field for realtime validation
    const validateField = (name, value) => {
        const required = [...baseRequired, ...dynamicRequired()];
        if (required.includes(name)) {
            const ok = value !== null && String(value || "").trim() !== "";
            setErrors((prev) => ({ ...prev, [name]: !ok }));
            if (!ok) {
                // show small toast but not spamming: use short toast
                toast.error(`${labelFor(name)} wajib diisi`, { duration: 2000 });
            } else {
                setErrors((prev) => ({ ...prev, [name]: false }));
            }
            return ok;
        } else {
            // clear error if not required
            setErrors((prev) => ({ ...prev, [name]: false }));
            return true;
        }
    };

    // mapping field name -> pretty label
    const labelFor = (name) => {
        const map = {
            product: "Product",
            kendalaSystem: "Kendala System",
            subKendala: "Sub Kendala",
            namaCustomer: "Nama Customer",
            custId: "Cust ID",
            noKawanInternal: "No Kawan Internal",
            taskIdPolo: "Task ID POLO",
            dukcapil: "Dukcapil",
            negativeStatus: "Negative Status",
            biometric: "Biometric",
            noOdr: "No ODR",
            noApp: "No APP",
            issueSummary: "Issue Summary",
            detailError: "Summary Error",
            file: "Foto",
        };
        return map[name] || name;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // PREFIX RULES
        const prefixRules = {
            noKawanInternal: "KWN",
            taskIdPolo: "POL",
            noOdr: "ODRNO",
            noApp: "APP"
        };

        if (prefixRules[name]) {
            const prefix = prefixRules[name];

            // Jika user menghapus prefix → tetap dipaksa ada prefix
            let newValue = value.startsWith(prefix)
                ? value
                : prefix + value.replace(prefix, "");

            // Hilangkan semua karakter selain angka setelah prefix
            newValue = prefix + newValue.replace(prefix, "").replace(/[^0-9]/g, "");

            setForm((prev) => ({
                ...prev,
                [name]: newValue,
            }));
            return;
        }

        setForm((prev) => ({ ...prev, [name]: value }));
        // realtime validate only if field is editable
        if (isEditable(name)) validateField(name, value);
    };

    const handleFileChange = (e) => {
        setForm((prev) => ({ ...prev, file: e.target.files[0] }));
    };

    // build final required list for submit time
    const getAllRequired = () => {
        return [...new Set([...baseRequired, ...dynamicRequired()])];
    };

    const cleanPrefix = (value, prefix) => {
        if (!value) return "";
        const trimmed = String(value).trim();
        return trimmed === prefix ? "" : trimmed;
    };

    const isValidWithPrefix = (value, prefix) => {
        if (!value) return false;
        const v = String(value).trim();
        if (!v.startsWith(prefix)) return false;
        const numberPart = v.replace(prefix, "");
        return numberPart.length > 0; // WAJIB ada angka
    };

    // 📌 Fungsi compress image menggunakan Canvas
    const compressImage = (file, quality = 0.6, maxWidth = 1500) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;

                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");

                    let width = img.width;
                    let height = img.height;

                    // Resize jika terlalu besar
                    if (width > maxWidth) {
                        height = (maxWidth / width) * height;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert ke kualitas lebih rendah
                    const compressedBase64 = canvas.toDataURL("image/jpeg", quality);

                    resolve(compressedBase64);
                };
            };
        });
    };

    // on submit validate everything
    const handleSubmit = async (e) => {
        e.preventDefault();

        // validate base + dynamic required
        const required = getAllRequired();
        let hasError = false;

        required.forEach((field) => {
            let ok = true;
            const value = form[field];

            // 🔴 VALIDASI KHUSUS PREFIX
            // if (field === "noKawanInternal") {
            //     ok = isValidWithPrefix(value, "KWN");
            // }
            // else 
            if (field === "taskIdPolo") {
                ok = isValidWithPrefix(value, "POL");
            }
            else if (field === "noOdr") {
                ok = isValidWithPrefix(value, "ODRNO");
            }
            else {
                ok = value !== null && String(value || "").trim() !== "";
            }

            setErrors((prev) => ({ ...prev, [field]: !ok }));
            if (!ok) hasError = true;
        });

        if (!form.file) {
            setErrors((prev) => ({ ...prev, file: true }));
            toast.error("Foto/Video wajib diupload");
            return;
        }

        if (hasError) {
            const firstInvalid = required.find((field) => {
                const value = form[field];

                // 🔴 Validasi field dengan prefix
                // if (field === "noKawanInternal") {
                //     return !isValidWithPrefix(value, "KWN");
                // }
                if (field === "taskIdPolo") {
                    return !isValidWithPrefix(value, "POL");
                }
                if (field === "noOdr") {
                    return !isValidWithPrefix(value, "ODRNO");
                }

                // 🔵 Validasi default (kosong / spasi)
                return value === null || String(value || "").trim() === "";
            });

            toast.error(
                `Field wajib belum lengkap: ${labelFor(firstInvalid)}`,
                { duration: 3000 }
            );
            return;
        }

        // proceed submit
        // setLoading(true);
        Swal.fire({
            title: "Mengirim Ticket...",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

        try {
            let fileBase64 = "";
            if (form.file) {
                // 👉 Compress foto ukuran max width 900px & kualitas 60%
                fileBase64 = await compressImage(form.file, 0.7, 900);
            }

            const regionURL = {
                "JABODEBEK": "https://script.google.com/macros/s/AKfycbwuAzYY_l3A6py5GBQ37oWFYf2p5meQUeJEwwkD_vrfZAdWYiM1dkIhOiiF6LHER3nXvA/exec",
                "JABODEBEK 1": "https://script.google.com/macros/s/AKfycbwuAzYY_l3A6py5GBQ37oWFYf2p5meQUeJEwwkD_vrfZAdWYiM1dkIhOiiF6LHER3nXvA/exec",
                "JABODEBEK 2": "https://script.google.com/macros/s/AKfycbwuAzYY_l3A6py5GBQ37oWFYf2p5meQUeJEwwkD_vrfZAdWYiM1dkIhOiiF6LHER3nXvA/exec",
                "JABODEBEK 3": "https://script.google.com/macros/s/AKfycbwuAzYY_l3A6py5GBQ37oWFYf2p5meQUeJEwwkD_vrfZAdWYiM1dkIhOiiF6LHER3nXvA/exec",
                "BANTEN": "https://script.google.com/macros/s/AKfycbxjCJw_WnqDBvw1EDU0DJtpOo8SKXVdFXXlSmKXwfRHz0ejvLplKd2IqQu6TssYn-qn/exec",
                "BANTEN 1": "https://script.google.com/macros/s/AKfycbxjCJw_WnqDBvw1EDU0DJtpOo8SKXVdFXXlSmKXwfRHz0ejvLplKd2IqQu6TssYn-qn/exec",
                "BANTEN 2": "https://script.google.com/macros/s/AKfycbxjCJw_WnqDBvw1EDU0DJtpOo8SKXVdFXXlSmKXwfRHz0ejvLplKd2IqQu6TssYn-qn/exec",
                "JABAR": "https://script.google.com/macros/s/AKfycbzpuBwUM9BrbWUJaJpAIfa6idk23QlA5HXACj6fnkMnynX5eHiwrqufXyVrMr-ctA9F/exec",
                "JABAR 1": "https://script.google.com/macros/s/AKfycbzpuBwUM9BrbWUJaJpAIfa6idk23QlA5HXACj6fnkMnynX5eHiwrqufXyVrMr-ctA9F/exec",
                "JABAR 2": "https://script.google.com/macros/s/AKfycbzpuBwUM9BrbWUJaJpAIfa6idk23QlA5HXACj6fnkMnynX5eHiwrqufXyVrMr-ctA9F/exec",
                "JATENGUT": "https://script.google.com/macros/s/AKfycbzB-P-QOZvstvzo4i0THRmKkD0umq63EdFwsHJYzwnWW14rMsVz5u9Gc6llnxdPxoTa/exec",
                "JATENGUT 1": "https://script.google.com/macros/s/AKfycbzB-P-QOZvstvzo4i0THRmKkD0umq63EdFwsHJYzwnWW14rMsVz5u9Gc6llnxdPxoTa/exec",
                "JATENGUT 2": "https://script.google.com/macros/s/AKfycbzB-P-QOZvstvzo4i0THRmKkD0umq63EdFwsHJYzwnWW14rMsVz5u9Gc6llnxdPxoTa/exec",
                "JATENGSEL": "https://script.google.com/macros/s/AKfycbzHCcJ5skJpcmfIzKZtrNh6gHb1UFBsQWQMA8Tpv5lsb5EitsZbFhFUjncEpXreWiHu/exec",
                "JATENGSEL 1": "https://script.google.com/macros/s/AKfycbzHCcJ5skJpcmfIzKZtrNh6gHb1UFBsQWQMA8Tpv5lsb5EitsZbFhFUjncEpXreWiHu/exec",
                "JATENGSEL 2": "https://script.google.com/macros/s/AKfycbzHCcJ5skJpcmfIzKZtrNh6gHb1UFBsQWQMA8Tpv5lsb5EitsZbFhFUjncEpXreWiHu/exec",
                "JATIM": "https://script.google.com/macros/s/AKfycbwNkmlnY28Y2uMDRzDq0BgoUL2Dr40Y7-88fXcSmKWC7YBVTq9kBhKoA2mUA9-MReK0YA/exec",
                "JATIM 1": "https://script.google.com/macros/s/AKfycbwNkmlnY28Y2uMDRzDq0BgoUL2Dr40Y7-88fXcSmKWC7YBVTq9kBhKoA2mUA9-MReK0YA/exec",
                "JATIM 2": "https://script.google.com/macros/s/AKfycbwNkmlnY28Y2uMDRzDq0BgoUL2Dr40Y7-88fXcSmKWC7YBVTq9kBhKoA2mUA9-MReK0YA/exec",
                "JATIM 3": "https://script.google.com/macros/s/AKfycbwNkmlnY28Y2uMDRzDq0BgoUL2Dr40Y7-88fXcSmKWC7YBVTq9kBhKoA2mUA9-MReK0YA/exec",
                "JATIM 5": "https://script.google.com/macros/s/AKfycbwNkmlnY28Y2uMDRzDq0BgoUL2Dr40Y7-88fXcSmKWC7YBVTq9kBhKoA2mUA9-MReK0YA/exec",
                "SUMBAGUT": "https://script.google.com/macros/s/AKfycby3ymWyp3igyUqgrkpFIxRzI_rNHQb5kl40FrBc1wYBqm6heVHadJoldR5fdX1Gchx3LQ/exec",
                "SUMBAGUT 1": "https://script.google.com/macros/s/AKfycby3ymWyp3igyUqgrkpFIxRzI_rNHQb5kl40FrBc1wYBqm6heVHadJoldR5fdX1Gchx3LQ/exec",
                "SUMBAGUT 2": "https://script.google.com/macros/s/AKfycby3ymWyp3igyUqgrkpFIxRzI_rNHQb5kl40FrBc1wYBqm6heVHadJoldR5fdX1Gchx3LQ/exec",
                "SUMBAGSEL": "https://script.google.com/macros/s/AKfycbytOMXXHgf2cgFxRW9BrT_SL9eDJVGyrwFiC7hImZzMLObcDieSPDLRDEq_srjtHq4/exec",
                "SUMBAGSEL 1": "https://script.google.com/macros/s/AKfycbytOMXXHgf2cgFxRW9BrT_SL9eDJVGyrwFiC7hImZzMLObcDieSPDLRDEq_srjtHq4/exec",
                "SUMBAGSEL 2": "https://script.google.com/macros/s/AKfycbytOMXXHgf2cgFxRW9BrT_SL9eDJVGyrwFiC7hImZzMLObcDieSPDLRDEq_srjtHq4/exec",
                "KALIMANTAN": "https://script.google.com/macros/s/AKfycbzKI-DEyu6SjUBa_IvmCC9W8WugwaIRAWi0pyyz11eiNx-A3NcmccFO1MDVcZAYeTPX/exec",
                "SULAWESI": "https://script.google.com/macros/s/AKfycbxUq7om3tkEg-Ho5oQUuNKQnVBWGEA1a61UIBIfGc9tMALuJ7-Rc6C83YEfhOvCcZRy2Q/exec",
                "SULAWESI 1": "https://script.google.com/macros/s/AKfycbxUq7om3tkEg-Ho5oQUuNKQnVBWGEA1a61UIBIfGc9tMALuJ7-Rc6C83YEfhOvCcZRy2Q/exec",
                "SULAWESI 2": "https://script.google.com/macros/s/AKfycbxUq7om3tkEg-Ho5oQUuNKQnVBWGEA1a61UIBIfGc9tMALuJ7-Rc6C83YEfhOvCcZRy2Q/exec"
            };

            const baseURL = regionURL[user.region] || "";

            const res = await fetch(baseURL,
                {
                    method: "POST",
                    body: JSON.stringify({
                        region: user.region || "-",
                        branch: user.cabang || "-",
                        product: form.product || user.product,
                        picInput: user.name || "-",
                        kendalaSystem: form.kendalaSystem,
                        subKendala: form.subKendala,
                        namaCustomer: form.namaCustomer,
                        custId: form.custId,

                        // ⬇️ Jadi kosong kalau hanya prefix
                        noKawanInternal: cleanPrefix(form.noKawanInternal, "KWN"),
                        taskIdPolo: cleanPrefix(form.taskIdPolo, "POL"),
                        dukcapil: form.dukcapil,
                        negativeStatus: form.negativeStatus,
                        biometric: form.biometric,
                        noOdr: cleanPrefix(form.noOdr, "ODRNO"),
                        noApp: cleanPrefix(form.noApp, "APP"),

                        detailError: form.detailError,
                        file: fileBase64,
                        filename: form.file?.name || "",
                        issueSummary: form.issueSummary.toUpperCase(),
                        userNik: "'" + user.nik || "-",
                        userName: user.name || "-",
                        position: user.position || "-",
                    }),
                }
            );

            const json = await res.json();
            if (json.success) {
                Swal.fire({
                    title: "Berhasil!",
                    text: "Ticket berhasil dibuat No " + json.ticketId + ".",
                    icon: "success",
                    confirmButtonText: "OK",
                }).then(() => {
                    window.location.href = "/dashboard/ticket";
                });
            } else {
                Swal.fire("Gagal", json.message || "Terjadi kesalahan.", "error");
            }
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Gagal mengirim ticket.", "error");
        }
    };

    const inputStyle = (field) => {
        const disabled = !isEditable(field);

        return `
        w-full rounded-lg p-2 border 
        ${errors[field] ? "border-red-500" : "border-gray-300"}
        ${disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}
    `;
    }

    // ⏳ Loading Fullscreen
    if (loading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-[9999]">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-md max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-indigo-700">📝 New Ticket</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <h2 className="text-lg font-semibold text-gray-700 mb-3">Ticket Info</h2>

                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Product (hidden if user.product !== ALL BRAND) */}
                        <div hidden={user.product !== "ALL BRAND"}>
                            <label className="block text-sm font-medium mb-1">
                                Product <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="product"
                                value={form.product}
                                onChange={handleChange}
                                className={inputStyle("product")}
                                disabled={!isEditable("product")}
                            >
                                <option value="">Pilih Product</option>
                                <option value="REGULER">MOTOR BARU</option>
                                <option value="MOTORKU">MOTORKU</option>
                                <option value="MOBILKU">MOBILKU</option>
                                <option value="MASKU">MASKU</option>
                                <option value="HAJIKU">HAJIKU</option>
                            </select>
                        </div>

                        {/* Kendala System */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Kendala System <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="kendalaSystem"
                                value={form.kendalaSystem}
                                onChange={handleChange}
                                className={inputStyle("kendalaSystem")}
                            >
                                <option value="">Pilih Kendala</option>
                                {[...new Set(kendalaList.map((k) => k["Kendala System"]))].map(
                                    (system, idx) => (
                                        <option key={idx} value={system}>
                                            {system}
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        {/* Sub Kendala */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Sub Kendala <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="subKendala"
                                value={form.subKendala}
                                onChange={handleChange}
                                disabled={!form.kendalaSystem}
                                className={inputStyle("subKendala")}
                            >
                                <option value="">Pilih Sub Kendala</option>
                                {subList.map((sub, i) => (
                                    <option key={i} value={sub}>
                                        {sub}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Nama Customer */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Nama Customer {dynamicRequired().includes("namaCustomer") && <span className="text-red-500">*</span>}
                            </label>
                            <input
                                type="text"
                                name="namaCustomer"
                                value={form.namaCustomer}
                                onChange={handleChange}
                                className={inputStyle("namaCustomer")}
                                disabled={!isEditable("namaCustomer")}
                            />
                        </div>

                        {/* Cust ID */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Cust ID {isAllEditableGroup(form.kendalaSystem) ? <span className="text-gray-400 text-xs">(opsional)</span> : null}
                            </label>
                            <input
                                type="text"
                                name="custId"
                                value={form.custId}
                                onChange={handleChange}
                                className={inputStyle("custId")}
                                disabled={!isEditable("custId")}
                            />
                        </div>

                        {/* No Kawan Internal */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                No Kawan Internal {isAllEditableGroup(form.kendalaSystem) ? <span className="text-gray-400 text-xs">(opsional)</span> : null}
                            </label>
                            <input
                                type="text"
                                name="noKawanInternal"
                                value={form.noKawanInternal}
                                onChange={handleChange}
                                className={inputStyle("noKawanInternal")}
                                disabled={!isEditable("noKawanInternal")}
                            />
                        </div>

                        {/* Task ID POLO */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Task ID POLO {dynamicRequired().includes("taskIdPolo") && <span className="text-red-500">*</span>}
                            </label>
                            <input
                                type="text"
                                name="taskIdPolo"
                                value={form.taskIdPolo}
                                onChange={handleChange}
                                className={inputStyle("taskIdPolo")}
                                disabled={!isEditable("taskIdPolo")}
                            />
                        </div>

                        {/* Dukcapil */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Dukcapil {dynamicRequired().includes("dukcapil") && <span className="text-red-500">*</span>}
                            </label>
                            <select
                                name="dukcapil"
                                value={form.dukcapil}
                                onChange={handleChange}
                                className={inputStyle("dukcapil")}
                                disabled={!isEditable("dukcapil")}
                            >
                                <option value="">Pilih</option>
                                <option value="Match">Match</option>
                                <option value="Not Match">Not Match</option>
                                <option value="Not Found">Not Found</option>
                            </select>
                        </div>

                        {/* Negative Status */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Negative Status {dynamicRequired().includes("negativeStatus") && <span className="text-red-500">*</span>}
                            </label>
                            <select
                                name="negativeStatus"
                                value={form.negativeStatus}
                                onChange={handleChange}
                                className={inputStyle("negativeStatus")}
                                disabled={!isEditable("negativeStatus")}
                            >
                                <option value="">Pilih</option>
                                <option value="Match">Match</option>
                                <option value="Not Match">Not Match</option>
                            </select>
                        </div>

                        {/* Biometric */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Biometric {dynamicRequired().includes("biometric") && <span className="text-red-500">*</span>}
                            </label>
                            <select
                                name="biometric"
                                value={form.biometric}
                                onChange={handleChange}
                                className={inputStyle("biometric")}
                                disabled={!isEditable("biometric")}
                            >
                                <option value="">Pilih</option>
                                <option value="Match">Match</option>
                                <option value="Not Match">Not Match</option>
                            </select>
                        </div>

                        {/* No ODR */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                No ODR {dynamicRequired().includes("noOdr") && <span className="text-red-500">*</span>}
                            </label>
                            <input
                                type="text"
                                name="noOdr"
                                value={form.noOdr}
                                onChange={handleChange}
                                className={inputStyle("noOdr")}
                                disabled={!isEditable("noOdr")}
                            />
                        </div>

                        {/* No APP */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                No APP {isAllEditableGroup(form.kendalaSystem) ? <span className="text-gray-400 text-xs">(opsional)</span> : null}
                            </label>
                            <input
                                type="text"
                                name="noApp"
                                value={form.noApp}
                                onChange={handleChange}
                                className={inputStyle("noApp")}
                                disabled={!isEditable("noApp")}
                            />
                        </div>
                    </div>
                </div>

                {/* DETAILS */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-700 mb-3">Ticket Details</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Issue Summary <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="issueSummary"
                                value={form.issueSummary}
                                onChange={handleChange}
                                className={`${inputStyle("issueSummary")} uppercase`}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Summary Error <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="detailError"
                                value={form.detailError}
                                onChange={handleChange}
                                rows="3"
                                className={`${inputStyle("detailError")} resize-none`}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Upload File</label>
                            <input type="file" onChange={handleFileChange} className="w-full border rounded-lg p-2 text-sm" />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {loading ? "Mengirim..." : "Kirim Ticket"}
                    </button>
                </div>
            </form>
        </div>
    );
}
