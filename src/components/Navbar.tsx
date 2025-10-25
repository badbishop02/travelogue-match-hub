import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Compass, User, LogOut, PlusCircle } from "lucide-react";
import { Session } from "@supabase/supabase-js";

interface NavbarProps {
  session: Session | null;
  profile?: any;
}

const Navbar = ({ session, profile }: NavbarProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    });
    navigate("/auth");
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Compass className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <span className="font-bold text-lg sm:text-xl">Tourly</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <Link to="/discover">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Discover</Button>
          </Link>
          <Link to="/videos">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Videos</Button>
          </Link>
          {session ? (
            <>
              <Link to="/matches" className="hidden sm:block">
                <Button variant="ghost" size="sm">Matches</Button>
              </Link>
              <Link to="/create-tour" className="hidden md:block">
                <Button variant="ghost" size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Tour
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarImage src={profile?.avatar_url} alt={profile?.full_name} />
                      <AvatarFallback>
                        {profile?.full_name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/bookings")}>
                    My Bookings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link to="/auth">
              <Button>Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;