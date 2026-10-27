import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <>
      <h1>Không tìm thấy trang</h1>
      <Link to="/">Về trang tổng quan</Link>
    </>
  )
}
