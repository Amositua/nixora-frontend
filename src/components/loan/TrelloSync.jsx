import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import Button from "../ui/Button";
import Badge from "../ui/Badge";
import { CheckCircle, AlertCircle, Loader, ExternalLink } from "lucide-react";

export default function TrelloSyncModal({ loanId, loan, onClose }) {
  const [step, setStep] = useState(1); // 1-6 for each step
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [authUrl, setAuthUrl] = useState(null);
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [selectedFields, setSelectedFields] = useState([
    "facilityAgent",
    "facilityAmount",
    "availabilityPeriod",
    "interestPeriod",
    "interestPaymentDate",
    "commitmentFee",
    "finalMaturityDate",
    "benchmark",
  ]);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncComplete, setSyncComplete] = useState(false);

  useEffect(() => {
    // Check if returning from Trello auth
    const hash = window.location.hash;
    if (hash.includes("token=")) {
      const token = hash.split("token=")[1];
      handleTrelloCallback(token);
      // Clear the hash
      window.history.replaceState(null, null, " ");
    }
  }, []);

  // Step 1: Connect to Trello
  const handleConnectTrello = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        "https://nixora-image-latest.onrender.com/api/trello/connect",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to connect to Trello");

      const data = await res.json();
      setAuthUrl(data.url);

      // Open Trello auth in new window
      window.open(data.url, "_blank", "width=600,height=700");

      // Move to waiting step
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle callback with token
  const handleTrelloCallback = async (trelloToken) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        "https://nixora-image-latest.onrender.com/api/trello/callback",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: trelloToken }),
        }
      );

      if (!res.ok) throw new Error("Failed to authenticate with Trello");

      // Store token for future use
      localStorage.setItem("trello_token", trelloToken);

      // Fetch boards
      await fetchBoards();
      setStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Fetch boards
  const fetchBoards = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        "https://nixora-image-latest.onrender.com/api/trello/boards",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch Trello boards");

      const data = await res.json();
      setBoards(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Fetch lists for selected board
  const handleSelectBoard = async (boardId) => {
    setSelectedBoard(boardId);
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `https://nixora-image-latest.onrender.com/api/trello/boards/${boardId}/lists`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch board lists");

      const data = await res.json();
      setLists(data);
      setStep(4);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 5: Select list
  const handleSelectList = async (listId) => {
    setSelectedList(listId);
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        "https://nixora-image-latest.onrender.com/api/trello/select-list",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            boardId: selectedBoard,
            listId: listId,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to select list");

      await res.json();
      setStep(5);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 6: Push fields to Trello
  const handlePushFields = async () => {
    setLoading(true);
    setError(null);
    setSyncProgress(0);

    try {
      const token = localStorage.getItem("accessToken");
      const totalFields = selectedFields.length;
      let completed = 0;

      for (const field of selectedFields) {
        // Get value from loan data
        let value = null;

        if (field === "facilityAgent") {
          value = loan?.loanData?.parties?.facilityAgent;
        } else if (field === "facilityAmount") {
          value = loan?.loanData?.facility?.facilityAmount;
        } else if (field === "availabilityPeriod") {
          value = loan?.loanData?.facility?.availabilityPeriod;
        } else if (field === "interestPeriod") {
          value = loan?.loanData?.interest?.interestPeriod;
        } else if (field === "interestPaymentDate") {
          value = loan?.loanData?.interest?.interestPaymentDate;
        } else if (field === "commitmentFee") {
          value = loan?.loanData?.fees?.commitmentFee;
        } else if (field === "finalMaturityDate") {
          value = loan?.loanData?.facility?.finalMaturityDate;
        } else if (field === "benchmark") {
          value = loan?.loanData?.interest?.benchmark;
        }

        // Only push if value exists
        if (value) {
          const res = await fetch(
            "https://nixora-image-latest.onrender.com/api/trello/push-field",
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                loanId: loanId,
                label: field,
                value: value,
              }),
            }
          );

          if (!res.ok) {
            console.warn(`Failed to push field ${field}`);
          }
        }

        completed++;
        setSyncProgress(Math.round((completed / totalFields) * 100));
      }

      setSyncComplete(true);
      setStep(6);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFieldLabel = (field) => {
    const labels = {
      facilityAgent: "Facility Agent",
      facilityAmount: "Facility Amount",
      availabilityPeriod: "Availability Period",
      interestPeriod: "Interest Period",
      interestPaymentDate: "Interest Payment Date",
      commitmentFee: "Commitment Fee",
      finalMaturityDate: "Final Maturity Date",
      benchmark: "Benchmark",
    };
    return labels[field] || field;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Sync to Trello</CardTitle>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          {/* Progress Steps */}
          <div className="mt-4 flex items-center justify-between">
            {[1, 2, 3, 4, 5, 6].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= s
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {s}
                </div>
                {s < 6 && (
                  <div
                    className={`w-8 h-1 ${
                      step > s ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent>
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          )}

          {/* Step 1: Connect */}
          {step === 1 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Connect to Trello
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Grant Nixora access to your Trello account to sync loan data
              </p>
              <Button
                variant="primary"
                onClick={handleConnectTrello}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect Trello Account"
                )}
              </Button>
            </div>
          )}

          {/* Step 2: Waiting for auth */}
          {step === 2 && (
            <div className="text-center py-8">
              <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Waiting for Authorization
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Please complete the authorization in the Trello window
              </p>
              <p className="text-xs text-gray-500">
                After authorizing, you'll be redirected back automatically
              </p>
            </div>
          )}

          {/* Step 3: Select Board */}
          {step === 3 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Select Trello Board
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {boards.map((board) => (
                  <button
                    key={board.boardId}
                    onClick={() => handleSelectBoard(board.boardId)}
                    disabled={loading}
                    className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
                  >
                    <p className="font-medium text-gray-900">{board.name}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Select List */}
          {step === 4 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Select List
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {lists.map((list) => (
                  <button
                    key={list.id}
                    onClick={() => handleSelectList(list.id)}
                    disabled={loading}
                    className="w-full p-4 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
                  >
                    <p className="font-medium text-gray-900">{list.name}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Select Fields */}
          {step === 5 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Select Fields to Sync
              </h3>
              <div className="space-y-3 mb-6">
                {[
                  "facilityAgent",
                  "facilityAmount",
                  "availabilityPeriod",
                  "interestPeriod",
                  "interestPaymentDate",
                  "commitmentFee",
                  "finalMaturityDate",
                  "benchmark",
                ].map((field) => (
                  <label
                    key={field}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFields.includes(field)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFields([...selectedFields, field]);
                        } else {
                          setSelectedFields(
                            selectedFields.filter((f) => f !== field)
                          );
                        }
                      }}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {getFieldLabel(field)}
                    </span>
                  </label>
                ))}
              </div>
              <Button
                variant="primary"
                onClick={handlePushFields}
                disabled={loading || selectedFields.length === 0}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Syncing... {syncProgress}%
                  </>
                ) : (
                  `Sync ${selectedFields.length} Field${
                    selectedFields.length !== 1 ? "s" : ""
                  }`
                )}
              </Button>
              {loading && (
                <div className="mt-4">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${syncProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 6: Complete */}
          {step === 6 && syncComplete && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sync Complete!
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {selectedFields.length} field
                {selectedFields.length !== 1 ? "s" : ""} synced to Trello
                successfully
              </p>
              <div className="flex flex-wrap gap-2 justify-center mb-6">
                {selectedFields.map((field) => (
                  <Badge key={field} variant="success">
                    {getFieldLabel(field)}
                  </Badge>
                ))}
              </div>
              <Button variant="primary" onClick={onClose}>
                Close
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
