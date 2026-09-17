import { LOGO } from "@/lib/subscription-data";

export function SiteHeader() {
  return (
    <div className="topheader">
      <div className="logo">
        <img src={LOGO} className="olg-logo" alt="Outlook Group" />
      </div>
    </div>
  );
}
