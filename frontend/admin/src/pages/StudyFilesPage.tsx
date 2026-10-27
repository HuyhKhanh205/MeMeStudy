import AsyncState from '../components/AsyncState'
import { studyFileService } from '../services/studyFileService'
import { useFetch } from '../services/useFetch'

export default function StudyFilesPage() {
  const { data: files, loading, error, reload } = useFetch(studyFileService.getAll)

  const handleRemove = async (id: string) => {
    if (!confirm('Xóa tài liệu này?')) return
    await studyFileService.remove(id)
    await reload()
  }

  return (
    <>
      <h1>Tài liệu ôn tập</h1>
      <AsyncState loading={loading} error={error} />
      {files?.length === 0 && <p className="muted">Chưa có tài liệu nào.</p>}
      <table className="table">
        <thead>
          <tr>
            <th>Tiêu đề</th>
            <th>Số thẻ</th>
            <th>Ngày tạo</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {files?.map((file) => (
            <tr key={file.id}>
              <td>{file.title}</td>
              <td>{file.flashcards.length}</td>
              <td>{new Date(file.createdAt).toLocaleString('vi-VN')}</td>
              <td>
                <button className="danger" onClick={() => handleRemove(file.id)}>
                  Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
