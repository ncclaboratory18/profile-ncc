import { Hero } from "@/components/home/Hero";
import { LabStatement } from "@/components/home/LabStatement";
import { Milestones } from "@/components/home/Milestones";
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
      <LabStatement />
      <Milestones />
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
