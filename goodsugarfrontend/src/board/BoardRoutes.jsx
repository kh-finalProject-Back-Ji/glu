import { Routes, Route, Navigate } from "react-router-dom";
import BoardListPage from "./pages/BoardListPage";
import BoardDetailPage from "./pages/BoardDetailPage";
import BoardWritePage from "./pages/BoardWritePage";

export default function BoardRoutes() {
  return (
    <Routes>
      <Route path="" element={<Navigate to="SNACK" replace />} />
      <Route path=":type" element={<BoardListPage />} />
      <Route path=":type/write" element={<BoardWritePage />} />
      <Route path=":type/:boardId" element={<BoardDetailPage />} />
    </Routes>
  );
}
