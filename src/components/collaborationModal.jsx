// ============================================
// 2. COLLABORATION ACCEPT MODAL
// ============================================

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import Button from "../components/ui/Button";
import { FileText, CheckCircle, X } from "lucide-react";
import { Loader } from "lucide-react";

export function CollaborationAcceptModal({ token, onAccept, onDecline }) {
    console.log("Rendering CollaborationAcceptModal with token:", token);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState(null);

  const handleAccept = async () => {
    setAccepting(true);
    setError(null);
    
    console.log("Accepting invitation with token:", token);
    try {
      const authToken = localStorage.getItem("accessToken");
      console.log("Using auth token:", authToken);
      const res = await fetch(
        "https://nixora-image-latest.onrender.com/api/collaboration/accept",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        }
      );

      if (!res.ok) throw new Error("Failed to accept invitation");

      const data = await res.json();
      onAccept(data);
    } catch (err) {
      setError(err.message);
      console.error("Failed to accept invitation:", err);
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Collaboration Invitation</CardTitle>
            </div>
            <button
              onClick={onDecline}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-700 mb-2">
              You've been invited to collaborate on a loan document
            </p>
            <p className="text-sm text-gray-500">
              Accept this invitation to view and edit the document with the team
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onDecline}
              className="flex-1"
              disabled={accepting}
            >
              Decline
            </Button>
            <Button
              variant="primary"
              onClick={handleAccept}
              className="flex-1"
              disabled={accepting}
            >
              {accepting ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Accepting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Accept
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
