import { DateType } from "@/types";

export const formatDate = (
  dateValue: string | number,
  type: DateType = "shortened",
): string => {
  // 1. Convert to date string
  const dateString = new Date(dateValue).toLocaleString();

  // 2. Parse custom format: "22/08/2025, 15:08:44"
  const [datePart, timePart] = dateString.split(", ");
  const [day, month, year] = datePart.split("/").map(Number);
  const [hours, minutes, seconds] = timePart.split(":").map(Number);

  const date = new Date(year, month - 1, day, hours, minutes, seconds);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // RETURN COMPLETE VERSION
  if (type === "complete" || type === "date-only") {
    const months = [
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
      "Jan",
    ];
    // Using Intl for localized and clean formatting
    const dayNum = date.getDate();
    const monthStr = date.toLocaleString("en-US", { month: "short" });
    const yearShort = date.getFullYear().toString().slice(-2);

    let hr = date.getHours();
    const min = date.getMinutes().toString().padStart(2, "0");
    const ampm = hr >= 12 ? "PM" : "AM";
    hr = hr % 12 || 12;

    return type === "complete"
      ? `${dayNum} ${monthStr} ${yearShort} – ${hr}:${min} ${ampm}`
      : `${dayNum} ${monthStr} ${yearShort}`;
  }

  // RETURN SHORTENED VERSION
  if (diffInSeconds < 60) return "Now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w`;
  if (diffInSeconds < 31536000)
    return `${Math.floor(diffInSeconds / 2592000)}mo`;

  return `${Math.floor(diffInSeconds / 31536000)}y`;
};
