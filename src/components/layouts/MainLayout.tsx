import { Outlet } from "react-router-dom";
import Header from "../Header";
import SideBar from "../Sidebar";

export default function MainLayout() {
  return (
    <div className="flex mx-auto ">
      <SideBar />
      <div className="w-full">
        <Header />
        <div className=" mt-8 mx-4 border border-border_input_color rounded-md ">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
