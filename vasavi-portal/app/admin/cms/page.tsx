"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Image,
  Layout,
  Newspaper,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { PermissionGuard } from "@/components/rbac/permission-guard";
import { Can } from "@/components/rbac/can";
import { PlatformModuleHeader } from "@/components/admin/platform-module-header";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "homepage", label: "Homepage", icon: Layout, permission: "cms.homepage" as const },
  { id: "news", label: "News", icon: Newspaper, permission: "cms.news" as const },
  { id: "gallery", label: "Gallery", icon: Image, permission: "cms.gallery" as const },
  { id: "pages", label: "Pages", icon: FileText, permission: "cms.pages" as const },
  { id: "events", label: "Events", icon: Sparkles, permission: "events.view" as const },
] as const;

export default function CmsAdminPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("homepage");

  return (
    <PermissionGuard
      permission={[
        "cms.homepage",
        "cms.news",
        "cms.gallery",
        "cms.pages",
        "events.view",
        "events.manage",
      ]}
    >
      <PlatformModuleHeader
        badge="Super Admin · Platform"
        title="CMS"
        description="Manage public website content — homepage, news, gallery, static pages, and community events."
      />
      <div className="mx-auto max-w-5xl p-6">
        <div className="flex flex-wrap gap-2 border-b border-beige/40 pb-4 mb-6">
          {TABS.map((t) => (
            <Can key={t.id} permission={t.permission}>
              <button
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                  tab === t.id
                    ? "bg-champagne text-white"
                    : "text-muted hover:bg-surface"
                )}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
              </button>
            </Can>
          ))}
        </div>

        <div className="card-manager p-6">
          {tab === "homepage" && (
            <CmsPanel
              title="Homepage"
              items={[
                "Hero banners and spiritual messaging",
                "Featured hotels and trust stats",
                "Donor recognition strip",
              ]}
            />
          )}
          {tab === "news" && (
            <CmsPanel
              title="News & announcements"
              items={[
                "Publish Vasavi community news",
                "Schedule festival and satsang updates",
                "SEO metadata per article",
              ]}
            />
          )}
          {tab === "gallery" && (
            <CmsPanel
              title="Photo gallery"
              items={[
                "Upload event and property images",
                "Sort order for public gallery page",
                "Alt text and captions",
              ]}
            />
          )}
          {tab === "pages" && (
            <CmsPanel
              title="Static pages"
              items={[
                "About, schemes, founder, terms, privacy",
                "Rich text blocks and contact info",
                "Version history (production)",
              ]}
            />
          )}
          {tab === "events" && (
            <>
              <CmsPanel
                title="Community events"
                items={[
                  "Satsang, annadanam, festivals, seva listings",
                  "Publish to public website and hotel dashboards",
                ]}
              />
              <Can permission="events.view">
                <Link
                  href="/dashboard/activities"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-champagne hover:underline"
                >
                  View hotel community activities
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Can>
            </>
          )}
        </div>
      </div>
    </PermissionGuard>
  );
}

function CmsPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h2 className="font-display text-lg font-bold text-charcoal">{title}</h2>
      <p className="text-sm text-muted mt-1 mb-4">
        Content syncs to vasavi-main-site when API is connected.
      </p>
      <ul className="space-y-2 text-sm text-charcoal">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-champagne shrink-0" />
            {item}
          </li>
        ))}
      </ul>
      <p className="mt-6 text-xs text-muted rounded-lg bg-surface border border-beige/40 p-3">
        Demo module — wire to CMS tables (News, Gallery, CmsPage) in production.
      </p>
    </div>
  );
}
