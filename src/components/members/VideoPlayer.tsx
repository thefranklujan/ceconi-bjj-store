"use client";

interface VideoPlayerProps {
  embedUrl: string;
}

function parseEmbedUrl(url: string): string {
  // YouTube: youtube.com/watch?v=X or youtu.be/X
  const ytWatchMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/)([a-zA-Z0-9_-]+)/
  );
  if (ytWatchMatch) {
    return `https://www.youtube.com/embed/${ytWatchMatch[1]}`;
  }

  const ytShortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (ytShortMatch) {
    return `https://www.youtube.com/embed/${ytShortMatch[1]}`;
  }

  // Vimeo: vimeo.com/X or player.vimeo.com/video/X
  const vimeoMatch = url.match(
    /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/
  );
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  // Fallback: return as-is (already an embed URL)
  return url;
}

export default function VideoPlayer({ embedUrl }: VideoPlayerProps) {
  const src = parseEmbedUrl(embedUrl);

  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-brand-dark border border-brand-gray">
      <iframe
        src={src}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title="Video player"
      />
    </div>
  );
}
