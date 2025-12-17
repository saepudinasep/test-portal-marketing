import { useMemo, useState, useEffect } from "react";

export function useTicketFilterPagination({
    tickets = [],
    searchInput,
    statusFilter,
    regionFilter,
    brandFilter,
    itemsPerPage = 10,
}) {
    const [currentPage, setCurrentPage] = useState(1);

    const filteredTickets = useMemo(() => {
        let data = [...tickets];

        if (searchInput?.trim()) {
            data = data.filter(
                (t) =>
                    (t.ticketId || "").replace(/\D/g, "") ===
                    searchInput.trim()
            );
        }

        if (statusFilter !== "All") {
            data = data.filter(
                (t) =>
                    (t.status || "").toLowerCase() ===
                    statusFilter.toLowerCase()
            );
        }

        if (regionFilter?.length) {
            const regions = regionFilter.map((r) => r.value);
            data = data.filter((t) => regions.includes(t.region));
        }

        if (brandFilter?.length) {
            const brands = brandFilter.map((b) => b.value);
            data = data.filter((t) => brands.includes(t.brand));
        }

        data.sort((a, b) => {
            if (!a.createDate || !b.createDate) return 0;

            const [da, ma, ya] = a.createDate.split("/");
            const [db, mb, yb] = b.createDate.split("/");

            return (
                Date.UTC(yb, mb - 1, db) -
                Date.UTC(ya, ma - 1, da)
            );
        });

        return data;
    }, [tickets, searchInput, statusFilter, regionFilter, brandFilter]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredTickets.length / itemsPerPage)
    );

    const pageTickets = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredTickets.slice(start, start + itemsPerPage);
    }, [filteredTickets, currentPage, itemsPerPage]);

    // ✅ PINDAHKAN KE useEffect
    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    return {
        pageTickets,
        currentPage,
        setCurrentPage,
        totalPages,
    };
}
