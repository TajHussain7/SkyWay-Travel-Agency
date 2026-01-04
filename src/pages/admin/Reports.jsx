import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import axios from "axios";

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAuth();
    setLoading(false);
  }, []);

  const checkAdminAuth = async () => {
    try {
      const response = await axios.get("/api/auth/me", {
        withCredentials: true,
      });
      const userData = response.data.user || response.data.data?.user;
      if (!userData || userData.role !== "admin") {
        navigate("/dashboard");
      }
    } catch (error) {
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-8">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <i className="fas fa-spinner fa-spin text-6xl text-primary mb-4"></i>
              <p className="text-xl text-gray-600">Loading reports...</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                <i className="fas fa-chart-line me-3"></i> Reports & Analytics
              </h1>
              <p className="text-gray-100 text-lg">
                View detailed reports and analytics
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-700 text-white p-6">
            <h2 className="text-2xl font-bold">Reports</h2>
          </div>
          <div className="p-16 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-chart-line text-4xl text-green-600"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Reports Coming Soon
            </h3>
            <p className="text-gray-600">
              Analytics and reporting features will be available here
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Reports;
