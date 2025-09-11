import { Outlet, useMatches } from "react-router-dom";
import { Header } from "@/components/Header";
import SideBar from "@/components/Sidebar";

interface Title {
  title: string;
}

export default function MainLayout() {
  const matches = useMatches();
  const currentMatch = matches.find((match) => (match.handle as Title)?.title);
  const title = (currentMatch?.handle as Title)?.title || "Página";

  return (
    <div className="flex min-h-screen p-6">
      <SideBar />
      <div className="flex flex-col w-full">
        <Header title={title} />
        <main className="flex-1 mt-8 mx-4 p-4 border border-border_input_color rounded-md">
          <Outlet />
          <footer className="mt-8 text-center text-sm">
            © 2025 saojoseartigosliturgicos
          </footer>
        </main>
      </div>
    </div>
  );
}
