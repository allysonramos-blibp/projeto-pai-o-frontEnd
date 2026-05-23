import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import { 
  LayoutDashboard, ShoppingCart, Package, LogOut, 
  Receipt, Wallet, BarChart3, Users, ShoppingBag,
  User, Settings, Bell, ChevronDown 
} from 'lucide-react';

const Layout = () => {
  const { logout, user } = useAuth(); 
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    { label: "Dashboard", path: "/home", icon: LayoutDashboard, roles: ["ADMIN", "GERENTE", "USUARIO"] },
    { label: "Comandas", path: "/comandas", icon: ShoppingBag, roles: ["ADMIN", "GERENTE", "USUARIO"] },
    { label: "Estoque", path: "/estoque", icon: Package, roles: ["ADMIN", "GERENTE", "USUARIO"] },
    { label: "Vendas", path: "/vendas", icon: ShoppingCart, roles: ["ADMIN", "GERENTE", "USUARIO"] },
    { label: "Relatórios", path: "/relatorios", icon: BarChart3, roles: ["ADMIN", "GERENTE"] },
    { label: "Contas a Pagar", path: "/contas-pagar", icon: Receipt, roles: ["ADMIN", "GERENTE"] },
    { label: "Contas a Receber", path: "/contas-receber", icon: Wallet, roles: ["ADMIN", "GERENTE"] },
    { label: "Usuários", path: "/usuarios", icon: Users, roles: ["ADMIN"] },
  ];

  const rawRole = user?.perfil?.trim().toUpperCase() || "";
  const userRole = (rawRole === "USER" || rawRole === "USUÁRIO") ? "USUARIO" : rawRole;

  const visibleMenuItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    // 1. Fundo principal da aplicação dinâmico
    <div className="flex min-h-screen bg-[var(--bg-principal)] transition-colors duration-200">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[var(--bg-card)] border-r border-[var(--borda)] flex flex-col p-6 fixed h-full z-30 transition-colors duration-200">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-[#E67E22] p-2 rounded-xl">
            <span className="text-white font-bold">ÓP</span>
          </div>
          <h1 className="text-xl font-bold text-[var(--texto-titulo)] transition-colors duration-200">Ó PAI, Ó</h1>
        </div>
        
        <nav className="flex-1 space-y-2">
          {visibleMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button 
                key={item.path} 
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 w-full p-3 rounded-xl font-medium transition-all ${
                  isActive 
                    ? "bg-[#E67E22] text-white shadow-lg shadow-orange-500/20" 
                    : "text-[var(--texto-corpo)] hover:bg-orange-500/10 hover:text-[#E67E22]"
                }`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        
        <button 
          onClick={logout} 
          className="flex items-center gap-3 w-full p-3 text-[var(--texto-corpo)] hover:text-red-500 mt-auto transition-colors"
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </aside>

      {/* CONTEÚDO DIREITA */}
      <div className="flex-1 ml-64 flex flex-col">
        
        {/* HEADER */}
        <header className="h-20 bg-[var(--bg-card)] border-b border-[var(--borda)] flex items-center justify-between px-8 sticky top-0 z-20 transition-colors duration-200">
          <h2 className="text-[var(--texto-titulo)] font-bold text-xl uppercase tracking-tight transition-colors duration-200">
            {menuItems.find(i => i.path === location.pathname)?.label || "Sistema"}
          </h2>

          <div className="flex items-center gap-6">
            {/* ÍCONE DE NOTIFICAÇÕES */}
            <button className="p-2 text-[var(--texto-corpo)] hover:bg-[var(--bg-principal)] rounded-full relative transition-colors duration-200">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--bg-card)]"></span>
            </button>

            {/* DROPDOWN DE PERFIL */}
            <div className="relative" ref={dropdownRef}>
              <div 
                className="flex items-center gap-3 cursor-pointer p-1.5 hover:bg-[var(--bg-principal)] rounded-2xl transition-all duration-200"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black text-[var(--texto-titulo)] leading-none mb-1 transition-colors duration-200">{user?.nome}</p>
                  <p className="text-[10px] text-[var(--texto-corpo)] font-bold uppercase tracking-wider transition-colors duration-200">
                    {userRole === "USUARIO" ? "USUÁRIO" : userRole}
                  </p>
                </div>
                <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center text-[#E67E22]">
                  <User size={24} />
                </div>
                <ChevronDown size={16} className={`text-[var(--texto-corpo)] transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </div>

              {/* MENU DO DROPDOWN */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-[var(--bg-card)] rounded-2xl shadow-xl border border-[var(--borda)] py-2 animate-fadeIn transition-colors duration-200">
                  <div className="px-4 py-3 border-b border-[var(--borda)] mb-1">
                    <p className="text-xs text-[var(--texto-corpo)] font-bold uppercase">Minha Conta</p>
                  </div>
                  
                  <button 
                    onClick={() => { navigate('/perfil'); setIsProfileOpen(false); }} 
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-[var(--texto-corpo)] hover:bg-orange-500/10 hover:text-[#E67E22] transition-colors"
                  >
                    <User size={18} /> Perfil
                  </button>
                  
                  <button 
                    onClick={() => { navigate('/configuracoes'); setIsProfileOpen(false); }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-[var(--texto-corpo)] hover:bg-orange-500/10 hover:text-[#E67E22] transition-colors"
                  >
                    <Settings size={18} /> Configurações
                  </button>
                  
                  <hr className="my-1 border-[var(--borda)]" />
                  
                  <button 
                    onClick={logout} 
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={18} /> Sair do Sistema
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ÁREA DE CONTEÚDO DAS PÁGINAS FILHAS */}
        <main className="p-8 flex-1 bg-[var(--bg-principal)] text-[var(--texto-corpo)] transition-colors duration-200">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;