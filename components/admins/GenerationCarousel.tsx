"use client";

import { useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Autoplay, EffectCoverflow, Mousewheel, Navigation } from "swiper/modules";
import { MemberCard } from "@/components/roster/MemberCard";
import { loopCopies, CAROUSEL_BREAKPOINTS } from "@/lib/carouselLoop";
import { useReducedMotion } from "@/lib/reduced-motion";
import type { TeamMember } from "@/lib/types";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-coverflow";

const COORDINATOR_ROLE = "lab coordinator";


/**
 * One Swiper `effect-coverflow` carousel per generation — the real 3D
 * carousel engine, not a hand-rolled transform system. Autoplay advances it
 * on its own while idle and pauses whenever the pointer is over it or the
 * user drags/clicks an arrow (`disableOnInteraction: false` so it resumes
 * once they stop). Arrows styled in globals.css under `.generation-carousel`.
 * The roster repeats so the loop never dead-ends in either direction, and
 * the generation's koor lab card renders larger with a persistent glow and a
 * badge, centered on open.
 */
export function GenerationCarousel({ members }: { members: TeamMember[] }) {
  const reduce = useReducedMotion();
  const { slides, initialSlide } = useMemo(() => {
    if (members.length === 0) return { slides: [], initialSlide: 0 };

    const copies = loopCopies(members.length);
    const repeated = Array.from({ length: copies }, (_, copy) =>
      members.map((member) => ({ member, key: `${member.id}-${copy}` })),
    ).flat();

    // Open on the koor lab's card in a middle copy, so there's roster on both
    // sides of it from the start rather than an immediate wrap.
    const coordinator = Math.max(
      0,
      members.findIndex((m) => m.role.toLowerCase() === COORDINATOR_ROLE),
    );

    return {
      slides: repeated,
      initialSlide: Math.floor(copies / 2) * members.length + coordinator,
    };
  }, [members]);

  if (slides.length === 0) return null;

  return (
    <Swiper
      // A11y is not optional here: Swiper renders its nav arrows as plain
      // <div>s, so without this module they carry no role, label, or keyboard
      // handling.
      modules={[A11y, Autoplay, EffectCoverflow, Mousewheel, Navigation]}
      a11y={{
        prevSlideMessage: "Previous member",
        nextSlideMessage: "Next member",
      }}
      // `forceToAxis` is the whole point: the carousel is horizontal, so it
      // answers a trackpad's sideways swipe (or shift+wheel) and ignores a
      // plain vertical wheel, which keeps scrolling the page. Without it a
      // looping carousel swallows the scroll and the page can never be got
      // past with the pointer over it.
      mousewheel={{ forceToAxis: true }}
      autoplay={
        reduce
          ? false
          : {
              delay: 3200,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }
      }
      effect="coverflow"
      centeredSlides
      // Numeric slidesPerView, not "auto": with "auto" Swiper derives it from
      // `slidesPerViewDynamic()`, a *measured* value that reads wrong before
      // the slides have layout, so the loop guard trips on init no matter how
      // many slides exist. Fixed numbers make that check deterministic.
      slidesPerView={CAROUSEL_BREAKPOINTS.base.slidesPerView}
      spaceBetween={CAROUSEL_BREAKPOINTS.base.spaceBetween}
      breakpoints={{
        640: CAROUSEL_BREAKPOINTS[640],
        1024: CAROUSEL_BREAKPOINTS[1024],
      }}
      loop
      initialSlide={initialSlide}
      speed={800}
      grabCursor
      navigation
      coverflowEffect={{
        depth: 160,
        rotate: 20,
        stretch: 0,
        modifier: 1,
        slideShadows: true,
      }}
      className="generation-carousel !overflow-visible !px-4 !py-10 sm:!px-12"
    >
      {slides.map(({ member, key }) => {
        const isCoordinator = member.role.toLowerCase() === COORDINATOR_ROLE;
        return (
          <SwiperSlide key={key} className="!h-auto">
            <div className={`relative ${isCoordinator ? "scale-[1.12]" : ""}`}>
              {isCoordinator && (
                <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-[var(--radius-chip)] bg-accent-blue px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-[0_0_16px_rgba(14,116,188,0.6)]">
                  Koordinator
                </span>
              )}
              <MemberCard member={member} variant="compact" glow={isCoordinator} />
            </div>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}
