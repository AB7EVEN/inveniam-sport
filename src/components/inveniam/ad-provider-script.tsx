import Script from "next/script";

export function AdProviderScript() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  if (!client) {
    return null;
  }

  return (
    <Script
      async
      crossOrigin="anonymous"
      id="adsense-loader"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
      strategy="afterInteractive"
    />
  );
}
