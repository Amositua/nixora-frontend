// import { useEffect, useState } from "react";
// import { Card, CardContent } from "../components/ui/Card";
// // import Badge from "../components/ui/Badge";
// import Button from "../components/ui/Button";

// import LoanSection from "../components/loan/loanSection";
// import LoanDetailItem from "../components/loan/loanDetailItem";
// import { FloatingChatButton } from "../components/floatingChatButton";

// // export function FloatingChatButton({ onClick }) {
// //   return (
// //     <button
// //       onClick={onClick}
// //       className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-40"
// //       title="Chat with AI about this document"
// //     >
// //       <MessageSquare className="w-6 h-6" />
// //     </button>
// //   );
// // }

// export default function LoanDetails({
//   loanId,
//   setSelectedLoanId,
//   setCurrentScreen,
// }) {
//   const [loan, setLoan] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
//   const [deleting, setDeleting] = useState(false);

//   useEffect(() => {
//     if (!loanId) return;

//     const user = localStorage.getItem("user");
//     const userId = user ? JSON.parse(user).userId : "guest";
//     const CACHE_KEY = `loanDetail:${userId}:${loanId}`;

//     const cached = localStorage.getItem(CACHE_KEY);
//     if (cached) {
//       setLoan(JSON.parse(cached));
//       setLoading(false);
//     }

//     const fetchLoan = async () => {
//       try {
//         const token = localStorage.getItem("accessToken");
//         const res = await fetch(
//           `https://nixora-image-latest.onrender.com/api/loans/documents/getLoan/${loanId}`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );

//         const data = await res.json();
//         setLoan(data);
//         localStorage.setItem(CACHE_KEY, JSON.stringify(data));
//       } catch (err) {
//         console.error("Failed to fetch loan", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchLoan();
//   }, [loanId]);

//   if (loading && !loan) {
//     return (
//       <div className="flex justify-center py-20">
//         <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
//       </div>
//     );
//   }

//   if (!loan) return <p className="p-6">Loan not found</p>;

//   const {
//     parties,
//     facility,
//     interest,
//     fees,
//     repayment,
//     prepayment,
//     utilisation,
//     covenants,
//     eventsOfDefault,
//     // representations,
//     // transfers,
//     governingLaw,
//   } = loan.loanData;

//   const handleDeleteLoan = async () => {
//     setDeleting(true); // optional: show "Deleting..."
//     try {
//       const token = localStorage.getItem("accessToken");

//       const res = await fetch(
//         `https://nixora-image-latest.onrender.com/api/loans/documents/delete-loan/${loanId}`,
//         {
//           method: "DELETE",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (!res.ok) throw new Error("Failed to delete loan");

//       // ✅ Remove this loan from cached loan list
//       const user = localStorage.getItem("user");
//       const userId = user ? JSON.parse(user).userId : "guest";
//       const LIST_KEY = `loanDocuments:${userId}`;
//       const cachedList = JSON.parse(localStorage.getItem(LIST_KEY) || "[]");
//       const updatedList = cachedList.filter((l) => l.id !== loanId);
//       localStorage.setItem(LIST_KEY, JSON.stringify(updatedList));

//       // ✅ Remove loan detail cache
//       localStorage.removeItem(`loanDetail:${userId}:${loanId}`);

//       setDeleting(false);
//       setShowDeleteConfirm(false);

//       // Go back to Portfolio
//       setCurrentScreen("portfolio");
//     } catch (err) {
//       console.error("Failed to delete loan", err);
//       setDeleting(false);
//       alert("Failed to delete loan. Please try again.");
//     }
//   };

//   return (
//     <>
//       <div className="p-6 space-y-6">
//         <div className="mb-8">
//           <div className="flex items-center justify-between mb-6">
//             <div>
//               <h1 className="text-4xl font-bold text-slate-900 mb-2">
//                 Loan Document
//               </h1>
//               <p className="text-slate-600">Review and manage loan details</p>
//             </div>
//             <Button
//               variant="outline"
//               onClick={() => setCurrentScreen("portfolio")}
//               className="shadow-sm"
//             >
//               ← Back to Portfolio
//             </Button>
//           </div>

