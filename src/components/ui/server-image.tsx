import Image, { ImageProps } from "next/image";
import { BACKEND_API_URL } from "@/config/backend-api";

// Get base URL by removing path suffix if present
// e.g. http://localhost:3001/api/v1 -> http://localhost:3001
const getBaseUrl = (apiUrl: string) => {
  try {
    const url = new URL(apiUrl);
    return url.origin;
  } catch {
    return "";
  }
};

const BASE_URL = getBaseUrl(BACKEND_API_URL);

interface ServerImageProps extends Omit<ImageProps, "src"> {
  src: string;
}

export function ServerImage({ src, alt, ...props }: ServerImageProps) {
  // Check if src is already a full URL or data URI
  const isRemote =
    src.startsWith("http") ||
    src.startsWith("https") ||
    src.startsWith("data:") ||
    src.startsWith("blob:");

  let finalSrc = src;

  if (!isRemote) {
    // If it's a relative path, prepend the backend base URL
    // Ensure leading slash if missing
    const path = src.startsWith("/") ? src : `/${src}`;
    finalSrc = `${BASE_URL}${path}`;
  }

  return (
    <Image
      src={finalSrc}
      alt={alt}
      {...props}
      // Use unoptimized to avoid needing domain config in next.config.js for dynamic backends
      // Also because local dev backend (localhost) is not optimized by default
      unoptimized
    />
  );
}
