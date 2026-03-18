"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";

interface ClassScheduleItem {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  classType: string;
  instructor: string;
  locationSlug: string;
}

interface AttendanceItem {
  id: string;
  memberId: string;
  classDate: string;
  classType: string;
  locationSlug: string;
  checkedInAt: string;
}

interface EventItem {
  id: string;
  title: string;
  description: string | null;
  date: string;
  endDate: string | null;
  eventType: string;
  locationSlug: string;
}

interface CalendarGridProps {
  initialSchedule: ClassScheduleItem[];
  initialAttendance: AttendanceItem[];
  initialEvents: EventItem[];
  initialMonth: number;
  initialYear: number;
}

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const EVENT_DOT_COLORS: Record<string, string> = {
  seminar: "bg-blue-400",
  "open-mat": "bg-green-400",
  promotion: "bg-yellow-400",
  closure: "bg-red-400",
  social: "bg-purple-400",
  other: "bg-gray-400",
};

const EVENT_BADGE_COLORS: Record<string, string> = {
  seminar: "bg-blue-500/20 text-blue-400",
  "open-mat": "bg-green-500/20 text-green-400",
  promotion: "bg-yellow-500/20 text-yellow-400",
  closure: "bg-red-500/20 text-red-400",
  social: "bg-purple-500/20 text-purple-400",
  other: "bg-gray-500/20 text-gray-400",
};

