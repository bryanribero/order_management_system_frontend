import { PackageCheck } from 'lucide-react'
import team from '../assets/order-management-team.png'

export default function WelcomeComponent() {
  return (
    <div className="container-welcome">
      <div className="container-icon">
        <span>
          <PackageCheck className="icon" size={38} />
        </span>
        <span className="ordena">Ordena</span>
      </div>
      <h2>Gestión simple, resultados claros</h2>
      <h1>Bienvenido a una forma más ordenada de trabajar.</h1>
      <p>
        Controlá cada pedido, coordiná entregas y mantené a tu equipo al día
        desde un solo lugar.
      </p>
      <img src={team} alt="order-managment-team-image" />
    </div>
  )
}
