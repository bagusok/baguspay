import React from "react";

type ImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  baseUrl?: string;
};

function resolveSrc(src: string, baseUrl: string) {
  // if src already absolute (http/https), return as-is
  if (/^https?:\/\//i.test(src)) return src;
  const base = baseUrl?.replace(/\/+$/g, "");
  if (src.startsWith("/")) return `${base}${src}`;
  return `${base}/${src}`;
}

const _baseUrl = import.meta.env.VITE_S3_URL;

export default function Image({
  src,
  baseUrl = _baseUrl,
  ...rest
}: ImageProps) {
  const finalSrc =
    typeof src === "string" && src.trim().length > 0
      ? resolveSrc(src, baseUrl)
      : undefined;
  return <img src={finalSrc} {...rest} />;
}
