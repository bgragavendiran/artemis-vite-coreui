import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from 'src/firebase' // Ensure Firebase auth is configured correctly
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CRow,
} from '@coreui/react'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/dashboard')
    } catch (error) {
      console.error('Error logging in:', error)
      alert('Login failed, please check your credentials.')
    }
  }

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      navigate('/dashboard')
    } catch (error) {
      console.error('Error signing up:', error)
      alert('Sign up failed, please try again.')
    }
  }

  const handleSubmit = () => {
    isSignUp ? handleSignUp() : handleLogin()
  }

  return (
    <div className="min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody className="d-flex flex-column align-items-center bg-white">
                  <div className="text-center mb-4">
                    <img
                      src="/white_broke.png"
                      alt="ARTEMIS Logo"
                      className="w-25 mb-3 text-dark"
                    />
                    <h1 className="text-dark">ARTEMIS</h1>
                  </div>

                  <p className="text-center text-gray-600 mb-3 text-dark">
                    {isSignUp ? 'Create an account' : 'Sign In to your account'}
                  </p>

                  <CForm onSubmit={(e) => e.preventDefault()} className="w-75">
                    <CFormInput
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mb-3"
                      autoComplete="username"
                    />
                    <CFormInput
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mb-4"
                      autoComplete="current-password"
                    />

                    <CButton color="primary" className="w-100 mb-3 " onClick={handleSubmit}>
                      {isSignUp ? 'Sign Up' : 'Sign In'}
                    </CButton>
                  </CForm>

                  {!isSignUp && (
                    <p className="text-center text-gray-500 mb-2 text-dark">
                      <a href="#!" className="text-info">
                        Forgot password?
                      </a>
                    </p>
                  )}

                  <div className="d-flex align-items-center">
                    <span className="text-info">
                      {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                    </span>
                    <CButton
                      color="link"
                      className="p-0 ml-2"
                      onClick={() => setIsSignUp(!isSignUp)}
                    >
                      {isSignUp ? 'Login' : 'Sign Up'}
                    </CButton>
                  </div>
                </CCardBody>
              </CCard>

              <CCard
                className="text-white bg-primary d-none d-md-flex align-items-center justify-content-center"
                style={{ width: '50%' }}
              >
                <CCardBody className="align-content-center">
                  <h2>Welcome to ARTEMIS</h2>
                  <p className="text-light">
                    Explore our plant tracking app.
                  </p>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
