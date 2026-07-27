import RegisterComponent from '../components/RegisterComponent'
import TextRegister from '../components/TextRegister'
import PageTransition from '../effects/PageTransition'
import './login.css'

export default function Register() {
  return (
    <div className="auth-container">
      <PageTransition direction="right">
        <main className="main-login">
          <div className="div-container">
            <TextRegister />
            <RegisterComponent />
          </div>
        </main>
      </PageTransition>
    </div>
  )
}
