import './statCard.css'

export default function StatCard({ icon: Icon, title, value, text, variant = 'default' }) {
  return (
    <article className="container-stat-card">
      <div className="container-icon-stat-card">
        <span className={`icon-stat-${variant}`}>
          <Icon size={35} />
        </span>
        <div className="container-title-stat">
          <h2>{title}</h2>
          <p>{value}</p>
        </div>
      </div>
      <p>{text}</p>
    </article>
  )
}
