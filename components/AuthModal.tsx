
import React, { useState, useRef, useEffect } from 'react';
import { X, Smartphone, Lock, ScanFace, CheckCircle2, AlertCircle, Camera, User, Mail, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { UserProfile } from '../App';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  allUsers: UserProfile[];
  onLoginSuccess: (user: UserProfile) => void;
  onRegister: (phone: string, gender: 'Nam' | 'Nữ' | 'Khác') => void;
  onResetPassword?: (phone: string, newPass: string) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, allUsers, onLoginSuccess, onRegister, onResetPassword }) => {
  const [step, setStep] = useState<'phone' | 'register_details' | 'password' | 'face' | 'forgot_password' | 'reset_new_pass'>('phone');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [gender, setGender] = useState<'Nam' | 'Nữ' | 'Khác'>('Nam');
  const [error, setError] = useState('');
  const [targetUser, setTargetUser] = useState<UserProfile | null>(null);
  const [isScanning, setIsScanning] = useState(false); 
  
  // Forgot Password States
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // Camera Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const stopCamera = () => {
     if (streamRef.current) {
       streamRef.current.getTracks().forEach(t => t.stop());
       streamRef.current = null;
     }
     if (videoRef.current) {
       videoRef.current.srcObject = null;
     }
  };

  useEffect(() => {
    return () => { stopCamera(); };
  }, []);

  useEffect(() => {
    let mounted = true;
    const initCamera = async () => {
      if (isCameraActive && step === 'face') {
        try {
          if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
          if (!mounted) {
            stream.getTracks().forEach(t => t.stop());
            return;
          }
          streamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (err: any) {
          console.error("Camera Error:", err);
          if (mounted) {
             setError("Không thể truy cập camera. Vui lòng cấp quyền hoặc dùng mật khẩu.");
             setIsCameraActive(false);
          }
        }
      } else {
        stopCamera();
      }
    };
    initCamera();
    return () => { mounted = false; stopCamera(); };
  }, [isCameraActive, step]);

  if (!isOpen) return null;

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError('Số điện thoại không hợp lệ');
      return;
    }
    const user = allUsers.find(u => u.phone === phone);
    if (!user) {
       setStep('register_details'); // Move to registration details
    } else {
       setTargetUser(user);
       if (!user.password) {
         onLoginSuccess(user);
       } else {
         if (user.loginMethod === 'face' && user.faceData) {
            setStep('face');
            setIsCameraActive(true);
         } else {
            setStep('password');
         }
       }
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRegister(phone, gender);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetUser && targetUser.password === password) {
       onLoginSuccess(targetUser);
    } else {
       setError('Mật khẩu không đúng!');
    }
  };
  
  const handleForgotRequest = (e: React.FormEvent) => {
     e.preventDefault();
     if (!resetEmail.includes('@')) {
         setError("Email không hợp lệ");
         return;
     }
     // Mock sending email
     alert(`Mã xác nhận đã được gửi đến ${resetEmail} (Mã giả lập: 123456)`);
     setStep('reset_new_pass');
  };
  
  const handleResetConfirm = (e: React.FormEvent) => {
     e.preventDefault();
     if (resetCode !== '123456') {
         setError("Mã xác nhận không đúng (Dùng 123456)");
         return;
     }
     if (newPassword.length < 6) {
         setError("Mật khẩu phải từ 6 ký tự");
         return;
     }
     if (targetUser && onResetPassword) {
         onResetPassword(targetUser.phone, newPassword);
         alert("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
         setStep('password');
         setPassword('');
     }
  };

  const verifyFace = () => {
    setIsScanning(true);
    setTimeout(() => {
        stopCamera();
        setIsCameraActive(false);
        setIsScanning(false);
        if (targetUser && targetUser.faceData) {
            onLoginSuccess(targetUser);
        } else {
            setError("Không nhận diện được khuôn mặt. Vui lòng thử lại.");
        }
    }, 1500); 
  };

  const handleClose = () => {
    stopCamera();
    setIsCameraActive(false);
    setIsScanning(false);
    setStep('phone');
    setPhone('');
    setPassword('');
    setGender('Nam');
    setError('');
    setResetEmail('');
    setResetCode('');
    setNewPassword('');
    setShowPassword(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center px-4 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      
      <div className="relative w-full max-w-[400px] bg-white rounded-t-[32px] sm:rounded-[32px] p-8 shadow-2xl animate-in slide-in-from-bottom-10 duration-500">
        <button onClick={handleClose} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors">
          <X className="w-6 h-6 text-gray-400" />
        </button>

        {step === 'phone' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-[#FF6B00]/10 rounded-2xl flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-[#FF6B00]" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-center text-gray-800 mb-2">Đăng Nhập</h2>
            <p className="text-gray-500 text-center text-sm mb-6 px-4">Nhập số điện thoại để tiếp tục</p>
            
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
               <input
                  type="tel"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setError(''); }}
                  placeholder="Số điện thoại..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-6 text-lg font-bold tracking-widest focus:ring-2 focus:ring-[#FF6B00] outline-none"
                />
                {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
                <button type="submit" className="w-full bg-[#FF6B00] text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-orange-200 uppercase">Tiếp Tục</button>
            </form>
          </>
        )}

        {step === 'register_details' && (
           <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                <User className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-center text-gray-800 mb-2">Thông Tin Bổ Sung</h2>
            <p className="text-gray-500 text-center text-sm mb-6">Vui lòng chọn giới tính của bạn</p>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
               <div className="grid grid-cols-3 gap-3">
                  {(['Nam', 'Nữ', 'Khác'] as const).map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      className={`py-3 rounded-xl font-bold border-2 transition-all ${gender === g ? 'border-[#FF6B00] bg-orange-50 text-[#FF6B00]' : 'border-gray-100 text-gray-400'}`}
                    >
                      {g}
                    </button>
                  ))}
               </div>
               <button type="submit" className="w-full bg-[#FF6B00] text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-orange-200 uppercase">Hoàn Tất Đăng Ký</button>
            </form>
           </>
        )}

        {step === 'password' && (
           <>
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-[#FF6B00]/10 rounded-2xl flex items-center justify-center">
                <Lock className="w-8 h-8 text-[#FF6B00]" />
              </div>
            </div>
            <h2 className="text-2xl font-black text-center text-gray-800 mb-2">Nhập Mật Khẩu</h2>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4 mt-6">
               <div className="relative">
                 <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="******"
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-6 text-lg font-bold text-center tracking-widest focus:ring-2 focus:ring-[#FF6B00] outline-none"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF6B00]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                  </button>
               </div>
                {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
                <button type="submit" className="w-full bg-[#FF6B00] text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-orange-200 uppercase">Đăng Nhập</button>
                
                <div className="flex justify-between items-center mt-4 px-1">
                    {targetUser?.faceData && (
                       <button type="button" onClick={() => { setStep('face'); setIsCameraActive(true); }} className="text-gray-400 font-bold text-xs uppercase hover:text-[#FF6B00]">Dùng Face ID</button>
                    )}
                    <button type="button" onClick={() => { setStep('forgot_password'); setError(''); }} className="text-gray-400 font-bold text-xs uppercase hover:text-[#FF6B00] ml-auto">Quên mật khẩu?</button>
                </div>
            </form>
           </>
        )}
        
        {step === 'forgot_password' && (
            <>
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center">
                        <Mail className="w-8 h-8 text-purple-500" />
                    </div>
                </div>
                <h2 className="text-xl font-black text-center text-gray-800 mb-2">Quên Mật Khẩu</h2>
                <p className="text-gray-500 text-center text-xs mb-6 px-4">Nhập Email để nhận mã xác thực lấy lại mật khẩu.</p>
                <form onSubmit={handleForgotRequest} className="space-y-4">
                    <input 
                       type="email"
                       value={resetEmail}
                       onChange={e => setResetEmail(e.target.value)}
                       placeholder="Email của bạn..."
                       className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-purple-200 outline-none"
                    />
                    {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
                    <button type="submit" className="w-full bg-purple-500 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-purple-200 uppercase">Gửi Mã Xác Nhận</button>
                </form>
                <button onClick={() => setStep('password')} className="w-full mt-4 text-gray-400 font-bold text-xs uppercase">Quay lại</button>
            </>
        )}
        
        {step === 'reset_new_pass' && (
            <>
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                        <ShieldCheck className="w-8 h-8 text-green-500" />
                    </div>
                </div>
                <h2 className="text-xl font-black text-center text-gray-800 mb-2">Đặt Lại Mật Khẩu</h2>
                
                <form onSubmit={handleResetConfirm} className="space-y-4">
                    <input 
                       type="text"
                       value={resetCode}
                       onChange={e => setResetCode(e.target.value)}
                       placeholder="Mã xác nhận (VD: 123456)"
                       className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-6 text-center text-lg font-black tracking-widest focus:ring-2 focus:ring-green-200 outline-none"
                    />
                    <div className="relative">
                        <input 
                           type={showPassword ? "text" : "password"}
                           value={newPassword}
                           onChange={e => setNewPassword(e.target.value)}
                           placeholder="Mật khẩu mới"
                           className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-green-200 outline-none"
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)} 
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-500"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
                    <button type="submit" className="w-full bg-green-500 text-white py-4 rounded-2xl font-black text-lg shadow-lg shadow-green-200 uppercase">Đổi Mật Khẩu</button>
                </form>
            </>
        )}

        {step === 'face' && (
           <>
             <h2 className="text-xl font-black text-center text-gray-800 mb-4">Quét Khuôn Mặt</h2>
             <div className="relative w-full aspect-square bg-black rounded-3xl overflow-hidden mb-4 border-4 border-[#FF6B00]">
                <video 
                   ref={videoRef} 
                   autoPlay 
                   playsInline 
                   muted
                   className={`w-full h-full object-cover transform scale-x-[-1] ${isCameraActive ? 'opacity-100' : 'opacity-0'}`} 
                />
                
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                   <div className={`w-48 h-64 border-2 border-white/50 rounded-[40%] relative overflow-hidden`}>
                      {isScanning && <div className="absolute top-0 left-0 w-full h-1 bg-[#FF6B00] shadow-[0_0_10px_#FF6B00] animate-[scan_1.5s_linear_infinite]"></div>}
                   </div>
                </div>
                <style>{`
                  @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                  }
                `}</style>
             </div>
             
             {error ? (
                <div className="text-center">
                   <p className="text-red-500 text-xs font-bold mb-3">{error}</p>
                   <div className="flex gap-2 justify-center">
                     <button onClick={() => { setError(''); setIsCameraActive(true); }} className="bg-[#FF6B00] text-white px-4 py-2 rounded-xl font-bold text-xs uppercase">Thử Lại</button>
                     <button onClick={() => { stopCamera(); setIsCameraActive(false); setStep('password'); }} className="bg-gray-200 text-gray-600 px-4 py-2 rounded-xl font-bold text-xs uppercase">Dùng Mật Khẩu</button>
                   </div>
                </div>
             ) : (
                <button 
                  onClick={verifyFace} 
                  disabled={isScanning}
                  className="w-full bg-[#FF6B00] text-white py-4 rounded-2xl font-black text-lg shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                   {isScanning ? <span className="animate-pulse">Đang xác thực...</span> : <><ScanFace className="w-6 h-6" /> Quét Ngay</>}
                </button>
             )}
           </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
