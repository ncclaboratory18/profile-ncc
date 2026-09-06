import { Hero } from "@/components/home/Hero";
import { PhotoRail } from "@/components/home/PhotoRail";
import { MeetTheLab } from "@/components/home/MeetTheLab";
import { WhatWeDo } from "@/components/home/WhatWeDo";
import { SplitNav } from "@/components/home/SplitNav";
import { HoverSwapGrid } from "@/components/home/HoverSwapGrid";
import { LogoMarquee } from "@/components/home/LogoMarquee";
import { SocialGrid } from "@/components/home/SocialGrid";
import { ClosingStatement } from "@/components/home/ClosingStatement";

export default function Home() {
  return (
    <>
      <Hero />
      <PhotoRail />
      <MeetTheLab />
      <WhatWeDo />
      <SplitNav />
      <HoverSwapGrid />
      <LogoMarquee />
      <SocialGrid />
      <ClosingStatement />
    </>
  );
}
