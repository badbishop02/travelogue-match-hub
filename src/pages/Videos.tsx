import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, Share2, Play, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const Videos = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Upload form state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadUrl, setUploadUrl] = useState("");

  useEffect(() => {
    // Always fetch videos for everyone
    fetchVideos();
    
    // Fetch profile only if authenticated
    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    if (!session?.user?.id) return;
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", session.user.id)
      .single();
    setProfile(data);
  };

  const fetchVideos = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("videos")
      .select("*, profiles!videos_user_id_fkey(*)")
      .order("created_at", { ascending: false });
    
    setVideos(data || []);
    setLoading(false);
  };

  const handleLike = async (videoId: string) => {
    if (!session) {
      navigate("/auth");
      return;
    }
    const video = videos.find(v => v.id === videoId);
    if (!video) return;

    const { error } = await supabase
      .from("videos")
      .update({ likes: (video.likes || 0) + 1 })
      .eq("id", videoId);

    if (!error) {
      setVideos(videos.map(v => 
        v.id === videoId ? { ...v, likes: (v.likes || 0) + 1 } : v
      ));
    }
  };

  const handleUpload = async () => {
    if (!uploadTitle || !uploadUrl) {
      toast({
        title: "Missing fields",
        description: "Please provide a title and video URL",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from("videos")
      .insert({
        user_id: session?.user?.id,
        title: uploadTitle,
        description: uploadDescription,
        video_url: uploadUrl,
      });

    if (error) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Video uploaded",
        description: "Your video has been published!",
      });
      setUploadOpen(false);
      setUploadTitle("");
      setUploadDescription("");
      setUploadUrl("");
      fetchVideos();
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const videoHeight = container.clientHeight;
    const newIndex = Math.round(scrollTop / videoHeight);
    
    if (newIndex !== currentVideoIndex && newIndex < videos.length) {
      setCurrentVideoIndex(newIndex);
      
      // Pause all videos except current
      videoRefs.current.forEach((video, idx) => {
        if (video) {
          if (idx === newIndex) {
            video.play();
          } else {
            video.pause();
          }
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar session={session} profile={profile} />
      
      <div className="relative h-[calc(100vh-64px)] overflow-hidden">
        {/* Upload Button - Only show for authenticated users */}
        {session && (
          <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
            <DialogTrigger asChild>
              <Button 
                className="fixed top-20 right-4 z-50 rounded-full"
                size="lg"
              >
                <Upload className="mr-2 h-5 w-5" />
                Upload Video
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload a Video</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Input
                  placeholder="Video title"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                />
                <Textarea
                  placeholder="Description"
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                />
                <Input
                  placeholder="Video URL (YouTube, Vimeo, etc.)"
                  value={uploadUrl}
                  onChange={(e) => setUploadUrl(e.target.value)}
                />
                <Button onClick={handleUpload} className="w-full">
                  Publish Video
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Video Feed */}
        <div 
          className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
          onScroll={handleScroll}
        >
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : videos.length > 0 ? (
            videos.map((video, index) => (
              <div 
                key={video.id}
                className="h-full w-full snap-start relative flex items-center justify-center bg-black"
              >
                {/* Video Player Placeholder */}
                <div className="relative w-full h-full max-w-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <video
                    ref={(el) => (videoRefs.current[index] = el)}
                    className="w-full h-full object-contain"
                    src={video.video_url}
                    loop
                    playsInline
                  />
                  <Play className="absolute h-16 w-16 text-white/50" />
                </div>

                {/* Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                  <h3 className="text-xl font-bold mb-2">{video.title}</h3>
                  <p className="text-sm mb-2">@{video.profiles?.full_name}</p>
                  <p className="text-sm opacity-90">{video.description}</p>
                </div>

                {/* Action Buttons */}
                <div className="absolute right-4 bottom-20 flex flex-col gap-6">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="rounded-full h-14 w-14 bg-black/50 hover:bg-black/70 text-white"
                    onClick={() => handleLike(video.id)}
                  >
                    <div className="flex flex-col items-center">
                      <Heart className="h-6 w-6" />
                      <span className="text-xs">{video.likes || 0}</span>
                    </div>
                  </Button>
                  <Button
                    size="lg"
                    variant="ghost"
                    className="rounded-full h-14 w-14 bg-black/50 hover:bg-black/70 text-white"
                  >
                    <MessageCircle className="h-6 w-6" />
                  </Button>
                  <Button
                    size="lg"
                    variant="ghost"
                    className="rounded-full h-14 w-14 bg-black/50 hover:bg-black/70 text-white"
                  >
                    <Share2 className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex items-center justify-center text-center p-8">
              <div>
                <Play className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No videos yet</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to upload a tour video!
                </p>
                <Button onClick={() => setUploadOpen(true)}>
                  Upload Video
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Videos;