import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Tổng quan' },
  { to: '/courses', label: 'Khóa học' },
  { to: '/study-files', label: 'Tài liệu ôn tập' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">MeMeStudy</div>
      <nav>
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end className="nav-link">
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
