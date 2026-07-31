import { PackageCheck } from 'lucide-react'
import './loading.css'

export default function Loading() {
  const text = 'Ordena'
  return (
    <main className="container-loading">
      <div className="container-logo">
        <span className="logo">
          <PackageCheck className="icon" size={180} />
        </span>
        <h1 className="title">
          {text.split('').map((letter, index) => (
            <span key={index} style={{ animationDelay: `${index * 0.08}s` }}>
              {letter}
            </span>
          ))}
        </h1>
        <p className="text-message">Sistema gestor de pedidos</p>
      </div>

      <div>
        <p className="loading-text">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </p>
      </div>
    </main>
  )
}
