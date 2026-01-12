
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import PWAPrompt from './components/PWAPrompt';
import GlobalNotification from './components/GlobalNotification'; 
import { dbService } from './services/firebase';

// Interfaces (Kept for Admin Dashboard usage)
export interface Category { id: 'gym' | 'groupx'; name: string; }
export interface PackageItem { id: string; categoryId: 'gym' | 'groupx'; name: string; price: number; image: string; description?: string; duration: number; }
export interface PTPackage { id: string; name: string; price: number; sessions: number; image: string; description?: string; }
export interface RevenueTransaction { id: string; userId: string; userName: string; packageName: string; amount: number; date: number; type: 'Gym' | 'PT'; method: 'Cash' | 'Transfer'; }
export interface Subscription { name: string; months: number; expireDate: number | null; startDate: number; price: number; paidAmount: number; paymentMethod?: 'Cash' | 'Transfer'; voucherCode?: string | null; status: 'Pending' | 'Active' | 'Expired' | 'Rejected' | 'Pending Preservation' | 'Preserved'; packageImage?: string; }
export interface PTSubscription { packageId: string; name: string; price: number; paidAmount: number; totalSessions: number; sessionsRemaining: number; image: string; status: 'Pending' | 'Active' | 'Finished'; startDate?: number; }
export interface Booking { id: string; userId: string; userName: string; userAvatar?: string; trainerId: string; trainerName: string; date: string; timeSlot: string; status: 'Pending' | 'Approved' | 'Completed' | 'Rejected'; rating?: number; comment?: string; media?: string[]; timestamp: number; }
export interface Notification { id: string; text: string; date: number; read: boolean; type?: 'system' | 'admin_msg' | 'approval' | 'booking'; }
export interface ChatMessage { sender: 'user' | 'admin'; text: string; timestamp: number; }
export interface UserProfile { phone: string; password?: string; faceData?: string | null; loginMethod?: 'password' | 'face'; gender?: 'Nam' | 'Nữ' | 'Khác'; realName?: string; name?: string; email?: string; address?: string; securityQuestion?: string; securityAnswer?: string; avatar: string | null; subscription: Subscription | null; ptSubscription?: PTSubscription | null; isLocked: boolean; notifications: Notification[]; messages: ChatMessage[]; trainingDays: string[]; savedVouchers: string[]; accountStatus?: 'Active'; referredBy?: string; referralBonusAvailable?: boolean; hasUsedReferralDiscount?: boolean; settings?: { popupNotification: boolean; }; }
export type AdminPermission = 'view_users' | 'approve_users' | 'view_revenue' | 'view_revenue_details' | 'send_notification' | 'edit_user_settings' | 'manage_user' | 'chat_user' | 'manage_packages' | 'manage_pt_packages' | 'add_pt' | 'view_user_list' | 'manage_promo' | 'manage_voucher' | 'view_schedule' | 'manage_app_interface' | 'manage_bookings' | 'create_qr';
export interface AdminProfile { username: string; password?: string; phone?: string; avatar?: string; faceData?: string; role: 'super_admin' | 'sub_admin'; name: string; permissions: AdminPermission[]; settings: { showFloatingMenu: boolean; showPopupNoti: boolean; }; }
export interface Promotion { id: string; title: string; image: string; date: number; }
export interface VoucherItem { id: string; title: string; code: string; type: 'Gym' | 'PT' | 'Gift'; value: number; color: string; image?: string; }
export interface Trainer { id: string; name: string; specialty: string; image: string; rating: number; }
export interface TrainingProgram { id: string; title: string; duration: string; image: string; }

