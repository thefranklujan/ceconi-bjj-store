import { prisma } from "@/lib/prisma";
import MemberShell from "@/components/members/MemberShell";
import Link from "next/link";

export const dynamic = "force-dynamic";

const CLASS_TYPES = [
  "All",
  "Fundamentals",
  "Advanced",
  "No-Gi",
  "Competition",
  "Kids",
  "Open Mat",
];

export default async function MemberVideosPage({
  searchParams,
}: {
  searchParams: Promise<{ classType?: string }>;
}) {
  const params = await searchParams;
  const activeFilter = params.classType || "";

  const where: Record<string, unknown> = { published: true };
  if (activeFilter) {
    where.classType = activeFilter;
  }

  const videos = await prisma.video.findMany({
    where,
    orderBy: { classDate: "desc" },
  });

  return (
    <MemberShell>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-white uppercase tracking-wider mb-6">
          Class Videos
        </h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {CLASS_TYPES.map((type) => {
            const value = type === "All" ? "" : type;
            const isActive = activeFilter === value;
            return (
              <Link
                key={type}
                href={
                  value
                    ? `/members/videos?classType=${encodeURIComponent(value)}`
                    : "/members/videos"
                }
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-brand-teal text-brand-black"
                    : "bg-brand-dark border border-brand-gray text-gray-300 hover:border-brand-teal hover:text-white"
                }`}
              >
                {type}
              </Link>
            );
          })}
        </div>

        {/* Video Grid */}
        {videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Link
                key={video.id}
                href={`/members/videos/${video.id}`}
                className="bg-brand-dark border border-brand-gray rounded-lg overflow-hidden hover:border-brand-teal transition group"
              >
                {/* Thumbnail placeholder */}
                <div className="aspect-video bg-brand-gray/50 flex items-center justify-center relative">
                  <div className="w-16 h-16 rounded-full bg-brand-teal/20 flex items-center justify-center group-hover:bg-brand-teal/30 transition">
                    <svg
                      className="w-8 h-8 text-brand-teal ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs bg-brand-teal/20 text-brand-teal px-2 py-0.5 rounded-full">
                      {video.classType}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(video.classDate).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-white font-medium text-sm line-clamp-2">
                    {video.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-brand-dark border border-brand-gray rounded-lg p-12 text-center">
            <p className="text-gray-500">No videos found.</p>
          </div>
        )}
      </div>
    </MemberShell>
  );
}
