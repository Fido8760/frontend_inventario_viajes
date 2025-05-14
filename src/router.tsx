import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LoginView from './views/auth/LoginView'
import AuthLayout from './layouts/AuthLayout'
import AppLayout from './layouts/AppLayout'
import DashboardView from './views/admin/DashboardView'
import CrearAsgnacion from './views/admin/Asignacion/CrearAsgnacionView'
import EditarAsignacionView from './views/admin/Asignacion/EditarAsignacionView'
import ChecklistDetailsView from './views/admin/Asignacion/ChecklistDetailsView'
import ChecklistCreateView from './views/admin/checklist/ChecklistCreateView'
import ChecklistImageUploadView from './views/admin/checklist/ChecklistImageUploadView'
import ChecklistEditView from './views/admin/checklist/ChecklistEditView'
import RegisterView from './views/auth/RegisterView'
import UsersView from './views/auth/UsersView'
import EditUserView from './views/auth/EditUserView'
import NotFound from './views/404/NotFound'
import NewPasswordView from './views/auth/NewPasswordView'
import ForgotPasswordView from './views/auth/ForgotPasswordView'
import CalendarView from './views/admin/calendar/CalendarView'


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
                    <Route path='/asignacion/:asignacionId/createChecklist/:checklistId/uploadImages' element={<ChecklistImageUploadView />}  />
                    <Route path='/asignacion/:asignacionId/editChecklist/:checklistId' element={<ChecklistEditView />}  />
                    <Route path='/asignaciones-date' element={<CalendarView />}  />
                    <Route path='/users' element={<UsersView />}  />
                    <Route path='/users/register' element={<RegisterView />}  />
                    <Route path='/users/:userId/edit' element={<EditUserView />}  />
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