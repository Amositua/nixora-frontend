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
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  DollarSign,
  ArrowLeft,
  Filter,
  CalendarDays,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import TrelloSyncModal from "../components/loan/TrelloSync";

export default function LoanTimelineDetail({ loanId, setCurrentScreen }) {
  const [loan, setLoan] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [view, setView] = useState("timeline"); // 'timeline' or 'calendar'
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(null);
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [tempYear, setTempYear] = useState(currentMonth.getFullYear());
  const [tempMonth, setTempMonth] = useState(currentMonth.getMonth());

  const [showTrelloModal, setShowTrelloModal] = useState(false);

  useEffect(() => {
    if (loanId) {
      fetchLoanDetails();
      fetchSchedule();
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
    }
  };

  const fetchSchedule = async () => {
    const user = localStorage.getItem("user");
    const userId = user ? JSON.parse(user).userId : "guest";
    const CACHE_KEY = `loanSchedule:${userId}:${loanId}`;

    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      setSchedule(JSON.parse(cached));
      setLoading(false);
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(
        `https://nixora-image-latest.onrender.com/api/loans/${loanId}/schedule`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch schedule");

      const data = await res.json();
      setSchedule(data || []);
      localStorage.setItem(CACHE_KEY, JSON.stringify(data || []));
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch schedule:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncToCalendar = async () => {
    const user = localStorage.getItem("user");
    const userId = user ? JSON.parse(user).userId : "guest";
    const CACHE_KEY = `loanSyncData:${userId}:${loanId}`;

    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      setSyncSuccess(JSON.parse(cached));
      setCalendarEvents(JSON.parse(cached).events || []);
      setView("calendar");
      return;
    }

    setSyncing(true);
    setError(null);
    setSyncSuccess(null);

    try {
      const token = localStorage.getItem("accessToken");

      // First, connect to Google Calendar
      const connectRes = await fetch(
        "https://nixora-image-latest.onrender.com/api/google/connect",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const connectData = await connectRes.json();
      if (connectData.url) {
        // Redirect user to Google OAuth consent screen
        // how to open in new tab?
        window.open(connectData.url, "_blank");
      }

      if (!connectRes.ok) {
        throw new Error("Failed to connect to Google Calendar");
      }

      // Then sync the loan schedule
      const syncRes = await fetch(
        `https://nixora-image-latest.onrender.com/api/loan/calendar/${loanId}/sync`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!syncRes.ok) {
        throw new Error("Failed to sync schedule to calendar");
      }

      const syncData = await syncRes.json();
      localStorage.setItem(CACHE_KEY, JSON.stringify(syncData));

      // Add synced events to the calendar
      setCalendarEvents(syncData.events || []);
      setSyncSuccess(syncData);

      // Switch to calendar view to show the synced events
      setView("calendar");

      // Show success message for 5 seconds
      setTimeout(() => {
        setSyncSuccess(null);
      }, 5000);
    } catch (err) {
      setError(err.message);
      console.error("Calendar sync failed:", err);
    } finally {
      setSyncing(false);
    }
  };

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getEventsForDate = (date) => {
    const localDateStr = date.toLocaleDateString("en-CA"); // YYYY-MM-DD
    return calendarEvents.filter((event) => event.date === localDateStr);
  };

  const isSameDay = (a, b) => {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  };

  const previousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const goToToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setCurrentMonth(today);
  };

  const getEventIcon = (type) => {
    switch (type) {
      case "INTEREST_PAYMENT":
        return <DollarSign className="w-5 h-5 text-green-600" />;
      case "COVENANT_TEST":
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case "MATURITY":
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      default:
        return <Calendar className="w-5 h-5 text-gray-600" />;
    }
  };

  const getEventBadgeVariant = (type) => {
    switch (type) {
      case "INTEREST_PAYMENT":
        return "success";
      case "COVENANT_TEST":
        return "warning";
      case "MATURITY":
        return "info";
      default:
        return "secondary";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCalendarDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getMonthYear = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  const isUpcoming = (dateString) => {
    return new Date(dateString) > new Date();
  };

  const filteredSchedule = schedule.filter((event) => {
    if (filterType === "all") return true;
    return event.type === filterType;
  });

  const upcomingEvents = filteredSchedule.filter((event) =>
    isUpcoming(event.date)
  );
  const pastEvents = filteredSchedule.filter(
    (event) => !isUpcoming(event.date)
  );

  // Group events by month for calendar view
  const eventsByMonth = schedule.reduce((acc, event) => {
    const monthYear = getMonthYear(event.date);
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(event);
    return acc;
  }, {});

  //
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = Array.from(
    { length: 30 },
    (_, i) => new Date().getFullYear() - 10 + i
  );

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
  const monthYear = currentMonth.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (loading && !loan) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading timeline...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentScreen("timeline")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {/* <Calendar className="w-7 h-7 text-blue-600" /> */}
              Loan Schedule
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {loan?.loanData?.parties?.borrower}
            </p>
          </div>
        </div>

        {/* View Toggle and Sync Buttons */}
        <div className="flex flex-col gap-3">

          <div className="flex items-center space-x-4">
            {/* Sync to Calendar Button */}
            <Button
              variant="primary"
              onClick={handleSyncToCalendar}
              disabled={syncing}
            >
              {syncing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Sync to Google Calendar
                </>
              )}
            </Button>

            {/* Sync to Trello Button */}
            <Button variant="outline" onClick={() => setShowTrelloModal(true)}>
              <svg
                className="w-4 h-4 mr-2"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M21 0H3C1.343 0 0 1.343 0 3v18c0 1.656 1.343 3 3 3h18c1.656 0 3-1.344 3-3V3c0-1.657-1.344-3-3-3zM10.44 18.18c0 .795-.645 1.44-1.44 1.44H4.56c-.795 0-1.44-.646-1.44-1.44V4.56c0-.795.645-1.44 1.44-1.44H9c.795 0 1.44.645 1.44 1.44v13.62zm10.44-6c0 .794-.645 1.44-1.44 1.44H15c-.795 0-1.44-.646-1.44-1.44V4.56c0-.795.646-1.44 1.44-1.44h4.44c.795 0 1.44.645 1.44 1.44v7.62z" />
              </svg>
              Sync to Trello
            </Button>
          </div>

          {/* View Toggle */}
          <div className="flex items-center self-end">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setView("timeline")}
                className={`px-2 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                  view === "timeline"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Clock className="w-4 h-4" />
                Timeline
              </button>
              <button
                onClick={() => setView("calendar")}
                className={`px-2 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
                  view === "calendar"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                Calendar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {syncSuccess && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    {syncSuccess.status}
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    {syncSuccess.eventsSynced} event
                    {syncSuccess.eventsSynced !== 1 ? "s" : ""} synced to your
                    Google Calendar
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSyncSuccess(null)}
                className="text-green-600 hover:text-green-800"
              >
                ×
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
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

      {loan && (
        <>
          {/* Loan Info Card */}
          <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm font-medium text-blue-600 uppercase mb-1">
                    Borrower
                  </p>
                  <p className="text-lg font-semibold text-blue-900">
                    {loan.loanData?.parties?.borrower || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600 uppercase mb-1">
                    Facility Type
                  </p>
                  <p className="text-lg font-semibold text-blue-900">
                    {loan.loanData?.facility?.facilityType || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600 uppercase mb-1">
                    Benchmark
                  </p>
                  <p className="text-lg font-semibold text-blue-900">
                    {loan.loanData?.interest?.benchmark || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600 uppercase mb-1">
                    Margin
                  </p>
                  <p className="text-lg font-semibold text-blue-900">
                    {loan.loanData?.interest?.margin || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedule Summary
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Events</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {schedule.length}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Upcoming</p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">
                      {upcomingEvents.length}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Interest Payments</p>
                    <p className="text-2xl font-bold text-green-900 mt-1">
                      {
                        schedule.filter((e) => e.type === "INTEREST_PAYMENT")
                          .length
                      }
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Covenant Tests</p>
                    <p className="text-2xl font-bold text-orange-900 mt-1">
                      {
                        schedule.filter((e) => e.type === "COVENANT_TEST")
                          .length
                      }
                    </p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          Filter
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Filter by type:
                </span>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { value: "all", label: "All Events" },
                    { value: "INTEREST_PAYMENT", label: "Interest" },
                    { value: "COVENANT_TEST", label: "Covenants" },
                    { value: "MATURITY", label: "Maturity" },
                  ].map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => setFilterType(filter.value)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                        filterType === filter.value
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card> */}

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>
                {view === "timeline" ? "Event Timeline" : "Calendar View"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredSchedule.length > 0 ? (
                view === "timeline" ? (
                  /* Timeline View */
                  <div className="space-y-8">
                    {/* Upcoming Events */}
                    {upcomingEvents.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Upcoming Events
                        </h3>
                        <div className="relative border-l-2 border-blue-200 pl-8 space-y-6">
                          {upcomingEvents.map((event, index) => (
                            <div key={index} className="relative">
                              {/* Timeline Dot */}
                              <div className="absolute -left-10 top-0 w-4 h-4 rounded-full bg-blue-500 border-4 border-white"></div>

                              {/* Event Card */}
                              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex items-start gap-4">
                                  <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
                                    {getEventIcon(event.type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                      <div className="flex-1">
                                        <Badge
                                          variant={getEventBadgeVariant(
                                            event.type
                                          )}
                                        >
                                          {event.type.replace(/_/g, " ")}
                                        </Badge>
                                        <p className="text-sm font-medium text-gray-900 mt-2">
                                          {event.description}
                                        </p>
                                      </div>
                                      <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                                        {formatDate(event.date)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Past Events */}
                    {pastEvents.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          Past Events
                        </h3>
                        <div className="relative border-l-2 border-gray-200 pl-8 space-y-6 opacity-60">
                          {pastEvents.map((event, index) => (
                            <div key={index} className="relative">
                              <div className="absolute -left-10 top-0 w-4 h-4 rounded-full bg-gray-300 border-4 border-white"></div>
                              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="flex items-start gap-4">
                                  <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                                    {getEventIcon(event.type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                      <div className="flex-1">
                                        <Badge variant="secondary">
                                          {event.type.replace(/_/g, " ")}
                                        </Badge>
                                        <p className="text-sm font-medium text-gray-700 mt-2">
                                          {event.description}
                                        </p>
                                      </div>
                                      <p className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                                        {formatDate(event.date)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Calendar View */
                  <div className="space-y-4 relative">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-6">
                      <button
                        onClick={() => {
                          setTempYear(currentMonth.getFullYear());
                          setTempMonth(currentMonth.getMonth());
                          setShowMonthPicker(true);
                        }}
                        className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition"
                      >
                        {monthYear}
                      </button>

                      {showMonthPicker && (
                        <div className="absolute top-8 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-4 mt-2">
                          <div className="grid grid-cols-2 gap-4">
                            {/* Month selector */}
                            <div>
                              <p className="text-sm font-semibold text-gray-600 mb-2">
                                Month
                              </p>
                              <div className="grid grid-cols-3 gap-2">
                                {months.map((month, index) => (
                                  <button
                                    key={month}
                                    onClick={() => setTempMonth(index)}
                                    className={`px-2 py-1 text-sm rounded-lg ${
                                      tempMonth === index
                                        ? "bg-blue-600 text-white"
                                        : "hover:bg-gray-100"
                                    }`}
                                  >
                                    {month.slice(0, 3)}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Year selector */}
                            <div>
                              <p className="text-sm font-semibold text-gray-600 mb-2">
                                Year
                              </p>
                              <div className="max-h-40 overflow-y-auto space-y-1">
                                {years.map((year) => (
                                  <button
                                    key={year}
                                    onClick={() => setTempYear(year)}
                                    className={`w-full px-2 py-1 text-sm rounded-lg text-left ${
                                      tempYear === year
                                        ? "bg-blue-600 text-white"
                                        : "hover:bg-gray-100"
                                    }`}
                                  >
                                    {year}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex justify-end gap-2 mt-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowMonthPicker(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                setCurrentMonth(
                                  new Date(tempYear, tempMonth, 1)
                                );
                                setShowMonthPicker(false);
                              }}
                            >
                              Apply
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={goToToday}>
                          Today
                        </Button>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={previousMonth}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            onClick={nextMonth}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Days of Week Header */}
                    <div className="grid grid-cols-7 gap-2 mb-2">
                      {daysOfWeek.map((day) => (
                        <div
                          key={day}
                          className="text-center text-sm font-semibold text-gray-600 py-2"
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-2">
                      {/* Empty cells for days before month starts */}
                      {Array.from({ length: startingDayOfWeek }).map(
                        (_, index) => (
                          <div
                            key={`empty-${index}`}
                            className="aspect-square p-2 bg-gray-50 rounded-lg"
                          />
                        )
                      )}

                      {/* Days of the month */}
                      {Array.from({ length: daysInMonth }).map((_, index) => {
                        const day = index + 1;
                        const date = new Date(
                          currentMonth.getFullYear(),
                          currentMonth.getMonth(),
                          day
                        );
                        const events = getEventsForDate(date);
                        const isToday = isSameDay(date, new Date());
                        const hasEvents = events.length > 0;

                        return (
                          <div
                            key={day}
                            onClick={() => setSelectedDate(date)}
                            className={`aspect-square p-2 rounded-lg border-2 transition-all cursor-pointer ${
                              isToday
                                ? "border-blue-500 bg-blue-50"
                                : hasEvents
                                ? "border-green-200 bg-green-50 hover:border-green-400"
                                : "border-gray-200 bg-white hover:border-gray-300"
                            } ${
                              selectedDate && isSameDay(selectedDate, date)
                                ? "ring-2 ring-blue-500"
                                : ""
                            }`}
                          >
                            <div className="flex flex-col h-full">
                              <span
                                className={`text-sm font-medium ${
                                  isToday
                                    ? "text-blue-700"
                                    : hasEvents
                                    ? "text-green-700"
                                    : "text-gray-700"
                                }`}
                              >
                                {day}
                              </span>
                              {hasEvents && (
                                <div className="mt-1 space-y-1 flex-1 overflow-hidden">
                                  {events.slice(0, 2).map((event, idx) => (
                                    <div
                                      key={idx}
                                      className={`text-xs px-1 py-0.5 rounded truncate ${
                                        event.type === "INTEREST_PAYMENT"
                                          ? "bg-green-200 text-green-800"
                                          : event.type === "COVENANT_TEST"
                                          ? "bg-orange-200 text-orange-800"
                                          : "bg-blue-200 text-blue-800"
                                      }`}
                                    >
                                      {event.type.split("_")[0]}
                                    </div>
                                  ))}
                                  {events.length > 2 && (
                                    <div className="text-xs text-gray-600 font-medium">
                                      +{events.length - 2} more
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Selected Date Events */}
                    {selectedDate &&
                      getEventsForDate(selectedDate).length > 0 && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <h3 className="font-semibold text-gray-900 mb-3">
                            Events on {formatDate(selectedDate.toISOString())}
                          </h3>
                          <div className="space-y-2">
                            {getEventsForDate(selectedDate).map(
                              (event, index) => (
                                <div
                                  key={index}
                                  className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200"
                                >
                                  <div className="p-2 bg-blue-50 rounded-lg">
                                    {getEventIcon(event.type)}
                                  </div>
                                  <div className="flex-1">
                                    <Badge
                                      variant={getEventBadgeVariant(event.type)}
                                    >
                                      {event.type.replace(/_/g, " ")}
                                    </Badge>
                                    <p className="text-sm text-gray-900 mt-1">
                                      {event.description}
                                    </p>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                    {/* Calendar Legend */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">
                        Event Types
                      </h4>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-green-200 rounded"></div>
                          <span className="text-sm text-gray-600">
                            Interest Payment
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-orange-200 rounded"></div>
                          <span className="text-sm text-gray-600">
                            Covenant Test
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-blue-200 rounded"></div>
                          <span className="text-sm text-gray-600">
                            Maturity
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">
                    {view === "calendar"
                      ? "No events synced to calendar"
                      : "No schedule events found"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {view === "calendar"
                      ? "Click 'Sync to Calendar' to add events"
                      : filterType !== "all"
                      ? "Try selecting a different filter"
                      : "This loan has no scheduled events"}
                  </p>
                </div>
              )}

              {/* Trello Sync Modal */}
              {showTrelloModal && (
                <TrelloSyncModal
                  loanId={loanId}
                  loan={loan}
                  onClose={() => setShowTrelloModal(false)}
                />
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
