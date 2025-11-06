import { useState, useEffect } from "react";
import Swal from "sweetalert2";

export default function NewTicket() {
    const user = JSON.parse(sessionStorage.getItem("userData")) || {};
    const [form, setForm] = useState({
        product: "",
        kendalaSystem: "",
        subKendala: "",
        namaCustomer: "",
        custId: "",
        noKawanInternal: "",
        taskIdPolo: "",
        dukcapil: "",
        negativeStatus: "",
        biometric: "",
        noOdr: "",
        noApp: "",
        issueSummary: "",
        detailError: "",
        file: null,
    });

    const [kendalaList, setKendalaList] = useState([]);
    const [subList, setSubList] = useState([]);
    const [loading, setLoading] = useState(false);

    // 🔹 Ambil list kendala dari Apps Script
    useEffect(() => {
        async function fetchKendala() {
            try {
                const res = await fetch(
                    "https://script.google.com/macros/s/AKfycbxip4b63sk6jJxSj4Y5rrT9eV9_vupUacRgX3umRGjBeGrA0937BJJslD-3690k2AVk/exec"
                );
                const json = await res.json();
                if (json.data) setKendalaList(json.data);
            } catch (err) {
                console.error("Gagal mengambil data kendala:", err);
            }
        }
        fetchKendala();
    }, []);

    // 🔹 Update subkendala ketika kendala berubah
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
    }, [form.kendalaSystem, kendalaList]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleFileChange = (e) => {
        setForm({ ...form, file: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // if (!form.product || !form.kendalaSystem || !form.issueSummary) {
        //     Swal.fire("Oops!", "Lengkapi data wajib terlebih dahulu.", "warning");
        //     return;
        // }

        setLoading(true);
        Swal.fire({
            title: "Mengirim Ticket...",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

        try {
            let fileBase64 = "";
            if (form.file) {
                fileBase64 = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (ev) => resolve(ev.target.result);
                    reader.readAsDataURL(form.file);
                });
            }

            const res = await fetch(
                "https://script.google.com/macros/s/AKfycbyw6sR7sEJD4Bsb2lmNSt9qPoqnCTy8kzWuKKc4vRPtbEvJ80xz9nQgMTkc_aKXPpalCw/exec",
                {
                    method: "POST",
                    // headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        action: "createTicket",
                        region: user.region || "-",
                        branch: user.cabang || "-",
                        product: form.product || user.product,
                        picInput: user.name || "-",
                        kendalaSystem: form.kendalaSystem,
                        subKendala: form.subKendala,
                        namaCustomer: form.namaCustomer,
                        custId: form.custId,
                        noKawanInternal: form.noKawanInternal,
                        taskIdPolo: form.taskIdPolo,
                        dukcapil: form.dukcapil,
                        negativeStatus: form.negativeStatus,
                        biometric: form.biometric,
                        noOdr: form.noOdr,
                        noApp: form.noApp,
                        detailError: form.detailError,
                        file: fileBase64,
                        filename: form.file?.name || "",
                        issueSummary: form.issueSummary,
                        userNik: "'" + user.nik || "-",
                        userName: user.name || "-",
                        position: user.position || "-",
                    }),
                }
            );

            const json = await res.json();
            if (json.success) {
                console.log(json);
                Swal.fire({
                    title: "Berhasil!",
                    text: "Ticket berhasil dibuat No " + json.ticketId + ".",
                    icon: "success",
                    confirmButtonText: "OK",
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Arahkan ke halaman Ticket
                        window.location.href = "/dashboard/ticket";
                        // atau jika kamu pakai react-router-dom v6:
                        // navigate("/dashboard/ticket");
                    }
                });
                setForm({
                    product: "",
                    kendalaSystem: "",
                    subKendala: "",
                    namaCustomer: "",
                    custId: "",
                    noKawanInternal: "",
                    taskIdPolo: "",
                    dukcapil: "",
                    negativeStatus: "",
                    biometric: "",
                    noOdr: "",
                    noApp: "",
                    issueSummary: "",
                    detailError: "",
                    file: null,
                });
            } else {
                Swal.fire("Gagal", json.message || "Terjadi kesalahan.", "error");
            }
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Gagal mengirim ticket.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-indigo-700">
                📝 New Ticket
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* === Ticket Info === */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-700 mb-3">
                        Ticket Info
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Product */}
                        <div hidden={user.product !== "ALL BRAND"}>
                            <label className="block text-sm font-medium mb-1">Product</label>
                            <select
                                name="product"
                                value={form.product}
                                onChange={handleChange}
                                className="w-full border rounded-lg p-2"
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
                            <label className="block text-sm font-medium mb-1">Kendala System</label>
                            <select
                                name="kendalaSystem"
                                value={form.kendalaSystem}
                                onChange={handleChange}
                                className="w-full border rounded-lg p-2"
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
                            <label className="block text-sm font-medium mb-1">Sub Kendala</label>
                            <select
                                name="subKendala"
                                value={form.subKendala}
                                onChange={handleChange}
                                disabled={!form.kendalaSystem}
                                className="w-full border rounded-lg p-2"
                            >
                                <option value="">
                                    {form.kendalaSystem ? "Pilih Kendala" : "Pilih Kendala"}
                                </option>
                                {subList.map((sub, i) => (
                                    <option key={i} value={sub}>
                                        {sub}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Nama Customer */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Nama Customer</label>
                            <input
                                type="text"
                                name="namaCustomer"
                                value={form.namaCustomer}
                                onChange={handleChange}
                                className="w-full border rounded-lg p-2"
                            />
                        </div>

                        {/* Cust ID */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Cust ID</label>
                            <input
                                type="text"
                                name="custId"
                                value={form.custId}
                                onChange={handleChange}
                                className="w-full border rounded-lg p-2"
                            />
                        </div>

                        {/* No Kawan Internal */}
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                No Kawan Internal
                            </label>
                            <input
                                type="text"
                                name="noKawanInternal"
                                value={form.noKawanInternal}
                                onChange={handleChange}
                                className="w-full border rounded-lg p-2"
                            />
                        </div>

                        {/* Task ID POLO */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Task ID POLO</label>
                            <input
                                type="text"
                                name="taskIdPolo"
                                value={form.taskIdPolo}
                                onChange={handleChange}
                                className="w-full border rounded-lg p-2"
                            />
                        </div>

                        {/* Dukcapil */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Dukcapil</label>
                            <select
                                name="dukcapil"
                                value={form.dukcapil}
                                onChange={handleChange}
                                className="w-full border rounded-lg p-2"
                            >
                                <option value="">Pilih</option>
                                <option value="Match">Match</option>
                                <option value="Not Match">Not Match</option>
                                <option value="Not Found">Not Found</option>
                            </select>
                        </div>

                        {/* Negative Status */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Negative Status</label>
                            <select
                                name="negativeStatus"
                                value={form.negativeStatus}
                                onChange={handleChange}
                                className="w-full border rounded-lg p-2"
                            >
                                <option value="">Pilih</option>
                                <option value="Match">Match</option>
                                <option value="Not Match">Not Match</option>
                            </select>
                        </div>

                        {/* Biometric */}
                        <div>
                            <label className="block text-sm font-medium mb-1">Biometric</label>
                            <select
                                name="biometric"
                                value={form.biometric}
                                onChange={handleChange}
                                className="w-full border rounded-lg p-2"
                            >
                                <option value="">Pilih</option>
                                <option value="Match">Match</option>
                                <option value="Not Match">Not Match</option>
                            </select>
                        </div>

                        {/* No ODR */}
                        <div>
                            <label className="block text-sm font-medium mb-1">No ODR</label>
                            <input
                                type="text"
                                name="noOdr"
                                value={form.noOdr}
                                onChange={handleChange}
                                className="w-full border rounded-lg p-2"
                            />
                        </div>

                        {/* No APP */}
                        <div>
                            <label className="block text-sm font-medium mb-1">No APP</label>
                            <input
                                type="text"
                                name="noApp"
                                value={form.noApp}
                                onChange={handleChange}
                                className="w-full border rounded-lg p-2"
                            />
                        </div>
                    </div>
                </div>

                {/* === Ticket Details === */}
                <div>
                    <h2 className="text-lg font-semibold text-gray-700 mb-3">
                        Ticket Details
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Issue Summary
                            </label>
                            <input
                                type="text"
                                name="issueSummary"
                                value={form.issueSummary}
                                onChange={handleChange}
                                className="w-full border rounded-lg p-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Summary Error
                            </label>
                            <textarea
                                name="detailError"
                                value={form.detailError}
                                onChange={handleChange}
                                rows="3"
                                className="w-full border rounded-lg p-2"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Upload File
                            </label>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                className="w-full border rounded-lg p-2 text-sm"
                            />
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
