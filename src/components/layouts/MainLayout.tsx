import { Outlet, useMatches } from "react-router-dom";
import { Header } from "../Header";
import SideBar from "../Sidebar";

interface Title {
  title: string;
}

export default function MainLayout() {
  const matches = useMatches();
  const currentMatch = matches.find((match) => (match.handle as Title)?.title);
  const title = (currentMatch?.handle as Title)?.title || "Página";

  return (
    <div className="flex min-h-screen">
      <SideBar />
      <div className="flex flex-col w-full">
        <Header title={title} />
        <main className="flex-1 mt-8 mx-4 p-4 border border-border_input_color rounded-md">
          <Outlet />
        </main>
        <footer className="mt-auto  py-2 text-center text-sm">
          © 2025 saojoseartigosliturgicos
        </footer>
      </div>
    </div>
  );
}
