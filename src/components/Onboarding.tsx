import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { UserCircle, Compass, Car, ArrowRight } from "lucide-react";

type UserRole = "tourist" | "guide" | "driver";

const Onboarding = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    role: "" as UserRole | "",
    full_name: "",
    bio: "",
    location_name: "",
    location_lat: "",
    location_lng: "",
    languages: [] as string[],
    hobbies: [] as string[],
    music_tastes: [] as string[],
    // Driver specific
    license_number: "",
    vehicle_type: "",
    vehicle_plate: "",
  });

  const languageOptions = ["English", "Spanish", "French", "German", "Swahili", "Chinese", "Arabic"];
  const hobbyOptions = ["Hiking", "Photography", "Cuisine", "History", "Wildlife", "Adventure Sports", "Culture", "Beach", "Music"];
  const musicOptions = ["Pop", "Rock", "Jazz", "Classical", "Hip Hop", "Electronic", "Folk", "World Music"];

  const handleArrayToggle = (field: "languages" | "hobbies" | "music_tastes", value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Create profile
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          user_id: session?.user?.id,
          full_name: formData.full_name,
          bio: formData.bio,
          location_name: formData.location_name,
          location_lat: formData.location_lat ? parseFloat(formData.location_lat) : null,
          location_lng: formData.location_lng ? parseFloat(formData.location_lng) : null,
          languages: formData.languages,
          hobbies: formData.hobbies,
          music_tastes: formData.music_tastes,
        });

      if (profileError) throw profileError;

      // Create role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert([{
          user_id: session?.user?.id,
          role: formData.role as "tourist" | "guide" | "admin",
        }]);

      if (roleError) throw roleError;

      // If driver, create driver profile
      if (formData.role === "driver") {
        const { error: driverError } = await supabase
          .from("drivers")
          .insert({
            user_id: session?.user?.id,
            license_number: formData.license_number,
            vehicle_type: formData.vehicle_type,
            vehicle_plate: formData.vehicle_plate,
            location_lat: formData.location_lat ? parseFloat(formData.location_lat) : null,
            location_lng: formData.location_lng ? parseFloat(formData.location_lng) : null,
          });

        if (driverError) throw driverError;
      }

      toast({
        title: "Welcome aboard!",
        description: "Your profile has been created successfully.",
      });

      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>Select Your Role</Label>
              <RadioGroup value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}>
                <Card className={`cursor-pointer transition-all ${formData.role === "tourist" ? "border-primary ring-2 ring-primary" : ""}`}>
                  <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                    <RadioGroupItem value="tourist" id="tourist" />
                    <UserCircle className="h-8 w-8 text-primary" />
                    <div>
                      <Label htmlFor="tourist" className="text-lg font-semibold cursor-pointer">Tourist</Label>
                      <CardDescription>Explore and book amazing tours</CardDescription>
                    </div>
                  </CardHeader>
                </Card>

                <Card className={`cursor-pointer transition-all ${formData.role === "guide" ? "border-primary ring-2 ring-primary" : ""}`}>
                  <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                    <RadioGroupItem value="guide" id="guide" />
                    <Compass className="h-8 w-8 text-primary" />
                    <div>
                      <Label htmlFor="guide" className="text-lg font-semibold cursor-pointer">Tour Guide</Label>
                      <CardDescription>Create and lead tours for tourists</CardDescription>
                    </div>
                  </CardHeader>
                </Card>

                <Card className={`cursor-pointer transition-all ${formData.role === "driver" ? "border-primary ring-2 ring-primary" : ""}`}>
                  <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                    <RadioGroupItem value="driver" id="driver" />
                    <Car className="h-8 w-8 text-primary" />
                    <div>
                      <Label htmlFor="driver" className="text-lg font-semibold cursor-pointer">Driver</Label>
                      <CardDescription>Provide transportation for tourists</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </RadioGroup>
            </div>
            <Button onClick={() => setStep(2)} disabled={!formData.role} className="w-full">
              Continue <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location_name">Location *</Label>
              <Input
                id="location_name"
                value={formData.location_name}
                onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                placeholder="Nairobi, Kenya"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Latitude</Label>
                <Input
                  value={formData.location_lat}
                  onChange={(e) => setFormData({ ...formData, location_lat: e.target.value })}
                  placeholder="-1.2921"
                  type="number"
                  step="any"
                />
              </div>
              <div className="space-y-2">
                <Label>Longitude</Label>
                <Input
                  value={formData.location_lng}
                  onChange={(e) => setFormData({ ...formData, location_lng: e.target.value })}
                  placeholder="36.8219"
                  type="number"
                  step="any"
                />
              </div>
            </div>

            {formData.role === "driver" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="license_number">Driver's License Number *</Label>
                  <Input
                    id="license_number"
                    value={formData.license_number}
                    onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                    placeholder="DL123456"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicle_type">Vehicle Type *</Label>
                  <Input
                    id="vehicle_type"
                    value={formData.vehicle_type}
                    onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                    placeholder="Sedan, SUV, Van..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicle_plate">License Plate *</Label>
                  <Input
                    id="vehicle_plate"
                    value={formData.vehicle_plate}
                    onChange={(e) => setFormData({ ...formData, vehicle_plate: e.target.value })}
                    placeholder="KAA 123A"
                    required
                  />
                </div>
              </>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                Back
              </Button>
              <Button onClick={() => setStep(3)} disabled={!formData.full_name || !formData.location_name} className="flex-1">
                Continue <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Languages You Speak</Label>
              <div className="grid grid-cols-2 gap-2">
                {languageOptions.map((lang) => (
                  <div key={lang} className="flex items-center space-x-2">
                    <Checkbox
                      id={`lang-${lang}`}
                      checked={formData.languages.includes(lang)}
                      onCheckedChange={() => handleArrayToggle("languages", lang)}
                    />
                    <Label htmlFor={`lang-${lang}`} className="cursor-pointer">{lang}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Your Interests & Hobbies</Label>
              <div className="grid grid-cols-2 gap-2">
                {hobbyOptions.map((hobby) => (
                  <div key={hobby} className="flex items-center space-x-2">
                    <Checkbox
                      id={`hobby-${hobby}`}
                      checked={formData.hobbies.includes(hobby)}
                      onCheckedChange={() => handleArrayToggle("hobbies", hobby)}
                    />
                    <Label htmlFor={`hobby-${hobby}`} className="cursor-pointer">{hobby}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Music Preferences</Label>
              <div className="grid grid-cols-2 gap-2">
                {musicOptions.map((music) => (
                  <div key={music} className="flex items-center space-x-2">
                    <Checkbox
                      id={`music-${music}`}
                      checked={formData.music_tastes.includes(music)}
                      onCheckedChange={() => handleArrayToggle("music_tastes", music)}
                    />
                    <Label htmlFor={`music-${music}`} className="cursor-pointer">{music}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={loading} className="flex-1">
                {loading ? "Creating Profile..." : "Complete Setup"}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl">Welcome to Tourly!</CardTitle>
          <CardDescription>
            Let's set up your profile (Step {step} of 3)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStep()}
        </CardContent>
      </Card>
    </div>
  );
};

export default Onboarding;
