"use client";

import { useSession } from "next-auth/react";
import { User } from "lucide-react";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800">
          Employee Card Management System
        </h2>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100">
            <User className="h-4 w-4 text-primary-600" />
          </div>
          <span className="text-sm font-medium text-gray-700">
            {session?.user?.name || "Admin"}
          </span>
        </div>
      </div>
    </header>
  );
}