//           {/* Action Buttons */}
//           <div className="flex gap-3">
//             <Button
//               variant="outline"
//               onClick={() => {
//                 setSelectedLoanId(loan.loanId);
//                 setCurrentScreen("edit-loan");
//               }}
//               className="shadow-sm hover:shadow-md transition-shadow"
//             >
//               ✎ Edit Document
//             </Button>
//           </div>
//         </div>

//         <FloatingChatButton
//           onClick={() => {
//             setSelectedLoanId(loan.loanId);
//             setCurrentScreen("loan-chat");
//           }}
//         />

//         {/* Document Info */}
//               <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
//                 <CardContent className="p-6">
//                   <div className=" gap-4">
//                     <div>
//                       <p className="text-sm font-medium text-blue-600 uppercase mb-1">
//                         Document Name
//                       </p>
//                       <p className="text-sm text-blue-900">{loan.documentName}</p>
//                     </div>
//                     {/* <div>
//                       <p className="text-sm font-medium text-blue-600 uppercase mb-1">
//                         Loan ID
//                       </p>
//                       <p className="text-sm text-blue-900 font-mono">
//                         {loan.loanId.substring(0, 13)}...
//                       </p>
//                     </div> */}
//                     {/* <div>
//                       <p className="text-sm font-medium text-blue-600 uppercase mb-1">
//                         Status
//                       </p>
//                       <Badge
//                         variant={loan.status === "EDITED" ? "warning" : "success"}
//                       >
//                         {loan.status}
//                       </Badge>
//                     </div> */}
//                   </div>
//                 </CardContent>
//               </Card>

//         <Card className="p-6 space-y-8">
//           <LoanSection title="Parties">
//             <LoanDetailItem label="Borrower" value={parties.borrower} />
//             <LoanDetailItem label="Parent" value={parties.parent} />
//             <LoanDetailItem label="Guarantor" value={parties.guarantor} />
//             <LoanDetailItem label="Obligors" value={parties.obligors} />
//             <LoanDetailItem label="Lenders" value={parties.lenders} />
//             <LoanDetailItem
//               label="Original Lenders"
//               value={parties.originalLenders}
//             />
//             <LoanDetailItem
//               label="Finance Parties"
//               value={parties.financeParties}
//             />
//             <LoanDetailItem
//               label="Facility Agent"
//               value={parties.facilityAgent}
//             />
//             <LoanDetailItem
//               label="Security Agent"
//               value={parties.securityAgent}
//             />
//             <LoanDetailItem label="Arranger" value={parties.arranger} />
//             <LoanDetailItem label="Bookrunner" value={parties.bookrunner} />
//           </LoanSection>

//           <div className="border-t border-gray-200 my-4"></div>

//           <LoanSection title="Facility">
//             <LoanDetailItem label="Facility ID" value={facility.facilityId} />
//             <LoanDetailItem
//               label="Facility Type"
//               value={facility.facilityType}
//             />
//             <LoanDetailItem
//               label="Facility Name"
//               value={facility.facilityName}
//             />
//             <LoanDetailItem label="Currency" value={facility.currency} />
//             <LoanDetailItem
//               label="Facility Amount"
//               value={facility.facilityAmount}
//             />
//             <LoanDetailItem label="Commitment" value={facility.commitment} />
//             <LoanDetailItem
//               label="Availability Period"
//               value={facility.availabilityPeriod}
//             />
//             <LoanDetailItem label="Drawstop" value={facility.drawstop} />
//             <LoanDetailItem
//               label="Final Maturity Date"
//               value={facility.finalMaturityDate}
//             />
//             <LoanDetailItem
//               label="Repayment Profile"
//               value={facility.repaymentProfile}
//             />
//             <LoanDetailItem label="Purpose" value={facility.purpose} />
//           </LoanSection>

