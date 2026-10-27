import StatCard from '../components/StatCard'
import AsyncState from '../components/AsyncState'
import { courseService } from '../services/courseService'
import { studyFileService } from '../services/studyFileService'
import { useFetch } from '../services/useFetch'

export default function DashboardPage() {
  const courses = useFetch(courseService.getAll)
  const files = useFetch(studyFileService.getAll)

  const lessonCount =
    courses.data?.reduce(
      (total, course) => total + course.units.reduce((sum, unit) => sum + unit.lessons.length, 0),
      0,
    ) ?? 0

  return (
    <>
      <h1>Tổng quan</h1>
      <AsyncState loading={courses.loading} error={courses.error ?? files.error} />
      <div className="stats">
        <StatCard label="Khóa học" value={courses.data?.length ?? 0} />
        <StatCard label="Bài học" value={lessonCount} />
        <StatCard label="Tài liệu ôn tập" value={files.data?.length ?? 0} />
      </div>
    </>
  )
}
