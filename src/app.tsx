import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/AuthProvider";
import { I18nProvider } from "@/lib/i18n";
import Layout from "@/components/Layout";
import HeatmapPage from "@/pages/HeatmapPage/HeatmapPage";
import CoinsPage from "@/pages/CoinsPage/CoinsPage";
import CoinDetailPage from "@/pages/CoinDetailPage/CoinDetailPage";
import RiskPage from "@/pages/RiskPage/RiskPage";
import ProfilePage from "@/pages/ProfilePage/ProfilePage";
import LoginPage from "@/pages/LoginPage/LoginPage";
import RegisterPage from "@/pages/RegisterPage/RegisterPage";
import NotFoundPage from "@/pages/NotFoundPage/NotFoundPage";

export default function App() {
  return (
    <I18nProvider>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HeatmapPage />} />
            <Route path="coins" element={<CoinsPage />} />
            <Route path="coins/:id" element={<CoinDetailPage />} />
            <Route path="risk" element={<RiskPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
        <Toaster position="top-center" theme="dark" />
      </AuthProvider>
    </I18nProvider>
  );
}
