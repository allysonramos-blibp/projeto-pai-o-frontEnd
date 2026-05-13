import React, { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import { 
  LayoutDashboard, ShoppingCart, Package, LogOut, 
  Receipt, Wallet, Truck, BarChart3, Users, ShoppingBag,
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

  const userRole = user?.perfil?.trim().toUpperCase() || "";
  const visibleMenuItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col p-6 fixed h-full z-30">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-[#E67E22] p-2 rounded-xl"><span className="text-white font-bold">ÓP</span></div>
          <h1 className="text-xl font-bold text-[#151D48]">Ó PAI, Ó</h1>
        </div>
        <nav className="flex-1 space-y-2">
          {visibleMenuItems.map((item) => (
            <button key={item.path} onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 w-full p-3 rounded-xl font-medium transition-all ${
                location.pathname === item.path ? "bg-[#E67E22] text-white shadow-lg shadow-orange-200" : "text-[#737791] hover:bg-orange-50"
              }`}>
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <button onClick={logout} className="flex items-center gap-3 w-full p-3 text-[#737791] hover:text-red-500 mt-auto transition-colors">
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </aside>

      <div className="flex-1 ml-64 flex flex-col">
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-20">
          <h2 className="text-[#151D48] font-bold text-xl uppercase tracking-tight">
            {menuItems.find(i => i.path === location.pathname)?.label || "Sistema"}
          </h2>

          <div className="flex items-center gap-6">
            <button className="p-2 text-[#737791] hover:bg-gray-50 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="relative" ref={dropdownRef}>
              <div 
                className="flex items-center gap-3 cursor-pointer p-1.5 hover:bg-gray-50 rounded-2xl transition-all"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black text-[#151D48] leading-none mb-1">{user?.nome}</p>
                  <p className="text-[10px] text-[#737791] font-bold uppercase tracking-wider">{userRole}</p>
                </div>
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-[#E67E22]">
                  <User size={24} />
                </div>
                <ChevronDown size={16} className={`text-[#737791] transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </div>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-fadeIn">
                  <div className="px-4 py-3 border-b border-gray-50 mb-1">
                    <p className="text-xs text-gray-400 font-bold uppercase">Minha Conta</p>
                  </div>
                  <button onClick={() => {navigate('/perfil'); setIsProfileOpen(false);}} 
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-[#737791] hover:bg-orange-50 hover:text-[#E67E22]">
                    <User size={18} /> Perfil
                  </button>
                  <button onClick={() => {navigate('/configuracoes'); setIsProfileOpen(false);}}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-[#737791] hover:bg-orange-50 hover:text-[#E67E22]">
                    <Settings size={18} /> Configurações
                  </button>
                  <hr className="my-1 border-gray-50" />
                  <button onClick={logout} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50">
                    <LogOut size={18} /> Sair do Sistema
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-8"><Outlet /></main>
      </div>
    </div>
  );
};

export default Layout;
