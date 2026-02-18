import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext"; // 🔑 MUST IMPORT THIS
import { Navigate } from "react-router-dom"; // 🔑 MUST IMPORT THIS
import {
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  Calendar,
  Check,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import api from "../api/api";

export default function CalorieTracker() {
  const { logout, user, loading } = useContext(AuthContext);

  const [entries, setEntries] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [newEntry, setNewEntry] = useState({
    date: new Date().toISOString().split("T")[0],
    weight: "",
    caloriesIn: "",
    caloriesOut: "",
    protein: "",
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-50">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }
  if (!user) return <Navigate to="/" replace />;

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const res = await api.get("/entries");

      const sorted = res.data.sort(
        (a, b) => new Date(b.date) - new Date(a.date),
      );

      setEntries(sorted);
    } catch (err) {
      console.error(err);
    }
  };

  const saveEntry = async () => {
    if (!newEntry.weight || !newEntry.caloriesIn) return;

    setIsSaving(true); // Start the spinner
    try {
      const calIn = Number(newEntry.caloriesIn);
      const calOut = Number(newEntry.caloriesOut || 0) + 1800;

      const payload = {
        ...newEntry,
        caloriesIn: calIn,
        caloriesOut: calOut,
        caloriesReduced: calIn - calOut,
        weight: Number(newEntry.weight),
        protein: Number(newEntry.protein || 0),
      };

      await api.post("/entries", payload);
      await loadData();

      setIsSaving(false); // Stop spinner
      setShowSuccess(true); // Start checkmark

      // Reset checkmark after 2 seconds
      setTimeout(() => setShowSuccess(false), 2000);

      setNewEntry({
        date: new Date().toISOString().split("T")[0],
        weight: "",
        caloriesIn: "",
        caloriesOut: "",
        protein: "",
      });
    } catch (err) {
      setIsSaving(false);
      alert("Error: " + err.message);
    }
  };

  const deleteEntry = async (id) => {
    await api.delete(`/entries/${id}`);
    setEntries(entries.filter((e) => e._id !== id));
  };

  const getWeightChange = () => {
    if (entries.length < 2) return null;
    const latest = parseFloat(entries[0].weight);
    const oldest = parseFloat(entries[entries.length - 1].weight);
    const change = latest - oldest;
    return change.toFixed(1);
  };

  const getAverages = () => {
    if (entries.length === 0) return null;
    const sum = entries.reduce(
      (acc, e) => ({
        caloriesIn: acc.caloriesIn + (parseFloat(e.caloriesIn) || 0),
        protein: acc.protein + (parseFloat(e.protein) || 0),
      }),
      { caloriesIn: 0, protein: 0 },
    );

    return {
      caloriesIn: (sum.caloriesIn / entries.length).toFixed(0),
      protein: (sum.protein / entries.length).toFixed(0),
    };
  };

  const weightChange = getWeightChange();
  const averages = getAverages();

  // Prepare chart data (reverse to show oldest to newest)
  const chartData = [...entries].reverse().map((entry) => ({
    date: new Date(entry.date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    }),
    weight: parseFloat(entry.weight) || 0,
    caloriesIn: parseFloat(entry.caloriesIn) || 0,
    caloriesOut: parseFloat(entry.caloriesOut) || 0,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            Welcome back,{" "}
            <span className="text-indigo-600">King</span>!
          </h1>
          <button
            onClick={logout}
            className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition"
          >
            Logout
          </button>
        </div>
        {/* HEADER */}

        <h1 className="text-4xl font-bold text-gray-800 flex items-center gap-3">
          <Calendar className="text-indigo-600" />
          Daily Nutrition Tracker
        </h1>

        {/* STATS */}
        {entries.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6">
            <StatCard
              title="Current Weight"
              value={`${entries[0].weight} kg`}
              extra={
                weightChange && (
                  <span
                    className={`flex items-center gap-1 ${
                      weightChange < 0 ? "text-green-600" : "text-orange-600"
                    }`}
                  >
                    {weightChange < 0 ? (
                      <TrendingDown size={16} />
                    ) : (
                      <TrendingUp size={16} />
                    )}
                    {Math.abs(weightChange)} kg
                  </span>
                )
              }
            />
            <StatCard
              title="Avg Daily Calories"
              value={`${averages?.caloriesIn} kcal`}
              color="purple"
            />
            <StatCard
              title="Avg Daily Protein"
              value={`${averages?.protein} g`}
              color="green"
            />
          </div>
        )}

        {/* FORM + CHART */}
        <div className="grid lg:grid-cols-2 gap-6 items-stretch">
          {/* LEFT SIDE — FORM */}
          <Card title="Add New Entry">
            <Input
              label="Date"
              type="date"
              value={newEntry.date}
              onChange={(e) =>
                setNewEntry({ ...newEntry, date: e.target.value })
              }
            />

            <Input
              label="Weight (kg)"
              value={newEntry.weight}
              onChange={(e) =>
                setNewEntry({ ...newEntry, weight: e.target.value })
              }
            />

            <Input
              label="Calories In"
              value={newEntry.caloriesIn}
              onChange={(e) =>
                setNewEntry({ ...newEntry, caloriesIn: e.target.value })
              }
            />

            <Input
              label="Calories Burned"
              value={newEntry.caloriesOut}
              onChange={(e) =>
                setNewEntry({ ...newEntry, caloriesOut: e.target.value })
              }
            />

            <Input
              label="Protein (g)"
              value={newEntry.protein}
              onChange={(e) =>
                setNewEntry({ ...newEntry, protein: e.target.value })
              }
            />

            <button
              onClick={saveEntry}
              disabled={isSaving || showSuccess}
              className={`mt-4 w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-md text-white
    ${
      showSuccess
        ? "bg-green-500 scale-105"
        : isSaving
          ? "bg-indigo-400 cursor-wait"
          : "bg-indigo-600 hover:bg-indigo-700 active:scale-95"
    }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Saving...</span>
                </>
              ) : showSuccess ? (
                <>
                  <Check size={20} className="animate-bounce" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Plus size={20} />
                  <span>Add Entry</span>
                </>
              )}
            </button>

            <p className="mt-4 text-xs text-gray-500 text-center italic">
              Note: Calories Burned includes a base BMR of 1800 kcal.
            </p>  
          </Card>

          {/* RIGHT SIDE — BOTH GRAPHS */}
          <div className="space-y-6">
            {/* WEIGHT GRAPH */}
            <Card title="Weight Progress">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[80, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    name="Weight (kg)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* CALORIES GRAPH */}
            <Card title="Calories In vs Burned">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="caloriesIn"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    name="Calories In"
                  />
                  <Line
                    type="monotone"
                    dataKey="caloriesOut"
                    stroke="#10b981"
                    strokeWidth={3}
                    name="Calories Burned"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>

        {/* TABLE */}
        <Card>
          <table className="w-full text-left">
            <thead className="bg-indigo-600 text-white">
              <tr>
                {["Date", "Weight", "In", "Out", "Net", "Protein", ""].map(
                  (h) => (
                    <th key={h} className="px-4 py-3">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {entries.map((e, i) => (
                <tr key={e._id} className={i % 2 ? "bg-gray-50" : ""}>
                  <td className="px-4 py-2">{e.date}</td>
                  <td className="px-4 py-2">{e.weight}</td>
                  <td className="px-4 py-2">{e.caloriesIn}</td>
                  <td className="px-4 py-2">{e.caloriesOut}</td>
                  <td className="px-4 py-2">{e.caloriesReduced}</td>
                  <td className="px-4 py-2">{e.protein}</td>
                  <td className="px-4 py-2">
                    <Trash2
                      onClick={() => deleteEntry(e._id)}
                      className="text-red-500 cursor-pointer"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

// ================= REUSABLE UI =================
const Card = ({ title, children }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6">
    {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
    {children}
  </div>
);

const Input = ({ label, ...props }) => (
  <div className="mb-3">
    <label className="text-sm text-gray-600">{label}</label>
    <input
      {...props}
      className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500"
    />
  </div>
);

const StatCard = ({ title, value, extra, color = "blue" }) => (
  <div className={`p-4 rounded-xl bg-${color}-50`}>
    <div className="text-sm text-gray-600">{title}</div>
    <div className={`text-2xl font-bold text-${color}-700`}>{value}</div>
    {extra}
  </div>
);
