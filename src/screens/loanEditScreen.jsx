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
  Edit2,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  FileText,
  Users,
  DollarSign,
  Calendar,
  Shield,
  TrendingUp,
  FileCheck,
} from "lucide-react";

import { CollaborationInviteButton } from "../components/CollaborateButton.jsx";

export default function LoanDocumentEditor({ loanId, setCurrentScreen }) {
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    parties: true,
    facility: true,
    interest: false,
    fees: false,
    repayment: false,
    prepayment: false,
    utilisation: false,
    covenants: false,
    eventsOfDefault: false,
    governingLaw: false,
  });

  useEffect(() => {
    if (loanId) {
      fetchLoanDetails();
    }
  }, [loanId]);

  const fetchLoanDetails = async () => {
    const user = localStorage.getItem("user");
    const userId = user ? JSON.parse(user).userId : "guest";
    const CACHE_KEY = `loanDetail:${userId}:${loanId}`;

    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      setLoan(JSON.parse(cached));
      setLoading(false);
    }
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `https://nixora-image-latest.onrender.com/api/loans/documents/getLoan/${loanId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch loan details");

      const data = await res.json();
      setLoan(data);
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch loan details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditField = (path, currentValue) => {
    setEditingField(path);
    setEditValue(currentValue || "");
    setError(null);
    setSuccess(null);
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue("");
  };

  const handleSaveField = async () => {
    const user = localStorage.getItem("user");
    const userId = user ? JSON.parse(user).userId : "guest";
    

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem("accessToken");

      console.log("Updating field:", editingField, "with value:", editValue);
      const res = await fetch(
        `https://nixora-image-latest.onrender.com/api/loans/documents/update-field/${loanId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: editingField,
            value: editValue,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to update field");

      const updatedLoan = await res.json();
      setLoan(updatedLoan);
      setSuccess("Field updated successfully!");
      setEditingField(null);
      setEditValue("");

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
      console.error("Failed to update field:", err);
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const EditableField = ({ label, path, value, multiline = false }) => {
    const isEditing = editingField === path;
    const displayValue = value || "N/A";

    return (
      <div className="py-3 border-b border-gray-100 last:border-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 uppercase mb-1">
              {label}
            </p>
            {isEditing ? (
              <div className="space-y-2">
                {multiline ? (
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    autoFocus
                  />
                ) : (
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                )}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleSaveField}
                    disabled={saving}
                  >
                    {saving ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Save className="w-3 h-3 mr-1" />
                        Save
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={saving}
                  >
                    <X className="w-3 h-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-900 break-words">
                {displayValue}
              </p>
            )}
          </div>
          {!isEditing && (
            <button
              onClick={() => handleEditField(path, value)}
              className="flex-shrink-0 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit field"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  const ArrayField = ({ label, path, items = [] }) => {
    return (
      <div className="py-3 border-b border-gray-100 last:border-0">
        <p className="text-xs font-medium text-gray-500 uppercase mb-2">
          {label}
        </p>
        {items.length > 0 ? (
          <div className="space-y-1">
            {items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded"
              >
                <p className="text-sm text-gray-900">{item}</p>
                <button
                  onClick={() =>
                    handleEditField(`${path}[${index}]`, item)
                  }
                  className="p-1 text-gray-400 hover:text-blue-600 rounded"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No items</p>
        )}
      </div>
    );
  };

  const Section = ({ title, icon: Icon, section, children }) => {
    const isExpanded = expandedSections[section];

    return (
      <Card className="overflow-hidden">
        <button
          onClick={() => toggleSection(section)}
          className="w-full"
        >
          <CardHeader className="hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg">{title}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{section}</Badge>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </CardHeader>
        </button>
        {isExpanded && <CardContent className="pt-4">{children}</CardContent>}
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading loan details...</p>
        </div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="p-6">
        <Card className="p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">Loan not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            {/* <FileText className="w-7 h-7 text-blue-600" /> */}
            Edit Loan Document
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {loan.loanData?.parties?.borrower || "Unknown Borrower"}
          </p>
        </div>
        <div className="flex items-center gap-3">
             <CollaborationInviteButton loanId={loanId} />
          {/* <Badge
            variant={loan.status === "EDITED" ? "warning" : "success"}
          >
            {loan.status}
          </Badge> */}
          <Button
            variant="outline"
            onClick={() => setCurrentScreen("loan-details")}
          >
            Back
          </Button>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                {success}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-red-800">
                  {error}
                </span>
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

      {/* Document Info */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
        <CardContent className="p-6">
          <div className=" gap-4">
            <div>
              <p className="text-sm font-medium text-blue-600 uppercase mb-1">
                Document Name
              </p>
              <p className="text-sm text-blue-900">{loan.documentName}</p>
            </div>
            {/* <div>
              <p className="text-sm font-medium text-blue-600 uppercase mb-1">
                Loan ID
              </p>
              <p className="text-sm text-blue-900 font-mono">
                {loan.loanId.substring(0, 13)}...
              </p>
            </div> */}
            {/* <div>
              <p className="text-sm font-medium text-blue-600 uppercase mb-1">
                Status
              </p>
              <Badge
                variant={loan.status === "EDITED" ? "warning" : "success"}
              >
                {loan.status}
              </Badge>
            </div> */}
          </div>
        </CardContent>
      </Card>

      {/* Parties Section */}
      <Section title="Parties" icon={Users} section="parties">
        <div className="space-y-2">
          <EditableField
            label="Borrower"
            path="parties.borrower"
            value={loan.loanData?.parties?.borrower}
          />
          <EditableField
            label="Parent"
            path="parties.parent"
            value={loan.loanData?.parties?.parent}
          />
          <EditableField
            label="Guarantor"
            path="parties.guarantor"
            value={loan.loanData?.parties?.guarantor}
          />
          <EditableField
            label="Facility Agent"
            path="parties.facilityAgent"
            value={loan.loanData?.parties?.facilityAgent}
          />
          <EditableField
            label="Security Agent"
            path="parties.securityAgent"
            value={loan.loanData?.parties?.securityAgent}
          />
          <EditableField
            label="Arranger"
            path="parties.arranger"
            value={loan.loanData?.parties?.arranger}
          />
          <EditableField
            label="Bookrunner"
            path="parties.bookrunner"
            value={loan.loanData?.parties?.bookrunner}
          />
          <ArrayField
            label="Lenders"
            path="parties.lenders"
            items={loan.loanData?.parties?.lenders}
          />
        </div>
      </Section>

      {/* Facility Section */}
      <Section title="Facility Details" icon={FileCheck} section="facility">
        <div className="space-y-2">
          <EditableField
            label="Facility Type"
            path="facility.facilityType"
            value={loan.loanData?.facility?.facilityType}
          />
          <EditableField
            label="Facility Name"
            path="facility.facilityName"
            value={loan.loanData?.facility?.facilityName}
          />
          <EditableField
            label="Currency"
            path="facility.currency"
            value={loan.loanData?.facility?.currency}
          />
          <EditableField
            label="Facility Amount"
            path="facility.facilityAmount"
            value={loan.loanData?.facility?.facilityAmount}
          />
          <EditableField
            label="Availability Period"
            path="facility.availabilityPeriod"
            value={loan.loanData?.facility?.availabilityPeriod}
            multiline
          />
          <EditableField
            label="Final Maturity Date"
            path="facility.finalMaturityDate"
            value={loan.loanData?.facility?.finalMaturityDate}
          />
          <EditableField
            label="Repayment Profile"
            path="facility.repaymentProfile"
            value={loan.loanData?.facility?.repaymentProfile}
          />
        </div>
      </Section>

      {/* Interest Section */}
      <Section title="Interest & Pricing" icon={TrendingUp} section="interest">
        <div className="space-y-2">
          <EditableField
            label="Benchmark"
            path="interest.benchmark"
            value={loan.loanData?.interest?.benchmark}
          />
          <EditableField
            label="Margin"
            path="interest.margin"
            value={loan.loanData?.interest?.margin}
          />
          <EditableField
            label="Interest Period"
            path="interest.interestPeriod"
            value={loan.loanData?.interest?.interestPeriod}
          />
          <EditableField
            label="Interest Payment Date"
            path="interest.interestPaymentDate"
            value={loan.loanData?.interest?.interestPaymentDate}
          />
          <EditableField
            label="Default Interest"
            path="interest.defaultInterest"
            value={loan.loanData?.interest?.defaultInterest}
            multiline
          />
          <EditableField
            label="Day Count Fraction"
            path="interest.dayCountFraction"
            value={loan.loanData?.interest?.dayCountFraction}
          />
        </div>
      </Section>

      {/* Fees Section */}
      <Section title="Fees" icon={DollarSign} section="fees">
        <div className="space-y-2">
          <EditableField
            label="Arrangement Fee"
            path="fees.arrangementFee"
            value={loan.loanData?.fees?.arrangementFee}
          />
          <EditableField
            label="Commitment Fee"
            path="fees.commitmentFee"
            value={loan.loanData?.fees?.commitmentFee}
          />
          <EditableField
            label="Utilisation Fee"
            path="fees.utilisationFee"
            value={loan.loanData?.fees?.utilisationFee}
          />
          <EditableField
            label="Agency Fee"
            path="fees.agencyFee"
            value={loan.loanData?.fees?.agencyFee}
          />
          <EditableField
            label="Cancellation Fee"
            path="fees.cancellationFee"
            value={loan.loanData?.fees?.cancellationFee}
          />
        </div>
      </Section>

      {/* Governing Law Section */}
      <Section title="Governing Law" icon={Shield} section="governingLaw">
        <div className="space-y-2">
          <EditableField
            label="Governing Law"
            path="governingLaw.governingLaw"
            value={loan.loanData?.governingLaw?.governingLaw}
          />
          <EditableField
            label="Jurisdiction"
            path="governingLaw.jurisdiction"
            value={loan.loanData?.governingLaw?.jurisdiction}
            multiline
          />
        </div>
      </Section>
    </div>
  );
}