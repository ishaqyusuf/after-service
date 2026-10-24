"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@afterservice/ui";
import { ThemeSwitch } from "@/components/theme-switch";

export function ChangeTheme() {
  return (
    <Card className="rounded-[14px] bg-card">
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription className="text-muted-foreground">
          Customize how afterservice looks on this device.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="w-full max-w-[240px]">
          <ThemeSwitch />
        </div>
      </CardContent>
    </Card>
  );
}
