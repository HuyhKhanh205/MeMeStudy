import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AdminLayout from './layouts/AdminLayout'
import DashboardPage from './pages/DashboardPage'
import CoursesPage from './pages/CoursesPage'
import StudyFilesPage from './pages/StudyFilesPage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="study-files" element={<StudyFilesPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
