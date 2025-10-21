import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Users, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TourCardProps {
  tour: {
    id: string;
    title: string;
    description: string;
    location_name: string;
    duration_hours: number;
    max_participants: number;
    price_per_person: number;
    difficulty_level: string;
    images: string[];
    languages: string[];
  };
}

const TourCard = ({ tour }: TourCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
      <div 
        className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center"
        onClick={() => navigate(`/tours/${tour.id}`)}
      >
        {tour.images?.[0] ? (
          <img 
            src={tour.images[0]} 
            alt={tour.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <MapPin className="h-16 w-16 text-muted-foreground" />
        )}
      </div>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg line-clamp-2">{tour.title}</h3>
          <Badge variant="secondary">{tour.difficulty_level}</Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{tour.description}</p>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{tour.location_name}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{tour.duration_hours} hours</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>Up to {tour.max_participants} participants</span>
        </div>
        {tour.languages?.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {tour.languages.map((lang) => (
              <Badge key={lang} variant="outline" className="text-xs">
                {lang}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-lg font-bold">
          <DollarSign className="h-5 w-5" />
          <span>{tour.price_per_person}</span>
          <span className="text-sm text-muted-foreground font-normal">/person</span>
        </div>
        <Button onClick={() => navigate(`/tours/${tour.id}`)}>
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TourCard;