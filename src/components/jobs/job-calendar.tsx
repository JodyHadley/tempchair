"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, CalendarDays, Building2, Clock } from "lucide-react";

interface JobData {
  id: string;
  title: string;
  type: string;
  dates: string;
  startDate: string;
  endDate: string;
  hours: string;
  rate: string;
  clinic: {
    name: string;
    location: string;
  };
}

interface CalendarProps {
  availableJobs: JobData[];
  bookedJobs: JobData[];
  workerApplications: { jobId: string; status: string }[];
  workerSpecialty: string;
}

type JobEvent = JobData & { category: "booked" | "applied" | "available" };

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_NAMES_SHORT = ["S", "M", "T", "W", "T", "F", "S"];

const categoryConfig = {
  booked: { label: "Booked", color: "bg-green-500", lightColor: "bg-green-100 dark:bg-green-900/30", textColor: "text-green-700 dark:text-green-300", borderColor: "border-green-300" },
  applied: { label: "Applied", color: "bg-amber-500", lightColor: "bg-amber-100 dark:bg-amber-900/30", textColor: "text-amber-700 dark:text-amber-300", borderColor: "border-amber-300" },
  available: { label: "Available", color: "bg-primary", lightColor: "bg-primary/10", textColor: "text-primary", borderColor: "border-primary/30" },
};

export function JobCalendar({ availableJobs, bookedJobs, workerApplications, workerSpecialty, onJobClick }: CalendarProps & { onJobClick?: (jobId: string) => void }) {
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [hoveredEvent, setHoveredEvent] = useState<JobEvent | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const appliedJobIds = new Set(
    workerApplications.filter((a) => a.status === "pending" || a.status === "accepted").map((a) => a.jobId),
  );
  const bookedJobIds = new Set(
    workerApplications.filter((a) => a.status === "accepted").map((a) => a.jobId),
  );

  // Build event list
  const events: JobEvent[] = [
    ...bookedJobs.map((j) => ({ ...j, category: "booked" as const })),
    ...availableJobs
      .filter((j) => appliedJobIds.has(j.id) && !bookedJobIds.has(j.id))
      .map((j) => ({ ...j, category: "applied" as const })),
    ...availableJobs
      .filter((j) => !appliedJobIds.has(j.id) && j.type === workerSpecialty)
      .map((j) => ({ ...j, category: "available" as const })),
  ];

  // Get events for a specific date
  function getEventsForDate(date: Date): JobEvent[] {
    return events.filter((e) => {
      const start = new Date(e.startDate);
      const end = new Date(e.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      const d = new Date(date);
      d.setHours(12, 0, 0, 0);
      return d >= start && d <= end;
    });
  }

  // Calendar grid
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const startPad = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Job Calendar
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={prevMonth} className="h-7 w-7">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium w-36 text-center">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </span>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="h-7 w-7">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="ml-2 text-xs h-7"
              onClick={() => { setCurrentMonth(now.getMonth()); setCurrentYear(now.getFullYear()); }}
            >
              Today
            </Button>
          </div>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-2">
          {(["booked", "applied", "available"] as const).map((cat) => {
            const config = categoryConfig[cat];
            return (
              <div key={cat} className="flex items-center gap-1.5 text-xs">
                <div className={`h-3 w-3 rounded-sm ${config.color}`} />
                <span className="text-muted-foreground">{config.label}</span>
              </div>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="relative">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAY_NAMES.map((day, i) => (
            <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{DAY_NAMES_SHORT[i]}</span>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {/* Padding for first week */}
          {Array.from({ length: startPad }).map((_, i) => (
            <div key={`pad-${i}`} className="min-h-[48px] sm:min-h-[72px] border-t border-l first:border-l-0 border-border/50 bg-muted/20" />
          ))}

          {/* Days */}
          {Array.from({ length: totalDays }).map((_, i) => {
            const day = i + 1;
            const date = new Date(currentYear, currentMonth, day);
            const dayEvents = getEventsForDate(date);
            const isToday = date.toDateString() === now.toDateString();
            const isPast = date < new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const colIndex = (startPad + i) % 7;

            return (
              <div
                key={day}
                className={`min-h-[48px] sm:min-h-[72px] border-t border-border/50 p-0.5 sm:p-1 ${colIndex > 0 ? "border-l" : ""} ${isPast ? "bg-muted/20" : ""}`}
              >
                <span className={`text-xs ${isToday ? "inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold" : isPast ? "text-muted-foreground" : "text-foreground"}`}>
                  {day}
                </span>
                <div className="mt-0.5 space-y-0.5">
                  {dayEvents.slice(0, 2).map((event) => {
                    const config = categoryConfig[event.category];
                    return (
                      <div
                        key={event.id}
                        className={`rounded px-0.5 sm:px-1 py-0.5 text-[8px] sm:text-[9px] leading-tight truncate cursor-pointer border ${config.lightColor} ${config.textColor} ${config.borderColor} hover:opacity-80 transition-opacity`}
                        onMouseEnter={(e) => {
                          setHoveredEvent(event);
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top });
                        }}
                        onMouseLeave={() => {
                          setHoveredEvent(null);
                          setTooltipPos(null);
                        }}
                        onClick={() => {
                          setHoveredEvent(null);
                          setTooltipPos(null);
                          onJobClick?.(event.id);
                        }}
                      >
                        {event.clinic.name}
                      </div>
                    );
                  })}
                  {dayEvents.length > 2 && (
                    <div className="text-[8px] sm:text-[9px] text-muted-foreground pl-0.5">
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Hover tooltip */}
        {hoveredEvent && tooltipPos && (
          <div
            className="fixed z-50 pointer-events-none"
            style={{
              left: tooltipPos.x,
              top: tooltipPos.y - 8,
              transform: "translate(-50%, -100%)",
            }}
          >
            <div className="rounded-lg bg-foreground text-background px-3 py-2.5 shadow-lg w-64">
              <div className="flex items-center gap-2 mb-1.5">
                <Badge
                  className={`text-[9px] px-1.5 py-0 ${categoryConfig[hoveredEvent.category].color} text-white border-0`}
                >
                  {categoryConfig[hoveredEvent.category].label}
                </Badge>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-background/30 text-background/70">
                  {hoveredEvent.type}
                </Badge>
              </div>
              <p className="font-semibold text-sm">{hoveredEvent.title}</p>
              <div className="mt-1 space-y-0.5 text-xs text-background/70">
                <p className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {hoveredEvent.clinic.name} — {hoveredEvent.clinic.location}
                </p>
                <p className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {hoveredEvent.dates}
                </p>
                <p className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {hoveredEvent.hours} &middot; {hoveredEvent.rate}
                </p>
              </div>
              <div className="absolute left-1/2 -translate-x-1/2 top-full">
                <div className="border-4 border-transparent border-t-foreground" />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
