import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LoginView from './views/auth/LoginView'
import ForgotPassword from './views/auth/ForgotPassword'
import AuthLayout from './layouts/AuthLayout'
import AppLayout from './layouts/AppLayout'
import DashboardView from './views/admin/DashboardView'
import CrearAsgnacion from './views/admin/Asignacion/CrearAsgnacionView'
import EditarAsignacionView from './views/admin/Asignacion/EditarAsignacionView'
import ChecklistDetailsView from './views/admin/Asignacion/ChecklistDetailsView'
import ChecklistCreateView from './views/admin/checklist/ChecklistCreateView'
import ChecklistImageUploadView from './views/admin/checklist/ChecklistImageUploadView'


export default function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<AppLayout />}>
                    <Route path='/' element={<DashboardView />} index />
                    <Route path='/asignacion/create' element={<CrearAsgnacion />}  />
                    <Route path='/asignacion/:asignacionId/edit' element={<EditarAsignacionView />}  />
                    <Route path='/asignacion/:asignacionId' element={<ChecklistDetailsView />}  />
                    <Route path='/asignacion/:asignacionId/createChecklist' element={<ChecklistCreateView />}  />
                    <Route path='/asignacion/:asignacionId/createChecklist/:checklistId' element={<ChecklistImageUploadView />}  />
                </Route>

                <Route element={<AuthLayout />}>
                    <Route path='/auth/login' element={<LoginView />} index/>
                    <Route path='/auth/forgot-password' element={<ForgotPassword />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}