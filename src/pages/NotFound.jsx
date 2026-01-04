import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

const NotFound = () => {
  return (
    <>
      <Header />
      <section className="section">
        <div className="container text-center">
          <h1>404 - Page Not Found</h1>
          <p>The page you're looking for doesn't exist.</p>
          <Link to="/" className="btn btn-primary">
            Go Home
          </Link>
        </div>
      </section>
      <Footer />
    </>
  )
}

export default NotFound

