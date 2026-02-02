import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select } from "@/app/components/ui/select";
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

  const logs = [];
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
  const allLogs = useMemo(() => generateMockLogs(), []);
  
  // Filter states
  const [logType, setLogType] = useState("");
  const [logSubType, setLogSubType] = useState("");
  const [dateRange, setDateRange] = useState("1day");
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

    // Filter by date range
    const now = new Date();
    if (dateRange === "1day") {
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      filtered = filtered.filter((log) => new Date(log.timestamp) >= oneDayAgo);
    } else if (dateRange === "5day") {
      const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((log) => new Date(log.timestamp) >= fiveDaysAgo);
    } else if (dateRange === "custom" && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((log) => {
        const logDate = new Date(log.timestamp);
        return logDate >= start && logDate <= end;
      });
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.atmId.toLowerCase().includes(query) ||
          log.message.toLowerCase().includes(query) ||
          log.id.toLowerCase().includes(query)
      );
    }

    // Sort logs
    filtered.sort((a, b) => {
      let aValue: string | Date = a[sortField];
      let bValue: string | Date = b[sortField];

      if (sortField === "timestamp") {
        aValue = new Date(a.timestamp);
        bValue = new Date(b.timestamp);
      }

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
    setDateRange("1day");
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
        <h1 className="text-3xl font-bold text-gray-900">ATM Logs</h1>
        <p className="text-gray-600 mt-1">View and analyze ATM transaction and system logs</p>
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
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    <button
                      onClick={() => handleSort("timestamp")}
                      className="flex items-center gap-2 hover:text-gray-900"
                    >
                      Timestamp
                      {getSortIcon("timestamp")}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    <button
                      onClick={() => handleSort("atmId")}
                      className="flex items-center gap-2 hover:text-gray-900"
                    >
                      ATM ID
                      {getSortIcon("atmId")}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    <button
                      onClick={() => handleSort("logType")}
                      className="flex items-center gap-2 hover:text-gray-900"
                    >
                      Type
                      {getSortIcon("logType")}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">SubType</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">
                    <button
                      onClick={() => handleSort("status")}
                      className="flex items-center gap-2 hover:text-gray-900"
                    >
                      Status
                      {getSortIcon("status")}
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Message</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500">
                      No logs found matching your criteria
                    </td>
                  </tr>
                ) : (
                  paginatedLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {log.atmId}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{log.logType}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{log.subType}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            log.status
                          )}`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{log.message}</td>
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
