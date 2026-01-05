// ============================================
// 3. SHARED DOCUMENTS LIST SCREEN
// ============================================

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import { Users, Edit2, FileText, Calendar } from "lucide-react";

export function SharedDocuments({ setCurrentScreen, setSelectedLoanId }) {
  const [sharedLoans, setSharedLoans] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSharedDocuments();
  }, []);

  const fetchSharedDocuments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        "https://nixora-image-latest.onrender.com/api/collaboration/shared-documents",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        const data = await res.json();
        setSharedLoans(data || []);
      }
    } catch (err) {
      console.error("Failed to fetch shared documents:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditDocument = (loanId) => {
    setSelectedLoanId(loanId);
    setCurrentScreen("edit-loan");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading shared documents...</p>
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
            <Users className="w-7 h-7 text-blue-600" />
            Shared Documents
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Documents you've been invited to collaborate on
          </p>
        </div>
        <Button variant="outline" onClick={() => setCurrentScreen("portfolio")}>
          Back to Portfolio
        </Button>
      </div>

      {/* Documents Grid */}
      {sharedLoans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sharedLoans.map((loan) => (
            <Card
              key={loan.loanId}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 line-clamp-2">
                        {loan.loanData?.parties?.borrower || "Unknown Borrower"}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                        {loan.documentName}
                      </p>
                    </div>
                    <Badge variant="info">
                      <Users className="w-3 h-3 mr-1" />
                      Shared
                    </Badge>
                  </div>

                  {/* Details */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Facility Type</span>
                      <span className="font-medium text-gray-900">
                        {loan.loanData?.facility?.facilityType || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Amount</span>
                      <span className="font-medium text-gray-900">
                        {loan.loanData?.facility?.facilityAmount || "N/A"}
                      </span>
                    </div>
                    {loan.sharedBy && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t">
                        <Users className="w-3 h-3" />
                        <span>Shared by {loan.sharedBy}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => handleEditDocument(loan.loanId)}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Document
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No shared documents yet</p>
            <p className="text-sm text-gray-500 mt-1">
              When someone shares a document with you, it will appear here
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
