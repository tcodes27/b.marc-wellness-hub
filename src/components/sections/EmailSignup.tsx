import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useCommunity } from "@/components/community/CommunityProvider";
import { branding } from "@/config/branding";

export function EmailSignup() {
  const [email, setEmail] = useState("");
  const { open } = useCommunity();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    open("newsletter", { email: email.trim() });
  };

  return (
    <section className="py-28 md:py-36">
      <div className="container-luxe">
        <div className="rounded-[2.5rem] bg-espresso text-ivory px-6 py-20 md:p-24 text-center relative overflow-hidden">
          <div className="absolute -top-40 -right-40 size-[28rem] rounded-full bg-tan/15 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 size-[28rem] rounded-full bg-clay/20 blur-3xl" />

          <div className="relative max-w-2xl mx-auto">
            <span className="eyebrow !text-tan">{branding.newsletter.eyebrow}</span>
            <h2 className="mt-5 text-4xl md:text-6xl text-ivory leading-[1.05]">
              {branding.newsletter.headlineLead}<em className="font-light">{branding.newsletter.headlineEm}</em>
            </h2>
            <p className="mt-6 text-ivory/75 max-w-lg mx-auto leading-relaxed">
              {branding.newsletter.body}
            </p>

            <form onSubmit={submit} className="mt-10 max-w-md mx-auto">
              <div className="flex items-center bg-ivory/10 border border-ivory/25 rounded-full p-1.5 backdrop-blur-md focus-within:border-ivory/60 transition-colors">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  maxLength={255}
                  className="flex-1 bg-transparent px-5 py-3 text-sm placeholder:text-ivory/50 focus:outline-none"
                />
                <button
                  type="submit"
                  className="size-12 rounded-full bg-ivory text-espresso flex items-center justify-center hover:bg-tan hover:text-ivory transition-all duration-500"
                  aria-label="Continue"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
              <p className="mt-3 text-xs text-ivory/50">
                We'll open a quick form to complete your community profile.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
