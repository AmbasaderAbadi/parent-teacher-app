import React from "react";
import { Card } from "../../../shared/components/UI/Card";
import { Button } from "../../../shared/components/UI/Button";

const ClassManagement = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Class Management</h1>
        <p className="text-gray-600">Manage your classes</p>
      </div>

      <Card>
        <div className="text-center py-8">
          <p className="text-gray-500">Class management features coming soon</p>
          <Button className="mt-4" variant="primary">
            Create Class
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ClassManagement;
