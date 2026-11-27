import { Settings as SettingsIcon } from 'lucide-react'
import Navbar from '../components/Navbar'
import ComponentTransition from '../effects/ComponentTransition'
import './layout.css'
import './settings.css'

export default function Settings() {
  return (
    <div className="layout">
      <Navbar />
      <main className="container-content settings-content">
        <ComponentTransition>
          <section className="settings-coming-soon">
            <span className="settings-coming-soon-icon">
              <SettingsIcon size={28} aria-hidden="true" />
            </span>
            <span className="settings-coming-soon-badge">En desarrollo</span>
            <h1>Configuración</h1>
            <p>
              Estamos preparando esta sección. Próximamente vas a poder
              configurar tu cuenta desde aquí.
            </p>
          </section>
        </ComponentTransition>
      </main>
    </div>
  )
}
