"use client";

export const DAYS = [
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
] as const;

export type Day = typeof DAYS[number];

export interface ScheduleValue {
  days: string[];
  timeStart: string;
  timeEnd: string;
}

interface Props {
  value: ScheduleValue;
  onChange: (v: ScheduleValue) => void;
}

const DAY_SHORT: Record<string, string> = {
  monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu",
  friday: "Fri", saturday: "Sat", sunday: "Sun",
};

export function AvailabilityScheduler({ value, onChange }: Props) {
  const allDays = DAYS.every((d) => value.days.includes(d));
  const allDay = value.timeStart === "00:00" && value.timeEnd === "23:59";

  function setDays(days: string[]) {
    onChange({ ...value, days });
  }

  function toggleDay(day: string) {
    const next = value.days.includes(day)
      ? value.days.filter((d) => d !== day)
      : [...value.days, day];
    setDays(next);
  }

  function toggleAllDays(checked: boolean) {
    setDays(checked ? [...DAYS] : []);
  }

  function toggleAllDay(checked: boolean) {
    if (checked) {
      onChange({ ...value, timeStart: "00:00", timeEnd: "23:59" });
    } else {
      onChange({ ...value, timeStart: "09:00", timeEnd: "22:00" });
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-4">
      {/* Days */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Days</p>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={allDays}
              onChange={(e) => toggleAllDays(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">Every day</span>
          </label>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 pl-6">
            {DAYS.map((day) => (
              <label key={day} className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={value.days.includes(day)}
                  onChange={() => toggleDay(day)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">{DAY_SHORT[day]}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* Times */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Time</p>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={allDay}
              onChange={(e) => toggleAllDay(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">All day</span>
          </label>
          {!allDay && (
            <div className="flex items-center gap-3 pl-6">
              <div>
                <label className="block text-xs text-gray-500 mb-1">From</label>
                <input
                  type="time"
                  value={value.timeStart}
                  onChange={(e) => onChange({ ...value, timeStart: e.target.value })}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <span className="text-gray-400 mt-4">–</span>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To</label>
                <input
                  type="time"
                  value={value.timeEnd}
                  onChange={(e) => onChange({ ...value, timeEnd: e.target.value })}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
