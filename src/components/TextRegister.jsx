import registerBackground from '../assets/register-background.webp'
import { PackageCheck } from 'lucide-react'

export default function TextRegister() {
  return (
    <div className="container-welcome right">
      <div className="container-icon">
        <span>
          <PackageCheck className="icon" size={38} />
        </span>
        <span className="ordena">Ordena</span>
      </div>
      <h2>TU ESPACIO EMPIEZA ACÁ</h2>
      <h1>Todo listo para empezar a ordenar.</h1>
      <p>
        Registrate en pocos pasos y empezá a gestionar tus pedidos, entregas y
        equipo desde un solo lugar.
      </p>
      <img
        src={registerBackground}
        alt="order-managment-team-image"
        className="register-image"
      />
    </div>
  )
}
