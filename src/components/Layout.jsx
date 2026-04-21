import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/authContext';
import { 
  LayoutDashboard, BarChart3, ShoppingCart, 
  Package, LogOut, Receipt, Wallet, Truck, ShoppingBag 
} from 'lucide-react';

const Layout = () => {
const { logout } = useAuth();
const navigate = useNavigate();
const location = useLocation();

const menuItems = [
  { label: "Dashboard", path: "/home", icon: LayoutDashboard },
  { label: "Relatórios", path: "/relatorios", icon: BarChart3 },
  { label: "Vendas", path: "/vendas", icon: ShoppingCart },
    { label: "Estoque", path: "/estoque", icon: Package },
    { label: "Comandas", path: "/comandas", icon: ShoppingBag },
    { label: "Contas a Receber", path: "/contas-receber", icon: Receipt },
    { label: "Contas a Pagar", path: "/contas-pagar", icon: Wallet },
    { label: "Fornecedores", path: "/fornecedores", icon: Truck },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8F9FC]">
      
      
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col p-6 fixed h-full print:hidden">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-[#E67E22] p-2 rounded-xl">
            <span className="text-white font-bold">ÓP</span>
          </div>
          <h1 className="text-xl font-bold text-[#151D48]">Ó PAI, Ó</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all font-medium ${
                location.pathname === item.path 
                ? "bg-[#E67E22] text-white shadow-md" 
                : "text-[#737791] hover:bg-orange-50"
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <button 
          onClick={() => { logout(); navigate('/login'); }}
          className="flex items-center gap-3 w-full p-3 text-[#737791] hover:text-red-500 transition-all mt-auto"
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </aside>

      
      <main className="flex-1 ml-64 print:ml-0 print:w-full print:p-0">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;