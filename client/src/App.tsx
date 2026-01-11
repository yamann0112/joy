import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";
import { GlobalAnnouncement } from "@/components/global-announcement";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Events from "@/pages/events";
import Chat from "@/pages/chat";
import Tickets from "@/pages/tickets";
import Admin from "@/pages/admin";
import Management from "@/pages/management";
import Settings from "@/pages/settings";
import UsersPage from "@/pages/users";
import FilmPage from "@/pages/film";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/events" component={Events} />
      <Route path="/chat" component={Chat} />
      <Route path="/tickets" component={Tickets} />
      <Route path="/admin" component={Admin} />
      <Route path="/management" component={Management} />
      <Route path="/settings" component={Settings} />
      <Route path="/users" component={UsersPage} />
      <Route path="/film" component={FilmPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <GlobalAnnouncement />
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