//           <div className="border-t border-gray-200 my-4"></div>

//           <LoanSection title="Interest">
//             <LoanDetailItem label="Benchmark" value={interest.benchmark} />
//             <LoanDetailItem label="Margin" value={interest.margin} />
//             <LoanDetailItem
//               label="Credit Adjustment Spread"
//               value={interest.creditAdjustmentSpread}
//             />
//             <LoanDetailItem
//               label="Interest Period"
//               value={interest.interestPeriod}
//             />
//             <LoanDetailItem
//               label="Interest Payment Date"
//               value={interest.interestPaymentDate}
//             />
//             <LoanDetailItem label="Break Costs" value={interest.breakCosts} />
//             <LoanDetailItem
//               label="Default Interest"
//               value={interest.defaultInterest}
//             />
//             <LoanDetailItem
//               label="Day Count Fraction"
//               value={interest.dayCountFraction}
//             />
//             <LoanDetailItem
//               label="Compounding Method"
//               value={interest.compoundingMethod}
//             />
//             <LoanDetailItem label="Rollover" value={interest.rollover} />
//           </LoanSection>

//           <div className="border-t border-gray-200 my-4"></div>

//           <LoanSection title="Fees">
//             <LoanDetailItem
//               label="Arrangement Fee"
//               value={fees.arrangementFee}
//             />
//             <LoanDetailItem
//               label="Participation Fee"
//               value={fees.participationFee}
//             />
//             <LoanDetailItem label="Commitment Fee" value={fees.commitmentFee} />
//             <LoanDetailItem
//               label="Utilisation Fee"
//               value={fees.utilisationFee}
//             />
//             <LoanDetailItem label="Agency Fee" value={fees.agencyFee} />
//             <LoanDetailItem
//               label="Cancellation Fee"
//               value={fees.cancellationFee}
//             />
//             <LoanDetailItem label="Front End Fee" value={fees.frontEndFee} />
//           </LoanSection>

//           <div className="border-t border-gray-200 my-4"></div>

//           <LoanSection title="Repayment">
//             <LoanDetailItem
//               label="Repayment Date"
//               value={repayment.repaymentDate}
//             />
//             <LoanDetailItem
//               label="Repayment Instalments"
//               value={repayment.repaymentInstalments}
//             />
//             <LoanDetailItem
//               label="Amortisation Schedule"
//               value={repayment.amortisationSchedule}
//             />
//             <LoanDetailItem
//               label="Balloon Payment"
//               value={repayment.balloonPayment}
//             />
//             <LoanDetailItem
//               label="Voluntary Prepayment"
//               value={repayment.voluntaryPrepayment}
//             />
//             <LoanDetailItem
//               label="Mandatory Prepayment"
//               value={repayment.mandatoryPrepayment}
//             />
//             <LoanDetailItem
//               label="Change of Control Prepayment"
//               value={repayment.changeOfControlPrepayment}
//             />
//             <LoanDetailItem
//               label="Illegality Prepayment"
//               value={repayment.illegalityPrepayment}
//             />
//             <LoanDetailItem
//               label="Tax Gross-Up Prepayment"
//               value={repayment.taxGrossUpPrepayment}
//             />
//           </LoanSection>

//           <div className="border-t border-gray-200 my-4"></div>

//           <LoanSection title="Prepayment">
//             <LoanDetailItem
//               label="Prepayment Type"
//               value={prepayment.prepaymentType}
//             />
//             <LoanDetailItem label="Voluntary" value={prepayment.voluntary} />
//             <LoanDetailItem label="Asset Sale" value={prepayment.assetSale} />
//             <LoanDetailItem
//               label="Insurance Proceeds"
//               value={prepayment.insuranceProceeds}
//             />
//             <LoanDetailItem
//               label="Debt Issuance"
//               value={prepayment.debtIssuance}
//             />
//             <LoanDetailItem
//               label="Change of Control"
//               value={prepayment.changeOfControl}
//             />
//             <LoanDetailItem label="Illegality" value={prepayment.illegality} />
//             <LoanDetailItem label="Tax" value={prepayment.tax} />
//             <LoanDetailItem label="Break Costs" value={prepayment.breakCosts} />
//             <LoanDetailItem
//               label="Prepayment Fee"
//               value={prepayment.prepaymentFee}
//             />
//           </LoanSection>

