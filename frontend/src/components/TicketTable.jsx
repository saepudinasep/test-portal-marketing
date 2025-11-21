import { useState, useEffect } from "react";
import Select from "react-select";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export default function TicketTable({ tickets, userData }) {
    const navigate = useNavigate();
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [searchInput, setSearchInput] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [regionFilter, setRegionFilter] = useState([]);
    const [brandFilter, setBrandFilter] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const isHeadOffice = userData?.cabang === "Kantor Pusat";

    const allRegions = [
        "BANTEN 1",
        "BANTEN 2",
        "JABAR 1",
        "JABAR 2",
        "JABODEBEK 1",
        "JABODEBEK 2",
        "JABODEBEK 3",
        "JATENGSEL 1",
        "JATENGSEL 2",
        "JATENGUT 1",
        "JATENGUT 2",
        "JATIM 1",
        "JATIM 2",
        "JATIM 3",
        "JATIM 5",
        "KALIMANTAN",
        "SULAWESI 1",
        "SULAWESI 2",
        "SUMBAGSEL 1",
        "SUMBAGSEL 2",
        "SUMBAGUT 1",
        "SUMBAGUT 2"
    ];

    const allBrands = ["HAJIKU", "MASKU", "MOBILKU", "MOTORKU", "REGULER"];

    useEffect(() => {
        let filtered = tickets;

        if (searchInput.trim() !== "") {
            if (!/^\d+$/.test(searchInput)) {
                Swal.fire({
                    icon: "warning",
                    title: "Input Tidak Valid",
                    text: "Harap masukkan angka Ticket ID (contoh: 25090001).",
                });
            } else {
                filtered = filtered.filter(
                    (t) =>
                        (t.ticketId || "").replace(/\D/g, "") ===
                        searchInput.trim()
                );
            }
        }

        if (statusFilter !== "All") {
            filtered = filtered.filter(
                (t) =>
                    (t.status || "").toLowerCase() ===
                    statusFilter.toLowerCase()
            );
        }

        if (regionFilter.length > 0) {
            const regions = regionFilter.map((r) => r.value);
            filtered = filtered.filter((t) => regions.includes(t.region));
        }

        if (brandFilter.length > 0) {
            const brands = brandFilter.map((b) => b.value);
            filtered = filtered.filter((t) => brands.includes(t.brand));
        }

        filtered.sort((a, b) => {
            const [dayA, monthA, yearA] = a.createDate.split("/");
            const [dayB, monthB, yearB] = b.createDate.split("/");
            const dateA = Date.UTC(yearA, monthA - 1, dayA);
            const dateB = Date.UTC(yearB, monthB - 1, dayB);
            return dateB - dateA;
        });

        setFilteredTickets(filtered);
        setCurrentPage(1);
    }, [tickets, searchInput, statusFilter, regionFilter, brandFilter]);

    const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
    const pageTickets = filteredTickets.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getBadgeClass = (status) => {
        switch ((status || "").toLowerCase()) {
            case "open":
                return "bg-green-500 text-white";
            case "closed":
                return "bg-gray-500 text-white";
            case "reject":
                return "bg-red-500 text-white";
            default:
                return "bg-gray-300 text-gray-800";
        }
    };

    const handleRowClick = (ticketId) => {
        navigate(`/dashboard/ticket/${ticketId}`);
    };

    const resetFilters = () => {
        setRegionFilter([]);
        setBrandFilter([]);
        setStatusFilter("All");
        setSearchInput("");
        Swal.fire("Reset!", "Semua filter telah dihapus.", "info");
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold">📂 Daftar Tiket</h3>

            {/* Filter Section */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <input
                    type="text"
                    placeholder="Cari Ticket ID"
                    className="border rounded px-3 py-2 w-full md:w-1/3 text-sm sm:text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                />

                <div className="flex flex-wrap gap-2 items-center">
                    {["Open", "Closed", "Reject", "All"].map((status) => (
                        <button
                            key={status}
                            className={`px-4 py-1 rounded-full text-sm sm:text-xs font-medium border transition-colors duration-200 ${statusFilter === status
                                ? "bg-blue-500 text-white border-blue-500"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                }`}
                            onClick={() => setStatusFilter(status)}
                        >
                            {status}
                        </button>
                    ))}

                    <button
                        onClick={resetFilters}
                        className="px-4 py-1 rounded-full text-sm sm:text-xs font-medium bg-gray-200 hover:bg-gray-300 transition"
                    >
                        Reset
                    </button>
                </div>
            </div>
            {/* Multi-select modern */}
            {isHeadOffice && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Region
                        </label>
                        <Select
                            isMulti
                            options={allRegions.map((r) => ({
                                value: r,
                                label: r,
                            }))}
                            value={regionFilter}
                            onChange={setRegionFilter}
                            className="text-sm"
                            placeholder="Pilih region..."
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    borderRadius: "0.5rem",
                                    borderColor: "#cbd5e1",
                                    minHeight: "40px",
                                }),
                            }}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Brand
                        </label>
                        <Select
                            isMulti
                            options={allBrands.map((b) => ({
                                value: b,
                                label: b,
                            }))}
                            value={brandFilter}
                            onChange={setBrandFilter}
                            className="text-sm"
                            placeholder="Pilih brand..."
                            styles={{
                                control: (base) => ({
                                    ...base,
                                    borderRadius: "0.5rem",
                                    borderColor: "#cbd5e1",
                                    minHeight: "40px",
                                }),
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto rounded shadow-sm mt-4">
                <table className="min-w-full divide-y divide-gray-200 text-sm sm:text-xs">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="px-4 py-3 text-left">Create Date</th>
                            <th className="px-4 py-3 text-left">Ticket</th>
                            <th className="px-4 py-3 text-left">Error System</th>
                            {isHeadOffice && (
                                <th className="px-4 py-3 text-left">Brand</th>
                            )}
                            {isHeadOffice && (
                                <th className="px-4 py-3 text-left">Region</th>
                            )}
                            <th className="px-4 py-3 text-left">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {pageTickets.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={isHeadOffice ? 5 : 4}
                                    className="text-center py-4 text-gray-500"
                                >
                                    Belum ada tiket.
                                </td>
                            </tr>
                        ) : (
                            pageTickets.map((ticket) => (
                                <tr
                                    key={ticket.ticketId}
                                    className="hover:bg-gray-50 cursor-pointer"
                                    onClick={() =>
                                        handleRowClick(ticket.ticketId)
                                    }
                                >
                                    <td className="px-4 py-2">
                                        {ticket.createDate || "-"}
                                    </td>
                                    <td className="px-4 py-2 text-blue-600 font-medium">
                                        {ticket.ticketId}
                                    </td>
                                    <td className="px-4 py-2">
                                        {ticket.errorSystem || "-"}
                                    </td>
                                    {isHeadOffice && (
                                        <td className="px-4 py-2">
                                            {ticket.brand || "-"}
                                        </td>
                                    )}
                                    {isHeadOffice && (
                                        <td className="px-4 py-2">
                                            {ticket.region || "-"}
                                        </td>
                                    )}
                                    <td className="px-4 py-2">
                                        <span
                                            className={`px-2 py-1 rounded-full text-xs sm:text-[10px] font-semibold ${getBadgeClass(
                                                ticket.status
                                            )}`}
                                        >
                                            {ticket.status || "-"}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4 flex-wrap">
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i + 1}
                            className={`px-3 py-1 rounded-full text-sm border ${currentPage === i + 1
                                ? "bg-blue-500 text-white border-blue-500"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                                }`}
                            onClick={() => setCurrentPage(i + 1)}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
