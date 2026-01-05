import { useEffect, useState } from "react";
import { Card } from "../components/ui/Card";
// import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";

import LoanSection from "../components/loan/loanSection";
import LoanDetailItem from "../components/loan/loanDetailItem";

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
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!loan) return <p className="p-6">Loan not found</p>;

  const { parties, facility, interest, fees, repayment, prepayment, utilisation, covenants, eventsOfDefault, 
    // representations, 
    // transfers,
     governingLaw } = loan.loanData;

  const handleDeleteLoan = async () => {
  setDeleting(true); // optional: show "Deleting..."
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

    // ✅ Remove this loan from cached loan list
    const user = localStorage.getItem("user");
    const userId = user ? JSON.parse(user).userId : "guest";
    const LIST_KEY = `loanDocuments:${userId}`;
    const cachedList = JSON.parse(localStorage.getItem(LIST_KEY) || "[]");
    const updatedList = cachedList.filter((l) => l.id !== loanId);
    localStorage.setItem(LIST_KEY, JSON.stringify(updatedList));

    // ✅ Remove loan detail cache
    localStorage.removeItem(`loanDetail:${userId}:${loanId}`);

    setDeleting(false);
    setShowDeleteConfirm(false);

    // Go back to Portfolio
    setCurrentScreen("portfolio");
  } catch (err) {
    console.error("Failed to delete loan", err);
    setDeleting(false);
    alert("Failed to delete loan. Please try again.");
  }
};


  return (
<>
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Loan Document</h1>
        <Button variant="outline" onClick={() => setCurrentScreen("portfolio")}>
          Back
        </Button>
      </div>

      <Button
  variant="outline"
  onClick={() => {
    setSelectedLoanId(loan.loanId);
    setCurrentScreen("edit-loan");
  }}
>
  {/* <Edit2 className="w-4 h-4 mr-2" /> */}
  Edit Document
</Button>

      <Card className="p-6 space-y-8">
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

        <div className="border-t border-gray-200 my-4"></div>

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

        <div className="border-t border-gray-200 my-4"></div>

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

        <div className="border-t border-gray-200 my-4"></div>

        <LoanSection title="Fees">
            <LoanDetailItem label="Arrangement Fee" value={fees.arrangementFee} />
<LoanDetailItem label="Participation Fee" value={fees.participationFee} />
<LoanDetailItem label="Commitment Fee" value={fees.commitmentFee} />
<LoanDetailItem label="Utilisation Fee" value={fees.utilisationFee} />
<LoanDetailItem label="Agency Fee" value={fees.agencyFee} />
<LoanDetailItem label="Cancellation Fee" value={fees.cancellationFee} />
<LoanDetailItem label="Front End Fee" value={fees.frontEndFee} />

        </LoanSection>

        <div className="border-t border-gray-200 my-4"></div>

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

        <div className="border-t border-gray-200 my-4"></div>


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

        <div className="border-t border-gray-200 my-4"></div>

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

        <div className="border-t border-gray-200 my-4"></div>   

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

        <div className="border-t border-gray-200 my-4"></div>

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

        {/* <div className="border-t border-gray-200 my-4"></div>

        <LoanSection title="Representations">
            <LoanDetailItem label="Binding Obligations" value={representations.bindingObligations} />
<LoanDetailItem label="Non-Conflict" value={representations.nonConflict} />
<LoanDetailItem label="Power and Authority" value={representations.powerAndAuthority} />
<LoanDetailItem label="No Default" value={representations.noDefault} />
<LoanDetailItem label="Financial Statements" value={representations.financialStatements} />
<LoanDetailItem label="Litigation" value={representations.litigation} />
<LoanDetailItem label="Environmental" value={representations.environmental} />
<LoanDetailItem label="Tax" value={representations.tax} />

        </LoanSection> */}

        <div className="border-t border-gray-200 my-4"></div>

        {/* considering the data responds type  */}
        {/* <LoanSection title="Transfers">
            <LoanDetailItem label="Transfer Conditions" value={transfers.transferConditions} />
        </LoanSection> */}

        {/* <div className="border-t border-gray-200 my-4"></div> */}

        <LoanSection title="Governing Law">
            <LoanDetailItem label="Governing Law" value={governingLaw.governingLaw} />
            <LoanDetailItem label="Jurisdiction" value={governingLaw.jurisdiction} />

        </LoanSection>

        {/* <div className="border-t border-gray-200 my-4"></div> */}

        {/* <Badge variant="success">{loan.status}</Badge> */}
  <div className="flex justify-end pt-6 space-x-2">
  <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
    Delete Loan
  </Button>
</div>




      </Card>
    </div>

    {showDeleteConfirm && (
  <div className="fixed top-0 inset-0 h-full bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 w-96 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Confirm Delete</h2>
      <p className="text-sm text-gray-600">
        Are you sure you want to delete this loan? This action cannot be undone.
      </p>
      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={() => setShowDeleteConfirm(false)}
          disabled={deleting}
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={handleDeleteLoan}
          disabled={deleting}
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


