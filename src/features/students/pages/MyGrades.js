import React, { useState, useEffect } from "react";
import { Card } from "../../../shared/components/UI/Card";
import { Table } from "../../../shared/components/UI/Table";
import { gradesAPI } from "../../../services/api";
import toast from "react-hot-toast";

const MyGrades = () => {
  const [grades, setGrades] = useState([]);
  const [summary, setSummary] = useState({
    average: "0%",
    highest: "0%",
    lowest: "0%",
    totalSubjects: 0,
  });
  const [loading, setLoading] = useState(true);
  const [studentUser, setStudentUser] = useState(null);

  const columns = [
    { header: "Subject", accessor: "subject" },
    { header: "Score", accessor: "score" },
    { header: "Grade", accessor: "grade" },
    { header: "Term", accessor: "term" },
    { header: "Teacher", accessor: "teacher" },
  ];

  useEffect(() => {
    fetchGradesData();
  }, []);

  const fetchGradesData = async () => {
    setLoading(true);
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setStudentUser(userData);
      }

      const response = await gradesAPI.getMyGrades();
      const gradesData = response.data;

      const formattedGrades = gradesData.map((grade) => ({
        id: grade.id || grade._id,
        subject: grade.subject,
        score: `${grade.score}%`,
        grade: grade.grade || calculateGradeLetter(grade.score),
        term: grade.term || "Term 1",
        teacher: grade.teacherName || grade.teacher || "Staff",
        rawScore: grade.score,
      }));

      setGrades(formattedGrades);
      calculateSummary(formattedGrades);
    } catch (error) {
      console.error("Error fetching grades:", error);
      toast.error("Failed to load grades data");
      setGrades([]);
      calculateSummary([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateGradeLetter = (score) => {
    if (score >= 90) return "A+";
    if (score >= 85) return "A";
    if (score >= 80) return "A-";
    if (score >= 75) return "B+";
    if (score >= 70) return "B";
    if (score >= 65) return "B-";
    if (score >= 60) return "C+";
    if (score >= 55) return "C";
    if (score >= 50) return "C-";
    return "F";
  };

  const calculateSummary = (gradesData) => {
    if (gradesData.length === 0) {
      setSummary({
        average: "0%",
        highest: "0%",
        lowest: "0%",
        totalSubjects: 0,
      });
      return;
    }

    const scores = gradesData.map((g) => g.rawScore || parseInt(g.score));
    const average = Math.round(
      scores.reduce((a, b) => a + b, 0) / scores.length,
    );
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);

    setSummary({
      average: `${average}%`,
      highest: `${highest}%`,
      lowest: `${lowest}%`,
      totalSubjects: gradesData.length,
    });
  };

  const handleExportGrades = () => {
    if (grades.length === 0) {
      toast.error("No grades available to export");
      return;
    }

    const csvContent = [
      ["Subject", "Score", "Grade", "Term", "Teacher"],
      ...grades.map((grade) => [
        grade.subject,
        grade.score,
        grade.grade,
        grade.term,
        grade.teacher,
      ]),
      [],
      ["SUMMARY"],
      ["Average Grade", summary.average],
      ["Highest Score", summary.highest],
      ["Lowest Score", summary.lowest],
      ["Total Subjects", summary.totalSubjects],
    ];

    const csvString = csvContent.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grades_report_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success("Grades exported successfully!");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="loading-spinner mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading grades data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Grades</h1>
          <p className="text-gray-600">
            View your academic performance for{" "}
            {studentUser?.firstName || "Student"}
          </p>
        </div>
        {grades.length > 0 && (
          <button
            onClick={handleExportGrades}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Export Grades
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600">Overall Average</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              {summary.average}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600">Highest Score</p>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {summary.highest}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600">Lowest Score</p>
            <p className="text-2xl font-bold text-orange-600 mt-2">
              {summary.lowest}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600">Subjects</p>
            <p className="text-2xl font-bold text-purple-600 mt-2">
              {summary.totalSubjects}
            </p>
          </div>
        </Card>
      </div>

      {/* Grades Table */}
      <Card>
        {grades.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No grades available yet.</p>
            <p className="text-sm mt-2">
              Grades will appear here once teachers add them.
            </p>
          </div>
        ) : (
          <Table columns={columns} data={grades} />
        )}
      </Card>
    </div>
  );
};

export default MyGrades;
