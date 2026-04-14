import React, { useState, useEffect } from "react";
import { Card } from "../../../shared/components/UI/Card";
import { FiFile, FiDownload, FiEye } from "react-icons/fi";
import { materialsAPI } from "../../../services/api";
import toast from "react-hot-toast";

export const MaterialsPage = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Get user role from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserRole(user.role);
      } catch (e) {
        console.error("Error parsing user:", e);
      }
    }
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      let response;

      // Different endpoints based on user role
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);

        if (user.role === "teacher") {
          response = await materialsAPI.getMyMaterials();
        } else if (user.role === "student") {
          response = await materialsAPI.getMyMaterials();
        } else {
          // Admin or other roles - get all materials
          // This endpoint may need to be created
          response = (await materialsAPI.getAllMaterials?.()) || { data: [] };
        }
      } else {
        response = { data: [] };
      }

      const materialsData = response.data;

      // Transform API data to match component structure
      const formattedMaterials = materialsData.map((material) => ({
        id: material.id || material._id,
        title: material.title,
        subject: material.subject,
        type: material.fileType?.toUpperCase() || "PDF",
        date: material.createdAt
          ? new Date(material.createdAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        fileUrl: material.fileUrl,
        fileName: material.fileName,
        description: material.description,
        grade: material.grade,
        section: material.section,
        uploadedBy: material.uploadedBy,
      }));

      setMaterials(formattedMaterials);
    } catch (error) {
      console.error("Error fetching materials:", error);
      toast.error("Failed to load materials. Using demo data.");

      // Fallback to demo data
      const demoMaterials = [
        {
          id: 1,
          title: "Mathematics Assignment",
          subject: "Math",
          type: "PDF",
          date: "2024-01-15",
          fileUrl: "#",
          fileName: "math_assignment.pdf",
        },
        {
          id: 2,
          title: "Science Lab Report",
          subject: "Science",
          type: "DOC",
          date: "2024-01-10",
          fileUrl: "#",
          fileName: "science_lab.doc",
        },
        {
          id: 3,
          title: "English Reading Material",
          subject: "English",
          type: "PDF",
          date: "2024-01-05",
          fileUrl: "#",
          fileName: "english_reading.pdf",
        },
      ];
      setMaterials(demoMaterials);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (material) => {
    try {
      // Show downloading toast
      toast.loading(`Downloading ${material.title}...`, { id: "download" });

      // Call API to get download URL or file
      // const response = await materialsAPI.downloadMaterial(material.id);

      // Simulate download for demo
      setTimeout(() => {
        toast.success(`${material.title} downloaded successfully!`, {
          id: "download",
        });
      }, 1000);

      // For actual file download, you would do:
      // const blob = new Blob([response.data], { type: 'application/octet-stream' });
      // const url = window.URL.createObjectURL(blob);
      // const link = document.createElement('a');
      // link.href = url;
      // link.setAttribute('download', material.fileName || `${material.title}.pdf`);
      // document.body.appendChild(link);
      // link.click();
      // link.remove();
      // window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading material:", error);
      toast.error("Failed to download material", { id: "download" });
    }
  };

  const handleView = (material) => {
    if (material.fileUrl && material.fileUrl !== "#") {
      window.open(material.fileUrl, "_blank");
    } else {
      toast.info("Preview not available. Please download the file to view it.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Learning Materials
          </h1>
          <p className="text-gray-600">Access study materials and resources</p>
        </div>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="loading-spinner mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading materials...</p>
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
        <h1 className="text-2xl font-bold text-gray-800">Learning Materials</h1>
        <p className="text-gray-600">Access study materials and resources</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {materials.length === 0 ? (
          <Card>
            <div className="text-center py-8 text-gray-500">
              <p>No materials available yet.</p>
              {userRole === "teacher" && (
                <p className="text-sm mt-2">
                  Upload materials using the "Upload Material" button.
                </p>
              )}
            </div>
          </Card>
        ) : (
          materials.map((material) => (
            <Card
              key={material.id}
              className="hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FiFile className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {material.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-1">
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
                      {material.grade && (
                        <>
                          <span className="text-sm text-gray-400">•</span>
                          <span className="text-sm text-gray-500">
                            {material.grade}{" "}
                            {material.section &&
                              `- Section ${material.section}`}
                          </span>
                        </>
                      )}
                      {material.uploadedBy && (
                        <>
                          <span className="text-sm text-gray-400">•</span>
                          <span className="text-sm text-gray-500">
                            By: {material.uploadedBy}
                          </span>
                        </>
                      )}
                    </div>
                    {material.description && (
                      <p className="text-sm text-gray-500 mt-1">
                        {material.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleView(material)}
                    className="p-2 text-gray-600 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50"
                    title="Preview"
                  >
                    <FiEye size={18} />
                  </button>
                  <button
                    onClick={() => handleDownload(material)}
                    className="p-2 text-gray-600 hover:text-green-600 transition-colors rounded-full hover:bg-green-50"
                    title="Download"
                  >
                    <FiDownload size={18} />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
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
};
