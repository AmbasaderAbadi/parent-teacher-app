import React from "react";
import { Card } from "../../../shared/components/UI/Card";
import { FiFile, FiDownload, FiEye } from "react-icons/fi";

export const MaterialsPage = () => {
  const materials = [
    {
      id: 1,
      title: "Mathematics Assignment",
      subject: "Math",
      type: "PDF",
      date: "2024-01-15",
    },
    {
      id: 2,
      title: "Science Lab Report",
      subject: "Science",
      type: "DOC",
      date: "2024-01-10",
    },
    {
      id: 3,
      title: "English Reading Material",
      subject: "English",
      type: "PDF",
      date: "2024-01-05",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Learning Materials</h1>
        <p className="text-gray-600">Access study materials and resources</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {materials.map((material) => (
          <Card key={material.id} className="hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FiFile className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {material.title}
                  </h3>
                  <div className="flex gap-2 mt-1">
                    <span className="text-sm text-gray-500">
                      {material.subject}
                    </span>
                    <span className="text-sm text-gray-400">•</span>
                    <span className="text-sm text-gray-500">
                      {material.type}
                    </span>
                    <span className="text-sm text-gray-400">•</span>
                    <span className="text-sm text-gray-500">
                      {material.date}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-gray-600 hover:text-blue-600">
                  <FiEye size={18} />
                </button>
                <button className="p-2 text-gray-600 hover:text-green-600">
                  <FiDownload size={18} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
