import { useQuery } from "@tanstack/react-query"
import { listen } from "@tauri-apps/api/event"
import { invoke } from "@tauri-apps/api/core"
import { useEffect } from "react"
import type { ScanResponse, ScanRule } from "../types/scan"

export interface ScanProgressEvent {
  current: number
  total: number
  found: number
}

interface ScanOptions {
  paths: string[]
  maxDepth?: number
  zombieThresholdDays?: number
  customRules?: ScanRule[]
  whitelist?: string[]
  enabled?: boolean
  onProgress?: (p: ScanProgressEvent) => void
}

export function useScan(options: ScanOptions) {
  const {
    paths,
    maxDepth = 15,
    zombieThresholdDays = 90,
    customRules = [],
    whitelist = [],
    enabled = true,
    onProgress,
  } = options

  useEffect(() => {
    if (!onProgress) return
    const unlisten = listen<ScanProgressEvent>("scan-progress", (event) => {
      onProgress(event.payload)
    })
    return () => {
      unlisten.then((fn) => fn())
    }
  }, [onProgress])

  return useQuery<ScanResponse>({
    queryKey: ["scan", paths, maxDepth, zombieThresholdDays],
    queryFn: async () => {
      console.log("[scan] invoking scan_paths with", paths)
      try {
        const result = await invoke<ScanResponse>("scan_paths", {
          paths,
          maxDepth,
          zombieThresholdDays,
          customRules,
          whitelist,
        })
        console.log("[scan] result:", result)
        return result
      } catch (e) {
        console.error("[scan] error:", e)
        throw e
      }
    },
    enabled: enabled && paths.length > 0,
    staleTime: 30_000,
  })
}
