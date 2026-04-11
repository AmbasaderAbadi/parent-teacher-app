import React, { useState } from "react";
import { Card } from "../../../shared/components/UI/Card";
import { Table } from "../../../shared/components/UI/Table";

export const GradesPage = () => {
  const [selectedTerm, setSelectedTerm] = useState("All");

  const columns = [
    { header: "Subject", accessor: "subject" },
    { header: "Score", accessor: "score" },
    { header: "Grade", accessor: "grade" },
    { header: "Term", accessor: "term" },
    { header: "Teacher", accessor: "teacher" },
  ];

  const sampleGrades = [
    {
      subject: "Mathematics",
      score: "85%",
      grade: "A",
      term: "Term 1",
      teacher: "Mr. Smith",
    },
    {
      subject: "Science",
      score: "78%",
      grade: "B+",
      term: "Term 1",
      teacher: "Mrs. Johnson",
    },
    {
      subject: "English",
      score: "92%",
      grade: "A+",
      term: "Term 1",
      teacher: "Ms. Davis",
    },
  ];

  const terms = ["All", "Term 1", "Term 2", "Term 3"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Grades</h1>
        <p className="text-gray-600">View academic performance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600">Overall Average</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">85%</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600">Highest Score</p>
            <p className="text-2xl font-bold text-green-600 mt-2">92%</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600">Subjects Taken</p>
            <p className="text-2xl font-bold text-purple-600 mt-2">6</p>
          </div>
        </Card>
      </div>

      {/* Term Selector */}
      <Card>
        <div className="flex gap-2">
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
      <Table columns={columns} data={sampleGrades} />
    </div>
  );
};
