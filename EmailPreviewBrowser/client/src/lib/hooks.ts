import { useState, useEffect } from "react";
import { useLocation } from "wouter";

// Hook for checking mobile screen size
export const useMobileView = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check initially
    checkMobile();

    // Add resize listener
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
};

// Hook for active tab in mobile view
export const useMobileTab = () => {
  const [activeTab, setActiveTab] = useState(0);
  return { activeTab, setActiveTab };
};

// Hook for formatting dates
export const useFormatDate = (dateString: string) => {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 60) {
    return diffMins <= 1 ? "Just now" : `${diffMins} mins ago`;
  } else if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  } else if (diffDays < 2) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  } else {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
};

// Hook for handling search functionality
export const useSearch = <T>(items: T[], searchKey: keyof T) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState<T[]>(items);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredItems(items);
      return;
    }

    const lowerCaseQuery = searchQuery.toLowerCase();
    const filtered = items.filter((item) => {
      const value = item[searchKey] as unknown as string;
      return value.toLowerCase().includes(lowerCaseQuery);
    });

    setFilteredItems(filtered);
  }, [searchQuery, items, searchKey]);

  return { searchQuery, setSearchQuery, filteredItems };
};
