import AsyncState from '../components/AsyncState'
import { courseService } from '../services/courseService'
import { useFetch } from '../services/useFetch'

export default function CoursesPage() {
  const { data: courses, loading, error } = useFetch(courseService.getAll)

  return (
    <>
      <h1>Khóa học</h1>
      <AsyncState loading={loading} error={error} />
      <table className="table">
        <thead>
          <tr>
            <th>Tên khóa học</th>
            <th>Mô tả</th>
            <th>Chương</th>
            <th>Bài học</th>
          </tr>
        </thead>
        <tbody>
          {courses?.map((course) => (
            <tr key={course.id}>
              <td>{course.title}</td>
              <td>{course.description}</td>
              <td>{course.units.length}</td>
              <td>{course.units.reduce((sum, unit) => sum + unit.lessons.length, 0)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
