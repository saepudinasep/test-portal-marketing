import { useState, useMemo, useEffect } from "react";
import Select from "react-select";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useTicketFilterPagination } from "./useTicketFilterPagination";

export default function TicketTable({ tickets, userData }) {
    const navigate = useNavigate();

    const [searchInput, setSearchInput] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [regionFilter, setRegionFilter] = useState([]);
    const [brandFilter, setBrandFilter] = useState([]);

    const isHeadOffice = userData?.cabang === "Kantor Pusat";

    const {
        pageTickets,
        currentPage,
        setCurrentPage,
        totalPages,
    } = useTicketFilterPagination({
        tickets,
        searchInput,
        statusFilter,
        regionFilter,
        brandFilter,
        itemsPerPage: 10,
    });

    // =========================
    // HANDLERS
    // =========================
    const handleSearchBlur = () => {
        if (searchInput && !/^\d+$/.test(searchInput)) {
            Swal.fire(
                "Input Tidak Valid",
                "Ticket ID harus berupa angka",
                "warning"
            );
            setSearchInput("");
        }
    };

    const resetFilters = () => {
        setSearchInput("");
        setStatusFilter("All");
        setRegionFilter([]);
        setBrandFilter([]);
        setCurrentPage(1);
    };

    const getBadgeClass = (status) => {
        switch ((status || "").toLowerCase()) {
            case "open":
                return "bg-green-100 text-green-700";
            case "closed":
                return "bg-gray-200 text-gray-700";
            case "reject":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-600";
        }
    };

    // =========================
    // PAGINATION UI
    // =========================
    const paginationPages = useMemo(() => {
        const pages = [];

        const add = (p) => {
            if (p >= 1 && p <= totalPages && !pages.includes(p)) {
                pages.push(p);
            }
        };

        add(1);
        add(currentPage - 1);
        add(currentPage);
        add(currentPage + 1);
        add(totalPages);

        pages.sort((a, b) => a - b);

        const result = [];
        for (let i = 0; i < pages.length; i++) {
            if (i > 0 && pages[i] - pages[i - 1] > 1) {
                result.push("...");
            }
            result.push(pages[i]);
        }

        return result;
    }, [currentPage, totalPages]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchInput, statusFilter, regionFilter, brandFilter]);

    // =========================
    // MASTER OPTIONS
    // =========================
    const regionOptions = [
        { value: "BANTEN 1", label: "BANTEN 1" },
        { value: "BANTEN 2", label: "BANTEN 2" },
        { value: "JABAR 1", label: "JABAR 1" },
        { value: "JABAR 2", label: "JABAR 2" },
        { value: "JABODEBEK 1", label: "JABODEBEK 1" },
        { value: "JABODEBEK 2", label: "JABODEBEK 2" },
        { value: "JABODEBEK 3", label: "JABODEBEK 3" },
        { value: "JATENGSEL 1", label: "JATENGSEL 1" },
        { value: "JATENGSEL 2", label: "JATENGSEL 2" },
        { value: "JATENGUT 1", label: "JATENGUT 1" },
        { value: "JATENGUT 2", label: "JATENGUT 2" },
        { value: "JATIM 1", label: "JATIM 1" },
        { value: "JATIM 2", label: "JATIM 2" },
        { value: "JATIM 3", label: "JATIM 3" },
        { value: "JATIM 5", label: "JATIM 5" },
        { value: "KALIMANTAN", label: "KALIMANTAN" },
        { value: "SULAWESI 1", label: "SULAWESI 1" },
        { value: "SULAWESI 2", label: "SULAWESI 2" },
        { value: "SUMBAGSEL 1", label: "SUMBAGSEL 1" },
        { value: "SUMBAGSEL 2", label: "SUMBAGSEL 2" },
        { value: "SUMBAGUT 1", label: "SUMBAGUT 1" },
        { value: "SUMBAGUT 2", label: "SUMBAGUT 2" },
    ];

    const brandOptions = [
        { value: "REGULER", label: "REGULER" },
        { value: "MOTORKU", label: "MOTORKU" },
        { value: "MOBILKU", label: "MOBILKU" },
        { value: "MASKU", label: "MASKU" },
        { value: "HAJIKU", label: "HAJIKU" },
    ];

    const statusOptions = [
        { value: "All", label: "All Status" },
        { value: "open", label: "Open" },
        { value: "closed", label: "Closed" },
        { value: "reject", label: "Reject" },
    ];

    // =========================
    // RENDER
    // =========================
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold">📂 Daftar Tiket</h3>

            {/* FILTER CARD */}
            <div className="bg-white border rounded-xl shadow-sm">
                <div className="p-4 space-y-4">

                    {/* HEADER */}
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-700">
                            🔍 Filter & Pencarian
                        </h4>

                        <button
                            onClick={resetFilters}
                            className="text-xs font-medium text-red-600 hover:underline"
                        >
                            Reset Semua
                        </button>
                    </div>

                    {/* FILTER GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

                        {/* SEARCH */}
                        <div className="md:col-span-4">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                Ticket ID
                            </label>
                            <input
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onBlur={handleSearchBlur}
                                placeholder="Contoh: 251214010001"
                                className="
                        w-full rounded-lg border px-3 py-2 text-sm
                        focus:outline-none focus:ring-2 focus:ring-blue-500
                        focus:border-blue-500
                    "
                            />
                        </div>

                        {/* STATUS */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                                Status
                            </label>
                            <Select
                                options={statusOptions}
                                value={statusOptions.find(
                                    (o) =>
                                        o.value.toLowerCase() ===
                                        statusFilter.toLowerCase()
                                )}
                                onChange={(opt) => setStatusFilter(opt.value)}
                                placeholder="All"
                                className="text-sm"
                                classNamePrefix="select"
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={{
                                    menuPortal: (base) => ({
                                        ...base,
                                        zIndex: 9999,
                                    }),
                                }}
                            />
                        </div>

                        {/* BRAND */}
                        {isHeadOffice && (
                            <div className="md:col-span-3">
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Brand
                                </label>
                                <Select
                                    isMulti
                                    options={brandOptions}
                                    value={brandFilter}
                                    onChange={setBrandFilter}
                                    placeholder="Pilih Brand"
                                    className="text-sm"
                                    classNamePrefix="select"
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    styles={{
                                        menuPortal: (base) => ({
                                            ...base,
                                            zIndex: 9999,
                                        }),
                                    }}
                                />
                            </div>
                        )}

                        {/* REGION */}
                        {isHeadOffice && (
                            <div className="md:col-span-3">
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                    Region
                                </label>
                                <Select
                                    isMulti
                                    options={regionOptions}
                                    value={regionFilter}
                                    onChange={setRegionFilter}
                                    placeholder="Pilih Region"
                                    className="text-sm"
                                    classNamePrefix="select"
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    styles={{
                                        menuPortal: (base) => ({
                                            ...base,
                                            zIndex: 9999,
                                        }),
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* TABLE */}
            <div className="relative overflow-x-auto border rounded-xl shadow-sm bg-white">
                <table className="min-w-full text-sm">
                    {/* TABLE HEAD */}
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold">
                                Create Date
                            </th>
                            <th className="px-4 py-3 text-left font-semibold">
                                Ticket
                            </th>
                            <th className="px-4 py-3 text-left font-semibold">
                                Error
                            </th>
                            {isHeadOffice && (
                                <th className="px-4 py-3 text-left font-semibold">
                                    Brand
                                </th>
                            )}
                            {isHeadOffice && (
                                <th className="px-4 py-3 text-left font-semibold">
                                    Region
                                </th>
                            )}
                            <th className="px-4 py-3 text-left font-semibold">
                                Status
                            </th>
                        </tr>
                    </thead>

                    {/* TABLE BODY */}
                    <tbody className="divide-y">
                        {pageTickets.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={isHeadOffice ? 6 : 4}
                                    className="text-center py-12"
                                >
                                    <div className="flex flex-col items-center gap-2 text-gray-500">
                                        <span className="text-2xl">📭</span>
                                        <span className="text-sm">
                                            Tidak ada data ditemukan
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            Coba ubah filter atau pencarian
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            pageTickets.map((t) => (
                                <tr
                                    key={t.ticketId}
                                    onClick={() =>
                                        navigate(`/dashboard/ticket/${t.ticketId}?region=${encodeURIComponent(t.region)}`)
                                    }
                                    className="
                            cursor-pointer
                            hover:bg-blue-50
                            transition-colors
                        "
                                >
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                                        {t.createDate}
                                    </td>

                                    <td className="px-4 py-3 font-semibold text-blue-600">
                                        {t.ticketId}
                                    </td>

                                    <td className="px-4 py-3 text-gray-700 max-w-xs truncate">
                                        {t.errorSystem}
                                    </td>

                                    {isHeadOffice && (
                                        <td className="px-4 py-3 text-gray-700">
                                            {t.brand}
                                        </td>
                                    )}

                                    {isHeadOffice && (
                                        <td className="px-4 py-3 text-gray-700">
                                            {t.region}
                                        </td>
                                    )}

                                    <td className="px-4 py-3">
                                        <span
                                            className={`
                                    inline-flex items-center
                                    px-2.5 py-1 rounded-full
                                    text-xs font-semibold
                                    ${getBadgeClass(t.status)}
                                `}
                                        >
                                            {t.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* PAGINATION */}
            <div className="flex items-center justify-center gap-1">
                <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="px-3 py-1 border rounded
                                cursor-pointer
                                hover:bg-gray-100
                                disabled:opacity-40
                                disabled:cursor-not-allowed
                                disabled:hover:bg-transparent"
                >
                    Prev
                </button>

                {paginationPages.map((p, i) =>
                    p === "..." ? (
                        <span key={`e-${i}`} className="px-2 text-gray-500 select-none">
                            ...
                        </span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => setCurrentPage(p)}
                            className={`px-3 py-1 border rounded
                    cursor-pointer
                    transition ${p === currentPage
                                    ? "bg-blue-600 text-white border-blue-600 cursor-default"
                                    : "hover:bg-gray-100"
                                }`}
                        >
                            {p}
                        </button>
                    )
                )}

                <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="px-3 py-1 border rounded
            cursor-pointer
            hover:bg-gray-100
            disabled:opacity-40
            disabled:cursor-not-allowed
            disabled:hover:bg-transparent"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
