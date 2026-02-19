import { useState, useCallback, useEffect } from "react";
import apiRequest from "./api";

export type AtmTransactionLog = {
    TLF_DATE: string | null; // ISO date
    TERM_BNK: string | null;
    TERM_LN: string | null;
    TERM_ID: string | null;
    TERM_FIID: string | null;
    CARD_LN: string | null;
    CARD_FIID: string | null;
    CARD_BNK: string | null;
    PAN: string | null;
    PANFIID5: string | null;
    TRAN_DATE: string | null; // ISO date or string
    TRAN_TIME: string | null;
    SEQ_NUM: string | null;
    MSG_TYPE: string | null;
    TRAN_CODE: string | null;
    FRM_ACCT: string | null;
    TO_ACCT: string | null;
    AMT1: number | null;
    AMT2: number | null;
    AMT3: number | null;
    RESP_CDE: string | null;
    RVSL_RSN: string | null;
    ATM_NO: string | null;
    ORIGINATOR: string | null;
    RESPONDER: string | null;
    TERM_LOC: string | null;
    TERM_CITY: string | null;
    TERM_COUNTRY: string | null;
    TERM_ST: string | null;
    [key: string]: any;
};

function generateMockLog(i: number): AtmTransactionLog {
    const rand = (max = 1000) => Math.floor(Math.random() * max);
    const iso = (d: Date) => d.toISOString();
    const now = new Date();
    now.setDate(now.getDate() - Math.floor(Math.random() * 30));
    const tranDate = new Date(now);

    return {
        TLF_DATE: iso(now),
        TERM_BNK: ["SBI", "HDFC", "ICICI"][rand(3)],
        TERM_LN: ["PRO1", "PRO2", "BR1"][rand(3)],
        TERM_ID: `TID-${String(rand(99999)).padStart(5, "0")}`,
        TERM_FIID: `F${String(rand(999)).padStart(3, "0")}`,
        CARD_LN: ["SHI", "VISA", "MAST"][rand(3)],
        CARD_FIID: ["CF1", "CF2", null][rand(3)],
        CARD_BNK: ["SHI", "NFS-OTH"][rand(2)],
        PAN: `6523${String(rand(9999)).padStart(4, "0")}XXXX${String(rand(9999)).padStart(4, "0")}`,
        PANFIID5: null,
        TRAN_DATE: iso(tranDate),
        TRAN_TIME: `${String(rand(23)).padStart(2, "0")}${String(rand(59)).padStart(2, "0")}${String(rand(59)).padStart(2, "0")}`,
        SEQ_NUM: String(1000 + i),
        MSG_TYPE: ["0210", "0200"][rand(2)],
        TRAN_CODE: ["30", "40", "10"][rand(3)],
        FRM_ACCT: null,
        TO_ACCT: null,
        AMT1: Number((Math.random() * 10000).toFixed(2)),
        AMT2: null,
        AMT3: null,
        RESP_CDE: ["00", "05", "12"][rand(3)],
        RVSL_RSN: null,
        ATM_NO: `ATM-${String(rand(9999)).padStart(6, "0")}`,
        ORIGINATOR: null,
        RESPONDER: null,
        TERM_LOC: ["MALUMICHAMPATTI ONSITE", "BRANCH LOCATION"][rand(2)],
        TERM_CITY: ["COIMBATORE", "MUMBAI", "DELHI"][rand(3)],
        TERM_COUNTRY: ["IN"][0],
        TERM_ST: ["TN", "MH", "DL"][rand(3)],
    };
}

export default function useAtmLogs() {
    const env = (import.meta as any).env as Record<string, any>;
    const USE_MOCK = env?.VITE_USE_MOCK === "true";
    const API_URL = env?.VITE_ATM_LOGS_URL || "/api/atm/logs";

    const [logs, setLogs] = useState<AtmTransactionLog[]>(() => (USE_MOCK ? Array.from({ length: 150 }, (_, i) => generateMockLog(i)) : []));
    const [loading, setLoading] = useState<boolean>(!USE_MOCK);
    const [error, setError] = useState<string | null>(null);

    const fetchLogs = useCallback(async () => {
        if (USE_MOCK) return;
        setLoading(true);
        setError(null);
        try {
            const res = await apiRequest(API_URL);
            setLoading(false);
            if (res.ok) {
                const payload = res.data as any;
                if (Array.isArray(payload)) setLogs(payload);
                else if (Array.isArray(payload.logs)) setLogs(payload.logs);
                else if (Array.isArray(payload.data)) setLogs(payload.data);
                else setError("Unexpected API response shape");
            } else {
                setError(typeof res.error === "string" ? res.error : JSON.stringify(res.error));
            }
        } catch (err: any) {
            setLoading(false);
            setError(err?.message || String(err));
        }
    }, [API_URL, USE_MOCK]);

    useEffect(() => {
        if (!USE_MOCK) fetchLogs();
    }, [USE_MOCK, fetchLogs]);

    const refresh = useCallback(() => {
        if (USE_MOCK) {
            setLogs(Array.from({ length: 150 }, (_, i) => generateMockLog(i)));
            setError(null);
            setLoading(false);
        } else {
            fetchLogs();
        }
    }, [USE_MOCK, fetchLogs]);

    return { logs, loading, error, refresh, useMock: USE_MOCK } as const;
}
