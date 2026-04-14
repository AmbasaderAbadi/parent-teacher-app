import React, { useState, useEffect } from "react";
import { Card } from "../../../shared/components/UI/Card";
import { Table } from "../../../shared/components/UI/Table";
import { gradesAPI } from "../../../services/api";
import toast from "react-hot-toast";

export const GradesPage = () => {
  const [selectedTerm, setSelectedTerm] = useState("All");
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({
    average: "0%",
    highest: "0%",
    lowest: "0%",
    subjectsCount: 0,
  });
  const [userRole, setUserRole] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [students, setStudents] = useState([]);

  const columns = [
    { header: "Subject", accessor: "subject" },
    { header: "Score", accessor: "score" },
    { header: "Grade", accessor: "grade" },
    { header: "Term", accessor: "term" },
    { header: "Teacher", accessor: "teacher" },
  ];

  const terms = ["All", "Term 1", "Term 2", "Term 3"];

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserRole(user.role);
      } catch (e) {
        console.error("Error parsing user:", e);
      }
    }
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    setLoading(true);
    try {
      let gradesData = [];

      // Different endpoints based on user role
      if (userRole === "student") {
        const response = await gradesAPI.getMyGrades();
        gradesData = response.data;
      } else if (userRole === "parent") {
        // For parents, we might need to select a child first
        // For now, fetch grades for all children or show child selector
        const response = await gradesAPI.getMyGrades();
        gradesData = response.data;
      } else if (userRole === "teacher") {
        // Teachers can view grades they've assigned
        const response = await gradesAPI.getMyGrades();
        gradesData = response.data;
      } else {
        // Admin or other roles
        const response = (await gradesAPI.getAllGrades?.()) || { data: [] };
        gradesData = response.data;
      }

      // Transform API data to match component structure
      const formattedGrades = gradesData.map((grade) => ({
        id: grade.id || grade._id,
        subject: grade.subject,
        score: `${grade.score}%`,
        grade: grade.grade || calculateGradeLetter(grade.score),
        term: grade.term || "Term 1",
        teacher: grade.teacherName || grade.teacher,
        rawScore: grade.score,
        date: grade.date || grade.createdAt?.split("T")[0],
      }));

      setGrades(formattedGrades);
      calculateSummary(formattedGrades);
    } catch (error) {
      console.error("Error fetching grades:", error);
      toast.error("Failed to load grades. Using demo data.");

      // Fallback to demo data
      const demoGrades = [
        {
          id: 1,
          subject: "Mathematics",
          score: "85%",
          grade: "A",
          term: "Term 1",
          teacher: "Mr. Smith",
          rawScore: 85,
        },
        {
          id: 2,
          subject: "Science",
          score: "78%",
          grade: "B+",
          term: "Term 1",
          teacher: "Mrs. Johnson",
          rawScore: 78,
        },
        {
          id: 3,
          subject: "English",
          score: "92%",
          grade: "A+",
          term: "Term 1",
          teacher: "Ms. Davis",
          rawScore: 92,
        },
        {
          id: 4,
          subject: "History",
          score: "88%",
          grade: "A-",
          term: "Term 1",
          teacher: "Mr. Brown",
          rawScore: 88,
        },
        {
          id: 5,
          subject: "Physics",
          score: "82%",
          grade: "B+",
          term: "Term 1",
          teacher: "Dr. Wilson",
          rawScore: 82,
        },
        {
          id: 6,
          subject: "Chemistry",
          score: "90%",
          grade: "A",
          term: "Term 1",
          teacher: "Dr. Anderson",
          rawScore: 90,
        },
      ];
      setGrades(demoGrades);
      calculateSummary(demoGrades);
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
        subjectsCount: 0,
      });
      return;
    }

    const scores = gradesData.map((g) => g.rawScore || parseInt(g.score));
    const average = Math.round(
      scores.reduce((a, b) => a + b, 0) / scores.length,
    );
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    const uniqueSubjects = new Set(gradesData.map((g) => g.subject)).size;

    setSummary({
      average: `${average}%`,
      highest: `${highest}%`,
      lowest: `${lowest}%`,
      subjectsCount: uniqueSubjects,
    });
  };

  const getTermColor = (term) => {
    switch (term) {
      case "Term 1":
        return "bg-blue-100 text-blue-700";
      case "Term 2":
        return "bg-green-100 text-green-700";
      case "Term 3":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredGrades =
    selectedTerm === "All"
      ? grades
      : grades.filter((grade) => grade.term === selectedTerm);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Grades</h1>
          <p className="text-gray-600">View academic performance</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="loading-spinner mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading grades...</p>
          </div>
        </div>
        <style>{`
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #e5e7eb;
            border-top-color: #4f46e5;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Grades</h1>
        <p className="text-gray-600">View academic performance</p>
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
            <p className="text-sm text-gray-600">Subjects Taken</p>
            <p className="text-2xl font-bold text-purple-600 mt-2">
              {summary.subjectsCount}
            </p>
          </div>
        </Card>
      </div>

      {/* Term Selector */}
      <Card>
        <div className="flex flex-wrap gap-2">
          {terms.map((term) => (
            <button
              key={term}
              onClick={() => setSelectedTerm(term)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTerm === term
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {term}
            </button>
          ))}
        </div>
      </Card>

      {/* Grades Table */}
      {filteredGrades.length === 0 ? (
        <Card>
          <div className="text-center py-8 text-gray-500">
            <p>No grades available for {selectedTerm}.</p>
          </div>
        </Card>
      ) : (
        <Table columns={columns} data={filteredGrades} />
      )}

      {/* Performance Distribution (Optional) */}
      {filteredGrades.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Performance Distribution
          </h3>
          <div className="space-y-3">
            {filteredGrades.map((grade, index) => {
              const score = parseInt(grade.score);
              let barColor = "bg-green-500";
              if (score < 70) barColor = "bg-red-500";
              else if (score < 80) barColor = "bg-yellow-500";
              else if (score < 90) barColor = "bg-blue-500";

              return (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{grade.subject}</span>
                    <span className="text-gray-600">{grade.score}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${barColor} rounded-full h-2 transition-all duration-500`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <style>{`
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #e5e7eb;
          border-top-color: #4f46e5;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