//           <div className="border-t border-gray-200 my-4"></div>

//           <LoanSection title="Utilisation">
//             <LoanDetailItem
//               label="Utilisation Request"
//               value={utilisation.utilisationRequest}
//             />
//             <LoanDetailItem
//               label="Utilisation Date"
//               value={utilisation.utilisationDate}
//             />
//             <LoanDetailItem
//               label="Utilisation Amount"
//               value={utilisation.utilisationAmount}
//             />
//             <LoanDetailItem
//               label="Utilisation Currency"
//               value={utilisation.utilisationCurrency}
//             />
//             <LoanDetailItem
//               label="Utilisation Notice"
//               value={utilisation.utilisationNotice}
//             />
//             <LoanDetailItem
//               label="Minimum Amount"
//               value={utilisation.minimumAmount}
//             />
//             <LoanDetailItem
//               label="Multiple Drawings"
//               value={utilisation.multipleDrawings}
//             />
//             <LoanDetailItem
//               label="Cancelled Commitments"
//               value={utilisation.cancelledCommitments}
//             />
//           </LoanSection>

//           <div className="border-t border-gray-200 my-4"></div>

//           <LoanSection title="Covenants">
//             <LoanDetailItem label="Financial" value={covenants.financial} />
//             <LoanDetailItem label="Information" value={covenants.information} />
//             <LoanDetailItem label="General" value={covenants.general} />
//             <LoanDetailItem
//               label="Negative Pledge"
//               value={covenants.negativePledge}
//             />
//             <LoanDetailItem label="Disposals" value={covenants.disposals} />
//             <LoanDetailItem label="Mergers" value={covenants.mergers} />
//             <LoanDetailItem
//               label="Change of Business"
//               value={covenants.changeOfBusiness}
//             />
//             <LoanDetailItem
//               label="Indebtedness"
//               value={covenants.indebtedness}
//             />
//             <LoanDetailItem label="Guarantees" value={covenants.guarantees} />
//           </LoanSection>

//           <div className="border-t border-gray-200 my-4"></div>

//           <LoanSection title="Events of Default">
//             <LoanDetailItem
//               label="Non-Payment"
//               value={eventsOfDefault.nonPayment}
//             />
//             <LoanDetailItem
//               label="Financial Covenant Breach"
//               value={eventsOfDefault.financialCovenantBreach}
//             />
//             <LoanDetailItem
//               label="Other Obligation Breach"
//               value={eventsOfDefault.otherObligationBreach}
//             />
//             <LoanDetailItem
//               label="Misrepresentation"
//               value={eventsOfDefault.misrepresentation}
//             />
//             <LoanDetailItem
//               label="Cross Default"
//               value={eventsOfDefault.crossDefault}
//             />
//             <LoanDetailItem
//               label="Insolvency"
//               value={eventsOfDefault.insolvency}
//             />
//             <LoanDetailItem
//               label="Creditors Process"
//               value={eventsOfDefault.creditorsProcess}
//             />
//             <LoanDetailItem
//               label="Unlawfulness"
//               value={eventsOfDefault.unlawfulness}
//             />
//             <LoanDetailItem
//               label="Change of Control"
//               value={eventsOfDefault.changeOfControl}
//             />
//             <LoanDetailItem
//               label="Repudiation"
//               value={eventsOfDefault.repudiation}
//             />
//             <LoanDetailItem
//               label="Audit Qualification"
//               value={eventsOfDefault.auditQualification}
//             />
//           </LoanSection>

