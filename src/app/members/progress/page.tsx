import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MemberShell from "@/components/members/MemberShell";
import BeltDisplay from "@/components/members/BeltDisplay";

export const dynamic = "force-dynamic";

const BELT_COLORS: Record<string, string> = {
  white: "#FFFFFF",
  blue: "#1E40AF",
  purple: "#7C3AED",
  brown: "#92400E",
  black: "#1a1a1a",
};

export default async function MemberProgressPage() {
  const session = await getServerSession(authOptions);
  const memberId = session?.user?.memberId;

  const [member, beltHistory] = await Promise.all([
    memberId
      ? prisma.member.findUnique({
          where: { id: memberId },
          select: {
            firstName: true,
            lastName: true,
            beltRank: true,
            stripes: true,
          },
        })
      : null,
    memberId
      ? prisma.beltProgress.findMany({
          where: { memberId },
          orderBy: { awardedAt: "desc" },
        })
      : [],
  ]);

  return (
    <MemberShell>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-white uppercase tracking-wider mb-8">
          My Progress
        </h1>

        {/* Current Belt */}
        {member && (
          <div className="bg-brand-dark border border-brand-gray rounded-lg p-8 mb-8">
            <h2 className="text-sm text-gray-400 uppercase tracking-wider mb-4">
              Current Rank
            </h2>
            <div className="flex items-center gap-6">
              <BeltDisplay
                beltRank={member.beltRank}
                stripes={member.stripes}
                size="lg"
              />
              <div>
                <p className="text-2xl font-bold text-white capitalize">
                  {member.beltRank} Belt
                </p>
                <p className="text-gray-400">
                  {member.stripes > 0
                    ? `${member.stripes} stripe${member.stripes !== 1 ? "s" : ""}`
                    : "No stripes yet"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Belt Timeline */}
        <div className="bg-brand-dark border border-brand-gray rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white uppercase tracking-wider mb-6">
            Promotion History
          </h2>

          {beltHistory.length > 0 ? (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-brand-gray" />

              <div className="space-y-6">
                {beltHistory.map((entry, index) => (
                  <div key={entry.id} className="relative flex gap-4">
                    {/* Timeline dot */}
                    <div
                      className="relative z-10 w-10 h-10 rounded-full border-2 border-brand-gray flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor:
                          BELT_COLORS[entry.beltRank] || "#FFFFFF",
                      }}
                    >
                      {entry.stripes > 0 && (
                        <span className="text-xs font-bold text-brand-teal">
                          {entry.stripes}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div
                      className={`flex-1 pb-6 ${index === beltHistory.length - 1 ? "pb-0" : ""}`}
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <p className="text-white font-semibold capitalize">
                          {entry.beltRank} Belt
                          {entry.stripes > 0 && (
                            <span className="text-brand-teal ml-1">
                              &middot; {entry.stripes} stripe
                              {entry.stripes !== 1 ? "s" : ""}
                            </span>
                          )}
                        </p>
                      </div>
                      <p className="text-gray-500 text-sm">
                        {new Date(entry.awardedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                        {entry.awardedBy && (
                          <span> &middot; Awarded by {entry.awardedBy}</span>
                        )}
                      </p>
                      {entry.note && (
                        <p className="text-gray-400 text-sm mt-1">
                          {entry.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">
              No promotion history recorded yet.
            </p>
          )}
        </div>
      </div>
    </MemberShell>
  );
}
