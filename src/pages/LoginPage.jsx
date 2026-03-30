import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginService } from '../services/authService'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [cargando, setCargando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      await loginService(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Correo o contraseña incorrectos.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F8F7F4',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'DM Sans', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Fondo decorativo geométrico */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden',
      }}>
        {/* Columnas edificio — decoración sutil */}
        <div style={{
          position: 'absolute', right: '-40px', bottom: '-20px',
          display: 'flex', alignItems: 'flex-end', gap: '6px', opacity: 0.06,
        }}>
          {[120, 180, 240, 160, 100].map((h, i) => (
            <div key={i} style={{
              width: '40px', height: `${h}px`,
              background: i === 1 || i === 2 ? '#C9A84C' : '#1A1A1A',
              borderRadius: '4px 4px 0 0',
            }} />
          ))}
        </div>
        <div style={{
          position: 'absolute', left: '-60px', top: '10%',
          display: 'flex', alignItems: 'flex-end', gap: '5px', opacity: 0.04,
          transform: 'rotate(180deg)',
        }}>
          {[80, 140, 100, 60].map((h, i) => (
            <div key={i} style={{
              width: '32px', height: `${h}px`,
              background: i === 1 ? '#C9A84C' : '#1A1A1A',
              borderRadius: '4px 4px 0 0',
            }} />
          ))}
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>

        {/* Logo + Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          {/* Logo mark — silueta de edificios */}
          <div style={{
            display: 'inline-flex', alignItems: 'flex-end', gap: '3px',
            marginBottom: '16px',
          }}>
            <div style={{ width: '8px', height: '28px', background: '#1A1A1A', borderRadius: '3px 3px 0 0' }} />
            <div style={{ width: '8px', height: '40px', background: '#C9A84C', borderRadius: '3px 3px 0 0' }} />
            <div style={{ width: '8px', height: '52px', background: '#1A1A1A', borderRadius: '3px 3px 0 0' }} />
            <div style={{ width: '8px', height: '36px', background: '#8A8A8A', borderRadius: '3px 3px 0 0' }} />
            <div style={{ width: '8px', height: '24px', background: '#1A1A1A', borderRadius: '3px 3px 0 0' }} />
          </div>

          <div style={{
            fontSize: '11px', fontWeight: 600, letterSpacing: '0.2em',
            color: '#8A8A8A', textTransform: 'uppercase', marginBottom: '8px',
          }}>
            Escala AYN · Constructora
          </div>
          <h1 style={{
            fontSize: '26px', fontWeight: 600, color: '#1A1A1A',
            letterSpacing: '-0.02em', margin: 0, lineHeight: 1.2,
          }}>
            Control de Gastos
          </h1>
          <p style={{ marginTop: '6px', fontSize: '14px', color: '#8A8A8A' }}>
            Proyecto La Trinidad · Acceso restringido
          </p>
        </div>

        {/* Card formulario */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #EBEBEB',
          boxShadow: '0 4px 32px rgba(0,0,0,0.06)',
          padding: '36px',
        }}>
          {/* Línea dorada superior */}
          <div style={{
            height: '3px', background: 'linear-gradient(90deg, #C9A84C, #E8C96A)',
            borderRadius: '2px', marginBottom: '28px',
          }} />

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{
                display: 'block', fontSize: '12px', fontWeight: 600,
                color: '#555', marginBottom: '8px', letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="tu@correo.com"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '12px 16px',
                  border: '1.5px solid #E8E8E8',
                  borderRadius: '12px',
                  fontSize: '14px', color: '#1A1A1A',
                  background: '#FAFAFA',
                  outline: 'none', transition: 'border-color 0.2s',
                  fontFamily: 'inherit',
                }}
                onFocus={e => e.target.style.borderColor = '#C9A84C'}
                onBlur={e => e.target.style.borderColor = '#E8E8E8'}
              />
            </div>

            <div>
              <label style={{
                display: 'block', fontSize: '12px', fontWeight: 600,
                color: '#555', marginBottom: '8px', letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '12px 16px',
                  border: '1.5px solid #E8E8E8',
                  borderRadius: '12px',
                  fontSize: '14px', color: '#1A1A1A',
                  background: '#FAFAFA',
                  outline: 'none', transition: 'border-color 0.2s',
                  fontFamily: 'inherit',
                }}
                onFocus={e => e.target.style.borderColor = '#C9A84C'}
                onBlur={e => e.target.style.borderColor = '#E8E8E8'}
              />
            </div>

            {error && (
              <div style={{
                background: '#FEF2F2', border: '1px solid #FECACA',
                borderRadius: '10px', padding: '12px 16px',
                fontSize: '13px', color: '#DC2626',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              style={{
                width: '100%', padding: '13px',
                background: cargando ? '#D4B86A' : '#C9A84C',
                color: '#1A1A1A', fontWeight: 700,
                border: 'none', borderRadius: '12px',
                fontSize: '14px', cursor: cargando ? 'not-allowed' : 'pointer',
                letterSpacing: '0.03em',
                transition: 'background 0.2s, transform 0.1s',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => !cargando && (e.target.style.background = '#B8942E')}
              onMouseLeave={e => !cargando && (e.target.style.background = '#C9A84C')}
            >
              {cargando ? 'Ingresando...' : 'Ingresar al sistema'}
            </button>
          </form>
        </div>

        <p style={{
          textAlign: 'center', fontSize: '12px', color: '#BBBBBB', marginTop: '24px',
        }}>
          Solo usuarios autorizados del proyecto
        </p>
      </div>
    </div>
  )
}
