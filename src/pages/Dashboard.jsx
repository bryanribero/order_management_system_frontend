import Navbar from '../components/Navbar'
import StatCard from '../components/StatCard'

import { CheckCheck } from 'lucide-react'
import './layout.css'
import ComponentTransition from '../effects/ComponentTransition'

export default function Dashboard() {
  return (
    <div className="layout">
      <Navbar />
      <main className="container-content">
        <ComponentTransition>
          <StatCard icon={CheckCheck} />
          Hola
        </ComponentTransition>
      </main>
    </div>
  )
}
