"use client";

import HNNavBar from "@/features/hn-nav-bar";
import ProfileSettings from "@/features/profile-settings";

export default function SettingsPage() {
  return (
    <HNNavBar>
      <ProfileSettings />
    </HNNavBar>
  );
}
