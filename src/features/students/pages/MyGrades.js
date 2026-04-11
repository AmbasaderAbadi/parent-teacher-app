import React from "react";
import { Card } from "../../../shared/components/UI/Card";
import { Table } from "../../../shared/components/UI/Table";

const MyGrades = () => {
  const columns = [
    { header: "Subject", accessor: "subject" },
    { header: "Score", accessor: "score" },
    { header: "Grade", accessor: "grade" },
    { header: "Term", accessor: "term" },
    { header: "Teacher", accessor: "teacher" },
  ];

  const grades = [
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
    {
      subject: "History",
      score: "88%",
      grade: "A-",
      term: "Term 1",
      teacher: "Mr. Brown",
    },
    {
      subject: "Physics",
      score: "82%",
      grade: "B+",
      term: "Term 1",
      teacher: "Dr. Wilson",
    },
  ];

  const summary = {
    average: "85%",
    highest: "92%",
    lowest: "78%",
    totalSubjects: 5,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Grades</h1>
        <p className="text-gray-600">View your academic performance</p>
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
        <Table columns={columns} data={grades} />
      </Card>
    </div>
  );
};

export default MyGrades;
