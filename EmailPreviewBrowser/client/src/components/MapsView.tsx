import React, { useState, useEffect } from "react";
import { MapPin, Navigation, ExternalLink, Calendar, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Email } from "@/types";

interface MapsViewProps {
  selectedEmail?: Email;
}

interface LocationInfo {
  name: string;
  address: string;
  date: string;
  time: string;
}

const MapsView: React.FC<MapsViewProps> = ({ selectedEmail }) => {
  const [locationInfo, setLocationInfo] = useState<LocationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Parse email content to extract location information
  useEffect(() => {
    if (!selectedEmail) {
      setLocationInfo(null);
      return;
    }

    setIsLoading(true);

    // Simple regex to extract location information
    // In a real app, this would use a more sophisticated natural language processing approach
    const extractLocationInfo = (body: string): LocationInfo | null => {
      // Check if the email contains "Location:" keyword
      if (!body.includes("Location:")) return null;

      // Extract location details using regex
      const locationRegex = /Location:\s*(.*?)(?:,\s*)(.*?)(?:,\s*)(.*?)(?:,\s*)(.*?)(?:\n|$)/;
      const dateRegex = /Date:\s*(.*?)(?:\n|$)/;
      const timeRegex = /Time:\s*(.*?)(?:\n|$)/;

      const locationMatch = body.match(locationRegex);
      const dateMatch = body.match(dateRegex);
      const timeMatch = body.match(timeRegex);

      if (!locationMatch && !dateMatch) return null;

      const location = locationMatch 
        ? `${locationMatch[1]}, ${locationMatch[2]}, ${locationMatch[3]}, ${locationMatch[4]}` 
        : "Unknown location";
      
      const name = locationMatch ? locationMatch[1] : "Meeting location";
      const address = locationMatch 
        ? `${locationMatch[2]}, ${locationMatch[3]}, ${locationMatch[4]}` 
        : "Unknown address";

      return {
        name: name,
        address: address,
        date: dateMatch ? dateMatch[1] : "Upcoming",
        time: timeMatch ? timeMatch[1] : "TBD"
      };
    };

    // For demo purposes, if the email has "Calendar" label, we'll assume it has location info
    if (selectedEmail.labels.includes("Calendar")) {
      const info = extractLocationInfo(selectedEmail.body);
      
      // Fallback for our demo if regex doesn't work
      if (!info) {
        setLocationInfo({
          name: "Skyline Conference Center",
          address: "123 Business Avenue, San Francisco, CA 94103",
          date: "Wednesday, May 17, 2025",
          time: "2:00 PM - 3:30 PM"
        });
      } else {
        setLocationInfo(info);
      }
    } else {
      setLocationInfo(null);
    }

    setIsLoading(false);
  }, [selectedEmail]);

  if (isLoading) {
    return (
      <section className="w-full h-full bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">Maps & Directions</h2>
        </div>
        <div className="flex-1 p-4">
          <Skeleton className="h-40 w-full mb-4 rounded-md" />
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-4" />
          <Skeleton className="h-10 w-40" />
        </div>
      </section>
    );
  }

  if (!locationInfo) {
    return (
      <section className="w-full h-full bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">Maps & Directions</h2>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500 flex-col p-4">
          <MapPin className="h-12 w-12 text-gray-300 mb-4" />
          <p className="mb-2">No location information available</p>
          <p className="text-sm text-gray-400">Select an email with location details</p>
        </div>
      </section>
    );
  }

  // In a real application, we would use a proper maps API like Google Maps or Mapbox
  // For this demo, we'll use a placeholder map image
  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(
    locationInfo.address
  )}&zoom=15&size=600x300&markers=color:red%7C${encodeURIComponent(
    locationInfo.address
  )}&key=YOUR_API_KEY`;

  // Generate a Google Maps directions URL
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    locationInfo.address
  )}`;

  return (
    <section className="w-full h-full bg-white flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-800">Maps & Directions</h2>
      </div>
      <ScrollArea className="flex-1 p-4">
        {/* For demo purposes, we're using a placeholder map image */}
        <div className="relative w-full h-64 mb-4 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
          <div className="bg-gray-200 w-full h-full absolute top-0 left-0 opacity-50 z-10"></div>
          <div className="z-20 flex flex-col items-center gap-2">
            <MapPin className="h-10 w-10 text-blue-500" />
            <span className="text-sm text-gray-800 font-medium">Mock Map View</span>
            <span className="text-xs text-gray-600">{locationInfo.address}</span>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-md font-semibold text-gray-800 mb-2">{locationInfo.name}</h3>
          <div className="flex items-start gap-2 mb-2">
            <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
            <p className="text-sm text-gray-700">{locationInfo.address}</p>
          </div>
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">{locationInfo.date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700">{locationInfo.time}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            className="flex items-center gap-2"
            onClick={() => window.open(directionsUrl, '_blank')}
          >
            <Navigation className="h-4 w-4" />
            Get Directions
          </Button>
          <Button 
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => window.open(directionsUrl, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
            Open in Maps
          </Button>
        </div>

        <div className="mt-6">
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-0">Meeting</Badge>
          <div className="text-sm text-gray-500 mt-2">
            <p className="mb-2">Related to email: "{selectedEmail?.subject}"</p>
            <p>From: {selectedEmail?.sender}</p>
          </div>
        </div>
      </ScrollArea>
    </section>
  );
};

export default MapsView;