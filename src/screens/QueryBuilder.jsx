window.TEST_RUN_QUERY = () => {
  console.log("🔥 MANUAL CALL WORKS");
};

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { Search, Play } from "lucide-react";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";

export default function QueryBuilder({ setCurrentScreen, setSelectedLoanId }) {
  const [queryMode, setQueryMode] = useState("natural");
  const [keywords, setKeywords] = useState("");
  const [filters, setFilters] = useState({
    benchmark: "",
    facilityType: "",
    borrower: "",
    facilityAgent: "",
    governingLaw: "",
    jurisdiction: "",
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Log component render
  console.log("🔵 QueryBuilder rendered, mode:", queryMode);

  const clearFilters = () => {
    setFilters({
      benchmark: "",
      facilityType: "",
      borrower: "",
      facilityAgent: "",
      governingLaw: "",
      jurisdiction: "",
    });
  };

  const runQuery = async () => {
    console.log("=== 🚀 RUN QUERY STARTED ===");
    
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");
      
      // Log everything BEFORE the fetch
      console.log("📋 Query Details:");
      console.log("  - Mode:", queryMode);
      console.log("  - Keywords:", keywords);
      console.log("  - Filters:", filters);
      console.log("  - Token exists:", !!token);
      console.log("  - Token length:", token?.length);
      console.log("  - Token preview:", token?.substring(0, 30) + "...");

      const body =
        queryMode === "natural"
          ? {
              keywords: keywords
                .split(",")
                .map((k) => k.trim())
                .filter(Boolean),
            }
          : {
              filters: {
                ...(filters.benchmark && { benchmark: filters.benchmark }),
                ...(filters.facilityType && {
                  facilityType: filters.facilityType,
                }),
                ...(filters.borrower && { borrower: filters.borrower }),
                ...(filters.facilityAgent && {
                  facilityAgent: filters.facilityAgent,
                }),
                ...(filters.governingLaw && {
                  governingLaw: filters.governingLaw,
                }),
                ...(filters.jurisdiction && {
                  jurisdiction: filters.jurisdiction,
                }),
              },
            };

      console.log("📦 Request body:", JSON.stringify(body, null, 2));

      const url = "https://nixora-image-latest.onrender.com/api/loans/query/search-query";
      console.log("🌐 Fetching:", url);

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      console.log("📥 Response status:", res.status);
      console.log("📥 Response ok:", res.ok);
      console.log("📥 Response headers:", Object.fromEntries(res.headers.entries()));

      // Get response body as text first
      const responseText = await res.text();
      console.log("📥 Response body (raw):", responseText);

      if (!res.ok) {
        console.error("❌ Request failed with status:", res.status);
        
        // Parse error details if possible
        let errorData;
        try {
          errorData = JSON.parse(responseText);
          console.error("❌ Error data:", errorData);
        } catch {
          console.error("❌ Error response (not JSON):", responseText);
        }

        throw new Error(
          `Query failed: ${res.status} ${res.statusText}${
            errorData?.message ? ` - ${errorData.message}` : ""
          }`
        );
      }

      // Parse successful response
      const data = JSON.parse(responseText);
      console.log("✅ Query successful! Results:", data);
      console.log("✅ Number of results:", data?.length || 0);

      setResults(data || []);
    } catch (err) {
      console.error("🚨 Query failed:", err);
      console.error("🚨 Error name:", err.name);
      console.error("🚨 Error message:", err.message);
      console.error("🚨 Error stack:", err.stack);
      
      setError(err.message);
    } finally {
      setLoading(false);
      console.log("=== ✅ RUN QUERY COMPLETED ===");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Search & Queries
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Build custom queries to analyze your loan portfolio
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <svg
                className="w-6 h-6 text-red-600 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  Query Failed
                </h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Query Builder</CardTitle>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  console.log("Switching to natural mode");
                  setQueryMode("natural");
                  setKeywords("");
                  clearFilters();
                  setResults([]);
                }}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  queryMode === "natural"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Natural Language
              </button>
              <button
                onClick={() => {
                  console.log("Switching to advanced mode");
                  setQueryMode("advanced");
                  setKeywords("");
                  clearFilters();
                  setResults([]);
                }}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  queryMode === "advanced"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Advanced Filters
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {queryMode === "natural" ? (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => {
                    console.log("Keywords updated:", e.target.value);
                    setKeywords(e.target.value);
                  }}
                  placeholder="ABC Manufacturing, EuroBank"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  onClick={() => {
                    console.log("🔘 RUN QUERY BUTTON CLICKED");
                    runQuery();
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Run Query
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Benchmark
                  </label>
                  <input
                    type="text"
                    value={filters.benchmark}
                    onChange={(e) =>
                      setFilters({ ...filters, benchmark: e.target.value })
                    }
                    placeholder="e.g., LIBOR, SOFR"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facility Type
                  </label>
                  <input
                    type="text"
                    value={filters.facilityType}
                    onChange={(e) =>
                      setFilters({ ...filters, facilityType: e.target.value })
                    }
                    placeholder="e.g., Term Loan, Revolving Credit"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Borrower
                  </label>
                  <input
                    type="text"
                    value={filters.borrower}
                    onChange={(e) =>
                      setFilters({ ...filters, borrower: e.target.value })
                    }
                    placeholder="e.g., Company ABC"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facility Agent
                  </label>
                  <input
                    type="text"
                    value={filters.facilityAgent}
                    onChange={(e) =>
                      setFilters({ ...filters, facilityAgent: e.target.value })
                    }
                    placeholder="e.g., Bank XYZ"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Governing Law
                  </label>
                  <input
                    type="text"
                    value={filters.governingLaw}
                    onChange={(e) =>
                      setFilters({ ...filters, governingLaw: e.target.value })
                    }
                    placeholder="e.g., New York, English Law"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jurisdiction
                  </label>
                  <input
                    type="text"
                    value={filters.jurisdiction}
                    onChange={(e) =>
                      setFilters({ ...filters, jurisdiction: e.target.value })
                    }
                    placeholder="e.g., USA, UK"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={clearFilters}>
                  Clear All
                </Button>
                <Button
                  variant="primary"
                  onClick={runQuery}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Run Query
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Query Results</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                {results.length} loans match your criteria
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <p className="text-sm text-gray-600">Searching loans...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No results found</p>
              <p className="text-sm mt-1">Try different search criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {[
                      "Borrower",
                      "Facility Agent",
                      "Facility Type",
                      // "Interest Period",
                      // "Benchmark",
                      "Governing Law",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {results.map((loan) => (
                    <tr key={loan.loanId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{loan.borrower}</td>
                      <td className="px-4 py-3 text-sm">
                        {loan.facilityAgent}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {loan.facilityType}
                      </td>
                      {/* <td className="px-4 py-3 text-sm">
                        {loan.interestPeriod}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="info">{loan.benchmark}</Badge>
                      </td> */}
                      <td className="px-4 py-3 text-sm">
                        {loan.governingLaw}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            console.log("Viewing loan details:", loan.loanId);
                            setSelectedLoanId(loan.loanId);
                            setCurrentScreen("loan-details");
                          }}
                        >
                          More Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}