export default function CalendarGrid({
  initialSchedule,
  initialAttendance,
  initialEvents,
  initialMonth,
  initialYear,
}: CalendarGridProps) {
  const searchParams = useSearchParams();
  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);
  const [schedule, setSchedule] = useState(initialSchedule);
  const [attendance, setAttendance] = useState(initialAttendance);
  const [events, setEvents] = useState(initialEvents);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const fetchData = useCallback(
    async (m: number, y: number) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("month", String(m));
        params.set("year", String(y));

        const location = searchParams.get("location");
        const classType = searchParams.get("classType");
        const eventType = searchParams.get("eventType");
        if (location) params.set("location", location);
        if (classType) params.set("classType", classType);
        if (eventType) params.set("eventType", eventType);

        const res = await fetch(`/api/members/calendar?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setSchedule(data.schedule);
          setAttendance(data.attendance);
          setEvents(data.events);
        }
      } finally {
        setLoading(false);
      }
    },
    [searchParams]
  );

  // Re-fetch when filters change
  useEffect(() => {
    fetchData(month, year);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const goToPrevMonth = () => {
    const newMonth = month === 1 ? 12 : month - 1;
    const newYear = month === 1 ? year - 1 : year;
    setMonth(newMonth);
    setYear(newYear);
    setSelectedDay(null);
    fetchData(newMonth, newYear);
  };

  const goToNextMonth = () => {
    const newMonth = month === 12 ? 1 : month + 1;
    const newYear = month === 12 ? year + 1 : year;
    setMonth(newMonth);
    setYear(newYear);
    setSelectedDay(null);
    fetchData(newMonth, newYear);
  };

  // Calendar math
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  const today = new Date();
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() + 1 === month;
  const todayDate = today.getDate();

  // Build lookup maps
  const attendanceByDate = new Map<string, AttendanceItem[]>();
  attendance.forEach((a) => {
    const dateKey = new Date(a.classDate).toISOString().split("T")[0];
    if (!attendanceByDate.has(dateKey)) attendanceByDate.set(dateKey, []);
    attendanceByDate.get(dateKey)!.push(a);
  });

  const eventsByDate = new Map<string, EventItem[]>();
  events.forEach((e) => {
    const dateKey = new Date(e.date).toISOString().split("T")[0];
    if (!eventsByDate.has(dateKey)) eventsByDate.set(dateKey, []);
    eventsByDate.get(dateKey)!.push(e);
  });

  // Classes per day of week
  const classesByDow = new Map<number, ClassScheduleItem[]>();
  schedule.forEach((s) => {
    if (!classesByDow.has(s.dayOfWeek)) classesByDow.set(s.dayOfWeek, []);
    classesByDow.get(s.dayOfWeek)!.push(s);
  });

  const getDateKey = (day: number) => {
    const d = new Date(year, month - 1, day);
    return d.toISOString().split("T")[0];
  };

  const getDow = (day: number) => {
    return new Date(year, month - 1, day).getDay();
  };

  // Selected day details
  const selectedDateKey = selectedDay ? getDateKey(selectedDay) : null;
  const selectedDow = selectedDay ? getDow(selectedDay) : null;
  const selectedDayAttendance = selectedDateKey
    ? attendanceByDate.get(selectedDateKey) || []
    : [];
  const selectedDayEvents = selectedDateKey
    ? eventsByDate.get(selectedDateKey) || []
    : [];
  const selectedDayClasses =
    selectedDow !== null ? classesByDow.get(selectedDow) || [] : [];

  const formatSelectedDate = (day: number) => {
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const attendedClassType = (classType: string) => {
    return selectedDayAttendance.some((a) => a.classType === classType);
  };

  return (
    <div>
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPrevMonth}
          className="p-2 rounded-lg bg-brand-dark border border-brand-gray text-gray-300 hover:border-brand-teal hover:text-white transition"
          aria-label="Previous month"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-white">
          {MONTH_NAMES[month - 1]} {year}
        </h2>
        <button
          onClick={goToNextMonth}
          className="p-2 rounded-lg bg-brand-dark border border-brand-gray text-gray-300 hover:border-brand-teal hover:text-white transition"
          aria-label="Next month"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-brand-dark border border-brand-gray rounded-lg overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-brand-gray">
          {DAY_HEADERS.map((d) => (
            <div
              key={d}
              className="py-2 text-center text-xs uppercase text-gray-400 font-medium"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {/* Empty cells before first day */}
          {Array.from({ length: firstDayOfMonth }).map((_, i) => (
            <div
              key={`empty-start-${i}`}
              className="border-b border-r border-brand-gray bg-brand-black/30 min-h-[48px] md:aspect-square"
            />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateKey = getDateKey(day);
            const dow = getDow(day);
            const isToday = isCurrentMonth && day === todayDate;
            const isSelected = selectedDay === day;
            const dayAttendance = attendanceByDate.get(dateKey) || [];
            const dayEvents = eventsByDate.get(dateKey) || [];
            const dayClasses = classesByDow.get(dow) || [];

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                className={`relative border-b border-r border-brand-gray min-h-[48px] md:aspect-square p-1 md:p-2 text-left transition hover:bg-brand-gray/20 ${
                  isSelected ? "bg-brand-gray/30" : ""
                } ${isToday ? "ring-1 ring-inset ring-brand-teal" : ""}`}
              >
                <span
                  className={`text-sm ${
                    isToday ? "text-white font-bold" : "text-gray-400"
                  }`}
                >
                  {day}
                </span>

                {/* Indicators */}
                <div className="flex flex-wrap gap-0.5 mt-0.5">
                  {dayAttendance.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-brand-teal" />
                  )}
                  {dayEvents.map((evt) => (
                    <span
                      key={evt.id}
                      className={`w-2 h-2 rounded-full ${
                        EVENT_DOT_COLORS[evt.eventType] || "bg-gray-400"
                      }`}
                    />
                  ))}
                </div>

                {/* Class count (hidden on mobile) */}
                {dayClasses.length > 0 && (
                  <span className="hidden md:block text-[10px] text-gray-500 mt-0.5">
                    {dayClasses.length} class{dayClasses.length !== 1 ? "es" : ""}
                  </span>
                )}
              </button>
            );
          })}

          {/* Empty cells after last day */}
          {(() => {
            const lastDayDow = new Date(year, month - 1, daysInMonth).getDay();
            const trailingEmpty = lastDayDow === 6 ? 0 : 6 - lastDayDow;
            return Array.from({ length: trailingEmpty }).map((_, i) => (
              <div
                key={`empty-end-${i}`}
                className="border-b border-r border-brand-gray bg-brand-black/30 min-h-[48px] md:aspect-square"
              />
            ));
          })()}
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="text-center py-4">
          <span className="text-gray-400 text-sm">Loading...</span>
        </div>
      )}

      {/* Day Detail Panel */}
      {selectedDay && (
        <div className="mt-6 bg-brand-dark border border-brand-gray rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-brand-gray">
            <h3 className="text-white font-semibold">
              {formatSelectedDate(selectedDay)}
            </h3>
          </div>

          <div className="p-6 space-y-6">
            {/* Classes Section */}
            <div>
              <h4 className="text-sm text-gray-400 uppercase tracking-wider font-medium mb-3">
                Classes
              </h4>
              {selectedDayClasses.length > 0 ? (
                <div className="space-y-2">
                  {selectedDayClasses.map((cls) => {
                    const attended = attendedClassType(cls.classType);
                    return (
                      <div
                        key={cls.id}
                        className="flex items-center justify-between py-2 px-3 rounded-lg bg-brand-black/40"
                      >
                        <div className="flex items-center gap-3">
                          {attended ? (
                            <div className="w-6 h-6 rounded-full bg-brand-teal/20 flex items-center justify-center flex-shrink-0">
                              <svg
                                className="w-4 h-4 text-brand-teal"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full border border-brand-gray flex-shrink-0" />
                          )}
                          <div>
                            <p className="text-white text-sm font-medium">
                              {cls.classType}
                            </p>
                            <p className="text-gray-500 text-xs">
                              {cls.instructor}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-brand-teal text-xs font-medium">
                            {cls.startTime} - {cls.endTime}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              cls.locationSlug === "magnolia"
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-purple-500/20 text-purple-400"
                            }`}
                          >
                            {cls.locationSlug === "magnolia"
                              ? "Magnolia"
                              : "Cypress"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  No classes scheduled for this day.
                </p>
              )}
            </div>

            {/* Events Section */}
            {selectedDayEvents.length > 0 && (
              <div>
                <h4 className="text-sm text-gray-400 uppercase tracking-wider font-medium mb-3">
                  Events
                </h4>
                <div className="space-y-2">
                  {selectedDayEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="py-2 px-3 rounded-lg bg-brand-black/40"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white text-sm font-medium">
                          {evt.title}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            EVENT_BADGE_COLORS[evt.eventType] ||
                            "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {evt.eventType}
                        </span>
                      </div>
                      {evt.description && (
                        <p className="text-gray-400 text-xs">
                          {evt.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedDayClasses.length === 0 &&
              selectedDayEvents.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">
                  Nothing scheduled for this day.
                </p>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
