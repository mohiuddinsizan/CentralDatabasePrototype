import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AppShell from "./components/layout/AppShell";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ArchivesPage from "./pages/ArchivesPage";
import QuestionsPage from "./pages/QuestionsPage";
import QuestionUploadPage from "./pages/QuestionUploadPage";
import ChapterQuestionsPage from "./pages/ChapterQuestionsPage";
import TagsPage from "./pages/TagsPage"

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="archives" element={<ArchivesPage />} />
        <Route
          path="archives/:archiveId/chapters/:chapterId"
          element={<ChapterQuestionsPage />}
        />
        <Route path="questions" element={<QuestionsPage />} />
        <Route path="questions/upload" element={<QuestionUploadPage />} />
        <Route path="/tags" element={<TagsPage />} />

      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}