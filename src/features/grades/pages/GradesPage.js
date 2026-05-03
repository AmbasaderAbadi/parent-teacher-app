import React, { useState, useEffect } from "react";
import { Card } from "../../../shared/components/UI/Card";
import { Table } from "../../../shared/components/UI/Table";
import { useTranslation } from "react-i18next";
import { gradesAPI, studentsAPI } from "../../../services/api";
import toast from "react-hot-toast";

export const GradesPage = () => {
  const { t } = useTranslation();
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
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [children, setChildren] = useState([]);

  const columns = [
    { header: t("subject_header"), accessor: "subject" },
    { header: t("score_header"), accessor: "score" },
    { header: t("grade_header"), accessor: "grade" },
    { header: t("term_header"), accessor: "term" },
    { header: t("teacher_header"), accessor: "teacher" },
  ];

  const terms = [t("all_terms"), t("term_1"), t("term_2"), t("term_3")];

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserRole(user.role);
        if (user.role === "parent" && user.linkedStudents) {
          setChildren(user.linkedStudents);
          if (user.linkedStudents.length > 0)
            setSelectedChildId(user.linkedStudents[0]);
        } else {
          fetchGrades();
        }
      } catch (e) {
        console.error("Error parsing user:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (userRole === "parent" && selectedChildId) {
      fetchGrades(selectedChildId);
    } else if (userRole !== "parent") {
      fetchGrades();
    }
  }, [userRole, selectedChildId]);

  const fetchGrades = async (childId = null) => {
    setLoading(true);
    try {
      let gradesData = [];
      if (userRole === "parent" && childId) {
        const response = await gradesAPI.getStudentGrades(childId);
        gradesData = response.data?.data || response.data || [];
      } else if (userRole === "student") {
        const response = await gradesAPI.getMyGrades();
        gradesData = response.data?.data || response.data || [];
      } else if (userRole === "teacher") {
        const response = await gradesAPI.getMyGrades();
        gradesData = response.data?.data || response.data || [];
      } else {
        const response = (await gradesAPI.getAllGrades?.()) || { data: [] };
        gradesData = response.data?.data || response.data || [];
      }

      const formatted = gradesData.map((grade) => ({
        id: grade.id || grade._id,
        subject: grade.subject,
        score: `${grade.score}%`,
        grade: grade.grade || calculateGradeLetter(grade.score),
        term: grade.term || t("term_1"),
        teacher: grade.teacherName || grade.teacher,
        rawScore: grade.score,
        date: grade.date || grade.assessmentDate,
      }));

      setGrades(formatted);
      calculateSummary(formatted);
    } catch (error) {
      console.error("Error fetching grades:", error);
      toast.error(t("failed_load_grades"));
      setGrades([]);
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
    const scores = gradesData.map((g) => g.rawScore);
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

  const filteredGrades =
    selectedTerm === t("all_terms")
      ? grades
      : grades.filter((g) => g.term === selectedTerm);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t("grades")}</h1>
          <p className="text-gray-600">{t("view_academic_performance")}</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="loading-spinner mx-auto"></div>
            <p className="mt-4 text-gray-600">{t("loading_grades")}</p>
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
        <h1 className="text-2xl font-bold text-gray-800">{t("grades")}</h1>
        <p className="text-gray-600">{t("view_academic_performance")}</p>
      </div>

      {/* Child selector for parents */}
      {userRole === "parent" && children.length > 1 && (
        <Card>
          <div className="flex items-center gap-4">
            <label className="font-medium text-gray-700">
              {t("select_child")}:
            </label>
            <select
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              {children.map((child, idx) => (
                <option key={idx} value={child}>
                  {child}
                </option>
              ))}
            </select>
          </div>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600">{t("overall_average")}</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              {summary.average}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600">{t("highest_score")}</p>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {summary.highest}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600">{t("lowest_score")}</p>
            <p className="text-2xl font-bold text-orange-600 mt-2">
              {summary.lowest}
            </p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600">{t("subjects_taken")}</p>
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
            <p>{t("no_grades_for_term", { term: selectedTerm })}</p>
          </div>
        </Card>
      ) : (
        <Table columns={columns} data={filteredGrades} />
      )}

      {/* Performance Distribution */}
      {filteredGrades.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {t("performance_distribution")}
          </h3>
          <div className="space-y-3">
            {filteredGrades.map((grade, idx) => {
              const score = parseInt(grade.score);
              let barColor = "bg-green-500";
              if (score < 70) barColor = "bg-red-500";
              else if (score < 80) barColor = "bg-yellow-500";
              else if (score < 90) barColor = "bg-blue-500";
              return (
                <div key={idx}>
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
    </div>
  );
};
