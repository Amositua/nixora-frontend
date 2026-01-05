// ============================================
// 1. INVITE BUTTON COMPONENT (Add to LoanDocumentEditor)
// ============================================

import { useState } from "react";
import { Users, Share2, Loader } from "lucide-react";
import Button from "../components/ui/Button";

export function CollaborationInviteButton({ loanId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInvite = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `https://nixora-image-latest.onrender.com/api/collaboration/invite/${loanId}`,
        {
            method: "POST",
          headers: { Authorization: `Bearer ${token}` },

        }
      );

      if (!res.ok) throw new Error("Failed to generate invite link");

      const data = await res.json();
      const inviteUrl = data.inviteUrl;

      // Create WhatsApp message
      const message = `You've been invited to collaborate on a loan document! Click here to join: ${inviteUrl}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

      // Open WhatsApp in new window
      window.open(whatsappUrl, "_blank");
    } catch (err) {
      setError(err.message);
      console.error("Failed to create invite:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        variant="outline"
        onClick={handleInvite}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader className="w-4 h-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Users className="w-4 h-4 mr-2" />
            Invite to Collaborate
          </>
        )}
      </Button>
      {error && (
        <p className="text-xs text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}