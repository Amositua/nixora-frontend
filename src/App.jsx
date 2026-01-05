import { useState, useEffect } from "react";
import Layout from "./components/Layout";
import Dashboard from "./screens/Dashboard";
import Upload from "./screens/Upload";
import LoanReview from "./screens/LoanReview";
import Portfolio from "./screens/Portfolio";
import LoanComparison from "./screens/LoanCompare";
import QueryBuilder from "./screens/QueryBuilder";
import Reports from "./screens/Reports";
import Timeline from "./screens/Timeline";
import Notifications from "./screens/Notifications";
import Settings from "./screens/Settings";
import Landing from "./screens/Landing";
import SignIn from "./screens/SignIn";
import SignUp from "./screens/SignUp";
import Policy from "./screens/Policy";
import { authService } from "./services/authServices";

import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import LoanDetails from "./screens/LoanDetails";
import LoanTimeline from "./screens/Timeline";
import LoanTimelineDetail from "./screens/TimelineDetail";
import LoanList from "./screens/time";

import LoanFieldEditor from "./screens/loanEditScreen";

import { CollaborationAcceptModal } from "./components/collaborationModal.jsx";
import { SharedDocuments } from "./screens/ShareDocumentList.jsx";

function App() {
  const [currentScreen, setCurrentScreen] = useState("landing");
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedLoanId, setSelectedLoanId] = useState(null);

  // Handle collaboration invite token from URL
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteToken, setInviteToken] = useState(null);
  useEffect(() => {
    const path = window.location.pathname;
    const inviteMatch = path.match(/\/invite\/([a-f0-9-]+)/i);
    
    if (inviteMatch) {
      const token = inviteMatch[1];
      
      // Check if user is authenticated
      const authToken = localStorage.getItem("accessToken");
      
      if (authToken) {
        // User is logged in, show invite modal
        setInviteToken(token);
        setShowInviteModal(true);
      } else {
        // User not logged in, store token and redirect to sign in
        sessionStorage.setItem("pending_invite_token", token);
        setCurrentScreen("signin");
      }
      
      // Clean URL
      window.history.replaceState({}, "", "/");
    }
  }, []);


   // Check for pending invite after sign in
  useEffect(() => {
    if (currentScreen === "dashboard") {
      const pendingToken = sessionStorage.getItem("pending_invite_token");
      if (pendingToken) {
        setInviteToken(pendingToken);
        setShowInviteModal(true);
        sessionStorage.removeItem("pending_invite_token");
      }
    }
  }, [currentScreen]);

  const handleAcceptInvitation = (data) => {
    setShowInviteModal(false);
    setInviteToken(null);
    
    // Navigate to shared documents
    setCurrentScreen("shared-documents");
    
    // Show success message
    // You can add a toast notification here
  };

  const handleDeclineInvitation = () => {
    setShowInviteModal(false);
    setInviteToken(null);
  };

  useEffect(() => {
  // Check if this is the popup window with a token
  const hash = window.location.hash;
  
  if (hash.includes("token=") && window.opener) {
    const token = hash.split("token=")[1];
    
    // Send token to parent window
    window.opener.postMessage(
      { type: 'TRELLO_TOKEN', token },
      window.location.origin
    );
    
    // Close the popup
    window.close();
  }
}, []);

  useEffect(() => {
    const session = authService.getSession();

    if (session) {
      setSession(session);
      setCurrentScreen("dashboard");
    }

    console.log("Auth session checkeddddd:", session);
    // console.log("Current Screen on load:", currentScreen);

    setLoading(false);
  }, []);

  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      navigate(
        currentScreen === "dashboard" ? "/dashboard" : `/${currentScreen}`,
        { replace: true }
      );
    }
  }, [currentScreen]);

  const handleSignOut = () => {
    authService.logout();
    setSession(null);
    setCurrentScreen("landing");
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50">
        <p className="text-gray-600 font-medium">Loading...</p>
      </div>
    );
  }

  if (!session) {
  return (
    <Routes>
      <Route path="/" element={<Landing setCurrentScreen={setCurrentScreen} />} />
      <Route path="/signin" element={
      <SignIn
        setCurrentScreen={setCurrentScreen}
        onAuthSuccess={(session) => {
          setSession(session);
          setCurrentScreen("dashboard");
        }}
      />
    } />
    <Route path="/signup" element={<SignUp setCurrentScreen={setCurrentScreen} />} />
      <Route path="/privacy" element={<Policy />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

  // if (!session) {
  //   return (
  //     <>
  //       {currentScreen === "landing" && (
  //         <Landing setCurrentScreen={setCurrentScreen} />
  //       )}
  //       {currentScreen === "signin" && (
  //         <SignIn
  //           setCurrentScreen={setCurrentScreen}
  //           onAuthSuccess={(session) => {
  //             setSession(session);
  //             setCurrentScreen("dashboard");
  //           }}
  //         />
  //       )}
  //       {currentScreen === "signup" && (
  //         <SignUp setCurrentScreen={setCurrentScreen} />
  //       )}
  //     </>
  //   );
  // }

  console.log("currentScreen inside session:", currentScreen);
  const user = localStorage.getItem("user");
  const userId = user ? JSON.parse(user).userId : "guest";
  const LoanData = localStorage.getItem(`loanDocuments:${userId}`);

  // const renderScreen = () => {
  //   switch (currentScreen) {
  //     case "dashboard":
  //       return <Dashboard />;
  //     case "upload":
  //       return (
  //         <Upload
  //           currentScreen={currentScreen}
  //           setCurrentScreen={setCurrentScreen}
  //           setSelectedLoanId={setSelectedLoanId}
  //         />
  //       );
  //     case "review":
  //       return <LoanReview />;
  //     case "portfolio":
  //       return (
  //         <Portfolio
  //           setCurrentScreen={setCurrentScreen}
  //           setSelectedLoanId={setSelectedLoanId}
  //         />
  //       );
  //     case "loan-details":
  //       return (
  //         <LoanDetails
  //           loanId={selectedLoanId}
  //           setCurrentScreen={setCurrentScreen}
  //         />
  //       );

  //     case "query":
  //       return <LoanComparison
  //       loanData={LoanData}
  //       setCurrentScreen={setCurrentScreen}
  //       // setSelectedLoanId={setSelectedLoanId}
  //       />;
  //     case "compare-loans":
  //       return <LoanComparison
  //       setCurrentScreen={setCurrentScreen}
  //       setSelectedLoanId={setSelectedLoanId}
  //       mode="compare-loans"
  //       />;
  //     case "reports":
  //       return <Reports />;
  //     case "timeline":
  //       return <Timeline />;
  //     case "notifications":
  //       return <Notifications />;
  //     case "settings":
  //       return <Settings />;
  //     default:
  //       return <Dashboard />;
  //   }
  // };

 

  return (
    <Layout
      currentScreen={currentScreen}
      setCurrentScreen={setCurrentScreen}
      onSignOut={handleSignOut}
    >
       <Routes>
    <Route path="/dashboard" element={<Dashboard />} />

    <Route
      path="/upload"
      element={
        <Upload
          currentScreen={currentScreen}
          setCurrentScreen={setCurrentScreen}
          setSelectedLoanId={setSelectedLoanId}
        />
      }
    />

    <Route
      path="/portfolio"
      element={
        <Portfolio
          setCurrentScreen={setCurrentScreen}
          setSelectedLoanId={setSelectedLoanId}
        />
      }
    />

    <Route
      path="/loan-details"
      element={
        <LoanDetails
          loanId={selectedLoanId}
          setSelectedLoanId={setSelectedLoanId}
          setCurrentScreen={setCurrentScreen}
        />
      }
    />

    <Route
      path="/query"
      element={
        <QueryBuilder
          loanData={LoanData}
          setCurrentScreen={setCurrentScreen}
        />
      }
    />

    <Route
      path="/edit-loan"
      element={
        <LoanFieldEditor
          loanId={selectedLoanId}
          setCurrentScreen={setCurrentScreen}
        />
      }
    />

    <Route
      path="/compare-loans"
      element={
        <LoanComparison
          setCurrentScreen={setCurrentScreen}
          setSelectedLoanId={setSelectedLoanId}
          mode="compare-loans"
        />
      }
    />
    <Route path="/reports" element={<Reports />} />


    <Route path="/timeline" element={<LoanList setSelectedLoanId={setSelectedLoanId} setCurrentScreen={setCurrentScreen}/>} />


    <Route path="/timeline-detail" element={<LoanTimelineDetail loanId={selectedLoanId} setCurrentScreen={setCurrentScreen}/>} />


    <Route path="/notifications" element={<Notifications />} />
    <Route path="/settings" element={<Settings setCurrentScreen={setCurrentScreen}/>} />
    
    {/* <Route path="/privacy" element={<Policy />} /> */}
    

    {/* Fallback */}
    <Route path="*" element={<Navigate to="/dashboard" />} />
  </Routes>

  {currentScreen === "shared-documents" && (
        <SharedDocuments
          setCurrentScreen={setCurrentScreen}
          setSelectedLoanId={setSelectedLoanId}
        />
      )}

      {/* Collaboration Accept Modal */}
      {showInviteModal && inviteToken && (
        <CollaborationAcceptModal
          token={inviteToken}
          onAccept={handleAcceptInvitation}
          onDecline={handleDeclineInvitation}
        />
      )}
    </Layout>
  );
}

export default App;
