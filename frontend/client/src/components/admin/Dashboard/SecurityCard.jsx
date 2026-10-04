import React from "react";
import {
  FaShieldAlt,
  FaServer,
  FaDatabase,
  FaCloud,
  FaCircle,
} from "react-icons/fa";

const statusColor = {
  online: "text-green-500",
  offline: "text-red-500",
  warning: "text-yellow-500",
  maintenance: "text-orange-500",
};

export default function SecurityCard({
  security = {},
}) {

  const items = [
    {
      title: "Server Status",
      value: security.serverStatus,
      icon: <FaServer />,
    },
    {
      title: "Database",
      value: security.databaseStatus,
      icon: <FaDatabase />,
    },
    {
      title: "API Service",
      value: security.apiStatus,
      icon: <FaCloud />,
    },
    {
      title: "System Security",
      value: security.securityStatus,
      icon: <FaShieldAlt />,
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 h-full">

      {/* Header */}

      <div className="mb-6">

        <h2 className="text-xl font-bold text-gray-800">
          System Status
        </h2>

        <p className="text-sm text-gray-500">
          Live infrastructure monitoring
        </p>

      </div>

      {/* Empty */}

      {items.every((item) => !item.value) ? (

        <div className="h-72 flex items-center justify-center text-gray-400">
          No status available
        </div>

      ) : (

        <div className="space-y-4">

          {items.map((item, index) => (

            <div
              key={index}
              className="flex justify-between items-center border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition"
            >

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">

                  {item.icon}

                </div>

                <div>

                  <h3 className="font-semibold text-gray-800">
                    {item.title}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {item.value || "--"}
                  </p>

                </div>

              </div>

              <div className="flex items-center gap-2">

                <FaCircle
                  className={
                    statusColor[item.value?.toLowerCase()] ||
                    "text-gray-400"
                  }
                />

                <span
                  className={`capitalize font-medium ${
                    statusColor[item.value?.toLowerCase()] ||
                    "text-gray-500"
                  }`}
                >
                  {item.value || "--"}
                </span>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}