"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Pill } from "lucide-react";

export function NavTabs() {
  const pathname = usePathname();

  return (
    <div className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 border-b shadow-sm">
      <div className="container mx-auto px-4 py-6">
        <Tabs value={pathname} className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-2 h-14 bg-white dark:bg-gray-950 shadow-md rounded-xl p-1.5">
            <Link href="/health-tracker" passHref legacyBehavior>
              <TabsTrigger
                value="/health-tracker"
                asChild
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
              >
                <a className="flex items-center gap-2 font-semibold text-base">
                  <Activity className="w-5 h-5" />
                  <span>Health Tracker</span>
                </a>
              </TabsTrigger>
            </Link>
            <Link href="/medicines-reminder" passHref legacyBehavior>
              <TabsTrigger
                value="/medicines-reminder"
                asChild
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
              >
                <a className="flex items-center gap-2 font-semibold text-base">
                  <Pill className="w-5 h-5" />
                  <span>Medicine Reminder</span>
                </a>
              </TabsTrigger>
            </Link>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