//           {/* <div className="border-t border-gray-200 my-4"></div>

//         <LoanSection title="Representations">
//             <LoanDetailItem label="Binding Obligations" value={representations.bindingObligations} />
// <LoanDetailItem label="Non-Conflict" value={representations.nonConflict} />
// <LoanDetailItem label="Power and Authority" value={representations.powerAndAuthority} />
// <LoanDetailItem label="No Default" value={representations.noDefault} />
// <LoanDetailItem label="Financial Statements" value={representations.financialStatements} />
// <LoanDetailItem label="Litigation" value={representations.litigation} />
// <LoanDetailItem label="Environmental" value={representations.environmental} />
// <LoanDetailItem label="Tax" value={representations.tax} />

//         </LoanSection> */}

//           <div className="border-t border-gray-200 my-4"></div>

//           {/* considering the data responds type  */}
//           {/* <LoanSection title="Transfers">
//             <LoanDetailItem label="Transfer Conditions" value={transfers.transferConditions} />
//         </LoanSection> */}

//           {/* <div className="border-t border-gray-200 my-4"></div> */}

//           <LoanSection title="Governing Law">
//             <LoanDetailItem
//               label="Governing Law"
//               value={governingLaw.governingLaw}
//             />
//             <LoanDetailItem
//               label="Jurisdiction"
//               value={governingLaw.jurisdiction}
//             />
//           </LoanSection>

//           {/* <div className="border-t border-gray-200 my-4"></div> */}

//           {/* <Badge variant="success">{loan.status}</Badge> */}
//           <div className="flex justify-end pt-6 space-x-2">
//             <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
//               Delete Loan
//             </Button>
//           </div>
//         </Card>
//       </div>

//       {showDeleteConfirm && (
//         <div className="fixed top-0 inset-0 h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
//           <div className="bg-white rounded-lg p-6 w-96 space-y-4">
//             <h2 className="text-lg font-semibold text-gray-800">
//               Confirm Delete
//             </h2>
//             <p className="text-sm text-gray-600">
//               Are you sure you want to delete this loan? This action cannot be
//               undone.
//             </p>
//             <div className="flex justify-end space-x-2">
//               <Button
//                 variant="outline"
//                 onClick={() => setShowDeleteConfirm(false)}
//                 disabled={deleting}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 variant="destructive"
//                 onClick={handleDeleteLoan}
//                 disabled={deleting}
//               >
//                 {deleting ? "Deleting..." : "Delete"}
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

import { useEffect, useState } from "react";
import { Card, CardContent } from "../components/ui/Card";
// import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";

import LoanSection from "../components/loan/loanSection";
import LoanDetailItem from "../components/loan/loanDetailItem";
import { FloatingChatButton } from "../components/floatingChatButton"

