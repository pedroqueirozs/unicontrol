import { Outlet, useMatches } from "react-router-dom";
import { Header } from "../Header";
import SideBar from "../Sidebar";

interface Title{
  title: string
}

export default function MainLayout() {
  const matches  = useMatches()

  const currentMatch = matches.find((match) => (match.handle as Title)?.title);
  const title = (currentMatch?.handle as Title)?.title || "Página";
  return (
    <div className="flex mx-auto ">
      <SideBar />
      <div className="w-full">
        <Header title={title} />
        <div className=" mt-8 mx-4 border border-border_input_color rounded-md ">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
