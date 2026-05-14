import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { Bars3Icon, XMarkIcon, ArrowRightOnRectangleIcon, ClipboardDocumentListIcon, CalendarIcon, UsersIcon } from '@heroicons/react/24/outline'
import { User } from '../../types'
import { Rol } from '../../types/roles'

export default function Header({ user }: { user: User }) {
    const [menuOpen, setMenuOpen] = useState(false)
    const queryClient = useQueryClient()
    const location = useLocation()

    const logout = () => {
        localStorage.removeItem('AUTH_TOKEN')
        queryClient.invalidateQueries({ queryKey: ["user"] })
    }

    const initials = `${user.name[0]}${user.lastname[0]}`.toUpperCase()

    const isActive = (path: string) => location.pathname === path

    return (
        <header className="bg-[#0f1f3d] h-16 px-6 flex items-center justify-between relative z-50">

            {/* Logo */}
             <div className="flex-1 flex items-center">
                <Link to="/?page=1" className="flex items-center gap-3 no-underline">
                    <img src="/AMADO_LOGO.png" alt="Amado" className="h-14 w-auto object-contain" />
                    <div className="hidden lg:block">
                        <p className="text-white text-base font-medium leading-tight">Muebles y Mudanzas</p>
                        <p className="text-white text-xl font-bold leading-tight tracking-wide">Amado</p>
                    </div>
                </Link>
            </div>

            {/* Nav desktop */}
            <nav className="hidden md:flex items-center gap-1">
                <NavLink to="/?page=1" active={isActive('/')} label="Asignaciones" Icon={ClipboardDocumentListIcon} />
                <NavLink to="/asignaciones-date" active={isActive('/asignaciones-date')} label="Calendario" Icon={CalendarIcon} />
                {user.rol === Rol.SISTEMAS && (
                    <NavLink to="/users" active={isActive('/users')} label="Usuarios" Icon={UsersIcon} />
                )}
            </nav>

            {/* Usuario + logout desktop */}
            <div className="flex-1 flex items-center justify-end gap-3">
                <div className="hidden md:flex items-center gap-2">
                    <div className="text-right">
                        <p className="text-white text-[13px] font-medium leading-none">{user.name} {user.lastname}</p>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-red-900/40 text-red-400 font-medium mt-0.5 inline-block">
                            {user.rol}
                        </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[#1a3a6b] border border-[#2d5a9e] flex items-center justify-center text-[#8ba3c7] text-[11px] font-medium shrink-0">
                        {initials}
                    </div>
                </div>
                <button onClick={logout} title="Cerrar sesión" className="hidden md:block p-1.5 rounded-md hover:bg-white/10 transition-colors">
                    <ArrowRightOnRectangleIcon className="w-5 h-5 text-[#8ba3c7]" />
                </button>
                <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-md hover:bg-white/10 transition-colors">
                    {menuOpen
                        ? <XMarkIcon className="w-6 h-6 text-[#8ba3c7]" />
                        : <Bars3Icon className="w-6 h-6 text-[#8ba3c7]" />
                    }
                </button>
            </div>


            {/* Mobile menu */}
            {menuOpen && (
                <div className="md:hidden absolute top-16 left-0 right-0 bg-[#0f1f3d] border-t border-white/10 p-3 flex flex-col gap-1">
                    <div className="flex items-center gap-3 px-4 py-2.5">
                        <div className="w-10 h-10 rounded-full bg-[#1a3a6b] border border-[#2d5a9e] flex items-center justify-center text-[#8ba3c7] text-xs font-medium shrink-0">
                            {initials}
                        </div>
                        <div>
                            <p className="text-white text-sm font-medium">{user.name} {user.lastname}</p>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-red-900/40 text-red-400 font-medium">
                                {user.rol}
                            </span>
                        </div>
                    </div>

                    <div className="h-px bg-white/10 my-1.5" />

                    <MobileLink to="/?page=1" label="Asignaciones" Icon={ClipboardDocumentListIcon} onClick={() => setMenuOpen(false)} />
                    <MobileLink to="/asignaciones-date" label="Calendario" Icon={CalendarIcon} onClick={() => setMenuOpen(false)} />
                    {user.rol === Rol.SISTEMAS && (
                        <MobileLink to="/users" label="Usuarios" Icon={UsersIcon} onClick={() => setMenuOpen(false)} />
                    )}

                    <div className="h-px bg-white/10 my-1.5" />

                    <button onClick={logout} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-400 hover:bg-red-900/20 transition-colors text-sm w-full">
                        <ArrowRightOnRectangleIcon className="w-5 h-5 shrink-0" />
                        Cerrar sesión
                    </button>
                </div>
            )}
        </header>
    )
}

function NavLink({ to, active, label, Icon }: { to: string, active: boolean, label: string, Icon: React.ElementType }) {
    return (
        <Link to={to} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] transition-colors no-underline ${active ? 'text-white bg-white/10' : 'text-[#8ba3c7] hover:text-white hover:bg-white/8'}`}>
            <Icon className="w-4 h-4" />
            {label}
        </Link>
    )
}

function MobileLink({ to, label, Icon, onClick }: { to: string, label: string, Icon: React.ElementType, onClick: () => void }) {
    return (
        <Link to={to} onClick={onClick} className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-[#8ba3c7] hover:text-white hover:bg-white/8 transition-colors text-sm no-underline">
            <Icon className="w-5 h-5 shrink-0" />
            {label}
        </Link>
    )
}