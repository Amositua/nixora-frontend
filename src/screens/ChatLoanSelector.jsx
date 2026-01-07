import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import {
  MessageSquare,
  Search,
  FileText,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export default function ChatLoanSelector({ setCurrentScreen, setSelectedLoanId }) {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    const user = localStorage.getItem("user");
    const userId = user ? JSON.parse(user).userId : "guest";
    const cachedLoans = localStorage.getItem(`loanDocuments_chat:${userId}`);

    if (cachedLoans) {
      setLoans(JSON.parse(cachedLoans));
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        "https://nixora-image-latest.onrender.com/api/loans/documents/getAllLoan",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch loans");

      const data = await res.json();
      setLoans(data || []);
      const user = localStorage.getItem("user");
        const userId = user ? JSON.parse(user).userId : "guest";
        const STORAGE_KEY = `loanDocuments_chat:${userId}`;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch loans:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLoan = (loanId) => {
    console.log("ddd:",loanId)
    setSelectedLoanId(loanId);
    setCurrentScreen("loan-chat");
  };

  const filteredLoans = loans.filter((loan) => {
    const borrower = loan.loanData?.parties?.borrower?.toLowerCase() || "";
    const documentName = loan.documentName?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();

    return borrower.includes(search) || documentName.includes(search);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading loan documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            {/* <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"> */}
              {/* <MessageSquare className="w-6 h-6 text-white" /> */}
            {/* </div> */}
            AI Document Chat
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Select a loan document to start chatting with AI
          </p>
        </div>
        <Button variant="outline" onClick={() => setCurrentScreen("portfolio")}>
          Back to Portfolio
        </Button>
      </div>

      {/* AI Info Banner */}
      <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-full shadow-sm">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">
                AI-Powered Document Assistant
              </h3>
              <p className="text-sm text-gray-700 mb-3">
                Get instant answers about your loan documents. Ask about interest rates, 
                repayment terms, covenants, parties involved, or any other details. 
                Our AI assistant analyzes the document to provide accurate responses.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="info" className="text-xs">
                  Natural Language
                </Badge>
                <Badge variant="success" className="text-xs">
                  Instant Responses
                </Badge>
                <Badge variant="warning" className="text-xs">
                  Document-Specific
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-800">
                <span className="text-sm font-medium">{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800"
              >
                ×
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by borrower or document name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Documents</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {loans.length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">AI Ready</p>
                <p className="text-2xl font-bold text-purple-900 mt-1">
                  {loans.filter((l) => l.status === "TEXT_EXTRACTED" || l.status === "EDITED").length}
                </p>
              </div>
              <Sparkles className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">2s</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div> */}

      {/* Loans Grid */}
      {filteredLoans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLoans.map((loan) => (
            <Card
              key={loan.loanId}
              className="hover:shadow-lg transition-all hover:border-blue-100 group"
            //   onClick={() => handleSelectLoan(loan.loanId)}
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                        {loan.loanData?.parties?.borrower || "Unknown Borrower"}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-1">
                        {loan.documentName}
                      </p>
                    </div>
                    {/* <Badge
                      variant={
                        loan.status === "EDITED" ? "warning" : "success"
                      }
                    >
                      {loan.status === "EDITED" ? "Edited" : "Ready"}
                    </Badge> */}
                  </div>

                  {/* Quick Info */}
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Facility Type</span>
                      <span className="font-medium text-gray-900 text-right line-clamp-1">
                        {loan.loanData?.facility?.facilityType || "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Amount</span>
                      <span className="font-medium text-gray-900">
                        {loan.loanData?.facility?.currency}{" "}
                        {loan.loanData?.facility?.facilityAmount || "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Benchmark</span>
                      <Badge variant="info">
                        {loan.loanData?.interest?.benchmark || "N/A"}
                      </Badge>
                    </div>
                  </div>

                  {/* Chat Button */}
                  <div className="pt-2">
                    <Button
                      variant="primary"
                      className="w-full "
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectLoan(loan.loanId);
                      }}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Start Chat
                    </Button>
                  </div>

                  {/* Sample Questions Preview */}
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-1.5">
                      Ask about:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        Interest rates
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        Repayment
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        Covenants
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">
              {searchTerm
                ? "No loans found matching your search"
                : "No loan documents available"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {searchTerm
                ? "Try adjusting your search criteria"
                : "Upload loan documents to start chatting with AI"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}