export default function LoanDetails({ loanId, setSelectedLoanId, setCurrentScreen }) {
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!loanId) return;

    const user = localStorage.getItem("user");
    const userId = user ? JSON.parse(user).userId : "guest";
    const CACHE_KEY = `loanDetail:${userId}:${loanId}`;

    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      setLoan(JSON.parse(cached));
      setLoading(false);
    }

    const fetchLoan = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(
          `https://nixora-image-latest.onrender.com/api/loans/documents/getLoan/${loanId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();
        setLoan(data);
        localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      } catch (err) {
        console.error("Failed to fetch loan", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLoan();
  }, [loanId]);

  if (loading && !loan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 text-sm font-medium">Loading loan details...</p>
        </div>
      </div>
    );
  }

  if (!loan) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <span className="text-red-600 text-2xl">⚠</span>
        </div>
        <p className="text-slate-700 font-medium">Loan not found</p>
      </div>
    </div>
  );

  const { parties, facility, interest, fees, repayment, prepayment, utilisation, covenants, eventsOfDefault, governingLaw } = loan.loanData;

  const handleDeleteLoan = async () => {
    setDeleting(true);
    try {
      const token = localStorage.getItem("accessToken");

      const res = await fetch(
        `https://nixora-image-latest.onrender.com/api/loans/documents/delete-loan/${loanId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to delete loan");

      const user = localStorage.getItem("user");
      const userId = user ? JSON.parse(user).userId : "guest";
      const LIST_KEY = `loanDocuments:${userId}`;
      const cachedList = JSON.parse(localStorage.getItem(LIST_KEY) || "[]");
      const updatedList = cachedList.filter((l) => l.id !== loanId);
      localStorage.setItem(LIST_KEY, JSON.stringify(updatedList));

      localStorage.removeItem(`loanDetail:${userId}:${loanId}`);

      setDeleting(false);
      setShowDeleteConfirm(false);

      setCurrentScreen("portfolio");
    } catch (err) {
      console.error("Failed to delete loan", err);
      setDeleting(false);
      alert("Failed to delete loan. Please try again.");
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-slate-900 mb-2">Loan Document</h1>
                <p className="text-slate-600">Review and manage loan details</p>
              </div>
              <Button variant="outline" onClick={() => setCurrentScreen("portfolio")} className="shadow-sm">
                ← Back to Portfolio
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedLoanId(loan.loanId);
                  setCurrentScreen("edit-loan");
                }}
                className="shadow-sm hover:shadow-md transition-shadow"
              >
                ✎ Edit Document
              </Button>
            </div>
          </div>

          <FloatingChatButton
          onClick={() => {
            setSelectedLoanId(loan.loanId);
            setCurrentScreen("loan-chat");
          }}
        />

          {/* Document Info */}
              <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200 mb-4">
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

          {/* Main Content Card */}
          <Card className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200">
            <div className="p-8 space-y-10">

              {/* Parties Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <LoanSection title="Parties">
                  <LoanDetailItem label="Borrower" value={parties.borrower} />
                  <LoanDetailItem label="Parent" value={parties.parent} />
                  <LoanDetailItem label="Guarantor" value={parties.guarantor} />
                  <LoanDetailItem label="Obligors" value={parties.obligors} />
                  <LoanDetailItem label="Lenders" value={parties.lenders} />
                  <LoanDetailItem label="Original Lenders" value={parties.originalLenders} />
                  <LoanDetailItem label="Finance Parties" value={parties.financeParties} />
                  <LoanDetailItem label="Facility Agent" value={parties.facilityAgent} />
                  <LoanDetailItem label="Security Agent" value={parties.securityAgent} />
                  <LoanDetailItem label="Arranger" value={parties.arranger} />
                  <LoanDetailItem label="Bookrunner" value={parties.bookrunner} />
                </LoanSection>
              </div>

              {/* Facility Section */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
                <LoanSection title="Facility">
                  <LoanDetailItem label="Facility ID" value={facility.facilityId} />
                  <LoanDetailItem label="Facility Type" value={facility.facilityType} />
                  <LoanDetailItem label="Facility Name" value={facility.facilityName} />
                  <LoanDetailItem label="Currency" value={facility.currency} />
                  <LoanDetailItem label="Facility Amount" value={facility.facilityAmount} />
                  <LoanDetailItem label="Commitment" value={facility.commitment} />
                  <LoanDetailItem label="Availability Period" value={facility.availabilityPeriod} />
                  <LoanDetailItem label="Drawstop" value={facility.drawstop} />
                  <LoanDetailItem label="Final Maturity Date" value={facility.finalMaturityDate} />
                  <LoanDetailItem label="Repayment Profile" value={facility.repaymentProfile} />
                  <LoanDetailItem label="Purpose" value={facility.purpose} />
                </LoanSection>
              </div>

              {/* Interest Section */}
              <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-6 border border-violet-100">
                <LoanSection title="Interest">
                  <LoanDetailItem label="Benchmark" value={interest.benchmark} />
                  <LoanDetailItem label="Margin" value={interest.margin} />
                  <LoanDetailItem label="Credit Adjustment Spread" value={interest.creditAdjustmentSpread} />
                  <LoanDetailItem label="Interest Period" value={interest.interestPeriod} />
                  <LoanDetailItem label="Interest Payment Date" value={interest.interestPaymentDate} />
                  <LoanDetailItem label="Break Costs" value={interest.breakCosts} />
                  <LoanDetailItem label="Default Interest" value={interest.defaultInterest} />
                  <LoanDetailItem label="Day Count Fraction" value={interest.dayCountFraction} />
                  <LoanDetailItem label="Compounding Method" value={interest.compoundingMethod} />
                  <LoanDetailItem label="Rollover" value={interest.rollover} />
                </LoanSection>
              </div>

              {/* Fees Section */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
                <LoanSection title="Fees">
                  <LoanDetailItem label="Arrangement Fee" value={fees.arrangementFee} />
                  <LoanDetailItem label="Participation Fee" value={fees.participationFee} />
                  <LoanDetailItem label="Commitment Fee" value={fees.commitmentFee} />
                  <LoanDetailItem label="Utilisation Fee" value={fees.utilisationFee} />
                  <LoanDetailItem label="Agency Fee" value={fees.agencyFee} />
                  <LoanDetailItem label="Cancellation Fee" value={fees.cancellationFee} />
                  <LoanDetailItem label="Front End Fee" value={fees.frontEndFee} />
                </LoanSection>
              </div>

              {/* Repayment Section */}
              <div className="bg-gradient-to-r from-cyan-50 to-sky-50 rounded-xl p-6 border border-cyan-100">
                <LoanSection title="Repayment">
                  <LoanDetailItem label="Repayment Date" value={repayment.repaymentDate} />
                  <LoanDetailItem label="Repayment Instalments" value={repayment.repaymentInstalments} />
                  <LoanDetailItem label="Amortisation Schedule" value={repayment.amortisationSchedule} />
                  <LoanDetailItem label="Balloon Payment" value={repayment.balloonPayment} />
                  <LoanDetailItem label="Voluntary Prepayment" value={repayment.voluntaryPrepayment} />
                  <LoanDetailItem label="Mandatory Prepayment" value={repayment.mandatoryPrepayment} />
                  <LoanDetailItem label="Change of Control Prepayment" value={repayment.changeOfControlPrepayment} />
                  <LoanDetailItem label="Illegality Prepayment" value={repayment.illegalityPrepayment} />
                  <LoanDetailItem label="Tax Gross-Up Prepayment" value={repayment.taxGrossUpPrepayment} />
                </LoanSection>
              </div>

              {/* Prepayment Section */}
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-6 border border-rose-100">
                <LoanSection title="Prepayment">
                  <LoanDetailItem label="Prepayment Type" value={prepayment.prepaymentType} />
                  <LoanDetailItem label="Voluntary" value={prepayment.voluntary} />
                  <LoanDetailItem label="Asset Sale" value={prepayment.assetSale} />
                  <LoanDetailItem label="Insurance Proceeds" value={prepayment.insuranceProceeds} />
                  <LoanDetailItem label="Debt Issuance" value={prepayment.debtIssuance} />
                  <LoanDetailItem label="Change of Control" value={prepayment.changeOfControl} />
                  <LoanDetailItem label="Illegality" value={prepayment.illegality} />
                  <LoanDetailItem label="Tax" value={prepayment.tax} />
                  <LoanDetailItem label="Break Costs" value={prepayment.breakCosts} />
                  <LoanDetailItem label="Prepayment Fee" value={prepayment.prepaymentFee} />
                </LoanSection>
              </div>

              {/* Utilisation Section */}
              <div className="bg-gradient-to-r from-lime-50 to-green-50 rounded-xl p-6 border border-lime-100">
                <LoanSection title="Utilisation">
                  <LoanDetailItem label="Utilisation Request" value={utilisation.utilisationRequest} />
                  <LoanDetailItem label="Utilisation Date" value={utilisation.utilisationDate} />
                  <LoanDetailItem label="Utilisation Amount" value={utilisation.utilisationAmount} />
                  <LoanDetailItem label="Utilisation Currency" value={utilisation.utilisationCurrency} />
                  <LoanDetailItem label="Utilisation Notice" value={utilisation.utilisationNotice} />
                  <LoanDetailItem label="Minimum Amount" value={utilisation.minimumAmount} />
                  <LoanDetailItem label="Multiple Drawings" value={utilisation.multipleDrawings} />
                  <LoanDetailItem label="Cancelled Commitments" value={utilisation.cancelledCommitments} />
                </LoanSection>
              </div>

              {/* Covenants Section */}
              <div className="bg-gradient-to-r from-fuchsia-50 to-purple-50 rounded-xl p-6 border border-fuchsia-100">
                <LoanSection title="Covenants">
                  <LoanDetailItem label="Financial" value={covenants.financial} />
                  <LoanDetailItem label="Information" value={covenants.information} />
                  <LoanDetailItem label="General" value={covenants.general} />
                  <LoanDetailItem label="Negative Pledge" value={covenants.negativePledge} />
                  <LoanDetailItem label="Disposals" value={covenants.disposals} />
                  <LoanDetailItem label="Mergers" value={covenants.mergers} />
                  <LoanDetailItem label="Change of Business" value={covenants.changeOfBusiness} />
                  <LoanDetailItem label="Indebtedness" value={covenants.indebtedness} />
                  <LoanDetailItem label="Guarantees" value={covenants.guarantees} />
                </LoanSection>
              </div>

              {/* Events of Default Section */}
              <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-xl p-6 border border-red-100">
                <LoanSection title="Events of Default">
                  <LoanDetailItem label="Non-Payment" value={eventsOfDefault.nonPayment} />
                  <LoanDetailItem label="Financial Covenant Breach" value={eventsOfDefault.financialCovenantBreach} />
                  <LoanDetailItem label="Other Obligation Breach" value={eventsOfDefault.otherObligationBreach} />
                  <LoanDetailItem label="Misrepresentation" value={eventsOfDefault.misrepresentation} />
                  <LoanDetailItem label="Cross Default" value={eventsOfDefault.crossDefault} />
                  <LoanDetailItem label="Insolvency" value={eventsOfDefault.insolvency} />
                  <LoanDetailItem label="Creditors Process" value={eventsOfDefault.creditorsProcess} />
                  <LoanDetailItem label="Unlawfulness" value={eventsOfDefault.unlawfulness} />
                  <LoanDetailItem label="Change of Control" value={eventsOfDefault.changeOfControl} />
                  <LoanDetailItem label="Repudiation" value={eventsOfDefault.repudiation} />
                  <LoanDetailItem label="Audit Qualification" value={eventsOfDefault.auditQualification} />
                </LoanSection>
              </div>

              {/* Governing Law Section */}
              <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-6 border border-slate-200">
                <LoanSection title="Governing Law">
                  <LoanDetailItem label="Governing Law" value={governingLaw.governingLaw} />
                  <LoanDetailItem label="Jurisdiction" value={governingLaw.jurisdiction} />
                </LoanSection>
              </div>

              {/* Delete Button */}
              <div className="flex justify-end pt-8 border-t border-slate-200">
                <Button
                  variant="danger"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="shadow-md hover:shadow-lg transition-shadow"
                >
                  🗑 Delete Loan
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-red-600 text-2xl">⚠</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Confirm Delete</h2>
                <p className="text-sm text-slate-600 mt-1">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-slate-700 leading-relaxed">
              Are you sure you want to permanently delete this loan document? All associated data will be removed from your portfolio.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
                className="min-w-24"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteLoan}
                disabled={deleting}
                className="min-w-24 shadow-md"
              >
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
