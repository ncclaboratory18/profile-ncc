import { Hero } from "@/components/home/Hero";
import { PhotoRail } from "@/components/home/PhotoRail";
import { SplitNav } from "@/components/home/SplitNav";
import { HoverSwapGrid } from "@/components/home/HoverSwapGrid";
import { ExpertiseGrid } from "@/components/home/ExpertiseGrid";
import { LogoMarquee } from "@/components/home/LogoMarquee";
import { SocialGrid } from "@/components/home/SocialGrid";
import { ClosingStatement } from "@/components/home/ClosingStatement";

export default function Home() {
  return (
    <>
      <Hero />
      <PhotoRail />
      <SplitNav />
      <HoverSwapGrid />
      <ExpertiseGrid />
      <LogoMarquee />
      <SocialGrid />
      <ClosingStatement />
    </>
  );
}
