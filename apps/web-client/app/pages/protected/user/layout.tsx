import { Outlet } from "react-router";
import UserSidebarDesktop from "~/components/user/user-sidebar-desktop";

export default function UserLayout() {
  return (
    <div className="w-full md:max-w-7xl mx-auto space-y-6">
      <div className="flex gap-6">
        <UserSidebarDesktop />
        <div className="flex-1 space-y-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