const AppContent: React.FC = () => {
  // Data State (Necessary for Admin Dashboard functionality)
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [transactions, setTransactions] = useState<RevenueTransaction[]>([]);
  
  // Admin State
  const [currentAdmin, setCurrentAdmin] = useState<AdminProfile | null>(null);
  const [admins, setAdmins] = useState<AdminProfile[]>([]);

  // App Configuration State
  const [heroImage, setHeroImage] = useState<string>('https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&q=80&w=600');
  const [heroVideo, setHeroVideo] = useState<string>('');
  const [heroTitle, setHeroTitle] = useState<string>('CÂU LẠC\nBỘ\nGYM');
  const [heroSubtitle, setHeroSubtitle] = useState<string>('GYM CHO MỌI NGƯỜI');
  const [heroOverlayText, setHeroOverlayText] = useState<string>('THAY ĐỔI BẢN THÂN');
  const [heroOverlaySub, setHeroOverlaySub] = useState<string>('Tại Sip Gym Nhà Bè');

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [vouchers, setVouchers] = useState<VoucherItem[]>([
    { id: '1', title: 'Giảm 20% Gói Gym', code: 'SIPGYM20', type: 'Gym', value: 0.2, color: 'bg-orange-500' },
    { id: '2', title: 'Giảm 10% Gói PT', code: 'PT10', type: 'PT', value: 0.1, color: 'bg-blue-500' }
  ]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  
  const [packages, setPackages] = useState<PackageItem[]>([
    { id: '1m', categoryId: 'gym', name: '1 Tháng', price: 500000, duration: 1, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=300', description: 'Tập gym không giới hạn 1 tháng.' },
    { id: '3m', categoryId: 'gym', name: '3 Tháng', price: 1350000, duration: 3, image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=300', description: 'Tiết kiệm 10%.' },
    { id: '6m', categoryId: 'gym', name: '6 Tháng', price: 2500000, duration: 6, image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=300', description: 'Tặng thêm 15 ngày.' },
    { id: '1y', categoryId: 'gym', name: '1 Năm', price: 4500000, duration: 12, image: 'https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?auto=format&fit=crop&q=80&w=300', description: 'Cam kết thay đổi hình thể.' },
    { id: 'yoga', categoryId: 'groupx', name: 'Yoga', price: 600000, duration: 1, image: 'https://images.unsplash.com/photo-1544367563-12123d8959bd?auto=format&fit=crop&q=80&w=300', description: 'Lớp Yoga thư giãn.' },
    { id: 'aerobic', categoryId: 'groupx', name: 'Aerobic', price: 550000, duration: 1, image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=300', description: 'Nhảy Aerobic sôi động.' },
  ]);

  const [ptPackages, setPTPackages] = useState<PTPackage[]>([
     { id: 'pt1', name: 'PT 1 Kèm 1 (12 Buổi)', price: 3600000, sessions: 12, image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=300', description: 'HLV kèm 1-1, lên thực đơn dinh dưỡng.' },
     { id: 'pt2', name: 'PT 1 Kèm 1 (24 Buổi)', price: 6500000, sessions: 24, image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&q=80&w=300', description: 'Cam kết thay đổi hình thể.' }
  ]);

  const [isLoading, setIsLoading] = useState(true); 
  const [popupNotification, setPopupNotification] = useState<{title: string, msg: string} | null>(null);
  const navigate = useNavigate();

  // --- DATA SYNCING ---
  useEffect(() => {
    // Sync Admins
    dbService.subscribe('admins', (data: any) => {
        let adminList: AdminProfile[] = [];
        if (data) adminList = Array.isArray(data) ? data : Object.values(data);
        if (adminList.length === 0) {
            const defaultAdmin: AdminProfile = {
                username: 'admin',
                password: '123456',
                phone: '0909000000',
                role: 'super_admin',
                name: 'Super Admin',
                permissions: [], 
                settings: { showFloatingMenu: true, showPopupNoti: true }
            };
            adminList = [defaultAdmin];
            dbService.saveAll('admins', adminList);
        }
        setAdmins(adminList);
        
        // Restore session
        const sessionStr = localStorage.getItem('admin_session');
        if (sessionStr) {
            const session = JSON.parse(sessionStr);
            const updatedMe = adminList.find(a => a.username === session.username);
            if (updatedMe) {
                setCurrentAdmin(updatedMe);
                localStorage.setItem('admin_session', JSON.stringify(updatedMe));
            }
        }
    });

    // Sync Users
    dbService.subscribe('users', (data: any) => {
      const rawList = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
      const sanitizedUsers: UserProfile[] = rawList.map((u: any) => ({
        ...u,
        notifications: Array.isArray(u.notifications) ? u.notifications : (u.notifications ? Object.values(u.notifications) : []),
        messages: Array.isArray(u.messages) ? u.messages : (u.messages ? Object.values(u.messages) : []),
        trainingDays: Array.isArray(u.trainingDays) ? u.trainingDays : (u.trainingDays ? Object.values(u.trainingDays) : []),
        savedVouchers: Array.isArray(u.savedVouchers) ? u.savedVouchers : [],
        settings: u.settings || { popupNotification: true },
        accountStatus: u.accountStatus || 'Pending' 
      }));
      setAllUsers(sanitizedUsers);
      setIsLoading(false);
    });

    // Sync Other Data
    dbService.subscribe('transactions', (data: any) => {
        let raw = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
        setTransactions(raw as RevenueTransaction[]);
    });
    dbService.subscribe('bookings', (data: any) => {
       let rawBookings = data ? (Array.isArray(data) ? data : Object.values(data)) : [];
       setBookings(rawBookings as Booking[]);
    });
    dbService.subscribe('app_settings', (data: any) => {
        if (data) {
            if (data.heroImage) setHeroImage(data.heroImage);
            if (data.heroVideo) setHeroVideo(data.heroVideo);
            if (data.heroTitle) setHeroTitle(data.heroTitle);
            if (data.heroSubtitle) setHeroSubtitle(data.heroSubtitle);
            if (data.heroOverlayText) setHeroOverlayText(data.heroOverlayText);
            if (data.heroOverlaySub) setHeroOverlaySub(data.heroOverlaySub);
        }
    });
    dbService.subscribe('promos', (data: any) => {
      if (data) setPromotions(Array.isArray(data) ? data : Object.values(data));
    });
    dbService.subscribe('vouchers', (data: any) => {
      if (data) setVouchers(Array.isArray(data) ? data : Object.values(data));
    });
    dbService.subscribe('trainers', (data: any) => {
      if (data) setTrainers(Array.isArray(data) ? data : Object.values(data));
    });
    dbService.subscribe('packages', (data: any) => {
      if (data) setPackages(Array.isArray(data) ? data : Object.values(data));
    });
    dbService.subscribe('pt_packages', (data: any) => {
      if (data) setPTPackages(Array.isArray(data) ? data : Object.values(data));
    });
  }, []);

  const syncAdmins = (newAdmins: AdminProfile[]) => {
    setAdmins(newAdmins);
    dbService.saveAll('admins', newAdmins);
    if (currentAdmin) {
      const updatedMe = newAdmins.find(a => a.username === currentAdmin.username);
      if (updatedMe) {
          setCurrentAdmin(updatedMe);
          localStorage.setItem('admin_session', JSON.stringify(updatedMe));
      }
    }
  };

  const syncDB = (newUsers: UserProfile[]) => {
    setAllUsers(newUsers); 
    dbService.saveAll('users', newUsers);
  };

  const syncBookings = (newBookings: Booking[]) => {
      setBookings(newBookings);
      dbService.saveAll('bookings', newBookings);
  };
  
  const syncAppConfig = (config: { appLogo: string, heroImage: string, heroVideo?: string, heroTitle: string, heroSubtitle: string, heroOverlayText?: string, heroOverlaySub?: string }) => {
      setHeroImage(config.heroImage);
      if(config.heroVideo) setHeroVideo(config.heroVideo);
      setHeroTitle(config.heroTitle);
      setHeroSubtitle(config.heroSubtitle);
      if(config.heroOverlayText) setHeroOverlayText(config.heroOverlayText);
      if(config.heroOverlaySub) setHeroOverlaySub(config.heroOverlaySub);
      dbService.saveAll('app_settings', config);
  };
  
  const syncVouchers = (newVouchers: VoucherItem[]) => { setVouchers(newVouchers); dbService.saveAll('vouchers', newVouchers); };
  const syncPromos = (newPromos: Promotion[]) => { setPromotions(newPromos); dbService.saveAll('promos', newPromos); };
  const syncTrainers = (newTrainers: Trainer[]) => { setTrainers(newTrainers); dbService.saveAll('trainers', newTrainers); };
  const syncPackages = (newPackages: PackageItem[]) => { setPackages(newPackages); dbService.saveAll('packages', newPackages); };
  const syncPTPackages = (newPTPackages: PTPackage[]) => { setPTPackages(newPTPackages); dbService.saveAll('pt_packages', newPTPackages); };

  const handleAdminLoginSuccess = (admin: AdminProfile) => {
    setCurrentAdmin(admin);
    localStorage.setItem('admin_session', JSON.stringify(admin));
  };

  const handleLogout = () => {
      setCurrentAdmin(null);
      localStorage.removeItem('admin_session');
      navigate('/');
  };

  if (isLoading && dbService.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF7ED] flex flex-col overflow-hidden w-full">
      <PWAPrompt />
      {popupNotification && (
          <GlobalNotification 
             title={popupNotification.title} 
             message={popupNotification.msg} 
             onClose={() => setPopupNotification(null)} 
          />
      )}
      
      <div className="flex-1 w-full">
        <Routes>
          {/* Default Route is now Admin Login */}
          <Route 
             path="/" 
             element={<AdminLogin admins={admins} onLoginSuccess={handleAdminLoginSuccess} />} 
          />
          
          <Route 
            path="/dashboard" 
            element={
              currentAdmin ? (
                <AdminDashboard 
                    currentAdmin={currentAdmin}
                    admins={admins}
                    setAdmins={syncAdmins}
                    allUsers={allUsers} 
                    setAllUsers={syncDB} 
                    promotions={promotions} 
                    setPromos={syncPromos}
                    vouchers={vouchers}
                    setVouchers={syncVouchers}
                    trainers={trainers} 
                    setTrainers={syncTrainers}
                    packages={packages}
                    setPackages={syncPackages}
                    programs={programs} 
                    setPrograms={(p) => {}}
                    ptPackages={ptPackages}
                    setPTPackages={syncPTPackages}
                    heroImage={heroImage}
                    heroTitle={heroTitle}
                    heroSubtitle={heroSubtitle}
                    heroOverlayText={heroOverlayText}
                    heroOverlaySub={heroOverlaySub}
                    onUpdateAppConfig={syncAppConfig}
                    bookings={bookings}
                    onUpdateBookings={syncBookings}
                    onLogout={handleLogout}
                />
              ) : <Navigate to="/" replace />
            } 
          />
          
          {/* Catch all redirect to login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
