import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Discover from "./pages/Discover";
import TourDetail from "./pages/TourDetail";
import Profile from "./pages/Profile";
import CreateTour from "./pages/CreateTour";
import BookTour from "./pages/BookTour";
import Bookings from "./pages/Bookings";
import Videos from "./pages/Videos";
import Matches from "./pages/Matches";
import Verification from "./pages/Verification";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/tours/:id" element={<TourDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/create-tour" element={<CreateTour />} />
          <Route path="/book/:id" element={<BookTour />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/mother" element={<Admin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
