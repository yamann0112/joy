import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, Users } from "lucide-react";
import type { Event } from "@shared/schema";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface EventCardProps {
  event: Event;
  onClick?: () => void;
}

export function EventCard({ event, onClick }: EventCardProps) {
  const scheduledDate = new Date(event.scheduledAt);
  const formattedDate = format(scheduledDate, "d MMMM yyyy", { locale: tr });
  const formattedTime = format(scheduledDate, "HH:mm", { locale: tr });

  return (
    <Card
      className={`relative overflow-visible p-4 border-l-4 ${
        event.isLive ? "border-l-primary gold-glow" : "border-l-primary/50"
      } hover-elevate cursor-pointer transition-all duration-200`}
      onClick={onClick}
      data-testid={`event-card-${event.id}`}
    >
      {event.isLive && (
        <Badge
          className="absolute -top-2 -right-2 bg-red-500 text-white animate-pulse"
          data-testid="badge-live"
        >
          CANLI
        </Badge>
      )}

      <div className="flex items-start gap-4">
        <Avatar className={`w-16 h-16 border-2 ${event.isLive ? "border-primary" : "border-muted"}`}>
          <AvatarImage src={event.agencyLogo || undefined} />
          <AvatarFallback className="bg-primary/20 text-primary font-bold text-lg">
            {event.agencyName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-primary truncate" data-testid="text-event-title">
            {event.title}
          </h3>
          <p className="text-sm text-muted-foreground" data-testid="text-agency-name">
            {event.agencyName}
          </p>

          {event.description && (
            <p className="text-sm text-foreground/70 mt-2 line-clamp-2">
              {event.description}
            </p>
          )}

          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span data-testid="text-participant-count">{event.participantCount}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{formattedTime}</span>
            </div>
          </div>

          {event.participants && event.participants.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {event.participants.slice(0, 5).map((participant, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {participant}
                </Badge>
              ))}
              {event.participants.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{event.participants.length - 5}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export function EventCardSkeleton() {
  return (
    <Card className="p-4 border-l-4 border-l-muted">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
        <div className="flex-1 space-y-3">
          <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
          <div className="h-4 w-full bg-muted rounded animate-pulse" />
          <div className="flex gap-4">
            <div className="h-4 w-16 bg-muted rounded animate-pulse" />
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
            <div className="h-4 w-16 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    </Card>
  );
}
