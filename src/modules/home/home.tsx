import { Logo } from "./components/logo";
import { CreateCard } from "./sections/create-card";
import { JoinCard } from "./sections/join-card";
import { LegalFooter } from "./sections/legal-footer";
import { YourRooms } from "./sections/your-rooms";

/** Landing page: create a room, join one from an invite, or go back to your rooms. */
export const Home = () => (
  <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(2.5rem,env(safe-area-inset-top))] md:max-w-4xl md:px-8 md:pb-10 md:pt-20">
    <Logo />
    <div className="mt-8 grid gap-4 md:mt-12 md:grid-cols-2 md:gap-6">
      <CreateCard />
      <JoinCard />
    </div>
    <div className="mt-6 md:mt-10">
      <YourRooms />
    </div>
    <LegalFooter />
  </main>
);
