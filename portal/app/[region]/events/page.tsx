import { MobileFrame } from "@/components/MobileFrame";
import { EventListScreen } from "@/components/events/EventListScreen";

type Props = {
  params: Promise<{ region: string }>;
};

export default async function EventsPage(_props: Props) {
  return (
    <MobileFrame>
      <EventListScreen />
    </MobileFrame>
  );
}
