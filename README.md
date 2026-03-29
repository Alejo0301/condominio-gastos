# Condominio Gastos — Control de Inversiones

App web privada para registrar y visualizar los gastos del proyecto de construcción.

---

## Configuración inicial (hacer una sola vez)

### 1. Clonar e instalar
```bash
git clone https://github.com/TU_USUARIO/condominio-gastos.git
cd condominio-gastos
npm install
```

### 2. Crear el proyecto en Firebase
1. Ir a [console.firebase.google.com](https://console.firebase.google.com)
2. Crear nuevo proyecto → nombre: `condominio-gastos`
3. En **Authentication** → Sign-in method → habilitar **Email/Password**
4. Crear las 3 cuentas manualmente en **Authentication → Users → Add user**
5. En **Firestore Database** → crear base de datos en modo producción
6. En **Configuración del proyecto** → copiar las credenciales de la app web

### 3. Configurar variables de entorno
```bash
cp .env.example .env.local
```
Editar `.env.local` con tus credenciales reales de Firebase.

### 4. Actualizar los correos autorizados
Editar `src/constants/usuarios.js` con los correos reales de tu papá, hermano y tú.

### 5. Actualizar el nombre del repo en vite.config.js
```js
base: '/TU_NOMBRE_DE_REPO/',  // debe coincidir exactamente
```

### 6. Reglas de seguridad en Firestore
En Firebase Console → Firestore → Rules, pegar:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /gastos/{gastoId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 7. Configurar GitHub Pages
1. En tu repo GitHub → Settings → Pages → Source: **GitHub Actions**
2. En Settings → Secrets → Actions, agregar cada variable de `.env.example` como secret

### 8. Deploy
```bash
git add .
git commit -m "feat: proyecto inicial"
git push origin main
```
GitHub Actions construye y publica automáticamente.

---

## Desarrollo local
```bash
npm run dev
```
Abre `http://localhost:5173/condominio-gastos/`

---

## Estructura del proyecto
```
src/
├── pages/          # Pantallas completas (Login, Dashboard, Gastos, NuevoGasto)
├── components/
│   ├── layout/     # AppLayout, sidebar, navegación
│   ├── ui/         # ProtectedRoute y componentes reutilizables
│   └── gastos/     # GastoForm
├── hooks/          # useGastos — lógica de estado
├── services/       # authService, gastoService, pdfService
├── context/        # AuthContext — sesión global
├── constants/      # usuarios autorizados, categorías
└── utils/          # formatCOP, formatFecha, helpers
```

---

## Roles
| Rol | Crear | Editar | Eliminar |
|---|---|---|---|
| Admin | ✓ | ✓ | ✓ |
| Editor | ✓ | — | — |

Configurar roles en `src/constants/usuarios.js`.
