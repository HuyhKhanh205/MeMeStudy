interface Props {
  loading: boolean
  error: string | null
}

export default function AsyncState({ loading, error }: Props) {
  if (loading) return <p className="muted">Đang tải...</p>
  if (error) return <p className="error">Lỗi: {error}</p>
  return null
}
