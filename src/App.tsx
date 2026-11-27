import { useEffect, useRef } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, Outlet, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, RequireAuth } from "@/lib/auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Tools from "@/pages/Tools";
import Legal from "@/pages/Legal";
import NotFound from "@/pages/NotFound";
import { CommandPalette } from "@/components/CommandPalette";
import { ScrollProgress } from "@/components/Fx";
import { CursorFx, RouteCurtain, SmoothScroll } from "@/components/Transitions";
import { AskOmnia } from "@/components/AskOmnia";

// Scroll to #hash targets (e.g. /#pricing) or to top on every navigation.
function ScrollManager() {
  const { pathname, hash } = useLocation();
  const prev = useRef(pathname);
  useEffect(() => {
    const changedPage = prev.current !== pathname;
    prev.current = pathname;
    if (hash) {
      const t = setTimeout(() => {
        const el = document.getElementById(hash.slice(1));
        if (!el) return;
        if (window.__lenis) window.__lenis.scrollTo(el, { offset: -(parseFloat(getComputedStyle(el).scrollMarginTop) || 24) });
        else el.scrollIntoView({ behavior: "smooth" });
      }, changedPage ? 500 : 0); // on a new page, wait for the route curtain
      return () => clearTimeout(t);
    }
    window.__lenis?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

const Shell = ({ footer = true }: { footer?: boolean }) => (
  <div className="min-h-screen flex flex-col">
    <Header />
    {/* marketing pages slide under the floating header; keyed so each route fades in */}
    <main key={useLocation().pathname} className={`page-in flex-1 ${footer ? "-mt-[68px]" : ""}`}>
      <Outlet />
    </main>
    {footer && <Footer />}
  </div>
);

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-center" />
        <BrowserRouter>
          <ScrollManager />
          <ScrollProgress />
          <RouteCurtain />
          <CursorFx />
          <SmoothScroll />
          <AskOmnia />
          <CommandPalette />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<Shell footer={false} />}>
              <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            </Route>
            <Route element={<Shell />}>
              <Route path="/" element={<Home />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/legal" element={<Legal />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default App;
