import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Library from "./pages/Library";
import Playlist from "./pages/Playlist";
import Liked from "./pages/Liked";
import FullPlayer from "./components/FullPlayer";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/library" element={<Library />} />
          <Route path="/playlist/:id" element={<Playlist />} />
          <Route path="/liked" element={<Liked />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
        <Route path="/player" element={<FullPlayer />} />
      </Routes>
    </HashRouter>
  );
}
