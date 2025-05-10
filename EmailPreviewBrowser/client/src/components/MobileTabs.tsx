import React from "react";
import { Mail, Reply, FileText, MessageSquare } from "lucide-react";

interface MobileTabsProps {
  activeTab: number;
  setActiveTab: (index: number) => void;
}

const MobileTabs: React.FC<MobileTabsProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { name: "Emails", icon: <Mail className="h-4 w-4 mr-1" /> },
    { name: "Mail & Reply", icon: <Reply className="h-4 w-4 mr-1" /> },
    { name: "Documents", icon: <FileText className="h-4 w-4 mr-1" /> },
    { name: "Threads", icon: <MessageSquare className="h-4 w-4 mr-1" /> },
  ];

  return (
    <div className="w-full bg-white border-b border-gray-200 md:hidden">
      <nav className="flex">
        {tabs.map((tab, index) => (
          <button
            key={tab.name}
            className={`px-4 py-3 text-sm font-medium flex items-center ${
              activeTab === index
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300"
            }`}
            onClick={() => setActiveTab(index)}
          >
            {tab.icon}
            {tab.name}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default MobileTabs;
