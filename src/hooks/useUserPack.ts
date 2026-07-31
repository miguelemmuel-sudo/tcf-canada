"use client";

import { useState, useEffect } from "react";
import { PackType, getCurrentUserPack } from "@/utils/subscriptionEngine";

export function useUserPack() {
  const [pack, setPack] = useState<PackType>("griffon");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setPack(getCurrentUserPack());
    setMounted(true);
  }, []);

  return { pack, mounted };
}
