import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Users, TrendingUp, Activity, AlertCircle } from "lucide-react";
import { projectId, publicAnonKey } from "@/utils/supabase/info";

interface AnalyticsData {
  totalUsers: number;
  averageScore: number;
  weeklyAverage: number;
  recentTrends: Array<{
    userId: string;
    score: number;
    timestamp: number;
  }>;
}

export function ProDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    averageScore: 50,
    weeklyAverage: 50,
    recentTrends: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
    const interval = setInterval(loadAnalytics, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAnalytics = async () => {
    try {
      setError(null);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f9caf0ac/analytics`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to load analytics: ${response.status}`);
      }
      
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Error loading analytics:", error);
      setError(error instanceof Error ? error.message : "Failed to load analytics");
    } finally {
      setIsLoading(false);
    }
  };

  // Transform data for charts with proper error handling
  const chartData = (analytics.recentTrends || [])
    .map((trend) => {
      if (!trend || typeof trend.score !== 'number' || typeof trend.timestamp !== 'number') {
        return null;
      }
      return {
        date: new Date(trend.timestamp).toLocaleDateString(),
        score: trend.score,
      };
    })
    .filter((item): item is { date: string; score: number } => item !== null)
    .reduce((acc, curr) => {
      const existing = acc.find((item) => item.date === curr.date);
      if (existing) {
        existing.totalScore += curr.score;
        existing.count += 1;
        existing.averageScore = Math.round(existing.totalScore / existing.count);
      } else {
        acc.push({
          date: curr.date,
          totalScore: curr.score,
          count: 1,
          averageScore: curr.score,
        });
      }
      return acc;
    }, [] as Array<{ date: string; totalScore: number; count: number; averageScore: number }>)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreStatus = (score: number) => {
    if (score >= 70) return "Healthy";
    if (score >= 50) return "Moderate";
    return "Needs Attention";
  };

  return (
    <div className="min-h-screen bg-stone-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">
            Professional Dashboard
          </h1>
          <p className="text-stone-600">
            Anonymized well-being trends and insights
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="border-red-300 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="border-stone-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-stone-600">Total Users</CardDescription>
                <Users className="w-4 h-4 text-stone-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-forest-700">
                {analytics.totalUsers}
              </div>
            </CardContent>
          </Card>

          <Card className="border-stone-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-stone-600">Average Score</CardDescription>
                <Activity className="w-4 h-4 text-stone-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getScoreColor(analytics.averageScore)}`}>
                {analytics.averageScore}%
              </div>
              <p className="text-xs text-stone-500 mt-1">
                {getScoreStatus(analytics.averageScore)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-stone-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-stone-600">Weekly Average</CardDescription>
                <TrendingUp className="w-4 h-4 text-stone-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getScoreColor(analytics.weeklyAverage)}`}>
                {analytics.weeklyAverage}%
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Last 7 days
              </p>
            </CardContent>
          </Card>

          <Card className="border-stone-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-stone-600">Trend</CardDescription>
                <AlertCircle className="w-4 h-4 text-stone-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                analytics.weeklyAverage > analytics.averageScore
                  ? "text-forest-600"
                  : analytics.weeklyAverage < analytics.averageScore
                  ? "text-terracotta-600"
                  : "text-stone-600"
              }`}>
                {analytics.weeklyAverage > analytics.averageScore ? "↑" : 
                 analytics.weeklyAverage < analytics.averageScore ? "↓" : "→"}
                {Math.abs(analytics.weeklyAverage - analytics.averageScore)}%
              </div>
              <p className="text-xs text-stone-500 mt-1">
                {analytics.weeklyAverage > analytics.averageScore ? "Improving" : 
                 analytics.weeklyAverage < analytics.averageScore ? "Declining" : "Stable"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Wellness Trends Chart */}
        <Card className="border-stone-300">
          <CardHeader>
            <CardTitle className="text-forest-800">Wellness Score Trends</CardTitle>
            <CardDescription className="text-stone-600">
              Daily average wellness scores across all users
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d6d3d1" />
                  <XAxis dataKey="date" stroke="#78716c" />
                  <YAxis domain={[0, 100]} stroke="#78716c" />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="averageScore"
                    stroke="#16a34a"
                    fillOpacity={1}
                    fill="url(#colorScore)"
                    name="Average Score"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-stone-500">
                {isLoading ? "Loading..." : "No data available yet"}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Insights */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Key Insights</CardTitle>
              <CardDescription>Actionable recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analytics.averageScore < 50 && (
                <div className="flex gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-red-900">
                      Low Wellness Alert
                    </h4>
                    <p className="text-xs text-red-700 mt-1">
                      Overall wellness scores are below threshold. Consider organizing a wellness workshop or support session.
                    </p>
                  </div>
                </div>
              )}
              
              {analytics.weeklyAverage < analytics.averageScore - 10 && (
                <div className="flex gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <TrendingUp className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5 transform rotate-180" />
                  <div>
                    <h4 className="font-semibold text-sm text-yellow-900">
                      Declining Trend
                    </h4>
                    <p className="text-xs text-yellow-700 mt-1">
                      Wellness scores have dropped this week. This may indicate increased stress - perhaps due to exams or deadlines.
                    </p>
                  </div>
                </div>
              )}
              
              {analytics.weeklyAverage > analytics.averageScore && (
                <div className="flex gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-green-900">
                      Positive Trend
                    </h4>
                    <p className="text-xs text-green-700 mt-1">
                      Wellness scores are improving. Current interventions are working well.
                    </p>
                  </div>
                </div>
              )}

              {analytics.totalUsers === 0 && (
                <div className="flex gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Users className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-blue-900">
                      Getting Started
                    </h4>
                    <p className="text-xs text-blue-700 mt-1">
                      No user data yet. Share the app with students to start collecting anonymized wellness insights.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>About This Dashboard</CardTitle>
              <CardDescription>Privacy & Usage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <p>
                <strong>Anonymized Data:</strong> All user data is aggregated and anonymized. Individual identities are protected.
              </p>
              <p>
                <strong>Proactive Support:</strong> Use these trends to identify when additional resources or interventions may be needed.
              </p>
              <p>
                <strong>Cultural Context:</strong> Panjaayathu is designed for Indian student populations, accounting for collectivist values and family dynamics.
              </p>
              <p className="text-xs text-gray-500 pt-2 border-t">
                <strong>Note:</strong> This is a prototype for demonstration. Production use requires proper ethical approval, data governance, and mental health professional oversight.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
