// 
import { useEffect } from 'react';
import { TrendingUp, DollarSign, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';
import { registerForPushNotifications } from '../utils/registerPushNotification';
import { registerDevice } from '../api/register-device';

// Card Components
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-gray-100 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children }) => (
  <h3 className="text-base font-semibold text-gray-900">{children}</h3>
);

const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

// Badge Component
const Badge = ({ children, variant }) => {
  const variants = {
    error: 'bg-red-100 text-red-700',
    warning: 'bg-yellow-100 text-yellow-700',
    info: 'bg-blue-100 text-blue-700',
  };
  
  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded ${variants[variant]}`}>
      {children}
    </span>
  );
};

export default function Dashboard() {
  const overviewCards = [
    {
      title: 'Total Loans',
      value: '247',
      change: '+12%',
      trend: 'up',
      icon: DollarSign,
      color: 'blue',
    },
    {
      title: 'Total Outstanding Principal',
      value: '$4.2M',
      change: '+8%',
      trend: 'up',
      icon: TrendingUp,
      color: 'blue',
    },
    {
      title: 'Maturing in 12 Months',
      value: '34',
      change: '14%',
      trend: 'neutral',
      icon: Calendar,
      color: 'blue',
    },
    {
      title: 'Transfer-Eligible Loans',
      value: '189',
      change: '76%',
      trend: 'up',
      icon: CheckCircle,
      color: 'blue',
    },
  ];

  const maturityData = [
    { period: '0-3M', count: 12, value: 340 },
    { period: '3-6M', count: 18, value: 520 },
    { period: '6-12M', count: 24, value: 680 },
    { period: '1-2Y', count: 48, value: 1100 },
    { period: '2-3Y', count: 67, value: 980 },
    { period: '3-5Y', count: 78, value: 580 },
  ];

  const benchmarkData = [
    { name: 'SOFR', percentage: 45, loans: 112, color: '#3B82F6' },
    { name: 'SONIA', percentage: 28, loans: 69, color: '#60A5FA' },
    { name: 'EURIBOR', percentage: 18, loans: 44, color: '#93C5FD' },
    { name: 'HIBOR', percentage: 9, loans: 22, color: '#BFDBFE' },
  ];

  const recentAlerts = [
    {
      id: 1,
      type: 'warning',
      title: 'Interest Payment Due',
      loan: 'ABC Corp Senior Credit Facility',
      date: '2025-12-25',
      amount: '$1.2M',
    },
    {
      id: 2,
      type: 'error',
      title: 'Covenant Test Due Tomorrow',
      loan: 'XYZ Limited Term Loan B',
      date: '2025-12-19',
      amount: '$850K',
    },
    {
      id: 3,
      type: 'info',
      title: 'Reporting Deadline',
      loan: 'Global Ventures RCF',
      date: '2025-12-28',
      amount: '$500K',
    },
    {
      id: 4,
      type: 'warning',
      title: 'Loan Matures in 90 Days',
      loan: 'TechStart Acquisition Facility',
      date: '2026-03-18',
      amount: '$3.5M',
    },
  ];

  // Portfolio trend data for line chart
  const portfolioTrend = [
    { month: 'Jan', value: 3.8 },
    { month: 'Feb', value: 3.9 },
    { month: 'Mar', value: 4.0 },
    { month: 'Apr', value: 3.95 },
    { month: 'May', value: 4.1 },
    { month: 'Jun', value: 4.2 },
  ];

  useEffect(() => {
    const setupNotifications = async () => {
      try {
        const fcmToken = await registerForPushNotifications();
        console.log("FcmToken:", fcmToken)
        await registerDevice(fcmToken);
        console.log("Push notifications enabled");
      } catch (err) {
        console.warn("Push notifications not enabled:", err?.message);
      }
    };
  
    setupNotifications();
  }, []);

  // Doughnut Chart Component
  const DoughnutChart = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.percentage, 0);
    let currentAngle = -90;

    return (
      <div className="flex items-center justify-center space-x-8">
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
            {data.map((item, index) => {
              const angle = (item.percentage / total) * 360;
              const largeArc = angle > 180 ? 1 : 0;
              
              const startX = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
              const startY = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
              
              currentAngle += angle;
              
              const endX = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
              const endY = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);

              return (
                <path
                  key={index}
                  d={`M 50 50 L ${startX} ${startY} A 40 40 0 ${largeArc} 1 ${endX} ${endY} Z`}
                  fill={item.color}
                  className="transition-all hover:opacity-80"
                />
              );
            })}
            <circle cx="50" cy="50" r="25" fill="white" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{total}%</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
              <div>
                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500">{item.percentage}% • {item.loans} loans</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Column Chart Component
  const ColumnChart = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
      <div className="h-64">
        <div className="flex items-end justify-between h-full space-x-2 pb-8">
          {data.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center justify-end h-full">
              <div className="relative w-full group h-full flex items-end">
  <div
    className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg transition-all hover:from-blue-700 hover:to-blue-500"
    style={{ height: `${(item.value / maxValue) * 100}%` }}
  >

                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                      ${item.value}M
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-2 font-medium">{item.period}</p>
              <p className="text-xs text-gray-500">{item.count}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Line Chart Component
  const LineChart = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue;
    const padding = range * 0.1;
    
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - (((item.value - minValue + padding) / (range + 2 * padding)) * 100);
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="h-64 relative">
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          <polyline
            points={`0,100 ${points} 100,100`}
            fill="url(#lineGradient)"
            stroke="none"
          />
          
          <polyline
            points={points}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - (((item.value - minValue + padding) / (range + 2 * padding)) * 100);
            return (
              <g key={index}>
                <circle
                  cx={x}
                  cy={y}
                  r="1"
                  fill="white"
                  stroke="#3B82F6"
                  strokeWidth="0.5"
                  className="hover:r-2 transition-all"
                />
              </g>
            );
          })}
        </svg>
        
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
          {data.map((item, index) => (
            <div key={index} className="text-center">
              <p className="text-xs text-gray-600 font-medium">{item.month}</p>
              <p className="text-xs text-gray-500">${item.value}B</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your loan portfolio and key metrics</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {overviewCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardContent className="py-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      <span className={`font-medium ${card.trend === 'up' ? 'text-green-600' : 'text-gray-600'}`}>
                        {card.change}
                      </span>
                      {' '}from last quarter
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-50">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Column Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Maturity Distribution</CardTitle>
            <p className="text-sm text-gray-500 mt-1">Outstanding principal by maturity period</p>
          </CardHeader>
          <CardContent>
            <ColumnChart data={maturityData} />
          </CardContent>
        </Card>

        {/* Doughnut Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Benchmark Breakdown</CardTitle>
            <p className="text-sm text-gray-500 mt-1">Distribution by interest rate benchmark</p>
          </CardHeader>
          <CardContent>
            <DoughnutChart data={benchmarkData} />
          </CardContent>
        </Card>
      </div>

      {/* Line Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Value Trend</CardTitle>
          <p className="text-sm text-gray-500 mt-1">Total outstanding principal over time (in billions)</p>
        </CardHeader>
        <CardContent>
          <LineChart data={portfolioTrend} />
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Recent Alerts & Notifications</CardTitle>
          <p className="text-sm text-gray-500 mt-1">Important upcoming events and deadlines</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      {alert.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                      {alert.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                      {alert.type === 'info' && <Calendar className="w-5 h-5 text-blue-500" />}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-medium text-gray-900">{alert.title}</p>
                        <Badge variant={alert.type}>
                          {alert.type === 'error' ? 'Urgent' : alert.type === 'warning' ? 'Important' : 'Info'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{alert.loan}</p>
                      <p className="text-xs text-gray-500 mt-1">Due: {alert.date} • Amount: {alert.amount}</p>
                    </div>
                  </div>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}