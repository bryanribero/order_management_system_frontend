import Navbar from '../components/Navbar'
import PageTransition from '../effects/PageTransition'
import './dashboard.css'

export default function Dashboard() {
  return (
    <div className="container-principal">
      <PageTransition direction="left">
        <Navbar />
      </PageTransition>
    </div>
  )
}
