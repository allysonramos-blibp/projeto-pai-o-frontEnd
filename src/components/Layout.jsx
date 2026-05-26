import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import { 
  LayoutDashboard, ShoppingCart, Package, LogOut, 
  Receipt, Wallet, BarChart3, Users, ShoppingBag,
  User, Settings, Bell, ChevronDown, Menu, X 
} from 'lucide-react';

const Layout = () => {
  const { logout, user } = useAuth(); 
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

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
    <div className="flex min-h-screen bg-gray-50">
      
      <aside className={`
        fixed top-0 left-0 h-full z-40 bg-white border-r border-gray-100 p-6 flex flex-col transition-transform duration-300
        ${isMobileMenuOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 w-64'}
      `}>
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-[#E67E22] p-2 rounded-xl">
            <span className="text-white font-bold">ÓP</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Ó PAI, Ó</h1>
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
                    : "text-gray-600 hover:bg-orange-50 hover:text-[#E67E22]"
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
          className="flex items-center gap-3 w-full p-3 text-gray-600 hover:text-red-500 mt-auto transition-colors"
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </aside>

      
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      <div className="flex-1 flex flex-col md:ml-64">
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 text-gray-600" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h2 className="text-gray-900 font-bold text-lg md:text-xl uppercase tracking-tight">
              {menuItems.find(i => i.path === location.pathname)?.label || "Sistema"}
            </h2>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <button className="p-2 text-gray-500 hover:bg-gray-50 rounded-full relative">
              <Bell size={20} />
            </button>
            
            <div className="relative" ref={dropdownRef}>
              <div 
                className="flex items-center gap-2 md:gap-3 cursor-pointer p-1.5 hover:bg-gray-50 rounded-2xl transition-all"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black text-gray-900 leading-none mb-1">{user?.nome}</p>
                </div>
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-[#E67E22]">
                  <User size={24} />
                </div>
                <ChevronDown size={16} className={`text-gray-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </div>
              
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2">
                  <button onClick={() => { navigate('/perfil'); setIsProfileOpen(false); }} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50">
                    <User size={18} /> Perfil
                  </button>
                  <button onClick={logout} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50">
                    <LogOut size={18} /> Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        
        <main className="p-4 md:p-8 flex-1 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;