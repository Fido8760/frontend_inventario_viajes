import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LoginView from './views/auth/LoginView'
import AuthLayout from './layouts/AuthLayout'
import AppLayout from './layouts/AppLayout'
import DashboardView from './views/admin/DashboardView'
import EditarAsignacionView from './views/admin/asignacion/EditarAsignacionView'
import ChecklistCreateView from './views/admin/checklist/ChecklistCreateView'
import ChecklistImageUploadView from './views/admin/checklist/ChecklistImageUploadView'
import RegisterView from './views/auth/RegisterView'
import UsersView from './views/auth/UsersView'
import EditUserView from './views/auth/EditUserView'
import NotFound from './views/404/NotFound'
import NewPasswordView from './views/auth/NewPasswordView'
import ForgotPasswordView from './views/auth/ForgotPasswordView'
import CalendarView from './views/admin/calendar/CalendarView'
import ChecklistLlenarView from './views/admin/checklist/ChecklistLlenarView'
import AsignacionDetalleView from './views/admin/asignacion/AsignacionDetalleView'
import AsignacionGalleryView from './views/admin/asignacion/AsignacionGalleryView'
import KpiDashboardView from './views/admin/kpis/KpiDashboardView'
import CrearAsignacion from './views/admin/asignacion/CrearAsignacionView'
import StorageView from './views/admin/storage/StorageView'


export default function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<AppLayout />}>
                    <Route path='/' element={<DashboardView />} index />
                    <Route path='/asignacion/create' element={<CrearAsignacion />}  />
                    <Route path='/asignacion/:asignacionId/edit' element={<EditarAsignacionView />}  />
                    <Route path='/asignacion/:asignacionId' element={<AsignacionDetalleView />}  />
                    <Route path='/asignacion/:asignacionId/createChecklist' element={<ChecklistCreateView />}  />
                    <Route path='/asignacion/:asignacionId/editChecklist/:checklistId' element={<ChecklistLlenarView />} />
                    <Route path='/asignacion/:asignacionId/createChecklist/:checklistId/uploadImages' element={<ChecklistImageUploadView />}  />
                    <Route path='/asignacion/:asignacionId/ver-fotos' element={<AsignacionGalleryView />} />

                    <Route path="/dashboard" element={<KpiDashboardView />} />

                    <Route path='/asignaciones-date' element={<CalendarView />}  />
                    <Route path='/users' element={<UsersView />}  />
                    <Route path='/users/register' element={<RegisterView />}  />
                    <Route path='/users/:userId/edit' element={<EditUserView />}  />

                    <Route path='/admin/storage' element={<StorageView />} />
                </Route>

                <Route element={<AuthLayout />}>
                    <Route path='/auth/login' element={<LoginView />} index/>
                    <Route path='/auth/forgot-password' element={<ForgotPasswordView />} />
                    <Route path='/auth/new-password' element={<NewPasswordView />} />
                </Route>

                <Route element={<AuthLayout />}>
                    <Route path='/404' element={<NotFound />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}