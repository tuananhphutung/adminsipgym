
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, User, ScanFace, Smartphone, ArrowLeft } from 'lucide-react';
import { AdminProfile } from '../App';

interface AdminLoginProps {
  admins?: AdminProfile[];
  onLoginSuccess?: (admin: AdminProfile) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ admins = [], onLoginSuccess }) => {
  const [loginMethod, setLoginMethod] = useState<'password' | 'face' | 'forgot'>('password');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Forgot Password State
  const [recoveryPhone, setRecoveryPhone] = useState('');
  
  // Camera State
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const navigate = useNavigate();

  // Stop camera on unmount or method change
  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsScanning(true);
      
      // Simulate scanning delay
      setTimeout(() => {
         // Mock Face Match logic
         const matchedAdmin = admins.find(a => a.faceData); // In real app, match face data
         if (matchedAdmin) {
             handleSuccess(matchedAdmin);
         } else {
             setError("Không nhận diện được khuôn mặt quản trị viên.");
             setIsScanning(false);
             if(streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
         }
      }, 2000);
    } catch (e) {
      setError("Không thể truy cập camera.");
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const admin = admins.find(a => a.username === username && a.password === password);
    if (admin) {
      handleSuccess(admin);
    } else {
      setError('Sai tài khoản hoặc mật khẩu!');
    }
  };
  
  const handleSuccess = (admin: AdminProfile) => {
      if (onLoginSuccess) onLoginSuccess(admin);
      localStorage.setItem('admin_logged', 'true');
      navigate('/admin/dashboard');
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const admin = admins.find(a => a.phone === recoveryPhone);
      if (admin) {
          alert(`Mã xác nhận đã gửi về ${recoveryPhone}. (Demo: Mật khẩu của bạn là ${admin.password})`);
          setLoginMethod('password');
      } else {
          setError("Số điện thoại này không thuộc quyền quản lý.");
      }
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col p-0 font-sans relative overflow-hidden">
      {/* Full screen wrapper for mobile */}
      <div className="w-full h-full flex flex-col justify-center px-8 py-10 relative z-10 flex-1">
        
        {/* Decorative Background for Mobile */}
        <div className="absolute top-[-10%] right-[-20%] w-[300px] h-[300px] bg-yellow-100/50 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-20%] w-[250px] h-[250px] bg-orange-100/50 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex justify-center mb-8 relative z-10">
          <div className="w-24 h-24 bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-[30px] flex items-center justify-center shadow-lg shadow-yellow-500/30">
            <ShieldCheck className="w-12 h-12 text-white" />
          </div>
        </div>
        
        <h1 className="text-3xl font-black text-center text-gray-800 mb-2 uppercase tracking-tight">Quản Trị Viên</h1>
        <p className="text-gray-400 text-center text-[10px] font-bold uppercase tracking-[0.2em] mb-12">Sip Gym Management System</p>

        {loginMethod === 'password' && (
            <form onSubmit={handleLogin} className="space-y-6 relative z-10">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-yellow-500 transition-colors group-focus-within:text-orange-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Tên đăng nhập"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-yellow-400 rounded-2xl py-4 pl-14 pr-4 font-bold text-gray-800 placeholder:text-gray-400 outline-none transition-all text-base"
                />
              </div>

              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-yellow-500 transition-colors group-focus-within:text-orange-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu"
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-yellow-400 rounded-2xl py-4 pl-14 pr-4 font-bold text-gray-800 placeholder:text-gray-400 outline-none transition-all text-base"
                />
              </div>

              <div className="flex justify-end">
                  <button type="button" onClick={() => setLoginMethod('forgot')} className="text-xs font-bold text-gray-400 hover:text-orange-500 uppercase">Quên mật khẩu?</button>
              </div>

              {error && <p className="text-red-500 text-sm font-bold text-center bg-red-50 py-3 rounded-xl">{error}</p>}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white py-5 rounded-2xl font-black text-base shadow-xl shadow-orange-200 active:scale-95 transition-all uppercase tracking-wider"
              >
                Đăng Nhập
              </button>
              
              <div className="relative flex py-4 items-center">
                  <div className="flex-grow border-t border-gray-100"></div>
                  <span className="flex-shrink-0 mx-4 text-gray-300 text-[10px] font-bold uppercase">Hoặc</span>
                  <div className="flex-grow border-t border-gray-100"></div>
              </div>

              <button 
                 type="button"
                 onClick={() => { setLoginMethod('face'); startCamera(); }}
                 className="w-full bg-white border-2 border-yellow-100 text-yellow-600 py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:bg-yellow-50 active:scale-95 transition-all uppercase"
              >
                 <ScanFace className="w-5 h-5" /> Sử dụng Face ID
              </button>
            </form>
        )}

        {loginMethod === 'face' && (
            <div className="relative z-10 flex flex-col items-center flex-1 justify-center">
                <div className="relative w-72 h-72 rounded-[40px] overflow-hidden border-4 border-yellow-400 shadow-xl mb-8">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform scale-x-[-1]" />
                    {isScanning && <div className="absolute inset-0 bg-yellow-400/20 animate-pulse"></div>}
                </div>
                <p className="text-gray-500 text-sm font-bold mb-8 animate-pulse uppercase tracking-wide">Đang xác thực khuôn mặt...</p>
                {error && <p className="text-red-500 text-xs font-bold text-center mb-4">{error}</p>}
                <button 
                   onClick={() => {
                       if(streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
                       setLoginMethod('password');
                       setError('');
                   }}
                   className="text-gray-400 font-bold text-xs uppercase hover:text-gray-600 border-b border-gray-300 pb-1"
                >
                   Sử dụng mật khẩu
                </button>
            </div>
        )}

        {loginMethod === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-5 relative z-10">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Smartphone className="w-8 h-8" />
                    </div>
                    <p className="text-sm text-gray-500 px-4">Nhập số điện thoại đã đăng ký để lấy lại mật khẩu.</p>
                </div>
                <div className="relative group">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                    <input
                      type="tel"
                      value={recoveryPhone}
                      onChange={(e) => setRecoveryPhone(e.target.value)}
                      placeholder="Số điện thoại"
                      className="w-full bg-gray-50 border-2 border-transparent focus:border-red-400 rounded-2xl py-4 pl-14 pr-4 font-bold text-gray-800 outline-none transition-all text-base bg-gray-50"
                    />
                </div>
                {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
                <button type="submit" className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-sm active:scale-95 transition-all uppercase shadow-lg">Gửi Mã</button>
                <button type="button" onClick={() => { setLoginMethod('password'); setError(''); }} className="w-full text-center text-gray-400 font-bold text-xs uppercase mt-2">Quay lại</button>
            </form>
        )}
        
        <button onClick={() => navigate('/')} className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-2 text-gray-400 font-bold text-xs hover:text-orange-500 transition-colors uppercase tracking-wider">
            <ArrowLeft className="w-4 h-4" /> Về trang chủ
        </button>
      </div>
    </div>
  );
};

export default AdminLogin;
