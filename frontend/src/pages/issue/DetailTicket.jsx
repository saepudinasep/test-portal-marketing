import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
// import { useNavigate } from "react-router-dom";

export default function DetailTicket() {
    // const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const region = searchParams.get("region");
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chat, setChat] = useState([]);
    const [statusTicket, setStatusTicket] = useState("");
    const [statusSolved, setStatusSolved] = useState("");
    const [reasonReject, setReasonReject] = useState("");
    const [message, setMessage] = useState("");
    const [file, setFile] = useState(null);

    const user = JSON.parse(sessionStorage.getItem("userData")) || {};
    const isHeadOffice =
        user?.region?.toLowerCase() === "kantor pusat" &&
        user?.cabang?.toLowerCase() === "kantor pusat";

    // === Fetch Detail Ticket ===
    useEffect(() => {
        async function fetchTicket() {
            try {
                const res = await fetch(
                    `https://script.google.com/macros/s/AKfycbwATI3cgS_1BITlLplk50GQPYU_ESmERZjW7Oj1MaJeDSB49Yyzx0cG1LcjpQJ4Iuse/exec?action=getTicket&id=${id}`
                );
                const json = await res.json();
                const dataTicket = json.data;
                const dataChat = json.chat;
                setTicket(dataTicket);
                setChat(dataChat);
                console.log("Detail Ticket:", dataTicket);
                console.log("Chat History:", dataChat);
            } catch (error) {
                Swal.fire("Error", "Gagal memuat detail ticket", "error");
                console.error("Gagal memuat tiket:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchTicket();
    }, [id]);

    // === Autofill dropdown dari tiket ===
    useEffect(() => {
        if (ticket) {
            setStatusTicket(ticket["StatusTicket"] || "");
            setStatusSolved(ticket["StatusSolved"] || "");
        }
    }, [ticket]);

    if (loading)
        return (<div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
        </div>);

    if (!ticket)
        return (
            <p className="text-center py-6 text-red-500">
                Ticket tidak ditemukan.
            </p>
        );

    // === Compress Image Menggunakan Canvas ===
    const compressImage = (file, quality = 0.7, maxWidth = 900) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);

            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;

                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");

                    let width = img.width;
                    let height = img.height;

                    if (width > maxWidth) {
                        height = (maxWidth / width) * height;
                        width = maxWidth;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);

                    const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
                    resolve(compressedBase64);
                };
            };
        });
    };

    // === Upload file base64 ke Apps Script + Compress ===
    const uploadFileBase = async (file, folderUrl) => {
        try {
            // 👉 1. Compress dulu
            const compressedBase64 = await compressImage(file, 0.6, 1500);

            // 👉 2. Ambil base64 saja tanpa prefix
            const pureBase64 = compressedBase64.split(",")[1];

            // 👉 3. Upload ke Apps Script
            const res = await fetch(
                "https://script.google.com/macros/s/AKfycbwATI3cgS_1BITlLplk50GQPYU_ESmERZjW7Oj1MaJeDSB49Yyzx0cG1LcjpQJ4Iuse/exec",
                {
                    method: "POST",
                    body: JSON.stringify({
                        action: "uploadFileBase",
                        folderUrl,
                        filename: file.name,
                        filedata: pureBase64,
                    }),
                }
            );

            const json = await res.json();
            if (json.success) return json.fileUrl;

            throw new Error(json.message || "Upload gagal");
        } catch (err) {
            console.error("Upload error:", err);
            throw err;
        }
    };

    // === Fungsi submit chat ===
    const handleSubmitChat = async () => {
        if (!message.trim()) {
            Swal.fire("Oops", "Isi pesan dulu", "warning");
            return;
        }

        Swal.fire({
            title: "Mengirim...",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });

        try {
            let uploadedFileUrl = "";
            if (file) {
                uploadedFileUrl = await uploadFileBase(file, ticket["LinkFolderTicket"]);
            }

            const resChat = await fetch(
                "https://script.google.com/macros/s/AKfycbwATI3cgS_1BITlLplk50GQPYU_ESmERZjW7Oj1MaJeDSB49Yyzx0cG1LcjpQJ4Iuse/exec",
                {
                    method: "POST",
                    // headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        action: "sendChat",
                        ticketId: id,
                        sender: user.name,
                        senderNIK: "'" + user.nik,
                        role: user.position,
                        cabang: user.cabang,
                        message,
                        file: uploadedFileUrl,
                    }),
                }
            );

            const data = await resChat.json();
            if (data.success) {
                Swal.fire({
                    title: "Berhasil!",
                    text: "Pesan terkirim.",
                    icon: "success",
                    confirmButtonText: "OK",
                }).then(() => {
                    // navigate(`/dashboard/ticket/${id}`);
                    window.location.href = `/dashboard/ticket/${id}`;
                });

                setMessage("");
                setFile(null);
            } else {
                Swal.fire("Error", "Gagal kirim chat", "error");
            }
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Gagal upload/kirim chat", "error");
        }
    };

    // === Fungsi update status (Head Office) ===
    const handleUpdateStatus = async () => {
        let uploadedFileUrl = "";
        if (file) {
            uploadedFileUrl = await uploadFileBase(file, ticket["LinkFolderTicket"]);
        }

        if (statusTicket.toLowerCase() === "reject" && !reasonReject.trim()) {
            Swal.fire("Oops", "Isi reason reject", "warning");
            return;
        }

        Swal.fire({
            title: "Menyimpan...",
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading(),
        });


        try {
            const resUpdate = await fetch(
                "https://script.google.com/macros/s/AKfycbwATI3cgS_1BITlLplk50GQPYU_ESmERZjW7Oj1MaJeDSB49Yyzx0cG1LcjpQJ4Iuse/exec",
                {
                    method: "POST",
                    // mode: "no-cors",
                    // headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        action: "updateStatus",
                        ticketId: id,
                        sender: user.name,
                        senderNIK: "'" + user.nik,
                        role: user.position,
                        message,
                        cabang: user.cabang,
                        file: uploadedFileUrl,
                        statusTicket: statusTicket || ticket["StatusTicket"],
                        statusSolved: statusSolved || ticket["StatusSolved"],
                        reasonReject: reasonReject || ticket["ReasonReject"],
                    }),
                }
            );

            const data = await resUpdate.json();
            if (data.success) {
                console.log(data);
                Swal.fire({
                    title: "Berhasil!",
                    text: "Status tiket diperbarui",
                    icon: "success",
                    confirmButtonText: "OK",
                }).then(() => {
                    // navigate(`/dashboard/ticket/${id}`);
                    window.location.href = `/dashboard/ticket/${id}`;
                    // navigate(`/dashboard/ticket/${id}`);
                    // console.log("Router aktif:", navigate);
                });

                setMessage("");
                setFile(null);
            } else {
                Swal.fire("Error", "Gagal kirim chat", "error");
            }

            // Swal.fire("Berhasil", "Status tiket diperbarui", "success");
        } catch (error) {
            Swal.fire("Error", "Gagal memperbarui status", "error");
            console.error("Gagal memuat tiket:", error);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h3 className="text-2xl font-bold mb-6 text-center">📄 Ticket Detail</h3>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Informasi Pemohon */}
                <div className="bg-white rounded-lg shadow p-5">
                    <h4 className="font-semibold text-blue-600 mb-3">Informasi Pemohon</h4>
                    <div className="space-y-1 text-gray-700">
                        <p><strong>Nama Pemohon:</strong> {ticket["CreatedBy(Name)"]}</p>
                        <p><strong>NIK:</strong> {ticket["CreatedBy(NIK)"]}</p>
                        <p><strong>Jabatan:</strong> {ticket["Position"]}</p>
                        <p>
                            <strong>Request Date:</strong>{" "}
                            {new Date(ticket["Timestamp"]).toLocaleDateString("id-ID")}
                        </p>
                        <p><strong>No Ticket:</strong> {ticket["TicketID"]}</p>
                        <p><strong>Unit Kerja:</strong> {ticket["Cabang"]}</p>
                        <p>
                            <strong>Status Ticket:</strong>{" "}
                            <span
                                className={`px-2 py-1 rounded text-white ${ticket["StatusTicket"] === "Open"
                                    ? "bg-green-500"
                                    : ticket["StatusTicket"] === "Reject"
                                        ? "bg-red-500"
                                        : "bg-gray-500"
                                    }`}
                            >
                                {ticket["StatusTicket"]}
                            </span>
                        </p>
                        <p><strong>Eskalasi By:</strong> TIM {ticket["StatusSolved"] || "-"}</p>
                        <p><strong>Reason IT:</strong> {ticket["FeedbackIT"] || "-"}</p>
                        <p><strong>Reason Reject:</strong> {ticket["ReasonReject"] || "-"}</p>
                    </div>
                </div>

                {/* Detail Permasalahan */}
                <div className="bg-white rounded-lg shadow p-5">
                    <h4 className="font-semibold text-gray-700 mb-3">Detail Permasalahan</h4>
                    <div className="space-y-1 text-gray-700">
                        <p><strong>Brand:</strong> {ticket["Brand"]}</p>
                        <p><strong>Region:</strong> {ticket["Region"]}</p>
                        <p><strong>Error System:</strong> {ticket["IssueSummary"]}</p>
                        <p><strong>Nama Customer:</strong> {ticket["NamaCustomer"]}</p>
                        <p><strong>CUST ID:</strong> {ticket["CustID"]}</p>
                        <p><strong>No ODR:</strong> {ticket["NoODR"]}</p>
                        <p><strong>No APP:</strong> {ticket["NoAPP"]}</p>

                        <div>
                            <strong>Fatal Score:</strong>
                            <ul className="list-disc list-inside ml-2">
                                <li>Dukcapil: {ticket["Dukcapil"]}</li>
                                <li>Negative Status: {ticket["NegativeStatus"]}</li>
                                <li>Biometric: {ticket["Biometric"]}</li>
                            </ul>
                        </div>

                        <div>
                            <strong>Upload:</strong>{" "}
                            {ticket["FileUploadLink"] ? (
                                <a
                                    href={ticket["FileUploadLink"]}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-600 underline"
                                >
                                    📎 Lihat File
                                </a>
                            ) : (
                                "-"
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 💬 Historical Chat Section */}
            <div className="bg-white rounded-xl shadow mt-8 p-5">
                <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    💬 <span>Historical Chat</span>
                </h4>

                <div className="max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50 space-y-3">
                    <div
                        className={`flex ${ticket["CreatedBy(NIK)"] === user.nik ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[75%] p-3 rounded-2xl shadow-sm relative ${ticket["CreatedBy(NIK)"] === user.nik
                                ? "bg-indigo-500 text-white rounded-tr-none"
                                : "bg-white text-gray-800 rounded-tl-none"
                                }`}
                        >
                            <p className="text-sm leading-snug wrap-break-word">{ticket["DetailError"]}</p>

                            {ticket["FileUploadLink"] && (
                                <a
                                    href={ticket["FileUploadLink"]}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={`block mt-1 text-xs underline ${ticket["CreatedBy(NIK)"] === user.nik ? "text-indigo-200" : "text-blue-500"
                                        }`}
                                >
                                    📎 Lihat File
                                </a>
                            )}

                            <div
                                className={`text-[10px] mt-1 ${ticket["CreatedBy(NIK)"] === user.nik ? "text-indigo-200 text-right" : "text-gray-400"
                                    }`}
                            >
                                {ticket["CreatedBy(Name)"]} •{" "}
                                {new Date(ticket["Timestamp"]).toLocaleString("id-ID", {
                                    dateStyle: "short",
                                    timeStyle: "short",
                                })}
                            </div>
                        </div>
                    </div>
                    {chat.length > 0 ? (
                        chat.map((c, i) => {
                            const isUser = c.senderNIK === user.nik;
                            return (
                                <div
                                    key={i}
                                    className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[75%] p-3 rounded-2xl shadow-sm relative ${isUser
                                            ? "bg-indigo-500 text-white rounded-tr-none"
                                            : "bg-white text-gray-800 rounded-tl-none"
                                            }`}
                                    >
                                        <p className="text-sm leading-snug wrap-break-word">{c.message}</p>

                                        {c.file && (
                                            <a
                                                href={c.file}
                                                target="_blank"
                                                rel="noreferrer"
                                                className={`block mt-1 text-xs underline ${isUser ? "text-indigo-200" : "text-blue-500"
                                                    }`}
                                            >
                                                📎 Lihat File
                                            </a>
                                        )}

                                        <div
                                            className={`text-[10px] mt-1 ${isUser ? "text-indigo-200 text-right" : "text-gray-400"
                                                }`}
                                        >
                                            {c.sender} •{" "}
                                            {new Date(c.time).toLocaleString("id-ID", {
                                                dateStyle: "short",
                                                timeStyle: "short",
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-gray-500 text-center text-sm py-10">
                            {/* Belum ada percakapan. */}
                        </div>
                    )}
                </div>
            </div>

            {/* Post Reply Section */}
            <div className="bg-white rounded-lg shadow mt-8 p-5">
                <h4 className="font-semibold text-gray-700 mb-3">✉️ Post a Reply</h4>

                {isHeadOffice ? (
                    <>
                        {/* Head Office Input */}
                        <div className="mb-3">
                            <label className="block font-medium mb-1">Status Eskalasi</label>
                            <select
                                value={statusSolved}
                                onChange={(e) => setStatusSolved(e.target.value)}
                                className="border rounded w-full px-3 py-2"
                            >
                                <option value="">Pilih Status Eskalasi</option>
                                <option value="marketing">ESKALASI BY MARKETING</option>
                                <option value="helpdesk">ESKALASI BY IT HELPDESK</option>
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="block font-medium mb-1">Status Ticket</label>
                            <select
                                value={statusTicket}
                                onChange={(e) => setStatusTicket(e.target.value)}
                                className="border rounded w-full px-3 py-2"
                            >
                                <option value="">Pilih Status Ticket</option>
                                <option value="Open">Open</option>
                                <option value="Closed">Closed</option>
                                <option value="Reject">Reject</option>
                            </select>
                        </div>

                        {statusTicket.toLowerCase() === "reject" && (
                            <div className="mb-3">
                                <label className="block font-medium mb-1">Reason Reject</label>
                                <textarea
                                    value={reasonReject}
                                    onChange={(e) => setReasonReject(e.target.value)}
                                    className="border rounded w-full px-3 py-2 resize-none"
                                    rows="4"
                                />
                            </div>
                        )}

                        <div className="mb-3">
                            <label className="block font-medium mb-1">Post a Reply</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="border rounded w-full px-3 py-2 resize-none"
                                rows="4"
                            />
                            <input
                                type="file"
                                accept="image/*,video/mp4,application/pdf"
                                onChange={(e) => setFile(e.target.files[0] || null)}
                                className="border rounded w-full px-3 py-2 mb-3"
                            />
                        </div>

                        <button
                            onClick={handleUpdateStatus}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Submit
                        </button>
                    </>
                ) : (
                    <>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="border rounded w-full px-3 py-2 mb-3 resize-none"
                            rows="4"
                            placeholder="Tulis pesan..."
                        />
                        <input
                            type="file"
                            accept="image/*,video/mp4,application/pdf"
                            onChange={(e) => setFile(e.target.files[0] || null)}
                            className="border rounded w-full px-3 py-2 mb-3"
                        />
                        <button
                            onClick={handleSubmitChat}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                            Submit
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
