import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  return (
    <header className="w-full flex items-center justify-between px-8 py-4 bg-white border-b">
      <div className="flex items-center">
        <Link to="/" className="flex items-center gap-2.5 group">       
          <img                                                            
            src="/logo_webapp.png"                                       
            alt="Bilixpress icon"                                         
            className="w-11 h-11 rounded-xl"                             
          />                                                              
          <div className="flex flex-col leading-tight">                  
            <span className="text-[22px] font-extrabold text-[#1766e0] tracking-tight group-hover:text-blue-700 transition"> {/* LINE 17 */}
              Bilixpress                                                  
            </span>                                                      
            <span className="text-[9px] font-bold text-gray-400 tracking-[2.5px] uppercase"> 
              Campus Errands                                              
            </span>                                                       
          </div>                                                         
        </Link>                                                          
      </div>
      <div className="flex items-center space-x-2">
        <Link to="/login" className={`px-4 py-2 rounded font-medium transition ${location.pathname === '/login' ? 'bg-black text-white' : 'hover:bg-gray-100 text-black'}`}>Login</Link>
        <Link to="/register" className={`px-4 py-2 rounded font-medium transition ${location.pathname === '/register' ? 'bg-black text-white' : 'bg-black text-white hover:bg-gray-800'}`}>Sign Up</Link>
      </div>
    </header>
  );
};

export default Navbar;