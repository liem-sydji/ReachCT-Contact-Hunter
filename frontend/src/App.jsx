import { Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { css, GOOGLE_CLIENT_ID } from "./styles.js";
import { AuthProvider }  from "./context/AuthContext.jsx";
import Landing        from "./pages/Landing.jsx";
import LoginPage      from "./pages/LoginPage.jsx";
import SearchPage     from "./pages/SearchPage.jsx";
import DatabasePage   from "./pages/DatabasePage.jsx";
import InfoPage       from "./pages/InfoPage.jsx";
import AdminPage      from "./pages/AdminPage.jsx";
import DashboardPage  from "./pages/DashboardPage.jsx";
import SpreadsheetPage from "./pages/SpreadsheetPage.jsx";
import MailCampaignsPage  from "./pages/MailCampaignsPage.jsx";
import EmailTemplatesPage from "./pages/EmailTemplatesPage.jsx";

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <style>{css}</style>
        <Routes>
          <Route path="/"                   element={<Landing />} />
          <Route path="/login"              element={<LoginPage />} />
          <Route path="/search"             element={<SearchPage />} />
          <Route path="/database"           element={<DatabasePage />} />
          <Route path="/info"               element={<InfoPage />} />
          <Route path="/admin"              element={<AdminPage />} />
          <Route path="/dashboard"          element={<DashboardPage />} />
          <Route path="/dashboard/db/:dbId" element={<SpreadsheetPage />} />
          <Route path="/campaigns"             element={<MailCampaignsPage />} />
          <Route path="/templates"             element={<EmailTemplatesPage />} />
          <Route path="*"                   element={<Landing />} />
        </Routes>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
