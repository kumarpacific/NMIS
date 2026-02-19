import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select } from "./ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Download,
  Calendar
} from "lucide-react";

import useAtmLogs from "../../lib/useAtmLogs";

// Mock log data
const generateMockLogs = () => {
  const logTypes = ["Transaction", "Error", "Maintenance", "Alert", "System"];
  const subTypes = {
    Transaction: ["Withdrawal", "Deposit", "Balance Inquiry", "Transfer"],
    Error: ["Cash Dispense", "Card Reader", "Network", "Printer", "Hardware"],
    Maintenance: ["Scheduled", "Emergency", "Preventive", "Upgrade"],
    Alert: ["Low Cash", "Cash Full", "Network Down", "Tamper Alert"],
    System: ["Startup", "Shutdown", "Reboot", "Update"],
  };
  const statuses = ["Success", "Failed", "Warning", "Info"];
  const atmIds = Array.from({ length: 20 }, (_, i) => `ATM-${String(i + 1).padStart(4, "0")}`);

  const logs: any[] = [];
  for (let i = 0; i < 150; i++) {
    const logType = logTypes[Math.floor(Math.random() * logTypes.length)];
    const subTypeArray = subTypes[logType as keyof typeof subTypes];
    const subType = subTypeArray[Math.floor(Math.random() * subTypeArray.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const atmId = atmIds[Math.floor(Math.random() * atmIds.length)];

    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    date.setHours(Math.floor(Math.random() * 24));
    date.setMinutes(Math.floor(Math.random() * 60));

    logs.push({
      id: `LOG-${String(i + 1).padStart(6, "0")}`,
      timestamp: date.toISOString(),
      atmId,
      logType,
      subType,
      status,
      message: `${logType} event: ${subType} on ${atmId}`,
      details: `Additional details about the ${logType.toLowerCase()} event`,
    });
  }

  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

type SortField = "timestamp" | "atmId" | "logType" | "status";
type SortDirection = "asc" | "desc";

export function AtmLogs() {
  // Use hook to fetch or generate ATM transaction logs
  // hook returns { logs, loading, error, refresh, useMock }
  const { logs: allLogs, loading: loadingLogs, error: fetchError, refresh, useMock: USE_MOCK } = useAtmLogs();

  // Column selection: available columns and persisted user preference
  const availableColumns: { key: string; label: string; default: boolean }[] = [
    { key: "TLF_DATE", label: "TLF Date", default: true },
    { key: "TERM_ID", label: "Terminal ID", default: true },
    { key: "TERM_BNK", label: "Terminal Bank", default: true },
    { key: "PAN", label: "PAN", default: true },
    { key: "TRAN_DATE", label: "Tran Date", default: true },
    { key: "TRAN_TIME", label: "Tran Time", default: true },
    { key: "SEQ_NUM", label: "Seq Num", default: true },
    { key: "AMT1", label: "Amount", default: true },
    { key: "RESP_CDE", label: "Resp Code", default: true },
    { key: "TERM_LOC", label: "Terminal Location", default: false },
    { key: "TERM_CITY", label: "Terminal City", default: false },
    { key: "ATM_NO", label: "ATM No", default: false },
    { key: "MSG_TYPE", label: "Msg Type", default: false },
    { key: "TRAN_CODE", label: "Tran Code", default: false },
  ];

  const storageKey = "atmLogs.visibleColumns";
  const loadInitialColumns = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        // validate keys
        const valid = parsed.filter((k) => availableColumns.some((c) => c.key === k));
        if (valid.length) return valid;
      }
    } catch (e) {
      // ignore
    }
    return availableColumns.filter((c) => c.default).map((c) => c.key);
  };

  const [visibleColumns, setVisibleColumns] = useState<string[]>(() => loadInitialColumns());

  // persist selection
  const persistColumns = (cols: string[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(cols));
    } catch (e) { }
  };

  const toggleColumn = (key: string) => {
    setVisibleColumns((prev) => {
      const next = prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key];
      persistColumns(next);
      return next;
    });
  };

  // Filter states
  const [logType, setLogType] = useState("");
  const [logSubType, setLogSubType] = useState("");
  const [dateRange, setDateRange] = useState("5day");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Sorting states
  const [sortField, setSortField] = useState<SortField>("timestamp");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Get available subtypes based on selected log type
  const availableSubTypes = useMemo(() => {
    if (!logType) return [];
    const subTypes = {
      Transaction: ["Withdrawal", "Deposit", "Balance Inquiry", "Transfer"],
      Error: ["Cash Dispense", "Card Reader", "Network", "Printer", "Hardware"],
      Maintenance: ["Scheduled", "Emergency", "Preventive", "Upgrade"],
      Alert: ["Low Cash", "Cash Full", "Network Down", "Tamper Alert"],
      System: ["Startup", "Shutdown", "Reboot", "Update"],
    };
    return subTypes[logType as keyof typeof subTypes] || [];
  }, [logType]);

  // Filter logs based on criteria
  const filteredLogs = useMemo(() => {
    let filtered = [...allLogs];

    // Filter by log type
    if (logType) {
      filtered = filtered.filter((log) => log.logType === logType);
    }

    // Filter by log subtype
    if (logSubType) {
      filtered = filtered.filter((log) => log.subType === logSubType);
    }

    // Filter by date range — support both `timestamp` (old mock) and `TLF_DATE` or `TRAN_DATE` (new schema)
    const now = new Date();
    const getLogDate = (log: any) => {
      if (log.timestamp) return new Date(log.timestamp);
      if (log.TLF_DATE) return new Date(log.TLF_DATE);
      if (log.TRAN_DATE) return new Date(log.TRAN_DATE);
      return null;
    };

    if (dateRange === "1day") {
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      filtered = filtered.filter((log) => {
        const d = getLogDate(log);
        return d ? d >= oneDayAgo : false;
      });
    } else if (dateRange === "5day") {
      const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((log) => {
        const d = getLogDate(log);
        return d ? d >= fiveDaysAgo : false;
      });
    } else if (dateRange === "custom" && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((log) => {
        const d = getLogDate(log);
        return d ? d >= start && d <= end : false;
      });
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((log) => {
        const atmId = (log.atmId || log.TERM_ID || log.ATM_NO || "").toString().toLowerCase();
        const message = (log.message || log.details || "").toString().toLowerCase();
        const id = (log.id || log.SEQ_NUM || "").toString().toLowerCase();
        const pan = (log.PAN || "").toString().toLowerCase();
        return atmId.includes(query) || message.includes(query) || id.includes(query) || pan.includes(query);
      });
    }

    // Sort logs
    // Sorting: support timestamp (old) or TLF_DATE/TRAN_DATE (new) when sorting by timestamp,
    // otherwise compare string values for requested sortField if present.
    filtered.sort((a, b) => {
      const getValue = (obj: any, field: string) => {
        if (field === "timestamp") return getLogDate(obj) || new Date(0);
        // fallback: try field directly
        const v = obj[field];
        if (v == null) return "";
        return v;
      };

      const aValue: any = getValue(a, sortField);
      const bValue: any = getValue(b, sortField);

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [allLogs, logType, logSubType, dateRange, customStartDate, customEndDate, searchQuery, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4" />;
    }
    return sortDirection === "asc" ? (
      <ArrowUp className="w-4 h-4" />
    ) : (
      <ArrowDown className="w-4 h-4" />
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Success":
        return "bg-green-100 text-green-800";
      case "Failed":
        return "bg-red-100 text-red-800";
      case "Warning":
        return "bg-orange-100 text-orange-800";
      case "Info":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleReset = () => {
    setLogType("");
    setLogSubType("");
    setDateRange("5day");
    setCustomStartDate("");
    setCustomEndDate("");
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleExport = () => {
    // Mock export functionality
    alert(`Exporting ${filteredLogs.length} logs...`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900">ATM Logs</h1>
          <span
            className={`text-xs px-2 py-1 rounded-full ${USE_MOCK ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}
            title={USE_MOCK ? "Using mock data" : "Using live API"}
          >
            {USE_MOCK ? "MOCK" : "API"}
          </span>
        </div>
        <p className="text-gray-600 mt-1">View and analyze ATM transaction and system logs</p>

        {loadingLogs && !USE_MOCK && <p className="text-sm text-gray-500 mt-2">Loading logs from API...</p>}
        {fetchError && <p className="text-sm text-red-600 mt-2">Error loading logs: {fetchError}</p>}
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Logs</CardTitle>
          <CardDescription>Refine your search with multiple filter options</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Log Type */}
            <div className="space-y-2">
              <Label htmlFor="logType">Log Type</Label>
              <Select
                id="logType"
                value={logType}
                onChange={(e) => {
                  setLogType(e.target.value);
                  setLogSubType("");
                  setCurrentPage(1);
                }}
              >
                <option value="">All Types</option>
                <option value="Transaction">Transaction</option>
                <option value="Error">Error</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Alert">Alert</option>
                <option value="System">System</option>
              </Select>
            </div>

            {/* Log SubType */}
            <div className="space-y-2">
              <Label htmlFor="logSubType">Log SubType</Label>
              <Select
                id="logSubType"
                value={logSubType}
                onChange={(e) => {
                  setLogSubType(e.target.value);
                  setCurrentPage(1);
                }}
                disabled={!logType}
              >
                <option value="">All SubTypes</option>
                {availableSubTypes.map((subType) => (
                  <option key={subType} value={subType}>
                    {subType}
                  </option>
                ))}
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label htmlFor="dateRange">Date Range</Label>
              <Select
                id="dateRange"
                value={dateRange}
                onChange={(e) => {
                  setDateRange(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="1day">Last 24 Hours</option>
                <option value="5day">Last 5 Days</option>
                <option value="custom">Custom Range</option>
              </Select>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="ATM ID, Log ID..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          {/* Custom Date Range */}
          {dateRange === "custom" && (
            <div className="grid gap-4 md:grid-cols-2 mt-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="startDate"
                    type="date"
                    value={customStartDate}
                    onChange={(e) => {
                      setCustomStartDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="endDate"
                    type="date"
                    value={customEndDate}
                    onChange={(e) => {
                      setCustomEndDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Button variant="outline" onClick={handleReset}>
              Reset Filters
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4" />
              Export Results
            </Button>
            {/* Column selector */}
            <details className="relative">
              <summary className="inline-flex items-center gap-2 px-3 py-1 border rounded cursor-pointer">
                Columns
              </summary>
              <div className="absolute z-20 mt-2 p-3 bg-white border rounded shadow-md w-64">
                <div className="text-sm font-medium mb-2">Select columns to show</div>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto">
                  {availableColumns.map((col) => (
                    <label key={col.key} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes(col.key)}
                        onChange={() => toggleColumn(col.key)}
                      />
                      <span>{col.label}</span>
                    </label>
                  ))}
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => { setVisibleColumns(availableColumns.filter(c => c.default).map(c => c.key)); persistColumns(availableColumns.filter(c => c.default).map(c => c.key)); }}>
                    Reset
                  </Button>
                </div>
              </div>
            </details>
            <div className="ml-auto text-sm text-gray-600 flex items-center">
              Showing {filteredLogs.length} result{filteredLogs.length !== 1 ? "s" : ""}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Log Entries</CardTitle>
          <CardDescription>
            Page {currentPage} of {totalPages} ({filteredLogs.length} total entries)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  {visibleColumns.map((colKey) => {
                    const colDef = availableColumns.find((c) => c.key === colKey);
                    return (
                      <th key={colKey} className="text-left py-3 px-4 font-medium text-gray-700">
                        {colDef ? colDef.label : colKey}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-gray-500">
                      No logs found matching your criteria
                    </td>
                  </tr>
                ) : (
                  paginatedLogs.map((log: any, idx: number) => (
                    <tr key={log.SEQ_NUM ?? idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      {visibleColumns.map((colKey) => {
                        let value: any = log[colKey];
                        if (colKey === "TLF_DATE" || colKey === "TRAN_DATE") value = value ? new Date(value).toLocaleDateString() : "-";
                        if (colKey === "AMT1" && value != null) value = Number(value).toFixed(2);
                        if (colKey === "TERM_ID") value = value ?? log.TERM_LN ?? "-";
                        return (
                          <td key={colKey} className={`py-3 px-4 text-sm ${colKey === "TERM_ID" ? "font-medium text-gray-900" : "text-gray-600"}`}>
                            {value ?? "-"}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of{" "}
                {filteredLogs.length} entries
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="icon"
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
