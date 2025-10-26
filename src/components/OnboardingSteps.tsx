import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, X, Check } from "lucide-react";

interface OnboardingStepsProps {
  userId: string;
  userRole: string;
  onComplete: () => void;
}

const HOBBY_OPTIONS = [
  "Hiking", "Photography", "History", "Food Tours", "Art", "Music",
  "Sports", "Wildlife", "Beach", "Culture", "Adventure", "Shopping"
];

const TALENT_OPTIONS = [
  "Storytelling", "Local Expert", "Photography", "Translation",
  "First Aid", "Navigation", "Cooking", "History Knowledge"
];

export const OnboardingSteps = ({ userId, userRole, onComplete }: OnboardingStepsProps) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    fullName: "",
    bio: "",
    location: "",
    hobbies: [] as string[],
    talents: [] as string[],
  });
  
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image under 5MB",
          variant: "destructive",
        });
        return;
      }
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfileImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a video under 50MB",
          variant: "destructive",
        });
        return;
      }
      setVideoFile(file);
    }
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  const uploadFile = async (file: File, bucket: string, folder: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${userId}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        upsert: true,
      });

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);
    
    return publicUrl;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let avatarUrl = "";
      let videoUrl = "";

      // Upload profile image if provided
      if (profileImage) {
        avatarUrl = await uploadFile(profileImage, "avatars", "profile");
      }

      // Upload video if provided (for guides)
      if (videoFile && userRole === "guide") {
        videoUrl = await uploadFile(videoFile, "intro-videos", "intros");
      }

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: formData.fullName,
          bio: formData.bio,
          location_name: formData.location,
          hobbies: formData.hobbies,
          talents: formData.talents,
          avatar_url: avatarUrl || undefined,
          intro_video_url: videoUrl || undefined,
          onboarded: true,
        })
        .eq("user_id", userId);

      if (profileError) throw profileError;

      toast({
        title: "Profile completed!",
        description: "Welcome to Tourly!",
      });

      onComplete();
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
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome to Tourly!</h2>
              <p className="text-muted-foreground">Let's set up your profile</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Paris, France"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Upload Profile Photo</h2>
              <p className="text-muted-foreground">Add a photo so others can recognize you</p>
            </div>

            <div className="space-y-4">
              <Label>Profile Image (Max 5MB) *</Label>
              
              {profileImagePreview ? (
                <div className="relative w-32 h-32 mx-auto">
                  <img
                    src={profileImagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-full"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2"
                    onClick={() => {
                      setProfileImage(null);
                      setProfileImagePreview("");
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <Label htmlFor="profileImage" className="cursor-pointer">
                    <span className="text-primary hover:underline">Click to upload</span>
                    <Input
                      id="profileImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </Label>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Your Interests</h2>
              <p className="text-muted-foreground">Select at least 2 hobbies and 1 talent</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="mb-3 block">Hobbies *</Label>
                <div className="flex flex-wrap gap-2">
                  {HOBBY_OPTIONS.map((hobby) => (
                    <Badge
                      key={hobby}
                      variant={formData.hobbies.includes(hobby) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          hobbies: toggleArrayItem(formData.hobbies, hobby),
                        })
                      }
                    >
                      {formData.hobbies.includes(hobby) && <Check className="mr-1 h-3 w-3" />}
                      {hobby}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-3 block">Talents *</Label>
                <div className="flex flex-wrap gap-2">
                  {TALENT_OPTIONS.map((talent) => (
                    <Badge
                      key={talent}
                      variant={formData.talents.includes(talent) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          talents: toggleArrayItem(formData.talents, talent),
                        })
                      }
                    >
                      {formData.talents.includes(talent) && <Check className="mr-1 h-3 w-3" />}
                      {talent}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        if (userRole !== "guide") {
          handleSubmit();
          return null;
        }
        
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Intro Video (Optional)</h2>
              <p className="text-muted-foreground">
                Upload a short video showcasing your guide style (Max 2 minutes, 50MB)
              </p>
            </div>

            <div className="space-y-4">
              {videoFile ? (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm truncate">{videoFile.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setVideoFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <Label htmlFor="videoFile" className="cursor-pointer">
                    <span className="text-primary hover:underline">Click to upload video</span>
                    <Input
                      id="videoFile"
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                    />
                  </Label>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.fullName.trim().length > 0;
      case 2:
        return profileImage !== null;
      case 3:
        return formData.hobbies.length >= 2 && formData.talents.length >= 1;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const totalSteps = userRole === "guide" ? 4 : 3;

  return (
    <div className="space-y-8">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Step {step} of {totalSteps}</span>
          <span>{Math.round((step / totalSteps) * 100)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      {renderStep()}

      {/* Navigation */}
      <div className="flex justify-between gap-4 pt-6">
        <Button
          variant="outline"
          onClick={() => setStep(step - 1)}
          disabled={step === 1 || loading}
        >
          Back
        </Button>
        
        {step < totalSteps ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed() || loading}
          >
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={!canProceed() || loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Complete Setup
          </Button>
        )}
      </div>

      {/* Skip Option */}
      {step > 2 && (
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={handleSubmit}
            disabled={loading}
            className="text-muted-foreground"
          >
            Skip for now
          </Button>
        </div>
      )}
    </div>
  );
};
