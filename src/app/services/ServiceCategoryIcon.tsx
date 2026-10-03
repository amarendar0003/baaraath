"use client";

import {
  Building2,
  CalendarDays,
  Church,
  Hotel,
  Music2,
  Utensils,
  UsersRound,
} from "lucide-react";

type Props = {
  slug: string;
};

export default function ServiceCategoryIcon({ slug }: Props) {
  const iconClass = "h-14 w-14 stroke-[1.5]";

  switch (slug) {
    case "banquet_hall":
      return <Building2 className={iconClass} />;

    case "music_band":
      return <Music2 className={iconClass} />;

    case "event_management":
      return <CalendarDays className={iconClass} />;

    case "catering":
      return <Utensils className={iconClass} />;

    case "dancing":
      return <UsersRound className={iconClass} />;

    case "priests":
      return <Church className={iconClass} />;

    case "hotels":
      return <Hotel className={iconClass} />;

    default:
      return <Building2 className={iconClass} />;
  }
}
