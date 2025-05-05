import { Outlet } from "react-router-dom";
import SearchBar from "../components/SearchBar";

export default function App() {
  return (
    <div className="bg-gray-100 min-h-screen">
      <SearchBar />
      <Outlet />
    </div>
  );
}
