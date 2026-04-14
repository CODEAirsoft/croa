"use client";

type Props = {
  filename: string;
  label?: string;
  url: string;
};

export function DownloadLinkButton({ filename, label = "Download", url }: Props) {
  function handleDownload() {
    const absoluteUrl = url.startsWith("http") ? url : `${window.location.origin}${url}`;
    const content = `[InternetShortcut]\r\nURL=${absoluteUrl}\r\n`;
    const blob = new Blob([content], { type: "application/internet-shortcut" });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename.endsWith(".url") ? filename : `${filename}.url`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
  }

  return (
    <button className="button secondary" type="button" onClick={handleDownload}>
      {label}
    </button>
  );
}
