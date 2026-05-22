"use client";

import { useSession } from "next-auth/react";
import { Crown, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { data: session } = useSession();
  const isDonor = (session?.user as { isDonor?: boolean })?.isDonor;
  const tier = (session?.user as { tier?: string })?.tier;
  const donorId = (session?.user as { donorId?: string })?.donorId;

  return (
    <div>
      <h2 className="font-display text-xl text-charcoal mb-6">My Profile</h2>

      <div className="card-surface rounded-xl p-6 border border-charcoal/10 space-y-6 max-w-lg">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-champagne/30 flex items-center justify-center text-2xl font-display text-champagne">
            {session?.user?.name?.[0] ?? "U"}
          </div>
          <div>
            <p className="font-display text-xl text-charcoal">{session?.user?.name}</p>
            <p className="text-sm text-muted flex items-center gap-1">
              <Mail className="h-3.5 w-3.5" />
              {session?.user?.email}
            </p>
            {isDonor && (
              <Badge variant="donor" className="mt-2 capitalize">
                <Crown className="h-3 w-3 mr-1" />
                {tier} Donor
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              defaultValue={session?.user?.name ?? ""}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              defaultValue={session?.user?.email ?? ""}
              disabled
              className="mt-1 opacity-60"
            />
          </div>
          {isDonor && donorId && (
            <div>
              <Label>Donor ID</Label>
              <Input value={donorId} disabled className="mt-1 opacity-60" />
            </div>
          )}
        </div>

        <Button>Save Changes</Button>
      </div>
    </div>
  );
}
