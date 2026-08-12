import Hud from "@/components/os/Hud";
import Hero from "@/components/os/Hero";
import Terminal from "@/components/os/Terminal";
import Architecture from "@/components/os/Architecture";
import Uptime from "@/components/os/Uptime";
import GithubActivity from "@/components/os/GithubActivity";
import Endpoint from "@/components/os/Endpoint";
import VimBar from "@/components/os/VimBar";
import SectionScrollProgress from "@/components/os/SectionScrollProgress";
import SectionHead from "@/components/os/SectionHead";
import Footer from "@/components/os/Footer";
import { UPTIME_STORY, uptimePct } from "@/lib/os/uptimeStory";

export const metadata = {
  alternates: { canonical: "/" },
};

const HERO_BIO =
  "I'm Chris. I build software end-to-end — backend, frontend, infra, and the bits in between. I like systems that have to keep working, interfaces that don't get in the way, and shipping the whole thing. Open to engineering roles across the stack.";

export default function Home() {
  return (
    <>
      <Hud />
      <main className="shell">
        <Hero bio={HERO_BIO} />

        <SectionHead
          num="02 / shell"
          title="Type something — it's a real terminal."
          meta="↑↓ history · TAB complete · ctrl-L clear"
        />
        <Terminal />

        <Architecture />

        <SectionHead
          num="04 / observability"
          title="The last 60 days. The boring chart is the point."
          meta={`${uptimePct()}% · ${UPTIME_STORY.windowDays}d`}
        />
        <Uptime />
        <GithubActivity />

        <SectionHead
          num="05 / contact"
          title="The contact form is an API. Obviously."
          meta="POST · application/json"
        />
        <Endpoint />

        <Footer />
      </main>
      <VimBar />
      <SectionScrollProgress />
    </>
  );
}
