"use client";

const BELT_COLORS: Record<string, string> = {
  white: "bg-white",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  brown: "bg-amber-700",
  black: "bg-gray-900 ring-1 ring-white/30",
};

interface LeaderboardEntry {
  rank: number;
  memberId: string;
  name: string;
  beltRank: string;
  value: number;
  label: string;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentMemberId: string | undefined;
}

function getRankColor(rank: number) {
  if (rank === 1) return "text-yellow-400";
  if (rank === 2) return "text-gray-300";
  if (rank === 3) return "text-amber-600";
  return "text-white";
}

export default function LeaderboardTable({
  entries,
  currentMemberId,
}: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className="bg-brand-dark border border-brand-gray rounded-lg p-12 text-center">
        <p className="text-gray-500">No data for this period yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => {
        const isCurrentUser = entry.memberId === currentMemberId;
        return (
          <div
            key={entry.memberId}
            className={`bg-brand-dark border rounded-lg p-4 flex items-center gap-4 ${
              isCurrentUser
                ? "bg-brand-teal/5 border-l-2 border-brand-teal"
                : "border-brand-gray"
            }`}
          >
            <span
              className={`text-lg font-bold w-8 text-center ${getRankColor(entry.rank)}`}
            >
              {entry.rank}
            </span>

            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span
                className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  BELT_COLORS[entry.beltRank] || "bg-white"
                }`}
              />
              <span className="text-white font-medium truncate">
                {entry.name}
              </span>
            </div>

            <span className="text-brand-teal font-bold text-sm whitespace-nowrap">
              {entry.value} {entry.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
